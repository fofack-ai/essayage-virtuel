import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const STORAGE_KEY = "tryon_admin_v2";

const seed = {
  products: [
    { id: "PRD-001", name: "Robe Évasée Florale", brand: "Afro Chic", price: 15000, stock: 18, cat: "femme", emoji: "👗" },
    { id: "PRD-002", name: "Veste Structurée", brand: "Élégance", price: 19500, stock: 4, cat: "homme", emoji: "🧥" },
    { id: "PRD-003", name: "Chemise Lin Premium", brand: "Casual", price: 9800, stock: 22, cat: "homme", emoji: "👕" },
    { id: "PRD-004", name: "Ensemble Tailleur", brand: "Business", price: 32000, stock: 9, cat: "homme", emoji: "👔" },
    { id: "PRD-005", name: "Sac Wax Signature", brand: "Accessoires", price: 12500, stock: 3, cat: "accessoire", emoji: "👜" },
    { id: "PRD-006", name: "Boubou Brodé Royal", brand: "Tradition", price: 27000, stock: 11, cat: "homme", emoji: "🪡" },
    { id: "PRD-007", name: "Kimono Wax Court", brand: "Afro Chic", price: 16500, stock: 7, cat: "femme", emoji: "🥻" },
  ],
  orders: [
    { id: "#0042", client: "Marie Ngo", date: "2026-06-18", status: "pending", total: 15000 },
    { id: "#0041", client: "Lindsay Richarda", date: "2026-06-18", status: "delivered", total: 32000 },
    { id: "#0040", client: "Yannick Eko", date: "2026-06-17", status: "delivered", total: 9800 },
    { id: "#0039", client: "Paul Mbarga", date: "2026-06-16", status: "cancelled", total: 18500 },
    { id: "#0038", client: "Nadia Kenfack", date: "2026-06-15", status: "delivered", total: 27000 },
    { id: "#0037", client: "Eric Talla", date: "2026-06-14", status: "pending", total: 14500 },
  ],
  clients: [
    { id: "CLI-001", name: "Yannick Eko", email: "yannickeko70@gmail.com", city: "Douala", orders: 3, total: 78000 },
    { id: "CLI-002", name: "Lindsay Richarda", email: "lindsayricharda10@gmail.com", city: "Douala", orders: 1, total: 32000 },
    { id: "CLI-003", name: "Marie Ngo", email: "marie@exemple.cm", city: "Yaoundé", orders: 2, total: 24800 },
    { id: "CLI-004", name: "Paul Mbarga", email: "paul@exemple.cm", city: "Douala", orders: 2, total: 51500 },
  ],
  tryons: [
    { id: "TRY-001", client: "Yannick Eko", product: "Robe Wax Royale", score: 94, result: "panier" },
    { id: "TRY-002", client: "Lindsay Richarda", product: "Chemise Prestige", score: 88, result: "favori" },
    { id: "TRY-003", client: "Marie Ngo", product: "Robe Africa Chic", score: 91, result: "panier" },
    { id: "TRY-004", client: "Nadia Kenfack", product: "Kimono Wax Court", score: 87, result: "comparaison" },
  ],
  reviews: [
    { id: "REV-001", product: "Robe Évasée Florale", client: "Marie Ngo", rating: 5, comment: "Magnifique robe, très belle coupe !", date: "2026-06-18", status: "approved" },
    { id: "REV-002", product: "Veste Structurée", client: "Paul Mbarga", rating: 4, comment: "Bonne qualité, légèrement petit à la taille.", date: "2026-06-17", status: "pending" },
    { id: "REV-003", product: "Sac Wax Signature", client: "Nadia Kenfack", rating: 5, comment: "Superbe sac, les couleurs sont magnifiques !", date: "2026-06-16", status: "approved" },
    { id: "REV-004", product: "Chemise Lin Premium", client: "Eric Talla", rating: 3, comment: "Bon produit mais un peu cher.", date: "2026-06-15", status: "pending" },
  ],
  promotions: [
    { id: "PROMO-001", code: "TRYON10", type: "percentage", value: 10, expires: "2026-07-01", usage: 45, maxUsage: 100, active: true },
    { id: "PROMO-002", code: "WELCOME15", type: "percentage", value: 15, expires: "2026-08-15", usage: 120, maxUsage: 200, active: true },
    { id: "PROMO-003", code: "FREESHIP", type: "fixed", value: 5000, expires: "2026-06-30", usage: 28, maxUsage: 50, active: false },
  ],
  transactions: [
    { id: "TRX-001", order: "#0042", amount: 15000, method: "Orange Money", status: "completed", date: "2026-06-18" },
    { id: "TRX-002", order: "#0041", amount: 32000, method: "MTN MoMo", status: "completed", date: "2026-06-18" },
    { id: "TRX-003", order: "#0040", amount: 9800, method: "Carte Bancaire", status: "pending", date: "2026-06-17" },
    { id: "TRX-004", order: "#0039", amount: 18500, method: "Orange Money", status: "refunded", date: "2026-06-16" },
  ],
  logs: [
    { id: "LOG-001", user: "Admin TryOn", action: "Connexion", ip: "192.168.1.1", date: "2026-06-18 08:30", severity: "info" },
    { id: "LOG-002", user: "Admin TryOn", action: "Suppression produit PRD-005", ip: "192.168.1.1", date: "2026-06-18 09:15", severity: "warning" },
    { id: "LOG-003", user: "Admin TryOn", action: "Tentative de connexion échouée", ip: "192.168.1.45", date: "2026-06-18 10:00", severity: "critical" },
    { id: "LOG-004", user: "Admin TryOn", action: "Modification paramètres", ip: "192.168.1.1", date: "2026-06-17 14:20", severity: "info" },
  ],
  notifications: [
    { id: "NOTIF-001", title: "Nouvelle commande #0043", message: "Une nouvelle commande a été passée par Yannick Eko", type: "order", read: false, date: "2026-06-18 08:30" },
    { id: "NOTIF-002", title: "Stock faible", message: "Le produit 'Veste Structurée' n'a plus que 4 unités en stock", type: "stock", read: false, date: "2026-06-18 07:45" },
    { id: "NOTIF-003", title: "Nouvel avis client", message: "Marie Ngo a laissé un avis sur 'Robe Évasée Florale'", type: "review", read: true, date: "2026-06-17 16:20" },
  ],
  support: [
    { id: "SUP-001", client: "Marie Ngo", subject: "Problème de livraison", message: "Ma commande n'est toujours pas arrivée...", status: "open", priority: "high", date: "2026-06-18" },
    { id: "SUP-002", client: "Paul Mbarga", subject: "Demande de retour", message: "Je souhaite retourner la veste car elle est trop petite", status: "in-progress", priority: "medium", date: "2026-06-17" },
    { id: "SUP-003", client: "Nadia Kenfack", subject: "Question sur une taille", message: "Je souhaite connaître les mesures exactes du kimono", status: "closed", priority: "low", date: "2026-06-16" },
  ],
  audit: ["Connexion administrateur", "Catalogue connecté", "Panier client synchronisé", "Export CSV généré"],
  settings: {
    shopName: "TryOn",
    city: "Douala - Cameroun",
    supportEmail: "support@tryon.cm",
    address: "CFPD, Douala, Cameroun",
  },
};

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
const statusText = { pending: "En cours", delivered: "Livré", cancelled: "Annulé" };

function normalizeDb(data) {
  const source = data && typeof data === "object" ? data : {};
  return {
    ...seed,
    ...source,
    products: Array.isArray(source.products) ? source.products : seed.products,
    orders: Array.isArray(source.orders) ? source.orders : seed.orders,
    clients: Array.isArray(source.clients) ? source.clients : seed.clients,
    tryons: Array.isArray(source.tryons) ? source.tryons : source.tries ? source.tries : seed.tryons,
    reviews: Array.isArray(source.reviews) ? source.reviews : seed.reviews,
    promotions: Array.isArray(source.promotions) ? source.promotions : seed.promotions,
    transactions: Array.isArray(source.transactions) ? source.transactions : seed.transactions,
    logs: Array.isArray(source.logs) ? source.logs : seed.logs,
    notifications: Array.isArray(source.notifications) ? source.notifications : seed.notifications,
    support: Array.isArray(source.support) ? source.support : seed.support,
    audit: Array.isArray(source.audit) ? source.audit : seed.audit,
    settings: { ...seed.settings, ...(source.settings || {}) },
  };
}

function loadDb() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeDb(stored);
  } catch {
    return normalizeDb(seed);
  }
}

