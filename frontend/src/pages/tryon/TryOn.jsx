import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api, getImageUrl } from '../../services/api';
import BottomNav from '../../components/layout/BottomNav';


// MediaPipe
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import LoadingPage from '../../components/common/LoadingPage';

import { Sparkles, Shirt, User, Camera as CameraIcon, Info } from 'lucide-react';


function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1')
    .replace(/\/api(\/v1)?/, '');
  return `${base}${url}`;
}

/* ── Constantes de style ── */
const T = {
  ink: '#1A1A1A',
  cream: '#F9F9F9',
  warm: '#F1F5F9',
  white: '#FFFFFF',
  red: '#C0392B',
  redDark: '#8E241D',
  blue: '#5B7FA6',
  blueDark: '#355C86',
  blueNavy: '#26384D',
  blueLight: '#E6EEF6',
  muted: '#6A6F78',
  border: 'rgba(26,26,26,0.105)',
};

/* ── Mensurations : extraction des ratios morphologiques ── */

const LM = {
  NOSE: 0,
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_HIP: 23,
  R_HIP: 24,
  L_ANKLE: 27,
  R_ANKLE: 28,
};
const REQUIRED_LM = Object.values(LM);

/**
 * Hauteur nez → chevilles, exprimée en fraction de la stature debout.
 * Le nez se situe vers 0,925 H et la cheville (malléole) vers 0,045 H :
 * l'écart couvre donc ~0,88 H. Sans cette correction, on prendrait la
 * distance nez-chevilles pour la taille entière et tous les ratios
 * seraient surestimés d'environ 14 %.
 */
const NOSE_TO_ANKLE_FRACTION = 0.88;

const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Extrait les ratios morphologiques sans unité à partir des landmarks 3D.
 *
 * Pourquoi poseWorldLandmarks et pas poseLandmarks :
 *  - poseLandmarks normalise x par la LARGEUR de l'image et y par sa
 *    HAUTEUR. Le rapport largeur_épaules / hauteur_corps y dépend donc du
 *    format de la photo (3:4, 9:16…) et non du corps. C'est inexploitable.
 *  - poseWorldLandmarks donne des coordonnées 3D métriques, origine au
 *    centre du bassin. On peut y mesurer une vraie distance entre deux
 *    points, même si le buste est légèrement tourné (on utilise z).
 *
 * L'échelle absolue de ces mètres est estimée par le modèle et donc peu
 * fiable — mais on divise deux longueurs issues du MÊME repère, donc
 * l'échelle se simplifie. Ce qui reste est une forme : large ou étroit
 * POUR sa taille. C'est la taille saisie par le client qui la convertit
 * en centimètres, côté serveur.
 *
 * @returns {{shoulderRatio, hipRatio, quality, rotationDeg, minVisibility}|null}
 */
function getBodyRatios(results) {
  const W = results?.poseWorldLandmarks;
  const I = results?.poseLandmarks;
  if (!W || !I) return null;
  if (REQUIRED_LM.some((i) => !W[i] || !I[i])) return null;

  // Visibilité : MediaPipe place des points même quand ils sont hors cadre
  // ou masqués, en les devinant. Un point deviné ne doit pas mesurer un corps.
  const minVisibility = Math.min(
    ...REQUIRED_LM.map((i) => (typeof I[i].visibility === 'number' ? I[i].visibility : 0))
  );

  // Stature estimée : axe vertical uniquement (y croît vers le bas).
  const ankleY = (W[LM.L_ANKLE].y + W[LM.R_ANKLE].y) / 2;
  const noseToAnkle = ankleY - W[LM.NOSE].y;
  if (!(noseToAnkle > 0.5)) return null; // corps assis, allongé ou tronqué
  const statureM = noseToAnkle / NOSE_TO_ANKLE_FRACTION;

  const shoulderM = dist3(W[LM.L_SHOULDER], W[LM.R_SHOULDER]);
  const hipM = dist3(W[LM.L_HIP], W[LM.R_HIP]);

  // Rotation du buste : si une épaule est nettement plus proche de
  // l'objectif que l'autre, l'estimation de z devient hasardeuse.
  const dz = Math.abs(W[LM.L_SHOULDER].z - W[LM.R_SHOULDER].z);
  const dx = Math.abs(W[LM.L_SHOULDER].x - W[LM.R_SHOULDER].x);
  const rotationDeg = (Math.atan2(dz, Math.max(dx, 1e-6)) * 180) / Math.PI;

  let quality = 'good';
  if (minVisibility < 0.5 || rotationDeg > 35) quality = 'bad';
  else if (minVisibility < 0.75 || rotationDeg > 20) quality = 'poor';

  return {
    shoulderRatio: shoulderM / statureM,
    hipRatio: hipM / statureM,
    quality,
    rotationDeg: Math.round(rotationDeg),
    minVisibility: Math.round(minVisibility * 100) / 100,
  };
}

/** Message d'aide affiché quand la photo ne permet pas de lire la morphologie. */
function photoQualityHint(m) {
  if (!m) return "Nous n'avons pas pu lire votre morphologie sur cette photo : la recommandation utilisera votre taille et votre poids.";
  if (m.quality === 'bad' && m.rotationDeg > 35)
    return 'Placez-vous bien face à l’objectif : votre buste est trop tourné pour mesurer votre carrure.';
  if (m.quality === 'bad')
    return 'Cadrez-vous en entier, des pieds à la tête, sur un fond dégagé : la photo ne permet pas de lire votre carrure.';
  if (m.quality === 'poor')
    return 'Photo exploitable, mais une prise de vue de face et en pied donnerait une taille plus juste.';
  return null;
}

