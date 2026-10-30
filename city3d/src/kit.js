// Reusable pieces: buildings with window facades and shop fronts, Nordic houses, snowy pines,
// street lamps, cars, people and a few simple shapes. Each function adds geometry to a Batch.
import * as THREE from 'three';
import { matrix, rng } from './util.js';
import { FACADE, COATS, CAR_PAINTS } from './materials.js';
import { addPool, addLamp } from './lights.js';
import { CAMERA_SPOTS } from './layout.js';

let R = rng(4242);
const pick = (list) => list[Math.floor(R() * list.length)];

// Builds `fn` on its own random sequence, then moves the shared sequence on by `skip` draws.
// A part of the city can then be rebuilt without changing the random details (window lights,
// tree sizes, coats) of everything built after it, so the other pictures stay reproducible.
export function isolated(seed, skip, fn) {
  const shared = R;
  R = rng(seed);
  fn();
  R = shared;
  for (let i = 0; i < skip; i++) R();
}

// A flat wall facing +z, `len` wide and `h` high, its UVs counted in window bays and floors.
function wallQuad(len, h, bay, floor, ou = 0, ov = 0) {
  const g = new THREE.PlaneGeometry(len, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (len / bay) + ou, uv.getY(i) * (h / floor) + ov);
  return g;
}

// The four sides of a w × d footprint: length, offset from the centre and the turn that makes
// a +z-facing wall face outwards.
const SIDES = {
  s: (w, d) => [w, 0, d / 2, 0],
  n: (w, d) => [w, 0, -d / 2, Math.PI],
  e: (w, d) => [d, w / 2, 0, Math.PI / 2],
  w: (w, d) => [d, -w / 2, 0, -Math.PI / 2],
};

