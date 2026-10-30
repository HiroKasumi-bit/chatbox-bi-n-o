// The outer districts: the Fusion Power Station, the Snow-to-Food & Water Plant, the
// Northern Renewable Park, the Energy Hub & Rescue Station, the airport, the stadium,
// the greenhouses, the air base and the eco-homes.
import * as THREE from 'three';
import { matrix, rng } from './util.js';
import { building, house, pine, lamp, car, truck, fence, pipeRun, bench, roofPrism, vault } from './kit.js';
import { DISTRICTS, FOOD_STAGES, FUSION_STAGES } from './layout.js';
import { road } from './ground.js';

const R = rng(2026);
const st = (list, n) => list.find((s) => s.n === n);

// Barrel-vaulted hall (half cylinder roof) along z.
function vaultHall(b, x, z, w, d, h, wallKey = 'f_industrial', roofKey = 'panel') {
  building(b, { x, z, w, d, h, facade: wallKey.replace('f_', ''), units: false, parapet: false });
  vault(b, roofKey, x, h, z, w / 2, d, 0.45);
}

function tank(b, x, z, r, h, key = 'panel', dome = true) {
  b.cyl(key, x, 0, z, r, r, h, 20);
  if (dome) b.add(key, new THREE.SphereGeometry(r, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), matrix(x, h, z, 0, 1, 0.35, 1));
}

function siteFence(b, rect) {
  const [x0, z0, x1, z1] = rect;
  fence(b, x0, z0, x1, z0, 6);
  fence(b, x1, z0, x1, z1, 6);
  fence(b, x1, z1, x0, z1, 6);
  fence(b, x0, z1, x0, z0 + 30, 6);
}

export function fusionStation(b) {
  const s3 = st(FUSION_STAGES, '3');
  // Stage 3: the tokamak hall, a white drum and dome with a glowing violet ring.
  b.cyl('panel', s3.x, 0, s3.z, 22, 22, 20, 48);
  b.add('panel', new THREE.SphereGeometry(22, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), matrix(s3.x, 20, s3.z, 0, 1, 0.5, 1));
  b.add('purple', new THREE.TorusGeometry(22.25, 0.45, 8, 72), matrix(s3.x, 13, s3.z, 0, 1, 1, 1, Math.PI / 2));
  b.add('purple', new THREE.TorusGeometry(22.25, 0.25, 8, 72), matrix(s3.x, 18.5, s3.z, 0, 1, 1, 1, Math.PI / 2));
  b.add('metalDark', new THREE.TorusGeometry(22.3, 0.6, 8, 72), matrix(s3.x, 3, s3.z, 0, 1, 1, 1, Math.PI / 2));
  b.cyl('purple', s3.x, 30.5, s3.z, 3, 3, 1.2, 24);
  // Stage 4: power conversion hall, supercritical-CO2 turbines and dry cooling banks.
  const s4 = st(FUSION_STAGES, '4');
  building(b, { x: s4.x, z: s4.z, w: 30, d: 40, h: 16, facade: 'industrial' });
  for (let i = 0; i < 3; i++) b.cyl('metal', s4.x - 8 + i * 8, 16, s4.z - 10, 2, 2.4, 5, 16);
  for (let i = 0; i < 4; i++) {
    building(b, { x: s4.x - 2 + (i % 2) * 18, z: 258 + Math.floor(i / 2) * 0, w: 14, d: 10, h: 5, facade: 'industrial', units: false });
    for (let k = 0; k < 3; k++) b.cyl('metalDark', s4.x - 6 + (i % 2) * 18 + k * 4, 5, 258, 1.6, 1.6, 0.6, 16);
  }
  // Stage 1: heavy-water separation, with isotope-exchange columns.
  const s1 = st(FUSION_STAGES, '1');
  building(b, { x: s1.x, z: s1.z, w: 26, d: 16, h: 12, facade: 'industrial' });
  for (let i = 0; i < 4; i++) b.cyl('metal', s1.x - 9 + i * 6, 0, s1.z + 13, 1.5, 1.5, 26, 14);
  b.add('steel', new THREE.BoxGeometry(22, 0.4, 3), matrix(s1.x, 20, s1.z + 13));
  // Stage 2: lithium blanket and tritium fuel cycle.
  const s2 = st(FUSION_STAGES, '2');
  building(b, { x: s2.x, z: s2.z, w: 30, d: 18, h: 10, facade: 'industrial' });
  b.add('purple', new THREE.BoxGeometry(30.3, 0.6, 18.3), matrix(s2.x, 8, s2.z)); // light band (walls only reach 10 m)
  // Stage 5: plasma waste converter with two gasifier vessels and a glowing viewport.
  const s5 = st(FUSION_STAGES, '5');
  building(b, { x: s5.x, z: s5.z, w: 30, d: 20, h: 14, facade: 'industrial' });
  for (let i = 0; i < 2; i++) b.cyl('metal', s5.x - 6 + i * 12, 0, s5.z + 16, 3.5, 3.5, 20, 20);
  b.add('orangeGlow', new THREE.BoxGeometry(8, 3, 0.4), matrix(s5.x, 7, s5.z + 10.1));
  // C: control & visitor centre, a curved glass pavilion facing the reactor.
  const sc = st(FUSION_STAGES, 'C');
  b.add('glassWarm', new THREE.CylinderGeometry(16, 16, 9, 32, 1, false, -Math.PI * 0.35, Math.PI * 0.7), matrix(sc.x, 4.5, sc.z));
  b.add('snowRoof', new THREE.CylinderGeometry(16.5, 16.5, 0.6, 32, 1, false, -Math.PI * 0.35, Math.PI * 0.7), matrix(sc.x, 9.3, sc.z));
  // Heat main to the food plant and the city, on raised supports.
  pipeRun(b, [[320, 210], [320, 128], [140, 128], [128, 128], [128, -20]], 5, 0.9);
  pipeRun(b, [[316, 210], [316, 128]], 5, 0.7);
  pipeRun(b, [[300, 205], [300, 214], [262, 214]], 4, 0.6);
  // Internal roads and the fence.
  road(b, 150, 200, 330, 200, { width: 8, sidewalk: false, lamps: 30 });
  road(b, 205, 150, 205, 265, { width: 8, sidewalk: false });
  siteFence(b, DISTRICTS.fusion.rect);
  for (let i = 0; i < 6; i++) truck(b, 160 + i * 6, 262, Math.PI / 2, 'vehicleWhite');
}

