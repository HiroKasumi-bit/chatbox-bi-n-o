// Aurora Haven Explorer: walk the city of the magazine, collect data cards, answer AURA, ride the metro,
// climb Mount Aurora and make it to the shelter in a blizzard drill.
import * as THREE from 'three';
import './flag.js'; // first: the city builders leave out the static cars and walkers; agents.js moves real ones
import { createWorld } from './world.js';
import { createCar } from './drive.js';
import { createAgents } from './agents.js';
import { VOICE } from './voice.js';
import { SPA_FACE_Z } from '../src/mountain.js';
import { buildSpa } from './spa.js';
import { buildHeightMap, buildPlan, RECT } from './terrain.js';
import { MISSIONS, FINALE, STATIONS, UI, SPAWN } from './missions.js';
import { PLACES } from '../src/layout.js';
import { materials } from '../src/materials.js';

const $ = (s) => document.querySelector(s);
const QS = new URLSearchParams(location.search);
const savedLang = (() => { try { return localStorage.getItem('ah_lang'); } catch (e) { return null; } })();
const G = { lang: savedLang || 'en', ready: false, playing: false, modal: null, mi: 0, phase: 'cards', got: new Set(), score: 0, t: 0,
  places: new Set(), metro: false, tries: 0, finaleT: 0, done: false, free: false, quality: true, room: null, seenInside: false };
let agents = null, SPA = null, car = null;
const driving = () => !!(car && car.S.on);
const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[G.lang] ?? o.en);

// ───────────────────────── world ─────────────────────────
const world = createWorld($('#c'), (name, k) => { $('#loadbar i').style.width = Math.round(k * 100) + '%'; });
const { scene, camera } = world;
let hm, planCanvas;

// ───────────────────────── sound ─────────────────────────
const AU = { ctx: null, out: null, wind: null, windGain: null };
function ac() {
  if (!AU.ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    AU.ctx = new C(); AU.out = AU.ctx.createGain(); AU.out.gain.value = 0.8; AU.out.connect(AU.ctx.destination);
    const n = AU.ctx.sampleRate * 2, b = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; AU.noise = b;
    const s = AU.ctx.createBufferSource(); s.buffer = b; s.loop = true; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    AU.windGain = AU.ctx.createGain(); AU.windGain.gain.value = 0.05; s.connect(f); f.connect(AU.windGain); AU.windGain.connect(AU.out); s.start(); AU.windF = f;
  }
  if (AU.ctx.state === 'suspended') AU.ctx.resume();
  return AU.ctx;
}
function tone(f, dur, type = 'sine', vol = 0.15, delay = 0, glide) {
  const c = ac(); if (!c) return; const t0 = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(AU.out); o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(dur, f0, vol = 0.08, q = 1, delay = 0) {
  const c = ac(); if (!c) return; const t0 = c.currentTime + delay, s = c.createBufferSource(); s.buffer = AU.noise;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = f0; f.Q.value = q; const g = c.createGain();
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(f); f.connect(g); g.connect(AU.out); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
}
const sfx = {
  step: () => noise(0.09, 900 + Math.random() * 500, 0.035, 1.5),
  card: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.35, 'sine', 0.1, i * 0.07)),
  ding: () => { tone(880, 0.5, 'sine', 0.16); tone(1318.5, 0.6, 'sine', 0.12, 0.08); tone(1760, 0.8, 'sine', 0.08, 0.16); },
  buzz: () => { tone(150, 0.35, 'sawtooth', 0.07); tone(141, 0.35, 'sawtooth', 0.06); },
  aura: () => { tone(520, 0.18, 'sine', 0.07); tone(780, 0.25, 'sine', 0.06, 0.09); },
  metro: () => { noise(1.6, 300, 0.12, 0.6); tone(220, 1.4, 'triangle', 0.05, 0, 440); },
  alarm: () => { for (let i = 0; i < 3; i++) { tone(880, 0.22, 'square', 0.05, i * 0.5); tone(660, 0.22, 'square', 0.05, i * 0.5 + 0.25); } },
  click: () => tone(1600, 0.04, 'square', 0.02),
  place: () => { tone(740, 0.2, 'triangle', 0.06); tone(988, 0.3, 'triangle', 0.05, 0.08); },
  jump: () => noise(0.12, 600, 0.04, 1),
};

// ───────────────────────── music ─────────────────────────
// Calm, cold background music by Kevin MacLeod (incompetech.com), CC BY 4.0: Frozen Star and Floating Cities
// outdoors, Healing in the spa; it fades out for the blizzard drill and dips while AURA speaks.
const MUSIC = { outside: ['game/music/frozen_star.mp3', 'game/music/floating_cities.mp3'], spa: ['game/music/healing.mp3'] };
const MU = { on: (() => { try { return localStorage.getItem('ah_music') !== 'off'; } catch (e) { return true; } })(), mood: null, cur: null, idx: 0, vol: 0.3 };
function musicMood(m) { if (m === MU.mood) return; MU.mood = m; MU.idx = 0; nextTrack(); }
function nextTrack() {
  if (MU.cur) fadeOut(MU.cur);
  const list = MU.mood && MUSIC[MU.mood]; if (!list) { MU.cur = null; return; }
  const a = new Audio(list[MU.idx++ % list.length]); a.volume = 0; a.play().catch(() => {});
  a.addEventListener('ended', () => { if (MU.cur === a) nextTrack(); }); MU.cur = a;
}
function fadeOut(a) { const v0 = a.volume, t0 = performance.now(); const id = setInterval(() => { const k = (performance.now() - t0) / 2500; a.volume = Math.max(0, v0 * (1 - k)); if (k >= 1) { clearInterval(id); a.pause(); } }, 60); }
function musicTick(dt) {
  if (!MU.cur) return; const speaking = voice && !voice.paused && !voice.ended;
  const target = MU.on ? MU.vol * (speaking ? 0.45 : 1) : 0; MU.cur.volume = Math.min(1, Math.max(0, MU.cur.volume + (target - MU.cur.volume) * Math.min(1, dt * 1.2)));
}
function toggleMusic() { MU.on = !MU.on; try { localStorage.setItem('ah_music', MU.on ? 'on' : 'off'); } catch (e) {} toast(G.lang === 'vi' ? (MU.on ? '♪ Nhạc: bật' : '♪ Nhạc: tắt') : (MU.on ? '♪ Music on' : '♪ Music off')); }

// ───────────────────────── player ─────────────────────────
const P = { pos: new THREE.Vector3(SPAWN.x, 0, SPAWN.z), vy: 0, yaw: SPAWN.yaw, ground: true, speed: 0, anim: 0, stepT: 0 };
const C = { yaw: SPAWN.yaw, pitch: 0.32, dist: 7.5, pos: new THREE.Vector3() };
const fwd = (y) => new THREE.Vector3(Math.sin(y), 0, Math.cos(y)); // yaw π faces north (−z)

const hero = (() => {
  const m = (key, fallback) => materials[key] || new THREE.MeshStandardMaterial({ color: fallback, roughness: 0.8 });
  const coat = m('coatOrange', 0xd8662a), trousers = m('trousers', 0x2a2f38), skin = m('skin', 0xd9a77e), hat = m('hatWool', 0x1d222b), scarf = m('coatWhite', 0xeeeeee), pack = m('coatNavy', 0x1d3557);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const add = (parent, geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const legs = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.1, 0.84, 0); body.add(g);
    add(g, new THREE.CylinderGeometry(0.08, 0.066, 0.78, 8).translate(0, -0.39, 0), trousers, 0, 0, 0); add(g, new THREE.BoxGeometry(0.14, 0.12, 0.28), trousers, 0, -0.78, 0.04); return g; });
  add(body, new THREE.CylinderGeometry(0.21, 0.28, 0.86, 12), coat, 0, 1.14, 0).scale.set(1, 1, 0.8);
  add(body, new THREE.SphereGeometry(0.23, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), coat, 0, 1.55, 0).scale.set(1, 0.45, 0.8);
  const arms = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.27, 1.52, 0); g.rotation.z = s * 0.1; body.add(g);
    add(g, new THREE.CylinderGeometry(0.066, 0.058, 0.64, 8).translate(0, -0.32, 0), coat, 0, 0, 0); add(g, new THREE.SphereGeometry(0.06, 8, 6), hat, 0, -0.66, 0); return g; });
  add(body, new THREE.CylinderGeometry(0.09, 0.115, 0.13, 10), scarf, 0, 1.62, 0);
  add(body, new THREE.SphereGeometry(0.115, 14, 10), skin, 0, 1.76, 0);
  add(body, new THREE.SphereGeometry(0.128, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), hat, 0, 1.78, 0);
  add(body, new THREE.BoxGeometry(0.34, 0.44, 0.18), pack, 0, 1.25, -0.24);
  scene.add(root);
  return { root, body, legs, arms };
})();

