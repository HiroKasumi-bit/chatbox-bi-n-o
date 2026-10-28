// Downtown: nine blocks around the Aurora Roundabout, the Founding Mayor Monument,
// Liberty Mall and the Aurora 81 tower.
import * as THREE from 'three';
import { matrix, rng } from './util.js';
import { building, house, pine, lamp, car, bench, roofPrism, roofBand, vault, person, crowd, isolated } from './kit.js';
import { BLOCKS, BLOCK, PITCH, RING } from './layout.js';
import { plaza } from './ground.js';

const R = rng(1881);
const HB = BLOCK / 2; // 28

// Buildings along the four edges of a block, leaving a snowy courtyard in the middle.
function perimeter(b, bx, bz, o) {
  const dp = o.depth || 13;
  const pick = () => o.facades[Math.floor(R() * o.facades.length)];
  const hgt = () => o.hMin + Math.round(R() * (o.hMax - o.hMin) / 3.6) * 3.6;
  // Shops on the street side, balconies on some of the flats.
  const extra = (side, facade) => ({ facade, shops: o.shops === false ? '' : side, balconies: ['residential', 'brick'].includes(facade) && R() < 0.6 });
  const run = (len, cb) => {
    let t = 0;
    while (t < len - 0.1) {
      let w = Math.min(len - t, 12 + R() * 14);
      if (len - t - w < 9) w = len - t;
      cb(t + w / 2 - len / 2, w - 0.6);
      t += w;
    }
  };
  if (!o.skip?.includes('n')) run(BLOCK, (c, w) => building(b, { x: bx + c, z: bz - HB + dp / 2, w, d: dp, h: hgt(), ...extra('n', pick()) }));
  if (!o.skip?.includes('s')) run(BLOCK, (c, w) => building(b, { x: bx + c, z: bz + HB - dp / 2, w, d: dp, h: hgt(), ...extra('s', pick()) }));
  if (!o.skip?.includes('w')) run(BLOCK - 2 * dp, (c, w) => building(b, { x: bx - HB + dp / 2, z: bz + c, w: dp, d: w, h: hgt(), ...extra('w', pick()) }));
  if (!o.skip?.includes('e')) run(BLOCK - 2 * dp, (c, w) => building(b, { x: bx + HB - dp / 2, z: bz + c, w: dp, d: w, h: hgt(), ...extra('e', pick()) }));
  // Courtyard trees.
  for (let i = 0; i < (o.trees ?? 5); i++) pine(b, bx + (R() - 0.5) * (BLOCK - 2 * dp - 6), bz + (R() - 0.5) * (BLOCK - 2 * dp - 6), 0.9);
}

// Aurora 81: nine bundled glass tubes stepping back like bamboo stalks, with a lit crown.
function aurora81(b, x, z) {
  const s = 7.2;
  const gap = 0.5;
  const heights = [
    [36, 46, 32],
    [48, 58, 42],
    [30, 40, 38],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const h = heights[i][j];
      const px = x + (j - 1) * (s + gap);
      const pz = z + (i - 1) * (s + gap);
      building(b, { x: px, z: pz, w: s, d: s, h, facade: 'tower', units: false, parapet: false, y: 9 });
      // Light band at the top of every tube.
      b.add('lampCool', new THREE.BoxGeometry(s + 0.1, 0.5, s + 0.1), matrix(px, 9 + h - 0.6, pz));
    }
  }
  // Crown and spire on the central tube.
  const top = 9 + 58;
  b.add('metal', new THREE.CylinderGeometry(0.4, 1.6, 6, 8), matrix(x, top + 3, z));
  b.add('metal', new THREE.ConeGeometry(0.4, 14, 8), matrix(x, top + 13, z));
  b.add('aviation', new THREE.SphereGeometry(0.45, 8, 6), matrix(x, top + 20.2, z));
  // Podium: the Aurora 81 Center mall.
  building(b, { x, z, w: 34, d: 34, h: 9, facade: 'officeGlass', units: false, shops: true });
}

