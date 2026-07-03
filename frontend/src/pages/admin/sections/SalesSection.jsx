import React from "react";
import Kpi from "../components/Kpi";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

export default React.memo(function SalesSection({ orders = [], products = [], runExport }) {
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgOrder = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
  const delivered = validOrders.filter((order) => order.status === "delivered").length;
  const deliveryRate = validOrders.length ? Math.round((delivered / validOrders.length) * 100) : 0;

  const categoryCounts = {};
  products.forEach((product) => {
    const key = product.cat || "Autres";
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const totalProducts = Math.max(1, products.length);
  const categories = Object.entries(categoryCounts).map(([label, count]) => ({
    label,
    width: Math.round((count / totalProducts) * 100),
    value: `${Math.round((count / totalProducts) * 100)}%`,
  }));

  return (
    <>
      <div className="grid-3">
        <Kpi label="Chiffre d'affaires" value={fmt(revenue)} change="Données backend" />
        <Kpi label="Panier moyen" value={fmt(avgOrder)} change="FCFA par commande" />
        <Kpi label="Commandes livrées" value={`${deliveryRate}%`} change="Taux de livraison" />
      </div>

      <div className="card sales-card">
        <div className="card-title">
          <h3>Rapport commercial</h3>
          <button className="btn btn-red" onClick={() => runExport("pdf")}>
            Exporter PDF
          </button>
        </div>

        {categories.length ? (
          categories.map((category) => (
            <div className="hbar-row" key={category.label}>
              <span>{category.label}</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: `${category.width}%` }} />
              </div>
              <b>{category.value}</b>
            </div>
          ))
        ) : (
          <div className="empty">Aucune donnée commerciale.</div>
        )}
      </div>
    </>
  );
});