export function foodPlant(b) {
  // Stage 1: snow harvest & melt hall with the stockpile mound and a conveyor.
  const s1 = st(FOOD_STAGES, '1');
  vaultHall(b, s1.x, s1.z, 28, 40, 9);
  const sp = st(FOOD_STAGES, 'S');
  b.add('snowBank', new THREE.SphereGeometry(1, 24, 12), matrix(sp.x, 0, sp.z, 0, 18, 8, 11));
  b.add('steel', new THREE.BoxGeometry(2.5, 0.8, 22), matrix(sp.x - 6, 6, sp.z + 14, 0, 1, 1, 1, -0.32));
  for (let i = 0; i < 3; i++) truck(b, sp.x + 20, sp.z - 6 + i * 7, 0, 'vehicleBlue');
  // Stage 2: drinking water & mineral works, with two reservoir tanks.
  const s2 = st(FOOD_STAGES, '2');
  building(b, { x: s2.x, z: s2.z - 4, w: 22, d: 26, h: 10, facade: 'industrial' });
  tank(b, s2.x - 5, s2.z + 18, 5.5, 7);
  tank(b, s2.x + 7, s2.z + 18, 5.5, 7);
  // Stage 3: electrolysis, air capture & green ammonia, with spherical gas tanks.
  const s3 = st(FOOD_STAGES, '3');
  building(b, { x: s3.x, z: s3.z - 4, w: 24, d: 30, h: 12, facade: 'industrial' });
  for (let i = 0; i < 3; i++) {
    b.add('panel', new THREE.SphereGeometry(4.2, 20, 14), matrix(s3.x - 8 + i * 8, 8, s3.z + 19));
    for (const [dx, dz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) b.add('steel', new THREE.BoxGeometry(0.3, 6, 0.3), matrix(s3.x - 8 + i * 8 + dx, 3, s3.z + 19 + dz));
  }
  b.add('teal', new THREE.BoxGeometry(24.3, 0.6, 30.3), matrix(s3.x, 10, s3.z - 4));
  // Stage 4: carbon-fixation chemistry hall with reactor columns.
  const s4 = st(FOOD_STAGES, '4');
  building(b, { x: s4.x, z: s4.z - 4, w: 22, d: 30, h: 14, facade: 'industrial' });
  for (let i = 0; i < 4; i++) b.cyl('metal', s4.x - 7.5 + i * 5, 0, s4.z + 17, 1.6, 1.6, 22, 14);
  b.add('steel', new THREE.BoxGeometry(20, 0.4, 3), matrix(s4.x, 16, s4.z + 17));
  // Stage 5: six bioreactor silos with teal bands and a walkway on top.
  const s5 = st(FOOD_STAGES, '5');
  for (let i = 0; i < 6; i++) {
    const px = s5.x - 6 + (i % 2) * 12;
    const pz = s5.z - 16 + Math.floor(i / 2) * 12;
    tank(b, px, pz, 4.4, 24, 'panel');
    b.add('teal', new THREE.CylinderGeometry(4.5, 4.5, 1.2, 24, 1, true), matrix(px, 16, pz));
    b.add('teal', new THREE.CylinderGeometry(4.5, 4.5, 0.5, 24, 1, true), matrix(px, 20, pz));
  }
  b.add('steel', new THREE.BoxGeometry(1.6, 0.4, 26), matrix(s5.x, 25.8, s5.z - 4));
  // Stage 6: food kitchen, bottling & distribution, with heated electric vans.
  const s6 = st(FOOD_STAGES, '6');
  building(b, { x: s6.x, z: s6.z, w: 22, d: 22, h: 9, facade: 'industrial' });
  for (let i = 0; i < 4; i++) b.add('teal', new THREE.BoxGeometry(3.6, 4, 0.3), matrix(s6.x - 7 + i * 4.6, 2, s6.z + 11.1));
  for (let i = 0; i < 5; i++) truck(b, s6.x - 9 + i * 4.5, s6.z + 18, 0, 'vehicleWhite');
  // Pipe rack between the halls.
  pipeRun(b, [[s1.x - 14, 52], [s5.x + 8, 52]], 6, 0.5);
  pipeRun(b, [[s1.x - 14, 50], [s5.x + 8, 50]], 6, 0.35, 'teal');
  pipeRun(b, [[320, 128], [320, 100]], 5, 0.8);
  siteFence(b, DISTRICTS.foodPlant.rect);
}

function turbine(b, x, z, h = 42, phase = 0) {
  b.cyl('blade', x, 0, z, 1.0, 1.9, h, 16);
  b.add('blade', new THREE.BoxGeometry(2.4, 2.4, 7), matrix(x, h + 1, z + 0.8));
  b.add('aviation', new THREE.SphereGeometry(0.35, 8, 6), matrix(x, h + 2.4, z + 2.5));
  const hub = new THREE.Vector3(x, h + 1, z - 3);
  b.add('blade', new THREE.SphereGeometry(1.1, 12, 8), matrix(hub.x, hub.y, hub.z, 0, 1, 1, 1.4));
  const blade = new THREE.CylinderGeometry(0.22, 0.75, 21, 4).translate(0, 10.8, 0).scale(1, 1, 0.35);
  for (let k = 0; k < 3; k++) b.add('blade', blade, matrix(hub.x, hub.y, hub.z - 0.6, 0, 1, 1, 1, 0, phase + (k * Math.PI * 2) / 3));
}

export function renewablePark(b) {
  // Ice-Proof Wind Farm: two offset rows on the windy northern edge.
  for (let i = 0; i < 9; i++) turbine(b, -280 + i * 46, -330, 42, i * 0.7);
  for (let i = 0; i < 8; i++) turbine(b, -257 + i * 46, -295, 40, i * 1.3 + 0.4);
  // Bifacial Solar Farm: steep double-sided rows in front of the lookout.
  for (let row = 0; row < 7; row++) {
    const z = -262 + row * 7;
    for (let k = 0; k < 12; k++) {
      const x = -110 + k * 14;
      b.add('solar', new THREE.BoxGeometry(12.6, 0.12, 3.2), matrix(x, 2.2, z, 0, 1, 1, 1, -0.85));
      b.add('panelGrey', new THREE.BoxGeometry(12.8, 0.08, 0.12), matrix(x, 1.0, z + 1.05));
      b.add('steel', new THREE.BoxGeometry(0.15, 2.2, 0.15), matrix(x - 5, 1.1, z));
      b.add('steel', new THREE.BoxGeometry(0.15, 2.2, 0.15), matrix(x + 5, 1.1, z));
    }
  }
  road(b, -20, -270, -20, -212, { width: 5, sidewalk: false, marking: false }); // service spine
  // Water Recycling Line: intake, pumps, two settling basins, filters, UV and the water tower.
  const z = -238;
  b.add('stone', new THREE.BoxGeometry(16, 0.8, 11), matrix(-282, 0.4, z));
  b.add('waterDark', new THREE.BoxGeometry(14.5, 0.3, 9.5), matrix(-282, 0.85, z));
  building(b, { x: -264, z, w: 8, d: 8, h: 5, facade: 'industrial', units: false });
  for (const bx of [-246, -228]) {
    b.cyl('stone', bx, 0, z, 7.5, 7.5, 1.2, 40);
    b.cyl('waterDark', bx, 0.2, z, 6.8, 6.8, 1.1, 40);
    b.add('steel', new THREE.BoxGeometry(15, 0.5, 1), matrix(bx, 1.6, z));
  }
  building(b, { x: -208, z, w: 14, d: 10, h: 6, facade: 'industrial' });
  building(b, { x: -190, z, w: 10, d: 8, h: 5, facade: 'industrial' });
  b.add('blueLight', new THREE.BoxGeometry(10.2, 0.4, 8.2), matrix(-190, 4, z));
  for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) b.add('steel', new THREE.BoxGeometry(0.5, 16, 0.5), matrix(-170 + dx, 8, z + dz));
  tank(b, -170, z, 5, 6, 'panel');
  b.add('panel', new THREE.CylinderGeometry(5, 5, 6, 24), matrix(-170, 19, z));
  b.add('panel', new THREE.ConeGeometry(5.3, 2.2, 24), matrix(-170, 23.1, z));
  pipeRun(b, [[-275, z + 6], [-170, z + 6]], 1.4, 0.4);
  // Battery bank and grid substation.
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) building(b, { x: 78 + j * 16, z: -200 + i * 4.2, w: 13, d: 2.8, h: 2.8, facade: 'industrial', units: false, parapet: false });
  for (let i = 0; i < 4; i++) {
    b.add('metalDark', new THREE.BoxGeometry(3, 3.4, 4), matrix(-118 + i * 7, 1.7, -205));
    b.add('steel', new THREE.BoxGeometry(0.3, 10, 0.3), matrix(-121 + i * 7, 5, -198));
  }
  b.add('steel', new THREE.BoxGeometry(28, 0.3, 0.3), matrix(-107, 10, -198));
  // Aurora Horizon Lookout: a heated terrace facing the park, and the snowbreak belt of pines.
  b.add('plaza', new THREE.BoxGeometry(30, 0.6, 10), matrix(0, 0.3, -206));
  for (let i = 0; i < 5; i++) {
    bench(b, -12 + i * 6, -208, 0);
    lamp(b, -14 + i * 7, -201.5, 4);
  }
  for (let x = -290; x < 130; x += 7) {
    if (Math.abs(x) < 24 || Math.abs(x + 20) < 6) continue;
    pine(b, x + (R() - 0.5) * 4, -196 + (R() - 0.5) * 6, 0.9 + R() * 0.4);
    if (R() < 0.6) pine(b, x + (R() - 0.5) * 4, -188 + (R() - 0.5) * 4, 0.8 + R() * 0.3);
  }
}

