// The snowfield, the street network, plazas and the snow banks left by the ploughs.
import * as THREE from 'three';
import { matrix, noise2D, fbm, smoothstep, rng } from './util.js';
import { materials } from './materials.js';
import { PITCH, RING, STREET } from './layout.js';
import { lamp } from './kit.js';

const R = rng(77);

// A large snowfield: flat where the city stands, gently drifting dunes beyond it.
export function snowfield() {
  const size = 7000;
  const seg = 280;
  const g = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  const n = noise2D(5);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Distance outside the built-up rectangle.
    const dx = Math.max(-480 - x, 0, x - 600);
    const dz = Math.max(-420 - z, 0, z - 360);
    const out = smoothstep(0, 260, Math.hypot(dx, dz));
    const dune = (fbm(n, x / 260, z / 260, 4) - 0.5) * 26 + (fbm(n, x / 60 + 9, z / 90, 3) - 0.5) * 4;
    pos.setY(i, out * dune - 0.05);
  }
  g.computeVertexNormals();
  // Fine wind ripples as a bump map.
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  const img = c.createImageData(256, 256);
  const nn = noise2D(9);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const v = fbm(nn, x / 18, y / 48, 4) * 0.7 + fbm(nn, x / 4 + 50, y / 4, 2) * 0.3;
      const k = (y * 256 + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.round(v * 255);
      img.data[k + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  const bump = new THREE.CanvasTexture(cv);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(size / 14, size / 14);
  const mat = materials.snow;
  mat.bumpMap = bump;
  mat.bumpScale = 0.12;
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true;
  mesh.name = 'snowfield';
  return mesh;
}

// A straight road from (x1, z1) to (x2, z2) with sidewalks, centre markings and snow banks.
export function road(b, x1, z1, x2, z2, o = {}) {
  const w = o.width || 10;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(x2 - x1, z2 - z1);
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const at = (lx, lz) => matrix(cx, 0, cz, ang).multiply(matrix(lx, 0, lz));
  b.add(o.surface || 'asphalt', new THREE.BoxGeometry(w, 0.12, len), at(0, 0).multiply(matrix(0, 0.06, 0)));
  if (o.sidewalk !== false) {
    for (const s of [-1, 1]) b.add('sidewalk', new THREE.BoxGeometry(3, 0.22, len), at(s * (w / 2 + 1.5), 0).multiply(matrix(0, 0.11, 0)));
  }
  if (o.marking !== false) {
    const dash = 3;
    for (let t = -len / 2 + 2; t < len / 2 - 2; t += dash * 2.5) b.add('marking', new THREE.BoxGeometry(0.18, 0.02, dash), at(0, t + dash / 2).multiply(matrix(0, 0.13, 0)));
  }
  if (o.banks) {
    // Continuous low banks of ploughed snow along both edges.
    for (const s of [-1, 1]) {
      for (let t = -len / 2; t < len / 2 - 1; t += 10) {
        const l = Math.min(11, len / 2 - t);
        const g = new THREE.CylinderGeometry(1, 1, l, 8, 1);
        b.add('snowBank', g, at(s * (w / 2 + 5.2), t + l / 2).multiply(matrix(0, -0.15, 0, 0, 2.6, 1, 0.45 + R() * 0.3, Math.PI / 2)));
      }
    }
  }
  if (o.lamps) {
    for (let t = -len / 2 + 6; t < len / 2; t += o.lamps) for (const s of [-1, 1]) lamp(b, ...lp(at(s * (w / 2 + 2.6), t)), 7);
  }
}

const lp = (m) => {
  const v = new THREE.Vector3().setFromMatrixPosition(m);
  return [v.x, v.z];
};

export function streets(b) {
  const half = RING;
  // Downtown grid: two streets each way between the blocks, and the ring road.
  for (const s of [-PITCH / 2, PITCH / 2]) {
    road(b, s, -half, s, half, { width: STREET - 6, lamps: 24 });
    road(b, -half, s, half, s, { width: STREET - 6, lamps: 24 });
  }
  for (const s of [-half, half]) {
    road(b, s, -half - 7, s, half + 7, { width: 12, lamps: 26 });
    road(b, -half - 7, s, half + 7, s, { width: 12, lamps: 26 });
  }
  // Avenues out of downtown.
  road(b, 0, -half - 7, 0, -212, { width: 12, banks: true, lamps: 30 }); // Aurora Avenue north
  road(b, half + 7, 0, 360, 0, { width: 12, banks: true, lamps: 30 }); // Glacier Avenue east
  road(b, -half - 7, 0, -262, 0, { width: 11, banks: true, lamps: 32 }); // west to the eco-homes
  road(b, 135, -150, 135, 282, { width: 11, banks: true, lamps: 32 }); // Industry Park Avenue
  road(b, 141, 132, 345, 132, { width: 10, banks: true, lamps: 34 }); // plant service road
  road(b, 141, 20, 345, 20, { width: 9, banks: true }); // food plant north road
  road(b, 7, -150, 300, -150, { width: 11, banks: true, lamps: 30 }); // airport road
  road(b, 0, half + 7, 0, 180, { width: 9, surface: 'plaza', marking: false, lamps: 14 }); // boulevard to the North Portal
  road(b, -262, -110, -262, 112, { width: 9, banks: true });
}

// Heated granite plaza with a ring of lanterns.
export function plaza(b, x, z, w, d, key = 'plaza') {
  b.add(key, new THREE.BoxGeometry(w, 0.2, d), matrix(x, 0.1, z));
}
