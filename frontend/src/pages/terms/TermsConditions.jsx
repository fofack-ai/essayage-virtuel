import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Acceptation des Conditions',
    content: (
      <>
        <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
          En accédant au site web de TryOn et en effectuant un achat, vous acceptez sans réserve les présentes CGV. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
        </p>
        <div className="static-note" style={{
          fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
          padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
          borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
          marginTop: '1rem'
        }}>
          Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication.
        </div>
      </>
    )
  },
  {
    title: '2. Produits et Prix',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Les caractéristiques des produits sont décrites avec la plus grande exactitude possible. Les couleurs peuvent varier légèrement selon votre écran.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Tous les prix sont indiqués en FCFA et sont ceux en vigueur au moment de la commande.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Nous nous réservons le droit de modifier nos prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur lors de l'enregistrement de la commande.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Les produits demeurent la propriété de TryOn jusqu'au paiement complet du prix.
        </li>
      </ul>
    )
  },
  {
    title: '3. Commande',
    content: (
      <ol className="static-ol" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', counterReset: 'step-counter' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
          Sélectionnez les produits souhaités et ajoutez-les à votre panier.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
          Identifiez-vous ou créez un compte après validation du panier.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
          Choisissez votre adresse de livraison et votre mode de paiement.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
          Vérifiez le détail de votre commande et son prix total avant de finaliser.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>5</span>
          La confirmation de la commande entraîne acceptation des présentes CGV et forme le contrat de vente.
        </li>
      </ol>
    )
  },
  {
    title: '4. Paiement',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Nous acceptons les paiements par carte bancaire (Visa, MasterCard), mobile money (MTN, Orange) et virement bancaire.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Le paiement est exigible immédiatement à la commande.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Nous ne sommes pas responsables des échecs de transaction liés à des problèmes techniques ou à l'insuffisance de fonds.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Toutes les transactions sont sécurisées et chiffrées via la technologie SSL.
        </li>
      </ul>
    )
  },
  {
    title: '5. Livraison',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Les produits sont livrés à l'adresse indiquée lors de la commande.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Les délais de livraison sont des estimations et peuvent varier selon la disponibilité et les contraintes logistiques.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          En cas de retard supérieur à 7 jours ouvrés, vous pouvez annuler votre commande et obtenir un remboursement complet.
        </li>
      </ul>
    )
  },
  {
    title: '6. Réception et Réclamations',
    content: (
      <ol className="static-ol" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', counterReset: 'step-counter' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
          Il appartient au client de vérifier l'état du produit livré.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
          Vous disposez de 48 heures à compter de la livraison pour formuler des réserves par email ou téléphone en cas de produit manquant ou dégradé.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65', counterIncrement: 'step-counter' }}>
          <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
          Aucune réclamation ne pourra être acceptée en cas de non-respect de ces formalités et délais.
        </li>
      </ol>
    )
  },
  {
    title: '7. Droit de Rétractation et Retours',
    content: (
      <>
        <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
          Conformément à notre politique de retours, vous disposez de 15 jours calendaires à compter de la réception pour retourner un produit qui ne vous convient pas.
        </p>
        <div className="static-note" style={{
          fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
          padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
          borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
          marginTop: '1rem'
        }}>
          Les conditions détaillées sont disponibles sur notre page <Link to="/returns" style={{ color: '#355C86' }}>Politique de Retours</Link>.
        </div>
      </>
    )
  },
  {
    title: '8. Garantie',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Pour bénéficier de la garantie, conservez votre facture d'achat.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          La garantie ne couvre pas les dommages résultant d'une utilisation anormale ou non conforme du produit.
        </li>
      </ul>
    )
  },
  {
    title: '9. Propriété Intellectuelle',
    content: (
      <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
        Tous les éléments du site TryOn sont protégés par le droit d'auteur, des marques ou des brevets. Toute reproduction totale ou partielle sans autorisation expresse est interdite.
      </p>
    )
  },
  {
    title: '10. Responsabilité',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          TryOn ne pourra être tenue responsable des dommages directs et indirects causés lors de l'accès au site.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          TryOn décline toute responsabilité quant au contenu des sites tiers vers lesquels elle propose des liens.
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          La responsabilité de TryOn sera limitée au montant de la commande.
        </li>
      </ul>
    )
  },
  {
    title: '11. Données Personnelles',
    content: (
      <>
        <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
          La collecte et le traitement de vos données personnelles sont effectués conformément à notre Politique de Confidentialité.
        </p>
        <div className="static-note" style={{
          fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
          padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
          borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
          marginTop: '1rem'
        }}>
          Pour plus d'informations, consultez notre <Link to="/privacy-policy" style={{ color: '#355C86' }}>Politique de Confidentialité</Link>.
        </div>
      </>
    )
  },
  {
    title: '12. Loi Applicable et Juridiction',
    content: (
      <>
        <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
          Les présentes CGV sont régies par la loi camerounaise.
        </p>
        <div className="static-note" style={{
          fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
          padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
          borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
          marginTop: '1rem'
        }}>
          En cas de litige et à défaut de résolution amiable, le tribunal compétent sera celui du siège social de TryOn à Douala, Cameroun.
        </div>
      </>
    )
  },
  {
    title: '13. Contact',
    content: (
      <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Email : <strong>legal@tryon.cm</strong>
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Adresse : TryOn, Douala, Cameroun
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
          <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
          Téléphone : +237 671 207 375
        </li>
      </ul>
    )
  }
];

