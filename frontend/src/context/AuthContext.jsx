import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

function unwrapAuthResponse(response) {
  return response?.data?.data || response?.data || response;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingOtp, setPendingOtp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("tryon_user");
    const savedToken = localStorage.getItem("tryon_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tryon_token" && !e.newValue) {
        setUser(null);
      }

      if (e.key === "tryon_user" && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveSession = (data) => {
    const payload = data?.data || data;

    if (!payload?.token || !payload?.user) {
      throw new Error("Session invalide");
    }

    localStorage.setItem("tryon_token", payload.token);
    localStorage.setItem("tryon_user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    const payload = unwrapAuthResponse(response);
    saveSession(payload);
    return payload.user;
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const payload = unwrapAuthResponse(response);

    if (payload.requiresOtp) {
      setPendingOtp({ email, userId: payload.userId });
      return { requiresOtp: true, email };
    }

    saveSession(payload);
    return payload.user;
  };

  const verifyOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    const payload = unwrapAuthResponse(response);
    saveSession(payload);
    setPendingOtp(null);
    return payload.user;
  };

  const loginWithGoogle = () => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
    window.location.href = `${baseUrl}/auth/google`;
  };

  const completeGoogleLogin = (data) => {
    if (data.requiresOtp) {
      setPendingOtp({
        email: data.email,
        userId: data.userId,
      });
      return { requiresOtp: true };
    }

    saveSession(data);
    return data.user;
  };

  const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data);
    const updatedUser = response?.data?.data || response?.data;
    localStorage.setItem("tryon_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem("tryon_token");
    localStorage.removeItem("tryon_user");
    setUser(null);
    setPendingOtp(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingOtp,
        register,
        login,
        verifyOtp,
        loginWithGoogle,
        completeGoogleLogin,
        updateProfile,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
