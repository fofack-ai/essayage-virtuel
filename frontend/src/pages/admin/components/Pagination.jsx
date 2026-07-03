import React from "react";

export default React.memo(function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ←
      </button>

      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          className={`page-btn ${current === index + 1 ? "active" : ""}`}
          onClick={() => onChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        →
      </button>
    </div>
  );
});