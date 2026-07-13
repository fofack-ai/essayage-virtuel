import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

// ─── ICÔNES LUCIDE ───
import {
  User,
  Bell,
  BellDot,
  ShoppingCart,
  Settings,
  Package,
  LogOut,
  Home,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && event.target.closest('.user-dropdown') === null) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const res = await adminService.getNotifications();
        const payload = res?.data?.data || res?.data || [];
        const unread = Array.isArray(payload)
          ? payload.filter((n) => !n.read && !n.isRead && !n.readAt).length
          : 0;
        setUnreadCount(unread);
      } catch (e) {
        // silencieux, pas critique
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="vesti-header">
      <Link to="/" className="nav-logo cfpd-logo-link">
        <span className="cfpd-logo-word">
          <span className="cfpd-logo-cf">CFPD Try</span>
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
              {user?.avatar || user?.picture ? (
                <img src={user.avatar || user.picture} alt={user.firstName} className="navbar-user-photo" />
              ) : user?.firstName ? (
                <span style={{ fontSize: '18px', fontWeight: 600 }}>{user.firstName.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={20} strokeWidth={2} />
              )}
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">
                    {user?.avatar || user?.picture ? (
                      <img src={user.avatar || user.picture} alt={user.firstName} className="dropdown-user-photo" />
                    ) : (
                      <User size={20} strokeWidth={2} style={{ color: '#fff' }} />
                    )}
                  </div>
                  <div>
                    <div className="user-dropdown-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-dropdown-email">{user?.email}</div>
                  </div>
                </div>

                <div className="user-dropdown-links">
                  <Link to="/profile" className="user-dropdown-link" onClick={() => setIsDropdownOpen(false)}>
                    <span className="user-dropdown-link-icon">
                      <Settings size={16} strokeWidth={2} />
                    </span>
                    Paramètres
                  </Link>
                  <Link to="/orders" className="user-dropdown-link" onClick={() => setIsDropdownOpen(false)}>
                    <span className="user-dropdown-link-icon">
                      <Package size={16} strokeWidth={2} />
                    </span>
                    Mes commandes
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
                  <span className="user-dropdown-link-icon">
                    <LogOut size={16} strokeWidth={2} />
                  </span>
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="header-icon-btn">
            <User size={20} strokeWidth={2} />
          </Link>
        )}

        {/* 🔔 Icône notifications — visible seulement si connecté */}
        {isAuthenticated && (
          <Link
            to="/notifications"
            className="header-icon-btn"
            style={{ position: 'relative' }}
            aria-label="Notifications"
            onClick={() => setUnreadCount(0)}
          >
            {unreadCount > 0 ? (
              <BellDot size={20} strokeWidth={2} />
            ) : (
              <Bell size={20} strokeWidth={2} />
            )}
            {unreadCount > 0 && (
              <span className="cart-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
        )}

        <Link to="/cart" className="header-icon-btn" style={{ position: 'relative' }}>
          <ShoppingCart size={20} strokeWidth={2} />
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </div>
    </nav>
  );
}