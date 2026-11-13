// Eco-Polis VR: xem bản đồ Living City bằng kính VR Box (điện thoại chia đôi màn hình).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fixModelPivotAndMaterial, fixNatureColors } from './builder_fns.js';

const $ = (s) => document.querySelector(s);
const statusEl = $('#status'), barEl = $('#bar i');
const store = {
  get(k, d) { try { const v = localStorage.getItem('ecopolis-vr:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ecopolis-vr:' + k, JSON.stringify(v)); } catch {} },
};

// ---------- renderer, cảnh, ánh sáng (giống builder, chế độ hang động) ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
new THREE.TextureLoader().load('backgrounds/cave_smooth.jpg', (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  scene.background = t;
  scene.environment = t;
});
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 0.5);
sun.position.set(20, 40, 20);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 900);
camera.rotation.order = 'YXZ';
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);
const stereo = new THREE.StereoCamera();
stereo.eyeSep = 0.06;
camera.focus = 12;

// ---------- tải bản đồ ----------
const objs = [];
const boxes = [];        // khung bao từng công trình, để biết đang nhìn vào cái gì
const texCache = new Map();

function modelURL(p) { return 'models/' + p.split('/').map(encodeURIComponent).join('/'); }

function defaultScale(item) { return item.modelPath.startsWith('nha/') ? 4.5 : 3.5; }

async function loadCity() {
  const res = await fetch('city.json');
  if (!res.ok) throw new Error('Không đọc được city.json');
  const data = await res.json();
  data.objects.forEach((o) => objs.push(o));
  const groups = new Map();
  objs.forEach((o, i) => {
    if (!groups.has(o.modelPath)) groups.set(o.modelPath, []);
    groups.get(o.modelPath).push(i);
  });
  const paths = [...groups.keys()];
  // mô hình có nhiều bản sao thì chia theo 4 góc bản đồ: phần nằm sau lưng không phải vẽ
  const chunks = (list) => {
    if (list.length < 40) return [list];
    const q = [[], [], [], []];
    list.forEach((i) => q[(objs[i].x >= 0 ? 2 : 0) + (objs[i].z >= 0 ? 1 : 0)].push(i));
    return q.filter((c) => c.length);
  };
  const loader = new GLTFLoader();
  let done = 0, failed = 0;
  const m = new THREE.Matrix4(), objM = new THREE.Matrix4(), q = new THREE.Quaternion();
  const e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();

  async function one(path) {
    let gltf;
    try { gltf = await loader.loadAsync(modelURL(path)); }
    catch (err) { failed++; console.warn('Lỗi tải', path, err); return; }
    finally { done++; barEl.style.width = (done / paths.length * 100).toFixed(1) + '%'; statusEl.textContent = `Đang tải mô hình ${done}/${paths.length}…`; }
    const model = gltf.scene;
    fixModelPivotAndMaterial(model);
    fixNatureColors(model, path);
    // dùng chung 1 ảnh màu cho mọi mô hình cùng thư mục (tiết kiệm bộ nhớ điện thoại)
    const folder = path.slice(0, path.lastIndexOf('/'));
    model.traverse((c) => {
      if (!c.isMesh) return;
      (Array.isArray(c.material) ? c.material : [c.material]).forEach((mat) => {
        if (!mat.map) return;
        if (!texCache.has(folder)) texCache.set(folder, mat.map);
        else if (texCache.get(folder) !== mat.map) { mat.map.dispose(); mat.map = texCache.get(folder); }
      });
    });
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const parts = [];
    model.traverse((c) => { if (c.isMesh) parts.push(c); });
    const list = groups.get(path);
    const mats = list.map((idx) => {
      const it = objs[idx], d = defaultScale(it);
      p.set(it.x || 0, it.y || 0, it.z || 0);
      e.set(it.rotationX || 0, it.rotationY || 0, it.rotationZ || 0);
      q.setFromEuler(e);
      s.set(it.scaleX || it.scale || d, it.scaleY || it.scale || d, it.scaleZ || it.scale || d);
      const om = new THREE.Matrix4().compose(p, q, s);
      if (!box.isEmpty()) boxes.push({ box: box.clone().applyMatrix4(om), idx });
      return om;
    });
    const matOf = new Map(list.map((idx, k) => [idx, mats[k]]));
    for (const chunk of chunks(list)) {
      for (const part of parts) {
        const im = new THREE.InstancedMesh(part.geometry, part.material, chunk.length);
        chunk.forEach((idx, i) => { m.multiplyMatrices(matOf.get(idx), part.matrixWorld); im.setMatrixAt(i, m); });
        im.instanceMatrix.needsUpdate = true;
        im.computeBoundingSphere();
        im.name = path;
        scene.add(im);
      }
    }
  }

  // tải song song 6 mô hình một lúc
  const queue = paths.slice();
  await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await one(queue.shift()); }));
  return { count: objs.length, models: paths.length, failed };
}

