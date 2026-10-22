// Draws the four 2D plans of the self-built city: the master plan and the two plant district
// plans are top-down renders of the 3D model with labels on top; the spa level plans are
// drawn as diagrams from the spa descriptions.
//
//   node tools/plans.js out_dir
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', '..');
const ORIGIN = 'http://city.local';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };

const C = { spa: '#e2779c', fusion: '#7b4fd6', food: '#13998c', orange: '#e0602a', red: '#c8232c', ink: '#1d2a3f', muted: '#5d6b80' };

async function loadLayout(page) {
  return page.evaluate(async () => {
    const m = await import('./src/layout.js');
    return JSON.parse(JSON.stringify({ PLACES: m.PLACES, DISTRICTS: m.DISTRICTS, BLOCKS: m.BLOCKS, FOOD: m.FOOD_STAGES, FUSION: m.FUSION_STAGES, MOUNT: m.MOUNT }));
  });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function page(title, subtitle, body, w, h) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; background: #f6f8fb; font-family: 'Carlito', 'Calibri', 'Liberation Sans', sans-serif; color: ${C.ink}; }
    #plan { width: ${w}px; height: ${h}px; position: relative; background: #f6f8fb; }
    h1 { position: absolute; left: 40px; top: 18px; margin: 0; font-size: 42px; font-weight: 700; }
    .sub { position: absolute; left: 42px; top: 76px; font-size: 20px; color: ${C.muted}; }
    .legend { position: absolute; font-size: 17px; line-height: 1.25; }
    .legend h3 { margin: 18px 0 8px; font-size: 21px; }
    .row { display: flex; align-items: flex-start; gap: 10px; margin: 6px 0; }
    .chip { width: 22px; height: 16px; border-radius: 3px; flex: none; margin-top: 2px; }
    .num { width: 22px; height: 22px; border-radius: 50%; color: #fff; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex: none; }
  </style></head><body><div id="plan"><h1>${esc(title)}</h1><div class="sub">${esc(subtitle)}</div>${body}</div></body></html>`;
}

function scaleBar(x, y, pxPerM, metres, step) {
  let s = '';
  const n = metres / step;
  for (let i = 0; i < n; i++) s += `<rect x="${x + i * step * pxPerM}" y="${y}" width="${step * pxPerM}" height="8" fill="${i % 2 ? '#fff' : C.ink}" stroke="${C.ink}" stroke-width="1"/>`;
  for (let i = 0; i <= n; i++) s += `<text x="${x + i * step * pxPerM}" y="${y - 6}" font-size="14" text-anchor="middle" fill="${C.ink}">${i * step}</text>`;
  s += `<text x="${x + metres * pxPerM + 10}" y="${y + 9}" font-size="14" fill="${C.ink}">m</text>`;
  return s;
}

function northArrow(x, y) {
  return `<g transform="translate(${x},${y})"><circle r="26" fill="#fff" stroke="${C.ink}" stroke-width="2"/><path d="M0,-18 L9,14 L0,7 L-9,14 Z" fill="${C.ink}"/><text y="-34" text-anchor="middle" font-size="18" font-weight="700" fill="${C.ink}">N</text></g>`;
}

function marker(x, y, label, fill, r = 14) {
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="${r}" font-weight="700" fill="#fff">${esc(label)}</text></g>`;
}

function arrow(x1, y1, x2, y2, col, dashed = false, id = 'a') {
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker></defs>
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="4" ${dashed ? 'stroke-dasharray="9 6"' : ''} marker-end="url(#${id})"/>`;
}

const keyRows = () => [
  ['Buildings and halls', '#8a97a9'],
  ['Roads and runways', '#5d6876'],
  ['Plazas and paved yards', '#dde2e9'],
  ['Trees and parks', '#63ad72'],
  ['Water and pools', '#86c8e8'],
].map(([t, c]) => `<div class="row"><span class="chip" style="background:${c};border:1px solid #c4ccd6"></span>${t}</div>`).join('');

async function masterPlan(cityPage, out, L) {
  const rect = [-440, -380, 560, 335];
  const mapW = 1380;
  const mapH = Math.round((mapW * (rect[3] - rect[1])) / (rect[2] - rect[0]));
  const img = await cityPage.evaluate((o) => window.renderPlan(o), { rect, w: mapW * 2, h: mapH * 2 });
  const X = (x) => ((x - rect[0]) / (rect[2] - rect[0])) * mapW;
  const Y = (z) => ((z - rect[1]) / (rect[3] - rect[1])) * mapH;
  let svg = '';
  const fill = { spa: C.spa, fusion: C.fusion, food: C.food };
  for (const [k, d] of Object.entries(L.DISTRICTS)) {
    const [x0, z0, x1, z1] = d.rect;
    const col = fill[d.colour];
    if (col) svg += `<rect x="${X(x0)}" y="${Y(z0)}" width="${X(x1) - X(x0)}" height="${Y(z1) - Y(z0)}" fill="${col}" fill-opacity="0.12" stroke="${col}" stroke-width="3"/>`;
    const labelCol = col || '#3e5a8a';
    const below = k === 'greenhouses';
    svg += `<text x="${X(x0) + 6}" y="${below ? Y(z1) + 18 : Y(z0) - 7}" font-size="${col ? 19 : 15}" font-weight="700" fill="${labelCol}" paint-order="stroke" stroke="#f6f8fb" stroke-width="4">${esc(d.name)}</text>`;
  }
  svg += `<text x="${X(-108)}" y="${Y(-125)}" font-size="15" font-weight="700" fill="#3e5a8a" paint-order="stroke" stroke="#f6f8fb" stroke-width="4">Downtown: nine blocks</text>`;
  for (const p of L.PLACES) svg += marker(X(p.x), Y(p.z), String(p.n), C.orange, 12);
  svg += northArrow(mapW - 40, 50);
  const pxPerM = mapW / (rect[2] - rect[0]);
  const list = L.PLACES.map((p) => `<div class="row" style="margin:3px 0"><span class="num" style="background:${C.orange};width:20px;height:20px;font-size:11px">${p.n}</span>${esc(p.name)}</div>`).join('');
  const W = 2000;
  const H = Math.max(150 + mapH + 70, 1300);
  const body = `<div style="position:absolute;left:40px;top:130px;width:${mapW}px;height:${mapH}px;border:2px solid ${C.ink};background:url(${img}) 0 0/100% 100%">
      <svg width="${mapW}" height="${mapH}" style="position:absolute;left:0;top:0;overflow:visible">${svg}</svg></div>
    <svg width="400" height="60" style="position:absolute;left:40px;top:${140 + mapH}px">${scaleBar(4, 30, pxPerM, 200, 50)}</svg>
    <div class="legend" style="left:1455px;top:120px;width:520px;font-size:15px">
      <h3>Signature districts</h3>
      <div class="row"><span class="chip" style="background:${C.spa}"></span>Mount Aurora Geothermal Spa Resort</div>
      <div class="row"><span class="chip" style="background:${C.fusion}"></span>Fusion Power Station</div>
      <div class="row"><span class="chip" style="background:${C.food}"></span>Snow-to-Food & Water Plant</div>
      <h3>Map key</h3>${keyRows()}
      <h3>Key places</h3>${list}</div>`;
  await shoot(out, page('Aurora Haven – City Master Plan', 'Polar / Ice City · about 45,000 residents · north is up · 1 unit = 1 m · drawn from the 3D model', body, W, H), W, H);
}

async function districtPlan(cityPage, out, o) {
  const { rect } = o;
  const mapW = 1360;
  const mapH = Math.round((mapW * (rect[3] - rect[1])) / (rect[2] - rect[0]));
  const img = await cityPage.evaluate((p) => window.renderPlan(p), { rect, w: mapW * 2, h: mapH * 2 });
  const X = (x) => ((x - rect[0]) / (rect[2] - rect[0])) * mapW;
  const Y = (z) => ((z - rect[1]) / (rect[3] - rect[1])) * mapH;
  let svg = '';
  o.arrows.forEach(([a, b], i) => {
    const A = o.stages.find((s) => s.n === a);
    const B = o.stages.find((s) => s.n === b);
    const dx = X(B.x) - X(A.x);
    const dy = Y(B.z) - Y(A.z);
    const len = Math.hypot(dx, dy);
    const k = 24 / len;
    svg += arrow(X(A.x) + dx * k, Y(A.z) + dy * k, X(B.x) - dx * k, Y(B.z) - dy * k, C.orange, false, `p${i}`);
  });
  const [hx1, hz1, hx2, hz2, label] = o.heat;
  svg += arrow(X(hx1), Y(hz1), X(hx2), Y(hz2), C.red, true, 'heat');
  svg += `<text x="${X(hx2) + o.heatLabelDx}" y="${Y(hz2) + o.heatLabelDy}" text-anchor="end" font-size="19" font-weight="700" fill="${C.red}" paint-order="stroke" stroke="#f6f8fb" stroke-width="4">${esc(label)}</text>`;
  for (const s of o.stages) svg += marker(X(s.x), Y(s.z), s.n, /[0-9]/.test(s.n) ? o.colour : C.ink, 17);
  svg += northArrow(mapW - 40, 50);
  const pxPerM = mapW / (rect[2] - rect[0]);
  const list = o.stages.map((s) => `<div class="row"><span class="num" style="background:${/[0-9]/.test(s.n) ? o.colour : C.ink}">${s.n}</span>${esc(s.label || s.name)}</div>`).join('');
  const W = 2000;
  const H = 140 + mapH + 80;
  const body = `<div style="position:absolute;left:40px;top:130px;width:${mapW}px;height:${mapH}px;border:2px solid ${C.ink};background:url(${img}) 0 0/100% 100%">
      <svg width="${mapW}" height="${mapH}" style="position:absolute;left:0;top:0;overflow:visible">${svg}</svg></div>
    <svg width="420" height="60" style="position:absolute;left:40px;top:${142 + mapH}px">${scaleBar(4, 30, pxPerM, 60, 15)}</svg>
    <div class="legend" style="left:1440px;top:120px;width:540px">
      <h3>Process stages</h3>${list}
      <h3>Flows</h3>
      <div class="row"><span style="color:${C.orange};font-weight:700;width:22px">➜</span>Process flow, stage to stage</div>
      <div class="row"><span style="color:${C.red};font-weight:700;width:22px">➜</span>Heat / energy export</div>
      <h3>Map key</h3>${keyRows()}</div>`;
  await shoot(out, page(o.title, o.subtitle, body, W, H), W, H);
}

// Spa level plans, drawn to scale from the room descriptions (18 px per metre).
async function spaPlans(out) {
  const S = 18;
  const pool = '#7cc4e8';
  const wall = '#8a97a9';
  const floor = '#e4e8ef';
  const rock = '#a9b2bf';
  const mud = '#8a5a3c';
  const plant = '#63ad72';
  const dot = (x, y, t, ax = 'middle', dy = -10) => `<circle cx="${x}" cy="${y}" r="5" fill="#d4364a"/><text x="${x}" y="${y + dy}" text-anchor="${ax}" font-size="15" font-weight="700" fill="${C.ink}" paint-order="stroke" stroke="#fff" stroke-width="4">${esc(t)}</text>`;
  const r = (x, y, w, h, f, extra = '') => `<rect x="${x * S}" y="${y * S}" width="${w * S}" height="${h * S}" fill="${f}" stroke="${wall}" stroke-width="3" ${extra}/>`;
  const lift = (x, y) => `${r(x, y, 2.6, 2.6, '#dfe7f1')}<rect x="${x * S + 8}" y="${y * S + 8}" width="${2.6 * S - 16}" height="${2.6 * S - 16}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  const panel = (x, y, w, h, title, sub, inner) => `<g transform="translate(${x},${y})">
      <text x="${w / 2}" y="-16" text-anchor="middle" font-size="26" font-weight="700" fill="${C.ink}">${esc(title)}</text>
      <rect x="-14" y="-4" width="${w + 28}" height="${h + 8}" fill="#fff" stroke="#c9d1db" stroke-width="2"/>
      <g transform="translate(0,4)">${inner}</g>
      <text x="${w / 2}" y="${h + 34}" text-anchor="middle" font-size="17" fill="${C.muted}">${esc(sub)}</text></g>`;
  // Level 1: 30 × 26 m inside the rock shell, with the North Portal and the outdoor lagoon.
  const l1 = [
    r(-1, 3, 32, 25, rock),
    r(0, 4, 30, 23, floor),
    r(11, 0, 8, 4, wall, 'fill-opacity="0.85"'),
    r(9, 4, 12, 5, '#f3efe6'),
    r(0, 9, 6, 9, '#f3efe6'),
    r(24, 9, 6, 9, '#f3efe6'),
    r(7.5, 10, 7, 13, pool),
    r(17, 10, 3, 3, pool), r(21, 10, 3, 3, '#a7dcf2'), r(17, 14, 3, 3, '#cfeefb'),
    r(7.5, 24, 7, 1.6, rock),
    lift(15.6, 18.6),
    r(33, -4, 12, 6, pool), r(36, -7, 6, 12, pool),
    `<circle cx="${26 * S}" cy="${22 * S}" r="${1.2 * S}" fill="${plant}"/><circle cx="${3 * S}" cy="${22 * S}" r="${1.2 * S}" fill="${plant}"/>`,
    dot(15 * S, 1.6 * S, 'North Portal & entrance grotto', 'middle', -16),
    dot(15 * S, 6.5 * S, 'Welcome Hall & reception'),
    dot(3 * S, 13 * S, 'Changing suite A'),
    dot(27 * S, 13 * S, 'Changing suite B'),
    dot(11 * S, 16 * S, 'Mineral Lake (7 × 13 m, 40 °C)'),
    dot(20.5 * S, 15 * S, 'Onsen Garden springs', 'middle', 34),
    dot(11 * S, 24.8 * S, 'Hot-spring waterfall', 'middle', -10),
    dot(16.9 * S, 19.9 * S, 'Glass lift', 'start', 30),
    dot(39 * S, -1 * S, 'Aurora Lagoon (38 °C, outdoor)', 'middle', -46),
  ].join('');
  // Level 2: 24 × 20 m.
  const l2 = [
    r(-1, -1, 26, 22, rock), r(0, 0, 24, 20, floor),
    r(2, 3, 8, 10, mud),
    r(13, 3, 3.2, 3.2, mud), r(17, 3, 3.2, 3.2, mud), r(13, 7, 3.2, 3.2, mud), r(17, 7, 3.2, 3.2, mud),
    r(6, 0.3, 8, 2, '#f3efe6'),
    ...[0, 1, 2, 3, 4].map((i) => r(2 + i * 2.1, 15.5, 1.6, 3, '#f3efe6')),
    r(15, 13, 7, 6, '#dfe7f1'),
    lift(10.8, 9.5),
    dot(6 * S, 8 * S, 'Volcanic mud field (8 × 10 m, 39 °C)', 'middle', -10),
    dot(18.6 * S, 5.2 * S, 'Private mud basins', 'middle', 30),
    dot(10 * S, 1.3 * S, 'Clay & herbal bar', 'middle', 26),
    dot(6.5 * S, 17 * S, 'Heated drying loungers', 'middle', 34),
    dot(18.5 * S, 16 * S, 'Rinse room', 'middle', -10),
  ].join('');
  // Level 3: 18 × 16 m.
  const l3 = [
    r(-1, -1, 20, 18, rock), r(0, 0, 18, 16, floor),
    r(0.5, 0.5, 5.4, 5, '#f3efe6'), r(6.3, 0.5, 5.4, 5, '#f3efe6'), r(12.1, 0.5, 5.4, 5, '#f3efe6'),
    r(1, 7, 6, 5, '#f2c8c0'),
    r(12, 7, 5.5, 4, '#f3efe6'),
    r(6, 12.2, 6, 3.4, '#f3efe6'),
    lift(8, 7.5),
    dot(9 * S, 2.8 * S, 'Treatment suites 1–3', 'middle', -10),
    dot(4 * S, 9.5 * S, 'Himalayan salt sauna (75 °C)', 'middle', 34),
    dot(14.7 * S, 9 * S, 'Facial room', 'middle', -10),
    dot(9 * S, 14 * S, 'Tea lounge', 'middle', -10),
  ].join('');
  // Level 4: 12 × 12 m, with the Aurora Eye bubble in the north face.
  const l4 = [
    r(-1, -1, 14, 14, rock), r(0, 0, 12, 12, floor),
    `<circle cx="${6 * S}" cy="${-2.2 * S}" r="${2.4 * S}" fill="#dfe7f1" stroke="${wall}" stroke-width="3"/>`,
    r(1, 5, 5, 5, pool),
    `<circle cx="${8.6 * S}" cy="${7.4 * S}" r="${2.3 * S}" fill="#f3efe6" stroke="${wall}" stroke-width="3"/>`,
    r(8, 1, 3.5, 3, '#f3efe6'),
    lift(4.5, 1.2),
    dot(6 * S, -2.2 * S, 'Aurora Eye viewing alcove', 'middle', 62),
    dot(3.5 * S, 7.5 * S, 'Float pool (35 °C)', 'middle', 34),
    dot(8.6 * S, 7.4 * S, 'Meditation circle', 'middle', 52),
    dot(9.7 * S, 2.5 * S, 'Tea corner', 'middle', 40),
  ].join('');
  const W = 2000;
  const H = 1130;
  const svg = `<svg width="${W}" height="${H}" style="position:absolute;left:0;top:0">
    ${panel(60, 200, 900, 680, 'Level 1 · 0 m', 'Welcome Hall, Mineral Lake Grotto & Onsen Garden', `<g transform="translate(30,150)">${l1}</g>`)}
    ${panel(1010, 260, 488, 416, 'Level 2 · 4.5 m', 'Volcanic Mud Terraces', `<g transform="translate(28,28)">${l2}</g>`)}
    ${panel(1560, 260, 380, 344, 'Level 3 · 9 m', 'Treatment Suites & Himalayan Salt Sauna', `<g transform="translate(28,28)">${l3}</g>`)}
    ${panel(1600, 712, 300, 340, 'Level 4 · 13.5 m', 'Summit Sanctuary & Aurora Eye', `<g transform="translate(42,100)">${l4}</g>`)}
    ${northArrow(1940, 170)}
    <g transform="translate(70,1050)">${scaleBar(0, 0, S, 20, 5)}</g>
  </svg>`;
  const legend = `<div class="legend" style="left:1010px;top:740px;width:520px">
      <h3>Map key</h3>
      <div class="row"><span class="chip" style="background:${pool}"></span>Geothermal pools, lake and springs</div>
      <div class="row"><span class="chip" style="background:${wall}"></span>Walls, counters and furniture</div>
      <div class="row"><span class="chip" style="background:${floor};border:1px solid #c4ccd6"></span>Floors and terraces</div>
      <div class="row"><span class="chip" style="background:${rock}"></span>Basalt and the insulated rock shell</div>
      <div class="row"><span class="chip" style="background:${mud}"></span>Volcanic mud</div>
      <h3>Route through the spa</h3>
      <div>North Portal → grotto → Welcome Hall → changing suites → Mineral Lake & Onsen Garden → glass lift → Level 2 mud terraces → Level 3 treatments & salt sauna → Level 4 Summit Sanctuary and the Aurora Eye</div></div>`;
  await shoot(out, page('Mount Aurora Geothermal Spa Resort – Level Plans', 'Signature district 3 · a four-level spa inside a 35 m snow peak, heated by geothermal springs · the glass lift links all levels', svg + legend, W, H), W, H);
}

let shotPage;
async function shoot(out, html, w, h) {
  await shotPage.setViewportSize({ width: w, height: h });
  await shotPage.setContent(html, { waitUntil: 'load' });
  await shotPage.locator('#plan').screenshot({ path: out });
  console.log('wrote', out);
}

(async () => {
  const outDir = process.argv[2] || 'plans';
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const cityPage = await browser.newPage();
  cityPage.setDefaultTimeout(0);
  cityPage.on('pageerror', (e) => console.log('page error:', e.message));
  await cityPage.route(`${ORIGIN}/**`, (route) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  await cityPage.goto(`${ORIGIN}/city3d/index.html?render`, { waitUntil: 'load' });
  await cityPage.waitForFunction(() => window.cityReady === true, null, { polling: 500 });
  shotPage = await browser.newPage();
  const L = await loadLayout(cityPage);

  await masterPlan(cityPage, path.join(outDir, '01_city_master_plan.png'), L);
  await districtPlan(cityPage, path.join(outDir, '02_fusion_power_station_plan.png'), {
    rect: [140, 150, 336, 272],
    title: 'Fusion Power Station – District Plan',
    subtitle: 'Signature district 1 · compact D-T tokamak · ~300 MW electricity + 450 MW district heat',
    colour: C.fusion,
    stages: L.FUSION.map((s) => ({ ...s, label: {
      1: 'Heavy-water separation: deuterium from snowmelt',
      2: 'Lithium blanket & tritium fuel cycle: breeds its own fuel',
      3: 'Fusion core: HTS-magnet tokamak, no meltdown, no CO2',
      4: 'Power conversion: sCO2 turbines, heat export to the city',
      5: 'Plasma waste converter: rubbish to syngas & glassy slag',
      C: 'Control & visitor centre',
    }[s.n] })),
    arrows: [['1', '2'], ['2', '3'], ['3', '4']],
    heat: [320, 200, 320, 146, 'Heat & power to the city and the food plant'],
    heatLabelDx: -18,
    heatLabelDy: 60,
  });
  await districtPlan(cityPage, path.join(outDir, '03_snow_to_food_water_plant_plan.png'), {
    rect: [138, 24, 338, 134],
    title: 'Snow-to-Food & Water Plant – District Plan',
    subtitle: "Signature district 2 · all drinking water and about half of the city's protein, from snow and air",
    colour: C.food,
    stages: L.FOOD.map((s) => ({ ...s, label: {
      1: 'Snow harvest & melt hall (fusion waste heat)',
      2: 'Drinking-water & mineral works',
      3: 'Electrolysis, air capture & green ammonia',
      4: 'Carbon-fixation chemistry: CO2 to methanol & fats',
      5: 'Bioreactor silos: microbes make protein flour',
      6: 'Food kitchen, bottling & distribution',
      S: 'Snow stockpile bay (calm weeks)',
    }[s.n] })),
    arrows: [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '6']],
    heat: [320, 133, 320, 98, 'Spare heat from the fusion station'],
    heatLabelDx: -18,
    heatLabelDy: 40,
  });
  await spaPlans(path.join(outDir, '04_mount_aurora_spa_resort_plan.png'));
  await browser.close();
})();
