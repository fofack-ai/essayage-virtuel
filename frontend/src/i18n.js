import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr/translation.json';
import en from './locales/en/translation.json';

// ─── MIGRATION : NETTOYAGE D'UN CACHE ERRONÉ ───
// Avant ce correctif, la détection incluait 'navigator' : un navigateur
// configuré en anglais imposait l'anglais dès la première visite, et ce
// choix — que la personne n'avait pas fait elle-même — était aussitôt mis
// en cache dans localStorage sous la clé 'i18nextLng'.
//
// On a retiré 'navigator' de l'ordre de détection ci-dessous, mais cette
// valeur mise en cache À TORT reste présente chez toute personne ayant déjà
// visité le site avant ce changement. Sans nettoyage, elle resterait
// bloquée en anglais malgré le correctif, puisque seul 'localStorage' est
// consulté désormais.
//
// On efface donc cette valeur une seule fois, sauf si elle a été choisie
// explicitement via le sélecteur (marqueur 'i18nextLng_userSelected' posé
// par LanguageSwitcher). Après ce nettoyage ponctuel, fallbackLng ('fr')
// reprend la main tant qu'aucun choix explicite n'a été fait.
if (
  localStorage.getItem('i18nextLng') &&
  localStorage.getItem('i18nextLng_userSelected') !== 'true'
) {
  localStorage.removeItem('i18nextLng');
}

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
      // 'navigator' reste volontairement absent (voir la migration
      // ci-dessus pour le contexte). Le CFPD vend à Douala : le français
      // est la langue par défaut, l'anglais est un choix explicite du
      // client via le sélecteur.
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;