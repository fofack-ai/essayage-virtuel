import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Load user data from context or API
    if (user) {
      setProfileData({
        firstName: user.prenom || '',
        lastName: user.nom || '',
        email: user.email || '',
        phone: user.telephone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would send this data to an update profile endpoint
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profil mis à jour avec succès !');
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

  return (
    <div className="profile-page" style={{ paddingTop: 72, minHeight: '100vh' }}>
      <div className="profile-container" style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', paddingBottom: 80 }}>
        {/* Header */}
        <div className="profile-header" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px,4vw,36px)',
            fontWeight: 300,
            marginBottom: 16,
            color: '#1A1A1A'
          }}>
            Mon profil
          </h1>
          <p style={{
            color: '#6A6F78',
            fontSize: 15,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Gérez vos informations personnelles et vos préférences de compte.
          </p>
        </div>

        {/* Status messages */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            color: '#B91C1C',
            fontSize: 14
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            color: '#065F46',
            fontSize: 14
          }}>
            ✅ {success}
          </div>
        )}

        {/* Profile form */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: 14
            }}>Prénom</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid rgba(26,26,26,0.12)',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={() => {}}
              onBlur={() => {}}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: 14
            }}>Nom</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid rgba(26,26,26,0.12)',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: 14
            }}>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid rgba(26,26,26,0.12)',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: 14
            }}>Téléphone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1.5px solid rgba(26,26,26,0.12)',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Current user info */}
          <div className="current-info" style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F1F5F9' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(24px,3.5vw,28px)',
              fontWeight: 300,
              marginBottom: 16,
              color: '#1A1A1A'
            }}>
              Informations actuelles
            </h2>
            <div className="info-items" style={{ display: 'grid', gap: 16 }}>
              <div className="info-item">
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: 12,
                  color: '#6A6F78',
                  fontWeight: 500
                }}>Nom complet</p>
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1A1A1A'
                }}>
                  {user.prenom} {user.nom}
                </p>
              </div>
              <div className="info-item">
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: 12,
                  color: '#6A6F78',
                  fontWeight: 500
                }}>Email</p>
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1A1A1A'
                }}>
                  {user.email}
                </p>
              </div>
              <div className="info-item">
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: 12,
                  color: '#6A6F78',
                  fontWeight: 500
                }}>Téléphone</p>
                <p style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1A1A1A'
                }}>
                  {user.telephone || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="form-actions" style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: 'linear-gradient(135deg,#B83228,#8E241D)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            <button
              type="button"
              onClick={logout}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}