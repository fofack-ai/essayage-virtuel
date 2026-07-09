import { useEffect, useMemo, useState } from "react";
import { api, getImageUrl } from "../../services/api";
import ProductCard from "../../components/shop/ProductCard";
import FilterSidebar from "../../components/shop/FilterSidebar";
import SearchBar from "../../components/shop/SearchBar";
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';

const FILTERS = ["Tous", "Femme", "Homme", "Robes", "Chemises", "Pantalons", "Vestes", "Accessoires"];
const PER_PAGE = 8;

export default function Shop() {
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularite");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contextual data
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("/products");

        const formatted = response.data.map((p) => ({
          id: p.id,
          tag: "Nouveau",
          category: p.target || p.categoryName || p.category || "Catalogue",
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

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filter !== "Tous") {
      list = list.filter((p) =>
        `${p.name} ${p.category}`.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (search.trim()) {
      list = list.filter((p) =>
        `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [filter, search, sort, products]);

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const visibleProducts = filteredProducts.slice(start, start + PER_PAGE);

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <div className="shop-page">

    {/* ─── EN-TÊTE MOBILE ─── */}
      <div className="mobile-shop-header">
        <Link to="/" className="logo">TRY<span>ON</span></Link>
        <div className="header-actions">
          {isAuthenticated ? (
            <Link to="/notifications" aria-label="Notifications">
              🔔
              {unreadCount > 0 && <span className="notif-dot" />}
            </Link>
          ) : (
            <Link to="/auth" aria-label="Connexion">👤</Link>
          )}
        </div>
      </div>

      <style>{styles}</style>

      <section className="shop-hero">
        <div className="shop-hero-text">
          <span>Collection TryOn</span>
          <h1>
            Boutique <em>africaine</em>
          </h1>
          <p>Découvrez nos tenues modernes et essayez-les virtuellement avant d’acheter.</p>
        </div>
      </section>

      <section className="catalogue-section">
        <div className="catalogue-head">
          <div>
            <span className="section-tag">Catalogue</span>
            <h2>
              Tous les <em>vêtements</em>
            </h2>
          </div>

          <SearchBar
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            setPage={setPage}
          />
        </div>

        <FilterSidebar filters={FILTERS} activeFilter={filter} onChangeFilter={changeFilter} />
        {loading && (
          <div className="products-grid">
            {Array.from({length:8}).map((_,i)=>(
            <div key={i} className="skeleton-card"/>
            ))}
          </div>
        )}
        {!loading && visibleProducts.length === 0 && (
          <p>Aucun produit disponible pour le moment.</p>
        )}

        <div className="products-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page===1}
              onClick={()=>setPage(page-1)}
              >
              ←
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page===totalPages}
              onClick={()=>setPage(page+1)}
              >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = `
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
}

.shop-hero-text h1 em,
.catalogue-head h2 em {
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

.catalogue-head{
display:flex;
justify-content:space-between;
align-items:flex-end;
gap:28px;
margin-bottom:26px;
background:#F9F9F9;
position:sticky;
top:0;
z-index:40;
padding:18px 0;
}

.catalogue-head h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(42px, 4vw, 58px);
  font-weight: 300;
  line-height: 1;
  margin-top: 10px;
}

.search-sort {
  display: flex;
  gap: 12px;
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
  margin-bottom: 28px;
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

/* ── Wrapper carte + infos dessous ── */
.product-card-wrap {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

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
  animation: cardAppear .7s cubic-bezier(.2,.8,.2,1) forwards;
  will-change: transform,opacity;
}

.product-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 20px 46px rgba(0,0,0,.15);
  border-color: rgba(227,6,19,.45);
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 1;
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

/* Catégorie supprimée */
.product-category {
  display: none;
}

/* Ancien product-content supprimé de la carte */
.product-content {
  display: none;
}

/* Infos en dessous de la carte */
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

.pagination {
  margin-top: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination span {
  font-weight: 700;
  font-size: 15px;
}

.pagination button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid rgba(26,26,26,.12);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
  transition: all .25s ease;
}

.pagination button:hover:not(:disabled),
.pagination .page-active {
  background: #E30613;
  color: #fff;
  border-color: #E30613;
  transform: translateY(-2px);
}

.pagination button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

/* ═══ Animations & skeleton — globales, valables sur TOUS les écrans.
       (avant, elles étaient piégées à l'intérieur du media query
       mobile, donc invisibles sur desktop) ═══ */

.products-grid .product-card-wrap:nth-child(1) .product-card{ animation-delay: .05s; }
.products-grid .product-card-wrap:nth-child(2) .product-card{ animation-delay: .1s; }
.products-grid .product-card-wrap:nth-child(3) .product-card{ animation-delay: .15s; }
.products-grid .product-card-wrap:nth-child(4) .product-card{ animation-delay: .2s; }
.products-grid .product-card-wrap:nth-child(5) .product-card{ animation-delay: .25s; }
.products-grid .product-card-wrap:nth-child(6) .product-card{ animation-delay: .3s; }
.products-grid .product-card-wrap:nth-child(7) .product-card{ animation-delay: .35s; }
.products-grid .product-card-wrap:nth-child(8) .product-card{ animation-delay: .4s; }

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.skeleton-card {
  height: 340px;
  border-radius: 18px;
  background: linear-gradient(
    90deg,
    #eeeeee 25%,
    #f8f8f8 50%,
    #eeeeee 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.3s infinite;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================= */
/* RESPONSIVE MOBILE — un seul bloc, propre */
/* ============================= */

@media (max-width: 768px) {

  .shop-page {
    padding-top: 0;
  }

  /* HERO */
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

  /* SECTION */
  .catalogue-section {
    padding: 24px 18px 90px;
  }

  /* TITRE — on désactive le sticky sur mobile : une grande en-tête
     collée en permanence en haut de l'écran mange trop de place
     pendant le scroll sur un petit écran. */
     
  .catalogue-head {
    flex-direction: column;
    align-items: flex-start;
    gap:28px;
    margin-bottom:26px;
    position:sticky;
    top:0;
    z-index:40;
    padding:18px 0;
  }

  .catalogue-head h2 {
    font-size: 34px;
  }

  /* SEARCH */
  .search-sort {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .search-sort input,
  .search-sort select {
    width: 100%;
    min-width: 0;
  }

  /* FILTRES */
  .filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
    margin-bottom: 28px;
  }

  .filters::-webkit-scrollbar {
    display: none;
  }

  .filters button {
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* PRODUITS */
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  /* CARTES */
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

  /* ACTIONS */
  .product-actions {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .product-actions a {
    padding: 8px 10px;
    font-size: 9px;
  }

  /* PAGINATION */
  .pagination {
    gap: 12px;
    margin-top: 30px;
  }

  .pagination button {
    width: 36px;
    height: 36px;
  }
}

/* Très petits écrans (iPhone SE et similaires) */
@media (max-width: 380px) {
  .products-grid {
    gap: 10px;
  }

  .product-card {
    min-height: 230px;
  }

  .catalogue-head h2 {
    font-size: 28px;
  }
}

/* ─── EN-TÊTE MOBILE ─── */
.mobile-shop-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}
.mobile-shop-header .logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #1A1A1A;
  text-decoration: none;
}
.mobile-shop-header .logo span { color: #E30613; }
.mobile-shop-header .header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mobile-shop-header .header-actions a {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #1A1A1A;
  text-decoration: none;
  position: relative;
  padding: 4px;
}
.mobile-shop-header .notif-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: #E30613;
  border-radius: 50%;
}
@media (max-width: 768px) {
  .mobile-shop-header {
    display: flex !important;
  }
  .shop-page {
    padding-top: 0 !important;
  }
}
`;