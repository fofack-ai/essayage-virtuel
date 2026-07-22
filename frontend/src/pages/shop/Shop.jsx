import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, getImageUrl } from "../../services/api";
import ProductCard from "../../components/shop/ProductCard";
import FilterSidebar from "../../components/shop/FilterSidebar";
import SearchBar from "../../components/shop/SearchBar";
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { useCart } from '../../context/CartContext';
import LoadingPage from '../../components/common/LoadingPage';

const FILTER_VALUES = ['all', 'femme', 'homme', 'robes', 'chemises', 'pantalons', 'vestes'];
const FILTER_KEYS = {
  all: 'shop.filters.all',
  femme: 'shop.filters.women',
  homme: 'shop.filters.men',
  robes: 'shop.filters.dresses',
  chemises: 'shop.filters.shirts',
  pantalons: 'shop.filters.pants',
  vestes: 'shop.filters.jackets',
};

const BATCH_SIZE = 8;

function RevealOnScroll({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-on-scroll ${visible ? 'in-view' : ''}`}>
      {children}
    </div>
  );
}

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const FILTERS = useMemo(
    () => FILTER_VALUES.map((value) => ({ value, label: t(FILTER_KEYS[value]) })),
    [t]
  );

  const [filter, setFilter] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularite");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const { count } = useCart();

  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const sentinelRef = useRef(null);

  // Charger les produits
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("/products");

        const formatted = response.data.map((p) => ({
          id: p.id,
          tag: "Nouveau",
          category: p.target || "catalogue",
          categorySlugs: Array.isArray(p.categorySlugs) ? p.categorySlugs : [],
          categoryNames: p.categoryNames || "",
          name: p.name,
          brand: p.brand,
          price: Number(p.price),
          image: getImageUrl(p.image || p.imageUrl || p.mainImage || p.images?.[0]?.imageUrl),
        }));

        setProducts(formatted);
      } catch (error) {
        console.error("Erreur chargement produits :", error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // ✅ METTRE À JOUR LE FILTRE QUAND L'URL CHANGE
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilter(category);
    }
  }, [searchParams]);

  // Notifications non lues
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const res = await adminService.getNotifications();
        const payload = res?.data?.data || res?.data || [];
        const unread = Array.isArray(payload)
          ? payload.filter((n) => !n.read && !n.isRead && !n.readAt).length
          : 0;
        setUnreadCount(unread);
      } catch (e) {
        // silencieux
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filter !== "all") {
      const f = filter.toLowerCase();
      list = list.filter((p) => {
        const slugs = Array.isArray(p.categorySlugs) ? p.categorySlugs : [];
        const names = (p.categoryNames || "").toLowerCase();
        const target = (p.category || "").toLowerCase();
        return slugs.includes(f) || names.includes(f) || target.includes(f);
      });
    }

    if (search.trim()) {
      list = list.filter((p) =>
        `${p.name} ${p.brand} ${p.categoryNames}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [filter, search, sort, products]);

  // Réinitialiser le nombre de produits visibles
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filter, search, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Scroll infini
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredProducts.length));
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  const changeFilter = (value) => {
    setFilter(value);
    // 👉 METTRE À JOUR L'URL QUAND LE FILTRE CHANGE
    window.history.replaceState(null, '', `/catalogue?category=${value}`);
  };

  if (loading) {
    return <LoadingPage message={t('shop.loading')} />;
  }

  return (
    <div className="shop-page">
      <style>{`
        .product-card { cursor: pointer; }
        .product-info-below { cursor: pointer; }

        @media (max-width: 768px) {
          .action-voir { display: none; }
        }
        .shop-page {
          padding-top: 72px;
          min-height: 100vh;
          background: #F9F9F9;
        }

        .shop-hero {
          height: 520px;
          position: relative;
          background-image:
            linear-gradient(90deg, rgba(0,0,0,.58) 0%, rgba(0,0,0,.24) 45%, rgba(0,0,0,.08) 100%),
            url('/catalog-banner.jpg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
        }

        .shop-hero-text {
          margin-left: 76px;
          max-width: 720px;
          color: #fff;
          position: relative;
          z-index: 2;
        }

        .shop-hero-text span,
        .section-tag {
          color: #E30613;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .shop-hero-text h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(54px, 6vw, 88px);
          font-weight: 300;
          line-height: 1;
          margin: 18px 0;
          color: #fff
        }

        .shop-hero-text h1 em {
          color: #E30613;
          font-style: italic;
        }

        .shop-hero-text p {
          font-size: 18px;
          line-height: 1.8;
          max-width: 500px;
          color: rgba(255,255,255,.95);
        }

        .catalogue-section {
          padding: 58px 76px 80px;
        }

        .catalogue-header {
          margin-bottom: 16px;
        }

        .catalogue-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 4vw, 58px);
          font-weight: 300;
          line-height: 1;
          margin: 0;
        }

        .catalogue-header h2 em {
          color: #E30613;
          font-style: italic;
        }

        .sticky-search {
          position: sticky;
          top: 0;
          z-index: 40;
          background: #F9F9F9;
          padding: 12px 0 18px;
          margin-bottom: 8px;
        }

        .search-sort {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .search-sort input,
        .search-sort select {
          height: 46px;
          border-radius: 14px;
          border: 1.5px solid rgba(26,26,26,.12);
          background: #fff;
          padding: 0 16px;
          outline: none;
          min-width: 250px;
          transition: all .25s ease;
        }

        .search-sort select {
          min-width: 165px;
        }

        .search-sort input:focus,
        .search-sort select:focus {
          border-color: #E30613;
          box-shadow: 0 0 0 4px rgba(227,6,19,.12);
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filters button {
          border: 1.5px solid rgba(26,26,26,.15);
          background: #fff;
          color: #1A1A1A;
          padding: 9px 18px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          transition: all .25s ease;
        }

        .filters button:hover,
        .filters button.active {
          background: #E30613;
          color: #fff;
          border-color: #E30613;
          transform: translateY(-2px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        .reveal-on-scroll {
          display: flex;
          flex-direction: column;
          height: 100%;
          opacity: 0;
          transform: translateY(36px) scale(.97);
          transition: opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1);
        }

        .reveal-on-scroll.in-view {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .products-grid .reveal-on-scroll:nth-child(4n+1) { transition-delay: 0s; }
        .products-grid .reveal-on-scroll:nth-child(4n+2) { transition-delay: .08s; }
        .products-grid .reveal-on-scroll:nth-child(4n+3) { transition-delay: .16s; }
        .products-grid .reveal-on-scroll:nth-child(4n+4) { transition-delay: .24s; }

        .product-card {
          min-height: 420px;
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          background-color: #f5f5f5;
          border: 1px solid rgba(26,26,26,.10);
          box-shadow: 0 8px 24px rgba(0,0,0,.06);
          transition: all .28s ease;
        }

        .product-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 20px 46px rgba(0,0,0,.15);
          border-color: rgba(227,6,19,.45);
        }

        .product-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          border: 1.3px solid #E30613;
          background: rgba(255,255,255,.86);
          color: #E30613;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .product-info-below {
          padding: 10px 4px 0;
        }

        .product-info-below h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0 0 4px;
        }

        .product-price {
          color: #111;
          font-size: 13px;
          font-weight: 500;
        }

        .product-price strong {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: .3px;
        }

        .product-actions {
          position: absolute;
          z-index: 3;
          left: 18px;
          right: 18px;
          bottom: 18px;
          display: flex;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transform: translateY(12px);
          transition: all .25s ease;
        }

        .product-card:hover .product-actions,
        .product-card:active .product-actions,
        .product-card:focus-within .product-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .product-actions a {
          text-decoration: none;
          background: #111;
          color: #fff;
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          transition: all .25s ease;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .product-actions a:hover {
          background: #E30613;
          transform: translateY(-2px);
        }

        .scroll-sentinel {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .scroll-loader {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid rgba(227,6,19,.15);
          border-top-color: #E30613;
          animation: spinLoader .8s linear infinite;
        }

        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }

        .end-of-catalogue {
          text-align: center;
          padding: 40px 0;
          color: #6A6F78;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: .5px;
        }

        @media (max-width: 768px) {
          .shop-page {
            padding-top: 0;
          }

          .shop-hero {
            height: 220px;
          }

          .shop-hero-text {
            margin-left: 20px;
            margin-right: 20px;
            max-width: 100%;
          }

          .shop-hero-text h1 {
            font-size: 38px;
          }

          .shop-hero-text p {
            font-size: 15px;
            line-height: 1.6;
          }

          .catalogue-section {
            padding: 16px 18px 90px;
          }

          .catalogue-header h2 {
            font-size: 34px;
          }

          .sticky-search {
            padding: 8px 0 14px;
            background: #F9F9F9;
            position: sticky;
            top: 0;
            z-index: 40;
          }

          .search-sort {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 14px;
          }

          .search-sort input,
          .search-sort select {
            width: 100%;
            min-width: 0;
          }

          .filters {
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 4px;
          }

          .filters::-webkit-scrollbar {
            display: none;
          }

          .filters button {
            flex-shrink: 0;
            white-space: nowrap;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .products-grid .reveal-on-scroll:nth-child(4n+3) { transition-delay: .08s; }
          .products-grid .reveal-on-scroll:nth-child(4n+4) { transition-delay: .08s; }

          .product-card {
            min-height: 270px;
            border-radius: 14px;
          }

          .product-info-below {
            padding-top: 8px;
          }

          .product-info-below h3 {
            font-size: 13px;
            line-height: 1.3;
          }

          .product-price {
            font-size: 12px;
          }

          .product-price strong {
            font-size: 15px;
          }

          .product-actions {
            left: 10px;
            right: 10px;
            bottom: 10px;
          }

          .product-actions a {
            padding: 8px 10px;
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .products-grid {
            gap: 10px;
          }

          .product-card {
            min-height: 230px;
          }

          .catalogue-header h2 {
            font-size: 28px;
          }
        }
      `}</style>

      <section className="shop-hero">
        <div className="shop-hero-text">
          <span>{t('shop.hero.tag')}</span>
          <h1>
            {t('shop.hero.titleLine')} <em>{t('shop.hero.titleHighlight')}</em>
          </h1>
          <p>{t('shop.hero.description')}</p>
        </div>
      </section>

      <section className="catalogue-section">
        <div className="catalogue-header">
          <h2>
            {t('shop.header.titleLine')} <em>{t('shop.header.titleHighlight')}</em>
          </h2>
        </div>

        <div className="sticky-search">
          <SearchBar
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            setPage={() => {}}
          />

          <FilterSidebar filters={FILTERS} activeFilter={filter} onChangeFilter={changeFilter} />
        </div>

        {!loading && visibleProducts.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#6A6F78' }}>
            {t('shop.empty')}
          </p>
        )}

        {!loading && (
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <RevealOnScroll key={product.id}>
                <ProductCard product={product} />
              </RevealOnScroll>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div ref={sentinelRef} className="scroll-sentinel">
            <div className="scroll-loader" />
          </div>
        )}

        {!loading && !hasMore && visibleProducts.length > 0 && (
          <p className="end-of-catalogue">{t('shop.endOfCatalogue')}</p>
        )}
      </section>
    </div>
  );
}