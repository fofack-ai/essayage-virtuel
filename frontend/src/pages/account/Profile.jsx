import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Helpers ── */
const Row = ({ icon, label, right, onClick, to, chevron = true, danger = false }) => {
  const style = {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '15px 20px', cursor: onClick || to ? 'pointer' : 'default',
    transition: 'background 0.15s',
    color: danger ? '#C0392B' : '#1A1A1A',
    textDecoration: 'none', background: 'transparent',
    border: 'none', width: '100%', textAlign: 'left',
    fontSize: '0.9375rem', fontFamily: "'DM Sans', sans-serif",
  };
  const iconBox = {
    width: 36, height: 36, borderRadius: 10,
    background: danger ? 'rgba(192,57,43,0.08)' : 'rgba(53,92,134,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', flexShrink: 0,
  };
  const inner = (
    <>
      <div style={iconBox}>{icon}</div>
      <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
      {right && <span style={{ fontSize: '0.875rem', color: '#6A6F78' }}>{right}</span>}
      {chevron && !right && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={danger ? '#C0392B' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  );

  if (to) return <Link to={to} style={style} onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.025)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} style={style} onMouseEnter={e => e.currentTarget.style.background=danger?'rgba(192,57,43,0.04)':'rgba(0,0,0,0.025)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{inner}</button>;
  return <div style={{ ...style, cursor: 'default' }}>{inner}</div>;
};

const Group = ({ title, children }) => (
  <div className="profile-group" style={{ marginBottom: '1.5rem' }}>
    <p className="profile-group-title" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9CA3AF', margin: '0 0 8px 4px' }}>
      {title}
    </p>
    <div className="profile-group-card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
      {React.Children.map(children, (child, i) => (
        <>
          {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 20px' }} />}
          {child}
        </>
      ))}
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid rgba(26,26,26,0.1)', borderRadius: '12px',
  fontSize: '0.9375rem', fontFamily: "'DM Sans', sans-serif",
  background: '#F8F9FA', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', marginBottom: '6px', fontSize: '13px',
  fontWeight: 600, color: '#374151',
};

/* ── Main Component ── */
export default function Profile() {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [editOpen, setEditOpen]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profil mis à jour avec succès !');
      setEditOpen(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
    setError(''); setEditOpen(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) { navigate('/auth'); return null; }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
  const initial  = fullName.charAt(0).toUpperCase();
  const role     = isAdmin ? 'Administrateur' : 'Client';

  const quickActions = [
    { icon: '📦', label: 'Commandes', to: '/orders' },
    { icon: '✨', label: 'Essayage',  to: '/tryon'  },
    { icon: '🛒', label: 'Panier',    to: '/cart'   },
    isAdmin
      ? { icon: '⚙️', label: 'Admin', to: '/admin' }
      : { icon: '👤', label: 'Modifier', action: () => setEditOpen(true) },
  ];

  return (
    <div className="profile-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        /* ═══════════════════════════════════════
           RESPONSIVE — PROFIL
        ════════════════════════════════════════ */

        @media (max-width: 768px) {
          .profile-page {
            padding: 0 12px 80px !important;
          }
          .profile-hero {
            padding: 2rem 1.5rem 1.5rem !important;
          }
          .profile-avatar {
            width: 64px !important;
            height: 64px !important;
            font-size: 1.5rem !important;
          }
          .profile-hero h2 {
            font-size: 1.4rem !important;
          }
          .profile-actions-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }
          .profile-actions-grid a,
          .profile-actions-grid button {
            padding: 12px 6px !important;
            font-size: 10px !important;
          }
          .profile-actions-grid a div,
          .profile-actions-grid button div {
            font-size: 18px !important;
          }
        }

        @media (max-width: 600px) {
          .profile-page {
            padding: 0 10px 80px !important;
          }
          .profile-hero {
            padding: 1.5rem 1rem 1.2rem !important;
          }
          .profile-avatar {
            width: 56px !important;
            height: 56px !important;
            font-size: 1.3rem !important;
          }
          .profile-hero h2 {
            font-size: 1.2rem !important;
          }
          .profile-hero p {
            font-size: 12px !important;
          }
          .profile-hero span {
            font-size: 10px !important;
            padding: 3px 10px !important;
          }
          .profile-actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .profile-actions-grid a,
          .profile-actions-grid button {
            padding: 14px 8px !important;
            font-size: 11px !important;
            border-radius: 12px !important;
          }
          .profile-actions-grid a div,
          .profile-actions-grid button div {
            font-size: 20px !important;
          }
          .profile-group {
            margin-bottom: 1rem !important;
          }
          .profile-group .profile-group-title {
            font-size: 10px !important;
            margin-bottom: 6px !important;
          }
          .profile-group .profile-group-card {
            border-radius: 14px !important;
          }
          .profile-group .profile-group-card > div {
            padding: 12px 14px !important;
            font-size: 0.85rem !important;
          }
          .profile-group .profile-group-card > div > div:first-child {
            width: 30px !important;
            height: 30px !important;
            font-size: 14px !important;
          }
          .profile-group .profile-group-card > div > span {
            font-size: 0.85rem !important;
          }
          .profile-group .profile-group-card > div svg {
            width: 14px !important;
            height: 14px !important;
          }
          .profile-form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            padding: 16px !important;
          }
          .profile-form-grid .profile-field label {
            font-size: 11px !important;
            margin-bottom: 4px !important;
          }
          .profile-form-grid .profile-field input {
            padding: 10px 12px !important;
            font-size: 13px !important;
          }
          .profile-form-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .profile-form-actions button {
            padding: 12px !important;
            font-size: 12px !important;
          }
          .profile-alert {
            padding: 12px 14px !important;
            font-size: 13px !important;
            margin-bottom: 12px !important;
          }
          .profile-logout-btn {
            padding: 14px !important;
            font-size: 13px !important;
          }
          .profile-footer {
            font-size: 10px !important;
            margin-top: 20px !important;
          }
        }

        @media (max-width: 420px) {
          .profile-page {
            padding: 0 6px 80px !important;
          }
          .profile-hero {
            padding: 1.2rem 0.8rem 1rem !important;
          }
          .profile-avatar {
            width: 48px !important;
            height: 48px !important;
            font-size: 1rem !important;
          }
          .profile-hero h2 {
            font-size: 1rem !important;
          }
          .profile-hero p {
            font-size: 11px !important;
          }
          .profile-actions-grid {
            gap: 6px !important;
          }
          .profile-actions-grid a,
          .profile-actions-grid button {
            padding: 10px 4px !important;
            font-size: 10px !important;
            border-radius: 10px !important;
          }
          .profile-actions-grid a div,
          .profile-actions-grid button div {
            font-size: 16px !important;
          }
          .profile-group .profile-group-card > div {
            padding: 10px 12px !important;
            font-size: 0.8rem !important;
          }
          .profile-group .profile-group-card > div > div:first-child {
            width: 26px !important;
            height: 26px !important;
            font-size: 12px !important;
          }
          .profile-form-grid {
            padding: 12px !important;
          }
          .profile-form-grid .profile-field input {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }
          .profile-logout-btn {
            padding: 12px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px 80px' }}>

        {/* ── Hero card utilisateur ── */}
        <div className="profile-hero" style={{
          background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
          borderRadius: '0 0 28px 28px', padding: '2.5rem 2rem 2rem',
          textAlign: 'center', marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(26,38,56,0.18)',
        }}>
          {/* Avatar */}
          <div className="profile-avatar"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto 1rem",
              border: "3px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
              background: "linear-gradient(135deg, #355C86, #5B7FA6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user?.avatar || user?.picture ? (
              <img
                src={user.avatar || user.picture}
                alt={fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  color: "#fff",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2rem",
                  fontWeight: 600,
                }}
              >
                {initial}
              </span>
            )}
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '1.625rem',
            fontWeight: 600, color: '#fff', margin: '0 0 6px',
          }}>
            {fullName}
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 14px' }}>
            {user.email}
          </p>
          <span style={{
            display: 'inline-block', padding: '4px 14px',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
          }}>
            {role}
          </span>
        </div>

        {/* ── Alertes ── */}
        {success && (
          <div className="profile-alert" style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#065F46', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="profile-alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#B91C1C', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Actions rapides ── */}
        <div className="profile-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
          {quickActions.map(a => {
            const cardStyle = {
              background: '#fff', borderRadius: '14px', padding: '16px 8px',
              textAlign: 'center', textDecoration: 'none', color: '#1A1A1A',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
              cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            };
            const content = (
              <>
                <div style={{ fontSize: '22px' }}>{a.icon}</div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6A6F78' }}>{a.label}</span>
              </>
            );
            if (a.to) return (
              <Link key={a.label} to={a.to} style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.06)'; }}>
                {content}
              </Link>
            );
            return (
              <button key={a.label} type="button" onClick={a.action} style={{ ...cardStyle, border: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.06)'; }}>
                {content}
              </button>
            );
          })}
        </div>

        {/* ── COMPTE ── */}
        <Group title="Compte">
          <Row
            icon="👤"
            label="Modifier le profil"
            onClick={() => setEditOpen(!editOpen)}
          />

          {/* Formulaire d'édition inline */}
          {editOpen && (
            <div style={{ padding: '20px', background: '#F8F9FA', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <form onSubmit={handleSubmit}>
                <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="profile-field">
                    <label style={labelStyle}>Prénom</label>
                    <input
                      type="text" value={form.firstName} required
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor='#355C86'}
                      onBlur={e => e.target.style.borderColor='rgba(26,26,26,0.1)'}
                    />
                  </div>
                  <div className="profile-field">
                    <label style={labelStyle}>Nom</label>
                    <input
                      type="text" value={form.lastName} required
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor='#355C86'}
                      onBlur={e => e.target.style.borderColor='rgba(26,26,26,0.1)'}
                    />
                  </div>
                </div>
                <div className="profile-field" style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#355C86'}
                    onBlur={e => e.target.style.borderColor='rgba(26,26,26,0.1)'}
                  />
                </div>
                <div className="profile-field" style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Téléphone</label>
                  <input
                    type="tel" value={form.phone} placeholder="+237 6XX XXX XXX"
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#355C86'}
                    onBlur={e => e.target.style.borderColor='rgba(26,26,26,0.1)'}
                  />
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
                    Utilisé pour le suivi de livraison et les notifications commande.
                  </p>
                </div>
                <div className="profile-form-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit" disabled={isLoading}
                    style={{
                      flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
                      background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #1A1A1A, #355C86)',
                      color: '#fff', fontSize: '13px', fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button" onClick={handleCancel} disabled={isLoading}
                    style={{
                      flex: 1, padding: '13px', borderRadius: '12px',
                      border: '1.5px solid rgba(26,26,26,0.12)',
                      background: '#fff', color: '#374151', fontSize: '13px',
                      fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          <Row icon="📧" label="Email" right={user.email} chevron={false} />
          <Row icon="📱" label="Téléphone" right={user.phone || 'Non renseigné'} chevron={false} />
        </Group>

        {/* ── PRÉFÉRENCES ── */}
        <Group title="Préférences">
          <Row icon="🔔" label="Notifications" to="/notifications" />
        </Group>

        {/* ── SUPPORT ── */}
        <Group title="Support">
          <Row icon="❓" label="Centre d'aide" to="/help-center" />
          <Row icon="🔒" label="Politique de confidentialité" to="/privacy-policy" />
          <Row icon="📋" label="Conditions générales de vente" to="/terms" />
          <Row icon="🚚" label="Livraison" to="/shipping" />
          <Row icon="↩️" label="Retours" to="/returns" />
        </Group>

        {/* ── Se déconnecter ── */}
        <button
          type="button"
          onClick={handleLogout}
          className="profile-logout-btn"
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #C0392B, #8E241D)',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', letterSpacing: '0.5px',
            boxShadow: '0 6px 20px rgba(192,57,43,0.22)',
            transition: 'all 0.2s ease', fontFamily: "'DM Sans', sans-serif",
            marginTop: '0.5rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(192,57,43,0.30)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 20px rgba(192,57,43,0.22)'; }}
        >
          <span style={{ fontSize: '16px' }}>↪</span> Se déconnecter
        </button>

        <p className="profile-footer" style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', marginTop: '24px' }}>
          TryOn v1.0 — Plateforme de mode avec essayage virtuel
        </p>

      </div>
    </div>
  );
}