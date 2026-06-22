const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const STRATEGY = process.env.AI_TRYON_STRATEGY || 'openai';

// ── Utilitaires ──────────────────────────────────────────────────────────────

function imageToBase64(imagePath) {
  const full = path.resolve(imagePath);
  if (!fs.existsSync(full)) throw new Error(`Image introuvable : ${full}`);
  return fs.readFileSync(full).toString('base64');
}

function getMimeType(p) {
  const ext = path.extname(p).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol.get(url, (response) => {
      // Gérer les redirections
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    }).on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
  });
}

function httpsPost(hostname, path_url, headers, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({
      hostname, path: path_url, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...headers }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Réponse invalide de ${hostname} : ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function httpsGet(hostname, path_url, headers) {
  return new Promise((resolve, reject) => {
    https.get({ hostname, path: path_url, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Réponse invalide`)); }
      });
    }).on('error', reject);
  });
}

// ── Stratégie OpenAI : GPT-4o Vision + DALL-E 3 ─────────────────────────────
//
// Étape 1 → GPT-4o décrit la personne (photo utilisateur)
// Étape 2 → GPT-4o décrit le vêtement (image produit)
// Étape 3 → DALL-E 3 génère l'image de synthèse
//
async function generateWithOpenAI(userPhotoPath, productImagePath, productInfo = {}) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY manquant dans .env');

  const authHeader = { 'Authorization': `Bearer ${OPENAI_KEY}` };

  const userB64    = imageToBase64(userPhotoPath);
  const userMime   = getMimeType(userPhotoPath);
  const prodB64    = imageToBase64(productImagePath);
  const prodMime   = getMimeType(productImagePath);

  // ── 1. Description de la personne ──
  console.log('[aiTryonService] Étape 1 : analyse morphologique via GPT-4o...');
  const step1 = await httpsPost('api.openai.com', '/v1/chat/completions', authHeader, {
    model: 'gpt-4o',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${userMime};base64,${userB64}` } },
        { type: 'text', text: 'Décris cette personne pour une séance photo de mode professionnelle : silhouette, teint, couleur de cheveux, posture, genre apparent. Format court, factuel, 2-3 phrases.' }
      ]
    }]
  });
  if (step1.error) throw new Error(`GPT-4o (personne) : ${step1.error.message}`);
  const personDesc = step1.choices[0].message.content.trim();
  console.log('[aiTryonService] Personne :', personDesc);

  // ── 2. Description du vêtement ──
  console.log('[aiTryonService] Étape 2 : analyse du vêtement via GPT-4o...');
  const step2 = await httpsPost('api.openai.com', '/v1/chat/completions', authHeader, {
    model: 'gpt-4o',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${prodMime};base64,${prodB64}` } },
        { type: 'text', text: 'Décris ce vêtement pour une génération d\'image : type exact, couleur(s) précises, coupe, matière apparente, détails distinctifs. Format: 1-2 phrases.' }
      ]
    }]
  });
  if (step2.error) throw new Error(`GPT-4o (vêtement) : ${step2.error.message}`);
  const garmentDesc = step2.choices[0].message.content.trim();
  console.log('[aiTryonService] Vêtement :', garmentDesc);

  // ── 3. Génération DALL-E 3 ──
  console.log('[aiTryonService] Étape 3 : génération image DALL-E 3...');
  const prompt = [
    'Photo de mode professionnelle haute résolution, éclairage studio, fond blanc épuré.',
    `${personDesc}`,
    `La personne porte : ${garmentDesc}.`,
    productInfo.name ? `Article : ${productInfo.name}.` : '',
    'Pose naturelle et décontractée, rendu photoréaliste net, style catalogue de mode haut de gamme.',
    'Ne montre que la personne habillée, pas d\'accessoires supplémentaires.'
  ].filter(Boolean).join(' ');

  const step3 = await httpsPost('api.openai.com', '/v1/images/generate', authHeader, {
    model: 'dall-e-3',
    prompt,
    n: 1,
    quality: 'hd',
    size: '1024x1024',
    style: 'natural',
  });
  if (step3.error) throw new Error(`DALL-E 3 : ${step3.error.message}`);

  return {
    imageUrl: step3.data[0].url,
    revisedPrompt: step3.data[0].revised_prompt,
    strategy: 'openai',
    personDesc,
    garmentDesc,
  };
}

// ── Stratégie Replicate : IDM-VTON (qualité supérieure, spécialisé mode) ─────
//
// Modèle conçu exclusivement pour le virtual try-on.
// Prend directement person_img + garment_img → résultat réaliste.
//
async function generateWithReplicate(userPhotoPath, productImagePath) {
  const TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!TOKEN) throw new Error('REPLICATE_API_TOKEN manquant dans .env');

  const authHeader = { 'Authorization': `Token ${TOKEN}` };
  const personB64  = imageToBase64(userPhotoPath);
  const garmentB64 = imageToBase64(productImagePath);
  const personMime = getMimeType(userPhotoPath);
  const garmentMime = getMimeType(productImagePath);

  // Lancer la prédiction
  console.log('[aiTryonService] Lancement Replicate IDM-VTON...');
  const pred = await httpsPost('api.replicate.com', '/v1/predictions', authHeader, {
    version: '906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f',
    input: {
      human_img:    `data:${personMime};base64,${personB64}`,
      garm_img:     `data:${garmentMime};base64,${garmentB64}`,
      garment_des:  'fashion clothing item',
      is_checked:       true,
      is_checked_crop:  false,
      denoise_steps:    30,
      seed:             42,
    }
  });
  if (pred.error) throw new Error(`Replicate lancement : ${pred.error}`);

  // Polling (max 3 min)
  const predId = pred.id;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const status = await httpsGet('api.replicate.com', `/v1/predictions/${predId}`, authHeader);
    console.log(`[aiTryonService] Replicate status : ${status.status}`);
    if (status.status === 'succeeded') {
      const outputUrl = Array.isArray(status.output) ? status.output[0] : status.output;
      return { imageUrl: outputUrl, strategy: 'replicate' };
    }
    if (status.status === 'failed') throw new Error(`Replicate failed : ${status.error}`);
  }
  throw new Error('Replicate timeout (> 3 min)');
}

// ── Point d'entrée public ────────────────────────────────────────────────────

/**
 * Génère une image d'essayage virtuel IA.
 *
 * @param {string} userPhotoPath     Chemin absolu ou relatif vers la photo utilisateur
 * @param {string} productImagePath  Chemin absolu ou relatif vers l'image du produit
 * @param {object} productInfo       { name, description } — utilisé dans le prompt
 * @returns {{ servedPath, strategy, generatedAt, personDesc?, garmentDesc? }}
 */
async function generateVirtualTryon(userPhotoPath, productImagePath, productInfo = {}) {
  let result;

  if (STRATEGY === 'replicate') {
    result = await generateWithReplicate(userPhotoPath, productImagePath);
  } else {
    result = await generateWithOpenAI(userPhotoPath, productImagePath, productInfo);
  }

  // Sauvegarde locale de l'image générée
  const filename  = `ai-tryon-${Date.now()}.jpg`;
  const localPath = path.join('./uploads/tryons', filename);
  const servedPath = `/uploads/tryons/${filename}`;

  console.log('[aiTryonService] Téléchargement et sauvegarde du résultat...');
  await downloadImage(result.imageUrl, localPath);

  return {
    ...result,
    localPath,
    servedPath,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateVirtualTryon };