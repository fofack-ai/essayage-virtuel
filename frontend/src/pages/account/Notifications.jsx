import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

export default function Notifications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentLang = i18n.language?.slice(0, 2) || 'fr';

  const dayLabel = (date) => {
    const d = new Date(date);
    const tToday = new Date();
    const yYesterday = new Date();
    yYesterday.setDate(tToday.getDate() - 1);
    
    if (Number.isNaN(d.getTime())) return t('notifications.date.today', "Aujourd'hui");
    if (d.toDateString() === tToday.toDateString()) return t('notifications.date.today', "Aujourd'hui");
    if (d.toDateString() === yYesterday.toDateString()) return t('notifications.date.yesterday', "Hier");
    
    return d.toLocaleDateString(currentLang === 'fr' ? "fr-FR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const hour = (date) => {
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(currentLang === 'fr' ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await notificationService.getNotifications();
      const payload = res?.data?.data || res?.data || [];
      setItems(Array.isArray(payload) ? payload.map(norm) : []);
    } catch (e) {
      console.error(e);
      setError(t('notifications.errorLoad', 'Impossible de charger les notifications.'));
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
          <button className="back-btn" onClick={() => navigate(-1)} style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', boxShadow: '0 3px 14px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 600, color: '#1A1A1A' }}>
              {t('notifications.title', 'Notifications')}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6A6F78', fontSize: '14px' }}>
              {unreadCount > 0 ? (
                <>
                  <BellDot size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  {t('notifications.unreadCount', '{{count}} notification(s) non lue(s)', { count: unreadCount })}
                </>
              ) : (
                t('notifications.upToDate', 'Tout est à jour')
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="notifications-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '22px' }}>
          <button 
            className={filter === "all" ? "active" : ""} 
            onClick={() => setFilter("all")} 
            style={{ 
              border: '1px solid rgba(0,0,0,0.08)', 
              background: filter === 'all' ? '#1A1A1A' : '#fff', 
              borderRadius: '14px', 
              padding: '13px 14px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              color: filter === 'all' ? '#fff' : '#1A1A1A', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
            }}
          >
            <Bell size={16} strokeWidth={2} />
            {t('notifications.filter.all', 'Toutes')}
          </button>

          <button 
            className={filter === "unread" ? "active" : ""} 
            onClick={() => setFilter("unread")} 
            style={{ 
              border: '1px solid rgba(0,0,0,0.08)', 
              background: filter === 'unread' ? '#1A1A1A' : '#fff', 
              borderRadius: '14px', 
              padding: '13px 14px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              color: filter === 'unread' ? '#fff' : '#1A1A1A', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
            }}
          >
            <BellOff size={16} strokeWidth={2} />
            {t('notifications.filter.unread', 'Non lues')}
          </button>

          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              style={{ 
                border: 0, 
                background: 'transparent', 
                color: '#355C86', 
                fontWeight: 700, 
                fontSize: '13px', 
                cursor: 'pointer', 
                padding: '0 8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <Check size={16} strokeWidth={2} />
              {t('notifications.action.markAllRead', 'Tout lire')}
            </button>
          )}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px' }}>
            <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#1A1A1A' }} />
            <p style={{ margin: 0, color: '#6A6F78', fontSize: '14px' }}>{t('notifications.loading', 'Chargement de vos notifications…')}</p>
          </div>
        ) : error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="notifications-empty" style={{ background: '#fff', borderRadius: '20px', padding: '50px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#9CA3AF' }}>
              <BellOff size={28} strokeWidth={1.8} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#1A1A1A' }}>
              {t('notifications.empty.title', 'Aucune notification')}
            </h3>
            <p style={{ margin: 0, color: '#6A6F78', fontSize: '14px', lineHeight: '1.5' }}>
              {filter === "unread" 
                ? t('notifications.empty.unreadDesc', 'Vous n’avez aucune notification non lue.') 
                : t('notifications.empty.allDesc', 'Vos notifications s’afficheront ici au fur et à mesure.')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(grouped).map(([day, list]) => (
              <div key={day}>
                <h2 className="notifications-section-title" style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '1px' }}>
                  {day}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {list.map((n) => (
                    <article 
                      key={n.id} 
                      className={`notification-card ${n.read ? "read" : "unread"}`} 
                      style={{ 
                        background: '#fff', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
                        border: n.read ? '1.5px solid transparent' : '1.5px solid #1A1A1A' 
                      }}
                    >
                      <button 
                        onClick={() => !n.read && markRead(n.id)} 
                        disabled={n.read}
                        style={{ 
                          width: '100%', 
                          background: 'none', 
                          border: 0, 
                          textAlign: 'left', 
                          padding: '16px', 
                          cursor: n.read ? 'default' : 'pointer', 
                          display: 'block' 
                        }}
                      >
                        <div className="notification-main" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <div className="notification-icon" style={{ width: '44px', height: '44px', borderRadius: '14px', background: n.read ? '#F0F2F5' : 'rgba(26,26,26,0.05)', color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {getIcon(n.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }} className="notification-text">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {n.title}
                              </h3>
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
                        {t('notifications.action.delete', 'Supprimer')}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}