// The monument: a brushed stainless-steel figure waving to the people, on a stepped black
// granite pedestal, in a ring of red and yellow flower beds and lanterns.
function monument(b, x, z) {
  b.add('plaza', new THREE.CylinderGeometry(14, 14, 0.3, 48), matrix(x, 0.15, z));
  b.add('granite', new THREE.CylinderGeometry(8.5, 8.5, 0.5, 48), matrix(x, 0.4, z));
  b.add('red', new THREE.TorusGeometry(10.5, 0.7, 6, 48), matrix(x, 0.45, z, 0, 1, 0.5, 1, Math.PI / 2));
  b.add('yellow', new THREE.TorusGeometry(12, 0.5, 6, 48), matrix(x, 0.4, z, 0, 1, 0.5, 1, Math.PI / 2));
  // Stepped granite pedestal.
  b.add('granite', new THREE.BoxGeometry(4.2, 0.4, 4.2), matrix(x, 0.85, z));
  b.add('granite', new THREE.BoxGeometry(2.7, 2.2, 2.7), matrix(x, 2.15, z));
  b.add('granite', new THREE.BoxGeometry(3.1, 0.22, 3.1), matrix(x, 3.36, z));
  // Figure, facing south towards Mount Aurora: a standing man in a buttoned tunic and
  // trousers, his right hand raised to greet the people. Built as a 1.78 m figure and
  // scaled up 2.25 times; in figure coordinates it faces -z, so its right hand is on +x.
  const k = 2.25;
  const y0 = 3.47;
  const ft = (px, py, pz) => new THREE.Vector3(x - px * k, y0 + py * k, z - pz * k); // figure → world, turned to face south
  const part = (geo, px, py, pz, sx = 1, sy = 1, sz = 1) => b.add('statue', geo, matrix(...ft(px, py, pz).toArray(), Math.PI, sx * k, sy * k, sz * k));
  const limb = (a, c, r, r2 = r * 0.85) => {
    const A = ft(...a);
    const B = ft(...c);
    const g = new THREE.CylinderGeometry(r2 * k, r * k, A.distanceTo(B), 12);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    b.add('statue', g, new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    b.add('statue', new THREE.SphereGeometry(r2 * k, 12, 8), matrix(...B.toArray()));
  };
  for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.11, 0.08, 0.27), s * 0.1, 0.04, -0.03); // shoes
    limb([s * 0.1, 0.08, 0], [s * 0.095, 0.95, 0], 0.075, 0.095); // trouser legs
  }
  // Tunic and shoulders as one turned shape: hips, waist, chest, sloping shoulders, collar.
  const torso = new THREE.LatheGeometry([
    [0.0, 0.84], [0.2, 0.86], [0.19, 1.0], [0.175, 1.12], [0.19, 1.28], [0.205, 1.4], [0.19, 1.46], [0.13, 1.51], [0.07, 1.55], [0.0, 1.56],
  ].map(([r, yy]) => new THREE.Vector2(r, yy)), 24);
  part(torso, 0, 0, 0, 1, 1, 0.72);
  part(new THREE.CylinderGeometry(0.052, 0.06, 0.1, 12), 0, 1.6, 0); // neck
  part(new THREE.SphereGeometry(0.105, 18, 14), 0, 1.72, -0.01, 0.92, 1.12, 1); // head
  limb([0.2, 1.43, 0], [0.4, 1.62, -0.05], 0.055, 0.05); // right upper arm, raised
  limb([0.4, 1.62, -0.05], [0.44, 1.9, -0.09], 0.05, 0.042); // right forearm
  part(new THREE.SphereGeometry(0.05, 10, 8), 0.445, 1.96, -0.1, 0.8, 1.2, 0.5); // open hand
  limb([-0.2, 1.43, 0], [-0.24, 1.15, -0.03], 0.055, 0.05); // left arm at the side
  limb([-0.24, 1.15, -0.03], [-0.25, 0.9, -0.07], 0.05, 0.042);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    lamp(b, x + Math.cos(a) * 13.2, z + Math.sin(a) * 13.2, 4.5);
  }
}