// A rectangular block with a window facade, a snowy flat roof, a cornice and rooftop units.
// o.shops: sides ('nsew') with shop fronts on the ground floor, or true for all four.
// o.balconies: add balconies on the upper floors of the long sides.
export function building(b, o) {
  const { x, z, w, d, h } = o;
  const ry = o.ry || 0;
  const y0 = o.y || 0;
  const facade = o.facade || 'officeLight';
  const base = matrix(x, y0, z, ry);
  const at = (lx, ly, lz, r = 0) => base.clone().multiply(matrix(lx, ly, lz, r));
  const shopSides = o.shops === true ? 'nsew' : o.shops || '';
  const gf = FACADE.shopFloor;
  const ou = Math.floor(R() * 8);
  const ov = Math.floor(R() * 8);
  for (const side of 'nsew') {
    const [len, ox, oz, rot] = SIDES[side](w, d);
    const shop = shopSides.includes(side) && h > gf + 3;
    if (shop) {
      b.add('f_shop', wallQuad(len, gf, FACADE.bay, gf, Math.floor(R() * 8), Math.floor(R() * 4)), at(ox, gf / 2, oz, rot));
      b.add(`f_${facade}`, wallQuad(len, h - gf, FACADE.bay, FACADE.floor, ou, ov), at(ox, gf + (h - gf) / 2, oz, rot));
      // Warm light from the shop windows on the sidewalk, and an awning over some shops.
      const p = new THREE.Vector3().setFromMatrixPosition(at(ox, 0, oz, rot));
      addPool('spill', p.x, p.z, len, 5, ry + rot, 0xffc58a);
      if (R() < 0.45) {
        const aw = Math.min(len - 1, 3.2 * (2 + Math.floor(R() * 3)));
        const ax = (R() - 0.5) * (len - aw);
        const m = at(ox, 0, oz, rot).multiply(matrix(ax, 0, 0));
        b.add('awning', new THREE.BoxGeometry(aw, 0.14, 1.5), m.clone().multiply(matrix(0, 3.75, 0.75)));
        b.add('snowRoof', new THREE.BoxGeometry(aw - 0.1, 0.1, 1.4), m.clone().multiply(matrix(0, 3.86, 0.75)));
      }
    } else {
      b.add(`f_${facade}`, wallQuad(len, h, FACADE.bay, FACADE.floor, ou, ov), at(ox, h / 2, oz, rot));
    }
    if (o.balconies && len > 12 && h > 10) {
      const floors = Math.floor((h - (shop ? gf : 0)) / FACADE.floor);
      const bays = Math.floor(len / FACADE.bay);
      const start = shop ? gf : 0;
      for (let f = 1; f < floors; f++) {
        for (let k = (f % 2); k < bays; k += 2) {
          const bx = -len / 2 + (k + 0.5) * FACADE.bay;
          const m = at(ox, 0, oz, rot).multiply(matrix(bx, start + f * FACADE.floor, 0));
          b.add('concrete', new THREE.BoxGeometry(2.7, 0.18, 1.3), m.clone().multiply(matrix(0, 0.09, 0.65)));
          b.add('glass', new THREE.BoxGeometry(2.7, 1.0, 0.04), m.clone().multiply(matrix(0, 0.68, 1.28)));
          b.add('metalDark', new THREE.BoxGeometry(2.74, 0.05, 0.07), m.clone().multiply(matrix(0, 1.2, 1.28)));
        }
      }
    }
  }
  b.add(o.roof || 'snowRoof', new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), at(0, h, 0));
  if (!shopSides && o.plinth !== false && y0 === 0) {
    b.add('concreteDark', new THREE.BoxGeometry(w + 0.12, 0.7, d + 0.12), at(0, 0.35, 0));
  }
  // Cornice and parapet.
  if (o.parapet !== false && h > 6) {
    b.add('panelGrey', new THREE.BoxGeometry(w + 0.36, 0.28, d + 0.36), at(0, h - 0.3, 0));
    const t = 0.35;
    const pm = (px, pz, pw, pd) => b.add('panelGrey', new THREE.BoxGeometry(pw, 0.8, pd), at(px, h + 0.4, pz));
    pm(0, d / 2 - t / 2, w, t);
    pm(0, -d / 2 + t / 2, w, t);
    pm(w / 2 - t / 2, 0, t, d);
    pm(-w / 2 + t / 2, 0, t, d);
    b.add('snowRoof', new THREE.BoxGeometry(w - 2 * t, 0.25, d - 2 * t), at(0, h + 0.12, 0));
  }
  if (o.units !== false && h > 8 && w > 10 && d > 10) {
    const n = 1 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) {
      const uw = 2 + R() * 4;
      const ud = 2 + R() * 4;
      const ux = (R() - 0.5) * (w - uw - 2);
      const uz = (R() - 0.5) * (d - ud - 2);
      b.add('panelGrey', new THREE.BoxGeometry(uw, 1.6, ud), at(ux, h + 0.8, uz));
      b.add('snowRoof', new THREE.BoxGeometry(uw + 0.1, 0.25, ud + 0.1), at(ux, h + 1.72, uz));
      if (R() < 0.5) b.add('metalDark', new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), at(ux + uw / 4, h + 1.85, uz));
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

// A gable wall: a triangle facing +z, with UVs in the same bay/floor units as the walls.
function gable(w, rh, bay, floor) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-w / 2, 0, 0, w / 2, 0, 0, 0, rh, 0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0.8, w / bay, 0.8, w / bay / 2, 0.97], 2)); // the board band above the windows
  return g;
}

const HOUSE_COLOURS = ['red', 'ochre', 'teal', 'white', 'blue', 'red', 'white'];