// ---------- các điểm đến ----------
function nearest(prefix, tx, tz) {
  let best = null, bd = Infinity;
  for (const o of objs) {
    if (!o.details || !String(o.details.name || '').startsWith(prefix)) continue;
    const d = (o.x - tx) ** 2 + (o.z - tz) ** 2;
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
const EYE = 1.3; // chiều cao mắt khi đứng trên đường (đơn vị bản đồ)
let VIEWS = [];
function buildViews() {
  const at = (prefix, tx, tz, fallback) => {
    const o = nearest(prefix, tx, tz);
    return o ? [o.x, o.y + EYE, o.z] : fallback;
  };
  VIEWS = [
    { title: 'Toàn cảnh', sub: 'Nhìn từ trên cao', pos: [64, 46, 64], look: [0, 0, 0] },
    { title: 'Đại lộ vành đai', sub: 'Mặt đất · tầng 0', pos: at('Primary ring road', -28, 36, [-28, EYE, 36]), look: [0, 6, 0] },
    { title: 'Công viên', sub: 'Mặt đất · nhìn từ trên', pos: [0, 8, 40], look: [0, 0, 20] },
    { title: 'Ngước nhìn trời', sub: 'Lục địa trên cao', pos: at('Secondary road', 8, 8, [8, EYE, 8]), look: [0, 30, 0] },
    { title: 'Lục địa trên trời', sub: 'Tầng +28', pos: at('[SKY-SUPREME] Aerial North-South Avenue', 24, -20, [24, 28 + EYE, -20]), look: [0, 30, 0] },
    { title: 'Phố ngầm', sub: 'Tầng −9', pos: at('Undercity street', -36, -8, [-36, -9 + EYE, -8]), look: [0, -7, 0] },
    { title: 'Khu nhà ngầm', sub: 'Tầng −18', pos: at('Green Arcology Quarter', 28, -11.2, [28, -18 + EYE, -11.2]), look: [0, -17, -11.2] },
    { title: 'Lõi sâu nhất', sub: 'Tầng −27', pos: at('[UNDERCITY-L3] Deep Core', -14, -36, [-14, -27 + EYE, -36]), look: [-14, -26, 0] },
    { title: 'Mặt cắt các tầng', sub: 'Nhìn từ bên hông', pos: [80, 3, 18], look: [0, 0, 0] },
  ];
}

// ---------- điều khiển hướng nhìn ----------
let mode = 'mono';            // 'mono' (1 hình) | 'vr' (2 hình cho kính)
let gyroOn = false, gyroSeen = false;
const dev = { alpha: 0, beta: 0, gamma: 0 };
let yaw = 0, pitch = 0;       // dùng khi kéo tay
let yawOffset = 0;            // bù hướng la bàn của cảm biến
const zee = new THREE.Vector3(0, 0, 1);
const qTilt = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const qTmp = new THREE.Quaternion(), qDev = new THREE.Quaternion(), qYaw = new THREE.Quaternion();
const eTmp = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);

window.addEventListener('deviceorientation', (ev) => {
  if (ev.alpha === null && ev.beta === null) return;
  dev.alpha = ev.alpha || 0; dev.beta = ev.beta || 0; dev.gamma = ev.gamma || 0;
  if (!gyroSeen) { gyroSeen = true; if (pendingYaw !== null) { recenterTo(pendingYaw); pendingYaw = null; } }
});

function screenAngle() {
  const a = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
  return THREE.MathUtils.degToRad(a);
}
function deviceQuat(out) {
  const d2r = THREE.MathUtils.degToRad;
  eTmp.set(d2r(dev.beta), d2r(dev.alpha), -d2r(dev.gamma), 'YXZ');
  out.setFromEuler(eTmp);
  out.multiply(qTilt);
  out.multiply(qTmp.setFromAxisAngle(zee, -screenAngle()));
  return out;
}
function deviceYaw() {
  deviceQuat(qDev);
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(qDev);
  return Math.atan2(-f.x, -f.z);
}
let pendingYaw = null;
function recenterTo(targetYaw) {
  if (gyroOn && gyroSeen) yawOffset = targetYaw - deviceYaw();
  else if (gyroOn) pendingYaw = targetYaw;
  yaw = targetYaw;
}
function updateCamera() {
  if (gyroOn && gyroSeen) {
    deviceQuat(qDev);
    qYaw.setFromAxisAngle(UP, yawOffset + dragYaw);
    camera.quaternion.copy(qYaw).multiply(qDev);
  } else {
    camera.quaternion.setFromEuler(eTmp.set(pitch, yaw, 0, 'YXZ'));
  }
}

// kéo tay (khi không có cảm biến, hoặc để xoay ngang thêm khi đang dùng cảm biến)
let dragYaw = 0, drag = null;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', (ev) => {
  drag = { x: ev.clientX, y: ev.clientY, t: performance.now(), moved: false, id: ev.pointerId };
  cv.setPointerCapture(ev.pointerId);
});
cv.addEventListener('pointermove', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
  drag.x = ev.clientX; drag.y = ev.clientY;
  const k = (camera.fov * Math.PI / 180) / innerHeight;
  if (gyroOn && gyroSeen) dragYaw += dx * k;
  else { yaw += dx * k; pitch = THREE.MathUtils.clamp(pitch + dy * k, -1.5, 1.5); }
});
cv.addEventListener('pointerup', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  const tap = !drag.moved && performance.now() - drag.t < 350;
  drag = null;
  if (tap) onTap();
});
cv.addEventListener('pointercancel', () => { drag = null; });

