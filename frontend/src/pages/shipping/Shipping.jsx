import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


// ─── ICÔNES LUCIDE ───
import {
  ChevronLeft,
  Truck,
  MapPin,
  Clock,
  Home,
  Package,
  Check,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react';

function getZones(t) {
  return [
    t('shipping.zones.list.douala'),
    t('shipping.zones.list.yaounde'),
    t('shipping.zones.list.bafoussam'),
    t('shipping.zones.list.garoua'),
    t('shipping.zones.list.maroua'),
    t('shipping.zones.list.bamenda'),
    t('shipping.zones.list.other'),
  ];
}

export default function Shipping() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const zones = getZones(t);

  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
          .static-grid-2 { grid-template-columns: 1fr !important; }
          .static-back-btn { width: 40px !important; height: 40px !important; }
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
          .static-back-btn { width: 36px !important; height: 36px !important; }
        }
        @media (max-width: 420px) {
          .static-hero { padding: 1.5rem 0.75rem 1.25rem !important; }
          .static-hero-title { font-size: 1.3rem !important; }
          .static-main { padding: 1rem 0.75rem 1rem !important; }
          .static-h2 { font-size: 1.2rem !important; }
          .static-card { padding: 1rem !important; }
          .static-cta { padding: 2rem 1rem !important; }
          .static-cta-title { font-size: 1.3rem !important; }
          .static-back-btn { width: 32px !important; height: 32px !important; }
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
          onClick={() => navigate(-1)}
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
          <Truck size={14} strokeWidth={2} />
          {t('shipping.badge')}
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          {t('shipping.heroTitle')}
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          {t('shipping.heroSubtitle')}
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        {/* Zones */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <MapPin size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('shipping.zones.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {zones.map(z => (
              <li key={z} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
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
            <Package size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('shipping.zones.note')}
          </div>
        </section>

        {/* Délais */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Clock size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('shipping.delays.title')}
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
                <Truck size={20} strokeWidth={1.8} />
                {t('shipping.delays.standard.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.delays.standard.main')}
              </p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.delays.standard.remote')}
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
                <Clock size={20} strokeWidth={1.8} />
                {t('shipping.delays.express.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.delays.express.main')}
              </p>
              <p className="static-card-text" style={{ marginTop: '0.5rem', opacity: 0.75, fontSize: '0.875rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.delays.express.other')}
              </p>
            </div>
          </div>
        </section>

        {/* Frais */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('shipping.fees.title')}
          </h2>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="static-card-accent" style={{
              background: '#DDE8F3', borderRadius: '14px', padding: '1.75rem'
            }}>
              <div className="static-card-accent-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#355C86', marginBottom: '0.75rem'
              }}>
                <Truck size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {t('shipping.fees.standard.title')}
              </div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: '1.65' }}>
                {t('shipping.fees.standard.free')}
              </p>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.fees.standard.paid')}
              </p>
            </div>
            <div className="static-card-accent" style={{
              background: '#DDE8F3', borderRadius: '14px', padding: '1.75rem'
            }}>
              <div className="static-card-accent-title" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem',
                fontWeight: 600, color: '#355C86', marginBottom: '0.75rem'
              }}>
                <Clock size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {t('shipping.fees.express.title')}
              </div>
              <p className="static-card-text" style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: '1.65' }}>
                {t('shipping.fees.express.paid')}
              </p>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('shipping.fees.express.free')}
              </p>
            </div>
          </div>
        </section>

        {/* Suivi */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Check size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('shipping.tracking.title')}
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('shipping.tracking.desc')}
          </p>
        </section>

        {/* Problèmes */}
        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('shipping.issues.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('shipping.issues.phoneLabel')} +237 671 207 375
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('shipping.issues.emailLabel')} tryon.douala@gmail.com
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
          {t('shipping.ctaTitle')}
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          {t('shipping.ctaSubtitle')}
        </p>
        <Link to="/catalogue" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <Package size={16} strokeWidth={2} />
          {t('shipping.ctaButton')}
        </Link>
      </section>
    </div>
  );
}