export function energyHub(b) {
  // Geothermal Power Plant with wellheads, pipes and the heat storage tank.
  building(b, { x: -45, z: -168, w: 34, d: 20, h: 12, facade: 'industrial' });
  b.add('orangeGlow', new THREE.BoxGeometry(34.3, 0.5, 20.3), matrix(-45, 9, -168));
  for (let i = 0; i < 4; i++) {
    b.cyl('metal', -66 + i * 7, 0, -146, 1.2, 1.2, 3, 12);
    b.cyl('red', -66 + i * 7, 3, -146, 0.6, 0.6, 0.8, 10);
  }
  pipeRun(b, [[-66, -149], [-40, -149], [-40, -157]], 3, 0.4);
  b.cyl('panel', -88, 0, -168, 9, 9, 16, 32);
  b.add('panel', new THREE.SphereGeometry(9, 32, 8, 0, Math.PI * 2, 0, Math.PI / 2), matrix(-88, 16, -168, 0, 1, 0.3, 1));
  // Polar Rescue and Resilience Station: a heated hangar with red doors and a helipad.
  vaultHall(b, 45, -170, 36, 22, 9, 'f_brick', 'panelGrey');
  for (let i = 0; i < 4; i++) b.add('redBright', new THREE.BoxGeometry(6.8, 6.4, 0.3), matrix(32 + i * 8.6, 3.2, -158.9));
  for (let i = 0; i < 4; i++) truck(b, 32 + i * 8.6, -150, 0);
  b.add('concreteDark', new THREE.CylinderGeometry(9, 9, 0.3, 32), matrix(78, 0.15, -170));
  b.add('marking', new THREE.TorusGeometry(7.6, 0.25, 4, 40), matrix(78, 0.32, -170, 0, 1, 1, 1, Math.PI / 2));
  b.add('markingYellow', new THREE.BoxGeometry(0.8, 0.05, 6), matrix(76.5, 0.33, -170));
  b.add('markingYellow', new THREE.BoxGeometry(0.8, 0.05, 6), matrix(79.5, 0.33, -170));
  b.add('markingYellow', new THREE.BoxGeometry(3.8, 0.05, 0.8), matrix(78, 0.33, -170));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.add('blueLight', new THREE.SphereGeometry(0.25, 6, 4), matrix(78 + Math.cos(a) * 8.6, 0.4, -170 + Math.sin(a) * 8.6));
  }
}

