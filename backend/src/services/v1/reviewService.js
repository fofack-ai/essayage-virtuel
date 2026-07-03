const reviewModel = require("../../models/v1/reviewModel");
const activityLogModel = require("../../models/v1/activityLogModel");
const notificationModel = require("../../models/v1/notificationModel");

function getUserName(user) {
  return user?.name || user?.fullName || "Administrateur";
}

async function getReviews(query) {
  return reviewModel.getReviews(query);
}

async function createReview(body, user) {
  if (!body.product) throw new Error("Produit requis");
  if (!body.client) throw new Error("Client requis");
  if (!body.comment) throw new Error("Commentaire requis");

  const id = await reviewModel.createReview({
    productId: body.productId || null,
    userId: body.userId || null,
    product: body.product,
    client: body.client,
    rating: Number(body.rating || 5),
    comment: body.comment,
    status: body.status || "pending",
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Avis créé : ${body.product}`,
    severity: "info",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "review",
    title: "Nouvel avis client",
    message: `${body.client} a laissé un avis sur ${body.product}.`,
  });

  return id;
}

async function updateReview(id, body, user) {
  const review = await reviewModel.getReviewById(id);
  if (!review) throw new Error("Avis introuvable");

  await reviewModel.updateReview(id, {
    product: body.product || review.productName,
    client: body.client || review.clientName,
    rating: Number(body.rating || review.rating || 5),
    comment: body.comment || review.comment,
    status: body.status || review.status,
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Avis modifié : ${body.product || review.productName}`,
    severity: "info",
    ipAddress: null,
  });
}

async function updateReviewStatus(id, body, user) {
  const review = await reviewModel.getReviewById(id);
  if (!review) throw new Error("Avis introuvable");

  const status = body.status;

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Statut invalide");
  }

  await reviewModel.updateReviewStatus(id, status);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Avis ${status === "approved" ? "approuvé" : status === "rejected" ? "rejeté" : "remis en attente"} : ${review.productName}`,
    severity: status === "rejected" ? "warning" : "info",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "review",
    title: "Statut d'avis mis à jour",
    message: `L'avis sur ${review.productName} est maintenant : ${status}.`,
  });
}

async function deleteReview(id, user) {
  const review = await reviewModel.getReviewById(id);
  if (!review) throw new Error("Avis introuvable");

  await reviewModel.deleteReview(id);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: `Avis supprimé : ${review.productName}`,
    severity: "warning",
    ipAddress: null,
  });
}

module.exports = {
  getReviews,
  createReview,
  updateReview,
  updateReviewStatus,
  deleteReview,
};