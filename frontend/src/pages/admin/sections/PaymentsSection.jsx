import React from "react";
import Kpi from "../components/Kpi";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

const fmt = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

export default React.memo(function PaymentsSection({
  transactions,
  transactionsPage,
  openView,
  openEdit,
  remove,
  setPageNumber,
}) {
  return (
    <>
      <div className="payment-summary">
        <Kpi
          label="Total transactions"
          value={transactions.length}
          change="Commandes enregistrées"
        />

        <Kpi
          label="Montant total"
          value={fmt(
            transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
          )}
          change="Total encaissable"
        />

        <Kpi
          label="Confirmées"
          value={transactions.filter((t) => t.status === "paid").length}
          change="Paiements validés"
        />

        <Kpi
          label="En attente"
          value={transactions.filter((t) => t.status === "pending").length}
          change="Paiements à suivre"
        />
      </div>

      <Table
        head={["Transaction", "Commande", "Montant", "Méthode", "Statut", "Actions"]}
        cls="transactions"
        rows={transactionsPage.items.map((t) => [
          t.id,
          t.orderNumber || "-",
          fmt(t.amount),
          t.method,
          <span className={`badge ${t.status === "paid" ? "ok" : "warn"}`}>
            {t.status === "paid" ? "Payé" : "En attente"}
          </span>,
          <Actions
            view={() => openView("transaction", t)}
            edit={() => openEdit("transaction", t)}
            del={() => remove("transaction", t.id)}
          />,
        ])}
      />

      <Pagination
        current={transactionsPage.currentPage}
        total={transactionsPage.totalPages}
        onChange={(n) => setPageNumber("transactions", n)}
      />
    </>
  );
});