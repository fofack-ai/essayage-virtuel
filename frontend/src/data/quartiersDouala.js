/**
 * Quartiers de Douala — liste de référence du champ « Quartier » au checkout.
 *
 * Pourquoi une liste locale plutôt qu'une API (Google Places, Nominatim) :
 *  - le checkout est le pire endroit où dépendre du réseau ; ici la liste
 *    répond même hors connexion, instantanément et sans clé facturée ;
 *  - la couverture des quartiers de Douala par les APIs mondiales est très
 *    inégale : elles connaissent Bonapriso, elles ignorent Ndogpassi.
 *
 * ⚠️ Cette liste n'est PAS exhaustive — Douala compte environ 120 quartiers
 * et beaucoup de lieux-dits n'ont aucune source écrite. Elle sert à guider
 * la saisie, jamais à la contraindre : QuartierSelect accepte toujours le
 * texte libre. Ne jamais transformer ce champ en <select> fermé.
 *
 * Sources : Wikipédia (« Quartiers de Douala », catégorie « Quartier de
 * Douala », « Bonabéri ») et l'annuaire DoualaZoom.
 * À faire valider et compléter par l'équipe livraison du CFPD, qui connaît
 * le terrain mieux que n'importe quelle base de données.
 */
export const QUARTIERS_DOUALA = [
  'Akwa',
  'Akwa Nord',
  'Bali',
  'Bassa',
  'Bépanda',
  'Bessengue',
  'Bobongo',
  'Boko',
  'Bonabéri',
  'Bonadibong',
  'Bonaduma',
  'Bonaloka',
  'Bonamoussadi',
  'Bonanjo',
  'Bonapriso',
  'Bonassama',
  'Bonatéki',
  'Bonatone',
  'Bonamuti',
  'Bonendalé',
  'Borne 10',
  'Brazzaville',
  'C.C.C.',
  'Camp Yabassi',
  'Cité des Palmiers',
  'Cité Sic',
  'Deïdo',
  'Denver',
  'Entrée de Billes',
  'Essengue',
  'Grand Hangar',
  'Grand-Moulin',
  'Japoma',
  'Kassalafam',
  'Kotto',
  'Koumassi',
  'Logbaba',
  'Logbessou',
  'Logpom',
  'Makepé',
  'Mambanda',
  'Mpanjo',
  'Ndobo',
  'Ndogbong',
  'Ndogmbe',
  'Ndogpassi',
  'Ndogsimbi',
  'Ndokoti',
  'New Bell',
  'New Deido',
  'New Town',
  'Ngangue',
  'Ngoma',
  'Ngwelé',
  'Nyalla',
  'Nylon',
  'Plateau Joss',
  'Santa Barbara',
  'So-Boum',
  'Sodiko',
  'Song-Mahop',
  'Yansoki',
  'Yassa',
  'Youpwé',
];

/**
 * Normalisation pour la recherche : sans accents, sans casse, sans espaces
 * superflus. « bepanda », « Bépanda » et « BEPANDA  » doivent trouver la
 * même entrée — un client ne tape pas les accents sur un clavier de téléphone.
 */
export const normalizeQuartier = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default QUARTIERS_DOUALA;