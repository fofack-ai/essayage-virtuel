import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader';

// ─── ICÔNES LUCIDE ───
import {
  Ruler,
  Scale,
  ArrowUpDown,
  Lightbulb,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

const sizes = [
  { s: 'XS', chest: '76–81', waist: '58–63', hip: '84–89' },
  { s: 'S', chest: '82–87', waist: '64–69', hip: '90–95' },
  { s: 'M', chest: '88–93', waist: '70–75', hip: '96–101' },
  { s: 'L', chest: '94–99', waist: '76–81', hip: '102–107' },
  { s: 'XL', chest: '100–105', waist: '82–87', hip: '108–113' },
  { s: 'XXL', chest: '106–111', waist: '88–93', hip: '114–119' }
];

function getMeasures(t) {
  return [
    { icon: Ruler, title: t('sizeGuide.measures.chest.title'), desc: t('sizeGuide.measures.chest.desc') },
    { icon: Ruler, title: t('sizeGuide.measures.waist.title'), desc: t('sizeGuide.measures.waist.desc') },
    { icon: Scale, title: t('sizeGuide.measures.hip.title'), desc: t('sizeGuide.measures.hip.desc') },
    { icon: ArrowUpDown, title: t('sizeGuide.measures.legLength.title'), desc: t('sizeGuide.measures.legLength.desc') }
  ];
}

export default function SizeGuide() {
  const { t } = useTranslation();
  const measures = getMeasures(t);

  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <MobileHeader />
      <style>{`
        /* ============================================================
           SIZE GUIDE — RESPONSIVE
        ============================================================ */
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
          .static-grid-2 { grid-template-columns: 1fr !important; }
          .static-back-btn { width: 40px !important; height: 40px !important; }
          .static-back-btn svg { width: 20px !important; height: 20px !important; }
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
          .static-card svg { width: 24px !important; height: 24px !important; }
          .static-cta { padding: 3rem 1.5rem !important; }
          .static-cta-title { font-size: 1.6rem !important; }
          .static-cta-sub { font-size: 0.9rem !important; }
          .static-cta-btn { padding: 0.75rem 1.5rem !important; font-size: 11px !important; }
          .static-cta-btn svg { width: 16px !important; height: 16px !important; }
          .size-table th, .size-table td { padding: 0.75rem 0.75rem !important; font-size: 0.85rem !important; }
          .static-back-btn { width: 36px !important; height: 36px !important; }
          .static-back-btn svg { width: 18px !important; height: 18px !important; }
        }
        @media (max-width: 420px) {
          .static-hero { padding: 1.5rem 0.75rem 1.25rem !important; }
          .static-hero-title { font-size: 1.3rem !important; }
          .static-main { padding: 1rem 0.75rem 1rem !important; }
          .static-h2 { font-size: 1.2rem !important; }
          .static-card { padding: 1rem !important; }
          .static-card svg { width: 20px !important; height: 20px !important; }
          .static-cta { padding: 2rem 1rem !important; }
          .static-cta-title { font-size: 1.3rem !important; }
          .size-table th, .size-table td { padding: 0.5rem 0.5rem !important; font-size: 0.75rem !important; }
          .static-back-btn { width: 32px !important; height: 32px !important; }
          .static-back-btn svg { width: 16px !important; height: 16px !important; }
        }
        .static-ul {
          list-style: none !important;
          padding: 0 !important;
        }
        .static-ul li {
          list-style: none !important;
        }
      `}</style>

      <section className="static-hero" style={{
        background: 'linear-gradient(135deg, #EEF3F8 0%, #DDE8F3 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        position: 'relative'
      }}>
        <button 
          className="static-back-btn"
          onClick={() => window.history.back()}
          style={{
            position: 'absolute', top: '20px', left: '20px',
            width: '44px', height: '44px', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
            cursor: 'pointer', boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        <div className="static-hero-badge" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(53,92,134,0.09)', color: '#26384D',
          border: '1px solid rgba(53,92,134,0.14)',
          fontSize: '10px', fontWeight: 600, letterSpacing: '2px',
          textTransform: 'uppercase', padding: '6px 16px',
          borderRadius: '50px', marginBottom: '1.25rem'
        }}>
          <Ruler size={14} strokeWidth={2} />
          {t('sizeGuide.badge')}
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          {t('sizeGuide.heroTitle')}
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          {t('sizeGuide.heroSubtitle')}
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Ruler size={22} strokeWidth={1.8} />
            {t('sizeGuide.measuring.title')}
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('sizeGuide.measuring.intro')}
          </p>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {measures.map(m => {
              const Icon = m.icon;
              return (
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
                    <Icon size={24} strokeWidth={1.8} color="#355C86" />
                    {m.title}
                  </div>
                  <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Lightbulb size={16} strokeWidth={2} color="#355C86" />
            {t('sizeGuide.measuring.tip')}
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Scale size={22} strokeWidth={1.8} />
            {t('sizeGuide.table.title')}
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1.5rem' }}>
            {t('sizeGuide.table.subtitle')}
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
                    {t('sizeGuide.table.headers.size')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.table.headers.chest')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.table.headers.waist')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.table.headers.hip')}
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
            <Sparkles size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('sizeGuide.table.note')}
          </div>
        </section>

        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('sizeGuide.between.title')}
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('sizeGuide.between.intro')}
          </p>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('sizeGuide.between.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('sizeGuide.between.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('sizeGuide.between.item3')}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('sizeGuide.international.title')}
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
                    {t('sizeGuide.international.headers.tryon')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.international.headers.fr')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.international.headers.uk')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.international.headers.us')}
                  </th>
                  <th style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#355C86', background: '#DDE8F3',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {t('sizeGuide.international.headers.it')}
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
          {t('sizeGuide.ctaTitle')}
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          {t('sizeGuide.ctaSubtitle')}
        </p>
        <Link to="/tryon" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <Sparkles size={16} strokeWidth={2} />
          {t('sizeGuide.ctaButton')}
        </Link>
      </section>
    </div>
  );
}