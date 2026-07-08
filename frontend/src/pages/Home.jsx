import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';

/* ── Design tokens ── */
const T = {
  ink: '#1A1A1A',
  cream: '#F8F9FA',
  warm: '#F0F2F5',
  white: '#FFFFFF',
  black: '#000000',
  red: '#C0392B',
  redDark: '#8E241D',
  blue: '#5B7FA6',
  blueDark: '#355C86',
  blueNavy: '#26384D',
  blueLight: '#E6EEF6',
  gray: '#6A6F78',
  grayLight: '#E0E0E0',
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.03)',
  muted: '#6A6F78',
};

/* ── Style constants (inchangés) ── */
const HERO_CONTENT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '96px 80px 96px 80px',
  background: T.cream,
  minHeight: 'calc(100vh - 72px)',
};

const HERO_TAG_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(91,127,166,0.08)',
  color: T.blueNavy,
  border: '1px solid rgba(91,127,166,0.12)',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '4px 10px',
  borderRadius: '50px',
  width: 'fit-content',
  marginBottom: '24px',
};

const HERO_TITLE_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(42px,6vw,64px)',
  fontWeight: 300,
  lineHeight: 1.1,
  marginBottom: '20px',
  color: T.ink,
};

const HERO_DESCRIPTION_STYLE = {
  fontSize: '15px',
  color: T.gray,
  maxWidth: '450px',
  lineHeight: 1.7,
  marginBottom: '32px',
};

const HERO_BUTTONS_STYLE = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const HERO_STATS_STYLE = {
  display: 'flex',
  gap: '32px',
  marginTop: '48px',
  paddingTop: '32px',
  borderTop: `1px solid ${T.borderLight}`,
};

const STAT_ITEM_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const STAT_NUMBER_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '32px',
  fontWeight: 600,
  color: T.red,
  lineHeight: 1,
};

const STAT_LABEL_STYLE = {
  fontSize: '12px',
  color: T.gray,
  letterSpacing: '0.5px',
  marginTop: '4px',
  textTransform: 'uppercase',
};

const CATEGORIES_SECTION_STYLE = {
  padding: '80px',
  background: T.cream,
};

const CATEGORIES_HEADER_STYLE = {
  textAlign: 'center',
  marginBottom: '48px',
};

const CATEGORIES_SUBHEADER_STYLE = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: T.blueDark,
  marginBottom: '8px',
};

const CATEGORIES_TITLE_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(28px,4vw,40px)',
  fontWeight: 300,
  color: T.ink,
};

const CATEGORIES_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '24px',
};

const FEATURED_SECTION_STYLE = {
  padding: '80px',
  background: T.warm,
};

const FEATURED_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px',
};

const FEATURED_TITLE_LEFT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
};

const FEATURED_SUBTITLE_STYLE = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: T.blueDark,
  marginBottom: '4px',
};

const FEATURED_TITLE_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(24px,3.5vw,32px)',
  fontWeight: 300,
  color: T.ink,
};

const FEATURED_LINK_STYLE = {
  fontSize: '12px',
  color: T.blueDark,
  textDecoration: 'none',
  fontWeight: 500,
  letterSpacing: '0.5px',
};

const FEATURED_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
};

const IA_BANNER_SECTION_STYLE = {
  margin: '0 80px 80px',
  background: 'linear-gradient(180deg, #1A1A1A 0%, #26384D 100%)',
  borderRadius: '12px',
  padding: '64px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
  alignItems: 'center',
};

const IA_BANNER_CONTENT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
};

const IA_BADGE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(192,57,43,0.15)',
  color: '#f8bbd0',
  fontSize: '10px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '4px 8px',
  borderRadius: '50px',
  marginBottom: '20px',
};

const IA_TITLE_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(28px,4vw,40px)',
  fontWeight: 300,
  color: T.cream,
  lineHeight: 1.2,
  marginBottom: '16px',
};

const IA_DESCRIPTION_STYLE = {
  color: 'rgba(249,249,249,0.7)',
  lineHeight: 1.6,
  marginBottom: '24px',
  maxWidth: '400px',
  fontSize: '14px',
};

const IA_BUTTON_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'linear-gradient(135deg, #C0392B, #8E241D)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  boxShadow: '0 4px 12px rgba(192,57,43,0.15)',
  transition: 'all 0.2s ease',
};

