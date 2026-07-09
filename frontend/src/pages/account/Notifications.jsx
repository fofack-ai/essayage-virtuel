import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import "./account-pages.css";

const icon = (type) => ({ order:"🛍️", stock:"📦", review:"⭐", product:"👗", payment:"💳", support:"🎧", info:"🔔" }[type] || "🔔");
const norm = (n) => ({ id:n.id, type:n.type || "info", title:n.title || "Notification", message:n.message || n.description || "", read:Boolean(n.read || n.isRead || n.readAt), date:n.createdAt || n.date || new Date().toISOString() });
const dayLabel = (date) => { const d=new Date(date), t=new Date(), y=new Date(); y.setDate(t.getDate()-1); if(Number.isNaN(d.getTime())) return "Aujourd'hui"; if(d.toDateString()===t.toDateString()) return "Aujourd'hui"; if(d.toDateString()===y.toDateString()) return "Hier"; return d.toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" }); };
const hour = (date) => { const d=new Date(date); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }); };

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const res = await adminService.getNotifications();
      const payload = res?.data?.data || res?.data || [];
      setItems(Array.isArray(payload) ? payload.map(norm) : []);
    } catch (e) {
      console.error(e); setError("Impossible de charger les notifications.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => filter === "unread" ? items.filter((n)=>!n.read) : items, [items, filter]);
  const grouped = useMemo(() => visible.reduce((acc,n)=>{ const k=dayLabel(n.date); (acc[k] ||= []).push(n); return acc; }, {}), [visible]);
  const unreadCount = items.filter((n)=>!n.read).length;

  const markRead = async (id) => { try { await adminService.markNotificationRead(id); setItems((p)=>p.map((n)=>n.id===id?{...n,read:true}:n)); } catch(e){ console.error(e); } };
  const markAllRead = async () => { try { await adminService.markAllNotificationsRead(); setItems((p)=>p.map((n)=>({...n,read:true}))); } catch(e){ console.error(e); } };
  const remove = async (id) => { try { await adminService.deleteNotification(id); setItems((p)=>p.filter((n)=>n.id!==id)); } catch(e){ console.error(e); } };

  return (
    <div className="notifications-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        /* ═══════════════════════════════════════
           RESPONSIVE — NOTIFICATIONS
        ════════════════════════════════════════ */

        /* ─── TABLETTE ─── */
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
            font-size: 18px !important;
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

        /* ─── MOBILE ─── */
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
            font-size: 18px !important;
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
            font-size: 16px !important;
            border-radius: 12px !important;
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
        }

        /* ─── TRÈS PETIT ÉCRAN (iPhone SE) ─── */
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
            font-size: 14px !important;
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
        
        {/* En-tête */}
        <div className="notifications-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{
            width: '44px', height: '44px', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
            cursor: 'pointer', fontSize: '22px',
            boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 600, color: '#1A1A1A' }}>
              Notifications
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6A6F78', fontSize: '14px' }}>
              {unreadCount ? `${unreadCount} notification(s) non lue(s)` : "Tout est à jour"}
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
              cursor: 'pointer', color: filter === 'all' ? '#fff' : '#1A1A1A'
            }}
          >
            Toutes
          </button>
          <button 
            className={filter === "unread" ? "active" : ""} 
            onClick={() => setFilter("unread")}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', background: filter === 'unread' ? '#1A1A1A' : '#fff',
              borderRadius: '14px', padding: '13px 14px', fontWeight: 700,
              cursor: 'pointer', color: filter === 'unread' ? '#fff' : '#1A1A1A'
            }}
          >
            Non lues {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button 
            onClick={markAllRead}
            style={{
              border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
              borderRadius: '14px', padding: '13px 14px', fontWeight: 700,
              cursor: 'pointer', color: '#1A1A1A'
            }}
          >
            Tout marquer lu
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="notifications-error" style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '14px', color: '#B91C1C', fontSize: '14px'
          }}>
            ⚠️ {error}
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
            <style>{`
              @keyframes skeletonPulse {
                from { background-position: 220% 0; }
                to { background-position: -220% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Vide */}
        {!loading && !visible.length && (
          <div className="notifications-empty" style={{
            background: '#fff', borderRadius: '18px', padding: '24px',
            textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)',
            color: '#6A6F78'
          }}>
            <div style={{ fontSize: '38px' }}>🔔</div>
            <h3 style={{ margin: '8px 0 4px', color: '#1A1A1A', fontSize: '20px' }}>Aucune notification</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6A6F78' }}>Les informations importantes apparaîtront ici.</p>
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
                      display: 'grid', placeItems: 'center',
                      fontSize: '21px', flexShrink: 0
                    }}>
                      {icon(n.type)}
                    </div>
                    <div className="notification-text" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#1A1A1A' }}>{n.title}</h3>
                        {!n.read && <span className="unread-dot" style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: '#E30613', flexShrink: 0
                        }} />}
                      </div>
                      <p style={{ margin: '5px 0 7px', color: '#6A6F78', fontSize: '13px', lineHeight: '1.45' }}>
                        {n.message}
                      </p>
                      <small style={{ color: '#9CA3AF', fontSize: '12px' }}>{hour(n.date)}</small>
                    </div>
                  </button>
                  <button 
                    className="notification-delete" 
                    onClick={() => remove(n.id)}
                    style={{
                      width: '100%', border: 0, borderTop: '1px solid rgba(0,0,0,0.06)',
                      background: '#fff', color: '#C0392B', padding: '11px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '13px'
                    }}
                  >
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