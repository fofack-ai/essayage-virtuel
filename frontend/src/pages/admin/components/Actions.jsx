import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

export default React.memo(function Actions({ view, edit, del }) {
  return (
    <div className="actions">
      {view && (
        <button className="icon-btn view" title="Voir" onClick={view}>
          <Eye size={14} />
        </button>
      )}

      {edit && (
        <button className="icon-btn" title="Modifier" onClick={edit}>
          <Edit size={14} />
        </button>
      )}

      {del && (
        <button className="icon-btn danger" title="Supprimer" onClick={del}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
});