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

  // 👇 Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // 👇 Fonction pour transformer les données de l'API
  const transformNotification = (notification) => ({
    id: notification.id || notification.notificationId,
    type: notification.type || 'info',
    title: notification.title || 'Notification',
    message: notification.message || '',
    date: notification.date || formatDate(notification.createdAt),
    read: notification.isRead || notification.read || false,
    createdAt: notification.createdAt,
    adminId: notification.adminId
  });

  const items = notificationsPage.items?.map(transformNotification) || [];
  const hasItems = items.length > 0;

  return (
    <>
      <div className="toolbar">
        <span className="muted">Centre de gestion des notifications.</span>

        <div className="top-actions">
          <button className="btn btn-light" onClick={markAllNotificationsRead}>
            <MailCheck size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {hasItems ? (
          items.map((n) => (
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
                    del={() => remove("notification", n.id)}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Aucune notification.</div>
        )}
      </div>

      <Pagination
        current={notificationsPage.currentPage || 1}
        total={notificationsPage.totalPages || 1}
        onChange={(n) => setPageNumber("notifications", n)}
      />
    </>
  );
});