import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useCart } from "../../context/CartContext";
import { api, getImageUrl } from "../../services/api";
import { FaWhatsapp } from "react-icons/fa";
import LoadingPage from '../../components/common/LoadingPage';

import { Heart, Share2, Sparkles, ShoppingBag, ShieldCheck, AlertTriangle, Check, X } from 'lucide-react';
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Numéro WhatsApp de la boutique (format international sans + ni espaces)
const SHOP_WHATSAPP = "237671207375";

const COLOR_NAMES = {
  '#c9a96e': 'Or Sable',
  '#c4573a': 'Terracotta',
  '#2d2420': 'Noir Ébène',
  '#7a8c6e': 'Vert Sauge',
  '#f5f0e8': 'Blanc Ivoire',
  '#1a1410': 'Noir Profond',
  '#355C86': 'Bleu',
  'Green': 'Vert',
};

function colorLabel(c) {
  return COLOR_NAMES[c] || c;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const p = response.data;
        if (!p) { setProduct(null); return; }

        const formattedProduct = {
          id: p.id,
          name: p.name,
          brand: p.brand || "—",
          category: p.categoryName || p.category || t('product.fallback.category'),
          material: p.material || p.matiere || null,
          condition: p.condition || t('product.fallback.condition'),
          price: Number(p.price),
          description: p.description || t('product.fallback.description'),
          colors: p.color ? [p.color] : ["#1a1410"],
          sizes: p.sizes?.length
            ? p.sizes.map((s) => ({
                id: s.sizeId || s.id,
                label: s.sizeLabel || s.label || s.size,
                stock: Number(s.stock || 0),
              }))
            : [],
          image: getImageUrl(p.image || p.imageUrl || p.mainImage || p.images?.[0]?.imageUrl),
        };

        setProduct(formattedProduct);
        setSelectedColor(formattedProduct.colors[0]);
        const firstAvailable = formattedProduct.sizes.find((s) => s.stock > 0);
        setSelectedSize(firstAvailable ? firstAvailable.label : (formattedProduct.sizes[0]?.label || ""));
      } catch (error) {
        console.error("Erreur produit :", error.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, t]);

  if (loading) {
    return <LoadingPage message={t('product.loading')} />;
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 32, marginBottom: 12 }}>
          {t('product.notFound.title')}
        </h2>
        <p style={{ color: '#6A6F78', marginBottom: 24 }}>
          {t('product.notFound.desc')}
        </p>
        <Link to="/catalogue" className="btn-outline">{t('product.notFound.backToCatalogue')}</Link>
      </div>
    );
  }
  const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
  const isOutOfStock = totalStock === 0;

  const productImg = product.image || "/product-placeholder.jpg";

