// Scene set-up for Aurora Haven: builds the city, then offers four looks: "sun" (the low
// midnight sun with long shadows), "dusk" (the long blue polar twilight with every window
// and lamp lit), "night" (polar night under the aurora) and "storm" (a blizzard). Open
// index.html to explore it; render tools call window.renderShot(shot).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Batch } from './util.js';
import { createMaterials, materials, setMode } from './materials.js';
import { snowfield, streets } from './ground.js';
import { downtown } from './downtown.js';
import { mountAurora } from './mountain.js';
import { fusionStation, foodPlant, renewablePark, energyHub, airport, stadium, greenhouses, airBase, ecoHomes } from './industry.js';
import { neighbourhoods } from './neighbourhoods.js';
import { buildPools, setPoolStrength, LAMPS } from './lights.js';
import { interiors } from './interiors.js';

// A surface seen exactly edge-on can give a normal map an undefined tangent frame; one such
// pixel in a reflection would spread to the whole picture through blur and bloom, so any
// undefined normal or colour falls back to a safe value.
THREE.ShaderChunk.normal_fragment_maps += '\nif ( any( isnan( normal ) ) || any( isinf( normal ) ) ) normal = nonPerturbedNormal;\n';
THREE.ShaderChunk.dithering_fragment += '\nif ( any( isnan( gl_FragColor ) ) || any( isinf( gl_FragColor ) ) ) gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.3, 9000);

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
scene.add(buildPools());
// Everything outdoors, so it can be hidden while an interior set is photographed.
const outdoor = [...scene.children];
// Interior sets (the spa grotto, the greenhouse) are built far below the snowfield.
const sets = interiors(scene);

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
function steam(x, z, w, d, count, rise, size, seed, y0 = 1) {
  let a = seed;
  const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(steamMat);
    const y = rnd() * rise;
    s.position.set(x + (rnd() - 0.5) * w, y0 + y, z + (rnd() - 0.5) * d);
    const k = size * (0.6 + y / rise) * (0.7 + rnd() * 0.6);
    s.scale.set(k, k, 1);
    scene.add(s);
    outdoor.push(s);
  }
}
steam(36, 206, 20, 14, 26, 7, 5, 7);
steam(-60, -146, 30, 6, 18, 20, 8, 11);

// Falling snow, for the storm look and for gentle snowfall at dusk: dense near the camera
// (the box is moved to each shot), thinning out with distance.
const snowfall = (() => {
  const n = 160000;
  const p = new Float32Array(n * 3);
  let a = 3;
  const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const r = 6 + Math.pow(rnd(), 2.2) * 260;
    const t = rnd() * Math.PI * 2;
    p.set([Math.cos(t) * r, rnd() * 60, Math.sin(t) * r], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, map: steamTex, transparent: true, opacity: 0.85, depthWrite: false }));
  pts.visible = false;
  scene.add(pts);
  return pts;
})();

// Lights: sky fill, the sun (or moon), and a few real lamps near the camera after dark.
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b7a99, 0.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd2a0, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
const LAMP_LIGHTS = 8;
const lampLights = Array.from({ length: LAMP_LIGHTS }, () => {
  const l = new THREE.PointLight(0xffc27f, 0, 28, 2);
  scene.add(l);
  return l;
});

// Physical sky for the midnight sun.
const sky = new Sky();
sky.scale.setScalar(8000);
sky.name = 'sky';
const skyU = sky.material.uniforms;
skyU.turbidity.value = 4;
skyU.rayleigh.value = 2.4;
skyU.mieCoefficient.value = 0.006;
skyU.mieDirectionalG.value = 0.85;
scene.add(sky);

// Painted sky dome for twilight and night: a gradient from the zenith to the horizon, with a
// warm glow where the sun has just set, and faint stars.
const dome = new THREE.Mesh(
  new THREE.SphereGeometry(3800, 48, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      zenith: { value: new THREE.Color() }, upper: { value: new THREE.Color() }, horizon: { value: new THREE.Color() },
      glow: { value: new THREE.Color() }, glowDir: { value: new THREE.Vector2(0, -1) }, ground: { value: new THREE.Color() },
      stars: { value: 0 },
    },
    vertexShader: 'varying vec3 vDir; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vDir = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `
      uniform vec3 zenith, upper, horizon, glow, ground; uniform vec2 glowDir; uniform float stars; varying vec3 vDir;
      float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c;
        if (h < 0.0) c = mix(horizon, ground, smoothstep(0.0, 0.08, -h));
        else c = mix(mix(horizon, upper, smoothstep(0.0, 0.25, h)), zenith, smoothstep(0.2, 0.9, h));
        vec2 f = normalize(d.xz + 1e-5);
        float g = pow(max(0.0, dot(f, glowDir)), 3.0) * exp(-max(h, 0.0) * 9.0);
        c += glow * g;
        if (stars > 0.0 && h > 0.05) {
          vec3 q = floor(d * 900.0);
          float s = hash(q);
          c += vec3(step(0.9985, s) * stars * smoothstep(0.05, 0.5, h) * (0.4 + 0.6 * hash(q + 7.0)));
        }
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }),
);
dome.name = 'skyDome';
dome.frustumCulled = false;
dome.visible = false;
scene.add(dome);
const domeU = dome.material.uniforms;

