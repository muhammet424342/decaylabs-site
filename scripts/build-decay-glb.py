# Headless Blender build: terrain (+baked light map) + crypt bricks + rubble + art-faced rock shards + debris + broken/inner ring + pedestal -> public/models/decay.glb
# run: blender -b --factory-startup --python build.py -- <out.glb>
import bpy, bmesh, math, random, sys
from mathutils import Vector, noise

OUT = sys.argv[sys.argv.index("--") + 1]
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene

def ss(x, a, b):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)

def link(obj): scn.collection.objects.link(obj); return obj

def apply_mods(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)

def tex(kind, size, basis="BLENDER_ORIGINAL"):
    t = bpy.data.textures.new(kind + str(size), kind)
    t.noise_scale = size
    if hasattr(t, "noise_basis"): t.noise_basis = basis
    return t

def displace(obj, t, strength, coords="LOCAL"):
    m = obj.modifiers.new("d", "DISPLACE"); m.texture = t; m.strength = strength; m.texture_coords = coords; m.mid_level = .5

def mat(name, rgb):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1); bsdf.inputs["Roughness"].default_value = .9
    return m

M_GROUND, M_BRICK, M_ROCK = mat("ground", (.62, .64, .6)), mat("brick", (.45, .47, .44)), mat("rock", (.36, .37, .35))

# ---------------- terrain ----------------
def height(x, y):
    d = math.hypot(x, y)
    h = 1.6 * math.exp(-max(0.0, d - 3.0) ** 2 / 60)
    p = Vector((x * .13, y * .13, 0))
    h += noise.fractal(p, .9, 2.1, 5) * 1.1 * ss(d, 4.5, 11)
    q = Vector((x * .03 + 7, y * .03 + 3, 0))
    h += max(0.0, noise.ridged_multi_fractal(q, 1.0, 2.0, 5, .9, 2.0)) ** 1.6 * 9 * ss(d, 20, 60)
    return h

N, SIZE = 280, 200.0
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=N, y_segments=N, size=SIZE / 2)
for v in bm.verts:
    v.co.z = height(v.co.x, v.co.y) + noise.noise(Vector((v.co.x * 2.2, v.co.y * 2.2, 0))) * .06
uvl = bm.loops.layers.uv.new("UVMap")
for fc in bm.faces:
    # sqrt-warped UVs: texel density piles up around the crypt, thins out toward the mountains
    for l in fc.loops: l[uvl].uv = tuple(.5 + .5 * math.copysign(math.sqrt(abs(c) / (SIZE / 2)), c) for c in (l.vert.co.x, l.vert.co.y))
me = bpy.data.meshes.new("Terrain"); bm.to_mesh(me); bm.free()
for p in me.polygons: p.use_smooth = True
terrain = link(bpy.data.objects.new("Terrain", me)); me.materials.append(M_GROUND)
Z0 = height(0, 0) - .05

# ---------------- crypt bricks (shared variant meshes) ----------------
BW, BH, BD, G, HX, HZ, COURSES = .74, .4, .46, .055, 2.1, 1.6, 6
variants = []
for k in range(8):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.scale = (BW, BD, BH); bpy.ops.object.transform_apply(scale=True)
    b = o.modifiers.new("b", "BEVEL"); b.width = .045; b.segments = 2
    s = o.modifiers.new("s", "SUBSURF"); s.subdivision_type = "SIMPLE"; s.levels = 3
    apply_mods(o)
    off = Vector((random.uniform(-50, 50), random.uniform(-50, 50), random.uniform(-50, 50)))
    for v in o.data.vertices:   # chipped, weathered surface
        c = v.co * 6 + off
        n = noise.noise(c) * .025 + noise.noise(c * 3.1) * .008
        chip = max(0.0, noise.cell(v.co * 4 + off) - .82) * .25
        v.co += v.normal * (n - chip)
    for p in o.data.polygons: p.use_smooth = False
    o.data.materials.append(M_BRICK); o.data.name = f"BrickMesh{k}"
    variants.append(o.data); bpy.data.objects.remove(o)

bricks = []
def add_brick(x, y, z, rz):
    o = link(bpy.data.objects.new(f"Brick_{len(bricks):03d}", random.choice(variants)))
    o.location = (x, y, z)
    o.rotation_euler = (random.uniform(-.03, .03), random.uniform(-.03, .03), rz + random.uniform(-.04, .04))
    s = random.uniform(.94, 1.0); o.scale = (s, s, s)
    bricks.append(o)

