// The bronze statue of President Ho Chi Minh at the centre of downtown, after the 2015 statue on Nguyen Hue
// walking street in Ho Chi Minh City (a 4.5 m bronze figure on a 2.7 m black granite pedestal).
// The figure is the real statue: two photographs (front and back) cut out from their background
// (photos by Steffen Schmitz, Wikimedia Commons, CC BY-SA 4.0; see game/ref/CREDITS.md) on a standing card
// that turns about its upright axis to face the camera, so the statue reads the same from any street around
// the square; from behind it shows the back photo. Seen from the side the card narrows a little.
import * as THREE from 'three';

const H = 5.4; // height of the figure in metres

function photo(url) {
  const tex = new THREE.TextureLoader().load(url);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
}

// the statue on its pedestal at (x, z), facing +z (south); the monument's pedestal stays, a plaque goes on it
export function hoChiMinhStatue(scene, x, z, top = 3.47) {
  const group = new THREE.Group(); group.name = 'hcmStatue';
  const front = photo('game/img/hcm_front.webp'), back = photo('game/img/hcm_back.webp'); // both cut-outs are 0.37 wide per unit of height
  const g = new THREE.PlaneGeometry(H * 0.372, H); g.translate(0, H / 2, 0);
  const fig = new THREE.Mesh(g, front); fig.position.set(x, top - 0.04, z); fig.name = 'hcmFigure';
  fig.userData.noMap = true; // not a wall: the pedestal under it is what you bump into
  group.add(fig);
  // before each draw: turn toward the camera, and show the front or the back photo for the side it is seen from
  fig.onBeforeRender = (renderer, sc, camera) => {
    const dx = camera.position.x - x, dz = camera.position.z - z, a = Math.atan2(dx, dz), c = Math.cos(a);
    fig.rotation.y = a; fig.scale.x = 0.72 + 0.28 * Math.abs(c); fig.updateMatrixWorld();
    fig.material = c >= 0 ? front : back; // takes effect from the next draw
  };

  // black granite plaque on the front: CHỦ TỊCH HỒ CHÍ MINH 1890 – 1969
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#121214'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#e8d29a'; c.textAlign = 'center';
  c.font = 'bold 92px "Times New Roman", serif'; c.fillText('CHỦ TỊCH', 512, 200); c.fillText('HỒ CHÍ MINH', 512, 310); c.font = '64px "Times New Roman", serif'; c.fillText('1890 – 1969', 512, 420);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.3 }));
  plaque.position.set(x, 2.15, z + 1.36); group.add(plaque);
  // a warm light on the pedestal after dark
  const spot = new THREE.SpotLight(0xffe0b0, 0, 40, 0.32, 0.5, 1.2); spot.position.set(x + 2, 4.5, z + 11); spot.target.position.set(x, top + 2.8, z); group.add(spot, spot.target);
  scene.add(group);
  // the photographs carry their own daylight; dim and warm them for the night and the storm
  const TINT = { sun: [1.42, 1.38, 1.34], dusk: [0.95, 0.78, 0.62], storm: [0.75, 0.75, 0.8] };
  const setLook = (name) => { const k = TINT[name] || TINT.sun; for (const m of [front, back]) m.color.setRGB(...k); spot.intensity = name === 'dusk' ? 130 : 0; };
  setLook('sun');
  return { group, spot, setLook };
}
