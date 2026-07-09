import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import "./account-pages.css";

const categories = [
  ["📦", "Commandes", "Suivi, modification et historique"],
  ["🚚", "Livraison", "Délais, adresse et suivi colis"],
  ["💳", "Paiement", "Méthodes, sécurité et validation"],
  ["👕", "Essayage virtuel", "Photo, rendu IA et conseils"],
  ["🔄", "Retours", "Échanges et remboursements"],
  ["👤", "Compte", "Profil, mot de passe et sécurité"]
];

const faqs = [
  ["Essayage virtuel", "Comment utiliser l'essayage virtuel ?", "Choisissez un produit, cliquez sur Essayer virtuellement, ajoutez votre image puis lancez la simulation. Le résultat vous permet de visualiser le rendu du vêtement avant achat."],
  ["Commandes", "Comment suivre ma commande ?", "Depuis votre espace client, ouvrez la section Commandes. Vous pourrez consulter le statut de chaque commande et son historique."],
  ["Paiement", "Mes paiements sont-ils sécurisés ?", "Oui. Les transactions sont traitées via une passerelle sécurisée et les informations sensibles ne sont pas stockées en clair dans l'application."],
  ["Retours", "Puis-je retourner un produit ?", "Les retours sont possibles selon les conditions générales de vente. Il est recommandé de consulter la politique de retour avant toute demande."],
  ["Compte", "Comment modifier mes informations personnelles ?", "Rendez-vous dans votre profil, puis cliquez sur Modifier le profil. Vous pourrez mettre à jour votre nom, email et téléphone."],
  ["Technique", "Que faire si l'essayage ne se lance pas ?", "Vérifiez votre connexion Internet, rechargez la page, puis réessayez. Si le problème persiste, contactez le support via le formulaire du centre d'aide."]
].map(([category, question, answer]) => ({ category, question, answer }));

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
        <b style={{ color: '#E30613', fontSize: '20px' }}>{open ? "−" : "+"}</b>
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
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", priority: "medium" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => `${f.category} ${f.question} ${f.answer}`.toLowerCase().includes(q));
  }, [search]);

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
      setSuccess("Votre demande a été envoyée au support.");
      setModalOpen(false);
      setForm({ subject: "", message: "", priority: "medium" });
    } catch (e) {
      console.error(e);
      setError("Impossible d'envoyer votre demande pour le moment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="help-center-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        /* ═══════════════════════════════════════
           RESPONSIVE — CENTRE D'AIDE
        ════════════════════════════════════════ */

        /* ─── TABLETTE ─── */
        @media (max-width: 900px) {
          .help-center-container {
            padding: 16px 16px 80px !important;
          }
          .help-center-header h1 {
            font-size: 32px !important;
          }
          .help-center-header p {
            font-size: 13px !important;
          }
          .help-center-hero {
            padding: 24px !important;
          }
          .help-center-hero h2 {
            font-size: 28px !important;
          }
          .help-category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }

        /* ─── MOBILE ─── */
        @media (max-width: 640px) {
          .help-center-page {
            padding-top: 0 !important;
          }
          .help-center-container {
            padding: 12px 12px 80px !important;
          }
          .help-center-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .help-center-header .back-btn {
            width: 38px !important;
            height: 38px !important;
            font-size: 18px !important;
          }
          .help-center-header h1 {
            font-size: 28px !important;
          }
          .help-center-header p {
            font-size: 12px !important;
          }
          .help-center-hero {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
          .help-center-hero h2 {
            font-size: 22px !important;
          }
          .help-center-hero .help-search {
            padding: 0 12px !important;
          }
          .help-center-hero .help-search input {
            height: 44px !important;
            font-size: 14px !important;
          }
          .help-center-hero .help-search span {
            font-size: 16px !important;
          }
          .help-category-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .help-category-grid button {
            padding: 14px 10px !important;
            border-radius: 14px !important;
          }
          .help-category-grid button div {
            font-size: 20px !important;
            margin-bottom: 6px !important;
          }
          .help-category-grid button h3 {
            font-size: 13px !important;
          }
          .help-category-grid button p {
            font-size: 11px !important;
          }
          .help-section-title {
            font-size: 11px !important;
            margin: 20px 0 10px !important;
          }
          .faq-item button {
            padding: 14px 14px !important;
            font-size: 13px !important;
          }
          .faq-item button b {
            font-size: 18px !important;
          }
          .faq-item p {
            padding: 0 14px 14px !important;
            font-size: 13px !important;
          }
          .help-contact-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            padding: 18px !important;
            margin-top: 20px !important;
          }
          .help-contact-card h3 {
            font-size: 16px !important;
          }
          .help-contact-card p {
            font-size: 13px !important;
          }
          .help-contact-card button {
            width: 100% !important;
            padding: 14px !important;
            font-size: 13px !important;
          }
          .help-modal-overlay {
            padding: 12px !important;
            align-items: flex-end !important;
          }
          .help-modal {
            padding: 20px !important;
            border-radius: 20px 20px 0 0 !important;
          }
          .help-modal-head h3 {
            font-size: 20px !important;
          }
          .help-modal-head button {
            width: 32px !important;
            height: 32px !important;
            font-size: 18px !important;
          }
          .help-modal form {
            gap: 10px !important;
          }
          .help-modal label {
            font-size: 11px !important;
          }
          .help-modal input,
          .help-modal select,
          .help-modal textarea {
            padding: 10px 12px !important;
            font-size: 13px !important;
            border-radius: 12px !important;
          }
          .help-modal textarea {
            min-height: 100px !important;
          }
          .help-modal button[type="submit"] {
            padding: 14px !important;
            font-size: 13px !important;
          }
        }

        /* ─── TRÈS PETIT ÉCRAN (iPhone SE) ─── */
        @media (max-width: 420px) {
          .help-center-container {
            padding: 8px 8px 80px !important;
          }
          .help-center-hero {
            padding: 14px 12px !important;
          }
          .help-center-hero h2 {
            font-size: 18px !important;
          }
          .help-center-hero .help-search input {
            height: 38px !important;
            font-size: 12px !important;
          }
          .help-category-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .help-category-grid button {
            padding: 12px 10px !important;
          }
          .help-category-grid button div {
            font-size: 18px !important;
          }
          .help-category-grid button h3 {
            font-size: 12px !important;
          }
          .help-category-grid button p {
            font-size: 10px !important;
          }
          .faq-item button {
            padding: 12px 12px !important;
            font-size: 12px !important;
          }
          .faq-item button b {
            font-size: 16px !important;
          }
          .faq-item p {
            font-size: 12px !important;
          }
          .help-contact-card {
            padding: 14px !important;
          }
          .help-modal {
            padding: 16px !important;
          }
          .help-modal-head h3 {
            font-size: 18px !important;
          }
          .help-modal input,
          .help-modal select,
          .help-modal textarea {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="help-center-container" style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 90px' }}>

        {/* En-tête */}
        <div className="help-center-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
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
              Centre d'aide
            </h1>
            <p style={{ margin: '4px 0 0', color: '#6A6F78', fontSize: '14px' }}>
              Retrouvez les réponses aux questions fréquentes sur TryOn.
            </p>
          </div>
        </div>

        {/* Hero avec recherche */}
        <div className="help-center-hero" style={{
          background: 'linear-gradient(160deg, #1A1A1A 0%, #26384D 100%)',
          borderRadius: '24px', padding: '28px', color: '#fff',
          boxShadow: '0 8px 32px rgba(26,38,56,0.18)', marginBottom: '24px'
        }}>
          <h2 style={{ margin: '0 0 18px', fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 600 }}>
            Comment pouvons-nous vous aider ?
          </h2>
          <div className="help-search" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '16px', padding: '0 16px'
          }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une réponse..."
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
            marginBottom: '14px', color: '#065F46', fontSize: '14px'
          }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="help-error" style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '14px 18px',
            marginBottom: '14px', color: '#B91C1C', fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Catégories */}
        <h3 className="help-section-title" style={{
          margin: '0 0 10px 4px', fontSize: '12px',
          color: '#9CA3AF', letterSpacing: '1.6px',
          textTransform: 'uppercase', fontWeight: 800
        }}>
          Catégories
        </h3>
        <div className="help-category-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '24px'
        }}>
          {categories.map(([ic, title, text]) => (
            <button
              key={title}
              onClick={() => setSearch(title)}
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
              <div style={{ fontSize: '25px', marginBottom: '10px' }}>{ic}</div>
              <h3 style={{ margin: '0 0 5px', fontSize: '15px', color: '#1A1A1A' }}>{title}</h3>
              <p style={{ margin: 0, color: '#6A6F78', fontSize: '12px', lineHeight: '1.45' }}>{text}</p>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <h3 className="help-section-title" style={{
          margin: '24px 0 10px 4px', fontSize: '12px',
          color: '#9CA3AF', letterSpacing: '1.6px',
          textTransform: 'uppercase', fontWeight: 800
        }}>
          Questions fréquentes
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
              <div style={{ fontSize: '38px' }}>🔍</div>
              <h3 style={{ margin: '8px 0 4px', color: '#1A1A1A', fontSize: '18px' }}>Aucune réponse trouvée</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6A6F78' }}>Essayez un autre mot-clé ou contactez le support.</p>
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
            <h3 style={{ margin: '0 0 5px', fontSize: '18px', color: '#1A1A1A' }}>Toujours besoin d'aide ?</h3>
            <p style={{ margin: 0, color: '#6A6F78', fontSize: '14px' }}>
              Envoyez une demande au support TryOn. Nous vous répondrons dès que possible.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              border: 0, borderRadius: '14px', padding: '14px 18px',
              background: 'linear-gradient(135deg, #1A1A1A, #355C86)',
              color: '#fff', fontWeight: 800, cursor: 'pointer',
              whiteSpace: 'nowrap', fontSize: '13px'
            }}
          >
            Contacter le support
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
              <h3 style={{ margin: 0, fontSize: '22px', color: '#1A1A1A' }}>Contacter le support</h3>
              <button onClick={() => setModalOpen(false)} style={{
                width: '36px', height: '36px', borderRadius: '12px',
                border: 0, background: '#F3F4F6', cursor: 'pointer',
                fontSize: '22px', display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                ×
              </button>
            </div>
            <form onSubmit={submitTicket} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1.4px', fontWeight: 800,
                  color: '#6A6F78', display: 'block', marginBottom: '4px'
                }}>
                  Sujet
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex : Problème avec ma commande"
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
                  Priorité
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
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1.4px', fontWeight: 800,
                  color: '#6A6F78', display: 'block', marginBottom: '4px'
                }}>
                  Message
                </label>
                <textarea
                  required
                  rows="5"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre problème..."
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
                  fontSize: '13px'
                }}
              >
                {sending ? "Envoi..." : "Envoyer la demande"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}