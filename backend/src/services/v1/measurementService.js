const measurementModel = require("../../models/v1/measurementModel");

/**
 * Tableau des tailles, repris du guide des tailles du site (en cm).
 * Chaque entrée = plage [min, max] du tour de corps correspondant à la taille.
 */
const SIZE_CHART = [
  { size: "XS",  chest: [76, 81],   waist: [58, 63],  hip: [84, 89] },
  { size: "S",   chest: [82, 87],   waist: [64, 69],  hip: [90, 95] },
  { size: "M",   chest: [88, 93],   waist: [70, 75],  hip: [96, 101] },
  { size: "L",   chest: [94, 99],   waist: [76, 81],  hip: [102, 107] },
  { size: "XL",  chest: [100, 105], waist: [82, 87],  hip: [108, 113] },
  { size: "XXL", chest: [106, 111], waist: [88, 93],  hip: [114, 119] },
];

/**
 * Aisance (ease) en cm à ajouter/retirer selon le type de vêtement, avant
 * comparaison au tableau des tailles ci-dessus (qui reflète des mensurations
 * corporelles nues). Valeurs indicatives, à affiner avec le patronier.
 */
const EASE_BY_CATEGORY = {
  chemise: { fitted: -1, stretch: 1 },
  costume: { fitted: -1.5, stretch: 0.5 },
  veste:   { fitted: -1.5, stretch: 0.5 },
  robe:    { fitted: -1, stretch: 1.5 },
  pantalon:{ fitted: -0.5, stretch: 2 },
  default: { fitted: -1, stretch: 1 },
};

function getEaseAdjustment(categoryName = "", isStretchFabric = false) {
  const key = Object.keys(EASE_BY_CATEGORY).find((k) =>
    (categoryName || "").toLowerCase().includes(k)
  );
  const table = EASE_BY_CATEGORY[key] || EASE_BY_CATEGORY.default;
  return isStretchFabric ? table.stretch : table.fitted;
}

/** Bornes de plausibilité anatomique — rejette les saisies aberrantes */
const PLAUSIBLE_RANGES = {
  heightCm: [120, 220],
  shoulderCm: [30, 60],
  chestCm: [60, 160],
  waistCm: [50, 150],
  hipCm: [60, 160],
  inseamCm: [50, 100],
};

function validateMeasurements(data) {
  const errors = [];
  for (const [field, [min, max]] of Object.entries(PLAUSIBLE_RANGES)) {
    const val = data[field];
    if (val === undefined || val === null || val === "") continue;
    const num = Number(val);
    if (Number.isNaN(num) || num < min || num > max) {
      errors.push(`${field} doit être compris entre ${min} et ${max} cm`);
    }
  }
  if (!data.chestCm && !data.waistCm && !data.hipCm) {
    errors.push("Au moins une mesure (poitrine, taille ou hanches) est requise");
  }
  return errors;
}

/**
 * Estime les tours (poitrine, taille, hanches) en cm à partir des seules
 * données que le client connaît sans mètre-ruban : sa taille, son poids
 * et sa morphologie. Sert au mode "Express" de la page d'essayage.
 *
 * Basé sur l'IMC : un même poids réparti sur une grande taille donne un
 * tour plus petit que sur une petite taille. La morphologie décale ensuite
 * le résultat (les épaules/ossature varient d'une personne à l'autre).
 *
 * IMPORTANT : ce sont des ESTIMATIONS. Le résultat doit être enregistré avec
 * confidence "estimee", et le client peut toujours corriger la taille conseillée.
 */
