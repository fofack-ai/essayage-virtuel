from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from PIL import Image
from gradio_client import Client, handle_file
from dotenv import load_dotenv
import os
import uuid
import shutil
import traceback

load_dotenv()

app = FastAPI(title="TryOn AI Service")

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

HF_TOKEN = os.getenv("HF_TOKEN") or None
HF_CATVTON_SPACE = os.getenv("HF_CATVTON_SPACE", "zhengchong/CatVTON")

# Nombre d'étapes d'inférence : 30 par défaut.
# Plus c'est haut, plus c'est joli... et plus ça consomme le quota ZeroGPU.
# 50 étapes dépassait régulièrement le quota gratuit -> échec systématique.
NUM_STEPS = int(os.getenv("AI_NUM_STEPS", "30"))

# --- Configuration FASHN (fournisseur alternatif, API commerciale) ---
FASHN_API_KEY = os.getenv("FASHN_API_KEY")
FASHN_BASE_URL = "https://api.fashn.ai/v1"

# Quel fournisseur utiliser : "catvton" (défaut, gratuit) ou "fashn" (payant, pro)
AI_PROVIDER = os.getenv("AI_TRYON_STRATEGY", "catvton").lower()

# En développement, mettre AI_DEBUG_FALLBACK=true dans le .env pour retrouver
# l'ancien comportement (collage côte à côte au lieu d'une erreur).
# NE JAMAIS activer en production : le client croirait que c'est le résultat IA.
DEBUG_FALLBACK = os.getenv("AI_DEBUG_FALLBACK", "false").lower() == "true"

# Client Gradio mis en cache : la connexion au Space prend plusieurs secondes,
# inutile de la refaire à chaque requête.
_client = None


def build_client(space, token):
    """
    Crée le client Gradio en s'adaptant à la version installée de
    gradio_client : le paramètre d'authentification a changé de nom
    au fil des versions (hf_token -> token), et certaines versions
    n'acceptent que des headers HTTP.
    """
    import inspect
    params = inspect.signature(Client.__init__).parameters

    if token:
        if "token" in params:
            return Client(space, token=token)
        if "hf_token" in params:
            return Client(space, hf_token=token)
        if "headers" in params:
            return Client(space, headers={"Authorization": f"Bearer {token}"})
        # Dernier recours : huggingface_hub lit la variable d'environnement
        os.environ["HF_TOKEN"] = token

    return Client(space)


def get_client():
    global _client
    if _client is None:
        # LE point crucial : passer le token Hugging Face.
        # Sans token, le quota ZeroGPU est quasi nul et les appels
        # échouent avec "You have exceeded your GPU quota".
        _client = build_client(HF_CATVTON_SPACE, HF_TOKEN)
    return _client


def reset_client():
    """Force une reconnexion au Space (utile si la session a expiré)."""
    global _client
    _client = None


@app.get("/")
def health():
    return {
        "success": True,
        "message": "TryOn AI Service is running",
        "space": HF_CATVTON_SPACE,
        "hf_token_configured": bool(HF_TOKEN),
        "num_steps": NUM_STEPS,
        "debug_fallback": DEBUG_FALLBACK,
        "provider": AI_PROVIDER,
    }


def fallback_side_by_side(person_path, garment_path, output_path):
    person = Image.open(person_path).convert("RGB").resize((384, 512))
    garment = Image.open(garment_path).convert("RGB").resize((384, 512))
    result = Image.new("RGB", (768, 512), "white")
    result.paste(person, (0, 0))
    result.paste(garment, (384, 0))
    result.save(output_path)