function civicCore(b, cx, cz) {
  monument(b, cx, cz);
  // Liberty Mall: the promenade runs north-south through the block.
  plaza(b, cx, cz, 10, BLOCK, 'plaza');
  plaza(b, cx, cz, BLOCK, 7, 'plaza');
  for (const s of [-1, 1]) {
    for (const t of [-22, -16, 16, 22]) {
      pine(b, cx + s * 4.2, cz + t, 0.7);
      lamp(b, cx + s * 3.2, cz + t + 3, 5);
    }
  }
  // Metro entrances: glass pavilions over the stairs, open towards the monument.
  for (const t of [-25, 25]) {
    const open = t > 0 ? -1 : 1; // the side facing the monument
    const z0 = cz + t;
    b.add('metalDark', new THREE.BoxGeometry(4.6, 0.3, 3.6), matrix(cx, 2.85, z0));
    b.add('snowRoof', new THREE.BoxGeometry(4.4, 0.08, 3.4), matrix(cx, 3.04, z0));
    for (const sx of [-2.2, 2.2]) for (const sz of [-1.7, 1.7]) b.add('metalDark', new THREE.BoxGeometry(0.12, 2.7, 0.12), matrix(cx + sx, 1.35, z0 + sz));
    for (const sx of [-2.2, 2.2]) b.add('glass', new THREE.BoxGeometry(0.05, 2.5, 3.3), matrix(cx + sx, 1.3, z0));
    b.add('glass', new THREE.BoxGeometry(4.3, 2.5, 0.05), matrix(cx, 1.3, z0 - open * 1.7));
    b.add('metalDark', new THREE.BoxGeometry(3.6, 0.06, 3.0), matrix(cx, 0.24, z0)); // the stair opening
    b.add('lamp', new THREE.BoxGeometry(3.4, 0.05, 0.3), matrix(cx, 2.68, z0));
    b.add('blueLight', new THREE.BoxGeometry(0.9, 0.9, 0.1), matrix(cx, 3.6, z0 + open * 1.0)); // metro sign
    b.add('metalDark', new THREE.BoxGeometry(0.08, 0.5, 0.08), matrix(cx, 3.1, z0 + open * 1.0));
  }
  // The four corners follow the group's Ecopolis model (magazine/source/Aurora_Haven_v13.json):
  // the Civic Center north-west, the hospital and the school north-east, the food hall and the
  // cinema south-west, and a pocket park with a skating rink south-east.
  // Civic Center with a clock tower.
  building(b, { x: cx - 17, z: cz - 17, w: 18, d: 18, h: 14.4, facade: 'civic', shops: 'e' });
  building(b, { x: cx - 22, z: cz - 22, w: 5, d: 5, h: 24, facade: 'civic', units: false });
  b.add('lamp', new THREE.CylinderGeometry(1.4, 1.4, 0.3, 16), matrix(cx - 22, 20, cz - 19.4, 0, 1, 1, 1, Math.PI / 2));
  b.add('panelGrey', new THREE.ConeGeometry(3.6, 4, 4), matrix(cx - 22, 26, cz - 22, Math.PI / 4));
  // Snowflake General Hospital, with a rooftop helipad and a lit H.
  const hz = cz - 19.5;
  building(b, { x: cx + 17, z: hz, w: 20, d: 13, h: 21.6, facade: 'residential', units: false });
  b.add('concreteDark', new THREE.CylinderGeometry(5.5, 5.5, 0.4, 24), matrix(cx + 17, 21.8, hz));
  b.add('lamp', new THREE.BoxGeometry(0.6, 0.05, 4), matrix(cx + 15.8, 22.05, hz));
  b.add('lamp', new THREE.BoxGeometry(0.6, 0.05, 4), matrix(cx + 18.2, 22.05, hz));
  b.add('lamp', new THREE.BoxGeometry(2.4, 0.05, 0.6), matrix(cx + 17, 22.05, hz));
  // Northern Lights School & Botanical Conservatory, between the hospital and the plaza, with a glass dome.
  const sz = cz - 8.2;
  building(b, { x: cx + 17, z: sz, w: 18, d: 8.4, h: 10.8, facade: 'warm' });
  b.add('glassGreen', new THREE.SphereGeometry(3.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), matrix(cx + 17, 10.8, sz));
  b.add('plants', new THREE.ConeGeometry(2, 2.8, 6), matrix(cx + 17, 12.2, sz));
  // Igloo Fresh food hall and Aurora Cinema, with shop fronts on Liberty Mall and the plaza.
  building(b, { x: cx - 17, z: cz + 9.5, w: 18, d: 11, h: 8.5, facade: 'officeGlass', shops: 'en' });
  building(b, { x: cx - 17, z: cz + 21.5, w: 16, d: 11, h: 10.8, facade: 'civic', units: false });
  b.add('rose', new THREE.BoxGeometry(0.3, 1.4, 9), matrix(cx - 8.85, 8.5, cz + 21.5));
  // Pocket park: a skating rink inside a timber rail, ringed by pines, benches and lamps.
  const rx = cx + 17;
  const rz = cz + 15.5;
  b.add('ice', new THREE.BoxGeometry(13, 0.12, 9), matrix(rx, 0.06, rz));
  for (const s of [-1, 1]) {
    b.add('timber', new THREE.BoxGeometry(13.3, 0.5, 0.15), matrix(rx, 0.25, rz + s * 4.57));
    b.add('timber', new THREE.BoxGeometry(0.15, 0.5, 9.3), matrix(rx + s * 6.57, 0.25, rz));
  }
  for (const [x, z, k] of [[9, 7.5, 0.8], [25.5, 7, 0.9], [25.5, 25, 0.85], [9, 25.5, 0.75], [17, 25.8, 0.7]]) pine(b, cx + x, cz + z, k);
  for (const x of [13, 21]) {
    bench(b, cx + x, rz - 6, 0);
    bench(b, cx + x, rz + 6, Math.PI);
  }
  for (const [x, z] of [[9.5, 10.5], [24.5, 10.5], [9.5, 20.5], [24.5, 20.5]]) lamp(b, cx + x, cz + z, 4.5);
  for (const [x, z, ry, s] of [[-3.5, -1.5, 0.6, 1], [1.5, 1.2, 2.3, 1], [3.8, -2.2, -1.1, 0.62], [-1, 2.4, 1.5, 1], [-4.6, 1.8, -2.4, 0.58]]) {
    person(b, rx + x, rz + z, ry, { scale: s, y: 0.12 });
  }
  for (let i = 0; i < 6; i++) bench(b, cx + (i % 2 ? 6 : -6), cz - 9 + Math.floor(i / 2) * 9, Math.PI / 2);
  // People on Liberty Mall and around the monument.
  crowd(b, cx, cz - HB + 2, cx, cz - 15, 14, 7);
  crowd(b, cx, cz + 15, cx, cz + HB - 2, 14, 7);
  crowd(b, cx - HB + 2, cz, cx - 15, cz, 8, 5);
  crowd(b, cx + 15, cz, cx + HB - 2, cz, 8, 5);
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const rr = 9.4 + R() * 3.4;
    person(b, cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, -a + Math.PI / 2 + (R() - 0.5), { still: R() < 0.6 });
  }
}