// A Nordic timber house: painted board walls, a steep snowy roof, a chimney and a lit door.
export function house(b, o) {
  const { x, z } = o;
  const w = o.w || 8;
  const d = o.d || 10;
  const h = o.h || 5.5;
  const ry = o.ry || 0;
  const col = o.colour || pick(HOUSE_COLOURS);
  const base = matrix(x, 0, z, ry);
  const at = (lx, ly, lz, r = 0) => base.clone().multiply(matrix(lx, ly, lz, r));
  const ou = Math.floor(R() * 8);
  const ov = Math.floor(R() * 8);
  for (const side of 'nsew') {
    const [len, ox, oz, rot] = SIDES[side](w, d);
    b.add(`h_${col}`, wallQuad(len, h, 2.6, 2.8, ou, ov), at(ox, h / 2, oz, rot));
  }
  const rh = w * 0.45;
  // Gable ends in the wall colour, under the roof.
  b.add(`h_${col}`, gable(w, rh, 2.6, 2.8), at(0, h, d / 2));
  b.add(`h_${col}`, gable(w, rh, 2.6, 2.8), at(0, h, -d / 2, Math.PI));
  b.add('timberDark', roofPrism(w + 0.9, rh + 0.38, d + 0.9), at(0, h - 0.2, 0));
  b.add('snowRoof', roofPrism(w + 1.1, rh + 0.5, d + 1.0), at(0, h - 0.05, 0));
  b.add('stone', new THREE.BoxGeometry(0.8, 2.4, 0.8), at(w * 0.22, h + rh * 0.55, d * 0.22));
  b.add('snowRoof', new THREE.BoxGeometry(0.9, 0.15, 0.9), at(w * 0.22, h + rh * 0.55 + 1.25, d * 0.22));
  b.add('concreteDark', new THREE.BoxGeometry(w + 0.1, 0.5, d + 0.1), at(0, 0.25, 0));
  // Front door on the +z gable, with a little roof and a lamp.
  b.add('timberDark', new THREE.BoxGeometry(1.1, 2.1, 0.12), at(w * 0.25, 1.05, d / 2 + 0.03));
  b.add('snowRoof', new THREE.BoxGeometry(1.8, 0.12, 0.9), at(w * 0.25, 2.5, d / 2 + 0.45));
  b.add('lamp', new THREE.BoxGeometry(0.18, 0.26, 0.12), at(w * 0.25 + 0.85, 2.15, d / 2 + 0.08));
  const p = new THREE.Vector3().setFromMatrixPosition(at(w * 0.25, 0, d / 2));
  addPool('spill', p.x, p.z, 3.5, 3, ry, 0xffbb77, 0.06);
}

// Pine tiers: a cone whose lower rim is cut into drooping branch tips.
const tierGeos = {};
function tierGeo(n, droop, key) {
  if (tierGeos[key]) return tierGeos[key];
  const pos = [];
  const tip = [0, 0.5, 0];
  const ring = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const out = i % 2 === 0;
    const rr = out ? 1 : 0.7;
    ring.push([Math.cos(a) * rr, out ? -0.5 - droop : -0.5 + 0.08, Math.sin(a) * rr]);
  }
  for (let i = 0; i < n * 2; i++) {
    pos.push(...tip, ...ring[i + 1], ...ring[i]);
    pos.push(0, -0.38, 0, ...ring[i], ...ring[i + 1]); // underside
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  tierGeos[key] = g;
  return g;
}

// A snowy spruce: six drooping tiers of branches, each with snow lying on top.
export function pine(b, x, z, s = 1, y = 0) {
  const k = s * (0.85 + R() * 0.3);
  const sl = 0.9 + R() * 0.25; // slenderness
  b.add('trunk', new THREE.CylinderGeometry(0.16 * k, 0.3 * k, 2.2 * k, 6), matrix(x, y + 1.1 * k, z));
  const green = R() < 0.5 ? 'treeGreen' : 'treeGreen2';
  const tiers = 6;
  const g = tierGeo(7, 0.12, 'tier');
  const sg = tierGeo(7, 0.04, 'snow');
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const rad = (2.7 - t * 2.1) * k / sl;
    const hgt = (2.5 - t * 0.9) * k;
    const yb = y + (1.1 + i * 1.18) * k;
    const ry = R() * Math.PI;
    b.add(green, g, matrix(x, yb + hgt / 2, z, ry, rad, hgt, rad));
    b.add('snowTree', sg, matrix(x, yb + hgt * 0.72, z, ry, rad * 0.78, hgt * 0.5, rad * 0.78));
  }
  b.add('snowTree', new THREE.ConeGeometry(0.35 * k, 1.2 * k, 6), matrix(x, y + (1.1 + tiers * 1.18 + 0.3) * k, z));
}

// A street lamp: a slim pole with a glowing lantern, and its pool of light on the ground.
export function lamp(b, x, z, h = 6, cool = false) {
  b.add('metalDark', new THREE.CylinderGeometry(0.07, 0.11, h, 8), matrix(x, h / 2, z));
  b.add('metalDark', new THREE.CylinderGeometry(0.16, 0.16, 0.5, 8), matrix(x, 0.25, z));
  b.add(cool ? 'lampCool' : 'lamp', new THREE.CylinderGeometry(0.22, 0.17, 0.55, 10), matrix(x, h + 0.2, z));
  b.add('metalDark', new THREE.ConeGeometry(0.34, 0.25, 10), matrix(x, h + 0.6, z));
  addLamp(x, h + 0.2, z, cool ? 0xd9e6ff : 0xffc27f, h * 1.25);
}

