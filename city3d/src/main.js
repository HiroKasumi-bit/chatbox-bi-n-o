// Scene set-up for Aurora Haven: builds the city, then offers two looks: "sun" (the low
// midnight sun with long shadows) and "night" (polar night under the aurora). Open
// index.html to explore it; render tools call window.renderShot(shot).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Batch } from './util.js';
import { createMaterials, materials, setMode } from './materials.js';
import { snowfield, streets } from './ground.js';
import { downtown } from './downtown.js';
import { mountAurora } from './mountain.js';
import { fusionStation, foodPlant, renewablePark, energyHub, airport, stadium, greenhouses, airBase, ecoHomes } from './industry.js';
import { neighbourhoods } from './neighbourhoods.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 9000);

createMaterials();
scene.add(snowfield());
const b = new Batch();
const towerBatch = new Batch();
streets(b);
downtown(b, towerBatch);
const mountain = mountAurora(b);
scene.add(mountain);
fusionStation(b);
foodPlant(b);
renewablePark(b);
energyHub(b);
airport(b);
stadium(b);
greenhouses(b);
airBase(b);
ecoHomes(b);
neighbourhoods(b);
const city = b.build(materials);
city.name = 'city';
scene.add(city);
const tower = towerBatch.build(materials);
tower.name = 'aurora81';
scene.add(tower);

// Steam rising from the warm Aurora Lagoon and the geothermal plant.
const steamTex = (() => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const steamMat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0.4 });
function steam(x, z, w, d, count, rise, size, seed) {
  let a = seed;
  const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(steamMat);
    const y = rnd() * rise;
    s.position.set(x + (rnd() - 0.5) * w, 1 + y, z + (rnd() - 0.5) * d);
    const k = size * (0.6 + y / rise) * (0.7 + rnd() * 0.6);
    s.scale.set(k, k, 1);
    scene.add(s);
  }
}
steam(36, 206, 20, 14, 16, 7, 5, 7);
steam(-60, -146, 30, 6, 18, 20, 8, 11);

// Falling snow for the storm look.
const snowfall = (() => {
  const n = 9000;
  const p = new Float32Array(n * 3);
  let a = 3;
  const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) p.set([(rnd() - 0.5) * 900, rnd() * 120, (rnd() - 0.5) * 900], i * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, map: steamTex, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.visible = false;
  scene.add(pts);
  return pts;
})();

// Lights.
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b7a99, 0.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd2a0, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);

