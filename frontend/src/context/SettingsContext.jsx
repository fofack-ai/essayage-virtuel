import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const SettingsContext = createContext();

const defaultSettings = {
  shopName: "TryOn",
  supportEmail: "support@tryon.cm",
  phone: "",
  city: "Douala - Cameroun",
  country: "Cameroun",
  currency: "FCFA",
  address: "CFPD, Douala, Cameroun",
  language: "Français",
  maintenanceMode: false,
  registrationEnabled: true,
  aiEnabled: true,
  aiHd: false,
  aiKeepUploads: false,
  aiDailyLimit: 5,
  aiAutoDeleteDays: 7,
  guestTryon: false,
  allowTryonDownload: true,
  showOutOfStock: true,
  showPrices: true,
  minOrderAmount: 5000,
  allowCancellation: true,
  cancellationDelay: 24,
  autoValidateOrders: false,
  orderConfirmationEmail: true,
  reviewsEnabled: true,
  autoApproveReviews: false,
  orangeMoney: true,
  mtnMoney: true,
  paymentMode: "test",
  deliveryCities: "Douala, Yaoundé",
  deliveryDelay: "24h - 72h",
  deliveryFee: 1500,
  pickupEnabled: true,
  freeShipping: false,
  freeShippingFrom: 50000,
  emailNotif: true,
  orderNotif: true,
  paymentNotif: true,
  stockNotif: true,
  twoFactor: false,
  sessionDuration: 60,
  maxLoginAttempts: 5,
  auditLogs: true,
  forceEmailVerification: false,
  enableCaptcha: false,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Même base d'URL que le reste de l'application (services/api.js).
      // Sans elle, le site déployé appelait le localhost du VISITEUR, jamais joignable.
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/settings/public`);
      const data = await response.json();
      
      if (data.success) {
        const publicSettings = data.data || {};
        console.log('✅ Paramètres publics chargés:', publicSettings);
        
        setSettings(prev => ({
          ...prev,
          ...publicSettings,
        }));
      } else {
        console.log('ℹ️ Utilisation des paramètres par défaut');
      }
    } catch (error) {
      console.error('❌ Erreur chargement paramètres publics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const isFeatureEnabled = (featureKey) => {
    return settings[featureKey] === true;
  };

  const getSetting = (key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await adminService.saveSettings(settings);
      console.log('✅ Paramètres sauvegardés');
      
      await loadSettings();
      window.dispatchEvent(new Event('settings-updated'));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      error,
      loadSettings,
      isFeatureEnabled,
      getSetting,
      updateSetting,
      saveSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}