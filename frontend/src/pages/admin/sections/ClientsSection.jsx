import React from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

export default React.memo(function ClientsSection({
  clientsPage,
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
        filters={[["all", "Tous"]]}
        active="all"
        setActive={() => {}}
        button="+ Nouveau client"
        onAdd={() => openAdd("client")}
        onAdvancedSearch={onAdvancedSearch}
      />

      <Table
        head={["Client", "Email", "Ville", "Commandes", "Dépenses", "Actions"]}
        cls="clients-row"
        rows={clientsPage.items.map((c) => [
          c.name,
          c.email,
          c.city,
          c.orders,
          fmt(c.totalSpent),
          <Actions
            view={() => openView("client", c)}
            edit={() => openEdit("client", c)}
            del={() => remove("client", c.id)}
          />,
        ])}
      />

      <Pagination
        current={clientsPage.currentPage}
        total={clientsPage.totalPages}
        onChange={(n) => setPageNumber("clients", n)}
      />
    </>
  );
});