// bàn phím (máy tính) và nút điều khiển bluetooth của kính (thường giả lập phím Enter / âm lượng)
const keys = new Set();
window.addEventListener('keydown', (ev) => {
  keys.add(ev.code);
  if (['Enter', 'NumpadEnter', 'Space', 'MediaPlayPause', 'AudioVolumeUp'].includes(ev.code) || ev.key === 'Enter') onTap();
});
window.addEventListener('keyup', (ev) => keys.delete(ev.code));

// ---------- vòng điểm đến dưới chân ----------
const menu = new THREE.Group();
rig.add(menu);
const cards = [];
const MENU_R = 1.35, MENU_DROP = 1.55;
function cardTexture(title, sub, active) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 200;
  const g = c.getContext('2d');
  const r = 36;
  g.beginPath();
  g.roundRect ? g.roundRect(6, 6, 500, 188, r) : g.rect(6, 6, 500, 188);
  g.fillStyle = active ? 'rgba(255,178,74,0.92)' : 'rgba(18,10,4,0.82)';
  g.fill();
  g.lineWidth = 6; g.strokeStyle = active ? '#fff3dc' : '#5ff2c8'; g.stroke();
  g.textAlign = 'center';
  g.fillStyle = active ? '#2a1300' : '#ffffff';
  g.font = 'bold 60px system-ui, -apple-system, Roboto, sans-serif';
  g.fillText(title, 256, 98, 470);
  g.fillStyle = active ? '#3d1d00' : '#ffcf8a';
  g.font = '36px system-ui, -apple-system, Roboto, sans-serif';
  g.fillText(sub, 256, 152, 470);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function buildMenu() {
  VIEWS.forEach((v, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.y = -i * (Math.PI * 2 / VIEWS.length);
    const mat = new THREE.MeshBasicMaterial({ map: cardTexture(v.title, v.sub, false), transparent: true, depthTest: false, depthWrite: false, opacity: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.4), mat);
    mesh.position.set(0, -MENU_DROP, -MENU_R);
    mesh.rotation.x = -Math.atan2(MENU_DROP, MENU_R);
    mesh.renderOrder = 1000;
    mesh.userData = { view: i, tex: [mat.map, cardTexture(v.title, v.sub, true)] };
    pivot.add(mesh);
    menu.add(pivot);
    cards.push(mesh);
  });
}
let menuAlpha = 0, current = 0;
function setActiveCard(i) {
  cards.forEach((c) => { c.material.map = c.userData.tex[c.userData.view === i ? 1 : 0]; c.material.needsUpdate = true; });
}

