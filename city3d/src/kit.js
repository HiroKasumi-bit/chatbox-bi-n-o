// Reusable pieces: buildings with window facades, Nordic houses, snowy pines, street lamps,
// vehicles and a few simple shapes. Each function adds geometry to a Batch.
import * as THREE from 'three';
import { boxWalls, matrix, rng } from './util.js';
import { FACADE } from './materials.js';

const R = rng(4242);

// A rectangular block with a window facade, a snowy flat roof and optional rooftop units.
export function building(b, o) {
  const { x, z, w, d, h } = o;
  const ry = o.ry || 0;
  const y0 = o.y || 0;
  const facade = o.facade || 'officeLight';
  const { walls, roof } = boxWalls(w, h, d, FACADE.bay, FACADE.floor, Math.floor(R() * 8), Math.floor(R() * 8));
  const m = matrix(x, y0 + h / 2, z, ry);
  b.add(`f_${facade}`, walls, m);
  b.add(o.roof || 'snowRoof', roof, m);
  // Parapet line just above the roof.
  if (o.parapet !== false && h > 6) {
    const t = 0.35;
    const pm = (px, pz, pw, pd) => b.add('panelGrey', new THREE.BoxGeometry(pw, 0.7, pd), matrix(x, 0, z, ry).multiply(matrix(px, y0 + h + 0.35, pz)));
    pm(0, d / 2 - t / 2, w, t);
    pm(0, -d / 2 + t / 2, w, t);
    pm(w / 2 - t / 2, 0, t, d);
    pm(-w / 2 + t / 2, 0, t, d);
  }
  if (o.units !== false && h > 8 && w > 10 && d > 10) {
    const n = 1 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      const uw = 2 + R() * 4;
      const ud = 2 + R() * 4;
      const ux = (R() - 0.5) * (w - uw - 2);
      const uz = (R() - 0.5) * (d - ud - 2);
      b.add('panelGrey', new THREE.BoxGeometry(uw, 1.6, ud), matrix(x, 0, z, ry).multiply(matrix(ux, y0 + h + 0.8, uz)));
      b.add('snowRoof', new THREE.BoxGeometry(uw + 0.1, 0.25, ud + 0.1), matrix(x, 0, z, ry).multiply(matrix(ux, y0 + h + 1.72, uz)));
    }
  }
  return y0 + h;
}

// A tower made of stacked set-back blocks.
export function steppedTower(b, o) {
  let y = 0;
  let w = o.w;
  let d = o.d;
  o.tiers.forEach((th, i) => {
    building(b, { ...o, y, w, d, h: th, units: i === o.tiers.length - 1, parapet: true });
    y += th;
    w *= o.shrink || 0.82;
    d *= o.shrink || 0.82;
  });
  return y;
}

