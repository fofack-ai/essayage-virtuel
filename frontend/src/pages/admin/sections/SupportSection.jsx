import React, { useMemo, useState } from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";
import FaqSection from "./FaqSection";

const statusLabels = {
  open: "Ouvert",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};

const priorityLabels = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

const getStatusClass = (status) => {
  if (status === "closed" || status === "resolved") return "ok";
  if (status === "pending") return "warn";
  return "blue";
};

const getPriorityClass = (priority) => {
  if (priority === "urgent" || priority === "high") return "bad";
  if (priority === "medium") return "warn";
  return "ok";
};

export default React.memo(function SupportSection({
  supportPage,
  faqPage,
  faqs = [],
  supportFilter,
  setSupportFilter,
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
  onAdvancedSearch,
}) {
  const [tab, setTab] = useState("tickets");

  const ticketStats = useMemo(() => {
    const items = supportPage?.items || [];
    return {
      total: items.length,
      open: items.filter((ticket) => ticket.status === "open").length,
      pending: items.filter((ticket) => ticket.status === "pending").length,
      urgent: items.filter((ticket) => ticket.priority === "urgent" || ticket.priority === "high").length,
    };
  }, [supportPage]);

  return (
    <div className="support-admin-section">
      <div className="support-tabs card">
        <button
          type="button"
          className={tab === "tickets" ? "active" : ""}
          onClick={() => setTab("tickets")}
        >
          📩 Tickets Support
        </button>
        <button
          type="button"
          className={tab === "faq" ? "active" : ""}
          onClick={() => setTab("faq")}
        >
          ❓ Gestion de la FAQ
        </button>
      </div>

      {tab === "tickets" && (
        <>
          <div className="grid-4 support-kpis">
            <div className="card mini-stat">
              <span>Total tickets</span>
              <strong>{ticketStats.total}</strong>
              <small>Tickets affichés</small>
            </div>
            <div className="card mini-stat">
              <span>Ouverts</span>
              <strong>{ticketStats.open}</strong>
              <small>À traiter</small>
            </div>
            <div className="card mini-stat">
              <span>En attente</span>
              <strong>{ticketStats.pending}</strong>
              <small>Réponse en cours</small>
            </div>
            <div className="card mini-stat">
              <span>Prioritaires</span>
              <strong>{ticketStats.urgent}</strong>
              <small>Haute / urgente</small>
            </div>
          </div>

          <Toolbar
            filters={[
              ["all", "Tous"],
              ["open", "Ouverts"],
              ["pending", "En attente"],
              ["resolved", "Résolus"],
              ["closed", "Fermés"],
            ]}
            active={supportFilter}
            setActive={setSupportFilter}
            button="+ Nouveau ticket"
            onAdd={() => openAdd("support")}
            onAdvancedSearch={onAdvancedSearch}
          />

          <Table
            head={["Client", "Email", "Sujet", "Priorité", "Statut", "Date", "Actions"]}
            cls="support"
            rows={(supportPage?.items || []).map((ticket) => [
              ticket.client || ticket.fullName || "-",
              ticket.email || "-",
              <div className="support-subject-cell">
                <b>{ticket.subject}</b>
                {ticket.message && (
                  <span>{ticket.message.slice(0, 58)}{ticket.message.length > 58 ? "..." : ""}</span>
                )}
              </div>,
              <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                {priorityLabels[ticket.priority] || ticket.priority || "Moyenne"}
              </span>,
              <span className={`badge ${getStatusClass(ticket.status)}`}>
                {statusLabels[ticket.status] || ticket.status || "Ouvert"}
              </span>,
              ticket.date || "-",
              <Actions
                view={() => openView("support", ticket)}
                edit={() => openEdit("support", ticket)}
                del={() => remove("support", ticket.id)}
              />,
            ])}
          />

          {!(supportPage?.items || []).length && (
            <div className="empty">Aucun ticket support.</div>
          )}

          <Pagination
            current={supportPage.currentPage}
            total={supportPage.totalPages}
            onChange={(n) => setPageNumber("support", n)}
          />
        </>
      )}

      {tab === "faq" && (
        <FaqSection
          faqPage={faqPage}
          faqs={faqs}
          openAdd={openAdd}
          openView={openView}
          openEdit={openEdit}
          remove={remove}
          setPageNumber={setPageNumber}
          onAdvancedSearch={onAdvancedSearch}
        />
      )}
    </div>
  );
});
