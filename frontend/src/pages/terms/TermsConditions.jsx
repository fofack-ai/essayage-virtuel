import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Acceptation des Conditions',
    content: (
      <>
        <p className="static-p">
          En accédant au site web de TryOn et en effectuant un achat, vous acceptez sans réserve les présentes CGV. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
        </p>
        <div className="static-note">Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication.</div>
      </>
    ),
  },
  {
    title: '2. Produits et Prix',
    content: (
      <ul className="static-ul">
        <li>Les caractéristiques des produits sont décrites avec la plus grande exactitude possible. Les couleurs peuvent varier légèrement selon votre écran.</li>
        <li>Tous les prix sont indiqués en FCFA et sont ceux en vigueur au moment de la commande.</li>
        <li>Nous nous réservons le droit de modifier nos prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur lors de l'enregistrement de la commande.</li>
        <li>Les produits demeurent la propriété de TryOn jusqu'au paiement complet du prix.</li>
      </ul>
    ),
  },
  {
    title: '3. Commande',
    content: (
      <ol className="static-ol">
        <li>Sélectionnez les produits souhaités et ajoutez-les à votre panier.</li>
        <li>Identifiez-vous ou créez un compte après validation du panier.</li>
        <li>Choisissez votre adresse de livraison et votre mode de paiement.</li>
        <li>Vérifiez le détail de votre commande et son prix total avant de finaliser.</li>
        <li>La confirmation de la commande entraîne acceptation des présentes CGV et forme le contrat de vente.</li>
      </ol>
    ),
  },
  {
    title: '4. Paiement',
    content: (
      <ul className="static-ul">
        <li>Nous acceptons les paiements par carte bancaire (Visa, MasterCard), mobile money (MTN, Orange) et virement bancaire.</li>
        <li>Le paiement est exigible immédiatement à la commande.</li>
        <li>Nous ne sommes pas responsables des échecs de transaction liés à des problèmes techniques ou à l'insuffisance de fonds.</li>
        <li>Toutes les transactions sont sécurisées et chiffrées via la technologie SSL.</li>
      </ul>
    ),
  },
  {
    title: '5. Livraison',
    content: (
      <ul className="static-ul">
        <li>Les produits sont livrés à l'adresse indiquée lors de la commande.</li>
        <li>Les délais de livraison sont des estimations et peuvent varier selon la disponibilité et les contraintes logistiques.</li>
        <li>En cas de retard supérieur à 7 jours ouvrés, vous pouvez annuler votre commande et obtenir un remboursement complet.</li>
      </ul>
    ),
  },
  {
    title: '6. Réception et Réclamations',
    content: (
      <ol className="static-ol">
        <li>Il appartient au client de vérifier l'état du produit livré.</li>
        <li>Vous disposez de 48 heures à compter de la livraison pour formuler des réserves par email ou téléphone en cas de produit manquant ou dégradé.</li>
        <li>Aucune réclamation ne pourra être acceptée en cas de non-respect de ces formalités et délais.</li>
      </ol>
    ),
  },
  {
    title: '7. Droit de Rétractation et Retours',
    content: (
      <>
        <p className="static-p">
          Conformément à notre politique de retours, vous disposez de 15 jours calendaires à compter de la réception pour retourner un produit qui ne vous convient pas.
        </p>
        <div className="static-note">Les conditions détaillées sont disponibles sur notre page <Link to="/returns" style={{ color: '#355C86' }}>Politique de Retours</Link>.</div>
      </>
    ),
  },
  {
    title: '8. Garantie',
    content: (
      <ul className="static-ul">
        <li>Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.</li>
        <li>Pour bénéficier de la garantie, conservez votre facture d'achat.</li>
        <li>La garantie ne couvre pas les dommages résultant d'une utilisation anormale ou non conforme du produit.</li>
      </ul>
    ),
  },
  {
    title: '9. Propriété Intellectuelle',
    content: (
      <p className="static-p">
        Tous les éléments du site TryOn sont protégés par le droit d'auteur, des marques ou des brevets. Toute reproduction totale ou partielle sans autorisation expresse est interdite.
      </p>
    ),
  },
  {
    title: '10. Responsabilité',
    content: (
      <ul className="static-ul">
        <li>TryOn ne pourra être tenue responsable des dommages directs et indirects causés lors de l'accès au site.</li>
        <li>TryOn décline toute responsabilité quant au contenu des sites tiers vers lesquels elle propose des liens.</li>
        <li>La responsabilité de TryOn sera limitée au montant de la commande.</li>
      </ul>
    ),
  },
  {
    title: '11. Données Personnelles',
    content: (
      <>
        <p className="static-p">
          La collecte et le traitement de vos données personnelles sont effectués conformément à notre Politique de Confidentialité.
        </p>
        <div className="static-note">Pour plus d'informations, consultez notre <Link to="/privacy-policy" style={{ color: '#355C86' }}>Politique de Confidentialité</Link>.</div>
      </>
    ),
  },
  {
    title: '12. Loi Applicable et Juridiction',
    content: (
      <>
        <p className="static-p">Les présentes CGV sont régies par la loi camerounaise.</p>
        <div className="static-note">En cas de litige et à défaut de résolution amiable, le tribunal compétent sera celui du siège social de TryOn à Douala, Cameroun.</div>
      </>
    ),
  },
  {
    title: '13. Contact',
    content: (
      <ul className="static-ul">
        <li>Email : legal@tryon.cm</li>
        <li>Adresse : TryOn, Douala, Cameroun</li>
        <li>Téléphone : +237 671 207 375</li>
      </ul>
    ),
  },
];

export default function TermsConditions() {
  return (
    <div className="static-page">
      {/* Hero */}
      <section className="static-hero">
        <div className="static-hero-badge">📋 CGV</div>
        <h1 className="static-hero-title">Conditions Générales de Vente</h1>
        <p className="static-hero-sub">
          En effectuant un achat sur TryOn, vous acceptez sans réserve les présentes Conditions Générales de Vente.
        </p>
      </section>

      <main className="static-main">
        {sections.map((s, i) => (
          <section
            key={s.title}
            className={i < sections.length - 1 ? 'static-section' : ''}
          >
            <h2 className="static-h2">{s.title}</h2>
            {s.content}
          </section>
        ))}
      </main>

      {/* CTA */}
      <section className="static-cta">
        <h2 className="static-cta-title">Achetez en toute confiance</h2>
        <p className="static-cta-sub">
          Nos CGV sont claires, équitables et conçues pour protéger vos droits en tant que consommateur.
        </p>
        <Link to="/" className="static-cta-btn">🏠 Retourner à l'accueil</Link>
      </section>
    </div>
  );
}