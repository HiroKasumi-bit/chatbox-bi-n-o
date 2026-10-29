// Interior sets, built well below the snowfield so they never show in outdoor pictures:
//   grotto      the Mineral Lake Grotto on Level 1 of the Mount Aurora spa: a 7 × 13 m lake of
//               40 °C silica water spilling over a basalt wall, a larch footbridge, stone
//               lanterns and the panoramic glass lift
//   greenhouse  inside the Evergreen Greenhouse Dome: stacked hydroponic racks under LED grow
//               lights, tomato vines, and the polar night outside the glass
// Each set has its own lights; while a set is active it borrows the eight lamp lights.
import * as THREE from 'three';
import { Batch, matrix, noise2D, fbm, rng } from './util.js';
import { materials, waterNormalMap } from './materials.js';
import { person, bather, pine } from './kit.js';
import { normalFromHeight } from './textures.js';

const R = rng(707);

function rippleTexture(scale) {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const img = g.createImageData(S, S);
  const n = noise2D(31);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const v = fbm(n, x / 24, y / 24, 4) * 0.7 + fbm(n, x / 7 + 40, y / 7, 2) * 0.3;
      const k = (y * S + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.round(v * 255);
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(normalFromHeight(cv, 3));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(scale, scale);
  return t;
}

// Vertical streaks of falling water, white on transparent.
function waterfallTexture() {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 512;
  const g = cv.getContext('2d');
  const r = rng(12);
  for (let i = 0; i < 260; i++) {
    const x = r() * 256;
    const w = 1 + r() * 5;
    const gr = g.createLinearGradient(0, 0, 0, 512);
    const a = 0.15 + r() * 0.5;
    gr.addColorStop(0, `rgba(255,255,255,${a})`);
    gr.addColorStop(0.7, `rgba(235,250,255,${a * 0.8})`);
    gr.addColorStop(1, `rgba(255,255,255,${a * 0.3})`);
    g.fillStyle = gr;
    g.fillRect(x, r() * 40, w, 512);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function steamSprites(group, x, y, z, w, d, count, rise, size, tint, opacity) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0.8)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, color: tint, transparent: true, depthWrite: false, opacity });
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat);
    const h = R() * rise;
    s.position.set(x + (R() - 0.5) * w, y + 0.2 + h, z + (R() - 0.5) * d);
    const k = size * (0.6 + (h / rise) * 0.8) * (0.7 + R() * 0.6);
    s.scale.set(k, k * 0.8, 1);
    group.add(s);
  }
  return mat;
}

