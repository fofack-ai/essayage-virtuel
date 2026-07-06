import React, { useRef, useState, useCallback } from 'react';
import { measurementService } from '../../services/measurementService';

const CARD_WIDTH_MM = 85.6; // largeur standard carte bancaire / CNI (ISO/IEC 7810 ID-1)
// Ratio moyen profondeur/largeur du buste, utilisé faute de vue de profil,
// pour estimer une circonférence à partir d'une largeur mesurée de face.
const DEPTH_RATIO = 0.65;

function pxDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Estime une circonférence (cm) à partir d'une largeur mesurée de face (cm) */
function widthToCircumference(widthCm) {
  const depthCm = widthCm * DEPTH_RATIO;
  // Approximation elliptique (formule de Ramanujan simplifiée)
  const a = widthCm / 2;
  const b = depthCm / 2;
  return Math.round(Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))) * 10) / 10;
}

const POINT_STEPS = [
  { key: 'card1', label: 'Cliquez sur un coin de la carte', group: 'calibration' },
  { key: 'card2', label: "Cliquez sur le coin opposé du même côté (largeur de la carte)", group: 'calibration' },
  { key: 'shoulderL', label: 'Cliquez sur la pointe de l\'épaule gauche', group: 'body' },
  { key: 'shoulderR', label: "Cliquez sur la pointe de l'épaule droite", group: 'body' },
  { key: 'chestL', label: 'Cliquez sur le bord gauche de la poitrine (sous les bras)', group: 'body' },
  { key: 'chestR', label: 'Cliquez sur le bord droit de la poitrine (sous les bras)', group: 'body' },
  { key: 'waistL', label: 'Cliquez sur le bord gauche de la taille (le plus fin)', group: 'body' },
  { key: 'waistR', label: 'Cliquez sur le bord droit de la taille', group: 'body' },
  { key: 'hipL', label: 'Cliquez sur le bord gauche des hanches (le plus large)', group: 'body' },
  { key: 'hipR', label: 'Cliquez sur le bord droit des hanches', group: 'body' },
];