function jet(b, x, y, z, ry, pitch = 0) {
  const base = matrix(x, y, z, ry, 1, 1, 1, pitch);
  const at = (m) => base.clone().multiply(m);
  b.add('jet', new THREE.CylinderGeometry(2.9, 2.9, 44, 20), at(matrix(0, 0, 0, 0, 1, 1, 1, Math.PI / 2)));
  b.add('jet', new THREE.SphereGeometry(2.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), at(matrix(0, 0, -22, 0, 1, 1, 2.2, -Math.PI / 2)));
  b.add('jet', new THREE.ConeGeometry(2.9, 12, 20), at(matrix(0, 0.6, 28, 0, 1, 1, 1, Math.PI / 2)));
  b.add('glass', new THREE.BoxGeometry(2.8, 0.7, 1.2), at(matrix(0, 1.4, -24.6)));
  // Swept wings and tail.
  for (const s of [-1, 1]) {
    b.add('jet', new THREE.BoxGeometry(28, 0.6, 6), at(matrix(s * 14.5, -0.8, 1, s * 0.42)));
    b.add('metal', new THREE.CylinderGeometry(1.4, 1.4, 5.5, 14), at(matrix(s * 9, -2.6, -2.5, 0, 1, 1, 1, Math.PI / 2)));
    b.add('jet', new THREE.BoxGeometry(10, 0.4, 3.4), at(matrix(s * 5.5, 1.4, 29, s * 0.45)));
  }
  b.add('jetTail', new THREE.BoxGeometry(0.5, 10, 7), at(matrix(0, 6, 29.5, 0, 1, 1, 1, -0.5)));
  b.add('aviation', new THREE.SphereGeometry(0.3, 6, 4), at(matrix(0, 11, 32)));
}

