import React, { useMemo } from "react";
import Kpi from "../components/Kpi";
import CountUp from "../components/CountUp";

const fmtCompact = (n) => {
  const value = Number(n || 0);

  if (value >= 1000000) return `${Math.round(value / 1000000)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;

  return value.toLocaleString("fr-FR");
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "En cours",
    processing: "Traitement",
    shipped: "Expédiées",
    delivered: "Livrées",
    cancelled: "Annulées",
  };

  return labels[status] || status || "Non défini";
};

const getPaymentLabel = (method) => {
  const labels = {
    cash_on_delivery: "Paiement livraison",
    orange_money: "Orange Money",
    mtn_money: "MTN Money",
    card: "Carte bancaire",
    paypal: "PayPal",
  };

  return labels[method] || method || "Non défini";
};


function CountNumber({ value = 0, suffix = "", prefix = "" }) {
  return <CountUp value={Number(value || 0)} prefix={prefix} suffix={suffix} />;
}

function CountCompact({ value = 0 }) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return <><CountUp value={Math.round(number / 1000000)} />M</>;
  }

  if (number >= 1000) {
    return <><CountUp value={Math.round(number / 1000)} />K</>;
  }

  return <CountUp value={number} />;
}

export default React.memo(function DashboardHomeSection({
  orders = [],
  products = [],
  clients = [],
  tryons = [],
  logs = [],
  safeDb = {},
  goToPage,
  changePage,
}) {
  const navigateTo = goToPage || changePage || (() => {});
  const reports = safeDb?.reports || {};
  const summary = reports.summary || {};
  const stockSummary = reports.stockSummary || {};
  const reviewsSummary = reports.reviewsSummary || {};
  const supportSummary = reports.supportSummary || {};
  const salesEvolution = reports.salesEvolution || [];
  const topProductsReport = reports.topProducts || [];
  const orderStatusReport = reports.orderStatus || [];
  const paymentMethods = reports.paymentMethods || [];

  const validOrders = orders.filter((o) => o.status !== "cancelled");

  const revenue = Number(
    summary.revenue ??
      validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  );

  const totalOrders = Number(summary.totalOrders ?? orders.length ?? 0);
  const totalClients = Number(summary.totalClients ?? clients.length ?? 0);
  const totalProducts = Number(summary.totalProducts ?? products.length ?? 0);
  const avgBasket = Number(
    summary.averageOrder ??
      (validOrders.length ? Math.round(revenue / validOrders.length) : 0)
  );

  const delivered = Number(
    summary.deliveredOrders ?? orders.filter((o) => o.status === "delivered").length
  );

  const pending = Number(
    summary.pendingOrders ?? orders.filter((o) => o.status === "pending").length
  );

  const cancelled = Number(
    summary.cancelledOrders ?? orders.filter((o) => o.status === "cancelled").length
  );

  const lowStock = products.filter(
    (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5
  );

  const outOfStock = products.filter((p) => Number(p.stock || 0) === 0);

  const lowStockCount = Number(stockSummary.lowStock ?? lowStock.length ?? 0);
  const outOfStockCount = Number(stockSummary.outOfStock ?? outOfStock.length ?? 0);
  const availableStockCount = Number(stockSummary.availableStock ?? 0);

  const conversion = useMemo(() => {
    const totalTryons = tryons.length;
    const purchases = validOrders.length;

    if (!totalTryons) return 0;

    return Math.round((purchases / totalTryons) * 100);
  }, [tryons.length, validOrders.length]);

  const averageRating = Number(reviewsSummary.averageRating || 0);
  const pendingReviews = Number(reviewsSummary.pendingReviews || 0);

  const paymentValidated = useMemo(() => {
    if (paymentMethods.length) {
      return paymentMethods.reduce((sum, item) => sum + Number(item.total || 0), 0);
    }

    return orders.filter(
      (o) =>
        o.paymentStatus === "paid" ||
        o.paymentStatus === "confirmed" ||
        o.paymentStatus === "validated"
    ).length;
  }, [orders, paymentMethods]);

  const salesLast7 = useMemo(() => {
    if (salesEvolution.length) {
      return salesEvolution.slice(-7).map((item) => ({
        label: String(item.label || "").slice(5) || item.label || "-",
        revenue: Number(item.revenue || 0),
      }));
    }

    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const today = new Date();

    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().slice(0, 10);

      const dayRevenue = validOrders
        .filter((order) => order.date === dateStr)
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      return { label: day, revenue: dayRevenue };
    });
  }, [salesEvolution, validOrders]);

  const maxSales = Math.max(...salesLast7.map((item) => Number(item.revenue || 0)), 1);

  const linePoints = useMemo(() => {
    return salesLast7
      .map((item, index, arr) => {
        const x = (index / Math.max(1, arr.length - 1)) * 400;
        const y = 160 - (Number(item.revenue || 0) / maxSales) * 125;
        return `${x},${y}`;
      })
      .join(" ");
  }, [salesLast7, maxSales]);

  const areaPoints = `0,160 ${linePoints} 400,160`;

  const statusData = useMemo(() => {
    if (orderStatusReport.length) {
      return orderStatusReport.map((item) => [getStatusLabel(item.status), Number(item.total || 0)]);
    }

    return [
      ["Livrées", delivered],
      ["En cours", pending],
      ["Annulées", cancelled],
    ];
  }, [orderStatusReport, delivered, pending, cancelled]);

  const statusMax = Math.max(...statusData.map(([, value]) => Number(value || 0)), 1);

  const categoryData = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      const key = product.cat || "Autres";
      counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts).slice(0, 3);
    const total = Math.max(1, entries.reduce((sum, [, value]) => sum + Number(value || 0), 0));

    return entries.map(([name, count], index) => ({
      name,
      count,
      percent: Math.round((Number(count || 0) / total) * 100),
      cls: index === 0 ? "red" : index === 1 ? "dark" : "gold",
    }));
  }, [products]);

  const donutStyle = useMemo(() => {
    if (!categoryData.length) return undefined;

    const colors = ["var(--red)", "var(--ink)", "#B36B12"];
    let start = 0;

    const parts = categoryData.map((item, index) => {
      const end = start + item.percent;
      const part = `${colors[index]} ${start}% ${end}%`;
      start = end;
      return part;
    });

    return {
      background: `conic-gradient(${parts.join(", ")}, #eee ${start}% 100%)`,
    };
  }, [categoryData]);

  const topProducts = useMemo(() => {
    if (topProductsReport.length) {
      const maxQty = Math.max(...topProductsReport.map((p) => Number(p.quantity || 0)), 1);

      return topProductsReport.slice(0, 5).map((p) => ({
        name: p.name || "Produit",
        value: Math.round((Number(p.quantity || 0) / maxQty) * 100),
        display: Number(p.quantity || 0),
      }));
    }

    if (products.length) {
      const list = products.slice(0, 5);
      const maxStock = Math.max(...list.map((p) => Number(p.stock || 0)), 1);

      return list.map((p) => ({
        name: p.name,
        value: Math.round((Number(p.stock || 0) / maxStock) * 100),
        display: Number(p.stock || 0),
      }));
    }

    return [];
  }, [topProductsReport, products]);

  const funnelData = useMemo(() => {
    const viewed = Math.max(totalProducts, products.length, 1);
    const tryonCount = tryons.length;
    const carts = tryons.filter((t) => t.result === "panier").length || Math.round(tryonCount * 0.45);
    const purchases = validOrders.length;
    const base = Math.max(viewed, tryonCount, carts, purchases, 1);

    return [
      { label: `Produits · ${viewed}`, width: 100 },
      { label: `Essayages · ${tryonCount}`, width: Math.round((tryonCount / base) * 100) },
      { label: `Paniers · ${carts}`, width: Math.round((carts / base) * 100) },
      { label: `Achats · ${purchases}`, width: Math.round((purchases / base) * 100) },
    ];
  }, [totalProducts, products.length, tryons, validOrders.length]);

  const loyalClients = clients.filter((client) => Number(client.orders || 0) > 1).length;
  const newClients = Math.max(0, totalClients - loyalClients);

  const recentLogs = logs.length
    ? logs.slice(0, 5)
    : [{ id: 1, action: "Tableau de bord synchronisé", date: "Aujourd’hui" }];

  return (
    <>
      <div className="maquette-kpi-grid">
        <button className="kpi-click" onClick={() => navigateTo("ventes")}>
          <Kpi label="Chiffre d'affaires" value={<CountCompact value={revenue} />} change="Données réelles" />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("commandes")}>
          <Kpi label="Commandes" value={<CountNumber value={totalOrders} />} change={`${delivered} livrées`} />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("clients")}>
          <Kpi label="Clients actifs" value={<CountNumber value={totalClients} />} change="Base client" />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("essayages")}>
          <Kpi label="Conversion essayage" value={<CountNumber value={conversion} suffix="%" />} change="Essai → achat" />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("avis")}>
          <Kpi label="Avis moyens" value={`${averageRating.toFixed(1)}★`} change={`${pendingReviews} en attente`} />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("produits")}>
          <Kpi label="Produits en stock" value={<CountNumber value={totalProducts} />} change="Catalogue disponible" />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("stock")}>
          <Kpi label="Stock faible" value={<CountNumber value={lowStockCount} />} change={`${outOfStockCount} ruptures`} />
        </button>

        <button className="kpi-click" onClick={() => navigateTo("paiements")}>
          <Kpi label="Paiements validés" value={<CountNumber value={paymentValidated} />} change="Transactions confirmées" />
        </button>
      </div>

      <div className="maquette-charts-grid">
        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>1. Ventes par jour</h3><span>7 jours</span></div>
          <div className="maquette-bars">
            {salesLast7.map((item) => (
              <div
                className="maquette-bar"
                style={{ height: `${Math.max((Number(item.revenue || 0) / maxSales) * 100, 8)}%` }}
                key={item.label}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>2. Évolution du CA</h3><span>Courbe</span></div>
          <svg className="maquette-line-chart" viewBox="0 0 400 180" preserveAspectRatio="none">
            <polygon className="maquette-area" points={areaPoints} />
            <polyline points={linePoints} />
          </svg>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>3. Catégories vendues</h3><span>Répartition</span></div>
          <div className="maquette-donut" style={donutStyle} />
          <div className="maquette-legend">
            {categoryData.length ? (
              categoryData.map((item) => (
                <span key={item.name}><i className={`dot ${item.cls}`} />{item.name}</span>
              ))
            ) : (
              <span>Aucune catégorie</span>
            )}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>4. Top produits</h3><span>Quantités</span></div>
          <div className="maquette-hbar-list">
            {topProducts.length ? (
              topProducts.map((p) => (
                <div className="maquette-hbar-row" key={p.name}>
                  <span>{p.name.length > 14 ? `${p.name.slice(0, 14)}...` : p.name}</span>
                  <div className="maquette-hbar-track"><div className="maquette-hbar-fill" style={{ width: `${Math.max(p.value, 4)}%` }} /></div>
                  <b><CountNumber value={p.display} /></b>
                </div>
              ))
            ) : (
              <div className="empty">Aucun produit.</div>
            )}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>5. Tunnel e-commerce</h3><span>Conversion</span></div>
          <div className="maquette-funnel">
            {funnelData.map((item) => (
              <div className="maquette-funnel-step" style={{ width: `${Math.max(item.width, 12)}%` }} key={item.label}>{item.label}</div>
            ))}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>6. Statuts commandes</h3><span>Suivi</span></div>
          <div className="maquette-hbar-list">
            {statusData.map(([label, value]) => (
              <div className="maquette-hbar-row" key={label}>
                <span>{label}</span>
                <div className="maquette-hbar-track"><div className="maquette-hbar-fill" style={{ width: `${(Number(value || 0) / statusMax) * 100}%` }} /></div>
                <b><CountNumber value={value} /></b>
              </div>
            ))}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>7. Panier moyen</h3><span>Commande</span></div>
          <div className="maquette-big-metric"><strong><CountCompact value={avgBasket} /></strong><span>FCFA par commande validée</span></div>
          <div className="maquette-mini-line">
            {salesLast7.map((item) => (
              <i
                style={{ height: `${Math.max((Number(item.revenue || 0) / maxSales) * 100, 10)}%` }}
                key={item.label}
              />
            ))}
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>8. Santé du stock</h3><span>Produits</span></div>
          <div className="maquette-stock-health">
            <div><b><CountNumber value={totalProducts} /></b><span>Total</span></div>
            <div><b><CountNumber value={availableStockCount} /></b><span>Dispo.</span></div>
            <div><b><CountNumber value={lowStockCount} /></b><span>Faible</span></div>
            <div><b><CountNumber value={outOfStockCount} /></b><span>Rupture</span></div>
          </div>
        </div>

        <div className="card maquette-chart-card">
          <div className="maquette-card-title"><h3>9. Fidélité client</h3><span>Base</span></div>
          <div className="maquette-client-split">
            <div className="maquette-client-circle"><span><CountNumber value={totalClients} /></span><small>clients</small></div>
            <div className="maquette-client-lines">
              <p><b><CountNumber value={loyalClients} /></b> clients fidèles</p>
              <p><b><CountNumber value={newClients} /></b> nouveaux clients</p>
              <p><b><CountNumber value={totalOrders} /></b> commandes suivies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="maquette-bottom-grid">
        <div className="card maquette-large-card">
          <div className="maquette-card-title"><h3>Alertes utiles</h3><button className="btn btn-light" onClick={() => navigateTo("stock")}>Voir stock</button></div>
          {lowStock.slice(0, 3).map((p) => (
            <div className="maquette-alert-item" key={p.id}>
              <div className="maquette-alert-icon">⚠️</div>
              <div><b>{p.name}</b><p>Stock restant : {p.stock}</p></div>
              <span>Urgent</span>
            </div>
          ))}
          {!lowStock.length && <div className="empty">Aucune alerte stock.</div>}
        </div>

        <div className="card maquette-large-card">
          <div className="maquette-card-title"><h3>Journal d’activité</h3><span>actions récentes</span></div>
          {recentLogs.map((log) => (
            <div className="maquette-activity-item" key={log.id || `${log.date}-${log.action}`}>
              <div className="maquette-activity-icon">✓</div>
              <p>{log.date} · {log.action}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
