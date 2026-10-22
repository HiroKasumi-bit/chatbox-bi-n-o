// Mount Aurora: a 35 m Ama Dablam-style peak with a long eastern shoulder, a hanging glacier,
// the four-level spa stepping out of its north face, the Aurora Eye, the North Portal and the
// Aurora Lagoon.
import * as THREE from 'three';
import { matrix, noise2D, fbm, rng } from './util.js';
import { materials } from './materials.js';
import { MOUNT } from './layout.js';
import { pine, lamp, bench } from './kit.js';

const R = rng(35);

function heightAt(lx, lz, n) {
  const H = MOUNT.height;
  // Summit sits a little south of the centre, so the north face facing the city is longer.
  const sx = 0;
  const sz = 10;
  const dx = (lx - sx) * 1.05;
  const dz = lz - sz;
  const r = Math.hypot(dx, dz);
  const peak = H * Math.pow(Math.max(0, 1 - r / 26), 1.05);
  // Long eastern ridge and a shorter western one.
  const ridge = (dirX, len, endH, width) => {
    const side = (lx - sx) * dirX;
    if (side <= 0) return 0; // each ridge only runs out on its own side
    const t = Math.min(1, side / len);
    const along = H * Math.pow(1 - t, 1.6) * (1 - endH) + endH * H * (1 - t);
    const off = Math.abs(dz + t * 4);
    return along * Math.max(0, 1 - off / (width * (1 - t * 0.4)));
  };
  const east = ridge(1, 52, 0.1, 13);
  const west = ridge(-1, 34, 0.06, 11);
  const skirt = 6 * Math.pow(Math.max(0, 1 - Math.hypot(lx * 0.9, lz + 2) / 60), 1.8);
  let h = Math.max(peak, east * 0.86, west * 0.8, skirt);
  // Rocky facets, stronger higher up.
  h += (fbm(n, lx / 7, lz / 7, 3) - 0.5) * 4.0 * Math.min(1, h / 10);
  // A notch in the north face where the spa terraces step out (see the levels below).
  if (Math.abs(lx) < 16 && lz < -14) {
    const steps = [[-30, 0], [-26.6, 4.75], [-23.2, 9.25], [-19.8, 13.75], [-16.4, 18.25]];
    let cap = 0;
    for (const [front, top] of steps) if (lz >= front) cap = top - 0.4;
    h = Math.min(h, Math.max(0, cap));
  }
  // Keep the lagoon basin flat.
  if (lx > 20 && lx < 48 && lz > -58 && lz < -32) h = 0;
  return Math.max(0, h);
}

