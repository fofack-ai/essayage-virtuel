import React from "react";

export default React.memo(function Actions({ view, edit, del }) {
  return (
    <div className="actions">
      {view && (
        <button className="icon-btn view" title="Voir" onClick={view}>
          👁️
        </button>
      )}

      {edit && (
        <button className="icon-btn" title="Modifier" onClick={edit}>
          ✏️
        </button>
      )}

      {del && (
        <button className="icon-btn danger" title="Supprimer" onClick={del}>
          🗑️
        </button>
      )}
    </div>
  );
});