const IA_STEPS_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const IA_STEP_ITEM_STYLE = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
};

const IA_STEP_NUMBER_STYLE = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '24px',
  fontWeight: 600,
  color: T.red,
  lineHeight: 1,
  minWidth: '32px',
};

const IA_STEP_CONTENT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
};

const IA_STEP_TITLE_STYLE = {
  color: T.cream,
  fontWeight: 500,
  marginBottom: '2px',
  fontSize: '13px',
};

const IA_STEP_DESCRIPTION_STYLE = {
  color: 'rgba(249,249,249,0.6)',
  fontSize: '12px',
  lineHeight: 1.5,
};

// Images par défaut (remplacez par vos propres URLs)
const DEFAULT_HERO_IMAGE = '/hero-default.jpg';
const DEFAULT_CATEGORY_IMAGE = '/category-placeholder.jpg';


function ImageWithFallback({ src, alt = '', label = 'TryOn', style = {} }) {
  const [error, setError] = useState(false);
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
       <rect width="100%" height="100%" fill="#EEF3F8"/>
       <text x="50%" y="50%" font-family="DM Sans, sans-serif" font-size="20"
             fill="#6A6F78" text-anchor="middle" dominant-baseline="middle">${label}</text>
     </svg>`
  )}`;

  return (
    <img
      src={error || !src ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalTryons: 0, satisfaction: 98 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Vérifier le cache (valide 5 minutes ET non vide)
        const cached = sessionStorage.getItem('home_data');
        if (cached) {
          const { products: cachedProducts, categories: cachedCategories, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000 && cachedProducts.length > 0) {
            setProducts(cachedProducts);
            setCategories(cachedCategories);
            setStats(prev => ({ ...prev, totalProducts: cachedProducts.length }));
            setLoading(false);
            // Rafraîchir les stats en arrière‑plan
            api.get('/tryons/stats')
              .then(res => setStats(prev => ({ ...prev, totalTryons: res.data?.totalTryons || 0 })))
              .catch(() => {});
            return;
          } else {
            sessionStorage.removeItem('home_data');
          }
        }

        // 2. Charger les données prioritaires (produits limités à 4)
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=4'),
          api.get('/categories'),
        ]);

        // Formater les produits
        const productList = productsRes.data || [];
        const formattedProducts = productList.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || 'TryOn',
          price: parseFloat(p.price) || 0,
          tag: p.stock > 0 ? 'Nouveau' : 'Rupture',
          colors: p.color ? [p.color] : ['#1a1410'],
          image: getImageUrl(p.image),
        }));

        const catList = categoriesRes.data || [];

        // Mettre à jour l'état (affichage immédiat)
        setProducts(formattedProducts);
        setCategories(catList);
        setStats({
          totalProducts: productList.length,
          totalTryons: 0,
          satisfaction: 98,
        });
        setLoading(false);

        // 3. Mettre en cache (seulement si des produits existent)
        if (formattedProducts.length > 0) {
          sessionStorage.setItem('home_data', JSON.stringify({
            products: formattedProducts,
            categories: catList,
            timestamp: Date.now(),
          }));
        }

        // 4. Chargement des stats en arrière‑plan (non bloquant)
        api.get('/tryons/stats')
          .then((res) => {
            setStats(prev => ({
              ...prev,
              totalTryons: res.data?.totalTryons || 0,
            }));
          })
          .catch(() => {});

      } catch (err) {
        setError(err.message);
        console.error('Erreur chargement home :', err);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const featured = useMemo(() => products, [products]);

  if (loading) {
    return <div style={{ paddingTop: '72px', textAlign: 'center', color: '#6A6F78' }}>Chargement...</div>;
  }

  if (error) {
    return <div style={{ paddingTop: '72px', textAlign: 'center', color: T.red }}>Erreur : {error}</div>;
  }

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* ── HERO ── */}
      <section
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
        }}
        aria-label="Hero section"
      >
        <div style={HERO_CONTENT_STYLE}>
          <span style={HERO_TAG_STYLE}>
            <span style={{ color: T.red }}>✦</span> Essayage virtuel par IA
          </span>

          <h1 style={HERO_TITLE_STYLE}>
            La mode africaine<br />
            <em style={{ fontStyle: 'italic', color: T.red }}>réinventée</em><br />
            pour vous
          </h1>

          <p style={HERO_DESCRIPTION_STYLE}>
            Essayez virtuellement des tenues wax, bogolan et ankara grâce à notre cabine IA. Commandez avec confiance.
          </p>

          <div style={HERO_BUTTONS_STYLE}>
            <Link to="/tryon" className="btn-primary" aria-label="Essayer l'essayage virtuel">
              Essayer maintenant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/catalogue" className="btn-outline" aria-label="Voir le catalogue produits">
              Voir le catalogue
            </Link>
          </div>

          {/* Statistiques dynamiques */}
          <div style={HERO_STATS_STYLE} aria-label="Statistics section">
            <div style={STAT_ITEM_STYLE}>
              <div style={STAT_NUMBER_STYLE}>{stats.totalProducts}+</div>
              <div style={STAT_LABEL_STYLE}>Tenues disponibles</div>
            </div>
            <div style={STAT_ITEM_STYLE}>
              <div style={STAT_NUMBER_STYLE}>{stats.satisfaction}%</div>
              <div style={STAT_LABEL_STYLE}>Satisfaction client</div>
            </div>
            <div style={STAT_ITEM_STYLE}>
              <div style={STAT_NUMBER_STYLE}>{stats.totalTryons || 0}+</div>
              <div style={STAT_LABEL_STYLE}>Essayages réalisés</div>
            </div>
          </div>
        </div>

        {/* Image hero droite */}
        <div style={{ position: 'relative', overflow: 'hidden' }} aria-hidden="true">
