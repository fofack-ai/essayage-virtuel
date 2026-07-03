const reportModel = require("../../models/v1/reportModel");

async function getOverview(query) {
  const period = query.period || "month";

  const [
    summary,
    salesEvolution,
    topProducts,
    topClients,
    orderStatus,
    paymentMethods,
    stockSummary,
    reviewsSummary,
    supportSummary,
  ] = await Promise.all([
    reportModel.getSummary(period),
    reportModel.getSalesEvolution(period),
    reportModel.getTopProducts(period),
    reportModel.getTopClients(period),
    reportModel.getOrderStatus(period),
    reportModel.getPaymentMethods(period),
    reportModel.getStockSummary(),
    reportModel.getReviewsSummary(),
    reportModel.getSupportSummary(),
  ]);

  return {
    period,
    summary,
    salesEvolution,
    topProducts,
    topClients,
    orderStatus,
    paymentMethods,
    stockSummary,
    reviewsSummary,
    supportSummary,
  };
}

module.exports = {
  getOverview,
};