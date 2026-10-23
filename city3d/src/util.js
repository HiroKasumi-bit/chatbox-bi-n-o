// Small helpers shared by the city builders: seeded random numbers, smooth noise, and a
// Batch that collects many small geometries per material and merges them into one mesh,
// so the whole city renders in a few hundred draw calls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D value noise with smooth interpolation, in [0, 1].
export function noise2D(seed) {
  const r = rng(seed);
  const N = 256;
  const v = new Float32Array(N * N).map(() => r());
  const at = (i, j) => v[(((i % N) + N) % N) * N + (((j % N) + N) % N)];
  return function (x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * ux;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * ux;
    return a + (b - a) * uy;
  };
}

export function fbm(noise, x, y, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return sum / (1 - Math.pow(0.5, octaves));
}

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();

// Rotations apply as z, then x (tilt), then y (heading), so a shape can be tilted and then turned.
export function matrix(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) {
  tmpE.set(rx, ry, rz, 'YXZ');
  tmpQ.setFromEuler(tmpE);
  tmpP.set(x, y, z);
  tmpS.set(sx, sy, sz);
  return tmpM.clone().compose(tmpP, tmpQ, tmpS);
}

// Every geometry going into a batch gets the same attribute set: position, normal, uv.
function normalise(g) {
  let geo = g.index ? g.toNonIndexed() : g;
  if (!geo.attributes.uv) {
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  }
  if (!geo.attributes.normal) geo.computeVertexNormals();
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
  geo.clearGroups();
  return geo;
}

export class Batch {
  constructor() {
    this.parts = new Map();
  }

  add(key, geometry, m) {
    const g = normalise(geometry.clone());
    if (m) g.applyMatrix4(m);
    if (!this.parts.has(key)) this.parts.set(key, []);
    this.parts.get(key).push(g);
    return this;
  }

  box(key, x, y, z, w, h, d, ry = 0) {
    return this.add(key, new THREE.BoxGeometry(w, h, d), matrix(x, y + h / 2, z, ry));
  }

  cyl(key, x, y, z, rTop, rBottom, h, seg = 16, ry = 0) {
    return this.add(key, new THREE.CylinderGeometry(rTop, rBottom, h, seg), matrix(x, y + h / 2, z, ry));
  }

  // Merges each material's parts into one mesh. `materials` maps key -> material.
  build(materials, opts = {}) {
    const group = new THREE.Group();
    for (const [key, list] of this.parts) {
      const mat = materials[key];
      if (!mat) throw new Error(`No material for "${key}"`);
      // Merge in chunks so no single buffer gets too large.
      for (let i = 0; i < list.length; i += 4000) {
        const merged = mergeGeometries(list.slice(i, i + 4000), false);
        const mesh = new THREE.Mesh(merged, mat);
        mesh.castShadow = opts.castShadow ?? !mat.transparent;
        mesh.receiveShadow = opts.receiveShadow ?? true;
        mesh.name = key;
        mesh.userData.batchKey = key;
        group.add(mesh);
      }
    }
    return group;
  }
}

// A box split into its four walls and its roof, with wall UVs measured in window bays and
// floors, so one repeating facade texture fits every building. Offsets vary the pattern.
export function boxWalls(w, h, d, bay, floor, ou = 0, ov = 0) {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const walls = [];
  const roof = [];
  // Face order in BoxGeometry: +x, -x, +y, -y, +z, -z; six vertices each once non-indexed.
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 6; k++) {
      const i = f * 6 + k;
      if (f === 2 || f === 3) {
        if (f === 2) roof.push(i);
        continue;
      }
      const span = f < 2 ? d : w;
      uv.setXY(i, uv.getX(i) * (span / bay) + ou, uv.getY(i) * (h / floor) + ov);
      walls.push(i);
    }
  }
  const pick = (idx) => {
    const out = new THREE.BufferGeometry();
    const p = new Float32Array(idx.length * 3);
    const n = new Float32Array(idx.length * 3);
    const t = new Float32Array(idx.length * 2);
    idx.forEach((i, j) => {
      p.set([pos.getX(i), pos.getY(i), pos.getZ(i)], j * 3);
      n.set([g.attributes.normal.getX(i), g.attributes.normal.getY(i), g.attributes.normal.getZ(i)], j * 3);
      t.set([uv.getX(i), uv.getY(i)], j * 2);
    });
    out.setAttribute('position', new THREE.BufferAttribute(p, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(n, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(t, 2));
    return out;
  };
  return { walls: pick(walls), roof: pick(roof) };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
