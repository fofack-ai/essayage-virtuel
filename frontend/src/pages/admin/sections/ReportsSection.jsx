import React, { useEffect, useMemo, useState } from "react";
import { adminService } from "../../../services/adminService";
import generateReportPDF from "../../../utils/pdfReport";
import {
  TrendingUp, ShoppingBag, ShoppingCart, Users, Package,
  AlertTriangle, Star, Headphones, RefreshCw,
  FileSpreadsheet, FileJson, Printer, BarChart3,
  CheckCircle, Clock, XCircle, Award, DollarSign,
  Calendar, Eye, Heart, MessageCircle
} from "lucide-react";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

const periodLabels = {
  today: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  year: "12 derniers mois",
};

// ============================================================
// COMPOSANTS
// ============================================================

function ReportKpi({ label, value, sub, icon, color = "red" }) {
  return (
    <div className="report-kpi">
      <div className="report-kpi-top">
        <span className="report-kpi-label">{label}</span>
        <span className={`report-kpi-icon ${color}`}>{icon}</span>
      </div>
      <div className="report-kpi-value">{value}</div>
      <span className="report-kpi-sub">{sub}</span>
    </div>
  );
}

function ReportCard({ title, icon, side, children }) {
  return (
    <div className="report-card">
      <div className="report-card-head">
        <h3>
          {icon && <span className="report-card-icon">{icon}</span>}
          {title}
        </h3>
        {side && <span className="report-card-side">{side}</span>}
      </div>
      <div className="report-card-body">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, amount, color = "red" }) {
  const percent = max ? Math.round((Number(value || 0) / max) * 100) : 0;

  return (
    <div className="progress-row">
      <span className="progress-label">{label}</span>
      <div className="progress-track">
        <div 
          className={`progress-fill ${color}`} 
          style={{ width: `${Math.max(percent, 4)}%` }} 
        />
      </div>
      <span className="progress-amount">{amount}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: "En cours", color: "orange" },
    processing: { label: "Traitement", color: "blue" },
    shipped: { label: "Expédiées", color: "purple" },
    delivered: { label: "Livrées", color: "green" },
    cancelled: { label: "Annulées", color: "red" },
  };

  const { label, color } = config[status] || { label: status || "Non défini", color: "gray" };

  return <span className={`status-badge ${color}`}>{label}</span>;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ReportsSection() {
  const [period, setPeriod] = useState("month");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminService.getReports(period);
      const payload = res?.data?.data || res?.data || {};

      setReport(payload);
    } catch (err) {
      console.error("Erreur chargement rapports :", err);
      setError("Impossible de charger les rapports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  const summary = report?.summary || {};
  const stock = report?.stockSummary || {};
  const reviews = report?.reviewsSummary || {};
  const support = report?.supportSummary || {};

  const salesMax = useMemo(() => {
    return Math.max(
      ...(report?.salesEvolution || []).map((x) => Number(x.revenue || 0)),
      1
    );
  }, [report]);

  const topProductsMax = useMemo(() => {
    return Math.max(
      ...(report?.topProducts || []).map((x) => Number(x.revenue || 0)),
      1
    );
  }, [report]);

  const topClientsMax = useMemo(() => {
    return Math.max(
      ...(report?.topClients || []).map((x) => Number(x.totalSpent || 0)),
      1
    );
  }, [report]);

  const paymentMax = useMemo(() => {
    return Math.max(
      ...(report?.paymentMethods || []).map((x) => Number(x.amount || 0)),
      1
    );
  }, [report]);

  const exportCsv = () => {
    const rows = [
      ["Indicateur", "Valeur"],
      ["Chiffre d'affaires", summary.revenue || 0],
      ["Commandes", summary.totalOrders || 0],
      ["Panier moyen", summary.averageOrder || 0],
      ["Clients", summary.totalClients || 0],
      ["Produits", summary.totalProducts || 0],
    ];

    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport-tryon.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport-tryon.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const getAdminName = () => {
    try {
      const storedUser =
        JSON.parse(sessionStorage.getItem("tryon_user") || "null") ||
        JSON.parse(localStorage.getItem("tryon_user") || "null");

      return (
        storedUser?.fullName ||
        storedUser?.name ||
        `${storedUser?.firstName || ""} ${storedUser?.lastName || ""}`.trim() ||
        "Administrateur"
      );
    } catch {
      return "Administrateur";
    }
  };

  const exportPdf = () => {
    if (!report) {
      alert("Aucun rapport à exporter pour le moment.");
      return;
    }

    generateReportPDF(report, {
      periodLabel: periodLabels[period],
      adminName: getAdminName(),
    });
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="reports-section">
      {/* HEADER */}
      <div className="reports-header">
        <div className="reports-header-left">
          <h1>
            <BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />
            Analyse & Rapports
          </h1>
          <p>Vue complète des performances TryOn</p>
        </div>
        <div className="reports-header-right">
          <select 
            className="reports-period-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="today">📅 Aujourd'hui</option>
            <option value="week">📅 7 derniers jours</option>
            <option value="month">📅 30 derniers jours</option>
            <option value="year">📅 12 derniers mois</option>
          </select>
          <button className="btn btn-light" onClick={loadReports}>
            <RefreshCw size={16} /> Actualiser
          </button>
          <button className="btn btn-light" onClick={exportCsv}>
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button className="btn btn-light" onClick={exportJson}>
            <FileJson size={16} /> JSON
          </button>
          <button className="btn btn-red" onClick={exportPdf}>
            <Printer size={16} /> PDF
          </button>
        </div>
      </div>

      {/* ERREUR / CHARGEMENT */}
      {error && <div className="reports-error">{error}</div>}
      {loading && <div className="reports-loading">Chargement des rapports...</div>}

      {/* KPI GRID */}
      <div className="reports-kpi-grid">
        <ReportKpi 
          label="Chiffre d'affaires" 
          value={fmt(summary.revenue)} 
          sub={periodLabels[period]} 
          icon={<TrendingUp size={20} />} 
          color="red"
        />
        <ReportKpi 
          label="Commandes" 
          value={summary.totalOrders || 0} 
          sub={`${summary.deliveredOrders || 0} livrées`} 
          icon={<ShoppingBag size={20} />} 
          color="blue"
        />
        <ReportKpi 
          label="Panier moyen" 
          value={fmt(summary.averageOrder)} 
          sub="Par commande" 
          icon={<ShoppingCart size={20} />} 
          color="purple"
        />
        <ReportKpi 
          label="Clients" 
          value={summary.totalClients || 0} 
          sub="Base client" 
          icon={<Users size={20} />} 
          color="green"
        />
        <ReportKpi 
          label="Produits" 
          value={summary.totalProducts || 0} 
          sub="Catalogue" 
          icon={<Package size={20} />} 
          color="blue"
        />
        <ReportKpi 
          label="Stock faible" 
          value={stock.lowStock || 0} 
          sub={`${stock.outOfStock || 0} ruptures`} 
          icon={<AlertTriangle size={20} />} 
          color="orange"
        />
        <ReportKpi 
          label="Avis en attente" 
          value={reviews.pendingReviews || 0} 
          sub={`${Number(reviews.averageRating || 0).toFixed(1)} / 5 ⭐`} 
          icon={<Star size={20} />} 
          color="purple"
        />
        <ReportKpi 
          label="Tickets ouverts" 
          value={support.openTickets || 0} 
          sub={`${support.totalTickets || 0} tickets`} 
          icon={<Headphones size={20} />} 
          color="green"
        />
      </div>

      {/* LIGNE 1 : Ventes & Commandes */}
      <div className="reports-row-2">
        <ReportCard 
          title="Évolution du CA" 
          icon={<TrendingUp size={18} />}
          side={periodLabels[period]}
        >
          {(report?.salesEvolution || []).length ? (
            <div className="chart-bars">
              {report.salesEvolution.map((item) => (
                <div className="chart-bar-item" key={item.label}>
                  <span className="chart-bar-label">{String(item.label).slice(5)}</span>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${Math.max((Number(item.revenue || 0) / salesMax) * 100, 4)}%` }} 
                    />
                  </div>
                  <span className="chart-bar-value">
                    {Number(item.revenue || 0).toLocaleString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="reports-empty">Aucune donnée de ventes.</div>
          )}
        </ReportCard>

        <ReportCard 
          title="Statuts commandes" 
          icon={<ShoppingBag size={18} />}
          side="Répartition"
        >
          {(report?.orderStatus || []).length ? (
            <div className="status-list">
              {report.orderStatus.map((item) => (
                <div className="status-item" key={item.status}>
                  <StatusBadge status={item.status} />
                  <div className="status-count">{item.total}</div>
                  <div className="status-bar">
                    <div 
                      className={`status-bar-fill ${item.status === 'delivered' ? 'green' : item.status === 'cancelled' ? 'red' : 'orange'}`}
                      style={{ width: `${Math.max((item.total / (summary.totalOrders || 1)) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="reports-empty">Aucune commande.</div>
          )}
        </ReportCard>
      </div>

      {/* LIGNE 2 : Top produits & Top clients */}
      <div className="reports-row-2">
        <ReportCard 
          title="Top produits" 
          icon={<Award size={18} />}
          side="CA"
        >
          {(report?.topProducts || []).length ? (
            <div className="ranking-list">
              {report.topProducts.map((p, index) => (
                <ProgressBar
                  key={p.name}
                  label={`#${index + 1} ${p.name}`}
                  value={p.revenue}
                  max={topProductsMax}
                  amount={fmt(p.revenue)}
                  color="red"
                />
              ))}
            </div>
          ) : (
            <div className="reports-empty">Aucun produit vendu.</div>
          )}
        </ReportCard>

        <ReportCard 
          title="Top clients" 
          icon={<Users size={18} />}
          side="Dépenses"
        >
          {(report?.topClients || []).length ? (
            <div className="ranking-list">
              {report.topClients.map((c, index) => (
                <ProgressBar
                  key={`${c.email}-${c.name}`}
                  label={`#${index + 1} ${c.name || "Client"}`}
                  value={c.totalSpent}
                  max={topClientsMax}
                  amount={`${c.orders} cmd · ${fmt(c.totalSpent)}`}
                  color="blue"
                />
              ))}
            </div>
          ) : (
            <div className="reports-empty">Aucun client.</div>
          )}
        </ReportCard>
      </div>

      {/* LIGNE 3 : Paiements, Stock, Support */}
      <div className="reports-row-3">
        <ReportCard 
          title="Paiements" 
          icon={<DollarSign size={18} />}
          side="Méthodes"
        >
          {(report?.paymentMethods || []).length ? (
            <div className="payment-list">
              {report.paymentMethods.map((p) => (
                <div className="payment-item" key={p.method}>
                  <span className="payment-label">{p.method || "Non défini"}</span>
                  <div className="payment-bar">
                    <div 
                      className="payment-bar-fill purple"
                      style={{ width: `${Math.max((p.amount / paymentMax) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="payment-amount">{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="reports-empty">Aucun paiement.</div>
          )}
        </ReportCard>

        <ReportCard 
          title="Stock" 
          icon={<Package size={18} />}
          side="Disponibilité"
        >
          <div className="stock-list">
            <div className="stock-item">
              <span className="stock-label">Total produits</span>
              <span className="stock-value">{stock.totalProducts || 0}</span>
            </div>
            <div className="stock-item">
              <span className="stock-label"><span className="dot green" /> Disponibles</span>
              <span className="stock-value green">{stock.availableStock || 0}</span>
            </div>
            <div className="stock-item">
              <span className="stock-label"><span className="dot orange" /> Stock faible</span>
              <span className="stock-value orange">{stock.lowStock || 0}</span>
            </div>
            <div className="stock-item">
              <span className="stock-label"><span className="dot red" /> Rupture</span>
              <span className="stock-value red">{stock.outOfStock || 0}</span>
            </div>
          </div>
        </ReportCard>

        <ReportCard 
          title="Support & Avis" 
          icon={<MessageCircle size={18} />}
          side="Qualité"
        >
          <div className="support-list">
            <div className="support-item">
              <span className="support-label">⭐ Total avis</span>
              <span className="support-value">{reviews.totalReviews || 0}</span>
            </div>
            <div className="support-item">
              <span className="support-label">📊 Note moyenne</span>
              <span className="support-value purple">{Number(reviews.averageRating || 0).toFixed(1)} / 5</span>
            </div>
            <div className="support-item">
              <span className="support-label"><Clock size={14} /> Tickets ouverts</span>
              <span className="support-value orange">{support.openTickets || 0}</span>
            </div>
            <div className="support-item">
              <span className="support-label"><CheckCircle size={14} /> Tickets résolus</span>
              <span className="support-value green">{support.resolvedTickets || 0}</span>
            </div>
          </div>
        </ReportCard>
      </div>
    </div>
  );
}