// Physical sky for the midnight sun.
const sky = new Sky();
sky.scale.setScalar(8000);
const skyU = sky.material.uniforms;
const L_TURB = 4;
skyU.turbidity.value = L_TURB;
skyU.rayleigh.value = 2.4;
skyU.mieCoefficient.value = 0.006;
skyU.mieDirectionalG.value = 0.85;
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.6, 0.5, 0.85);
const gtao = new GTAOPass(scene, camera, 512, 512);
gtao.output = GTAOPass.OUTPUT.Default;
gtao.blendIntensity = 1.0;
gtao.updateGtaoMaterial({ radius: 6, distanceExponent: 1.5, thickness: 4, scale: 1, samples: 16 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
composer.addPass(renderPass);
composer.addPass(gtao);
composer.addPass(bloom);
composer.addPass(new OutputPass());

let envRT = null;
function setLook(look) {
  const L = { ...look };
  snowfall.visible = false;
  setMode(L.mode, L.env ?? (L.mode === 'sun' ? 0.45 : 0.6));
  if (envRT) envRT.dispose();
  if (L.mode === 'sun') {
    const el = THREE.MathUtils.degToRad(L.sunElevation ?? 7);
    const az = THREE.MathUtils.degToRad(L.sunAzimuth ?? 210); // degrees from north, clockwise
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
    skyU.sunPosition.value.copy(dir);
    sky.visible = true;
    scene.background = null;
    scene.fog = new THREE.Fog(L.fog || 0xc6cde0, 1100, 6000);
    // Environment light from the sky itself.
    const envScene = new THREE.Scene();
    const s2 = new Sky();
    s2.scale.setScalar(1000);
    Object.assign(s2.material.uniforms.sunPosition.value, dir);
    for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) s2.material.uniforms[k].value = skyU[k].value;
    envScene.add(s2);
    envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;
    sun.color.set(L.sunColor || 0xffc890);
    sun.intensity = L.sunIntensity ?? 3.2;
    sun.userData.dir = dir;
    hemi.color.set(0xbcd4ff);
    hemi.groundColor.set(0x8090a8);
    hemi.intensity = L.hemi ?? 0.35;
    renderer.toneMappingExposure = L.exposure ?? 0.62;
    steamMat.color.set(0xffffff);
    steamMat.opacity = 0.22;
    bloom.strength = L.bloom ?? 0.25;
    bloom.threshold = 0.9;
  } else if (L.mode === 'storm') {
    // Overcast, windy polar day: flat grey light, thick haze and falling snow.
    sky.visible = false;
    const cv = document.createElement('canvas');
    cv.width = 16;
    cv.height = 512;
    const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#5f6b7e');
    gr.addColorStop(0.6, '#9aa6b6');
    gr.addColorStop(1, '#c9d0d9');
    g.fillStyle = gr;
    g.fillRect(0, 0, 16, 512);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.fog = new THREE.Fog(0xb9c2cd, L.fogNear ?? 120, L.fogFar ?? 900);
    envRT = null;
    scene.environment = null;
    sun.userData.dir = new THREE.Vector3(0.3, 0.8, 0.5).normalize();
    sun.color.set(0xdfe6f0);
    sun.intensity = 0.7;
    hemi.color.set(0xd6dde8);
    hemi.groundColor.set(0x9aa3b0);
    hemi.intensity = 1.6;
    renderer.toneMappingExposure = L.exposure ?? 0.85;
    bloom.strength = 0.1;
    bloom.threshold = 0.95;
    snowfall.visible = true;
  } else {
    sky.visible = false;
    const tex = new THREE.CanvasTexture(window.paintNightSky(L.night, L.w, L.h, L.horizonY));
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.fog = new THREE.Fog(L.night.fogColor || L.night.sky[L.night.sky.length - 1], 700, 4200);
    // A dim violet-teal environment for reflections.
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x121a3e);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: 0x2a6f86, side: THREE.BackSide }));
    glow.scale.set(1, 0.3, 1);
    glow.position.y = 3;
    envScene.add(glow);
    envRT = pmrem.fromScene(envScene);
    scene.environment = envRT.texture;
    const el = THREE.MathUtils.degToRad(L.moonElevation ?? 30);
    const az = THREE.MathUtils.degToRad(L.moonAzimuth ?? 160);
    sun.userData.dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
    sun.color.set(0xa9c4ff);
    sun.intensity = L.moonIntensity ?? 0.55;
    hemi.color.set(L.hemiSky || 0x8fc0e0);
    hemi.groundColor.set(L.hemiGround || 0x3a3470);
    hemi.intensity = L.hemi ?? 0.45;
    renderer.toneMappingExposure = L.exposure ?? 1.0;
    steamMat.color.set(0x6f7fa8);
    steamMat.opacity = 0.2;
    bloom.strength = L.bloom ?? 0.55;
    bloom.radius = 0.45;
    bloom.threshold = L.bloomThreshold ?? 0.8;
  }
}

function aimShadow(target, radius) {
  const dir = sun.userData.dir;
  sun.target.position.set(target[0], 0, target[2]);
  sun.position.set(target[0] + dir.x * 1200, dir.y * 1200, target[2] + dir.z * 1200);
  const c = sun.shadow.camera;
  c.left = -radius; c.right = radius; c.top = radius; c.bottom = -radius;
  c.near = 10; c.far = 2600;
  c.updateProjectionMatrix();
  sun.target.updateMatrixWorld();
}

// Where the true horizon lands on the picture, as a pixel row.
function horizonRow(h) {
  camera.updateMatrixWorld();
  const p = camera.position.clone();
  const f = new THREE.Vector3();
  camera.getWorldDirection(f);
  f.y = 0;
  f.normalize();
  const q = p.clone().add(f.multiplyScalar(1e5)).project(camera);
  return Math.round(((1 - q.y) / 2) * h);
}

