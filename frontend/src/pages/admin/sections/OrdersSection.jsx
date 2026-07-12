import React from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

export default React.memo(function OrdersSection({
  ordersPage,
  orderFilter,
  setOrderFilter,
  dateFilter,
  setDateFilter,
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
  onAdvancedSearch,
}) {
  // 👇 Fonction pour archiver une commande
  const handleArchive = async (orderId) => {
    if (window.confirm("Voulez-vous vraiment archiver cette commande ?")) {
      // La fonction remove va appeler adminService.archiveOrder
      remove("order", orderId);
    }
  };

  return (
    <>
      <Toolbar
        filters={[
          ["all", "Toutes"],
          ["pending", "En cours"],
          ["delivered", "Livrées"],
          ["cancelled", "Annulées"],
          ["archived", "Archivées"], // 👈 AJOUTER LE FILTRE
        ]}
        active={orderFilter}
        setActive={setOrderFilter}
        dateFilters={[
          ["all", "Toutes les dates"],
          ["today", "Aujourd'hui"],
          ["week", "Cette semaine"],
          ["month", "Ce mois"],
        ]}
        dateActive={dateFilter}
        setDateActive={setDateFilter}
        // button="+ Nouvelle commande" ❌ SUPPRIMÉ
        // onAdd={() => openAdd("order")}
        onAdvancedSearch={onAdvancedSearch}
      />

      <Table
        head={["Commande", "Client", "Date", "Statut", "Total", "Actions"]}
        rows={ordersPage.items.map((o) => [
          o.orderNumber || o.id,
          o.client,
          o.date,
          <Badge status={o.status} />,
          fmt(o.total),
          <Actions
            view={() => openView("order", o)}
            edit={() => openEdit("order", o)}
            // 👇 MODIFIER LA SUPPRESSION POUR L'ARCHIVAGE
            del={() => handleArchive(o.id)}
            // del={() => remove("order", o.id)} ❌ ANCIEN
          />,
        ])}
      />

      <Pagination
        current={ordersPage.currentPage}
        total={ordersPage.totalPages}
        onChange={(n) => setPageNumber("commandes", n)}
      />
    </>
  );
});