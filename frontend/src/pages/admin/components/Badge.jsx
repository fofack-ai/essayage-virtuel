import React from "react";

const statusConfig = {
  pending: { 
    label: "En cours", 
    className: "badge-warning",
    color: "#e88700",
    bg: "#fff1dc"
  },
  delivered: { 
    label: "Livré", 
    className: "badge-success",
    color: "#16823a",
    bg: "#e6f7ed"
  },
  cancelled: { 
    label: "Annulé", 
    className: "badge-danger",
    color: "#e30613",
    bg: "#fde8e8"
  },
  archived: { 
    label: "Archivé", 
    className: "badge-archived",
    color: "#6b7280",
    bg: "#f3f4f6"
  },
};

export default React.memo(function Badge({ status }) {
  const config = statusConfig[status] || { 
    label: status || "Inconnu", 
    className: "badge-default",
    color: "#6b7280",
    bg: "#f3f4f6"
  };
  
  return (
    <span 
      className={`badge ${config.className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
});