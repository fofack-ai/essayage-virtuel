import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && event.target.closest('.user-dropdown') === null) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        <Link to="/" className={`header-page-btn ${isActive('/') ? 'active' : ''}`}>
          Accueil
        </Link>
        <Link to="/catalogue" className={`header-page-btn ${isActive('/catalogue') ? 'active' : ''}`}>
          Catalogue
        </Link>
      </div>

      <div className="nav-icons header-actions">
        {isAuthenticated ? (
          <div className="user-dropdown relative">
            <button
              className="header-icon-btn"
              aria-label="Compte utilisateur"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user?.prenom ? (
                <span>{user.prenom.charAt(0)}</span>
              ) : (
                <span>👤</span>
              )}
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                <div className="px-4 py-2">
                  <Link
                    to="/profile"
                    className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Mes commandes
                  </Link>
                  {/* Add more links as needed */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      setIsDropdownOpen(false);
                      window.location.href = "/";
                    }}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="header-icon-btn">
            <span>👤</span>
          </Link>
        )}
        {/* Panier toujours visible */}
        <Link to="/cart" className="header-icon-btn" style={{ position: 'relative' }}>
          <span>🛒</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </div>
    </nav>
  );
}