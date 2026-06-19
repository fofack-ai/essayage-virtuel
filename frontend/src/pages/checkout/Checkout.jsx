import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PAYMENT = [
  { id:'orange', label:'🟠 Orange Money',      desc:'Paiement via votre compte Orange' },
  { id:'mtn',    label:'🟡 MTN Mobile Money',  desc:'Paiement via Mobile Money MTN' },
  { id:'card',   label:'💳 Visa / Mastercard', desc:'Carte bancaire internationale' },
  { id:'cash',   label:'🤝 À la livraison',    desc:'Espèces à la réception' },
];

export default function Checkout() {
  const { items: cartItems = [], clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pay, setPay]   = useState('orange');
  const [promo, setPromo] = useState('');
  const [promoOk, setPromoOk] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', tel:'', adresse:'', ville:'Douala' });

  const subtotal  = cartItems.reduce((s,i) => s + i.price * i.qty, 0);
  const discount  = promoOk ? Math.round(subtotal * .10) : 0;
  const total     = subtotal - discount;

  const inp = (label, key, type='text', ph='') => (
    <div style={{ marginBottom:18 }}>
      <label style={{ fontSize:12, fontWeight:500, letterSpacing:1, textTransform:'uppercase', color:'#6A6F78', display:'block', marginBottom:8 }}>{label}</label>
      <input type={type} value={form[key]} placeholder={ph}
        onChange={e => setForm({...form, [key]:e.target.value})}
        style={{ width:'100%', padding:'13px 16px', border:'1.5px solid rgba(26,26,26,.11)', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:14, background:'#fff', outline:'none', color:'#1A1A1A' }}
        onFocus={e => e.target.style.borderColor='#355C86'}
        onBlur={e => e.target.style.borderColor='rgba(26,26,26,.11)'}
      />
    </div>
  );

  const confirm = () => { clearCart(); setDone(true); setTimeout(() => navigate('/'), 3000); };

  if (done) return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'#1A1A1A', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', textAlign:'center' }}>
      <div style={{ fontSize:80, marginBottom:24 }}>✅</div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, marginBottom:16 }}>
        Commande <em style={{ color:'#c9a96e' }}>confirmée !</em>
      </h1>
      <p style={{ color:'rgba(255,255,255,.5)', fontSize:15 }}>Vous recevrez un SMS de confirmation. Redirection…</p>
    </div>
  );

  return (
    <div style={{ paddingTop:64, background:'#F9F9F9', minHeight:'100vh' }}>
      {/* Breadcrumb */}
      <div style={{ padding:'12px 48px', fontSize:12, color:'#6A6F78', display:'flex', gap:8, borderBottom:'1px solid rgba(26,26,26,.105)', background:'#fff' }}>
        <Link to="/" style={{ color:'#355C86', textDecoration:'none' }}>Accueil</Link> ›
        <Link to="/panier" style={{ color:'#355C86', textDecoration:'none' }}>Panier</Link> › Paiement
      </div>

      {/* Étapes */}
      <div style={{ display:'flex', justifyContent:'center', gap:0, padding:'28px 48px', background:'#fff', borderBottom:'1px solid rgba(26,26,26,.105)' }}>
        {['Livraison','Paiement','Confirmation'].map((s, i) => {
          const n = i+1; const done2 = step>n; const active = step===n;
          return (
            <div key={s} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, cursor:done2?'pointer':'default' }} onClick={() => done2 && setStep(n)}>
                <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:done2?'#06D6A0':active?'#B83228':'#F1F5F9', color:done2||active?'#fff':'#6A6F78', fontSize:13, fontWeight:700 }}>
                  {done2?'✓':n}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:active?'#B83228':done2?'#06D6A0':'#6A6F78', letterSpacing:1, textTransform:'uppercase' }}>{s}</span>
              </div>
              {i<2 && <div style={{ width:60, height:1, background:done2?'#06D6A0':'rgba(26,26,26,.10)', margin:'0 16px' }}/>}
            </div>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px' }}>

        {/* Formulaire */}
        <div style={{ padding:'48px 56px' }}>

          {step===1 && (
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:300, marginBottom:6 }}>Adresse de livraison</h2>
              <p style={{ fontSize:13, color:'#6A6F78', marginBottom:32 }}>Où devons-nous livrer votre commande ?</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
                {inp('Nom','nom','text','Votre nom')}
                {inp('Prénom','prenom','text','Votre prénom')}
              </div>
              {inp('Email','email','email','vous@exemple.cm')}
              {inp('Téléphone','tel','tel','+237 6XX XXX XXX')}
              {inp('Adresse','adresse','text','Rue, numéro…')}
              {inp('Ville','ville','text','Douala')}

              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:500, letterSpacing:1, textTransform:'uppercase', color:'#6A6F78', marginBottom:14 }}>Mode de livraison</div>
                {[
                  { id:'std', label:'Livraison standard', desc:'3-5 jours ouvrés', price:'Gratuite', green:true },
                  { id:'exp', label:'Livraison express',  desc:'24h garantis',     price:'2 000 FCFA', green:false },
                ].map(o => (
                  <div key={o.id} style={{ display:'flex', alignItems:'center', gap:16, padding:18, border:'1.5px solid rgba(26,26,26,.08)', borderRadius:10, marginBottom:10, background:'#fff', cursor:'pointer' }}>
                    <input type="radio" name="del" defaultChecked={o.id==='std'} style={{ accentColor:'#B83228' }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>{o.label}</div>
                      <div style={{ fontSize:12, color:'#6A6F78' }}>{o.desc}</div>
                    </div>
                    <span style={{ fontWeight:700, color:o.green?'#06D6A0':'#B83228' }}>{o.price}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{ width:'100%', padding:18, background:'linear-gradient(135deg,#B83228,#8E241D)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', borderRadius:10 }}>
                Continuer →
              </button>
            </div>
          )}

          {step===2 && (
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:300, marginBottom:6 }}>Mode de paiement</h2>
              <p style={{ fontSize:13, color:'#6A6F78', marginBottom:32 }}>Choisissez votre méthode préférée.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
                {PAYMENT.map(m => (
                  <div key={m.id} onClick={() => setPay(m.id)} style={{ display:'flex', alignItems:'center', gap:16, padding:20, border:`1.5px solid ${pay===m.id?'#B83228':'rgba(26,26,26,.08)'}`, borderRadius:12, cursor:'pointer', background:'#fff', transition:'border-color .18s' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${pay===m.id?'#B83228':'#ddd'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {pay===m.id && <div style={{ width:8, height:8, borderRadius:'50%', background:'#B83228' }}/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>{m.label}</div>
                      <div style={{ fontSize:12, color:'#6A6F78' }}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => setStep(1)} style={{ padding:'16px 24px', background:'#F1F5F9', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', borderRadius:10 }}>← Retour</button>
                <button onClick={() => setStep(3)} style={{ flex:1, padding:18, background:'linear-gradient(135deg,#B83228,#8E241D)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', borderRadius:10 }}>Confirmer →</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:300, marginBottom:6 }}>Vérification finale</h2>
              <p style={{ fontSize:13, color:'#6A6F78', marginBottom:32 }}>Relisez votre commande avant de valider.</p>
              <div style={{ background:'#fff', borderRadius:12, border:'1.5px solid rgba(26,26,26,.08)', marginBottom:20, overflow:'hidden' }}>
                {cartItems.map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:16, padding:20, borderBottom: i<cartItems.length-1?'1px solid rgba(26,26,26,.06)':'none', alignItems:'center' }}>
                    <div style={{ width:60, height:75, background:'linear-gradient(160deg,#f5f0e8,#ede5d8)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{item.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, marginBottom:3 }}>{item.name}</div>
                      <div style={{ fontSize:12, color:'#6A6F78' }}>Taille {item.size} · Qté {item.qty}</div>
                    </div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600 }}>{(item.price*item.qty).toLocaleString()} FCFA</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => setStep(2)} style={{ padding:'16px 24px', background:'#F1F5F9', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', borderRadius:10 }}>← Retour</button>
                <button onClick={confirm} style={{ flex:1, padding:18, background:'linear-gradient(135deg,#06D6A0,#059669)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', borderRadius:10 }}>✓ Valider la commande</button>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div style={{ padding:'48px 36px', background:'#fff', borderLeft:'1px solid rgba(26,26,26,.08)', position:'sticky', top:104, alignSelf:'start' }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, marginBottom:24 }}>Récapitulatif</h3>
          {cartItems.map((item,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:10, color:'#6A6F78' }}>
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontWeight:600, color:'#1A1A1A' }}>{(item.price*item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ height:1, background:'rgba(26,26,26,.08)', margin:'16px 0' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:10 }}>
            <span style={{ color:'#6A6F78' }}>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:10 }}>
            <span style={{ color:'#6A6F78' }}>Livraison</span>
            <span style={{ color:'#06D6A0', fontWeight:700 }}>Gratuite</span>
          </div>
          {promoOk && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:10 }}>
              <span style={{ color:'#6A6F78' }}>Réduction (10%)</span>
              <span style={{ color:'#B83228', fontWeight:700 }}>−{discount.toLocaleString()} FCFA</span>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:500, fontSize:17, paddingTop:14, borderTop:'1px solid rgba(26,26,26,.10)', marginTop:6 }}>
            <span>Total</span><span>{total.toLocaleString()} FCFA</span>
          </div>
          <div style={{ display:'flex', gap:8, margin:'20px 0' }}>
            <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Code promo"
              style={{ flex:1, padding:'10px 14px', border:'1.5px solid rgba(26,26,26,.11)', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:'none', background:'#F9F9F9' }}/>
            <button onClick={() => setPromoOk(promo.toUpperCase()==='VESTI10')}
              style={{ padding:'10px 16px', background:'#F1F5F9', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', borderRadius:10 }}>OK</button>
          </div>
          {promoOk && <p style={{ fontSize:12, color:'#06D6A0', marginTop:-10 }}>✓ Code VESTI10 appliqué !</p>}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:16 }}>
            {['🟠 Orange','🟡 MTN','💳 Visa','PayDunya'].map(b => (
              <span key={b} style={{ padding:'5px 10px', background:'#F1F5F9', borderRadius:8, fontSize:10, fontWeight:600, color:'#6A6F78', border:'1px solid rgba(26,26,26,.08)' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}