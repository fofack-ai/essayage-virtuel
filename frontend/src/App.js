import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BottomNav from "./components/layout/BottomNav";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import useMobile from "./hooks/useMobile";
import LoadingPage from './components/common/LoadingPage';

import Home from "./pages/Home";
import ProductDetail from "./pages/product/ProductDetail";
import TryOn from "./pages/tryon/TryOn";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";
import Auth from "./pages/auth/Auth";
import Shop from "./pages/shop/Shop";
import Cart from "./pages/cart/Cart";
import Orders from "./pages/account/Orders";
import Profile from "./pages/account/Profile";
import Notifications from "./pages/account/Notifications";
import HelpCenter from "./pages/account/HelpCenter";
import Dashboard from "./pages/admin/Dashboard";
import SizeGuide from "./pages/size-guide/SizeGuide";
import Shipping from "./pages/shipping/Shipping";
import Returns from "./pages/returns/Returns";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy";
import TermsConditions from "./pages/terms/TermsConditions";
import MaintenancePage from "./pages/MaintenancePage";

import { SettingsProvider } from "./context/SettingsContext";
// ✅ CORRECTION : Importer AuthProvider ET useAuth
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./index.css";

function AppLayout() {
  // ✅ ÉTAPE 1 : TOUS les Hooks sont appelés AVANT tout return conditionnel
  const location = useLocation();
  const { pathname } = location;
  const isMobile = useMobile();
  const { loading: authLoading } = useAuth();

  // ✅ ÉTAPE 2 : VÉRIFICATION après tous les hooks
  if (authLoading) {
    return <LoadingPage message="Vérification de votre session..." />;
  }

  const isAdminPage = pathname === "/admin";
  const isAuthPage =
    pathname === "/auth" ||
    pathname.startsWith("/reset-password") ||
    pathname === "/auth/google/success";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {/* Navbar — Desktop uniquement, hors admin */}
      {!isAdminPage && !isMobile && <Navbar />}

      <main className="flex-grow">
        <Routes location={location} key={pathname}>
          {/* ── Pages publiques ── */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/google/success" element={<Auth />} />
          <Route path="/reset-password/:token" element={<Auth />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* ── Routes protégées client ── */}
{/* Essayage virtuel accessible sans connexion (invité) */}
<Route path="/tryon" element={<TryOn />} />

{/* ── Routes protégées client ── */}
<Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
<Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders"        element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/help-center"   element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />

          {/* ── Route admin ── */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<div style={{ paddingTop: 120, textAlign: "center" }}>Page introuvable</div>} />
        </Routes>
      </main>

      {/* Footer — Desktop uniquement, hors admin */}
      {!isAdminPage && !isMobile && <Footer />}

      {/* Bottom Nav — Mobile uniquement, hors admin et auth */}
      {isMobile && !isAdminPage && !isAuthPage && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;