function estimateFromHeightWeight({ heightCm, weightKg, morphology = "normale" }) {
  const h = Number(heightCm);
  const w = Number(weightKg);

  if (!h || !w || h < 120 || h > 220 || w < 30 || w > 200) {
    const err = new Error("Taille (120-220 cm) et poids (30-200 kg) requis et réalistes");
    err.statusCode = 400;
    throw err;
  }

  const heightM = h / 100;
  const bmi = w / (heightM * heightM);

  // Le tour de poitrine croît avec l'IMC. Coefficients calés sur des
  // moyennes de confection ; volontairement simples pour être lisibles
  // et ajustables par la couturière (les 2 constantes ci-dessous).
  let chest = 58 + bmi * 1.55;

  // Décalage selon la morphologie déclarée par le client
  const morphoShift = { mince: -4, normale: 0, corpulent: 4 };
  chest += morphoShift[morphology] ?? 0;

  // Taille et hanches dérivées du tour de poitrine.
  // ⚠️ Ces deux écarts DOIVENT rester cohérents avec SIZE_CHART ci-dessus,
  // qui suppose taille = poitrine - 18 et hanches = poitrine + 8 sur toutes
  // les lignes. Avec -16/+4, l'estimation et le tableau se contredisaient :
  // la taille recommandée pouvait être étiquetée "serrée" par evaluateFit.
  const waist = chest - 18;
  const hip = chest + 8;

  const round = (n) => Math.round(n * 2) / 2; // arrondi au demi-cm
  return {
    chestCm: round(chest),
    waistCm: round(waist),
    hipCm: round(hip),
    bmi: Math.round(bmi * 10) / 10,
  };
}

/**
 * Calcule la taille recommandée à partir de mesures RÉELLES en cm.
 * Remplace l'ancien recommendSizeFromMeasurements() basé sur un ratio
 * épaule/hauteur issu d'une pose estimée — non exploitable pour un tailleur.
 */
function recommendSize({ chestCm, waistCm, hipCm, categoryName, isStretchFabric }) {
  const ease = getEaseAdjustment(categoryName, isStretchFabric);

  const effective = {
    chest: chestCm ? Number(chestCm) + ease : null,
    waist: waistCm ? Number(waistCm) + ease : null,
    hip: hipCm ? Number(hipCm) + ease : null,
  };

  let best = null;
  let bestDistance = Infinity;

  for (const row of SIZE_CHART) {
    const distances = [];
    if (effective.chest !== null) distances.push(distanceToRange(effective.chest, row.chest));
    if (effective.waist !== null) distances.push(distanceToRange(effective.waist, row.waist));
    if (effective.hip !== null) distances.push(distanceToRange(effective.hip, row.hip));

    if (distances.length === 0) continue;
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

    if (avgDistance < bestDistance) {
      bestDistance = avgDistance;
      best = row.size;
    }
  }

  // Score de confiance : 100% si toutes les mesures tombent pile dans la plage
  const score = Math.max(0, Math.round(100 - bestDistance * 8));

  return {
    recommendedSize: best,
    score,
    easeAppliedCm: ease,
    withinRange: bestDistance === 0,
  };
}


/**
 * Évalue comment UNE taille donnée tombera sur le client.
 * Retourne un verdict chiffré par zone (poitrine, taille, hanches).
 * C'est ce qui permet de dire : "le S sera trop serré de 7 cm à la poitrine".
 */
function evaluateFit({ size, chestCm, waistCm, hipCm, categoryName, isStretchFabric }) {
  const row = SIZE_CHART.find((r) => r.size === String(size).toUpperCase());
  if (!row) {
    const err = new Error(`Taille inconnue : ${size}`);
    err.statusCode = 400;
    throw err;
  }

  const ease = getEaseAdjustment(categoryName, isStretchFabric);
  const zones = [];

  const check = (zone, value, [min, max]) => {
    if (value === undefined || value === null || value === "") return;
    const v = Number(value) + ease;
    // Écart par rapport à la plage : négatif = vêtement large, positif = serré
    let deltaCm = 0;
    if (v < min) deltaCm = -(min - v);
    else if (v > max) deltaCm = v - max;

    // Tolérance de 2 cm de part et d'autre de la plage : en confection, un
    // écart de 1 à 2 cm ne se ressent pas. Sans cette marge, la taille
    // recommandée pouvait être étiquetée "ample" et contredire la reco.
    const TOL = 2;
    let verdict;
    if (v > max + TOL + 4) verdict = "tres_serre";
    else if (v > max + TOL) verdict = "serre";
    else if (v >= min - TOL) verdict = "ajuste";
    else if (v >= min - TOL - 4) verdict = "ample";
    else verdict = "tres_ample";

    zones.push({ zone, deltaCm: Math.round(deltaCm * 10) / 10, verdict });
  };

  check("poitrine", chestCm, row.chest);
  check("taille", waistCm, row.waist);
  check("hanches", hipCm, row.hip);

  if (zones.length === 0) {
    const err = new Error("Aucune mensuration fournie");
    err.statusCode = 400;
    throw err;
  }

  // Le verdict global est celui de la zone la plus contraignante :
  // un vêtement qui bloque à la poitrine ne se porte pas, même si la taille passe.
  const ORDER = { tres_serre: 4, serre: 3, ajuste: 0, ample: 1, tres_ample: 2 };
  const worst = zones.reduce((a, b) => (ORDER[b.verdict] > ORDER[a.verdict] ? b : a));

  const LABEL = {
    tres_serre: "Trop petit",
    serre: "Serré",
    ajuste: "Taille idéale",
    ample: "Ample",
    tres_ample: "Trop grand",
  };

  return {
    size: row.size,
    verdict: worst.verdict,
    label: LABEL[worst.verdict],
    wearable: worst.verdict !== "tres_serre" && worst.verdict !== "tres_ample",
    zones,
easeAppliedCm: ease,
  };
}        

