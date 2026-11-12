// The spa inside Mount Aurora, as in the magazine's section (Four Floors of Warmth):
//   Level 1  welcome hall and Mineral Lake  (the grotto set in src/interiors.js)
//   Level 2  warm mud terraces              (built here, deep under the snowfield like the grotto)
//   Level 3  salt sauna and treatments      (built here)
//   Level 4  Summit Sanctuary and float pool, under the glass Aurora Eye on the real summit (built here)
// A glass lift joins the four levels. Each room says where you can stand (ground), how far the camera may go,
// where you arrive and where the lift is.
import * as THREE from 'three';
import { MOUNT } from '../src/layout.js';

const rnd = (() => { let a = 777; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
function planks(base, line, w = 512, h = 512, vertical = false) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    const p = i * (vertical ? w : h) / 16; g.fillStyle = `rgba(0,0,0,${0.08 + rnd() * 0.1})`;
    if (vertical) g.fillRect(p, 0, 2, h); else g.fillRect(0, p, w, 2);
    g.fillStyle = `rgba(255,220,170,${rnd() * 0.06})`; if (vertical) g.fillRect(p + 2, 0, w / 16 - 2, h); else g.fillRect(0, p + 2, w, h / 16 - 2);
  }
  g.strokeStyle = line; g.globalAlpha = 0.15; for (let i = 0; i < 60; i++) { g.beginPath(); const y = rnd() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + rnd() * 8, w * 0.6, y - rnd() * 8, w, y); g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function rockCave(w, h, d, colors) { // a rough box-shaped cave, seen from inside
  const g = new THREE.BoxGeometry(w, h, d, 24, 8, 24); const p = g.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = Math.sin(x * 1.3 + z * 0.7) * 0.25 + Math.sin(z * 2.1 - y) * 0.2 + (rnd() - 0.5) * 0.3;
    if (y > -h / 2 + 0.01) p.setXYZ(i, x * (1 + k * 0.03), y + (y > h / 2 - 0.01 ? k * 0.6 : 0), z * (1 + k * 0.03));
    const c = new THREE.Color(colors[Math.floor(rnd() * colors.length)]); col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.BackSide })); m.position.y = h / 2; m.receiveShadow = true; return m;
}
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m; };
const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff2d6, emissive: 0xffb455, emissiveIntensity: 2.2 });
function candles(group, pts) { for (const [x, y, z] of pts) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14 + rnd() * 0.1, 8), candleMat); c.position.set(x, y + 0.08, z); group.add(c); } }
function lift(group, x, z, h, glass, steel) {
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, h, 28, 1, true), glass); shaft.position.set(x, h / 2, z); group.add(shaft);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; group.add(box(0.06, h, 0.06, steel, x + Math.cos(a) * 1.1, 0, z + Math.sin(a) * 1.1)); }
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x2a2f36, emissive: 0xffd29a, emissiveIntensity: 0.4 })); cab.position.set(x, 0.06, z); group.add(cab);
}

