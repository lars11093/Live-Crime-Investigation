"""Baut den Tatort "Büro 4.12" (case-01) als Low-Poly-Diorama und exportiert ihn als GLB.

Ausführen (Blender ohne Oberfläche):
    blender --background --factory-startup --python tools/blender/build_buero_412.py -- <ausgabe.glb> [vorschau.png]

Konventionen (Masse, Marker `hotspot_<id>`, Export): siehe tatort_lib.py.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tatort_lib import H, T, X0, X1, Y0, Y1, D, W  # noqa: E402
from tatort_lib import box, cli_args, cyl, export_glb, hotspot, mat, render_preview, reset_scene  # noqa: E402

OUT_GLB, OUT_PREVIEW = cli_args()
reset_scene()

# --- Materialien ------------------------------------------------------------

FLOOR = mat("Teppich", (0.06, 0.06, 0.055), 0.95)
WALL = mat("Wand", (0.32, 0.31, 0.28), 0.9)
SKIRT = mat("Sockelleiste", (0.12, 0.12, 0.11), 0.7)
WOOD = mat("Holz", (0.22, 0.12, 0.06), 0.6)
METAL = mat("Metall", (0.35, 0.35, 0.36), 0.35, 0.8)
DARK = mat("Kunststoff", (0.025, 0.025, 0.025), 0.5)
SCREEN = mat("Bildschirm", (0.05, 0.06, 0.04), 0.3, emission=(0.55, 0.75, 0.45))
FRAME = mat("Fensterrahmen", (0.75, 0.74, 0.7), 0.5)
GLASS = mat("Glas", (0.6, 0.65, 0.6), 0.05, alpha=0.18)
SCRATCH = mat("Kratzer", (0.03, 0.025, 0.02), 0.9)
PAPER = mat("Papier", (0.85, 0.83, 0.78), 0.95)
CERAMIC = mat("Keramik", (0.8, 0.78, 0.72), 0.25)
TEA = mat("Tee", (0.12, 0.05, 0.015), 0.1)
LIPSTICK = mat("Lippenstift", (0.45, 0.02, 0.04), 0.4)
FABRIC = mat("Stoff", (0.09, 0.09, 0.1), 0.95)
FOLDER = mat("Ordner", (0.4, 0.06, 0.04), 0.7)
FOLDER2 = mat("Ordner2", (0.08, 0.2, 0.08), 0.7)
PLANT = mat("Pflanze", (0.05, 0.16, 0.04), 0.8)
TAPE = mat("Absperrband", (0.8, 0.6, 0.02), 0.6)


# --- Raum: 5 x 4 m, Höhe 2.8 m, offen nach vorne und rechts (Diorama) --------
box("Boden", (W + T, D + T, 0.1), (T / -2, T / 2, -0.05), FLOOR)
box("Wand_links", (T, D + T, H), (X0 - T / 2, T / 2, H / 2), WALL)

# Rückwand mit Fensteröffnung (x 0.3..2.1, z 0.9..2.2)
WX0, WX1, WZ0, WZ1 = 0.3, 2.1, 0.9, 2.2
wy = Y1 + T / 2
box("Wand_hinten_a", (WX0 - X0, T, H), ((X0 + WX0) / 2, wy, H / 2), WALL)
box("Wand_hinten_b", (X1 - WX1, T, H), ((WX1 + X1) / 2, wy, H / 2), WALL)
box("Wand_hinten_unten", (WX1 - WX0, T, WZ0), ((WX0 + WX1) / 2, wy, WZ0 / 2), WALL)
box("Wand_hinten_oben", (WX1 - WX0, T, H - WZ1), ((WX0 + WX1) / 2, wy, (WZ1 + H) / 2), WALL)

box("Sockel_hinten", (W, 0.02, 0.08), (0, Y1 - 0.01, 0.04), SKIRT)
box("Sockel_links", (0.02, D, 0.08), (X0 + 0.01, 0, 0.04), SKIRT)

# Tür in der linken Wand
box("Tuer", (0.04, 0.95, 2.1), (X0 + 0.02, -1.0, 1.05), WOOD)
cyl("Tuergriff", 0.02, 0.14, (X0 + 0.07, -0.65, 1.0), METAL, rot=(0, math.pi / 2, 0))

# --- Fenster (Spur: fenster) -------------------------------------------------
fx, fz = (WX0 + WX1) / 2, (WZ0 + WZ1) / 2
fw, fh, ft = WX1 - WX0, WZ1 - WZ0, 0.06
box("Rahmen_unten", (fw, 0.16, ft), (fx, wy, WZ0 + ft / 2), FRAME)
box("Rahmen_oben", (fw, 0.16, ft), (fx, wy, WZ1 - ft / 2), FRAME)
box("Rahmen_links", (ft, 0.16, fh), (WX0 + ft / 2, wy, fz), FRAME)
box("Rahmen_rechts", (ft, 0.16, fh), (WX1 - ft / 2, wy, fz), FRAME)
box("Rahmen_mitte", (ft, 0.16, fh), (fx, wy, fz), FRAME)
box("Fensterbank", (fw + 0.1, 0.24, 0.03), (fx, Y1 - 0.08, WZ0 - 0.015), FRAME)

# Linker Flügel fest, rechter Flügel gekippt (Unterkante als Achse)
box("Glas_links", (fw / 2 - ft * 1.5, 0.01, fh - ft * 2), ((WX0 + fx) / 2, wy, fz), GLASS)
sash_h = fh - ft * 2
tilt = math.radians(12)
sx = (fx + WX1) / 2
box(
    "Glas_rechts_gekippt",
    (fw / 2 - ft * 1.5, 0.01, sash_h),
    (sx, wy - math.sin(tilt) * sash_h / 2, WZ0 + ft + math.cos(tilt) * sash_h / 2),
    GLASS,
    rot=(-tilt, 0, 0),
)
# Kratzer aussen am Rahmen
for i, (ox, oz, a) in enumerate([(-0.15, 0.0, 20), (0.05, 0.02, -15), (0.2, -0.01, 35)]):
    box(f"Kratzer_{i}", (0.18, 0.005, 0.008), (sx + ox, Y1 + T + 0.03, WZ0 + 0.03 + oz), SCRATCH,
        rot=(0, math.radians(a), 0))
# Vor den nach innen gekippten Flügel, sonst verdeckt das Glas die Spur (#158).
hotspot("fenster", (sx, Y1 - 0.25, fz))

# --- Schreibtisch mit Notebook (Spur: schreibtisch) --------------------------
dx, dy, dw, dd, dh = -1.0, 1.35, 1.6, 0.8, 0.75
box("Tischplatte", (dw, dd, 0.04), (dx, dy, dh - 0.02), WOOD)
for i, (lx, ly) in enumerate([(-1, -1), (1, -1), (-1, 1), (1, 1)]):
    box(f"Tischbein_{i}", (0.05, 0.05, dh - 0.04),
        (dx + lx * (dw / 2 - 0.06), dy + ly * (dd / 2 - 0.06), (dh - 0.04) / 2), METAL)
box("Rollcontainer", (0.42, 0.55, 0.58), (dx + 0.5, dy + 0.05, 0.31), METAL)
for i in range(3):
    box(f"Schublade_{i}", (0.36, 0.01, 0.15), (dx + 0.5, dy - 0.23, 0.13 + i * 0.18), DARK)

# Notebook aufgeklappt, Bildschirm leuchtet (ungespeicherte Kündigung)
nx, ny = dx - 0.1, dy + 0.05
box("Notebook_Unterteil", (0.34, 0.24, 0.018), (nx, ny, dh + 0.009), DARK)
box("Notebook_Deckel", (0.34, 0.012, 0.23),
    (nx, ny + 0.12 + 0.01, dh + 0.018 + 0.11), DARK, rot=(math.radians(-15), 0, 0))
box("Notebook_Bildschirm", (0.31, 0.002, 0.2),
    (nx, ny + 0.12 + 0.002, dh + 0.018 + 0.11), SCREEN, rot=(math.radians(-15), 0, 0))
box("Mauspad", (0.22, 0.18, 0.004), (nx + 0.33, ny - 0.05, dh + 0.002), FABRIC)
box("Maus", (0.06, 0.1, 0.03), (nx + 0.33, ny - 0.05, dh + 0.019), DARK)
box("Papierstapel", (0.21, 0.29, 0.03), (dx - 0.6, dy + 0.1, dh + 0.015), PAPER,
    rot=(0, 0, math.radians(8)))
cyl("Stiftebecher", 0.04, 0.1, (dx + 0.6, dy + 0.25, dh + 0.05), METAL, verts=12)
hotspot("schreibtisch", (nx, ny + 0.05, dh + 0.2))

# Bürostuhl, vom Tisch weggerollt
cx, cy = dx - 0.2, dy - 0.85
cyl("Stuhl_Fuss", 0.3, 0.03, (cx, cy, 0.06), DARK, verts=5)
cyl("Stuhl_Saeule", 0.03, 0.38, (cx, cy, 0.26), METAL, verts=8)
box("Stuhl_Sitz", (0.48, 0.46, 0.08), (cx, cy, 0.48), FABRIC)
box("Stuhl_Lehne", (0.46, 0.07, 0.55), (cx, cy - 0.24, 0.82), FABRIC, rot=(math.radians(-8), 0, 0))

# --- Papierkorb mit zerknülltem Zettel (Spur: papierkorb) --------------------
px, py = -2.05, 0.55
bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.15, radius2=0.18, depth=0.36,
                                location=(px, py, 0.18), end_fill_type="NOTHING")
korb = bpy.context.active_object
korb.name = "Papierkorb"
korb.data.materials.append(METAL)
mod = korb.modifiers.new("Wand", "SOLIDIFY")
mod.thickness = 0.01
bpy.ops.object.modifier_apply(modifier="Wand")
cyl("Papierkorb_Boden", 0.15, 0.01, (px, py, 0.005), METAL)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.07, location=(px + 0.03, py, 0.33))
ball = bpy.context.active_object
ball.name = "Zettel_zerknuellt"
ball.data.materials.append(PAPER)
ball.scale = (1.0, 0.85, 0.9)
hotspot("papierkorb", (px, py, 0.45))

# --- Sideboard mit Tasse (Spur: teetasse) ------------------------------------
sbx, sby = 1.2, Y1 - 0.25
box("Sideboard", (1.6, 0.42, 0.72), (sbx, sby, 0.38), WOOD)
box("Sideboard_Sockel", (1.5, 0.36, 0.02), (sbx, sby, 0.01), DARK)
for i in range(3):
    box(f"Sideboard_Tuer_{i}", (0.5, 0.01, 0.6), (sbx - 0.53 + i * 0.53, sby - 0.215, 0.4), WOOD)
    box(f"Sideboard_Griff_{i}", (0.12, 0.02, 0.015), (sbx - 0.53 + i * 0.53, sby - 0.225, 0.6), METAL)
for i, m in enumerate([FOLDER, FOLDER2, FOLDER, DARK]):
    box(f"Ordner_{i}", (0.07, 0.28, 0.32), (sbx + 0.35 + i * 0.08, sby, 0.74 + 0.16), m)

tx, ty, tz = sbx - 0.35, sby - 0.05, 0.74
cyl("Tasse", 0.045, 0.1, (tx, ty, tz + 0.05), CERAMIC, verts=20)
cyl("Tasse_Inhalt", 0.04, 0.005, (tx, ty, tz + 0.07), TEA, verts=20)
bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.008,
                                 location=(tx + 0.055, ty, tz + 0.05), rotation=(math.pi / 2, 0, 0))
henkel = bpy.context.active_object
henkel.name = "Tasse_Henkel"
henkel.data.materials.append(CERAMIC)
box("Lippenstift_Abdruck", (0.025, 0.004, 0.01), (tx - 0.01, ty - 0.046, tz + 0.095), LIPSTICK)
hotspot("teetasse", (tx, ty, tz + 0.15))

# --- Ausstattung ohne Spuren --------------------------------------------------
# Regal an der linken Wand
rx = X0 + 0.2
for i in range(5):
    box(f"Regalboden_{i}", (0.35, 1.0, 0.025), (rx, 0.25, 0.05 + i * 0.45), WOOD)
box("Regal_Seite_a", (0.35, 0.025, 1.9), (rx, -0.25, 0.95), WOOD)
box("Regal_Seite_b", (0.35, 0.025, 1.9), (rx, 0.75, 0.95), WOOD)
for shelf_z, count in [(0.95, 9), (0.5, 5)]:
    for i in range(count):
        h = 0.28 + (i % 4) * 0.03
        box(f"Buch_{shelf_z}_{i}", (0.24, 0.05 + (i % 3) * 0.015, h),
            (rx, -0.15 + i * 0.09, shelf_z + 0.0125 + h / 2),
            [FOLDER, FOLDER2, DARK, PAPER][(i + count) % 4])

# Pflanze in der Ecke
cyl("Pflanzentopf", 0.16, 0.35, (2.1, 1.65, 0.175), CERAMIC, verts=12)
for i in range(6):
    a = i * math.pi / 3
    box(f"Blatt_{i}", (0.06, 0.32, 0.015), (2.1 + math.cos(a) * 0.12, 1.65 + math.sin(a) * 0.12, 0.55),
        PLANT, rot=(math.radians(35), 0, a + math.pi / 2))

# Absperrband auf dem Boden als Tatort-Hinweis
box("Absperrband_a", (1.6, 0.05, 0.003), (-0.4, -0.2, 0.002), TAPE, rot=(0, 0, math.radians(15)))
box("Absperrband_b", (1.2, 0.05, 0.003), (0.1, 0.25, 0.002), TAPE, rot=(0, 0, math.radians(-70)))

# --- Export -------------------------------------------------------------------
export_glb(OUT_GLB)
if OUT_PREVIEW:
    render_preview(OUT_PREVIEW)