function setMaterials() {
  const m = { ...materials };
  m.basalt = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.4, metalness: 0.05, flatShading: true });
  m.basaltCol = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.45, metalness: 0.05, flatShading: true, envMapIntensity: 0.4 });
  m.caveWall = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.8, side: THREE.BackSide, flatShading: true, envMapIntensity: 0.5 });
  m.spaFloor = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.25, metalness: 0.05 });
  m.coping = new THREE.MeshStandardMaterial({ color: 0x8c8780, roughness: 0.4 });
  m.mineralWater = new THREE.MeshStandardMaterial({ color: 0x4fbcc0, roughness: 0.05, metalness: 0.25, emissive: 0x1498a8, emissiveIntensity: 0.38, normalMap: waterNormalMap(3), normalScale: new THREE.Vector2(0.5, 0.5) });
  m.waterfall = new THREE.MeshStandardMaterial({ map: waterfallTexture(), color: 0xe9fbff, transparent: true, depthWrite: false, roughness: 0.2, emissive: 0x8fe8f0, emissiveIntensity: 0.18, opacity: 0.85, side: THREE.DoubleSide });
  m.liftGlass = new THREE.MeshStandardMaterial({ color: 0xbfd6e0, roughness: 0.04, metalness: 0.6, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  m.warmStrip = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb866, emissiveIntensity: 3.0 });
  m.lantern = new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffc780, emissiveIntensity: 1.5 });
  m.cedar = new THREE.MeshStandardMaterial({ color: 0x9a6a44, roughness: 0.55 });
  m.domeGlass = new THREE.MeshStandardMaterial({ color: 0xd6e8f0, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  m.strut = new THREE.MeshStandardMaterial({ color: 0xe8ecf0, roughness: 0.35, metalness: 0.7 });
  m.rack = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.4, metalness: 0.6 });
  m.tray = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.5 });
  m.ledPink = new THREE.MeshStandardMaterial({ color: 0xff7ad8, emissive: 0xff4fcf, emissiveIntensity: 4.0 });
  m.lettuce = new THREE.MeshStandardMaterial({ color: 0x9be36a, roughness: 0.55, side: THREE.DoubleSide });
  m.lettuceDark = new THREE.MeshStandardMaterial({ color: 0x5fbf4a, roughness: 0.55, side: THREE.DoubleSide });
  m.vine = new THREE.MeshStandardMaterial({ color: 0x2f7a35, roughness: 0.75, flatShading: true });
  m.tomato = new THREE.MeshStandardMaterial({ color: 0xd8321f, roughness: 0.35 });
  m.domeGlow = new THREE.MeshStandardMaterial({ color: 0xffb0e8, emissive: 0xff5fd0, emissiveIntensity: 1.4, transparent: true, opacity: 0.85 });
  return m;
}

