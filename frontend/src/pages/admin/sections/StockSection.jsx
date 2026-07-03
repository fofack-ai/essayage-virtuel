import React from "react";
import Kpi from "../components/Kpi";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";

function getStockStatus(stock) {
  const value = Number(stock || 0);

  if (value === 0) return { text: "Rupture", className: "bad" };
  if (value <= 5) return { text: "Stock faible", className: "warn" };

  return { text: "Disponible", className: "ok" };
}

export default React.memo(function StockSection({
  stockStats,
  stockFilter,
  setStockFilter,
  stockPage,
  openView,
  openRestock,
  setPageNumber,
  onAdvancedSearch,
}) {
  return (
    <>
      <div className="grid-3">
        <Kpi label="Produits en rupture" value={stockStats.rupture.length} change="Stock égal à 0" />
        <Kpi label="Stock faible" value={stockStats.faible.length} change="Stock entre 1 et 5" />
        <Kpi label="Disponibles" value={stockStats.disponible.length} change="Stock supérieur à 5" />
      </div>

      <Toolbar
        filters={[
          ["all", "Tous"],
          ["rupture", "Rupture"],
          ["faible", "Stock faible"],
          ["disponible", "Disponible"],
        ]}
        active={stockFilter}
        setActive={setStockFilter}
        onAdvancedSearch={onAdvancedSearch}
      />

      <div className="stock-grid">
        {stockPage.items.map((p) => {
          const status = getStockStatus(p.stock);

          return (
            <div className="card stock-card" key={p.id}>
              <div className="stock-header">
                <span className="stock-emoji">{p.emoji}</span>
                <h3>{p.name}</h3>
              </div>

              <div className="stock-info">
                <span>Marque : {p.brand}</span>
                <span>Catégorie : {p.cat}</span>
              </div>

              <div className="stock-bar">
                <div
                  className="stock-fill"
                  style={{
                    width: `${Math.min(100, (Number(p.stock || 0) / 30) * 100)}%`,
                    background:
                      Number(p.stock || 0) === 0
                        ? "var(--red)"
                        : Number(p.stock || 0) <= 5
                        ? "var(--orange)"
                        : "var(--green)",
                  }}
                />
              </div>

              <div className="stock-details">
                <span>
                  Stock total : <strong>{p.stock}</strong>
                </span>

                <span className={`badge ${status.className}`}>{status.text}</span>
              </div>

              <div className="stock-actions">
                <button
                  className="stock-action-btn"
                  title="Voir le produit"
                  onClick={() => openView("product", p)}
                >
                  👁️
                </button>

                <button
                  className="stock-action-btn restock"
                  title="Réapprovisionner"
                  onClick={() => openRestock(p)}
                >
                  📦
                </button>
              </div>
              
            </div>
          );
        })}

        {!stockPage.items.length && (
          <div className="empty card">Aucun produit dans cette catégorie de stock.</div>
        )}
      </div>

      <Pagination
        current={stockPage.currentPage}
        total={stockPage.totalPages}
        onChange={(n) => setPageNumber("stock", n)}
      />
    </>
  );
});