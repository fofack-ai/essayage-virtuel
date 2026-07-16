import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Clock, Phone, User } from 'lucide-react';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F9FA',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '16px',
    padding: '56px 48px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  iconRing: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#FFF8E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 28px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#B45309',
    marginBottom: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#1A1A1A',
    margin: '0 0 12px',
    lineHeight: 1.2,
    fontFamily: "'Cormorant Garamond', serif",
  },
  desc: {
    fontSize: '15px',
    color: '#6A6F78',
    lineHeight: 1.6,
    margin: '0 0 28px',
    maxWidth: '360px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: '#FFF8E8',
    color: '#92400E',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
    padding: '6px 14px',
    marginBottom: '32px',
    border: '1px solid #FDE68A',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#D97706',
    animation: 'pulse 2s infinite',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    margin: '0 0 28px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '36px',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#6A6F78',
  },
  iconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#F0F2F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.12)',
    background: 'transparent',
    color: '#1A1A1A',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s',
  },
};

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .maint-btn:hover { background: #F0F2F5 !important; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.card}>

          {/* Icône */}
          <div style={styles.iconRing}>
            <Settings size={32} color="#D97706" strokeWidth={1.5} />
          </div>

          {/* Titre */}
          <div style={styles.eyebrow}>{t('maintenance.eyebrow')}</div>
          <h1 style={styles.title}>{t('maintenance.title')}</h1>
          <p style={styles.desc}>
            {t('maintenance.description')}
          </p>

          {/* Badge statut */}
          <div style={styles.badge}>
            <span style={styles.dot} />
            {t('maintenance.statusBadge')}
          </div>

          <hr style={styles.divider} />

          {/* Infos */}
          <div style={styles.infoList}>
            <div style={styles.infoRow}>
              <div style={styles.iconWrap}>
                <Clock size={15} color="#6A6F78" strokeWidth={1.5} />
              </div>
              {t('maintenance.info.duration')}
            </div>
            <div style={styles.infoRow}>
              <div style={styles.iconWrap}>
                <Phone size={15} color="#6A6F78" strokeWidth={1.5} />
              </div>
              {t('maintenance.info.dataSafe')}
            </div>
            <div style={styles.infoRow}>
              <div style={styles.iconWrap}>
                <User size={15} color="#6A6F78" strokeWidth={1.5} />
              </div>
              {t('maintenance.info.adminOnly')}
            </div>
          </div>

          {/* Bouton */}
          <button
            className="maint-btn"
            style={styles.btn}
            onClick={() => navigate('/')}
          >
            {t('maintenance.backHome')}
          </button>

        </div>
      </div>
    </>
  );
}