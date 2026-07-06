import React from 'react';
import { Link } from 'react-router-dom';


export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand cfpd-footer-brand">
            <span>TryOn</span>
          </div>
          <p className="footer-desc">
            Plateforme e-commerce avec cabine d'essayage virtuelle au Cameroun. Développée sous la charte du TryOn.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Boutique</div>
          <ul className="footer-links">
            <li><Link to="/catalogue">Nouveautés</Link></li>
            <li><Link to="/catalogue?cat=femme">Femme</Link></li>
            <li><Link to="/catalogue?cat=homme">Homme</Link></li>
            <li><Link to="/catalogue?cat=accessoires">Accessoires</Link></li>
            <li><Link to="/catalogue?cat=promo">Promotions</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Services</div>
          <ul className="footer-links">
            <li><Link to="/catalogue">Essayage Virtuel</Link></li>
            <li><Link to="/size-guide">Guide des tailles</Link></li>
            <li><Link to="/shipping">Livraison</Link></li>
            <li><Link to="/returns">Retours</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Contact</div>
          <ul className="footer-links">
            <li><a href="https://cfpd-isgd.com/">CFPD</a></li>
            <li><a href="tel:+2376XXXXXXX">+237 671 207 375</a></li>
            <li>Douala, Cameroun</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 TryOn — Application de mode africaine et cabine d’essayage virtuelle. Tous droits réservés.</span>
        <span>
          <Link to="/privacy-policy">Politique de confidentialité</Link> · <Link to="/terms">CGV</Link>
        </span>
      </div>
    </footer>
  );
}