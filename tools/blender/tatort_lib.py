"""Gemeinsame Bausteine für die Tatort-Skripte (nur in Blender ausführbar).

Konventionen für alle Tatort-Modelle, damit der Client ohne Zusatzdaten passt:
- Blender-Einheiten = Meter, Z oben (der glTF-Export dreht auf Y oben).
- Diorama 5 x 4 m um den Ursprung: Boden x -2.5..2.5, y -2..2, Wände hinten
  (y = +2) und links (x = -2.5), vorne und rechts offen. Die Kamera im Client
  ist auf diese Grösse eingestellt (Scene3D.tsx, CAMERA_START/CAMERA_TARGET).
- Pro Spur ein Empty `hotspot_<hotspot-id>` aus dem Fall-JSON, leicht vor dem
  Objekt, damit es nicht selbst verdeckt wird (#158).
- Keine Lichter/Kameras im Export: Licht und Kamera setzt der Client.
"""

import math
import sys

import bpy
from mathutils import Vector

W, D, H, T = 5.0, 4.0, 2.8, 0.12  # Breite (x), Tiefe (y), Höhe, Wandstärke
X0, X1, Y0, Y1 = -W / 2, W / 2, -D / 2, D / 2


def cli_args():
    """(ausgabe.glb, vorschau.png | None) aus den Argumenten nach `--`."""
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return (argv[0] if argv else "tatort.glb"), (argv[1] if len(argv) > 1 else None)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _materials.clear()


_materials = {}


def mat(name, color, roughness=0.8, metallic=0.0, emission=None, alpha=1.0):
    if name in _materials:
        return _materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 1.5
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    _materials[name] = m
    return m


def box(name, size, loc, material, rot=(0, 0, 0)):
    """Quader mit Kantenlängen `size` (m), Mittelpunkt `loc`."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return o


def cyl(name, radius, depth, loc, material, verts=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot
    )
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(material)
    return o


def hotspot(hotspot_id, loc):
    bpy.ops.object.empty_add(type="SPHERE", radius=0.1, location=loc)
    bpy.context.active_object.name = f"hotspot_{hotspot_id}"


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_lights=False,
        export_cameras=False,
    )
    print(f"GLB geschrieben: {path}")


def render_preview(path, cam_loc=(4.6, -5.2, 3.6), target=(-0.2, 0.6, 0.6)):
    """Vorschau nur fürs Review — nach dem Export, landet also nicht im GLB."""
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.active_object
    cam.rotation_euler = (cam.location - Vector(target)).to_track_quat("Z", "Y").to_euler()
    scene.camera = cam
    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(30)))
    bpy.context.active_object.data.energy = 3.0
    bpy.ops.object.light_add(type="POINT", location=(-0.5, 0.5, 2.5))
    bpy.context.active_object.data.energy = 300
    world = bpy.data.worlds.new("Welt")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.02, 0.02, 0.02, 1)
    scene.world = world
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = 1280, 800
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"Vorschau geschrieben: {path}")