// ───────────────────────── input ─────────────────────────
const keys = new Set();
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (G.modal) { G.modal.key && G.modal.key(k, e); return; }
  if (!G.playing) return;
  keys.add(e.code);
  if (k === 'e') interact();
  else if (k === 'c') callCar();
  else if (k === 'm' || k === 'tab') { e.preventDefault(); toggleMap(); }
  else if (k === 't') toggleTime();
  else if (k === 'g') { G.quality = !G.quality; G.autoQ = false; world.setQuality(G.quality); toast(qualityText()); }
  else if (k === 'l') { setLang(G.lang === 'en' ? 'vi' : 'en'); }
  else if (k === 'n') toggleMusic();
  else if (e.code === 'Space') { e.preventDefault(); if (!driving()) jump(); }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
const cv = $('#c');
let dragging = false;
cv.addEventListener('mousedown', () => { if (G.playing && !G.modal) { if (document.pointerLockElement !== cv) cv.requestPointerLock?.(); dragging = true; } });
addEventListener('mouseup', () => { dragging = false; });
addEventListener('mousemove', (e) => {
  if (!G.playing || G.modal) return;
  if (document.pointerLockElement === cv || dragging) { C.look = performance.now(); C.yaw -= e.movementX * 0.0026; C.pitch = THREE.MathUtils.clamp(C.pitch + e.movementY * 0.002, -0.25, 1.25); }
});
addEventListener('wheel', (e) => { if (G.playing && !G.modal) C.dist = THREE.MathUtils.clamp(C.dist * (e.deltaY > 0 ? 1.1 : 0.9), 3.5, 40); }, { passive: true });
document.addEventListener('pointerlockchange', () => { $('#hint-lock').style.display = G.playing && !G.modal && document.pointerLockElement !== cv ? 'block' : 'none'; });

// ───────────────────────── PS5 controller ─────────────────────────
// Standard mapping (Chrome, Edge): 0 Cross, 1 Circle, 2 Square, 3 Triangle, 4 L1, 5 R1, 6 L2, 7 R2, 8 Create, 9 Options,
// 10 L3, 11 R3, 12–15 D-pad up / down / left / right. Axes: 0, 1 left stick; 2, 3 right stick.
const PAD = { on: false, prev: [], lx: 0, ly: 0, rx: 0, ry: 0, run: false, focus: 0 };
const dead = (v) => (Math.abs(v) < 0.14 ? 0 : (v - Math.sign(v) * 0.14) / 0.86);
addEventListener('gamepadconnected', (e) => { PAD.on = true; toast(G.lang === 'vi' ? '🎮 Đã kết nối tay cầm' : '🎮 Controller connected'); padHints(); });
addEventListener('gamepaddisconnected', () => { PAD.on = [...(navigator.getGamepads?.() || [])].some(Boolean); padHints(); });
function padHints() { document.body.classList.toggle('pad', PAD.on); }
function modalButtons() { return [...document.querySelectorAll('#modal button:not([disabled])')]; }
function padFocus(d) {
  const bs = modalButtons(); if (!bs.length) return;
  PAD.focus = (PAD.focus + d + bs.length) % bs.length; bs.forEach((b, i) => b.classList.toggle('padfocus', i === PAD.focus)); sfx.click();
}
function pollPad(dt) {
  const gp = [...(navigator.getGamepads?.() || [])].find(Boolean); if (!gp) return;
  if (!PAD.on) { PAD.on = true; padHints(); }
  const b = gp.buttons.map((x) => x.pressed || x.value > 0.5), hit = (i) => b[i] && !PAD.prev[i];
  PAD.lx = dead(gp.axes[0] || 0); PAD.ly = dead(gp.axes[1] || 0); PAD.rx = dead(gp.axes[2] || 0); PAD.ry = dead(gp.axes[3] || 0);
  PAD.run = (gp.buttons[7]?.value || 0) > 0.3 || b[10] || Math.hypot(PAD.lx, PAD.ly) > 0.97 && b[6];
  PAD.r2 = gp.buttons[7]?.value || 0; PAD.l2 = gp.buttons[6]?.value || 0; PAD.sq = b[2];
  if (!G.playing) { if (hit(0) || hit(9)) start(); }
  else if (G.modal) {
    // D-pad or left stick picks a button, Cross presses it, Circle closes
    const stickY = gp.axes[1] || 0; PAD.stick = PAD.stick || 0;
    if (hit(12) || hit(14) || (stickY < -0.6 && PAD.stick >= -0.6)) padFocus(-1);
    if (hit(13) || hit(15) || (stickY > 0.6 && PAD.stick <= 0.6)) padFocus(1);
    PAD.stick = stickY;
    if (hit(0)) { const bs = modalButtons(); const t = bs[PAD.focus] || bs[0]; if (t) t.click(); else G.modal?.key?.('e', {}); }
    if (hit(1)) G.modal?.key?.('escape', {});
    if (hit(3) && document.querySelector('#bigmap')) closeModal();
  } else {
    if (PAD.rx || PAD.ry) C.look = performance.now();
    C.yaw -= PAD.rx * dt * 2.6; C.pitch = THREE.MathUtils.clamp(C.pitch + PAD.ry * dt * 1.8, -0.25, 1.25);
    if (driving()) { if (hit(0) || hit(1)) leaveCar(); }       // in the car: Cross or Circle gets out, Square is the handbrake
    else { if (hit(0)) { if (nearThing() || nearCar()) interact(); else jump(); } // Cross: use what is near, otherwise jump
      if (hit(2)) jump(); }                                    // Square: jump
    if (hit(12)) callCar();                                    // D-pad up: call your car
    if (hit(3)) toggleMap();                                   // Triangle: city map
    if (hit(4)) toggleTime();                                  // L1: midnight sun / polar night
    if (hit(5)) { G.quality = !G.quality; G.autoQ = false; world.setQuality(G.quality); toast(qualityText()); } // R1: graphics
    if (hit(8)) setLang(G.lang === 'en' ? 'vi' : 'en');        // Create: language
    if (hit(9)) toggleMusic();                                 // Options: music on / off
    if (hit(11)) C.dist = C.dist > 10 ? 6 : 14;                // R3: camera near / far
  }
  PAD.prev = b;
}
function jump() { if (P.ground) { P.vy = 5.2; P.ground = false; sfx.jump(); } }

// ───────────────────────── collision ─────────────────────────
const STEP = 0.8, RAD = 0.42; // a step this high takes snow banks and kerbs; hm.walk leaves out what hangs overhead
const RING = Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4) * RAD, Math.sin(i * Math.PI / 4) * RAD]);
const onMountain = (x, z) => Math.hypot(x, z - 258) < 70 && Math.abs(x) < 70; // Mount Aurora: you can scramble up the snow
function blocked(x, z, y) {
  if (Math.hypot(x, z - 260) < 5.4 && y > 24) return true;                    // the Aurora Eye's glass, from outside
  const st = onMountain(x, z) ? 1.35 : STEP;
  if (hm.walk(x, z) > y + st) return true;
  for (const [dx, dz] of RING) if (hm.walk(x + dx, z + dz) > y + st) return true;
  return false;
}
function groundAt(x, z) { let g = hm.walk(x, z); for (const [dx, dz] of RING) g = Math.max(g, hm.walk(x + dx * 0.5, z + dz * 0.5)); return g; }
// the spa levels: L1 is the grotto set, L2–L4 come from spa.js. Positions in a room are relative to its origin.
const LEVELS = ['L1', 'L2', 'L3', 'L4'];
function roomOrigin(r) { return r === 'L1' ? world.sets.grotto.origin : SPA[r].origin; }
function roomGround(r, x, z) { // absolute ground height, or null where you cannot stand
  if (r === 'L1') return caveAt(x, z);
  const O = SPA[r].origin, g = SPA[r].ground(x - O.x, z - O.z); return g === null ? null : O.y + g;
}
function roomCamOK(r, q) {
  if (r === 'L1') { const O = world.sets.grotto.origin; return ((q.x - O.x) / 8.8) ** 2 + ((q.z - O.z - 1) / 12.8) ** 2 <= 1 && q.y <= O.y + 5.5; }
  const O = SPA[r].origin; return SPA[r].cam(q.x - O.x, q.y - O.y, q.z - O.z);
}
function caveAt(x, z) { // ground height inside the grotto, or null where you cannot stand
  const O = world.sets.grotto.origin, lx = x - O.x, lz = z - O.z;
  if ((lx / 9.4) ** 2 + ((lz - 1) / 13.4) ** 2 > 1 || lz > 8.7 || (lx - 7.6) ** 2 + (lz + 3.5) ** 2 < 3.6) return null;
  if (Math.abs(lx) < 3.9 && lz > -4.9 && lz < 8.7) { if (Math.abs(lz - 1.2) < 0.7 && Math.abs(lx) < 4.1) return O.y + 0.46 + Math.cos(Math.min(1, Math.abs(lx) / 4.05) * Math.PI / 2) * 0.35; return null; }
  return O.y;
}
// the nearest open, walkable ground to a spot (for placing cards, terminals and stations)
let waterAt = () => false, isRoad = () => false;
function findOpen(x, z, clear = 1.4, maxR = 45) {
  const ok = (px, pz) => {
    const h0 = hm.at(px, pz); if (h0 > 1.3 || waterAt(px, pz)) return false;
    for (let a = 0; a < 8; a++) { const h = hm.at(px + Math.cos(a * Math.PI / 4) * clear * 0.5, pz + Math.sin(a * Math.PI / 4) * clear * 0.5); if (Math.abs(h - h0) > 0.35) return false; }
    for (let a = 0; a < 8; a++) { const h = hm.at(px + Math.cos(a * Math.PI / 4) * clear, pz + Math.sin(a * Math.PI / 4) * clear); if (Math.abs(h - h0) > 0.35) return false; }
    return true;
  };
  for (let r = 0; r <= maxR; r += 0.75) {
    const n = Math.max(1, Math.round(r * 2 * Math.PI / 0.75));
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (ok(px, pz)) return new THREE.Vector3(px, hm.at(px, pz), pz); }
  }
  return new THREE.Vector3(x, hm.at(x, z), z);
}