// Post-processing: ambient occlusion, bloom, then a colour grade with a soft vignette and a
// little film grain.
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const gtao = new GTAOPass(scene, camera, 512, 512);
gtao.output = GTAOPass.OUTPUT.Default;
gtao.blendIntensity = 1.0;
gtao.updateGtaoMaterial({ radius: 6, distanceExponent: 1.5, thickness: 4, scale: 1, samples: 16 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
// Ambient occlusion should only see solid surfaces: not steam, light decals or the sky.
gtao.overrideVisibility = function () {
  const cache = this._visibilityCache;
  this.scene.traverse((o) => {
    cache.set(o, o.visible);
    const m = o.material;
    if (o.isPoints || o.isLine || o.isSprite || o.name === 'lightPools' || o === dome || o === sky || (m && m.transparent && !m.depthWrite)) o.visible = false;
  });
};
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.6, 0.5, 0.85);
const grade = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null }, res: { value: new THREE.Vector2(1, 1) }, contrast: { value: 1.05 }, saturation: { value: 1.05 },
    lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vignette: { value: 0.25 }, grainAmt: { value: 0.015 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float contrast, saturation, vignette, grainAmt; uniform vec3 lift, gain; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = c * gain + lift * (1.0 - c);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, saturation);
      c = (c - 0.5) * contrast + 0.5;
      vec2 d = vUv - 0.5; d.x *= res.x / res.y;
      c *= mix(1.0 - vignette, 1.0, smoothstep(0.95, 0.3, length(d)));
      c += (hash(vUv * res) - 0.5) * grainAmt;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
});
composer.addPass(renderPass);
composer.addPass(gtao);
composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.addPass(grade);

// Reflections: a cube camera photographs the surroundings of each shot, so glass and wet
// streets mirror the real buildings, lamps and sky around them.
const cubeRT = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType });
const cubeCam = new THREE.CubeCamera(1, 7000, cubeRT);
scene.add(cubeCam);
const pmrem = new THREE.PMREMGenerator(renderer);
let domeEnv = null;

function captureEnvironment(at) {
  // First light everything with the sky alone, then photograph the scene lit that way.
  const bg = scene.background;
  const skyVis = sky.visible;
  const domeVis = dome.visible;
  const snowVis = snowfall.visible;
  if (domeEnv) domeEnv.dispose();
  const envScene = new THREE.Scene();
  const skyOnly = skyVis ? sky : dome;
  const parent = skyOnly.parent;
  envScene.add(skyOnly);
  skyOnly.visible = true;
  domeEnv = pmrem.fromScene(envScene, 0, 0.1, 9000);
  parent.add(skyOnly);
  scene.environment = domeEnv.texture;
  scene.background = null;
  if (!skyVis) dome.visible = true;
  snowfall.visible = false;
  cubeCam.position.set(...at);
  cubeCam.update(renderer, scene);
  cubeRT.texture.needsPMREMUpdate = true;
  scene.environment = cubeRT.texture;
  scene.background = bg;
  dome.visible = domeVis;
  snowfall.visible = snowVis;
}

function setDome(L) {
  domeU.zenith.value.set(L.zenith);
  domeU.upper.value.set(L.upper);
  domeU.horizon.value.set(L.horizon);
  domeU.glow.value.set(L.glow || 0x000000);
  domeU.ground.value.set(L.ground || 0x1a2233);
  const az = THREE.MathUtils.degToRad(L.glowAzimuth ?? 200);
  domeU.glowDir.value.set(Math.sin(az), -Math.cos(az));
  domeU.stars.value = L.stars ?? 0;
}

function setGrade(G = {}) {
  grade.uniforms.contrast.value = G.contrast ?? 1.05;
  grade.uniforms.saturation.value = G.saturation ?? 1.05;
  grade.uniforms.lift.value.set(G.lift ?? 0x000000);
  grade.uniforms.gain.value.set(G.gain ?? 0xffffff);
  grade.uniforms.vignette.value = G.vignette ?? 0.25;
  grade.uniforms.grainAmt.value = G.grain ?? 0.015;
}