export default function TermsConditions() {
  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
        }
        @media (max-width: 640px) {
          .static-page { padding-top: 0 !important; }
          .static-hero { padding: 2rem 1rem 1.5rem !important; }
          .static-hero-title { font-size: 1.6rem !important; }
          .static-hero-sub { font-size: 0.9rem !important; }
          .static-main { padding: 1.5rem 1rem 1.5rem !important; }
          .static-section { margin-bottom: 2rem !important; padding-bottom: 2rem !important; }
          .static-h2 { font-size: 1.4rem !important; padding-left: 0.75rem !important; }
          .static-p { font-size: 0.9rem !important; }
          .static-ul li { font-size: 0.9rem !important; }
          .static-ol li { font-size: 0.9rem !important; }
          .static-cta { padding: 3rem 1.5rem !important; }
          .static-cta-title { font-size: 1.6rem !important; }
          .static-cta-sub { font-size: 0.9rem !important; }
          .static-cta-btn { padding: 0.75rem 1.5rem !important; font-size: 11px !important; }
        }
        @media (max-width: 420px) {
          .static-hero { padding: 1.5rem 0.75rem 1.25rem !important; }
          .static-hero-title { font-size: 1.3rem !important; }
          .static-main { padding: 1rem 0.75rem 1rem !important; }
          .static-h2 { font-size: 1.2rem !important; }
          .static-cta { padding: 2rem 1rem !important; }
          .static-cta-title { font-size: 1.3rem !important; }
        }
      `}</style>

      <section className="static-hero" style={{
        background: 'linear-gradient(135deg, #EEF3F8 0%, #DDE8F3 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <div className="static-hero-badge" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(53,92,134,0.09)', color: '#26384D',
          border: '1px solid rgba(53,92,134,0.14)',
          fontSize: '10px', fontWeight: 600, letterSpacing: '2px',
          textTransform: 'uppercase', padding: '4px 14px',
          borderRadius: '50px', marginBottom: '1.25rem'
        }}>
          📋 CGV
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          Conditions Générales de Vente
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          En effectuant un achat sur TryOn, vous acceptez sans réserve les présentes Conditions Générales de Vente.
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        {sections.map((s, i) => (
          <section key={s.title} className={i < sections.length - 1 ? 'static-section' : ''} style={i < sections.length - 1 ? { marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' } : {}}>
            <h2 className="static-h2" style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
              fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
              paddingLeft: '1rem', borderLeft: '3px solid #355C86'
            }}>
              {s.title}
            </h2>
            {s.content}
          </section>
        ))}
      </main>

      <section className="static-cta" style={{
        background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
        color: '#fff', textAlign: 'center', padding: '5rem 2rem'
      }}>
        <h2 className="static-cta-title" style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem',
          fontWeight: 600, marginBottom: '1rem', lineHeight: '1.2'
        }}>
          Achetez en toute confiance
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          Nos CGV sont claires, équitables et conçues pour protéger vos droits en tant que consommateur.
        </p>
        <Link to="/" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          🏠 Retourner à l'accueil
        </Link>
      </section>
    </div>
  );
}