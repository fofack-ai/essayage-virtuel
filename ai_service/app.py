from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from pathlib import Path
from PIL import Image
from gradio_client import Client, handle_file
from dotenv import load_dotenv
import os
import uuid
import shutil

load_dotenv()

app = FastAPI(title="TryOn AI Service")

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

HF_TOKEN = os.getenv("HF_TOKEN") or None
HF_CATVTON_SPACE = os.getenv("HF_CATVTON_SPACE", "zhengchong/CatVTON")

@app.get("/")
def health():
    return {"success": True, "message": "TryOn AI Service is running"}

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
    elif isinstance(result, list):
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

def make_file_data(file_path):
    file_path = Path(file_path)

    return {
        "path": str(file_path),
        "url": None,
        "size": file_path.stat().st_size if file_path.exists() else None,
        "orig_name": file_path.name,
        "mime_type": "image/png",
        "is_stream": False,
        "meta": {"_type": "gradio.FileData"},
    }


def normalize_editor(editor):
    def normalize_value(value):
        if value is None:
            return None

        if isinstance(value, str):
            return make_file_data(value)

        if isinstance(value, dict):
            if "path" in value and "meta" not in value:
                value["meta"] = {"_type": "gradio.FileData"}
            return value

        return value

    return {
        "background": normalize_value(editor.get("background")),
        "layers": [normalize_value(layer) for layer in editor.get("layers", [])],
        "composite": normalize_value(editor.get("composite")),
        "id": editor.get("id"),
    }


def run_catvton(person_path, garment_path, output_path):
    client = Client(HF_CATVTON_SPACE)

    person_editor = client.predict(
        image_path=handle_file(str(person_path)),
        api_name="/person_example_fn_2"
    )

    person_editor = normalize_editor(person_editor)

    result = client.predict(
        person_image=person_editor,
        cloth_image=handle_file(str(garment_path)),
        num_inference_steps=30,
        guidance_scale=2.5,
        seed=42,
        api_name="/submit_function_p2p",
    )

    copy_result_to_output(result, output_path)

@app.post("/tryon")
async def generate_tryon(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...)
):
    job_id = str(uuid.uuid4())

    person_path = OUTPUT_DIR / f"{job_id}_person.png"
    garment_path = OUTPUT_DIR / f"{job_id}_garment.png"
    output_path = OUTPUT_DIR / f"{job_id}_result.png"

    with person_path.open("wb") as buffer:
        shutil.copyfileobj(person_image.file, buffer)

    with garment_path.open("wb") as buffer:
        shutil.copyfileobj(garment_image.file, buffer)

    try:
        run_catvton(person_path, garment_path, output_path)
    except Exception as e:
        print("[CatVTON HF] Erreur :", str(e))
        print("[CatVTON HF] Fallback image côte à côte activé")
        fallback_side_by_side(person_path, garment_path, output_path)

    return FileResponse(output_path, media_type="image/png", filename="tryon_result.png")