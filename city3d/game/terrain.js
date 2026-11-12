// What the player can walk on, and the map. Both come from one look straight down at the city:
// a height map (the top surface at every half metre, read back once) and a flat-coloured plan.
import * as THREE from 'three';

export const RECT = [-480, -420, 600, 360]; // x0, z0, x1, z1 in metres
export const RES = 0.5; // metres per height cell
const W = Math.round((RECT[2] - RECT[0]) / RES), H = Math.round((RECT[3] - RECT[1]) / RES);

function topCamera() {
  const [x0, z0, x1, z1] = RECT;
  const cam = new THREE.OrthographicCamera(x0, x1, -z0, -z1, 1, 3000);
  cam.position.set(0, 1500, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0);
  cam.left = x0; cam.right = x1; cam.top = -z0; cam.bottom = -z1; cam.updateProjectionMatrix();
  return cam;
}
const inPools = (o) => { for (let p = o; p; p = p.parent) if (p.name === 'lightPools') return true; return false; };
const skip = (o) => o.isSprite || o.isPoints || o.isLine || o.name === 'sky' || o.userData.noMap || (o.material?.type === 'ShaderMaterial' && o.material.side === THREE.BackSide) || o.material?.blending === THREE.AdditiveBlending || inPools(o);

function hideFor(scene, test) {
  const hidden = [];
  scene.traverse((o) => { if ((o.isMesh || o.isPoints || o.isSprite || o.isLine) && test(o) && o.visible) { o.visible = false; hidden.push(o); } });
  return () => hidden.forEach((o) => { o.visible = true; });
}

export function buildHeightMap(renderer, scene) {
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: `varying float vY; void main(){ vec4 p = vec4(position, 1.0);
      #ifdef USE_INSTANCING
        p = instanceMatrix * p;
      #endif
      vec4 w = modelMatrix * p; vY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: 'varying float vY; void main(){ gl_FragColor = vec4(vY, 0.0, 0.0, 1.0); }',
  });
  const restore = hideFor(scene, skip);
  const fog = scene.fog, bg = scene.background; scene.fog = null; scene.background = null; scene.overrideMaterial = mat;
  const clear = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 1); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, topCamera()); renderer.setRenderTarget(null);
  renderer.setClearColor(clear, alpha); scene.overrideMaterial = null; scene.fog = fog; scene.background = bg; restore();
  const px = new Float32Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();
  const h = new Float32Array(W * H); for (let i = 0; i < W * H; i++) h[i] = px[i * 4];
  // row 0 of the read-back is the south edge
  const at = (x, z) => {
    const c = Math.floor((x - RECT[0]) / RES), r = Math.floor((RECT[3] - z) / RES);
    if (c < 0 || r < 0 || c >= W || r >= H) return 999;
    return h[r * W + c];
  };
  return { at, W, H, data: h };
}

// A flat-coloured plan of the city, north up, 2 px per metre, shaded by height.
const PLAN = { road: '#4f5a69', paved: '#c9d1dc', ground: '#eef2f7', tree: '#5d9c6c', water: '#7cc0e3', building: '#8d9aad' };
const kindOf = (key) => {
  if (['asphalt', 'runway'].includes(key)) return 'road';
  if (['sidewalk', 'curb', 'plaza', 'concrete', 'concreteDark', 'marking', 'markingYellow', 'granite', 'turf'].includes(key)) return 'paved';
  if (['snow', 'snowBank'].includes(key)) return 'ground';
  if (['treeGreen', 'treeGreen2', 'snowTree', 'trunk', 'plants'].includes(key)) return 'tree';
  if (['water', 'waterDark', 'poolWater'].includes(key)) return 'water';
  return 'building';
};
const SMALL = /^(coat|trousers|skin|hat|car|tyre|headlight|taillight)/;

export function buildPlan(renderer, scene, hm) {
  const rt = new THREE.WebGLRenderTarget(W, H); rt.texture.colorSpace = THREE.SRGBColorSpace;
  const mats = {};
  const swaps = [];
  scene.traverse((o) => {
    if (!o.isMesh || !o.visible || skip(o)) return;
    const key = o.userData.batchKey || '';
    let col;
    if (o.name === 'snowfield') col = PLAN.ground;
    else if (o.name === 'mountAurora') col = '#dfe4ec';
    else if (SMALL.test(key)) col = null;
    else col = PLAN[kindOf(key)];
    swaps.push([o, o.material, o.visible]);
    if (!col) { o.visible = false; return; }
    o.material = mats[col] || (mats[col] = new THREE.MeshBasicMaterial({ color: col }));
  });
  const restore = hideFor(scene, skip);
  const fog = scene.fog, bg = scene.background, tm = renderer.toneMapping; scene.fog = null; scene.background = new THREE.Color(PLAN.ground); renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(rt); renderer.render(scene, topCamera()); renderer.setRenderTarget(null);
  scene.fog = fog; scene.background = bg; renderer.toneMapping = tm; restore();
  for (const [o, m, v] of swaps) { o.material = m; o.visible = v; }
  const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();
  // flip to north-up, darken by height so tall buildings read, outline buildings
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); const img = g.createImageData(W, H);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const i = (r * W + c) * 4, o = ((H - 1 - r) * W + c) * 4, hh = hm.data[r * W + c];
      const hr = hm.data[r * W + Math.min(W - 1, c + 1)], hu = hm.data[Math.min(H - 1, r + 1) * W + c];
      const edge = Math.abs(hh - hr) > 1.5 || Math.abs(hh - hu) > 1.5;
      const k = hh > 2 ? Math.max(0.62, 1 - hh / 160) : 1;
      for (let j = 0; j < 3; j++) img.data[o + j] = edge ? px[i + j] * 0.55 : px[i + j] * k;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return cv;
}
