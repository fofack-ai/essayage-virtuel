import { useEffect, useMemo, useState } from "react";
import { api, getImageUrl } from "../../services/api";
import ProductCard from "../../components/shop/ProductCard";
import FilterSidebar from "../../components/shop/FilterSidebar";
import SearchBar from "../../components/shop/SearchBar";

const FILTERS = ["Tous", "Femme", "Homme", "Robes", "Chemises", "Pantalons", "Vestes", "Accessoires"];
const PER_PAGE = 8;

export default function Shop() {
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularite");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        {loading && <p>Chargement des produits...</p>}
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
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={page === index + 1 ? "page-active" : ""}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
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

.catalogue-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 26px;
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

.product-card {
  min-height: 340px;
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(26,26,26,.10);
  box-shadow: 0 8px 24px rgba(0,0,0,.06);
  transition: all .28s ease;
}

.product-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 20px 46px rgba(0,0,0,.15);
  border-color: rgba(227,6,19,.45);
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,.28) 38%, rgba(255,255,255,.92) 100%);
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

.product-content {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 68px;
  z-index: 2;
  text-align: center;
}

.product-category {
  font-size: 9px;
  letter-spacing: 2px;
  color: #8A8F98;
  text-transform: uppercase;
  font-weight: 900;
}

.product-card h3 {
  font-size: 15px;
  font-weight: 800;
  color: #1A1A1A;
  margin: 6px 0 8px;
}

.product-price {
  color: #111;
  font-size: 13px;
  font-weight: 500;
}

.product-price strong {
  font-size: 21px;
  font-weight: 950;
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

.product-card:hover .product-actions {
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
  gap: 10px;
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
`;