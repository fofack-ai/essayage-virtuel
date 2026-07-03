import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
const formatNumber = (value) => Number(value || 0).toLocaleString("fr-FR");

const safe = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const statusLabel = (status) => {
  const labels = {
    pending: "En cours",
    processing: "Traitement",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    resolved: "Résolu",
    closed: "Fermé",
    open: "Ouvert",
  };

  return labels[status] || status || "Non défini";
};

const paymentLabel = (method) => {
  const labels = {
    cash_on_delivery: "Paiement à la livraison",
    orange_money: "Orange Money",
    mtn_money: "MTN Mobile Money",
    card: "Carte bancaire",
    paypal: "PayPal",
  };

  return labels[method] || method || "Non défini";
};

function drawFooter(doc, pageNumber, pageCount) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setDrawColor(235, 235, 235);
  doc.line(15, height - 18, width - 15, height - 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Généré automatiquement par TryOn", 15, height - 10);
  doc.text(`Page ${pageNumber}/${pageCount}`, width - 15, height - 10, {
    align: "right",
  });
}

function drawHeader(doc, title, subtitle) {
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(227, 6, 19);
  doc.rect(0, 0, width, 34, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("TryOn", 15, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Administration e-commerce & essayage virtuel", 15, 23);

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 15, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(subtitle, 15, 60);
}

function drawKpiCard(doc, x, y, w, h, label, value, helper) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(String(label).toUpperCase(), x + 5, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(String(value), x + 5, y + 20, { maxWidth: w - 10 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(227, 6, 19);
  doc.text(String(helper || ""), x + 5, y + 30, { maxWidth: w - 10 });
}

function sectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(text, 15, y);

  doc.setDrawColor(227, 6, 19);
  doc.setLineWidth(0.8);
  doc.line(15, y + 3, 55, y + 3);
}

export function generateReportPDF(report = {}, options = {}) {
  const summary = report.summary || {};
  const stock = report.stockSummary || {};
  const reviews = report.reviewsSummary || {};
  const support = report.supportSummary || {};
  const topProducts = Array.isArray(report.topProducts) ? report.topProducts : [];
  const topClients = Array.isArray(report.topClients) ? report.topClients : [];
  const orderStatus = Array.isArray(report.orderStatus) ? report.orderStatus : [];
  const paymentMethods = Array.isArray(report.paymentMethods) ? report.paymentMethods : [];
  const salesEvolution = Array.isArray(report.salesEvolution) ? report.salesEvolution : [];

  const periodLabel = options.periodLabel || "Période sélectionnée";
  const adminName = options.adminName || "Administrateur";
  const generatedAt = new Date().toLocaleString("fr-FR");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(doc, "Rapport d'analyse", `Période : ${periodLabel} · Généré le ${generatedAt}`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Administrateur : ${adminName}`, 15, 68);

  drawKpiCard(doc, 15, 80, 42, 36, "Chiffre d'affaires", formatMoney(summary.revenue), "CA total");
  drawKpiCard(doc, 62, 80, 42, 36, "Commandes", formatNumber(summary.totalOrders), `${formatNumber(summary.deliveredOrders)} livrées`);
  drawKpiCard(doc, 109, 80, 42, 36, "Panier moyen", formatMoney(summary.averageOrder), "Par commande");
  drawKpiCard(doc, 156, 80, 42, 36, "Clients", formatNumber(summary.totalClients), "Base client");

  drawKpiCard(doc, 15, 122, 42, 36, "Produits", formatNumber(summary.totalProducts), "Catalogue");
  drawKpiCard(doc, 62, 122, 42, 36, "Stock faible", formatNumber(stock.lowStock), `${formatNumber(stock.outOfStock)} ruptures`);
  drawKpiCard(doc, 109, 122, 42, 36, "Avis", formatNumber(reviews.totalReviews), `Moy. ${Number(reviews.averageRating || 0).toFixed(1)}/5`);
  drawKpiCard(doc, 156, 122, 42, 36, "Support", formatNumber(support.totalTickets), `${formatNumber(support.openTickets)} ouverts`);

  sectionTitle(doc, "Évolution du chiffre d'affaires", 176);
  autoTable(doc, {
    startY: 184,
    head: [["Date", "Commandes", "Chiffre d'affaires"]],
    body: salesEvolution.length
      ? salesEvolution.map((item) => [safe(item.label), formatNumber(item.orders), formatMoney(item.revenue)])
      : [["Aucune donnée", "0", "0 FCFA"]],
    theme: "grid",
    headStyles: { fillColor: [227, 6, 19], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  doc.addPage();
  drawHeader(doc, "Performance commerciale", "Produits, clients, commandes et paiements");

  sectionTitle(doc, "Top produits", 74);
  autoTable(doc, {
    startY: 82,
    head: [["Produit", "Quantité vendue", "CA généré"]],
    body: topProducts.length
      ? topProducts.map((item) => [safe(item.name), formatNumber(item.quantity), formatMoney(item.revenue)])
      : [["Aucun produit vendu", "0", "0 FCFA"]],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  let y = doc.lastAutoTable.finalY + 14;
  sectionTitle(doc, "Top clients", y);
  autoTable(doc, {
    startY: y + 8,
    head: [["Client", "Email", "Commandes", "Montant dépensé"]],
    body: topClients.length
      ? topClients.map((item) => [safe(item.name, "Client"), safe(item.email), formatNumber(item.orders), formatMoney(item.totalSpent)])
      : [["Aucun client", "-", "0", "0 FCFA"]],
    theme: "grid",
    headStyles: { fillColor: [227, 6, 19], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 3 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  y = doc.lastAutoTable.finalY + 14;
  sectionTitle(doc, "Statuts des commandes", y);
  autoTable(doc, {
    startY: y + 8,
    head: [["Statut", "Total"]],
    body: orderStatus.length
      ? orderStatus.map((item) => [statusLabel(item.status), formatNumber(item.total)])
      : [["Aucune commande", "0"]],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.addPage();
  drawHeader(doc, "Finance, stock & qualité", "Paiements, disponibilité produit, support et avis");

  sectionTitle(doc, "Paiements par méthode", 74);
  autoTable(doc, {
    startY: 82,
    head: [["Méthode", "Transactions", "Montant"]],
    body: paymentMethods.length
      ? paymentMethods.map((item) => [paymentLabel(item.method), formatNumber(item.total), formatMoney(item.amount)])
      : [["Aucun paiement", "0", "0 FCFA"]],
    theme: "grid",
    headStyles: { fillColor: [227, 6, 19], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  y = doc.lastAutoTable.finalY + 16;
  sectionTitle(doc, "Santé du stock", y);
  autoTable(doc, {
    startY: y + 8,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Total produits", formatNumber(stock.totalProducts)],
      ["Produits disponibles", formatNumber(stock.availableStock)],
      ["Stock faible", formatNumber(stock.lowStock)],
      ["Rupture de stock", formatNumber(stock.outOfStock)],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = doc.lastAutoTable.finalY + 16;
  sectionTitle(doc, "Support & avis clients", y);
  autoTable(doc, {
    startY: y + 8,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Total avis", formatNumber(reviews.totalReviews)],
      ["Note moyenne", `${Number(reviews.averageRating || 0).toFixed(1)} / 5`],
      ["Avis en attente", formatNumber(reviews.pendingReviews)],
      ["Tickets ouverts", formatNumber(support.openTickets)],
      ["Tickets résolus", formatNumber(support.resolvedTickets)],
      ["Tickets fermés", formatNumber(support.closedTickets)],
    ],
    theme: "grid",
    headStyles: { fillColor: [227, 6, 19], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`rapport-tryon-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default generateReportPDF;