function polaris(b, bx, bz) {
  // Aurora Core: a slim tower with a glowing ring and antenna.
  building(b, { x: bx - 16, z: bz - 16, w: 14, d: 14, h: 39.6, facade: 'officeGlass', units: false });
  b.add('lampCool', new THREE.TorusGeometry(8.2, 0.35, 8, 40), matrix(bx - 16, 41, bz - 16, 0, 1, 1, 1, Math.PI / 2));
  b.add('metal', new THREE.CylinderGeometry(0.25, 0.35, 12, 6), matrix(bx - 16, 45.6, bz - 16));
  b.add('aviation', new THREE.SphereGeometry(0.4, 8, 6), matrix(bx - 16, 51.8, bz - 16));
  // Police headquarters with a blue light band.
  building(b, { x: bx - 18, z: bz + 13, w: 16, d: 22, h: 18, facade: 'officeLight' });
  roofBand(b, 'blueLight', bx - 18, bz + 13, 16, 22, 17.2);
  // Polaris Green Office Tower.
  building(b, { x: bx + 14, z: bz - 12, w: 18, d: 18, h: 36, facade: 'officeGlass', shops: 'e' });
  perimeter(b, bx, bz, { facades: ['officeLight', 'civic'], hMin: 14, hMax: 22, skip: 'nw', trees: 2 });
}

