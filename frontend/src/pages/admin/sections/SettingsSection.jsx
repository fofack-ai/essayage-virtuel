import React, { useEffect, useState } from "react";
import {
  Store,
  Sparkles,
  Package,
  CreditCard,
  Truck,
  Bell,
  Lock,
  Palette,
  Settings,
  Shirt,
  Star,
  Mail,
  Shield,
  Globe,
  Smartphone,
  Clock,
  Users,
  Eye,
  Edit3,
  Zap,
  Download,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import Field from "../components/Field";
import SwitchLine from "../components/SwitchLine";
import { adminService } from "../../../services/adminService";

const SettingsSection = React.memo(function SettingsSection({ darkMode, setDarkMode }) {
  // ============================================================
  // VALEURS PAR DÉFAUT
  // ============================================================
  const defaultSettings = {
    // 1. Boutique
    shopName: "TryOn",
    supportEmail: "support@tryon.cm",
    phone: "",
    city: "Douala - Cameroun",
    country: "Cameroun",
    currency: "FCFA",
    address: "CFPD, Douala, Cameroun",
    language: "Français",

    // 2. Général
    maintenanceMode: false,
    registrationEnabled: true,

    // 3. Essayage IA
    aiEnabled: true,
    aiHd: false,
    aiKeepUploads: false,
    aiDailyLimit: 5,
    aiAutoDeleteDays: 7,
    guestTryon: false,
    allowTryonDownload: true,

    // 4. Catalogue
    showOutOfStock: true,
    showPrices: true,

    // 5. Commandes
    minOrderAmount: 5000,
    allowCancellation: true,
    cancellationDelay: 24,
    autoValidateOrders: false,
    orderConfirmationEmail: true,

    // 6. Avis
    reviewsEnabled: true,
    autoApproveReviews: false,

    // 7. Paiements
    orangeMoney: true,
    mtnMoney: true,
    paymentMode: "test",

    // 8. Livraison
    deliveryCities: "Douala, Yaoundé",
    deliveryDelay: "24h - 72h",
    deliveryFee: 1500,
    pickupEnabled: true,
    freeShipping: false,
    freeShippingFrom: 50000,

    // 9. Notifications
    emailNotif: true,
    orderNotif: true,
    paymentNotif: true,
    stockNotif: true,

    // 10. Sécurité
    twoFactor: false,
    sessionDuration: 60,
    maxLoginAttempts: 5,
    auditLogs: true,
    forceEmailVerification: false,
    enableCaptcha: false,
  };

  const [shop, setShop] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSettings();
      const backendSettings = response?.data?.data || response?.data || {};
      setShop({
        ...defaultSettings,
        ...backendSettings,
      });
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
      showMessage("Erreur lors du chargement des paramètres", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = (key, value) => {
    setShop((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await adminService.saveSettings(shop);
      showMessage("Paramètres enregistrés avec succès !", "success");
    } catch (error) {
      console.error("Erreur sauvegarde paramètres:", error);
      showMessage("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="settings-page">
      {/* HEADER */}
      <div className="settings-hero card">
        <div>
          <span className="settings-kicker">
            <Settings size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Configuration générale
          </span>
          <h2>Paramètres TryOn</h2>
          <p>
            Gérez les informations de la boutique, l'essayage virtuel, les commandes,
            les paiements, la livraison, les notifications et la sécurité.
          </p>
          {message && (
            <div className={`settings-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
        <button className="btn btn-red" onClick={saveSettings} disabled={saving || loading}>
          {saving ? "Enregistrement..." : " Enregistrer les paramètres"}
        </button>
      </div>

      <div className="settings-grid">
        {/* ============================================================
          1. BOUTIQUE
        ============================================================ */}
        <div className="card settings-card large">
          <div className="settings-head">
            <span className="settings-icon"><Store size={24} /></span>
            <div>
              <h3>1. Informations de la boutique</h3>
              <p className="muted">Informations visibles sur le site (footer, emails, etc.).</p>
            </div>
          </div>

          <div className="form-grid">
            <Field 
              label="Nom boutique" 
              value={shop.shopName} 
              onChange={(e) => updateSetting("shopName", e.target.value)} 
            />
            <Field 
              label="Email support" 
              value={shop.supportEmail} 
              onChange={(e) => updateSetting("supportEmail", e.target.value)} 
            />
            <Field 
              label="Téléphone" 
              value={shop.phone} 
              onChange={(e) => updateSetting("phone", e.target.value)} 
            />
            <Field 
              label="Ville" 
              value={shop.city} 
              onChange={(e) => updateSetting("city", e.target.value)} 
            />
            <Field 
              label="Pays" 
              value={shop.country} 
              onChange={(e) => updateSetting("country", e.target.value)} 
            />
            <Field 
              label="Devise" 
              value={shop.currency} 
              onChange={(e) => updateSetting("currency", e.target.value)} 
            />
          </div>

          <label className="label">Adresse</label>
          <textarea 
            className="textarea" 
            value={shop.address} 
            onChange={(e) => updateSetting("address", e.target.value)}
            rows="2"
          />

          <div className="field">
            <label className="label">Langue</label>
            <select 
              className="select" 
              value={shop.language} 
              onChange={(e) => updateSetting("language", e.target.value)}
            >
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
            </select>
          </div>
        </div>

        {/* ============================================================
          2. GÉNÉRAL
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Globe size={24} /></span>
            <div>
              <h3>2. Général</h3>
              <p className="muted">Fonctionnalités globales de l'application.</p>
            </div>
          </div>

          <SwitchLine 
            title={<><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Mode maintenance</>}
            desc="Mettre le site en maintenance (seuls les admins peuvent accéder)." 
            checked={Boolean(shop.maintenanceMode)} 
            onChange={(value) => updateSetting("maintenanceMode", value)} 
          />
          <SwitchLine 
            title={<><Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Inscription ouverte</>}
            desc="Autoriser les nouveaux utilisateurs à s'inscrire." 
            checked={Boolean(shop.registrationEnabled)} 
            onChange={(value) => updateSetting("registrationEnabled", value)} 
          />
        </div>

        {/* ============================================================
          3. ESSAYAGE IA
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Sparkles size={24} /></span>
            <div>
              <h3>3. Essayage virtuel IA</h3>
              <p className="muted">Réglages de la cabine virtuelle et de CatVTON.</p>
            </div>
          </div>

          <SwitchLine 
            title={<><Zap size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Activer l'essayage IA</>}
            desc="Autoriser les clients à lancer un essayage virtuel." 
            checked={Boolean(shop.aiEnabled)} 
            onChange={(value) => updateSetting("aiEnabled", value)} 
          />
          <SwitchLine 
            title={<><Eye size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Génération HD</>}
            desc="Améliore la qualité, mais augmente le temps de traitement." 
            checked={Boolean(shop.aiHd)} 
            onChange={(value) => updateSetting("aiHd", value)} 
          />
          <SwitchLine 
            title={<><Download size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Conserver les uploads</>}
            desc="Sauvegarder temporairement les images utilisateur." 
            checked={Boolean(shop.aiKeepUploads)} 
            onChange={(value) => updateSetting("aiKeepUploads", value)} 
          />
          <SwitchLine 
            title="Téléchargement du résultat" 
            desc="Autoriser le téléchargement de l'image essayée." 
            checked={Boolean(shop.allowTryonDownload)} 
            onChange={(value) => updateSetting("allowTryonDownload", value)} 
          />

          <div className="form-grid compact">
            <Field 
              label="Essayages / jour" 
              type="number" 
              value={shop.aiDailyLimit} 
              onChange={(e) => updateSetting("aiDailyLimit", Number(e.target.value))} 
            />
            <Field 
              label="Suppression après (jours)" 
              type="number" 
              value={shop.aiAutoDeleteDays} 
              onChange={(e) => updateSetting("aiAutoDeleteDays", Number(e.target.value))} 
            />
          </div>
        </div>

        {/* ============================================================
          4. CATALOGUE
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Shirt size={24} /></span>
            <div>
              <h3>4. Catalogue</h3>
              <p className="muted">Gestion des produits et du catalogue.</p>
            </div>
          </div>

          <SwitchLine 
            title="Afficher les produits en rupture" 
            desc="Montrer les produits avec stock = 0 dans le catalogue." 
            checked={Boolean(shop.showOutOfStock)} 
            onChange={(value) => updateSetting("showOutOfStock", value)} 
          />
          <SwitchLine 
            title="Afficher les prix" 
            desc="Montrer les prix des produits sur le catalogue." 
            checked={Boolean(shop.showPrices)} 
            onChange={(value) => updateSetting("showPrices", value)} 
          />
        </div>

        {/* ============================================================
          5. COMMANDES
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Package size={24} /></span>
            <div>
              <h3>5. Commandes</h3>
              <p className="muted">Règles de validation, annulation et minimum d'achat.</p>
            </div>
          </div>

          <SwitchLine 
            title="Validation automatique" 
            desc="Valider automatiquement les commandes après paiement." 
            checked={Boolean(shop.autoValidateOrders)} 
            onChange={(value) => updateSetting("autoValidateOrders", value)} 
          />
          <SwitchLine 
            title="Annulation autorisée" 
            desc="Permettre au client d'annuler une commande récente." 
            checked={Boolean(shop.allowCancellation)} 
            onChange={(value) => updateSetting("allowCancellation", value)} 
          />
          <SwitchLine 
            title="Confirmation par email" 
            desc="Envoyer un email de confirmation après chaque commande." 
            checked={Boolean(shop.orderConfirmationEmail)} 
            onChange={(value) => updateSetting("orderConfirmationEmail", value)} 
          />

          <div className="form-grid compact">
            <Field 
              label="Commande minimum (FCFA)" 
              type="number" 
              value={shop.minOrderAmount} 
              onChange={(e) => updateSetting("minOrderAmount", Number(e.target.value))} 
            />
            <Field 
              label="Délai annulation (heures)" 
              type="number" 
              value={shop.cancellationDelay} 
              onChange={(e) => updateSetting("cancellationDelay", Number(e.target.value))} 
            />
          </div>
        </div>

        {/* ============================================================
          6. AVIS & ÉVALUATIONS
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Star size={24} /></span>
            <div>
              <h3>6. Avis & Évaluations</h3>
              <p className="muted">Gestion des avis clients.</p>
            </div>
          </div>

          <SwitchLine 
            title="Activer les avis" 
            desc="Permettre aux clients de laisser des avis sur les produits." 
            checked={Boolean(shop.reviewsEnabled)} 
            onChange={(value) => updateSetting("reviewsEnabled", value)} 
          />
          <SwitchLine 
            title="Modération automatique" 
            desc="Approuver automatiquement les avis des clients." 
            checked={Boolean(shop.autoApproveReviews)} 
            onChange={(value) => updateSetting("autoApproveReviews", value)} 
          />
        </div>

        {/* ============================================================
          7. PAIEMENTS
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><CreditCard size={24} /></span>
            <div>
              <h3>7. Paiements</h3>
              <p className="muted">Moyens de paiement disponibles sur la plateforme.</p>
            </div>
          </div>

          <SwitchLine 
            title={<><Smartphone size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Orange Money</>}
            desc="Activer le paiement via Orange Money." 
            checked={Boolean(shop.orangeMoney)} 
            onChange={(value) => updateSetting("orangeMoney", value)} 
          />
          <SwitchLine 
            title={<><Smartphone size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> MTN Mobile Money</>}
            desc="Activer le paiement via MTN MoMo." 
            checked={Boolean(shop.mtnMoney)} 
            onChange={(value) => updateSetting("mtnMoney", value)} 
          />

          <div className="field">
            <label className="label">Mode paiement</label>
            <select 
              className="select" 
              value={shop.paymentMode} 
              onChange={(e) => updateSetting("paymentMode", e.target.value)}
            >
              <option value="test">🧪 Test</option>
              <option value="production">🚀 Production</option>
            </select>
          </div>
        </div>

        {/* ============================================================
          8. LIVRAISON
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Truck size={24} /></span>
            <div>
              <h3>8. Livraison</h3>
              <p className="muted">Délais et frais de livraison.</p>
            </div>
          </div>

          <div className="form-grid compact">
            <Field 
              label="Délai de livraison" 
              value={shop.deliveryDelay} 
              onChange={(e) => updateSetting("deliveryDelay", e.target.value)} 
            />
            <Field 
              label="Frais livraison (FCFA)" 
              type="number" 
              value={shop.deliveryFee} 
              onChange={(e) => updateSetting("deliveryFee", Number(e.target.value))} 
              disabled={shop.freeShipping}
            />
          </div>
        </div>

        {/* ============================================================
          9. NOTIFICATIONS
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Bell size={24} /></span>
            <div>
              <h3>9. Notifications</h3>
              <p className="muted">Canaux et alertes automatiques.</p>
            </div>
          </div>

          <SwitchLine 
            title={<><Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Email</>}
            desc="Envoyer les notifications importantes par email." 
            checked={Boolean(shop.emailNotif)} 
            onChange={(value) => updateSetting("emailNotif", value)} 
          />
          <SwitchLine 
            title={<><Package size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Commandes</>}
            desc="Notifier lors des nouvelles commandes." 
            checked={Boolean(shop.orderNotif)} 
            onChange={(value) => updateSetting("orderNotif", value)} 
          />
          <SwitchLine 
            title={<><CreditCard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Paiements</>}
            desc="Notifier lors des paiements validés." 
            checked={Boolean(shop.paymentNotif)} 
            onChange={(value) => updateSetting("paymentNotif", value)} 
          />
          <SwitchLine 
            title={<><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Stock faible</>}
            desc="Alerter quand un produit doit être réapprovisionné." 
            checked={Boolean(shop.stockNotif)} 
            onChange={(value) => updateSetting("stockNotif", value)} 
          />
        </div>

        {/* ============================================================
          10. SÉCURITÉ
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Lock size={24} /></span>
            <div>
              <h3>10. Sécurité</h3>
              <p className="muted">Protection des sessions et journalisation.</p>
            </div>
          </div>

          <SwitchLine 
            title={<><Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Double authentification</>}
            desc="Ajouter une vérification supplémentaire à la connexion." 
            checked={Boolean(shop.twoFactor)} 
            onChange={(value) => updateSetting("twoFactor", value)} 
          />
          <SwitchLine 
            title={<><Edit3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Journalisation</>}
            desc="Conserver les actions importantes du back-office." 
            checked={Boolean(shop.auditLogs)} 
            onChange={(value) => updateSetting("auditLogs", value)} 
          />
          <SwitchLine 
            title="Forcer la vérification email" 
            desc="Les utilisateurs doivent vérifier leur email avant de commander." 
            checked={Boolean(shop.forceEmailVerification)} 
            onChange={(value) => updateSetting("forceEmailVerification", value)} 
          />
          <SwitchLine 
            title="Protection contre les robots" 
            desc="Ajouter un CAPTCHA sur les formulaires." 
            checked={Boolean(shop.enableCaptcha)} 
            onChange={(value) => updateSetting("enableCaptcha", value)} 
          />

          <div className="form-grid compact">
            <Field 
              label="Durée session (minutes)" 
              type="number" 
              value={shop.sessionDuration} 
              onChange={(e) => updateSetting("sessionDuration", Number(e.target.value))} 
            />
            <Field 
              label="Tentatives connexion" 
              type="number" 
              value={shop.maxLoginAttempts} 
              onChange={(e) => updateSetting("maxLoginAttempts", Number(e.target.value))} 
            />
          </div>
        </div>

        {/* ============================================================
          11. APPARENCE
        ============================================================ */}
        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon"><Palette size={24} /></span>
            <div>
              <h3>11. Apparence</h3>
              <p className="muted">Personnalisation de l'interface du back-office.</p>
            </div>
          </div>

          <SwitchLine
            title={<><RefreshCw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Mode sombre</>}
            desc="Activer le thème sombre pour le tableau de bord admin."
            checked={Boolean(darkMode)}
            onChange={(value) => setDarkMode(value)}
          />
        </div>
      </div>
    </div>
  );
});

export default SettingsSection;