// ───────────────────────── markers in the world ─────────────────────────
const beamMat = (color) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  uniforms: { col: { value: new THREE.Color(color) }, a: { value: 0.55 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 col; uniform float a; varying vec2 vUv; void main(){ float f = pow(1.0 - vUv.y, 1.6) * (0.35 + 0.65 * pow(abs(sin(vUv.x * 3.14159)), 2.0)); gl_FragColor = vec4(col * f * a, 1.0); }',
});
const glowMat = (color, k = 2.2) => new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: color, emissiveIntensity: k, roughness: 0.4, metalness: 0.2 });
const COLORS = { card: 0x3fe0ff, terminal: 0xffc857, station: 0x5aa0ff, shelter: 0xff4d5e, portal: 0xb48cff, exit: 0xb48cff, lift: 0xffd29a };
function beam(color, h = 60, r = 0.7) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20, 1, true).translate(0, h / 2, 0), beamMat(color)); m.renderOrder = 5; return m; }
function groundRing(color, r = 1.6) { const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.78, r, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); m.position.y = 0.08; return m; }

function makeCard() {
  const g = new THREE.Group();
  const holo = new THREE.Group(); holo.position.y = 1.5; g.add(holo);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.04), new THREE.MeshStandardMaterial({ color: 0x0a2a3a, emissive: COLORS.card, emissiveIntensity: 0.9, transparent: true, opacity: 0.85, roughness: 0.2 }));
  holo.add(plate);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 1.05, 0.05)), new THREE.LineBasicMaterial({ color: 0xcffaff }));
  holo.add(frame);
  for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.5 - (i % 2) * 0.15, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff })); l.position.set(-0.05, 0.3 - i * 0.18, 0.03); holo.add(l); }
  g.add(beam(COLORS.card, 40, 0.45), groundRing(COLORS.card, 1.2));
  const light = new THREE.PointLight(COLORS.card, 6, 10, 2); light.position.y = 1.6; g.add(light);
  g.userData.spin = holo; return g;
}
function makeTerminal() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.4, metalness: 0.6 }));
  post.position.y = 0.6; post.castShadow = true; g.add(post);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 10, 48), glowMat(COLORS.terminal, 3)); ring.position.y = 2.0; g.add(ring);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), glowMat(0x9fe8ff, 3.5)); core.position.y = 2.0; g.add(core);
  g.add(beam(COLORS.terminal, 70, 0.8), groundRing(COLORS.terminal, 1.8));
  const light = new THREE.PointLight(COLORS.terminal, 8, 12, 2); light.position.y = 2; g.add(light);
  g.userData.spin = ring; return g;
}
function makeStation() {
  const g = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0x2c3a52, roughness: 0.35, metalness: 0.7 });
  for (const [x, z] of [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.12), steel); p.position.set(x, 1.3, z); p.castShadow = true; g.add(p); }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 3.0), new THREE.MeshStandardMaterial({ color: 0x9fc7ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2 })); roof.position.y = 2.65; g.add(roof);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), glowMat(COLORS.station, 2.5)); sign.position.set(0, 3.3, 0); g.add(sign);
  const mm = document.createElement('canvas'); mm.width = mm.height = 128; const x = mm.getContext('2d'); x.fillStyle = '#fff'; x.font = 'bold 96px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('M', 64, 70);
  const t = new THREE.CanvasTexture(mm); for (const s of [1, -1]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: t, transparent: true })); q.position.set(0, 3.3, s * 0.05); if (s < 0) q.rotation.y = Math.PI; g.add(q); }
  const stairs = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 2.2), new THREE.MeshStandardMaterial({ color: 0x111824, emissive: 0x24508f, emissiveIntensity: 0.6 })); stairs.position.y = 0.06; g.add(stairs);
  g.add(groundRing(COLORS.station, 2.4));
  return g;
}

function makePortal() { // a soft violet ring on the floor in front of a door
  const g = new THREE.Group(); g.add(groundRing(COLORS.portal, 2.2), groundRing(0xffffff, 1.2));
  const light = new THREE.PointLight(COLORS.portal, 5, 9, 2); light.position.y = 1.5; g.add(light); return g;
}
// every interactive thing: { kind, pos, obj, ... }
const things = [];
function addThing(kind, spot, extra = {}) {
  const p = extra.room ? (() => { const O = roomOrigin(extra.room); return new THREE.Vector3(O.x + spot.x, O.y, O.z + spot.z); })() : extra.raw ? new THREE.Vector3(spot.x, hm.at(spot.x, spot.z), spot.z) : findOpen(spot.x, spot.z, kind === 'station' ? 3.5 : 3, 60);
  const obj = kind === 'card' ? makeCard() : kind === 'terminal' ? makeTerminal() : kind === 'station' ? makeStation() : kind === 'portal' || kind === 'exit' || kind === 'lift' ? makePortal() : (() => { const g = new THREE.Group(); g.add(beam(COLORS.shelter, 120, 2.2), groundRing(COLORS.shelter, 5)); return g; })();
  if (extra.room) obj.traverse((o) => { if (o.material?.type === 'ShaderMaterial') o.scale.y = 0.12; }); // a short beam under the cave roof
  obj.position.copy(p); obj.visible = false; scene.add(obj);
  const t = { kind, pos: p, obj, ...extra }; things.push(t); return t;
}

// ───────────────────────── HUD ─────────────────────────
function toast(text, cls = '') {
  const el = document.createElement('div'); el.className = 'toast ' + cls; el.innerHTML = text; $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3200);
}
let sayTimer = 0, sayQueue = [], typing = null;
let voice = null;
function say(obj, after) {
  sayQueue.push([obj, after]); if (!typing && sayTimer <= 0) nextSay();
}
function nextSay() {
  const item = sayQueue.shift(); if (!item) { $('#aura').classList.remove('on'); return; }
  const [obj, after] = item, text = L(obj), rec = VOICE[obj.en]?.[G.lang];
  const el = $('#aura .txt'); el.textContent = ''; $('#aura').classList.add('on');
  if (voice) { voice.pause(); voice = null; }
  if (rec) { voice = new Audio(rec.src); voice.volume = 0.95; voice.play().catch(() => {}); } else sfx.aura();
  // the words appear in step with the voice
  const ms = rec ? Math.max(14, (rec.dur * 1000 * 0.86) / text.length) : 22;
  let i = 0; clearInterval(typing);
  typing = setInterval(() => { i += 1; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(typing); typing = null; sayTimer = rec ? rec.dur * 0.14 + 1.6 : 2.2 + text.length * 0.035; after && after(); } }, ms);
}
function objective() {
  const m = MISSIONS[G.mi];
  if (G.done && G.free) {
    $('#obj').innerHTML = `<div class="k">${L(UI.freeRoam)}</div><div class="row"><b>${G.places.size}/35</b> ${L(UI.places)}</div>`; return;
  }
  if (G.phase === 'finale') {
    $('#obj').innerHTML = `<div class="k">${L(UI.mission)} ★</div><div class="t">${L(FINALE.title)}</div><div class="a">${L(FINALE.area)}</div><div class="row red">▸ ${L(UI.reach)} · <b id="drill">${Math.max(0, Math.ceil(FINALE.seconds - G.finaleT))} s</b></div>`; return;
  }
  if (!m) return;
  const n = m.cards.length, got = G.got.size;
  $('#obj').innerHTML = `<div class="k">${L(UI.mission)} ${G.mi + 1}/${MISSIONS.length}</div><div class="t">${L(m.title)}</div><div class="a">${L(m.area)}</div>
    <div class="row ${got === n ? 'ok' : ''}">${got === n ? '✓' : '▸'} ${L(UI.cards)} <b>${got}/${n}</b></div>
    <div class="row ${got < n ? 'dim' : ''}">▸ ${L(UI.answer)}</div>`;
}
function stats() {
  const t = Math.floor(G.t), mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
  $('#stats').innerHTML = `<span>${L(UI.score)} <b>${G.score}</b></span><span>${L(UI.time)} <b>${mm}:${ss}</b></span><span>${L(UI.places)} <b>${G.places.size}/35</b></span>`;
}
function addScore(n) { G.score += n; stats(); const el = document.createElement('div'); el.className = 'plus'; el.textContent = '+' + n; $('#hud').appendChild(el); setTimeout(() => el.remove(), 1200); }