/**
 * Évalue TOUTES les tailles d'un coup : permet à l'interface d'afficher
 * un verdict sous chaque bouton de taille (XS, S, M, L, XL, XXL).
 */
function evaluateAllSizes({ chestCm, waistCm, hipCm, categoryName, isStretchFabric }) {
  return SIZE_CHART.map((row) =>
    evaluateFit({
      size: row.size,
      chestCm,
      waistCm,
      hipCm,
      categoryName,
      isStretchFabric,
    })
  );
}

/** Distance (en cm) d'une valeur à la plage la plus proche (0 si dedans) */
function distanceToRange(value, [min, max]) {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

async function saveMeasurements(userId, rawData) {
  const errors = validateMeasurements(rawData);
  if (errors.length > 0) {
    const err = new Error(errors.join("; "));
    err.statusCode = 400;
    throw err;
  }
  const id = await measurementModel.create(userId, rawData);
  return measurementModel.findById(id);
}

async function getLatest(userId) {
  const measurement = await measurementModel.findLatestByUserId(userId);
  if (!measurement) {
    const err = new Error("Aucune mensuration enregistrée pour cet utilisateur");
    err.statusCode = 404;
    throw err;
  }
  return measurement;
}
/* ════════════════════════════════════════════════════════════════════
 * ESTIMATION HYBRIDE : IMC (corpulence) + PHOTO (carrure réelle)
 * ════════════════════════════════════════════════════════════════════
 *
 * Une photo n'a AUCUNE échelle : le même corps photographié à 1 m ou à 5 m
 * produit les mêmes pixels relatifs. Elle ne peut donc pas donner de
 * centimètres. Ce qu'elle donne, c'est une FORME : cette personne est-elle
 * large ou étroite POUR sa taille ? C'est la taille saisie par le client
 * qui convertit cette forme en centimètres.
 *
 * Le frontend (getBodyRatios dans TryOn.jsx) envoie des ratios sans unité :
 *     shoulderRatio = écart 3D inter-épaules / stature estimée
 *     hipRatio      = écart 3D inter-hanches / stature estimée
 * Les deux sont calculés sur poseWorldLandmarks (coordonnées 3D), donc
 * insensibles au format de l'image et à la rotation du buste.
 *
 * ⚠️ Les références ci-dessous DOIVENT être définies exactement comme le
 * frontend calcule ses ratios, sinon la correction est biaisée en
 * permanence. Ce sont des moyennes de population adulte : à recalibrer sur
 * les clients du CFPD le jour où un échantillon mesuré au mètre existe.
 */
const REF_RATIOS = {
  shoulder: 0.215, // écart inter-épaules MediaPipe ÷ stature, adulte moyen
  hip: 0.145,      // écart inter-hanches MediaPipe ÷ stature, adulte moyen
};

/**
 * Poids de la correction photo : 0.35 et non 0.5. La photo est bruitée
 * (pose, vêtements amples, distorsion d'objectif), l'IMC est la référence
 * calibrée. La photo ajuste, elle ne décide pas.
 */
const PHOTO_WEIGHT = 0.35;

/** Bornes du facteur de correction. Au-delà, c'est une erreur de détection
 *  et non une morphologie : ±15 % couvre déjà du fluet au carré. */
const K_MIN = 0.85;
const K_MAX = 1.15;

const clampK = (v, a, b) => Math.max(a, Math.min(b, v));
const round1 = (n) => Math.round(n * 2) / 2; // arrondi au demi-cm

/** Applique un ratio photo à une mesure de base, avec pondération et bornes. */
function blendWithPhoto(baseCm, ratio, refRatio) {
  const k = clampK(ratio / refRatio, K_MIN, K_MAX);
  return baseCm * (1 - PHOTO_WEIGHT + PHOTO_WEIGHT * k);
}

/**
 * Estimation finale des tours. Rétrocompatible : sans photo exploitable,
 * retourne exactement l'estimation IMC (photoUsed: false) — le mode Express
 * reste strictement inchangé.
 *
 * @param {number}  heightCm        taille debout saisie (obligatoire)
 * @param {number}  weightKg        poids saisi (obligatoire)
 * @param {string}  morphology      mince | normale | corpulent
 * @param {number} [shoulderRatio]  ratio sans unité issu de la photo
 * @param {number} [hipRatio]       ratio sans unité issu de la photo
 * @param {string} [photoQuality]   'good' | 'poor' | 'bad' (calculé côté client)
 */
function estimateFromPhotoAndBody({
  heightCm,
  weightKg,
  morphology,
  shoulderRatio,
  hipRatio,
  photoQuality,
}) {
  const base = estimateFromHeightWeight({ heightCm, weightKg, morphology });

  // Garde-fou serveur : un ratio hors de ces bornes ne vient pas d'un corps
  // humain debout de face, c'est une détection ratée. On l'ignore plutôt que
  // de dégrader une estimation IMC qui, elle, est fiable.
  const sane = (r, ref) => Number.isFinite(r) && r > ref * 0.6 && r < ref * 1.6;
  const useShoulder =
    photoQuality !== "bad" && sane(Number(shoulderRatio), REF_RATIOS.shoulder);
  const useHip = photoQuality !== "bad" && sane(Number(hipRatio), REF_RATIOS.hip);

  if (!useShoulder && !useHip) {
    return {
      ...base,
      photoUsed: false,
      photoNote:
        photoQuality === "bad"
          ? "Photo inexploitable pour la morphologie : estimation basée sur la taille et le poids seuls."
          : null,
    };
  }

  let chest = base.chestCm;
  let hip = base.hipCm;

  // Les épaules corrigent la poitrine : c'est la carrure qui conditionne
  // l'emmanchure, et c'est elle qui bloque l'enfilage d'une veste.
  if (useShoulder) chest = blendWithPhoto(chest, Number(shoulderRatio), REF_RATIOS.shoulder);
  if (useHip) hip = blendWithPhoto(hip, Number(hipRatio), REF_RATIOS.hip);

  // La relation taille = poitrine − 18 doit être conservée : c'est
  // l'hypothèse sur laquelle SIZE_CHART est construit (cf. estimateFromHeightWeight).
  return {
    chestCm: round1(chest),
    waistCm: round1(chest - 18),
    hipCm: round1(hip),
    shoulderCm: useShoulder ? round1(Number(shoulderRatio) * Number(heightCm)) : null,
    bmi: base.bmi,
    photoUsed: true,
    photoQuality: photoQuality || "good",
    photoNote:
      photoQuality === "poor"
        ? "Photo de qualité moyenne : correction morphologique appliquée avec prudence."
        : null,
  };
}

module.exports = {
  SIZE_CHART,
  evaluateFit,
  evaluateAllSizes,
  estimateFromPhotoAndBody,
  validateMeasurements,
  estimateFromHeightWeight,
  recommendSize,
  saveMeasurements,
  getLatest,
};