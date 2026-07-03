import React from "react";
import Toolbar from "../components/Toolbar";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

export default React.memo(function LogsSection({
  logsPage,
  logFilter,
  setLogFilter,
  openView,
  remove,
  setPageNumber,
}) {
  return (
    <>
      <Toolbar
        filters={[
          ["all", "Tous"],
          ["info", "Info"],
          ["warning", "Avertissement"],
          ["critical", "Critique"],
        ]}
        active={logFilter}
        setActive={setLogFilter}
      />

      <Table
        head={["Utilisateur", "Action", "IP", "Date", "Sévérité", "Actions"]}
        cls="logs"
        rows={logsPage.items.map((log) => [
          log.user || "-",
          log.action || "-",
          log.ip || "-",
          log.date || "-",
          <span
            className={`badge ${
              log.severity === "critical"
                ? "bad"
                : log.severity === "warning"
                ? "warn"
                : "blue"
            }`}
          >
            {log.severity === "critical"
              ? "Critique"
              : log.severity === "warning"
              ? "Avertissement"
              : "Info"}
          </span>,
          <Actions
            view={() => openView("log", log)}
            del={() => remove("log", log.id)}
          />,
        ])}
      />

      <Pagination
        current={logsPage.currentPage}
        total={logsPage.totalPages}
        onChange={(n) => setPageNumber("logs", n)}
      />
    </>
  );
});