function openModal(html, opts = {}) {
  closeModal(true);
  const el = $('#modal'); el.innerHTML = `<div class="box ${opts.cls || ''}">${html}</div>`; el.classList.add('on');
  G.modal = { key: opts.key, close: opts.onClose }; keys.clear(); dragging = false; PAD.focus = 0;
  if (PAD.on) { const bs = modalButtons(); bs.forEach((b, i) => b.classList.toggle('padfocus', i === 0)); }
  if (document.pointerLockElement) document.exitPointerLock();
  el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); opts.act && opts.act(b.dataset.act); }));
}
function closeModal(silent) {
  if (!G.modal) return; const cb = G.modal.close; G.modal = null; $('#modal').classList.remove('on'); $('#modal').innerHTML = '';
  if (!silent) { cb && cb(); if (G.playing) cv.requestPointerLock?.(); }
}

// ───────────────────────── missions ─────────────────────────
function showMission() {
  for (const t of things) {
    if (t.kind === 'card') t.obj.visible = !G.done && t.mi === G.mi && G.phase !== 'finale' && !G.got.has(t.ci);
    else if (t.kind === 'terminal') t.obj.visible = !G.done && t.mi === G.mi && G.phase !== 'finale';
    else if (t.kind === 'station') t.obj.visible = G.metro;
    else if (t.kind === 'shelter') t.obj.visible = G.phase === 'finale';
    else if (t.kind === 'portal' || t.kind === 'exit' || t.kind === 'lift') t.obj.visible = true;
  }
  objective(); stats();
}
function startMission(i) {
  G.mi = i; G.phase = 'cards'; G.got = new Set(); G.tries = 0; showMission();
  say(MISSIONS[i].intro);
}
function target() {
  const t = target0(); if (!t) return t;
  const tr = t.room || null; if (tr === G.room) return t;
  if (!G.room) return things.find((x) => x.kind === 'portal');                       // outside: go in through the North Portal
  if (!tr && G.room === 'L1') return things.find((x) => x.kind === 'exit');           // in the grotto: the way out
  return things.find((x) => x.kind === 'lift' && x.room === G.room);                  // elsewhere: the lift
}
function target0() {
  if (G.phase === 'finale') return things.find((t) => t.kind === 'shelter');
  if (G.done) return null;
  const m = MISSIONS[G.mi]; if (!m) return null;
  if (G.got.size < m.cards.length) {
    let best = null, bd = 1e9; for (const t of things) if (t.kind === 'card' && t.mi === G.mi && !G.got.has(t.ci)) { const d = t.pos.distanceToSquared(P.pos); if (d < bd) { bd = d; best = t; } }
    return best;
  }
  return things.find((t) => t.kind === 'terminal' && t.mi === G.mi);
}
function nearThing() {
  let best = null, bd = 1e9;
  for (const t of things) {
    if (!t.obj.visible || t.kind === 'shelter') continue;
    if ((t.room || null) !== G.room) continue;
    const r = t.kind === 'station' ? 3.2 : 2.6; const dx = t.pos.x - P.pos.x, dz = t.pos.z - P.pos.z, d = Math.hypot(dx, dz);
    if (d < r && Math.abs(t.pos.y - P.pos.y) < 3 && d < bd) { bd = d; best = t; }
  }
  return best;
}
function interact() {
  if (driving()) { leaveCar(); return; }
  const t = nearThing(); if (!t) { if (nearCar()) enterCar(); return; }
  if (t.kind === 'card') openCard(t);
  else if (t.kind === 'terminal') { if (G.got.size < MISSIONS[G.mi].cards.length) { toast(L(UI.needCards)); sfx.buzz(); } else openQuiz(); }
  else if (t.kind === 'station') openMetro(t);
  else if (t.kind === 'portal') goRoom('L1');
  else if (t.kind === 'exit') goRoom(null);
  else if (t.kind === 'lift') openLift();
}
// ───────────────────────── your car ─────────────────────────
const CAR_UI = {
  getIn: { en: 'Get in your car', vi: 'Lên xe của bạn' }, getOut: { en: 'get out', vi: 'xuống xe' },
  keysHint: { en: 'W / S gas, brake · A / D steer · Space handbrake', vi: 'W / S ga, phanh · A / D lái · Space phanh tay' },
  padHint: { en: 'R2 gas · L2 brake · stick steer · □ handbrake', vi: 'R2 ga · L2 phanh · cần trái lái · □ phanh tay' },
  here: { en: '🚗 Your car is here', vi: '🚗 Xe của bạn đã tới' }, notHere: { en: 'No room for the car here', vi: 'Chỗ này không đỗ xe được' },
  inside: { en: 'Cars stay outside the mountain', vi: 'Xe không vào được trong núi' }, slow: { en: 'Stop the car to get out', vi: 'Dừng xe lại rồi mới xuống' },
  how: { en: '<b>Driving</b> W / S gas and brake · A / D steer · Space handbrake · E get out', vi: '<b>Lái xe</b> W / S ga và phanh · A / D lái · Space phanh tay · E xuống xe' },
  howPad: { en: '<b>Driving</b> R2 gas · L2 brake · left stick steer · □ handbrake · ✕ get out', vi: '<b>Lái xe</b> R2 ga · L2 phanh · cần trái lái · □ phanh tay · ✕ xuống xe' },
};
const nearCar = () => !!car && !driving() && !G.room && car.dist(P.pos) < 3.4 && Math.abs(car.S.y - P.pos.y) < 2;
function enterCar() {
  if (!car || G.room) return;
  car.S.on = true; hero.root.visible = false; P.speed = 0; noise(0.16, 260, 0.12, 0.9); tone(70, 0.5, 'sawtooth', 0.05, 0.12, 110);
  if (!G.droveOnce) { G.droveOnce = true; toast(L(PAD.on ? CAR_UI.howPad : CAR_UI.how)); }
}
function leaveCar() {
  if (!driving()) return;
  if (Math.abs(car.S.v) > 4) { toast(L(CAR_UI.slow)); return; }
  car.S.on = false; car.S.v = 0; const d = car.door(); P.pos.set(d.x, groundAt(d.x, d.z), d.z); P.vy = 0; P.yaw = car.S.yaw; hero.root.visible = true; noise(0.16, 260, 0.12, 0.9);
}
function callCar() {
  if (!car || driving() || G.modal) return;
  if (G.room) { toast(L(CAR_UI.inside)); sfx.buzz(); return; }
  const f = fwd(C.yaw), r = new THREE.Vector3(-Math.cos(C.yaw), 0, Math.sin(C.yaw));
  if (car.parkNear(P.pos.x + r.x * 3.2 + f.x * 1.5, P.pos.z + r.z * 3.2 + f.z * 1.5, C.yaw, P.pos.y)) { toast(L(CAR_UI.here)); tone(392, 0.16, 'square', 0.04); tone(330, 0.22, 'square', 0.04, 0.2); }
  else { toast(L(CAR_UI.notHere)); sfx.buzz(); }
}
function driveStep(dt) {
  const k = (...c) => (c.some((x) => keys.has(x)) ? 1 : 0);
  const inp = {
    throttle: Math.max(k('KeyW', 'ArrowUp'), PAD.r2 || 0, Math.max(0, -PAD.ly)),
    brake: Math.max(k('KeyS', 'ArrowDown'), PAD.l2 || 0, Math.max(0, PAD.ly)),
    steer: THREE.MathUtils.clamp(k('KeyD', 'ArrowRight') - k('KeyA', 'ArrowLeft') + PAD.lx, -1, 1),
    handbrake: keys.has('Space') || !!PAD.sq,
  };
  if (car.update(dt, inp)) noise(0.3, 160, 0.18, 0.7);
  car.sound(inp.throttle);
  P.pos.set(car.S.x, car.S.y, car.S.z); P.yaw = car.S.yaw; P.vy = 0; P.ground = true; P.speed = 0;
  // the camera swings in behind the car unless you are looking around
  if (performance.now() - (C.look || 0) > 1200 && Math.abs(car.S.v) > 1.5) { let d = car.S.yaw - C.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); C.yaw += d * Math.min(1, dt * 2.2); }
}

