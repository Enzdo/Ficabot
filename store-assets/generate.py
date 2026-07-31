"""Génère les visuels Play Store à partir de la charte Ficana.

Patte reprise du SVG de la charte (viewBox 0 0 32 32) utilisé dans le footer
du site : 4 coussinets + le coussinet central.
"""
from PIL import Image, ImageDraw, ImageFont

GREEN = (126, 177, 63)       # primary-500 #7EB13F
GREEN_DARK = (92, 138, 42)   # primary-600 #5C8A2A
CREAM = (250, 247, 242)      # fond beige du site #FAF7F2
WHITE = (255, 255, 255)
INK = (26, 22, 20)           # #1A1614

SS = 4  # suréchantillonnage

# Patte de la charte, en coordonnées viewBox 32x32 : (cx, cy, rx, ry).
# Calée sur le logo PNG de la marque : orteils en ovales verticaux, bien
# détachés les uns des autres (le SVG du footer les aplatit et les fait
# fusionner deux à deux une fois rastérisé).
PAW = [
    (6.9, 12.2, 2.9, 3.9),
    (13.2, 8.1, 2.9, 4.1),
    (19.4, 8.1, 2.9, 4.1),
    (25.5, 12.2, 2.9, 3.9),
    (16.2, 22.4, 7.6, 6.6),
]


def draw_paw(draw, cx, cy, size, color):
    """Dessine la patte centrée sur (cx, cy), `size` = largeur totale."""
    scale = size / 32.0
    ox, oy = cx - size / 2, cy - size / 2
    for ex, ey, rx, ry in PAW:
        draw.ellipse(
            [ox + (ex - rx) * scale, oy + (ey - ry) * scale,
             ox + (ex + rx) * scale, oy + (ey + ry) * scale],
            fill=color,
        )


def font(size, bold=True):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def icon(path, side=512):
    """Icône Play Store : carré plein, Play applique lui-même l'arrondi."""
    im = Image.new("RGB", (side * SS, side * SS), GREEN)
    d = ImageDraw.Draw(im)
    c = side * SS / 2
    # Patte légèrement remontée : le coussinet central pèse vers le bas.
    draw_paw(d, c, c - side * SS * 0.02, side * SS * 0.62, WHITE)
    im.resize((side, side), Image.LANCZOS).save(path)
    return path


def feature(path, w=1024, h=500):
    """Image de présentation 1024x500."""
    im = Image.new("RGB", (w * SS, h * SS), CREAM)
    d = ImageDraw.Draw(im)

    # Bandeau vert à gauche, en diagonale douce
    d.polygon(
        [(0, 0), (w * SS * 0.46, 0), (w * SS * 0.38, h * SS), (0, h * SS)],
        fill=GREEN,
    )
    draw_paw(d, w * SS * 0.20, h * SS * 0.5, h * SS * 0.52, WHITE)

    # Pattes décoratives en filigrane, côté crème
    draw_paw(d, w * SS * 0.905, h * SS * 0.22, h * SS * 0.24, (238, 240, 230))
    draw_paw(d, w * SS * 0.845, h * SS * 0.79, h * SS * 0.16, (238, 240, 230))

    tx = w * SS * 0.52
    d.text((tx, h * SS * 0.30), "Ficabot", font=font(int(86 * SS)), fill=INK, anchor="ls")
    d.text((tx, h * SS * 0.46), "Le carnet de santé", font=font(int(40 * SS), False), fill=GREEN_DARK, anchor="ls")
    d.text((tx, h * SS * 0.58), "de vos animaux", font=font(int(40 * SS), False), fill=GREEN_DARK, anchor="ls")
    d.text((tx, h * SS * 0.76), "Vaccins · Rappels · Poids · Conseils",
           font=font(int(26 * SS), False), fill=(110, 100, 92), anchor="ls")

    im.resize((w, h), Image.LANCZOS).save(path)
    return path


def adaptive_foreground(path, side=1024):
    """Avant-plan de l'icône adaptative Android : fond transparent.

    Android rogne l'icône adaptative selon la forme du lanceur ; seul le carré
    central de 66 % est garanti visible. La patte est dessinée large mais son
    emprise réelle reste sous 55 % du côté (le motif occupe 76 % de sa boîte),
    donc entière quelle que soit la découpe (cercle, squircle…).
    """
    im = Image.new("RGBA", (side * SS, side * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = side * SS / 2
    draw_paw(d, c, c - side * SS * 0.015, side * SS * 0.70, WHITE + (255,))
    im.resize((side, side), Image.LANCZOS).save(path)
    return path


if __name__ == "__main__":
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    mobile = os.path.join(here, "..", "apps", "mobile", "assets", "images")

    # Visuels Play Store
    print(icon(os.path.join(here, "play-icon-512.png")))
    print(feature(os.path.join(here, "play-feature-graphic-1024x500.png")))

    # Icônes embarquées dans l'app — mêmes formes, pour que l'icône du Store et
    # celle de l'écran d'accueil soient identiques.
    print(icon(os.path.join(mobile, "icon.png"), 1024))
    print(adaptive_foreground(os.path.join(mobile, "adaptive-icon.png"), 1024))
    print(icon(os.path.join(mobile, "favicon.png"), 48))
