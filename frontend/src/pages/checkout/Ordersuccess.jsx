import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

/*
 * Page de retour PayDunya : c'est ici que le client atterrit après avoir
 * payé (ou annulé) sur la page hébergée PayDunya — voir return_url dans
 * paydunyaService.js côté backend.
 *
 * Le webhook de callback (serveur à serveur) est la source de vérité pour
 * marquer la commande payée, mais il arrive parfois quelques secondes après
 * que le client soit revenu sur le site. On poll donc brièvement le statut
 * du paiement le temps que le callback arrive, plutôt que de se fier
 * uniquement à ce que PayDunya met dans l'URL de retour.
 */

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 10; // ~30s

export default function OrderSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'paid' | 'processing' | 'failed' | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const attemptsRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      setError(t('orderSuccess.missingOrder'));
      setLoading(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        const [orderRes, paymentRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/payments/orders/${orderId}/payment`),
        ]);
        if (cancelled) return;

        setOrder(orderRes.data);
        const status = paymentRes.data?.status;
        setPaymentStatus(status);
        setLoading(false);

        // Le webhook n'est peut-être pas encore arrivé : on retente un peu.
        if (status !== 'paid' && attemptsRef.current < POLL_MAX_ATTEMPTS) {
          attemptsRef.current += 1;
          timerRef.current = setTimeout(check, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || t('orderSuccess.genericError'));
        setLoading(false);
      }
    };

    check();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const wrapStyle = {
    paddingTop: 64, minHeight: '100vh', background: '#1A1A1A',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', color: '#fff', textAlign: 'center',
    padding: '64px 24px',
  };

  if (loading) {
    return (
      <div style={wrapStyle}>
        <Loader2 size={48} color="#c9a96e" style={{ marginBottom: 20, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,.6)' }}>{t('orderSuccess.checking')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={wrapStyle}>
        <AlertTriangle size={56} color="#B83228" style={{ marginBottom: 20 }} />
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 300, marginBottom: 16 }}>
          {t('orderSuccess.errorTitle')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,.55)', maxWidth: 400, marginBottom: 28 }}>{error}</p>
        <button
          onClick={() => navigate('/orders')}
          style={{ padding: '13px 26px', background: '#c9a96e', color: '#1A1A1A', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          {t('orderSuccess.viewOrders')}
        </button>
      </div>
    );
  }

  const isPaid = paymentStatus === 'paid';
  const isStillProcessing = !isPaid && attemptsRef.current >= POLL_MAX_ATTEMPTS;

  return (
    <div style={wrapStyle}>
      {isPaid ? (
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,160,67,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={36} color="#2EA043" />
        </div>
      ) : (
        <Loader2 size={48} color="#c9a96e" style={{ marginBottom: 20, animation: 'spin 1s linear infinite' }} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,5vw,50px)', fontWeight: 300, margin: '0 0 20px' }}>
        {isPaid
          ? <>{t('orderSuccess.paidTitleLine')} <em style={{ color: '#c9a96e' }}>{t('orderSuccess.paidTitleHighlight')}</em></>
          : t('orderSuccess.pendingTitle')}
      </h1>

      {order && (
        <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '16px 32px', marginBottom: 24, display: 'inline-block' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>
            {t('orderSuccess.orderNumberLabel')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#c9a96e', margin: 0 }}>
            {order.orderNumber}
          </p>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,.55)', maxWidth: 420, lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
        {isPaid
          ? t('orderSuccess.paidMessage')
          : isStillProcessing
            ? t('orderSuccess.stillProcessingMessage')
            : t('orderSuccess.pendingMessage')}
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{ padding: '13px 26px', background: '#c9a96e', color: '#1A1A1A', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          {t('orderSuccess.viewOrders')}
        </button>
        <Link
          to="/"
          style={{ padding: '13px 26px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          {t('orderSuccess.backHome')}
        </Link>
      </div>
    </div>
  );
}