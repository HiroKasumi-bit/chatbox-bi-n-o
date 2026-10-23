// Light on the ground at dusk and at night: pools under street lamps, warm light spilling from
// shop windows onto the sidewalks and car headlight beams. They are drawn as soft glowing
// decals; the lamps nearest the camera also get real point lights (see main.js).
import * as THREE from 'three';

export const POOLS = []; // { kind, x, y, z, w, d, ry, color }
export const LAMPS = []; // lamp heads: { x, y, z, color }

export function addPool(kind, x, z, w, d, ry = 0, color = 0xffc68a, y = 0.34) {
  POOLS.push({ kind, x, y, z, w, d, ry, color });
}

export function addLamp(x, y, z, color = 0xffc68a, radius = 9) {
  LAMPS.push({ x, y, z, color });
  addPool('round', x, z, radius * 2, radius * 2, 0, color);
}

function gradientTexture(kind) {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = (x + 0.5) / S;
      const v = (y + 0.5) / S;
      let a;
      if (kind === 'round') {
        // Bright under the lamp, falling off softly like inverse-square light on the ground.
        const r = Math.hypot(u - 0.5, v - 0.5) * 2;
        a = r >= 1 ? 0 : Math.pow(1 - r, 2.2) * (1 / (1 + 6 * r * r));
      } else if (kind === 'spill') {
        // Strongest against the shop front (v = 0), fading out across the sidewalk.
        const edge = Math.min(1, Math.min(u, 1 - u) * 8);
        a = Math.pow(1 - v, 2.4) * edge;
      } else {
        // Headlight beam: a widening wedge that fades with distance (v along the beam).
        const half = 0.12 + v * 0.38;
        const off = Math.abs(u - 0.5);
        a = off > half ? 0 : Math.pow(1 - off / half, 1.5) * Math.pow(1 - v, 1.6) * Math.min(1, v * 10);
      }
      const k = (y * S + x) * 4;
      const c = Math.round(Math.max(0, Math.min(1, a)) * 255);
      img.data[k] = img.data[k + 1] = img.data[k + 2] = c;
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const poolMaterials = [];

export function buildPools() {
  const group = new THREE.Group();
  group.name = 'lightPools';
  const kinds = ['round', 'spill', 'beam'];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const col = new THREE.Color();
  for (const kind of kinds) {
    const list = POOLS.filter((p) => p.kind === kind);
    if (!list.length) continue;
    const mat = new THREE.MeshBasicMaterial({
      map: gradientTexture(kind), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    poolMaterials.push([mat, kind]);
    // The plane lies flat; for spills and beams its +v edge points away from the source.
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    if (kind !== 'round') geo.translate(0, 0, 0.5);
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((p, i) => {
      e.set(0, p.ry, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.w, 1, p.d));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, col.set(p.color));
    });
    mesh.renderOrder = 2;
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  return group;
}

// How bright the decals are in each look; 0 hides them.
export function setPoolStrength(k) {
  for (const [mat, kind] of poolMaterials) {
    mat.color.setScalar(k * (kind === 'round' ? 1 : kind === 'spill' ? 0.75 : 0.6));
    mat.visible = k > 0;
  }
}
