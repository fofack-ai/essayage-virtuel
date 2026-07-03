const promotionModel = require("../../models/v1/promotionModel");
const activityLogModel = require("../../models/v1/activityLogModel");
const notificationModel = require("../../models/v1/notificationModel");

function getUserName(user) {
  return user?.name || user?.fullName || "Administrateur";
}

async function getPromotions(query) {
  return promotionModel.getPromotions(query);
}

async function createPromotion(body, user) {
  if (!body.code) throw new Error("Code promo requis");
  if (!body.value) throw new Error("Valeur requise");

  const existing = await promotionModel.getPromotionByCode(body.code);

  if (existing) {
    throw new Error("Ce code promo existe déjà");
  }

  const id = await promotionModel.createPromotion({
    code: body.code.toUpperCase(),
    title: body.title,
    type: body.type || "percentage",
    value: Number(body.value),
    maxUsage: Number(body.maxUsage || 100),
    expires: body.expires || null,
    active: body.active !== false,
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Promotion créée : ${body.code}`,
    severity: "info",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "info",
    title: "Nouvelle promotion",
    message: `Le code promo ${body.code} a été créé.`,
  });

  return id;
}

async function updatePromotion(id, body, user) {
  const promotion = await promotionModel.getPromotionById(id);
  if (!promotion) throw new Error("Promotion introuvable");

  await promotionModel.updatePromotion(id, {
    code: (body.code || promotion.code).toUpperCase(),
    title: body.title || promotion.title,
    type: body.type || promotion.type,
    value: Number(body.value || promotion.value),
    maxUsage: Number(body.maxUsage || promotion.maxUsage),
    expires: body.expires || promotion.expiresAt,
    active: body.active !== undefined ? body.active : Boolean(promotion.isActive),
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Promotion modifiée : ${body.code || promotion.code}`,
    severity: "info",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "info",
    title: "Promotion modifiée",
    message: `Le code promo ${body.code || promotion.code} a été mis à jour.`,
  });
}

async function deletePromotion(id, user) {
  const promotion = await promotionModel.getPromotionById(id);
  if (!promotion) throw new Error("Promotion introuvable");

  await promotionModel.deletePromotion(id);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Promotion supprimée : ${promotion.code}`,
    severity: "warning",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "info",
    title: "Promotion supprimée",
    message: `Le code promo ${promotion.code} a été supprimé.`,
  });
}

async function togglePromotion(id, body, user) {
  const promotion = await promotionModel.getPromotionById(id);
  if (!promotion) throw new Error("Promotion introuvable");

  const active = Boolean(body.active);

  await promotionModel.togglePromotion(id, active);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Promotion ${active ? "activée" : "désactivée"} : ${promotion.code}`,
    severity: "info",
    ipAddress: null,
  });
}

module.exports = {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
};