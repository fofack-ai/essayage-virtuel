import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api, getImageUrl } from '../../services/api';

// MediaPipe
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

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
  const heightNorm = ankleY - noseY; // doit être positif

  if (heightNorm <= 0) return null;

  const shoulderWidthNorm = Math.abs(landmarks[12].x - landmarks[11].x);
  const hipWidthNorm = Math.abs(landmarks[24].x - landmarks[23].x);

  return { heightNorm, shoulderWidthNorm, hipWidthNorm };
}

/** Calcule un score de compatibilité (0-100) à partir des mensurations */
function calculateScoreFromMeasurements(m) {
  const shoulderToHeight = m.shoulderWidthNorm / m.heightNorm;
  const hipToHeight = m.hipWidthNorm / m.heightNorm;

  // Valeurs idéales (à ajuster selon des données réelles)
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

  // Refs
  const fileInputRef = useRef();
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
      alert('Aucune silhouette détectée. Essayez une photo de face en pied.');
      setStep(1);
      return;
    }

    // Progression
    setAnalysisProgress(30);
    setTimeout(() => setAnalysisProgress(60), 500);
    setTimeout(() => setAnalysisProgress(100), 1000);

    // Calcul des mensurations, score et taille
    const m = getMeasurements(detectedLandmarks);
    if (!m) {
      alert('Impossible de calculer les mensurations. Veuillez essayer une autre photo.');
      setStep(1);
      return;
    }
    setMeasurements(m);

    const scoreVal = calculateScoreFromMeasurements(m);
    setScore(scoreVal);
    const sizeVal = recommendSizeFromMeasurements(m);
    setRecommendedSize(sizeVal);

    // Sauvegarder l'essai
    await saveTryon(detectedLandmarks, scoreVal, sizeVal);

    setStep(3);
  };

  /* ── 6. Sauvegarde de l'essai ── */
  const saveTryon = async (landmarks, scoreVal, sizeVal) => {
    if (!user) {
      alert('Veuillez vous connecter pour enregistrer votre essai.');
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

        const response = await api.post('/tryons/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedTryon = response.data.data;
      } else {
        const response = await api.post('/tryons', tryonData);
        uploadedTryon = response.data.data;
      }

      setTryonId(uploadedTryon.id);
    } catch (err) {
      console.error('Erreur sauvegarde essai:', err);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  /* ── 7. Ajout au panier ── */
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

    // ✅ FIX 1 : le token est dans sessionStorage avec la clé "tryon_token"
    const token = sessionStorage.getItem('tryon_token');

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
    return <div style={{ paddingTop: '72px', textAlign: 'center' }}>Chargement du produit...</div>;
  }

  if (!product) {
    return <div style={{ paddingTop: '72px', textAlign: 'center' }}>Produit non disponible</div>;
  }

  const sizeOptions = sizes.length ? sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const colorOptions = colors.length ? colors : ['#1a1410'];

  return (
    <div style={{
      paddingTop: '72px',
      minHeight: '100vh',
      background: `radial-gradient(circle at 10% 8%, rgba(91,127,166,0.10), transparent 30%), linear-gradient(180deg,#F9F9F9,#F3F6FA)`
    }}>
      {/* En-tête */}
      <div style={{ padding: '48px 80px 36px', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: T.blueDark }}>
          <span style={{ color: T.red }}>✦</span> Technologie IA
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(32px,4vw,52px)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
          {[
            { n: 1, label: 'Photo & Taille' },
            { n: 2, label: 'Analyse' },
            { n: 3, label: 'Résultats' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
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
                <span style={{
                  fontSize: '13px',
                  fontWeight: step === s.n ? 600 : 400,
                  color: step >= s.n ? T.ink : T.muted
                }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
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

      <div style={{ padding: '40px 80px 80px' }}>
        {/* ÉTAPE 1 : Upload + sélections */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '32px', alignItems: 'start' }}>
            {/* Colonne gauche : upload photo/webcam */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                1. Votre photo
              </h2>
              <p style={{ fontSize: '12px', color: T.muted, marginBottom: '20px' }}>Glissez ou cliquez pour importer</p>

              <div
                onClick={() => !photo && !useWebcam && fileInputRef.current.click()}
                style={{
                  border: `2px dashed ${photo || useWebcam ? T.red : 'rgba(26,26,26,0.20)'}`,
                  borderRadius: '18px',
                  background: photo || useWebcam ? 'rgba(192,57,43,0.02)' : T.white,
                  minHeight: '340px',
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
                  <div style={{ position: 'relative', width: '100%', height: '340px' }}>
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                      📷 Webcam active
                    </div>
                  </div>
                ) : photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="preview"
                      style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: '16px' }}
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

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {!useWebcam && !photo && (
                  <button
                    onClick={startWebcam}
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
                      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    Utiliser la webcam
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

              <div style={{
                borderRadius: '18px',
                overflow: 'hidden',
                minHeight: '340px',
                position: 'relative',
                background: `linear-gradient(145deg, #F0F4F9, #E6EEF6)`,
                border: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                {photoPreview || useWebcam ? (
                  <div style={{ position: 'relative', width: '100%', height: '340px' }}>
                    {useWebcam ? (
                      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay playsInline />
                    ) : (
                      <img src={photoPreview} alt="essayage" style={{ width: '100%', height: '340px', objectFit: 'cover' }} />
                    )}
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
                      <span style={{ fontSize: '22px' }}>👕</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: T.ink }}>{product.name}</div>
                        <div style={{ fontSize: '11px', color: T.muted }}>Taille {selectedSize} · Aperçu IA</div>
                      </div>
                      <div style={{
                        background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`,
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        ✨ IA
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(53,92,134,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '36px',
                    }}>
                      👗
                    </div>
                    <p style={{ fontWeight: 500, color: T.muted, fontSize: '14px', marginBottom: '8px' }}>Le rendu apparaîtra ici</p>
                    <p style={{ fontSize: '12px', color: 'rgba(106,111,120,0.7)' }}>Uploadez votre photo ou activez la webcam</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : sélections + lancement */}
            <div style={{
              background: T.white,
              borderRadius: '20px',
              border: `1px solid ${T.border}`,
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(26,26,26,0.08)',
              position: 'sticky',
              top: '88px',
            }}>
              <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '12px' }}>
                  Article sélectionné
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '64px',
                    borderRadius: '10px',
                    background: `linear-gradient(145deg, #F8F9FB, ${T.blueLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                  }}>
                    👕
                  </div>
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
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {sizeOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '7px 13px',
                        borderRadius: '8px',
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
                        border: `2px solid ${selectedColor === color ? T.blueDark : T.borderLight}`,
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
                  onClick={analyzePhoto}
                  disabled={!photoPreview && !useWebcam}
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
                  <span style={{ fontSize: '16px' }}>✨</span>
                  {!photoPreview && !useWebcam ? "Uploadez une photo d'abord" : "Lancer l'essayage IA"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Analyse */}
        {step === 2 && (
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
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
              {['Détection du corps', 'Analyse morphologique', 'Calcul des mensurations', 'Score de compatibilité'].map((label, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: analysisProgress >= (i + 1) * 25 ? T.blueLight : T.white,
                  border: `1px solid ${analysisProgress >= (i + 1) * 25 ? 'rgba(53,92,134,0.30)' : T.border}`,
                }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: analysisProgress >= (i + 1) * 25 ? `linear-gradient(135deg, ${T.red}, ${T.redDark})` : 'rgba(26,26,26,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {analysisProgress >= (i + 1) * 25 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: analysisProgress >= (i + 1) * 25 ? 500 : 400,
                    color: analysisProgress >= (i + 1) * 25 ? T.ink : T.muted,
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
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '48px', alignItems: 'start', marginBottom: '48px' }}>
              {/* Colonne gauche : photo + mensurations */}
              <div>
                <div style={{ borderRadius: '18px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="essayage" style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '380px', background: T.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '64px' }}>🧍</span>
                    </div>
                  )}
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
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(249,249,249,0.96)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '10px', color: T.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Score IA</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: T.red, lineHeight: 1 }}>
                      {score || 0}%
                    </div>
                    <div style={{ fontSize: '10px', color: T.blueDark }}>Taille {recommendedSize || selectedSize}</div>
                  </div>
                </div>

                {/* Mensurations détectées */}
                <div style={{ background: T.white, borderRadius: '16px', border: `1px solid ${T.border}`, padding: '24px', boxShadow: '0 12px 34px rgba(26,26,26,0.075)' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, marginBottom: '20px' }}>
                    Mensurations détectées
                  </h3>
                  {measurements ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontSize: '13px', color: T.muted }}>Épaules</span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                          {((measurements.shoulderWidthNorm / measurements.heightNorm) * 100).toFixed(0)}% de la hauteur
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontSize: '13px', color: T.muted }}>Hanches</span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                          {((measurements.hipWidthNorm / measurements.heightNorm) * 100).toFixed(0)}% de la hauteur
                        </span>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: T.muted }}>Aucune donnée disponible</p>
                  )}
                </div>

                <button
                  onClick={resetTryon}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: 'transparent',
                    color: T.muted,
                    border: `1px solid ${T.border}`,
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  ← Nouvelle photo
                </button>
              </div>

              {/* Colonne droite : résultats détaillés */}
              <div style={{ background: T.white, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 18px 50px rgba(26,26,26,0.08)' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
                    Article essayé
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '75px',
                      borderRadius: '12px',
                      background: `linear-gradient(145deg, #F8F9FB, #E9EFF6)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                    }}>
                      👕
                    </div>
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

                {/* Score détaillé */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
                    Score de compatibilité
                  </div>
                  <div style={{ background: `linear-gradient(135deg, ${T.blueDark}, ${T.ink})`, borderRadius: '18px', padding: '20px', color: '#fff' }}>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Correspondance morphologique</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, lineHeight: 1 }}>
                      {score || 0}%
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Excellente compatibilité</div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${score || 0}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${T.red}, ${T.blue})`,
                        borderRadius: '2px',
                      }} />
                    </div>
                  </div>
                </div>

                {/* ── Section génération IA ── */}
<div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: T.muted, marginBottom: '16px' }}>
    Essayage IA
  </div>

  {/* Bouton principal */}
  {!aiResult && !aiGenerating && (
    <button
      onClick={handleAITryon}
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${T.blue}, ${T.blueNavy})`,
        color: '#fff',
        border: 'none',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(53,92,134,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      Générer avec l'IA
    </button>
  )}

  {/* Loading */}
  {aiGenerating && (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: `3px solid ${T.blueLight}`,
        borderTop: `3px solid ${T.blueDark}`,
        margin: '0 auto 16px',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ color: T.muted, fontSize: '13px', margin: 0 }}>
        L'IA génère votre essayage…
      </p>
      <p style={{ color: T.blueDark, fontSize: '11px', marginTop: '6px', fontWeight: 500 }}>
        Analyse morphologique → description du vêtement → rendu final
      </p>
      <p style={{ color: T.muted, fontSize: '11px', marginTop: '4px' }}>
        ~30 à 60 secondes
      </p>
    </div>
  )}

  {/* Erreur */}
  {aiError && !aiGenerating && (
    <div style={{
      padding: '14px 16px',
      borderRadius: '10px',
      background: 'rgba(192,57,43,0.07)',
      border: `1px solid rgba(192,57,43,0.2)`,
      marginBottom: '12px',
    }}>
      <p style={{ color: T.red, fontSize: '13px', margin: '0 0 8px', fontWeight: 500 }}>
        ⚠ Génération échouée
      </p>
      <p style={{ color: T.muted, fontSize: '12px', margin: 0 }}>{aiError}</p>
      <button
        onClick={handleAITryon}
        style={{ marginTop: '10px', background: 'transparent', border: `1px solid ${T.red}`, color: T.red, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}
      >
        Réessayer
      </button>
    </div>
  )}

  {/* Résultat */}
  {aiResult && !aiGenerating && (
    <div>
      <div style={{
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '14px',
        position: 'relative',
        border: `1px solid ${T.border}`,
      }}>
        {/* Badge IA */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 2,
          background: `linear-gradient(135deg, ${T.blue}, ${T.blueNavy})`,
          color: '#fff', borderRadius: '100px', padding: '4px 12px',
          fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          ✦ Rendu IA
        </div>
        <img
          src={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api(\/v1)?/, '')}${aiResult.resultImageUrl}`}
          alt="Essayage IA"
          style={{ width: '100%', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
          onError={(e) => { e.target.src = photoPreview; }}
        />
      </div>

      {/* Comparaison côte à côte */}
      {photoPreview && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', color: T.muted, textAlign: 'center', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Original</p>
            <img src={photoPreview} alt="photo originale" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '120px' }} />
          </div>
          <div>
            <p style={{ fontSize: '10px', color: T.blueDark, textAlign: 'center', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Avec le vêtement</p>
            <img
              src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${aiResult.resultImageUrl}`}
              alt="Essayage IA"
              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '120px' }}
            />
          </div>
        </div>
      )}

      {/* Regénérer */}
      <button
        onClick={handleAITryon}
        style={{
          width: '100%', padding: '10px',
          borderRadius: '8px', background: 'transparent',
          color: T.blueDark, border: `1px solid ${T.border}`,
          fontSize: '12px', cursor: 'pointer',
        }}
      >
        ↻ Regénérer
      </button>
    </div>
  )}
</div>

                {/* Actions */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
    </div>
  );
}