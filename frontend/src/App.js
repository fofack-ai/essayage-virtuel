import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/product/ProductDetail';
import TryOn from './pages/tryon/TryOn';
import Checkout from './pages/checkout/Checkout';
import Auth from './pages/auth/Auth';
import Shop from "./pages/shop/Shop";
import Cart from "./pages/cart/Cart";
import Orders from './pages/account/Orders';
import Profile from './pages/account/Profile';
import Dashboard from "./pages/admin/Dashboard";
import SizeGuide from "./pages/size-guide/SizeGuide";
import Shipping from "./pages/shipping/Shipping";
import Returns from "./pages/returns/Returns";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy";
import TermsConditions from "./pages/terms/TermsConditions";
import './index.css';

// ✅ Composant séparé DANS le Router pour pouvoir utiliser useLocation
function AppLayout() {
  const { pathname } = useLocation();
  const isAdminPage = pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
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

          {/* 🔒 Routes protégées */}
          <Route path="/tryon"    element={<ProtectedRoute><TryOn /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"    element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<div style={{ paddingTop: 120, textAlign: 'center' }}>Page introuvable</div>} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

// ✅ App ne fait plus que wrapper avec Router
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;