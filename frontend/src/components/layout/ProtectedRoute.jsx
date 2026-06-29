// src/components/layout/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Pendant la vérification du token → ne rien afficher encore
  if (loading) return null;

  // Pas connecté → redirection vers /auth
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Connecté → afficher la page normalement
  return children;
}