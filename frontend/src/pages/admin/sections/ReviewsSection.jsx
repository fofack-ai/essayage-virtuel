import React from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const statusLabel = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const statusClass = {
  pending: "warn",
  approved: "ok",
  rejected: "bad",
};

export default React.memo(function ReviewsSection({
  reviewsPage,
  reviewFilter,
  setReviewFilter,
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
  onAdvancedSearch,
  updateReviewStatus,
}) {
  return (
    <>
      <Toolbar
        filters={[
          ["all", "Tous"],
          ["pending", "En attente"],
          ["approved", "Approuvés"],
          ["rejected", "Rejetés"],
        ]}
        active={reviewFilter}
        setActive={setReviewFilter}
        button="+ Nouvel avis"
        onAdd={() => openAdd("review")}
        extra={
          onAdvancedSearch && (
            <button className="btn btn-light" onClick={onAdvancedSearch}>
              🔍 Recherche avancée
            </button>
          )
        }
      />

      <Table
        head={["Produit", "Client", "Note", "Commentaire", "Statut", "Actions"]}
        cls="reviews"
        rows={reviewsPage.items.map((review) => [
          review.product,
          review.client,
          <span className="review-rating">{"⭐".repeat(Number(review.rating || 0))}</span>,
          <span className="comment-preview">{review.comment}</span>,
          <span className={`badge ${statusClass[review.status] || "warn"}`}>
            {statusLabel[review.status] || review.status}
          </span>,
          <div className="actions review-actions">
            {review.status !== "approved" && (
              <button
                className="icon-btn success"
                title="Approuver"
                onClick={() => updateReviewStatus?.(review, "approved")}
              >
                ✅
              </button>
            )}
            {review.status !== "rejected" && (
              <button
                className="icon-btn warning"
                title="Rejeter"
                onClick={() => updateReviewStatus?.(review, "rejected")}
              >
                🚫
              </button>
            )}
            <Actions
              view={() => openView("review", review)}
              edit={() => openEdit("review", review)}
              del={() => remove("review", review.id)}
            />
          </div>,
        ])}
      />

      <Pagination
        current={reviewsPage.currentPage}
        total={reviewsPage.totalPages}
        onChange={(n) => setPageNumber("reviews", n)}
      />
    </>
  );
});
