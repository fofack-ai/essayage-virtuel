import React from 'react';
import { Link } from 'react-router-dom';

const zones = ['Douala et ses environs', 'Yaoundé et ses environs', 'Bafoussam', 'Garoua', 'Maroua', 'Bamenda', 'Toutes les autres régions camerounaises'];

export default function Shipping() {
  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
          .static-grid-2 { grid-template-columns: 1fr !important; }
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
          .static-card { padding: 1.25rem !important; }
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
          🚚 Livraison
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          Politique de Livraison
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          Toutes les informations concernant la livraison de vos commandes chez TryOn.
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Zones de Livraison
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Nous livrons actuellement dans toutes les régions du Cameroun :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {zones.map(z => (
              <li key={z} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
                <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
                {z}
              </li>
            ))}
          </ul>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            Pour les livraisons internationales, veuillez nous contacter directement.
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Délais de Livraison
          </h2>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="static-card" style={{
              background: '#fff', borderRadius: '14px', padding: '1.75rem',
              boxShadow: '0 10px 28px rgba(26,26,26,0.08)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <div className="static-card-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                🚚 Livraison Standard
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                3–5 jours ouvrables pour les principales villes
              </p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem', color: '#6A6F78', lineHeight: '1.65' }}>
                5–7 jours ouvrables pour les zones éloignées
              </p>
            </div>
            <div className="static-card" style={{
              background: '#fff', borderRadius: '14px', padding: '1.75rem',
              boxShadow: '0 10px 28px rgba(26,26,26,0.08)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <div className="static-card-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                ⚡ Livraison Express
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                1–2 jours ouvrables pour Douala et Yaoundé
              </p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem', color: '#6A6F78', lineHeight: '1.65' }}>
                2–3 jours ouvrables pour les autres grandes villes
              </p>
            </div>
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Frais de Livraison
          </h2>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="static-card-accent" style={{
              background: '#DDE8F3', borderRadius: '14px', padding: '1.75rem'
            }}>
              <div className="static-card-accent-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#355C86', marginBottom: '0.75rem'
              }}>
                🚚 Standard
              </div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: '1.65' }}>
                Gratuite pour les commandes &gt; 50 000 FCFA
              </p>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                500 FCFA pour les commandes inférieures
              </p>
            </div>
            <div className="static-card-accent" style={{
              background: '#DDE8F3', borderRadius: '14px', padding: '1.75rem'
            }}>
              <div className="static-card-accent-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#355C86', marginBottom: '0.75rem'
              }}>
                ⚡ Express
              </div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: '1.65' }}>
                1 500 FCFA pour toutes les commandes
              </p>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                Gratuite pour les commandes &gt; 100 000 FCFA
              </p>
            </div>
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Suivi de Commande
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Une fois votre commande expédiée, vous recevrez un email contenant votre numéro de suivi. Vous pouvez suivre votre colis en temps réel sur notre site ou directement sur le site du transporteur.
          </p>
        </section>

        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Retards et Problèmes de Livraison
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            En cas de retard ou de problème, notre service client est disponible pour vous aider :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Par téléphone : +237 671 207 375
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Par email : support@tryon.cm
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Via le chat en ligne sur notre site
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
          Prêt à passer votre commande ?
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          Profitez de notre service de livraison rapide et fiable partout au Cameroun.
        </p>
        <Link to="/catalogue" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          🛍️ Voir le catalogue
        </Link>
      </section>
    </div>
  );
}