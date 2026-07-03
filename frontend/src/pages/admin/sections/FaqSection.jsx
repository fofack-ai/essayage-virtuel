import React, { useMemo } from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

export default React.memo(function FaqSection({
  faqPage,
  faqs = [],
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
  onAdvancedSearch,
}) {
  const stats = useMemo(() => {
    return {
      total: faqs.length,
      active: faqs.filter((faq) => Boolean(faq.active)).length,
      inactive: faqs.filter((faq) => !Boolean(faq.active)).length,
      categories: new Set(faqs.map((faq) => faq.category || "Général")).size,
    };
  }, [faqs]);

  return (
    <div className="faq-admin-section">
      <div className="grid-4 support-kpis">
        <div className="card mini-stat">
          <span>Total FAQ</span>
          <strong>{stats.total}</strong>
          <small>Questions enregistrées</small>
        </div>
        <div className="card mini-stat">
          <span>Actives</span>
          <strong>{stats.active}</strong>
          <small>Visibles côté client</small>
        </div>
        <div className="card mini-stat">
          <span>Inactives</span>
          <strong>{stats.inactive}</strong>
          <small>Masquées</small>
        </div>
        <div className="card mini-stat">
          <span>Catégories</span>
          <strong>{stats.categories}</strong>
          <small>Organisation FAQ</small>
        </div>
      </div>

      <Toolbar
        filters={[["all", "Toutes les FAQ"]]}
        active="all"
        setActive={() => {}}
        button="+ Nouvelle FAQ"
        onAdd={() => openAdd("faq")}
        onAdvancedSearch={onAdvancedSearch}
      />

      <Table
        head={["Question", "Catégorie", "Statut", "Date", "Actions"]}
        cls="faq"
        rows={(faqPage?.items || []).map((faq) => [
          <div className="support-subject-cell">
            <b>{faq.question}</b>
            {faq.answer && (
              <span>{faq.answer.slice(0, 72)}{faq.answer.length > 72 ? "..." : ""}</span>
            )}
          </div>,
          faq.category || "Général",
          <span className={`badge ${faq.active ? "ok" : "warn"}`}>
            {faq.active ? "Active" : "Inactive"}
          </span>,
          faq.date || "-",
          <Actions
            view={() => openView("faq", faq)}
            edit={() => openEdit("faq", faq)}
            del={() => remove("faq", faq.id)}
          />,
        ])}
      />

      {!(faqPage?.items || []).length && (
        <div className="empty">Aucune FAQ enregistrée.</div>
      )}

      <Pagination
        current={faqPage.currentPage}
        total={faqPage.totalPages}
        onChange={(n) => setPageNumber("faq", n)}
      />
    </div>
  );
});
