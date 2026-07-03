const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8001/tryon";

// La génération sur ZeroGPU (file d'attente + inférence) peut dépasser
// 2 minutes : 120s coupait des générations en cours de route.
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "300000", 10); // 5 min

/**
 * Extrait un message d'erreur lisible depuis une réponse d'erreur du
 * service IA (le body arrive en Buffer car responseType: "arraybuffer").
 */
function extractAiError(error) {
  // Le service IA a répondu (ex: 502 avec un JSON { message })
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

async function generateWithCatVTON({ personImagePath, garmentImagePath }) {
  if (!fs.existsSync(personImagePath)) {
    throw new Error("Image utilisateur introuvable");
  }
  if (!fs.existsSync(garmentImagePath)) {
    throw new Error("Image vêtement introuvable");
  }

  const form = new FormData();
  form.append("person_image", fs.createReadStream(personImagePath));
  form.append("garment_image", fs.createReadStream(garmentImagePath));

  let response;
  try {
    response = await axios.post(AI_SERVICE_URL, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: AI_TIMEOUT_MS,
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

  const outputDir = path.join(__dirname, "../../../uploads/tryons");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `tryon_${Date.now()}.png`;
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, response.data);

  return {
    imageUrl: `/uploads/tryons/${fileName}`,
    localPath: outputPath,
  };
}

async function generateVirtualTryon(personImagePath, garmentImagePath, productInfo = {}) {
  const result = await generateWithCatVTON({
    personImagePath,
    garmentImagePath,
  });

  return {
    servedPath: result.imageUrl,
    localPath: result.localPath,
    strategy: "catvton",
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
};
