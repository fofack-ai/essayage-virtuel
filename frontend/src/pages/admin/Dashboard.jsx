import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { adminService } from "../../services/adminService";
import Pagination from "./components/Pagination";
import Kpi from "./components/Kpi";
import "./Dashboard.css";
import Actions from "./components/Actions";
import Badge from "./components/Badge";
import Table from "./components/Table";
import Toolbar from "./components/Toolbar";
import LogsSection from "./sections/LogsSection";
import PaymentsSection from "./sections/PaymentsSection";
import NotificationsSection from "./sections/NotificationsSection";
import SupportSection from "./sections/SupportSection";
import SupportModal from "./sections/SupportModal";
import FaqModal from "./sections/FaqModal";
import PromotionsSection from "./sections/PromotionsSection";
import ReviewsSection from "./sections/ReviewsSection";
import SalesSection from "./sections/SalesSection";
import ClientsSection from "./sections/ClientsSection";
import OrdersSection from "./sections/OrdersSection";
import ProductsSection from "./sections/ProductsSection";
import StockSection from "./sections/StockSection";
import ReportsSection from "./sections/ReportsSection";
import DashboardHomeSection from "./sections/DashboardHomeSection";
import TryonsSection from "./sections/TryonsSection";
import SettingsSection from "./sections/SettingsSection";
import Field from "./components/Field";
import { useAuth } from "../../context/AuthContext";
import DashboardSkeleton from "./components/DashboardSkeleton";

const nav = [
  { key: "dashboard", icon: "📊", label: "Tableau de bord", group: "Gestion" },
  { key: "commandes", icon: "📦", label: "Commandes", group: "Gestion" },
  { key: "produits", icon: "👗", label: "Produits", group: "Gestion" },
  { key: "clients", icon: "👥", label: "Clients", group: "Gestion" },
  { key: "essayages", icon: "✨", label: "Essayages", group: "Analyse" },
  { key: "ventes", icon: "📈", label: "Ventes", group: "Analyse" },
  { key: "avis", icon: "⭐", label: "Avis & Évaluations", group: "Analyse" },
  { key: "rapports", icon: "📊", label: "Analyse & Rapports", group: "Analyse" },
  { key: "stock", icon: "📦", label: "Stock & Approvisionnement", group: "Logistique" },
  { key: "promotions", icon: "🏷️", label: "Promotions", group: "Marketing" },
  { key: "paiements", icon: "💳", label: "Paiements & Transactions", group: "Finance" },
  { key: "notifications", icon: "🔔", label: "Notifications", group: "Système" },
  { key: "support", icon: "❓", label: "Support & FAQ", group: "Système" },
  { key: "logs", icon: "🔒", label: "Logs & Sécurité", group: "Système" },
  { key: "parametres", icon: "⚙️", label: "Paramètres", group: "Système" },
];

const titles = {
  dashboard: ["Tableau de bord", "Vue globale de l'activité TryOn"],
  commandes: ["Commandes", "Ajout, modification, suppression et suivi"],
  produits: ["Produits", "Catalogue, stock et prix"],
  clients: ["Clients", "Base client et historique"],
  essayages: ["Essayages", "Suivi IA et cabine virtuelle"],
  ventes: ["Ventes", "Analyse commerciale"],
  stock: ["Stock & Approvisionnement", "Gestion des stocks et réapprovisionnement"],
  avis: ["Avis & Évaluations", "Modération et gestion des avis clients"],
  promotions: ["Promotions", "Gestion des codes promo et offres spéciales"],
  paiements: ["Paiements & Transactions", "Suivi des transactions financières"],
  rapports: ["Analyse & Rapports", "Rapports détaillés de l'activité"],
  notifications: ["Notifications", "Centre de gestion des notifications"],
  support: ["Support & FAQ", "Gestion du support client et FAQ"],
  logs: ["Logs & Sécurité", "Journal des activités et sécurité"],
  parametres: ["Paramètres", "Configuration complète du dashboard"],
};

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

const getStockStatus = (stock) => {
  const value = Number(stock || 0);

  if (value === 0) {
    return {
      text: "Rupture",
      className: "bad",
    };
  }

  if (value <= 5) {
    return {
      text: "Stock faible",
      className: "warn",
    };
  }

  return {
    text: "Disponible",
    className: "ok",
  };
};

const statusText = { pending: "En cours", delivered: "Livré", cancelled: "Annulé" };

function paginate(list, page, perPage) {
  const safeList = Array.isArray(list) ? list : [];
  const totalPages = Math.max(1, Math.ceil(safeList.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: safeList.slice(start, start + perPage),
    currentPage: safePage,
    totalPages,
  };
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}

const Card = React.memo(({ title, side, children }) => {
  return (
    <div className="card chart-card">
      <div className="card-title">
        <h3>{title}</h3>
        {side && <span className="muted">{side}</span>}
      </div>
      {children}
    </div>
  );
});

// Graphique dynamique - Ventes par jour
const SalesChart = React.memo(({ orders }) => {
  const dailySales = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    const weekData = days.map((_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().slice(0, 10);
      const total = orders
        .filter(o => o.date === dateStr && o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      return { day: days[index], total, date: dateStr };
    });
    const max = Math.max(...weekData.map(d => d.total), 1);
    return weekData.map(d => ({ ...d, height: (d.total / max) * 100 }));
  }, [orders]);

  return (
    <Card title="1. Ventes par jour" side="7 jours">
      <div className="bars">
        {dailySales.map((d) => (
          <div key={d.day} className="bar" style={{ height: `${Math.max(d.height, 5)}%` }}>
            <span>{d.day}</span>
            <span className="bar-value">{d.total > 0 ? d.total.toLocaleString() : ''}</span>
          </div>
        ))}
      </div>
    </Card>
  );
});

const ChartLine = React.memo(({ orders = [] }) => {
  const points = useMemo(() => {
    const values = (orders || [])
      .filter((o) => o.status !== "cancelled")
      .slice(-7)
      .map((o) => Number(o.total || 0));

    const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(...safeValues, 1);
    return safeValues.map((value, index) => {
      const x = (index / Math.max(1, safeValues.length - 1)) * 400;
      const y = 160 - (value / max) * 125;
      return `${x},${y}`;
    }).join(" ");
  }, [orders]);

  return (
    <Card title="2. Évolution du CA" side="Courbe">
      <svg className="line-chart" viewBox="0 0 400 180" preserveAspectRatio="none">
        <polyline points={points} />
      </svg>
    </Card>
  );
});

