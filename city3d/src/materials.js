// Colours and materials of the city. Facades use painted textures (see textures.js) with
// colour, glow, roughness/metalness and relief layers; every emissive material has a day,
// a dusk and a night strength, switched by setMode.
import * as THREE from 'three';
import { paintFacade, paintShops, paintLounge, STYLES, HOUSE_COLOURS, houseStyle } from './textures.js';

const BAY = 3.2; // width of one window bay, m
const FLOOR = 3.6; // floor height, m
export const FACADE = { bay: BAY, floor: FLOOR, shopFloor: 4.5 };

export const materials = {};
const emissive = []; // [material, day, night, dusk]

function std(key, params, day = 0, night = 0, dusk = night * 0.9) {
  const m = new THREE.MeshStandardMaterial(params);
  materials[key] = m;
  if (params.emissive !== undefined || params.emissiveMap) emissive.push([m, day, night, dusk]);
  return m;
}

function facadeMaterial(key, t, params, day, night, dusk) {
  return std(key, { map: t.map, emissiveMap: t.emissiveMap, emissive: 0xffffff, roughnessMap: t.roughnessMap, metalnessMap: t.metalnessMap, normalMap: t.normalMap, roughness: 1, metalness: 1, ...params }, day, night, dusk);
}

// People's clothes and the colours of cars.
export const COATS = ['coatRed', 'coatNavy', 'coatOchre', 'coatTeal', 'coatGrey', 'coatBlack', 'coatWhite', 'coatGreen', 'coatPlum', 'coatOrange'];
export const CAR_PAINTS = ['carWhite', 'carSilver', 'carBlack', 'carRed', 'carBlue', 'carGrey', 'carWhite', 'carTeal'];