// ---------- di chuyển ----------
const fade = document.createElement('div');
Object.assign(fade.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .25s', zIndex: '9' });
document.body.appendChild(fade);
let moving = null;

function goTo(i) {
  const v = VIEWS[i];
  current = i;
  fade.style.opacity = '1';
  setTimeout(() => {
    rig.position.set(...v.pos);
    // xoay hướng đi về phía cảnh chính của điểm đến
    const d = new THREE.Vector3(...v.look).sub(new THREE.Vector3(...v.pos));
    const ty = Math.atan2(-d.x, -d.z);
    dragYaw = 0;
    recenterTo(ty);
    pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    pitch = THREE.MathUtils.clamp(pitch, -1.2, 1.2);
    setActiveCard(i);
    toast(v.title + ' · ' + v.sub + (gyroOn && gyroSeen && pitch > 0.5 ? ' — hãy ngước lên' : ''));
    fade.style.opacity = '0';
  }, 260);
}
function glideForward(dist) {
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  moving = { from: rig.position.clone(), to: rig.position.clone().addScaledVector(dir, dist), t: 0, dur: 0.6 };
}
function onTap() {
  if (!started) return;
  if (hoverCard) { goTo(hoverCard.userData.view); resetDwell(); return; }
  glideForward(6);
}

// ---------- nhìn vào đâu (dấu ngắm giữa tầm nhìn) ----------
const ray = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let hoverCard = null, dwellStart = 0, lastPick = 0, hoverIdx = -1;
const DWELL = 1500;
const hit = new THREE.Vector3();
function resetDwell() { hoverCard = null; dwellStart = 0; setProgress(0); }

function pick(now) {
  camera.updateMatrixWorld();
  ray.setFromCamera(center, camera);
  // 1) thẻ điểm đến
  let card = null;
  if (menuAlpha > 0.6) {
    const h = ray.intersectObjects(cards, false)[0];
    if (h) card = h.object;
  }
  if (card !== hoverCard) { hoverCard = card; dwellStart = now; }
  if (hoverCard) {
    const k = Math.min(1, (now - dwellStart) / DWELL);
    setProgress(k);
    if (k >= 1) { goTo(hoverCard.userData.view); resetDwell(); }
    setLabel(null);
    return;
  }
  setProgress(0);
  // 2) công trình (8 lần/giây là đủ)
  if (now - lastPick < 120) return;
  lastPick = now;
  const o = ray.ray.origin;
  let best = -1, bd = 160;
  for (const b of boxes) {
    if (b.box.containsPoint(o)) continue;
    if (!ray.ray.intersectBox(b.box, hit)) continue;
    const d = hit.distanceTo(o);
    if (d < bd) { bd = d; best = b.idx; }
  }
  if (best !== hoverIdx) { hoverIdx = best; setLabel(best >= 0 ? objs[best].details : null); }
}

// ---------- giao diện trên màn hình ----------
const hud = $('#hud');
const eyes = [$('#eyeL'), $('#eyeR')];
eyes.forEach((el) => {
  el.querySelector('.reticle').innerHTML =
    '<svg viewBox="-12 -12 24 24"><circle r="3" fill="#fff" stroke="#000" stroke-opacity=".5" stroke-width="1"/>' +
    '<circle class="ring" r="9" fill="none" stroke="#5ff2c8" stroke-width="2.6" stroke-linecap="round" ' +
    'stroke-dasharray="56.55" stroke-dashoffset="56.55" transform="rotate(-90)"/></svg>';
  const t = document.createElement('div');
  t.className = 'label';
  t.style.top = '14%';
  t.dataset.role = 'toast';
  el.appendChild(t);
});
const rings = eyes.map((el) => el.querySelector('.ring'));
const labels = eyes.map((el) => el.querySelector('.label:not([data-role])'));
const toasts = eyes.map((el) => el.querySelector('[data-role=toast]'));
function setProgress(k) { rings.forEach((r) => r.setAttribute('stroke-dashoffset', (56.55 * (1 - k)).toFixed(2))); }
function setLabel(det) {
  labels.forEach((l) => {
    l.textContent = '';
    if (!det) { l.classList.remove('on'); return; }
    const name = String(det.name || '');
    const m = name.match(/^\[([^\]]+)\]\s*(.*)$/);
    const b = document.createElement('b');
    b.textContent = m ? m[2] : name;
    l.appendChild(b);
    const extra = det.feature || det.purpose || '';
    if (extra && !/^y=-?\d+$/.test(extra)) l.appendChild(document.createTextNode(extra));
    else if (det.purpose) l.appendChild(document.createTextNode(det.purpose));
    l.classList.add('on');
  });
}
let toastTimer = 0;
function toast(text) {
  toasts.forEach((t) => { t.textContent = text; t.classList.add('on'); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toasts.forEach((t) => t.classList.remove('on')), 3200);
}
const hint = $('#hint');
function showHint(text) { hint.textContent = text; hint.style.opacity = '.85'; clearTimeout(showHint.t); showHint.t = setTimeout(() => { hint.style.opacity = '0'; }, 6000); }

// khoảng cách hai hình (cho điện thoại to: kéo hai hình lại gần nhau cho khớp tròng kính)
let inset = store.get('inset', 0); // 0 … 0.3 nửa màn hình
function layout() {
  const W = innerWidth, H = innerHeight;
  renderer.setSize(W, H);
  $('#rotate').style.display = (mode === 'vr' && started && H > W) ? 'flex' : 'none';
  if (mode === 'vr') {
    const half = W / 2, px = inset * half, ew = half - px;
    Object.assign(eyes[0].style, { left: px + 'px', width: ew + 'px', display: 'block' });
    Object.assign(eyes[1].style, { left: half + 'px', width: ew + 'px', display: 'block' });
    $('#divider').style.display = 'block';
    hint.style.display = 'none';
  } else {
    Object.assign(eyes[0].style, { left: '0px', width: W + 'px', display: 'block' });
    eyes[1].style.display = 'none';
    $('#divider').style.display = 'none';
    hint.style.display = 'block';
  }
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 300));

