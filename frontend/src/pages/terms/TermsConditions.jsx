import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ─── ICÔNES LUCIDE ───
import {
  ChevronLeft,
  FileText,
  Home,
  Check,
  Shield,
  ShoppingBag,
  Truck,
  CreditCard,
  Package,
  RotateCcw,
  Scale,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

function getSections(t) {
  return [
    {
      title: t('terms.sections.acceptance.title'),
      icon: Check,
      content: (
        <>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('terms.sections.acceptance.p1')}
          </p>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            {t('terms.sections.acceptance.note')}
          </div>
        </>
      )
    },
    {
      title: t('terms.sections.products.title'),
      icon: ShoppingBag,
      content: (
        <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.products.item1')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.products.item2')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.products.item3')}
          </li>
        </ul>
      )
    },
    {
      title: t('terms.sections.order.title'),
      icon: Package,
      content: (
        <ol className="static-ol" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', counterReset: 'step-counter' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
            {t('terms.sections.order.step1')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
            {t('terms.sections.order.step2')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
            {t('terms.sections.order.step3')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
            {t('terms.sections.order.step4')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: '#355C86', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>5</span>
            {t('terms.sections.order.step5')}
          </li>
        </ol>
      )
    },
    {
      title: t('terms.sections.payment.title'),
      icon: CreditCard,
      content: (
        <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.payment.item1')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.payment.item2')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.payment.item3')}
          </li>
        </ul>
      )
    },
    {
      title: t('terms.sections.shipping.title'),
      icon: Truck,
      content: (
        <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.shipping.item1')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.shipping.item2')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.shipping.item3')}
          </li>
        </ul>
      )
    },
    {
      title: t('terms.sections.returns.title'),
      icon: RotateCcw,
      content: (
        <>
          <p className="static-p" style={{ fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.75', marginBottom: '1rem' }}>
            {t('terms.sections.returns.p1')}
          </p>
          <div className="static-note" style={{
            fontSize: '0.875rem', color: '#6A6F78', fontStyle: 'italic',
            padding: '1rem 1.25rem', background: 'rgba(53,92,134,0.05)',
            borderRadius: '10px', borderLeft: '3px solid rgba(53,92,134,0.25)',
            marginTop: '1rem'
          }}>
            {t('terms.sections.returns.noteBefore')} <Link to="/returns" style={{ color: '#355C86' }}>{t('terms.sections.returns.noteLinkText')}</Link>.
          </div>
        </>
      )
    },
    {
      title: t('terms.sections.warranty.title'),
      icon: Shield,
      content: (
        <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.warranty.item1')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            {t('terms.sections.warranty.item2')}
          </li>
        </ul>
      )
    },
    {
      title: t('terms.sections.contact.title'),
      icon: Mail,
      content: (
        <ul className="static-ul" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            <Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {t('terms.sections.contact.emailLabel')} <strong>tryon.douala@gmail.com</strong>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            <MapPin size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {t('terms.sections.contact.addressLabel')} {t('terms.sections.contact.addressValue')}
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#6A6F78', lineHeight: '1.65' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#355C86', flexShrink: 0, marginTop: '0.55rem' }} />
            <Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            {t('terms.sections.contact.phoneLabel')} +237 671 207 375
          </li>
        </ul>
      )
    }
  ];
}

export default function TermsConditions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sections = getSections(t);

  return (
    <div className="static-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F9F9F9' }}>
      <style>{`
        @media (max-width: 900px) {
          .static-hero { padding: 3rem 1.5rem 2.5rem !important; }
          .static-hero-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
          .static-main { padding: 2.5rem 1.5rem 2rem !important; }
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
          .static-ol li { font-size: 0.9rem !important; }
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
          <FileText size={14} strokeWidth={2} />
          {t('terms.badge')}
        </div>
        <h1 className="static-hero-title" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 600, color: '#1A1A1A',
          marginBottom: '1rem', lineHeight: '1.1'
        }}>
          {t('terms.heroTitle')}
        </h1>
        <p className="static-hero-sub" style={{
          fontSize: '1rem', color: '#6A6F78',
          maxWidth: '560px', margin: '0 auto', lineHeight: '1.7'
        }}>
          {t('terms.heroSubtitle')}
        </p>
      </section>

      <main className="static-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 3rem' }}>
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <section key={s.title} className={i < sections.length - 1 ? 'static-section' : ''} style={i < sections.length - 1 ? { marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)' } : {}}>
              <h2 className="static-h2" style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem',
                fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem',
                paddingLeft: '1rem', borderLeft: '3px solid #355C86',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Icon size={20} strokeWidth={1.8} />
                {s.title}
              </h2>
              {s.content}
            </section>
          );
        })}
      </main>

      <section className="static-cta" style={{
        background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
        color: '#fff', textAlign: 'center', padding: '5rem 2rem'
      }}>
        <h2 className="static-cta-title" style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem',
          fontWeight: 600, marginBottom: '1rem', lineHeight: '1.2'
        }}>
          {t('terms.ctaTitle')}
        </h2>
        <p className="static-cta-sub" style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2.5rem' }}>
          {t('terms.ctaSubtitle')}
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
          {t('terms.ctaButton')}
        </Link>
      </section>
    </div>
  );
}