export function airport(b) {
  // Heated runway with edge lights; it runs on east, beyond the edge of the model.
  const rz = -300;
  b.add('runway', new THREE.BoxGeometry(620, 0.12, 46), matrix(390, 0.06, rz));
  for (let x = 90; x < 700; x += 22) {
    b.add('marking', new THREE.BoxGeometry(12, 0.02, 0.8), matrix(x, 0.13, rz));
    b.add('runwayLight', new THREE.SphereGeometry(0.35, 6, 4), matrix(x, 0.3, rz - 23.5));
    b.add('runwayLight', new THREE.SphereGeometry(0.35, 6, 4), matrix(x, 0.3, rz + 23.5));
  }
  for (let k = -5; k <= 5; k++) b.add('marking', new THREE.BoxGeometry(18, 0.02, 1.8), matrix(100, 0.13, rz + k * 3.8));
  for (let i = 1; i < 10; i++) b.add('runwayLight', new THREE.SphereGeometry(0.4, 6, 4), matrix(80 - i * 12, 0.5, rz));
  // Taxiway and apron.
  b.add('runway', new THREE.BoxGeometry(22, 0.12, 64), matrix(250, 0.06, -255));
  b.add('concrete', new THREE.BoxGeometry(170, 0.14, 46), matrix(255, 0.07, -218));
  // Glass terminal with a curved roof, and the control tower.
  building(b, { x: 250, z: -184, w: 96, d: 22, h: 10, facade: 'officeGlass', units: false, parapet: false });
  b.add('glassWarm', new THREE.BoxGeometry(94, 7, 0.3), matrix(250, 4.2, -195.2));
  vault(b, 'metal', 250, 10, -184, 12, 98, 0.25, Math.PI / 2);
  b.cyl('concrete', 330, 0, -186, 2.6, 3.2, 30, 20);
  b.cyl('glassWarm', 330, 30, -186, 5, 4.2, 4.5, 20);
  b.cyl('metalDark', 330, 34.5, -186, 5.4, 5.4, 0.8, 20);
  b.cyl('metal', 330, 35.3, -186, 0.15, 0.15, 6, 6);
  b.add('aviation', new THREE.SphereGeometry(0.4, 8, 6), matrix(330, 41.5, -186));
  // Gate 1 Dreamliner with its jet bridge, and Flight VN-81 climbing out to the east.
  jet(b, 250, 4.2, -226, Math.PI);
  b.add('glass', new THREE.BoxGeometry(3, 3, 20), matrix(236, 5.5, -205, 0.5));
  jet(b, 560, 48, rz - 10, -Math.PI / 2, 0.16);
  building(b, { x: 190, z: -228, w: 30, d: 26, h: 14, facade: 'industrial', units: false }); // maintenance hangar
  for (let i = 0; i < 4; i++) truck(b, 300 + i * 7, -225, 0, 'vehicleWhite');
}

