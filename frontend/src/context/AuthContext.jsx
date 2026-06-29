import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingOtp, setPendingOtp] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lecture initiale depuis localStorage (partagé entre onglets)
  useEffect(() => {
    const savedUser  = localStorage.getItem("tryon_user");
    const savedToken = localStorage.getItem("tryon_token");
    if (savedUser && savedToken) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // ✅ Écoute les changements des autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Un autre onglet a supprimé le token → déconnexion ici aussi
      if (e.key === "tryon_token" && !e.newValue) {
        setUser(null);
      }
      // Un autre onglet s'est connecté → on récupère l'utilisateur
      if (e.key === "tryon_user" && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Sauvegarde dans localStorage au lieu de sessionStorage
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
    const response = await api.post("/auth/login", { email, password });
    if (response.data.requiresOtp) {
      setPendingOtp({ email, userId: response.data.userId });
      return { requiresOtp: true, email };
    }
    saveSession(response.data);
    return response.data.user;
  };

  const verifyOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    saveSession(response.data);
    setPendingOtp(null);
    return response.data.user;
  };

  const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data);
    const updatedUser = response.data;
    localStorage.setItem("tryon_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  // ✅ Déconnexion dans localStorage → les autres onglets le détectent
  const logout = () => {
    localStorage.removeItem("tryon_token");
    localStorage.removeItem("tryon_user");
    setUser(null);
    setPendingOtp(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, pendingOtp,
        register, login, verifyOtp, updateProfile, logout,
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