// ---------- vòng lặp vẽ ----------
let started = false, last = performance.now();
let ftAcc = 0, ftN = 0, ftCheck = 0;
const fwd = new THREE.Vector3();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;

  if (!started) { rig.rotation.y += dt * 0.05; }
  updateCamera();

  if (moving) {
    moving.t += dt;
    const k = Math.min(1, moving.t / moving.dur), ease = k * (2 - k);
    rig.position.lerpVectors(moving.from, moving.to, ease);
    if (k >= 1) moving = null;
  }
  // phím mũi tên / WASD trên máy tính
  if (keys.size && started) {
    camera.getWorldDirection(fwd);
    const sp = (keys.has('ShiftLeft') ? 30 : 12) * dt;
    if (keys.has('KeyW') || keys.has('ArrowUp')) rig.position.addScaledVector(fwd, sp);
    if (keys.has('KeyS') || keys.has('ArrowDown')) rig.position.addScaledVector(fwd, -sp);
    const side = new THREE.Vector3().crossVectors(fwd, UP).normalize();
    if (keys.has('KeyD') || keys.has('ArrowRight')) rig.position.addScaledVector(side, sp);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) rig.position.addScaledVector(side, -sp);
    if (keys.has('KeyE')) rig.position.y += sp;
    if (keys.has('KeyQ')) rig.position.y -= sp;
  }

  // vòng điểm đến hiện ra khi cúi nhìn xuống
  camera.getWorldDirection(fwd);
  const want = started && fwd.y < -0.6 ? 1 : 0;
  menuAlpha += (want - menuAlpha) * Math.min(1, dt * 8);
  menu.visible = menuAlpha > 0.02;
  cards.forEach((c) => { c.material.opacity = menuAlpha; });

  if (started) pick(now);
  render();

  // tự giảm độ nét nếu máy bị giật
  ftAcc += dt; ftN++;
  if (now - ftCheck > 2500 && ftN > 30) {
    const avg = ftAcc / ftN;
    if (avg > 0.028 && pixelRatio > 1) { pixelRatio = Math.max(1, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); layout(); }
    ftAcc = 0; ftN = 0; ftCheck = now;
  }
}