function openLift() {
  const html = `<div class="tag blue">⇅ ${L(UI.liftTitle)}</div><div class="opts">${LEVELS.map((r, i) => `<button data-act="${i}" ${r === G.room ? 'disabled' : ''}><kbd>${i + 1}</kbd>${L(UI.levels[i])}${r === G.room ? ` <em>· ${L(UI.here)}</em>` : ''}</button>`).join('')}</div>
    <div class="btns"><button data-act="x" class="ghost">${L(UI.cancel)} <kbd>Esc</kbd></button></div>`;
  const go = (a) => { if (a === 'x') return closeModal(); const r = LEVELS[+a]; if (!r || r === G.room) return; closeModal(true); goRoom(r); };
  openModal(html, { cls: 'metro', act: go, key: (k) => { if (k === 'escape') closeModal(); else if (/^[1-4]$/.test(k)) go(+k - 1); } });
}
// walking into Mount Aurora, riding its lift between the four levels, and back out
function goRoom(r) {
  const label = r ? L(UI.levels[LEVELS.indexOf(r)]) : L(UI.exitMountain);
  sfx.metro(); $('#fade').classList.add('on'); $('#fade span').textContent = label;
  setTimeout(() => {
    G.room = r; if (G.phase !== 'finale') musicMood(r ? 'spa' : 'outside');
    if (r === 'L1' ) { const O = world.sets.grotto.origin; P.pos.set(O.x - 1.5, O.y, O.z - 8.5); P.yaw = 0; world.enterRoom('L1', null); }
    else if (r) { const d = SPA[r], O = d.origin; P.pos.set(O.x + d.arrive.x, O.y, O.z + d.arrive.z); P.yaw = d.arrive.yaw; world.enterRoom(r, d); }
    else { const t = things.find((x) => x.kind === 'portal'); P.pos.set(t.pos.x, t.pos.y, t.pos.z - 3); P.yaw = Math.PI; world.exitRoom([P.pos.x, 20, P.pos.z]); }
    C.yaw = P.yaw; if (r) { C.dist = Math.min(C.dist, 4.5); C.pitch = 0.25; }
    P.vy = 0; C.pos.set(P.pos.x - Math.sin(P.yaw) * 3, P.pos.y + 2, P.pos.z - Math.cos(P.yaw) * 3); world.follow(P.pos);
  }, 650);
  setTimeout(() => { $('#fade').classList.remove('on'); if (G.playing) cv.requestPointerLock?.(); if (r === 'L1' && !G.seenInside) { G.seenInside = true; say(UI.welcomeInside); } }, 1500);
}
function openCard(t) {
  const c = MISSIONS[t.mi].cards[t.ci];
  sfx.card();
  openModal(`<div class="tag">◆ ${L(UI.cards)} ${G.got.size + 1}/${MISSIONS[t.mi].cards.length}</div><h2>${L(c.title)}</h2><p>${L(c.text)}</p><div class="src">${L(UI.pageRef)} ${c.page}</div>
    <div class="btns"><button data-act="ok">${L(UI.close)} <kbd>E</kbd></button></div>`,
  { cls: 'card', act: () => closeModal(), key: (k) => { if (k === 'e' || k === 'enter' || k === ' ' || k === 'escape') closeModal(); },
    onClose: () => {
      G.got.add(t.ci); t.obj.visible = false; addScore(50); objective();
      if (G.got.size === MISSIONS[G.mi].cards.length) say(UI.allCards);
    } });
}
function openQuiz() {
  const m = MISSIONS[G.mi], q = m.quiz;
  const render = (picked) => `<div class="tag gold">AURA · ${L(UI.mission)} ${G.mi + 1}</div><h2>${L(q.q)}</h2><div class="opts">${q.options.map((o, i) => `<button data-act="${i}" class="${picked != null && i === picked ? (i === q.answer ? 'right' : 'wrong') : ''}"><kbd>${i + 1}</kbd>${L(o)}</button>`).join('')}</div>
    <div class="fb">${picked == null ? '' : picked === q.answer ? `<b class="okc">${L(UI.correct)}</b>` : `<b class="bad">${L(UI.wrong)}</b> ${L(q.hint)}`}</div>`;
  let locked = false;
  const pick = (i) => {
    if (locked) return; i = +i; if (!(i >= 0 && i < q.options.length)) return;
    openModal(render(i), { cls: 'quiz', act: pick, key: (k) => { if (/^[1-3]$/.test(k)) pick(+k - 1); else if (k === 'escape') closeModal(); } });
    if (i === q.answer) {
      locked = true; sfx.ding(); const pts = G.tries === 0 ? 150 : 75; addScore(pts);
      setTimeout(() => { closeModal(true); if (G.playing) cv.requestPointerLock?.(); missionDone(); }, 1300);
    } else { G.tries++; sfx.buzz(); }
  };
  sfx.aura();
  openModal(render(null), { cls: 'quiz', act: pick, key: (k) => { if (/^[1-3]$/.test(k)) pick(+k - 1); else if (k === 'escape') closeModal(); } });
}
function missionDone() {
  const m = MISSIONS[G.mi];
  if (m.id === 'downtown') { G.metro = true; }
  say(m.done);
  if (G.mi + 1 < MISSIONS.length) { const n = G.mi + 1; G.mi = n; G.phase = 'cards'; G.got = new Set(); G.tries = 0; showMission(); setTimeout(() => say(MISSIONS[n].intro), 400); }
  else setTimeout(startFinale, 2500);
  showMission();
}
function startFinale() {
  G.phase = 'finale'; G.finaleT = 0; showMission(); sfx.alarm(); musicMood(null);
  world.setLook('storm'); world.captureEnvironment([P.pos.x, 20, P.pos.z]);
  $('#hud').classList.add('storm'); say(FINALE.intro);
  if (AU.windGain) AU.windGain.gain.setTargetAtTime(0.22, AU.ctx.currentTime, 1.5);
}
function finish() {
  G.done = true; G.phase = 'done'; const inTime = G.finaleT <= FINALE.seconds;
  if (inTime) addScore(300 + Math.max(0, Math.round((FINALE.seconds - G.finaleT) * 3)));
  sfx.ding(); showMission(); say(inTime ? FINALE.win : FINALE.late);
  const rank = [...UI.ranks].reverse().find((r) => G.score >= r.min);
  const t = Math.floor(G.t);
  setTimeout(() => openModal(`<div class="tag gold">★ ${L(UI.endTitle)}</div><h2>${L(rank)}</h2>
    <div class="end"><div><b>${G.score}</b><span>${L(UI.score)}</span></div><div><b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b><span>${L(UI.time)}</span></div><div><b>${G.places.size}/35</b><span>${L(UI.places)}</span></div></div>
    <p>${L(inTime ? FINALE.win : FINALE.late)}</p>
    <div class="btns"><button data-act="free">${L(UI.again)}</button><button data-act="restart" class="ghost">${L(UI.restart)}</button></div>`,
  { cls: 'endbox', act: (a) => { if (a === 'restart') location.reload(); else { closeModal(); } }, key: (k) => { if (k === 'enter' || k === 'e') closeModal(); },
    onClose: () => { G.free = true; musicMood('outside'); world.setLook('sun'); world.captureEnvironment([P.pos.x, 20, P.pos.z]); $('#hud').classList.remove('storm'); if (AU.windGain) AU.windGain.gain.setTargetAtTime(0.05, AU.ctx.currentTime, 1); showMission(); } }), 2600);
}

