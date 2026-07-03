import React, { useEffect, useState } from "react";
import Field from "../components/Field";
import SwitchLine from "../components/SwitchLine";
import { adminService } from "../../../services/adminService";

const SettingsSection = React.memo(function SettingsSection() {
  const defaultSettings = {
    shopName: "TryOn",
    city: "Douala - Cameroun",
    supportEmail: "support@tryon.cm",
    address: "CFPD, Douala, Cameroun",
    phone: "",
    country: "Cameroun",
    currency: "FCFA",
    language: "Français",
    aiEnabled: true,
    aiHd: false,
    aiDailyLimit: 5,
    aiKeepUploads: false,
    aiAutoDeleteDays: 7,
    autoValidateOrders: false,
    minOrderAmount: 5000,
    freeShippingFrom: 50000,
    allowCancellation: true,
    cancellationDelay: 24,
    orangeMoney: true,
    mtnMoney: true,
    cardPayment: false,
    paypal: false,
    paymentMode: "test",
    deliveryCities: "Douala, Yaoundé",
    deliveryDelay: "24h - 72h",
    deliveryFee: 1500,
    pickupEnabled: true,
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    orderNotif: true,
    paymentNotif: true,
    stockNotif: true,
    twoFactor: false,
    sessionDuration: 60,
    maxLoginAttempts: 5,
    auditLogs: true,
    autoBackup: false,
    backupFrequency: "Hebdomadaire",
    apiVersion: "v1",
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

      const backendSettings =
        response?.data?.data ||
        response?.data ||
        {};

      setShop({
        ...defaultSettings,
        ...backendSettings,
      });
    } catch (error) {
      console.error("Erreur chargement paramètres :", error);
      alert("Erreur lors du chargement des paramètres.");
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
      setLoading(true);

      await adminService.saveSettings(shop);
      await loadSettings();

      alert("Paramètres enregistrés !");
    } catch (error) {
      console.error("Erreur sauvegarde paramètres :", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const systemStatus = [
    {
      label: "API Backend",
      value: navigator.onLine ? "Disponible" : "Hors ligne",
      status: navigator.onLine ? "ok" : "bad",
    },
    {
      label: "Base de données",
      value: loading ? "Vérification..." : "Connectée via API",
      status: loading ? "warn" : "ok",
    },
    {
      label: "Service IA CatVTON",
      value: "À vérifier via backend",
      status: "warn",
    },
    {
      label: "Version API",
      value: shop.apiVersion || "v1",
      status: "blue",
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-hero card">
        <div>
          <span className="settings-kicker">Configuration générale</span>
          <h2>Paramètres TryOn</h2>
          <p>
            Gérez les informations de la boutique, l'essayage virtuel, les commandes,
            les paiements, la sécurité et les services système.
          </p>
          {message && (
            <div className={`settings-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
        <button className="btn btn-red" onClick={saveSettings} disabled={saving || loading}>
          {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>
      </div>

      <div className="settings-grid">
        <div className="card settings-card large">
          <div className="settings-head">
            <span className="settings-icon">🏪</span>
            <div>
              <h3>1. Paramètres de la boutique</h3>
              <p className="muted">Informations visibles et configuration commerciale.</p>
            </div>
          </div>

          <div className="form-grid">
            <Field label="Nom boutique" value={shop.shopName} onChange={(e) => updateSetting("shopName", e.target.value)} />
            <Field label="Email support" value={shop.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} />
            <Field label="Téléphone" value={shop.phone} onChange={(e) => updateSetting("phone", e.target.value)} />
            <Field label="Ville" value={shop.city} onChange={(e) => updateSetting("city", e.target.value)} />
            <Field label="Pays" value={shop.country} onChange={(e) => updateSetting("country", e.target.value)} />
            <Field label="Devise" value={shop.currency} onChange={(e) => updateSetting("currency", e.target.value)} />
          </div>

          <label className="label">Adresse</label>
          <textarea className="textarea" value={shop.address} onChange={(e) => updateSetting("address", e.target.value)} />

          <div className="field">
            <label className="label">Langue</label>
            <select className="select" value={shop.language} onChange={(e) => updateSetting("language", e.target.value)}>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
            </select>
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">✨</span>
            <div>
              <h3>2. Essayage virtuel IA</h3>
              <p className="muted">Réglages de la cabine virtuelle et de CatVTON.</p>
            </div>
          </div>

          <SwitchLine title="Activer l'essayage IA" desc="Autoriser les clients à lancer un essayage virtuel." checked={Boolean(shop.aiEnabled)} onChange={(value) => updateSetting("aiEnabled", value)} />
          <SwitchLine title="Génération HD" desc="Améliore la qualité, mais augmente le temps de traitement." checked={Boolean(shop.aiHd)} onChange={(value) => updateSetting("aiHd", value)} />
          <SwitchLine title="Conserver les uploads" desc="Sauvegarder temporairement les images utilisateur." checked={Boolean(shop.aiKeepUploads)} onChange={(value) => updateSetting("aiKeepUploads", value)} />

          <div className="form-grid compact">
            <Field label="Essayages / jour" type="number" value={shop.aiDailyLimit} onChange={(e) => updateSetting("aiDailyLimit", Number(e.target.value))} />
            <Field label="Suppression après (jours)" type="number" value={shop.aiAutoDeleteDays} onChange={(e) => updateSetting("aiAutoDeleteDays", Number(e.target.value))} />
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">📦</span>
            <div>
              <h3>3. Commandes</h3>
              <p className="muted">Règles de validation, annulation et minimum d'achat.</p>
            </div>
          </div>

          <SwitchLine title="Validation automatique" desc="Valider automatiquement une commande après paiement." checked={Boolean(shop.autoValidateOrders)} onChange={(value) => updateSetting("autoValidateOrders", value)} />
          <SwitchLine title="Annulation autorisée" desc="Permettre au client d'annuler une commande récente." checked={Boolean(shop.allowCancellation)} onChange={(value) => updateSetting("allowCancellation", value)} />

          <div className="form-grid compact">
            <Field label="Commande minimum" type="number" value={shop.minOrderAmount} onChange={(e) => updateSetting("minOrderAmount", Number(e.target.value))} />
            <Field label="Livraison gratuite dès" type="number" value={shop.freeShippingFrom} onChange={(e) => updateSetting("freeShippingFrom", Number(e.target.value))} />
            <Field label="Délai annulation (h)" type="number" value={shop.cancellationDelay} onChange={(e) => updateSetting("cancellationDelay", Number(e.target.value))} />
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">💳</span>
            <div>
              <h3>4. Paiements</h3>
              <p className="muted">Moyens de paiement disponibles sur la plateforme.</p>
            </div>
          </div>

          <SwitchLine title="Orange Money" desc="Activer le paiement via Orange Money." checked={Boolean(shop.orangeMoney)} onChange={(value) => updateSetting("orangeMoney", value)} />
          <SwitchLine title="MTN Mobile Money" desc="Activer le paiement via MTN MoMo." checked={Boolean(shop.mtnMoney)} onChange={(value) => updateSetting("mtnMoney", value)} />
          <SwitchLine title="Carte bancaire" desc="Autoriser les paiements par carte." checked={Boolean(shop.cardPayment)} onChange={(value) => updateSetting("cardPayment", value)} />
          <SwitchLine title="PayPal" desc="Autoriser PayPal pour les paiements internationaux." checked={Boolean(shop.paypal)} onChange={(value) => updateSetting("paypal", value)} />

          <div className="field">
            <label className="label">Mode paiement</label>
            <select className="select" value={shop.paymentMode} onChange={(e) => updateSetting("paymentMode", e.target.value)}>
              <option value="test">Test</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">🚚</span>
            <div>
              <h3>5. Livraison</h3>
              <p className="muted">Zones desservies, délais et frais de livraison.</p>
            </div>
          </div>

          <Field label="Zones desservies" value={shop.deliveryCities} onChange={(e) => updateSetting("deliveryCities", e.target.value)} />
          <div className="form-grid compact">
            <Field label="Délai de livraison" value={shop.deliveryDelay} onChange={(e) => updateSetting("deliveryDelay", e.target.value)} />
            <Field label="Frais livraison" type="number" value={shop.deliveryFee} onChange={(e) => updateSetting("deliveryFee", Number(e.target.value))} />
          </div>
          <SwitchLine title="Retrait en magasin" desc="Autoriser le client à récupérer sa commande sur place." checked={Boolean(shop.pickupEnabled)} onChange={(value) => updateSetting("pickupEnabled", value)} />
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">🔔</span>
            <div>
              <h3>6. Notifications</h3>
              <p className="muted">Canaux et alertes automatiques.</p>
            </div>
          </div>

          <SwitchLine title="Email" desc="Envoyer les notifications importantes par email." checked={Boolean(shop.emailNotif)} onChange={(value) => updateSetting("emailNotif", value)} />
          <SwitchLine title="SMS" desc="Envoyer les alertes par SMS." checked={Boolean(shop.smsNotif)} onChange={(value) => updateSetting("smsNotif", value)} />
          <SwitchLine title="Push" desc="Afficher les notifications dans l'application." checked={Boolean(shop.pushNotif)} onChange={(value) => updateSetting("pushNotif", value)} />
          <SwitchLine title="Commandes" desc="Notifier lors des nouvelles commandes." checked={Boolean(shop.orderNotif)} onChange={(value) => updateSetting("orderNotif", value)} />
          <SwitchLine title="Paiements" desc="Notifier lors des paiements validés." checked={Boolean(shop.paymentNotif)} onChange={(value) => updateSetting("paymentNotif", value)} />
          <SwitchLine title="Stock faible" desc="Alerter quand un produit doit être réapprovisionné." checked={Boolean(shop.stockNotif)} onChange={(value) => updateSetting("stockNotif", value)} />
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">👥</span>
            <div>
              <h3>7. Administrateurs</h3>
              <p className="muted">Gestion des rôles et accès admin.</p>
            </div>
          </div>

          <div className="admin-role-grid">
            <div className="admin-role-card">
              <b>Super Admin</b>
              <span>Accès complet</span>
            </div>
            <div className="admin-role-card">
              <b>Gestionnaire ventes</b>
              <span>Commandes, paiements, clients</span>
            </div>
            <div className="admin-role-card">
              <b>Gestionnaire catalogue</b>
              <span>Produits, stock, promotions</span>
            </div>
          </div>

          <div className="empty soft">
            Les comptes administrateurs seront chargés depuis le backend dans une étape ultérieure.
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">🔒</span>
            <div>
              <h3>8. Sécurité</h3>
              <p className="muted">Protection des sessions et journalisation.</p>
            </div>
          </div>

          <SwitchLine title="Double authentification" desc="Ajouter une vérification supplémentaire à la connexion." checked={Boolean(shop.twoFactor)} onChange={(value) => updateSetting("twoFactor", value)} />
          <SwitchLine title="Journalisation" desc="Conserver les actions importantes du back-office." checked={Boolean(shop.auditLogs)} onChange={(value) => updateSetting("auditLogs", value)} />

          <div className="form-grid compact">
            <Field label="Durée session (min)" type="number" value={shop.sessionDuration} onChange={(e) => updateSetting("sessionDuration", Number(e.target.value))} />
            <Field label="Tentatives connexion" type="number" value={shop.maxLoginAttempts} onChange={(e) => updateSetting("maxLoginAttempts", Number(e.target.value))} />
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">💾</span>
            <div>
              <h3>9. Sauvegardes système</h3>
              <p className="muted">Préparation des sauvegardes et restaurations.</p>
            </div>
          </div>

          <SwitchLine title="Sauvegarde automatique" desc="Programmer une sauvegarde régulière côté serveur." checked={Boolean(shop.autoBackup)} onChange={(value) => updateSetting("autoBackup", value)} />

          <div className="field">
            <label className="label">Fréquence</label>
            <select className="select" value={shop.backupFrequency} onChange={(e) => updateSetting("backupFrequency", e.target.value)}>
              <option value="Quotidienne">Quotidienne</option>
              <option value="Hebdomadaire">Hebdomadaire</option>
              <option value="Mensuelle">Mensuelle</option>
            </select>
          </div>
        </div>

        <div className="card settings-card">
          <div className="settings-head">
            <span className="settings-icon">⚙️</span>
            <div>
              <h3>10. API & Backend</h3>
              <p className="muted">État des services techniques de TryOn.</p>
            </div>
          </div>

          <div className="system-list">
            {systemStatus.map((item) => (
              <div className="system-line" key={item.label}>
                <span>{item.label}</span>
                <b className={`badge ${item.status}`}>{item.value}</b>
              </div>
            ))}
          </div>

          <Field label="Version API" value={shop.apiVersion} onChange={(e) => updateSetting("apiVersion", e.target.value)} />
        </div>
      </div>
    </div>
  );
});

export default SettingsSection;
