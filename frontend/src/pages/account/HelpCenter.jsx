import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Ajout de useTranslation
import { adminService } from "../../services/adminService";
import "./account-pages.css";
import MobileHeader from '../../components/layout/MobileHeader';

// ─── ICÔNES LUCIDE ───
import {
  ChevronLeft,
  Search,
  Package,
  Truck,
  CreditCard,
  Sparkles,
  Undo2,
  User,
  HelpCircle,
  X,
  Check,
  Send,
  AlertCircle,
  Headphones,
  MessageCircle,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react';

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`} style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid rgba(0,0,0,0.06)',
      overflow: 'hidden', boxShadow: '0 3px 16px rgba(0,0,0,0.05)'
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        gap: '14px', padding: '17px 18px', border: 0,
        background: '#fff', cursor: 'pointer', fontWeight: 800,
        textAlign: 'left', color: '#1A1A1A', fontSize: '14px'
      }}>
        <span>{item.question}</span>
        {open ? <Minus size={20} color="#E30613" /> : <Plus size={20} color="#E30613" />}
      </button>
      {open && (
        <p style={{
          margin: 0, padding: '0 18px 18px',
          color: '#6A6F78', fontSize: '14px', lineHeight: '1.6'
        }}>
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialisation de i18n
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", priority: "medium" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Traduction dynamique des catégories de recherche
  const categories = useMemo(() => [
    { icon: Package, label: t("helpCenter.categories.commandes.label"), desc: t("helpCenter.categories.commandes.desc") },
    { icon: Truck, label: t("helpCenter.categories.livraison.label"), desc: t("helpCenter.categories.livraison.desc") },
    { icon: CreditCard, label: t("helpCenter.categories.paiement.label"), desc: t("helpCenter.categories.paiement.desc") },
    { icon: Sparkles, label: t("helpCenter.categories.essayage.label"), desc: t("helpCenter.categories.essayage.desc") },
    { icon: Undo2, label: t("helpCenter.categories.retours.label"), desc: t("helpCenter.categories.retours.desc") },
    { icon: User, label: t("helpCenter.categories.compte.label"), desc: t("helpCenter.categories.compte.desc") }
  ], [t]);

  // Traduction dynamique des FAQs
  const faqs = useMemo(() => [
    { category: t("helpCenter.faqs.q1.category"), question: t("helpCenter.faqs.q1.question"), answer: t("helpCenter.faqs.q1.answer") },
    { category: t("helpCenter.faqs.q2.category"), question: t("helpCenter.faqs.q2.question"), answer: t("helpCenter.faqs.q2.answer") },
    { category: t("helpCenter.faqs.q3.category"), question: t("helpCenter.faqs.q3.question"), answer: t("helpCenter.faqs.q3.answer") },
    { category: t("helpCenter.faqs.q4.category"), question: t("helpCenter.faqs.q4.question"), answer: t("helpCenter.faqs.q4.answer") },
    { category: t("helpCenter.faqs.q5.category"), question: t("helpCenter.faqs.q5.question"), answer: t("helpCenter.faqs.q5.answer") },
    { category: t("helpCenter.faqs.q6.category"), question: t("helpCenter.faqs.q6.question"), answer: t("helpCenter.faqs.q6.answer") }
  ], [t]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => `${f.category} ${f.question} ${f.answer}`.toLowerCase().includes(q));
  }, [search, faqs]);

  const submitTicket = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setError("");
      setSuccess("");
      await adminService.createSupportTicket({
        subject: form.subject,
        message: form.message,
        priority: form.priority,
        status: "open"
      });
      setSuccess(t("helpCenter.alerts.success"));
      setModalOpen(false);
      setForm({ subject: "", message: "", priority: "medium" });
    } catch (e) {
      console.error(e);
      setError(t("helpCenter.alerts.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="help-center-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F0F2F5' }}>
      <MobileHeader />
      <style>{`
        /* ═══════════════════════════════════════
           RESPONSIVE — CENTRE D'AIDE
        ════════════════════════════════════════ */

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner { animation: spin 1s linear infinite; }

        @media (max-width: 900px) {
          .help-center-container { padding: 16px 16px 80px !important; }
          .help-center-header h1 { font-size: 32px !important; }
          .help-center-header p { font-size: 13px !important; }
          .help-center-hero { padding: 24px !important; }
          .help-center-hero h2 { font-size: 28px !important; }
          .help-category-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        }

        @media (max-width: 640px) {
          .help-center-page { padding-top: 0 !important; }
          .help-center-container { padding: 12px 12px 80px !important; }
          .help-center-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; margin-bottom: 16px !important; }
          .help-center-header .back-btn { width: 38px !important; height: 38px !important; }
          .help-center-header .back-btn svg { width: 18px !important; height: 18px !important; }
          .help-center-header h1 { font-size: 28px !important; }
          .help-center-header p { font-size: 12px !important; }
          .help-center-hero { padding: 18px 16px !important; border-radius: 16px !important; }
          .help-center-hero h2 { font-size: 22px !important; }
          .help-center-hero .help-search { padding: 0 12px !important; }
          .help-center-hero .help-search input { height: 44px !important; font-size: 14px !important; }
          .help-center-hero .help-search .search-icon { font-size: 16px !important; }
          .help-category-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .help-category-grid button { padding: 14px 10px !important; border-radius: 14px !important; }
          .help-category-grid button .cat-icon { font-size: 20px !important; margin-bottom: 6px !important; }
          .help-category-grid button .cat-icon svg { width: 20px !important; height: 20px !important; }
          .help-category-grid button h3 { font-size: 13px !important; }
          .help-category-grid button p { font-size: 11px !important; }
          .help-section-title { font-size: 11px !important; margin: 20px 0 10px !important; }
          .faq-item button { padding: 14px 14px !important; font-size: 13px !important; }
          .faq-item button svg { width: 18px !important; height: 18px !important; }
          .faq-item p { padding: 0 14px 14px !important; font-size: 13px !important; }
          .help-contact-card { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; padding: 18px !important; margin-top: 20px !important; }
          .help-contact-card h3 { font-size: 16px !important; }
          .help-contact-card p { font-size: 13px !important; }
          .help-contact-card button { width: 100% !important; padding: 14px !important; font-size: 13px !important; }
          .help-modal-overlay { padding: 12px !important; align-items: flex-end !important; }
          .help-modal { padding: 20px !important; border-radius: 20px 20px 0 0 !important; }
          .help-modal-head h3 { font-size: 20px !important; }
          .help-modal-head button { width: 32px !important; height: 32px !important; }
          .help-modal-head button svg { width: 18px !important; height: 18px !important; }
          .help-modal form { gap: 10px !important; }
          .help-modal label { font-size: 11px !important; }
          .help-modal input, .help-modal select, .help-modal textarea { padding: 10px 12px !important; font-size: 13px !important; border-radius: 12px !important; }
          .help-modal textarea { min-height: 100px !important; }
          .help-modal button[type="submit"] { padding: 14px !important; font-size: 13px !important; }
        }

        @media (max-width: 420px) {
          .help-center-container { padding: 8px 8px 80px !important; }
          .help-center-hero { padding: 14px 12px !important; }
          .help-center-hero h2 { font-size: 18px !important; }
          .help-center-hero .help-search input { height: 38px !important; font-size: 12px !important; }
          .help-category-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .help-category-grid button { padding: 12px 10px !important; }
          .help-category-grid button .cat-icon { font-size: 18px !important; }
          .help-category-grid button .cat-icon svg { width: 18px !important; height: 18px !important; }
          .help-category-grid button h3 { font-size: 12px !important; }
          .help-category-grid button p { font-size: 10px !important; }
          .faq-item button { padding: 12px 12px !important; font-size: 12px !important; }
          .faq-item button svg { width: 16px !important; height: 16px !important; }
          .faq-item p { font-size: 12px !important; }
          .help-contact-card { padding: 14px !important; }
          .help-modal { padding: 16px !important; }
          .help-modal-head h3 { font-size: 18px !important; }
          .help-modal input, .help-modal select, .help-modal textarea { padding: 8px 10px !important; font-size: 12px !important; }
        }
      `}</style>

      <div className="help-center-container" style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 90px' }}>

        {/* En-tête */}
        <div className="help-center-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
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
              {t("helpCenter.title")}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6A6F78', fontSize: '14px' }}>
              {t("helpCenter.subtitle")}
            </p>
          </div>
        </div>

        {/* Hero avec recherche */}
        <div className="help-center-hero" style={{
          background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
          borderRadius: '24px', padding: '28px',
          boxShadow: '0 8px 32px rgba(26,38,56,0.18)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            margin: '0 0 18px', 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: '34px', 
            fontWeight: 600,
            color: '#fff'
          }}>
            {t("helpCenter.heroTitle")}
          </h2>
          <div className="help-search" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '16px', padding: '0 16px'
          }}>
            <Search size={18} color="rgba(255,255,255,0.6)" className="search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("helpCenter.searchPlaceholder")}
              style={{
                flex: 1, height: '52px', border: 0, outline: 0,
                background: 'transparent', color: '#fff',
                fontSize: '15px', fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>
        </div>

        {/* Alertes */}
        {success && (
          <div className="help-success" style={{
            background: '#ECFDF5', border: '1px solid #6EE7B7',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '14px', color: '#065F46', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Check size={18} strokeWidth={2} />
            {success}
          </div>
        )}
        {error && (
          <div className="help-error" style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '14px', color: '#B91C1C', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={18} strokeWidth={2} />
            {error}
          </div>
        )}

        {/* Catégories */}
        <h3 className="help-section-title" style={{
          margin: '0 0 10px 4px', fontSize: '12px',
          color: '#9CA3AF', letterSpacing: '1.6px',
          textTransform: 'uppercase', fontWeight: 800
        }}>
          {t("helpCenter.sectionCategories")}
        </h3>
        <div className="help-category-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '24px'
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => setSearch(cat.label)}
                style={{
                  background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '18px', padding: '18px', textAlign: 'left',
                  cursor: 'pointer', boxShadow: '0 3px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 3px 16px rgba(0,0,0,0.06)';
                }}
              >
                <div className="cat-icon" style={{ 
                  fontSize: '25px', 
                  marginBottom: '10px',
                  color: '#355C86',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                <h3 style={{ margin: '0 0 5px', fontSize: '15px', color: '#1A1A1A' }}>{cat.label}</h3>
                <p style={{ margin: 0, color: '#6A6F78', fontSize: '12px', lineHeight: '1.45' }}>{cat.desc}</p>
              </button>
            );
          })}
        </div>

        {/* FAQ */}
        <h3 className="help-section-title" style={{
          margin: '24px 0 10px 4px', fontSize: '12px',
          color: '#9CA3AF', letterSpacing: '1.6px',
          textTransform: 'uppercase', fontWeight: 800
        }}>
          {t("helpCenter.sectionFaqs")}
        </h3>
        <div className="help-faq-list" style={{ display: 'grid', gap: '10px' }}>
          {filteredFaqs.length ? (
            filteredFaqs.map((item) => <FAQItem key={item.question} item={item} />)
          ) : (
            <div className="help-empty" style={{
              background: '#fff', borderRadius: '18px', padding: '24px',
              textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)',
              color: '#6A6F78'
            }}>
              <Search size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <h3 style={{ margin: '8px 0 4px', color: '#1A1A1A', fontSize: '18px' }}>
                {t("helpCenter.noResults.title")}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6A6F78' }}>
                {t("helpCenter.noResults.desc")}
              </p>
            </div>
          )}
        </div>

        {/* Contact support */}
        <div className="help-contact-card" style={{
          marginTop: '24px', background: '#fff', borderRadius: '20px',
          padding: '22px', display: 'flex', justifyContent: 'space-between',
          gap: '18px', alignItems: 'center',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 3px 16px rgba(0,0,0,0.06)'
        }}>
          <div>
            <h3 style={{ margin: '0 0 5px', fontSize: '18px', color: '#1A1A1A' }}>
              {t("helpCenter.contact.title")}
            </h3>
            <p style={{ margin: 0, color: '#6A6F78', fontSize: '14px' }}>
              {t("helpCenter.contact.desc")}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              border: 0, borderRadius: '14px', padding: '14px 18px',
              background: 'linear-gradient(135deg, #1A1A1A, #355C86)',
              color: '#fff', fontWeight: 800, cursor: 'pointer',
              whiteSpace: 'nowrap', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Headphones size={16} strokeWidth={2} />
            {t("helpCenter.contact.button")}
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="help-modal-overlay" onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.45)',
          display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()} style={{
            width: 'min(520px, 100%)', background: '#fff',
            borderRadius: '24px', padding: '24px',
            boxShadow: '0 28px 80px rgba(0,0,0,0.25)'
          }}>
            <div className="help-modal-head" style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '18px'
            }}>
              <h3 style={{ margin: 0, fontSize: '22px', color: '#1A1A1A' }}>
                <MessageCircle size={20} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                {t("helpCenter.modal.title")}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{
                width: '36px', height: '36px', borderRadius: '12px',
                border: 0, background: '#F3F4F6', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={submitTicket} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1.4px', fontWeight: 800,
                  color: '#6A6F78', display: 'block', marginBottom: '4px'
                }}>
                  {t("helpCenter.modal.subject")}
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t("helpCenter.modal.subjectPlaceholder")}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    borderRadius: '14px', padding: '13px 15px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', background: '#F8F9FA'
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1.4px', fontWeight: 800,
                  color: '#6A6F78', display: 'block', marginBottom: '4px'
                }}>
                  {t("helpCenter.modal.priority")}
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    borderRadius: '14px', padding: '13px 15px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', background: '#F8F9FA'
                  }}
                >
                  <option value="low">{t("helpCenter.modal.priorityLow")}</option>
                  <option value="medium">{t("helpCenter.modal.priorityMedium")}</option>
                  <option value="high">{t("helpCenter.modal.priorityHigh")}</option>
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1.4px', fontWeight: 800,
                  color: '#6A6F78', display: 'block', marginBottom: '4px'
                }}>
                  {t("helpCenter.modal.message")}
                </label>
                <textarea
                  required
                  rows="5"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("helpCenter.modal.messagePlaceholder")}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    borderRadius: '14px', padding: '13px 15px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', background: '#F8F9FA',
                    resize: 'vertical', minHeight: '120px'
                  }}
                />
              </div>
              <button
                disabled={sending}
                type="submit"
                style={{
                  border: 0, borderRadius: '14px', padding: '14px 18px',
                  background: sending ? '#9CA3AF' : 'linear-gradient(135deg, #1A1A1A, #355C86)',
                  color: '#fff', fontWeight: 800, cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="spinner" strokeWidth={2} />
                    {t("helpCenter.modal.sending")}
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={2} />
                    {t("helpCenter.modal.send")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}