// Triangular prism for a pitched roof: width across x, ridge along z.
export function roofPrism(w, rh, d) {
  const hw = w / 2;
  const hd = d / 2;
  const v = [
    // left slope
    -hw, 0, hd, 0, rh, hd, 0, rh, -hd, -hw, 0, hd, 0, rh, -hd, -hw, 0, -hd,
    // right slope
    hw, 0, -hd, 0, rh, -hd, 0, rh, hd, hw, 0, -hd, 0, rh, hd, hw, 0, hd,
    // gables
    -hw, 0, hd, hw, 0, hd, 0, rh, hd, hw, 0, -hd, -hw, 0, -hd, 0, rh, -hd,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

const HOUSE_COLOURS = ['red', 'ochre', 'teal', 'white', 'blue', 'red', 'white'];

export function house(b, o) {
  const { x, z } = o;
  const w = o.w || 8;
  const d = o.d || 10;
  const h = o.h || 5.5;
  const ry = o.ry || 0;
  const col = o.colour || HOUSE_COLOURS[Math.floor(R() * HOUSE_COLOURS.length)];
  const { walls } = boxWalls(w, h, d, 2.6, 2.8, Math.floor(R() * 8), Math.floor(R() * 8));
  const base = matrix(x, 0, z, ry);
  b.add(`h_${col}`, walls, base.clone().multiply(matrix(0, h / 2, 0)));
  const rh = w * 0.42;
  b.add('snowRoof', roofPrism(w + 1.0, rh, d + 1.0), base.clone().multiply(matrix(0, h, 0)));
  b.add('timberDark', new THREE.BoxGeometry(w + 1.1, 0.25, d + 1.1), base.clone().multiply(matrix(0, h - 0.05, 0)));
  b.add('stone', new THREE.BoxGeometry(0.9, 2.2, 0.9), base.clone().multiply(matrix(w * 0.2, h + rh * 0.6, d * 0.2)));
}

// A snowy pine: stacked cones with snow on each tier.
export function pine(b, x, z, s = 1, y = 0) {
  const r = 0.85 + R() * 0.3;
  const k = s * r;
  b.add('trunk', new THREE.CylinderGeometry(0.25 * k, 0.35 * k, 1.6 * k, 6), matrix(x, y + 0.8 * k, z));
  const tiers = [
    [2.6, 3.2, 1.0],
    [2.0, 2.8, 2.6],
    [1.35, 2.4, 4.0],
  ];
  const ry = R() * Math.PI;
  tiers.forEach(([rad, hgt, base]) => {
    b.add('treeGreen', new THREE.ConeGeometry(rad * k, hgt * k, 7), matrix(x, y + (base + hgt / 2) * k, z, ry));
    b.add('snowRoof', new THREE.ConeGeometry(rad * 0.72 * k, hgt * 0.42 * k, 7), matrix(x, y + (base + hgt * 0.78) * k, z, ry));
  });
}

export function lamp(b, x, z, h = 6, cool = false) {
  b.add('metalDark', new THREE.CylinderGeometry(0.09, 0.12, h, 6), matrix(x, h / 2, z));
  b.add(cool ? 'lampCool' : 'lamp', new THREE.SphereGeometry(0.32, 8, 6), matrix(x, h + 0.1, z));
}

export function car(b, x, z, ry, key = 'vehicleWhite') {
  const m = matrix(x, 0, z, ry);
  b.add(key, new THREE.BoxGeometry(1.8, 0.75, 4.2), m.clone().multiply(matrix(0, 0.65, 0)));
  b.add('glass', new THREE.BoxGeometry(1.6, 0.55, 2.2), m.clone().multiply(matrix(0, 1.25, -0.2)));
  b.add('lamp', new THREE.BoxGeometry(1.5, 0.15, 0.1), m.clone().multiply(matrix(0, 0.75, -2.12)));
}

export function truck(b, x, z, ry, key = 'vehicleRed') {
  const m = matrix(x, 0, z, ry);
  b.add(key, new THREE.BoxGeometry(2.5, 2.6, 8.5), m.clone().multiply(matrix(0, 1.7, 0)));
  b.add('glass', new THREE.BoxGeometry(2.3, 1.0, 0.1), m.clone().multiply(matrix(0, 2.4, -4.27)));
  b.add('blueLight', new THREE.BoxGeometry(1.2, 0.2, 0.3), m.clone().multiply(matrix(0, 3.1, -3.6)));
}

export function bench(b, x, z, ry) {
  const m = matrix(x, 0, z, ry);
  b.add('timber', new THREE.BoxGeometry(1.8, 0.1, 0.5), m.clone().multiply(matrix(0, 0.45, 0)));
  b.add('metalDark', new THREE.BoxGeometry(1.6, 0.4, 0.08), m.clone().multiply(matrix(0, 0.2, 0)));
}

// Simple fence of posts along a line.
export function fence(b, x1, z1, x2, z2, step = 3) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const n = Math.max(1, Math.round(len / step));
  const ang = Math.atan2(x2 - x1, z2 - z1);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    b.add('metalDark', new THREE.BoxGeometry(0.12, 1.8, 0.12), matrix(x1 + (x2 - x1) * t, 0.9, z1 + (z2 - z1) * t));
  }
  b.add('metalDark', new THREE.BoxGeometry(0.06, 0.06, len), matrix((x1 + x2) / 2, 1.7, (z1 + z2) / 2, ang));
  b.add('metalDark', new THREE.BoxGeometry(0.06, 0.06, len), matrix((x1 + x2) / 2, 0.9, (z1 + z2) / 2, ang));
}

// A pipe between two points at height y, on simple supports.
export function pipeRun(b, pts, y, r = 0.6, key = 'pipe', support = 12) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ang = Math.atan2(x2 - x1, z2 - z1);
    b.add(key, new THREE.CylinderGeometry(r, r, len + r * 2, 10), matrix((x1 + x2) / 2, y, (z1 + z2) / 2, ang, 1, 1, 1, Math.PI / 2));
    const n = Math.max(1, Math.round(len / support));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;
      b.add('steel', new THREE.BoxGeometry(0.35, y - r, 0.35), matrix(px, (y - r) / 2, pz));
      b.add('steel', new THREE.BoxGeometry(r * 3, 0.3, 0.5), matrix(px, y - r - 0.15, pz, ang));
    }
  }
}

// A coloured band around the top edge of a roof.
export function roofBand(b, key, x, z, w, d, y, t = 0.5) {
  b.add(key, new THREE.BoxGeometry(w + 0.2, t, 0.4), matrix(x, y, z - d / 2));
  b.add(key, new THREE.BoxGeometry(w + 0.2, t, 0.4), matrix(x, y, z + d / 2));
  b.add(key, new THREE.BoxGeometry(0.4, t, d + 0.2), matrix(x - w / 2, y, z));
  b.add(key, new THREE.BoxGeometry(0.4, t, d + 0.2), matrix(x + w / 2, y, z));
}

// A barrel vault: half cylinder of radius r and length len along z (turn with ry), its crown
// flattened by `flat`, with half-ellipse end walls.
export function vault(b, key, x, y, z, r, len, flat = 0.45, ry = 0, endKey = key) {
  const g = new THREE.CylinderGeometry(r, r, len, 28, 1, true, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2).scale(1, flat, 1);
  b.add(key, g, matrix(x, y, z, ry));
  const cap = new THREE.CircleGeometry(r, 28, 0, Math.PI).scale(1, flat, 1);
  b.add(endKey, cap, matrix(x, y, z, ry).multiply(matrix(0, 0, len / 2)));
  b.add(endKey, cap, matrix(x, y, z, ry).multiply(matrix(0, 0, -len / 2, Math.PI)));
}

export function sign(b, x, y, z, w, h, key, ry = 0) {
  b.add(key, new THREE.BoxGeometry(w, h, 0.2), matrix(x, y, z, ry));
}
