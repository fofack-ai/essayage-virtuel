import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { count } = useCart();

  const items = [
    { path: '/',          icon: '🏠', label: 'Accueil'   },
    { path: '/catalogue', icon: '👗', label: 'Catalogue' },
    { path: '/cart',      icon: '🛒', label: 'Panier',  badge: count },
    { path: '/profile',   icon: '👤', label: 'Profil'    },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${pathname === item.path ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">
            {item.icon}
            {item.badge > 0 && (
              <span className="bottom-nav-badge">{item.badge}</span>
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}