import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  'Connectez-vous à votre compte sur notre site.',
  'Accédez à la section "Mes commandes".',
  'Sélectionnez la commande contenant l\'article à retourner.',
  'Cliquez sur "Retourner un article" et suivez les instructions.',
  'Imprimez l\'étiquette de retour et collez-la sur votre colis.',
  'Déposez votre colis au point relais le plus proche.'
];

export default function Returns() {
  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
          .static-grid-2 { grid-template-columns: 1fr !important; }
          .static-grid-3 { grid-template-columns: 1fr 1fr !important; }
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
          .static-card { padding: 1.25rem !important; }
          .static-cta { padding: 3rem 1.5rem !important; }
          .static-cta-title { font-size: 1.6rem !important; }
          .static-cta-sub { font-size: 0.9rem !important; }
          .static-cta-btn { padding: 0.75rem 1.5rem !important; font-size: 11px !important; }
          .static-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .static-hero { padding: 1.5rem 0.75rem 1.25rem !important; }
          .static-hero-title { font-size: 1.3rem !important; }
          .static-main { padding: 1rem 0.75rem 1rem !important; }
          .static-h2 { font-size: 1.2rem !important; }
          .static-card { padding: 1rem !important; }
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
          ↩ Retours & Remboursements
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          Politique de Retours
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          Toutes les conditions pour retourner ou échanger vos articles chez TryOn.
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Délai de Retour
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Vous disposez de <strong>15 jours calendaires</strong> à compter de la date de réception de votre commande pour retourner un article qui ne vous convient pas.
          </p>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            Ce délai est prolongé pendant les périodes de fêtes (Noël, Nouvel An, etc.).
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Conditions de Retour
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Pour être accepté, le retour doit respecter les conditions suivantes :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              L'article doit être dans son état original, non porté, non lavé et avec toutes ses étiquettes.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              L'article doit être dans son emballage d'origine lorsque cela est raisonnablement possible.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Les articles personnalisés ou confectionnés sur mesure ne peuvent pas être retournés.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Les sous-vêtements et maillots de bain portés ne peuvent pas être retournés pour des raisons d'hygiène.
            </li>
          </ul>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Processus de Retour
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Suivez ces étapes simples pour retourner un article :
          </p>
          <ol className="static-ol" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', counterReset: 'step-counter', marginTop: '1.25rem' }}>
            {steps.map(s => (
              <li key={s} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65',
                counterIncrement: 'step-counter'
              }}>
                <span style={{
                  minWidth: '26px', height: '26px', borderRadius: '50%',
                  background: '#355C86', color: '#fff', fontSize: '12px',
                  fontWeight: 700, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  {steps.indexOf(s) + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part (article défectueux, mauvais article, etc.).
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Remboursement
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Une fois votre retour reçu et inspecté, nous vous informerons de son acceptation. Si approuvé, le remboursement sera effectué selon le même mode de paiement utilisé :
          </p>
          <div className="static-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            {[
              { icon: '💳', mode: 'Carte bancaire', delay: '3–5 jours ouvrables' },
              { icon: '📱', mode: 'Mobile Money', delay: '24–48 heures' },
              { icon: '🏦', mode: 'Virement bancaire', delay: '3–5 jours ouvrables' }
            ].map(r => (
              <div key={r.mode} className="static-card" style={{
                background: '#fff', borderRadius: '14px', padding: '1.75rem',
                boxShadow: '0 10px 28px rgba(26,26,26,0.08)',
                border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{r.icon}</div>
                <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{r.mode}</div>
                <div className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>{r.delay}</div>
              </div>
            ))}
          </div>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            Les frais de livraison initiaux ne sont pas remboursés, sauf erreur de notre part.
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Articles Défectueux ou Incorrects
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Si vous recevez un article défectueux ou incorrect :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Contactez notre service client dans les <strong>48 heures</strong> suivant la réception.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Nous prenons en charge tous les frais de retour.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Nous vous envoyons un remplacement gratuit ou effectuons un remboursement complet.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Nous Contacter
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Pour toute question concernant notre politique de retours :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Email : <strong>returns@tryon.cm</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Téléphone : +237 671 207 375 (service après-vente)
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Chat en ligne : disponible 9h–18h du lundi au vendredi
            </li>
          </ul>
        </section>
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
          Avec notre politique de retours claire et équitable, faites vos achats sans risque.
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