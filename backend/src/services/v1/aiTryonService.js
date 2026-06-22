const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8001/tryon";

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

  const response = await axios.post(AI_SERVICE_URL, form, {
    headers: form.getHeaders(),
    responseType: "arraybuffer",
    timeout: 120000,
  });

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