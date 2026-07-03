import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && event.target.closest('.user-dropdown') === null) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
        <Link to="/" className={`header-page-btn ${isActive('/') ? 'active' : ''}`}>Accueil</Link>
        <Link to="/catalogue" className={`header-page-btn ${isActive('/catalogue') ? 'active' : ''}`}>Catalogue</Link>
      </div>

      <div className="nav-icons header-actions">
        {isAuthenticated ? (
          <div className="user-dropdown relative">
            <button
              className="header-icon-btn"
              aria-label="Compte utilisateur"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user?.firstName ? <span>{user.firstName.charAt(0).toUpperCase()}</span> : <span>👤</span>}
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">
                    {(user?.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-dropdown-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-dropdown-email">{user?.email}</div>
                  </div>
                </div>

                <div className="user-dropdown-links">
                  <Link to="/profile" className="user-dropdown-link" onClick={() => setIsDropdownOpen(false)}>
                    <span className="user-dropdown-link-icon">⚙</span> Paramètres
                  </Link>
                  <Link to="/orders" className="user-dropdown-link" onClick={() => setIsDropdownOpen(false)}>
                    <span className="user-dropdown-link-icon">📦</span> Mes commandes
                  </Link>
                </div>

                <button
                  className="user-dropdown-logout"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    setIsDropdownOpen(false);
                    window.location.href = "/";
                  }}
                >
                  <span className="user-dropdown-link-icon">↪</span> Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="header-icon-btn"><span>👤</span></Link>
        )}

        <Link to="/cart" className="header-icon-btn" style={{ position: 'relative' }}>
          <span>🛒</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </div>
    </nav>
  );
}