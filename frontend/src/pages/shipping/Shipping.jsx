import React from 'react';
import { Link } from 'react-router-dom';

const zones = ['Douala et ses environs','Yaoundé et ses environs','Bafoussam','Garoua','Maroua','Bamenda','Toutes les autres régions camerounaises'];

export default function Shipping() {
  return (
    <div className="static-page">
      {/* Hero */}
      <section className="static-hero">
        <div className="static-hero-badge">🚚 Livraison</div>
        <h1 className="static-hero-title">Politique de Livraison</h1>
        <p className="static-hero-sub">
          Toutes les informations concernant la livraison de vos commandes chez TryOn.
        </p>
      </section>

      <main className="static-main">
        {/* Zones */}
        <section className="static-section">
          <h2 className="static-h2">Zones de Livraison</h2>
          <p className="static-p">Nous livrons actuellement dans toutes les régions du Cameroun :</p>
          <ul className="static-ul">
            {zones.map(z => <li key={z}>{z}</li>)}
          </ul>
          <div className="static-note">
            Pour les livraisons internationales, veuillez nous contacter directement.
          </div>
        </section>

        {/* Délais */}
        <section className="static-section">
          <h2 className="static-h2">Délais de Livraison</h2>
          <div className="static-grid-2">
            <div className="static-card">
              <div className="static-card-title">🚚 Livraison Standard</div>
              <p className="static-card-text">3–5 jours ouvrables pour les principales villes</p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem' }}>
                5–7 jours ouvrables pour les zones éloignées
              </p>
            </div>
            <div className="static-card">
              <div className="static-card-title">⚡ Livraison Express</div>
              <p className="static-card-text">1–2 jours ouvrables pour Douala et Yaoundé</p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem' }}>
                2–3 jours ouvrables pour les autres grandes villes
              </p>
            </div>
          </div>
        </section>

        {/* Frais */}
        <section className="static-section">
          <h2 className="static-h2">Frais de Livraison</h2>
          <div className="static-grid-2">
            <div className="static-card-accent">
              <div className="static-card-accent-title">🚚 Standard</div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Gratuite pour les commandes &gt; 50 000 FCFA
              </p>
              <p className="static-card-text">500 FCFA pour les commandes inférieures</p>
            </div>
            <div className="static-card-accent">
              <div className="static-card-accent-title">⚡ Express</div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>
                1 500 FCFA pour toutes les commandes
              </p>
              <p className="static-card-text">Gratuite pour les commandes &gt; 100 000 FCFA</p>
            </div>
          </div>
        </section>

        {/* Suivi */}
        <section className="static-section">
          <h2 className="static-h2">Suivi de Commande</h2>
          <p className="static-p">
            Une fois votre commande expédiée, vous recevrez un email contenant votre numéro de suivi. Vous pouvez suivre votre colis en temps réel sur notre site ou directement sur le site du transporteur.
          </p>
        </section>

        {/* Problèmes */}
        <section>
          <h2 className="static-h2">Retards et Problèmes de Livraison</h2>
          <p className="static-p">
            En cas de retard ou de problème, notre service client est disponible pour vous aider :
          </p>
          <ul className="static-ul">
            <li>Par téléphone : +237 671 207 375</li>
            <li>Par email : support@tryon.cm</li>
            <li>Via le chat en ligne sur notre site</li>
          </ul>
        </section>
      </main>

      {/* CTA */}
      <section className="static-cta">
        <h2 className="static-cta-title">Prêt à passer votre commande ?</h2>
        <p className="static-cta-sub">
          Profitez de notre service de livraison rapide et fiable partout au Cameroun.
        </p>
        <Link to="/catalogue" className="static-cta-btn">🛍️ Voir le catalogue</Link>
      </section>
    </div>
  );
}