// ---------------------------------------------------------------- Mineral Lake Grotto
function grotto(scene, M) {
  const O = new THREE.Vector3(0, -400, 2600); // set origin: centre of the lake, at floor level
  const group = new THREE.Group();
  group.name = 'set_grotto';
  group.position.copy(O);
  const b = new Batch();
  const n = noise2D(404);

  // The cave: a rough dome of dark basalt, 22 × 30 m and up to 9 m high.
  const cave = new THREE.SphereGeometry(1, 120, 60);
  const p = cave.attributes.position;
  const col = [];
  const rock = [new THREE.Color(0x3b3833), new THREE.Color(0x2c2a27), new THREE.Color(0x4a4239), new THREE.Color(0x56514a)];
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const d = fbm(n, v.x * 3 + v.y * 2.1 + 10, v.z * 3 - v.y * 1.7 + 10, 5);
    const k = 1 + (d - 0.5) * 0.28;
    v.set(v.x * 11 * k, v.y * 8 * k, v.z * 15.5 * k);
    if (v.y < 0) v.y *= 0.1;
    p.setXYZ(i, v.x, v.y + 0.2, v.z + 1);
    const c = rock[Math.floor(R() * rock.length)].clone().lerp(rock[0], 0.3);
    col.push(c.r, c.g, c.b);
  }
  cave.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  cave.computeVertexNormals();
  const caveMesh = new THREE.Mesh(cave.toNonIndexed(), M.caveWall);
  caveMesh.geometry.computeVertexNormals();
  caveMesh.receiveShadow = true;
  group.add(caveMesh);

  // Heated granite floor around the lake (the lake is 7 × 13 m, from z -4.5 to 8.5).
  const LX = 3.5;
  const Z0 = -4.5;
  const Z1 = 8.5;
  b.add('spaFloor', new THREE.BoxGeometry(24, 0.3, Z0 + 16), matrix(0, -0.15, (Z0 - 16) / 2));
  b.add('spaFloor', new THREE.BoxGeometry(24, 0.3, 18 - Z1), matrix(0, -0.15, (Z1 + 18) / 2));
  for (const s of [-1, 1]) b.add('spaFloor', new THREE.BoxGeometry(12 - LX, 0.3, Z1 - Z0), matrix(s * (LX + (12 - LX) / 2), -0.15, (Z0 + Z1) / 2));
  b.add('basalt', new THREE.BoxGeometry(LX * 2, 0.2, Z1 - Z0), matrix(0, -1.4, (Z0 + Z1) / 2));
  // Granite curb and coping around the water.
  const curb = (x, z, w, d) => {
    b.add('coping', new THREE.BoxGeometry(w, 0.16, d), matrix(x, 0.08, z));
    b.add('coping', new THREE.BoxGeometry(w, 1.2, d), matrix(x, -0.6, z));
  };
  curb(0, Z0 - 0.2, LX * 2 + 0.8, 0.4);
  curb(-LX - 0.2, (Z0 + Z1) / 2, 0.4, Z1 - Z0);
  curb(LX + 0.2, (Z0 + Z1) / 2, 0.4, Z1 - Z0);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(LX * 2, Z1 - Z0 + 0.6).rotateX(-Math.PI / 2), M.mineralWater);
  water.position.set(0, -0.12, (Z0 + Z1) / 2 + 0.3);
  water.receiveShadow = true;
  group.add(water);

  // The basalt wall at the far end: stepped hexagonal columns, the spring spilling over its lip.
  const basaltCol = (x, z, h, r) => {
    const g = new THREE.CylinderGeometry(r, r, h, 6, 1);
    b.add('basaltCol', g, matrix(x, h / 2 - 0.6, z, R() * 0.3));
  };
  for (let row = 0; row < 4; row++) {
    for (let i = -7; i <= 7; i++) {
      const x = i * 0.62 + (row % 2) * 0.31;
      const z = Z1 + 0.3 + row * 0.55;
      const centre = Math.abs(x) < 1.4;
      const h = centre ? 3.6 + row * 0.2 : 2.4 + Math.abs(i) * 0.18 + row * 0.6 + R() * 0.8;
      basaltCol(x, z, h, 0.34);
    }
  }
  for (let i = 0; i < 6; i++) basaltCol(-5 + R() * 10, Z1 + 3 + R() * 1.5, 4.5 + R() * 2.5, 0.5);
  b.add('basalt', new THREE.BoxGeometry(2.8, 0.25, 0.9), matrix(0, 3.05, Z1 + 0.25)); // waterfall lip
  const fallMat = M.waterfall;
  for (const [x, w, z] of [[0, 2.6, Z1 + 0.05], [-0.3, 1.8, Z1 + 0.15], [0.4, 1.4, Z1 - 0.05]]) {
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(w, 3.2), fallMat);
    fall.position.set(x, 1.45, z);
    fall.rotation.x = -0.06;
    group.add(fall);
  }
  // Shore boulders.
  for (const [x, z, s] of [[-4.6, 8.2, 1.1], [4.4, 7.6, 0.9], [5.4, 2.0, 0.7], [-5.8, 3.5, 0.8]]) {
    b.add('basalt', new THREE.DodecahedronGeometry(s, 0), matrix(x, s * 0.45, z, R() * 3, 1.3, 0.7, 1));
  }

  // Larch footbridge across the lake, with steps at both ends.
  const bz = 1.2;
  for (let i = -9; i <= 9; i++) {
    const x = i * 0.45;
    const y = 0.42 + Math.cos((i / 9) * Math.PI / 2) * 0.35;
    b.add('cedar', new THREE.BoxGeometry(0.42, 0.08, 1.6), matrix(x, y, bz));
  }
  for (const s of [-1, 1]) {
    b.add('cedar', new THREE.BoxGeometry(8.6, 0.08, 0.08), matrix(0, 1.35, bz + s * 0.78));
    for (let i = -4; i <= 4; i++) b.add('cedar', new THREE.BoxGeometry(0.08, 0.95, 0.08), matrix(i * 1.0, 0.95, bz + s * 0.78));
  }

  // Stone lanterns at the corners of the lake.
  const lanterns = [[-5.2, -5.6], [5.2, -5.6], [-5.4, 6.4], [5.4, 6.2]];
  for (const [x, z] of lanterns) {
    b.add('stone', new THREE.BoxGeometry(0.28, 0.95, 0.28), matrix(x, 0.48, z));
    b.add('lantern', new THREE.BoxGeometry(0.5, 0.42, 0.5), matrix(x, 1.16, z));
    b.add('stone', new THREE.ConeGeometry(0.55, 0.38, 4), matrix(x, 1.56, z, Math.PI / 4));
  }
  // Warm cove lights at the foot of the rock walls.
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    if (Math.sin(a) < -0.75) continue; // the entrance side, behind the camera
    const x = Math.cos(a) * 10.2;
    const z = 1 + Math.sin(a) * 14.4;
    b.add('warmStrip', new THREE.BoxGeometry(0.9, 0.06, 0.12), matrix(x, 0.06, z, -a + Math.PI / 2));
  }

  // Panoramic glass lift on the right, rising into the rock.
  const lx = 7.6;
  const lz = -3.5;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 9, 32, 1, true), M.liftGlass);
  shaft.position.set(lx, 4.5, lz);
  group.add(shaft);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.add('metal', new THREE.BoxGeometry(0.07, 9, 0.07), matrix(lx + Math.cos(a) * 1.5, 4.5, lz + Math.sin(a) * 1.5));
  }
  for (const y of [0.05, 2.6, 4.5, 7.1]) b.add('metal', new THREE.TorusGeometry(1.5, 0.05, 6, 32), matrix(lx, y, lz, 0, 1, 1, 1, Math.PI / 2));
  b.add('metalDark', new THREE.CylinderGeometry(1.25, 1.25, 0.12, 24), matrix(lx, 2.66, lz));
  b.add('lantern', new THREE.CylinderGeometry(1.0, 1.0, 0.05, 24), matrix(lx, 5.1, lz));
  b.add('metal', new THREE.TorusGeometry(1.15, 0.03, 6, 32), matrix(lx, 3.6, lz, 0, 1, 1, 1, Math.PI / 2));
  b.add('stone', new THREE.CylinderGeometry(1.8, 1.8, 0.15, 32), matrix(lx, 0.07, lz));

  // Bathers in the lake, and guests in white robes on the deck and the bridge.
  for (const [x, z, ry] of [[-1.6, 4.5, 2.6], [1.2, 5.8, 3.4], [-0.6, -2.4, 0.4], [2.2, -1.2, -0.8], [0.6, 6.9, 3.1]]) bather(b, x, z, ry, -0.12);
  person(b, 0.9, bz, Math.PI / 2, { coat: 'coatWhite', scarf: 'coatWhite', y: 0.72, stride: 0.2 });
  person(b, 5.6, 9.8, -2.6, { coat: 'coatWhite', scarf: 'coatTeal', still: true });

  const mesh = b.build(M);
  group.add(mesh);
  const steam = steamSprites(group, 0, 0, (Z0 + Z1) / 2, LX * 2, Z1 - Z0, 44, 0.9, 2.0, 0xdaf3f2, 0.05);
  steamSprites(group, 0, 0, Z1 + 0.5, 3, 1.2, 12, 1.0, 1.4, 0xffffff, 0.16);
  scene.add(group);

  // Light: lanterns, turquoise light thrown up from the water, the lift, the cove strips.
  // Light: two lanterns near the camera, warm washes grazing the rock walls, turquoise light
  // thrown up from the water and the waterfall, and the lift cabin.
  const lights = [
    [-5.2, 1.2, -5.6, 0xffbd73, 6, 8], [5.2, 1.2, -5.6, 0xffbd73, 6, 8],
    [-8.6, 0.6, 2, 0xffb36b, 40, 16], [8.4, 0.6, 4, 0xffb36b, 40, 16], [0, 2.5, 15, 0xffc27f, 30, 14],
    [0, -0.6, 2.5, 0x45d6dc, 40, 16], [0, -0.6, 7.0, 0x6fe3ea, 30, 14],
    [lx, 4.8, lz, 0xffd29a, 10, 9],
  ];
  return {
    group,
    setActive(on) { group.visible = on; },
    look(L, ctx) {
      ctx.sun.intensity = 0;
      ctx.hemi.color.set(0x6a7e86);
      ctx.hemi.groundColor.set(0x2a1f18);
      ctx.hemi.intensity = L.hemi ?? 0.35;
      ctx.scene.background = new THREE.Color(0x05080a);
      ctx.scene.fog = new THREE.Fog(0x141c1e, 30, 160);
      ctx.renderer.toneMappingExposure = L.exposure ?? 1.0;
      steam.opacity = L.steam ?? 0.05;
      ctx.lampLights.forEach((pl, i) => {
        const l = lights[i];
        if (!l) { pl.intensity = 0; return; }
        pl.position.set(O.x + l[0], O.y + l[1], O.z + l[2]);
        pl.color.set(l[3]);
        pl.intensity = l[4] * (L.lampScale ?? 1);
        pl.distance = l[5];
      });
    },
    origin: O,
  };
}

