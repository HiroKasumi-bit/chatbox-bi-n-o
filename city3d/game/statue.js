// The bronze statue of President Ho Chi Minh at the centre of downtown, modelled on the 2015 statue on
// Nguyen Hue walking street in Ho Chi Minh City (4.5 m bronze figure on a 2.7 m black granite pedestal):
// standing, his right hand raised in greeting, the left arm at his side, in the four-pocket jacket with a
// stand-up collar, loose trousers and sandals; hair combed back, a thin goatee.
// Built at human size in metres (feet at y = 0, facing +z, so his right hand is on -x), then scaled so the
// figure stands about 1.5x the height of its pedestal, as on Nguyen Hue.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const M = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz));

// a smooth tapered tube along points (for sleeves, trouser legs, fingers)
function tube(pts, r0, r1, seg = 24, radial = 14, squash = 1) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)));
  const g = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = g.attributes.position, frames = curve.computeFrenetFrames(seg, false);
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, r = r0 + (r1 - r0) * t, c = curve.getPointAt(t);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j, v = V(pos.getX(k), pos.getY(k), pos.getZ(k)).sub(c);
      const n = frames.normals[i], bn = frames.binormals[i];
      const a = v.dot(n), b = v.dot(bn);
      pos.setXYZ(k, c.x + (n.x * a + bn.x * b * squash) * r, c.y + (n.y * a + bn.y * b * squash) * r, c.z + (n.z * a + bn.z * b * squash) * r);
    }
  }
  g.computeVertexNormals();
  // close the ends
  const caps = [0, 1].map((e) => { const s = new THREE.SphereGeometry(e ? r1 : r0, radial, 8); s.translate(...curve.getPointAt(e).toArray()); return s; });
  return [g, ...caps];
}
const lathe = (prof, seg = 40, sz = 1) => { const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg); g.scale(1, 1, sz); return g; };

