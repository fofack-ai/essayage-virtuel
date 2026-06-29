import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  'Connectez-vous à votre compte sur notre site.',
  'Accédez à la section "Mes commandes".',
  'Sélectionnez la commande contenant l\'article à retourner.',
  'Cliquez sur "Retourner un article" et suivez les instructions.',
  'Imprimez l\'étiquette de retour et collez-la sur votre colis.',
  'Déposez votre colis au point relais le plus proche.',
];

export default function Returns() {
  return (
    <div className="static-page">
      {/* Hero */}
      <section className="static-hero">
        <div className="static-hero-badge">↩ Retours & Remboursements</div>
        <h1 className="static-hero-title">Politique de Retours</h1>
        <p className="static-hero-sub">
          Toutes les conditions pour retourner ou échanger vos articles chez TryOn.
        </p>
      </section>

      <main className="static-main">
        {/* Délai */}
        <section className="static-section">
          <h2 className="static-h2">Délai de Retour</h2>
          <p className="static-p">
            Vous disposez de <strong>15 jours calendaires</strong> à compter de la date de réception de votre commande pour retourner un article qui ne vous convient pas.
          </p>
          <div className="static-note">
            Ce délai est prolongé pendant les périodes de fêtes (Noël, Nouvel An, etc.).
          </div>
        </section>

        {/* Conditions */}
        <section className="static-section">
          <h2 className="static-h2">Conditions de Retour</h2>
          <p className="static-p">Pour être accepté, le retour doit respecter les conditions suivantes :</p>
          <ul className="static-ul">
            <li>L'article doit être dans son état original, non porté, non lavé et avec toutes ses étiquettes.</li>
            <li>L'article doit être dans son emballage d'origine lorsque cela est raisonnablement possible.</li>
            <li>Les articles personnalisés ou confectionnés sur mesure ne peuvent pas être retournés.</li>
            <li>Les sous-vêtements et maillots de bain portés ne peuvent pas être retournés pour des raisons d'hygiène.</li>
          </ul>
        </section>

        {/* Processus */}
        <section className="static-section">
          <h2 className="static-h2">Processus de Retour</h2>
          <p className="static-p">Suivez ces étapes simples pour retourner un article :</p>
          <ol className="static-ol" style={{ marginTop: '1.25rem' }}>
            {steps.map(s => <li key={s}>{s}</li>)}
          </ol>
          <div className="static-note">
            Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part (article défectueux, mauvais article, etc.).
          </div>
        </section>

        {/* Remboursement */}
        <section className="static-section">
          <h2 className="static-h2">Remboursement</h2>
          <p className="static-p">
            Une fois votre retour reçu et inspecté, nous vous informerons de son acceptation. Si approuvé, le remboursement sera effectué selon le même mode de paiement utilisé :
          </p>
          <div className="static-grid-3" style={{ marginTop: '1.25rem' }}>
            {[
              { icon: '💳', mode: 'Carte bancaire', delay: '3–5 jours ouvrables' },
              { icon: '📱', mode: 'Mobile Money',   delay: '24–48 heures' },
              { icon: '🏦', mode: 'Virement bancaire', delay: '3–5 jours ouvrables' },
            ].map(r => (
              <div key={r.mode} className="static-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{r.icon}</div>
                <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{r.mode}</div>
                <div className="static-card-text">{r.delay}</div>
              </div>
            ))}
          </div>
          <div className="static-note">Les frais de livraison initiaux ne sont pas remboursés, sauf erreur de notre part.</div>
        </section>

        {/* Articles défectueux */}
        <section className="static-section">
          <h2 className="static-h2">Articles Défectueux ou Incorrects</h2>
          <p className="static-p">Si vous recevez un article défectueux ou incorrect :</p>
          <ul className="static-ul">
            <li>Contactez notre service client dans les <strong>48 heures</strong> suivant la réception.</li>
            <li>Nous prenons en charge tous les frais de retour.</li>
            <li>Nous vous envoyons un remplacement gratuit ou effectuons un remboursement complet.</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="static-h2">Nous Contacter</h2>
          <p className="static-p">Pour toute question concernant notre politique de retours :</p>
          <ul className="static-ul">
            <li>Email : <strong>returns@tryon.cm</strong></li>
            <li>Téléphone : +237 671 207 375 (service après-vente)</li>
            <li>Chat en ligne : disponible 9h–18h du lundi au vendredi</li>
          </ul>
        </section>
      </main>

      {/* CTA */}
      <section className="static-cta">
        <h2 className="static-cta-title">Achetez en toute confiance</h2>
        <p className="static-cta-sub">
          Avec notre politique de retours claire et équitable, faites vos achats sans risque.
        </p>
        <Link to="/" className="static-cta-btn">🏠 Retourner à l'accueil</Link>
      </section>
    </div>
  );
}