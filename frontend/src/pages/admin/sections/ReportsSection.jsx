import React, { useEffect, useMemo, useState } from "react";
import { adminService } from "../../../services/adminService";
import generateReportPDF from "../../../utils/pdfReport";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

const periodLabels = {
  today: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  year: "12 derniers mois",
};

function ReportKpi({ label, value, sub, icon, tone = "red" }) {
  return (
    <div className="report-kpi">
      <div>
        <p>{label}</p>
        <span className={`report-kpi-icon ${tone}`}>{icon}</span>
      </div>
      <h3>{value}</h3>
      <b>{sub}</b>
    </div>
  );
}

function Card({ title, side, children, className = "" }) {
  return (
    <div className={`report-card ${className}`}>
      <div className="report-card-head">
        <h3>{title}</h3>
        {side && <span>{side}</span>}
      </div>
      {children}
    </div>
  );
}

function ProgressRow({ label, value, max, amount }) {
  const percent = max ? Math.round((Number(value || 0) / max) * 100) : 0;

  return (
    <div className="report-progress-row">
      <span>{label}</span>
      <div className="report-progress-track">
        <div style={{ width: `${Math.max(percent, 5)}%` }} />
      </div>
      <b>{amount}</b>
    </div>
  );
}

function StatusLabel(status) {
  const labels = {
    pending: "En cours",
    processing: "Traitement",
    shipped: "Expédiées",
    delivered: "Livrées",
    cancelled: "Annulées",
  };

  return labels[status] || status || "Non défini";
}

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

  return (
    <div className="reports-page">
      <div className="report-hero">
        <span>Analyse & Rapports</span>
        <h2>Vue complète des performances TryOn</h2>
        <p>
          Statistiques détaillées, chiffre d'affaires, top produits, top clients,
          commandes, paiements, stock, support et avis clients.
        </p>

        <div className="report-toolbar">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>

          <button onClick={loadReports}>↻ Actualiser</button>
          <button onClick={exportCsv}>CSV</button>
          <button onClick={exportJson}>JSON</button>
          <button className="red" onClick={exportPdf}>PDF</button>
        </div>
      </div>

      {error && <div className="report-error">{error}</div>}
      {loading && <div className="report-loading">Chargement des rapports...</div>}

      <div className="report-kpi-grid">
        <ReportKpi label="Chiffre d'affaires" value={fmt(summary.revenue)} sub={periodLabels[period]} icon="💰" />
        <ReportKpi label="Commandes" value={summary.totalOrders || 0} sub={`${summary.deliveredOrders || 0} livrées`} icon="🛍️" tone="blue" />
        <ReportKpi label="Panier moyen" value={fmt(summary.averageOrder)} sub="Par commande" icon="🛒" />
        <ReportKpi label="Clients" value={summary.totalClients || 0} sub="Base client" icon="👥" tone="green" />
        <ReportKpi label="Produits" value={summary.totalProducts || 0} sub="Catalogue" icon="📦" tone="blue" />
        <ReportKpi label="Stock faible" value={stock.lowStock || 0} sub={`${stock.outOfStock || 0} ruptures`} icon="⚠️" tone="orange" />
        <ReportKpi label="Avis en attente" value={reviews.pendingReviews || 0} sub={`Moyenne ${Number(reviews.averageRating || 0).toFixed(1)}/5`} icon="⭐" tone="purple" />
        <ReportKpi label="Tickets ouverts" value={support.openTickets || 0} sub={`${support.totalTickets || 0} tickets`} icon="🎧" tone="green" />
      </div>

      <div className="report-grid-2">
        <Card title="Évolution du chiffre d'affaires" side={periodLabels[period]}>
          {(report?.salesEvolution || []).length ? (
            <div className="report-line-bars">
              {report.salesEvolution.map((item) => (
                <div className="report-line-item" key={item.label}>
                  <span>{String(item.label).slice(5)}</span>
                  <div>
                    <i style={{ height: `${Math.max((Number(item.revenue || 0) / salesMax) * 100, 5)}%` }} />
                  </div>
                  <b>{Number(item.revenue || 0).toLocaleString("fr-FR")}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="report-empty">Aucune donnée de ventes pour cette période.</div>
          )}
        </Card>

        <Card title="Statuts commandes" side="Répartition">
          {(report?.orderStatus || []).length ? (
            <div className="report-status-list">
              {report.orderStatus.map((item) => (
                <ProgressRow
                  key={item.status}
                  label={StatusLabel(item.status)}
                  value={item.total}
                  max={summary.totalOrders || 1}
                  amount={item.total}
                />
              ))}
            </div>
          ) : (
            <div className="report-empty">Aucune commande.</div>
          )}
        </Card>
      </div>

      <div className="report-grid-2">
        <Card title="Top produits" side="Quantité & CA">
          {(report?.topProducts || []).length ? (
            <div className="report-list">
              {report.topProducts.map((p) => (
                <ProgressRow
                  key={p.name}
                  label={`${p.name} · ${p.quantity} ventes`}
                  value={p.revenue}
                  max={topProductsMax}
                  amount={fmt(p.revenue)}
                />
              ))}
            </div>
          ) : (
            <div className="report-empty">Aucun produit vendu.</div>
          )}
        </Card>

        <Card title="Top clients" side="Dépenses">
          {(report?.topClients || []).length ? (
            <div className="report-list">
              {report.topClients.map((c) => (
                <ProgressRow
                  key={`${c.email}-${c.name}`}
                  label={`${c.name || "Client"} · ${c.orders} cmd`}
                  value={c.totalSpent}
                  max={topClientsMax}
                  amount={fmt(c.totalSpent)}
                />
              ))}
            </div>
          ) : (
            <div className="report-empty">Aucun client sur cette période.</div>
          )}
        </Card>
      </div>

      <div className="report-grid-3">
        <Card title="Paiements par méthode" side="Montant">
          {(report?.paymentMethods || []).length ? (
            <div className="report-list compact">
              {report.paymentMethods.map((p) => (
                <ProgressRow
                  key={p.method}
                  label={p.method || "Non défini"}
                  value={p.amount}
                  max={paymentMax}
                  amount={fmt(p.amount)}
                />
              ))}
            </div>
          ) : (
            <div className="report-empty">Aucun paiement.</div>
          )}
        </Card>

        <Card title="Stock" side="Disponibilité">
          <div className="report-simple-list">
            <p><span>Total produits</span><b>{stock.totalProducts || 0}</b></p>
            <p><span>Disponibles</span><b className="green">{stock.availableStock || 0}</b></p>
            <p><span>Stock faible</span><b className="orange">{stock.lowStock || 0}</b></p>
            <p><span>Rupture de stock</span><b className="red-text">{stock.outOfStock || 0}</b></p>
          </div>
        </Card>

        <Card title="Support & Avis" side="Qualité">
          <div className="report-simple-list">
            <p><span>Total avis</span><b>{reviews.totalReviews || 0}</b></p>
            <p><span>Note moyenne</span><b className="purple">{Number(reviews.averageRating || 0).toFixed(1)} / 5</b></p>
            <p><span>Tickets ouverts</span><b className="orange">{support.openTickets || 0}</b></p>
            <p><span>Tickets résolus</span><b className="green">{support.resolvedTickets || 0}</b></p>
          </div>
        </Card>
      </div>
    </div>
  );
}