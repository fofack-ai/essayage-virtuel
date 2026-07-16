"""
Script de diagnostic du service IA d'essayage virtuel.

Usage :
    python diagnostic.py                 -> vérifie la connexion et liste l'API du Space
    python diagnostic.py personne.jpg vetement.jpg -> tente une vraie génération

À lancer AVANT de démarrer le serveur, pour vérifier que tout est en place.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN") or None
HF_CATVTON_SPACE = os.getenv("HF_CATVTON_SPACE", "zhengchong/CatVTON")

print("=" * 60)
print("DIAGNOSTIC SERVICE IA — Essayage virtuel")
print("=" * 60)
print(f"Space         : {HF_CATVTON_SPACE}")
print(f"Token HF      : {'OUI (' + HF_TOKEN[:8] + '...)' if HF_TOKEN else 'NON — les appels échoueront par manque de quota GPU !'}")
print()

print("1) Connexion au Space...")
try:
    from gradio_client import Client, handle_file
    import inspect

    def build_client(space, token):
        params = inspect.signature(Client.__init__).parameters
        if token:
            if "token" in params:
                return Client(space, token=token)
            if "hf_token" in params:
                return Client(space, hf_token=token)
            if "headers" in params:
                return Client(space, headers={"Authorization": f"Bearer {token}"})
            os.environ["HF_TOKEN"] = token
        return Client(space)

    client = build_client(HF_CATVTON_SPACE, HF_TOKEN)
    print("   OK — Space joignable\n")
except Exception as e:
    print(f"   ÉCHEC : {e}")
    print("   -> Le Space est peut-être en pause/reconstruction, ou pas d'internet.")
    sys.exit(1)

print("2) Endpoints exposés par le Space :")
try:
    api = client.view_api(return_format="dict", print_info=False)
    for name in (api.get("named_endpoints") or {}):
        print(f"   - {name}")
    if "/submit_function" not in (api.get("named_endpoints") or {}):
        print("   ATTENTION : /submit_function introuvable — l'API a changé,")
        print("   adaptez api_name dans app.py avec un des endpoints listés ci-dessus.")
    print()
except Exception as e:
    print(f"   Impossible de lister l'API : {e}\n")

if len(sys.argv) == 3:
    person, garment = Path(sys.argv[1]), Path(sys.argv[2])
    if not person.exists() or not garment.exists():
        print("Fichiers introuvables."); sys.exit(1)

    print(f"3) Génération test : {person.name} + {garment.name} (30 étapes)...")
    print("   (peut prendre 1 à 3 minutes, ne pas interrompre)")
    try:
        # Le Space fait person_image["layers"][0] dès sa première ligne :
        # une liste vide provoque un IndexError. On fournit un calque
        # transparent -> masque uniforme -> le Space bascule sur son
        # masquage automatique, ce qui est le comportement voulu.
        blank = person.with_name(person.stem + "_layer.png")
        with Image.open(person) as im:
            Image.new("RGBA", im.size, (0, 0, 0, 0)).save(blank)

        result = client.predict(
            person_image={
                "background": handle_file(str(person)),
                "layers": [handle_file(str(blank))],
                "composite": None,
            },
            cloth_image=handle_file(str(garment)),
            cloth_type="upper",
            num_inference_steps=30,
            guidance_scale=2.5,
            seed=-1,
            show_type="result only",
            api_name="/submit_function",
        )
        print(f"   SUCCÈS ! Résultat : {result}")
        print("   -> OUVRE CETTE IMAGE : la veste est-elle appliquée ?")
        print("      - OUI -> le Space fonctionne, le souci est ailleurs (Render, images envoyées)")
        print("      - NON -> le payload est en cause, on teste /person_example_fn")
    except Exception as e:
        print(f"   ÉCHEC : {e}")
        print("   -> Lisez le message : quota GPU ? endpoint changé ? image invalide ?")
else:
    print("3) (génération test ignorée — passez deux images en argument pour la lancer)")