// The game world: the same Aurora Haven model the magazine renders come from (src/), built once,
// with three looks a player can be in: the midnight sun, the polar twilight and a blizzard.
// Lighter than the render set-up in src/main.js: no ambient-occlusion pass, a shadow map that
// follows the player, and the interior sets are left out.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Batch } from '../src/util.js';
import { createMaterials, materials, setMode } from '../src/materials.js';
import { snowfield, streets } from '../src/ground.js';
import { downtown } from '../src/downtown.js';
import { mountAurora } from '../src/mountain.js';
import { fusionStation, foodPlant, renewablePark, energyHub, airport, stadium, greenhouses, airBase, ecoHomes } from '../src/industry.js';
import { neighbourhoods } from '../src/neighbourhoods.js';
import { buildPools, setPoolStrength, LAMPS } from '../src/lights.js';

THREE.ShaderChunk.normal_fragment_maps += '\nif ( any( isnan( normal ) ) || any( isinf( normal ) ) ) normal = nonPerturbedNormal;\n';
// one undefined pixel would spread over the whole picture through the bloom blur, so it falls back to black
THREE.ShaderChunk.dithering_fragment += '\nif ( any( isnan( gl_FragColor ) ) || any( isinf( gl_FragColor ) ) ) gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n';

export const LOOKS = {
  sun: { mode: 'sun', sunElevation: 9, sunAzimuth: 235, sunColor: '#ffc994', sunIntensity: 4.2, exposure: 0.62, hemi: 0.42, env: 0.32, fog: '#d9cdc6', fogNear: 500, fogFar: 3800 },
  dusk: { mode: 'dusk', sky: { zenith: '#0b1530', upper: '#22407a', horizon: '#a08eb4', glow: '#d27a4a', glowAzimuth: 200, ground: '#1c2436' }, exposure: 1.05, hemi: 0.55, fogNear: 300, fogFar: 3000 },
  storm: { mode: 'storm', fogNear: 25, fogFar: 230, exposure: 0.85 },
};