<ImageWithFallback src={DEFAULT_HERO_IMAGE} alt="" label="TryOn" />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(26,26,26,0.12) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          {/* Badge IA flottant */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              background: 'rgba(250,247,242,0.96)',
              borderRadius: '18px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 18px 50px rgba(26,26,26,0.13)',
            }}
            role="img"
            aria-label="Badge indiquant un score IA de 94% pour la compatibilité morphologique"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: T.blueLight,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
              aria-hidden="true"
            >
              ✨
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: T.muted,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                Score IA
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: T.red,
                  lineHeight: 1,
                }}
              >
                94%
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: T.muted,
                  marginTop: '2px',
                }}
              >
                Compatibilité morphologique
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES DYNAMIQUES ── */}
      <section style={CATEGORIES_SECTION_STYLE} aria-label="Product categories section">
        <div style={CATEGORIES_HEADER_STYLE}>
          <div style={CATEGORIES_SUBHEADER_STYLE}>Collections</div>
          <h2 style={CATEGORIES_TITLE_STYLE}>
            Explorez nos <em style={{ fontStyle: 'italic', color: T.red }}>catégories</em>
          </h2>
        </div>
        <div style={CATEGORIES_GRID_STYLE}>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?category=${cat.slug || cat.id}`}
                style={{ textDecoration: 'none' }}
                aria-label={`Découvrir la catégorie ${cat.name}`}
              >
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    height: '320px',
                    cursor: 'pointer',
                    transition: 'transform .3s ease, box-shadow .3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(26,26,26,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${DEFAULT_CATEGORY_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden="true" />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(26,26,26,0.75) 0%, transparent 55%)',
                    }}
                    aria-hidden="true"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: '24px',
                    }}
                  >
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '20px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                      }}
                    >
                      {cat.name}
                    </div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    >
                      {cat.productsCount || 'Découvrir'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Aucune catégorie disponible</p>
          )}
        </div>
      </section>

      {/* ── PRODUITS VEDETTES ── */}
      <section style={FEATURED_SECTION_STYLE} aria-label="Featured products section">
        <div style={FEATURED_HEADER_STYLE}>
          <div style={FEATURED_TITLE_LEFT_STYLE}>
            <div style={FEATURED_SUBTITLE_STYLE}>Sélection</div>
            <h2 style={FEATURED_TITLE_STYLE}>
              Produits <em style={{ fontStyle: 'italic', color: T.red }}>vedettes</em>
            </h2>
          </div>
          <Link to="/catalogue" style={FEATURED_LINK_STYLE} aria-label="Voir tous les produits vedettes">
            Voir tout →
          </Link>
        </div>
        <div style={FEATURED_GRID_STYLE}>
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p>Aucun produit disponible</p>
          )}
        </div>
      </section>

      {/* ── BANNIÈRE IA ── */}
      <section style={IA_BANNER_SECTION_STYLE} aria-label="IA banner section">
        <div style={IA_BANNER_CONTENT_STYLE}>
          <span style={IA_BADGE_STYLE}>✦ Technologie IA</span>
          <h2 style={IA_TITLE_STYLE}>
            Votre cabine d'essayage<br />
            <em style={{ fontStyle: 'italic', color: '#f5b7b1' }}>virtuelle</em>
          </h2>
          <p style={IA_DESCRIPTION_STYLE}>
            Uploadez votre photo, notre IA analyse votre morphologie et vous propose les tailles et coupes les plus
            adaptées.
          </p>
          <Link to="/catalogue" style={IA_BUTTON_STYLE} aria-label="Commencer l'essayage virtuel gratuitement">
            Essayer gratuitement →
          </Link>
        </div>
        <div style={IA_STEPS_STYLE}>
          {[
            { n: '01', t: 'Uploadez votre photo', d: 'Une photo de face en tenue ajustée suffit.' },
            { n: '02', t: 'Analyse morphologique', d: 'Notre IA détecte vos mesures en quelques secondes.' },
            { n: '03', t: 'Score de compatibilité', d: "Chaque vêtement reçoit un score d'adéquation." },
            { n: '04', t: 'Commandez en confiance', d: 'Ajustements de taille inclus automatiquement.' },
          ].map((s) => (
            <div key={s.n} style={IA_STEP_ITEM_STYLE}>
              <span style={IA_STEP_NUMBER_STYLE}>{s.n}</span>
              <div style={IA_STEP_CONTENT_STYLE}>
                <div style={IA_STEP_TITLE_STYLE}>{s.t}</div>
                <div style={IA_STEP_DESCRIPTION_STYLE}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── ProductCard ──
function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/product/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      aria-label={`Voir les détails du produit ${product.name}`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          background: '#fff',
          border: `1px solid ${hovered ? 'rgba(91,127,166,0.32)' : T.border}`,
          boxShadow: hovered ? '0 22px 52px rgba(26,26,26,0.13)' : '0 12px 34px rgba(26,26,26,0.075)',
          transition: 'all .3s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
        }}
        role="group"
        aria-labelledby={`product-title-${product.id}`}
      >
        <div
          style={{
            position: 'relative',
            height: '280px',
            overflow: 'hidden',
          }}
        >
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          label={product.brand || product.name}
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform .4s ease' }}
        />
          {product.tag && (
            <span
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: product.tag === 'Nouveau' ? 'rgba(91,127,166,0.14)' : T.red,
                color: product.tag === 'Nouveau' ? T.blueDark : '#fff',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '1px',
                padding: '4px 10px',
                borderRadius: '100px',
              }}
              aria-hidden="true"
            >
              {product.tag}
            </span>
          )}
          {hovered && (
            <Link
              to={`/tryon?productId=${product.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: T.blueLight,
                color: T.blueNavy,
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '10px 20px',
                borderRadius: '100px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(26,26,26,0.12)',
              }}
              aria-label="Essayer ce produit virtuellement"
            >
              Essayer virtuellement
            </Link>
          )}
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          <div
            id={`product-brand-${product.id}`}
            style={{
              fontSize: '11px',
              color: T.blueDark,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            {product.brand}
          </div>
          <div
            id={`product-title-${product.id}`}
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: T.ink,
              marginBottom: '12px',
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {product.old && (
                <span
                  style={{
                    fontSize: '12px',
                    color: T.muted,
                    textDecoration: 'line-through',
                    marginRight: '8px',
                  }}
                >
                  {product.old.toLocaleString()} FCFA
                </span>
              )}
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: T.ink,
                }}
              >
                {product.price.toLocaleString()}{' '}
                <small style={{ fontSize: '11px', fontWeight: 400 }}>FCFA</small>
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
              }}
            >
              {product.colors.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: c,
                    outline: i === 0 ? `2px solid ${T.blueDark}` : 'none',
                    outlineOffset: '2px',
                    border: '1.5px solid rgba(26,26,26,0.15)',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}