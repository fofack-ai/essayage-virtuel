import React from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const formatPromotionValue = (promotion) => {
  const value = Number(promotion.value || 0);

  if (promotion.type === "fixed") {
    return `${value.toLocaleString("fr-FR")} FCFA`;
  }

  return `${value}%`;
};

export default React.memo(function PromotionsSection({
  promotionsPage,
  promoFilter,
  setPromoFilter,
  openAdd,
  openView,
  openEdit,
  remove,
  togglePromotionStatus,
  setPageNumber,
}) {
  return (
    <>
      <Toolbar
        filters={[
          ["all", "Toutes"],
          ["active", "Actives"],
          ["inactive", "Inactives"],
        ]}
        active={promoFilter}
        setActive={setPromoFilter}
        button="+ Nouvelle promotion"
        onAdd={() => openAdd("promotion")}
      />

      <Table
        head={["Code", "Titre", "Type", "Valeur", "Utilisation", "Expiration", "Statut", "Actions"]}
        cls="promotions"
        rows={promotionsPage.items.map((promotion) => [
          <strong>{promotion.code}</strong>,
          promotion.title || "-",
          promotion.type === "fixed" ? "Montant fixe" : "Pourcentage",
          formatPromotionValue(promotion),
          `${Number(promotion.usedCount || 0)} / ${Number(promotion.maxUsage || 0)}`,
          promotion.expires || "Aucune date",
          <span className={`badge ${promotion.active ? "ok" : "bad"}`}>
            {promotion.active ? "Active" : "Inactive"}
          </span>,
          <div className="actions">
            <Actions
              view={() => openView("promotion", promotion)}
              edit={() => openEdit("promotion", promotion)}
              del={() => remove("promotion", promotion.id)}
            />
            <button
              type="button"
              className={`icon-btn ${promotion.active ? "danger" : "view"}`}
              title={promotion.active ? "Désactiver" : "Activer"}
              onClick={() => togglePromotionStatus?.(promotion)}
            >
              {promotion.active ? "⏸️" : "▶️"}
            </button>
          </div>,
        ])}
      />

      <Pagination
        current={promotionsPage.currentPage}
        total={promotionsPage.totalPages}
        onChange={(n) => setPageNumber("promotions", n)}
      />
    </>
  );
});
