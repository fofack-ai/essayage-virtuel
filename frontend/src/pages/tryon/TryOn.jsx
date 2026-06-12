import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { products, productImages } from '../../services/productService';

const T = {
  ink: '#1A1A1A', cream: '#F9F9F9', warm: '#F1F5F9', white: '#FFFFFF',
  red: '#C0392B', redDark: '#8E241D', blue: '#5B7FA6',
  blueDark: '#355C86', blueNavy: '#26384D', blueLight: '#E6EEF6',
  muted: '#6A6F78', border: 'rgba(26,26,26,0.105)',
};

export default function TryOn() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [adjustments, setAdjustments] = useState({ shoulders: 0, chest: 0, waist: 0, hips: 0 });
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const startAnalysis = () => {
    if (!photo) return;
    setStep(2); setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setStep(3); return 100; }
        return p + 4;
      });
    }, 80);
  };

  const analysisSteps = [
    { label: 'Détection du corps', done: progress >= 25 },
    { label: 'Analyse morphologique', done: progress >= 50 },
    { label: 'Calcul des mensurations', done: progress >= 75 },
    { label: 'Score de compatibilité', done: progress >= 100 },
  ];

  const scores = [
    { product: products[0], score: 94, img: productImages[0] },
    { product: products[1], score: 89, img: productImages[1] },
    { product: products[2], score: 91, img: productImages[2] },
    { product: products[4], score: 87, img: productImages[4] },
  ];

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: `radial-gradient(circle at 10% 8%, rgba(91,127,166,0.10), transparent 30%), linear-gradient(180deg,#F9F9F9,#F3F6FA)` }}>

      {/* HEADER */}
      <div style={{ padding: '56px 80px 40px', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: T.blueDark }}>
          <span style={{ color: T.red }}>✦</span> Technologie IA
        </span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: T.ink, marginTop: '10px', lineHeight: 1.1 }}>
          Cabine d'essayage <em style={{ fontStyle: 'italic', color: T.red }}>virtuelle</em>
        </h1>
        <p style={{ color: T.muted, marginTop: '12px', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
          Uploadez votre photo et notre IA analyse votre morphologie pour vous recommander les tailles et coupes idéales.
        </p>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '36px' }}>
          {[{ n: 1, label: 'Photo' }, { n: 2, label: 'Analyse' }, { n: 3, label: 'Résultats' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step >= s.n ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : T.blueLight,
                  color: step >= s.n ? '#fff' : T.blueDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  boxShadow: step >= s.n ? '0 8px 20px rgba(192,57,43,0.20)' : 'none',
                }}>{s.n}</div>
                <span style={{ fontSize: '13px', fontWeight: step === s.n ? 600 : 400, color: step >= s.n ? T.ink : T.muted }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ height: '2px', width: '48px', background: step > s.n ? `linear-gradient(90deg, ${T.red}, ${T.blueDark})` : T.border, borderRadius: '2px' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '48px 80px 80px' }}>

        {/* STEP 1 : UPLOAD + CONSEILS */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, marginBottom: '24px' }}>Votre photo</h2>
              <div
                onClick={() => !photo && fileRef.current.click()}
                onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                style={{
                  border: `2px dashed ${photo ? T.red : 'rgba(26,26,26,0.20)'}`,
                  borderRadius: '18px', background: photo ? 'rgba(192,57,43,0.03)' : T.white,
                  minHeight: '380px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: photo ? 'default' : 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="preview" style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '16px' }} />
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{
                      position: 'absolute', top: '14px', right: '14px',
                      background: 'rgba(26,26,26,0.7)', color: '#fff', border: 'none',
                      borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                      fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p style={{ fontWeight: 500, color: T.ink, marginBottom: '8px' }}>Glissez votre photo ici</p>
                    <p style={{ fontSize: '13px', color: T.muted, marginBottom: '20px' }}>ou cliquez pour parcourir</p>
                    <span style={{ fontSize: '11px', color: T.blueDark, background: T.blueLight, padding: '4px 12px', borderRadius: '100px' }}>
                      JPG, PNG — Max 10 Mo
                    </span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              {photo && (
                <button onClick={startAnalysis} style={{
                  width: '100%', marginTop: '20px',
                  background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                  color: '#fff', border: 'none', borderRadius: '12px',
                  padding: '18px', fontSize: '14px', fontWeight: 500,
                  letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}>
                  Lancer l'analyse IA →
                </button>
              )}
            </div>

            {/* Conseils pour une bonne photo */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, marginBottom: '24px' }}>Conseils pour une bonne photo</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🧍', title: 'Position de face', desc: 'Tenez-vous debout, bras légèrement écartés du corps.' },
                  { icon: '👕', title: 'Tenue ajustée', desc: 'Portez des vêtements près du corps pour une analyse précise.' },
                  { icon: '💡', title: 'Bonne luminosité', desc: 'Choisissez un fond clair et un éclairage naturel.' },
                  { icon: '📏', title: 'Photo entière', desc: "De la tête aux pieds, avec 10 cm d'espace autour." },
                ].map((tip, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    background: T.white, borderRadius: '14px',
                    padding: '20px', border: `1px solid ${T.border}`,
                    boxShadow: '0 12px 34px rgba(26,26,26,0.075)',
                  }}>
                    <span style={{ fontSize: '24px' }}>{tip.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>{tip.title}</div>
                      <div style={{ fontSize: '13px', color: T.muted, lineHeight: 1.6 }}>{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '24px', padding: '24px',
                background: T.blueLight, borderRadius: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '13px', color: T.muted, marginBottom: '12px' }}>Pas de photo ? Utilisez votre webcam</div>
                <button style={{
                  background: `linear-gradient(135deg, ${T.blueDark}, ${T.blueNavy})`,
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px 24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  Activer la webcam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 : ANALYSE */}
        {step === 2 && (
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.blueLight}, ${T.blueDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', animation: 'spin 2s linear infinite',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M12 2a10 10 0 1 0 10 10"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300 }}>Analyse en cours…</h2>
            <p style={{ color: T.muted, marginBottom: '40px' }}>Notre IA analyse votre morphologie</p>
            <div style={{ background: T.blueLight, borderRadius: '100px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '100px',
                background: `linear-gradient(90deg, ${T.red}, ${T.blueDark})`,
                width: `${progress}%`, transition: 'width .2s ease',
              }} />
            </div>
            <div style={{ fontSize: '13px', color: T.red, marginBottom: '40px', fontWeight: 600 }}>{progress}%</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              {analysisSteps.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '12px',
                  background: s.done ? T.blueLight : T.white,
                  border: `1px solid ${s.done ? 'rgba(53,92,134,0.30)' : T.border}`,
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: s.done ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : 'rgba(26,26,26,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: s.done ? 500 : 400, color: s.done ? T.ink : T.muted }}>{s.label}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* STEP 3 : RÉSULTATS AVEC PANNEAU LATéral COMPLET (conforme image) */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '48px', alignItems: 'start' }}>
            {/* Colonne gauche : photo + mensurations */}
            <div>
              <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
                  : <div style={{ height: '380px', background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '64px' }}>🧍</span></div>
                }
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'rgba(249,249,249,0.96)', backdropFilter: 'blur(10px)',
                  borderRadius: '12px', padding: '10px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '10px', color: T.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Score IA</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: T.red, lineHeight: 1 }}>94%</div>
                </div>
              </div>

              <div style={{ background: T.white, borderRadius: '16px', border: `1px solid ${T.border}`, padding: '24px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, marginBottom: '20px' }}>Mensurations détectées</h3>
                {[
                  { label: 'Épaules', val: '42', key: 'shoulders' },
                  { label: 'Poitrine', val: '94', key: 'chest' },
                  { label: 'Taille', val: '76', key: 'waist' },
                  { label: 'Hanches', val: '102', key: 'hips' },
                ].map(m => (
                  <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: '13px', color: T.muted }}>{m.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setAdjustments(a => ({ ...a, [m.key]: a[m.key] - 1 }))} style={adjBtnStyle}>−</button>
                      <span style={{ fontSize: '14px', fontWeight: 500, minWidth: '56px', textAlign: 'center' }}>
                        {parseInt(m.val) + adjustments[m.key]} cm
                      </span>
                      <button onClick={() => setAdjustments(a => ({ ...a, [m.key]: a[m.key] + 1 }))} style={adjBtnStyle}>+</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setAdjustments({ shoulders: 0, chest: 0, waist: 0, hips: 0 })} style={{
                  width: '100%', marginTop: '8px',
                  background: T.blueLight, color: T.blueDark,
                  border: `1px solid rgba(53,92,134,0.30)`,
                  borderRadius: '10px', padding: '12px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}>Réinitialiser</button>
              </div>

              <button onClick={() => { setStep(1); setPhoto(null); setPhotoPreview(null); setProgress(0); }} style={{
                width: '100%', marginTop: '16px', background: 'transparent', color: T.muted,
                border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px',
                fontSize: '13px', cursor: 'pointer',
              }}>← Nouvelle photo</button>
            </div>

            {/* Panneau latéral droit (exactement comme sur l'image) */}
            <div style={{ background: T.white, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>

              {/* ARTICLE SÉLECTIONNÉ */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Article sélectionné</div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '60px', height: '75px', borderRadius: '12px',
                    background: `linear-gradient(145deg, #F8F9FB, #E9EFF6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                  }}>👗</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '2px' }}>Robe Évasée Florale</div>
                    <div style={{ fontSize: '12px', color: T.muted }}>Collection Printemps 2025</div>
                    <div style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, marginTop: '4px' }}>15 000 FCFA</div>
                  </div>
                </div>
              </div>

              {/* TAILLE (boutons) */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Taille</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['XS','S','M','L','XL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                      padding: '8px 16px', borderRadius: '100px', border: `1.5px solid ${selectedSize === s ? T.blueDark : T.border}`,
                      background: selectedSize === s ? T.blueDark : 'transparent',
                      color: selectedSize === s ? '#fff' : T.ink,
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* SCORE DE COMPATIBILITÉ IA */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Score de compatibilité IA</div>
                <div style={{ background: `linear-gradient(135deg, ${T.blueDark}, ${T.ink})`, borderRadius: '18px', padding: '20px', color: '#fff' }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Correspondance morphologique</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, lineHeight: 1 }}>94%</div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>Excellente compatibilité</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: `linear-gradient(90deg, ${T.red}, ${T.blue})`, borderRadius: '2px' }} />
                  </div>
                </div>
              </div>

              {/* RECOMMANDATIONS IA */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Recommandations IA</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ fontSize: '13px', color: T.muted, marginBottom: '10px', display: 'flex', gap: '8px' }}><span style={{ color: T.red }}>→</span> Convient parfaitement à votre morphologie</li>
                  <li style={{ fontSize: '13px', color: T.muted, marginBottom: '10px', display: 'flex', gap: '8px' }}><span style={{ color: T.red }}>→</span> Taille M recommandée selon vos mesures</li>
                  <li style={{ fontSize: '13px', color: T.muted, marginBottom: '10px', display: 'flex', gap: '8px' }}><span style={{ color: T.red }}>→</span> La couleur or valorise votre teint</li>
                  <li style={{ fontSize: '13px', color: T.muted, marginBottom: '10px', display: 'flex', gap: '8px' }}><span style={{ color: T.red }}>→</span> Accessoirisez avec une ceinture fine</li>
                </ul>
              </div>

              {/* BOUTON AJOUTER AU PANIER */}
              <div style={{ padding: '24px' }}>
                <button style={{
                  width: '100%', padding: '18px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                  color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600,
                  letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  Ajouter au panier — 15 000 FCFA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const adjBtnStyle = {
  width: '28px', height: '28px', borderRadius: '8px',
  background: '#E6EEF6', border: '1px solid rgba(53,92,134,0.20)',
  cursor: 'pointer', fontSize: '16px', fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#355C86',
};