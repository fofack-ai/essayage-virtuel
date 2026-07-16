import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

/* ── Fonctions utilitaires pour les mensurations ── */

/** Extrait les mensurations normalisées à partir des landmarks */
function getMeasurements(landmarks) {
  if (!landmarks || !landmarks[0] || !landmarks[27] || !landmarks[28] ||
      !landmarks[11] || !landmarks[12] || !landmarks[23] || !landmarks[24]) {
    return null;
  }

  const noseY = landmarks[0].y;
  const leftAnkleY = landmarks[27].y;
  const rightAnkleY = landmarks[28].y;
  const ankleY = (leftAnkleY + rightAnkleY) / 2;
  const heightNorm = ankleY - noseY;

  if (heightNorm <= 0) return null;

  const shoulderWidthNorm = Math.abs(landmarks[12].x - landmarks[11].x);
  const hipWidthNorm = Math.abs(landmarks[24].x - landmarks[23].x);

  return { heightNorm, shoulderWidthNorm, hipWidthNorm };
}

/** Calcule un score de compatibilité (0-100) à partir des mensurations */
function calculateScoreFromMeasurements(m) {
  const shoulderToHeight = m.shoulderWidthNorm / m.heightNorm;
  const hipToHeight = m.hipWidthNorm / m.heightNorm;

  const idealShoulderToHeight = 0.20;
  const idealHipToHeight = 0.18;

  let shoulderScore = 1 - Math.abs(shoulderToHeight - idealShoulderToHeight) / idealShoulderToHeight;
  let hipScore = 1 - Math.abs(hipToHeight - idealHipToHeight) / idealHipToHeight;

  shoulderScore = Math.max(0, Math.min(1, shoulderScore));
  hipScore = Math.max(0, Math.min(1, hipScore));

  return Math.round(((shoulderScore + hipScore) / 2) * 100);
}

/** Recommande une taille (XS à XL) basée sur la largeur des épaules relative */
function recommendSizeFromMeasurements(m) {
  const shoulderToHeight = m.shoulderWidthNorm / m.heightNorm;
  if (shoulderToHeight < 0.15) return 'XS';
  if (shoulderToHeight < 0.18) return 'S';
  if (shoulderToHeight < 0.21) return 'M';
  if (shoulderToHeight < 0.24) return 'L';
  if (shoulderToHeight < 0.27) return 'XL';
  return 'XL';
}