// Car body pieces, made once: a lower body, the glass cabin and the roof, extruded from side
// profiles (x along the car, front at +x), then turned so the car points to -z.
let carGeo = null;
function carGeometry() {
  if (carGeo) return carGeo;
  const ext = (pts, depth, bevel = 0.05) => {
    const s = new THREE.Shape(pts.map(([a, c]) => new THREE.Vector2(a, c)));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  carGeo = {
    body: ext([[-2.2, 0.32], [2.15, 0.32], [2.25, 0.6], [2.1, 0.86], [1.0, 1.0], [-1.9, 1.04], [-2.25, 0.9]], 1.66),
    cabin: ext([[-1.78, 0.98], [1.0, 0.98], [0.32, 1.44], [-1.3, 1.46]], 1.5, 0.04),
    roof: ext([[-1.2, 1.45], [0.25, 1.43], [0.2, 1.5], [-1.15, 1.52]], 1.42, 0.03),
    wheel: new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14).rotateZ(Math.PI / 2),
  };
  return carGeo;
}

export function car(b, x, z, ry, key) {
  const paint = key && key.startsWith('car') ? key : pick(CAR_PAINTS);
  const g = carGeometry();
  const m = matrix(x, 0, z, ry);
  const at = (lx, ly, lz) => m.clone().multiply(matrix(lx, ly, lz));
  b.add(paint, g.body, m);
  b.add('carGlass', g.cabin, m);
  b.add(paint, g.roof, m);
  for (const [wx, wz] of [[-0.82, -1.38], [0.82, -1.38], [-0.82, 1.4], [0.82, 1.4]]) b.add('tyre', g.wheel, at(wx, 0.33, wz));
  for (const s of [-1, 1]) {
    b.add('headlight', new THREE.BoxGeometry(0.42, 0.12, 0.08), at(s * 0.6, 0.78, -2.2));
    b.add('taillight', new THREE.BoxGeometry(0.4, 0.12, 0.06), at(s * 0.62, 0.86, 2.27));
  }
  if (R() < 0.3) b.add('snowRoof', new THREE.BoxGeometry(1.25, 0.08, 1.3), at(0, 1.55, 0.4));
  // Headlight beam on the road ahead.
  const p = new THREE.Vector3().setFromMatrixPosition(at(0, 0, -2.2));
  addPool('beam', p.x, p.z, 4.5, 16, ry + Math.PI, 0xe8efff, 0.2);
}

export function truck(b, x, z, ry, key = 'vehicleRed') {
  const m = matrix(x, 0, z, ry);
  const at = (lx, ly, lz) => m.clone().multiply(matrix(lx, ly, lz));
  b.add(key, new THREE.BoxGeometry(2.5, 2.6, 8.5), at(0, 1.7, 0));
  b.add('glass', new THREE.BoxGeometry(2.3, 1.0, 0.1), at(0, 2.4, -4.27));
  b.add('blueLight', new THREE.BoxGeometry(1.2, 0.2, 0.3), at(0, 3.1, -3.6));
  const wheel = carGeometry().wheel;
  for (const wz of [-2.8, 2.6]) for (const s of [-1, 1]) b.add('tyre', wheel, at(s * 1.15, 0.45, wz).multiply(matrix(0, 0, 0, 0, 1, 1.35, 1.35)));
  for (const s of [-1, 1]) b.add('headlight', new THREE.BoxGeometry(0.4, 0.2, 0.08), at(s * 0.9, 0.9, -4.27));
}

