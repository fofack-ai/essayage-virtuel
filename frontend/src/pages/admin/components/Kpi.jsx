import React from "react";

export default React.memo(function Kpi({ label, value, change }) {
  return (
    <div className="card kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-change">{change}</div>
    </div>
  );
});