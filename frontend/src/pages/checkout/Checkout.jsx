import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { QUARTIERS_DOUALA, normalizeQuartier } from '../../data/quartiersDouala';

/* Logos officiels — à placer dans src/assets/logos/ */
import orangeLogo from '../../assets/logos/orange-money.png';
import mtnLogo from '../../assets/logos/mtn-momo.png';
import deliveryLogo from '../../assets/logos/cash-on-delivery.png';

import { Truck, AlertTriangle, Check, Loader2 } from 'lucide-react';

/* ─── Constantes non traduites (identifiants techniques) ──── */
const PAYMENT_IDS = ['orange', 'mtn', 'cash'];
const PAYMENT_BACKEND = {
  orange: 'orange_money',
  mtn: 'mtn_mobile_money',
  cash: 'cash_on_delivery',
};

const LOGOS = {
  orange: orangeLogo,
  mtn: mtnLogo,
  cash: deliveryLogo,
};

/* On ne livre pour l'instant qu'à Douala */
const CITIES = ['Douala'];
const DEFAULT_CITY = 'Douala';

/* Frais de livraison — Douala uniquement */
const DELIVERY_FEE = 2000; // FCFA

const LABEL_STYLE = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
  textTransform: 'uppercase', color: '#6A6F78',
  display: 'block', marginBottom: 8,
};

/* ─── Composants dépendants définis HORS du parent ──────────
   (Important : les définir à l'intérieur causerait un re-mount
    à chaque render → perte de focus à chaque frappe)          */
