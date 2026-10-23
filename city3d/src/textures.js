// Painted textures for the facades. Each facade style is drawn on canvases as a grid of cells,
// one window bay wide and one floor high, in four layers:
//   map       colour: wall, frames, glass, curtains and blinds seen through the glass
//   glow      what shines at night: lit rooms, lamps, shop interiors and signs (emissive map)
//   rm        roughness (green) and metalness (blue), so glass and frames reflect the sky
//   normal    small relief from a height drawing: window reveals, sills, brick, boards, ribs
import * as THREE from 'three';
import { rng } from './util.js';

const FLOOR_RATIO = 3.6 / 3.2; // a cell is one 3.2 m bay wide and one 3.6 m floor high

const canvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

// Grey-level helpers for the roughness/metalness layer and the height layer.
const rmStyle = (rough, metal) => `rgb(0,${Math.round(rough * 255)},${Math.round(metal * 255)})`;
const grey = (v) => `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`;

function hex(c) {
  const v = parseInt(c.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function shade(c, k) {
  const [r, g, b] = hex(c);
  const f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// Fine grain laid over a whole layer, so walls are not perfectly flat colour.
let grainCanvas = null;
function grain(g, w, h, alpha) {
  if (!grainCanvas) {
    grainCanvas = canvas(128, 128);
    const c = grainCanvas.getContext('2d');
    const img = c.createImageData(128, 128);
    const r = rng(5);
    for (let i = 0; i < 128 * 128; i++) {
      const v = 128 + (r() - 0.5) * 120;
      img.data.set([v, v, v, 255], i * 4);
    }
    c.putImageData(img, 0, 0);
  }
  g.save();
  g.globalAlpha = alpha;
  g.globalCompositeOperation = 'overlay';
  g.fillStyle = g.createPattern(grainCanvas, 'repeat');
  g.fillRect(0, 0, w, h);
  g.restore();
}

// Normal map from a height drawing (bright = closer to the viewer).
export function normalFromHeight(hc, strength) {
  const w = hc.width;
  const h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = canvas(w, h);
  const og = out.getContext('2d');
  const img = og.createImageData(w, h);
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const k = (y * w + x) * 4;
      img.data[k] = Math.round((-dx / len * 0.5 + 0.5) * 255);
      img.data[k + 1] = Math.round((dy / len * 0.5 + 0.5) * 255);
      img.data[k + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      img.data[k + 3] = 255;
    }
  }
  og.putImageData(img, 0, 0);
  return out;
}

function toTextures(layers, cellsU, cellsV) {
  const mk = (cv, srgb) => {
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.repeat.set(1 / cellsU, 1 / cellsV); // one UV unit = one cell
    return t;
  };
  const rm = mk(layers.rm, false);
  return {
    map: mk(layers.color, true),
    emissiveMap: mk(layers.glow, true),
    roughnessMap: rm, // roughness is read from the green channel
    metalnessMap: rm, // metalness from the blue channel
    normalMap: mk(normalFromHeight(layers.height, layers.relief || 6), false),
  };
}

// Rooms seen through a lit window: a warm or cool interior, brighter under the ceiling, with
// dark furniture shapes and sometimes a person, curtains glowing where light passes through.
function litRoom(g, r, x, y, w, h, kind, curtain) {
  const office = kind === 'office';
  const k = 0.55 + r() * 0.45;
  const warm = office ? r() < 0.25 : r() < 0.85;
  const base = warm ? [255, 186 + r() * 40, 110 + r() * 50] : office ? [205, 225, 255] : [190, 210, 255];
  const c = (m) => `rgb(${base.map((v) => Math.round(v * k * m)).join(',')})`;
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, c(1));
  gr.addColorStop(0.45, c(0.75));
  gr.addColorStop(1, c(0.45));
  g.fillStyle = gr;
  g.fillRect(x, y, w, h);
  if (office) {
    // Ceiling light strips and rows of desks with screens.
    g.fillStyle = `rgba(255,255,255,${0.5 * k})`;
    for (let i = 0; i < 3; i++) g.fillRect(x + w * (0.1 + i * 0.32), y + h * 0.04, w * 0.18, h * 0.04);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(x, y + h * 0.72, w, h * 0.06);
    for (let i = 0; i < 3; i++) if (r() < 0.6) g.fillRect(x + w * (0.08 + i * 0.32 + r() * 0.06), y + h * 0.6, w * 0.12, h * 0.12);
  } else {
    // A ceiling lamp, a sofa or a plant, and sometimes somebody at home.
    const lx = x + w * (0.3 + r() * 0.4);
    const rg = g.createRadialGradient(lx, y + h * 0.1, 0, lx, y + h * 0.1, w * 0.5);
    rg.addColorStop(0, `rgba(255,240,215,${0.7 * k})`);
    rg.addColorStop(1, 'rgba(255,240,215,0)');
    g.fillStyle = rg;
    g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(20,12,8,0.6)';
    if (r() < 0.5) g.fillRect(x + w * r() * 0.4, y + h * 0.74, w * (0.35 + r() * 0.2), h * 0.26);
    if (r() < 0.3) {
      const px = x + w * (0.2 + r() * 0.6);
      g.beginPath();
      g.ellipse(px, y + h * 0.42, w * 0.05, w * 0.06, 0, 0, Math.PI * 2);
      g.fill();
      g.fillRect(px - w * 0.07, y + h * 0.5, w * 0.14, h * 0.5);
    }
  }
  if (curtain) {
    const cw = w * (0.18 + r() * 0.15);
    g.fillStyle = `rgba(255,${Math.round(205 + r() * 30)},${Math.round(150 + r() * 40)},${0.8 * k})`;
    g.fillRect(x, y, cw, h);
    g.fillRect(x + w - cw, y, cw, h);
  }
}

// Draws one facade style. `o` gives the colours and the window layout; see STYLES below.
export function paintFacade(o, seed, size = 1536) {
  const r = rng(seed);
  const cellsU = o.cellsU || 8;
  const cellsV = o.cellsV || 8;
  const W = size;
  const H = Math.round((size / cellsU) * (o.cellH || FLOOR_RATIO) * cellsV);
  const cw = W / cellsU;
  const ch = H / cellsV;
  const L = { color: canvas(W, H), glow: canvas(W, H), rm: canvas(W, H), height: canvas(W >> 1, H >> 1), relief: o.relief };
  const c = L.color.getContext('2d');
  const g = L.glow.getContext('2d');
  const m = L.rm.getContext('2d');
  const hh = L.height.getContext('2d');
  hh.scale(0.5, 0.5);
  c.fillStyle = o.wall;
  c.fillRect(0, 0, W, H);
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  m.fillStyle = rmStyle(o.wallRough ?? 0.85, o.wallMetal ?? 0);
  m.fillRect(0, 0, W, H);
  hh.fillStyle = grey(0.7);
  hh.fillRect(0, 0, W, H);

  // Wall materials.
  if (o.brick) {
    const course = ch / 44;
    for (let y = 0, row = 0; y < H; y += course, row++) {
      const bw = course * 3.2;
      for (let x = (row % 2) * bw * 0.5 - bw; x < W; x += bw) {
        c.fillStyle = shade(o.wall, (r() - 0.5) * 0.18);
        c.fillRect(x + 1, y + 1, bw - 2, course - 2);
      }
      c.fillStyle = o.mortar;
      c.fillRect(0, y, W, 1);
      hh.fillStyle = grey(0.62);
      hh.fillRect(0, y, W, 1.5);
    }
  }
  if (o.boards) {
    const bh = ch / 18;
    for (let y = 0; y < H; y += bh) {
      c.fillStyle = shade(o.wall, (r() - 0.5) * 0.06);
      c.fillRect(0, y, W, bh);
      c.fillStyle = 'rgba(0,0,0,0.18)';
      c.fillRect(0, y + bh - 2, W, 2);
      const gr = hh.createLinearGradient(0, y, 0, y + bh);
      gr.addColorStop(0, grey(0.62));
      gr.addColorStop(1, grey(0.78));
      hh.fillStyle = gr;
      hh.fillRect(0, y, W, bh);
    }
  }
  if (o.ribs) {
    const step = cw / 10;
    for (let x = 0; x < W; x += step) {
      const gr = hh.createLinearGradient(x, 0, x + step, 0);
      gr.addColorStop(0, grey(0.6));
      gr.addColorStop(0.5, grey(0.8));
      gr.addColorStop(1, grey(0.6));
      hh.fillStyle = gr;
      hh.fillRect(x, 0, step, H);
      c.fillStyle = 'rgba(0,0,0,0.06)';
      c.fillRect(x, 0, step * 0.15, H);
    }
  }
  if (o.panels) {
    // Joints between cladding panels.
    c.fillStyle = 'rgba(0,0,0,0.12)';
    hh.fillStyle = grey(0.62);
    for (let i = 0; i <= cellsU * 2; i++) {
      c.fillRect(i * cw * 0.5, 0, 2, H);
      hh.fillRect(i * cw * 0.5, 0, 3, H);
    }
  }

  for (let j = 0; j < cellsV; j++) {
    const y0 = j * ch;
    // Floor slab or spandrel band.
    if (o.slab) {
      c.fillStyle = o.slab;
      c.fillRect(0, y0 + ch * (1 - o.slabH), W, ch * o.slabH);
      m.fillStyle = rmStyle(o.slabRough ?? 0.5, o.slabMetal ?? 0.2);
      m.fillRect(0, y0 + ch * (1 - o.slabH), W, ch * o.slabH);
      hh.fillStyle = grey(0.76);
      hh.fillRect(0, y0 + ch * (1 - o.slabH), W, ch * o.slabH);
    }
    for (let i = 0; i < cellsU; i++) {
      const x0 = i * cw;
      const ww = cw * o.winW;
      const wh = ch * o.winH;
      const x = x0 + (cw - ww) / 2;
      const y = y0 + ch * (o.winTop ?? (1 - o.winH) * 0.45);
      const lit = r() < o.lit;
      const curtain = o.curtains && r() < o.curtains;
      const blind = !curtain && o.blinds && r() < o.blinds;
      const fr = Math.max(3, cw * (o.frameW ?? 0.035));
      // Reveal: the window is set back into the wall.
      hh.fillStyle = grey(0.35);
      hh.fillRect(x, y, ww, wh);
      // Glass.
      const gr = c.createLinearGradient(0, y, 0, y + wh);
      gr.addColorStop(0, shade(o.glass, 0.12 + r() * 0.08));
      gr.addColorStop(1, shade(o.glass, -0.1 - r() * 0.1));
      c.fillStyle = gr;
      c.fillRect(x, y, ww, wh);
      m.fillStyle = rmStyle(o.glassRough ?? 0.05, o.glassMetal ?? 0.5);
      m.fillRect(x, y, ww, wh);
      if (curtain) {
        const cwid = ww * (0.2 + r() * 0.15);
        c.fillStyle = shade('#d9cbb4', (r() - 0.5) * 0.2);
        c.fillRect(x, y, cwid, wh);
        c.fillRect(x + ww - cwid, y, cwid, wh);
      }
      if (blind) {
        const bh = wh * (0.2 + r() * 0.5);
        c.fillStyle = '#c9ccd0';
        c.fillRect(x, y, ww, bh);
        c.fillStyle = 'rgba(0,0,0,0.15)';
        for (let t = y; t < y + bh; t += 4) c.fillRect(x, t, ww, 1);
      }
      if (lit) {
        litRoom(g, r, x, y, ww, wh, o.light, curtain);
        if (blind) {
          g.fillStyle = 'rgba(0,0,0,0.5)';
          g.fillRect(x, y, ww, wh * 0.3);
        }
      }
      // Shadow of the reveal on the glass, at the top and one side.
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.fillRect(x, y, ww, wh * 0.05);
      c.fillRect(x, y, ww * 0.03, wh);
      // Frame and mullions.
      c.fillStyle = o.frame;
      g.fillStyle = '#000';
      m.fillStyle = rmStyle(o.frameRough ?? 0.4, o.frameMetal ?? 0.6);
      hh.fillStyle = grey(0.55);
      const bar = (bx, by, bw, bh) => {
        c.fillRect(bx, by, bw, bh);
        g.fillRect(bx, by, bw, bh);
        m.fillRect(bx, by, bw, bh);
        hh.fillRect(bx, by, bw, bh);
      };
      bar(x, y, ww, fr);
      bar(x, y + wh - fr, ww, fr);
      bar(x, y, fr, wh);
      bar(x + ww - fr, y, fr, wh);
      for (let k = 1; k < (o.mullions || 1) + 1; k++) if (o.mullions) bar(x + (ww * k) / (o.mullions + 1) - fr / 2, y, fr * 0.8, wh);
      if (o.transom) bar(x, y + wh * o.transom, ww, fr * 0.8);
      if (o.sill) {
        c.fillStyle = o.sill;
        c.fillRect(x - fr, y + wh, ww + fr * 2, ch * 0.025);
        c.fillStyle = 'rgba(0,0,0,0.1)';
        c.fillRect(x - fr, y + wh + ch * 0.025, ww + fr * 2, ch * 0.05); // drip stain
        hh.fillStyle = grey(0.95);
        hh.fillRect(x - fr, y + wh, ww + fr * 2, ch * 0.025);
      }
      if (o.lintel) {
        c.fillStyle = o.lintel;
        c.fillRect(x - fr * 2, y - ch * 0.05, ww + fr * 4, ch * 0.05);
        hh.fillStyle = grey(0.85);
        hh.fillRect(x - fr * 2, y - ch * 0.05, ww + fr * 4, ch * 0.05);
      }
    }
  }
  grain(c, W, H, o.grain ?? 0.25);
  const t = toTextures(L, cellsU, cellsV);
  return t;
}

// Ground-floor shops: each bay is 3.2 m wide and 4.5 m high, grouped into shops of two or three
// bays with a door, a lit sign and a window full of goods, a café or a lobby.
const SHOP_SIGNS = ['CAFÉ', 'BAKERY', 'BOOKS', 'PHARMACY', 'FLOWERS', 'OUTDOOR', 'MARKET', 'DELI', 'OPTICS', 'TEA HOUSE', 'BISTRO', 'GALLERY', 'SPORT', 'NOODLES', 'FISH', 'TOYS', 'WOOL', 'SKI'];
const SIGN_COLOURS = ['#f4e6c8', '#ffffff', '#ffd27a', '#9ff0e0', '#ffb3c6', '#c9d8ff'];
const FASCIA = ['#20252c', '#2d3a33', '#3b2b2b', '#1f2a3d', '#4a4036', '#e9e4da'];

export function paintShops(seed) {
  const r = rng(seed);
  const cellsU = 8;
  const cellsV = 4;
  const cw = 200;
  const ch = Math.round(cw * (4.5 / 3.2));
  const W = cw * cellsU;
  const H = ch * cellsV;
  const L = { color: canvas(W, H), glow: canvas(W, H), rm: canvas(W, H), height: canvas(W >> 1, H >> 1), relief: 5 };
  const c = L.color.getContext('2d');
  const g = L.glow.getContext('2d');
  const m = L.rm.getContext('2d');
  const hh = L.height.getContext('2d');
  hh.scale(0.5, 0.5);
  c.fillStyle = '#5a5e66';
  c.fillRect(0, 0, W, H);
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  m.fillStyle = rmStyle(0.7, 0);
  m.fillRect(0, 0, W, H);
  hh.fillStyle = grey(0.7);
  hh.fillRect(0, 0, W, H);
  const fascia = ch * 0.17;
  const riser = ch * 0.07;
  for (let j = 0; j < cellsV; j++) {
    const y0 = j * ch;
    let i = 0;
    while (i < cellsU) {
      const n = Math.min(cellsU - i, r() < 0.5 ? 2 : 3);
      const x0 = i * cw;
      const sw = n * cw;
      const kind = ['goods', 'cafe', 'goods', 'lobby', 'fashion', 'cafe'][Math.floor(r() * 6)];
      const fcol = FASCIA[Math.floor(r() * FASCIA.length)];
      const scol = SIGN_COLOURS[Math.floor(r() * SIGN_COLOURS.length)];
      const back = ['#f3e2c4', '#efe6d6', '#e8d3b0', '#f6efe4', '#d9e4ec'][Math.floor(r() * 5)];
      const door = Math.floor(r() * n);
      // Stone pilasters frame each shop.
      c.fillStyle = '#7b7f87';
      c.fillRect(x0, y0, sw, ch);
      // Fascia with the shop sign.
      c.fillStyle = fcol;
      c.fillRect(x0, y0, sw, fascia);
      hh.fillStyle = grey(0.85);
      hh.fillRect(x0, y0, sw, fascia);
      const word = SHOP_SIGNS[Math.floor(r() * SHOP_SIGNS.length)];
      c.font = `bold ${Math.round(fascia * 0.5)}px "DejaVu Sans", sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = scol;
      c.fillText(word, x0 + sw / 2, y0 + fascia * 0.55);
      g.font = c.font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = scol;
      g.fillText(word, x0 + sw / 2, y0 + fascia * 0.55);
      // Glazing between the fascia and the riser.
      const gy = y0 + fascia + ch * 0.03;
      const gh = ch - fascia - riser - ch * 0.03;
      for (let k = 0; k < n; k++) {
        const bx = x0 + k * cw + cw * 0.06;
        const bw = cw * 0.88;
        const isDoor = k === door;
        // Interior: back wall, ceiling spots, and what the shop sells.
        const gr = c.createLinearGradient(0, gy, 0, gy + gh);
        gr.addColorStop(0, shade(back, -0.05));
        gr.addColorStop(1, shade(back, -0.45));
        c.fillStyle = gr;
        c.fillRect(bx, gy, bw, isDoor ? gh + riser : gh);
        const glowGr = g.createLinearGradient(0, gy, 0, gy + gh);
        glowGr.addColorStop(0, shade(back, 0));
        glowGr.addColorStop(1, shade(back, -0.55));
        g.fillStyle = glowGr;
        g.fillRect(bx, gy, bw, isDoor ? gh + riser : gh);
        for (let s = 0; s < 3; s++) {
          const sx = bx + bw * (0.2 + s * 0.3);
          const rg = g.createRadialGradient(sx, gy + gh * 0.05, 0, sx, gy + gh * 0.05, bw * 0.25);
          rg.addColorStop(0, 'rgba(255,248,230,0.95)');
          rg.addColorStop(1, 'rgba(255,248,230,0)');
          g.fillStyle = rg;
          g.fillRect(bx, gy, bw, gh * 0.4);
        }
        const paintBoth = (fill, x, y, w, h, glowK = 0.75) => {
          c.fillStyle = fill;
          c.fillRect(x, y, w, h);
          g.fillStyle = shade(fill, -1 + glowK);
          g.fillRect(x, y, w, h);
        };
        if (isDoor) {
          // Glass door with a push bar.
          paintBoth('#2a2e35', bx + bw * 0.46, gy + gh * 0.45, bw * 0.08, gh * 0.03, 0.2);
        } else if (kind === 'goods' || kind === 'fashion') {
          for (let s = 0; s < 4; s++) {
            const sy = gy + gh * (0.3 + s * 0.17);
            paintBoth('#8a6a4a', bx, sy, bw, gh * 0.015, 0.4);
            for (let p = 0; p < 9; p++) {
              if (r() < 0.25) continue;
              const pw = bw * (0.05 + r() * 0.06);
              const ph = gh * (0.04 + r() * 0.08);
              const col = `hsl(${Math.floor(r() * 360)},${50 + r() * 30}%,${40 + r() * 25}%)`;
              c.fillStyle = col;
              c.fillRect(bx + bw * (p / 9) + 2, sy - ph, pw, ph);
              g.fillStyle = col;
              g.globalAlpha = 0.6;
              g.fillRect(bx + bw * (p / 9) + 2, sy - ph, pw, ph);
              g.globalAlpha = 1;
            }
          }
          if (kind === 'fashion') {
            for (let p = 0; p < 2; p++) {
              const px = bx + bw * (0.3 + p * 0.4);
              const col = `hsl(${Math.floor(r() * 360)},45%,45%)`;
              paintBoth(col, px - bw * 0.07, gy + gh * 0.45, bw * 0.14, gh * 0.35, 0.5);
              paintBoth('#e8dccb', px - bw * 0.03, gy + gh * 0.36, bw * 0.06, gh * 0.08, 0.6);
            }
          }
        } else if (kind === 'cafe') {
          // Pendant lamps over little tables, and a counter at the back.
          paintBoth('#5a3a28', bx, gy + gh * 0.62, bw, gh * 0.08, 0.35);
          for (let p = 0; p < 2; p++) {
            const px = bx + bw * (0.28 + p * 0.44);
            g.fillStyle = 'rgba(255,214,150,1)';
            g.beginPath();
            g.arc(px, gy + gh * 0.22, bw * 0.05, 0, Math.PI * 2);
            g.fill();
            c.fillStyle = '#f3d9a4';
            c.beginPath();
            c.arc(px, gy + gh * 0.22, bw * 0.05, 0, Math.PI * 2);
            c.fill();
            paintBoth('#2b211b', px - bw * 0.12, gy + gh * 0.78, bw * 0.24, gh * 0.03, 0.15);
            paintBoth('#2b211b', px - bw * 0.01, gy + gh * 0.8, bw * 0.02, gh * 0.2, 0.15);
            if (r() < 0.7) paintBoth('#3a2a2a', px - bw * 0.2, gy + gh * 0.62, bw * 0.07, gh * 0.25, 0.1); // a guest
          }
        } else {
          // Lobby: a reception desk and a tall plant.
          paintBoth('#cfc5b4', bx + bw * 0.25, gy + gh * 0.7, bw * 0.5, gh * 0.3, 0.7);
          paintBoth('#2f5a3a', bx + bw * 0.78, gy + gh * 0.45, bw * 0.12, gh * 0.4, 0.3);
        }
        // Glass surface: reflective; mullion frames in dark metal.
        m.fillStyle = rmStyle(0.04, 0.35);
        m.fillRect(bx, gy, bw, isDoor ? gh + riser : gh);
        hh.fillStyle = grey(0.45);
        hh.fillRect(bx, gy, bw, isDoor ? gh + riser : gh);
        c.fillStyle = '#23262b';
        g.fillStyle = '#000';
        const fr = 5;
        const bars = [[bx, gy, bw, fr], [bx, gy, fr, gh], [bx + bw - fr, gy, fr, gh], [bx, gy + gh * 0.16, bw, fr * 0.8]];
        if (!isDoor) bars.push([bx, gy + gh - fr, bw, fr]);
        else bars.push([bx + bw / 2 - fr / 2, gy + gh * 0.16, fr, gh * 0.84 + riser]);
        for (const [a, b2, w2, h2] of bars) {
          c.fillRect(a, b2, w2, h2);
          g.fillRect(a, b2, w2, h2);
        }
      }
      // Dark granite riser under the windows.
      c.fillStyle = '#2c2f35';
      for (let k = 0; k < n; k++) if (k !== door) c.fillRect(x0 + k * cw + cw * 0.06, y0 + ch - riser, cw * 0.88, riser);
      i += n;
    }
  }
  grain(c, W, H, 0.2);
  return toTextures(L, cellsU, cellsV);
}

export const STYLES = {
  officeGlass: {
    wall: '#2d3a4b', glass: '#4a6482', frame: '#69778a', slab: '#263241', slabH: 0.24, slabMetal: 0.5, slabRough: 0.25,
    winW: 1, winH: 0.76, winTop: 0, frameW: 0.02, mullions: 1, lit: 0.5, light: 'office', blinds: 0.25, glassMetal: 0.6, relief: 3,
  },
  tower: {
    wall: '#9cb1c7', glass: '#5f84aa', frame: '#d3dde8', slab: '#b4c4d6', slabH: 0.16, slabMetal: 0.6, slabRough: 0.2,
    winW: 1, winH: 0.84, winTop: 0, frameW: 0.018, mullions: 1, lit: 0.42, light: 'office', blinds: 0.15, glassMetal: 0.7, relief: 3,
  },
  officeLight: {
    wall: '#d6dbe2', glass: '#3f5570', frame: '#7d8794', winW: 0.84, winH: 0.5, winTop: 0.24, frameW: 0.025, mullions: 2,
    lit: 0.45, light: 'office', blinds: 0.35, panels: true, slab: '#c4cbd4', slabH: 0.08, sill: '#b8c0ca',
  },
  civic: {
    wall: '#e4ddcf', glass: '#3a4c64', frame: '#f4f1ea', winW: 0.46, winH: 0.62, frameW: 0.04, mullions: 1, transom: 0.28,
    lit: 0.55, light: 'warm', curtains: 0.3, sill: '#cbc1ae', lintel: '#d3c9b6', frameMetal: 0.1, frameRough: 0.6,
  },
  warm: {
    wall: '#c4ab8a', glass: '#34445a', frame: '#efe7da', winW: 0.46, winH: 0.6, frameW: 0.04, mullions: 1, transom: 0.3,
    lit: 0.55, light: 'warm', curtains: 0.45, sill: '#a99274', lintel: '#b39c7e', frameMetal: 0.1, frameRough: 0.6,
  },
  residential: {
    wall: '#e9ebed', glass: '#3a4d65', frame: '#ffffff', winW: 0.44, winH: 0.58, frameW: 0.045, mullions: 1,
    lit: 0.6, light: 'home', curtains: 0.55, blinds: 0.2, sill: '#cdd3da', frameMetal: 0.05, frameRough: 0.5,
  },
  brick: {
    wall: '#94523d', mortar: '#c9b8a8', brick: true, glass: '#33425a', frame: '#efe9e0', winW: 0.42, winH: 0.6, frameW: 0.045,
    mullions: 1, transom: 0.3, lit: 0.6, light: 'home', curtains: 0.55, sill: '#d7cdc1', lintel: '#d7cdc1', frameMetal: 0.05, frameRough: 0.5, relief: 7,
  },
  industrial: {
    wall: '#e1e5ea', ribs: true, glass: '#4a5d75', frame: '#9aa4b0', winW: 0.7, winH: 0.16, winTop: 0.2, frameW: 0.03,
    lit: 0.35, light: 'office', slab: '#cfd5dc', slabH: 0.05, wallRough: 0.45, wallMetal: 0.4, relief: 5,
  },
};

// Houses: timber boards painted in Nordic colours, white window frames with a cross bar.
export const HOUSE_COLOURS = { red: '#9c3d32', ochre: '#c99a45', teal: '#3d7880', white: '#e9ecec', blue: '#4a6992' };
export function houseStyle(col) {
  return {
    wall: col, boards: true, glass: '#33445a', frame: '#f6f6f2', winW: 0.42, winH: 0.5, winTop: 0.24, frameW: 0.06,
    mullions: 1, transom: 0.4, lit: 0.7, light: 'home', curtains: 0.6, sill: '#f6f6f2', frameMetal: 0, frameRough: 0.6,
    cellH: 2.8 / 2.6, relief: 6,
  };
}

// Behind the spa's glass fronts: a warm timber ceiling with downlights, stone walls, loungers,
// plants, guests and the turquoise glow of the pools. One texture spans 16 m of glazing.
export function paintLounge(seed) {
  const r = rng(seed);
  const W = 2048;
  const H = 384;
  const color = canvas(W, H);
  const glow = canvas(W, H);
  const c = color.getContext('2d');
  const g = glow.getContext('2d');
  const both = (fn) => { fn(c, false); fn(g, true); };
  // Back wall and floor.
  both((x, isGlow) => {
    const gr = x.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, isGlow ? '#8a5a30' : '#5a3a22');
    gr.addColorStop(0.18, isGlow ? '#f2c48a' : '#c99a68');
    gr.addColorStop(0.75, isGlow ? '#b98250' : '#8a6446');
    gr.addColorStop(1, isGlow ? '#3a2616' : '#2c2018');
    x.fillStyle = gr;
    x.fillRect(0, 0, W, H);
  });
  // Ceiling slats and downlights.
  for (let x = 0; x < W; x += 9) {
    c.fillStyle = 'rgba(40,24,12,0.5)';
    c.fillRect(x, 0, 3, H * 0.12);
    g.fillStyle = 'rgba(0,0,0,0.5)';
    g.fillRect(x, 0, 3, H * 0.12);
  }
  for (let x = 40; x < W; x += 110 + r() * 40) {
    const rg = g.createRadialGradient(x, H * 0.14, 0, x, H * 0.3, H * 0.5);
    rg.addColorStop(0, 'rgba(255,236,200,0.9)');
    rg.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = rg;
    g.fillRect(x - H * 0.5, 0, H, H);
  }
  // Pools along the bottom in some stretches, loungers and plants in others.
  let x = 0;
  while (x < W) {
    const len = 200 + r() * 360;
    const kind = r();
    if (kind < 0.35) {
      both((cx, isGlow) => {
        const gr = cx.createLinearGradient(0, H * 0.78, 0, H);
        gr.addColorStop(0, isGlow ? '#7ff0ee' : '#5fd0d0');
        gr.addColorStop(1, isGlow ? '#1aa0b0' : '#2a8a98');
        cx.fillStyle = gr;
        cx.fillRect(x, H * 0.8, len, H * 0.2);
      });
    } else if (kind < 0.7) {
      for (let k = x + 20; k < x + len - 60; k += 90) {
        both((cx, isGlow) => {
          cx.fillStyle = isGlow ? '#1a120c' : '#efe6d6';
          cx.fillRect(k, H * 0.8, 70, H * 0.05);
          cx.fillRect(k + 50, H * 0.72, 20, H * 0.1);
        });
      }
    }
    // Plants and guests.
    for (let k = 0; k < 3; k++) {
      const px = x + r() * len;
      if (r() < 0.5) {
        both((cx, isGlow) => {
          cx.fillStyle = isGlow ? '#0d1a0e' : '#2f5a32';
          cx.beginPath();
          cx.ellipse(px, H * 0.62, 26, 60, 0, 0, Math.PI * 2);
          cx.fill();
          cx.fillStyle = isGlow ? '#120c08' : '#6a6460';
          cx.fillRect(px - 18, H * 0.72, 36, H * 0.12);
        });
      } else {
        both((cx, isGlow) => {
          cx.fillStyle = isGlow ? '#160e08' : '#e9e4dc';
          cx.beginPath();
          cx.arc(px, H * 0.43, 11, 0, Math.PI * 2);
          cx.fill();
          cx.fillRect(px - 15, H * 0.47, 30, H * 0.36);
        });
      }
    }
    x += len;
  }
  grain(c, W, H, 0.2);
  const mk = (cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  return { map: mk(color), emissiveMap: mk(glow) };
}
