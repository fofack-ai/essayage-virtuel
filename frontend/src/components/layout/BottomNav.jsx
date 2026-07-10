import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Shirt, ShoppingCart, User, LogIn } from 'lucide-react';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();

  const items = [
    { path: '/', Icon: Home, label: 'Accueil' },
    { path: '/catalogue', Icon: Shirt, label: 'Catalogue' },
    { path: '/cart', Icon: ShoppingCart, label: 'Panier', badge: count },
    isAuthenticated
      ? { path: '/profile', Icon: User, label: 'Profil' }
      : { path: '/auth', Icon: LogIn, label: 'Connexion' },
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