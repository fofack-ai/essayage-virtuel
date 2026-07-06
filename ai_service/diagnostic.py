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
    if "/submit_function_p2p" not in (api.get("named_endpoints") or {}):
        print("   ATTENTION : /submit_function_p2p introuvable — l'API a changé,")
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
        result = client.predict(
            person_image={"background": handle_file(str(person)), "layers": [], "composite": None},
            cloth_image=handle_file(str(garment)),
            num_inference_steps=30,
            guidance_scale=3.5,
            seed=-1,
            api_name="/submit_function_p2p",
        )
        print(f"   SUCCÈS ! Résultat : {result}")
        print("   -> L'essayage virtuel fonctionne. Vous pouvez lancer le serveur.")
    except Exception as e:
        print(f"   ÉCHEC : {e}")
        print("   -> Lisez le message : quota GPU ? endpoint changé ? image invalide ?")
else:
    print("3) (génération test ignorée — passez deux images en argument pour la lancer)")