// ───────────────────────── metro ─────────────────────────
function openMetro(here) {
  if (!G.metro) { toast(L(UI.metroLocked)); return; }
  const list = things.filter((t) => t.kind === 'station');
  const html = `<div class="tag blue">Ⓜ ${L(UI.metroTitle)}</div><div class="opts">${list.map((t, i) => `<button data-act="${i}" ${t === here ? 'disabled' : ''}><kbd>${i + 1}</kbd>${L(t.name)}${t === here ? ` <em>· ${L(UI.here)}</em>` : ''}</button>`).join('')}</div>
    <div class="btns"><button data-act="x" class="ghost">${L(UI.cancel)} <kbd>Esc</kbd></button></div>`;
  const go = (a) => {
    if (a === 'x') return closeModal(); const t = list[+a]; if (!t || t === here) return;
    closeModal(true); sfx.metro(); $('#fade').classList.add('on'); $('#fade span').textContent = 'Ⓜ  ' + L(t.name);
    setTimeout(() => { P.pos.set(t.pos.x, t.pos.y, t.pos.z + 3.2); P.vy = 0; C.yaw = Math.PI; P.yaw = Math.PI; world.follow(P.pos); }, 700);
    setTimeout(() => { $('#fade').classList.remove('on'); if (G.playing) cv.requestPointerLock?.(); }, 1700);
  };
  openModal(html, { cls: 'metro', act: go, key: (k) => { if (k === 'escape') closeModal(); else if (/^[1-5]$/.test(k)) go(+k - 1); } });
}

