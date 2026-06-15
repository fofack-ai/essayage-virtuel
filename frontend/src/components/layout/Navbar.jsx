import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const location = useLocation();
  const { count } = useCart();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="vesti-header">
      <Link to="/" className="nav-logo cfpd-logo-link">
        <span className="cfpd-logo-word">
          <span className="cfpd-logo-cf">Try</span>
          <span className="cfpd-logo-pd">On</span>
        </span>
      </Link>

      <div className="header-pages clean-header-links">
        <Link to="/" className={`header-page-btn ${isActive('/') ? 'active' : ''}`}>
          Accueil
        </Link>
        <Link to="/catalogue" className={`header-page-btn ${isActive('/catalogue') ? 'active' : ''}`}>
          Catalogue
        </Link>
      </div>

      <div className="nav-icons header-actions">
        <Link to="/auth" className="header-icon-btn">👤</Link>
        <Link to="/cart" className="header-icon-btn" style={{ position: 'relative' }}>
          🛒
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </div>
    </nav>
  );
}