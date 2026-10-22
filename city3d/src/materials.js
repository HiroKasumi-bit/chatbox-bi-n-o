// Colours and materials of the city. Facades use painted canvas textures (wall, glass and
// lit windows); every emissive material has a day and a night strength, switched by setMode.
import * as THREE from 'three';
import { rng } from './util.js';

const BAY = 3.2; // width of one window bay, m
const FLOOR = 3.6; // floor height, m
export const FACADE = { bay: BAY, floor: FLOOR };

function facadeTexture(o, seed) {
  const r = rng(seed);
  const S = 512;
  const cells = 8;
  const cs = S / cells;
  const color = document.createElement('canvas');
  const glow = document.createElement('canvas');
  color.width = color.height = glow.width = glow.height = S;
  const c = color.getContext('2d');
  const g = glow.getContext('2d');
  c.fillStyle = o.wall;
  c.fillRect(0, 0, S, S);
  g.fillStyle = '#000';
  g.fillRect(0, 0, S, S);
  // Floor slabs.
  if (o.slab) {
    c.fillStyle = o.slab;
    for (let j = 0; j < cells; j++) c.fillRect(0, j * cs, S, cs * 0.08);
  }
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const ww = cs * o.winW;
      const wh = cs * o.winH;
      const x = i * cs + (cs - ww) / 2;
      const y = j * cs + (cs - wh) * 0.55;
      const lit = r() < o.lit;
      const warm = r() < 0.8;
      // Glass, a little lighter or darker per window, with a sky reflection at the top.
      c.fillStyle = o.glass;
      c.fillRect(x, y, ww, wh);
      c.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.1})`;
      c.fillRect(x, y, ww, wh);
      c.fillStyle = 'rgba(190,215,240,0.18)';
      c.fillRect(x, y, ww, wh * 0.3);
      if (lit) {
        const k = 0.55 + r() * 0.45;
        const col = warm ? [255, 196 + r() * 30, 120 + r() * 40] : [215, 228, 255];
        g.fillStyle = `rgb(${col.map((v) => Math.round(v * k)).join(',')})`;
        g.fillRect(x, y, ww, wh);
        // A lamp glow at the top of the room and a darker sill.
        g.fillStyle = `rgba(255,240,210,${0.35 * k})`;
        g.fillRect(x, y, ww, wh * 0.25);
      }
      if (o.mullion) {
        c.fillStyle = o.mullion;
        c.fillRect(x + ww / 2 - 1, y, 2, wh);
        g.fillStyle = '#000';
        g.fillRect(x + ww / 2 - 1, y, 2, wh);
      }
      if (o.sill) {
        c.fillStyle = o.sill;
        c.fillRect(x - 2, y + wh, ww + 4, 3);
      }
    }
  }
  const mk = (cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.repeat.set(1 / cells, 1 / cells); // one UV unit = one bay
    return t;
  };
  return { map: mk(color), emissiveMap: mk(glow) };
}

const FACADES = {
  officeGlass: { wall: '#3b4a5e', glass: '#22344d', winW: 0.92, winH: 0.84, lit: 0.5, mullion: '#556375', slab: '#4d5b6e' },
  officeLight: { wall: '#d8dde4', glass: '#2a3a52', winW: 0.62, winH: 0.6, lit: 0.45, slab: '#c3cad3', sill: '#b5bcc6' },
  civic: { wall: '#e9e4da', glass: '#2d3c52', winW: 0.5, winH: 0.62, lit: 0.55, sill: '#cfc8bb' },
  warm: { wall: '#c8b49a', glass: '#2b3647', winW: 0.48, winH: 0.58, lit: 0.55, sill: '#b09a7e' },
  residential: { wall: '#eef0f2', glass: '#2b3a50', winW: 0.42, winH: 0.55, lit: 0.6, sill: '#cfd5dc' },
  brick: { wall: '#9a5a45', glass: '#2a3446', winW: 0.42, winH: 0.58, lit: 0.6, sill: '#d9cfc4' },
  tower: { wall: '#9fb3c8', glass: '#2e4a6a', winW: 0.96, winH: 0.9, lit: 0.42, mullion: '#c7d4e2', slab: '#b9c8d8' },
  industrial: { wall: '#e7eaee', glass: '#41536b', winW: 0.3, winH: 0.22, lit: 0.35, slab: '#d4d9df' },
  house: { wall: '#ffffff', glass: '#2b3a50', winW: 0.36, winH: 0.42, lit: 0.7, sill: '#ffffff' },
};

export const materials = {};
const emissive = []; // [material, dayIntensity, nightIntensity]

function std(key, params, day = 0, night = 0) {
  const m = new THREE.MeshStandardMaterial(params);
  materials[key] = m;
  if (params.emissive !== undefined || params.emissiveMap) emissive.push([m, day, night]);
  return m;
}

export function createMaterials() {
  let seed = 11;
  for (const [k, o] of Object.entries(FACADES)) {
    const t = facadeTexture(o, seed++);
    std(`f_${k}`, { map: t.map, emissiveMap: t.emissiveMap, emissive: 0xffffff, roughness: k.startsWith('office') || k === 'tower' ? 0.35 : 0.8, metalness: k === 'officeGlass' || k === 'tower' ? 0.35 : 0.05 }, 0.0, k === 'industrial' ? 0.6 : 0.85);
  }
  // House walls in Nordic colours, with the house window texture tinted.
  const houseTex = facadeTexture(FACADES.house, 99);
  for (const [k, col] of Object.entries({ red: '#a8473a', ochre: '#d1a14a', teal: '#3f8088', white: '#eef0f0', blue: '#4f6f9a' })) {
    std(`h_${k}`, { color: col, map: houseTex.map, emissiveMap: houseTex.emissiveMap, emissive: 0xffffff, roughness: 0.85 }, 0, 0.8);
  }

  std('snow', { color: 0xf2f5f9, roughness: 0.95 });
  std('snowRoof', { color: 0xf7f9fc, roughness: 0.9 });
  std('snowBank', { color: 0xe9eef5, roughness: 1 });
  std('asphalt', { color: 0x3c424d, roughness: 0.55, metalness: 0.05 });
  std('runway', { color: 0x2f343c, roughness: 0.6 });
  std('sidewalk', { color: 0xaab2bd, roughness: 0.85 });
  std('plaza', { color: 0x8f98a6, roughness: 0.6 });
  std('marking', { color: 0xf0f2f5, roughness: 0.6 });
  std('markingYellow', { color: 0xf2c14e, roughness: 0.6 });
  std('concrete', { color: 0xc9ced6, roughness: 0.85 });
  std('concreteDark', { color: 0x7d8693, roughness: 0.85 });
  std('panel', { color: 0xeef1f5, roughness: 0.5, metalness: 0.15 });
  std('panelGrey', { color: 0xb8c0cb, roughness: 0.55, metalness: 0.2 });
  std('metal', { color: 0xc9d1db, roughness: 0.3, metalness: 0.85 });
  std('metalDark', { color: 0x4b5361, roughness: 0.45, metalness: 0.6 });
  std('pipe', { color: 0xd6dce4, roughness: 0.25, metalness: 0.9 });
  std('glass', { color: 0x7894b3, roughness: 0.06, metalness: 0.75, envMapIntensity: 1.2 });
  std('glassGold', { color: 0xd8a84a, roughness: 0.12, metalness: 0.85, emissive: 0xffb050 }, 0, 0.35);
  std('glassWarm', { color: 0x8aa0b8, roughness: 0.08, metalness: 0.4, emissive: 0xffc27a }, 0.05, 0.85);
  std('glassGreen', { color: 0xa8d8c8, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.55, emissive: 0xff8ad0 }, 0.0, 0.7);
  std('plants', { color: 0x3f8f4a, roughness: 0.8, emissive: 0xff5fc8 }, 0, 0.8);
  std('timber', { color: 0x8a5a3b, roughness: 0.8 });
  std('timberDark', { color: 0x5a3a28, roughness: 0.85 });
  std('stone', { color: 0x6d7480, roughness: 0.9 });
  std('rock', { color: 0xffffff, roughness: 0.95, flatShading: true, vertexColors: true });
  std('ice', { color: 0x9fd4ef, roughness: 0.15, metalness: 0.1, emissive: 0x4fb8ff }, 0.05, 0.6);
  std('water', { color: 0x2fb5c0, roughness: 0.05, metalness: 0.2, emissive: 0x22d0d8 }, 0.08, 0.9);
  std('waterDark', { color: 0x2c6f8a, roughness: 0.08, metalness: 0.3 });
  std('treeGreen', { color: 0x2a5a48, roughness: 0.9, flatShading: true });
  std('trunk', { color: 0x6b4a33, roughness: 0.9 });
  std('solar', { color: 0x1c2d5a, roughness: 0.18, metalness: 0.6 });
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
  std('statue', { color: 0xd9dee5, roughness: 0.18, metalness: 0.95 });
  std('granite', { color: 0x2f3338, roughness: 0.4, metalness: 0.1 });
  std('fabric', { color: 0xf6f1e8, roughness: 0.7, emissive: 0xfff0d0 }, 0.05, 0.9);
  std('vehicleRed', { color: 0xc23a2e, roughness: 0.35, metalness: 0.4 });
  std('vehicleWhite', { color: 0xf2f4f7, roughness: 0.3, metalness: 0.4 });
  std('vehicleBlue', { color: 0x2f5fa8, roughness: 0.35, metalness: 0.4 });
  std('jet', { color: 0xf4f6f9, roughness: 0.25, metalness: 0.3 });
  std('jetTail', { color: 0x1f4e8c, roughness: 0.3, metalness: 0.3 });
  return materials;
}

export function setMode(mode, env = 0.5) {
  for (const [m, day, night] of emissive) m.emissiveIntensity = mode === 'night' ? night : day;
  // Sky light from the environment map, kept lower than the sun so shadows stay readable.
  for (const [k, m] of Object.entries(materials)) m.envMapIntensity = k.startsWith('glass') ? env * 2.4 : env;
}
