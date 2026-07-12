import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./account-pages.css";

// ─── ICÔNES LUCIDE ───
import {
  Bell,
  BellDot,
  BellOff,
  Package,
  AlertTriangle,
  Star,
  ShoppingBag,
  CreditCard,
  Headphones,
  Info,
  Check,
  X,
  Trash2,
  ChevronLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';

// ─── SERVICE ───
import { notificationService } from "../../services/notificationService";

const iconMap = {
  order: Package,
  stock: AlertTriangle,
  review: Star,
  product: ShoppingBag,
  payment: CreditCard,
  support: Headphones,
  info: Info,
};

const getIcon = (type) => {
  const Icon = iconMap[type] || Info;
  return <Icon size={20} strokeWidth={1.8} />;
};

const norm = (n) => ({
  id: n.id,
  type: n.type || "info",
  title: n.title || "Notification",
  message: n.message || n.description || "",
  read: Boolean(n.read || n.isRead || n.readAt),
  date: n.createdAt || n.date || new Date().toISOString()
});

const dayLabel = (date) => {
  const d = new Date(date);
  const t = new Date();
  const y = new Date();
  y.setDate(t.getDate() - 1);
  if (Number.isNaN(d.getTime())) return "Aujourd'hui";
  if (d.toDateString() === t.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === y.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const hour = (date) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await notificationService.getNotifications();
      const payload = res?.data?.data || res?.data || [];
      setItems(Array.isArray(payload) ? payload.map(norm) : []);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => filter === "unread" ? items.filter((n) => !n.read) : items, [items, filter]);
  const grouped = useMemo(() => visible.reduce((acc, n) => {
    const k = dayLabel(n.date);
    if (!acc[k]) acc[k] = [];
    acc[k].push(n);
    return acc;
  }, {}), [visible]);
  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((p) => p.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setItems((p) => p.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="notifications-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        /* ═══════════════════════════════════════
           RESPONSIVE — NOTIFICATIONS
        ════════════════════════════════════════ */

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes skeletonPulse {
          from { background-position: 220% 0; }
          to { background-position: -220% 0; }
        }

        @media (max-width: 768px) {
          .notifications-container {
            padding: 16px 16px 80px !important;
          }
          .notifications-header h1 {
            font-size: 32px !important;
          }
          .notifications-header p {
            font-size: 13px !important;
          }
          .notifications-tabs {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .notifications-tabs button {
            padding: 11px 12px !important;
            font-size: 12px !important;
          }
          .notification-card {
            padding: 14px !important;
          }
          .notification-card .notification-icon {
            width: 40px !important;
            height: 40px !important;
          }
          .notification-card .notification-text h3 {
            font-size: 14px !important;
          }
          .notification-card .notification-text p {
            font-size: 13px !important;
          }
          .notification-card .notification-text small {
            font-size: 11px !important;
          }
          .notification-card .notification-delete {
            font-size: 12px !important;
            padding: 8px !important;
          }
        }

        @media (max-width: 640px) {
          .notifications-page {
            padding-top: 0 !important;
          }
          .notifications-container {
            padding: 12px 12px 80px !important;
          }
          .notifications-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .notifications-header .back-btn {
            width: 38px !important;
            height: 38px !important;
          }
          .notifications-header .back-btn svg {
            width: 18px !important;
            height: 18px !important;
          }
          .notifications-header h1 {
            font-size: 28px !important;
          }
          .notifications-header p {
            font-size: 12px !important;
          }
          .notifications-tabs {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            margin-bottom: 16px !important;
          }
          .notifications-tabs button {
            padding: 10px 10px !important;
            font-size: 11px !important;
            border-radius: 12px !important;
          }
          .notifications-tabs button:last-child {
            grid-column: span 2 !important;
          }
          .notifications-section-title {
            font-size: 11px !important;
            margin-bottom: 8px !important;
          }
          .notification-card {
            padding: 12px !important;
            border-radius: 14px !important;
          }
          .notification-card .notification-main {
            gap: 10px !important;
          }
          .notification-card .notification-icon {
            width: 36px !important;
            height: 36px !important;
            border-radius: 12px !important;
          }
          .notification-card .notification-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .notification-card .notification-text h3 {
            font-size: 13px !important;
          }
          .notification-card .notification-text p {
            font-size: 12px !important;
          }
          .notification-card .notification-text small {
            font-size: 10px !important;
          }
          .notification-card .unread-dot {
            width: 6px !important;
            height: 6px !important;
          }
          .notification-card .notification-delete {
            font-size: 11px !important;
            padding: 6px !important;
          }
          .notifications-empty {
            padding: 30px 16px !important;
          }
          .notifications-empty h3 {
            font-size: 18px !important;
          }
          .notifications-empty p {
            font-size: 13px !important;
          }
          .notifications-empty svg {
            width: 48px !important;
            height: 48px !important;
          }
        }

        @media (max-width: 420px) {
          .notifications-container {
            padding: 8px 8px 80px !important;
          }
          .notifications-header h1 {
            font-size: 24px !important;
          }
          .notifications-tabs button {
            padding: 8px 6px !important;
            font-size: 10px !important;
          }
          .notification-card {
            padding: 10px !important;
          }
          .notification-card .notification-main {
            gap: 8px !important;
          }
          .notification-card .notification-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .notification-card .notification-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
          .notification-card .notification-text h3 {
            font-size: 12px !important;
          }
          .notification-card .notification-text p {
            font-size: 11px !important;
          }
        }
      `}</style>

      <div className="notifications-container" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 90px' }}>

        {/* En-tête avec retour */}
        <div className="notifications-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
            cursor: 'pointer',
            boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 600, color: '#1A1A1A' }}>
              Notifications
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6A6F78', fontSize: '14px' }}>
              {unreadCount > 0 
                ? <><BellDot size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> {unreadCount} notification(s) non lue(s)</>
                : "Tout est à jour"
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="notifications-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '22px' }}>
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', background: filter === 'all' ? '#1A1A1A' : '#fff',
              borderRadius: '14px', padding: '13px 14px', fontWeight: 700,
              cursor: 'pointer', color: filter === 'all' ? '#fff' : '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Bell size={16} strokeWidth={2} />
            Toutes
          </button>
          <button
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', background: filter === 'unread' ? '#1A1A1A' : '#fff',
              borderRadius: '14px', padding: '13px 14px', fontWeight: 700,
              cursor: 'pointer', color: filter === 'unread' ? '#fff' : '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <BellDot size={16} strokeWidth={2} />
            Non lues {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={markAllRead}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
              borderRadius: '14px', padding: '13px 14px', fontWeight: 700,
              cursor: 'pointer', color: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Check size={16} strokeWidth={2} />
            Tout marquer lu
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="notifications-error" style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '14px', color: '#B91C1C', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <X size={18} strokeWidth={2} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="notifications-skeleton" style={{ display: 'grid', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: '96px', borderRadius: '18px',
                background: 'linear-gradient(90deg, #fff 0%, #f2f2f2 45%, #fff 100%)',
                backgroundSize: '220% 100%',
                animation: 'skeletonPulse 1.2s infinite linear'
              }} />
            ))}
          </div>
        )}

        {/* Vide - Message plus chaleureux */}
        {!loading && !visible.length && (
          <div className="notifications-empty" style={{
            background: '#fff', borderRadius: '18px', padding: '40px 24px',
            textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)',
            color: '#6A6F78'
          }}>
            <Bell size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <h3 style={{ margin: '8px 0 4px', color: '#1A1A1A', fontSize: '20px' }}>Aucune notification</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6A6F78' }}>
              Nous vous informerons lorsque quelque chose d'important se passera.
            </p>
          </div>
        )}

        {/* Liste des notifications */}
        {!loading && Object.entries(grouped).map(([day, list]) => (
          <section key={day} className="notifications-group" style={{ marginTop: '24px' }}>
            <h3 className="notifications-section-title" style={{
              margin: '0 0 10px 4px', fontSize: '12px',
              color: '#9CA3AF', letterSpacing: '1.6px',
              textTransform: 'uppercase', fontWeight: 800
            }}>
              {day}
            </h3>
            <div className="notifications-list" style={{ display: 'grid', gap: '12px' }}>
              {list.map((n) => (
                <article key={n.id} className={`notification-card ${!n.read ? 'unread' : ''}`} style={{
                  background: '#fff', borderRadius: '18px',
                  border: `1px solid ${!n.read ? 'rgba(227,6,19,0.24)' : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: '0 3px 16px rgba(0,0,0,0.06)',
                  overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                  <button
                    className="notification-main"
                    onClick={() => markRead(n.id)}
                    style={{
                      width: '100%', display: 'flex', gap: '14px',
                      padding: '16px', textAlign: 'left',
                      border: 0, background: 'transparent', cursor: 'pointer'
                    }}
                  >
                    <div className="notification-icon" style={{
                      width: '46px', height: '46px', borderRadius: '15px',
                      background: 'rgba(227,6,19,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      color: '#C0392B',
                    }}>
                      {getIcon(n.type)}
                    </div>
                    <div className="notification-text" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#1A1A1A' }}>{n.title}</h3>
                        {!n.read && <span className="unread-dot" style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: '#E30613', flexShrink: 0, display: 'inline-block'
                        }} />}
                      </div>
                      <p style={{ margin: '5px 0 7px', color: '#6A6F78', fontSize: '13px', lineHeight: '1.45' }}>
                        {n.message}
                      </p>
                      <small style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} strokeWidth={1.5} />
                        {hour(n.date)}
                      </small>
                    </div>
                  </button>
                  <button
                    className="notification-delete"
                    onClick={() => remove(n.id)}
                    style={{
                      width: '100%', border: 0, borderTop: '1px solid rgba(0,0,0,0.06)',
                      background: '#fff', color: '#C0392B', padding: '11px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    Supprimer
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}