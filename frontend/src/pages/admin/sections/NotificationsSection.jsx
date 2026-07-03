import React from "react";
import Actions from "../components/Actions";
import Pagination from "../components/Pagination";

export default React.memo(function NotificationsSection({
  notificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  openAdd,
  openView,
  openEdit,
  remove,
  setPageNumber,
}) {
  return (
    <>
      <div className="toolbar">
        <span className="muted">Centre de gestion des notifications.</span>

        <div className="top-actions">
          <button className="btn btn-light" onClick={markAllNotificationsRead}>
            📬 Tout marquer comme lu
          </button>

          <button
            className="btn btn-primary"
            onClick={() => openAdd("notification")}
          >
            + Nouvelle notification
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notificationsPage.items.map((n) => (
          <div
            className={`card notification-item ${n.read ? "read" : "unread"}`}
            key={n.id}
          >
            <div className="notif-header">
              <span className="notif-type">
                {n.type === "order"
                  ? "📦"
                  : n.type === "stock"
                  ? "⚠️"
                  : n.type === "client"
                  ? "👤"
                  : n.type === "review"
                  ? "⭐"
                  : "📬"}
              </span>

              <div className="notif-content">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <span className="notif-date">{n.date}</span>
              </div>

              <div className="notif-actions">
                {!n.read && (
                  <button
                    className="btn btn-light"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Marquer lu
                  </button>
                )}

                <Actions
                  view={() => openView("notification", n)}
                  edit={() => openEdit("notification", n)}
                  del={() => remove("notification", n.id)}
                />
              </div>
            </div>
          </div>
        ))}

        {!notificationsPage.items.length && (
          <div className="empty">Aucune notification.</div>
        )}
      </div>

      <Pagination
        current={notificationsPage.currentPage}
        total={notificationsPage.totalPages}
        onChange={(n) => setPageNumber("notifications", n)}
      />
    </>
  );
});