export function createWorld(canvas, onStep = () => {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.2, 9000);

  // ── the city ──
  const steps = [
    ['materials', () => createMaterials()],
    ['snowfield', () => scene.add(snowfield())],
  ];
  const b = new Batch();
  const towerBatch = new Batch();
  steps.push(
    ['streets', () => streets(b)],
    ['downtown', () => downtown(b, towerBatch)],
    ['mountain', () => scene.add(mountAurora(b))],
    ['fusion', () => fusionStation(b)],
    ['food', () => foodPlant(b)],
    ['renewable', () => { renewablePark(b); energyHub(b); }],
    ['airport', () => { airport(b); stadium(b); greenhouses(b); }],
    ['homes', () => { airBase(b); ecoHomes(b); neighbourhoods(b); }],
    ['merge', () => {
      const city = b.build(materials); city.name = 'city'; scene.add(city);
      const tower = towerBatch.build(materials); tower.name = 'aurora81'; scene.add(tower);
      scene.add(buildPools());
    }],
  );

  // steam over the warm lagoon and the geothermal plant
  const steamTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const g = cv.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const steamMat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0.3 });
  function steam(x, z, w, d, count, rise, size, seed, y0 = 1) {
    let a = seed; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const s = new THREE.Sprite(steamMat); const y = rnd() * rise;
      s.position.set(x + (rnd() - 0.5) * w, y0 + y, z + (rnd() - 0.5) * d);
      const k = size * (0.6 + y / rise) * (0.7 + rnd() * 0.6); s.scale.set(k, k, 1); scene.add(s);
    }
  }
  steps.push(['steam', () => { steam(36, 206, 20, 14, 26, 7, 5, 7); steam(-60, -146, 30, 6, 18, 20, 8, 11); }]);

  // falling snow around the player (shown at dusk lightly and thickly in the blizzard)
  const snowfall = (() => {
    const n = 50000, p = new Float32Array(n * 3); let a = 3; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) { const r = 3 + Math.pow(rnd(), 1.8) * 140; const t = rnd() * Math.PI * 2; p.set([Math.cos(t) * r, rnd() * 40, Math.sin(t) * r], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, map: steamTex, transparent: true, opacity: 0.9, depthWrite: false }));
    pts.visible = false; pts.frustumCulled = false; scene.add(pts); return pts;
  })();

  // ── light ──
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b7a99, 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd2a0, 3);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  const lampLights = Array.from({ length: 6 }, () => { const l = new THREE.PointLight(0xffc27f, 0, 22, 2); scene.add(l); return l; });

  const sky = new Sky(); sky.scale.setScalar(8000); sky.name = 'sky';
  const skyU = sky.material.uniforms; skyU.turbidity.value = 4; skyU.rayleigh.value = 2.4; skyU.mieCoefficient.value = 0.006; skyU.mieDirectionalG.value = 0.85;
  scene.add(sky);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3800, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zenith: { value: new THREE.Color() }, upper: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, glow: { value: new THREE.Color() }, glowDir: { value: new THREE.Vector2(0, -1) }, ground: { value: new THREE.Color() }, stars: { value: 0 } },
    vertexShader: 'varying vec3 vDir; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vDir = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 zenith, upper, horizon, glow, ground; uniform vec2 glowDir; uniform float stars; varying vec3 vDir;
      float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){ vec3 d = normalize(vDir); float h = d.y; vec3 c;
        if (h < 0.0) c = mix(horizon, ground, smoothstep(0.0, 0.08, -h)); else c = mix(mix(horizon, upper, smoothstep(0.0, 0.25, h)), zenith, smoothstep(0.2, 0.9, h));
        vec2 f = normalize(d.xz + 1e-5); c += glow * pow(max(0.0, dot(f, glowDir)), 3.0) * exp(-max(h, 0.0) * 9.0);
        if (stars > 0.0 && h > 0.05) { vec3 q = floor(d * 900.0); c += vec3(step(0.9985, hash(q)) * stars * smoothstep(0.05, 0.5, h)); }
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  dome.frustumCulled = false; dome.visible = false; scene.add(dome);
  const domeU = dome.material.uniforms;

  // ── post: a soft bloom only ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.3, 0.5, 0.9); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // reflections: the sky through PMREM, then one cube photo of downtown
  const pmrem = new THREE.PMREMGenerator(renderer);
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cubeCam = new THREE.CubeCamera(1, 7000, cubeRT); scene.add(cubeCam);
  let skyEnv = null;
  function captureEnvironment(at) {
    const bg = scene.background, skyVis = sky.visible, domeVis = dome.visible, snowVis = snowfall.visible;
    if (skyEnv) skyEnv.dispose();
    const envScene = new THREE.Scene(); const s = skyVis ? sky : dome; const parent = s.parent;
    envScene.add(s); s.visible = true; skyEnv = pmrem.fromScene(envScene, 0, 0.1, 9000); parent.add(s);
    scene.environment = skyEnv.texture; scene.background = null; if (!skyVis) dome.visible = true; snowfall.visible = false;
    cubeCam.position.set(...at); cubeCam.update(renderer, scene); cubeRT.texture.needsPMREMUpdate = true;
    scene.environment = cubeRT.texture; scene.background = bg; dome.visible = domeVis; snowfall.visible = snowVis;
  }

  const dirFrom = (el, az) => { el = THREE.MathUtils.degToRad(el); az = THREE.MathUtils.degToRad(az); return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); };
  let look = 'sun';
  function setLook(name) {
    look = name; const L = LOOKS[name];
    sky.visible = false; dome.visible = false; snowfall.visible = name !== 'sun';
    setMode(L.mode, L.env ?? (L.mode === 'sun' ? 0.45 : 0.6));
    setPoolStrength(L.mode === 'dusk' ? 1 : 0);
    if (L.mode === 'sun') {
      const dir = dirFrom(L.sunElevation, L.sunAzimuth); skyU.sunPosition.value.copy(dir); sky.visible = true; scene.background = null;
      scene.fog = new THREE.Fog(L.fog, L.fogNear, L.fogFar);
      sun.color.set(L.sunColor); sun.intensity = L.sunIntensity; sun.userData.dir = dir;
      hemi.color.set(0xbcd4ff); hemi.groundColor.set(0x8090a8); hemi.intensity = L.hemi;
      renderer.toneMappingExposure = L.exposure; bloom.strength = 0.22; bloom.threshold = 0.92;
      steamMat.color.set(0xffffff);
    } else if (L.mode === 'dusk') {
      const S = L.sky; domeU.zenith.value.set(S.zenith); domeU.upper.value.set(S.upper); domeU.horizon.value.set(S.horizon); domeU.glow.value.set(S.glow); domeU.ground.value.set(S.ground);
      const az = THREE.MathUtils.degToRad(S.glowAzimuth); domeU.glowDir.value.set(Math.sin(az), -Math.cos(az)); domeU.stars.value = 0.6;
      dome.visible = true; scene.background = null; scene.fog = new THREE.Fog(S.horizon, L.fogNear, L.fogFar);
      sun.userData.dir = dirFrom(25, 200); sun.color.set(0x9fb6e8); sun.intensity = 0.45;
      hemi.color.set(0x6f8fd0); hemi.groundColor.set(0x2c3550); hemi.intensity = L.hemi;
      renderer.toneMappingExposure = L.exposure; bloom.strength = 0.55; bloom.threshold = 0.82;
      steamMat.color.set(0xb7c4e0); snowfall.material.size = 0.12;
    } else {
      scene.background = new THREE.Color(0xb9c2cd);
      domeU.zenith.value.set(0x5f6b7e); domeU.upper.value.set(0x9aa6b6); domeU.horizon.value.set(0xc9d0d9); domeU.glow.value.set(0); domeU.ground.value.set(0xb9c2cd); domeU.stars.value = 0;
      scene.fog = new THREE.Fog(0xb9c2cd, L.fogNear, L.fogFar);
      sun.userData.dir = new THREE.Vector3(0.3, 0.8, 0.5).normalize(); sun.color.set(0xdfe6f0); sun.intensity = 0.7;
      hemi.color.set(0xd6dde8); hemi.groundColor.set(0x9aa3b0); hemi.intensity = 1.6;
      renderer.toneMappingExposure = L.exposure; bloom.strength = 0.1; bloom.threshold = 0.95;
      snowfall.material.size = 0.22;
    }
    lampAt = null;
  }

  // the shadow box and the nearest lamps follow the player
  let lampAt = null;
  function follow(p) {
    const dir = sun.userData.dir || new THREE.Vector3(0, 1, 0), R = 110;
    sun.target.position.set(p.x, 0, p.z); sun.position.set(p.x + dir.x * 900, dir.y * 900, p.z + dir.z * 900);
    const c = sun.shadow.camera; c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.near = 10; c.far = 2000; c.updateProjectionMatrix();
    sun.target.updateMatrixWorld();
    snowfall.position.set(p.x, 0, p.z);
    if (look === 'dusk' && (!lampAt || Math.hypot(p.x - lampAt.x, p.z - lampAt.z) > 12)) {
      lampAt = { x: p.x, z: p.z };
      const near = LAMPS.map((l) => [l, (l.x - p.x) ** 2 + (l.z - p.z) ** 2]).sort((a, c2) => a[1] - c2[1]).slice(0, lampLights.length);
      lampLights.forEach((pl, i) => { const e = near[i]; if (!e) { pl.intensity = 0; return; } pl.position.set(e[0].x, e[0].y - 0.4, e[0].z); pl.color.set(e[0].color); pl.intensity = 22; });
    } else if (look !== 'dusk') lampLights.forEach((pl) => { pl.intensity = 0; });
  }

  const Q = { shadows: true, bloom: true, ratio: Math.min(devicePixelRatio, 1.5) };
  function setQuality(high) {
    Q.shadows = high; Q.bloom = high; Q.ratio = high ? Math.min(devicePixelRatio, 1.5) : 0.75;
    renderer.shadowMap.enabled = high; sun.castShadow = high;
    scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
    resize();
  }
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Q.ratio); renderer.setSize(w, h, false); composer.setPixelRatio(Q.ratio); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function render() { if (Q.bloom) composer.render(); else renderer.render(scene, camera); }

  // builds the city a step at a time so the loading bar can move
  async function build() {
    for (let i = 0; i < steps.length; i++) { onStep(steps[i][0], i / steps.length); await new Promise((r) => setTimeout(r, 16)); steps[i][1](); }
    onStep('light', 1);
    setLook('sun'); follow(new THREE.Vector3(0, 0, 30)); captureEnvironment([0, 25, 20]);
  }

  return { renderer, scene, camera, sky, dome, snowfall, sun, build, setLook, follow, captureEnvironment, resize, render, setQuality, get look() { return look; } };
}
