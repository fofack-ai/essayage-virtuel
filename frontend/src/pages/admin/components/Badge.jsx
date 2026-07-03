import React from "react";

const statusText = {
  pending: "En cours",
  delivered: "Livré",
  cancelled: "Annulé",
};

export default React.memo(function Badge({ status }) {
  return (
    <span
      className={`badge ${
        status === "delivered" ? "ok" : status === "pending" ? "warn" : "bad"
      }`}
    >
      {statusText[status] || status}
    </span>
  );
});