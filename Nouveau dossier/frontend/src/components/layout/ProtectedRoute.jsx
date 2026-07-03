// src/components/layout/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route protégée.
 * - Sans prop : exige simplement d'être connecté.
 * - Avec adminOnly : exige en plus le rôle "admin".
 *   Un client connecté qui tente d'ouvrir /admin est renvoyé à l'accueil.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Pendant la vérification du token → ne rien afficher encore
  if (loading) return null;

  // Pas connecté → redirection vers /auth
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Connecté mais pas admin sur une page admin → retour à l'accueil
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
