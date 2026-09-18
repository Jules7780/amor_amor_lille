"""Convertit les photos de sources/ en WebP pour public/images (python scripts/images.py).

Chaque entrée : fichier source, nom de sortie, largeurs voulues, recadrage facultatif
(x, y, largeur, hauteur en proportions de l'image source).
"""
from pathlib import Path

from PIL import Image, ImageOps

RACINE = Path(__file__).resolve().parent.parent
SOURCES = RACINE / "sources"
SORTIE = RACINE / "public" / "images"

PHOTOS = [
    # Fournies
    ("394290.jpg", "salle-principale", [1500, 960], None),
    ("394290.jpg", "salle-principale-mobile", [640], (0.30, 0.0, 0.40, 1.0)),
    ("64956407e3405649563e179bc4_1.png", "neon-amor", [1200, 640], None),
    ("649564ade3f12649563e9242de_b.png", "fondateurs-miroir", [1400, 800], None),
    ("5466df20a87460866df20a874fb66dv.jpg", "fondateurs-neon", [1280, 720], None),
    ("B9734125570Z.1_20230602095737_000+GHOMSEUKI.2-0.jpg", "fondateurs-bar", [864], None),
    ("image.jpg", "soiree-lustres", [415], None),
    ("images.jpg", "salon-lustres", [480], None),
    # Instagram @amoramor_lille (démo, à remplacer par les originaux des gérants)
    ("instagram/facade-1.jpg", "facade-jour", [1200, 720], None),
    ("instagram/facade-2.jpg", "facade-nuit", [1200, 720], None),
    ("instagram/cocktails-1.jpg", "cocktails-tapis", [1200, 720], None),
    ("instagram/cocktails-2.jpg", "cocktail-agrume", [1200, 720], None),
    ("instagram/pizza-1.jpg", "pizza-partage", [1200, 720], None),
    ("instagram/pizza-terrasse.jpg", "cocktail-terrasse", [1200, 720], None),
    ("instagram/terrasse-table.jpg", "terrasse-table", [1200, 720], None),
    ("instagram/piste-1.jpg", "piste", [1200, 720], None),
    ("instagram/foule-1.jpg", "foule", [1200, 720], None),
    ("instagram/neon-nocturnes.jpg", "neon-nocturnes", [1200, 720], None),
]


def recadrer(image: Image.Image, cadre):
    if not cadre:
        return image
    x, y, l, h = cadre
    L, H = image.size
    return image.crop((round(x * L), round(y * H), round((x + l) * L), round((y + h) * H)))


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    for fichier, nom, largeurs, cadre in PHOTOS:
        source = SOURCES / fichier
        if not source.exists():
            print(f"absent : {fichier}")
            continue
        image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
        image = recadrer(image, cadre)
        for i, largeur in enumerate(largeurs):
            copie = image.copy()
            if copie.width > largeur:
                copie = copie.resize((largeur, round(copie.height * largeur / copie.width)), Image.LANCZOS)
            suffixe = "" if i == 0 else f"-{largeur}"
            chemin = SORTIE / f"{nom}{suffixe}.webp"
            copie.save(chemin, "WEBP", quality=80, method=6)
            print(f"{chemin.name} {copie.size} {chemin.stat().st_size // 1024} Ko")

    # Image de partage (Open Graph), en JPEG pour une compatibilité maximale
    salle = Image.open(SOURCES / "394290.jpg").convert("RGB")
    og = ImageOps.fit(salle, (1200, 630), Image.LANCZOS, centering=(0.5, 0.45))
    og.save(SORTIE / "og-image.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    print("og-image.jpg")


if __name__ == "__main__":
    main()
