// The player's own car: park it, get in, drive the city, get out anywhere. Arcade handling: throttle, brake
// (and reverse), steering that tightens at low speed, a handbrake. Roads are fast, snow is slow. Walls, water,
// the slopes of Mount Aurora and the traffic stop it; people step out of its way.
import * as THREE from 'three';
import { materials } from '../src/materials.js';
import { carGeometry } from '../src/kit.js';

const LEN = 2.2, HALF_W = 0.86, WHEELBASE = 2.8;
const fwd = (y) => [Math.sin(y), Math.cos(y)]; // the same yaw as the player: π faces north (−z)

export function createCar(scene, env) {
  // env: { ground(x, z), walk(x, z), water(x, z), road(x, z), mountain(x, z), traffic, rect }
  const g = carGeometry();
  const paint = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.28, metalness: 0.5 }); // the hero's orange
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.name = 'playerCar';
  const add = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; m.userData.noMap = true; parent.add(m); return m; };
  add(body, g.body, paint); add(body, g.roof, paint); add(body, g.cabin, materials.carGlass);
  for (const s of [-1, 1]) { add(body, new THREE.BoxGeometry(0.42, 0.12, 0.08), materials.headlight, s * 0.6, 0.78, -2.2); add(body, new THREE.BoxGeometry(0.4, 0.12, 0.06), materials.taillight, s * 0.62, 0.86, 2.27); }
  // a small roof sign so you can find your car from far away
  add(body, new THREE.BoxGeometry(0.5, 0.16, 0.22), new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x3fe0ff, emissiveIntensity: 2 }), 0, 1.62, -0.45);
  const wheels = [[-0.82, -1.38], [0.82, -1.38], [-0.82, 1.4], [0.82, 1.4]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, 0.33, z); body.add(p); add(p, g.wheel, materials.tyre); return p; });
  const lamp = new THREE.SpotLight(0xfff1d6, 0, 45, 0.5, 0.45, 1.2); lamp.position.set(0, 0.8, -2.3); lamp.target.position.set(0, -0.6, -16); body.add(lamp, lamp.target);
  scene.add(root);

  const S = { on: false, x: 0, z: 0, y: 0, yaw: 0, v: 0, steer: 0, pitch: 0, spin: 0, bump: 0 };
  // the outline of the car, sampled every half metre or so, and the middle of it
  const OUTLINE = [];
  for (let i = 0; i <= 8; i++) { const a = -LEN + i * LEN / 4; OUTLINE.push([a, HALF_W], [a, -HALF_W]); }
  for (const b of [-0.45, 0, 0.45]) OUTLINE.push([LEN + 0.05, b], [-LEN - 0.05, b], [LEN / 2, b], [0, b], [-LEN / 2, b]);
  const WHEELS = [[1.4, 0.82], [1.4, -0.82], [-1.38, 0.82], [-1.38, -0.82]];
  const pts = (x, z, yaw, set = OUTLINE) => { const [fx, fz] = fwd(yaw), rx = -fz, rz = fx; return set.map(([a, b]) => [x + fx * a + rx * b, z + fz * a + rz * b]); };
  // can the car stand here? (y is the height it drives at)
  function free(x, z, yaw, y) {
    const [x0, z0, x1, z1] = env.rect; if (x < x0 + 6 || x > x1 - 6 || z < z0 + 6 || z > z1 - 6) return false;
    for (const [px, pz] of pts(x, z, yaw)) {
      if (env.walk(px, pz) > y + 0.7) return false;              // a wall, a kerb too high, a building
      if (env.water(px, pz)) return false;                        // pools and the lagoon
      if (env.mountain(px, pz) && env.ground(px, pz) > 2.2) return false; // the slopes of Mount Aurora
      if (env.traffic && env.traffic.hitCar(px, pz)) return false;
    }
    return true;
  }
  // the height under the four wheels: the car sits on their middle two, and tilts front to back
  function heightAt(x, z, yaw) { const h = pts(x, z, yaw, WHEELS).map(([px, pz]) => env.walk(px, pz)); const o = [...h].sort((a, b) => a - b); return { y: (o[1] + o[2]) / 2, pitch: Math.atan2((h[0] + h[1]) / 2 - (h[2] + h[3]) / 2, 2.78) }; }
  const place = () => heightAt(S.x, S.z, S.yaw);
  function sync() {
    root.position.set(S.x, S.y + 0.04, S.z); root.rotation.set(0, S.yaw + Math.PI, 0); body.rotation.x = S.pitch;
    wheels.forEach((w, i) => { w.rotation.set(S.spin, 0, 0, 'YXZ'); if (i < 2) w.rotation.y = -S.steer * 0.5; });
  }
  function park(x, z, yaw) { S.x = x; S.z = z; S.yaw = yaw; S.v = 0; S.steer = 0; const p = place(); S.y = p.y; S.pitch = p.pitch; sync(); }
  // a spot with room to drive off: free here, for 8 m straight ahead, a little behind and to each side
  const roomy = (x, z, yaw, y) => { const [fx, fz] = fwd(yaw); return [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [-1.5, 0], [0, 0.6], [0, -0.6]].every(([a, b]) => free(x + fx * a - fz * b, z + fz * a + fx * b, yaw, y)); };
  // the nearest free spot around (x, z), facing yaw, at the height of the street you stand on (refY)
  function parkNear(x, z, yaw, refY, maxR = 30) {
    for (const onRoad of [false, true]) // off the road if there is room, else on it (the traffic waits)
      for (let r = 0; r < maxR; r += 1) for (let k = 0, n = Math.max(1, Math.round(r * 3)); k < n; k++) {
        const a = k / n * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, { y } = heightAt(px, pz, yaw);
        if (Math.abs(y - refY) < 0.8 && (onRoad || !env.road(px, pz)) && roomy(px, pz, yaw, y)) { park(px, pz, yaw); return true; }
      }
    return false;
  }
  const dist = (p) => Math.hypot(p.x - S.x, p.z - S.z);

  // ── driving ──
  function update(dt, inp) {
    if (!S.on) { S.v = 0; return 0; }
    const road = env.road(S.x, S.z), vmax = road ? 30 : 15;
    const thr = inp.throttle, brk = inp.brake;
    if (thr > 0) S.v += (S.v < -0.3 ? 20 : 11 * (1 - Math.max(0, S.v) / vmax)) * thr * dt;
    if (brk > 0) S.v -= (S.v > 0.3 ? 22 : 7) * brk * dt;
    if (S.v < -8) S.v = -8;
    if (!thr && !brk) S.v -= Math.sign(S.v) * Math.min(Math.abs(S.v), (1.2 + Math.abs(S.v) * 0.12) * dt);
    if (inp.handbrake) S.v -= Math.sign(S.v) * Math.min(Math.abs(S.v), 16 * dt);
    if (S.v > vmax) S.v -= (S.v - vmax) * Math.min(1, dt * 2);       // off the road the snow holds you back
    S.steer += (inp.steer - S.steer) * Math.min(1, dt * 7);
    const lock = 0.62 / (1 + Math.abs(S.v) / 14);
    const yawRate = S.v / WHEELBASE * Math.tan(S.steer * lock) * (inp.handbrake ? 1.5 : 1);
    const nyaw = S.yaw - yawRate * dt, [fx, fz] = fwd(nyaw), nx = S.x + fx * S.v * dt, nz = S.z + fz * S.v * dt;
    let hit = false;
    if (free(nx, nz, nyaw, S.y)) { S.x = nx; S.z = nz; S.yaw = nyaw; }
    else if (free(S.x + fx * S.v * dt, S.z, nyaw, S.y)) { S.x += fx * S.v * dt; S.yaw = nyaw; S.v *= 0.9; }
    else if (free(S.x, S.z + fz * S.v * dt, nyaw, S.y)) { S.z += fz * S.v * dt; S.yaw = nyaw; S.v *= 0.9; }
    else { hit = Math.abs(S.v) > 5; S.v = -S.v * 0.2; if (free(S.x, S.z, nyaw, S.y)) S.yaw = nyaw; }
    const p = place(); S.y += (p.y - S.y) * Math.min(1, dt * 10); S.pitch += (p.pitch - S.pitch) * Math.min(1, dt * 8);
    S.spin -= S.v * dt / 0.33;
    if (env.traffic) env.traffic.clearPeople(S.x, S.z, 3.2);
    sync();
    return hit;
  }
  // a parked car is solid: push a walker out of its footprint
  function pushOut(p) {
    const dx = p.x - S.x, dz = p.z - S.z; if (dx * dx + dz * dz > 12) return;
    const [fx, fz] = fwd(S.yaw), lz = dx * fx + dz * fz, lx = -dx * fz + dz * fx, W = HALF_W + 0.45, Lg = LEN + 0.4;
    if (Math.abs(lz) < Lg && Math.abs(lx) < W) {
      if (W - Math.abs(lx) < Lg - Math.abs(lz)) { const s = lx >= 0 ? 1 : -1, d = W - Math.abs(lx); p.x += -fz * s * d; p.z += fx * s * d; }
      else { const s = lz >= 0 ? 1 : -1, d = Lg - Math.abs(lz); p.x += fx * s * d; p.z += fz * s * d; }
    }
  }
  // where the driver steps out: beside the driver's door (the left), or anywhere free around the car
  function door() {
    const [fx, fz] = fwd(S.yaw), lx = fz, lz = -fx;
    for (const [a, b] of [[0.3, 2.0], [0.3, -2.0], [-3.2, 0], [3.2, 0]]) {
      const x = S.x + fx * a + lx * b, z = S.z + fz * a + lz * b; if (env.walk(x, z) < S.y + 0.8 && !env.water(x, z)) return { x, z };
    }
    return { x: S.x + lx * 2, z: S.z + lz * 2 };
  }

  // ── engine sound: two detuned saws through a low-pass, pitch follows the speed through four gears ──
  const A = { ctx: null };
  function audio(ctx, out) {
    if (A.ctx || !ctx) return; A.ctx = ctx;
    A.g = ctx.createGain(); A.g.gain.value = 0; A.f = ctx.createBiquadFilter(); A.f.type = 'lowpass'; A.f.frequency.value = 420;
    A.o = [0, 7].map((det) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 40; o.detune.value = det; o.connect(A.f); o.start(); return o; });
    A.f.connect(A.g); A.g.connect(out);
  }
  function sound(throttle) {
    if (!A.ctx) return; const t = A.ctx.currentTime, v = Math.abs(S.v);
    const gear = v < 7 ? v / 7 : v < 15 ? (v - 7) / 8 : v < 23 ? (v - 15) / 8 : (v - 23) / 10;
    const f = S.on ? 34 + gear * 46 + (v > 7 ? 10 : 0) + throttle * 6 : 30;
    for (const o of A.o) o.frequency.setTargetAtTime(f, t, 0.08);
    A.f.frequency.setTargetAtTime(300 + throttle * 500 + v * 10, t, 0.1);
    A.g.gain.setTargetAtTime(S.on ? 0.035 + throttle * 0.03 : 0, t, 0.15);
  }
  const lights = (night) => { lamp.intensity = night ? 90 : 0; };

  return { S, root, park, parkNear, update, pushOut, door, dist, audio, sound, lights, free };
}
