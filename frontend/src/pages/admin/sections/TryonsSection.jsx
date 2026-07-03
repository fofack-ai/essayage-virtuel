import React from "react";
import Table from "../components/Table";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

export default React.memo(function TryonsSection({
  tryonsPage,
  openView,
  openEdit,
  remove,
  setPageNumber,
}) {
  return (
    <>
      <Table
        head={["Client", "Produit", "Score IA", "Date", "Actions"]}
        cls="tries-row"
        rows={tryonsPage.items.map((t) => [
          t.client,
          t.product,
          `${t.score}%`,
          t.date,
          <Actions
            view={() => openView("tryon", t)}
            edit={() => openEdit("tryon", t)}
            del={() => remove("tryon", t.id)}
          />,
        ])}
      />

      <Pagination
        current={tryonsPage.currentPage}
        total={tryonsPage.totalPages}
        onChange={(n) => setPageNumber("essayages", n)}
      />
    </>
  );
});