import React, { useMemo, useEffect } from "react";
import Toolbar from "../components/Toolbar";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";
import { getImageUrl } from "../../../services/api";
import { Shirt } from "lucide-react";

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
  // 👇 FILTRAGE SIMPLE PAR categoryName
  const filteredItems = useMemo(() => {
    if (!catFilter || catFilter === "all") {
      return productsPage.items;
    }

    const filterValue = catFilter.toLowerCase();
    
    return productsPage.items.filter((product) => {
      // Vérifier dans categoryName (prioritaire)
      const categoryName = (product.categoryName || "").toLowerCase();
      if (categoryName.includes(filterValue)) return true;
      
      // Vérifier dans cat (fallback)
      const cat = (product.cat || "").toLowerCase();
      if (cat.includes(filterValue)) return true;
      
      // Vérifier dans target
      const target = (product.target || "").toLowerCase();
      if (target.includes(filterValue)) return true;
      
      return false;
    });
  }, [productsPage.items, catFilter]);

  // 👇 PAGINATION
  const paginatedData = useMemo(() => {
    if (!catFilter || catFilter === "all") {
      return productsPage;
    }
    
    const perPage = 6;
    const currentPage = productsPage.currentPage || 1;
    const start = (currentPage - 1) * perPage;
    const items = filteredItems.slice(start, start + perPage);
    
    return {
      items,
      currentPage: currentPage,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / perPage)),
    };
  }, [filteredItems, productsPage, catFilter]);

  useEffect(() => {
    setPageNumber("produits", 1);
  }, [catFilter, setPageNumber]);

  const displayItems = paginatedData.items;

  return (
    <>
      <Toolbar
        filters={[
          ["all", "Tous"],
          ["femme", "Femme"],
          ["homme", "Homme"],
          ["unisexe", "Unisexe"],
          ["robes", "Robes"],
          ["chemises", "Chemises"],
          ["pantalons", "Pantalons"],
          ["vestes", "Vestes"],
        ]}
        active={catFilter}
        setActive={setCatFilter}
        button="+ Nouveau produit"
        onAdd={() => openAdd("product")}
        onAdvancedSearch={onAdvancedSearch}
      />

      <div className="products-list">
        {displayItems.length > 0 ? (
          displayItems.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const imageUrl = getImageUrl(product.image);

            return (
              <div className="product-list-card" key={product.id}>
                <div className="product-list-image">
                  {product.image ? (
                    <img 
                      src={imageUrl} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'product-list-placeholder';
                          placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="product-list-placeholder">
                      <Shirt size={32} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                
                <div className="product-list-info">
                  <div className="product-list-header">
                    <h3>{product.name}</h3>
                    <span className={`badge ${stockStatus.className}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <p className="product-list-brand">{product.brand} · {product.cat}</p>
                  <div className="product-list-footer">
                    <span className="product-list-price">{fmt(product.price)}</span>
                    <span className="product-list-stock">Stock : {product.stock}</span>
                  </div>
                </div>

                <div className="product-list-actions">
                  <Actions
                    view={() => openView("product", product)}
                    edit={() => openEdit("product", product)}
                    del={() => remove("product", product.id)}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty card">Aucun produit dans cette catégorie.</div>
        )}
      </div>

      <Pagination
        current={paginatedData.currentPage}
        total={paginatedData.totalPages}
        onChange={(n) => setPageNumber("produits", n)}
      />
    </>
  );
});