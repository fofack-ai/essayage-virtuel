import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { adminService } from '../../services/adminService';

export default function MobileHeader() {
  const { isAuthenticated } = useAuth();
  const { count } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

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
        // silencieux
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <div className="mobile-header">
      <Link to="/" className="mobile-logo">TRY<span>ON</span></Link>
      <div className="mobile-header-actions">
        {isAuthenticated ? (
          <Link to="/notifications" className="mobile-header-icon" aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-dot" />}
          </Link>
        ) : (
          <Link to="/auth" className="mobile-header-icon" aria-label="Connexion">👤</Link>
        )}
        <Link to="/cart" className="mobile-header-icon" aria-label="Panier">
          🛒
          {count > 0 && <span className="cart-badge-mobile">{count}</span>}
        </Link>
      </div>
    </div>
  );
}