export default function GuidedMeasurement({ productCategory, onComplete, onCancel }) {
  const [mode, setMode] = useState(null); // 'photo' | 'manual' | null
  const [photo, setPhoto] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [points, setPoints] = useState({});
  const [isStretchFabric, setIsStretchFabric] = useState(false);
  const [manualForm, setManualForm] = useState({ chestCm: '', waistCm: '', hipCm: '', shoulderCm: '', heightCm: '' });
  const [computed, setComputed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentStep = POINT_STEPS[stepIndex];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setPoints({});
    setStepIndex(0);
    setComputed(null);
    setError(null);
  };

  const handleImageClick = useCallback((e) => {
    if (!currentStep) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) => ({ ...prev, [currentStep.key]: { x, y } }));
    setStepIndex((i) => Math.min(i + 1, POINT_STEPS.length));
  }, [currentStep]);

  const allPointsPlaced = Object.keys(points).length === POINT_STEPS.length;

  const computeFromPoints = () => {
    const cardPx = pxDistance(points.card1, points.card2);
    if (cardPx < 5) {
      setError("La carte semble trop petite ou mal cliquée. Reprenez l'étalonnage.");
      return;
    }
    const cmPerPx = (CARD_WIDTH_MM / 10) / cardPx;

    const shoulderCm = Math.round(pxDistance(points.shoulderL, points.shoulderR) * cmPerPx * 10) / 10;
    const chestWidthCm = pxDistance(points.chestL, points.chestR) * cmPerPx;
    const waistWidthCm = pxDistance(points.waistL, points.waistR) * cmPerPx;
    const hipWidthCm = pxDistance(points.hipL, points.hipR) * cmPerPx;

    const result = {
      method: 'photo_guided',
      shoulderCm,
      chestCm: widthToCircumference(chestWidthCm),
      waistCm: widthToCircumference(waistWidthCm),
      hipCm: widthToCircumference(hipWidthCm),
      isStretchFabric,
      calibrationRefMm: CARD_WIDTH_MM,
    };
    setComputed(result);
  };

  const handleManualChange = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitManual = () => {
    const result = {
      method: 'manual',
      shoulderCm: manualForm.shoulderCm ? Number(manualForm.shoulderCm) : null,
      chestCm: manualForm.chestCm ? Number(manualForm.chestCm) : null,
      waistCm: manualForm.waistCm ? Number(manualForm.waistCm) : null,
      hipCm: manualForm.hipCm ? Number(manualForm.hipCm) : null,
      heightCm: manualForm.heightCm ? Number(manualForm.heightCm) : null,
      isStretchFabric,
    };
    setComputed(result);
  };

  const confirmAndSave = async () => {
    if (!computed) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await measurementService.save(computed);
      const recommendation = await measurementService.recommend({
        chestCm: computed.chestCm,
        waistCm: computed.waistCm,
        hipCm: computed.hipCm,
        isStretchFabric: computed.isStretchFabric,
      });
      onComplete?.({ measurement: saved.data, recommendation: recommendation.data });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {!mode && (
        <div>
          <h3>Comment souhaitez-vous prendre vos mesures ?</h3>
          <p style={{ fontSize: 13, color: '#6A6F78' }}>
            Pour une couture sur mesure, la précision compte. La saisie manuelle
            au mètre ruban reste la méthode la plus fiable ; la photo guidée
            donne une estimation rapide (±5–8 cm).
          </p>
          <button onClick={() => setMode('manual')}>📏 Saisie manuelle (recommandé)</button>
          <button onClick={() => setMode('photo')}>📷 Estimation par photo guidée</button>
        </div>
      )}

      {mode === 'photo' && !photo && (
        <div>
          <h3>Avant de commencer</h3>
          <ul style={{ fontSize: 13 }}>
            <li>Portez un vêtement près du corps</li>
            <li>Tenez une carte bancaire ou CNI bien à plat contre la poitrine</li>
            <li>Photo de face, bras légèrement écartés du corps, tout le buste visible</li>
            <li>Bonne lumière, fond uni si possible</li>
          </ul>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFile} />
        </div>
      )}

      {mode === 'photo' && photo && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600 }}>
            {currentStep ? currentStep.label : 'Tous les points sont placés'}
          </p>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              ref={imgRef}
              src={photo}
              alt="à mesurer"
              onClick={handleImageClick}
              style={{ maxWidth: '100%', cursor: currentStep ? 'crosshair' : 'default' }}
            />
            {Object.entries(points).map(([key, p]) => (
              <div key={key} style={{
                position: 'absolute', left: p.x - 4, top: p.y - 4,
                width: 8, height: 8, borderRadius: '50%', background: '#C0392B',
              }} />
            ))}
          </div>
          <label style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
            <input type="checkbox" checked={isStretchFabric} onChange={(e) => setIsStretchFabric(e.target.checked)} />
            {' '}Le tissu de ce vêtement est extensible
          </label>
          {allPointsPlaced && !computed && (
            <button onClick={computeFromPoints}>Calculer mes mesures</button>
          )}
        </div>
      )}

      {mode === 'manual' && !computed && (
        <div>
          {['heightCm', 'shoulderCm', 'chestCm', 'waistCm', 'hipCm'].map((field) => (
            <div key={field} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, display: 'block' }}>{field.replace('Cm', '')} (cm)</label>
              <input
                type="number"
                value={manualForm[field]}
                onChange={(e) => handleManualChange(field, e.target.value)}
              />
            </div>
          ))}
          <label style={{ display: 'block', fontSize: 13 }}>
            <input type="checkbox" checked={isStretchFabric} onChange={(e) => setIsStretchFabric(e.target.checked)} />
            {' '}Tissu extensible
          </label>
          <button onClick={submitManual}>Valider mes mesures</button>
        </div>
      )}

      {computed && (
        <div>
          <h4>Vérifiez vos mesures</h4>
          {['chestCm', 'waistCm', 'hipCm', 'shoulderCm'].map((f) => computed[f] != null && (
            <div key={f}>
              {f}: <input
                type="number"
                value={computed[f]}
                onChange={(e) => setComputed((c) => ({ ...c, [f]: Number(e.target.value) }))}
              /> cm
            </div>
          ))}
          {error && <p style={{ color: '#C0392B' }}>{error}</p>}
          <button disabled={saving} onClick={confirmAndSave}>
            {saving ? 'Enregistrement…' : 'Confirmer et voir ma taille'}
          </button>
        </div>
      )}

      <button onClick={onCancel} style={{ marginTop: 12 }}>Annuler</button>
    </div>
  );
}