function knowledge(b, bx, bz) {
  // Arctic University main hall with a rotunda.
  building(b, { x: bx, z: bz - 12, w: 44, d: 22, h: 18, facade: 'civic' });
  b.add('panel', new THREE.CylinderGeometry(7, 7, 6, 24), matrix(bx, 21, bz - 12));
  b.add('glass', new THREE.SphereGeometry(7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), matrix(bx, 24, bz - 12));
  for (let i = -3; i <= 3; i++) b.add('panel', new THREE.CylinderGeometry(0.5, 0.5, 9, 10), matrix(bx + i * 3.4, 4.5, bz - 0.4));
  // Aurora Public Library: a glass box that glows like a living room in the polar night.
  b.add('glassWarm', new THREE.BoxGeometry(22, 10, 14), matrix(bx + 12, 5, bz + 15));
  b.add('snowRoof', new THREE.BoxGeometry(23, 0.6, 15), matrix(bx + 12, 10.3, bz + 15));
  building(b, { x: bx - 15, z: bz + 15, w: 22, d: 14, h: 14.4, facade: 'warm', shops: 's' });
  pine(b, bx - 2, bz + 6, 0.8);
  pine(b, bx + 25, bz + 4, 0.8);
}

function financial(b, bx, bz) {
  building(b, { x: bx + 15, z: bz - 15, w: 20, d: 20, h: 39.6, facade: 'officeGlass' }); // Business Hotel tower
  building(b, { x: bx - 14, z: bz - 14, w: 22, d: 18, h: 32.4, facade: 'officeGlass', shops: 'w' }); // Arctic Stock Exchange
  building(b, { x: bx - 14, z: bz + 14, w: 22, d: 18, h: 18, facade: 'civic' }); // Snowline Courthouse
  for (let i = -3; i <= 3; i++) b.add('panel', new THREE.CylinderGeometry(0.45, 0.45, 8, 10), matrix(bx - 14 + i * 3, 4, bz + 4.4));
  building(b, { x: bx + 15, z: bz + 14, w: 20, d: 18, h: 25.2, facade: 'officeLight', shops: 's' }); // Green Finance Hall
  roofBand(b, 'teal', bx + 15, bz + 14, 20, 18, 24.4);
}

function westMarket(b, bx, bz) {
  // Night market hall with a fabric roof lit from inside.
  b.add('timberDark', new THREE.BoxGeometry(40, 5, 14), matrix(bx + 2, 2.5, bz));
  b.add('fabric', roofPrism(42, 5, 15), matrix(bx + 2, 5, bz, Math.PI / 2, 15 / 42, 1, 42 / 15));
  for (let i = -4; i <= 4; i++) lamp(b, bx + 2 + i * 4.4, bz + 8.6, 3.5);
  // Fire & ambulance station with red doors.
  building(b, { x: bx - 16, z: bz + 18, w: 22, d: 16, h: 10.8, facade: 'brick' });
  for (let i = 0; i < 3; i++) b.add('redBright', new THREE.BoxGeometry(4.2, 4.6, 0.3), matrix(bx - 23 + i * 6.5, 2.3, bz + 26.1));
  building(b, { x: bx + 14, z: bz + 18, w: 26, d: 16, h: 21.6, facade: 'brick', shops: 'es', balconies: true });
  perimeter(b, bx, bz, { facades: ['warm', 'brick', 'residential'], hMin: 14, hMax: 25, skip: 'swe', trees: 0 });
}

function eastGallery(b, bx, bz) {
  // Aurora Glacier Mall with the Crystal Atrium.
  building(b, { x: bx, z: bz - 10, w: 50, d: 30, h: 14.4, facade: 'officeGlass', units: false, shops: 'wn' });
  b.add('glassWarm', new THREE.BoxGeometry(22, 4, 14), matrix(bx, 16.4, bz - 10));
  b.add('glass', roofPrism(23, 4, 15), matrix(bx, 18.4, bz - 10, Math.PI / 2, 15 / 23, 1, 23 / 15));
  building(b, { x: bx + 13, z: bz + 17, w: 24, d: 18, h: 10.8, facade: 'warm' }); // Snow Lantern Primary School
  roofBand(b, 'yellow', bx + 13, bz + 17, 24, 18, 9.8, 0.7);
  building(b, { x: bx - 13, z: bz + 17, w: 24, d: 18, h: 12, facade: 'civic', units: false }); // Northern Lights Music Hall
  vault(b, 'metal', bx - 13, 12, bz + 17, 9, 24, 0.5, Math.PI / 2);
}

