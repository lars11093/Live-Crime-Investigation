"""Baut den Tatort "Flur 4. OG - Badge-Leser" (case-01) als Low-Poly-Diorama (#159).

Ausführen (Blender ohne Oberfläche):
    blender --background --factory-startup --python tools/blender/build_flur_4og.py -- <ausgabe.glb> [vorschau.png]

Konventionen (Masse, Marker `hotspot_<id>`, Export): siehe tatort_lib.py.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tatort_lib import H, T, X0, Y1, D, W  # noqa: E402
from tatort_lib import box, cli_args, cyl, export_glb, hotspot, mat, render_preview, reset_scene  # noqa: E402

OUT_GLB, OUT_PREVIEW = cli_args()
reset_scene()

# --- Materialien ------------------------------------------------------------
FLOOR = mat("Linoleum", (0.11, 0.115, 0.1), 0.6)
RUNNER = mat("Laufstreifen", (0.05, 0.05, 0.045), 0.9)
WALL = mat("Wand", (0.36, 0.35, 0.32), 0.9)
SKIRT = mat("Sockelleiste", (0.12, 0.12, 0.11), 0.7)
DOOR = mat("Tuer", (0.26, 0.15, 0.08), 0.6)
FRAME = mat("Zarge", (0.55, 0.55, 0.53), 0.4, 0.6)
METAL = mat("Metall", (0.4, 0.4, 0.41), 0.3, 0.9)
DARK = mat("Kunststoff", (0.025, 0.025, 0.025), 0.5)
SIGN = mat("Schild", (0.8, 0.8, 0.76), 0.5)
LED_RED = mat("LED_rot", (0.3, 0.01, 0.01), 0.3, emission=(1.0, 0.08, 0.05))
LED_GREEN = mat("LED_gruen", (0.01, 0.2, 0.05), 0.3, emission=(0.1, 1.0, 0.25))
LENS = mat("Linse", (0.01, 0.01, 0.01), 0.05)
RED = mat("Feuerloescher", (0.55, 0.03, 0.02), 0.35)
CORK = mat("Kork", (0.35, 0.24, 0.13), 0.95)
PAPER = mat("Papier", (0.85, 0.83, 0.78), 0.95)
YELLOW = mat("Warnschild", (0.8, 0.6, 0.02), 0.6)
BUCKET = mat("Eimer", (0.5, 0.06, 0.04), 0.5)

# --- Flur: 5 x 4 m, offen nach vorne und rechts --------------------------------
box("Boden", (W + T, D + T, 0.1), (T / -2, T / 2, -0.05), FLOOR)
box("Laufstreifen", (W, 1.2, 0.004), (0, 0.6, 0.002), RUNNER)
box("Wand_hinten", (W + T, T, H), (T / -2, Y1 + T / 2, H / 2), WALL)
box("Wand_links", (T, D + T, H), (X0 - T / 2, T / 2, H / 2), WALL)
box("Sockel_hinten", (W, 0.02, 0.08), (0, Y1 - 0.01, 0.04), SKIRT)
box("Sockel_links", (0.02, D, 0.08), (X0 + 0.01, 0, 0.04), SKIRT)


def office_door(name, x, ajar=0.0):
    """Bürotür in der Rückwand mit Zarge und Nummernschild; `ajar` in Grad."""
    box(f"{name}_Zarge_l", (0.06, 0.08, 2.15), (x - 0.5, Y1 - 0.03, 1.075), FRAME)
    box(f"{name}_Zarge_r", (0.06, 0.08, 2.15), (x + 0.5, Y1 - 0.03, 1.075), FRAME)
    box(f"{name}_Zarge_o", (1.06, 0.08, 0.06), (x, Y1 - 0.03, 2.12), FRAME)
    a = math.radians(ajar)
    # Scharnier links: Türblatt dreht um seine linke Kante in den Raum.
    hx, hy = x - 0.47, Y1 - 0.03
    box(f"{name}_Blatt", (0.94, 0.04, 2.08),
        (hx + math.cos(a) * 0.47, hy - math.sin(a) * 0.47, 1.04), DOOR, rot=(0, 0, -a))
    cyl(f"{name}_Griff", 0.018, 0.12,
        (hx + math.cos(a) * 0.85, hy - math.sin(a) * 0.85 - 0.05, 1.0), METAL, rot=(math.pi / 2, 0, 0))
    box(f"{name}_Schild", (0.22, 0.01, 0.08), (x + 0.75, Y1 - 0.01, 1.6), SIGN)


office_door("Tuer_411", -1.1)
office_door("Tuer_412", 1.3, ajar=18)  # Büro 4.12, angelehnt

# --- Badge-Leser neben Büro 4.12 (Spur: badge-leser) --------------------------
bx = 0.55
box("Badge_Leser", (0.09, 0.03, 0.14), (bx, Y1 - 0.015, 1.2), DARK)
box("Badge_Feld", (0.06, 0.005, 0.06), (bx, Y1 - 0.033, 1.18), METAL)
box("Badge_LED_rot", (0.012, 0.006, 0.012), (bx - 0.02, Y1 - 0.034, 1.25), LED_RED)
box("Badge_LED_gruen", (0.012, 0.006, 0.012), (bx + 0.02, Y1 - 0.034, 1.25), LED_GREEN)
hotspot("badge-leser", (bx, Y1 - 0.2, 1.22))

# --- Kamera #04, schief in der Ecke (Spur: kamera-04) ---------------------------
kx, ky, kz = X0 + 0.35, Y1 - 0.35, 2.55
box("Kamera_Halter", (0.04, 0.04, 0.2), (kx, ky, kz + 0.15), METAL)
skew = math.radians(14)  # "hängt leicht schief"
box("Kamera_Gehaeuse", (0.12, 0.26, 0.11), (kx, ky - 0.08, kz), SIGN,
    rot=(math.radians(-25), skew, math.radians(-40)))
cyl("Kamera_Linse", 0.035, 0.04, (kx + 0.09, ky - 0.2, kz - 0.06), LENS,
    rot=(math.radians(65), 0, math.radians(-40)))
box("Kamera_LED", (0.015, 0.015, 0.015), (kx + 0.04, ky - 0.12, kz + 0.06), LED_RED)
box("Kamera_Nummer", (0.1, 0.005, 0.05), (kx + 0.25, Y1 - 0.005, kz + 0.1), SIGN)
hotspot("kamera-04", (kx + 0.25, ky - 0.3, kz - 0.15))

# --- Lift in der linken Wand ---------------------------------------------------
ly = 0.2
box("Lift_Rahmen", (0.06, 1.3, 2.3), (X0 + 0.03, ly, 1.15), METAL)
box("Lift_Tuer_a", (0.03, 0.58, 2.15), (X0 + 0.07, ly - 0.3, 1.075), FRAME)
box("Lift_Tuer_b", (0.03, 0.58, 2.15), (X0 + 0.07, ly + 0.3, 1.075), FRAME)
box("Lift_Tableau", (0.02, 0.1, 0.22), (X0 + 0.02, ly - 0.85, 1.15), METAL)
cyl("Lift_Knopf", 0.02, 0.01, (X0 + 0.035, ly - 0.85, 1.18), LED_GREEN, rot=(0, math.pi / 2, 0))
box("Notausgang", (0.01, 0.4, 0.15), (X0 + 0.01, ly, 2.5), LED_GREEN)

# --- Ausstattung ohne Spuren ----------------------------------------------------
cyl("Feuerloescher", 0.08, 0.5, (-2.1, Y1 - 0.12, 0.35), RED, verts=12)
box("Feuerloescher_Kopf", (0.05, 0.12, 0.08), (-2.1, Y1 - 0.12, 0.64), DARK)
box("Pinnwand", (0.9, 0.03, 0.6), (0.0, Y1 - 0.015, 1.5), CORK)
for i, (ox, oz, a) in enumerate([(-0.25, 0.1, 4), (0.05, -0.05, -6), (0.3, 0.12, 2)]):
    box(f"Aushang_{i}", (0.21, 0.005, 0.28), (ox, Y1 - 0.035, 1.5 + oz), PAPER, rot=(0, math.radians(a), 0))

# Putzwagen der Reinigungskraft (sie fand das Opfer um 23:14 Uhr)
cx, cy = 2.0, 0.6
box("Putzwagen_Boden", (0.8, 0.45, 0.04), (cx, cy, 0.15), DARK)
box("Putzwagen_Ablage", (0.8, 0.45, 0.03), (cx, cy, 0.85), DARK)
for i, (ox, oy) in enumerate([(-1, -1), (1, -1), (-1, 1), (1, 1)]):
    box(f"Putzwagen_Stange_{i}", (0.025, 0.025, 0.75), (cx + ox * 0.38, cy + oy * 0.2, 0.5), METAL)
    cyl(f"Putzwagen_Rad_{i}", 0.05, 0.03, (cx + ox * 0.36, cy + oy * 0.2, 0.05), DARK, verts=10,
        rot=(math.pi / 2, 0, 0))
cyl("Putzeimer", 0.15, 0.28, (cx - 0.15, cy, 0.31), BUCKET, verts=14)
cyl("Mopp_Stiel", 0.015, 1.3, (cx + 0.25, cy + 0.1, 0.8), METAL, verts=8, rot=(math.radians(12), 0, 0))
# Warnschild "Rutschgefahr" als aufgestelltes A
for i, a in enumerate((18, -18)):
    box(f"Warnschild_{i}", (0.3, 0.015, 0.6),
        (1.0, -0.5 + math.sin(math.radians(a)) * 0.15, 0.29), YELLOW, rot=(math.radians(a), 0, 0))

export_glb(OUT_GLB)
if OUT_PREVIEW:
    render_preview(OUT_PREVIEW)