const handleAdd = async () => {
    const selectedSizeInfo = product.sizes.find((s) => s.label === selectedSize);
    if (!selectedSizeInfo || selectedSizeInfo.stock <= 0) {
      setMessage({ type: 'error', text: t('product.messages.selectSize') });
      return;
    }
    try {
      await addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        image: productImg,
        size: selectedSize,
        sizeStock: selectedSizeInfo.stock,
        qty: 1,
      });
      setMessage({ type: 'success', text: t('product.messages.addedToCart', { size: selectedSize }) });
      setAdded(true);
      setTimeout(() => { setAdded(false); setMessage(null); }, 2500);
    } catch (error) {
      // On rend le message du serveur plus clair
      let text = error.message || t('product.messages.addToCartError');
      if (text.includes("n'est disponible qu'en")) {
        const match = text.match(/(\d+) exemplaire/);
        const reste = match ? match[1] : '';
        text = t('product.messages.limitedStock', { count: reste });
      }
      setMessage({ type: 'error', text });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url);
      setMessage({ type: 'success', text: t('product.messages.linkCopied') });
    }
  };

  const whatsappUrl = `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(
    t('product.whatsappMessage', { name: product.name, price: product.price.toLocaleString() })
  )}`;

  const T = { ink: '#1A1A1A', blue: '#355C86', muted: '#6A6F78', border: 'rgba(26,26,26,.11)', card: '#fff' };

  return (
    <div className="product-detail-wrap" style={{ paddingTop: 64, background: '#F5F1EA', minHeight: '100vh' }}>
      <style>{`
        /* ─── RESPONSIVE FICHE PRODUIT ─── */

        /* ─── TABLETTE ─── */
        @media (max-width: 900px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .product-gallery {
            position: static !important;
            height: 500px !important;
            min-height: 400px !important;
          }
          .product-info-col {
            padding: 32px 32px 60px !important;
          }
        }

        /* ─── MOBILE ─── */
        @media (max-width: 640px) {
          .product-detail-wrap {
            padding-top: 0 !important;
          }
          .product-breadcrumb {
            padding: 10px 16px !important;
            font-size: 11px !important;
            flex-wrap: wrap !important;
          }
          .product-gallery {
            height: 420px !important;
            min-height: 350px !important;
          }
          .product-info-col {
            padding: 20px 16px 80px !important;
          }
          .product-info-col h1 {
            font-size: 28px !important;
          }
          .product-price-box {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px 18px !important;
          }
          .product-price-box .price {
            font-size: 26px !important;
          }
          .product-price-box .price small {
            font-size: 14px !important;
          }
          .product-actions-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .product-actions-row button,
          .product-actions-row a {
            width: 100% !important;
            justify-content: center !important;
          }
          .product-detail-toggle {
            padding: 14px 16px !important;
            font-size: 14px !important;
          }
          .product-detail-content {
            padding: 0 16px 20px !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .product-size-grid {
            gap: 6px !important;
          }
          .product-size-grid button {
            min-width: 48px !important;
            height: 54px !important;
            font-size: 12px !important;
            padding: 4px 6px !important;
          }
          .product-size-grid button small {
            font-size: 8px !important;
          }
          .product-description {
            margin-top: 24px !important;
            padding-top: 20px !important;
          }
          .product-description h2 {
            font-size: 20px !important;
          }
          .product-description p {
            font-size: 14px !important;
          }
          .product-reassurance {
            flex-wrap: wrap !important;
            justify-content: center !important;
            font-size: 12px !important;
          }
        }

        /* ─── TRÈS PETIT ÉCRAN ─── */
        @media (max-width: 420px) {
          .product-gallery {
            height: 350px !important;
            min-height: 280px !important;
          }
          .product-info-col {
            padding: 16px 12px 80px !important;
          }
          .product-info-col h1 {
            font-size: 22px !important;
          }
          .product-price-box .price {
            font-size: 22px !important;
          }
          .product-price-box .price small {
            font-size: 12px !important;
          }
          .product-size-grid button {
            min-width: 40px !important;
            height: 46px !important;
            font-size: 11px !important;
          }
          .product-actions-row button,
          .product-actions-row a {
            padding: 14px 16px !important;
            font-size: 12px !important;
          }
          .product-breadcrumb {
            font-size: 10px !important;
            padding: 8px 12px !important;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="product-breadcrumb" style={{ padding: '12px 48px', fontSize: 12, color: T.muted, display: 'flex', gap: 8, borderBottom: `1px solid ${T.border}`, background: '#fff' }}>
        <Link to="/" style={{ color: T.blue, textDecoration: 'none' }}>{t('product.breadcrumb.home')}</Link>
        <span>›</span>
        <Link to="/catalogue" style={{ color: T.blue, textDecoration: 'none' }}>{t('product.breadcrumb.catalogue')}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 'calc(100vh - 104px)' }}>
        {/* Galerie */}
        <div className="product-gallery" style={{
          position: 'sticky', top: 64, height: 'calc(100vh - 104px)',
          background: 'linear-gradient(160deg,#f5f0e8,#ede5d8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <img src={productImg} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Colonne infos */}
        <div className="product-info-col" style={{ padding: '48px 56px', overflowY: 'auto' }}>
          {/* État */}
          <span style={{
            display: 'inline-block', background: 'rgba(53,124,79,.12)', color: '#2E7C4F',
            fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 100, marginBottom: 18,
          }}>
            {product.condition}
          </span>

          {/* Catégorie + Nom */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: T.blue, marginBottom: 8 }}>
            {product.category}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 300, lineHeight: 1.1, marginBottom: 24 }}>
            {product.name}
          </h1>

          {/* Prix + favori + partage */}
          <div className="product-price-box" style={{
            background: T.card, borderRadius: 16, padding: '20px 24px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${T.border}`,
          }}>
            <div className="price" style={{ fontFamily: "'sans-serif',serif", fontSize: 34, fontWeight: 600 }}>
              {product.price.toLocaleString()} <small style={{ fontSize: 16, fontWeight: 300 }}>FCFA</small>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setFavorite(f => !f)} aria-label={t('product.aria.addToFavorites')} style={{
                width: 46, height: 46, borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${favorite ? '#B83228' : T.border}`,
                background: favorite ? 'rgba(184,50,40,.08)' : '#fff',
                fontSize: 20, color: favorite ? '#B83228' : T.muted,
              }}><Heart size={18} fill={favorite ? '#B83228' : 'none'} /></button>
              <button type="button" onClick={handleShare} aria-label={t('product.aria.share')} style={{
                width: 46, height: 46, borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${T.border}`, background: '#fff', fontSize: 18, color: T.muted,
              }}><Share2 size={17} /></button>
            </div>
          </div>

          {/* Détails de l'article (pliable) */}
          <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: 28, overflow: 'hidden' }}>
            <button className="product-detail-toggle" type="button" onClick={() => setDetailsOpen(o => !o)} style={{
              width: '100%', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 16, fontWeight: 600, color: T.ink,
            }}>
              {t('product.detailsToggle')}
              <span style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
            </button>
            {detailsOpen && (
              <div className="product-detail-content" style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
                {[
                  [t('product.detailLabels.brand'), product.brand],
                  [t('product.detailLabels.size'), selectedSize || '—'],
                  [t('product.detailLabels.material'), product.material || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 15, color: T.ink }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Taille */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: T.muted, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              {t('product.sizeSection.label')} <Link to="/size-guide" style={{ color: T.blue, textTransform: 'none', letterSpacing: 0, textDecoration: 'none' }}>{t('product.sizeSection.guideLink')}</Link>
            </div>
            <div className="product-size-grid" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_SIZES.map(s => {
                const sizeInfo = product.sizes.find((size) => size.label === s);
                const stock = sizeInfo ? sizeInfo.stock : 0;
                const available = stock > 0;
                const on = selectedSize === s;
                const lowStock = available && stock <= 3;
                return (
                  <button type="button" key={s} disabled={!available} onClick={() => available && setSelectedSize(s)} style={{
                    minWidth: 56, height: 64, borderRadius: 10, padding: '6px 8px',
                    border: `1.5px solid ${on ? T.ink : T.border}`,
                    background: on ? T.ink : '#fff',
                    color: on ? '#F9F9F9' : !available ? '#ccc' : T.ink,
                    fontSize: 14, fontWeight: 500, cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}>
                    <span style={{ textDecoration: available ? 'none' : 'line-through' }}>{s}</span>
                    <small style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: on ? 'rgba(255,255,255,.75)' : !available ? '#c0392b' : lowStock ? '#c0392b' : '#2E7C4F',
                    }}>
                      {!available ? t('product.stock.outOfStock') : lowStock ? t('product.stock.lowStock', { count: stock }) : t('product.stock.available', { count: stock })}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message intégré (remplace les alertes système) */}
          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
              background: message.type === 'error' ? 'rgba(192,57,43,.08)' : 'rgba(6,214,160,.10)',
              border: `1px solid ${message.type === 'error' ? 'rgba(192,57,43,.25)' : 'rgba(6,214,160,.35)'}`,
              color: message.type === 'error' ? '#B83228' : '#0a8a68',
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{message.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}</span>
              <span style={{ flex: 1 }}>{message.text}</span>
              <button type="button" onClick={() => setMessage(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                color: 'inherit', opacity: .6, lineHeight: 1,
              }} aria-label={t('product.aria.close')}>×</button>
            </div>
          )}

          {/* Essayage virtuel (bien visible) */}
          <div className="product-actions-row" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="button" onClick={() => navigate(`/tryon?productId=${product.id}`)} disabled={isOutOfStock} style={{
              width: '100%', padding: 18, borderRadius: 12,
              background: isOutOfStock ? '#E0E0E0' : 'linear-gradient(135deg,#355C86,#26384D)',
              color: isOutOfStock ? '#999' : '#F9F9F9', border: 'none',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {t('product.tryOnButton')}
            </button>

            {/* Ajouter au panier */}
            <button type="button" onClick={handleAdd} disabled={isOutOfStock} style={{
              width: '100%', padding: 18, borderRadius: 12,
              background: isOutOfStock ? '#E0E0E0' : (added ? '#06D6A0' : '#E30613'),
              color: isOutOfStock ? '#999' : '#fff',
              border: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
            }}>
              {isOutOfStock ? (<><X size={16} /> {t('product.addToCart.outOfStock')}</>) : (added ? (<><Check size={16} /> {t('product.addToCart.added')}</>) : (<><ShoppingBag size={16} /> {t('product.addToCart.default')}</>))}
            </button>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
              width: '100%', padding: 16, borderRadius: 12,
              background: 'transparent', color: T.ink, border: `1.5px solid ${T.border}`,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('product.whatsappButton')}
            </a>

            {/* Réassurance */}
            <div className="product-reassurance" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted, justifyContent: 'center' }}>
              <span style={{ color: '#2E7C4F', display: 'flex', alignItems: 'center' }}><ShieldCheck size={16} /></span>
              {t('product.reassurance')}
            </div>
          </div>

          {/* Description */}
          <div className="product-description" style={{ marginTop: 32, paddingTop: 28, borderTop: `1px solid ${T.border}` }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 400, marginBottom: 14 }}>
              {t('product.descriptionTitle')}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.muted }}>
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}