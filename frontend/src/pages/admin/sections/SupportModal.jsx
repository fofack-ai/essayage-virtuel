import React from "react";
import Field from "../components/Field";

export default React.memo(function SupportModal({ modal, close, save, loading }) {
  const item = modal?.item || {};
  const isEdit = modal?.mode === "edit";

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-box support-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? "Modifier le ticket" : "Créer un ticket support"}</h3>
          <button className="close" onClick={close}>✕</button>
        </div>

        <form className="modal-body" onSubmit={save}>
          <div className="form-grid">
            <Field
              label="Nom du client"
              name="fullName"
              defaultValue={item.fullName || item.client || ""}
              required
            />
            <Field
              label="Email"
              type="email"
              name="email"
              defaultValue={item.email || ""}
              required
            />
          </div>

          <Field
            label="Sujet"
            name="subject"
            defaultValue={item.subject || ""}
            required
          />

          <div className="field">
            <label className="label">Message du client</label>
            <textarea
              className="input textarea"
              name="message"
              defaultValue={item.message || ""}
              rows="5"
              required
            />
          </div>

          <div className="field">
            <label className="label">Réponse de l'administrateur</label>
            <textarea
              className="input textarea"
              name="adminResponse"
              defaultValue={item.adminResponse || ""}
              rows="5"
              placeholder="Écrire la réponse à envoyer au client..."
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label className="label">Statut</label>
              <select className="select" name="status" defaultValue={item.status || "open"}>
                <option value="open">Ouvert</option>
                <option value="pending">En attente</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>

            <div className="field">
              <label className="label">Priorité</label>
              <select className="select" name="priority" defaultValue={item.priority || "medium"}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div className="card soft-card support-history-card">
              <h4>Historique du ticket</h4>
              <p className="muted">Créé le : {item.date || "-"}</p>
              {item.updatedAt && <p className="muted">Dernière mise à jour : {item.updatedAt}</p>}
              {item.adminResponse && <p className="muted">Une réponse administrateur existe déjà.</p>}
            </div>
          )}

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