export function stadium(b) {
  const x = 280;
  const z = -60;
  // Stands: a stepped bowl.
  const prof = [];
  for (let i = 0; i <= 12; i++) {
    prof.push(new THREE.Vector2(30 + i * 1.7, i * 1.5));
    prof.push(new THREE.Vector2(30 + (i + 1) * 1.7, i * 1.5));
  }
  prof.push(new THREE.Vector2(52.1, 0));
  b.add('seats', new THREE.LatheGeometry(prof, 72), matrix(x, 0, z));
  b.add('turf', new THREE.CylinderGeometry(30, 30, 0.4, 64), matrix(x, 0.2, z, 0, 1, 1, 0.72));
  b.add('marking', new THREE.TorusGeometry(9, 0.2, 4, 40), matrix(x, 0.42, z, 0, 1, 1, 1, Math.PI / 2));
  // Golden glass concourse ring and the silver rib storm shell.
  b.add('glassGold', new THREE.CylinderGeometry(53, 53, 9, 72, 1, true), matrix(x, 4.5, z));
  b.add('panel', new THREE.CylinderGeometry(53.5, 53.5, 1.2, 72, 1, true), matrix(x, 9.6, z));
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(Math.cos(a) * 54, 9, Math.sin(a) * 54),
      new THREE.Vector3(Math.cos(a) * 50, 30, Math.sin(a) * 50),
      new THREE.Vector3(Math.cos(a) * 38, 25, Math.sin(a) * 38),
    );
    b.add('metal', new THREE.TubeGeometry(curve, 12, 0.5, 6), matrix(x, 0, z));
  }
  b.add('metal', new THREE.TorusGeometry(38, 0.7, 8, 72), matrix(x, 25, z, 0, 1, 1, 1, Math.PI / 2));
  b.add('lampCool', new THREE.TorusGeometry(38, 0.35, 6, 72), matrix(x, 24.2, z, 0, 1, 1, 1, Math.PI / 2));
  for (let i = 0; i < 16; i++) lamp(b, x + Math.cos((i / 16) * Math.PI * 2) * 60, z + Math.sin((i / 16) * Math.PI * 2) * 60, 6);
  // EV & Hover-Car Charging Hub by the avenue.
  building(b, { x: 230, z: 14, w: 30, d: 14, h: 7, facade: 'officeGlass' });
  for (let i = 0; i < 8; i++) car(b, 218 + i * 3.4, 26, 0, ['vehicleWhite', 'vehicleBlue', 'vehicleRed'][i % 3]);
}