def ring(hx, hz, z, stagger, door):
    step = BW + G
    for sgn in (-1, 1):
        for i in range(int(2 * hx / step)):
            x = -hx + step * (i + .5) + (step / 2 if stagger else 0)
            if x > hx - .1: continue
            if door and sgn == -1 and abs(x) < .55: continue   # door on -Y (= +Z in three)
            add_brick(x, sgn * hz, z, 0)
        for i in range(int(2 * hz / step)):
            y = -hz + step * (i + .5) + (0 if stagger else step / 2)
            if y > hz - .1: continue
            add_brick(sgn * hx, y, z, math.pi / 2)

for c in range(COURSES): ring(HX, HZ, Z0 + BH / 2 + c * (BH + G), c % 2, c < 3)
ytop = Z0 + BH / 2 + COURSES * (BH + G)
for s in range(1, 4): ring(HX - .36 * s, HZ - .36 * s, ytop + (s - 1) * (BH + G), s % 2, False)
add_brick(0, 0, ytop + 3 * (BH + G), 0)

# ---------------- rubble: fallen bricks, broken grave slabs, snapped pillars (one static mesh) ----------------
rubble = []
def on_ground(o, x, y, sink):
    o.location = (x, y, height(x, y) + sink); rubble.append(o)
for i in range(46):   # bricks that already fell off the crypt
    a = random.uniform(0, 2 * math.pi); r = random.uniform(2.9, 6.5) if i < 34 else random.uniform(6.5, 11)
    o = link(bpy.data.objects.new(f"rb{i}", random.choice(variants).copy()))
    o.rotation_euler = (random.uniform(-.5, .5), random.uniform(-.5, .5), random.uniform(0, 6.3))
    s = random.uniform(.6, 1.0); o.scale = (s, s, s)
    on_ground(o, math.cos(a) * r, math.sin(a) * r * .9, .08)
for i in range(7):    # grave slabs, tilted, some broken
    a = random.uniform(.3, 2 * math.pi - .3) + math.pi / 2; r = random.uniform(6, 13)
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object
    h = random.uniform(.8, 1.35); o.scale = (random.uniform(.55, .75), .16, h); bpy.ops.object.transform_apply(scale=True)
    bm = bmesh.new(); bm.from_mesh(o.data)
    if random.random() < .6:   # snapped top
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, h * random.uniform(.05, .3)),
                               plane_no=(random.uniform(-.6, .6), 0, 1), clear_outer=True)
        bmesh.ops.edgeloop_fill(bm, edges=[e for e in bm.edges if e.is_boundary])
    bm.to_mesh(o.data); bm.free()
    bv = o.modifiers.new("b", "BEVEL"); bv.width = .03; bv.segments = 2
    ss_ = o.modifiers.new("s", "SUBSURF"); ss_.subdivision_type = "SIMPLE"; ss_.levels = 2
    displace(o, tex("CLOUDS", .12), .04); apply_mods(o)
    o.rotation_euler = (random.uniform(-.25, .25), random.uniform(-.2, .2), random.uniform(0, 6.3) if False else math.atan2(math.sin(a), math.cos(a)) + math.pi / 2)
    on_ground(o, math.cos(a) * r, math.sin(a) * r, h * .35 - .25)
for i in range(3):    # snapped pillars
    a = [2.4, 3.6, .7][i]; r = [8.5, 9.5, 12][i]
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=.28, depth=random.uniform(1.4, 2.6)); o = bpy.context.object
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, random.uniform(.1, .6)),
                           plane_no=(random.uniform(-.7, .7), random.uniform(-.7, .7), 1), clear_outer=True)
    bmesh.ops.edgeloop_fill(bm, edges=[e for e in bm.edges if e.is_boundary])
    bm.to_mesh(o.data); bm.free()
    ss_ = o.modifiers.new("s", "SUBSURF"); ss_.subdivision_type = "SIMPLE"; ss_.levels = 2
    t = tex("VORONOI", .25); t.distance_metric = "DISTANCE"; displace(o, t, .06); apply_mods(o)
    o.rotation_euler = (random.uniform(-.12, .12), random.uniform(-.12, .12), 0)
    on_ground(o, math.cos(a) * r, math.sin(a) * r, .55)