export function mountAurora(b) {
  const n = noise2D(81);
  const size = 150;
  const seg = 110;
  const g = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i), n));
  const geo = g.toNonIndexed();
  geo.computeVertexNormals();
  // Colour each face: rock where it is steep, snow where it is not.
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const a = new THREE.Vector3();
  const bb = new THREE.Vector3();
  const c = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const rock = new THREE.Color(0x667386);
  const rock2 = new THREE.Color(0x515d6e);
  const snow = new THREE.Color(0xf4f7fb);
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    bb.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    nrm.subVectors(c, bb).cross(new THREE.Vector3().subVectors(a, bb)).normalize();
    const hy = (a.y + bb.y + c.y) / 3;
    const steep = 1 - Math.abs(nrm.y);
    let col;
    if (hy < 0.2) col = snow;
    else if (steep > 0.5 - Math.min(0.15, hy / 200)) col = tmp.copy(rock).lerp(rock2, R());
    else col = tmp.copy(snow).offsetHSL(0, 0, -R() * 0.03);
    for (let k = 0; k < 3; k++) colors.set([col.r, col.g, col.b], (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, materials.rock);
  mesh.position.set(MOUNT.x, 0, MOUNT.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'mountAurora';

  const X = MOUNT.x;
  const Z = MOUNT.z;
  // Hanging glacier, the blue-ice "Aurora Pendant", just under the summit on the north face.
  b.add('ice', new THREE.DodecahedronGeometry(3, 0), matrix(X + 3, 25.5, Z - 6, 0.4, 1.6, 0.55, 1.0));
  b.add('ice', new THREE.DodecahedronGeometry(2, 0), matrix(X + 6, 23.2, Z - 7.5, 1.1, 1.4, 0.5, 0.9));

  // The spa steps out of the north face: four levels at 0, 4.5, 9 and 13.5 m.
  const face = Z - 30; // front of the lowest level
  const levels = [
    [0, 30, 14],
    [4.5, 24, 12],
    [9, 18, 11],
    [13.5, 12, 10],
  ];
  levels.forEach(([y, w, d], i) => {
    const fz = face + i * 3.4;
    b.add('stone', new THREE.BoxGeometry(w, 4.5, d), matrix(X, y + 2.25, fz + d / 2));
    b.add('glassWarm', new THREE.BoxGeometry(w - 2, 3.2, 0.3), matrix(X, y + 2.1, fz - 0.05));
    b.add('snowRoof', new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), matrix(X, y + 4.75, fz + d / 2));
    for (let k = -2; k <= 2; k++) b.add('timberDark', new THREE.BoxGeometry(0.35, 3.4, 0.4), matrix(X + k * ((w - 2) / 5), y + 2.1, fz - 0.15));
  });
  // The Aurora Eye: a heated glass bubble in the city-facing snow face.
  b.add('glassWarm', new THREE.SphereGeometry(2.6, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), matrix(X + 10, 15.6, face + 14));

  // North Portal: a timber entrance grotto, a heated forecourt and a drop-off loop.
  b.add('timber', new THREE.BoxGeometry(10, 6, 5), matrix(X, 3, face - 2.5));
  b.add('snowRoof', new THREE.BoxGeometry(12, 0.7, 7), matrix(X, 6.35, face - 2.5));
  b.add('glassWarm', new THREE.BoxGeometry(4, 3.4, 0.3), matrix(X, 1.7, face - 5.1));
  b.add('plaza', new THREE.CylinderGeometry(10, 10, 0.25, 40), matrix(X, 0.12, face - 14));
  b.add('snowBank', new THREE.CylinderGeometry(4, 4, 0.6, 30), matrix(X, 0.3, face - 14));
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    lamp(b, X + Math.cos(ang) * 10.5, face - 14 + Math.sin(ang) * 10.5, 4);
  }

  // Aurora Lagoon: a 38 °C open-air mineral pool at the north-east foot, with larch decks.
  const lx = X + 34;
  const lz = Z - 46;
  b.add('stone', new THREE.BoxGeometry(24, 0.6, 14), matrix(lx, 0.3, lz));
  b.add('stone', new THREE.BoxGeometry(12, 0.6, 24), matrix(lx + 2, 0.3, lz + 2));
  b.add('water', new THREE.BoxGeometry(22, 0.5, 12), matrix(lx, 0.4, lz));
  b.add('water', new THREE.BoxGeometry(10, 0.5, 22), matrix(lx + 2, 0.4, lz + 2));
  b.add('timber', new THREE.BoxGeometry(4, 0.35, 16), matrix(lx - 14, 0.2, lz + 3));
  b.add('timber', new THREE.BoxGeometry(14, 0.35, 3), matrix(lx - 6, 0.2, lz + 12));
  for (let i = 0; i < 4; i++) lamp(b, lx - 13 + i * 9, lz - 8.5, 3.5);

  // Foothill pines and the Aurora Snow Garden Park on the west side.
  for (let i = 0; i < 70; i++) {
    const ang = R() * Math.PI * 2;
    const rr = 58 + R() * 22;
    const px = X + Math.cos(ang) * rr * 1.1;
    const pz = Z + Math.sin(ang) * rr;
    if (pz < Z - 40 && Math.abs(px - X) < 22) continue; // keep the portal approach open
    if (px > lx - 16 && px < lx + 18 && pz > lz - 12 && pz < lz + 18) continue;
    pine(b, px, pz, 0.8 + R() * 0.5);
  }
  for (let i = 0; i < 6; i++) bench(b, X - 52 + (i % 3) * 6, Z - 46 + Math.floor(i / 3) * 6, R() * Math.PI);
  for (let i = 0; i < 5; i++) lamp(b, X - 60 + i * 5, Z - 52, 3.8);
  return mesh;
}

export const SPA_FACE_Z = MOUNT.z - 30;
