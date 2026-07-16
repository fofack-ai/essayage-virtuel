import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import de useTranslation
import MobileHeader from '../../components/layout/MobileHeader';

// ─── ICÔNES LUCIDE ───
import {
  ChevronLeft,
  Lock,
  Shield,
  Home,
  Eye,
  Server,
  Mail,
  Phone,
  MapPin,
  Cookie,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialisation de la traduction

  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <MobileHeader />
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
          .static-grid-2 { grid-template-columns: 1fr !important; }
          .static-grid-3 { grid-template-columns: 1fr 1fr !important; }
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
          .static-h3 { font-size: 1.1rem !important; }
          .static-p { font-size: 0.9rem !important; }
          .static-ul li { font-size: 0.9rem !important; }
          .static-card { padding: 1.25rem !important; }
          .static-card-title { font-size: 1.05rem !important; }
          .static-cta { padding: 3rem 1.5rem !important; }
          .static-cta-title { font-size: 1.6rem !important; }
          .static-cta-sub { font-size: 0.9rem !important; }
          .static-cta-btn { padding: 0.75rem 1.5rem !important; font-size: 11px !important; }
          .static-grid-3 { grid-template-columns: 1fr !important; }
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
        /* Supprimer les puces par défaut */
        .static-ul {
          list-style: none !important;
          padding: 0 !important;
        }
        .static-ul li {
          list-style: none !important;
        }
        .static-ol {
          list-style: none !important;
          padding: 0 !important;
          counter-reset: step-counter;
        }
        .static-ol li {
          list-style: none !important;
          counter-increment: step-counter;
        }
        .static-ol li::before {
          content: counter(step-counter);
          min-width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #355C86;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-right: 12px;
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
          <Lock size={14} strokeWidth={2} />
          {t('privacyPolicy.badge')}
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          {t('privacyPolicy.heroTitle')}
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          {t('privacyPolicy.heroSubtitle')}
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        
        {/* Introduction */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('privacyPolicy.sections.introduction.title')}
          </h2>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('privacyPolicy.sections.introduction.p1')}
          </p>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            <Shield size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.introduction.consentNote')}
          </div>
        </section>

        {/* Informations collectées */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Eye size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.collectedInfo.title')}
          </h2>
          <h3 className="static-h3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem', marginTop: '1rem' }}>
            <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.collectedInfo.personal.title')}
          </h3>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.personal.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.personal.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.personal.item3')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.personal.item4')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.personal.item5')}
            </li>
          </ul>
          <h3 className="static-h3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
            <Server size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.collectedInfo.technical.title')}
          </h3>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.technical.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.collectedInfo.technical.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Cookie size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.collectedInfo.technical.item3')}
            </li>
          </ul>
        </section>

        {/* Utilisation */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('privacyPolicy.sections.usage.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.usage.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.usage.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.usage.item3')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.usage.item4')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.usage.item5')}
            </li>
          </ul>
        </section>

        {/* Sécurité */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Shield size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.security.title')}
          </h2>
          <div className="static-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
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
                <Lock size={20} strokeWidth={1.8} />
                {t('privacyPolicy.sections.security.card1.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('privacyPolicy.sections.security.card1.desc')}
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
                <Shield size={20} strokeWidth={1.8} />
                {t('privacyPolicy.sections.security.card2.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('privacyPolicy.sections.security.card2.desc')}
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
                <Eye size={20} strokeWidth={1.8} />
                {t('privacyPolicy.sections.security.card3.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('privacyPolicy.sections.security.card3.desc')}
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
                <Users size={20} strokeWidth={1.8} />
                {t('privacyPolicy.sections.security.card4.title')}
              </div>
              <p className="static-card-text" style={{ fontSize: '0.9375rem', color: '#6A6F78', lineHeight: '1.65' }}>
                {t('privacyPolicy.sections.security.card4.desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Droits */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            {t('privacyPolicy.sections.rights.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Eye size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.rights.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Edit size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.rights.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Trash2 size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.rights.item3')}
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="static-section" style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Cookie size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.cookies.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.cookies.item1')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.cookies.item2')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              {t('privacyPolicy.sections.cookies.item3')}
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="static-h2" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
            fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
            paddingLeft: '1rem', borderLeft: '3px solid #355C86'
          }}>
            <Mail size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            {t('privacyPolicy.sections.contact.title')}
          </h2>
          <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.contact.emailLabel')} <strong>tryon.douala@gmail.com</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.contact.addressLabel')} {t('privacyPolicy.sections.contact.addressValue')}
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
              <Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {t('privacyPolicy.sections.contact.phoneLabel')} +237 671 207 375
            </li>
          </ul>
        </section>
      </main>

      {/* CTA */}
      <section className="static-cta" style={{
        background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
        color: '#fff', textAlign: 'center', padding: '5rem 2rem'
      }}>
        <h2 className="static-cta-title" style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem',
          fontWeight: 600, marginBottom: '1rem', lineHeight: '1.2'
        }}>
          {t('privacyPolicy.cta.title')}
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          {t('privacyPolicy.cta.subtitle')}
        </p>
        <Link to="/" className="static-cta-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#fff', color: '#355C86', padding: '0.875rem 2.5rem',
          borderRadius: '50px', fontSize: '12px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'all 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <Home size={16} strokeWidth={2} />
          {t('privacyPolicy.cta.backHome')}
        </Link>
      </section>
    </div>
  );
}