// People in winter coats. Each figure is about 1.75 m tall; `pose` sets the stride.
const PERSON = {
  leg: new THREE.CylinderGeometry(0.075, 0.062, 0.8, 6).translate(0, -0.4, 0),
  boot: new THREE.BoxGeometry(0.13, 0.11, 0.26),
  coat: new THREE.CylinderGeometry(0.2, 0.27, 0.86, 9),
  shoulders: new THREE.SphereGeometry(0.22, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new THREE.CylinderGeometry(0.062, 0.055, 0.64, 6).translate(0, -0.32, 0),
  scarf: new THREE.CylinderGeometry(0.085, 0.11, 0.12, 8),
  head: new THREE.SphereGeometry(0.11, 10, 8),
  hat: new THREE.SphereGeometry(0.122, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
};

export function person(b, x, z, ry, o = {}) {
  if (CAMERA_SPOTS.some(([cx, cz]) => (x - cx) ** 2 + (z - cz) ** 2 < 20)) return;
  const s = o.scale ?? (0.92 + R() * 0.14);
  const y = o.y || 0;
  const m = matrix(x, y, z, ry, s, s, s);
  const at = (lx, ly, lz, rx = 0, rz = 0) => m.clone().multiply(matrix(lx, ly, lz, 0, 1, 1, 1, rx, rz));
  const coat = o.coat || pick(COATS);
  const stride = o.still ? 0 : (o.stride ?? (0.15 + R() * 0.2)) * (R() < 0.5 ? 1 : -1);
  for (const side of [-1, 1]) {
    b.add('trousers', PERSON.leg, at(side * 0.1, 0.82, 0, stride * side));
    b.add('trousers', PERSON.boot, at(side * 0.1, 0.06, -0.04 - Math.sin(stride * side) * 0.75));
    b.add(coat, PERSON.arm, at(side * 0.26, 1.5, 0, -stride * side * 0.8, side * 0.12));
  }
  b.add(coat, PERSON.coat, at(0, 1.12, 0).multiply(matrix(0, 0, 0, 0, 1, 1, 0.78)));
  b.add(coat, PERSON.shoulders, at(0, 1.54, 0).multiply(matrix(0, 0, 0, 0, 1, 0.45, 0.78)));
  b.add(o.scarf || pick(COATS), PERSON.scarf, at(0, 1.6, 0));
  b.add('skin', PERSON.head, at(0, 1.73, 0));
  b.add(R() < 0.35 ? 'hatWool' : pick(COATS), PERSON.hat, at(0, 1.75, 0));
}

// A bather in a warm pool: head and shoulders above the water.
export function bather(b, x, z, ry, y = 0.5) {
  const m = matrix(x, y, z, ry);
  b.add('skin', PERSON.shoulders, m.clone().multiply(matrix(0, -0.07, 0, 0, 0.95, 0.4, 0.75)));
  b.add('skin', PERSON.scarf, m.clone().multiply(matrix(0, 0.08, 0, 0, 0.75, 1, 0.75)));
  b.add('skin', PERSON.head, m.clone().multiply(matrix(0, 0.24, 0)));
  b.add(R() < 0.5 ? 'trousers' : 'coatOchre', PERSON.hat, m.clone().multiply(matrix(0, 0.26, 0.015, 0, 1, 1, 1, -0.35)));
}

// A reindeer, about 1.1 m at the shoulder: brown body, pale neck and rump, branched antlers.
// It faces -z; `graze` lowers the head to the snow.
export function reindeer(b, x, z, ry, o = {}) {
  const s = o.scale ?? (0.9 + R() * 0.2);
  const base = matrix(x, 0, z, ry, s, s, s);
  const P = (px, py, pz) => new THREE.Vector3(px, py, pz).applyMatrix4(base);
  const at = (px, py, pz) => base.clone().multiply(matrix(px, py, pz));
  const limb = (key, a, c, r1, r2 = r1) => {
    const A = P(...a);
    const B = P(...c);
    const g = new THREE.CylinderGeometry(r2 * s, r1 * s, A.distanceTo(B), 8);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    b.add(key, g, new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  };
  const coat = o.coat || (R() < 0.5 ? 'deerBrown' : 'deerGrey');
  b.add(coat, new THREE.CylinderGeometry(0.31, 0.34, 1.15, 14).rotateX(Math.PI / 2), at(0, 1.0, 0).multiply(matrix(0, 0, 0, 0, 0.85, 1, 1)));
  b.add(coat, new THREE.SphereGeometry(0.33, 14, 10), at(0, 1.02, -0.58).multiply(matrix(0, 0, 0, 0, 0.85, 0.95, 0.9)));
  b.add('deerPale', new THREE.SphereGeometry(0.31, 14, 10), at(0, 1.0, 0.56).multiply(matrix(0, 0, 0, 0, 0.82, 0.92, 0.8)));
  b.add('deerPale', new THREE.SphereGeometry(0.07, 8, 6), at(0, 1.12, 0.86)); // tail
  for (const [lx, lz] of [[-0.17, -0.55], [0.17, -0.55], [-0.17, 0.52], [0.17, 0.52]]) {
    const swing = (R() - 0.5) * 0.12;
    limb(coat, [lx, 0.86, lz], [lx, 0.42, lz + swing], 0.07, 0.05);
    limb('deerPale', [lx, 0.42, lz + swing], [lx, 0.07, lz + swing * 1.5], 0.04, 0.035);
    b.add('deerDark', new THREE.CylinderGeometry(0.045, 0.055, 0.08, 8), at(lx, 0.04, lz + swing * 1.5));
  }
  // Neck and head, raised or grazing.
  const graze = o.graze ?? R() < 0.4;
  const neckTop = graze ? [0, 0.62, -1.1] : [0, 1.55, -0.95];
  limb('deerPale', [0, 1.1, -0.62], neckTop, 0.2, 0.12);
  const nose = graze ? [0, 0.22, -1.3] : [0, 1.5, -1.38];
  limb(coat, neckTop, nose, 0.12, 0.07);
  b.add('deerDark', new THREE.SphereGeometry(0.055, 8, 6), matrix(...P(...nose).toArray()));
  const [hx, hy, hz] = neckTop;
  for (const side of [-1, 1]) {
    limb(coat, [hx + side * 0.07, hy + 0.06, hz + 0.02], [hx + side * 0.2, hy + 0.12, hz + 0.05], 0.035, 0.015); // ear
    // Antler: a main beam sweeping up and back, with three tines.
    const a0 = [hx + side * 0.06, hy + 0.08, hz];
    const a1 = [hx + side * 0.22, hy + 0.38, hz + 0.12];
    const a2 = [hx + side * 0.3, hy + 0.68, hz + 0.02];
    const a3 = [hx + side * 0.24, hy + 0.9, hz - 0.12];
    limb('antler', a0, a1, 0.032, 0.026);
    limb('antler', a1, a2, 0.026, 0.02);
    limb('antler', a2, a3, 0.02, 0.012);
    limb('antler', a1, [a1[0] + side * 0.02, a1[1] + 0.12, a1[2] - 0.22], 0.016, 0.008);
    limb('antler', a2, [a2[0] + side * 0.16, a2[1] + 0.14, a2[2] + 0.04], 0.015, 0.008);
    limb('antler', a2, [a2[0] - side * 0.04, a2[1] + 0.16, a2[2] - 0.12], 0.014, 0.007);
  }
}

// A wooden reindeer sled on two runners, facing -z.
export function sled(b, x, z, ry) {
  const m = matrix(x, 0, z, ry);
  const at = (px, py, pz) => m.clone().multiply(matrix(px, py, pz));
  for (const sx of [-0.45, 0.45]) b.add('timberDark', new THREE.BoxGeometry(0.06, 0.06, 2.2), at(sx, 0.06, 0));
  b.add('timber', new THREE.BoxGeometry(1.0, 0.35, 1.6), at(0, 0.35, 0.1));
  b.add('fabric', new THREE.BoxGeometry(0.9, 0.12, 1.1), at(0, 0.58, 0.25)); // reindeer-fur blanket
  b.add('timber', new THREE.BoxGeometry(1.0, 0.5, 0.08), at(0, 0.75, 0.88));
}

// People along a sidewalk from (x1, z1) to (x2, z2): walking both ways, some in pairs, some
// stopped to look in a window.
export function crowd(b, x1, z1, x2, z2, n, width = 2.4) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(x2 - x1, z2 - z1);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  for (let i = 0; i < n; i++) {
    const t = R() * len;
    const off = (R() - 0.5) * width;
    const px = x1 + ux * t + uz * off;
    const pz = z1 + uz * t - ux * off;
    const dir = R() < 0.5 ? ang : ang + Math.PI;
    const still = R() < 0.15;
    person(b, px, pz, still ? dir + (R() - 0.5) * 2 : dir + Math.PI + (R() - 0.5) * 0.2, { still });
    if (R() < 0.3) person(b, px + uz * 0.6, pz - ux * 0.6, dir + Math.PI, { still });
  }
}

export function bench(b, x, z, ry) {
  const m = matrix(x, 0, z, ry);
  b.add('timber', new THREE.BoxGeometry(1.8, 0.1, 0.5), m.clone().multiply(matrix(0, 0.45, 0)));
  b.add('timber', new THREE.BoxGeometry(1.8, 0.4, 0.06), m.clone().multiply(matrix(0, 0.75, 0.24)));
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