bpy.ops.object.select_all(action="DESELECT")
for o in rubble: o.select_set(True)
bpy.context.view_layer.objects.active = rubble[-1]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.join(); rub = bpy.context.object; rub.name = "Rubble"
dec = rub.modifiers.new("x", "DECIMATE"); dec.ratio = .12; apply_mods(rub)   # far, small pieces: keep the GLB light
rub.data.materials.clear(); rub.data.materials.append(M_BRICK)
for p in rub.data.polygons: p.use_smooth = False

# ---------------- rock shards: art face sunk into the rock, UV-fitted to the cut outline ----------------
M_ART = mat("art", (1, 1, 1))   # JS swaps in the Subject texture by material name
for k in range(8):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1)
    o = bpy.context.object; o.name = f"Shard_{k}"
    o.scale = (1.25, .8, 1.45); bpy.ops.object.transform_apply(scale=True)
    t1 = tex("VORONOI", .7); t1.distance_metric = "DISTANCE"
    displace(o, t1, .42); displace(o, tex("CLOUDS", .25), .08)
    dec = o.modifiers.new("x", "DECIMATE"); dec.ratio = .2
    apply_mods(o)
    o.data.materials.append(M_ROCK); o.data.materials.append(M_ART)
    bm = bmesh.new(); bm.from_mesh(o.data)
    # deep cut at -Y (three +Z, facing the camera) -> big flat face shaped by the rock's own break line
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, -.38, 0), plane_no=(0, -1, 0), clear_outer=True)
    art = bmesh.ops.edgeloop_fill(bm, edges=[e for e in bm.edges if e.is_boundary])["faces"]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for fc in bm.faces: fc.material_index = 0
    # sink the art a little behind a rock lip
    bmesh.ops.inset_individual(bm, faces=art, thickness=.07, depth=-.05, use_even_offset=True)
    uv = bm.loops.layers.uv.active or bm.loops.layers.uv.new("UVMap")   # reuse the primitive's UV layer (exported one)
    for fc in bm.faces:            # neutral UVs on rock
        for l in fc.loops: l[uv].uv = (l.vert.co.x * .3 + .5, l.vert.co.z * .3 + .5)
    xs = [v.co.x for fc in art for v in fc.verts]; zs = [v.co.z for fc in art for v in fc.verts]
    cx, cz = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2
    S = min(max(xs) - min(xs), max(zs) - min(zs)) * .97   # cover: image fills the whole face, outline crops it
    for fc in art:
        fc.material_index = 1
        for l in fc.loops: l[uv].uv = ((l.vert.co.x - cx) / S + .5, (l.vert.co.z - cz) / S + .5)
    bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons: p.use_smooth = False
    o.location = (0, 0, -40 - k * 4)   # parked; JS repositions

# ---------------- debris variants ----------------
for k in range(6):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=.25)
    o = bpy.context.object; o.name = f"Debris_{k}"
    o.scale = (random.uniform(.6, 1.2), random.uniform(.6, 1.2), random.uniform(.8, 1.6)); bpy.ops.object.transform_apply(scale=True)
    t = tex("VORONOI", .2); t.distance_metric = "DISTANCE"; displace(o, t, .12)
    dec = o.modifiers.new("x", "DECIMATE"); dec.ratio = .35
    apply_mods(o)
    for p in o.data.polygons: p.use_smooth = False
    o.data.materials.append(M_ROCK); o.location = (k * 1.0, 20, 0)

# ---------------- pedestal (two beveled tiers, chipped rim) ----------------
M_STONE = mat("stone", (.62, .63, .6))
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=1.55, depth=.3, location=(0, 0, .15))
base = bpy.context.object
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=1.25, depth=.16, location=(0, 0, .38))
top = bpy.context.object
for ob in (base, top):
    b = ob.modifiers.new("b", "BEVEL"); b.width = .03; b.segments = 3; b.limit_method = "ANGLE"
    apply_mods(ob)
bpy.ops.object.select_all(action="DESELECT"); base.select_set(True); top.select_set(True)
bpy.context.view_layer.objects.active = base; bpy.ops.object.join()
ped = bpy.context.object; ped.name = "Pedestal"
for v in ped.data.vertices:
    r = math.hypot(v.co.x, v.co.y)
    if r > 1.2: v.co += Vector((v.co.x, v.co.y, 0)).normalized() * (noise.noise(v.co * 7) * .03 - max(0, noise.cell(v.co * 5) - .85) * .3)
ped.data.materials.clear(); ped.data.materials.append(M_STONE); ped.location = (30, 0, 0)

