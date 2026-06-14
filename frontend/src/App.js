import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/product/ProductDetail';
import TryOn from './pages/tryon/TryOn';
import Checkout from './pages/checkout/Checkout';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<div>Catalogue (à implémenter par binôme)</div>} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/tryon" element={<TryOn />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<div>Panier (à implémenter)</div>} />
            <Route path="/auth" element={<div>Authentification (à implémenter)</div>} />
            <Route path="/admin" element={<div>Admin (à implémenter)</div>} />
            <Route path="/size-guide" element={<div>Guide des tailles (à implémenter)</div>} />
            <Route path="/shipping" element={<div>Livraison (à implémenter)</div>} />
            <Route path="/returns" element={<div>Retours (à implémenter)</div>} />
            <Route path="*" element={<div style={{ paddingTop: 120, textAlign: 'center' }}>Page introuvable</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;