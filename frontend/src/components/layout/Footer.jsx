import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand cfpd-footer-brand">
            <span>CFPD TryOn</span>
          </div>
          <p className="footer-desc">{t('footer.description')}</p>
        </div>
        <div>
          <div className="footer-col-title">{t('footer.shop.title')}</div>
          <ul className="footer-links">
            <li><Link to="/catalogue">{t('footer.shop.new')}</Link></li>
            <li><Link to="/catalogue?cat=femme">{t('footer.shop.women')}</Link></li>
            <li><Link to="/catalogue?cat=homme">{t('footer.shop.men')}</Link></li>
            <li><Link to="/catalogue?cat=accessoires">{t('footer.shop.accessories')}</Link></li>
            <li><Link to="/catalogue?cat=promo">{t('footer.shop.promotions')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">{t('footer.services.title')}</div>
          <ul className="footer-links">
            <li><Link to="/catalogue">{t('footer.services.virtualTryOn')}</Link></li>
            <li><Link to="/size-guide">{t('footer.services.sizeGuide')}</Link></li>
            <li><Link to="/shipping">{t('footer.services.shipping')}</Link></li>
            <li><Link to="/returns">{t('footer.services.returns')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">{t('footer.contact.title')}</div>
          <ul className="footer-links">
            <li><a href="https://cfpd-isgd.com/">CFPD</a></li>
            <li><a href="tel:+2376XXXXXXX">+237 671 207 375</a></li>
            <li>{t('footer.contact.location')}</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t('footer.copyright')}</span>
        <span>
          <Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link> · <Link to="/terms">{t('footer.terms')}</Link>
        </span>
      </div>
    </footer>
  );
}