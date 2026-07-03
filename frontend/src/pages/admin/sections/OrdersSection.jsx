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
  return (
    <>
      <Toolbar
        filters={[
          ["all", "Toutes"],
          ["pending", "En cours"],
          ["delivered", "Livrées"],
          ["cancelled", "Annulées"],
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
        button="+ Nouvelle commande"
        onAdd={() => openAdd("order")}
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
            del={() => remove("order", o.id)}
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