function snowpine(b, bx, bz) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      house(b, { x: bx - 21 + i * 14, z: bz - 18 + j * 17, w: 8, d: 10, h: 5.4, ry: (R() - 0.5) * 0.1 });
      pine(b, bx - 15 + i * 14, bz - 12 + j * 17, 0.8);
    }
  }
  building(b, { x: bx + 12, z: bz + 23, w: 26, d: 9, h: 7.2, facade: 'warm' }); // Pinecone Kindergarten & senior home
}

function approach(b, bx, bz) {
  // Low buildings keep the summit in view; the boulevard runs down the middle.
  plaza(b, bx, bz, 10, BLOCK, 'plaza');
  crowd(b, bx, bz - HB, bx, bz + HB, 16, 7);
  for (const s of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      house(b, { x: bx + s * 17, z: bz - 21 + j * 14, w: 10, d: 12, h: 7.2, ry: Math.PI / 2, colour: ['red', 'ochre', 'white', 'teal'][(j + (s > 0 ? 1 : 0)) % 4] });
      lamp(b, bx + s * 6.5, bz - 21 + j * 14, 4.5);
      pine(b, bx + s * 9, bz - 14 + j * 14, 0.6);
    }
  }
}

function aurora81District(b, bx, bz, tower) {
  aurora81(tower, bx + 2, bz + 2);
  building(b, { x: bx - 18, z: bz - 17, w: 12, d: 12, h: 39.6, facade: 'tower', shops: 'wn' }); // Aurora 81 Residences (twin towers)
  building(b, { x: bx - 18, z: bz + 2, w: 12, d: 12, h: 36, facade: 'tower', shops: 'w' });
  for (let i = 0; i < 6; i++) lamp(b, bx - 26 + i * 10, bz + 25, 5);
}

// `tower` is a separate batch for Aurora 81, so pictures can show the tower on its own.
export function downtown(b, tower = b) {
  const by = Object.fromEntries(BLOCKS.map((k) => [k.id, k]));
  // The civic core was rearranged after the other pictures were rendered; its earlier layout
  // drew 752 numbers from the shared sequence, so the rest of the city keeps its details.
  isolated(83, 752, () => civicCore(b, by.civic.x, by.civic.z));
  polaris(b, by.polaris.x, by.polaris.z);
  knowledge(b, by.knowledge.x, by.knowledge.z);
  financial(b, by.financial.x, by.financial.z);
  westMarket(b, by.westmarket.x, by.westmarket.z);
  eastGallery(b, by.eastgallery.x, by.eastgallery.z);
  snowpine(b, by.snowpine.x, by.snowpine.z);
  approach(b, by.approach.x, by.approach.z);
  aurora81District(b, by.aurora81.x, by.aurora81.z, tower);
  traffic(b);
}

// Cars on the downtown streets, keeping to the right, with gaps at the crossings.
function traffic(b) {
  const lane = (fixed, alongX, sign) => {
    let t = -RING + 6 + R() * 10;
    while (t < RING - 6) {
      const nearCrossing = [-PITCH / 2, PITCH / 2].some((c) => Math.abs(t - c) < 10);
      if (!nearCrossing) {
        // Heading north is ry 0; south π; east -π/2; west π/2.
        if (alongX) car(b, t, fixed + sign * 2.2, sign > 0 ? -Math.PI / 2 : Math.PI / 2);
        else car(b, fixed + sign * 2.2, t, sign > 0 ? 0 : Math.PI);
      }
      t += 7 + R() * 22;
    }
  };
  for (const s of [-PITCH / 2, PITCH / 2]) {
    for (const sign of [-1, 1]) {
      lane(s, false, sign);
      lane(s, true, sign);
    }
  }
}
