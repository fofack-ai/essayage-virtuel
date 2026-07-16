const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { cloudinary } = require("../../config/cloudinary");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8001/tryon";

// La génération sur ZeroGPU (file d'attente + inférence) peut dépasser
// 2 minutes : 120s coupait des générations en cours de route.
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "300000", 10); // 5 min

/** Vrai si la valeur est une URL http(s) (ex. Cloudinary) et non un chemin disque. */
function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

/**
 * Traduit la catégorie du produit en zone du corps comprise par CatVTON.
 * Sans ce paramètre, le modèle ne sait pas quelle partie remplacer.
 */
function mapClothType(categoryName = "") {
  const c = String(categoryName).toLowerCase();
  if (/(pantalon|jean|short|jupe|bas)/.test(c)) return "lower";
  if (/(robe|costume|ensemble|combinaison)/.test(c)) return "overall";
  return "upper";
}

/**
 * Extrait un message d'erreur lisible depuis une réponse d'erreur du
 * service IA (le body arrive en Buffer car responseType: "arraybuffer").
 */
function extractAiError(error) {
  if (error.response && error.response.data) {
    try {
      const body = JSON.parse(Buffer.from(error.response.data).toString("utf8"));
      if (body && body.message) return body.message;
    } catch (_) {
      /* body non-JSON : on tombe sur les cas génériques ci-dessous */
    }
  }

  if (error.code === "ECONNREFUSED") {
    return "Le service IA n'est pas démarré. Lancez-le puis réessayez.";
  }
  if (error.code === "ECONNABORTED") {
    return "La génération IA a pris trop de temps. Réessayez dans quelques minutes.";
  }
  return "Le service d'essayage virtuel est momentanément indisponible.";
}

/**
 * Charge une image en Buffer, qu'elle vienne d'une URL Cloudinary (production)
 * ou d'un fichier local (développement).
 */
async function loadImage(source, label) {
  if (isUrl(source)) {
    try {
      const remote = await axios.get(source, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
      return Buffer.from(remote.data);
    } catch (error) {
      console.error(`[aiTryonService] Téléchargement échoué (${label}) :`, source);
      throw new Error(`${label} : téléchargement impossible depuis Cloudinary.`);
    }
  }

  if (!fs.existsSync(source)) {
    throw new Error(`${label} introuvable`);
  }
  return fs.readFileSync(source);
}

/** Envoie l'image générée vers Cloudinary (tryon/results). */
function uploadResultToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tryon/results", resource_type: "image", format: "png" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function generateWithCatVTON({ personImagePath, garmentImagePath, clothType = "upper" }) {
  // Accepte indifféremment une URL Cloudinary ou un chemin local.
  const [personBuffer, garmentBuffer] = await Promise.all([
    loadImage(personImagePath, "Image utilisateur"),
    loadImage(garmentImagePath, "Image vêtement"),
  ]);

  const form = new FormData();
  form.append("person_image", personBuffer, { filename: "person.jpg" });
  form.append("garment_image", garmentBuffer, { filename: "garment.jpg" });
  form.append("cloth_type", clothType);

  let response;
  try {
    response = await axios.post(AI_SERVICE_URL, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: AI_TIMEOUT_MS,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  } catch (error) {
    console.error("[aiTryonService] Échec appel service IA :", error.message);
    throw new Error(extractAiError(error));
  }

  // Sécurité : on vérifie qu'on a bien reçu une image et pas autre chose.
  const contentType = response.headers["content-type"] || "";
  if (!contentType.startsWith("image/")) {
    console.error("[aiTryonService] Réponse inattendue :", contentType);
    throw new Error("Le service IA a renvoyé une réponse invalide.");
  }

  // Le résultat part sur Cloudinary et non plus sur le disque du serveur,
  // qui est éphémère sur Render.
  let uploaded;
  try {
    uploaded = await uploadResultToCloudinary(Buffer.from(response.data));
  } catch (error) {
    console.error("[aiTryonService] Upload Cloudinary échoué :", error.message);
    throw new Error("L'image générée n'a pas pu être enregistrée.");
  }

  return {
    imageUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
}

async function generateVirtualTryon(personImagePath, garmentImagePath, productInfo = {}) {
  const clothType = mapClothType(
    productInfo?.categoryName || productInfo?.category || ""
  );

  const result = await generateWithCatVTON({
    personImagePath,
    garmentImagePath,
    clothType,
  });

  return {
    servedPath: result.imageUrl,   // URL Cloudinary complète
    publicId: result.publicId,
    strategy: "catvton",
    clothType,
    generatedAt: new Date().toISOString(),
    personDesc: "Photo utilisateur analysée par le service IA TryOn",
    garmentDesc: productInfo?.name
      ? `Vêtement sélectionné : ${productInfo.name}`
      : "Vêtement sélectionné",
  };
}

module.exports = {
  generateWithCatVTON,
  generateVirtualTryon,
  mapClothType,
};