export function buildSpa(scene) {
  const glass = new THREE.MeshStandardMaterial({ color: 0xcfe2f5, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.35, metalness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x6d655c, roughness: 0.85 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x3b3631, roughness: 0.9 });
  const rooms = {};

  // ── Level 2: warm mud terraces ──
  {
    const O = new THREE.Vector3(0, -400, 2730), g = new THREE.Group(); g.position.copy(O); scene.add(g);
    g.add(rockCave(24, 7, 22, [0x3e352c, 0x4a3f33, 0x2f2924, 0x55493c]));
    g.add(box(24, 0.1, 22, new THREE.MeshStandardMaterial({ color: 0x5a5148, roughness: 0.6 }), 0, -0.1, 0));
    const mud = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.25, metalness: 0.1, emissive: 0x3a1f0c, emissiveIntensity: 0.5 });
    const pools = [[-9, -7, -2, -1, 0], [2, -7, 9, -1, 0], [-6, 2.5, 6, 8, 0.7]];
    for (const [x0, z0, x1, z1, y] of pools) {
      if (y > 0) g.add(box(x1 - x0 + 1.2, y, z1 - z0 + 1.2, stone, (x0 + x1) / 2, 0, (z0 + z1) / 2));
      const rim = box(x1 - x0 + 0.6, 0.18, z1 - z0 + 0.6, darkStone, (x0 + x1) / 2, y, (z0 + z1) / 2); g.add(rim);
      const w = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), mud); w.position.set((x0 + x1) / 2, y + 0.16, (z0 + z1) / 2); g.add(w);
      const pts = []; for (let i = 0; i < 14; i++) { const t = i / 13; pts.push([x0 + (x1 - x0) * t, y + 0.18, z0 - 0.25], [x0 + (x1 - x0) * t, y + 0.18, z1 + 0.25]); } candles(g, pts);
    }
    // steps up to the upper terrace
    for (let i = 0; i < 3; i++) g.add(box(3, 0.23 * (i + 1), 0.6, stone, 0, 0, 1.4 - i * 0.6 + 0.6));
    candles(g, Array.from({ length: 30 }, (_, i) => [-11 + (i % 15) * 1.55, 0, i < 15 ? -9.6 : 9.6]));
    lift(g, 9.6, 8.2, 7, glass, steel);
    rooms.L2 = {
      origin: O, group: g, arrive: { x: 7.0, z: 5.0, yaw: -2.46 }, lift: { x: 7.6, z: 6.4 },
      ground(x, z) {
        if (Math.abs(x) > 11.2 || Math.abs(z) > 10.2 || (x - 9.6) ** 2 + (z - 8.2) ** 2 < 2.4) return null;
        for (const [x0, z0, x1, z1, y] of pools) if (x > x0 - 0.5 && x < x1 + 0.5 && z > z0 - 0.5 && z < z1 + 0.5) return null;
        return 0;
      },
      cam: (x, y, z) => Math.abs(x) < 11.4 && Math.abs(z) < 10.4 && y < 6.3 && (x - 9.6) ** 2 + (z - 8.2) ** 2 > 2.6,
      lights: [[-6, 2.5, -4, 0xffb060, 30, 12], [6, 2.5, -4, 0xffb060, 30, 12], [0, 3, 5, 0xffa050, 34, 14], [-10, 2, 8, 0xff9d55, 18, 10], [10, 2, -8, 0xff9d55, 18, 10], [9.6, 5, 8.2, 0xffd29a, 10, 8]],
      bg: 0x0b0806, fog: [0x1a130e, 20, 90], exposure: 1.25, hemi: [0x8a6e55, 0x2a1f18, 0.45],
    };
  }

  // ── Level 3: salt sauna and treatments ──
  {
    const O = new THREE.Vector3(0, -400, 2830), g = new THREE.Group(); g.position.copy(O); scene.add(g);
    const wood = new THREE.MeshStandardMaterial({ map: planks('#a8673a', '#5a3218'), roughness: 0.7, side: THREE.BackSide });
    wood.map.repeat.set(3, 1.5);
    const room = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 14), wood); room.position.y = 2.5; room.receiveShadow = true; g.add(room);
    const benchMat = new THREE.MeshStandardMaterial({ map: planks('#c58a55', '#6a3c1c', 512, 512, true), roughness: 0.75 });
    for (let i = 0; i < 3; i++) g.add(box(15, 0.45 * (i + 1), 1.2, benchMat, 0, 0, 4.2 + i * 1.1));
    // the Himalayan salt wall, lit from behind
    const salt = (() => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d');
      for (let r = 0; r < 8; r++) for (let c = 0; c < 12; c++) { const o = (r % 2) * 21; x.fillStyle = `hsl(${18 + rnd() * 14}, ${70 + rnd() * 20}%, ${58 + rnd() * 18}%)`; x.fillRect(c * 43 + o - 21, r * 32 + 2, 41, 28); }
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(13, 4.6), new THREE.MeshStandardMaterial({ map: salt, emissiveMap: salt, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.8 }));
    sw.position.set(-7.95, 2.35, 0); sw.rotation.y = Math.PI / 2; g.add(sw);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.9 });
    const beds = [[2.4, -3.2], [5.0, -3.2]];
    for (const [x, z] of beds) { g.add(box(0.9, 0.7, 2.1, benchMat, x, 0, z)); g.add(box(0.85, 0.12, 2.0, bedMat, x, 0.7, z)); }
    const stove = box(1.2, 0.9, 1.0, new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.6, metalness: 0.6 }), -5.6, 0, 2.8); g.add(stove);
    for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0x55504a, emissive: 0xff4a10, emissiveIntensity: 0.25 + rnd() * 0.5 })); s.position.set(-5.6 + (rnd() - 0.5) * 0.9, 1.0 + rnd() * 0.12, 2.8 + (rnd() - 0.5) * 0.8); g.add(s); }
    candles(g, [[-2, 0, -6.6], [-1, 0, -6.6], [0, 0, -6.6], [1, 0, -6.6], [3.7, 0, -1.8], [6.3, 0, -1.8]]);
    lift(g, 6.6, -5.6, 5, glass, steel);
    rooms.L3 = {
      origin: O, group: g, arrive: { x: 3.0, z: -1.0, yaw: -0.66 }, lift: { x: 4.8, z: -5.6 },
      ground(x, z) {
        if (Math.abs(x) > 7.5 || z < -6.6 || z > 3.4 || (x - 6.6) ** 2 + (z + 5.6) ** 2 < 2.2) return null;
        for (const [bx, bz] of beds) if (Math.abs(x - bx) < 0.85 && Math.abs(z - bz) < 1.45) return null;
        if (Math.abs(x + 5.6) < 1.0 && z > 2.0) return null;
        return 0;
      },
      cam: (x, y, z) => Math.abs(x) < 7.7 && Math.abs(z) < 6.8 && y < 4.7 && (x - 6.6) ** 2 + (z + 5.6) ** 2 > 2.6,
      lights: [[-6.5, 1.5, 0, 0xff8a50, 26, 10], [0, 4.4, -2, 0xffb070, 18, 10], [0, 1.2, 5.5, 0xff9a55, 20, 9], [5, 2, -4, 0xffc890, 12, 8], [-5.6, 1.3, 2.8, 0xff5a20, 8, 5]],
      bg: 0x0b0704, fog: [0x1c120a, 18, 70], exposure: 1.2, hemi: [0x9a6a45, 0x2a1a10, 0.5],
    };
  }

  // ── Level 4: Summit Sanctuary under the Aurora Eye, on the real summit (open to the sky and the aurora) ──
  {
    const C = new THREE.Vector3(MOUNT.x, 30.25, MOUNT.z + 10), g = new THREE.Group(); g.position.copy(C); scene.add(g);
    g.add(box(10.8, 0.6, 10.8, new THREE.MeshStandardMaterial({ color: 0x8c857c, roughness: 0.6 }), 0, -0.6, 0).translateY(0));
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.5, 48), new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.5 })); floor.position.y = -0.25; floor.receiveShadow = true; g.add(floor);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.14, 8, 48).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.4 })); rim.position.y = 0.06; g.add(rim);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1fb6c0, roughness: 0.08, metalness: 0.2, emissive: 0x0e6f7a, emissiveIntensity: 0.9 })); pool.position.y = 0.02; g.add(pool);
    const R = 5.0;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2), glass));
    for (let k = 0; k < 8; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.05, 4, 40, Math.PI), steel); r.rotation.y = k / 8 * Math.PI; g.add(r); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.7, 0.05, 4, 40).rotateX(Math.PI / 2), steel); ring.position.y = R * 0.71; g.add(ring);
    const base = new THREE.Mesh(new THREE.TorusGeometry(R + 0.06, 0.12, 6, 48).rotateX(Math.PI / 2), steel); base.position.y = 0.05; g.add(base);
    const lounger = new THREE.MeshStandardMaterial({ color: 0xece6dc, roughness: 0.9 });
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.4; const l = box(0.7, 0.35, 1.8, lounger, Math.cos(a) * 3.7, 0, Math.sin(a) * 3.7); l.rotation.y = -a; g.add(l); }
    lift(g, -3.6, -2.4, 3.2, glass, steel);
    rooms.L4 = {
      origin: C, group: g, outdoors: true, arrive: { x: 2.9, z: -1.6, yaw: 2.07 }, lift: { x: -2.3, z: -3.6 }, // arrive facing out over the city, the camera above the pool
      ground(x, z) { const r = Math.hypot(x, z); if (r > 4.35 || r < 2.7 || (x + 3.6) ** 2 + (z + 2.4) ** 2 < 1.6) return null; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.4; if (Math.hypot(x - Math.cos(a) * 3.7, z - Math.sin(a) * 3.7) < 0.75) return null; } return 0; },
      cam: (x, y, z) => Math.hypot(x, z) < 4.5 && y < 4.4 && y > 0.3 && (x + 3.6) ** 2 + (z + 2.4) ** 2 > 1.4,
      lights: [[0, 3.6, 0, 0xffd6a0, 6, 9], [0, 0.4, 0, 0x45d6dc, 8, 6]],
    };
  }
  return rooms;
}