function Field({ label, value, onChange, type = 'text', placeholder = '', error = '' }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '13px 16px',
          border: `1.5px solid ${error ? '#E53E3E' : 'rgba(26,26,26,.12)'}`,
          borderRadius: 10, fontSize: 14,
          background: '#fff', outline: 'none', color: '#1A1A1A',
          transition: 'border-color .15s',
        }}
        onFocus={e => (e.target.style.borderColor = '#355C86')}
        onBlur={e => (e.target.style.borderColor = error ? '#E53E3E' : 'rgba(26,26,26,.12)')}
      />
      {error && (
        <p style={{ color: '#E53E3E', fontSize: 11, margin: '5px 0 0', fontStyle: 'italic' }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* Ville verrouillée sur Douala tant qu'une seule ville est desservie */
function CitySelect({ value, onChange, error = '' }) {
  const { t } = useTranslation();
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={LABEL_STYLE}>{t('checkout.city.label')}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={CITIES.length === 1}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '13px 16px',
          border: `1.5px solid ${error ? '#E53E3E' : 'rgba(26,26,26,.12)'}`,
          borderRadius: 10, fontSize: 14,
          background: CITIES.length === 1 ? '#F3F4F6' : '#fff', outline: 'none',
          color: value ? '#1A1A1A' : '#9CA3AF',
          cursor: CITIES.length === 1 ? 'not-allowed' : 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236A6F78' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: 36,
        }}
      >
        {CITIES.length > 1 && <option value="">{t('checkout.city.choosePlaceholder')}</option>}
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {CITIES.length === 1 && (
        <p style={{ fontSize: 11.5, color: '#6A6F78', margin: '5px 0 0' }}>
          {t('checkout.city.onlyDoualaNote')}
        </p>
      )}
      {error && (
        <p style={{ color: '#E53E3E', fontSize: 11, margin: '5px 0 0', fontStyle: 'italic' }}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Champ quartier : combobox, pas <select>.
 *
 * Au clic, la liste complète s'ouvre ; à la frappe, elle se filtre. Mais la
 * saisie libre reste TOUJOURS acceptée : aucune liste de quartiers de Douala
 * n'est complète, et un client habitant un lieu-dit non répertorié ne doit
 * jamais se retrouver bloqué à l'étape adresse d'une commande.
 */
function QuartierSelect({ value, onChange, error = '' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  // Fermeture au clic extérieur : sans ça la liste flotte au-dessus du reste
  // du formulaire et masque les moyens de paiement.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const results = useMemo(() => {
    const q = normalizeQuartier(value);
    // Champ vide, ou quartier déjà choisi exactement : on montre TOUT, sinon
    // le client qui vient de choisir « Akwa » ne verrait plus qu'une ligne
    // et ne pourrait plus changer d'avis sans effacer sa saisie.
    if (!q || QUARTIERS_DOUALA.some((x) => normalizeQuartier(x) === q)) {
      return QUARTIERS_DOUALA;
    }
    return QUARTIERS_DOUALA.filter((x) => normalizeQuartier(x).includes(q));
  }, [value]);

  const choose = (q) => {
    onChange(q);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div style={{ marginBottom: 18, position: 'relative' }} ref={boxRef}>
      <label style={LABEL_STYLE}>{t('checkout.step1.neighborhoodLabel')}</label>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={t('checkout.step1.neighborhoodPlaceholder')}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={(e) => { setOpen(true); e.target.style.borderColor = '#355C86'; }}
        onBlur={(e) => (e.target.style.borderColor = error ? '#E53E3E' : 'rgba(26,26,26,.12)')}
        onKeyDown={onKeyDown}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '13px 16px', paddingRight: 36,
          border: `1.5px solid ${error ? '#E53E3E' : 'rgba(26,26,26,.12)'}`,
          borderRadius: 10, fontSize: 14,
          background: '#fff', outline: 'none', color: '#1A1A1A',
          transition: 'border-color .15s',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236A6F78' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
      />

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute', zIndex: 30, top: '100%', left: 0, right: 0,
            margin: '4px 0 0', padding: 4, listStyle: 'none',
            maxHeight: 240, overflowY: 'auto',
            background: '#fff', border: '1.5px solid rgba(26,26,26,.12)',
            borderRadius: 10, boxShadow: '0 12px 28px rgba(26,26,26,.12)',
          }}
        >
          {results.length === 0 ? (
            <li style={{ padding: '10px 12px', fontSize: 12.5, color: '#6A6F78', lineHeight: 1.5 }}>
              {t('checkout.neighborhood.noMatch', { value })}
            </li>
          ) : (
            results.map((q, i) => (
              <li
                key={q}
                role="option"
                aria-selected={normalizeQuartier(q) === normalizeQuartier(value)}
                // onMouseDown et non onClick : le blur de l'input se déclenche
                // avant le click et refermerait la liste avant la sélection.
                onMouseDown={(e) => { e.preventDefault(); choose(q); }}
                onMouseEnter={() => setActive(i)}
                ref={(el) => { if (el && i === active) el.scrollIntoView({ block: 'nearest' }); }}
                style={{
                  padding: '9px 12px', borderRadius: 7, fontSize: 14, cursor: 'pointer',
                  background: i === active ? '#EEF2F7' : 'transparent',
                  color: '#1A1A1A',
                  fontWeight: normalizeQuartier(q) === normalizeQuartier(value) ? 600 : 400,
                }}
              >
                {q}
              </li>
            ))
          )}
        </ul>
      )}

      {error ? (
        <p style={{ color: '#E53E3E', fontSize: 11, margin: '5px 0 0', fontStyle: 'italic' }}>
          {error}
        </p>
      ) : (
        <p style={{ fontSize: 11.5, color: '#6A6F78', margin: '5px 0 0' }}>
          {t('checkout.neighborhood.hint')}
        </p>
      )}
    </div>
  );
}

/* Logos des moyens de paiement — images importées (logos officiels) */
function PaymentLogo({ type, size = 44 }) {

  return (
    <img
      src={LOGOS[type]}
      alt={type}
      style={{
        width: size, height: size,
        borderRadius: 12, objectFit: 'contain',
        background: '#fff',
      }}
    />
  );
}

/* Détection de l'opérateur à partir du numéro de téléphone
   MTN: 67, 68, 650-654 / Orange: 69, 655-659
   (plages à revérifier périodiquement, elles peuvent évoluer) */
function detectOperator(phone) {
  const p = phone.replace(/\D/g, '');
  if (!/^6\d{8}$/.test(p)) return null;
  const p2 = p.slice(0, 2);
  const p3 = p.slice(0, 3);
  if (p2 === '67' || p2 === '68') return 'mtn';
  if (p2 === '69') return 'orange';
  if (p2 === '65') {
    const n = parseInt(p3, 10);
    if (n >= 650 && n <= 654) return 'mtn';
    if (n >= 655 && n <= 659) return 'orange';
  }
  return null;
}

