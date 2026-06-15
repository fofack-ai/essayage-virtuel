import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { products, productImages } from '../../services/productService';
import { useCart } from '../../context/CartContext';

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
  const [tryonLaunched, setTryonLaunched] = useState(false);
  const [adjustments, setAdjustments] = useState({ shoulders: 0, chest: 0, waist: 0, hips: 0 });
  const fileRef = useRef();
  const { addItem } = useCart();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setTryonLaunched(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setTryonLaunched(false);
  };

  const startAnalysis = () => {
    if (!photo || !selectedSize) return;
    setStep(2);
    setProgress(0);
    setTryonLaunched(true);
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

const handleAddToCart = () => {
  const productImg = productImages[(selectedProduct.id - 1) % productImages.length];

  addItem({
    id: selectedProduct.id,
    name: selectedProduct.name,
    brand: selectedProduct.brand,
    category: selectedProduct.category,
    price: selectedProduct.price,
    emoji: selectedProduct.emoji,
    image: productImg,
    size: selectedSize,
    color: "Standard",
    qty: 1,
  });

  alert("Ajouté au panier !");
};

  const resetAll = () => {
    setStep(1);
    setPhoto(null);
    setPhotoPreview(null);
    setProgress(0);
    setTryonLaunched(false);
    setSelectedSize('M');
  };

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: `radial-gradient(circle at 10% 8%, rgba(91,127,166,0.10), transparent 30%), linear-gradient(180deg,#F9F9F9,#F3F6FA)` }}>

      {/* HEADER */}
      <div style={{ padding: '48px 80px 36px', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: T.blueDark }}>
          <span style={{ color: T.red }}>✦</span> Technologie IA
        </span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: T.ink, marginTop: '8px', lineHeight: 1.1 }}>
          Cabine d'essayage <em style={{ fontStyle: 'italic', color: T.red }}>virtuelle</em>
        </h1>
        <p style={{ color: T.muted, marginTop: '10px', fontSize: '14px', maxWidth: '480px', lineHeight: 1.7 }}>
          Uploadez votre photo, choisissez votre taille et lancez l'essayage IA pour voir le rendu en temps réel.
        </p>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
          {[{ n: 1, label: 'Photo & Taille' }, { n: 2, label: 'Analyse' }, { n: 3, label: 'Résultats' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step >= s.n ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : T.blueLight,
                  color: step >= s.n ? '#fff' : T.blueDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, transition: 'all .3s ease',
                  boxShadow: step >= s.n ? '0 8px 20px rgba(192,57,43,0.20)' : 'none',
                }}>{step > s.n ? '✓' : s.n}</div>
                <span style={{ fontSize: '13px', fontWeight: step === s.n ? 600 : 400, color: step >= s.n ? T.ink : T.muted }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ height: '2px', width: '48px', background: step > s.n ? `linear-gradient(90deg, ${T.red}, ${T.blueDark})` : T.border, borderRadius: '2px', transition: 'background .3s' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 80px 80px' }}>

        {/* ─── STEP 1 : UPLOAD + RENDU + PRODUIT/TAILLE ─── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '32px', alignItems: 'start' }}>

            {/* COLONNE 1 : Upload photo */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                1. Votre photo
              </h2>
              <p style={{ fontSize: '12px', color: T.muted, marginBottom: '20px' }}>Glissez ou cliquez pour importer</p>

              <div
                onClick={() => !photo && fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  border: `2px dashed ${photo ? T.red : 'rgba(26,26,26,0.20)'}`,
                  borderRadius: '18px',
                  background: photo ? 'rgba(192,57,43,0.02)' : T.white,
                  minHeight: '340px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: photo ? 'default' : 'pointer',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all .3s ease',
                }}
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="preview" style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px' }} />
                    <button
                      onClick={e => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); setTryonLaunched(false); }}
                      style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'rgba(26,26,26,0.75)', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer',
                        fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>×</button>
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '12px',
                      background: 'rgba(6,214,160,0.95)', color: '#fff',
                      borderRadius: '8px', padding: '6px 12px',
                      fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
                    }}>✓ Photo prête</div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 32px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p style={{ fontWeight: 500, color: T.ink, marginBottom: '6px', fontSize: '14px' }}>Glissez votre photo ici</p>
                    <p style={{ fontSize: '12px', color: T.muted, marginBottom: '16px' }}>ou cliquez pour parcourir</p>
                    <span style={{ fontSize: '11px', color: T.blueDark, background: T.blueLight, padding: '4px 12px', borderRadius: '100px' }}>
                      JPG, PNG — Max 10 Mo
                    </span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

              {/* Conseils rapides */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🧍', text: 'Position de face, bras légèrement écartés' },
                  { icon: '💡', text: 'Fond clair, éclairage naturel' },
                  { icon: '📏', text: 'Photo entière de la tête aux pieds' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: T.muted }}>
                    <span>{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>

              {/* Webcam */}
              <button style={{
                marginTop: '16px', width: '100%',
                background: T.blueLight, color: T.blueDark,
                border: `1px solid rgba(53,92,134,0.25)`, borderRadius: '10px',
                padding: '11px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Utiliser la webcam
              </button>
            </div>

            {/* COLONNE 2 : Zone de rendu / aperçu essayage */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                2. Aperçu du rendu
              </h2>
              <p style={{ fontSize: '12px', color: T.muted, marginBottom: '20px' }}>Prévisualisation de l'essayage virtuel</p>

              <div style={{
                borderRadius: '18px', overflow: 'hidden',
                minHeight: '340px', position: 'relative',
                background: `linear-gradient(145deg, #F0F4F9, #E6EEF6)`,
                border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                {photoPreview ? (
                  <>
                    {/* Rendu simulé : superposition vêtement sur photo */}
                    <div style={{ position: 'relative', width: '100%', height: '340px' }}>
                      <img
                        src={photoPreview}
                        alt="essayage"
                        style={{ width: '100%', height: '340px', objectFit: 'cover' }}
                      />
                      {/* Overlay vêtement simulé */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, transparent 15%, rgba(201,169,110,0.18) 40%, rgba(201,169,110,0.28) 70%, transparent 95%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <span style={{ fontSize: '80px', opacity: 0.55, marginTop: '40px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>
                          {selectedProduct.emoji}
                        </span>
                      </div>
                      {/* Badge article */}
                      <div style={{
                        position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                        background: 'rgba(249,249,249,0.95)', backdropFilter: 'blur(8px)',
                        borderRadius: '12px', padding: '10px 14px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <span style={{ fontSize: '22px' }}>{selectedProduct.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedProduct.name}
                          </div>
                          <div style={{ fontSize: '11px', color: T.muted }}>Taille {selectedSize} · Aperçu IA</div>
                        </div>
                        <div style={{
                          background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                          color: '#fff', borderRadius: '8px', padding: '4px 10px',
                          fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                        }}>✨ IA</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'rgba(53,92,134,0.10)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px', fontSize: '36px',
                    }}>👗</div>
                    <p style={{ fontWeight: 500, color: T.muted, fontSize: '14px', marginBottom: '8px' }}>
                      Le rendu apparaîtra ici
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(106,111,120,0.7)', lineHeight: 1.6 }}>
                      Uploadez votre photo et choisissez<br />un article pour voir l'essayage
                    </p>
                    {/* Indicateur visuel */}
                    <div style={{
                      marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
                    }}>
                      {['📸 Votre photo', '→', `${selectedProduct.emoji} ${selectedProduct.name}`, '→', '✨ Rendu IA'].map((item, i) => (
                        <span key={i} style={{
                          fontSize: '12px',
                          color: item === '→' ? T.muted : (i === 0 ? (photo ? '#06D6A0' : T.muted) : T.blueDark),
                          fontWeight: item === '→' ? 400 : 500,
                        }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sélecteur de produit rapide */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: T.muted, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Changer d'article
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {products.slice(0, 5).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        flexShrink: 0, width: '48px', height: '56px', borderRadius: '10px',
                        border: `2px solid ${selectedProduct.id === p.id ? T.red : T.border}`,
                        background: selectedProduct.id === p.id ? 'rgba(192,57,43,0.04)' : T.white,
                        cursor: 'pointer', fontSize: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s',
                      }}
                      title={p.name}
                    >{p.emoji}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLONNE 3 : Produit + Taille + Bouton lancer */}
            <div style={{
              background: T.white, borderRadius: '20px',
              border: `1px solid ${T.border}`,
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(26,26,26,0.08)',
              position: 'sticky', top: '88px',
            }}>
              {/* Article sélectionné */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '12px' }}>
                  Article sélectionné
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px', height: '64px', borderRadius: '10px',
                    background: `linear-gradient(145deg, #F8F9FB, ${T.blueLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                  }}>{selectedProduct.emoji}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedProduct.name}
                    </div>
                    <div style={{ fontSize: '11px', color: T.muted, marginBottom: '4px' }}>{selectedProduct.brand}</div>
                    <div style={{ fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                      {selectedProduct.price.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              </div>

              {/* Sélection de taille */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>3. Votre taille</span>
                  <span style={{ fontSize: '10px', color: T.blueDark, textTransform: 'none', letterSpacing: 0, cursor: 'pointer', fontWeight: 500 }}>
                    Guide →
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedProduct.sizes || ['XS', 'S', 'M', 'L', 'XL']).map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '7px 13px', borderRadius: '8px',
                        border: `1.5px solid ${selectedSize === s ? T.blueDark : T.border}`,
                        background: selectedSize === s ? T.blueDark : 'transparent',
                        color: selectedSize === s ? '#fff' : T.ink,
                        fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                        transition: 'all .2s',
                      }}
                    >{s}</button>
                  ))}
                </div>
                {selectedSize && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#06D6A0', fontWeight: 500 }}>
                    ✓ Taille {selectedSize} sélectionnée
                  </div>
                )}
              </div>

              {/* État de préparation */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, background: '#FAFBFC' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Photo uploadée', done: !!photo },
                    { label: 'Article sélectionné', done: true },
                    { label: 'Taille choisie', done: !!selectedSize },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        background: item.done ? '#06D6A0' : 'rgba(26,26,26,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.done
                          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(26,26,26,0.25)' }} />
                        }
                      </div>
                      <span style={{ color: item.done ? T.ink : T.muted, fontWeight: item.done ? 500 : 400 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton LANCER L'ESSAYAGE */}
              <div style={{ padding: '20px' }}>
                <button
                  onClick={startAnalysis}
                  disabled={!photo || !selectedSize}
                  style={{
                    width: '100%', padding: '16px',
                    borderRadius: '12px',
                    background: (!photo || !selectedSize)
                      ? 'rgba(26,26,26,0.08)'
                      : `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                    color: (!photo || !selectedSize) ? T.muted : '#fff',
                    border: 'none',
                    fontSize: '13px', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: (!photo || !selectedSize) ? 'not-allowed' : 'pointer',
                    transition: 'all .25s ease',
                    boxShadow: (!photo || !selectedSize) ? 'none' : '0 10px 24px rgba(192,57,43,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => {
                    if (photo && selectedSize) e.currentTarget.style.background = `linear-gradient(135deg, ${T.blueDark}, ${T.blueNavy})`;
                  }}
                  onMouseLeave={e => {
                    if (photo && selectedSize) e.currentTarget.style.background = `linear-gradient(135deg, ${T.red}, ${T.redDark})`;
                  }}
                >
                  <span style={{ fontSize: '16px' }}>✨</span>
                  {!photo ? 'Uploadez une photo d\'abord' : !selectedSize ? 'Choisissez une taille' : 'Lancer l\'essayage IA'}
                </button>

                {(!photo || !selectedSize) && (
                  <p style={{ fontSize: '11px', color: T.muted, textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
                    {!photo ? '← Importez votre photo pour continuer' : '← Sélectionnez votre taille'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2 : ANALYSE ─── */}
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
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, marginBottom: '12px' }}>
              Analyse en cours…
            </h2>
            <p style={{ color: T.muted, marginBottom: '8px' }}>Notre IA analyse votre morphologie</p>
            <p style={{ fontSize: '13px', color: T.blueDark, fontWeight: 500, marginBottom: '36px' }}>
              {selectedProduct.emoji} {selectedProduct.name} · Taille {selectedSize}
            </p>
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
                  transition: 'all .3s ease',
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: s.done ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : 'rgba(26,26,26,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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

        {/* ─── STEP 3 : RÉSULTATS ─── */}
        {step === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '48px', alignItems: 'start', marginBottom: '48px' }}>

              {/* Colonne gauche : photo + mensurations */}
              <div>
                <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="essayage" style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
                    : <div style={{ height: '380px', background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '64px' }}>🧍</span></div>
                  }
                  {/* Overlay rendu vêtement */}
                  {photoPreview && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, transparent 20%, rgba(201,169,110,0.15) 45%, rgba(201,169,110,0.25) 72%, transparent 92%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                      <span style={{ fontSize: '100px', opacity: 0.5, marginTop: '60px', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))' }}>
                        {selectedProduct.emoji}
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(249,249,249,0.96)', backdropFilter: 'blur(10px)',
                    borderRadius: '12px', padding: '10px 14px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '10px', color: T.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Score IA</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: T.red, lineHeight: 1 }}>94%</div>
                  </div>
                </div>

                {/* Mensurations */}
                <div style={{ background: T.white, borderRadius: '16px', border: `1px solid ${T.border}`, padding: '24px', boxShadow: '0 12px 34px rgba(26,26,26,0.075)' }}>
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
                  <button
                    onClick={() => setAdjustments({ shoulders: 0, chest: 0, waist: 0, hips: 0 })}
                    style={{ width: '100%', marginTop: '8px', background: T.blueLight, color: T.blueDark, border: `1px solid rgba(53,92,134,0.30)`, borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                  >Réinitialiser</button>
                </div>

                <button onClick={resetAll} style={{ width: '100%', marginTop: '16px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px', fontSize: '13px', cursor: 'pointer' }}>
                  ← Nouvelle photo
                </button>
              </div>

              {/* Colonne droite : panneau résultats */}
              <div style={{ background: T.white, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 18px 50px rgba(26,26,26,0.08)' }}>
                {/* Article */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Article essayé</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '75px', borderRadius: '12px', background: `linear-gradient(145deg, #F8F9FB, #E9EFF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>{selectedProduct.emoji}</div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '2px' }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: '12px', color: T.muted }}>{selectedProduct.brand}</div>
                      <div style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, marginTop: '4px' }}>{selectedProduct.price.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                </div>

                {/* Taille confirmée + changer */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Taille</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(selectedProduct.sizes || ['XS', 'S', 'M', 'L', 'XL']).map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} style={{
                        padding: '8px 16px', borderRadius: '100px',
                        border: `1.5px solid ${selectedSize === s ? T.blueDark : T.border}`,
                        background: selectedSize === s ? T.blueDark : 'transparent',
                        color: selectedSize === s ? '#fff' : T.ink,
                        fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                      }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#06D6A0', fontWeight: 500 }}>
                    ✓ Taille {selectedSize} recommandée par l'IA
                  </div>
                </div>

                {/* Score */}
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

                {/* Recommandations */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>Recommandations IA</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {[
                      'Convient parfaitement à votre morphologie',
                      `Taille ${selectedSize} recommandée selon vos mesures`,
                      'La couleur or valorise votre teint',
                      'Accessoirisez avec une ceinture fine',
                    ].map((rec, i) => (
                      <li key={i} style={{ fontSize: '13px', color: T.muted, marginBottom: '10px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: T.red, flexShrink: 0 }}>→</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bouton panier */}
                <div style={{ padding: '24px' }}>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      width: '100%', padding: '18px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                      color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600,
                      letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                      transition: 'all .2s', boxShadow: '0 10px 20px rgba(192,57,43,0.25)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    Ajouter au panier — {selectedProduct.price.toLocaleString()} FCFA
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 300 }}>Autres suggestions IA</h2>
                  <p style={{ color: T.muted, fontSize: '13px', marginTop: '6px' }}>4 produits compatibles avec votre morphologie</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
                {scores.map((item, i) => (
                  <div key={i} onClick={() => setSelectedProduct(item.product)} style={{
                    borderRadius: '16px', overflow: 'hidden', background: T.white,
                    border: `2px solid ${selectedProduct.id === item.product.id ? T.red : T.border}`,
                    cursor: 'pointer', transition: 'all .25s ease',
                    boxShadow: selectedProduct.id === item.product.id ? '0 12px 34px rgba(192,57,43,0.15)' : '0 12px 34px rgba(26,26,26,0.075)',
                  }}>
                    <div style={{ position: 'relative', height: '200px' }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: item.score >= 90 ? T.red : T.blueDark, color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px' }}>
                        {item.score}%
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', color: T.blueDark, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '3px', fontWeight: 500 }}>{item.product.brand}</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{item.product.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.product.price.toLocaleString()} FCFA</span>
                        <Link to={`/product/${item.product.id}`} onClick={e => e.stopPropagation()} style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 600 }}>Voir →</Link>
                      </div>
                    </div>
                  </div>
                ))}
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