const dirFrom = (elevation, azimuth) => {
  const el = THREE.MathUtils.degToRad(elevation);
  const az = THREE.MathUtils.degToRad(azimuth); // degrees from north, clockwise
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
};

function setLook(look) {
  const L = { ...look };
  snowfall.visible = !!L.snow;
  sky.visible = false;
  dome.visible = false;
  setMode(L.mode, L.env ?? (L.mode === 'sun' ? 0.45 : 0.6));
  setPoolStrength(L.pools ?? (L.mode === 'dusk' ? 1 : L.mode === 'night' ? 1.1 : 0));
  setGrade(L.grade);
  steamMat.color.set(0xffffff);
  steamMat.opacity = 0.22;
  if (L.mode === 'sun') {
    const dir = dirFrom(L.sunElevation ?? 7, L.sunAzimuth ?? 210);
    skyU.sunPosition.value.copy(dir);
    sky.visible = true;
    scene.background = null;
    scene.fog = new THREE.Fog(L.fog || 0xc6cde0, L.fogNear ?? 1100, L.fogFar ?? 6000);
    sun.color.set(L.sunColor || 0xffc890);
    sun.intensity = L.sunIntensity ?? 3.2;
    sun.userData.dir = dir;
    hemi.color.set(0xbcd4ff);
    hemi.groundColor.set(0x8090a8);
    hemi.intensity = L.hemi ?? 0.35;
    renderer.toneMappingExposure = L.exposure ?? 0.62;
    bloom.strength = L.bloom ?? 0.25;
    bloom.radius = 0.5;
    bloom.threshold = 0.9;
  } else if (L.mode === 'dusk') {
    // Polar twilight: no direct sun, a deep blue sky with a warm band where it set, and the
    // city's own lights doing the work.
    setDome(L.sky);
    dome.visible = true;
    scene.background = null;
    scene.fog = new THREE.Fog(L.fog || L.sky.horizon, L.fogNear ?? 400, L.fogFar ?? 3800);
    sun.userData.dir = dirFrom(L.lightElevation ?? 25, L.lightAzimuth ?? 200);
    sun.color.set(L.lightColor || 0x9fb6e8);
    sun.intensity = L.lightIntensity ?? 0.45;
    hemi.color.set(L.hemiSky || 0x6f8fd0);
    hemi.groundColor.set(L.hemiGround || 0x2c3550);
    hemi.intensity = L.hemi ?? 0.4;
    renderer.toneMappingExposure = L.exposure ?? 0.95;
    steamMat.color.set(0xb7c4e0);
    steamMat.opacity = 0.25;
    bloom.strength = L.bloom ?? 0.5;
    bloom.radius = 0.45;
    bloom.threshold = L.bloomThreshold ?? 0.85;
  } else if (L.mode === 'storm') {
    // Overcast, windy polar day: flat grey light, thick haze and falling snow.
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
    setDome({ zenith: 0x5f6b7e, upper: 0x9aa6b6, horizon: 0xc9d0d9, ground: 0xb9c2cd });
    scene.fog = new THREE.Fog(0xb9c2cd, L.fogNear ?? 120, L.fogFar ?? 900);
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
    const tex = new THREE.CanvasTexture(window.paintNightSky(L.night, L.w, L.h, L.horizonY));
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    // The dome stands in for the painted sky in reflections: deep violet with a green glow.
    setDome(L.reflect || { zenith: 0x050a24, upper: 0x121a4a, horizon: 0x2a3f6e, glow: 0x1f6f5a, glowAzimuth: L.moonAzimuth ?? 160, ground: 0x0c1022 });
    scene.fog = new THREE.Fog(L.night.fogColor || L.night.sky[L.night.sky.length - 1], L.fogNear ?? 700, L.fogFar ?? 4200);
    sun.userData.dir = dirFrom(L.moonElevation ?? 30, L.moonAzimuth ?? 160);
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
  // Real lamps around the camera after dark.
  const lit = L.mode === 'dusk' || L.mode === 'night';
  const c = new THREE.Vector3(...(L.lightsAround || [0, 0, 0]));
  const near = lit ? LAMPS.map((l) => [l, (l.x - c.x) ** 2 + (l.z - c.z) ** 2]).sort((a, b2) => a[1] - b2[1]).slice(0, LAMP_LIGHTS) : [];
  lampLights.forEach((pl, i) => {
    const e = near[i];
    if (!e) { pl.intensity = 0; return; }
    pl.position.set(e[0].x, e[0].y - 0.4, e[0].z);
    pl.color.set(e[0].color);
    pl.intensity = L.lampIntensity ?? 25;
    pl.distance = 22;
  });
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

function setSize(w, h) {
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
  gtao.setSize(w, h);
  grade.uniforms.res.value.set(w, h);
}

// Renders one picture. shot: { w, h, ss (supersampling), fov, pos, target, look, set, ... }
window.renderShot = function (shot) {
  const { w, h } = shot;
  const ss = shot.ss ?? 2;
  setSize(w * ss, h * ss);
  gtao.enabled = shot.ao !== false;
  camera.aspect = w / h;
  camera.fov = shot.fov || 45;
  camera.position.set(...shot.pos);
  camera.lookAt(...shot.target);
  camera.updateProjectionMatrix();
  for (const [name, set] of Object.entries(sets)) set.setActive(name === shot.set);
  // Inside a set, the outdoor city is hidden.
  for (const o of outdoor) o.visible = !shot.set;
  const look = { ...shot.look, w, h, horizonY: horizonRow(h) };
  look.lightsAround = shot.lightsAround || shot.target;
  setLook(look);
  if (shot.set) {
    snowfall.visible = false;
    sets[shot.set].look(look, { scene, hemi, sun, renderer, lampLights });
  }
  aimShadow(shot.shadowCentre || shot.target, shot.shadowRadius || 250);
  if (shot.snowAround || look.snow) {
    const at = shot.snowAround || shot.pos;
    snowfall.position.set(at[0], 0, at[2]);
    snowfall.material.size = look.snowSize ?? 0.3;
  }
  if (shot.only) {
    // Only some groups, on a transparent background (used for the tower over the masthead).
    captureEnvironment(shot.envAt || [shot.target[0], 30, shot.target[2]]);
    const hidden = scene.children.filter((o) => o.visible && !shot.only.includes(o.name) && !o.isLight);
    hidden.forEach((o) => { o.visible = false; });
    const bg = scene.background;
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    hidden.forEach((o) => { o.visible = true; });
    scene.background = bg;
  } else {
    captureEnvironment(shot.envAt || [shot.target[0] * 0.5 + shot.pos[0] * 0.5, Math.max(6, Math.min(40, shot.pos[1] * 0.5)), shot.target[2] * 0.5 + shot.pos[2] * 0.5]);
    composer.render();
  }
  // Downsample the supersampled picture for clean edges.
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const g = out.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(renderer.domElement, 0, 0, w, h);
  return shot.only ? out.toDataURL('image/png') : out.toDataURL('image/jpeg', 0.93);
};

// Handles for debugging the scene from the browser console.
window.city = { scene, renderer, camera, cubeCam, cubeRT, composer };
window.cityReady = true;

// Interactive mode: orbit around the city in the midnight sun.
if (!new URLSearchParams(location.search).has('render')) {
  const controls = new OrbitControls(camera, renderer.domElement);
  const resize = () => {
    setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();
  camera.position.set(260, 220, 420);
  controls.target.set(40, 0, 0);
  for (const set of Object.values(sets)) set.setActive(false);
  setLook({ mode: 'sun', sunElevation: 8, sunAzimuth: 220 });
  aimShadow([40, 0, 0], 450);
  captureEnvironment([40, 30, 0]);
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
  if (['sidewalk', 'curb', 'plaza', 'concrete', 'concreteDark', 'marking', 'markingYellow', 'granite', 'turf'].includes(key)) return 'paved';
  if (['snow', 'snowBank'].includes(key)) return 'ground';
  if (['treeGreen', 'treeGreen2', 'snowTree', 'trunk', 'plants'].includes(key)) return 'tree';
  if (['water', 'waterDark'].includes(key)) return 'water';
  return 'building';
};
// Things too small for a plan: people, cars and their lights.
const PLAN_SKIP = /^(coat|trousers|skin|hat|car|tyre|headlight|taillight)/;
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
  for (const set of Object.values(sets)) set.setActive(false);
  const swaps = [];
  const basic = {};
  scene.traverse((o) => {
    if (o.isSprite || o.isPoints || o.name === 'lightPools' || o.name === 'skyDome' || o.isInstancedMesh) { swaps.push([o, null, o.visible]); o.visible = false; return; }
    if (!o.isMesh) return;
    const key = o.userData.batchKey || '';
    if (PLAN_SKIP.test(key)) { swaps.push([o, null, o.visible]); o.visible = false; return; }
    let col;
    if (o.name === 'mountAurora') {
      swaps.push([o, o.material]);
      o.material = new THREE.MeshLambertMaterial({ color: 0xe9ecf2, flatShading: true });
      return;
    }
    if (o.name === 'snowfield') col = PLAN.ground;
    else col = PLAN[planKind(key)];
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
  lampLights.forEach((l) => { l.intensity = 0; });
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
