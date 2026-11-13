// Life on the streets: cars that drive round the downtown loops and out along the avenues, and people who
// walk the sidewalks and plazas. Both are instanced (one draw call per part), so a few hundred cost little.
import * as THREE from 'three';
import { materials, CAR_PAINTS, COATS } from '../src/materials.js';
import { carGeometry } from '../src/kit.js';

const RING = 120, INNER = 36;
// Closed routes. Cars keep to the right; an out-and-back route turns round at its far end.
const ROUTES = [
  { pts: [[-RING, -RING], [RING, -RING], [RING, RING], [-RING, RING]], cars: 6, v: 9 },
  { pts: [[-RING, -RING], [-RING, RING], [RING, RING], [RING, -RING]], cars: 6, v: 9 },
  { pts: [[-INNER, -INNER], [INNER, -INNER], [INNER, INNER], [-INNER, INNER]], cars: 3, v: 7 },
  { pts: [[-INNER, -INNER], [-INNER, INNER], [INNER, INNER], [INNER, -INNER]], cars: 3, v: 7 },
  { pts: [[127, 0], [352, 0]], cars: 3, v: 11 },          // Glacier Avenue east
  { pts: [[0, -127], [0, -206]], cars: 2, v: 10 },         // Aurora Avenue north
  { pts: [[-127, 0], [-256, 0]], cars: 2, v: 10 },         // west to the eco-homes
  { pts: [[135, -146], [135, 276]], cars: 3, v: 11 },      // Industry Park Avenue
  { pts: [[14, -150], [294, -150]], cars: 3, v: 11 },      // airport road
];
const LANE = 2.2;

