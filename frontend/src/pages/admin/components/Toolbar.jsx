import React from "react";

export default React.memo(function Toolbar({
  filters,
  active,
  setActive,
  dateFilters,
  dateActive,
  setDateActive,
  button,
  onAdd,
  onAdvancedSearch,
}) {
  return (
    <div className="toolbar">
      <div className="filter-row">
        {filters.map(([k, l]) => (
          <button
            key={k}
            className={`chip ${active === k ? "active" : ""}`}
            onClick={() => setActive(k)}
          >
            {l}
          </button>
        ))}

        {dateFilters && dateActive !== undefined && setDateActive && (
          <>
            <span className="chip disabled">|</span>

            {dateFilters.map(([k, l]) => (
              <button
                key={k}
                className={`chip ${dateActive === k ? "active" : ""}`}
                onClick={() => setDateActive(k)}
              >
                {l}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="toolbar-actions">
        {onAdvancedSearch && (
          <button className="btn btn-light" onClick={onAdvancedSearch}>
            🔍 Recherche avancée
          </button>
        )}

        {button && (
          <button className="btn btn-primary" onClick={onAdd}>
            {button}
          </button>
        )}
      </div>
    </div>
  );
});