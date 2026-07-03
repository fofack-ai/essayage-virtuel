import React from "react";
import Toolbar from "../components/Toolbar";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

function getStockStatus(stock) {
  const value = Number(stock || 0);

  if (value === 0) return { text: "Rupture", className: "bad" };
  if (value <= 5) return { text: "Stock faible", className: "warn" };

  return { text: "Disponible", className: "ok" };
}

export default React.memo(function ProductsSection({
  productsPage,
  catFilter,
  setCatFilter,
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
  onAdvancedSearch,
}) {
  return (
    <>
      <Toolbar
        filters={[
          ["all", "Tous"],
          ["femme", "Femme"],
          ["homme", "Homme"],
          ["accessoire", "Accessoires"],
        ]}
        active={catFilter}
        setActive={setCatFilter}
        button="+ Nouveau produit"
        onAdd={() => openAdd("product")}
        onAdvancedSearch={onAdvancedSearch}
      />

      <div className="products-grid-admin">
        {productsPage.items.map((product) => {
          const stockStatus = getStockStatus(product.stock);

          return (
            <div className="card product-card-admin" key={product.id}>
              <div className="product-img">{product.emoji}</div>

              <div>
                <h3>{product.name}</h3>
                <p className="muted">
                  {product.brand} · {product.cat}
                </p>
                <b>{fmt(product.price)}</b>
                <br />
                <span className={`badge ${stockStatus.className}`}>
                  Stock : {product.stock} · {stockStatus.text}
                </span>
              </div>

              <div className="product-actions-admin">
                <Actions
                  view={() => openView("product", product)}
                  edit={() => openEdit("product", product)}
                  del={() => remove("product", product.id)}
                />
              </div>
            </div>
          );
        })}

        {!productsPage.items.length && (
          <div className="empty card">Aucun produit.</div>
        )}
      </div>

      <Pagination
        current={productsPage.currentPage}
        total={productsPage.totalPages}
        onChange={(n) => setPageNumber("produits", n)}
      />
    </>
  );
});