// ───────────────────────── maps ─────────────────────────
const mini = $('#mini'), mg = mini.getContext('2d'), MW = mini.width, MH = mini.height;
const toPlan = (x, z) => [(x - RECT[0]) * 2, (z - RECT[1]) * 2]; // plan canvas is 2 px per metre
function markers() {
  const out = [];
  for (const t of things) if (t.obj.visible && !t.room) out.push({ x: t.pos.x, z: t.pos.z, kind: t.kind });
  return out;
}
function drawMarker(g, x, y, kind, s = 1) {
  g.save(); g.translate(x, y); g.lineWidth = 2 * s; g.strokeStyle = '#fff';
  const col = '#' + COLORS[kind].toString(16).padStart(6, '0'); g.fillStyle = col;
  if (kind === 'station') { g.fillRect(-6 * s, -6 * s, 12 * s, 12 * s); g.strokeRect(-6 * s, -6 * s, 12 * s, 12 * s); g.fillStyle = '#fff'; g.font = `bold ${9 * s}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 0, 0.5); }
  else if (kind === 'terminal') { g.beginPath(); g.moveTo(0, -8 * s); g.lineTo(7 * s, 0); g.lineTo(0, 8 * s); g.lineTo(-7 * s, 0); g.closePath(); g.fill(); g.stroke(); }
  else { g.beginPath(); g.arc(0, 0, (kind === 'shelter' ? 9 : 6) * s, 0, Math.PI * 2); g.fill(); g.stroke(); }
  g.restore();
}
function drawPlayer(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.rotate(Math.PI - P.yaw);
  g.fillStyle = '#ff6a2a'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -10 * s); g.lineTo(7 * s, 8 * s); g.lineTo(0, 4 * s); g.lineTo(-7 * s, 8 * s); g.closePath(); g.fill(); g.stroke(); g.restore();
}
function drawMini() {
  if (G.room) {
    mg.clearRect(0, 0, MW, MH); mg.save(); mg.beginPath(); mg.arc(MW / 2, MH / 2, MW / 2 - 2, 0, Math.PI * 2); mg.fillStyle = '#1a1712'; mg.fill(); mg.clip();
    const O = roomOrigin(G.room), k = MW / 28, X = (x) => MW / 2 + (x - O.x) * k, Z = (z) => MH / 2 + (z - O.z) * k;
    mg.fillStyle = '#4a4238'; for (let gx = -14; gx < 14; gx += 0.5) for (let gz = -14; gz < 14; gz += 0.5) if (roomGround(G.room, O.x + gx, O.z + gz) !== null) mg.fillRect(X(O.x + gx), Z(O.z + gz), k * 0.5 + 0.5, k * 0.5 + 0.5);
    for (const t of things) if (t.room === G.room && t.obj.visible) drawMarker(mg, X(t.pos.x), Z(t.pos.z), t.kind, 0.85);
    mg.save(); mg.translate(X(P.pos.x), Z(P.pos.z)); mg.rotate(Math.PI - P.yaw); mg.fillStyle = '#ff6a2a'; mg.strokeStyle = '#fff'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(0, -9); mg.lineTo(6, 7); mg.lineTo(0, 3); mg.lineTo(-6, 7); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
    mg.restore(); mg.strokeStyle = 'rgba(255,255,255,.9)'; mg.lineWidth = 3; mg.beginPath(); mg.arc(MW / 2, MH / 2, MW / 2 - 2, 0, Math.PI * 2); mg.stroke();
    mg.fillStyle = '#fff'; mg.font = 'bold 12px sans-serif'; mg.textAlign = 'center'; mg.fillText((G.lang === 'vi' ? 'TẦNG ' : 'LEVEL ') + G.room.slice(1), MW / 2, MH - 14);
    return;
  }
  const span = 260; // metres across
  const [px, pz] = toPlan(P.pos.x, P.pos.z), sc = MW / (span * 2);
  mg.clearRect(0, 0, MW, MH); mg.save(); mg.beginPath(); mg.arc(MW / 2, MH / 2, MW / 2 - 2, 0, Math.PI * 2); mg.clip();
  mg.fillStyle = '#eef2f7'; mg.fillRect(0, 0, MW, MH);
  mg.drawImage(planCanvas, px - span, pz - span, span * 2, span * 2, 0, 0, MW, MH);
  // view direction cone
  mg.save(); mg.translate(MW / 2, MH / 2); mg.rotate(Math.PI - C.yaw); const gr = mg.createRadialGradient(0, 0, 0, 0, 0, 70); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  mg.fillStyle = gr; mg.beginPath(); mg.moveTo(0, 0); mg.arc(0, 0, 70, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5); mg.closePath(); mg.fill(); mg.restore();
  for (const m of markers()) {
    let [mx, my] = toPlan(m.x, m.z); mx = MW / 2 + (mx - px) * sc; my = MH / 2 + (my - pz) * sc;
    const dx = mx - MW / 2, dy = my - MH / 2, d = Math.hypot(dx, dy), R = MW / 2 - 12;
    if (d > R) { if (m.kind === 'station') continue; mx = MW / 2 + dx / d * R; my = MH / 2 + dy / d * R; }
    drawMarker(mg, mx, my, m.kind, 0.85);
  }
  drawPlayer(mg, MW / 2, MH / 2, 0.9);
  mg.restore();
  mg.strokeStyle = 'rgba(255,255,255,.9)'; mg.lineWidth = 3; mg.beginPath(); mg.arc(MW / 2, MH / 2, MW / 2 - 2, 0, Math.PI * 2); mg.stroke();
  mg.fillStyle = '#12355b'; mg.font = 'bold 13px sans-serif'; mg.textAlign = 'center'; mg.fillText('N', MW / 2, 16);
}
function toggleMap() {
  if (G.modal || G.room) return;
  const W = Math.min(innerWidth * 0.86, (innerHeight * 0.78) * (planCanvas.width / planCanvas.height)), H = W * planCanvas.height / planCanvas.width;
  openModal(`<div class="tag">${L(UI.map)} · <kbd>M</kbd></div><canvas id="bigmap" width="${Math.round(W)}" height="${Math.round(H)}"></canvas>`, { cls: 'mapbox', key: (k) => { if (k === 'm' || k === 'escape' || k === 'tab') closeModal(); } });
  const c = $('#bigmap'), g = c.getContext('2d'), s = c.width / planCanvas.width;
  g.drawImage(planCanvas, 0, 0, c.width, c.height);
  g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const p of PLACES) {
    const [x, y] = toPlan(p.x, p.z); const found = G.places.has(p.n);
    g.fillStyle = found ? '#12355b' : 'rgba(18,53,91,.25)'; g.beginPath(); g.arc(x * s, y * s, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.fillText(String(p.n), x * s, y * s + 0.5);
  }
  for (const m of markers()) { const [x, y] = toPlan(m.x, m.z); drawMarker(g, x * s, y * s, m.kind, 1.1); }
  const [x, y] = toPlan(P.pos.x, P.pos.z); drawPlayer(g, x * s, y * s, 1.3);
}

// compass strip with the current target
const comp = $('#compass'), cg = comp.getContext('2d');
function drawCompass() {
  const W2 = comp.width, H2 = comp.height; cg.clearRect(0, 0, W2, H2);
  const bearingOf = (dx, dz) => Math.atan2(dx, -dz); // 0 = north (−z), clockwise
  const pxPerRad = W2 / 2.2, cb = camBearing();
  const xOf = (b) => { let d = b - cb; d = Math.atan2(Math.sin(d), Math.cos(d)); return W2 / 2 + d * pxPerRad; };
  cg.fillStyle = 'rgba(8,16,32,.55)'; cg.fillRect(0, 0, W2, H2);
  for (let i = 0; i < 24; i++) {
    const b = i * Math.PI / 12, x = xOf(b); if (x < 0 || x > W2) continue;
    const lab = ['N', '', '', 'NE', '', '', 'E', '', '', 'SE', '', '', 'S', '', '', 'SW', '', '', 'W', '', '', 'NW', '', ''][i];
    cg.fillStyle = lab.length === 1 ? '#fff' : 'rgba(255,255,255,.7)'; cg.fillRect(x - 1, H2 - (lab ? 10 : 6), 2, lab ? 10 : 6);
    if (lab) { cg.font = `${lab.length === 1 ? 'bold 15' : '11'}px sans-serif`; cg.textAlign = 'center'; cg.fillText(lab, x, 18); }
  }
  const t = target();
  if (t) {
    const dx = t.pos.x - P.pos.x, dz = t.pos.z - P.pos.z, x = THREE.MathUtils.clamp(xOf(bearingOf(dx, dz)), 8, W2 - 8);
    drawMarker(cg, x, H2 / 2 + 2, t.kind, 0.9);
    $('#dist').textContent = `${Math.round(Math.hypot(dx, dz))} m`;
  } else $('#dist').textContent = '';
}
function camBearing() { const f = fwd(C.yaw); return Math.atan2(f.x, -f.z); }

const qualityText = () => (G.lang === 'vi' ? (G.quality ? 'Đồ họa: cao' : 'Đồ họa: nhanh (tắt bóng đổ)') : (G.quality ? 'Graphics: high' : 'Graphics: fast (no shadows)'));
// ───────────────────────── language, time of day ─────────────────────────
function setLang(l) { G.lang = l; try { localStorage.setItem('ah_lang', l); } catch (e) {} document.querySelectorAll('[data-en]').forEach((el) => { el.innerHTML = el.dataset[l] || el.dataset.en; }); document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === l)); objective(); stats(); }
function toggleTime() {
  if (G.phase === 'finale' || G.room) return;
  world.setLook(world.look === 'sun' ? 'dusk' : 'sun'); world.captureEnvironment([P.pos.x, 20, P.pos.z]);
  toast(world.look === 'sun' ? (G.lang === 'vi' ? 'Mặt trời nửa đêm' : 'Midnight sun') : (G.lang === 'vi' ? 'Đêm vùng cực · cực quang' : 'Polar night · northern lights'));
}

// ───────────────────────── loop ─────────────────────────
const tmpV = new THREE.Vector3();
function update(dt) {
  if (G.playing && !G.modal) {
    G.t += dt;
    if (driving()) driveStep(dt);
    else {
    // move relative to the camera
    let mx = 0, mz = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
    mx += PAD.lx; mz -= PAD.ly;
    const mag = Math.min(1, Math.hypot(mx, mz));
    const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || PAD.run;
    const f = fwd(C.yaw), r = new THREE.Vector3(-Math.cos(C.yaw), 0, Math.sin(C.yaw));
    const dir = tmpV.set(0, 0, 0).addScaledVector(f, mz).addScaledVector(r, mx);
    const want = dir.lengthSq() > 0.0004 ? (run ? 13 : 5.5) * Math.max(0.35, mag) : 0;
    P.speed += (want - P.speed) * Math.min(1, dt * 8);
    if (dir.lengthSq() > 0) {
      dir.normalize();
      const targetYaw = Math.atan2(dir.x, dir.z); let d = targetYaw - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw += d * Math.min(1, dt * 12);
      const climb = onMountain(P.pos.x, P.pos.z) && groundAt(P.pos.x + dir.x * 0.6, P.pos.z + dir.z * 0.6) > P.pos.y + 0.25 ? 0.45 : 1;
      const step = P.speed * dt * climb, nx = P.pos.x + dir.x * step, nz = P.pos.z + dir.z * step;
      if (G.room) {
        const ok = (x, z) => { const h = roomGround(G.room, x, z); return h !== null && h < P.pos.y + 0.8; };
        if (ok(nx, nz)) { P.pos.x = nx; P.pos.z = nz; } else if (ok(nx, P.pos.z)) P.pos.x = nx; else if (ok(P.pos.x, nz)) P.pos.z = nz;
      } else if (!blocked(nx, nz, P.pos.y)) { P.pos.x = nx; P.pos.z = nz; }
      else { if (!blocked(nx, P.pos.z, P.pos.y)) P.pos.x = nx; else if (!blocked(P.pos.x, nz, P.pos.y)) P.pos.z = nz; else P.speed *= 0.5; }
    }
    if (!G.room) { P.pos.x = THREE.MathUtils.clamp(P.pos.x, RECT[0] + 5, RECT[2] - 5); P.pos.z = THREE.MathUtils.clamp(P.pos.z, RECT[1] + 5, RECT[3] - 5); if (!driving()) { agents && agents.pushPlayer(P.pos); car && car.pushOut(P.pos); } }
    const gnd = G.room ? (roomGround(G.room, P.pos.x, P.pos.z) ?? P.pos.y) : groundAt(P.pos.x, P.pos.z);
    P.vy -= 16 * dt; P.pos.y += P.vy * dt;
    if (P.pos.y <= gnd) { if (!P.ground && P.vy < -6) sfx.step(); P.pos.y = P.pos.y < gnd - 0.01 && gnd - P.pos.y < 1.5 ? THREE.MathUtils.lerp(P.pos.y, gnd, Math.min(1, dt * 18)) : gnd; P.vy = 0; P.ground = true; if (gnd - P.pos.y < 0.02) P.pos.y = gnd; }
    else P.ground = P.pos.y - gnd < 0.05;
    // walk animation and footsteps
    const k = Math.min(1, P.speed / 5.5);
    P.anim += dt * (P.speed > 0.2 ? 3 + P.speed * 0.9 : 0);
    const sw = Math.sin(P.anim) * 0.65 * k;
    hero.legs[0].rotation.x = sw; hero.legs[1].rotation.x = -sw; hero.arms[0].rotation.x = -sw * 0.8; hero.arms[1].rotation.x = sw * 0.8;
    hero.body.position.y = Math.abs(Math.cos(P.anim)) * 0.05 * k;
    if (P.ground && P.speed > 1) { P.stepT -= dt * (1.4 + P.speed * 0.22); if (P.stepT <= 0) { P.stepT = 1; sfx.step(); } }
    }
    // places of the magazine
    for (const p of PLACES) {
      if (G.room || G.places.has(p.n)) continue;
      const s = p.spot; if (Math.hypot(s.x - P.pos.x, s.z - P.pos.z) < 14) { G.places.add(p.n); addScore(10); sfx.place(); toast(`<b>${L(UI.discovered)} ${p.n}/35</b> ${p.name}`, 'place'); stats(); }
    }
    // the blizzard drill
    if (G.phase === 'finale') {
      G.finaleT += dt; const sh = things.find((t) => t.kind === 'shelter'), el = $('#drill');
      if (el) el.textContent = `${Math.max(0, Math.ceil(FINALE.seconds - G.finaleT))} s`;
      if (Math.hypot(sh.pos.x - P.pos.x, sh.pos.z - P.pos.z) < 7) finish();
    }
    stats();
  }
  hero.root.position.copy(P.pos); hero.body.rotation.y = P.yaw;
  // camera: behind and above, pulled in when a building is in the way
  const tgt = new THREE.Vector3(P.pos.x, P.pos.y + 1.6, P.pos.z), f = fwd(C.yaw), cd = driving() ? Math.max(C.dist, 9.5) : C.dist;
  const want = new THREE.Vector3(tgt.x - f.x * cd * Math.cos(C.pitch), tgt.y + cd * Math.sin(C.pitch), tgt.z - f.z * cd * Math.cos(C.pitch));
  let dist = 1;
  if (G.room) {
    for (let s = 0.08; s <= 1.001; s += 0.04) { const q = tgt.clone().lerp(want, s); if (!roomCamOK(G.room, q)) { dist = Math.max(0.12, s - 0.08); break; } }
  } else for (let s = 0.08; s <= 1.001; s += 0.04) { const q = tgt.clone().lerp(want, s); if (hm.at(q.x, q.z) > q.y - 0.35) { dist = Math.max(0.12, s - 0.08); break; } }
  const camPos = tgt.clone().lerp(want, dist); if (!G.room) camPos.y = Math.max(camPos.y, hm.at(camPos.x, camPos.z) + 0.4);
  C.pos.lerp(camPos, G.playing ? Math.min(1, dt * 14) : 1);
  camera.position.copy(C.pos); camera.lookAt(tgt);
  if (window.__camOverride) { const o = window.__camOverride; camera.position.set(...o.pos); camera.lookAt(...o.look); } // for screenshots
  // markers spin and bob
  const time = performance.now() / 1000;
  for (const t of things) if (t.obj.visible && t.obj.userData.spin) { t.obj.userData.spin.rotation.y = time * 1.4; t.obj.userData.spin.position.y = (t.kind === 'card' ? 1.5 : 2.0) + Math.sin(time * 2 + t.pos.x) * 0.12; }
  // prompt
  const nt = G.playing && !G.modal && !driving() ? nearThing() : null;
  const pr = $('#prompt');
  if (nt) { pr.innerHTML = `<kbd>E</kbd> ${nt.kind === 'card' ? L(UI.readCard) : nt.kind === 'terminal' ? L(UI.talk) : nt.kind === 'portal' ? L(UI.enterMountain) : nt.kind === 'exit' ? L(UI.exitMountain) : nt.kind === 'lift' ? L(UI.liftTitle) : L(UI.ride) + ' · ' + L(nt.name)}`; pr.classList.add('on'); } else if (G.playing && !G.modal && nearCar()) { pr.innerHTML = `<kbd>${PAD.on ? '✕' : 'E'}</kbd> ${L(CAR_UI.getIn)}`; pr.classList.add('on'); } else pr.classList.remove('on');
  const sp = $('#speedo'); if (driving()) { sp.innerHTML = `<b>${Math.round(Math.abs(car.S.v) * 3.6)}</b> km/h<span>${L(PAD.on ? CAR_UI.padHint : CAR_UI.keysHint)}</span><span><kbd>${PAD.on ? '✕' : 'E'}</kbd> ${L(CAR_UI.getOut)}</span>`; sp.classList.add('on'); } else sp.classList.remove('on');
  document.body.classList.toggle('driving', driving());
  if (car) { car.lights(world.look !== 'sun'); if (!driving()) car.sound(0); }
  if (sayTimer > 0) { sayTimer -= dt; if (sayTimer <= 0) nextSay(); }
  world.follow(P.pos);
  world.tick(dt);
  musicTick(dt);
  if (agents && G.playing) agents.update(dt, P.pos, !!G.room, car && !driving() ? car.S : null);
}

let last = performance.now(), miniT = 0, fpsN = 0, fpsT = 0, fpsLast = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (G.ready) {
    pollPad(dt);
    if (!G.playing) { // the title screen slowly circles downtown
      const a = now / 1000 * 0.05; camera.position.set(Math.sin(a) * 260, 120, Math.cos(a) * 260 + 40); camera.lookAt(20, 0, 20);
    } else update(dt);
    world.render();
    if (G.playing) { miniT -= dt; if (miniT <= 0) { miniT = 1 / 20; drawMini(); drawCompass(); } }
    fpsN++; fpsT += (now - fpsLast) / 1000; fpsLast = now;
    if (fpsT > 2) { window.__fps = fpsN / fpsT; fpsN = 0; fpsT = 0;
      if (G.playing && G.autoQ !== false && G.quality && G.t > 4 && window.__fps < 28 && !QS.has('high')) { G.quality = false; G.autoQ = false; world.setQuality(false); toast(qualityText() + (G.lang === 'vi' ? ' · nhấn G để đổi' : ' · press G to change')); } }
  }
  requestAnimationFrame(loop);
}

// ───────────────────────── start ─────────────────────────
async function init() {
  addEventListener('resize', world.resize); world.resize();
  setLang(G.lang);
  await world.build();
  $('#loadtxt').textContent = '…';
  await new Promise((r) => setTimeout(r, 30));
  SPA = buildSpa(scene);
  hm = buildHeightMap(world.renderer, scene);
  planCanvas = buildPlan(world.renderer, scene, hm);
  { // water cells from the plan colours, so nothing is placed in a pool
    const d = planCanvas.getContext('2d').getImageData(0, 0, planCanvas.width, planCanvas.height).data, w = planCanvas.width;
    waterAt = (x, z) => { const c = Math.round((x - RECT[0]) * 2), r = Math.round((z - RECT[1]) * 2); if (c < 0 || r < 0 || c >= w || r >= planCanvas.height) return false; const i = (r * w + c) * 4; return d[i + 2] > 180 && d[i] < 160 && d[i + 2] - d[i] > 60; };
    isRoad = (x, z) => { const c = Math.round((x - RECT[0]) * 2), r = Math.round((z - RECT[1]) * 2); if (c < 0 || r < 0 || c >= w || r >= planCanvas.height) return false; const i = (r * w + c) * 4; return Math.abs(d[i] - 79) < 16 && Math.abs(d[i + 1] - 90) < 16 && Math.abs(d[i + 2] - 105) < 16; };
  }
  // the places of the magazine, moved onto walkable ground
  for (const p of PLACES) p.spot = findOpen(p.x, p.z, 1, 40);
  MISSIONS.forEach((m, mi) => {
    m.cards.forEach((c, ci) => addThing('card', c, { mi, ci, raw: !!c.summit, room: c.room || null }));
    addThing('terminal', m.terminal, { mi });
  });
  for (const s of STATIONS) addThing('station', s, { name: s.name, id: s.id });
  addThing('shelter', FINALE.target);
  addThing('portal', { x: 0, z: SPA_FACE_Z - 7.5 }, { raw: true });          // in front of the North Portal doors
  addThing('exit', { x: 0, z: -11.5 }, { room: 'L1' });                         // the cave's entrance side
  addThing('lift', { x: 5.6, z: -3.5 }, { room: 'L1' });                         // the grotto's glass lift
  for (const r of ['L2', 'L3', 'L4']) addThing('lift', SPA[r].lift, { room: r });
  agents = createAgents(scene, hm, isRoad, waterAt);
  car = createCar(scene, { ground: groundAt, walk: (x, z) => hm.walk(x, z), water: (x, z) => waterAt(x, z), road: (x, z) => isRoad(x, z), mountain: onMountain, traffic: agents, rect: RECT });
  const sp = findOpen(SPAWN.x, SPAWN.z); P.pos.copy(sp); P.pos.y = groundAt(sp.x, sp.z);
  // your car waits beside you, facing an open street
  for (const yaw of [SPAWN.yaw - Math.PI / 2, SPAWN.yaw + Math.PI / 2, SPAWN.yaw]) if (car.parkNear(SPAWN.x + 6, SPAWN.z + 2, yaw, P.pos.y, 12)) break;
  G.ready = true; $('#loading').classList.add('done');
  window.__plan = planCanvas;
  const walkTest = (x0, z0, x1, z1) => {
    const p = new THREE.Vector3(x0, groundAt(x0, z0), z0); const d = new THREE.Vector3(x1 - x0, 0, z1 - z0).normalize();
    for (let i = 0; i < 4000; i++) {
      if (Math.hypot(x1 - p.x, z1 - p.z) < 1) return { ok: true, y: p.y };
      const nx = p.x + d.x * 0.1, nz = p.z + d.z * 0.1;
      if (blocked(nx, nz, p.y)) return { ok: false, at: [p.x.toFixed(1), p.y.toFixed(1), p.z.toFixed(1)] };
      p.x = nx; p.z = nz; p.y = groundAt(p.x, p.z);
    }
    return { ok: false, timeout: true };
  };
  window.__game = { G, P, C, hm, things, world, agents: () => agents, music: () => ({ mood: MU.mood, on: MU.on, playing: !!MU.cur && !MU.cur.paused, t: MU.cur ? +MU.cur.currentTime.toFixed(1) : 0, vol: MU.cur ? +MU.cur.volume.toFixed(2) : 0 }), goRoom, walkTest, teleport: (x, z) => { const p = findOpen(x, z); P.pos.copy(p); P.vy = 0; }, missionDone, startMission, startFinale, finish, toggleTime, openQuiz, interact, nearThing, car: () => car, enterCar, leaveCar, callCar, keys };
  if (QS.has('auto')) start();
}
function start() {
  if (G.playing) return; ac(); G.playing = true; $('#title').classList.add('gone'); $('#hud').classList.add('on');
  C.yaw = P.yaw; C.pos.set(P.pos.x, P.pos.y + 6, P.pos.z + 8);
  startMission(0); musicMood('outside'); cv.requestPointerLock?.();
  if (car && AU.ctx) car.audio(AU.ctx, AU.out);
}
$('#play').addEventListener('click', start);
document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { sfx.click(); setLang(b.dataset.l); }));
requestAnimationFrame(loop);
init();
