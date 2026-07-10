import React from "react";
import { MailCheck, Package, AlertTriangle, User, Star, Bell } from "lucide-react";
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
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <Package size={18} />;
      case "stock":
        return <AlertTriangle size={18} />;
      case "client":
        return <User size={18} />;
      case "review":
        return <Star size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  return (
    <>
      <div className="toolbar">
        <span className="muted">Centre de gestion des notifications.</span>

        <div className="top-actions">
          <button className="btn btn-light" onClick={markAllNotificationsRead}>
            <MailCheck size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Tout marquer comme lu
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
                {getNotificationIcon(n.type)}
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