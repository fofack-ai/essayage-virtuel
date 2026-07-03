import React from "react";
import Field from "../components/Field";

export default React.memo(function FaqModal({ modal, close, save, loading }) {
  const item = modal?.item || {};
  const isEdit = modal?.mode === "edit";

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box faq-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? "Modifier la FAQ" : "Ajouter une FAQ"}</h3>
          <button className="close" onClick={close}>✕</button>
        </div>

        <form className="modal-body" onSubmit={save}>
          <Field
            label="Question"
            name="question"
            defaultValue={item.question || ""}
            required
          />

          <div className="field">
            <label className="label">Réponse</label>
            <textarea
              className="input textarea"
              name="answer"
              defaultValue={item.answer || ""}
              rows="6"
              required
            />
          </div>

          <div className="form-grid">
            <Field
              label="Catégorie"
              name="category"
              defaultValue={item.category || "Général"}
            />

            <div className="field">
              <label className="label">Visibilité</label>
              <select className="select" name="active" defaultValue={item.active === false || item.active === 0 ? "false" : "true"}>
                <option value="true">Active côté client</option>
                <option value="false">Inactive / masquée</option>
              </select>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-light" onClick={close} disabled={loading}>
              Annuler
            </button>
            <button className="btn btn-red" type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