const ChartDonut = React.memo(({ products = [] }) => {
  const { categories, gradient } = useMemo(() => {
    const counts = {};
    (products || []).forEach((p) => {
      const key = p.cat || "Autres";
      counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts).slice(0, 3);
    const total = Math.max(1, entries.reduce((sum, [, count]) => sum + count, 0));
    const colors = ["var(--red)", "var(--ink)", "#B36B12"];
    let start = 0;
    const parts = entries.map(([, count], index) => {
      const end = start + Math.round((count / total) * 100);
      const part = `${colors[index]} ${start}% ${end}%`;
      start = end;
      return part;
    });

    return {
      categories: entries,
      gradient: entries.length ? `conic-gradient(${parts.join(", ")}, #ddd ${start}% 100%)` : "conic-gradient(#ddd 0% 100%)",
    };
  }, [products]);

  return (
    <Card title="3. Catégories" side="Répartition">
      <div className="donut" style={{ background: gradient }} />
      <div className="legend">
        {categories.length ? categories.map(([label], index) => (
          <span key={label}><i className={`dot ${index === 1 ? "dark" : index === 2 ? "gold" : ""}`} />{label}</span>
        )) : <span className="muted">Aucune catégorie</span>}
      </div>
    </Card>
  );
});

const HBar = React.memo(({ label, width, value }) => {
  return (
    <div className="hbar-row">
      <span>{label}</span>
      <div className="hbar-track"><div className="hbar-fill" style={{ width: `${width}%` }} /></div>
      <b>{value}</b>
    </div>
  );
});

const TopProducts = React.memo(({ products }) => {
  const topProducts = useMemo(() => {
    const list = (products || []).slice(0, 5);
    const maxStock = Math.max(...list.map((p) => Number(p.stock || 0)), 1);
    return list.map((p) => ({
      ...p,
      width: Math.round((Number(p.stock || 0) / maxStock) * 100),
      value: Number(p.stock || 0),
    }));
  }, [products]);

  return (
    <Card title="4. Top produits" side="Stock">
      <div className="hbar-list">
        {topProducts.length ? topProducts.map((p) => (
          <HBar key={p.id} label={String(p.name || "Produit").split(" ")[0]} width={p.width} value={p.value} />
        )) : <div className="empty">Aucun produit.</div>}
      </div>
    </Card>
  );
});

const Funnel = React.memo(({ orders = [], tryons = [], products = [] }) => {
  const values = useMemo(() => {
    const productViews = products.length;
    const tryonCount = tryons.length;
    const cartIntent = tryons.filter((t) => t.result === "panier").length;
    const purchases = orders.filter((o) => o.status !== "cancelled").length;
    const base = Math.max(productViews, tryonCount, cartIntent, purchases, 1);

    return [
      [`Produits · ${productViews}`, Math.round((productViews / base) * 100)],
      [`Essayages · ${tryonCount}`, Math.round((tryonCount / base) * 100)],
      [`Paniers · ${cartIntent}`, Math.round((cartIntent / base) * 100)],
      [`Achats · ${purchases}`, Math.round((purchases / base) * 100)],
    ];
  }, [orders, tryons, products]);

  return (
    <Card title="5. Tunnel e-commerce" side="Conversion">
      <div className="funnel">
        {values.map(([label, width]) => (
          <div className="funnel-step" style={{ width: `${Math.max(width, 8)}%` }} key={label}>{label}</div>
        ))}
      </div>
    </Card>
  );
});

const StatusChart = React.memo(({ orders }) => {
  const delivered = orders.filter(o => o.status === "delivered").length;
  const pending = orders.filter(o => o.status === "pending").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;
  const total = orders.length || 1;

  return (
    <Card title="6. Statuts commandes" side="Suivi">
      <div className="hbar-list">
        <HBar label="Livrées" width={Math.round((delivered / total) * 100)} value={`${Math.round((delivered / total) * 100)}%`} />
        <HBar label="En cours" width={Math.round((pending / total) * 100)} value={`${Math.round((pending / total) * 100)}%`} />
        <HBar label="Annulées" width={Math.round((cancelled / total) * 100)} value={`${Math.round((cancelled / total) * 100)}%`} />
      </div>
    </Card>
  );
});

// Analytiques avancées
const AdvancedAnalytics = React.memo(({ orders, products, clients }) => {
  const metrics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
    const customerRetention = clients.filter(c => c.orders > 1).length / Math.max(1, clients.length) * 100;
    
    return { totalRevenue, avgOrderValue, customerRetention, orderCount: validOrders.length };
  }, [orders, clients]);

  return (
    <div className="advanced-analytics">
      <div className="card">
        <h3>📊 Métriques avancées</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Valeur moyenne commande</span>
            <span className="metric-value">{fmt(metrics.avgOrderValue)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Taux de rétention</span>
            <span className="metric-value">{Math.round(metrics.customerRetention)}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">CA total</span>
            <span className="metric-value">{fmt(metrics.totalRevenue)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Commandes validées</span>
            <span className="metric-value">{metrics.orderCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const Activity = React.memo(({ icon, title, desc, badge }) => {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>
      <div>
        <b>{title}</b>
        {desc && <p className="muted">{desc}</p>}
      </div>
      {badge && <span className="badge warn">{badge}</span>}
    </div>
  );
});

// Recherche avancée
const AdvancedSearch = React.memo(({ onSearch, onClose }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    category: 'all',
    priceMin: '',
    priceMax: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🔍 Recherche avancée</h3>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Mot-clé</label>
            <input 
              className="input" 
              placeholder="Rechercher..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Catégorie</label>
              <select className="select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="all">Toutes catégories</option>
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
                <option value="accessoire">Accessoires</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Statut</label>
              <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">Tous statuts</option>
                <option value="pending">En cours</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Prix min</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label">Prix max</label>
              <input 
                type="number" 
                className="input" 
                placeholder="100000"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Date de début</label>
              <input 
                type="date" 
                className="input" 
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label">Date de fin</label>
              <input 
                type="date" 
                className="input" 
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-light" onClick={onClose}>Annuler</button>
            <button className="btn btn-red" onClick={handleSearch}>🔍 Rechercher</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Export avancé
const ExportModal = React.memo(({ onExport, onClose, orders }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [includeColumns, setIncludeColumns] = useState({
    id: true, client: true, date: true, status: true, total: true
  });

  const getFilteredData = useCallback(() => {
    let data = [...orders];
    const now = new Date();
    
    if (dateRange === 'today') {
      const today = now.toISOString().slice(0, 10);
      data = data.filter(o => o.date === today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().slice(0, 10);
      data = data.filter(o => o.date >= weekStr);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthStr = monthAgo.toISOString().slice(0, 10);
      data = data.filter(o => o.date >= monthStr);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      data = data.filter(o => o.date >= customStart && o.date <= customEnd);
    }
    
    return data;
  }, [orders, dateRange, customStart, customEnd]);

  const handleExport = () => {
    const data = getFilteredData();
    const columns = Object.keys(includeColumns).filter(k => includeColumns[k]);
    
    const exportData = data.map(o => {
      const obj = {};
      if (includeColumns.id) obj.ID = o.id;
      if (includeColumns.client) obj.Client = o.client;
      if (includeColumns.date) obj.Date = o.date;
      if (includeColumns.status) obj.Statut = statusText[o.status] || o.status;
      if (includeColumns.total) obj.Total = o.total;
      return obj;
    });

    onExport({ format, data: exportData, columns });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>📤 Exporter les données</h3>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Format d'export</label>
            <select className="select" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF (impression)</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Période</label>
            <select className="select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <div className="form-grid">
              <div className="field">
                <label className="label">Date de début</label>
                <input type="date" className="input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Date de fin</label>
                <input type="date" className="input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </div>
          )}
          <div className="field">
            <label className="label">Colonnes à exporter</label>
            <div className="checkbox-grid">
              {Object.entries(includeColumns).map(([key, value]) => (
                <label key={key} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={() => setIncludeColumns(prev => ({ ...prev, [key]: !prev[key] }))} 
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-light" onClick={onClose}>Annuler</button>
            <button className="btn btn-red" onClick={handleExport}>📥 Exporter</button>
          </div>
        </div>
      </div>
    </div>
  );
});

const ProductCard = React.memo(({ product, onView, onEdit, onDelete }) => {
  return (
    <div className="card product-card-admin">
      <div className="product-img">{product.emoji}</div>
      <div>
        <h3>{product.name}</h3>
        <p className="muted">{product.brand} · {product.cat}</p>
        <b>{fmt(product.price)}</b>
        <br />
        {(() => {
          const stockStatus = getStockStatus(product.stock);

          return (
            <span className={`badge ${stockStatus.className}`}>
              Stock : {product.stock} · {stockStatus.text}
            </span>
          );
        })()}
      </div>
      <div className="product-actions-admin">
        <div className="actions">
          <button className="icon-btn view" title="Voir" onClick={() => onView("product", product)}>👁️</button>
          <button className="icon-btn" title="Modifier" onClick={() => onEdit("product", product)}>✏️</button>
          <button className="icon-btn danger" title="Supprimer" onClick={() => onDelete("product", product.id)}>🗑️</button>
        </div>
      </div>
    </div>
  );
});

const Sales = React.memo(({ runExport, orders = [], products = [] }) => {
  const data = useMemo(() => {
    const validOrders = (orders || []).filter((o) => o.status !== "cancelled");
    const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const avgOrder = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
    const delivered = validOrders.filter((order) => order.status === "delivered").length;
    const deliveryRate = validOrders.length ? Math.round((delivered / validOrders.length) * 100) : 0;

    const categoryCounts = {};
    (products || []).forEach((product) => {
      const key = product.cat || "Autres";
      categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    });
    const totalProducts = Math.max(1, products.length);
    const categories = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      width: Math.round((count / totalProducts) * 100),
      value: `${Math.round((count / totalProducts) * 100)}%`,
    }));

    return { revenue, avgOrder, deliveryRate, categories };
  }, [orders, products]);

  return (
    <>
      <div className="grid-3">
        <Kpi label="Chiffre d'affaires" value={fmt(data.revenue)} change="Données backend" />
        <Kpi label="Panier moyen" value={fmt(data.avgOrder)} change="FCFA par commande" />
        <Kpi label="Commandes livrées" value={`${data.deliveryRate}%`} change="Taux de livraison" />
      </div>
      <div className="card sales-card">
        <div className="card-title">
          <h3>Rapport commercial</h3>
          <button className="btn btn-red" onClick={() => runExport("pdf")}>Exporter PDF</button>
        </div>
        {data.categories.length ? data.categories.map((category) => (
          <HBar key={category.label} label={category.label} width={category.width} value={category.value} />
        )) : <div className="empty">Aucune donnée commerciale.</div>}
      </div>
    </>
  );
});

const Modal = React.memo(({ modal, close, save, loading }) => {
  const type = modal?.type;
  const item = modal?.item || {};
  const isEdit = modal?.mode === "edit";

  const getTypeLabel = () => {
    const labels = {
      product: "un produit",
      order: "une commande",
      tryon: "un essayage",
      review: "un avis",
      promotion: "une promotion",
      notification: "une notification",
      support: "un ticket",
      client: "un client",
      restock: "un réapprovisionnement",
    };
    return labels[type] || "un élément";
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? "Modifier" : "Ajouter"} {getTypeLabel()}</h3>
          <button className="close" onClick={close}>✕</button>
        </div>

        <form className="modal-body" onSubmit={save}>
          {type === "restock" && (
            <>
              <h3>{item.name}</h3>
              <p className="muted">Ajoutez des quantités au stock existant.</p>

              <div className="card soft-card">
                <h4>Stock par taille</h4>

                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                  const currentStock =
                    item.sizes?.find((s) => s.sizeLabel === size)?.stock || 0;

                  return (
                    <div className="form-grid" key={size}>
                      <div className="field">
                        <label className="label">Taille</label>
                        <input className="input" value={size} readOnly />
                      </div>

                      <div className="field">
                        <label className="label">Stock actuel</label>
                        <input className="input" value={currentStock} readOnly />
                      </div>

                      <Field
                        label={`Ajouter ${size}`}
                        type="number"
                        name={`restock_${size}`}
                        defaultValue="0"
                        min="0"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {type === "product" && (
            <>
              <Field label="Nom" name="name" defaultValue={item.name || ""} required />
              <div className="form-grid">
                <Field label="Marque" name="brand" defaultValue={item.brand || ""} />
                <Field label="Prix" type="number" name="price" defaultValue={item.price || ""} required />
              </div>
              <div className="form-grid">
                <Field label="Stock" type="number" name="stock" defaultValue={item.stock || ""} />
                <div className="field">
                  <label className="label">Catégorie</label>
                  <select className="select" name="cat" defaultValue={item.cat || "femme"}>
                    <option value="femme">femme</option>
                    <option value="homme">homme</option>
                    <option value="accessoire">accessoire</option>
                  </select>
                </div>
              </div>
              <Field
                label="Image du produit"
                type="file"
                name="image"
                accept="image/*"
              />
              <Field label="Emoji" name="emoji" defaultValue={item.emoji || "👗"} />
              <div className="card soft-card">
                <h4>Tailles et stocks</h4>

                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <div className="form-grid" key={size}>
                    <div className="field">
                      <label className="label">Taille</label>
                      <input className="input" value={size} readOnly />
                    </div>

                    <Field
                      label={`Stock ${size}`}
                      type="number"
                      name={`stock_${size}`}
                      defaultValue={item.sizes?.find((s) => s.sizeLabel === size)?.stock || 0}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {type === "order" && (
            <>
              <Field label="Client" name="client" defaultValue={item.client || ""} required />
              <div className="form-grid">
                <Field label="Date" type="date" name="date" defaultValue={item.date || new Date().toISOString().slice(0, 10)} />
                <Field label="Total" type="number" name="total" defaultValue={item.total || ""} required />
              </div>
              <div className="field">
                <label className="label">Statut</label>
                <select className="select" name="status" defaultValue={item.status || "pending"}>
                  <option value="pending">En cours</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </>
          )}

          {type === "client" && (
            <>
              <Field
                label="Nom"
                name="name"
                defaultValue={item.name || ""}
                required
              />

              <div className="form-grid">
                <Field
                  label="Email"
                  name="email"
                  defaultValue={item.email || ""}
                />

                <Field
                  label="Ville"
                  name="city"
                  defaultValue={item.city || ""}
                />
              </div>

              <div className="form-grid">
                <Field
                  label="Téléphone"
                  name="phone"
                  defaultValue={item.phone || ""}
                />

                <Field
                  label="Adresse"
                  name="address"
                  defaultValue={item.address || ""}
                />
              </div>

              <div className="field">
                <label className="label">Statut</label>

                <select
                  className="select"
                  name="status"
                  defaultValue={item.status || "active"}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </>
          )}

          {type === "tryon" && (
            <>
              <Field label="Client" name="client" defaultValue={item.client || ""} required />
              <Field label="Produit" name="product" defaultValue={item.product || ""} required />
              <div className="form-grid">
                <Field label="Score IA" type="number" name="score" defaultValue={item.score || 90} />
                <div className="field">
                  <label className="label">Résultat</label>
                  <select className="select" name="result" defaultValue={item.result || "panier"}>
                    <option value="panier">panier</option>
                    <option value="favori">favori</option>
                    <option value="comparaison">comparaison</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === "review" && (
            <>
              <Field label="Produit" name="product" defaultValue={item.product || ""} required />
              <Field label="Client" name="client" defaultValue={item.client || ""} required />
              <div className="form-grid">
                <div className="field">
                  <label className="label">Note</label>
                  <select className="select" name="rating" defaultValue={item.rating || 5}>
                    <option value="1">⭐ 1 étoile</option>
                    <option value="2">⭐ 2 étoiles</option>
                    <option value="3">⭐ 3 étoiles</option>
                    <option value="4">⭐ 4 étoiles</option>
                    <option value="5">⭐ 5 étoiles</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Statut</label>
                  <select className="select" name="status" defaultValue={item.status || "pending"}>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>
              </div>
              <Field label="Commentaire" name="comment" defaultValue={item.comment || ""} required />
            </>
          )}

          {type === "promotion" && (
            <>
              <Field label="Code promo" name="code" defaultValue={item.code || ""} required />
              <div className="form-grid">
                <div className="field">
                  <label className="label">Type</label>
                  <select className="select" name="type" defaultValue={item.type || "percentage"}>
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Montant fixe</option>
                  </select>
                </div>
                <Field label="Valeur" type="number" name="value" defaultValue={item.value || ""} required />
              </div>
              <div className="form-grid">
                <Field label="Date d'expiration" type="date" name="expires" defaultValue={item.expires || ""} />
                <Field label="Utilisation max" type="number" name="maxUsage" defaultValue={item.maxUsage || 100} />
              </div>
              <div className="field">
                <label className="label">Actif</label>
                <select className="select" name="active" defaultValue={item.active ? "true" : "false"}>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </>
          )}

          {type === "notification" && (
            <>
              <Field label="Titre" name="title" defaultValue={item.title || ""} required />
              <Field label="Message" name="message" defaultValue={item.message || ""} required />
              <div className="field">
                <label className="label">Type</label>
                <select className="select" name="type" defaultValue={item.type || "info"}>
                  <option value="order">Commande</option>
                  <option value="stock">Stock</option>
                  <option value="review">Avis</option>
                  <option value="info">Information</option>
                </select>
              </div>
            </>
          )}

          {type === "support" && (
            <>
              <Field label="Client" name="client" defaultValue={item.client || ""} required />
              <Field label="Sujet" name="subject" defaultValue={item.subject || ""} required />
              <Field label="Message" name="message" defaultValue={item.message || ""} required />
              <div className="form-grid">
                <div className="field">
                  <label className="label">Statut</label>
                  <select className="select" name="status" defaultValue={item.status || "open"}>
                    <option value="open">Ouvert</option>
                    <option value="in-progress">En cours</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Priorité</label>
                  <select className="select" name="priority" defaultValue={item.priority || "medium"}>
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="modal-foot">
            <button type="button" className="btn btn-light" onClick={close} disabled={loading}>Annuler</button>
            <button className="btn btn-red" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const ViewModal = React.memo(({ view, close }) => {
  const item = view.item || {};

  const getTypeLabel = () => {
    const labels = {
      product: "du produit",
      client: "du client",
      review: "de l'avis",
      promotion: "de la promotion",
      notification: "de la notification",
      support: "du ticket",
      log: "du log",
      transaction: "de la transaction",
      order: "de la commande",
      tryon: "de l'essayage",
    };

    return labels[view.type] || "de l'élément";
  };

  if (view.type === "order") {
    return (
      <div className="modal-overlay" onClick={close}>
        <div className="modal-box view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3>Détails {getTypeLabel()}</h3>
            <button className="close" onClick={close}>✕</button>
          </div>

          <div className="modal-body">
            <div className="view-list">
              <div className="view-line"><span>COMMANDE</span><b>{item.orderNumber || item.id}</b></div>
              <div className="view-line"><span>CLIENT</span><b>{`${item.firstName || ""} ${item.lastName || ""}`.trim() || "-"}</b></div>
              <div className="view-line"><span>EMAIL</span><b>{item.email || "-"}</b></div>
              <div className="view-line"><span>STATUT</span><b>{item.status || "-"}</b></div>
              <div className="view-line"><span>PAIEMENT</span><b>{item.paymentMethod || "-"}</b></div>
              <div className="view-line"><span>STATUT PAIEMENT</span><b>{item.paymentStatus || "-"}</b></div>
              <div className="view-line"><span>VILLE</span><b>{item.deliveryCity || "-"}</b></div>
              <div className="view-line"><span>TÉLÉPHONE</span><b>{item.deliveryPhone || "-"}</b></div>
              <div className="view-line"><span>ADRESSE</span><b>{item.deliveryAddress || "-"}</b></div>
              <div className="view-line"><span>TOTAL</span><b>{fmt(item.total)}</b></div>
            </div>

            <h3 style={{ marginTop: 20 }}>Produits commandés</h3>

            <div className="view-list">
              {(item.items || []).length ? (
                item.items.map((p) => (
                  <div className="view-line" key={p.id}>
                    <span>{p.productName}</span>
                    <b>
                      Qté {p.quantity} · {fmt(p.subtotal)}
                    </b>
                  </div>
                ))
              ) : (
                <div className="empty">Aucun produit trouvé pour cette commande.</div>
              )}
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-red" onClick={close}>Fermer</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const entries = Object.entries(item);
  const filteredEntries = entries.filter(([key]) => !["id"].includes(key));

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Détails {getTypeLabel()}</h3>
          <button className="close" onClick={close}>✕</button>
        </div>

        <div className="modal-body">
          <div className="view-list">
            {filteredEntries.map(([key, value]) => (
              <div className="view-line" key={key}>
                <span>{key.toUpperCase()}</span>
                <b>{typeof value === "number" ? value.toLocaleString("fr-FR") : String(value)}</b>
              </div>
            ))}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-red" onClick={close}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ==================== DASHBOARD PRINCIPAL ====================

function Dashboard() {
  //const { user } = useAuth();
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('tryon_sidebar_collapsed') || 'false');
  });
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('tryon_dark_mode') || 'false');
  });
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [promoFilter, setPromoFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("all");
  const [notifFilter, setNotifFilter] = useState("all");
  const [supportFilter, setSupportFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [pagination, setPagination] = useState({ 
    commandes: 1, produits: 1, clients: 1, stock: 1, essayages: 1,
    reviews: 1, promotions: 1, transactions: 1, logs: 1,
    notifications: 1, support: 1, faq: 1
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };

    // Fermer le menu mobile quand on clique sur un élément
    const handleNavClick = (key) => {
      changePage(key);
      setMobileMenuOpen(false);
    };

    // Ouvrir/fermer la sidebar au glissement tactile (mobile)
    useEffect(() => {
      let touchStartX = 0;
      let touchStartY = 0;
      let startedFromEdge = false;

      const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        // le geste ne compte que s'il démarre tout près du bord gauche
        startedFromEdge = touchStartX <= 24;
      };

      const handleTouchEnd = (e) => {
        if (window.innerWidth > 820) return; // uniquement en mode mobile

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // on ignore si c'est plutôt un scroll vertical qu'un glissement horizontal
        if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

        // glisser vers la droite depuis le bord gauche → ouvre la sidebar
        if (!mobileMenuOpen && startedFromEdge && deltaX > 60) {
          setMobileMenuOpen(true);
        }

        // petit bonus : glisser vers la gauche pendant qu'elle est ouverte → la ferme
        if (mobileMenuOpen && deltaX < -60) {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }, [mobileMenuOpen]);

  const [db, setDb] = useState({
    orders: [],
    products: [],
    clients: [],
    tryons: [],
    reviews: [],
    promotions: [],
    transactions: [],
    logs: [],
    notifications: [],
    support: [],
    faqs: [],
    audit: [],
    settings: {
      shopName: "TryOn",
      city: "Douala - Cameroun",
      supportEmail: "support@tryon.cm",
      address: "CFPD, Douala, Cameroun",
    },
  });

  // ==================== ADMIN INFO ====================
  const adminName =
    user?.name ||
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Administrateur";

  const adminEmail = user?.email || "admin@tryon.cm";

  const adminInitials = adminName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ==================== ADMIN MENU STATE ====================
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const loadAdminData = async () => {
    const token =
      sessionStorage.getItem("tryon_token") ||
      localStorage.getItem("tryon_token");

    if (!token) {
      notify("Veuillez vous connecter en administrateur.", "error");
      navigate("/auth");
      return;
    }
    try {
      setLoading(true);

      const [
        dashboardRes,
        ordersRes,
        productsRes,
        tryonsRes,
        clientsRes,
        logsRes,
        notificationsRes,
        supportRes,
        faqRes,
        promotionsRes,
        reviewsRes,
        settingsRes,
        reportsRes,
      ] = await Promise.all([
          adminService.getDashboard(),
          adminService.getOrders(),
          adminService.getProducts(),
          adminService.getTryons(),
          adminService.getClients(),
          adminService.getLogs(),
          adminService.getNotifications(),
          adminService.getSupportTickets(),
          adminService.getFaqs(),
          adminService.getPromotions(),
          adminService.getReviews(),
          adminService.getSettings(),
          adminService.getReports("month"),
        ]);

      //Limite de requêtes simultanées pour éviter les erreurs de surcharge du serveur
      /*const dashboardRes = await adminService.getDashboard();
      const ordersRes = await adminService.getOrders();
      const productsRes = await adminService.getProducts();
      const tryonsRes = await adminService.getTryons();
      const clientsRes = await adminService.getClients();*/

        console.log("Dashboard:", dashboardRes);
        console.log("Orders:", ordersRes);
        console.log("Products:", productsRes);
        console.log("Try-ons:", tryonsRes);
        console.log("Clients:", clientsRes);
        console.log("Logs:", logsRes);
        console.log("Notifications:", notificationsRes);
        console.log("Support Tickets:", supportRes);
        console.log("FAQs:", faqRes);
        console.log("Promotions:", promotionsRes);
        console.log("Reviews:", reviewsRes);
        console.log("Settings:", settingsRes);

      // Transformation des données pour le frontend
      // Ici on mappe les données reçues du backend pour les adapter à l'interface admin
      // Commande, produit, essayage, client, avis, promotion, transaction, log, notification, support

      // COMMANDES
      const orders = ordersRes.data.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        client: `${o.firstName || ""} ${o.lastName || ""}`.trim(),
        email: o.email,
        date: o.createdAt ? o.createdAt.slice(0, 10) : "",
        status: o.status,
        total: Number(o.total || 0),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        deliveryCity: o.deliveryCity,
        deliveryPhone: o.deliveryPhone,
      }));

      // PRODUITS
      const products = productsRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand || "TryOn",
        price: Number(p.price || 0),

        // Ici on utilise le stock total calculé par le backend
        stock: Number(p.totalStock || p.stock || 0),

        cat: p.target || p.categoryName || p.categorySlug || "Catalogue",
        image: p.image,
        emoji: "👗",
      }));

      // ESSAYAGES
      const tryons = (tryonsRes.data || []).map((t) => ({
        id: t.id,
        client: `${t.firstName || ""} ${t.lastName || ""}`.trim(),
        product: t.productName || "-",
        brand: t.productBrand || "-",
        score: Number(t.score || 0),
        image: t.resultImage,
        date: t.createdAt,
      }));

      // CLIENTS
      const clients = (clientsRes.data || []).map((c) => ({
        id: c.id,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        email: c.email || "-",
        city: c.city || "-",
        phone: c.phone || "-",
        address: c.address || "-",
        status: c.status || "active",
        orders: Number(c.orders || 0),
        tryons: Number(c.tryons || 0),
        totalSpent: Number(c.totalSpent || 0),
        date: c.createdAt ? c.createdAt.slice(0, 10) : "",
      }));

      // NOTIFICATIONS
      const notificationsPayload =
        notificationsRes?.data?.data ||
        notificationsRes?.data ||
        [];

      const notifications = Array.isArray(notificationsPayload)
        ? notificationsPayload
        : [];

      // PAIEMENTS ET TRANSACTIONS
      const transactions = orders.map((order) => ({
        id: `TRX-${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        method: order.paymentMethod || "cash_on_delivery",
        status: order.paymentStatus || "pending",
        date: order.date,
        client: order.client,
      }));

      // LOGS & SÉCURITÉ
      // Le backend peut renvoyer soit { success, data }, soit directement un tableau selon la configuration du service API.
      const logsPayload = logsRes?.data?.data || logsRes?.data || logsRes || [];
      const logs = Array.isArray(logsPayload) ? logsPayload : [];        
      
      // SUPPORT
      const support = (supportRes.data.data || []).map(ticket => ({
        id: ticket.id,
        client: ticket.client,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        adminResponse: ticket.adminResponse,
        status: ticket.status,
        priority: ticket.priority,
        date: ticket.date,
      }));

      const faqs = faqRes.data.data || [];

      // PROMOTIONS
      const promotionsPayload =
        promotionsRes?.data?.data ||
        promotionsRes?.data ||
        [];

      const promotions = Array.isArray(promotionsPayload)
        ? promotionsPayload.map((promo) => ({
            id: promo.id,
            code: promo.code,
            title: promo.title || promo.code,
            type: promo.type || "percentage",
            value: Number(promo.value || 0),
            maxUsage: Number(promo.maxUsage || 0),
            usedCount: Number(promo.usedCount || 0),
            expires: promo.expires || promo.expiresAt || "",
            active: Boolean(promo.active),
            date: promo.date || "",
          }))
        : [];

      // AVIS & ÉVALUATIONS
      const reviewsPayload =
        reviewsRes?.data?.data ||
        reviewsRes?.data ||
        [];

      const reviews = Array.isArray(reviewsPayload)
        ? reviewsPayload.map((review) => ({
            id: review.id,
            productId: review.productId || null,
            userId: review.userId || null,
            product: review.product || review.productName || "-",
            client: review.client || review.clientName || "-",
            rating: Number(review.rating || 5),
            comment: review.comment || "",
            status: review.status || "pending",
            date: review.date || "",
          }))
        : [];

      // PARAMÈTRES
      const settingsPayload =
        settingsRes?.data?.data ||
        settingsRes?.data ||
        {};

      const settings =
        settingsPayload && typeof settingsPayload === "object" && !Array.isArray(settingsPayload)
          ? settingsPayload
          : {};

      setDb((prev) => ({
        ...prev,
        orders,
        products,
        tryons,
        clients,
        reviews,
        promotions,
        transactions,
        logs,
        notifications,
        support,
        faqs,
        settings: {
          ...prev.settings,
          ...settings,
        },
        audit: ["Données admin chargées depuis le backend"],
        stats: dashboardRes.data,
        reports: reportsRes?.data?.data || reportsRes?.data || {},
      }));
    } catch (error) {
      console.error("Erreur chargement admin :", error.message);
      notify("Erreur chargement admin", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const isOnline = useOnlineStatus();
  const debouncedSearch = useDebounce(search, 300);

  // Persistance des préférences
  useEffect(() => {
    localStorage.setItem('tryon_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('tryon_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  const safeDb = db;
  // Source de vérité unique du dashboard : toutes les sections lisent et modifient uniquement safeDb/db.
  // Les constantes filtrées ci-dessous sont seulement des vues calculées pour l'affichage.

  const saveDb = (updater) => {
    setDb((prev) => {
      return typeof updater === "function"
        ? updater(prev)
        : updater;
    });
  };

  const notify = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const changePage = (key) => {
    setPage(key);
    setSearch("");
    setAdvancedFilters(null);
    setPagination((prev) => ({ ...prev, [key]: 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadLogsFromBackend = async () => {
    try {
      const response = await adminService.getLogs();

      const logsPayload = response?.data?.data || response?.data || response || [];
      const backendLogs = Array.isArray(logsPayload) ? logsPayload : [];

      setDb((prev) => ({
        ...prev,
        logs: backendLogs,
      }));
    } catch (error) {
      console.error("Erreur chargement logs :", error.message);
    }
  };

  const loadNotificationsFromBackend = async () => {
    try {
      const response = await adminService.getNotifications();

      const notificationsPayload =
        response?.data?.data ||
        response?.data ||
        response ||
        [];

      const backendNotifications = Array.isArray(notificationsPayload)
        ? notificationsPayload
        : [];

      setDb((prev) => ({
        ...prev,
        notifications: backendNotifications,
      }));
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error.response?.data?.message || error.message
      );
    }
  };

  const loadSettingsFromBackend = async () => {
    try {
      const response = await adminService.getSettings();

      const settingsPayload =
        response?.data?.data ||
        response?.data ||
        {};

      if (settingsPayload && typeof settingsPayload === "object" && !Array.isArray(settingsPayload)) {
        setDb((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            ...settingsPayload,
          },
        }));
      }
    } catch (error) {
      console.error(
        "Erreur chargement paramètres :",
        error.response?.data?.message || error.message
      );
    }
  };

  const saveSettingsToBackend = async (nextSettings) => {
    try {
      setLoading(true);

      const settingsPayload =
        nextSettings?.settings ||
        nextSettings ||
        safeDb.settings ||
        {};

      await adminService.saveSettings(settingsPayload);
      await loadSettingsFromBackend();
      await loadLogsFromBackend();
      await loadNotificationsFromBackend();

      notify("Paramètres enregistrés avec succès", "success");
    } catch (error) {
      console.error(
        "Erreur sauvegarde paramètres :",
        error.response?.data?.message || error.message
      );
      notify(
        error.response?.data?.message || "Erreur lors de l'enregistrement des paramètres",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsLocal = (updater) => {
    setDb((prev) => {
      const nextDb = typeof updater === "function" ? updater(prev) : updater;
      return nextDb;
    });
  };

  const createAdminNotification = async ({ type = "info", title, message }) => {
    try {
      if (!title || !message) return;

      await adminService.createNotification({
        type,
        title,
        message,
      });

      await loadNotificationsFromBackend();
    } catch (error) {
      console.error(
        "Erreur création notification :",
        error.response?.data?.message || error.message
      );
    }
  };

  const addAudit = async (action, severity = "info") => {
    try {
      await adminService.createLog({
        action,
        severity,
      });

      await loadLogsFromBackend();

      setDb((prev) => ({
        ...prev,
        audit: [action, ...(prev.audit || [])].slice(0, 20),
      }));
    } catch (error) {
      console.error("Erreur ajout log :", error.message);

      // Sauvegarde locale de secours si l'API logs est momentanément indisponible.
      const currentUser =
        JSON.parse(sessionStorage.getItem("tryon_user") || "null") ||
        JSON.parse(localStorage.getItem("tryon_user") || "null");

      const fallbackLog = {
        id: Date.now(),
        user: currentUser?.fullName || currentUser?.name || "Administrateur",
        action,
        ip: "127.0.0.1",
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
        severity,
      };

      setDb((prev) => ({
        ...prev,
        logs: [fallbackLog, ...(prev.logs || [])].slice(0, 100),
        audit: [action, ...(prev.audit || [])].slice(0, 20),
      }));
    }
  };

  // Raccourcis clavier avancés
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const addMap = {
          commandes: 'order',
          produits: 'product',
          clients: 'client',
          promotions: 'promotion',
          notifications: 'notification',
          support: 'support'
        };
        if (addMap[page]) openAdd(addMap[page]);
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector('.search')?.focus();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setSearchModal(true);
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setExportModal(true);
      }
      if (e.ctrlKey && e.key === 's' && modal) {
        e.preventDefault();
        document.querySelector('.modal-body form')?.requestSubmit();
      }
      if (e.key === 'Escape') {
        if (modal) setModal(null);
        if (viewItem) setViewItem(null);
        if (exportModal) setExportModal(false);
        if (searchModal) setSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, modal, viewItem, exportModal, searchModal]);

  const kpi = useMemo(() => {
    const revenue = (safeDb.orders || [])
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total || 0), 0);
    const panierTryons = (safeDb.tryons || []).filter((t) => t.result === "panier").length;
    const conversion = Math.round((panierTryons / Math.max(1, safeDb.tryons.length)) * 100);
    const avgOrder = safeDb.orders.filter(o => o.status !== "cancelled").length > 0 
      ? Math.round(revenue / safeDb.orders.filter(o => o.status !== "cancelled").length) 
      : 0;
    const pendingReviews = (safeDb.reviews || []).filter(r => r.status === "pending").length;
    const lowStock = (safeDb.products || []).filter(p => p.stock < 6).length;
    const totalTransactions = (safeDb.transactions || []).length;
    const openSupport = (safeDb.support || []).filter(s => s.status === "open").length;
    const unreadNotifs = (safeDb.notifications || []).filter(n => !n.read).length;
    return { 
      revenue, orders: safeDb.orders.length, clients: safeDb.clients.length, 
      conversion, avgOrder, pendingReviews, lowStock, totalTransactions,
      openSupport, unreadNotifs
    };
  }, [safeDb.orders, safeDb.clients, safeDb.tryons, safeDb.reviews, safeDb.products, safeDb.transactions, safeDb.support, safeDb.notifications]);

  const filterByDate = (items) => {
    if (dateFilter === 'all') return items;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return items.filter(item => {
      if (dateFilter === 'today') return item.date === today;
      if (dateFilter === 'week') return item.date >= weekAgo.toISOString().slice(0, 10);
      if (dateFilter === 'month') return item.date >= monthAgo.toISOString().slice(0, 10);
      return true;
    });
  };

  const q = debouncedSearch.toLowerCase();

  const applyAdvancedFilters = (items) => {
    if (!advancedFilters) return items;
    
    return items.filter(item => {
      let match = true;
      if (advancedFilters.keyword && !String(item.name || item.client || item.id || '').toLowerCase().includes(advancedFilters.keyword.toLowerCase())) {
        match = false;
      }
      if (advancedFilters.category && advancedFilters.category !== 'all' && item.cat !== advancedFilters.category) {
        match = false;
      }
      if (advancedFilters.status && advancedFilters.status !== 'all' && item.status !== advancedFilters.status) {
        match = false;
      }
      if (advancedFilters.priceMin && item.price && Number(item.price) < Number(advancedFilters.priceMin)) {
        match = false;
      }
      if (advancedFilters.priceMax && item.price && Number(item.price) > Number(advancedFilters.priceMax)) {
        match = false;
      }
      if (advancedFilters.dateFrom && item.date && item.date < advancedFilters.dateFrom) {
        match = false;
      }
      if (advancedFilters.dateTo && item.date && item.date > advancedFilters.dateTo) {
        match = false;
      }
      return match;
    });
  };

  const products = applyAdvancedFilters(
    (safeDb.products || []).filter(
      (p) =>
        (catFilter === "all" || p.cat === catFilter) &&
        `${p.name || ""} ${p.brand || ""} ${p.cat || ""}`.toLowerCase().includes(q)
    )
  );

  const stockStats = useMemo(() => {
    const allProducts = safeDb.products || [];

    const rupture = allProducts.filter((p) => Number(p.stock || 0) === 0);
    const faible = allProducts.filter(
      (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5
    );
    const disponible = allProducts.filter((p) => Number(p.stock || 0) > 5);

    return {
      rupture,
      faible,
      disponible,
    };
  }, [safeDb.products]);

  const stockProducts = useMemo(() => {
    const allProducts = safeDb.products || [];

    if (stockFilter === "rupture") {
      return allProducts.filter((p) => Number(p.stock || 0) === 0);
    }

    if (stockFilter === "faible") {
      return allProducts.filter(
        (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5
      );
    }

    if (stockFilter === "disponible") {
      return allProducts.filter((p) => Number(p.stock || 0) > 5);
    }

    return allProducts;
  }, [safeDb.products, stockFilter]);

  const orders = applyAdvancedFilters(
    filterByDate(safeDb.orders || []).filter(
      (o) =>
        (orderFilter === "all" || o.status === orderFilter) &&
        `${o.id || ""} ${o.client || ""} ${o.status || ""}`.toLowerCase().includes(q)
    )
  );

  const clients = (safeDb.clients || []).filter((c) =>
    `${c.name || ""} ${c.email || ""} ${c.city || ""}`.toLowerCase().includes(q)
  );

  const tryons = (safeDb.tryons || []).filter((t) =>
    `${t.client || ""} ${t.product || ""} ${t.result || ""}`.toLowerCase().includes(q)
  );

  const reviews = (safeDb.reviews || []).filter(
    (r) =>
      (reviewFilter === "all" || r.status === reviewFilter) &&
      `${r.product || ""} ${r.client || ""} ${r.comment || ""}`.toLowerCase().includes(q)
  );

  const promotions = (safeDb.promotions || []).filter(
    (p) =>
      (promoFilter === "all" || p.active === (promoFilter === "active")) &&
      `${p.code || ""} ${p.type || ""}`.toLowerCase().includes(q)
  );

  const transactions = (safeDb.transactions || []).filter((t) =>
    `${t.id || ""} ${t.orderNumber || ""} ${t.client || ""} ${t.method || ""} ${t.status || ""}`.toLowerCase().includes(q)
  );

  const logs = applyAdvancedFilters(
    (safeDb.logs || []).filter(
      (log) =>
        (logFilter === "all" || log.severity === logFilter) &&
        `${log.user || ""} ${log.action || ""} ${log.ip || ""}`
          .toLowerCase()
          .includes(q)
    )
  );

  const notifications = (safeDb.notifications || []).filter(
    (n) =>
      (notifFilter === "all" || n.type === notifFilter) &&
      `${n.title || ""} ${n.message || ""}`.toLowerCase().includes(q)
  );

  const support = (safeDb.support || []).filter(
    (s) =>
      (supportFilter === "all" || s.status === supportFilter) &&
      `${s.client || ""} ${s.email || ""} ${s.subject || ""} ${s.message || ""}`.toLowerCase().includes(q)
  );

  const faqs = (safeDb.faqs || []).filter((f) =>
    `${f.question || ""} ${f.answer || ""} ${f.category || ""}`.toLowerCase().includes(q)
  );

  const ordersPage = paginate(orders, pagination.commandes, 5);
  const productsPage = paginate(products, pagination.produits, 6);
  const clientsPage = paginate(clients, pagination.clients, 5);
  const stockPage = paginate(
    stockProducts,
    pagination.stock,
    8
  );
  const transactionsPage = paginate(
    safeDb.transactions || [],
    pagination.transactions,
    5
  );
  const tryonsPage = paginate(tryons, pagination.essayages, 5);
  const reviewsPage = paginate(reviews, pagination.reviews, 5);
  const promotionsPage = paginate(promotions, pagination.promotions, 4);
  const logsPage = paginate(logs, pagination.logs, 5);
  const notificationsPage = paginate(notifications, pagination.notifications, 5);
  const supportPage = paginate(support, pagination.support, 5);
  const faqPage = paginate(faqs, pagination.faq, 5);

  const reportCategories = useMemo(() => {
    const counts = {};
    (safeDb.products || []).forEach((product) => {
      const key = product.cat || "Autres";
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = Math.max(1, (safeDb.products || []).length);
    return Object.entries(counts).map(([label, count]) => ({
      label,
      width: Math.round((count / total) * 100),
      value: `${Math.round((count / total) * 100)}%`,
    }));
  }, [safeDb.products]);

  const reviewStats = useMemo(() => {
    const reviewsList = safeDb.reviews || [];
    const total = Math.max(1, reviewsList.length);
    const groups = [5, 4, 3, 2];
    return groups.map((rating) => {
      const count = rating === 2
        ? reviewsList.filter((review) => Number(review.rating || 0) <= 2).length
        : reviewsList.filter((review) => Number(review.rating || 0) === rating).length;
      const percent = Math.round((count / total) * 100);
      return {
        label: rating === 2 ? "⭐ 1-2 étoiles" : `⭐ ${rating} étoiles`,
        percent,
      };
    });
  }, [safeDb.reviews]);

  const setPageNumber = (section, value) => {
    setPagination((prev) => ({ ...prev, [section]: value }));
  };

  const logout = () => {
    authLogout(); // ← vide le localStorage ET fait setUser(null)
    navigate("/auth");
  };

  const download = (name, content, type) => {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  };

  // Export avancé
  const handleAdvancedExport = ({ format, data, columns }) => {
    setExporting(true);
    setTimeout(() => {
      try {
        if (format === 'csv') {
          const headers = columns.join(';');
          const rows = data.map(row => columns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(';'));
          const csv = [headers, ...rows].join('\n');
          download('export_tryon.csv', '\uFEFF' + csv, 'text/csv');
        } else if (format === 'excel') {
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Données');
          XLSX.writeFile(wb, 'export_tryon.xlsx');
        } else if (format === 'json') {
          download('export_tryon.json', JSON.stringify(data, null, 2), 'application/json');
        } else if (format === 'pdf') {
          window.print();
        }
        addAudit(`Export ${format.toUpperCase()} avancé généré`, "info");
        notify(`Export ${format.toUpperCase()} généré`, 'success');
        setExportModal(false);
      } catch (error) {
        notify('Erreur lors de l\'export', 'error');
      } finally {
        setExporting(false);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!showLogout) return;
    const close = (e) => {
      if (!e.target.closest('.admin-profile-card')) setShowLogout(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showLogout]);

  // Export PDF pour la section ventes
  const runExportPdf = () => {
    window.print();
    addAudit('Export PDF généré', "info");
    notify('Export PDF généré', 'success');
  };

  const remove = async (kind, id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    try {
      setLoading(true);

      if (kind === "log") {
        await adminService.deleteLog(id);
        await loadLogsFromBackend();
        notify("Log supprimé avec succès", "success");
        return;
      }

      if (kind === "notification") {
        await adminService.deleteNotification(id);
        await loadNotificationsFromBackend();
        notify("Notification supprimée avec succès", "success");
        await addAudit(`Notification supprimée : ${id}`, "info");
        return;
      }

      if (kind === "support") {
        const ticket = (safeDb.support || []).find((item) => item.id === id);

        await adminService.deleteSupportTicket(id);
        await loadAdminData();

        notify("Ticket support supprimé avec succès", "success");
        await addAudit(`Ticket support supprimé : ${ticket?.subject || id}`, "warning");
        return;
      }

      if (kind === "faq") {
        const faq = (safeDb.faqs || []).find((item) => item.id === id);

        await adminService.deleteFaq(id);
        await loadAdminData();

        notify("FAQ supprimée avec succès", "success");
        await addAudit(`FAQ supprimée : ${faq?.question || id}`, "warning");
        return;
      }

      if (kind === "promotion") {
        const promotion = (safeDb.promotions || []).find((item) => item.id === id);

        await adminService.deletePromotion(id);
        await loadAdminData();

        notify("Promotion supprimée avec succès", "success");
        await addAudit(`Promotion supprimée : ${promotion?.code || id}`, "warning");
        return;
      }

      if (kind === "review") {
        const review = (safeDb.reviews || []).find((item) => item.id === id);

        await adminService.deleteReview(id);
        await loadAdminData();

        notify("Avis supprimé avec succès", "success");
        await addAudit(`Avis supprimé : ${review?.product || id}`, "warning");
        return;
      }

      if (kind === "product") {
        const productToDelete = (safeDb.products || []).find((product) => product.id === id);
        const productName = productToDelete?.name || `Produit ${id}`;

        await adminService.deleteProduct(id);

        await createAdminNotification({
          type: "info",
          title: "Produit supprimé",
          message: `${productName} a été supprimé du catalogue.`,
        });

        await loadAdminData();

        notify("Produit supprimé avec succès", "success");
        await addAudit(`Produit supprimé : ${productName}`, "critical");
        return;
      }

      if (kind === "tryon") {
        await adminService.deleteTryon(id);
        await loadAdminData();
        notify(
          "Essayage supprimé avec succès",
          "success"
        );
        addAudit(`Essayage supprimé : ${id}`, "warning");
        return;
      }

      if (kind === "client") {
        await adminService.deleteClient(id);

        await loadAdminData();

        notify("Client désactivé avec succès", "success");
        addAudit(`Client désactivé : ${id}`, "warning");
        return;
      }

      notify(`Suppression ${kind} à connecter au backend`, "info");
    } catch (error) {
      notify(error.message || "Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (type, item) => {
    setModal({ type, mode: "edit", item });
  };

  const openAdd = (type) => {
    setModal({ type, mode: "add", item: null });
  };

  const openView = async (type, item) => {
    if (type === "order") {
      try {
        setLoading(true);

        const response = await adminService.getOrder(item.id);

        setViewItem({
          type,
          item: response.data,
        });

        return;
      } catch (error) {
        notify(error.message || "Impossible de charger la commande", "error");
        return;
      } finally {
        setLoading(false);
      }
    }

    if (type === "product") {
      try {
        setLoading(true);

        const response = await adminService.getProduct(item.id);

        setViewItem({
          type,
          item: response.data,
        });

        return;
      } catch (error) {
        notify(error.message || "Impossible de charger le produit", "error");
        return;
      } finally {
        setLoading(false);
      }
    }

    setViewItem({ type, item });
  };

  const openRestock = async (product) => {
    try {
      setLoading(true);

      const response = await adminService.getProduct(product.id);

      setModal({
        type: "restock",
        mode: "edit",
        item: response.data,
      });
    } catch (error) {
      notify(error.message || "Impossible de charger le stock", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveModal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = Object.fromEntries(
        new FormData(e.currentTarget).entries()
      );

      // COMMANDES
      if (
        modal?.type === "order" &&
        modal.mode === "edit" &&
        modal.item?.id
      ) {
        const orderNumber = modal.item?.orderNumber || modal.item?.id;
        const previousStatus = modal.item?.status;
        const nextStatus = form.status;

        await adminService.updateOrderStatus(
          modal.item.id,
          nextStatus
        );

        if (previousStatus !== nextStatus) {
          if (nextStatus === "delivered") {
            await createAdminNotification({
              type: "order",
              title: "Commande validée",
              message: `La commande ${orderNumber} a été validée.`,
            });

            await addAudit(`Commande validée : ${orderNumber}`, "info");
          } else if (nextStatus === "cancelled") {
            await createAdminNotification({
              type: "order",
              title: "Commande annulée",
              message: `La commande ${orderNumber} a été annulée.`,
            });

            await addAudit(`Commande annulée : ${orderNumber}`, "warning");
          } else {
            await createAdminNotification({
              type: "order",
              title: "Statut commande mis à jour",
              message: `La commande ${orderNumber} est maintenant en cours de traitement.`,
            });

            await addAudit(`Statut commande mis à jour : ${orderNumber}`, "info");
          }
        }

        await loadAdminData();

        setModal(null);

        notify(
          "Statut de la commande mis à jour",
          "success"
        );

        return;
      }

      // STOCK (REAPPROVISIONNEMENT)
      if (modal?.type === "restock") {
        const sizeMap = {
          XS: 1,
          S: 2,
          M: 3,
          L: 4,
          XL: 5,
          XXL: 6,
        };

        const productId = modal.item?.id;

        for (const [label, sizeId] of Object.entries(sizeMap)) {
          const addedStock = Number(form[`restock_${label}`] || 0);

          if (addedStock > 0) {
            const currentStock =
              modal.item?.sizes?.find((s) => s.sizeLabel === label)?.stock || 0;

            await adminService.addProductSize(productId, {
              sizeId,
              stock: Number(currentStock) + addedStock,
            });
          }
        }

        await createAdminNotification({
          type: "stock",
          title: "Stock réapprovisionné",
          message: `${modal.item?.name || "Produit"} a été réapprovisionné.`,
        });

        await loadAdminData();
        setModal(null);
        notify("Stock réapprovisionné avec succès", "success");
        await addAudit(`Réapprovisionnement : ${modal.item?.name}`, "info");
        return;
      }

      // PRODUITS
      if (modal?.type === "product") {
        const formElement = e.currentTarget;

        const payload = {
          name: form.name,
          brand: form.brand || "",
          price: Number(form.price),
          stock: Number(form.stock || 0),
          target: form.cat || "unisexe",
          status: "active",
        };

        const imageFile = formElement.elements.image?.files?.[0];

        let productId = modal.item?.id;

        if (modal.mode === "edit" && productId) {
          await adminService.updateProduct(productId, payload);

          await createAdminNotification({
            type: "info",
            title: "Produit modifié",
            message: `${payload.name} a été modifié dans le catalogue.`,
          });

          notify("Produit modifié avec succès", "success");
          await addAudit(`Produit modifié : ${payload.name}`, "info");
        } else {
          const created = await adminService.createProduct(payload);

          productId =
            created.data?.id ||
            created.data?.productId ||
            created.data?.insertId ||
            created.data?.data?.id ||
            created.data?.data?.productId ||
            created.data?.data?.insertId;

          await createAdminNotification({
            type: "info",
            title: "Nouveau produit",
            message: `${payload.name} a été ajouté au catalogue.`,
          });

          notify("Produit ajouté avec succès", "success");
          await addAudit(`Produit ajouté : ${payload.name}`, "info");
        }

        if (imageFile && productId) {
          const imageData = new FormData();
          imageData.append("image", imageFile);
          imageData.append("isMain", "true");

          await adminService.uploadProductImage(productId, imageData);
        }

        const sizeMap = {
          XS: 1,
          S: 2,
          M: 3,
          L: 4,
          XL: 5,
          XXL: 6,
        };

        for (const [label, sizeId] of Object.entries(sizeMap)) {
          const stock = Number(form[`stock_${label}`] || 0);

          await adminService.addProductSize(productId, {
            sizeId,
            stock,
          });
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      // PROMOTIONS
      if (modal?.type === "promotion") {
        const payload = {
          code: String(form.code || "").trim().toUpperCase(),
          title: form.title || form.code,
          type: form.type || "percentage",
          value: Number(form.value || 0),
          expires: form.expires || null,
          maxUsage: Number(form.maxUsage || 100),
          active: form.active === "true",
        };

        if (modal.mode === "edit" && modal.item?.id) {
          await adminService.updatePromotion(modal.item.id, payload);
          await addAudit(`Promotion modifiée : ${payload.code}`, "info");
          notify("Promotion mise à jour avec succès", "success");
        } else {
          await adminService.createPromotion(payload);
          await addAudit(`Promotion créée : ${payload.code}`, "info");
          notify("Promotion créée avec succès", "success");
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      // AVIS & ÉVALUATIONS
      if (modal?.type === "review") {
        const payload = {
          product: form.product,
          client: form.client,
          rating: Number(form.rating || 5),
          comment: form.comment,
          status: form.status || "pending",
        };

        if (modal.mode === "edit" && modal.item?.id) {
          await adminService.updateReview(modal.item.id, payload);
          await addAudit(`Avis modifié : ${payload.product}`, "info");
          notify("Avis mis à jour avec succès", "success");
        } else {
          await adminService.createReview(payload);
          await addAudit(`Avis ajouté : ${payload.product}`, "info");
          notify("Avis ajouté avec succès", "success");
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      // NOTIFICATIONS
      if (modal?.type === "notification") {
        if (modal.mode === "edit") {
          notify("La modification des notifications sera connectée au backend dans une prochaine étape", "info");
          setModal(null);
          return;
        }

        await adminService.createNotification({
          type: form.type || "info",
          title: form.title,
          message: form.message,
        });

        await loadNotificationsFromBackend();
        await addAudit(`Notification créée : ${form.title}`, "info");

        notify("Notification créée avec succès", "success");
        setModal(null);
        return;
      }

      // SUPPORT & FAQ - TICKETS SUPPORT
      if (modal?.type === "support") {
        const payload = {
          fullName: form.fullName || form.client || "Client",
          email: form.email || "client@tryon.cm",
          subject: form.subject,
          message: form.message,
          adminResponse: form.adminResponse || "",
          status: form.status || "open",
          priority: form.priority || "medium",
        };

        if (modal.mode === "edit" && modal.item?.id) {
          await adminService.updateSupportTicket(modal.item.id, payload);
          await addAudit(`Ticket support modifié : ${payload.subject}`, "info");
          notify("Ticket support mis à jour avec succès", "success");
        } else {
          await adminService.createSupportTicket(payload);
          await addAudit(`Ticket support créé : ${payload.subject}`, "info");
          notify("Ticket support créé avec succès", "success");
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      // SUPPORT & FAQ - FAQ
      if (modal?.type === "faq") {
        const payload = {
          question: form.question,
          answer: form.answer,
          category: form.category || "Général",
          active: form.active === "true",
        };

        if (modal.mode === "edit" && modal.item?.id) {
          await adminService.updateFaq(modal.item.id, payload);
          await addAudit(`FAQ modifiée : ${payload.question}`, "info");
          notify("FAQ mise à jour avec succès", "success");
        } else {
          await adminService.createFaq(payload);
          await addAudit(`FAQ ajoutée : ${payload.question}`, "info");
          notify("FAQ ajoutée avec succès", "success");
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      // CLIENTS
      if (modal?.type === "client") {
        const nameParts = (form.name || "").trim().split(" ");

        const payload = {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: form.phone || "",
          city: form.city || "",
          address: form.address || "",
          status: form.status || "active",
        };

        if (modal.mode === "edit" && modal.item?.id) {
          await adminService.updateClient(modal.item.id, payload);
          notify("Client modifié avec succès", "success");
          addAudit(`Client modifié : ${form.name}`, "warning");
        }

        await loadAdminData();
        setModal(null);
        return;
      }

      notify("Cette action sera connectée au backend dans l'étape suivante", "info");
      setModal(null);
    } catch (error) {
      notify(
        error.message ||
          "Erreur lors de l'enregistrement",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await adminService.markNotificationRead(id);
      await loadNotificationsFromBackend();
      notify("Notification marquée comme lue", "success");
    } catch (error) {
      console.error(
        "Erreur mise à jour notification :",
        error.response?.data?.message || error.message
      );

      saveDb((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));

      notify("Notification marquée comme lue localement", "info");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await adminService.markAllNotificationsRead();
      await loadNotificationsFromBackend();
      notify("Toutes les notifications ont été marquées comme lues", "success");
    } catch (error) {
      console.error(
        "Erreur mise à jour notifications :",
        error.response?.data?.message || error.message
      );

      saveDb((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));

      notify("Notifications marquées comme lues localement", "info");
    }
  };

  const togglePromotionStatus = async (promotion) => {
    try {
      await adminService.togglePromotion(promotion.id, !promotion.active);
      await loadAdminData();
      notify(
        promotion.active ? "Promotion désactivée" : "Promotion activée",
        "success"
      );
    } catch (error) {
      notify(error.message || "Erreur lors du changement de statut", "error");
    }
  };

  const updateReviewStatus = async (review, status) => {
    try {
      await adminService.updateReviewStatus(review.id, status);
      await loadAdminData();
      notify("Statut de l'avis mis à jour", "success");
    } catch (error) {
      notify(error.message || "Erreur lors du changement de statut", "error");
    }
  };

  const handleAdvancedSearch = (filters) => {
    setAdvancedFilters(filters);
    setSearchModal(false);
    setPagination((prev) => ({ ...prev, [page]: 1 }));
    notify('Recherche avancée appliquée', 'success');
  };

    return (
    <div className={`tryon-admin ${collapsed ? "collapsed" : ""} ${darkMode ? "dark" : ""}`}>
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Mode hors ligne - Données backend indisponibles
        </div>
      )}

      {/* Overlay pour le menu mobile - ajouté AVANT la sidebar */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`} 
        onClick={toggleMobileMenu}
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-text">
            <div className="brand-title">TryOn</div>
          </div>
          <div className="brand-actions">
            {/* Bouton de fermeture pour mobile */}
            <button 
              className="mobile-close-btn" 
              onClick={toggleMobileMenu}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
            <button 
              className="collapse-btn" 
              onClick={() => setCollapsed(!collapsed)} 
              aria-label={collapsed ? "Agrandir la sidebar" : "Réduire la sidebar"} 
              title={collapsed ? "Agrandir la sidebar" : "Réduire la sidebar"}
            >
              ☰
            </button>
          </div>
        </div>

        <nav className="nav">
          {nav.map((item, index) => {
            const prevItem = index > 0 ? nav[index - 1] : null;
            const showGroup = !prevItem || prevItem.group !== item.group;
            
            return (
              <React.Fragment key={item.key}>
                {showGroup && <div className="nav-section">{item.group}</div>}
                <button 
                  className={`nav-item ${page === item.key ? "active" : ""}`} 
                  onClick={() => handleNavClick(item.key)} 
                  title={collapsed ? item.label : ""}
                >
                  <span className="ico">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.key === "notifications" && kpi.unreadNotifs > 0 && (
                    <span className="badge-notif">{kpi.unreadNotifs}</span>
                  )}
                  {item.key === "avis" && kpi.pendingReviews > 0 && (
                    <span className="badge-notif">{kpi.pendingReviews}</span>
                  )}
                  {item.key === "support" && kpi.openSupport > 0 && (
                    <span className="badge-notif">{kpi.openSupport}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div
          className="admin-profile-card"
          onClick={() => setShowLogout(!showLogout)}
          style={{ cursor: 'pointer' }}
        >
          {showLogout ? (
            <button
              className="logout"
              style={{ width: '100%', margin: 0 }}
              onClick={(e) => { e.stopPropagation(); logout(); }}
            >
              <span className="ico">🚪</span>
              <span>Déconnexion</span>
            </button>
          ) : (
            <>
              <div className="admin-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={adminName} />
                ) : (
                  <span>{adminInitials}</span>
                )}
              </div>
              <div className="admin-profile-info">
                <strong>{adminName}</strong>
                <span>{adminEmail}</span>
                <small><i></i>En ligne</small>
              </div>
            </>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button 
              className="mobile-menu" 
              onClick={toggleMobileMenu} 
              aria-label="Menu"
            >
              ☰
            </button>
            <div>
              <h1 className="page-title">{titles[page]?.[0] || "Tableau de bord"}</h1>
              <p className="page-subtitle">{titles[page]?.[1] || "Vue globale de l'activité"}</p>
            </div>
          </div>
          <div className="top-actions">
            <input 
              className="search" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Recherche rapide (Ctrl + F)"
              aria-label="Recherche"
            />
            <button className="btn btn-light" onClick={() => setSearchModal(true)} title="Recherche avancée (Ctrl+Shift+F)">🔍 Avancée</button>
            <button className="btn btn-red" onClick={() => setExportModal(true)} title="Export avancé (Ctrl+E)">📤 Export</button>
          </div>
        </header>

        <>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          loading ? (
            <DashboardSkeleton />
          ) : (
            <DashboardHomeSection
              orders={orders}
              products={products}
              clients={clients}
              tryons={tryons}
              logs={logs}
              safeDb={safeDb}
              goToPage={setPage}
            />
          )
        )}

          {/* COMMANDES */}
          {page === "commandes" && (
            <OrdersSection
              ordersPage={ordersPage}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* PRODUITS */}
          {page === "produits" && (
            <ProductsSection
              productsPage={productsPage}
              catFilter={catFilter}
              setCatFilter={setCatFilter}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* CLIENTS */}
          {page === "clients" && (
            <ClientsSection
              clientsPage={clientsPage}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* ESSAYAGES */}
          {page === "essayages" && (
            <TryonsSection
              tryonsPage={tryonsPage}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
            />
          )}

          {/* VENTES */}
          {page === "ventes" && (
            <SalesSection
              orders={orders}
              products={products}
              runExport={() => setExportModal(true)}
            />
          )}

          {/* STOCK & APPROVISIONNEMENT */}
          {page === "stock" && (
            <StockSection
              stockStats={stockStats}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              stockPage={stockPage}
              openView={openView}
              openRestock={openRestock}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* AVIS & ÉVALUATIONS */}
          {page === "avis" && (
            <ReviewsSection
              reviewsPage={reviewsPage}
              reviewFilter={reviewFilter}
              setReviewFilter={setReviewFilter}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
              updateReviewStatus={updateReviewStatus}
            />
          )}

          {/* PROMOTIONS */}
          {page === "promotions" && (
            <PromotionsSection
              promotionsPage={promotionsPage}
              promoFilter={promoFilter}
              setPromoFilter={setPromoFilter}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
              togglePromotionStatus={togglePromotionStatus}
            />
          )}

          {/* PAIEMENTS & TRANSACTIONS */}
          {page === "paiements" && (
            <PaymentsSection
              transactions={safeDb.transactions || []}
              transactionsPage={transactionsPage}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* ANALYSE & RAPPORTS */}
          {page === "rapports" && (
            <ReportsSection
              orders={orders}
              products={products}
              clients={clients}
              reviews={reviews}
              support={support}
            />
          )}

          {/* NOTIFICATIONS */}
          {page === "notifications" && (
            <NotificationsSection
              notificationsPage={notificationsPage}
              markAllNotificationsRead={markAllNotificationsRead}
              markNotificationRead={markNotificationRead}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* SUPPORT & FAQ */}
          {page === "support" && (
            <SupportSection
              supportPage={supportPage}
              faqPage={faqPage}
              faqs={faqs}
              supportFilter={supportFilter}
              setSupportFilter={(value) => {
                setSupportFilter(value);
                setPageNumber("support", 1);
              }}
              openAdd={openAdd}
              openView={openView}
              openEdit={openEdit}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* LOGS & SÉCURITÉ */}
          {page === "logs" && (
            <LogsSection
              logsPage={logsPage}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              openView={openView}
              remove={remove}
              setPageNumber={setPageNumber}
              onAdvancedSearch={() => setSearchModal(true)}
            />
          )}

          {/* PARAMÈTRES */}
          {page === "parametres" && (
            <SettingsSection
              safeDb={safeDb}
              saveDb={updateSettingsLocal}
              onSaveSettings={saveSettingsToBackend}
              saveSettings={saveSettingsToBackend}
              loading={loading}
              darkMode={darkMode} 
              setDarkMode={setDarkMode}
            />
          )}

        </>
      </main>

      {modal?.type === "support" && (
        <SupportModal
          modal={modal}
          close={() => setModal(null)}
          save={saveModal}
          loading={loading}
        />
      )}
      {modal?.type === "faq" && (
        <FaqModal
          modal={modal}
          close={() => setModal(null)}
          save={saveModal}
          loading={loading}
        />
      )}
      {modal && !["support", "faq"].includes(modal.type) && (
        <Modal modal={modal} close={() => setModal(null)} save={saveModal} loading={loading} />
      )}
      {viewItem && <ViewModal view={viewItem} close={() => setViewItem(null)} />}
      {exportModal && (
        <ExportModal 
          onExport={handleAdvancedExport} 
          onClose={() => setExportModal(false)} 
          orders={safeDb.orders}
        />
      )}
      {searchModal && (
        <AdvancedSearch 
          onSearch={handleAdvancedSearch} 
          onClose={() => setSearchModal(false)} 
        />
      )}
      {exporting && (
        <div className="export-overlay">
          <div className="export-box">
            <div className="loader" />
            <h2>Exportation en cours...</h2>
            <p>Préparation du fichier TryOn</p>
            <div className="progress"><div className="progress-fill" style={{ width: '100%' }} /></div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : toast.type === 'success' ? 'toast-success' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Dashboard;