export function greenhouses(b) {
  const domes = [
    [158, -84, 17],
    [186, -64, 12],
    [152, -52, 10],
  ];
  for (const [x, z, r] of domes) {
    b.add('glassGreen', new THREE.IcosahedronGeometry(r, 2), matrix(x, -r * 0.15, z));
    b.add('metal', new THREE.TorusGeometry(r * 0.99, 0.25, 6, 48), matrix(x, 0.3, z, 0, 1, 1, 1, Math.PI / 2));
    for (let i = 0; i < 9; i++) b.add('plants', new THREE.BoxGeometry(r * 1.2, 1.5 + (i % 3), 1.2), matrix(x, 0.75, z - r * 0.6 + i * r * 0.15));
  }
  b.add('glass', new THREE.BoxGeometry(4, 3.5, 18), matrix(170, 1.75, -66, 0.9));
  // Circular Recycling Center and the biogas tank.
  building(b, { x: 166, z: -30, w: 30, d: 14, h: 9, facade: 'industrial' });
  for (let i = 0; i < 5; i++) b.add(['teal', 'yellow', 'vehicleBlue', 'red', 'panelGrey'][i], new THREE.BoxGeometry(4, 2, 3), matrix(154 + i * 6, 1, -19));
  b.add('teal', new THREE.SphereGeometry(7, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), matrix(196, 0, -28));
}

export function airBase(b) {
  b.add('runway', new THREE.BoxGeometry(32, 0.12, 300), matrix(-360, 0.06, -20));
  for (let t = -140; t < 130; t += 18) b.add('marking', new THREE.BoxGeometry(0.8, 0.02, 9), matrix(-360, 0.13, t));
  for (let i = 0; i < 3; i++) vaultHall(b, -310, -90 + i * 34, 26, 28, 7, 'f_industrial', 'panelGrey');
  b.cyl('concrete', -305, 0, 30, 2, 2.4, 18, 16);
  b.cyl('glassWarm', -305, 18, 30, 3.6, 3.2, 3, 16);
  b.add('aviation', new THREE.SphereGeometry(0.35, 8, 6), matrix(-305, 22, 30));
  fence(b, -390, -150, -390, 120, 8);
  fence(b, -280, -150, -280, 120, 8);
  // A belt of pines screens the eco-homes from the base.
  for (let z = -140; z < 130; z += 6) for (const x of [-262, -254]) pine(b, x + (R() - 0.5) * 3, z + (R() - 0.5) * 3, 1 + R() * 0.4);
}

export function ecoHomes(b) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 9; j++) {
      const x = -232 + i * 22;
      const z = -100 + j * 23;
      if (Math.abs(z) < 10) continue;
      house(b, { x, z, w: 9, d: 11, h: 5.4, ry: Math.PI / 2 + (R() - 0.5) * 0.2 });
      pine(b, x + 8, z + 6, 0.8);
    }
  }
  // Ice Crystal Apartments and student housing west of the ring road.
  for (let j = 0; j < 4; j++) building(b, { x: -142, z: -90 + j * 46, w: 14, d: 30, h: 21.6 + (j % 2) * 7.2, facade: j % 2 ? 'residential' : 'brick', balconies: true });
}
