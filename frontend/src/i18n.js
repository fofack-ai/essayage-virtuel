import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],

    // 'en-US' renvoyé par le navigateur doit être ramené à 'en', qui est la
    // seule des deux formes présente dans supportedLngs.
    load: 'languageOnly',

    interpolation: {
      escapeValue: false, // React échappe déjà le HTML
    },

    detection: {
      // 'navigator' a été retiré volontairement. Il était consulté au premier
      // passage, avant que localStorage ne contienne quoi que ce soit : un
      // client dont le téléphone est configuré en anglais voyait le site
      // s'ouvrir en anglais, et ce choix qu'il n'avait pas fait était aussitôt
      // mis en cache. fallbackLng ne corrigeait rien — il n'intervient que si
      // la détection échoue, or elle réussissait, elle répondait juste
      // « anglais ».
      //
      // Le CFPD vend à Douala : le français est la langue par défaut, l'anglais
      // est un choix explicite du client via le sélecteur.
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;