function head() {
  // a sculpted head: high forehead, narrow cheeks, a long chin carrying the goatee, hair swept back
  const g = new THREE.SphereGeometry(1, 48, 36), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    x *= 0.78; y *= 1.08; z *= 0.92;
    if (y < 0) { const k = 1 - Math.min(1, -y) * 0.32; x *= k; z *= 1 - Math.min(1, -y) * 0.12; y *= 1.12; } // narrower, longer jaw
    if (z > 0.55 && y > 0.25 && y < 0.6) z += 0.05; // brow ridge
    if (z > 0.6 && Math.abs(x) > 0.16 && Math.abs(x) < 0.42 && y > 0.02 && y < 0.22) z -= 0.07; // eye sockets
    if (z > 0.5 && Math.abs(x) > 0.38 && y < 0.05 && y > -0.4) { x *= 0.94; } // hollow cheeks
    if (z > 0.75 && Math.abs(x) < 0.12 && y > -0.25 && y < 0.18) z += 0.16 * (1 - Math.abs(x) / 0.12) * (1 - Math.abs(y + 0.03) / 0.22); // nose
    if (y > 0.35) { z -= 0.06 * (y - 0.35); y += 0.04 * (1 - Math.abs(z)); } // high domed crown
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const parts = [g];
  // hair: a cap combed back from a high hairline
  const hair = new THREE.SphereGeometry(1.03, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42); hair.scale(0.8, 1.12, 0.95); hair.rotateX(-0.42); hair.translate(0, 0.06, -0.06); parts.push(hair);
  for (const s of [-1, 1]) { const ear = new THREE.SphereGeometry(0.2, 12, 10); ear.scale(0.35, 1, 0.65); ear.translate(s * 0.8, 0.05, -0.05); parts.push(ear); }
  // goatee: thin and pointed, from the chin down onto the collar; moustache above the lip
  const beard = new THREE.ConeGeometry(0.17, 0.75, 16); beard.rotateX(Math.PI); beard.rotateX(-0.25); beard.translate(0, -1.32, 0.48); parts.push(beard);
  const chin = new THREE.SphereGeometry(0.2, 14, 10); chin.scale(1, 0.9, 0.8); chin.translate(0, -1.02, 0.55); parts.push(chin);
  const must = new THREE.TorusGeometry(0.16, 0.035, 6, 16, Math.PI); must.rotateX(Math.PI); must.translate(0, -0.42, 0.86); parts.push(must);
  return mergeGeometries(parts.map((q) => q.index ? q.toNonIndexed() : q).map((q) => { for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv'].includes(k)) q.deleteAttribute(k); return q; }));
}

function figure() {
  const parts = [];
  const add = (g, m) => { if (m) g.applyMatrix4(m); parts.push(g); };
  // sandals and feet
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.11, 0.025, 0.27), M(s * 0.11, 0.013, 0.03));
    add(new THREE.CapsuleGeometry(0.045, 0.16, 4, 10), M(s * 0.11, 0.05, 0.05, Math.PI / 2, 0, 0, 1, 1, 0.8));
    add(new THREE.TorusGeometry(0.05, 0.012, 6, 14, Math.PI), M(s * 0.11, 0.04, 0.09, 0, 0, 0));
  }
  // loose trousers, slightly apart, with the creases of the cloth
  for (const s of [-1, 1]) for (const g of tube([[s * 0.11, 0.08, 0.02], [s * 0.107, 0.5, 0.0], [s * 0.1, 0.95, 0]], 0.082, 0.095, 16, 18)) add(g);
  // the jacket: a turned body, flared over the hips, to mid-thigh; flattened front to back
  add(lathe([[0, 0.8], [0.2, 0.81], [0.195, 0.92], [0.185, 1.0], [0.178, 1.1], [0.19, 1.24], [0.2, 1.34], [0.19, 1.41], [0.15, 1.47], [0.075, 1.5], [0, 1.5]], 40, 0.72));
  // stand-up collar, shoulders
  add(new THREE.CylinderGeometry(0.068, 0.076, 0.08, 18, 1, true), M(0, 1.535, 0.005));
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.075, 14, 10), M(s * 0.19, 1.43, 0, 0, 0, 0, 1, 0.8, 1));
  // four patch pockets with flaps, a row of buttons down the front
  const front = (x, y, w, h, d = 0.012) => add(new THREE.BoxGeometry(w, h, d), M(x, y, 0.147 + (1.2 - Math.abs(y - 1.2)) * 0.0));
  for (const s of [-1, 1]) {
    front(s * 0.09, 1.3, 0.085, 0.09); front(s * 0.09, 1.355, 0.095, 0.03, 0.02);   // chest pockets and flaps
    add(new THREE.BoxGeometry(0.11, 0.13, 0.014), M(s * 0.1, 0.94, 0.15)); add(new THREE.BoxGeometry(0.12, 0.035, 0.022), M(s * 0.1, 1.015, 0.152)); // lower pockets
  }
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.012, 8, 6), M(0, 1.43 - i * 0.13, 0.152));
  add(new THREE.BoxGeometry(0.012, 0.66, 0.01), M(0.01, 1.13, 0.15)); // the front opening
  // right arm raised in greeting: upper arm out and forward, forearm up, open palm to the people (his right is -x)
  for (const g of tube([[-0.2, 1.42, 0], [-0.33, 1.52, 0.06], [-0.4, 1.64, 0.1]], 0.058, 0.05, 16, 14)) add(g);
  for (const g of tube([[-0.4, 1.64, 0.1], [-0.4, 1.8, 0.11], [-0.39, 1.93, 0.1]], 0.05, 0.04, 16, 14)) add(g);
  add(new THREE.BoxGeometry(0.075, 0.09, 0.024), M(-0.39, 2.01, 0.11, 0.1, 0, 0.05));            // palm
  for (let f = 0; f < 4; f++) for (const g of tube([[-0.42 + f * 0.02, 2.05, 0.11], [-0.422 + f * 0.021, 2.12 - Math.abs(f - 1.5) * 0.008, 0.115]], 0.009, 0.008, 4, 6)) add(g);
  for (const g of tube([[-0.355, 2.0, 0.11], [-0.33, 2.04, 0.125]], 0.011, 0.009, 4, 6)) add(g);  // thumb
  // left arm hanging at his side, a little away from the jacket, hand relaxed
  for (const g of tube([[0.2, 1.42, 0], [0.235, 1.18, -0.01], [0.245, 0.95, 0.03]], 0.058, 0.045, 16, 14)) add(g);
  add(new THREE.SphereGeometry(0.045, 12, 10), M(0.245, 0.89, 0.04, 0, 0, 0, 0.8, 1.3, 0.9));
  // neck and head
  add(new THREE.CylinderGeometry(0.05, 0.056, 0.07, 14), M(0, 1.555, 0.005));
  add(head(), M(0, 1.69, 0.012, 0, 0, 0, 0.112, 0.112, 0.112));
  const clean = (g) => { let q = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv'].includes(k)) q.deleteAttribute(k); if (!q.attributes.uv) q.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); return q; };
  return mergeGeometries(parts.map(clean)); // keep each part's smooth normals
}

// the statue on its pedestal at (x, z); the pedestal of the monument stays, only its top block and plaque change
export function hoChiMinhStatue(scene, x, z, top = 3.47) {
  const group = new THREE.Group(); group.name = 'hcmStatue';
  const bronze = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.42, metalness: 0.85 });
  const fig = new THREE.Mesh(figure(), bronze); fig.scale.setScalar(2.8); fig.castShadow = true; fig.receiveShadow = true;
  fig.position.set(x, top, z); group.add(fig);
  // black granite plaque on the front: CHỦ TỊCH HỒ CHÍ MINH 1890 – 1969
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#121214'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#e8d29a'; c.textAlign = 'center';
  c.font = 'bold 92px "Times New Roman", serif'; c.fillText('CHỦ TỊCH', 512, 200); c.fillText('HỒ CHÍ MINH', 512, 310); c.font = '64px "Times New Roman", serif'; c.fillText('1890 – 1969', 512, 420);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.3 }));
  plaque.position.set(x, 2.15, z + 1.36); group.add(plaque);
  // a warm light on the statue after dark
  const spot = new THREE.SpotLight(0xffe0b0, 0, 40, 0.32, 0.5, 1.2); spot.position.set(x + 2, 4.5, z + 11); spot.target.position.set(x, top + 2.8, z); group.add(spot, spot.target);
  scene.add(group);
  return { group, spot };
}
