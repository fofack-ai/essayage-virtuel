import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

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

  const saveSession = (data) => {
    localStorage.setItem("tryon_token", data.token);
    localStorage.setItem("tryon_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    saveSession(response.data);

    return response.data.user;
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (response.data.requiresOtp) {
      setPendingOtp({
        email,
        userId: response.data.userId,
      });

      return {
        requiresOtp: true,
        email,
      };
    }

    saveSession(response.data);

    return response.data.user;
  };

  const verifyOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    saveSession(response.data);
    setPendingOtp(null);

    return response.data.user;
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