export function createMaterials() {
  let seed = 11;
  for (const [k, o] of Object.entries(STYLES)) {
    facadeMaterial(`f_${k}`, paintFacade(o, seed++), {}, 0, k === 'industrial' ? 0.55 : 0.9);
  }
  facadeMaterial('f_shop', paintShops(71), {}, 0.55, 1.3, 1.2);
  for (const [k, col] of Object.entries(HOUSE_COLOURS)) {
    facadeMaterial(`h_${k}`, paintFacade(houseStyle(col), 90 + seed++, 1024), {}, 0, 0.85);
  }

  std('snow', { color: 0xf2f5f9, roughness: 0.92 });
  std('snowRoof', { color: 0xf7f9fc, roughness: 0.9 });
  std('snowBank', { color: 0xe9eef5, roughness: 1 });
  // Heated streets stay wet, so they mirror the lamps and shop windows.
  std('asphalt', { color: 0x2c3138, roughness: 0.32, metalness: 0.1 });
  std('runway', { color: 0x2f343c, roughness: 0.55 });
  std('sidewalk', { color: 0x9aa2ad, roughness: 0.6 });
  std('curb', { color: 0xc3c8cf, roughness: 0.7 });
  std('plaza', { color: 0x8a919c, roughness: 0.42, metalness: 0.05 });
  std('marking', { color: 0xf0f2f5, roughness: 0.6 });
  std('markingYellow', { color: 0xf2c14e, roughness: 0.6 });
  std('concrete', { color: 0xc9ced6, roughness: 0.85 });
  std('concreteDark', { color: 0x7d8693, roughness: 0.85 });
  std('panel', { color: 0xeef1f5, roughness: 0.45, metalness: 0.15 });
  std('panelGrey', { color: 0xb8c0cb, roughness: 0.55, metalness: 0.2 });
  std('metal', { color: 0xc9d1db, roughness: 0.25, metalness: 0.9 });
  std('metalDark', { color: 0x3c434e, roughness: 0.4, metalness: 0.6 });
  std('pipe', { color: 0xd6dce4, roughness: 0.22, metalness: 0.9 });
  std('glass', { color: 0x6a86a6, roughness: 0.04, metalness: 0.8 });
  std('glassGold', { color: 0xd8a84a, roughness: 0.1, metalness: 0.85, emissive: 0xffb050 }, 0, 0.35);
  std('glassWarm', { color: 0x8aa0b8, roughness: 0.06, metalness: 0.45, emissive: 0xffc27a }, 0.08, 0.85);
  std('glassGreen', { color: 0xa8d8c8, roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.55, emissive: 0xff8ad0 }, 0.0, 0.7);
  std('plants', { color: 0x3f8f4a, roughness: 0.8, emissive: 0xff5fc8 }, 0, 0.8);
  std('timber', { color: 0x8a5a3b, roughness: 0.75 });
  std('timberDark', { color: 0x5a3a28, roughness: 0.8 });
  std('stone', { color: 0x6d7480, roughness: 0.85 });
  std('rock', { color: 0xffffff, roughness: 0.92, flatShading: true, vertexColors: true });
  std('ice', { color: 0xcfe6f2, roughness: 0.25, metalness: 0.05, emissive: 0x4fa8e0 }, 0.02, 0.12);
  const lounge = paintLounge(55);
  std('spaGlass', { map: lounge.map, emissiveMap: lounge.emissiveMap, emissive: 0xffffff, roughness: 0.05, metalness: 0.35 }, 0.35, 1.0, 0.95);
  std('water', { color: 0x2fb5c0, roughness: 0.04, metalness: 0.3, emissive: 0x22d0d8 }, 0.08, 0.9);
  std('waterDark', { color: 0x2c6f8a, roughness: 0.06, metalness: 0.35 });
  std('treeGreen', { color: 0x24503f, roughness: 0.9, flatShading: true });
  std('treeGreen2', { color: 0x30604a, roughness: 0.9, flatShading: true });
  std('snowTree', { color: 0xf4f7fb, roughness: 0.9, flatShading: true });
  std('trunk', { color: 0x5b3f2c, roughness: 0.9 });
  std('solar', { color: 0x1c2d5a, roughness: 0.15, metalness: 0.6 });
  std('red', { color: 0xb8352c, roughness: 0.6 });
  std('redBright', { color: 0xd4483b, roughness: 0.5, emissive: 0xff3b2b }, 0, 0.4);
  std('yellow', { color: 0xe8b23a, roughness: 0.6 });
  std('turf', { color: 0xf5f7fa, roughness: 0.9 });
  std('seats', { color: 0x3d5a8c, roughness: 0.7 });
  std('purple', { color: 0x6b46c8, roughness: 0.4, emissive: 0x8a5cff }, 0.25, 2.2);
  std('teal', { color: 0x14a394, roughness: 0.45, emissive: 0x20e0c8 }, 0.15, 1.6);
  std('rose', { color: 0xd25a84, roughness: 0.5, emissive: 0xff6aa0 }, 0.1, 1.4);
  std('orangeGlow', { color: 0xff8a3c, roughness: 0.5, emissive: 0xff7a2a }, 0.4, 2.5);
  std('lamp', { color: 0xffe2b0, roughness: 0.4, emissive: 0xffc779 }, 0.2, 4.0);
  std('lampCool', { color: 0xdfe9ff, roughness: 0.4, emissive: 0xcfe0ff }, 0.15, 3.0);
  std('aviation', { color: 0xff4a3a, roughness: 0.4, emissive: 0xff2a1a }, 0.6, 4.0);
  std('runwayLight', { color: 0xfff3d6, roughness: 0.4, emissive: 0xffe3a8 }, 0.3, 5.0);
  std('blueLight', { color: 0x6fa8ff, roughness: 0.4, emissive: 0x4a8cff }, 0.3, 3.5);
  std('steel', { color: 0x9aa4b2, roughness: 0.4, metalness: 0.7 });
  std('blade', { color: 0xf4f6f8, roughness: 0.35, metalness: 0.1 });
  std('statue', { color: 0xc9ced6, roughness: 0.32, metalness: 0.9 });
  std('granite', { color: 0x2f3338, roughness: 0.3, metalness: 0.1 });
  std('fabric', { color: 0xf6f1e8, roughness: 0.7, emissive: 0xfff0d0 }, 0.05, 0.9);
  std('awning', { color: 0x2b3440, roughness: 0.6, metalness: 0.2 });
  std('vehicleRed', { color: 0xc23a2e, roughness: 0.3, metalness: 0.4 });
  std('vehicleWhite', { color: 0xf2f4f7, roughness: 0.3, metalness: 0.4 });
  std('vehicleBlue', { color: 0x2f5fa8, roughness: 0.3, metalness: 0.4 });
  std('jet', { color: 0xf4f6f9, roughness: 0.25, metalness: 0.3 });
  std('jetTail', { color: 0x1f4e8c, roughness: 0.3, metalness: 0.3 });

  // Cars: glossy paint, tinted glass, tyres and lights.
  const paints = { carWhite: 0xeef0f3, carSilver: 0xa9b0b8, carBlack: 0x15181c, carRed: 0x9e1f1f, carBlue: 0x1f3f74, carGrey: 0x4f5660, carTeal: 0x1f6f73 };
  for (const [k, col] of Object.entries(paints)) std(k, { color: col, roughness: 0.22, metalness: 0.55 });
  std('carGlass', { color: 0x1a2028, roughness: 0.03, metalness: 0.9 });
  std('tyre', { color: 0x16181b, roughness: 0.8 });
  std('headlight', { color: 0xf4f7ff, roughness: 0.2, emissive: 0xeaf1ff }, 0.4, 5.0);
  std('taillight', { color: 0x8a0f12, roughness: 0.3, emissive: 0xff1a1a }, 0.3, 3.5);

  // People: winter coats in many colours, dark trousers and boots, faces and hats.
  const coats = { coatRed: 0xa3262a, coatNavy: 0x1f2c4a, coatOchre: 0xc08a2e, coatTeal: 0x1f6d6f, coatGrey: 0x6d727a, coatBlack: 0x1c1d21, coatWhite: 0xe6e6e2, coatGreen: 0x3d5a3a, coatPlum: 0x5a2e4f, coatOrange: 0xd2602a };
  for (const [k, col] of Object.entries(coats)) std(k, { color: col, roughness: 0.85 });
  std('trousers', { color: 0x23262d, roughness: 0.9 });
  std('skin', { color: 0xd9a888, roughness: 0.7 });
  std('hatWool', { color: 0xe9e2d6, roughness: 0.95 });
  // Reindeer: brown or grey coats, pale necks, dark hooves and noses, velvet-brown antlers.
  std('deerBrown', { color: 0x6e4f38, roughness: 0.95 });
  std('deerGrey', { color: 0x7c7368, roughness: 0.95 });
  std('deerPale', { color: 0xd9d0c2, roughness: 0.95 });
  std('deerDark', { color: 0x2a221c, roughness: 0.8 });
  std('antler', { color: 0xbfa585, roughness: 0.7 });
  return materials;
}

export function setMode(mode, env = 0.5) {
  const k = mode === 'night' ? 2 : mode === 'dusk' ? 3 : 1;
  for (const e of emissive) e[0].emissiveIntensity = e[k];
  // Sky light from the environment map, kept lower than the sun so shadows stay readable;
  // glass gets more of it, so it reads as a reflective surface.
  for (const [key, m] of Object.entries(materials)) {
    const glassy = key.startsWith('glass') || key.startsWith('f_') || key.startsWith('car') || key === 'asphalt';
    m.envMapIntensity = glassy ? env * 2.2 : env;
  }
}