function render() {
  const W = innerWidth, H = innerHeight;
  if (mode === 'vr') {
    const half = W / 2, px = inset * half, ew = half - px;
    camera.fov = 80;
    camera.aspect = ew / H;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    stereo.update(camera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.setScissorTest(true);
    renderer.setScissor(px, 0, ew, H); renderer.setViewport(px, 0, ew, H);
    renderer.render(scene, stereo.cameraL);
    renderer.setScissor(half, 0, ew, H); renderer.setViewport(half, 0, ew, H);
    renderer.render(scene, stereo.cameraR);
    renderer.setScissorTest(false);
  } else {
    camera.fov = 70;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setViewport(0, 0, W, H);
    renderer.render(scene, camera);
  }
}

// ---------- bắt đầu / thoát ----------
const btnVR = $('#goVR'), btnMono = $('#goMono'), warn = $('#warn');
if (!window.isSecureContext) {
  warn.style.display = 'block';
  warn.textContent = 'Trang đang mở bằng http:// thường nên điện thoại sẽ chặn cảm biến xoay. Hãy mở bằng https:// hoặc http://localhost (xem hướng dẫn).';
}

async function enter(vr) {
  // xin quyền cảm biến trên iPhone: phải gọi ngay trong lúc bấm nút
  let perm = Promise.resolve('granted');
  if (vr && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    perm = DeviceOrientationEvent.requestPermission().catch(() => 'denied');
  }
  try { await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }); } catch {}
  try { await screen.orientation?.lock?.('landscape'); } catch {}
  try { await navigator.wakeLock?.request('screen'); } catch {}
  await perm; // nếu bị từ chối thì sẽ không có sự kiện cảm biến → tự chuyển sang vuốt màn hình
  mode = vr ? 'vr' : 'mono';
  gyroOn = vr;
  started = true;
  rig.rotation.y = 0;
  $('#start').style.display = 'none';
  hud.classList.add('on');
  layout();
  goTo(current);
  if (vr) {
    setTimeout(() => {
      if (!gyroSeen) toast('Không đọc được cảm biến xoay — vuốt màn hình để nhìn');
    }, 2000);
  } else {
    showHint('Kéo để nhìn · cúi nhìn xuống để chọn điểm đến · chạm để bay tới trước');
  }
}
btnVR.addEventListener('click', () => enter(true));
btnMono.addEventListener('click', () => enter(false));
$('#btnExit').addEventListener('click', async () => {
  started = false;
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
  hud.classList.remove('on');
  $('#start').style.display = 'flex';
  layout();
});
$('#btnMode').addEventListener('click', () => {
  mode = mode === 'vr' ? 'mono' : 'vr';
  if (mode === 'vr') gyroOn = true;
  layout();
});
$('#btnRecenter').addEventListener('click', () => { dragYaw = 0; const v = VIEWS[current]; const d = new THREE.Vector3(...v.look).sub(new THREE.Vector3(...v.pos)); recenterTo(Math.atan2(-d.x, -d.z)); });

// thanh chỉnh khoảng cách hai hình trên màn hình bắt đầu
(function addInsetControl() {
  const wrap = document.createElement('label');
  Object.assign(wrap.style, { display: 'block', maxWidth: '360px', margin: '14px auto 0', fontSize: '13px', opacity: '.85', textAlign: 'left' });
  wrap.innerHTML = 'Khoảng cách hai hình (điện thoại to thì kéo sang phải): <input type="range" min="0" max="30" step="1" style="width:100%">';
  const inp = wrap.querySelector('input');
  inp.value = Math.round(inset * 100);
  inp.addEventListener('input', () => { inset = inp.value / 100; store.set('inset', inset); });
  $('#start .btns').after(wrap);
})();

// ---------- chạy ----------
layout();
renderer.setAnimationLoop(frame);
rig.position.set(64, 50, 64);
camera.lookAt(0, 0, 0);
pitch = camera.rotation.x; yaw = camera.rotation.y;

loadCity().then((r) => {
  buildViews();
  buildMenu();
  setActiveCard(0);
  rig.position.set(...VIEWS[0].pos);
  statusEl.textContent = `Đã tải ${r.count} công trình từ ${r.models - r.failed}/${r.models} mô hình.` + (r.failed ? ` (${r.failed} mô hình lỗi)` : '');
  barEl.style.width = '100%';
  btnVR.disabled = false; btnMono.disabled = false;
  window.__ready = r;
}).catch((err) => {
  statusEl.textContent = 'Lỗi: ' + err.message + ' — trang phải được mở qua một máy chủ web (không mở trực tiếp file).';
  console.error(err);
});

// cho phép công cụ kiểm thử điều khiển
window.__vr = { goTo, get views() { return VIEWS; }, setLook(y, p) { yaw = y; pitch = p; }, enter, renderer, scene, camera, rig, setInset(v) { inset = v; layout(); },
  state() { return { gyroOn, gyroSeen, mode, yawOffset, started, W: innerWidth, H: innerHeight, cw: renderer.domElement.width, csw: renderer.domElement.style.width, vv: window.visualViewport && visualViewport.width, q: camera.quaternion.toArray().map((v) => +v.toFixed(3)) }; },
  stop() { renderer.setAnimationLoop(null); }, step(n = 1) { for (let i = 0; i < n; i++) frame(performance.now()); } };