function nextCode(prefix, list) {
  const max = (list || []).reduce((acc, item) => {
    const match = String(item.id || "").match(/(\d+)$/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function nextOrderId(list) {
  const max = (list || []).reduce((acc, item) => {
    const match = String(item.id || "").match(/\d+/);
    return match ? Math.max(acc, Number(match[0])) : acc;
  }, 0);
  return `#${String(max + 1).padStart(4, "0")}`;
}

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

// ==================== PAGINATION COMPONENT ====================
const Pagination = React.memo(({ current, total, onChange }) => {
  if (total <= 1) return null;

  return (
    <div className="pagination">
      <button className="page-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>←</button>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          className={`page-btn ${current === index + 1 ? "active" : ""}`}
          onClick={() => onChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button className="page-btn" disabled={current === total} onClick={() => onChange(current + 1)}>→</button>
    </div>
  );
});

// ==================== COMPOSANTS ====================

const Kpi = React.memo(({ label, value, change }) => {
  return (
    <div className="card kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-change">{change}</div>
    </div>
  );
});

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

const ChartLine = React.memo(() => {
  return (
    <Card title="2. Évolution du CA" side="Courbe">
      <svg className="line-chart" viewBox="0 0 400 180" preserveAspectRatio="none">
        <polygon className="area" points="0,160 0,130 65,110 130,125 195,70 260,95 325,55 400,35 400,160" />
        <polyline points="0,130 65,110 130,125 195,70 260,95 325,55 400,35" />
      </svg>
    </Card>
  );
});

const ChartDonut = React.memo(() => {
  return (
    <Card title="3. Catégories vendues" side="Répartition">
      <div className="donut" />
      <div className="legend">
        <span><i className="dot" />Robes</span>
        <span><i className="dot dark" />Hommes</span>
        <span><i className="dot gold" />Accessoires</span>
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
  return (
    <Card title="4. Top produits" side="Quantités">
      <div className="hbar-list">
        {(products || []).slice(0, 5).map((p, i) => (
          <HBar key={p.id} label={String(p.name || "").split(" ")[0]} width={[92, 76, 64, 55, 43][i]} value={[92, 76, 64, 55, 43][i]} />
        ))}
      </div>
    </Card>
  );
});

const Funnel = React.memo(() => {
  return (
    <Card title="5. Tunnel e-commerce" side="Conversion">
      <div className="funnel">
        {[
          ["Visites · 1 850", "100%"],
          ["Produits vus · 1 520", "82%"],
          ["Essayages · 420", "54%"],
          ["Paniers · 260", "33%"],
          ["Achats · 96", "20%"],
        ].map(([t, w]) => <div className="funnel-step" style={{ width: w }} key={t}>{t}</div>)}
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

// Table standard
const Table = React.memo(({ head, rows, cls = "" }) => {
  return (
    <div className="card table-card">
      <div className="table">
        <div className={`row head ${cls}`}>{head.map((h) => <span key={h}>{h}</span>)}</div>
        {rows.map((r, i) => (
          <div className={`row ${cls}`} key={i}>{r.map((c, j) => <span key={j}>{c}</span>)}</div>
        ))}
        {!rows.length && <div className="empty">Aucune donnée.</div>}
      </div>
    </div>
  );
});

// Mode démo interactif
const DemoMode = React.memo(({ children, page }) => {
  const [step, setStep] = useState(0);
  const [showDemo, setShowDemo] = useState(() => {
    return JSON.parse(localStorage.getItem('tryon_demo_mode') || 'true');
  });

  const steps = [
    { element: '.sidebar', text: '👈 Voici la navigation principale du dashboard. Cliquez sur une section pour y accéder.' },
    { element: '.kpi-grid', text: '📊 Ces indicateurs clés vous donnent un aperçu rapide de votre activité.' },
    { element: '.charts-grid', text: '📈 Ces graphiques vous aident à analyser les tendances de votre boutique.' },
    { element: '.top-actions', text: '🔍 Utilisez la recherche rapide ou exportez vos données depuis ici.' },
  ];

  const currentStep = steps[step];
  const [elementRect, setElementRect] = useState(null);

  useEffect(() => {
    if (currentStep && showDemo) {
      const el = document.querySelector(currentStep.element);
      if (el) {
        const rect = el.getBoundingClientRect();
        setElementRect(rect);
      }
    }
  }, [currentStep, showDemo, page]);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowDemo(false);
      localStorage.setItem('tryon_demo_mode', 'false');
    }
  };

  const skipDemo = () => {
    setShowDemo(false);
    localStorage.setItem('tryon_demo_mode', 'false');
  };

  if (!showDemo || !currentStep || !elementRect) return children;

  return (
    <>
      {children}
      <div className="demo-overlay">
        <div 
          className="demo-tooltip"
          style={{
            position: 'fixed',
            top: elementRect.top - 20,
            left: elementRect.left + elementRect.width / 2,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="demo-content">
            <span className="demo-step">{step + 1}/{steps.length}</span>
            <p>{currentStep.text}</p>
            <div className="demo-actions">
              <button className="btn btn-light" onClick={skipDemo}>Passer</button>
              <button className="btn btn-red" onClick={nextStep}>
                {step < steps.length - 1 ? 'Suivant →' : '✓ Terminé'}
              </button>
            </div>
          </div>
          <div className="demo-arrow" />
        </div>
        <div className="demo-highlight" style={{
          position: 'fixed',
          top: elementRect.top - 8,
          left: elementRect.left - 8,
          width: elementRect.width + 16,
          height: elementRect.height + 16,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          border: '2px solid var(--red)',
          animation: 'pulse-border 1.5s ease-in-out infinite'
        }} />
      </div>
    </>
  );
});

const Toolbar = React.memo(({ filters, active, setActive, dateFilters, dateActive, setDateActive, button, onAdd, onAdvancedSearch }) => {
  return (
    <div className="toolbar">
      <div className="filter-row">
        {filters.map(([k, l]) => <button key={k} className={`chip ${active === k ? "active" : ""}`} onClick={() => setActive(k)}>{l}</button>)}
        {dateFilters && dateActive !== undefined && setDateActive && (
          <>
            <span className="chip disabled" style={{ opacity: 0.5, cursor: 'default' }}>|</span>
            {dateFilters.map(([k, l]) => <button key={k} className={`chip ${dateActive === k ? "active" : ""}`} onClick={() => setDateActive(k)}>{l}</button>)}
          </>
        )}
      </div>
      <div className="toolbar-actions">
        {onAdvancedSearch && (
          <button className="btn btn-light" onClick={onAdvancedSearch}>🔍 Recherche avancée</button>
        )}
        {button && <button className="btn btn-primary" onClick={onAdd}>{button}</button>}
      </div>
    </div>
  );
});

const Badge = React.memo(({ status }) => {
  return <span className={`badge ${status === "delivered" ? "ok" : status === "pending" ? "warn" : "bad"}`}>{statusText[status] || status}</span>;
});

const Actions = React.memo(({ view, edit, del }) => {
  return (
    <div className="actions">
      {view && <button className="icon-btn view" title="Voir" onClick={view}>👁️</button>}
      {edit && <button className="icon-btn" title="Modifier" onClick={edit}>✏️</button>}
      {del && <button className="icon-btn danger" title="Supprimer" onClick={del}>🗑️</button>}
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
        <span className={`badge ${product.stock < 6 ? "warn" : "ok"}`}>Stock : {product.stock}</span>
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

const Sales = React.memo(({ runExport }) => {
  return (
    <>
      <div className="grid-3">
        <Kpi label="Objectif mensuel" value="72%" change="1 420 000 / 2 000 000 FCFA" />
        <Kpi label="Panier moyen" value="18 450" change="FCFA par commande" />
        <Kpi label="Remboursements" value="2.1%" change="Très faible" />
      </div>
      <div className="card sales-card">
        <div className="card-title">
          <h3>Rapport commercial</h3>
          <button className="btn btn-red" onClick={() => runExport("pdf")}>Exporter PDF</button>
        </div>
        <HBar label="Robes" width={42} value="42%" />
        <HBar label="Hommes" width={26} value="26%" />
        <HBar label="Wax" width={19} value="19%" />
        <HBar label="Accessoires" width={13} value="13%" />
      </div>
    </>
  );
});

const Settings = React.memo(({ safeDb, saveDb, reset }) => {
  const [shop, setShop] = useState(safeDb.settings || seed.settings);

  const saveSettings = () => {
    saveDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...shop },
      audit: ["Paramètres enregistrés", ...prev.audit].slice(0, 20),
    }));
    alert("Paramètres enregistrés !");
  };

  return (
    <div className="settings-grid">
      <div className="card settings-card">
        <h3>Informations boutique</h3>
        <div className="form-grid">
          <Field label="Nom boutique" value={shop.shopName} onChange={(e) => setShop({ ...shop, shopName: e.target.value })} />
          <Field label="Ville" value={shop.city} onChange={(e) => setShop({ ...shop, city: e.target.value })} />
        </div>
        <Field label="Email support" value={shop.supportEmail} onChange={(e) => setShop({ ...shop, supportEmail: e.target.value })} />
        <label className="label">Adresse</label>
        <textarea className="textarea" value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
        <button className="btn btn-red" onClick={saveSettings}>Enregistrer</button>
      </div>

      {["Design & interface", "Notifications", "Sécurité", "Paiement & livraison"].map((t) => (
        <div className="card settings-card" key={t}>
          <h3>{t}</h3>
          {["Option activée", "Configuration avancée", "Gestion sécurisée"].map((x) => <SwitchLine key={x} title={x} />)}
        </div>
      ))}

      <div className="card settings-card">
        <h3>Sauvegarde & maintenance</h3>
        <div className="grid-2 mini-grid">
          <button className="btn btn-light" onClick={() => { saveDb((prev) => ({ ...prev, audit: ["Sauvegarde JSON manuelle", ...prev.audit].slice(0, 20) })); alert("Sauvegarde effectuée !"); }}>Sauvegarder JSON</button>
          <button className="btn btn-light" onClick={reset}>Réinitialiser démo</button>
        </div>
        <SwitchLine title="Mode maintenance" />
        <SwitchLine title="Auto-sauvegarde locale" />
      </div>

      <div className="card settings-card">
        <h3>Rôles administrateurs</h3>
        {["Super Admin", "Gestionnaire ventes", "Gestionnaire catalogue"].map((x) => (
          <div className="role" key={x}>
            <div>
              <b>{x}</b>
              <p className="muted">Droits administrateur</p>
            </div>
            <span className="badge blue">Rôle</span>
          </div>
        ))}
      </div>

      <div className="card settings-card">
        <h3>Historique système</h3>
        {safeDb.audit.slice(0, 5).map((a) => <div className="audit-line" key={a}>{a}</div>)}
      </div>
    </div>
  );
});

const SwitchLine = React.memo(({ title }) => {
  const [on, setOn] = useState(true);
  return (
    <div className="switch-row">
      <div>
        <b>{title}</b>
        <p className="muted">Paramètre personnalisable</p>
      </div>
      <button className={`switch ${on ? "on" : ""}`} onClick={() => setOn(!on)} />
    </div>
  );
});

const Field = React.memo(({ label, ...props }) => {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
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
      client: "un client"
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
              <Field label="Emoji" name="emoji" defaultValue={item.emoji || "👗"} />
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
              <Field label="Nom" name="name" defaultValue={item.name || ""} required />
              <div className="form-grid">
                <Field label="Email" name="email" defaultValue={item.email || ""} />
                <Field label="Ville" name="city" defaultValue={item.city || ""} />
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
  const entries = Object.entries(view.item || {});
  const filteredEntries = entries.filter(([key]) => !["id"].includes(key));

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
      tryon: "de l'essayage"
    };
    return labels[view.type] || "de l'élément";
  };

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
  const [promoFilter, setPromoFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("all");
  const [notifFilter, setNotifFilter] = useState("all");
  const [supportFilter, setSupportFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [pagination, setPagination] = useState({ 
    commandes: 1, produits: 1, clients: 1, essayages: 1,
    reviews: 1, promotions: 1, transactions: 1, logs: 1,
    notifications: 1, support: 1
  });
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [db, setDb] = useState(loadDb);

  const isOnline = useOnlineStatus();
  const debouncedSearch = useDebounce(search, 300);

  // Sauvegarde automatique
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setSaving(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDb(db)));
        setLastSaved(new Date());
      } finally {
        setSaving(false);
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [db]);

  // Notifications en temps réel
  useEffect(() => {
    if (page === 'notifications') return;
    
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.75) {
        const types = ['order', 'stock', 'review'];
        const type = types[Math.floor(Math.random() * types.length)];
        const messages = {
          order: 'Nouvelle commande passée !',
          stock: 'Un produit est en rupture de stock !',
          review: 'Nouvel avis client publié !'
        };
        const titles = {
          order: '📦 Nouvelle commande',
          stock: '⚠️ Alerte stock',
          review: '⭐ Nouvel avis'
        };
        
        saveDb((prev) => ({
          ...prev,
          notifications: [{
            id: nextCode('NOTIF', prev.notifications),
            title: titles[type],
            message: messages[type],
            type: type,
            read: false,
            date: new Date().toISOString().slice(0, 10)
          }, ...prev.notifications]
        }));
        
        notify('🔔 ' + messages[type], 'info');
      }
    }, 45000);
    
    return () => clearInterval(interval);
  }, [page]);

  // Persistance des préférences
  useEffect(() => {
    localStorage.setItem('tryon_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('tryon_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDb(db)));
  }, [db]);

  const safeDb = normalizeDb(db);

  const saveDb = (updater) => {
    setDb((prev) => {
      const current = normalizeDb(prev);
      const next = typeof updater === "function" ? updater(current) : updater;
      return normalizeDb(next);
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
  };

  const addAudit = (msg) => {
    saveDb((prev) => ({
      ...prev,
      audit: [`${new Date().toLocaleTimeString("fr-FR")} · ${msg}`, ...(prev.audit || [])].slice(0, 20),
    }));
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
    `${t.order || ""} ${t.method || ""} ${t.status || ""}`.toLowerCase().includes(q)
  );

  const logs = (safeDb.logs || []).filter(
    (l) =>
      (logFilter === "all" || l.severity === logFilter) &&
      `${l.user || ""} ${l.action || ""}`.toLowerCase().includes(q)
  );

  const notifications = (safeDb.notifications || []).filter(
    (n) =>
      (notifFilter === "all" || n.type === notifFilter) &&
      `${n.title || ""} ${n.message || ""}`.toLowerCase().includes(q)
  );

  const support = (safeDb.support || []).filter(
    (s) =>
      (supportFilter === "all" || s.status === supportFilter) &&
      `${s.client || ""} ${s.subject || ""}`.toLowerCase().includes(q)
  );

  const ordersPage = paginate(orders, pagination.commandes, 5);
  const productsPage = paginate(products, pagination.produits, 6);
  const clientsPage = paginate(clients, pagination.clients, 5);
  const tryonsPage = paginate(tryons, pagination.essayages, 5);
  const reviewsPage = paginate(reviews, pagination.reviews, 5);
  const promotionsPage = paginate(promotions, pagination.promotions, 4);
  const transactionsPage = paginate(transactions, pagination.transactions, 5);
  const logsPage = paginate(logs, pagination.logs, 5);
  const notificationsPage = paginate(notifications, pagination.notifications, 5);
  const supportPage = paginate(support, pagination.support, 5);

  const setPageNumber = (section, value) => {
    setPagination((prev) => ({ ...prev, [section]: value }));
  };

  const logout = () => {
    sessionStorage.removeItem("tryon_token");
    sessionStorage.removeItem("tryon_user");
    localStorage.removeItem("tryon_token");
    localStorage.removeItem("tryon_user");
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
        addAudit(`Export ${format.toUpperCase()} avancé généré`);
        notify(`Export ${format.toUpperCase()} généré`, 'success');
        setExportModal(false);
      } catch (error) {
        notify('Erreur lors de l\'export', 'error');
      } finally {
        setExporting(false);
      }
    }, 1000);
  };

  // Export PDF pour la section ventes
  const runExportPdf = () => {
    window.print();
    addAudit('Export PDF généré');
    notify('Export PDF généré', 'success');
  };

  const remove = (kind, id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;

    const map = { 
      order: "orders", product: "products", client: "clients", tryon: "tryons",
      review: "reviews", promotion: "promotions", transaction: "transactions",
      log: "logs", notification: "notifications", support: "support"
    };
    const key = map[kind];

    saveDb((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((x) => x.id !== id),
      audit: [`Suppression ${kind} ${id}`, ...(prev.audit || [])].slice(0, 20),
    }));

    notify(`${kind} supprimé`, 'success');
  };

  const openEdit = (type, item) => {
    setModal({ type, mode: "edit", item });
  };

  const openAdd = (type) => {
    setModal({ type, mode: "add", item: null });
  };

  const openView = (type, item) => {
    setViewItem({ type, item });
  };

  const saveModal = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget).entries());
      const mode = modal?.mode;
      const current = modal?.item;

      if (modal?.type === "product") {
        const item = {
          id: current?.id || nextCode("PRD", safeDb.products),
          name: form.name,
          brand: form.brand,
          price: Number(form.price || 0),
          stock: Number(form.stock || 0),
          cat: form.cat,
          emoji: form.emoji || "👗",
        };
        saveDb((prev) => ({
          ...prev,
          products: mode === "edit" ? prev.products.map((p) => (p.id === item.id ? item : p)) : [item, ...prev.products],
          audit: [`Produit ${mode === "edit" ? "modifié" : "ajouté"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "order") {
        const item = {
          id: current?.id || nextOrderId(safeDb.orders),
          client: form.client,
          date: form.date,
          status: form.status,
          total: Number(form.total || 0),
        };
        saveDb((prev) => ({
          ...prev,
          orders: mode === "edit" ? prev.orders.map((o) => (o.id === item.id ? item : o)) : [item, ...prev.orders],
          audit: [`Commande ${mode === "edit" ? "modifiée" : "ajoutée"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "client") {
        const item = {
          id: current?.id || nextCode("CLI", safeDb.clients),
          name: form.name,
          email: form.email,
          city: form.city,
          orders: Number(current?.orders || 0),
          total: Number(current?.total || 0),
        };
        saveDb((prev) => ({
          ...prev,
          clients: mode === "edit" ? prev.clients.map((c) => (c.id === item.id ? item : c)) : [item, ...prev.clients],
          audit: [`Client ${mode === "edit" ? "modifié" : "ajouté"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "tryon") {
        const item = {
          id: current?.id || nextCode("TRY", safeDb.tryons),
          client: form.client,
          product: form.product,
          score: Number(form.score || 0),
          result: form.result,
        };
        saveDb((prev) => ({
          ...prev,
          tryons: mode === "edit" ? prev.tryons.map((t) => (t.id === item.id ? item : t)) : [item, ...prev.tryons],
          audit: [`Essayage ${mode === "edit" ? "modifié" : "ajouté"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "review") {
        const item = {
          id: current?.id || nextCode("REV", safeDb.reviews),
          product: form.product,
          client: form.client,
          rating: Number(form.rating || 5),
          comment: form.comment,
          date: new Date().toISOString().slice(0, 10),
          status: form.status,
        };
        saveDb((prev) => ({
          ...prev,
          reviews: mode === "edit" ? prev.reviews.map((r) => (r.id === item.id ? item : r)) : [item, ...prev.reviews],
          audit: [`Avis ${mode === "edit" ? "modifié" : "ajouté"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "promotion") {
        const item = {
          id: current?.id || nextCode("PROMO", safeDb.promotions),
          code: form.code,
          type: form.type,
          value: Number(form.value || 0),
          expires: form.expires,
          usage: Number(current?.usage || 0),
          maxUsage: Number(form.maxUsage || 100),
          active: form.active === "true",
        };
        saveDb((prev) => ({
          ...prev,
          promotions: mode === "edit" ? prev.promotions.map((p) => (p.id === item.id ? item : p)) : [item, ...prev.promotions],
          audit: [`Promotion ${mode === "edit" ? "modifiée" : "ajoutée"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "notification") {
        const item = {
          id: current?.id || nextCode("NOTIF", safeDb.notifications),
          title: form.title,
          message: form.message,
          type: form.type,
          read: false,
          date: new Date().toISOString().slice(0, 10),
        };
        saveDb((prev) => ({
          ...prev,
          notifications: mode === "edit" ? prev.notifications.map((n) => (n.id === item.id ? item : n)) : [item, ...prev.notifications],
          audit: [`Notification ${mode === "edit" ? "modifiée" : "ajoutée"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      if (modal?.type === "support") {
        const item = {
          id: current?.id || nextCode("SUP", safeDb.support),
          client: form.client,
          subject: form.subject,
          message: form.message,
          status: form.status,
          priority: form.priority,
          date: new Date().toISOString().slice(0, 10),
        };
        saveDb((prev) => ({
          ...prev,
          support: mode === "edit" ? prev.support.map((s) => (s.id === item.id ? item : s)) : [item, ...prev.support],
          audit: [`Support ${mode === "edit" ? "modifié" : "ajouté"} ${item.id}`, ...(prev.audit || [])].slice(0, 20),
        }));
      }

      setModal(null);
      notify("Enregistré avec succès", 'success');
    } catch (error) {
      notify("Erreur lors de l'enregistrement", 'error');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = (id) => {
    saveDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => 
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    notify("Notification marquée comme lue", 'success');
  };

  const markAllNotificationsRead = () => {
    saveDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    notify("Toutes les notifications marquées comme lues", 'success');
  };

  const handleAdvancedSearch = (filters) => {
    setAdvancedFilters(filters);
    setSearchModal(false);
    setPagination((prev) => ({ ...prev, [page]: 1 }));
    notify('Recherche avancée appliquée', 'success');
  };

  return (
    <div className={`tryon-admin ${collapsed ? "collapsed" : ""} ${darkMode ? "dark" : ""}`}>
      <style>{styles}</style>

      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Mode hors ligne - Les données sont sauvegardées localement
        </div>
      )}

      <div className="save-indicator">
        {saving ? '💾 Sauvegarde en cours...' : lastSaved ? `✅ Sauvegardé à ${lastSaved.toLocaleTimeString()}` : ''}
      </div>

      <DemoMode page={page}>
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-text">
              <div className="brand-title">TryOn</div>
              <div className="brand-sub">Application de mode africaine et cabine d'essayage virtuelle · Douala.</div>
            </div>
            <div className="brand-actions">
              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"} title={darkMode ? "Mode clair" : "Mode sombre"}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Agrandir la sidebar" : "Réduire la sidebar"} title={collapsed ? "Agrandir la sidebar" : "Réduire la sidebar"}>
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
                    onClick={() => changePage(item.key)} 
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

          <button className="logout" onClick={logout}>
            <span className="ico">🚪</span>
            <span>Déconnexion</span>
          </button>
        </aside>
      </DemoMode>

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="mobile-menu" onClick={() => setCollapsed(!collapsed)} aria-label="Menu">☰</button>
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

        <DemoMode page={page}>
          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              <div className="kpi-grid">
                <Kpi label="Chiffre d'affaires" value={`${Math.round(kpi.revenue / 1000)}K`} change="↑ +18% ce mois" />
                <Kpi label="Commandes" value={kpi.orders} change="↑ nouvelles ventes" />
                <Kpi label="Clients actifs" value={kpi.clients} change="↑ base client" />
                <Kpi label="Conversion essayage" value={`${kpi.conversion}%`} change="Essai → achat" />
                <Kpi label="Panier moyen" value={`${Math.round(kpi.avgOrder / 1000)}K`} change="FCFA par commande" />
              </div>
              <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <Kpi label="Avis en attente" value={kpi.pendingReviews} change="À modérer" />
                <Kpi label="Stock faible" value={kpi.lowStock} change="Produits à réapprovisionner" />
                <Kpi label="Transactions" value={kpi.totalTransactions} change="Total traitées" />
                <Kpi label="Support ouvert" value={kpi.openSupport} change="Tickets en attente" />
              </div>

              <div className="charts-grid">
                <SalesChart orders={safeDb.orders} />
                <ChartLine />
                <ChartDonut />
                <TopProducts products={safeDb.products} />
                <Funnel />
                <StatusChart orders={safeDb.orders} />
              </div>

              <AdvancedAnalytics orders={safeDb.orders} products={safeDb.products} clients={safeDb.clients} />

              <div className="grid-2">
                <div className="card">
                  <div className="card-title"><h3>Alertes utiles</h3><button className="btn btn-light" onClick={() => changePage("produits")}>Voir stock</button></div>
                  {safeDb.products.filter((p) => p.stock < 6).map((p) => (
                    <Activity key={p.id} icon="⚠️" title={p.name} desc={`Stock restant : ${p.stock}`} badge="Urgent" />
                  ))}
                  {safeDb.reviews.filter((r) => r.status === "pending").map((r) => (
                    <Activity key={r.id} icon="⭐" title={`Avis en attente: ${r.product}`} desc={`Par ${r.client}`} badge="À modérer" />
                  ))}
                  {!safeDb.products.some((p) => p.stock < 6) && !safeDb.reviews.some((r) => r.status === "pending") && <div className="empty">Aucune alerte.</div>}
                </div>
                <div className="card">
                  <div className="card-title"><h3>Journal d'activité</h3><span className="muted">actions récentes</span></div>
                  {safeDb.audit.slice(0, 5).map((a) => <Activity key={a} icon="✓" title={a} />)}
                </div>
              </div>
            </>
          )}

          {/* COMMANDES */}
          {page === "commandes" && (
            <>
              <Toolbar
                filters={[["all", "Toutes"], ["pending", "En cours"], ["delivered", "Livrées"], ["cancelled", "Annulées"]]}
                active={orderFilter} setActive={(value) => { setOrderFilter(value); setPageNumber("commandes", 1); }}
                dateFilters={[["all", "Toutes dates"], ["today", "Aujourd'hui"], ["week", "Cette semaine"], ["month", "Ce mois"]]}
                dateActive={dateFilter} setDateActive={setDateFilter}
                button="+ Nouvelle commande" onAdd={() => openAdd("order")}
                onAdvancedSearch={() => setSearchModal(true)}
              />
              <Table 
                head={["ID", "Client", "Date", "Statut", "Total", "Actions"]}
                rows={ordersPage.items.map((o) => [
                  <b>{o.id}</b>,
                  o.client,
                  o.date,
                  <Badge status={o.status} />,
                  <strong>{fmt(o.total)}</strong>,
                  <Actions view={() => openView("order", o)} edit={() => openEdit("order", o)} del={() => remove("order", o.id)} />
                ])}
              />
              <Pagination current={ordersPage.currentPage} total={ordersPage.totalPages} onChange={(n) => setPageNumber("commandes", n)} />
            </>
          )}

          {/* PRODUITS */}
          {page === "produits" && (
            <>
              <Toolbar 
                filters={[["all", "Tous"], ["femme", "Femme"], ["homme", "Homme"], ["accessoire", "Accessoires"]]}
                active={catFilter} setActive={(value) => { setCatFilter(value); setPageNumber("produits", 1); }}
                button="+ Nouveau produit" onAdd={() => openAdd("product")}
                onAdvancedSearch={() => setSearchModal(true)}
              />
              <div className="products-grid-admin">
                {productsPage.items.map((p) => <ProductCard key={p.id} product={p} onView={openView} onEdit={openEdit} onDelete={remove} />)}
                {!productsPage.items.length && <div className="empty card">Aucun produit.</div>}
              </div>
              <Pagination current={productsPage.currentPage} total={productsPage.totalPages} onChange={(n) => setPageNumber("produits", n)} />
            </>
          )}

          {/* CLIENTS */}
          {page === "clients" && (
            <>
              <div className="toolbar">
                <span className="muted">Gestion, modification et suppression des clients.</span>
                <button className="btn btn-primary" onClick={() => openAdd("client")}>+ Nouveau client</button>
              </div>
              <Table
                cls="clients-row"
                head={["Client", "Email", "Ville", "Cmdes", "Total", "Actions"]}
                rows={clientsPage.items.map((c) => [
                  <b>{c.name}</b>,
                  c.email,
                  c.city,
                  c.orders,
                  <strong>{fmt(c.total)}</strong>,
                  <Actions view={() => openView("client", c)} edit={() => openEdit("client", c)} del={() => remove("client", c.id)} />
                ])}
              />
              <Pagination current={clientsPage.currentPage} total={clientsPage.totalPages} onChange={(n) => setPageNumber("clients", n)} />
            </>
          )}

          {/* ESSAYAGES */}
          {page === "essayages" && (
            <>
              <div className="toolbar">
                <span className="muted">Historique IA, scores, décisions client.</span>
                <button className="btn btn-light" onClick={() => { const p = safeDb.products[0]; saveDb((prev) => ({ ...prev, tryons: [{ id: nextCode("TRY", prev.tryons), client: "Visiteur", product: p?.name || "Produit", score: 90, result: "panier" }, ...prev.tryons], audit: ["Essayage simulé", ...prev.audit].slice(0, 20) })); notify("Essayage simulé", 'success'); }}>+ Simuler essayage</button>
              </div>
              <Table
                cls="tries-row"
                head={["Client", "Produit", "Score IA", "Résultat", "Actions"]}
                rows={tryonsPage.items.map((t) => [
                  t.client,
                  t.product,
                  <strong>{t.score}%</strong>,
                  <span className={`badge ${t.result === "panier" ? "ok" : "warn"}`}>{t.result}</span>,
                  <Actions view={() => openView("tryon", t)} edit={() => openEdit("tryon", t)} del={() => remove("tryon", t.id)} />
                ])}
              />
              <Pagination current={tryonsPage.currentPage} total={tryonsPage.totalPages} onChange={(n) => setPageNumber("essayages", n)} />
            </>
          )}

          {/* VENTES */}
          {page === "ventes" && <Sales runExport={runExportPdf} />}

          {/* STOCK & APPROVISIONNEMENT */}
          {page === "stock" && (
            <>
              <div className="toolbar"><span className="muted">Gestion des stocks et réapprovisionnement.</span></div>
              <div className="stock-grid">
                {safeDb.products.map((p) => (
                  <div className="card stock-card" key={p.id}>
                    <div className="stock-header"><span className="stock-emoji">{p.emoji}</span><h3>{p.name}</h3></div>
                    <div className="stock-info"><span>Marque: {p.brand}</span><span>Catégorie: {p.cat}</span></div>
                    <div className="stock-bar"><div className="stock-fill" style={{ width: `${Math.min(100, (p.stock / 30) * 100)}%`, background: p.stock < 6 ? 'var(--red)' : p.stock < 12 ? 'var(--orange)' : 'var(--green)' }} /></div>
                    <div className="stock-details"><span>Stock: <strong>{p.stock}</strong></span><span className={`badge ${p.stock < 6 ? "bad" : p.stock < 12 ? "warn" : "ok"}`}>{p.stock < 6 ? "Urgent" : p.stock < 12 ? "Faible" : "OK"}</span></div>
                    <div className="stock-actions"><Actions view={() => openView("product", p)} edit={() => openEdit("product", p)} del={() => remove("product", p.id)} /></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* AVIS & ÉVALUATIONS */}
          {page === "avis" && (
            <>
              <Toolbar 
                filters={[["all", "Tous"], ["pending", "En attente"], ["approved", "Approuvés"], ["rejected", "Rejetés"]]}
                active={reviewFilter} setActive={(value) => { setReviewFilter(value); setPageNumber("reviews", 1); }}
                button="+ Nouvel avis" onAdd={() => openAdd("review")}
                onAdvancedSearch={() => setSearchModal(true)}
              />
              <Table
                head={["Produit", "Client", "Note", "Commentaire", "Statut", "Actions"]}
                rows={reviewsPage.items.map((r) => [
                  r.product,
                  r.client,
                  <div className="stars">{'⭐'.repeat(r.rating)}</div>,
                  <span className="comment-preview">{r.comment?.slice(0, 30)}{r.comment?.length > 30 ? '...' : ''}</span>,
                  <span className={`badge ${r.status === "approved" ? "ok" : r.status === "pending" ? "warn" : "bad"}`}>{r.status}</span>,
                  <Actions view={() => openView("review", r)} edit={() => openEdit("review", r)} del={() => remove("review", r.id)} />
                ])}
              />
              <Pagination current={reviewsPage.currentPage} total={reviewsPage.totalPages} onChange={(n) => setPageNumber("reviews", n)} />
            </>
          )}

          {/* PROMOTIONS */}
          {page === "promotions" && (
            <>
              <Toolbar 
                filters={[["all", "Toutes"], ["active", "Actives"], ["inactive", "Inactives"]]}
                active={promoFilter} setActive={(value) => { setPromoFilter(value); setPageNumber("promotions", 1); }}
                button="+ Nouvelle promotion" onAdd={() => openAdd("promotion")}
              />
              <div className="promotions-grid">
                {promotionsPage.items.map((p) => (
                  <div className={`card promotion-card ${p.active ? '' : 'inactive'}`} key={p.id}>
                    <div className="promo-header"><span className="promo-code">{p.code}</span><span className={`badge ${p.active ? "ok" : "bad"}`}>{p.active ? "Actif" : "Inactif"}</span></div>
                    <div className="promo-details"><span>Type: {p.type === "percentage" ? "Pourcentage" : "Montant fixe"}</span><span>Valeur: {p.type === "percentage" ? `${p.value}%` : fmt(p.value)}</span></div>
                    <div className="promo-details"><span>Expire le: {p.expires}</span><span>Utilisé: {p.usage}/{p.maxUsage}</span></div>
                    <div className="promo-bar"><div className="promo-fill" style={{ width: `${Math.min(100, (p.usage / p.maxUsage) * 100)}%` }} /></div>
                    <div className="promo-actions"><Actions view={() => openView("promotion", p)} edit={() => openEdit("promotion", p)} del={() => remove("promotion", p.id)} /></div>
                  </div>
                ))}
                {!promotionsPage.items.length && <div className="empty card">Aucune promotion.</div>}
              </div>
              <Pagination current={promotionsPage.currentPage} total={promotionsPage.totalPages} onChange={(n) => setPageNumber("promotions", n)} />
            </>
          )}

          {/* PAIEMENTS & TRANSACTIONS */}
          {page === "paiements" && (
            <>
              <div className="toolbar"><span className="muted">Suivi des transactions financières.</span></div>
              <div className="payment-summary">
                <div className="card"><div className="kpi-label">Total transactions</div><div className="kpi-value">{safeDb.transactions.length}</div></div>
                <div className="card"><div className="kpi-label">Montant total</div><div className="kpi-value">{fmt(safeDb.transactions.reduce((s, t) => s + (t.status === "completed" ? t.amount : 0), 0))}</div></div>
                <div className="card"><div className="kpi-label">Remboursements</div><div className="kpi-value">{safeDb.transactions.filter(t => t.status === "refunded").length}</div></div>
                <div className="card"><div className="kpi-label">En attente</div><div className="kpi-value">{safeDb.transactions.filter(t => t.status === "pending").length}</div></div>
              </div>
              <Table
                head={["Transaction", "Commande", "Montant", "Méthode", "Statut", "Actions"]}
                rows={transactionsPage.items.map((t) => [
                  t.id,
                  t.order,
                  <strong>{fmt(t.amount)}</strong>,
                  t.method,
                  <span className={`badge ${t.status === "completed" ? "ok" : t.status === "pending" ? "warn" : t.status === "refunded" ? "bad" : ""}`}>{t.status}</span>,
                  <Actions view={() => openView("transaction", t)} edit={() => openEdit("transaction", t)} del={() => remove("transaction", t.id)} />
                ])}
              />
              <Pagination current={transactionsPage.currentPage} total={transactionsPage.totalPages} onChange={(n) => setPageNumber("transactions", n)} />
            </>
          )}

          {/* ANALYSE & RAPPORTS */}
          {page === "rapports" && (
            <>
              <div className="toolbar"><span className="muted">Rapports détaillés de l'activité.</span></div>
              <div className="reports-grid">
                <div className="card"><h3>Ventes par catégorie</h3>
                  <div className="hbar-list">
                    <HBar label="Robes" width={42} value="42%" />
                    <HBar label="Hommes" width={26} value="26%" />
                    <HBar label="Accessoires" width={19} value="19%" />
                    <HBar label="Wax" width={13} value="13%" />
                  </div>
                </div>
                <div className="card"><h3>Avis clients</h3>
                  <div className="review-stats">
                    <div className="stat-item"><span>⭐ 5 étoiles</span><div className="stat-bar"><div className="stat-fill" style={{ width: '60%' }} /></div><span>60%</span></div>
                    <div className="stat-item"><span>⭐ 4 étoiles</span><div className="stat-bar"><div className="stat-fill" style={{ width: '25%' }} /></div><span>25%</span></div>
                    <div className="stat-item"><span>⭐ 3 étoiles</span><div className="stat-bar"><div className="stat-fill" style={{ width: '10%' }} /></div><span>10%</span></div>
                    <div className="stat-item"><span>⭐ 1-2 étoiles</span><div className="stat-bar"><div className="stat-fill" style={{ width: '5%' }} /></div><span>5%</span></div>
                  </div>
                </div>
                <div className="card"><h3>Performance des promotions</h3>
                  {safeDb.promotions.map((p) => (
                    <div key={p.id} className="promo-performance">
                      <span>{p.code}</span>
                      <div className="hbar-track"><div className="hbar-fill" style={{ width: `${Math.min(100, (p.usage / p.maxUsage) * 100)}%` }} /></div>
                      <span>{Math.round((p.usage / p.maxUsage) * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="card"><h3>Statistiques support</h3>
                  <div className="support-stats">
                    <div><span>Ouverts:</span><strong>{safeDb.support.filter(s => s.status === "open").length}</strong></div>
                    <div><span>En cours:</span><strong>{safeDb.support.filter(s => s.status === "in-progress").length}</strong></div>
                    <div><span>Fermés:</span><strong>{safeDb.support.filter(s => s.status === "closed").length}</strong></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {page === "notifications" && (
            <>
              <div className="toolbar">
                <span className="muted">Centre de gestion des notifications.</span>
                <div className="top-actions">
                  <button className="btn btn-light" onClick={markAllNotificationsRead}>📬 Tout marquer comme lu</button>
                  <button className="btn btn-primary" onClick={() => openAdd("notification")}>+ Nouvelle notification</button>
                </div>
              </div>
              <div className="notifications-list">
                {notificationsPage.items.map((n) => (
                  <div className={`card notification-item ${n.read ? 'read' : 'unread'}`} key={n.id}>
                    <div className="notif-header">
                      <span className="notif-type">{n.type === "order" ? "📦" : n.type === "stock" ? "📊" : n.type === "review" ? "⭐" : "📬"}</span>
                      <div className="notif-content">
                        <h4>{n.title}</h4>
                        <p>{n.message}</p>
                        <span className="notif-date">{n.date}</span>
                      </div>
                      <div className="notif-actions">
                        {!n.read && <button className="btn btn-light" onClick={() => markNotificationRead(n.id)}>Marquer lu</button>}
                        <Actions view={() => openView("notification", n)} edit={() => openEdit("notification", n)} del={() => remove("notification", n.id)} />
                      </div>
                    </div>
                  </div>
                ))}
                {!notificationsPage.items.length && <div className="empty">Aucune notification.</div>}
              </div>
              <Pagination current={notificationsPage.currentPage} total={notificationsPage.totalPages} onChange={(n) => setPageNumber("notifications", n)} />
            </>
          )}

          {/* SUPPORT & FAQ */}
          {page === "support" && (
            <>
              <Toolbar 
                filters={[["all", "Tous"], ["open", "Ouverts"], ["in-progress", "En cours"], ["closed", "Fermés"]]}
                active={supportFilter} setActive={(value) => { setSupportFilter(value); setPageNumber("support", 1); }}
                button="+ Nouveau ticket" onAdd={() => openAdd("support")}
              />
              <Table
                head={["Client", "Sujet", "Message", "Priorité", "Statut", "Actions"]}
                rows={supportPage.items.map((s) => [
                  s.client,
                  s.subject,
                  <span className="comment-preview">{s.message?.slice(0, 40)}{s.message?.length > 40 ? '...' : ''}</span>,
                  <span className={`badge ${s.priority === "high" ? "bad" : s.priority === "medium" ? "warn" : "ok"}`}>{s.priority}</span>,
                  <span className={`badge ${s.status === "closed" ? "ok" : s.status === "in-progress" ? "warn" : "bad"}`}>{s.status}</span>,
                  <Actions view={() => openView("support", s)} edit={() => openEdit("support", s)} del={() => remove("support", s.id)} />
                ])}
              />
              <Pagination current={supportPage.currentPage} total={supportPage.totalPages} onChange={(n) => setPageNumber("support", n)} />
            </>
          )}

          {/* LOGS & SÉCURITÉ */}
          {page === "logs" && (
            <>
              <Toolbar 
                filters={[["all", "Tous"], ["info", "Info"], ["warning", "Avertissement"], ["critical", "Critique"]]}
                active={logFilter} setActive={(value) => { setLogFilter(value); setPageNumber("logs", 1); }}
              />
              <Table
                head={["Utilisateur", "Action", "IP", "Date", "Sévérité", "Actions"]}
                rows={logsPage.items.map((l) => [
                  l.user,
                  l.action,
                  l.ip,
                  l.date,
                  <span className={`badge ${l.severity === "critical" ? "bad" : l.severity === "warning" ? "warn" : "ok"}`}>{l.severity}</span>,
                  <Actions view={() => openView("log", l)} del={() => remove("log", l.id)} />
                ])}
              />
              <Pagination current={logsPage.currentPage} total={logsPage.totalPages} onChange={(n) => setPageNumber("logs", n)} />
            </>
          )}

          {/* PARAMÈTRES */}
          {page === "parametres" && <Settings safeDb={safeDb} saveDb={saveDb} reset={() => { saveDb(seed); notify("Données réinitialisées", 'success'); }} />}
        </DemoMode>
      </main>

      {modal && <Modal modal={modal} close={() => setModal(null)} save={saveModal} loading={loading} />}
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

const styles = `
:root{--red:#E30613;--red2:#9F1118;--ink:#121212;--muted:#6D6D6D;--border:rgba(18,18,18,.10);--soft:#F1EFEC;--green:#2D7D46;--orange:#B36B12;--blue:#385E9D;--shadow:0 18px 50px rgba(0,0,0,.14);--shadow2:0 10px 28px rgba(0,0,0,.08);--side:276px;--side-collapsed:84px}.tryon-admin,.tryon-admin *{box-sizing:border-box}.tryon-admin{min-height:100vh;display:grid;grid-template-columns:var(--side) 1fr;background:linear-gradient(180deg,#fbfaf8,#ede9e4);color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;transition:.28s}.tryon-admin.collapsed{grid-template-columns:var(--side-collapsed) 1fr}button,input,select,textarea{font:inherit}button{cursor:pointer}.sidebar{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,#080808,#1a1110);color:#fff;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid rgba(255,255,255,.08)}.brand{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}.brand-text{flex:1;min-width:0}.brand-title{font-family:'Cormorant Garamond',serif;font-size:28px;letter-spacing:2px;line-height:1}.brand-sub{font-size:10px;letter-spacing:1.2px;color:rgba(255,255,255,.48);margin-top:2px}.brand-actions{display:flex;gap:8px;flex-shrink:0}.theme-toggle{width:36px;height:36px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;transition:.22s}.theme-toggle:hover{background:rgba(227,6,19,.16)}.collapse-btn{width:36px;height:36px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.06);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;transition:.22s}.collapse-btn:hover{background:rgba(227,6,19,.16)}.tryon-admin.collapsed .brand-text,.tryon-admin.collapsed .nav-label,.tryon-admin.collapsed .nav-section,.tryon-admin.collapsed .logout span:not(.ico){display:none}.tryon-admin.collapsed .brand{padding:24px 12px;justify-content:center}.tryon-admin.collapsed .collapse-btn{margin-left:0}.nav{padding:18px 10px;overflow:auto;flex:1;scrollbar-width:none}.nav::-webkit-scrollbar{display:none}.nav-section{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.28);padding:16px 16px 8px;margin-top:8px}.nav-item{width:100%;border:0;background:transparent;color:rgba(255,255,255,.64);display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:15px;text-align:left;margin:4px 0;transition:.22s;cursor:pointer;position:relative}.nav-item .ico,.logout .ico{width:30px;height:30px;border-radius:11px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0}.nav-item:hover,.nav-item.active{background:rgba(227,6,19,.16);color:#fff}.nav-item.active .ico{background:var(--red)}.badge-notif{background:var(--red);color:#fff;border-radius:50%;padding:2px 6px;font-size:10px;font-weight:700;margin-left:auto;min-width:20px;text-align:center}.logout{margin:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.05);color:#fff;border-radius:16px;padding:13px;display:flex;align-items:center;justify-content:center;gap:10px;transition:.25s;cursor:pointer}.logout:hover{border-color:var(--red);box-shadow:0 0 0 3px rgba(227,6,19,.16);background:rgba(227,6,19,.12)}.main{min-width:0;padding:28px 34px 50px}.topbar{min-height:72px;background:rgba(255,255,255,.76);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow2);display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 18px;margin-bottom:28px;position:sticky;top:16px;z-index:20}.top-left{display:flex;align-items:center;gap:12px}.mobile-menu{display:none;width:42px;height:42px;border:0;background:var(--ink);color:#fff;border-radius:14px;cursor:pointer}.page-title{font-family:'Cormorant Garamond',serif;font-size:34px;margin:0}.page-subtitle{margin:4px 0 0;font-size:12px;color:var(--muted)}.top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.search{min-width:200px;border:1px solid var(--border);background:#fff;border-radius:14px;padding:12px 14px;outline:none;transition:.22s}.search:focus{border-color:var(--red);box-shadow:0 0 0 4px rgba(227,6,19,.12)}.btn{border:0;border-radius:14px;padding:12px 16px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.9px;display:inline-flex;align-items:center;gap:8px;transition:.22s;cursor:pointer}.btn:hover{transform:translateY(-2px);box-shadow:var(--shadow2)}.btn-primary{background:var(--ink);color:#fff}.btn-red{background:linear-gradient(135deg,var(--red),var(--red2));color:#fff}.btn-light{background:#fff;color:var(--ink);border:1px solid var(--border)}.kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;margin-bottom:22px}.card{background:rgba(255,255,255,.88);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow2);padding:22px}.kpi{position:relative;overflow:hidden}.kpi:before{content:"";position:absolute;width:110px;height:110px;right:-45px;top:-45px;border-radius:50%;background:rgba(227,6,19,.10)}.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:1.4px;color:var(--muted);font-weight:700}.kpi-value{font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:600;margin:10px 0 4px}.kpi-change{font-size:12px;color:var(--green);font-weight:700}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.charts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:18px 0}.chart-card{min-height:270px}.card-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.card-title h3{font-size:15px;margin:0}.muted{color:var(--muted);font-size:13px}.bars{display:flex;align-items:flex-end;gap:9px;height:160px;padding:10px 2px 26px}.bar{flex:1;border-radius:10px 10px 4px 4px;background:linear-gradient(180deg,var(--red),#201111);position:relative;min-height:14px;transition:.5s}.bar span{position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--muted)}.bar-value{position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--muted)}.line-chart{height:170px;width:100%}.line-chart polyline{fill:none;stroke:var(--red);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.line-chart .area{fill:rgba(227,6,19,.10)}.donut{width:170px;height:170px;border-radius:50%;background:conic-gradient(var(--red) 0 42%,var(--ink) 42% 67%,#B36B12 67% 85%,#ddd 85% 100%);margin:0 auto;position:relative}.donut:after{content:"42%";position:absolute;inset:28px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:36px}.legend{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px}.legend span{font-size:11px;color:var(--muted)}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:var(--red)}.dot.dark{background:#111}.dot.gold{background:#B36B12}.hbar-row{display:grid;grid-template-columns:92px 1fr 42px;align-items:center;gap:10px;font-size:12px;margin-bottom:13px}.hbar-track{height:12px;background:var(--soft);border-radius:999px;overflow:hidden}.hbar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--red),var(--ink))}.funnel{display:flex;flex-direction:column;align-items:center;gap:10px}.funnel-step{height:34px;background:linear-gradient(90deg,var(--red),var(--ink));border-radius:12px;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;width:100%}.activity-item{display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;padding:12px;border-radius:16px;background:var(--soft);margin-bottom:10px}.activity-icon{width:36px;height:36px;border-radius:13px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap}.filter-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}.chip{border:1px solid var(--border);background:#fff;color:var(--muted);padding:9px 14px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;transition:.22s}.chip.active,.chip:hover{background:var(--ink);color:#fff}.chip.disabled{cursor:default}.table-card{padding:0;overflow:hidden}.row{display:grid;grid-template-columns:1fr 1.3fr 1fr 1fr 1fr 150px;gap:14px;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border);font-size:13px}.row.head{background:#161616;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:800}.clients-row{grid-template-columns:1.1fr 1.5fr 1fr .7fr 1fr 150px}.tries-row{grid-template-columns:1fr 1.4fr .8fr 1fr 150px}.badge{display:inline-flex;width:max-content;padding:5px 10px;border-radius:999px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.8px}.ok{background:rgba(45,125,70,.12);color:var(--green)}.warn{background:rgba(179,107,18,.12);color:var(--orange)}.bad{background:rgba(227,6,19,.12);color:var(--red)}.blue{background:rgba(56,94,157,.12);color:var(--blue)}.actions{display:flex;gap:8px;justify-content:flex-end}.icon-btn{width:34px;height:34px;border:1px solid var(--border);border-radius:12px;background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:.22s}.icon-btn.view:hover{background:rgba(56,94,157,.10);color:var(--blue)}.icon-btn.danger:hover{background:rgba(227,6,19,.10);color:var(--red)}.products-grid-admin{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.stock-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.stock-card .stock-header{display:flex;align-items:center;gap:12px;margin-bottom:10px}.stock-card .stock-emoji{font-size:28px}.stock-card .stock-info{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:10px}.stock-bar{height:8px;background:var(--soft);border-radius:999px;overflow:hidden;margin:10px 0}.stock-fill{height:100%;border-radius:999px;transition:.5s}.stock-details{display:flex;justify-content:space-between;align-items:center}.stock-actions{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}.promotions-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.promotion-card.inactive{opacity:.6}.promo-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.promo-code{font-size:18px;font-weight:900;font-family:monospace}.promo-details{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px}.promo-bar{height:6px;background:var(--soft);border-radius:999px;overflow:hidden;margin:10px 0}.promo-fill{height:100%;background:linear-gradient(90deg,var(--red),var(--ink));border-radius:999px;transition:.5s}.promo-actions{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}.payment-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:22px}.reports-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.review-stats .stat-item{display:grid;grid-template-columns:100px 1fr 60px;gap:10px;align-items:center;margin-bottom:8px}.stat-bar{height:8px;background:var(--soft);border-radius:999px;overflow:hidden}.stat-fill{height:100%;background:linear-gradient(90deg,var(--red),var(--ink));border-radius:999px;transition:.5s}.support-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center}.support-stats div{background:var(--soft);padding:12px;border-radius:12px}.support-stats strong{display:block;font-size:24px;margin-top:4px}.notifications-list{display:flex;flex-direction:column;gap:12px}.notification-item.unread{background:rgba(227,6,19,.05);border-left:4px solid var(--red)}.notification-item.read{opacity:.7}.notif-header{display:flex;align-items:flex-start;gap:14px}.notif-type{font-size:24px;flex-shrink:0}.notif-content{flex:1}.notif-content h4{margin:0 0 4px}.notif-content p{margin:0;font-size:13px;color:var(--muted)}.notif-date{font-size:11px;color:var(--muted)}.notif-actions{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap}.notif-actions .actions{flex-wrap:wrap}.product-card-admin{position:relative;display:grid;grid-template-columns:78px 1fr;gap:14px;align-items:center;padding-bottom:62px;min-height:180px;overflow:hidden;transition:.28s}.product-card-admin:hover{transform:translateY(-5px);box-shadow:0 20px 46px rgba(0,0,0,.14);border-color:rgba(227,6,19,.35)}.product-img{width:78px;height:96px;border-radius:18px;background:linear-gradient(160deg,#f4ebe6,#fff);display:flex;align-items:center;justify-content:center;font-size:38px;flex-shrink:0}.product-card-admin h3{margin:0 0 6px}.product-actions-admin{position:absolute;left:18px;right:18px;top:auto;bottom:16px;display:flex;justify-content:center;gap:9px;opacity:0;transform:translateY(14px);transition:.25s ease;pointer-events:none}.product-card-admin:hover .product-actions-admin{opacity:1;transform:translateY(0);pointer-events:auto}.product-actions-admin .actions{justify-content:center}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.settings-card h3{font-size:16px;margin:0 0 14px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{margin-bottom:14px}.label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:var(--muted);font-weight:800;margin-bottom:7px}.input,.select,.textarea{width:100%;border:1px solid var(--border);background:#fff;border-radius:14px;padding:12px;outline:none;transition:.22s}.input:focus,.select:focus,.textarea:focus{border-color:var(--red);box-shadow:0 0 0 4px rgba(227,6,19,.12)}.textarea{min-height:92px;resize:vertical;margin-bottom:14px}.switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}.switch{width:54px;height:30px;border-radius:999px;background:#ddd;position:relative;border:0;transition:.2s;cursor:pointer}.switch:before{content:"";position:absolute;width:24px;height:24px;border-radius:50%;background:#fff;left:3px;top:3px;transition:.2s;box-shadow:0 3px 10px rgba(0,0,0,.2)}.switch.on{background:var(--red)}.switch.on:before{left:27px}.role{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:16px;background:#fff;margin-bottom:10px}.audit-line{padding:10px 0;border-bottom:1px solid var(--border);font-size:12px}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:18px;z-index:80;animation:fadeIn .25s ease}.modal-box{background:#fff;border-radius:24px;width:min(620px,100%);max-height:90vh;overflow-y:auto;box-shadow:var(--shadow)}.modal-head{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff;z-index:1;border-radius:24px 24px 0 0}.modal-body{padding:22px}.modal-foot{padding-top:16px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--border);margin-top:16px}.close{width:36px;height:36px;border:0;border-radius:50%;background:var(--soft);font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.22s}.close:hover{background:rgba(227,6,19,.12)}.view-modal{max-width:500px}.view-list{display:flex;flex-direction:column;gap:10px}.view-line{display:grid;grid-template-columns:140px 1fr;gap:12px;padding:12px 16px;border:1px solid var(--border);border-radius:14px;background:#fafafa}.view-line span{text-transform:uppercase;font-size:11px;letter-spacing:1px;color:var(--muted);font-weight:800}.view-line b{font-size:14px;word-break:break-word}.export-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:100;display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;animation:fadeIn .3s ease}.export-box{width:min(420px,90%);background:linear-gradient(160deg,#161616,#33100d);border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:36px;box-shadow:0 30px 80px rgba(0,0,0,.35)}.loader{width:74px;height:74px;border:6px solid rgba(255,255,255,.16);border-top-color:var(--red);border-radius:50%;margin:0 auto 22px;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.progress{height:10px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden;margin-top:18px}.progress-fill{height:100%;width:100%;background:linear-gradient(90deg,var(--red),#fff);border-radius:999px;animation:progressPulse 1.5s ease infinite}@keyframes progressPulse{0%,100%{opacity:1}50%{opacity:.6}}.toast{position:fixed;right:22px;bottom:22px;z-index:120;background:var(--ink);color:#fff;border-radius:16px;padding:14px 18px;box-shadow:var(--shadow);font-size:13px;animation:slideIn .3s ease;max-width:400px}.toast-error{background:var(--red)}.toast-success{background:var(--green)}@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}.empty{text-align:center;padding:36px;color:var(--muted)}.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.kpi-value{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif !important;font-weight:800 !important;letter-spacing:-1px}.sidebar,.nav{scrollbar-width:none}.sidebar::-webkit-scrollbar,.nav::-webkit-scrollbar{display:none}.sales-card{margin-top:30px}.pagination{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:22px;flex-wrap:wrap}.page-btn{min-width:40px;height:40px;border-radius:999px;border:1px solid var(--border);background:#fff;color:var(--ink);font-weight:900;transition:.22s;cursor:pointer}.page-btn:hover:not(:disabled),.page-btn.active{background:var(--ink);color:#fff;transform:translateY(-2px)}.page-btn:disabled{opacity:.35;cursor:not-allowed}.error-page{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}.error-page h2{font-size:28px;color:var(--red)}.stars{color:#f5c518;font-size:14px}.comment-preview{font-style:italic;color:var(--muted)}.offline-banner{background:var(--orange);color:#fff;padding:10px 20px;text-align:center;font-weight:700;position:sticky;top:0;z-index:100}.save-indicator{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;z-index:50}.advanced-analytics .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:12px}.metric-item{display:flex;flex-direction:column;align-items:center;padding:12px;background:var(--soft);border-radius:12px}.metric-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}.metric-value{font-size:20px;font-weight:700;margin-top:4px}.checkbox-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.checkbox-label{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer}.checkbox-label input[type="checkbox"]{width:16px;height:16px;cursor:pointer}.demo-overlay{position:fixed;inset:0;z-index:200;pointer-events:none}.demo-tooltip{position:fixed;z-index:201;pointer-events:auto;min-width:280px;max-width:400px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);padding:20px;margin-bottom:12px;animation:demoPop .4s ease}.demo-content p{margin:0 0 12px;font-size:14px;line-height:1.5}.demo-step{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}.demo-actions{display:flex;gap:8px;justify-content:flex-end}.demo-arrow{position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:12px solid #fff}.demo-highlight{pointer-events:none;animation:pulse-border 1.5s ease-in-out infinite;z-index:199}@keyframes pulse-border{0%,100%{box-shadow:0 0 0 2px var(--red),0 0 20px rgba(227,6,19,.3)}50%{box-shadow:0 0 0 4px var(--red),0 0 40px rgba(227,6,19,.5)}}@keyframes demoPop{from{opacity:0;transform:scale(.9) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}.tryon-admin.dark{--ink:#f5f5f5;--border:rgba(255,255,255,.10);--soft:#1a1a1a;--shadow2:0 10px 28px rgba(255,255,255,.05);background:linear-gradient(180deg,#1a1a1a,#0d0d0d)}.tryon-admin.dark .card{background:rgba(30,30,30,.9)}.tryon-admin.dark .topbar{background:rgba(30,30,30,.8);border-color:rgba(255,255,255,.08)}.tryon-admin.dark .search{background:#222;border-color:rgba(255,255,255,.08);color:#fff}.tryon-admin.dark .search::placeholder{color:#888}.tryon-admin.dark .btn-light{background:#222;color:#fff;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .donut:after{background:#1a1a1a}.tryon-admin.dark .view-line{background:#1a1a1a;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .modal-box{background:#1a1a1a}.tryon-admin.dark .modal-head{background:#1a1a1a;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .modal-foot{border-color:rgba(255,255,255,.08)}.tryon-admin.dark .close{background:#2a2a2a;color:#fff}.tryon-admin.dark .role{background:#1a1a1a;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .input,.tryon-admin.dark .select,.tryon-admin.dark .textarea{background:#222;border-color:rgba(255,255,255,.08);color:#fff}.tryon-admin.dark .chip{background:#222;color:#aaa;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .chip.active,.tryon-admin.dark .chip:hover{background:#333;color:#fff}.tryon-admin.dark .page-btn{background:#222;color:#aaa;border-color:rgba(255,255,255,.08)}.tryon-admin.dark .page-btn:hover:not(:disabled),.tryon-admin.dark .page-btn.active{background:#333;color:#fff}.tryon-admin.dark .switch-row{border-color:rgba(255,255,255,.08)}.tryon-admin.dark .icon-btn{background:#222;border-color:rgba(255,255,255,.08);color:#aaa}.tryon-admin.dark .activity-item{background:#1a1a1a}.tryon-admin.dark .activity-icon{background:#333}.tryon-admin.dark .badge.ok{background:rgba(45,125,70,.2)}.tryon-admin.dark .badge.warn{background:rgba(179,107,18,.2)}.tryon-admin.dark .badge.bad{background:rgba(227,6,19,.2)}.tryon-admin.dark .badge.blue{background:rgba(56,94,157,.2)}.tryon-admin.dark .notification-item.unread{background:rgba(227,6,19,.1)}.tryon-admin.dark .support-stats div{background:#1a1a1a}.tryon-admin.dark .stock-card .stock-info{color:#aaa}.tryon-admin.dark .promo-details{color:#aaa}.tryon-admin.dark .stars{color:#f5c518}.tryon-admin.dark .demo-tooltip{background:#1a1a1a;color:#fff;border:1px solid rgba(255,255,255,.1)}.tryon-admin.dark .demo-arrow{border-top-color:#1a1a1a}.tryon-admin.dark .offline-banner{background:var(--orange)}.tryon-admin.dark .save-indicator{background:rgba(0,0,0,.9)}.tryon-admin.dark .metric-item{background:#1a1a1a;border:1px solid rgba(255,255,255,.05)}@media(max-width:1180px){.charts-grid,.products-grid-admin,.promotions-grid{grid-template-columns:repeat(2,1fr)}.kpi-grid{grid-template-columns:repeat(3,1fr)}.settings-grid{grid-template-columns:1fr}.grid-3{grid-template-columns:1fr 1fr}.stock-grid{grid-template-columns:repeat(2,1fr)}.reports-grid{grid-template-columns:1fr}.payment-summary{grid-template-columns:repeat(2,1fr)}.advanced-analytics .metrics-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:820px){.tryon-admin{display:block}.sidebar{position:fixed;left:0;top:0;z-index:70;width:280px;transform:translateX(-105%);transition:.28s;height:100vh}.sidebar.open{transform:translateX(0)}.tryon-admin.collapsed .sidebar{transform:translateX(-105%)}.main{padding:18px}.mobile-menu{display:block}.topbar{height:auto;align-items:flex-start;flex-direction:column;padding:16px}.top-actions{width:100%}.search{width:100%;min-width:0}.charts-grid,.products-grid-admin,.grid-2,.grid-3,.kpi-grid,.form-grid,.stock-grid,.promotions-grid,.payment-summary,.reports-grid{grid-template-columns:1fr}.row,.clients-row,.tries-row{grid-template-columns:1fr;gap:6px}.row.head{display:none}.actions{justify-content:flex-start}.product-actions-admin{opacity:1;transform:none;pointer-events:auto;position:relative;left:auto;right:auto;bottom:auto;padding-top:12px}.modal-overlay{align-items:flex-start;padding-top:40px}.brand{flex-wrap:nowrap}.kpi-grid{grid-template-columns:repeat(2,1fr)}.notif-header{flex-wrap:wrap}.advanced-analytics .metrics-grid{grid-template-columns:1fr 1fr}.save-indicator{bottom:10px;font-size:10px;padding:4px 12px}.demo-tooltip{min-width:200px;max-width:300px;left:50%!important;transform:translateX(-50%)!important;top:50%!important}}@media print{.sidebar,.topbar,.actions,.toolbar,.btn,.modal-overlay,.export-overlay,.toast,.offline-banner,.save-indicator,.demo-overlay{display:none!important}.tryon-admin{display:block}.main{padding:0}.card{box-shadow:none;border:1px solid #ddd}.charts-grid{grid-template-columns:1fr 1fr}.kpi-grid{grid-template-columns:repeat(5,1fr)}
`;

export default Dashboard;