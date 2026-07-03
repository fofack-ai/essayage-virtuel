import React from "react";

export default React.memo(function Table({ head, rows, cls = "" }) {
  return (
    <div className="card table-card">
      <div className="table">
        <div className={`row head ${cls}`}>
          {head.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {rows.map((r, i) => (
          <div className={`row ${cls}`} key={i}>
            {r.map((c, j) => (
              <span key={j}>{c}</span>
            ))}
          </div>
        ))}

        {!rows.length && <div className="empty">Aucune donnée.</div>}
      </div>
    </div>
  );
});