/* ─── Composant principal ────────────────────────────────── */
export default function Checkout() {
  const { t } = useTranslation();
  const { items: cartItems = [], loadCart, loadingCart } = useCart();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* Liste des moyens de paiement, traduite */
  const PAYMENT = PAYMENT_IDS.map(id => ({
    id,
    label: t(`checkout.payment.${id}.label`),
    desc: t(`checkout.payment.${id}.desc`),
    backend: PAYMENT_BACKEND[id],
  }));

  const [step, setStep]             = useState(1);
  const [pay, setPay]               = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [errors, setErrors]         = useState({});
  const [form, setFormState] = useState({
    nom: '', prenom: '', email: '',
    tel: '', adresse: '', ville: DEFAULT_CITY,
    quartier: '', reference: '',
  });

  /* ── Guards ── */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/auth');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    // On attend que le panier soit chargé avant de rediriger
    if (!authLoading && !loadingCart && isAuthenticated && cartItems.length === 0 && !orderResult) {
      navigate('/cart');
    }
  }, [authLoading, loadingCart, isAuthenticated, cartItems, orderResult, navigate]);

  /* Pré-remplir l'email depuis le compte */
  useEffect(() => {
    if (user?.email) setFormState(f => ({ ...f, email: user.email }));
  }, [user]);

  /* ── Prix ── */
  const deliveryFee = DELIVERY_FEE;
  const subtotal    = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total       = subtotal + deliveryFee;
  const fmt         = n => Number(n).toLocaleString('fr-FR');

  /* ── Validation ── */
  const validatePhone = phone => /^6\d{8}$/.test(phone.trim());

  const validateStep1 = () => {
    const e = {};
    if (!form.nom.trim())    e.nom    = t('checkout.validation.nameRequired');
    if (!form.prenom.trim()) e.prenom = t('checkout.validation.firstNameRequired');
    if (!form.email.trim())  e.email  = t('checkout.validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('checkout.validation.emailInvalid');
    if (!form.tel.trim())    e.tel    = t('checkout.validation.phoneRequired');
    else if (!validatePhone(form.tel)) e.tel = t('checkout.validation.phoneFormat');
    if (!form.adresse.trim()) e.adresse = t('checkout.validation.addressRequired');
    if (!form.ville)          e.ville   = t('checkout.validation.cityRequired');
    if (!form.quartier.trim()) e.quartier = t('checkout.validation.neighborhoodRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (key, val) => {
    setFormState(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));

    if (key === 'tel') {
      const op = detectOperator(val);
      if (op) setPay(op); // pré-sélection automatique
      // si op est null (numéro incomplet/inconnu), on ne touche pas à "pay"
      // → l'utilisateur garde toujours la main pour changer manuellement ensuite
    }
  };

  /* ── Soumission ── */

  const placeOrder = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const deliveryAddress = [form.adresse, form.quartier, form.reference]
        .filter(Boolean).join(', ');

      const paymentMethod = PAYMENT.find(p => p.id === pay)?.backend ?? 'cash_on_delivery';

      // 1. On crée toujours la commande d'abord
      const response = await api.post('/orders', {
        paymentMethod,
        recipientFirstName: form.prenom,
        recipientLastName:  form.nom,
        deliveryAddress,
        deliveryCity:    form.ville,
        deliveryPhone:   form.tel,
      });

      const order = response.data;

      // 2. Si paiement en ligne (Orange ou MTN via Paydunya), on redirige vers Paydunya
      if (paymentMethod === 'orange_money' || paymentMethod === 'mtn_mobile_money') {
        const payRes = await api.post('/payments/paydunya/init', { orderId: order.id });
        const paymentUrl = payRes.data?.paymentUrl;
        if (paymentUrl) {
          // On quitte le site vers la page de paiement sécurisée Paydunya.
          // On NE recharge PAS le panier avant : ça déclenchait le useEffect
          // de redirection interne vers /cart et créait un flash/race avec
          // cette navigation externe. Le panier sera de toute façon marqué
          // "converted" côté serveur.
          window.location.href = paymentUrl;
          return;
        }
        // Si pas d'URL (clés Paydunya absentes en dev), on affiche une erreur claire
        throw new Error(t('checkout.errors.onlinePaymentUnavailable'));
      }

      // 3. Paiement à la livraison : écran de succès classique
      setOrderResult(order);
      await loadCart();
    } catch (err) {
      setSubmitError(err.message || t('checkout.errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Écran de succès ── */
  if (orderResult) return (
    <div style={{
      paddingTop: 64, minHeight: '100vh', background: '#1A1A1A',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', color: '#fff', textAlign: 'center',
      padding: '64px 24px',
    }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,5vw,50px)', fontWeight: 300, margin: '0 0 20px' }}>
        {t('checkout.success.titleLine')} <em style={{ color: '#c9a96e' }}>{t('checkout.success.titleHighlight')}</em>
      </h1>
      <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '16px 32px', marginBottom: 24, display: 'inline-block' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>
          {t('checkout.success.orderNumberLabel')}
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#c9a96e', margin: 0 }}>
          {orderResult.orderNumber}
        </p>
      </div>
      <p style={{ color: 'rgba(255,255,255,.55)', maxWidth: 400, lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
        {t('checkout.success.confirmedMessage', { phone: form.tel })}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{ padding: '13px 26px', background: '#c9a96e', color: '#1A1A1A', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          {t('checkout.success.viewOrders')}
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '13px 26px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
        >
          {t('checkout.success.backHome')}
        </button>
      </div>
    </div>
  );

  if (authLoading) return (
    <div style={{ paddingTop: 140, textAlign: 'center', color: '#6A6F78', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {t('checkout.loading')}
    </div>
  );

  const paymentOption  = PAYMENT.find(p => p.id === pay);
  const stepLabels = [t('checkout.steps.delivery'), t('checkout.steps.payment'), t('checkout.steps.confirmation')];

  /* ── Rendu principal ── */
  return (
    <>
      <style>{`
        .co-wrap { padding-top: 64px; background: #F9F9F9; min-height: 100vh; }
        .co-breadcrumb { padding: 12px 56px; font-size: 12px; color: #6A6F78; display: flex; gap: 8px; border-bottom: 1px solid rgba(26,26,26,.09); background: #fff; }
        .co-steps { display: flex; justify-content: center; align-items: center; padding: 22px 24px; background: #fff; border-bottom: 1px solid rgba(26,26,26,.09); }
        .co-grid { display: grid; grid-template-columns: 1fr 360px; }
        .co-form { padding: 44px 56px; }
        .co-sidebar { padding: 44px 30px; background: #fff; border-left: 1px solid rgba(26,26,26,.08); position: sticky; top: 104px; align-self: start; max-height: calc(100vh - 104px); overflow-y: auto; }
        .co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
        .step-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; white-space: nowrap; }
        .pay-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 36px; }
        .pay-card { position: relative; background: #fff; border: 2px solid rgba(26,26,26,.10); border-radius: 14px; padding: 24px 14px 18px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
        .pay-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,.06); }
        .pay-card--active { border-color: #B83228; box-shadow: 0 4px 14px rgba(184,50,40,.14); }
        .pay-card__check { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; background: #B83228; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .pay-card__label { font-size: 13.5px; font-weight: 700; color: #1A1A1A; }
        .pay-card__desc { font-size: 11px; color: #6A6F78; line-height: 1.4; }
        @media (max-width: 900px) {
          .co-grid { grid-template-columns: 1fr; }
          .co-sidebar { position: static; max-height: none; border-left: none; border-top: 1px solid rgba(26,26,26,.08); order: -1; padding: 24px 20px; }
          .co-form { padding: 28px 20px; }
          .co-breadcrumb { padding: 12px 20px; }
        }
        @media (max-width: 600px) {
          .co-row2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .pay-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 420px) {
          .step-label { display: none; }
        }
      `}</style>

      <div className="co-wrap">

        {/* Fil d'Ariane */}
        <div className="co-breadcrumb">
          <Link to="/"     style={{ color: '#355C86', textDecoration: 'none' }}>{t('checkout.breadcrumb.home')}</Link>
          <span>›</span>
          <Link to="/cart" style={{ color: '#355C86', textDecoration: 'none' }}>{t('checkout.breadcrumb.cart')}</Link>
          <span>›</span>
          <span>{t('checkout.breadcrumb.payment')}</span>
        </div>

        {/* Indicateur d'étapes */}
        <div className="co-steps">
          {stepLabels.map((s, i) => {
            const n = i + 1, done2 = step > n, active = step === n;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => done2 && setStep(n)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: done2 ? 'pointer' : 'default' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done2 ? '#06D6A0' : active ? '#B83228' : '#F1F5F9',
                    color: (done2 || active) ? '#fff' : '#9CA3AF',
                    fontSize: 13, fontWeight: 700, transition: 'background .2s',
                  }}>
                    {done2 ? <Check size={14} /> : n}
                  </div>
                  <span className="step-label" style={{ color: active ? '#B83228' : done2 ? '#06D6A0' : '#9CA3AF' }}>
                    {s}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ width: 44, height: 1, background: done2 ? '#06D6A0' : '#E5E7EB', margin: '0 10px', transition: 'background .3s' }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="co-grid">

          {/* ════════ FORMULAIRE ════════ */}
          <div className="co-form">

            {/* ÉTAPE 1 — Livraison */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 300, margin: '0 0 6px' }}>
                  {t('checkout.step1.title')}
                </h2>
                <p style={{ color: '#6A6F78', fontSize: 13, margin: '0 0 28px' }}>
                  {t('checkout.step1.desc')}
                </p>

                <div className="co-row2">
                  <Field label={t('checkout.step1.lastNameLabel')}  value={form.nom}    onChange={v => setField('nom', v)}    placeholder={t('checkout.step1.lastNamePlaceholder')}  error={errors.nom} />
                  <Field label={t('checkout.step1.firstNameLabel')} value={form.prenom} onChange={v => setField('prenom', v)} placeholder={t('checkout.step1.firstNamePlaceholder')} error={errors.prenom} />
                </div>

                <Field label={t('checkout.step1.emailLabel')} value={form.email} onChange={v => setField('email', v)} type="email" placeholder={t('checkout.step1.emailPlaceholder')} error={errors.email} />

                <Field
                  label={t('checkout.step1.phoneLabel')}
                  value={form.tel}
                  onChange={v => setField('tel', v)}
                  type="tel"
                  placeholder={t('checkout.step1.phonePlaceholder')}
                  error={errors.tel}
                />

                <Field label={t('checkout.step1.addressLabel')} value={form.adresse} onChange={v => setField('adresse', v)} placeholder={t('checkout.step1.addressPlaceholder')} error={errors.adresse} />

                <div className="co-row2">
                  <CitySelect value={form.ville} onChange={v => setField('ville', v)} error={errors.ville} />
                  <QuartierSelect value={form.quartier} onChange={v => setField('quartier', v)} error={errors.quartier} />
                </div>

                <Field
                  label={t('checkout.step1.referenceLabel')}
                  value={form.reference}
                  onChange={v => setField('reference', v)}
                  placeholder={t('checkout.step1.referencePlaceholder')}
                />

                <p style={{ fontSize: 12.5, color: '#6A6F78', margin: '0 0 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {t('checkout.step1.deliveryNote', { fee: fmt(DELIVERY_FEE) })}
                </p>

                <button
                  onClick={() => { if (validateStep1()) setStep(2); }}
                  style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg,#B83228,#8E241D)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 10 }}
                >
                  {t('checkout.step1.continueButton')}
                </button>
              </div>
            )}

            {/* ÉTAPE 2 — Paiement */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 300, margin: '0 0 6px' }}>
                  {t('checkout.step2.title')}
                </h2>
                <p style={{ color: '#6A6F78', fontSize: 13, margin: '0 0 28px' }}>
                  {t('checkout.step2.desc')}
                </p>

                <div className="pay-grid">
                  {PAYMENT.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setPay(m.id)}
                      className={`pay-card${pay === m.id ? ' pay-card--active' : ''}`}
                    >
                      {pay === m.id && <div className="pay-card__check"><Check size={14} /></div>}
                      <PaymentLogo type={m.id} />
                      <div className="pay-card__label">{m.label}</div>
                      <div className="pay-card__desc">{m.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{ padding: '15px 20px', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderRadius: 10, color: '#374151' }}
                  >
                    {t('checkout.step2.backButton')}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    style={{ flex: 1, padding: 15, background: 'linear-gradient(135deg,#B83228,#8E241D)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 10 }}
                  >
                    {t('checkout.step2.confirmButton')}
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — Vérification */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 300, margin: '0 0 6px' }}>
                  {t('checkout.step3.title')}
                </h2>
                <p style={{ color: '#6A6F78', fontSize: 13, margin: '0 0 24px' }}>
                  {t('checkout.step3.desc')}
                </p>

                {/* Récap livraison */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid rgba(26,26,26,.09)', padding: '18px 20px', marginBottom: 12 }}>
                  <p style={{ ...LABEL_STYLE, margin: '0 0 10px' }}>{t('checkout.step3.deliveryLabel')}</p>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>
                    {form.prenom} {form.nom} · {form.tel}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: '#4B5563' }}>
                    {[form.adresse, form.quartier, form.reference].filter(Boolean).join(', ')}, {form.ville}
                  </p>
                </div>

                {/* Récap paiement */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid rgba(26,26,26,.09)', padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <PaymentLogo type={pay} size={40} />
                  <div>
                    <p style={{ ...LABEL_STYLE, margin: '0 0 6px' }}>{t('checkout.step3.paymentLabel')}</p>
                    <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 600 }}>{paymentOption?.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6A6F78' }}>{paymentOption?.desc}</p>
                  </div>
                </div>

                {/* Articles */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid rgba(26,26,26,.09)', marginBottom: 20, overflow: 'hidden' }}>
                  <p style={{ ...LABEL_STYLE, margin: 0, padding: '14px 20px', borderBottom: '1px solid rgba(26,26,26,.07)' }}>
                    {t('checkout.step3.itemsLabel')}
                  </p>
                  {cartItems.map((item, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: i < cartItems.length - 1 ? '1px solid rgba(26,26,26,.06)' : 'none', alignItems: 'center' }}
                    >
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: 52, height: 66, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                        : <div style={{ width: 52, height: 66, background: 'linear-gradient(135deg,#f5f0e8,#ede5d8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👗</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#6A6F78' }}>
                          {[
                            item.size && t('checkout.step3.sizeLabel', { size: item.size }),
                            item.color && t('checkout.step3.colorLabel', { color: item.color }),
                            t('checkout.step3.qtyLabel', { qty: item.qty }),
                          ].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                        {fmt(item.price * item.qty)} <span style={{ fontSize: 11, fontWeight: 500, color: '#6A6F78' }}>FCFA</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Erreur de soumission */}
                {submitError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#B91C1C', fontSize: 14 }}>
                    <AlertTriangle size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep(2)}
                    disabled={submitting}
                    style={{ padding: '15px 20px', background: '#F3F4F6', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderRadius: 10, color: '#374151', opacity: submitting ? .6 : 1 }}
                  >
                    {t('checkout.step3.backButton')}
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={submitting}
                    style={{ flex: 1, padding: 15, background: submitting ? '#6B7280' : 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 10, transition: 'background .2s' }}
                  >
                    {submitting ? (<><Loader2 size={16} className="spin-icon" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> {t('checkout.step3.submitting')}</>) : (<><Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> {t('checkout.step3.submitButton')}</>)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ════════ SIDEBAR ════════ */}
          <div className="co-sidebar">
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 400, margin: '0 0 20px' }}>
              {t('checkout.sidebar.title')}
            </h3>

            <div style={{ marginBottom: 16 }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, fontSize: 13, marginBottom: 10 }}>
                  <span style={{ color: '#6A6F78', lineHeight: 1.4 }}>
                    {item.name} <span style={{ color: '#9CA3AF' }}>×{item.qty}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {fmt(item.price * item.qty)} FCFA
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'rgba(26,26,26,.09)', marginBottom: 14 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: '#4B5563' }}>
              <span>{t('checkout.sidebar.subtotal')}</span>
              <span>{fmt(subtotal)} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 18, color: '#4B5563' }}>
              <span>{t('checkout.sidebar.delivery')}</span>
              <span style={{ fontWeight: 700, color: '#B83228' }}>
                {fmt(DELIVERY_FEE)} FCFA
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, paddingTop: 14, borderTop: '2px solid rgba(26,26,26,.10)', marginBottom: 22 }}>
              <span>{t('checkout.sidebar.total')}</span>
              <span>{fmt(total)} FCFA</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {PAYMENT.map(m => (
                <span key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 5px', background: '#F9F9F9', border: '1px solid rgba(26,26,26,.08)', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#374151' }}>
                  <PaymentLogo type={m.id} size={18} />
                  {m.label}
                </span>
              ))}
            </div>

            {/* Légal */}
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(26,26,26,.08)', fontSize: 11, color: '#9CA3AF', lineHeight: 1.65 }}>
              <p style={{ margin: '0 0 6px' }}>
                {t('checkout.legal.withdrawal')}
              </p>
              <p style={{ margin: 0 }}>{t('checkout.legal.pricesInfo')}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}