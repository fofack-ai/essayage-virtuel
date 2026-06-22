import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/product/ProductDetail';
import TryOn from './pages/tryon/TryOn';
import Checkout from './pages/checkout/Checkout';
import Auth from './pages/auth/Auth';
import Shop from "./pages/shop/Shop";
import Cart from "./pages/cart/Cart";
import Orders from './pages/account/Orders';
import Dashboard from "./pages/admin/Dashboard";
import './index.css';

function App() {
  // Utilisation d'un état pour détecter si on est sur la page admin
  const isAdminPage = window.location.pathname === '/admin';

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar : cachée uniquement sur la page admin */}
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/tryon" element={<TryOn />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password/:token" element={<Auth />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/size-guide" element={<div>Guide des tailles (à implémenter)</div>} />
            <Route path="/shipping" element={<div>Livraison (à implémenter)</div>} />
            <Route path="/returns" element={<div>Retours (à implémenter)</div>} />
            <Route path="*" element={<div style={{ paddingTop: 120, textAlign: 'center' }}>Page introuvable</div>} />
          </Routes>
        </main>
        {/* Footer : caché uniquement sur la page admin */}
        {!isAdminPage && <Footer />}
      </div>
    </Router>
  );
}

export default App;