function buildPath(pts) {
  // each segment pushed to the right of its direction, joined by short diagonals at the corners
  const segs = [], out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    const rx = -dz / L * LANE, rz = dx / L * LANE; // right of travel (x east, z south)
    const trim = pts.length > 2 ? LANE + 1.5 : 0;
    segs.push([[a[0] + rx + dx / L * trim, a[1] + rz + dz / L * trim], [b[0] + rx - dx / L * trim, b[1] + rz - dz / L * trim]]);
  }
  for (const s of segs) out.push(s[0], s[1]);
  const cum = [0];
  for (let i = 1; i <= out.length; i++) { const a = out[i - 1], b = out[i % out.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  return { pts: out, cum, len: cum[cum.length - 1] };
}
function at(path, s, o) {
  s = ((s % path.len) + path.len) % path.len;
  let i = 0; while (path.cum[i + 1] < s) i++;
  const a = path.pts[i], b = path.pts[(i + 1) % path.pts.length], L = path.cum[i + 1] - path.cum[i], t = L > 0 ? (s - path.cum[i]) / L : 0;
  o.x = a[0] + (b[0] - a[0]) * t; o.z = a[1] + (b[1] - a[1]) * t; o.dx = b[0] - a[0]; o.dz = b[1] - a[1];
  return o;
}

const PART = {
  leg: new THREE.CylinderGeometry(0.075, 0.062, 0.8, 6).translate(0, -0.4, 0),
  boot: new THREE.BoxGeometry(0.13, 0.11, 0.26),
  coat: new THREE.CylinderGeometry(0.2, 0.27, 0.86, 9),
  shoulders: new THREE.SphereGeometry(0.22, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2),
  arm: new THREE.CylinderGeometry(0.062, 0.055, 0.64, 6).translate(0, -0.32, 0),
  scarf: new THREE.CylinderGeometry(0.085, 0.11, 0.12, 8),
  head: new THREE.SphereGeometry(0.11, 10, 8),
  hat: new THREE.SphereGeometry(0.122, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
};

export function createAgents(scene, hm, isRoad, isWater) {
  const rnd = (() => { let a = 12345; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
  const M = new THREE.Matrix4(), T = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3(), C = new THREE.Color();
  const local = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { E.set(rx, ry, rz, 'YXZ'); Q.setFromEuler(E); P.set(x, y, z); S.set(sx, sy, sz); return new THREE.Matrix4().compose(P, Q, S); };

  // ── cars ──
  const g = carGeometry();
  const paint = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.45 });
  const cars = [];
  ROUTES.forEach((r) => { const path = buildPath(r.pts); for (let k = 0; k < r.cars; k++) cars.push({ path, s: path.len * k / r.cars + rnd() * 6, v: r.v * (0.9 + rnd() * 0.2), cur: 0, route: r }); });
  const NC = cars.length;
  const cBody = inst(g.body, paint, NC), cRoof = inst(g.roof, paint, NC), cCab = inst(g.cabin, materials.carGlass, NC);
  const cWheel = inst(g.wheel, materials.tyre, NC * 4), cHead = inst(new THREE.BoxGeometry(0.42, 0.12, 0.08), materials.headlight, NC * 2), cTail = inst(new THREE.BoxGeometry(0.4, 0.12, 0.06), materials.taillight, NC * 2);
  cars.forEach((c, i) => { C.copy(materials[CAR_PAINTS[i % CAR_PAINTS.length]].color); cBody.setColorAt(i, C); cRoof.setColorAt(i, C); });
  const WHEELS = [[-0.82, -1.38], [0.82, -1.38], [-0.82, 1.4], [0.82, 1.4]].map(([x, z]) => local(x, 0.33, z));
  const HEADS = [-1, 1].map((s) => local(s * 0.6, 0.78, -2.2)), TAILS = [-1, 1].map((s) => local(s * 0.62, 0.86, 2.27));
  const tmp = {};

  // ── people ──
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const wool = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  const walkable = (x, z) => { const h = hm.at(x, z); return h < 0.45 && h > -0.4 && !isRoad(x, z) && !isWater(x, z); };
  const AREAS = [[-125, -125, 125, 125, 110], [-12, 128, 12, 196, 18], [215, -125, 345, 5, 12], [-245, -115, -145, 115, 12], [120, -115, 205, -15, 8]];
  const people = [];
  for (const [x0, z0, x1, z1, n] of AREAS) {
    for (let k = 0, tries = 0; k < n && tries < n * 60; tries++) {
      const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
      if (!walkable(x, z) || !walkable(x + 1, z) || !walkable(x - 1, z) || !walkable(x, z + 1) || !walkable(x, z - 1)) continue;
      people.push({ x, z, yaw: rnd() * Math.PI * 2, v: 1.05 + rnd() * 0.5, ph: rnd() * 6, wait: rnd() < 0.2 ? rnd() * 3 : 0, turnT: 2 + rnd() * 6, s: 0.92 + rnd() * 0.14 });
      k++;
    }
  }
  const NP = people.length;
  const pLeg = inst(PART.leg, materials.trousers, NP * 2), pBoot = inst(PART.boot, materials.trousers, NP * 2), pArm = inst(PART.arm, coatMat, NP * 2);
  const pCoat = inst(PART.coat, coatMat, NP), pSh = inst(PART.shoulders, coatMat, NP), pScarf = inst(PART.scarf, wool, NP), pHead = inst(PART.head, materials.skin, NP), pHat = inst(PART.hat, wool, NP);
  people.forEach((p, i) => {
    C.copy(materials[COATS[Math.floor(rnd() * COATS.length)]].color); pCoat.setColorAt(i, C); pSh.setColorAt(i, C); pArm.setColorAt(i * 2, C); pArm.setColorAt(i * 2 + 1, C);
    C.copy(materials[COATS[Math.floor(rnd() * COATS.length)]].color); pScarf.setColorAt(i, C);
    C.copy(rnd() < 0.35 ? materials.hatWool.color : materials[COATS[Math.floor(rnd() * COATS.length)]].color); pHat.setColorAt(i, C);
  });
  const COAT = local(0, 1.12, 0, 0, 0, 0, 1, 1, 0.78), SH = local(0, 1.54, 0, 0, 0, 0, 1, 0.45, 0.78), SCARF = local(0, 1.6, 0), HEAD = local(0, 1.73, 0), HAT = local(0, 1.75, 0), BOOT = local(0, -0.78, 0.04);

  function update(dt, player, inside, extra) {
    // cars: keep a gap to the car ahead on the same route, and stop for the player (and the player's parked car)
    for (const c of cars) {
      at(c.path, c.s, tmp); const L = Math.hypot(tmp.dx, tmp.dz) || 1, fx = tmp.dx / L, fz = tmp.dz / L;
      let want = c.v;
      const stopFor = (q, w) => { const px = q.x - tmp.x, pz = q.z - tmp.z, ahead = px * fx + pz * fz, side = Math.abs(-px * fz + pz * fx); if (ahead > 0 && ahead < 9 && side < w) want = 0; };
      if (!inside) stopFor(player, 1.8);
      if (extra) stopFor(extra, 1.7);
      for (const o of cars) if (o !== c && o.route === c.route) { let gap = o.s - c.s; if (gap < 0) gap += c.path.len; if (gap < 8) want = 0; else if (gap < 14) want = Math.min(want, o.cur); }
      c.cur += (want - c.cur) * Math.min(1, dt * (want < c.cur ? 5 : 1.5)); c.s += c.cur * dt;
      c.x = tmp.x; c.z = tmp.z; c.fx = fx; c.fz = fz;
    }
    cars.forEach((c, i) => {
      E.set(0, Math.atan2(-c.fx, -c.fz), 0); Q.setFromEuler(E); P.set(c.x, 0.04, c.z); S.set(1, 1, 1); M.compose(P, Q, S);
      cBody.setMatrixAt(i, M); cRoof.setMatrixAt(i, M); cCab.setMatrixAt(i, M);
      WHEELS.forEach((w, k) => cWheel.setMatrixAt(i * 4 + k, T.multiplyMatrices(M, w)));
      HEADS.forEach((w, k) => cHead.setMatrixAt(i * 2 + k, T.multiplyMatrices(M, w)));
      TAILS.forEach((w, k) => cTail.setMatrixAt(i * 2 + k, T.multiplyMatrices(M, w)));
    });
    for (const m of [cBody, cRoof, cCab, cWheel, cHead, cTail]) m.instanceMatrix.needsUpdate = true;
    // people: walk, turn away from kerbs, walls and the player, stop now and then
    people.forEach((p, i) => {
      let moving = false;
      if (p.wait > 0) p.wait -= dt;
      else {
        const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw), h0 = hm.at(p.x, p.z);
        const nx = p.x + fx * 0.9, nz = p.z + fz * 0.9;
        const near = !inside && Math.hypot(player.x - nx, player.z - nz) < 1.1;
        if (!walkable(nx, nz) || Math.abs(hm.at(nx, nz) - h0) > 0.25 || near) { p.yaw += (Math.PI * 0.5 + rnd() * Math.PI) * (rnd() < 0.5 ? 1 : -1); if (rnd() < 0.3) p.wait = 0.5 + rnd() * 1.5; }
        else { p.x += fx * p.v * dt; p.z += fz * p.v * dt; moving = true; }
        p.turnT -= dt; if (p.turnT <= 0) { p.turnT = 3 + rnd() * 7; p.yaw += (rnd() - 0.5) * 1.2; if (rnd() < 0.15) p.wait = 1 + rnd() * 3; }
      }
      if (moving) p.ph += dt * p.v * 3.4;
      const sw = moving ? Math.sin(p.ph) * 0.5 : 0;
      E.set(0, p.yaw, 0); Q.setFromEuler(E); P.set(p.x, hm.at(p.x, p.z), p.z); S.set(p.s, p.s, p.s); M.compose(P, Q, S);
      pCoat.setMatrixAt(i, T.multiplyMatrices(M, COAT)); pSh.setMatrixAt(i, T.multiplyMatrices(M, SH)); pScarf.setMatrixAt(i, T.multiplyMatrices(M, SCARF));
      pHead.setMatrixAt(i, T.multiplyMatrices(M, HEAD)); pHat.setMatrixAt(i, T.multiplyMatrices(M, HAT));
      for (const side of [-1, 1]) {
        const k = i * 2 + (side > 0 ? 1 : 0), leg = new THREE.Matrix4().multiplyMatrices(M, local(side * 0.1, 0.82, 0, sw * side));
        pLeg.setMatrixAt(k, leg); pBoot.setMatrixAt(k, T.multiplyMatrices(leg, BOOT));
        pArm.setMatrixAt(k, T.multiplyMatrices(M, local(side * 0.26, 1.5, 0, -sw * side * 0.8, 0, side * 0.12)));
      }
    });
    for (const m of [pLeg, pBoot, pArm, pCoat, pSh, pScarf, pHead, pHat]) m.instanceMatrix.needsUpdate = true;
  }
  // a car is solid: push the player out sideways
  function pushPlayer(p) {
    for (const c of cars) {
      if (c.x === undefined) continue; const dx = p.x - c.x, dz = p.z - c.z; if (dx * dx + dz * dz > 9) continue;
      const lz = dx * c.fx + dz * c.fz, lx = -dx * c.fz + dz * c.fx;
      if (Math.abs(lz) < 2.5 && Math.abs(lx) < 1.25) { const s = lx >= 0 ? 1 : -1, push = 1.25 - Math.abs(lx); p.x += -c.fz * s * push; p.z += c.fx * s * push; }
    }
  }
  // the player's car: does a point touch a car of the traffic?
  function hitCar(x, z) {
    for (const c of cars) {
      if (c.x === undefined) continue; const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz > 9) continue;
      if (Math.abs(dx * c.fx + dz * c.fz) < 2.4 && Math.abs(-dx * c.fz + dz * c.fx) < 1.05) return true;
    }
    return false;
  }
  // people step out of the way of the player's car
  function clearPeople(x, z, r) {
    for (const p of people) {
      const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz); if (d >= r) continue;
      const k = d > 0.01 ? r / d : 0; p.x = x + (d > 0.01 ? dx * k : r); p.z = z + dz * k; p.wait = 0.6; p.yaw = Math.atan2(dx, dz);
    }
  }
  update(0, { x: 1e9, z: 1e9 }, false);
  return { update, pushPlayer, hitCar, clearPeople, count: { cars: NC, people: NP } };
}