window.renderShot = function (shot) {
  const { w, h } = shot;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
  gtao.setSize(w, h);
  gtao.enabled = shot.ao !== false;
  camera.aspect = w / h;
  camera.fov = shot.fov || 45;
  camera.position.set(...shot.pos);
  camera.lookAt(...shot.target);
  camera.updateProjectionMatrix();
  const look = { ...shot.look, w, h, horizonY: horizonRow(h) };
  setLook(look);
  aimShadow(shot.shadowCentre || shot.target, shot.shadowRadius || 250);
  if (shot.snowAround) snowfall.position.set(shot.snowAround[0], 0, shot.snowAround[2]);
  if (shot.only) {
    // Only some groups, on a transparent background (used for the tower over the masthead).
    const hidden = scene.children.filter((o) => o.visible && !shot.only.includes(o.name) && !o.isLight);
    hidden.forEach((o) => { o.visible = false; });
    const bg = scene.background;
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    const data = renderer.domElement.toDataURL('image/png');
    hidden.forEach((o) => { o.visible = true; });
    scene.background = bg;
    return data;
  }
  composer.render();
  return renderer.domElement.toDataURL('image/png');
};

window.cityReady = true;

// Interactive mode: orbit around the city at night or in the midnight sun.
if (!new URLSearchParams(location.search).has('render')) {
  const controls = new OrbitControls(camera, renderer.domElement);
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();
  camera.position.set(260, 220, 420);
  controls.target.set(40, 0, 0);
  const sunLook = { mode: 'sun', sunElevation: 8, sunAzimuth: 220 };
  setLook(sunLook);
  aimShadow([40, 0, 0], 450);
  const loop = () => {
    controls.update();
    composer.render();
    requestAnimationFrame(loop);
  };
  loop();
}

// Top-down plan drawing: flat colours per kind of surface, north at the top.
const PLAN = {
  road: 0x5d6876, paved: 0xdde2e9, ground: 0xf7f9fb, tree: 0x63ad72, water: 0x86c8e8,
  building: 0x8a97a9, accent: 0x8a97a9,
};
const planKind = (key) => {
  if (['asphalt', 'runway'].includes(key)) return 'road';
  if (['sidewalk', 'plaza', 'concrete', 'concreteDark', 'marking', 'markingYellow', 'granite', 'turf'].includes(key)) return 'paved';
  if (['snow', 'snowBank'].includes(key)) return 'ground';
  if (['treeGreen', 'trunk', 'plants'].includes(key)) return 'tree';
  if (['water', 'waterDark'].includes(key)) return 'water';
  return 'building';
};
window.renderPlan = function ({ rect, w, h }) {
  const [x0, z0, x1, z1] = rect;
  const cam = new THREE.OrthographicCamera(x0, x1, -z0, -z1, 1, 2000);
  cam.position.set(0, 800, 0);
  cam.up.set(0, 0, -1);
  cam.lookAt(0, 0, 0);
  // The camera looks straight down with north (-z) up, so world x maps to picture x and
  // world z to picture y.
  cam.left = x0; cam.right = x1; cam.top = -z0; cam.bottom = -z1;
  cam.updateProjectionMatrix();
  const swaps = [];
  const basic = {};
  scene.traverse((o) => {
    if (o.isSprite || o.isPoints) { swaps.push([o, null, o.visible]); o.visible = false; return; }
    if (!o.isMesh) return;
    let col;
    if (o.name === 'mountAurora') {
      swaps.push([o, o.material]);
      o.material = new THREE.MeshLambertMaterial({ color: 0xe9ecf2, flatShading: true });
      return;
    }
    if (o.name === 'snowfield') col = PLAN.ground;
    else col = PLAN[planKind(o.userData.batchKey || '')];
    basic[col] = basic[col] || new THREE.MeshBasicMaterial({ color: col });
    swaps.push([o, o.material]);
    o.material = basic[col];
  });
  const bg = scene.background;
  const fog = scene.fog;
  const skyVis = sky.visible;
  scene.background = new THREE.Color(PLAN.ground);
  scene.fog = null;
  sky.visible = false;
  const shadows = renderer.shadowMap.enabled;
  renderer.shadowMap.enabled = false;
  const tm = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  hemi.intensity = 1.2;
  hemi.color.set(0xffffff);
  hemi.groundColor.set(0x8a90a0);
  sun.intensity = 1.2;
  sun.position.set(-300, 400, -300);
  sun.target.position.set(0, 0, 0);
  sun.target.updateMatrixWorld();
  renderer.setSize(w, h, false);
  renderer.render(scene, cam);
  const data = renderer.domElement.toDataURL('image/png');
  for (const [o, m, vis] of swaps) {
    if (m === null) o.visible = vis;
    else o.material = m;
  }
  scene.background = bg;
  scene.fog = fog;
  sky.visible = skyVis;
  renderer.shadowMap.enabled = shadows;
  renderer.toneMapping = tm;
  return data;
};