# ---------------- broken ring segments ----------------
def arc(name, a0, a1, R=3.2, r=.55, nu=20, nv=10, disp=.38):
    bm = bmesh.new(); rows = []
    for i in range(nu + 1):
        a = a0 + (a1 - a0) * i / nu; row = []
        for j in range(nv):
            b = 2 * math.pi * j / nv
            rr = R + r * math.cos(b)
            row.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), r * math.sin(b))))
        rows.append(row)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((rows[i][j], rows[i + 1][j], rows[i + 1][(j + 1) % nv], rows[i][(j + 1) % nv]))
    bm.faces.new(rows[0][::-1]); bm.faces.new(rows[-1])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    s = o.modifiers.new("s", "SUBSURF"); s.subdivision_type = "SIMPLE"; s.levels = 2
    t = tex("VORONOI", .45); t.distance_metric = "DISTANCE"
    displace(o, t, disp); displace(o, tex("CLOUDS", .2), disp * .18)
    dec = o.modifiers.new("x", "DECIMATE"); dec.ratio = .3
    apply_mods(o)
    for p in o.data.polygons: p.use_smooth = False
    o.data.materials.append(M_ROCK); o.location = (0, 0, -80)
    return o

for i in range(9):
    a = i / 9 * 2 * math.pi
    arc(f"Seg_{i}", a, a + 2 * math.pi / 9 * .8)
arc("InnerRing", .2, .2 + 2 * math.pi * .9, R=1.35, r=.3, nu=48, nv=8, disp=.16)   # cracked inner ring

# ---------------- bake sun + sky + crypt glow into a terrain light map ----------------
import os
scn.render.engine = "CYCLES"; scn.cycles.samples = int(os.environ.get("BAKE_SAMPLES", "48"))
scn.view_settings.view_transform = "Standard"
try:   # use the GPU when there is one
    pr = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
        try:
            pr.compute_device_type = kind; pr.get_devices()
            if any(d.type == kind for d in pr.devices):
                for d in pr.devices: d.use = True
                scn.cycles.device = "GPU"; print("bake device", kind); break
        except TypeError: pass
except Exception as e: print("gpu off", e)
w = bpy.data.worlds.new("w"); scn.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND"); bg.inputs[0].default_value = (.66, .69, .66, 1); bg.inputs[1].default_value = .5
sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 1.9; sun.angle = .12
so = link(bpy.data.objects.new("sun", sun)); so.rotation_euler = Vector((-8, -6, 12)).to_track_quat("Z", "Y").to_euler()
# glowing interior (render only, deleted before export)
H = COURSES * (BH + G) - .1
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, Z0 + H / 2)); glow = bpy.context.object
glow.scale = (2 * HX - .5, 2 * HZ - .5, H)
gm = bpy.data.materials.new("glow"); gm.use_nodes = True; nt = gm.node_tree
for n in list(nt.nodes):
    if n.type != "OUTPUT_MATERIAL": nt.nodes.remove(n)
em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (.85, 1, .62, 1); em.inputs[1].default_value = 45
nt.links.new(em.outputs[0], next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL").inputs[0]); glow.data.materials.append(gm)
for o in scn.objects:   # parked pieces must not cast into the bake
    if o.name.startswith(("Shard_", "Seg_", "InnerRing", "Debris_", "Pedestal")): o.hide_render = True
LM = 2048
img = bpy.data.images.new("TerrainLight", LM, LM, float_buffer=False)
nt = M_GROUND.node_tree; tn = nt.nodes.new("ShaderNodeTexImage"); tn.image = img; nt.nodes.active = tn
bpy.ops.object.select_all(action="DESELECT"); terrain.select_set(True); bpy.context.view_layer.objects.active = terrain
scn.render.bake.target = "IMAGE_TEXTURES"; scn.render.bake.margin = 4
import time; t0 = time.time()
bpy.ops.object.bake(type="COMBINED")
print("baked light", round(time.time() - t0), "s")
img.filepath_raw = os.path.join(os.path.dirname(OUT), "terrain_light.png"); img.file_format = "PNG"
img.save_render(img.filepath_raw, scene=scn)   # converted to .webp afterwards (PIL)
nt.nodes.remove(tn); bpy.data.objects.remove(glow); bpy.data.objects.remove(so)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_apply=True,
                          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
                          export_materials="EXPORT", export_yup=True)
print("BRICKS", len(bricks), "Z0", round(Z0, 3), "OUT", OUT)