/** Score de compatibilité (0-100) — proportions du client vs. proportions de référence */
function calculateScoreFromMeasurements(m) {
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const shoulderScore = clamp01(1 - Math.abs(m.shoulderRatio - 0.215) / 0.215);
  const hipScore = clamp01(1 - Math.abs(m.hipRatio - 0.145) / 0.145);
  return Math.round(((shoulderScore + hipScore) / 2) * 100);
}

/* ── Composant principal ── */
export default function TryOn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { user } = useAuth();
  const { addItem } = useCart();

  // États produit
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // ── États IA (à ajouter avec les autres useState) ──
const [aiGenerating, setAiGenerating] = useState(false);
const [aiResult, setAiResult]         = useState(null);
const [aiError, setAiError]           = useState(null);
const [pageMessage, setPageMessage]   = useState(null); // { type: 'error'|'info', text }

  // États de la cabine
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: analyse, 3: résultats
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [score, setScore] = useState(null);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [tryonId, setTryonId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [measurements, setMeasurements] = useState(null);


  // ── Moteur de recommandation de taille ──
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [morphology, setMorphology] = useState('normale');
  const [fitData, setFitData] = useState(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState(null);
  
  // Téléphone/tablette : pointeur grossier => appareil photo natif
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  // Refs
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  /* ── 1. Chargement du produit ── */
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoadingProduct(true);
        let prod;

        if (productId) {
          const response = await api.get(`/products/${productId}`);
          prod = response.data;
        }

        if (!prod) {
          alert('Aucun produit disponible pour l\'essayage');
          navigate('/catalogue');
          return;
        }

        setProduct(prod);

        // Tailles
        const sizeList = prod.sizes?.length
          ? prod.sizes.map(s => s.sizeLabel || s.label || s.size || s)
          : ['XS', 'S', 'M', 'L', 'XL'];
        setSizes(sizeList);
        setSelectedSize(sizeList[0] || 'M');

        // Couleurs
        const colorList = prod.colors?.length
          ? prod.colors
          : prod.color
            ? [prod.color]
            : ['#1a1410'];
        setColors(colorList);
        setSelectedColor(colorList[0] || '#1a1410');

      } catch (err) {
        console.error('Erreur chargement produit:', err);
        alert('Produit introuvable');
        navigate('/catalogue');
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, [productId, navigate]);

  /* ── 2. Gestion de la photo ── */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPageMessage(null);
    setPhoto(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setUseWebcam(false);
    setWebcamActive(false);
    setPoseLandmarks(null);
    setStep(1);
  };

  /* ── 3. Webcam ── */
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setUseWebcam(true);
        setWebcamActive(true);
        setPhotoPreview(null);
        setPhoto(null);
        setPoseLandmarks(null);
        setStep(1);
        initializePoseDetection(stream);
      }
    } catch (err) {
      alert("Impossible d'accéder à la caméra : " + err.message);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
    setWebcamActive(false);
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
  };

  /* ── 4. MediaPipe : détection de pose ── */
  const initializePoseDetection = useCallback((stream) => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        setPoseLandmarks(results.poseLandmarks);
        drawPoseOnCanvas(results.poseLandmarks);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();
    cameraRef.current = camera;
  }, []);

  // Dessin des landmarks et du vêtement sur le canvas
  const drawPoseOnCanvas = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 640;
    canvas.height = 480;

    // Dessiner une simulation de vêtement (rectangle)
    drawGarment(ctx, landmarks, 640, 480);

    // Dessiner les landmarks
    drawConnectors(ctx, landmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
    drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
  };

  // Simulation d'un vêtement (à améliorer avec un vrai rendu 3D)
  const drawGarment = (ctx, landmarks, w, h) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2 * w;
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2 * h;
    const width = Math.abs(rightShoulder.x - leftShoulder.x) * w * 1.2;
    const height = Math.abs(leftHip.y - leftShoulder.y) * h * 1.3;

    ctx.fillStyle = 'rgba(201,169,110,0.25)';
    ctx.beginPath();
    ctx.rect(shoulderMidX - width / 2, shoulderMidY, width, height);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,169,110,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  /* ── 5. Analyse IA ── */
  const analyzePhoto = async () => {
    if (!photoPreview && !useWebcam) return;
    setStep(2);
    setAnalysisProgress(0);

    // Récupérer l'image source
    let imageSrc = photoPreview;
    if (useWebcam && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      imageSrc = canvas.toDataURL('image/jpeg');
    }

    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve) => { img.onload = resolve; });

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // On garde l'objet results ENTIER : poseWorldLandmarks (3D métrique) est
    // indispensable au calcul des ratios, poseLandmarks ne suffit pas.
    let detectedResults = null;
    let detectedLandmarks = null;
    pose.onResults((results) => {
      if (results.poseLandmarks) {
        detectedResults = results;
        detectedLandmarks = results.poseLandmarks;
        setPoseLandmarks(results.poseLandmarks);
        drawPoseOnCanvas(results.poseLandmarks);
      }
    });

    await pose.send({ image: img });

    if (!detectedLandmarks) {
      setPageMessage({
        type: 'error',
        text: "Nous n'avons pas reconnu de personne sur cette photo. Envoyez une photo de vous, de face et en entier, sur un fond dégagé.",
      });
      setStep(1);
      return;
    }

    // Progression
    setAnalysisProgress(30);
    setTimeout(() => setAnalysisProgress(60), 500);
    setTimeout(() => setAnalysisProgress(100), 1000);

    // Ratios morphologiques. Volontairement NON bloquant : une photo peut
    // très bien servir à l'essayage virtuel sans permettre de mesurer la
    // carrure. On prévient le client, on ne le renvoie pas à l'étape 1.
    const m = getBodyRatios(detectedResults);
    setMeasurements(m);

    const hint = photoQualityHint(m);
    if (hint) setPageMessage({ type: 'info', text: hint });

    const scoreVal = m ? calculateScoreFromMeasurements(m) : null;
    setScore(scoreVal);

    // La taille n'est plus devinée ici à partir de la largeur d'épaules :
    // c'est le moteur du serveur qui décide, à partir des ratios + taille + poids.
    let sizeVal = recommendedSize;
    if (heightCm && weightKg) {
      const fit = await loadFit(m);
      if (fit) sizeVal = fit.recommendedSize;
    }

    // Sauvegarder l'essai
    await saveTryon(detectedLandmarks, scoreVal, sizeVal);

    setStep(3);
  };

  /* ── 6. Sauvegarde de l'essai ── */
  const saveTryon = async (landmarks, scoreVal, sizeVal) => {
    if (!user) {
      setPageMessage({
        type: 'info',
        text: "Connectez-vous pour enregistrer votre essayage et le retrouver plus tard.",
      });
      return;
    }

    try {
      const tryonData = {
        userId: user.id,
        productId: product.id,
        score: scoreVal,
        recommendedSize: sizeVal,
        notes: `Taille sélectionnée: ${selectedSize}, Couleur: ${selectedColor}`,
        isLatest: true,
      };

      let uploadedTryon;
      if (photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('userId', user.id);
        formData.append('productId', product.id);
        formData.append('score', scoreVal);
        formData.append('recommendedSize', sizeVal);
        formData.append('notes', tryonData.notes);
        formData.append('isLatest', 'true');

        const response = await api.upload('/tryons/upload', formData);
        uploadedTryon = response.data;
      } else {
        const response = await api.post('/tryons', tryonData);
        uploadedTryon = response.data;
      }

      setTryonId(uploadedTryon.id);
    } catch (err) {
      console.error('Erreur sauvegarde essai:', err);
      setPageMessage({
        type: 'error',
        text: "Votre essayage n'a pas pu être enregistré. Vérifiez votre connexion et réessayez.",
      });
    }
  };

  /* ── 7. Ajout au panier ── */
  const resultFullUrl = () => aiResult && aiResult.resultImageUrl
    ? resolveImageUrl(aiResult.resultImageUrl)
    : null;

  const handleDownload = async () => {
    const url = resultFullUrl();
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `essayage-${product?.name || 'tryon'}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (_) {
      window.open(url, '_blank');
    }
  };

  const handleShareResult = async () => {
    const url = resultFullUrl();
    if (!url) return;
    if (navigator.share) {
      try { await navigator.share({ title: `Mon essayage — ${product?.name}`, url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url);
      alert('Lien du rendu copié !');
    }
  };

  const handleAddToCart = async () => {
    try {
      await addItem({
        id: product.id,
        name: product.name,
        brand: product.brand || 'TryOn',
        price: parseFloat(product.price),
        image: getImageUrl(product.image),
        size: selectedSize,
        color: selectedColor,
        qty: 1,
      });
      alert('Produit ajouté au panier !');
      navigate('/cart');
    } catch (err) {
      alert('Erreur lors de l\'ajout au panier.');
    }
  };

  /* ── 8. Réinitialisation ── */
  const resetTryon = () => {
    setPageMessage(null);
    setStep(1);
    setPhoto(null);
    setPhotoPreview(null);
    setPoseLandmarks(null);
    setScore(null);
    setRecommendedSize(null);
    setTryonId(null);
    setMeasurements(null);
    stopWebcam();
  };

/* ── Génération IA (version corrigée) ── */
const handleAITryon = async () => {
  if (!photo && !photoPreview) return;
  if (!product) return;

  setAiGenerating(true);
  setAiResult(null);
  setAiError(null);

  try {
    const formData = new FormData();
    formData.append('productId', product.id);

    // Attacher la photo selon son type
    if (photo instanceof File) {
      formData.append('tryonPhoto', photo);
    } else if (photoPreview && photoPreview.startsWith('data:')) {
      // Photo webcam (dataURL canvas) → convertir en Blob
      const blob = await fetch(photoPreview).then(r => r.blob());
      formData.append('tryonPhoto', blob, 'webcam-capture.jpg');
    } else if (photoPreview) {
      const blob = await fetch(photoPreview).then(r => r.blob());
      formData.append('tryonPhoto', blob, 'photo.jpg');
    }

    if (score)           formData.append('score', String(score));
    if (recommendedSize) formData.append('recommendedSize', recommendedSize);

    // Le token est stocké dans localStorage par AuthContext (pas sessionStorage)
    const token = localStorage.getItem('tryon_token');

    // ✅ FIX 2 : BASE_URL inclut déjà /v1, donc endpoint sans préfixe /v1
    const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

    const response = await fetch(`${BASE_URL}/tryons/ai-generate`, {
      method: 'POST',
      headers: {
        // ✅ PAS de Content-Type ici ! Le navigateur le calcule seul avec le boundary multipart
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Erreur inconnue');
    }

    setAiResult(data.data);
  } catch (err) {
    console.error('[handleAITryon]', err);
    setAiError(err.message);
  } finally {
    setAiGenerating(false);
  }
};

  // Nettoyage des ressources
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      stopWebcam();
    };
  }, [photoPreview]);

  /* ── Rendu ── */
  if (loadingProduct) {
    return <LoadingPage message="Chargement de l'essayage..." />;
  }

  if (!product) {
    return <div style={{ paddingTop: '72px', textAlign: 'center' }}>Produit non disponible</div>;
  }

  const sizeOptions = sizes.length ? sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const colorOptions = colors.length ? colors : ['#1a1410'];

  // ── Moteur de taille : taille + poids + morphologie -> verdict par taille ──
  // ratiosOverride : permet à analyzePhoto d'appeler loadFit AVANT que le
  // setState de `measurements` ne soit répercuté (React ne l'applique pas
  // de façon synchrone — sans cela le premier calcul ignorerait la photo).
  const loadFit = async (ratiosOverride) => {
    const m = ratiosOverride !== undefined ? ratiosOverride : measurements;
    if (!heightCm || !weightKg) {
      setFitError('Renseignez votre taille et votre poids.');
      return null;
    }
    setFitLoading(true);
    setFitError(null);
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${BASE_URL}/measurements/fit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
body: JSON.stringify({
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          morphology,
          productId: product?.id,
          // Ratios 3D mesurés par MediaPipe sur la photo (sans unité).
          // Convertis en cm côté serveur grâce à la taille saisie.
          // Absents si aucune photo n'a été analysée : le serveur retombe
          // alors proprement sur l'estimation taille + poids.
          shoulderRatio: m?.shoulderRatio,
          hipRatio: m?.hipRatio,
          photoQuality: m?.quality,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur');

      setFitData(json.data);
      setRecommendedSize(json.data.recommendedSize);
      if (!selectedSize) setSelectedSize(json.data.recommendedSize);
      return json.data;
    } catch (e) {
      setFitError(e.message);
      return null;
    } finally {
      setFitLoading(false);
    }
  };

  const fitOf = (size) => fitData?.sizes?.find((x) => x.size === size);

  const FIT_COLOR = {
    ajuste: '#06D6A0',
    serre: '#E8A33D',
    ample: '#E8A33D',
    tres_serre: '#C0392B',
    tres_ample: '#C0392B',
  };

  return (
    <div
      className="tryon-page"
      style={{
        background: `radial-gradient(circle at 10% 8%, rgba(91,127,166,0.10), transparent 30%), linear-gradient(180deg,#F9F9F9,#F3F6FA)`
      }}
    >
      <style>{`
/* ============ BASE (DESKTOP) ============ */

.tryon-page {
  padding-top: 72px;
  min-height: 100vh;
}

/* ─── EN-TÊTE MOBILE (caché sur desktop) ─── */
.tryon-mobile-header {
  display: none;
}

/* ─── EN-TÊTE DESKTOP (visible sur desktop) ─── */
.tryon-header {
  padding: 48px 80px 36px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.tryon-header .tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #355C86;
  text-align: center;
}

.tryon-header .tag span {
  color: #C0392B;
}

.tryon-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 300;
  color: #1A1A1A;
  margin-top: 8px;
  line-height: 1.1;
  text-align: center;
}

.tryon-header h1 em {
  font-style: italic;
  color: #C0392B;
}

.tryon-header p {
  color: #6A6F78;
  margin-top: 10px;
  font-size: 14px;
  max-width: 560px;
  line-height: 1.7;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.tryon-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
  width: 100%;
}

.tryon-step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tryon-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.tryon-step-circle.active {
  background: linear-gradient(135deg, #C0392B, #8E241D);
  color: #fff;
  box-shadow: 0 8px 20px rgba(192,57,43,0.20);
}

.tryon-step-circle.done {
  background: linear-gradient(135deg, #C0392B, #8E241D);
  color: #fff;
  box-shadow: 0 8px 20px rgba(192,57,43,0.20);
}

.tryon-step-circle.inactive {
  background: #E6EEF6;
  color: #355C86;
}

.tryon-step-label {
  font-size: 13px;
  font-weight: 400;
  color: #6A6F78;
  white-space: nowrap;
}

.tryon-step-label.active {
  font-weight: 600;
  color: #1A1A1A;
}

.tryon-step-label.done {
  font-weight: 600;
  color: #1A1A1A;
}

.tryon-step-line {
  height: 2px;
  width: 48px;
  background: rgba(26,26,26,0.105);
  border-radius: 2px;
  flex-shrink: 0;
}

.tryon-step-line.done {
  background: linear-gradient(90deg, #C0392B, #355C86);
}

.tryon-container {
  padding: 40px 80px 80px;
}

.tryon-grid-upload {
  display: grid;
  grid-template-columns: 1fr 1fr 340px;
  gap: 32px;
  align-items: start;
}

.tryon-dropzone {
  min-height: 340px;
}

.tryon-preview {
  min-height: 340px;
}

.tryon-options {
  position: sticky;
  top: 88px;
}

.tryon-grid-result {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 32px;
  align-items: start;
  margin-bottom: 48px;
}

.tryon-photo-result {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.tryon-result-media {
  width: 100%;
  height: 460px;
}

/* ============ TABLETTE (< 1024px) ============ */
@media (max-width: 1024px) {
  .tryon-header {
    padding: 40px 40px 30px;
  }

  .tryon-container {
    padding: 32px 40px 60px;
  }

  .tryon-grid-upload {
    grid-template-columns: 1fr;
  }

  .tryon-options {
    position: static;
    top: auto;
  }

  .tryon-grid-result {
    grid-template-columns: 1fr;
  }
}

/* ============ MOBILE (< 768px) ============ */
@media (max-width: 768px) {

  .tryon-page {
    padding-top: 0 !important;
    padding-bottom: 84px;
  }

  /* ─── EN-TÊTE MOBILE (visible uniquement sur mobile) ─── */
  .tryon-mobile-header {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #fff;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .tryon-mobile-header .tryon-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 3px;
    color: #1A1A1A;
    text-decoration: none;
  }

  .tryon-mobile-header .tryon-logo span {
    color: #E30613;
  }

  .tryon-mobile-header .tryon-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tryon-mobile-header .tryon-header-actions a {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #1A1A1A;
    text-decoration: none;
    position: relative;
    padding: 4px;
    line-height: 1;
  }

  .tryon-mobile-header .tryon-header-actions a .notif-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    background: #E30613;
    border-radius: 50%;
  }

  .tryon-mobile-header .tryon-header-actions a .cart-badge-mobile {
    position: absolute;
    top: -4px;
    right: -6px;
    background: #E30613;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ─── CONTENU DE L'EN-TÊTE (visible sur mobile aussi) ─── */
  .tryon-header {
    display: flex !important;
    padding: 20px 16px !important;
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-bottom: 1px solid rgba(26,26,26,0.105);
    width: 100%;
  }

  .tryon-header .tag {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #355C86;
    text-align: center;
  }

  .tryon-header .tag span {
    color: #C0392B;
  }

  .tryon-header h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px !important;
    font-weight: 300;
    color: #1A1A1A;
    margin-top: 8px;
    line-height: 1.1;
    text-align: center;
  }

  .tryon-header h1 em {
    font-style: italic;
    color: #C0392B;
  }

  .tryon-header p {
    color: #6A6F78;
    margin-top: 10px;
    font-size: 13px !important;
    max-width: 100% !important;
    line-height: 1.7;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .tryon-stepper {
    gap: 6px !important;
    margin-top: 20px !important;
    justify-content: space-between !important;
    width: 100%;
  }

  /* Uniquement les chiffres sur mobile */
  .tryon-step-label {
    display: none !important;
  }

  .tryon-step-circle {
    width: 32px !important;
    height: 32px !important;
    font-size: 13px !important;
  }

  .tryon-step-line {
    flex: 1 !important;
    width: auto !important;
    min-width: 14px !important;
  }

  .tryon-container {
    padding: 20px 16px 24px !important;
  }

  .tryon-message {
    padding: 14px 16px !important;
  }

  .tryon-dropzone {
    min-height: 220px;
  }

  .tryon-preview {
    min-height: 220px;
  }

  .tryon-options {
    position: static;
  }

  .tryon-photo-result {
    gap: 8px;
  }

  .tryon-result-media {
    height: 240px;
  }

  .tryon-details-card {
    border-radius: 18px !important;
  }
}

/* ============ TRÈS PETIT MOBILE (< 420px) ============ */
@media (max-width: 420px) {

  .tryon-page {
    padding-bottom: 84px;
  }

  .tryon-mobile-header {
    padding: 10px 14px;
  }

  .tryon-mobile-header .tryon-logo {
    font-size: 20px;
  }

  .tryon-mobile-header .tryon-header-actions a {
    font-size: 18px;
  }

  .tryon-header h1 {
    font-size: 24px !important;
  }

  .tryon-header p {
    font-size: 12px !important;
  }

  .tryon-container {
    padding: 16px 12px 24px !important;
  }

  .tryon-dropzone {
    min-height: 200px;
  }

  .tryon-preview {
    min-height: 200px;
  }

  /* Photo + rendu IA passent en 1 colonne sur les très petits écrans */
  .tryon-photo-result {
    grid-template-columns: 1fr;
  }

  .tryon-result-media {
    height: 260px;
  }

  .tryon-step-circle {
    width: 26px !important;
    height: 26px !important;
    font-size: 11px !important;
  }

  .tryon-step-line {
    min-width: 10px !important;
  }
}

/* ─── FORCER LE CENTRAGE SUR DESKTOP ─── */
@media (min-width: 769px) {
  .tryon-header {
    text-align: center !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .tryon-header .tag {
    text-align: center !important;
  }

  .tryon-header h1 {
    text-align: center !important;
  }

  .tryon-header p {
    text-align: center !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .tryon-stepper {
    justify-content: center !important;
  }
}
`}</style>

      {/* ─── EN-TÊTE MOBILE (comme sur Home et Shop) ─── */}
      <div className="tryon-mobile-header">
        <Link to="/" className="tryon-logo">TRY<span>ON</span></Link>
        <div className="tryon-header-actions">
          <Link to="/notifications" aria-label="Notifications" style={{ position: 'relative' }}>
            🔔
          </Link>
          <Link to="/cart" aria-label="Panier" style={{ position: 'relative' }}>
            🛒
            {/* Le badge du panier si tu veux l'afficher */}
          </Link>
        </div>
      </div>

      {/* ─── CONTENU EN-DESSOUS (titre, description, stepper) ─── */}
      <div className="tryon-content-header" style={{ padding: '20px 16px', borderBottom: `1px solid ${T.border}`, background: '#fff' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: T.blueDark }}>
           Technologie IA
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 300,
          color: T.ink,
          marginTop: '8px',
          lineHeight: 1.1
        }}>
          Cabine d'essayage <em style={{ fontStyle: 'italic', color: T.red }}>virtuelle</em>
        </h1>
        <p style={{ color: T.muted, marginTop: '10px', fontSize: '14px', maxWidth: '480px', lineHeight: 1.7 }}>
          Uploadez votre photo, notre IA analyse votre morphologie et vous propose la taille la plus adaptée.
        </p>

        {/* Stepper */}
        <div className="tryon-stepper">
          {[
            { n: 1, label: 'Photo & Taille' },
            { n: 2, label: 'Analyse' },
            { n: 3, label: 'Résultats' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="tryon-step" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="tryon-step-circle" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step >= s.n ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : T.blueLight,
                  color: step >= s.n ? '#fff' : T.blueDark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxShadow: step >= s.n ? '0 8px 20px rgba(192,57,43,0.20)' : 'none',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="tryon-step-label" style={{
                  fontSize: '13px',
                  fontWeight: step === s.n ? 600 : 400,
                  color: step >= s.n ? T.ink : T.muted
                }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className="tryon-step-line" style={{
                  height: '2px',
                  width: '48px',
                  background: step > s.n ? `linear-gradient(90deg, ${T.red}, ${T.blueDark})` : T.border,
                  borderRadius: '2px',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="tryon-container">
        {pageMessage && (
          <div className="tryon-message" style={{
            maxWidth: '720px',
            margin: '0 auto 24px',
            padding: '16px 20px',
            borderRadius: '14px',
            background: pageMessage.type === 'error' ? 'rgba(192,57,43,0.06)' : T.blueLight,
            border: `1px solid ${pageMessage.type === 'error' ? 'rgba(192,57,43,0.25)' : 'rgba(53,92,134,0.25)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1.2 }}>
              {pageMessage.type === 'error' ? <CameraIcon size={18} /> : <Info size={18} />}
            </span>
            <p style={{ flex: 1, margin: 0, fontSize: '14px', lineHeight: 1.6, color: T.ink }}>
              {pageMessage.text}
            </p>
            <button
              onClick={() => setPageMessage(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '18px', color: T.muted, flexShrink: 0, lineHeight: 1,
              }}
              aria-label="Fermer le message"
            >
              ×
            </button>
          </div>
        )}
        {/* ÉTAPE 1 : Upload + sélections */}
        {step === 1 && (
          <div className="tryon-grid-upload">
            {/* Colonne gauche : upload photo/webcam */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                1. Votre photo
              </h2>
              <p style={{ fontSize: '12px', color: T.muted, marginBottom: '20px' }}>Glissez ou cliquez pour importer</p>

              <div
                className="tryon-dropzone"
                onClick={() => !photo && !useWebcam && fileInputRef.current.click()}
                style={{
                  border: `2px dashed ${photo || useWebcam ? T.red : 'rgba(26,26,26,0.20)'}`,
                  borderRadius: '18px',
                  background: photo || useWebcam ? 'rgba(192,57,43,0.02)' : T.white,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: photo || useWebcam ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {useWebcam && webcamActive ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#EEF1F5' }}
                      autoPlay
                      playsInline
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                      width={640}
                      height={480}
                    />
                    <button
                      onClick={stopWebcam}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(26,26,26,0.75)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '15px',
                      }}
                    >
                      ×
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(6,214,160,0.95)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                     <CameraIcon size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Caméra active
                    </div>
                  </div>
                ) : photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#EEF1F5', borderRadius: '16px' }}
                    />
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); setUseWebcam(false); }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(26,26,26,0.75)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '15px',
                      }}
                    >
                      ×
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(6,214,160,0.95)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      ✓ Photo prête
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 32px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: T.blueLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p style={{ fontWeight: 500, color: T.ink, marginBottom: '6px' }}>Glissez votre photo ici</p>
                    <p style={{ fontSize: '12px', color: T.muted, marginBottom: '16px' }}>ou cliquez pour parcourir</p>
                    <span style={{ fontSize: '11px', color: T.blueDark, background: T.blueLight, padding: '4px 12px', borderRadius: '100px' }}>
                      JPG, PNG — Max 10 Mo
                    </span>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              {/* capture="user" => ouvre directement l'appareil photo frontal sur mobile */}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handleFileUpload} style={{ display: 'none' }} />

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {!useWebcam && !photo && (
                  <button
                    onClick={() => (isMobile ? cameraInputRef.current.click() : startWebcam())}
                    style={{
                      flex: 1,
                      background: T.blueLight,
                      color: T.blueDark,
                      border: `1px solid rgba(53,92,134,0.25)`,
                      borderRadius: '10px',
                      padding: '11px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                    Prendre une photo
                  </button>
                )}
                {!useWebcam && !photo && (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      flex: 1,
                      background: '#f1f1f1',
                      color: T.ink,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Importer une photo
                  </button>
                )}
                {(useWebcam || photo) && (
                  <button
                    onClick={resetTryon}
                    style={{
                      flex: 1,
                      background: '#f1f1f1',
                      color: T.ink,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Colonne centrale : aperçu du rendu */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                2. Aperçu du rendu
              </h2>
              <p style={{ fontSize: '12px', color: T.muted, marginBottom: '20px' }}>Prévisualisation de l'essayage virtuel</p>

              <div className="tryon-preview" style={{
                borderRadius: '18px',
                overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(145deg, #F0F4F9, #E6EEF6)`,
                border: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                {aiResult ? (
                  /* Le vrai rendu IA est prêt : on affiche le résultat généré */
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={resolveImageUrl(aiResult.resultImageUrl)}
                      alt="Rendu de l'essayage"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#EEF1F5' }}
                      
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(249,249,249,0.95)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <Shirt size={22} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: T.ink }}>{product.name}</div>
                        <div style={{ fontSize: '11px', color: T.muted }}>Taille {selectedSize} · Rendu IA</div>
                      </div>
                      <div style={{
                        background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> IA
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    {product?.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: '14px',
                          marginBottom: '18px',
                          display: 'block',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(53,92,134,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', fontSize: '36px',
                      }}>
                        <Shirt size={36} />
                      </div>
                    )}
                    <p style={{ fontWeight: 500, color: T.ink, fontSize: '14px', marginBottom: '4px' }}>
                      {product?.name || 'Votre vêtement'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(106,111,120,0.7)' }}>
                      {photoPreview
                        ? 'Photo prête — lancez la génération pour voir le rendu'
                        : 'Ajoutez votre photo pour le voir sur vous'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : sélections + lancement */}
            <div className="tryon-options" style={{
              background: T.white,
              borderRadius: '20px',
              border: `1px solid ${T.border}`,
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(26,26,26,0.08)',
            }}>
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '12px' }}>
                  Article sélectionné
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '11px', color: T.muted, marginBottom: '4px' }}>{product.brand || 'TryOn'}</div>
                    <div style={{ fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                      {parseFloat(product.price).toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              </div>

              {/* Taille */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: T.muted,
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>3. Votre taille</span>
                  <span style={{ fontSize: '10px', color: T.blueDark, textTransform: 'none', letterSpacing: 0, cursor: 'pointer', fontWeight: 500 }}>Guide →</span>
                </div>
                {/* Estimation : taille + poids + morphologie */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <input type="number" placeholder="Taille (cm)" value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ flex: '1 1 90px', minWidth: 0, padding: '7px 9px', borderRadius: '8px', border: `1.5px solid ${T.border}`, fontSize: '12px' }} />
                  <input type="number" placeholder="Poids (kg)" value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={{ flex: '1 1 90px', minWidth: 0, padding: '7px 9px', borderRadius: '8px', border: `1.5px solid ${T.border}`, fontSize: '12px' }} />
                  <select value={morphology} onChange={(e) => setMorphology(e.target.value)}
                    style={{ flex: '1 1 110px', minWidth: 0, padding: '7px 9px', borderRadius: '8px', border: `1.5px solid ${T.border}`, fontSize: '12px' }}>
                    <option value="mince">Mince</option>
                    <option value="normale">Normale</option>
                    <option value="corpulent">Corpulent</option>
                  </select>
                  <button onClick={() => loadFit()} disabled={fitLoading}
                    style={{ flex: '1 1 100%', padding: '8px', borderRadius: '8px', border: 'none', background: T.blueDark, color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    {fitLoading ? 'Calcul…' : 'Trouver ma taille'}
                  </button>
                </div>

                {/* État de la photo : ce que le client gagne à en ajouter une */}
                {measurements && measurements.quality !== 'bad' ? (
                  <p style={{ fontSize: '11px', color: '#06D6A0', margin: '0 0 8px', fontWeight: 500 }}>
                    📷 Votre photo est utilisée : carrure mesurée, taille affinée.
                  </p>
                ) : (
                  <p style={{ fontSize: '11px', color: T.muted, margin: '0 0 8px', lineHeight: 1.4 }}>
                    💡 Pour plus de précision, ajoutez une photo de vous en pied et de face :
                    nous mesurons votre carrure réelle au lieu de l'estimer.
                  </p>
                )}

                {fitError && <p style={{ color: T.red, fontSize: '11px', margin: '0 0 8px' }}>{fitError}</p>}

                {fitData && (
                  <>
                    <p style={{ fontSize: '12px', color: '#06D6A0', fontWeight: 600, margin: '0 0 4px' }}>
                      ✓ Taille {fitData.recommendedSize} recommandée ({fitData.confidence}% de confiance)
                      {fitData.photoUsed ? ' · photo + taille + poids' : ' · taille + poids'}
                    </p>
                    {fitData.photoNote && (
                      <p style={{ fontSize: '10px', color: T.muted, margin: '0 0 8px' }}>{fitData.photoNote}</p>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {sizeOptions.map(s => {
                    const f = fitOf(s);
                    return (
                      <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <button
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: '7px 13px',
                            borderRadius: '8px',
                            border: `1.5px solid ${selectedSize === s ? T.blueDark : (f ? FIT_COLOR[f.verdict] : T.border)}`,
                            background: selectedSize === s ? T.blueDark : 'transparent',
                            color: selectedSize === s ? '#fff' : T.ink,
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                        {f && (
                          <span style={{ fontSize: '8px', color: FIT_COLOR[f.verdict], fontWeight: 600, textAlign: 'center' }}>
                            {f.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Le choix du client est respecté, mais il est informé au cm près */}
                {fitData && selectedSize && fitOf(selectedSize) && !fitOf(selectedSize).wearable && (
                  <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: T.red, fontWeight: 600 }}>
                      {fitOf(selectedSize).label} — nous recommandons {fitData.recommendedSize}
                    </p>
                    {fitOf(selectedSize).zones.filter(z => z.deltaCm !== 0).map(z => (
                      <p key={z.zone} style={{ margin: '2px 0 0', fontSize: '10px', color: T.muted }}>
                        {z.zone} : {Math.abs(z.deltaCm)} cm {z.deltaCm > 0 ? 'trop juste' : 'de trop'}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Couleur */}
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '12px' }}>
                  4. Votre couleur
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {colorOptions.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: `2px solid ${selectedColor === color ? T.blueDark : T.border}`,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {selectedColor === color && (
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${T.red}`,
                          pointerEvents: 'none',
                        }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* État de préparation */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, background: '#FAFBFC' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Photo uploadée', done: !!(photoPreview || useWebcam) },
                    { label: 'Article sélectionné', done: true },
                    { label: 'Taille choisie', done: !!selectedSize },
                    { label: 'Couleur choisie', done: !!selectedColor },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: item.done ? '#06D6A0' : 'rgba(26,26,26,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {item.done ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(26,26,26,0.25)' }} />
                        )}
                      </div>
                      <span style={{ color: item.done ? T.ink : T.muted, fontWeight: item.done ? 500 : 400 }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton LANCER */}
              <div style={{ padding: '20px' }}>
                <button
                  onClick={() => { setStep(3); handleAITryon(); }}
                  disabled={!photoPreview && !useWebcam}
                  className="tryon-launch-btn"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: (!photoPreview && !useWebcam)
                      ? 'rgba(26,26,26,0.08)'
                      : `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                    color: (!photoPreview && !useWebcam) ? T.muted : '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    cursor: (!photoPreview && !useWebcam) ? 'not-allowed' : 'pointer',
                    boxShadow: (!photoPreview && !useWebcam) ? 'none' : '0 10px 24px rgba(192,57,43,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {!photoPreview && !useWebcam ? "Uploadez une photo d'abord" : "Lancer l'essayage IA"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Analyse */}
        {step === 2 && (
          <div className="tryon-analysis" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.blueLight}, ${T.blueDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              animation: 'spin 2s linear infinite',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                <path d="M12 2a10 10 0 1 0 10 10" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, marginBottom: '12px' }}>
              Analyse en cours…
            </h2>
            <p style={{ color: T.muted, marginBottom: '8px' }}>Notre IA analyse votre morphologie</p>
            <p style={{ fontSize: '13px', color: T.blueDark, fontWeight: 500, marginBottom: '36px' }}>
              {product.name} · Taille {selectedSize}
            </p>
            <div style={{ background: T.blueLight, borderRadius: '100px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                borderRadius: '100px',
                background: `linear-gradient(90deg, ${T.red}, ${T.blueDark})`,
                width: `${analysisProgress}%`,
                transition: 'width .3s ease',
              }} />
            </div>
            <div style={{ fontSize: '13px', color: T.red, marginBottom: '40px', fontWeight: 600 }}>{analysisProgress}%</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              {['Détection du corps', 'Analyse morphologique', 'Calcul des mensurations'].map((label, i, arr) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: analysisProgress >= ((i + 1) * 100) / arr.length ? T.blueLight : T.white,
                  border: `1px solid ${analysisProgress >= ((i + 1) * 100) / arr.length ? 'rgba(53,92,134,0.30)' : T.border}`,
                }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: analysisProgress >= ((i + 1) * 100) / arr.length ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : 'rgba(26,26,26,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {analysisProgress >= ((i + 1) * 100) / arr.length && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: analysisProgress >= ((i + 1) * 100) / arr.length ? 500 : 400,
                    color: analysisProgress >= ((i + 1) * 100) / arr.length ? T.ink : T.muted,
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ÉTAPE 3 : Résultats */}
        {step === 3 && (
          <div>
            <div className="tryon-grid-result">
{/* Colonne gauche : photo + rendu côte à côte */}
              <div>
                <div className="tryon-photo-result">

                  {/* Votre photo */}
                  <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative' }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Votre photo" className="tryon-result-media" style={{ width: '100%', objectFit: 'contain', background: '#EEF1F5', display: 'block' }} />
                    ) : (
                      <div className="tryon-result-media" style={{ background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={64} strokeWidth={1.2} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(26,26,26,0.7)', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px' }}>
                      VOTRE PHOTO
                    </div>
                  </div>

                  {/* Rendu IA */}
                  <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative', border: `2px solid ${T.blueDark}`, background: T.blueLight }}>
                    {aiGenerating ? (
                      <div className="tryon-result-media" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `3px solid rgba(53,92,134,0.2)`, borderTopColor: T.blueDark, animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: T.muted, fontSize: '13px', margin: 0 }}>Génération en cours…<br />(1-2 min)</p>
                      </div>
                    ) : aiResult && aiResult.resultImageUrl ? (
                      <>
                        <img
                          src={resolveImageUrl(aiResult.resultImageUrl)}
                          alt="Résultat de l'essayage"
                          className="tryon-result-media"
                          style={{ width: '100%', objectFit: 'contain', background: '#EEF1F5', display: 'block' }}
                          
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: T.blueDark, color: '#fff', fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.5px' }}>
                           RENDU IA
                        </div>
                        {/* Boutons télécharger + partager (discrets, en haut à droite) */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleDownload}
                            title="Télécharger"
                            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.blueDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </button>
                          <button
                            onClick={handleShareResult}
                            title="Partager"
                            style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.blueDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="tryon-result-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                        Le rendu apparaîtra ici
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Colonne droite : résultats détaillés */}
              <div className="tryon-details-card" style={{ background: T.white, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 18px 50px rgba(26,26,26,0.08)' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
                    Article essayé
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {product?.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '75px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          background: '#F8F9FB',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '75px',
                        borderRadius: '12px',
                        background: `linear-gradient(145deg, #F8F9FB, #E9EFF6)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        flexShrink: 0,
                      }}>
                        <Shirt size={32} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: T.muted }}>{product.brand || 'TryOn'}</div>
                      <div style={{ fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                        {parseFloat(product.price).toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Taille recommandée */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
                    Taille recommandée
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sizeOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '100px',
                          border: `1.5px solid ${selectedSize === s ? T.blueDark : T.border}`,
                          background: selectedSize === s ? T.blueDark : 'transparent',
                          color: selectedSize === s ? '#fff' : T.ink,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {recommendedSize && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#06D6A0', fontWeight: 500 }}>
                      ✓ Taille {recommendedSize} recommandée par l'IA
                    </div>
                  )}
                </div>

                {/* ── Erreur de génération (si échec) ── */}
                {aiError && !aiGenerating && (
                  <div className="tryon-error-box" style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(192,57,43,0.07)', border: `1px solid rgba(192,57,43,0.2)` }}>
                      <p style={{ color: T.red, fontSize: '13px', margin: '0 0 8px', fontWeight: 500 }}>⚠ Génération échouée</p>
                      <p style={{ color: T.muted, fontSize: '12px', margin: 0 }}>{aiError}</p>
                      <button onClick={handleAITryon} style={{ marginTop: '10px', background: 'transparent', border: `1px solid ${T.red}`, color: T.red, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
                        Réessayer
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="tryon-action-buttons" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      width: '100%',
                      padding: '18px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                      color: '#fff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px rgba(192,57,43,0.25)',
                    }}
                  >
                    Ajouter au panier — {parseFloat(product.price).toLocaleString()} FCFA
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'transparent',
                      color: T.blueDark,
                      border: `1px solid ${T.border}`,
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Voir la fiche produit
                  </Link>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}