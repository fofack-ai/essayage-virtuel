import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';


/* ─── Constantes (Statiques pour le style, labels gérés dynamiquement dans le composant) ─── */
const STATUS_MAP_STYLES = {
  pending:    { color: '#D97706', bg: '#FFFBEB' },
  processing: { color: '#2563EB', bg: '#EFF6FF' },
  shipped:    { color: '#7C3AED', bg: '#F5F3FF' },
  delivered:  { color: '#059669', bg: '#ECFDF5' },
  cancelled:  { color: '#DC2626', bg: '#FEF2F2' },
};

const LABEL_STYLE = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
  textTransform: 'uppercase', color: '#9CA3AF', margin: 0,
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [expanded, setExpanded]       = useState(null);
  // Cache des détails (articles) par orderId
  const [details, setDetails]         = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);

  /* ── Map des statuts traduits ── */
  const getStatusLabel = (statusKey) => {
    return t(`orders.status.${statusKey}`, statusKey);
  };

  /* ── Map des paiements traduits ── */
  const getPaymentLabel = (payKey) => {
    switch(payKey) {
      case 'orange_money':
        return `🟠 ${t('orders.payment.orange_money', 'Orange Money')}`;
      case 'mtn_mobile_money':
        return `🟡 ${t('orders.payment.mtn_mobile_money', 'MTN Mobile Money')}`;
      case 'cash_on_delivery':
        return `🤝 ${t('orders.payment.cash_on_delivery', 'À la livraison')}`;
      default:
        return payKey;
    }
  };

  /* ── Chargement de la liste ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.data || []);
      } catch (err) {
        setError(err.message || t('orders.errorLoad', 'Impossible de charger vos commandes.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, t]);

  /* ── Expand : charge les détails (articles) à la demande ── */
  const handleExpand = async (orderId) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    // Déjà en cache → pas besoin de re-fetch
    if (details[orderId]) return;

    setLoadingDetail(orderId);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setDetails(prev => ({ ...prev, [orderId]: res.data }));
    } catch {
      // Si le détail échoue on affiche quand même l'ordre sans articles
    } finally {
      setLoadingDetail(null);
    }
  };

  // Formatage adapté à la langue active
  const currentLang = i18n.language?.slice(0, 2) || 'fr';
  const fmt     = n => Number(n || 0).toLocaleString(currentLang === 'fr' ? 'fr-FR' : 'en-US');
  const fmtDate = d => new Date(d).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ── Loader ── */
  if (authLoading || loading) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ paddingTop: 72, minHeight: '100vh', background: '#F9F9F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#B83228', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6A6F78', fontSize: 14, margin: 0 }}>{t('orders.loading', 'Chargement…')}</p>
      </div>
    </>
  );

  /* ── Rendu ── */
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .orders-page { padding-top: 72px; min-height: 100vh; background: #F9F9F9; }
        .orders-hero { background: #1A1A1A; color: #fff; text-align: center; padding: clamp(40px,6vw,70px) 24px; }
        .orders-container { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; }
        .order-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,.07); overflow: hidden; margin-bottom: 14px; }
        .order-head { display: flex; align-items: center; gap: 16px; padding: 18px 22px; cursor: pointer; user-select: none; }
        .order-meta { flex: 1; min-width: 0; }
        .order-total-col { text-align: right; flex-shrink: 0; }
        .order-detail { border-top: 1px solid rgba(26,26,26,.07); padding: 18px 22px; }
        @media (max-width: 640px) {
          .order-head { flex-wrap: wrap; gap: 10px; padding: 14px 16px; }
          .order-total-col { text-align: left; }
          .order-detail { padding: 14px 16px; }
          .orders-container { padding: 24px 14px 60px; }
        }

        /* ─── AMÉLIORATIONS RESPONSIVE ─── */

        /* ─── TABLETTE ─── */
        @media (max-width: 900px) {
          .orders-container {
            padding: 24px 20px 60px !important;
          }

          .order-head {
            padding: 14px 18px !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }

          .order-meta p:first-child {
            font-size: 14px !important;
          }

          .order-total-col p:first-child {
            font-size: 18px !important;
          }

          .order-detail {
            padding: 14px 18px !important;
          }
        }

        /* ─── MOBILE ─── */
        @media (max-width: 640px) {
          .orders-container {
            padding: 16px 12px 80px !important;
          }

          /* ── Hero ── */
          .orders-hero {
            padding: 30px 16px 24px !important;
          }

          .orders-hero h1 {
            font-size: 32px !important;
          }

          /* ── En-tête commande ── */
          .order-head {
            padding: 12px 14px !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          .order-head > div:first-child {
            font-size: 10px !important;
            padding: 4px 10px !important;
          }

          .order-meta p:first-child {
            font-size: 13px !important;
          }

          .order-meta p:last-child {
            font-size: 11px !important;
          }

          .order-total-col p:first-child {
            font-size: 16px !important;
          }

          .order-total-col p:last-child {
            font-size: 10px !important;
          }

          .order-head > div:last-child {
            font-size: 15px !important;
          }

          /* ── Détail commande ── */
          .order-detail {
            padding: 12px 14px !important;
          }

          .order-detail .order-item-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            padding: 8px 0 !important;
          }

          .order-detail .order-item-row img,
          .order-detail .order-item-row > div:first-child {
            width: 40px !important;
            height: 50px !important;
            font-size: 16px !important;
          }

          .order-detail .order-item-row > div:nth-child(2) p:first-child {
            font-size: 13px !important;
          }

          .order-detail .order-item-row > div:nth-child(2) p:last-child {
            font-size: 11px !important;
          }

          .order-detail .order-item-row > div:last-child {
            font-size: 14px !important;
            align-self: flex-end !important;
          }

          /* ── Récapitulatif prix ── */
          .order-detail .order-summary-box {
            padding: 12px 14px !important;
            margin: 12px 0 !important;
          }

          .order-detail .order-summary-box > div:first-child {
            font-size: 12px !important;
          }

          .order-detail .order-summary-box > div:last-child {
            font-size: 14px !important;
          }

          /* ── Adresse ── */
          .order-detail .order-address p:first-child {
            font-size: 10px !important;
            margin-bottom: 6px !important;
          }

          .order-detail .order-address p:last-child {
            font-size: 13px !important;
          }

          /* ── Bouton retour ── */
          .order-detail .order-back-link {
            font-size: 12px !important;
          }

          /* ── État vide ── */
          .orders-empty {
            padding: 30px 20px !important;
          }

          .orders-empty h2 {
            font-size: 28px !important;
          }

          .orders-empty p {
            font-size: 14px !important;
          }

          .orders-empty a {
            padding: 12px 24px !important;
            font-size: 13px !important;
          }
        }

        /* ─── TRÈS PETIT ÉCRAN (iPhone SE) ─── */
        @media (max-width: 420px) {
          .orders-container {
            padding: 12px 8px 80px !important;
          }

          .orders-hero {
            padding: 24px 12px 20px !important;
          }

          .orders-hero h1 {
            font-size: 26px !important;
          }

          .order-head {
            padding: 10px 12px !important;
          }

          .order-meta p:first-child {
            font-size: 12px !important;
          }

          .order-total-col p:first-child {
            font-size: 14px !important;
          }

          .order-detail {
            padding: 10px 12px !important;
          }

          .order-detail .order-item-row {
            padding: 6px 0 !important;
          }

          .order-detail .order-item-row img,
          .order-detail .order-item-row > div:first-child {
            width: 34px !important;
            height: 42px !important;
            font-size: 14px !important;
          }

          .order-detail .order-item-row > div:nth-child(2) p:first-child {
            font-size: 12px !important;
          }

          .order-detail .order-item-row > div:last-child {
            font-size: 13px !important;
          }

          .order-detail .order-summary-box {
            padding: 10px 12px !important;
          }

          .order-detail .order-summary-box > div:last-child {
            font-size: 13px !important;
          }
        }
      `}</style>

      <div className="orders-page">
        {/* Hero */}
        <div className="orders-hero">
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 12px' }}>
            {t('orders.myAccount', 'Mon compte')}
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,68px)', fontWeight: 300, margin: 0 }}>
            {t('orders.title', 'Mes commandes')}
          </h1>
        </div>

        <div className="orders-container">
          {/* Erreur */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#B91C1C', fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Liste vide */}
          {!loading && orders.length === 0 && (
            <div className="orders-empty" style={{ background: '#fff', borderRadius: 16, padding: '50px 30px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 400, margin: '0 0 12px', color: '#1A1A1A' }}>
                {t('orders.empty.title', 'Aucune commande pour le moment')}
              </h2>
              <p style={{ fontSize: 15, color: '#6A6F78', margin: '0 0 28px', lineHeight: 1.6 }}>
                {t('orders.empty.desc', 'Vos commandes apparaîtront ici dès qu’elles auront été passées.')}
              </p>
              <Link to="/catalogue" style={{ display: 'inline-block', background: '#1A1A1A', color: '#fff', padding: '14px 32px', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'background .2s' }}>
                {t('orders.empty.btn', 'Découvrir la collection')}
              </Link>
            </div>
          )}

          {/* Liste des commandes */}
          {orders.map(order => {
            const isExp = expanded === order.id;
            const styleConf = STATUS_MAP_STYLES[order.status] || { color: '#6A6F78', bg: '#F3F4F6' };
            const detailList = details[order.id] || [];
            const isDetLoading = loadingDetail === order.id;

            return (
              <div key={order.id} className="order-card">
                {/* Head */}
                <div className="order-head" onClick={() => handleExpand(order.id)}>
                  {/* Badge statut */}
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, padding: '6px 12px', borderRadius: 30, color: styleConf.color, background: styleConf.bg }}>
                    {getStatusLabel(order.status)}
                  </div>

                  {/* Infos commande */}
                  <div className="order-meta">
                    <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                      {t('orders.orderId', 'Commande')} #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                      {fmtDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Prix total */}
                  <div className="order-total-col">
                    <p style={{ margin: '0 0 3px', fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>
                      {fmt(order.total)} <span style={{ fontSize: 13, fontWeight: 500 }}>FCFA</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
                      {getPaymentLabel(order.paymentMethod)}
                    </p>
                  </div>

                  {/* Indicateur de développement */}
                  <div style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 300, transform: isExp ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                    ➔
                  </div>
                </div>

                {/* Detail */}
                {isExp && (
                  <div className="order-detail">
                    {isDetLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                        <div style={{ width: 18, height: 18, border: '2px solid #E5E7EB', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 13, color: '#6A6F78' }}>{t('orders.loadingDetails', 'Chargement des articles…')}</span>
                      </div>
                    ) : (
                      <>
                        {/* Articles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                          {detailList.map((item, idx) => {
                            const name = item.productName || item.product?.name || t('orders.unnamedItem', 'Article sans nom');
                            const size = item.size || 'N/A';
                            const qty  = item.quantity || 1;
                            const prc  = item.price || 0;
                            const img  = getImageUrl(item.productImage || item.product?.images?.[0]);

                            return (
                              <div key={idx} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(26,26,26,.04)' }}>
                                {img ? (
                                  <img src={img} alt={name} style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                                ) : (
                                  <div style={{ width: 44, height: 56, background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {name}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 12, color: '#6A6F78' }}>
                                    {t('orders.itemSpec', 'Taille')} : <strong>{size}</strong> • {t('orders.itemQty', 'Qté')} : <strong>{qty}</strong>
                                  </p>
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>
                                  {fmt(prc * qty)} FCFA
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Récapitulatif financier */}
                        <div className="order-summary-box" style={{ background: '#F8F9FA', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6A6F78', marginBottom: 8 }}>
                            <span>{t('orders.subtotal', 'Sous-total')}</span>
                            <span>{fmt(order.total)} FCFA</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6A6F78', marginBottom: 8 }}>
                            <span>{t('orders.deliveryFee', 'Livraison')}</span>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{t('orders.free', 'Gratuit')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, paddingTop: 10, borderTop: '1px solid rgba(26,26,26,.09)' }}>
                            <span>Total</span>
                            <span>{fmt(order.total)} FCFA</span>
                          </div>
                        </div>

                        {/* Adresse */}
                        {order.deliveryAddress && (
                          <div style={{ marginBottom: 14 }} className="order-address">
                            <p style={{ ...LABEL_STYLE, marginBottom: 8 }}>{t('orders.shippingAddress', 'Adresse de livraison')}</p>
                            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                              {order.deliveryAddress}, {order.deliveryCity}
                              {order.deliveryPhone && (
                                <><br /><span style={{ color: '#6A6F78', fontSize: 13 }}>{order.deliveryPhone}</span></>
                              )}
                            </p>
                          </div>
                        )}

                        <Link to="/catalogue" className="order-back-link" style={{ fontSize: 13, color: '#355C86', textDecoration: 'none', fontWeight: 600 }}>
                          ← {t('orders.continueShopping', 'Continuer mes achats')}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}