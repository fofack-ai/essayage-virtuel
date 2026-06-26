import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleCancel = () => {
    // On annule : on remet les valeurs actuelles du compte, pas celles tapées
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setError('');
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(profileData);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid rgba(26,26,26,0.12)',
    borderRadius: 10,
    fontSize: 14,
  };
  const labelStyle = { display: 'block', marginBottom: 8, fontWeight: 600, color: '#1A1A1A', fontSize: 14 };

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,36px)', fontWeight: 300, marginBottom: 16, color: '#1A1A1A' }}>
            Mon profil
          </h1>
          <p style={{ color: '#6A6F78', fontSize: 15, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Gérez vos informations personnelles et vos préférences de compte.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#B91C1C', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#065F46', fontSize: 14 }}>
            ✅ {success}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

          {!isEditing ? (
            /* ── MODE LECTURE ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3.5vw,26px)', fontWeight: 300, color: '#1A1A1A' }}>
                  Mes informations
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#F3F4F6',
                    color: '#1A1A1A',
                    border: '1.5px solid rgba(26,26,26,0.12)',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Modifier
                </button>
              </div>

              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#6A6F78', fontWeight: 500 }}>Prénom</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user.firstName || '—'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#6A6F78', fontWeight: 500 }}>Nom</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user.lastName || '—'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#6A6F78', fontWeight: 500 }}>Email</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user.email}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#6A6F78', fontWeight: 500 }}>Téléphone</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user.phone || 'Non renseigné'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                style={{ marginTop: 32, width: '100%', padding: '16px 24px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Se déconnecter
              </button>
            </>
          ) : (
            /* ── MODE ÉDITION ── */
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3.5vw,26px)', fontWeight: 300, marginBottom: 24, color: '#1A1A1A' }}>
                Modifier mes informations
              </h2>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Prénom</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Nom</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg,#B83228,#8E241D)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  style={{ flex: 1, padding: '16px 24px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}