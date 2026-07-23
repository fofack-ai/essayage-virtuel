import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Shirt, ShoppingCart, User, LogIn } from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();

  const items = [
    { path: '/', Icon: Home, label: t('navbar.home') },
    { path: '/catalogue', Icon: Shirt, label: t('navbar.catalogue') },
    { path: '/cart', Icon: ShoppingCart, label: t('profile.actions.cart'), badge: count },
    isAuthenticated
      ? { path: '/profile', Icon: User, label: t('profile.groups.account') }
      : { path: '/auth', Icon: LogIn, label: t('auth.tabs.login') },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.Icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${pathname === item.path ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">
              <Icon size={22} />
              {item.badge > 0 && (
                <span className="bottom-nav-badge">{item.badge}</span>
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}