/* ── Composant principal ── */
export default function TryOn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { user } = useAuth();
  const { addItem } = useCart();
  const { t } = useTranslation();

  // États produit
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // États IA
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);

  // États de la cabine
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [step, setStep] = useState(1);
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [score, setScore] = useState(null);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [tryonId, setTryonId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [measurements, setMeasurements] = useState(null);
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
          alert(t('tryon.alerts.noProduct'));
          navigate('/catalogue');
          return;
        }

        setProduct(prod);

        const sizeList = prod.sizes?.length
          ? prod.sizes.map(s => s.sizeLabel || s.label || s.size || s)
          : ['XS', 'S', 'M', 'L', 'XL'];
        setSizes(sizeList);
        setSelectedSize(sizeList[0] || 'M');

        const colorList = prod.colors?.length
          ? prod.colors
          : prod.color
            ? [prod.color]
            : ['#1a1410'];
        setColors(colorList);
        setSelectedColor(colorList[0] || '#1a1410');

      } catch (err) {
        console.error('Erreur chargement produit:', err);
        alert(t('tryon.alerts.productNotFound'));
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
      alert("Impossible d'accéder à la webcam : " + err.message);
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

    drawGarment(ctx, landmarks, 640, 480);

    // ✅ CORRECTION ICI : On utilise landmarks au lieu de arr
    drawConnectors(ctx, landmarks, Pose.POSE_CONNECTIONS, {
      color: (data) => {
        return landmarks[data.from].y > landmarks[data.to].y ? '#00FF00' : '#FF0000';
      },
      lineWidth: 2
    });
    drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
  };

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

    let detectedLandmarks = null;
    pose.onResults((results) => {
      if (results.poseLandmarks) {
        detectedLandmarks = results.poseLandmarks;
        setPoseLandmarks(results.poseLandmarks);
        drawPoseOnCanvas(results.poseLandmarks);
      }
    });

    await pose.send({ image: img });

    if (!detectedLandmarks) {
      setPageMessage({
        type: 'error',
        text: t('tryon.messages.noPersonDetected'),
      });
      setStep(1);
      return;
    }

    setAnalysisProgress(30);
    setTimeout(() => setAnalysisProgress(60), 500);
    setTimeout(() => setAnalysisProgress(100), 1000);

    const m = getMeasurements(detectedLandmarks);
    if (!m) {
      setPageMessage({
        type: 'error',
        text: t('tryon.messages.photoNotClear'),
      });
      setStep(1);
      return;
    }
    setMeasurements(m);

    const scoreVal = calculateScoreFromMeasurements(m);
    setScore(scoreVal);
    const sizeVal = recommendSizeFromMeasurements(m);
    setRecommendedSize(sizeVal);

    await saveTryon(detectedLandmarks, scoreVal, sizeVal);

    setStep(3);
  };

  /* ── 6. Sauvegarde de l'essai ── */
  const saveTryon = async (landmarks, scoreVal, sizeVal) => {
    if (!user) {
      setPageMessage({
        type: 'info',
        text: t('tryon.messages.loginToSave'),
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
        text: t('tryon.messages.saveError'),
      });
    }
  };

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
      try { await navigator.share({ title: t('tryon.shareTitle', { name: product?.name }), url }); } catch (_) {}
    } else {
      navigator.clipboard?.writeText(url);
      alert(t('tryon.alerts.linkCopied'));
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
      alert(t('tryon.alerts.addedToCart'));
      navigate('/cart');
    } catch (err) {
      alert(t('tryon.alerts.addToCartError'));
    }
  };

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

  /* ── Génération IA ── */
  const handleAITryon = async () => {
    if (!photo && !photoPreview) return;
    if (!product) return;

    setAiGenerating(true);
    setAiResult(null);
    setAiError(null);

    try {
      const formData = new FormData();
      formData.append('productId', product.id);

      if (photo instanceof File) {
        formData.append('tryonPhoto', photo);
      } else if (photoPreview && photoPreview.startsWith('data:')) {
        const blob = await fetch(photoPreview).then(r => r.blob());
        formData.append('tryonPhoto', blob, 'webcam-capture.jpg');
      } else if (photoPreview) {
        const blob = await fetch(photoPreview).then(r => r.blob());
        formData.append('tryonPhoto', blob, 'photo.jpg');
      }

      if (score) formData.append('score', String(score));
      if (recommendedSize) formData.append('recommendedSize', recommendedSize);

      const token = localStorage.getItem('tryon_token');
      const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await fetch(`${BASE_URL}/tryons/ai-generate`, {
        method: 'POST',
        headers: {
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

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      stopWebcam();
    };
  }, [photoPreview]);

  if (loadingProduct) {
    return <LoadingPage message={t('tryon.loading')} />;
  }

  if (!product) {
    return <div style={{ paddingTop: '72px', textAlign: 'center' }}>{t('tryon.productUnavailable')}</div>;
  }

  const sizeOptions = sizes.length ? sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const colorOptions = colors.length ? colors : ['#1a1410'];

  return (
    <div
      className="tryon-page"
      style={{
        background: `radial-gradient(circle at 10% 8%, rgba(91,127,166,0.10), transparent 30%), linear-gradient(180deg,#F9F9F9,#F3F6FA)`
      }}
    >
      <style>{`
.tryon-page {
  padding-top: 72px;
  min-height: 100vh;
}

.tryon-mobile-header {
  display: none;
}

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

@media (max-width: 768px) {
  .tryon-page {
    padding-top: 0 !important;
    padding-bottom: 84px;
  }
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

      {/* EN-TÊTE MOBILE */}
      <div className="tryon-mobile-header">
        <Link to="/" className="tryon-logo">TRY<span>ON</span></Link>
        <div className="tryon-header-actions">
          <Link to="/notifications" aria-label={t('tryon.aria.notifications')} style={{ position: 'relative' }}>
            🔔
          </Link>
          <Link to="/cart" aria-label={t('tryon.aria.cart')} style={{ position: 'relative' }}>
            🛒
          </Link>
        </div>
      </div>

      {/* CONTENU EN-DESSOUS */}
      <div className="tryon-content-header" style={{ padding: '20px 16px', borderBottom: `1px solid ${T.border}`, background: '#fff' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: T.blueDark }}>
          {t('tryon.header.tag')}
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 300,
          color: T.ink,
          marginTop: '8px',
          lineHeight: 1.1
        }}>
          {t('tryon.header.titleStart')}<em style={{ fontStyle: 'italic', color: T.red }}>{t('tryon.header.titleHighlight')}</em>
        </h1>
        <p style={{ color: T.muted, marginTop: '10px', fontSize: '14px', maxWidth: '480px', lineHeight: 1.7 }}>
          {t('tryon.header.description')}
        </p>

        {/* Stepper */}
        <div className="tryon-stepper">
          {[
            { n: 1, label: t('tryon.stepper.step1') },
            { n: 2, label: t('tryon.stepper.step2') },
            { n: 3, label: t('tryon.stepper.step3') }
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
                fontSize: '18px', color: T.muted, flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ÉTAPE 1 : Import / Prise de Photo */}
        {step === 1 && (
          <div className="tryon-grid-upload">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!photoPreview && !webcamActive ? (
                <div 
                  className="tryon-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2.5px dashed ${T.border}`,
                    borderRadius: '24px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    background: T.white,
                    cursor: 'pointer',
                    transition: 'all .25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                  }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: T.blueLight, color: T.blueDark,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CameraIcon size={28} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontWeight: 600, color: T.ink }}>
                      {t('tryon.upload.title')}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: T.muted, lineHeight: 1.5 }}>
                      {t('tryon.upload.subtitle')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="tryon-preview" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: '#000' }}>
                  {webcamActive ? (
                    <video 
                      ref={videoRef} 
                      style={{ width: '100%', height: 'auto', display: 'block' }} 
                      playsInline 
                      muted 
                    />
                  ) : (
                    <img 
                      src={photoPreview} 
                      alt="Aperçu" 
                      style={{ width: '100%', height: 'auto', display: 'block' }} 
                    />
                  )}
                  <canvas 
                    ref={canvasRef} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} 
                  />
                  
                  <button 
                    onClick={resetTryon}
                    style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                      borderRadius: '50%', width: '36px', height: '36px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Actions de prise de photo */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {!webcamActive && !photoPreview && (
                  <button
                    onClick={startWebcam}
                    className="btn-webcam"
                    style={{
                      background: T.blueDark, color: '#fff', border: 'none',
                      borderRadius: '14px', padding: '12px 24px', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <CameraIcon size={18} /> {t('tryon.actions.useCamera')}
                  </button>
                )}
                
                {webcamActive && (
                  <button
                    onClick={analyzePhoto}
                    style={{
                      background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`, color: '#fff',
                      border: 'none', borderRadius: '14px', padding: '12px 28px',
                      fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 20px rgba(192,57,43,0.2)'
                    }}
                  >
                    {t('tryon.actions.captureAndAnalyze')}
                  </button>
                )}

                {photoPreview && !webcamActive && (
                  <button
                    onClick={analyzePhoto}
                    style={{
                      background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`, color: '#fff',
                      border: 'none', borderRadius: '14px', padding: '12px 28px',
                      fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 20px rgba(192,57,43,0.2)'
                    }}
                  >
                    {t('tryon.actions.analyzePhoto')}
                  </button>
                )}
              </div>
            </div>

            {/* Fiche Produit (à droite sur desktop) */}
            <div className="tryon-options" style={{ background: T.white, borderRadius: '24px', padding: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: `1px solid ${T.border}` }} 
                />
                <div>
                  <h3 style={{ margin: '0 0 4px', fontWeight: 600, color: T.ink }}>{product.name}</h3>
                  <span style={{ color: T.muted, fontSize: '13px' }}>{product.brand || 'TryOn'}</span>
                  <div style={{ marginTop: '8px', fontWeight: 700, color: T.red }}>{product.price} FCFA</div>
                </div>
              </div>

              {/* Sélection Taille / Couleur */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: '8px' }}>
                    {t('tryon.options.size')}
                  </label>
                  <select 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 16px', borderRadius: '10px',
                      border: `1px solid ${T.border}`, fontSize: '14px',
                      background: T.white, color: T.ink
                    }}
                  >
                    {sizeOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: '8px' }}>
                    {t('tryon.options.color')}
                  </label>
                  <select 
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 16px', borderRadius: '10px',
                      border: `1px solid ${T.border}`, fontSize: '14px',
                      background: T.white, color: T.ink
                    }}
                  >
                    {colorOptions.map(c => (
                      <option key={c} value={c} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Analyse en cours */}
        {step === 2 && (
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', borderRadius: '50%', background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={36} color={T.blueDark} />
            </div>
            <h2 style={{ fontWeight: 600, color: T.ink, marginBottom: '12px' }}>
              {t('tryon.analyzing.title')}
            </h2>
            <p style={{ color: T.muted, marginBottom: '24px', lineHeight: 1.6 }}>
              {t('tryon.analyzing.subtitle')}
            </p>
            
            {/* Barre de progression */}
            <div style={{ width: '100%', height: '6px', background: T.border, borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${analysisProgress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${T.red}, ${T.blueDark})`,
                borderRadius: '6px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: T.muted }}>
              {analysisProgress}%
            </span>
          </div>
        )}

        {/* ÉTAPE 3 : Résultats */}
        {step === 3 && (
          <div>
            <div className="tryon-grid-result">
              {/* Colonne de gauche : Photo + rendu IA */}
              <div>
                <div className="tryon-photo-result">
                  <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: '#000', aspectRatio: '3/4' }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Votre photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : webcamActive && videoRef.current ? (
                      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                    ) : null}
                  </div>
                  <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: '#000', aspectRatio: '3/4' }}>
                    {aiResult ? (
                      <img src={resultFullUrl()} alt="Rendu IA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : aiGenerating ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', flexDirection: 'column', gap: '16px' }}>
                        <Sparkles size={48} />
                        <span>{t('tryon.generating')}</span>
                      </div>
                    ) : aiError ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', padding: '24px', textAlign: 'center', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>⚠️</span>
                        <p style={{ fontSize: '14px' }}>{aiError}</p>
                        <button onClick={handleAITryon} style={{ background: T.red, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer' }}>
                          {t('tryon.actions.retry')}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
                        <Shirt size={48} />
                        <p style={{ fontSize: '14px' }}>{t('tryon.iaReady')}</p>
                        <button onClick={handleAITryon} style={{
                          background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                          color: '#fff', border: 'none', borderRadius: '14px',
                          padding: '12px 32px', fontWeight: 600, cursor: 'pointer',
                          boxShadow: '0 8px 20px rgba(192,57,43,0.2)'
                        }}>
                          <Sparkles size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                          {t('tryon.actions.generateTryon')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {aiResult && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={handleDownload} style={{
                      background: T.blueDark, color: '#fff', border: 'none',
                      borderRadius: '12px', padding: '10px 20px', fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      📥 {t('tryon.actions.download')}
                    </button>
                    <button onClick={handleShareResult} style={{
                      background: T.white, color: T.ink, border: `1px solid ${T.border}`,
                      borderRadius: '12px', padding: '10px 20px', fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      📤 {t('tryon.actions.share')}
                    </button>
                    <button onClick={resetTryon} style={{
                      background: T.white, color: T.muted, border: `1px solid ${T.border}`,
                      borderRadius: '12px', padding: '10px 20px', fontWeight: 500,
                      cursor: 'pointer'
                    }}>
                      {t('tryon.actions.tryAgain')}
                    </button>
                  </div>
                )}
              </div>

              {/* Colonne de droite : Détails */}
              <div className="tryon-details-card" style={{ background: T.white, borderRadius: '24px', padding: '32px', border: `1px solid ${T.border}` }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '24px', marginBottom: '20px' }}>
                  {t('tryon.results.title')}
                </h2>

                {score !== null && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: T.muted }}>{t('tryon.results.compatibility')}</span>
                      <span style={{ fontWeight: 700, fontSize: '20px', color: T.red }}>{score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: T.border, borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${score}%`,
                        height: '100%',
                        background: score > 70 ? 'linear-gradient(90deg, #27AE60, #2ECC71)' : 
                                     score > 40 ? 'linear-gradient(90deg, #F39C12, #F1C40F)' : 
                                     'linear-gradient(90deg, #E74C3C, #C0392B)',
                        borderRadius: '6px'
                      }} />
                    </div>
                  </div>
                )}

                {recommendedSize && (
                  <div style={{ marginBottom: '24px', background: T.blueLight, borderRadius: '16px', padding: '16px 20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: T.blueDark }}>
                      {t('tryon.results.recommendedSize')}
                    </span>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: T.blueNavy, marginTop: '4px' }}>
                      {recommendedSize}
                    </div>
                  </div>
                )}

                {measurements && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: T.muted, marginBottom: '12px' }}>
                      {t('tryon.results.measurements')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: T.cream, padding: '10px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: T.muted }}>{t('tryon.results.shoulders')}</span>
                        <div style={{ fontWeight: 600 }}>{(measurements.shoulderWidthNorm * 100).toFixed(1)}%</div>
                      </div>
                      <div style={{ background: T.cream, padding: '10px 14px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: T.muted }}>{t('tryon.results.hips')}</span>
                        <div style={{ fontWeight: 600 }}>{(measurements.hipWidthNorm * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleAddToCart} style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                  color: '#fff', border: 'none', borderRadius: '14px',
                  padding: '14px', fontSize: '16px', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 8px 20px rgba(192,57,43,0.2)',
                  transition: 'transform 0.2s ease',
                  marginTop: '8px'
                }}>
                  🛒 {t('tryon.actions.addToCart')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}