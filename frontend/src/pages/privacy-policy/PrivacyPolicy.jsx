import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="static-page">
      {/* Hero */}
      <section className="static-hero">
        <div className="static-hero-badge">🔒 Confidentialité</div>
        <h1 className="static-hero-title">Politique de Confidentialité</h1>
        <p className="static-hero-sub">
          Comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez nos services.
        </p>
      </section>

      <main className="static-main">
        {/* Introduction */}
        <section className="static-section">
          <h2 className="static-h2">Introduction</h2>
          <p className="static-p">
            Chez TryOn, nous nous engageons à protéger votre vie privée. Cette politique décrit comment nous collectons, utilisons, divulguons et sécurisons vos informations lorsque vous visitez notre site ou utilisez nos services.
          </p>
          <div className="static-note">En utilisant notre site, vous consentez aux pratiques décrites dans cette politique.</div>
        </section>

        {/* Informations collectées */}
        <section className="static-section">
          <h2 className="static-h2">Informations que Nous Collectons</h2>
          <h3 className="static-h3" style={{ marginTop: '1rem' }}>Informations personnelles</h3>
          <ul className="static-ul">
            <li>Nom complet, adresse e-mail, numéro de téléphone</li>
            <li>Adresse de facturation et de livraison</li>
            <li>Informations de paiement (traitées par nos partenaires sécurisés, non stockées chez nous)</li>
            <li>Préférences et historiques d'achat</li>
            <li>Données liées à l'essayage virtuel (photos uploadées, mesures prises)</li>
          </ul>
          <h3 className="static-h3" style={{ marginTop: '1.5rem' }}>Informations techniques</h3>
          <ul className="static-ul">
            <li>Adresse IP, type de navigateur, système d'exploitation</li>
            <li>Pages visitées, durée de visite, chemins de navigation</li>
            <li>Cookies et technologies de suivi similaires</li>
          </ul>
        </section>

        {/* Utilisation */}
        <section className="static-section">
          <h2 className="static-h2">Comment Nous Utilisons Vos Informations</h2>
          <ul className="static-ul">
            <li>Pour traiter vos commandes et vous fournir nos services</li>
            <li>Pour personnaliser votre expérience d'achat</li>
            <li>Pour améliorer notre site et nos fonctionnalités (y compris l'essayage virtuel)</li>
            <li>Pour vous envoyer des communications liées à votre compte ou des offres (avec votre consentement)</li>
            <li>Pour prévenir la fraude et assurer la sécurité de nos transactions</li>
            <li>Pour respecter nos obligations légales et réglementaires</li>
          </ul>
        </section>

        {/* Partage */}
        <section className="static-section">
          <h2 className="static-h2">Partage de Vos Informations</h2>
          <p className="static-p">Nous ne vendons, ni ne louons vos informations personnelles. Nous les partageons uniquement dans les cas suivants :</p>
          <ul className="static-ul">
            <li>Avec nos prestataires nécessaires à l'exécution des services (paiement, livraison, hébergement)</li>
            <li>Lorsque la loi l'exige ou pour protéger nos droits légaux</li>
            <li>Avec votre consentement explicite</li>
            <li>Dans le cadre d'une fusion, acquisition ou vente d'actifs</li>
          </ul>
          <div className="static-note">Nos prestataires sont tenus de protéger vos informations conformément à nos standards de sécurité.</div>
        </section>

        {/* Sécurité */}
        <section className="static-section">
          <h2 className="static-h2">Sécurité des Données</h2>
          <p className="static-p">Nous mettons en œuvre des mesures de sécurité appropriées :</p>
          <div className="static-grid-2" style={{ marginTop: '1.25rem' }}>
            {[
              { icon: '🔐', t: 'Chiffrement SSL/TLS', d: 'Pour toutes les transmissions de données' },
              { icon: '🛡️', t: 'Contrôles d\'accès stricts', d: 'Stockage sécurisé avec accès limité' },
              { icon: '🔍', t: 'Audits réguliers', d: 'Revue de sécurité périodique de nos systèmes' },
              { icon: '📚', t: 'Formation du personnel', d: 'Sensibilisation continue à la protection des données' },
            ].map(c => (
              <div key={c.t} className="static-card">
                <div className="static-card-title">{c.icon} {c.t}</div>
                <p className="static-card-text">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Droits */}
        <section className="static-section">
          <h2 className="static-h2">Vos Droits</h2>
          <p className="static-p">Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
          <ul className="static-ul">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit de retirer votre consentement à tout moment</li>
          </ul>
          <div className="static-note">Pour exercer ces droits, contactez-nous à l'adresse indiquée ci-dessous.</div>
        </section>

        {/* Cookies */}
        <section className="static-section">
          <h2 className="static-h2">Cookies</h2>
          <p className="static-p">Notre site utilise des cookies pour améliorer votre expérience :</p>
          <ul className="static-ul">
            <li><strong>Essentiels</strong> — nécessaires au fonctionnement du site</li>
            <li><strong>Performance</strong> — pour analyser l'utilisation du site</li>
            <li><strong>Fonctionnalité</strong> — pour mémoriser vos préférences</li>
          </ul>
          <div className="static-note">Vous pouvez configurer votre navigateur pour refuser les cookies. Certaines fonctionnalités du site peuvent alors ne plus fonctionner correctement.</div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="static-h2">Contact</h2>
          <p className="static-p">Pour toute question concernant cette politique :</p>
          <ul className="static-ul">
            <li>Email : <strong>privacy@tryon.cm</strong></li>
            <li>Adresse : TryOn, Douala, Cameroun</li>
            <li>Téléphone : +237 671 207 375</li>
          </ul>
        </section>
      </main>

      {/* CTA */}
      <section className="static-cta">
        <h2 className="static-cta-title">Vos données sont en sécurité</h2>
        <p className="static-cta-sub">
          Nous protégeons vos informations avec les plus hauts standards de confidentialité.
        </p>
        <Link to="/" className="static-cta-btn">🏠 Retourner à l'accueil</Link>
      </section>
    </div>
  );
}