import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const SIZES = ['XS','S','M','L','XL'];
const COLORS = ['#c9a96e','#c4573a','#2d2420','#7a8c6e'];

export default function TryOn() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('En attente…');
  const [score, setScore] = useState(null);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('#c9a96e');
  const [mode, setMode] = useState('webcam');
  const { addToCart } = useCart();
  const navigate = useNavigate();

const simulate = () => {
  setStarted(true);
  setStatus('Détection du corps…');
  
  const steps = [
    { text: 'Analyse morphologie…', delay: 800 },
    { text: 'Ajustement du vêtement…', delay: 1000 },
    { text: 'Essayage prêt ✓', delay: 800 }
  ];
  
  let step = 0;
  function nextStep() {
    if (step < steps.length) {
      setStatus(steps[step].text);
      setTimeout(() => {
        step++;
        nextStep();
      }, steps[step].delay);
    } else {
      setScore(94);
      setStatus('Essayage prêt ✓');
    }
  }
  
  setTimeout(() => nextStep(), 600);
};

  const handleAdd = () => {
    addToCart({ id: 1, name: 'Robe Évasée Florale', brand: 'Collection Printemps', price: 15000, emoji: '👗', size, color, qty: 1 });
    navigate('/panier');
  };

  return (
    <div style={{ paddingTop: 64, display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── ZONE PREVIEW ── */}
      <div style={{
        background: '#1a1410', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Fond radial */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(201,169,110,0.08) 0%, transparent 70%)',
        }} />

        {/* Status */}
        <div style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(122,140,110,0.9)', color: '#fff',
          padding: '6px 18px', borderRadius: 100,
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6, zIndex: 3, whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#fff',
            animation: 'blink 1s ease-in-out infinite', display: 'inline-block',
          }} />
          {status}
        </div>
        <style>{`
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
          @keyframes scan{0%{top:0;opacity:0}20%{opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}
          @keyframes pulse-kp{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.4);opacity:1}}
        `}</style>

        {/* Upload state */}
        {!started && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 2,
          }}>
            <div onClick={simulate} style={{
              width: 100, height: 100, borderRadius: '50%',
              border: '2px dashed rgba(201,169,110,0.4)',
              color: 'rgba(201,169,110,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 6, fontSize: 28, cursor: 'pointer',
              transition: 'all .2s',
            }}>
              📷
              <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Charger</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
              <strong style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 4 }}>
                Importez votre photo
              </strong>
              ou activez la webcam pour commencer
            </div>
          </div>
        )}

        {/* Silhouette active */}
        {started && (
          <div style={{
            position: 'relative', zIndex: 1,
            width: 280, height: 480,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)',
              borderRadius: '140px 140px 80px 80px / 100px 100px 60px 60px',
              border: '1px solid rgba(255,255,255,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Vêtement superposé */}
              <div style={{
                position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
                width: 180, height: 180,
                background: 'rgba(201,169,110,0.25)',
                borderRadius: '20px 20px 8px 8px',
                border: '1px solid rgba(201,169,110,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 52,
              }}>
                👗
                <div style={{
                  position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap', background: 'rgba(201,169,110,0.9)', color: '#1a1a1a',
                  fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                  padding: '4px 12px', borderRadius: 100,
                }}>Robe Florale</div>
              </div>

              {/* Scan line */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg,transparent,rgba(201,169,110,.6),transparent)',
                animation: 'scan 2s ease-in-out infinite',
              }} />

              {/* Key points */}
              {[[10,50],[28,30],[28,70],[55,35],[55,65]].map(([t, l], i) => (
                <div key={i} style={{
                  position: 'absolute', top: `${t}%`, left: `${l}%`,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'rgba(201,169,110,0.8)',
                  boxShadow: '0 0 0 4px rgba(201,169,110,0.2)',
                  animation: `pulse-kp 1.5s ease-in-out ${i * 0.3}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Contrôles bas */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 12, zIndex: 3,
        }}>
          {[
            { id:'photo', label:'📷 Photo' },
            { id:'webcam', label:'🎥 Webcam' },
            { id:'reset', label:'⟳ Changer' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => {
              if (id === 'reset') { setStarted(false); setScore(null); setStatus('En attente…'); }
              else { setMode(id); simulate(); }
            }} style={{
              background: mode === id && id !== 'reset' ? '#355C86' : 'rgba(250,247,242,.10)',
              color: mode === id && id !== 'reset' ? '#fff' : '#fff',
              border: `1px solid ${mode === id && id !== 'reset' ? '#355C86' : 'rgba(255,255,255,.15)'}`,
              padding: '10px 20px', borderRadius: 100,
              fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── PANEL LATÉRAL ── */}
      <div style={{
        background: '#F9F9F9', borderLeft: '1px solid rgba(26,26,26,.105)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>

        {/* Article sélectionné */}
        <div style={{ padding: 24, borderBottom: '1px solid rgba(26,26,26,.105)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6A6F78', marginBottom: 16 }}>
            Article sélectionné
          </div>
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            background: '#fff', borderRadius: 18, padding: 12,
            border: '1px solid rgba(26,26,26,.105)',
          }}>
            <div style={{
              width: 60, height: 75,
              background: 'linear-gradient(160deg,#f5f0e8,#ede5d8)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 28,
            }}>👗</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Robe Évasée Florale</div>
              <div style={{ fontSize: 12, color: '#6A6F78' }}>Collection Printemps 2025</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                15 000 FCFA
              </div>
            </div>
          </div>
        </div>

        {/* Taille + Couleur */}
        <div style={{ padding: 24, borderBottom: '1px solid rgba(26,26,26,.105)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6A6F78', marginBottom: 12 }}>
            Taille
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)} style={{
                padding: '6px 14px', borderRadius: 100,
                border: `1.5px solid ${size === s ? 'var(--ink)' : 'rgba(26,26,26,.11)'}`,
                background: size === s ? 'var(--ink)' : 'transparent',
                color: size === s ? '#F9F9F9' : 'var(--ink)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6A6F78', marginBottom: 12 }}>
            Couleur
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{
                width: 32, height: 32, borderRadius: '50%', background: c,
                cursor: 'pointer', border: '3px solid transparent',
                outline: color === c ? '2px solid #B83228' : '2px solid transparent',
                outlineOffset: 3, transition: 'all .2s',
              }} />
            ))}
          </div>
        </div>

        {/* Score IA */}
        <div style={{ padding: 24, borderBottom: '1px solid rgba(26,26,26,.105)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6A6F78', marginBottom: 16 }}>
            Score de compatibilité IA
          </div>
          <div style={{
            background: 'linear-gradient(135deg,#355C86,#1A1A1A)',
            borderRadius: 18, padding: 16, color: '#F9F9F9', marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>
              Correspondance morphologie
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 42, fontWeight: 300, color: '#c9a96e', lineHeight: 1, marginBottom: 4,
            }}>{score ? `${score}%` : '—'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
              {score ? 'Excellente compatibilité' : 'En attente d\'analyse…'}
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg,#B83228,#5B7FA6)',
                width: `${score || 0}%`, transition: 'width .8s ease',
              }} />
            </div>
          </div>

          {/* Tips */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Coupe évasée idéale pour votre morphologie',
              'Taille M recommandée selon vos mesures',
              'Associer avec des escarpins pour allonger la silhouette',
              'Couleur or sable très harmonieuse avec votre teint',
            ].map((tip, i) => (
              <li key={i} style={{
                fontSize: 12, color: '#6A6F78',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span style={{ color: '#355C86', flexShrink: 0, marginTop: 1 }}>→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton panier */}
        <button onClick={handleAdd} style={{
          margin: 24, padding: 16, borderRadius: 10,
          background: 'linear-gradient(135deg,#B83228,#8E241D)',
          color: '#F9F9F9', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
          transition: 'all .2s',
        }}>
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}