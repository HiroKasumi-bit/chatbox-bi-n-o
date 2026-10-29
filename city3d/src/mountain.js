// Mount Aurora: a 35 m Ama Dablam-style peak with a long eastern shoulder, a hanging glacier,
// the four-level spa stepping out of its north face, the Aurora Eye, the North Portal and the
// Aurora Lagoon.
import * as THREE from 'three';
import { matrix, noise2D, fbm, rng } from './util.js';
import { materials } from './materials.js';
import { MOUNT } from './layout.js';
import { pine, lamp, bench, person, bather } from './kit.js';
import { addPool } from './lights.js';

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
  // Rocky facets, stronger higher up, with finer ribs and flutings on the steep faces.
  h += (fbm(n, lx / 7, lz / 7, 3) - 0.5) * 4.0 * Math.min(1, h / 10);
  h += (fbm(n, lx / 2.2 + 30, lz / 2.2, 2) - 0.5) * 1.2 * Math.min(1, h / 14);
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
  const seg = 190;
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
  const rock = new THREE.Color(0x4d535c);
  const rock2 = new THREE.Color(0x3a3e45);
  const snow = new THREE.Color(0xf4f7fb);
  const tmp = new THREE.Color();
  const cn = noise2D(82);
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    bb.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    nrm.subVectors(c, bb).cross(new THREE.Vector3().subVectors(a, bb)).normalize();
    const hy = (a.y + bb.y + c.y) / 3;
    const steep = 1 - Math.abs(nrm.y);
    let col;
    // Snow clings where the slope allows; the edge between snow and rock is broken up by noise.
    const edge = 0.52 - Math.min(0.16, hy / 180) + (cn(a.x / 4, a.z / 4) - 0.5) * 0.22;
    if (hy < 0.2) col = snow;
    else if (steep > edge) col = tmp.copy(rock).lerp(rock2, R()).lerp(snow, Math.max(0, 0.35 - (steep - edge) * 2) * R());
    else col = tmp.copy(snow).offsetHSL(0, 0, -R() * 0.035 - (steep > edge - 0.08 ? 0.04 : 0));
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
  // Draped over the slope as broken seracs, half sunk into the snow.
  for (let k = 0; k < 18; k++) {
    const lx = 1 + R() * 7;
    const lz = -5 - R() * 5;
    const r = 0.6 + R() * 0.9;
    b.add('ice', new THREE.IcosahedronGeometry(r, 0), matrix(X + lx, heightAt(lx, lz, n) - r * 0.25, Z + lz, R() * 6, 1.4, 0.7, 1.0, R() * 0.5));
  }

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
    // Glazed front: tall panes in dark frames, a transom, larch fins at the ends.
    const pane = new THREE.PlaneGeometry(w - 2, 3.3);
    const uv = pane.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * ((w - 2) / 16) + i * 0.37);
    b.add('spaGlass', pane, matrix(X, y + 2.05, fz - 0.06, Math.PI));
    b.add('stone', new THREE.BoxGeometry(w - 2, 3.3, 0.2), matrix(X, y + 2.05, fz + 0.06));
    const panes = Math.round((w - 2) / 1.6);
    for (let k = 0; k <= panes; k++) b.add('metalDark', new THREE.BoxGeometry(0.1, 3.3, 0.16), matrix(X - (w - 2) / 2 + (k * (w - 2)) / panes, y + 2.05, fz - 0.16));
    b.add('metalDark', new THREE.BoxGeometry(w - 2, 0.1, 0.16), matrix(X, y + 2.9, fz - 0.16));
    b.add('metalDark', new THREE.BoxGeometry(w - 1.6, 0.25, 0.3), matrix(X, y + 0.35, fz - 0.15));
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) b.add('timber', new THREE.BoxGeometry(0.16, 3.6, 0.7), matrix(X + s * ((w - 2) / 2 + 0.3 + k * 0.32), y + 2.2, fz + 0.2));
    // Roof terrace: snow, a glass balustrade and its handrail.
    b.add('snowRoof', new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), matrix(X, y + 4.75, fz + d / 2));
    if (i < 3) {
      b.add('glass', new THREE.BoxGeometry(w - 1, 1.0, 0.06), matrix(X, y + 5.5, fz + 0.15));
      b.add('metal', new THREE.BoxGeometry(w - 1, 0.06, 0.1), matrix(X, y + 6.02, fz + 0.15));
    }
    // Warm light from the glass on the snow in front.
    addPool('spill', X, fz - 0.3, w - 2, 7, Math.PI, 0xffbf80, y + 0.06);
  });
  // Guests on the terraces.
  for (const [px, py, pz] of [[-6, 5, face + 1.4], [-4.8, 5, face + 1.6], [5, 9.5, face + 4.7], [-2, 14, face + 8.2], [2.6, 14, face + 8.0]]) {
    person(b, X + px, pz, Math.PI + (R() - 0.5), { y: py, still: true });
  }
  // The Aurora Eye: a heated glass dome crowning the Summit Sanctuary (level 4), so the stepped
  // spa ends in one lit lantern. A ribbed steel frame over warm-lit glass, on a stone ring.
  const top = levels[3];
  const eye = [X, top[0] + 5.0, face + 3 * 3.4 + top[2] / 2];
  const er = 3.4;
  b.add('stone', new THREE.CylinderGeometry(er + 0.35, er + 0.5, 0.5, 32), matrix(eye[0], eye[1] - 0.25, eye[2]));
  b.add('glassWarm', new THREE.SphereGeometry(er - 0.25, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), matrix(...eye));
  b.add('eyeGlass', new THREE.SphereGeometry(er, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), matrix(...eye));
  for (let k = 0; k < 6; k++) b.add('metalDark', new THREE.TorusGeometry(er + 0.02, 0.06, 4, 32, Math.PI), matrix(...eye, (k / 6) * Math.PI));
  b.add('metalDark', new THREE.TorusGeometry(er * 0.72, 0.05, 4, 32), matrix(eye[0], eye[1] + er * 0.69, eye[2], 0, 1, 1, 1, Math.PI / 2));
  b.add('metalDark', new THREE.TorusGeometry(er + 0.05, 0.09, 4, 40), matrix(eye[0], eye[1] + 0.05, eye[2], 0, 1, 1, 1, Math.PI / 2));

  // North Portal: a timber entrance grotto, a heated forecourt and a drop-off loop.
  b.add('timber', new THREE.BoxGeometry(10, 6, 5), matrix(X, 3, face - 2.5));
  for (let k = 0; k < 24; k++) b.add('timberDark', new THREE.BoxGeometry(0.14, 6, 0.12), matrix(X - 4.9 + k * 0.426, 3, face - 5.05));
  b.add('snowRoof', new THREE.BoxGeometry(12, 0.7, 7), matrix(X, 6.35, face - 2.5));
  b.add('metalDark', new THREE.BoxGeometry(5.2, 3.9, 0.2), matrix(X, 1.95, face - 5.1));
  const door = new THREE.PlaneGeometry(4.6, 3.5);
  b.add('spaGlass', door, matrix(X, 1.75, face - 5.22, Math.PI));
  b.add('metalDark', new THREE.BoxGeometry(0.1, 3.5, 0.1), matrix(X, 1.75, face - 5.25));
  b.add('metalDark', new THREE.BoxGeometry(6.5, 0.2, 2.2), matrix(X, 4.2, face - 6.1));
  b.add('snowRoof', new THREE.BoxGeometry(6.4, 0.12, 2.1), matrix(X, 4.36, face - 6.1));
  addPool('spill', X, face - 5.3, 6, 8, Math.PI, 0xffc080, 0.3);
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
  b.add('poolWater', new THREE.BoxGeometry(22, 0.5, 12), matrix(lx, 0.4, lz));
  b.add('poolWater', new THREE.BoxGeometry(10, 0.5, 22), matrix(lx + 2, 0.4, lz + 2));
  b.add('timber', new THREE.BoxGeometry(4, 0.35, 16), matrix(lx - 14, 0.2, lz + 3));
  b.add('timber', new THREE.BoxGeometry(14, 0.35, 3), matrix(lx - 6, 0.2, lz + 12));
  for (let i = 0; i < 4; i++) lamp(b, lx - 13 + i * 9, lz - 8.5, 3.5);
  // Bathers in the warm water, and guests in robes on the boardwalks.
  for (let i = 0; i < 14; i++) {
    const inArm = R() < 0.6;
    const bx = inArm ? lx + (R() - 0.5) * 20 : lx + 2 + (R() - 0.5) * 8;
    const bz = inArm ? lz + (R() - 0.5) * 10 : lz + 2 + (R() - 0.5) * 20;
    bather(b, bx, bz, R() * Math.PI * 2, 0.62);
  }
  for (let i = 0; i < 4; i++) person(b, lx - 14 + (R() - 0.5) * 2, lz - 3 + i * 3.5, R() * Math.PI * 2, { coat: 'coatWhite', y: 0.38, still: R() < 0.5 });
  // People walking up to the North Portal.
  for (let i = 0; i < 10; i++) person(b, X + (R() - 0.5) * 8, face - 18 - R() * 14, R() < 0.6 ? 0 : Math.PI);

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
