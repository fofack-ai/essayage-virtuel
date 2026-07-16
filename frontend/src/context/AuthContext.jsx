import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ── pendingOtp persisté en sessionStorage pour survivre aux re-renders ──
  const [pendingOtp, setPendingOtpState] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tryon_pending_otp') || 'null');
    } catch { return null; }
  });

  const setPendingOtp = (value) => {
    if (value) {
      sessionStorage.setItem('tryon_pending_otp', JSON.stringify(value));
    } else {
      sessionStorage.removeItem('tryon_pending_otp');
    }
    setPendingOtpState(value);
  };

  useEffect(() => {
    const token = localStorage.getItem('tryon_token') || sessionStorage.getItem('tryon_token');
    const storedUser = JSON.parse(localStorage.getItem('tryon_user') || 'null');
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // ── Login ──
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (!response.success) throw new Error(response.message || 'Erreur de connexion');

    const result = response.data;
    if (!result) throw new Error('Données de connexion manquantes');

    // Admin → OTP requis
    if (result.requiresOtp) {
      setPendingOtp({ email, userId: result.userId });
      return { requiresOtp: true };
    }

    // Client → connexion directe
    if (result.token && result.user) {
      localStorage.setItem('tryon_token', result.token);
      localStorage.setItem('tryon_user', JSON.stringify(result.user));
      setUser(result.user);

       // Rapatrie le panier constitué avant la connexion
      await api.post('/cart/merge').catch(() => {});
      return { user: result.user };
    }

    throw new Error('Réponse de connexion invalide');
  };

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem('tryon_token');
    localStorage.removeItem('tryon_user');
    sessionStorage.removeItem('tryon_token');
    sessionStorage.removeItem('tryon_user');
    sessionStorage.removeItem('tryon_pending_otp');
    setUser(null);
    setPendingOtpState(null);
  };

  // ── Register ──
  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    if (!response.success) throw new Error(response.message);
    // Auto-login après inscription
    if (response.data?.token && response.data?.user) {
      localStorage.setItem('tryon_token', response.data.token);
      localStorage.setItem('tryon_user', JSON.stringify(response.data.user));
      setUser(response.data.user);

       await api.post('/cart/merge').catch(() => {});
    }
    return response;
  };

  // ── Verify OTP (admin) ──
  const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (!response.success) throw new Error(response.message || 'Code OTP invalide');

    const { token, user } = response.data;
    localStorage.setItem('tryon_token', token);
    localStorage.setItem('tryon_user', JSON.stringify(user));
    setUser(user);
    setPendingOtp(null);


    await api.post('/cart/merge').catch(() => {});

    return { user };
  };

  // ── Google Login ──
  const loginWithGoogle = () => {
    window.location.href = 'https://tryon-backend-1gps.onrender.com/api/v1/auth/google';
  };

  // ── Compléter login Google depuis /auth/google/success ──
  const completeGoogleLogin = (payload) => {
    // Cas OTP requis pour admin Google
    if (payload.requiresOtp) {
      setPendingOtp({ email: payload.email, userId: payload.userId });
      return { requiresOtp: true };
    }

    const { token, user } = payload;
    if (!token || !user) return { error: 'Données Google invalides' };

    localStorage.setItem('tryon_token', token);
    localStorage.setItem('tryon_user', JSON.stringify(user));
    setUser(user);

    api.post('/cart/merge').catch(() => {});   // sans await
    return { user };
    
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      register,
      verifyOtp,
      pendingOtp,
      loginWithGoogle,
      completeGoogleLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}