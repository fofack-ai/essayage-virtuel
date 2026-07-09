import React from 'react';
import { Link } from 'react-router-dom';

const sizes = [
  { s: 'XS', chest: '76–81', waist: '58–63', hip: '84–89' },
  { s: 'S', chest: '82–87', waist: '64–69', hip: '90–95' },
  { s: 'M', chest: '88–93', waist: '70–75', hip: '96–101' },
  { s: 'L', chest: '94–99', waist: '76–81', hip: '102–107' },
  { s: 'XL', chest: '100–105', waist: '82–87', hip: '108–113' },
  { s: 'XXL', chest: '106–111', waist: '88–93', hip: '114–119' }
];

const measures = [
  { icon: '📏', title: 'Tour de poitrine', desc: 'Mesurez autour de la partie la plus forte de votre poitrine, en gardant le ruban horizontal.' },
  { icon: '📐', title: 'Tour de taille', desc: 'Mesurez autour de la partie la plus fine de votre taille, généralement au niveau du nombril.' },
  { icon: '📏', title: 'Tour de hanches', desc: 'Mesurez autour de la partie la plus forte de vos hanches et fesses.' },
  { icon: '📏', title: 'Longueur de jambe', desc: 'Mesurez de l\'entrejambe jusqu\'au sol, pieds nus.' }
];

export default function SizeGuide() {
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
          .size-table th, .size-table td { padding: 0.75rem 0.75rem !important; font-size: 0.85rem !important; }
        }
        @media (max-width: 420px) {
          .static-hero { padding: 1.5rem 0.75rem 1.25rem !important; }
          .static-hero-title { font-size: 1.3rem !important; }
          .static-main { padding: 1rem 0.75rem 1rem !important; }
          .static-h2 { font-size: 1.2rem !important; }
          .static-card { padding: 1rem !important; }
          .static-cta { padding: 2rem 1rem !important; }
          .static-cta-title { font-size: 1.3rem !important; }
          .size-table th, .size-table td { padding: 0.5rem 0.5rem !important; font-size: 0.75rem !important; }
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
          📐 Guide des tailles
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          Trouvez votre taille parfaite
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          Pour un ajustement impeccable avec notre cabine d'essayage virtuel, suivez ces étapes simples pour prendre vos mesures.
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Comment prendre vos mesures
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Pour garantir un ajustement parfait avec notre cabine d'essayage virtuel, veuillez suivre ces étapes simples :
          </p>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {measures.map(m => (
              <div key={m.title} className="static-card" style={{
                background: '#fff', borderRadius: '14px', padding: '1.75rem',
                boxShadow: '0 10px 28px rgba(26,26,26,0.08)',
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                <div className="static-card-title" style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                  fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  {m.icon} {m.title}
                </div>
                <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            💡 Conseil : pour plus de précision, demandez à quelqu'un de vous aider à prendre vos mesures.
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Tableau des tailles
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1.5rem' }}>
            Toutes les mesures sont en centimètres (cm).
          </p>
          <div style={{ overflowX: 'auto', borderRadius: '14px' }}>
            <table className="size-table" style={{
              width: '100%', borderCollapse: 'collapse',
              background: '#fff', borderRadius: '14px',
              overflow: 'hidden', boxShadow: '0 10px 28px rgba(26,26,26,0.08)'
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    Taille
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    Poitrine (cm)
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    Taille (cm)
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    Hanches (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(r => (
                  <tr key={r.s}>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A'
                    }}>
                      {r.s}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {r.chest}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {r.waist}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {r.hip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            Ces mesures sont indicatives. Pour un ajustement optimal, utilisez notre fonctionnalité d'essayage virtuel.
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Entre deux tailles ?
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            Si vos mesures se situent entre deux tailles, voici nos recommandations :
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Pour les hauts et robes : choisissez la taille supérieure si votre poitrine est plus grande.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              Pour les pantalons et jupes : choisissez la taille supérieure si vos hanches sont plus grandes.
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ content: "''", width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              En cas de doute, n'hésitez pas à nous contacter pour un conseil personnalisé.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            Correspondances internationales
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: '14px' }}>
            <table className="size-table" style={{
              width: '100%', borderCollapse: 'collapse',
              background: '#fff', borderRadius: '14px',
              overflow: 'hidden', boxShadow: '0 10px 28px rgba(26,26,26,0.08)'
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    TryOn
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    France (FR)
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    UK
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    US
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    Italie (IT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '34', '6', '2', '38'],
                  ['S', '36', '8', '4', '40'],
                  ['M', '38', '10', '6', '42'],
                  ['L', '40', '12', '8', '44'],
                  ['XL', '42', '14', '10', '46'],
                  ['XXL', '44', '16', '12', '48']
                ].map(([s, fr, uk, us, it]) => (
                  <tr key={s}>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A'
                    }}>
                      {s}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {fr}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {uk}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {us}
                    </td>
                    <td style={{
                      padding: '1rem 1.25rem', fontSize: '0.9375rem',
                      color: '#6A6F78', borderBottom: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {it}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          Prêt pour un essayage parfait ?
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          Utilisez nos mesures pour trouver votre taille idéale dans notre cabine d'essayage virtuel.
        </p>
        <Link to="/tryon" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          ✨ Commencer l'essayage
        </Link>
      </section>
    </div>
  );
}