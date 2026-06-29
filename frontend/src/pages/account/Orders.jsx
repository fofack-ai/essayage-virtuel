import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';

/* ─── Constantes ─────────────────────────────────────────── */
const STATUS_MAP = {
  pending:    { label: 'En préparation', color: '#D97706', bg: '#FFFBEB' },
  processing: { label: 'En cours',       color: '#2563EB', bg: '#EFF6FF' },
  shipped:    { label: 'Expédiée',       color: '#7C3AED', bg: '#F5F3FF' },
  delivered:  { label: 'Livrée',         color: '#059669', bg: '#ECFDF5' },
  cancelled:  { label: 'Annulée',        color: '#DC2626', bg: '#FEF2F2' },
};

const PAY_LABELS = {
  orange_money:     '🟠 Orange Money',
  mtn_mobile_money: '🟡 MTN Mobile Money',
  cash_on_delivery: '🤝 À la livraison',
};

const LABEL_STYLE = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
  textTransform: 'uppercase', color: '#9CA3AF', margin: 0,
};

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [expanded, setExpanded]       = useState(null);
  // Cache des détails (articles) par orderId
  const [details, setDetails]         = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);

  /* ── Auth guard ── */
  //useEffect(() => {
    //if (!authLoading && !isAuthenticated) navigate('/auth');
  //}, [authLoading, isAuthenticated, navigate]);

  /* ── Chargement de la liste ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.data || []);
      } catch (err) {
        setError(err.message || 'Impossible de charger vos commandes.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

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

  const fmt     = n => Number(n || 0).toLocaleString('fr-FR');
  const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ── Loader ── */
  if (authLoading || loading) return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ paddingTop: 72, minHeight: '100vh', background: '#F9F9F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#B83228', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6A6F78', fontSize: 14, margin: 0 }}>Chargement…</p>
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
      `}</style>

      <div className="orders-page">

        {/* Hero */}
        <div className="orders-hero">
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#c9a96e', margin: '0 0 12px' }}>
            Mon compte
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,68px)', fontWeight: 300, margin: 0 }}>
            Mes commandes
          </h1>
        </div>

        <div className="orders-container">

          {/* Erreur */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#B91C1C', fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* État vide */}
          {!error && orders.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 20, textAlign: 'center', padding: 'clamp(40px,6vw,70px) 32px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 300, margin: '0 0 12px' }}>
                Aucune commande
              </h2>
              <p style={{ color: '#6A6F78', marginBottom: 28, fontSize: 15 }}>
                Vous n'avez pas encore passé de commande.
              </p>
              <Link to="/catalogue" style={{ display: 'inline-block', background: '#1A1A1A', color: '#fff', padding: '13px 28px', borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                Découvrir la boutique
              </Link>
            </div>
          )}

          {/* Liste des commandes */}
          {orders.map(order => {
            const st       = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const isOpen   = expanded === order.id;
            const delLabel = order.deliveryType === 'exp' ? 'Express' : 'Standard';
            const orderDetails = details[order.id];
            const isLoadingItems = loadingDetail === order.id;

            return (
              <div key={order.id} className="order-card">

                {/* En-tête cliquable */}
                <div className="order-head" onClick={() => handleExpand(order.id)}>

                  {/* Badge statut */}
                  <div style={{ background: st.bg, color: st.color, fontWeight: 700, fontSize: 11, letterSpacing: .5, textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {st.label}
                  </div>

                  {/* Infos commande */}
                  <div className="order-meta">
                    <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15 }}>{order.orderNumber}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6A6F78' }}>
                      {fmtDate(order.createdAt)} · {PAY_LABELS[order.paymentMethod] || order.paymentMethod} · {delLabel}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="order-total-col">
                    <p style={{ margin: '0 0 2px', fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, lineHeight: 1 }}>
                      {fmt(order.total)}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>FCFA</p>
                  </div>

                  {/* Chevron */}
                  <div style={{ fontSize: 18, color: '#9CA3AF', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }}>
                    ▾
                  </div>
                </div>

                {/* Détail dépliable */}
                {isOpen && (
                  <div className="order-detail">

                    {/* Loader articles */}
                    {isLoadingItems && (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#6A6F78', fontSize: 13 }}>
                        Chargement des articles…
                      </div>
                    )}

                    {/* Articles */}
                    {!isLoadingItems && (
                      <>
                        <p style={{ ...LABEL_STYLE, marginBottom: 12 }}>Articles</p>
                        {(orderDetails?.items || []).length === 0 ? (
                          <p style={{ fontSize: 13, color: '#6A6F78', marginBottom: 16 }}>Aucun article trouvé.</p>
                        ) : (
                          (orderDetails?.items || []).map((item, i) => (
                            <div
                              key={i}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < orderDetails.items.length - 1 ? '1px solid rgba(26,26,26,.06)' : 'none' }}
                            >
                              {item.productImage
                                ? <img src={getImageUrl(item.productImage)} alt={item.productName} style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                : <div style={{ width: 48, height: 60, background: '#F5F0E8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👗</div>
                              }
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.productName}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6A6F78' }}>
                                  {[item.size && `Taille ${item.size}`, item.color && `Couleur ${item.color}`, `Qté ${item.quantity}`].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                {fmt(item.subtotal)} <span style={{ fontSize: 11, fontWeight: 500, color: '#6A6F78' }}>FCFA</span>
                              </p>
                            </div>
                          ))
                        )}

                        {/* Récapitulatif prix */}
                        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', margin: '16px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563', marginBottom: 8 }}>
                            <span>Livraison ({delLabel})</span>
                            <span style={{ fontWeight: 600, color: Number(order.deliveryFee) === 0 ? '#059669' : '#1A1A1A' }}>
                              {Number(order.deliveryFee) === 0 ? 'Gratuite' : `${fmt(order.deliveryFee)} FCFA`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, paddingTop: 10, borderTop: '1px solid rgba(26,26,26,.09)' }}>
                            <span>Total</span>
                            <span>{fmt(order.total)} FCFA</span>
                          </div>
                        </div>

                        {/* Adresse */}
                        {order.deliveryAddress && (
                          <div style={{ marginBottom: 14 }}>
                            <p style={{ ...LABEL_STYLE, marginBottom: 8 }}>Adresse de livraison</p>
                            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                              {order.deliveryAddress}, {order.deliveryCity}
                              {order.deliveryPhone && (
                                <><br /><span style={{ color: '#6A6F78', fontSize: 13 }}>{order.deliveryPhone}</span></>
                              )}
                            </p>
                          </div>
                        )}

                        <Link to="/catalogue" style={{ fontSize: 13, color: '#355C86', textDecoration: 'none', fontWeight: 600 }}>
                          ← Continuer mes achats
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