// A lettuce: a rosette of curled leaves around a pale heart.
const LEAF = new THREE.SphereGeometry(0.1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.75, 0.5, 1.3).translate(0, 0, 0.09);
function lettuce(b, x, y, z, s) {
  const a0 = R() * Math.PI * 2;
  for (let i = 0; i < 6; i++) {
    const a = a0 + (i / 6) * Math.PI * 2;
    b.add(i % 2 ? 'lettuceDark' : 'lettuce', LEAF, matrix(x, y, z, a, s, s, s, -0.5));
  }
  b.add('lettuce', LEAF, matrix(x, y + 0.03 * s, z, a0, s * 0.8, s * 1.3, s * 0.5, -1.2));
}

// ---------------------------------------------------------------- Evergreen Greenhouse Dome
function greenhouse(scene, M) {
  const O = new THREE.Vector3(1600, -400, 2600);
  const group = new THREE.Group();
  group.name = 'set_greenhouse';
  group.position.copy(O);
  const b = new Batch();
  const RAD = 17;
  const cy = -RAD * 0.15;

  // Snow outside, the dome's base wall and its glass skin on a white steel lattice.
  b.add('snow', new THREE.CircleGeometry(500, 48).rotateX(-Math.PI / 2), matrix(0, -0.02, 0));
  b.add('concrete', new THREE.CylinderGeometry(RAD * 0.99, RAD * 0.99, 0.12, 64), matrix(0, 0.06, 0));
  const ico = new THREE.IcosahedronGeometry(RAD, 3);
  const glass = new THREE.Mesh(ico, M.domeGlass);
  glass.position.y = cy;
  group.add(glass);
  const edges = new THREE.EdgesGeometry(ico, 1);
  const ep = edges.attributes.position;
  const a = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i < ep.count; i += 2) {
    a.fromBufferAttribute(ep, i);
    c.fromBufferAttribute(ep, i + 1);
    if (a.y + cy < -0.5 && c.y + cy < -0.5) continue;
    const len = a.distanceTo(c);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    const g = new THREE.CylinderGeometry(0.06, 0.06, len, 5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize());
    g.applyQuaternion(q);
    b.add('strut', g, matrix(mid.x, mid.y + cy, mid.z));
  }
  // Floor and a central aisle.
  b.add('concreteDark', new THREE.BoxGeometry(2.6, 0.04, RAD * 1.9), matrix(0, 0.14, 0));

  // Hydroponic racks: three tiers of trays, a pink LED bar over each tier.
  const rackXs = [-10.2, -6.6, -3.0, 3.0, 6.6, 10.2];
  for (const rx of rackXs) {
    const half = Math.sqrt(Math.max(0, (RAD - 1.5) ** 2 - rx * rx)) - 1;
    const len = half * 2;
    for (const t of [0, 1, 2]) {
      const y = 0.45 + t * 0.85;
      b.add('tray', new THREE.BoxGeometry(1.5, 0.1, len), matrix(rx, y, 0));
      b.add('ledPink', new THREE.BoxGeometry(1.2, 0.035, len), matrix(rx, y + 0.72, 0));
      b.add('rack', new THREE.BoxGeometry(1.5, 0.05, len), matrix(rx, y + 0.76, 0));
      for (let z = -half + 0.2; z < half - 0.1; z += 0.34) {
        for (const ox of [-0.42, 0, 0.42]) lettuce(b, rx + ox + (R() - 0.5) * 0.06, y + 0.06, z, 0.8 + R() * 0.4);
      }
    }
    for (let z = -half; z <= half; z += 2.4) {
      for (const s of [-0.72, 0.72]) b.add('rack', new THREE.BoxGeometry(0.05, 2.7, 0.05), matrix(rx + s, 1.35, z));
    }
  }
  // Tomato vines on tall wires along the outer ring.
  for (let i = 0; i < 26; i++) {
    const ang = (i / 26) * Math.PI * 2;
    if (Math.abs(Math.sin(ang)) > 0.93) continue; // keep the aisle ends open
    const r0 = RAD - 2.6;
    const x = Math.cos(ang) * r0;
    const z = Math.sin(ang) * r0;
    b.add('rack', new THREE.CylinderGeometry(0.02, 0.02, 3.2, 4), matrix(x, 1.6, z));
    for (let k = 0; k < 9; k++) {
      const y = 0.4 + k * 0.32;
      b.add('vine', new THREE.IcosahedronGeometry(0.28, 0), matrix(x + (R() - 0.5) * 0.3, y, z + (R() - 0.5) * 0.3, R() * 3, 1, 0.8, 1));
      if (R() < 0.55) b.add('tomato', new THREE.SphereGeometry(0.06, 8, 6), matrix(x + (R() - 0.5) * 0.4, y - 0.1, z + (R() - 0.5) * 0.4));
    }
  }
  // A grower checking the lettuce, and another down the aisle.
  person(b, 1.1, -3.5, -Math.PI / 2 - 0.3, { coat: 'coatWhite', scarf: 'coatTeal', still: true });
  person(b, -0.6, 6.5, 0.2, { coat: 'coatTeal', still: false });

  // Outside: the two smaller domes glowing in the snow, and pines.
  for (const [x, z, r] of [[34, -30, 12], [-30, -36, 10]]) {
    const d = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), M.domeGlow);
    d.position.set(x, -r * 0.15, z);
    group.add(d);
  }
  for (let i = 0; i < 40; i++) {
    const ang = R() * Math.PI * 2;
    const rr = 45 + R() * 60;
    pine(b, Math.cos(ang) * rr, Math.sin(ang) * rr, 1 + R() * 0.6);
  }
  group.add(b.build(M));
  scene.add(group);

  const lights = [
    ...[-6, 0, 6].map((z) => [-4.8, 2.6, z, 0xff5fd0, 22, 12]),
    ...[-6, 0, 6].map((z) => [4.8, 2.6, z, 0xff5fd0, 22, 12]),
    [0, 3.2, -9, 0xffd6a8, 10, 14], [0, 3.2, 9, 0xffd6a8, 10, 14],
  ];
  return {
    group,
    setActive(on) { group.visible = on; },
    look(L, ctx) {
      ctx.hemi.intensity = L.hemi ?? 0.35;
      ctx.lampLights.forEach((pl, i) => {
        const l = lights[i];
        if (!l) { pl.intensity = 0; return; }
        pl.position.set(O.x + l[0], O.y + l[1], O.z + l[2]);
        pl.color.set(l[3]);
        pl.intensity = l[4] * (L.lampScale ?? 1);
        pl.distance = l[5];
      });
    },
    origin: O,
  };
}

export function interiors(scene) {
  const M = setMaterials();
  return { grotto: grotto(scene, M), greenhouse: greenhouse(scene, M) };
}