def copy_result_to_output(result, output_path):
    if isinstance(result, str):
        generated_path = result
    elif isinstance(result, (list, tuple)):
        generated_path = result[0]
    elif isinstance(result, dict):
        generated_path = result.get("path") or result.get("image") or result.get("url")
    else:
        raise RuntimeError(f"Format résultat non reconnu : {type(result)}")

    if isinstance(generated_path, dict):
        generated_path = generated_path.get("path") or generated_path.get("url")

    if not generated_path:
        raise RuntimeError("Aucun chemin image retourné par CatVTON")

    if str(generated_path).startswith("http"):
        import requests
        r = requests.get(generated_path, timeout=120)
        r.raise_for_status()
        output_path.write_bytes(r.content)
    else:
        shutil.copyfile(generated_path, output_path)

    # Le Space renvoie du WebP : on normalise en vrai PNG,
    # pour que le fichier corresponde au media_type annoncé.
    img = Image.open(output_path).convert("RGB")
    img.save(output_path, format="PNG")


def make_editor_payload(person_path):
    """
    Construit le payload ImageEditor attendu par le Space.

    Le Space fait `person_image["layers"][0]` dès sa première ligne : une
    liste vide provoque un IndexError. On fournit donc un calque uni et
    transparent — aucun masque dessiné. CatVTON teste ensuite
    `len(np.unique(mask)) == 1` et bascule alors sur son masquage
    automatique, ce qui est précisément ce que l'on veut.
    """
    with Image.open(person_path) as im:
        size = im.size

    blank_path = person_path.with_name(person_path.stem + "_layer.png")
    Image.new("RGBA", size, (0, 0, 0, 0)).save(blank_path)

    return {
        "background": handle_file(str(person_path)),
        "layers": [handle_file(str(blank_path))],
        "composite": None,
    }

def run_fashn(person_path, garment_path, output_path):
    """
    Génère un essayage via l'API FASHN (fournisseur commercial).
    FASHN fonctionne en 2 temps : on soumet la requête (/run), on reçoit
    un ID, puis on interroge (/status) en boucle jusqu'au résultat.
    """
    import base64
    import time
    import requests

    if not FASHN_API_KEY:
        raise RuntimeError("FASHN_API_KEY absente du .env")

    def to_data_uri(path):
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {FASHN_API_KEY}",
    }

    # 1. Soumettre la requête
    payload = {
        "model_name": "tryon-v1.6",
        "inputs": {
            "model_image": to_data_uri(person_path),
            "garment_image": to_data_uri(garment_path),
            "mode": "balanced",
            "output_format": "png",
        },
    }
    run_resp = requests.post(f"{FASHN_BASE_URL}/run", json=payload, headers=headers, timeout=60)
    run_resp.raise_for_status()
    prediction_id = run_resp.json().get("id")
    if not prediction_id:
        raise RuntimeError("FASHN n'a pas retourné d'ID de prédiction")

    # 2. Interroger le statut jusqu'à complétion (max ~90 secondes)
    for _ in range(45):  # 45 x 2s = 90s max
        time.sleep(2)
        status_resp = requests.get(
            f"{FASHN_BASE_URL}/status/{prediction_id}", headers=headers, timeout=30
        )
        status_resp.raise_for_status()
        data = status_resp.json()
        status = data.get("status")

        if status == "completed":
            output_urls = data.get("output") or []
            if not output_urls:
                raise RuntimeError("FASHN : résultat vide")
            img_resp = requests.get(output_urls[0], timeout=60)
            img_resp.raise_for_status()
            output_path.write_bytes(img_resp.content)
            img = Image.open(output_path).convert("RGB")
            img.save(output_path, format="PNG")
            return

        if status in ("failed", "canceled", "timed_out"):
            err = data.get("error") or {}
            raise RuntimeError(f"FASHN a échoué : {err.get('message', status)}")

    raise RuntimeError("FASHN : délai dépassé (le service met trop de temps)")


def run_catvton(person_path, garment_path, output_path, cloth_type="upper"):
    client = get_client()

    result = client.predict(
        person_image=make_editor_payload(person_path),
        cloth_image=handle_file(str(garment_path)),
        cloth_type=cloth_type,        # upper / lower / overall : indique au modèle
                                      # QUELLE partie du corps doit être remplacée.
        num_inference_steps=NUM_STEPS,
        guidance_scale=2.5,           # valeur par défaut du Space pour cet endpoint
        seed=-1,  # -1 = aléatoire : si le SafetyChecker du Space bloque un
                  # résultat (faux positif fréquent), un retry a une chance
                  # de passer, ce qu'un seed fixe interdisait.
        show_type="result only",      # sinon le Space renvoie un collage
                                      # entrée + masque + résultat.
        api_name="/submit_function",  # /submit_function_p2p attend la photo d'une
                                      # AUTRE PERSONNE portant le vêtement, pas une
                                      # image de vêtement à plat -> aucun effet.
    )

    copy_result_to_output(result, output_path)


def translate_error(exc: Exception) -> str:
    """Transforme les erreurs techniques en messages exploitables côté client."""
    msg = str(exc)
    low = msg.lower()

    if "gpu quota" in low or "exceeded" in low and "quota" in low:
        return (
            "Le quota GPU gratuit de Hugging Face est atteint. "
            "Réessayez dans quelques minutes."
        )
    if "queue" in low and ("full" in low or "timeout" in low):
        return "Le service IA est saturé pour le moment. Réessayez dans quelques minutes."
    if "404" in msg or "not found" in low or "api_name" in low:
        return (
            "L'API du modèle IA a changé de format "
            "(endpoint introuvable). Contactez l'administrateur."
        )
    if "connect" in low or "connection" in low:
        return "Impossible de joindre le service IA Hugging Face. Vérifiez la connexion internet."
    return f"Échec de la génération IA : {msg[:200]}"


@app.post("/tryon")
async def generate_tryon(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    cloth_type: str = Form("upper"),
):
    if cloth_type not in ("upper", "lower", "overall"):
        cloth_type = "upper"

    job_id = str(uuid.uuid4())

    person_path = OUTPUT_DIR / f"{job_id}_person.png"
    garment_path = OUTPUT_DIR / f"{job_id}_garment.png"
    output_path = OUTPUT_DIR / f"{job_id}_result.png"

    with person_path.open("wb") as buffer:
        shutil.copyfileobj(person_image.file, buffer)

    with garment_path.open("wb") as buffer:
        shutil.copyfileobj(garment_image.file, buffer)

    try:
        if AI_PROVIDER == "fashn":
            # Fournisseur commercial FASHN (activé via AI_TRYON_STRATEGY=fashn)
            print("[TryOn] Fournisseur : FASHN")
            run_fashn(person_path, garment_path, output_path)
        else:
            # Fournisseur par défaut : CatVTON (gratuit)
            print("[TryOn] Fournisseur : CatVTON")
            try:
                run_catvton(person_path, garment_path, output_path, cloth_type)
            except Exception:
                # La session Gradio peut expirer : une reconnexion + 1 retry
                # règle la majorité des échecs transitoires.
                print("[CatVTON] Premier essai échoué, reconnexion au Space...")
                reset_client()
                run_catvton(person_path, garment_path, output_path, cloth_type)

        return FileResponse(
            output_path, media_type="image/png", filename="tryon_result.png"
        )

    except Exception as e:
        # Log complet côté serveur pour le debug
        print("[CatVTON] ÉCHEC DÉFINITIF :")
        traceback.print_exc()

        if DEBUG_FALLBACK:
            print("[CatVTON] AI_DEBUG_FALLBACK actif -> collage côte à côte")
            fallback_side_by_side(person_path, garment_path, output_path)
            return FileResponse(
                output_path, media_type="image/png", filename="tryon_result.png"
            )

        # Plus de fallback silencieux : on renvoie une vraie erreur que le
        # backend Node peut transmettre au client avec un message clair.
        return JSONResponse(
            status_code=502,
            content={"success": False, "message": translate_error(e)},
        )