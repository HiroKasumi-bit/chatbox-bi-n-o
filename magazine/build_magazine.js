// Builds the Aurora Haven magazine (A4 portrait) as an editable PowerPoint file.
// Text comes from source/Aurora_Haven_Slide_Content.docx and the place cards in
// source/Aurora_Haven_v13.json; pictures come from assets/.
//
//   cd magazine && npm install && node build_magazine.js
//
// Output: ../output/Aurora_Haven_Magazine.pptx

const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('./tools/apply_theme.js');

const ASSETS = path.join(__dirname, 'assets');
const OUT = path.join(__dirname, '..', 'output', 'Aurora_Haven_Magazine.pptx');
const img = (p) => path.join(ASSETS, p);

const THEME = {
  name: 'Aurora Haven',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0E1A36', // polar night navy
    lt1: 'FFFFFF',
    dk2: '4A5A75', // slate, for captions and secondary text
    lt2: 'EEF3F8', // ice
    accent1: '1FB58F', // aurora green
    accent2: 'E06A2E', // heat orange (the plans' process arrows)
    accent3: '7B4FD6', // Fusion Power Station purple
    accent4: '0E8379', // Snow-to-Food & Water Plant teal
    accent5: 'C9456F', // Mount Aurora spa rose
    accent6: '4A7FC1', // glacier blue
    hlink: '4A7FC1',
    folHlink: '7B4FD6',
  },
};

const pres = new pptxgen();
pres.defineLayout({ name: 'A4_PORTRAIT', width: 8.27, height: 11.69 });
pres.layout = 'A4_PORTRAIT';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Aurora Haven – Issue 01';
pres.subject = 'A polar city that thrives';
pres.author = '[Group name]';

const C = pres.SchemeColor;
const W = 8.27;
const H = 11.69;
const M = 0.6; // outer margin
const CW = W - 2 * M; // content width
const GUT = 0.3; // gutter between columns
const COL2 = (CW - GUT) / 2;
const HEAD = '+mj-lt'; // theme heading font

// ---------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------
function folio(dark) {
  return [
    {
      text: {
        text: 'AURORA HAVEN  ·  ISSUE 01',
        options: { x: M, y: 11.12, w: 4, h: 0.22, fontSize: 7.5, bold: true, charSpacing: 2, color: dark ? C.background2 : C.text2, margin: 0 },
      },
    },
  ];
}
const pageNumber = (dark) => ({ x: W - M - 0.6, y: 11.12, w: 0.6, h: 0.22, fontSize: 8, bold: true, color: dark ? C.background1 : C.text1, align: 'right', margin: 0 });
const titlePh = (dark, y = 0.82, size = 34, h = 0.75) => ({
  placeholder: {
    options: { name: 'title', type: 'title', x: M, y, w: CW, h, fontFace: HEAD, fontSize: size, bold: true, color: dark ? C.background1 : C.text1, align: 'left', valign: 'top', margin: 0 },
    text: '',
  },
});

pres.defineSlideMaster({ title: 'COVER', background: { color: C.text1 }, objects: [] });
pres.defineSlideMaster({ title: 'PAGE_LIGHT', background: { color: C.background1 }, objects: [...folio(false), titlePh(false)], slideNumber: pageNumber(false) });
pres.defineSlideMaster({ title: 'PAGE_ICE', background: { color: C.background2 }, objects: [...folio(false), titlePh(false)], slideNumber: pageNumber(false) });
pres.defineSlideMaster({ title: 'PAGE_DARK', background: { color: C.text1 }, objects: [...folio(true), titlePh(true)], slideNumber: pageNumber(true) });
pres.defineSlideMaster({ title: 'OPENER', background: { color: C.background1 }, objects: [...folio(false), titlePh(false, 7.5, 40, 1.35)], slideNumber: pageNumber(false) });

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------
let objCount = 0;
const name = (n) => `${n}-${++objCount}`;

function text(s, t, o) {
  s.addText(t, Object.assign({ margin: 0, isTextBox: true, valign: 'top', color: C.text1, fontSize: 10.5, objectName: name('text') }, o));
}

// Small caps label with a dot in front, the dot echoing the numbered markers on the plans.
function kicker(s, t, x, y, color, opts = {}) {
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.045, w: 0.11, h: 0.11, fill: { color }, line: { color, width: 0 }, objectName: name('kicker-dot') });
  text(s, t.toUpperCase(), Object.assign({ x: x + 0.2, y, w: opts.w || 6, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: opts.textColor || color }, opts));
}

function pageHead(s, kick, title, color, dark) {
  kicker(s, kick, M, 0.52, color, { textColor: dark ? C.accent1 : color });
  s.addText(title, { placeholder: 'title' });
}

// Paragraphs: array of strings -> one text box with paragraph spacing.
function paras(s, list, x, y, w, h, o = {}) {
  const runs = list.map((p, i) => ({ text: p, options: { breakLine: i < list.length - 1, paraSpaceAfter: 7 } }));
  text(s, runs, Object.assign({ x, y, w, h, lineSpacingMultiple: 1.12 }, o));
}

function standfirst(s, t, x, y, w, h, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontFace: HEAD, italic: true, fontSize: 13.5, color: C.text2, lineSpacingMultiple: 1.1 }, o));
}

function caption(s, t, x, y, w, h = 0.3, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontSize: 8.5, italic: true, color: C.text2 }, o));
}

function stat(s, num, label, x, y, w, color, o = {}) {
  const size = o.size || 26;
  const nh = size / 72 + 0.08;
  text(s, num, { x, y, w, h: nh, fontFace: HEAD, fontSize: size, bold: true, color, valign: 'bottom' });
  text(s, label, { x, y: y + nh + 0.03, w, h: o.lh || 0.42, fontSize: o.lsize || 9, color: o.labelColor || C.text2, lineSpacingMultiple: 1.05 });
}

function marker(s, label, x, y, d, color, o = {}) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color: o.ring || color, width: o.ring ? 1.5 : 0 }, objectName: name('marker') });
  text(s, label, { x, y, w: d, h: d, fontFace: HEAD, fontSize: o.size || Math.round(d * 30), bold: true, color: o.textColor || C.background1, align: 'center', valign: 'middle' });
}

function picture(s, file, x, y, w, h, o = {}) {
  s.addImage(Object.assign({ path: img(file), x, y, w, h, sizing: { type: 'cover', w, h }, objectName: name('picture') }, o));
}

function card(s, x, y, w, h, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color }, line: { color, width: 0 }, objectName: name('card') });
}

function arrow(s, x1, y1, x2, y2, color, width = 2.25) {
  const flipH = x2 < x1;
  const flipV = y2 < y1;
  s.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
    flipH, flipV, line: { color, width, endArrowType: 'triangle' }, objectName: name('arrow'),
  });
}

function addPage(master, section) {
  return pres.addSlide({ masterName: master, sectionTitle: section });
}

// Opener pages of the three signature districts share one frame.
function opener(o) {
  const s = addPage('OPENER', 'Signature Districts');
  picture(s, o.image, 0, 0, W, 6.6);
  marker(s, String(o.number), M, 6.15, 0.9, o.color, { size: 30, ring: C.background1 });
  kicker(s, o.kicker, M, 7.25, o.color);
  s.addText(o.title, { placeholder: 'title' });
  const sy = 7.5 + o.titleLines * 0.62 + 0.12;
  standfirst(s, o.standfirst, M, sy, CW, 0.7, { fontSize: 14 });
  const by = sy + 0.82;
  paras(s, o.col1, M, by, COL2, 10.95 - by);
  paras(s, o.col2, M + COL2 + GUT, by, COL2, 10.95 - by);
  return s;
}

// Numbered stage list (the numbers match the markers on the district plans).
function stages(s, list, x, y, w, rowH, color, o = {}) {
  list.forEach((st, i) => {
    const yy = y + i * rowH;
    marker(s, st.n, x, yy, 0.36, st.color || color, { size: 12 });
    text(s, st.name, { x: x + 0.5, y: yy - 0.01, w: w - 0.5, h: 0.22, fontSize: 10.5, bold: true, color: o.dark ? C.background1 : C.text1 });
    text(s, st.text, { x: x + 0.5, y: yy + 0.22, w: w - 0.5, h: rowH - 0.28, fontSize: 9.5, color: o.dark ? C.background2 : C.text2, lineSpacingMultiple: 1.08 });
  });
}

// ---------------------------------------------------------------------------
// 1 · Cover
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Cover' });
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Cover' });
  s.addImage({ path: img('renders/cover.jpg'), x: 0, y: 0, w: W, h: H, objectName: 'cover-picture' });
  text(s, 'ISSUE 01   ·   POLAR / ICE CITY   ·   ECO-POLIS 3D BUILDER', { x: M, y: 0.38, w: CW, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 3, color: C.background1, align: 'center' });
  text(s, 'AURORA HAVEN', { x: 0.2, y: 0.6, w: W - 0.4, h: 1.15, fontFace: HEAD, fontSize: 64, bold: true, color: C.background1, align: 'center', charSpacing: 1 });
  // The tower is drawn again on top of the masthead, so its spire rises in front of the letters.
  s.addImage({ path: img('renders/cover_tower_top.png'), x: 0, y: 0, w: W, h: (W * 724) / 1600, objectName: 'cover-tower-overlay' });
  text(s, 'A polar city that thrives', { x: M, y: 1.78, w: 2.6, h: 0.35, fontFace: HEAD, italic: true, fontSize: 15, color: C.background1 });

  // One text box per cover line, so the headline, the sell and the page reference flow together.
  const line = (x, y, w, head, sub, page, align) => {
    text(s, [
      { text: head, options: { fontFace: HEAD, fontSize: 15, bold: true, color: C.background1, breakLine: true, paraSpaceAfter: 3 } },
      { text: sub, options: { fontSize: 10.5, color: C.background2, breakLine: true, paraSpaceAfter: 3 } },
      { text: page, options: { fontSize: 8, bold: true, charSpacing: 2, color: C.accent1 } },
    ], { x, y, w, h: 1.45, align, lineSpacingMultiple: 1.05, shadow: { type: 'outer', color: '06102A', blur: 6, offset: 1, angle: 90, opacity: 0.6 } });
  };
  line(M, 2.5, 2.3, "The city's own sun", 'A compact fusion station keeps 45,000 people warm through the polar night', 'PAGE 8', 'left');
  line(M, 4.1, 2.3, 'Bread and water\nfrom snow and air', 'Inside the plant that feeds a city with no farmland', 'PAGE 10', 'left');
  line(W - M - 2.35, 2.5, 2.35, 'A warm heart\ninside the ice', 'Four geothermal spa levels hidden in a 35-metre snow peak', 'PAGE 12', 'right');
  line(W - M - 2.35, 4.1, 2.35, '−45 °C. 120 km/h.\nNo sun.', 'The polar challenge, and the five ideas that answer it', 'PAGE 4', 'right');
}

// ---------------------------------------------------------------------------
// 2 · Contents and letter from the editors
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Welcome' });
  const s = addPage('PAGE_LIGHT', 'Welcome');
  pageHead(s, 'Inside this issue', 'Contents', C.accent6);
  const items = [
    ['3', 'Welcome to Aurora Haven', 'A compact city of 45,000 under a snow peak'],
    ['4', 'The Polar Challenge', 'Cold, darkness, wind and permafrost'],
    ['5', 'Five Design Principles', 'The ideas behind every building'],
    ['6', 'The Whole City Plan', 'From the wind farm to Mount Aurora'],
    ['7', 'Nine Blocks, One Short Walk', 'Downtown around the Aurora Roundabout'],
    ['8', "The City's Own Sun", 'Fusion Power Station'],
    ['10', 'Bread and Water from Snow and Air', 'Snow-to-Food & Water Plant'],
    ['12', 'A Warm Heart Inside the Ice', 'Mount Aurora Geothermal Spa Resort'],
    ['14', 'Three Districts, One Loop', 'How heat, water, oxygen and waste go round'],
    ['15', 'Energy for the Polar Night', 'Fusion, wind, sun, geothermal and storage'],
    ['16', 'Nothing Is Wasted', 'Water and waste in closed loops'],
    ['17', 'Getting Around Fossil-Free', 'Metro, trams, heated roads and the airport'],
    ['18', 'A Livable City Every Day', 'Homes, schools, health, shops and culture'],
    ['19', 'Safe and Ready for Any Storm', 'Rescue, shelters and blizzard forecasts'],
    ['20', 'Take the Tour', 'Eight stops in the live 3D city'],
    ['21', 'Places to Visit', '35 key places and what they do'],
    ['23', 'Aurora Haven by the Numbers', 'The key figures in one place'],
    ['24', 'Warm, Green and Ready', 'Until next time'],
  ];
  const lx = M;
  const ly = 1.85;
  const rowH = 0.5;
  items.forEach(([p, t, d], i) => {
    const y = ly + i * rowH;
    text(s, p, { x: lx, y, w: 0.5, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: C.accent6 });
    text(s, t, { x: lx + 0.6, y: y + 0.02, w: 3.4, h: 0.22, fontSize: 11, bold: true });
    text(s, d, { x: lx + 0.6, y: y + 0.23, w: 3.4, h: 0.2, fontSize: 9, color: C.text2 });
  });

  const rx = 4.85;
  const rw = W - M - rx;
  picture(s, 'renders/lagoon.jpg', rx, 1.85, rw, 1.85);
  caption(s, 'The Aurora Lagoon and the North Portal of Mount Aurora under the northern lights.', rx, 3.78, rw, 0.4);
  kicker(s, 'From the editors', rx, 4.4, C.accent6);
  paras(s, [
    'Welcome to the first issue of Aurora Haven, a magazine about our city for the Polar / Ice environment.',
    'Aurora Haven is a compact city of about 45,000 people on a frozen tundra plateau, below a 35-metre snow peak called Mount Aurora. Our goal was not only to survive the cold but to build a city where people really want to live.',
    'In these pages you will find the challenge we faced, our design ideas, our three signature districts and everyday life in the city. At the back, a self-guided tour shows you how to explore Aurora Haven yourself in 3D.',
  ], rx, 4.75, rw, 2.9, { fontSize: 10.5 });
  text(s, '[Group name]', { x: rx, y: 7.75, w: rw, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, bold: true });
  text(s, '[Member names] · [Class] · [Date]', { x: rx, y: 8.02, w: rw, h: 0.4, fontSize: 9, color: C.text2 });
  card(s, rx, 9.3, rw, 1.55, C.background2);
  kicker(s, 'On the cover', rx + 0.15, 9.45, C.accent6, { w: rw - 0.4 });
  text(s, 'Aurora 81 – Polar Landmark Tower, named in honour of Landmark 81 in Ho Chi Minh City, with Mount Aurora behind it under the northern lights. Its nine bundled glass tubes step back like bamboo stalks and cut blizzard wind load by about 25%.', {
    x: rx + 0.15, y: 9.73, w: rw - 0.3, h: 1.07, fontSize: 9, lineSpacingMultiple: 1.05,
  });
}

// ---------------------------------------------------------------------------
// 3 · Welcome / city overview
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_ICE', 'Welcome');
  pageHead(s, 'City overview', 'Welcome to Aurora Haven', C.accent6);
  s.addImage({ path: img('renders/overview.png'), x: 0.35, y: 1.55, w: W - 0.7, h: ((W - 0.7) * 1349) / 2400, objectName: 'overview-picture' });
  caption(s, 'Aurora Haven seen from the south-east, rendered from the Eco-Polis 3D city file.', M, 5.85, CW, 0.25);
  paras(s, [
    'Aurora Haven is a compact polar city of around 45,000 people, built on a frozen tundra plateau beneath the snow peak of Mount Aurora. Winters fall to −45 °C, the sun disappears for two months of polar night, and almost nothing can grow. Aurora Haven is designed not just to survive these conditions but to make life here warm, healthy and sustainable.',
    'The whole city is shaped around one idea: heat, energy, water and food should never be wasted. Every building shares a single heating network, the city runs on zero-carbon energy, and nearly all of its water and waste is recycled.',
  ], M, 6.3, COL2, 3.45);
  paras(s, [
    'Homes, schools, healthcare, shops and parks sit within a short walk of each other, connected by a downtown metro, electric trams and heated streets.',
    'What makes Aurora Haven unique is its three signature districts. A fusion power station acts as the city’s own sun, giving steady power and heat even through the polar night. A Snow-to-Food & Water Plant turns snow and air into clean drinking water and food, so the city can feed itself without farmland. And inside Mount Aurora, a geothermal spa resort offers warmth, rest and a view of the northern lights. Together they form one closed loop that keeps the city powered, fed and happy in one of the harshest places on Earth.',
  ], M + COL2 + GUT, 6.3, COL2, 3.45);
  const st = [['45,000', 'residents'], ['−45 °C', 'winter lows'], ['35 m', 'Mount Aurora, the snow peak'], ['10 min', 'walk to daily needs']];
  st.forEach(([n, l], i) => stat(s, n, l, M + i * (CW / 4), 9.95, CW / 4 - 0.15, C.accent6, { size: 24, lh: 0.3 }));
}

// ---------------------------------------------------------------------------
// 4 · The polar challenge
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'The City' });
  const s = addPage('PAGE_DARK', 'The City');
  picture(s, 'renders/snowbreak.jpg', 0, 0, W, 4.55);
  kicker(s, 'The place', M, 4.85, C.accent1);
  text(s, 'The Polar Challenge', { x: M, y: 5.1, w: CW, h: 0.75, fontFace: HEAD, fontSize: 38, bold: true, color: C.background1 });
  standfirst(s, 'One of the hardest places on Earth to build a city, so every building had to answer one question.', M, 5.9, CW, 0.65, { color: C.background2, fontSize: 14 });
  paras(s, [
    'Aurora Haven sits in one of the hardest environments on Earth. In winter the temperature falls to minus 45 degrees. For about two months the sun never rises, and for two months in summer it never sets. Blizzards can reach 120 kilometres per hour.',
    'The ground is permafrost, so a warm building can thaw it and crack its own foundations. There is almost no farmland, and in deep winter supplies can only arrive by air.',
    'So the designers asked one question about every building in the city:',
  ], M, 6.75, 3.9, 2.6, { color: C.background2 });
  text(s, '“How does it help people stay warm, fed, safe and happy here?”', { x: M, y: 9.25, w: 3.9, h: 1.0, fontFace: HEAD, italic: true, bold: true, fontSize: 17, color: C.accent1, lineSpacingMultiple: 1.05 });
  const sx = 5.0;
  const sw = W - M - sx;
  const st = [
    ['−45 °C', 'winter temperatures'],
    ['2 months', 'of polar night, and two of midnight sun'],
    ['120 km/h', 'blizzards'],
    ['Permafrost', 'frozen ground that heaves under heat'],
  ];
  st.forEach(([n, l], i) => stat(s, n, l, sx, 6.65 + i * 1.0, sw, C.accent1, { size: 26, labelColor: C.background2, lh: 0.4 }));
  caption(s, 'The windy northern edge, with the Ice-Proof Wind Farm on the horizon.', M, 4.6, CW, 0.22, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 5 · Design principles
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'The City');
  pageHead(s, 'The ideas', 'Five Design Principles', C.accent6);
  standfirst(s, 'Heat, energy, water and food should never be wasted.', M, 1.6, CW, 0.4);
  picture(s, 'renders/downtown.jpg', M, 2.2, CW, 3.3);
  caption(s, 'Downtown around the Aurora Roundabout, with the Snow-to-Food plant and Mount Aurora behind.', M, 5.58, CW, 0.25);
  const pr = [
    ['Heat is life', 'One district-heating loop, fed by the fusion station and the geothermal plant, warms every building. Triple-glazed buildings on insulated piles do not thaw the permafrost.'],
    ['Zero carbon', 'No fossil fuel burns anywhere in the city. Power comes from fusion, wind, sun and geothermal heat.'],
    ['Closed loops', 'About 95% of water is recycled and rubbish is reused, so water, food and waste go round instead of being thrown away.'],
    ['Compact and car-light', 'Daily needs are within a 10-minute walk, and the few cars are electric.'],
    ['Resilient and healthy', 'Shelters keep every resident safe for 30 days, while light, parks, culture and a spa carry people through the polar night.'],
  ];
  pr.forEach(([t, d], i) => {
    const y = 6.1 + i * 0.95;
    marker(s, String(i + 1), M, y, 0.48, C.accent6, { size: 16 });
    text(s, t, { x: M + 0.7, y: y - 0.02, w: CW - 0.7, h: 0.28, fontFace: HEAD, fontSize: 14, bold: true });
    text(s, d, { x: M + 0.7, y: y + 0.28, w: CW - 0.7, h: 0.6, fontSize: 10.5, color: C.text2, lineSpacingMultiple: 1.08 });
  });
}

// ---------------------------------------------------------------------------
// 6 · The whole city plan
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'The City');
  pageHead(s, 'The map', 'The Whole City Plan', C.accent6);
  const ph = (CW * 1445) / 2000;
  s.addImage({ path: img('plans/01_city_master_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'master-plan' });
  caption(s, 'Aurora Haven – City Master Plan. North is up; one grid unit is one metre. Drawn from the 3D map.', M, 1.7 + ph + 0.06, CW, 0.25);
  const zones = [
    ['Downtown', 'Nine blocks around the Aurora Roundabout and the President Ho Chi Minh Monument, with the hospital, schools, shops and the metro interchange.', C.text1],
    ['North', 'The windy north holds the Northern Renewable Park, the energy hub, the Polar Rescue and Resilience Station and the airport.', C.accent6],
    ['West', 'The air base and garrison, behind a belt of trees that screens the eco-homes.', C.text2],
    ['East', 'Greenhouses, the snow stadium, the fusion station and the Snow-to-Food plant, away from homes but linked by pipe bridges and heat mains.', C.accent4],
    ['South', 'Framed by Liberty Mall, Mount Aurora rises with its geothermal spa resort inside.', C.accent5],
  ];
  const gy = 7.15;
  const cw3 = (CW - 2 * 0.2) / 3;
  zones.forEach(([t, d, col], i) => {
    const cx = M + (i % 3) * (cw3 + 0.2);
    const cy = gy + Math.floor(i / 3) * 1.85;
    card(s, cx, cy, cw3, 1.7, C.background2);
    kicker(s, t, cx + 0.15, cy + 0.15, col, { w: cw3 - 0.4 });
    text(s, d, { x: cx + 0.15, y: cy + 0.45, w: cw3 - 0.3, h: 1.15, fontSize: 9.5, color: C.text1, lineSpacingMultiple: 1.08 });
  });
  // Key to the three signature districts, in the plan's own colours.
  const kx = M + 2 * (cw3 + 0.2);
  const ky = gy + 1.85;
  text(s, 'SIGNATURE DISTRICTS', { x: kx, y: ky + 0.12, w: cw3, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 2, color: C.text2 });
  [['Fusion Power Station', C.accent3], ['Snow-to-Food & Water Plant', C.accent4], ['Mount Aurora Geothermal Spa Resort', C.accent5]].forEach(([t, col], i) => {
    const y = ky + 0.45 + i * 0.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: kx, y: y + 0.02, w: 0.26, h: 0.2, rectRadius: 0.04, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('key-chip') });
    text(s, t, { x: kx + 0.36, y, w: cw3 - 0.36, h: 0.36, fontSize: 9, bold: true, color: C.text1 });
  });
}

// ---------------------------------------------------------------------------
// 7 · Downtown in nine blocks
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'The City');
  pageHead(s, 'Downtown', 'Nine Blocks, One Short Walk', C.accent6);
  picture(s, 'renders/liberty.jpg', 0, 1.65, W, 3.9);
  caption(s, 'Looking south down Liberty Mall from the Aurora Roundabout to Mount Aurora.', M, 5.62, CW, 0.25);
  text(s, 'Downtown is laid out in nine blocks around the Aurora Roundabout. Shops, schools, healthcare and homes are within a short walk of each other, and the metro interchange lies under Liberty Mall. The map below follows the city plan, with north at the top.', { x: M, y: 6.0, w: CW, h: 0.65, fontSize: 10.5, lineSpacingMultiple: 1.1 });
  const blocks = [
    ['Polaris Quarter', 'Aurora Core – AI Control Tower · Aurora Haven Police Headquarters · Polaris Green Office Tower'],
    ['Knowledge Quarter', 'Arctic University – Main Hall · Aurora Public Library'],
    ['Financial District', 'Arctic Stock Exchange · Aurora Green Finance Hall · Snowline Courthouse · Aurora Business Hotel'],
    ['West Market Street', 'West Market Fire & Ambulance Station · Aurora Night Market Hall · Polar Pharmacy'],
    ['Civic Core & Liberty Mall', 'President Ho Chi Minh Monument · Civic Center · Snowflake General Hospital · Northern Lights School · Igloo Fresh · Aurora Cinema · Metro'],
    ['East Gallery Avenue', 'Aurora Glacier Mall & Crystal Atrium · Snow Lantern Primary School · Northern Lights Music Hall'],
    ['Snowpine Residences', 'Family homes · Pinecone Kindergarten · Snowpine Senior Care Home'],
    ['Mount Aurora Approach', 'Mount Aurora Guesthouse · Southside Police & Mountain Rescue Post · spa shuttle street'],
    ['Aurora 81 District', 'Aurora 81 – Polar Landmark Tower · Aurora 81 Residences (Twin Towers)'],
  ];
  const gx = M;
  const gy = 6.9;
  const gap = 0.1;
  const bw = (CW - 2 * gap) / 3;
  const bh = 1.24;
  blocks.forEach(([t, d], i) => {
    const x = gx + (i % 3) * (bw + gap);
    const y = gy + Math.floor(i / 3) * (bh + gap);
    const heart = i === 4;
    card(s, x, y, bw, bh, heart ? C.text1 : C.background2);
    text(s, t, { x: x + 0.13, y: y + 0.12, w: bw - 0.26, h: 0.24, fontSize: 10.5, bold: true, color: heart ? C.accent1 : C.accent6 });
    text(s, d, { x: x + 0.13, y: y + 0.4, w: bw - 0.26, h: bh - 0.48, fontSize: 9.5, color: heart ? C.background1 : C.text1, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 8–9 · Fusion Power Station
// ---------------------------------------------------------------------------
pres.addSection({ title: 'Signature Districts' });
opener({
  image: 'renders/fusion.jpg', number: 1, color: C.accent3,
  kicker: 'Signature district 1 · Fusion Power Station',
  title: "The City's Own Sun", titleLines: 1,
  standfirst: 'A compact tokamak gives Aurora Haven about 300 MW of electricity and 450 MW of district heat, steady through the polar night, with no CO₂ and no meltdown.',
  col1: [
    'Our first signature district is the city’s own sun. Stage 1 takes deuterium from snowmelt water, so the fuel literally falls from the sky as snow. Stage 2 breeds tritium in a lithium blanket, so none is imported.',
    'Stage 3 is the tokamak, where superconducting magnets hold a 150-million-degree plasma that makes about 800 megawatts of heat.',
  ],
  col2: [
    'Stage 4 turns that heat into about 300 megawatts of electricity and sends 450 megawatts into the district-heating loop. Stage 5 turns rubbish into clean gas and building blocks.',
    'The reactor runs on about 170 grams of fuel a day. If anything fails, the plasma simply goes out in a split second, so it cannot melt down or run away.',
  ],
});
{
  const s = addPage('PAGE_LIGHT', 'Signature Districts');
  pageHead(s, 'Fusion Power Station · How it works', 'Five Stages, One Sun', C.accent3);
  const ph = (CW * 930) / 2000;
  s.addImage({ path: img('plans/02_fusion_power_station_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'fusion-plan' });
  caption(s, 'Fusion Power Station – District Plan. Signature district 1: a compact D-T tokamak.', M, 1.7 + ph + 0.05, CW, 0.25);
  const ly = 5.45;
  stages(s, [
    { n: '1', name: 'Heavy-water separation', text: 'Takes deuterium from the deuterium-rich water left by the food plant’s electrolysers and purifies it to 99.8% heavy water.' },
    { n: '2', name: 'Lithium blanket & tritium fuel cycle', text: 'Breeds slightly more tritium than the reactor burns, so none is imported. Recovered helium cools the hospital’s MRI scanners.' },
    { n: '3', name: 'Fusion core: compact D-T tokamak', text: 'Superconducting magnets hold a 150-million-degree plasma. No CO₂, no long-lived waste, no meltdown.' },
    { n: '4', name: 'Power conversion & heat export', text: 'Supercritical-CO₂ turbines make about 300 MW of electricity and send about 450 MW of heat to the city.' },
    { n: '5', name: 'Plasma waste converter', text: 'Torches hotter than 5,000 °C turn about 20 t of rubbish a day into clean gas, metals and paving blocks.' },
    { n: 'C', name: 'Control & visitor centre', text: 'Operators and an AI digital twin can stop the plasma in milliseconds; a public gallery faces the reactor.', color: C.text1 },
  ], M, ly, 4.55, 0.9, C.accent3);
  const sx = 5.55;
  const sw = W - M - sx;
  [['800 MW', 'of heat from the plasma'], ['300 MW', 'of electricity'], ['450 MW', 'of district heat for the city'], ['170 g', 'of fuel a day, about 70 g of it deuterium'], ['1 litre', 'of liquid helium a day for MRI scanners']]
    .forEach(([n, l], i) => stat(s, n, l, sx, ly - 0.1 + i * 1.08, sw, C.accent3, { size: 24, lh: 0.42 }));
}

// ---------------------------------------------------------------------------
// 10–11 · Snow-to-Food & Water Plant
// ---------------------------------------------------------------------------
opener({
  image: 'renders/food.jpg', number: 2, color: C.accent4,
  kicker: 'Signature district 2 · Snow-to-Food & Water Plant',
  title: 'Bread and Water from Snow and Air', titleLines: 2,
  standfirst: 'Six stages turn tundra snow and air into all of the city’s drinking water and about half of its protein, with no farmland at all.',
  col1: [
    'What do you eat where nothing grows? Stage 1 melts about 3,000 tonnes of clean tundra snow a day with spare heat from the fusion station, so the snow does the job of a cooling tower. Stage 2 turns the meltwater into all the city’s drinking water.',
  ],
  col2: [
    'Stage 3 splits water into hydrogen and oxygen and captures CO₂ from the air; Stage 4 turns them into starch and fats. In Stage 5, microbes in six silos make about 2.5 tonnes of protein flour a day. Stage 6 cooks bread, noodles and drinks for the city.',
  ],
});
{
  const s = addPage('PAGE_LIGHT', 'Signature Districts');
  pageHead(s, 'Snow-to-Food & Water Plant · How it works', 'Six Stages from Snow to Supper', C.accent4);
  const ph = (CW * 1033) / 2000;
  s.addImage({ path: img('plans/03_snow_to_food_water_plant_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'food-plan' });
  caption(s, 'Snow-to-Food & Water Plant – District Plan. All drinking water and about half of the city’s protein, from snow and air.', M, 1.7 + ph + 0.05, CW, 0.25);
  const ly = 5.8;
  stages(s, [
    { n: '1', name: 'Snow harvest & melt hall', text: 'Electric harvesters gather wind-packed snow upwind of the city; about 14 MW of spare fusion heat melts it.' },
    { n: '2', name: 'Drinking-water & mineral works', text: 'Membranes and UV light remove every germ, calcite adds calcium and magnesium, and sensors test the water every five minutes.' },
    { n: '3', name: 'Electrolysis, air capture & green ammonia', text: 'About 5 t of hydrogen a day; the oxygen goes to the hospital and the waste converter.' },
    { n: '4', name: 'Carbon-fixation chemistry', text: 'A copper catalyst makes methanol, and enzymes build it into starch about eight times faster than a maize field.' },
    { n: '5', name: 'Bioreactor silos', text: 'Hydrogen-eating bacteria make protein flour; yeasts and algae make oils and vitamins, 24 hours a day.' },
    { n: '6', name: 'Food kitchen, bottling & distribution', text: 'Bread, noodles, protein mince and dairy-style drinks, delivered overnight in heated electric vans.' },
  ], M, ly, 4.55, 0.86, C.accent4);
  const sx = 5.55;
  const sw = W - M - sx;
  [['3,000 t', 'of snow melted a day'], ['2,500 m³', 'of drinking water a day, all of the city’s tap water'], ['20 t', 'of CO₂ captured from the air a day'], ['2.5 t', 'of protein flour a day, as much as 600 hectares of soybeans'], ['30 days', 'of meals and water for everyone in the Food Reserve Bunker']]
    .forEach(([n, l], i) => stat(s, n, l, sx, ly - 0.1 + i * 1.03, sw, C.accent4, { size: 24, lh: 0.45 }));
}

// ---------------------------------------------------------------------------
// 12–13 · Mount Aurora Geothermal Spa Resort
// ---------------------------------------------------------------------------
opener({
  image: 'renders/mount.jpg', number: 3, color: C.accent5,
  kicker: 'Signature district 3 · Mount Aurora Geothermal Spa Resort',
  title: 'A Warm Heart Inside the Ice', titleLines: 1,
  standfirst: 'Inside a 35-metre snow peak shaped like Nepal’s Ama Dablam, four geothermal spa levels stay at 28 °C all winter.',
  col1: [
    'Guests enter through the North Portal, where a thermal revolving door and an air curtain keep the −45 °C air out. The peak’s deep snow works as a blanket that holds in the geothermal heat, and sensors release the snow load safely before an avalanche can build.',
  ],
  col2: [
    'Outside is the Aurora Lagoon, a 38-degree mineral pool for bathing under the northern lights. The spa fights the winter blues, brings tourists and income, and in an emergency can shelter up to 1,000 people.',
  ],
});
{
  const s = addPage('PAGE_LIGHT', 'Signature Districts');
  pageHead(s, 'Mount Aurora · Level by level', 'Four Floors of Warmth', C.accent5);
  const ph = (CW * 1095) / 2000;
  s.addImage({ path: img('plans/04_mount_aurora_spa_resort_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'spa-plan' });
  caption(s, 'Mount Aurora Geothermal Spa Resort – Level Plans. The glass lift links all four levels.', M, 1.7 + ph + 0.05, CW, 0.25);
  const levels = [
    ['Level 1 · 0 m', 'Welcome Hall, Mineral Lake Grotto & Onsen Garden', 'A 40 °C silica-rich spring rises into a 7 × 13 m Mineral Lake; hot, warm and glacier-cold pools boost circulation.'],
    ['Level 2 · 4.5 m', 'Volcanic Mud Terraces', 'An 8 × 10 m mud field held at 39 °C. The mud is filtered and UV-sterilised every night and reused for months.'],
    ['Level 3 · 9 m', 'Treatment Suites & Himalayan Salt Sauna', 'Hot-stone massage, arctic kelp wraps and a 75 °C pink salt sauna heated by the geothermal loop.'],
    ['Level 4 · 13.5 m', 'Summit Sanctuary & Aurora Eye', 'A 35 °C float pool, a meditation circle and a heated glass bubble for watching the northern lights.'],
  ];
  const gy = 5.95;
  const cw2 = (CW - 0.2) / 2;
  levels.forEach(([lv, t, d], i) => {
    const x = M + (i % 2) * (cw2 + 0.2);
    const y = gy + Math.floor(i / 2) * 1.62;
    card(s, x, y, cw2, 1.5, C.background2);
    text(s, lv.toUpperCase(), { x: x + 0.15, y: y + 0.12, w: cw2 - 0.3, h: 0.2, fontSize: 8.5, bold: true, charSpacing: 2, color: C.accent5 });
    text(s, [
      { text: t, options: { fontFace: HEAD, fontSize: 12, bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 4 } },
      { text: d, options: { fontSize: 9.5, color: C.text2 } },
    ], { x: x + 0.15, y: y + 0.36, w: cw2 - 0.3, h: 1.08, lineSpacingMultiple: 1.05 });
  });
  const temps = [['28 °C', 'inside the spa'], ['40 °C', 'Mineral Lake spring'], ['39 °C', 'volcanic mud'], ['75 °C', 'salt sauna'], ['35 °C', 'float pool'], ['38 °C', 'Aurora Lagoon']];
  const tw = CW / 6;
  temps.forEach(([n, l], i) => stat(s, n, l, M + i * tw, 9.3, tw - 0.08, C.accent5, { size: 20, lh: 0.4, lsize: 8.5 }));
  text(s, 'Route through the spa: North Portal → grotto → Welcome Hall → changing suites → Mineral Lake & Onsen Garden → glass lift → mud terraces → treatments & salt sauna → Summit Sanctuary and the Aurora Eye.', { x: M, y: 10.3, w: CW, h: 0.55, fontSize: 9, italic: true, color: C.text2 });
}

// ---------------------------------------------------------------------------
// 14 · Three districts, one loop
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_DARK', 'Signature Districts');
  pageHead(s, 'The big idea', 'Three Districts, One Loop', C.accent1, true);
  standfirst(s, 'The three signature districts do not work alone. Heat, water, oxygen and waste go round from one to the next instead of being thrown away.', M, 1.6, CW, 0.75, { color: C.background2 });

  // Four nodes: the two plants on top, the city and the spa below them.
  const d = 2.1;
  const fx = M + 0.1; // Fusion Power Station
  const fy = 2.75;
  const px = W - M - 0.1 - d; // Snow-to-Food & Water Plant
  const py = fy;
  const fcx = fx + d / 2;
  const pcx = px + d / 2;
  const node = (x, y, dd, col, t1, t2) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: dd, h: dd, fill: { color: col }, line: { color: C.background1, width: 2 }, objectName: name('loop-node') });
    text(s, t1, { x: x + 0.15, y: y + dd / 2 - 0.42, w: dd - 0.3, h: 0.5, fontFace: HEAD, fontSize: 15, bold: true, color: C.background1, align: 'center', valign: 'bottom' });
    text(s, t2, { x: x + 0.15, y: y + dd / 2 + 0.1, w: dd - 0.3, h: 0.45, fontSize: 9, color: C.background1, align: 'center' });
  };
  node(fx, fy, d, C.accent3, 'Fusion Power Station', 'heat · power · waste converter');
  node(px, py, d, C.accent4, 'Snow-to-Food Plant', 'water · food · oxygen');
  const sd = 1.75;
  const sx = pcx - sd / 2;
  const sy = 6.15;
  node(sx, sy, sd, C.accent5, 'Mount Aurora Spa', 'geothermal wellbeing');
  const cityW = 2.1;
  const cityX = fcx - cityW / 2;
  const cityY = 6.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cityX, y: cityY, w: cityW, h: 1.45, rectRadius: 0.1, fill: { color: C.text1 }, line: { color: C.background1, width: 2 }, objectName: 'loop-node-city' });
  text(s, 'The City', { x: cityX + 0.1, y: cityY + 0.22, w: cityW - 0.2, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: C.background1, align: 'center' });
  text(s, '45,000 people, every building and the hospital', { x: cityX + 0.15, y: cityY + 0.68, w: cityW - 0.3, h: 0.6, fontSize: 9, color: C.background2, align: 'center' });

  // Between the two plants.
  const ax1 = fx + d + 0.08;
  const ax2 = px - 0.08;
  [
    ['Spare heat melts the snow', C.accent2, 1],
    ['Hydrogen & CO₂ made from rubbish', C.background2, 1],
    ['Deuterium-rich water returns as fuel', C.accent6, -1],
    ['Oxygen for the waste converter', C.accent1, -1],
  ].forEach(([t, col, dir], i) => {
    const y = fy + 0.35 + i * 0.38;
    if (dir > 0) arrow(s, ax1, y + 0.25, ax2, y + 0.25, col);
    else arrow(s, ax2, y + 0.25, ax1, y + 0.25, col);
    text(s, t, { x: ax1, y, w: ax2 - ax1, h: 0.2, fontSize: 8.5, bold: true, color: col, align: 'center' });
  });
  // Fusion <-> the city.
  arrow(s, fcx - 0.3, fy + d + 0.08, fcx - 0.3, cityY - 0.08, C.accent2);
  arrow(s, fcx + 0.3, cityY - 0.08, fcx + 0.3, fy + d + 0.08, C.background2);
  text(s, [
    { text: '↓ Heat, power and MRI helium', options: { color: C.accent2, breakLine: true, paraSpaceAfter: 6 } },
    { text: '↑ Rubbish for the waste converter', options: { color: C.background2 } },
  ], { x: fcx + 0.45, y: fy + d + 0.3, w: 1.35, h: 0.95, fontSize: 8.5, bold: true });
  // Food plant -> the city, and -> the spa.
  arrow(s, px + 0.25, py + d - 0.35, cityX + cityW + 0.08, cityY + 0.45, C.accent4, 2.25);
  text(s, 'Drinking water, food and medical oxygen', { x: 4.35, y: 5.8, w: 1.4, h: 0.45, fontSize: 8.5, bold: true, color: C.background2 });
  arrow(s, pcx + 0.55, py + d + 0.06, pcx + 0.55, sy - 0.06, C.accent4);
  text(s, 'Food for the spa cafés', { x: pcx + 0.68, y: py + d + 0.35, w: W - M - pcx - 0.68, h: 0.45, fontSize: 8.5, bold: true, color: C.background2 });
  // Geothermal springs -> spa.
  arrow(s, sx - 0.95, sy + sd - 0.2, sx - 0.06, sy + sd / 2 + 0.2, C.accent2);
  text(s, 'Geothermal springs', { x: sx - 1.75, y: sy + sd - 0.12, w: 1.3, h: 0.4, fontSize: 8.5, bold: true, color: C.accent2, align: 'right' });

  const rows = [
    ['Heat', 'Spare heat from the fusion station melts the snow at the food plant, so the snow does the job of a cooling tower.', C.accent2],
    ['Water', 'The food plant’s electrolysers leave slightly deuterium-rich water, which goes back to the fusion station as fuel.', C.accent6],
    ['Oxygen', 'The same electrolysers supply oxygen to the plasma waste converter and the hospital.', C.accent1],
    ['Waste', 'The converter turns rubbish into hydrogen and CO₂ for the food lines, and its slag becomes paving.', C.background2],
    ['Wellbeing', 'The spa turns geothermal heat into rest and health, and its restaurants serve food from the plant.', C.accent5],
  ];
  rows.forEach(([t, dd, col], i) => {
    const x = M + (i % 2) * (COL2 + GUT);
    const y = 8.55 + Math.floor(i / 2) * 0.8;
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.05, w: 0.14, h: 0.14, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('flow-dot') });
    text(s, t, { x: x + 0.25, y, w: COL2 - 0.25, h: 0.22, fontSize: 10, bold: true, color: C.background1 });
    text(s, dd, { x: x + 0.25, y: y + 0.24, w: COL2 - 0.25, h: 0.6, fontSize: 9, color: C.background2, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 15 · Clean energy
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Living in Aurora Haven' });
  const s = addPage('PAGE_LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Clean energy, day and polar night', 'Energy for the Polar Night', C.accent6);
  picture(s, 'renders/renewable.jpg', 0, 1.65, W, 3.75);
  caption(s, 'Northern Renewable Park: the Ice-Proof Wind Farm and the Bifacial Solar Farm.', M, 5.45, CW, 0.25);
  standfirst(s, 'The sun disappears for two months, so the city uses sources that cover for each other.', M, 5.8, CW, 0.4);
  const src = [
    ['Steady', 'Fusion', 'Steady power and heat all year, even in total darkness.', C.accent3],
    ['60 MW', 'Ice-proof wind farm', 'Heated blades keep turning in freezing fog; most power comes in stormy winter.', C.accent6],
    ['+25%', 'Bifacial solar farm', 'Snow reflects light onto the panel backs; 24-hour power in the midnight-sun months.', C.accent2],
    ['24/7', 'Geothermal plant', 'Clean electricity and hot water around the clock, and the second heat source.', C.accent5],
    ['200 MWh', 'Battery bank', 'Recycled car batteries store spare wind and solar power for calm, dark days.', C.accent4],
    ['12 h', 'Heat storage tank', 'Keeps homes warm if a heat source stops, losing less than 1% of its heat a day.', C.accent1],
  ];
  const cw2 = (CW - 0.2) / 2;
  src.forEach(([n, t, d, col], i) => {
    const x = M + (i % 2) * (cw2 + 0.2);
    const y = 6.4 + Math.floor(i / 2) * 1.5;
    card(s, x, y, cw2, 1.38, C.background2);
    text(s, n, { x: x + 0.15, y: y + 0.12, w: 1.35, h: 0.5, fontFace: HEAD, fontSize: 21, bold: true, color: col, valign: 'middle' });
    text(s, t, { x: x + 1.55, y: y + 0.14, w: cw2 - 1.7, h: 0.24, fontSize: 10.5, bold: true });
    text(s, d, { x: x + 1.55, y: y + 0.4, w: cw2 - 1.7, h: 0.9, fontSize: 9.5, color: C.text2, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 16 · Water and waste
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Water and waste', 'Nothing Is Wasted', C.accent4);
  picture(s, 'renders/water.jpg', 0, 1.65, W, 4.0);
  caption(s, 'The Water Recycling Line in the Northern Renewable Park, with the wind farm behind.', M, 5.7, CW, 0.25);
  text(s, 'THE SIX-STAGE WATER RECYCLING LINE', { x: M, y: 6.15, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.accent4 });
  const st = ['Snowmelt & greywater intake', 'Intake pumps & bar screen', 'Settling basins', 'Sand & membrane filters', 'UV disinfection', 'Recycled water tower'];
  const sw = CW / 6;
  st.forEach((t, i) => {
    const x = M + i * sw;
    if (i < 5) arrow(s, x + sw / 2 + 0.25, 6.73, x + sw * 1.5 - 0.25, 6.73, C.accent4, 1.75);
    marker(s, String(i + 1), x + sw / 2 - 0.22, 6.51, 0.44, C.accent4, { size: 14 });
    text(s, t, { x: x + 0.03, y: 7.05, w: sw - 0.06, h: 0.45, fontSize: 8.5, bold: true, align: 'center', lineSpacingMultiple: 1.0 });
  });
  paras(s, [
    'In Aurora Haven, water goes round and round. Clean snow becomes drinking water at the Snow-to-Food plant. Used greywater from homes flows to the Water Recycling Line: screens, settling basins, sand and membrane filters, UV light, and finally a tower that feeds toilets, laundries, greenhouses and fire hydrants.',
    'Dirty street snow is melted separately and never reaches the taps.',
  ], M, 7.75, COL2, 2.0);
  paras(s, [
    'The Circular Recycling Center sorts about 30 tonnes of materials a day with AI optical sorters and robot arms. Food scraps become biogas, and the Plasma Waste Converter handles what is left, turning it into clean gas and building blocks.',
    'Nothing goes to landfill in the permafrost.',
  ], M + COL2 + GUT, 7.75, COL2, 2.0);
  [['95%', 'of water recycled'], ['30 t', 'of materials sorted a day'], ['20 t', 'of rubbish a day turned into gas and blocks'], ['0', 'landfill in the permafrost']]
    .forEach(([n, l], i) => stat(s, n, l, M + i * (CW / 4), 9.9, CW / 4 - 0.15, C.accent4, { size: 22, lh: 0.4 }));
}

// ---------------------------------------------------------------------------
// 17 · Getting around
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Transport', 'Getting Around Fossil-Free', C.accent6);
  picture(s, 'renders/airport.jpg', 0, 1.65, W, 3.6);
  caption(s, 'Compact Polar Airport: the glass terminal, the control tower and Flight VN-81 taking off.', M, 5.3, CW, 0.25);
  paras(s, [
    'Transport in Aurora Haven is electric and built for the cold. The heart of it is the metro: the north–south Aurora Line and the deep east–west Glacier Line meet at the Central Interchange Station under Liberty Mall. The driverless trains run underground, so blizzards never stop them.',
    'On the streets there are electric trams, buses and shared robotaxis, and people wait in heated bus shelters. The roads are warmed from below, so no salt is needed, and an outer ring keeps trucks out of downtown.',
    'Electric cars charge in the heated bays of the EV & Hover-Car Charging Hub, and the airport, with its heated runway and e-fuel planes, keeps the city supplied through deep winter.',
  ], M, 5.75, 3.95, 3.5);
  // Metro diagram: the two lines cross at the interchange.
  const mx = 4.95;
  const mw = W - M - mx;
  const cx = mx + mw / 2;
  const cy = 7.3;
  s.addShape(pres.shapes.LINE, { x: cx, y: 5.85, w: 0, h: 2.9, line: { color: C.accent6, width: 7 }, objectName: 'metro-aurora-line' });
  s.addShape(pres.shapes.LINE, { x: mx, y: cy, w: mw, h: 0, line: { color: C.accent4, width: 7 }, objectName: 'metro-glacier-line' });
  s.addShape(pres.shapes.OVAL, { x: cx - 0.22, y: cy - 0.22, w: 0.44, h: 0.44, fill: { color: C.background1 }, line: { color: C.text1, width: 3 }, objectName: 'metro-interchange' });
  text(s, 'Aurora Line\nnorth–south', { x: cx + 0.14, y: 5.85, w: 1.3, h: 0.4, fontSize: 9, bold: true, color: C.accent6 });
  text(s, 'Glacier Line\neast–west', { x: mx, y: cy + 0.16, w: 1.1, h: 0.4, fontSize: 9, bold: true, color: C.accent4 });
  text(s, 'Central Interchange Station, under Liberty Mall', { x: cx + 0.3, y: cy - 0.62, w: 1.15, h: 0.55, fontSize: 8.5, bold: true, color: C.text1, valign: 'bottom' });
  const st = [['3 min', 'Aurora Line trains at rush hour'], ['4 min', 'Glacier Line; every 90 s after big stadium events'], ['30%', 'of train energy returned by braking'], ['2,800 m', 'heated airport runway'], ['20 km/h', 'downtown speed limit']];
  const sw = CW / 5;
  st.forEach(([n, l], i) => stat(s, n, l, M + i * sw, 9.55, sw - 0.12, C.accent6, { size: 20, lh: 0.5, lsize: 8.5 }));
}

// ---------------------------------------------------------------------------
// 18 · A livable city
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Everyday life', 'A Livable City Every Day', C.accent6);
  picture(s, 'renders/stadium.jpg', 0, 1.65, W, 3.9);
  caption(s, 'Aurora Snow Stadium, home of school sports days and the Midwinter Aurora Festival.', M, 5.6, CW, 0.25);
  const cats = [
    ['Homes', 'Family houses in Snowpine Residences, the western eco-homes, towers such as the Aurora 81 Residences and Ice Crystal Apartments, co-living, student and senior housing.'],
    ['Learning', 'Three kindergartens, Snow Lantern Primary School, the Northern Lights School for ages 6 to 18, and Arctic University.'],
    ['Health', 'Snowflake General Hospital with about 250 beds and a 24-hour emergency department, a campus clinic and a 24-hour pharmacy.'],
    ['Shopping', 'Igloo Fresh Supermarket, Tundra Grocery, the night and fish markets and the Aurora Glacier Mall with its indoor atrium park.'],
    ['Culture and parks', 'Aurora Cinema, a music hall, a library open 24 hours in the polar night, the Snow Stadium and parks with heated benches.'],
  ];
  cats.forEach(([t, d], i) => {
    const x = M + (i % 2) * (COL2 + GUT);
    const y = 6.1 + Math.floor(i / 2) * 1.35;
    kicker(s, t, x, y, C.accent6, { w: COL2 - 0.2 });
    text(s, d, { x, y: y + 0.3, w: COL2, h: 0.95, fontSize: 10.5, lineSpacingMultiple: 1.08 });
  });
  const st = [['250', 'hospital beds'], ['900', 'pupils at Northern Lights School'], ['5,000', 'students at Arctic University'], ['8,000', 'seats in the Snow Stadium']];
  const sx = M + COL2 + GUT;
  st.forEach(([n, l], i) => stat(s, n, l, sx + (i % 2) * (COL2 / 2), 8.75 + Math.floor(i / 2) * 1.05, COL2 / 2 - 0.1, C.accent6, { size: 22, lh: 0.4 }));
}

// ---------------------------------------------------------------------------
// 19 · Safety
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Safety', 'Safe and Ready for Any Storm', C.accent2);
  picture(s, 'renders/rescue.jpg', 0, 1.65, W, 4.2);
  caption(s, 'The Polar Rescue and Resilience Station in the Energy Hub, north of downtown.', M, 5.9, CW, 0.25);
  paras(s, [
    'In the polar night, safety comes first. The Polar Rescue and Resilience Station is home to the fire brigade, ambulances, ice rescue and the 112 emergency centre, and its vehicles leave within 60 seconds.',
    'The West Market Fire & Ambulance Station reaches any downtown address in about four minutes, and a rescue helicopter is ready day and night.',
  ], M, 6.35, COL2, 2.2);
  paras(s, [
    'Under Liberty Mall, four underground shelters can keep every resident safe for 30 days. Aurora Core, the AI control tower, forecasts blizzards up to 48 hours ahead and alerts every phone.',
    'Cafés and lobbies act as warm points, and the air base runway is a backup for supply flights.',
  ], M + COL2 + GUT, 6.35, COL2, 2.2);
  const st = [['60 s', 'for rescue vehicles to leave'], ['4 min', 'to any downtown address'], ['10 min', 'for the rescue helicopter to be airborne'], ['4', 'underground shelters'], ['30 days', 'of supplies for every resident'], ['48 h', 'blizzard forecasts']];
  const sw = CW / 3;
  st.forEach(([n, l], i) => stat(s, n, l, M + (i % 3) * sw, 8.65 + Math.floor(i / 3) * 1.1, sw - 0.15, C.accent2, { size: 24, lh: 0.4 }));
}

// ---------------------------------------------------------------------------
// 20 · Take the tour
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Guide' });
  const s = addPage('PAGE_ICE', 'Guide');
  pageHead(s, 'Explore', 'Take the Tour: Eight Stops in 3D', C.accent6);
  standfirst(s, 'Open the city file in Eco-Polis 3D Builder and click Full Screen. The app locks into View mode, so nothing can move by accident. Then click each place to open its card.', M, 1.6, CW, 0.75);
  const stops = [
    ['President Ho Chi Minh Monument', 'The civic heart of the city on the Aurora Roundabout.'],
    ['Metro Entrance – Central Interchange Station', 'Escalators down to the metro and the shelters.'],
    ['Snowflake General Hospital', 'About 250 beds and a 24-hour emergency department.'],
    ['[Fusion Power Station – Stage 3] Fusion Core – Compact D-T Tokamak', 'The city’s own sun.'],
    ['[Snow-to-Food & Water Plant – Stage 1] Snow Harvest & Melt Hall', 'Melts about 3,000 t of snow a day with spare fusion heat.'],
    ['[Mount Aurora] Ama Dablam-Style Snow Peak & Hanging Glacier', 'The 35 m peak with the spa inside.'],
    ['[Northern Renewable Park] Ice-Proof Wind Farm', 'Two rows of turbines making about 60 MW.'],
    ['Polar Rescue and Resilience Station', 'Home of the 112 emergency centre.'],
  ];
  const lx = M;
  const ly = 2.65;
  const rh = 0.86;
  s.addShape(pres.shapes.LINE, { x: lx + 0.22, y: ly + 0.2, w: 0, h: rh * 7, line: { color: C.accent6, width: 2, dashType: 'dash' }, objectName: 'tour-route' });
  stops.forEach(([t, d], i) => {
    const y = ly + i * rh;
    marker(s, String(i + 1), lx, y, 0.44, C.accent6, { size: 14 });
    text(s, [
      { text: t, options: { fontSize: 10, bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 2 } },
      { text: d, options: { fontSize: 9, color: C.text2 } },
    ], { x: lx + 0.6, y: y + 0.02, w: 3.75, h: rh - 0.08, lineSpacingMultiple: 1.0 });
  });
  text(s, 'If there is time: the Aurora Lagoon, the Bifacial Solar Farm and the Recycled Water Tower.', { x: lx, y: ly + 8 * rh - 0.05, w: 4.35, h: 0.45, fontSize: 9, italic: true, color: C.text2 });

  const bx = 5.25;
  const bw = W - M - bx;
  card(s, bx, 2.65, bw, 8.2, C.background1);
  kicker(s, 'Behind the build', bx + 0.18, 2.85, C.accent6, { w: bw - 0.4 });
  [['3,700', '3D items arranged to one scale'], ['241', 'named places, each with a Name, Purpose and Special Features card'], ['1 m', 'per grid unit on every plan']]
    .forEach(([n, l], i) => stat(s, n, l, bx + 0.18, 3.2 + i * 1.05, bw - 0.36, C.accent6, { size: 22, lh: 0.45 }));
  text(s, 'MEETING THE BRIEF', { x: bx + 0.18, y: 6.45, w: bw - 0.36, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 2, color: C.text2 });
  const brief = [
    ['Smart design', 'polar answers to cold, darkness, wind and permafrost'],
    ['Sustainability', 'clean energy, closed loops, green spaces, electric transport'],
    ['Livability', 'homes, schools, hospital, shops, parks, cinema, roads'],
    ['Detail', '241 places annotated'],
    ['Timeline', 'built in rounds; final .json submitted 17 October 2026'],
  ];
  brief.forEach(([t, d], i) => {
    const y = 6.8 + i * 0.78;
    marker(s, String(i + 1), bx + 0.18, y, 0.3, C.text1, { size: 10 });
    text(s, t, { x: bx + 0.6, y: y - 0.02, w: bw - 0.75, h: 0.22, fontSize: 9.5, bold: true });
    text(s, d, { x: bx + 0.6, y: y + 0.2, w: bw - 0.75, h: 0.5, fontSize: 8.5, color: C.text2 });
  });
}

// ---------------------------------------------------------------------------
// 21–22 · Places to visit (Appendix A of the slide content)
// ---------------------------------------------------------------------------
const PLACES = [
  ['President Ho Chi Minh Monument', 'Civic Core & Liberty Mall', 'The city’s civic heart on Aurora Roundabout: ceremonies, national holidays and walking tours.'],
  ['Aurora Civic Center & Municipal Hall', 'Civic Core & Liberty Mall', 'Town hall for the city council, ID cards, permits, housing and family services.'],
  ['Snowflake General Hospital', 'Civic Core & Liberty Mall', 'Main hospital with about 250 beds and a 24-hour emergency department.'],
  ['Northern Lights School & Botanical Conservatory', 'Civic Core & Liberty Mall', 'Primary and secondary school for about 900 pupils aged 6–18.'],
  ['Igloo Fresh Supermarket & Food Hall', 'Civic Core & Liberty Mall', 'Downtown’s main supermarket and food court; about half its food is made in the city.'],
  ['Aurora Cinema & Performing Arts Center', 'Civic Core & Liberty Mall', 'Cinema and theatre for films, concerts, ballet and school shows.'],
  ['Underground Metro & Emergency Shelters', 'Civic Core & Liberty Mall (underground)', 'Metro interchange linked to four shelters that last 30 days.'],
  ['Aurora Core – AI Control Tower', 'Polaris Quarter', 'Operations centre where an AI digital twin runs traffic, heat, power and alerts.'],
  ['Aurora Haven Police Headquarters', 'Polaris Quarter', 'Central police station with a 24-hour police control room.'],
  ['Arctic University – Main Hall', 'Knowledge Quarter', 'Lecture halls for about 5,000 students of polar engineering, fusion, food science, medicine and climate.'],
  ['Aurora Public Library', 'Knowledge Quarter', 'Free library, open 24 hours in the polar night; lends skis, telescopes and light-therapy lamps.'],
  ['West Market Fire & Ambulance Station', 'West Market Street', 'Downtown fire and ambulance branch that reaches any downtown address in about 4 minutes.'],
  ['Aurora Glacier Mall & Crystal Atrium', 'East Gallery Avenue', 'Largest downtown mall, with an indoor atrium park of real trees.'],
  ['Snow Lantern Primary School', 'East Gallery Avenue', 'Primary school for about 450 children aged 6–11 from the southern districts.'],
  ['Pinecone Kindergarten', 'Snowpine Residences', 'Kindergarten and day nursery for about 40 children aged 1–6.'],
  ['Aurora 81 – Polar Landmark Tower', 'Aurora 81 District', 'Tallest tower and skyline symbol: offices, hotel and sky apartments, net-zero energy.'],
  ['Aurora Snow Garden Park', 'Foot of Mount Aurora', 'Public park with heated benches, a sledging slope and a snow-sculpture trail.'],
  ['[Mount Aurora] Ama Dablam-Style Snow Peak & Hanging Glacier', 'Mount Aurora Geothermal Spa Resort', '35 m landmark peak with the four-level spa inside.'],
  ['[Mount Aurora – Level 4] Summit Sanctuary & Aurora Eye', 'Mount Aurora Geothermal Spa Resort', 'Float pool, meditation circle and the Aurora Eye viewing bubble for the northern lights.'],
  ['[Mount Aurora] Aurora Lagoon – Outdoor Geothermal Mineral Pool', 'Mount Aurora Geothermal Spa Resort', '38 °C open-air silica pool for bathing under the northern lights.'],
  ['[Fusion Power Station – Stage 3] Fusion Core – Compact D-T Tokamak', 'Fusion Power Station', '150-million-degree plasma giving about 800 MW of heat; it cannot melt down.'],
  ['[Fusion Power Station – Stage 4] Power Conversion & Heat Export Hall', 'Fusion Power Station', 'Makes about 300 MW of electricity and sends about 450 MW of heat to the city.'],
  ['[Fusion Power Station – Stage 5] Plasma Waste Converter', 'Fusion Power Station', 'Turns about 20 t of rubbish a day into clean gas, recovered metals and building blocks.'],
  ['[Snow-to-Food & Water Plant – Stage 1] Snow Harvest & Melt Hall', 'Snow-to-Food & Water Plant', 'Melts about 3,000 t of clean snow a day with spare fusion heat.'],
  ['[Snow-to-Food & Water Plant – Stage 2] Drinking-Water & Mineral Works', 'Snow-to-Food & Water Plant', 'Makes about 2,500 m³ of drinking water a day, all of the city’s tap water.'],
  ['[Snow-to-Food & Water Plant – Stage 5] Bioreactor Silos', 'Snow-to-Food & Water Plant', 'Six silos where microbes make about 2.5 t of protein flour a day.'],
  ['[Northern Renewable Park] Ice-Proof Wind Farm', 'Northern Renewable Park', 'Two rows of ice-proof turbines making about 60 MW.'],
  ['[Northern Renewable Park] Bifacial Solar Farm', 'Northern Renewable Park', 'Double-sided panels that make power 24 hours a day in the midnight-sun months.'],
  ['[Northern Renewable Park] Water Recycling Line – 6 Recycled Water Tower', 'Northern Renewable Park', 'Stores recycled water for toilets, laundries, street cleaning, irrigation and hydrants.'],
  ['Geothermal Power Plant', 'Energy Hub & Rescue Station', 'Clean electricity and hot water around the clock; the second heat source.'],
  ['Polar Rescue and Resilience Station', 'Energy Hub & Rescue Station', 'Fire, ambulance and ice-rescue headquarters, home of the 112 emergency centre.'],
  ['[Compact Polar Airport] Glass Terminal, Control Tower & Gate 1 Dreamliner', 'Compact Polar Airport', 'Passenger and cargo airport; the city’s supply link in deep winter.'],
  ['Evergreen Greenhouse Dome', 'Evergreen Garden & Greenhouses', 'Grows fresh vegetables and berries all year under LED light.'],
  ['Circular Recycling Center', 'Evergreen Garden & Greenhouses', 'Sorts, repairs and recycles about 30 t of materials a day.'],
  ['Aurora Snow Stadium', 'Aurora Snow Stadium', 'About 8,000 seats for snow sports, school sports days and the Midwinter Aurora Festival.'],
];
function placesPage(from, to, title, kick) {
  const s = addPage('PAGE_LIGHT', 'Guide');
  pageHead(s, kick, title, C.accent6);
  const head = ['#', 'Name of the place (as in the app)', 'District', 'Purpose'].map((t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 9 } }));
  const rows = PLACES.slice(from, to).map((p, i) => {
    const fill = { color: i % 2 ? C.background1 : C.background2 };
    return [
      { text: String(from + i + 1), options: { bold: true, color: C.accent6, fill, fontFace: HEAD, fontSize: 11 } },
      { text: p[0], options: { bold: true, fill, fontSize: 9.5 } },
      { text: p[1], options: { fill, fontSize: 8.5, color: C.text2 } },
      { text: p[2], options: { fill, fontSize: 9.5 } },
    ];
  });
  s.addTable([head, ...rows], {
    x: M, y: 1.7, w: CW, colW: [0.4, 2.45, 1.4, 2.82], fontSize: 9.5, color: C.text1, valign: 'middle', margin: [0.07, 0.07, 0.07, 0.07],
    border: { type: 'none' }, rowH: 0.3, objectName: name('places-table'),
  });
}
placesPage(0, 18, 'Places to Visit', 'Guide · 35 key places');
placesPage(18, 35, 'Places to Visit, Continued', 'Guide · 35 key places');

// ---------------------------------------------------------------------------
// 23 · By the numbers (Appendix B of the slide content)
// ---------------------------------------------------------------------------
{
  const s = addPage('PAGE_DARK', 'Guide');
  pageHead(s, 'Key figures', 'Aurora Haven by the Numbers', C.accent1, true);
  const groups = [
    ['The city', C.accent1, [['45,000', 'residents'], ['241', 'named places'], ['3,700', '3D items']]],
    ['Climate', C.accent6, [['−45 °C', 'winter lows'], ['2 months', 'of polar night'], ['120 km/h', 'blizzards']]],
    ['Fusion Power Station', C.accent3, [['300 MW', 'electricity'], ['450 MW', 'district heat'], ['99.8%', 'heavy-water purity']]],
    ['Snow-to-Food & Water Plant', C.accent4, [['5 t', 'hydrogen a day'], ['4 t', 'starch a day'], ['1 t', 'fat a day']]],
    ['Energy and storage', C.accent2, [['60 MW', 'wind farm'], ['200 MWh', 'battery bank'], ['<1%', 'heat lost a day by the heat tank']]],
    ['Mount Aurora Spa', C.accent5, [['4', 'levels, 0 to 13.5 m'], ['28 °C', 'all winter'], ['1,000', 'people sheltered in an emergency']]],
    ['Livability', C.accent1, [['600', 'Aurora 81 apartments'], ['450', 'pupils at Snow Lantern Primary'], ['3', 'kindergartens']]],
    ['Transport', C.accent6, [['2', 'metro lines'], ['5 min', 'spa shuttle'], ['20 min', 'airport shuttle']]],
  ];
  // One row per group: the group name on the left, its three figures to the right.
  const lw = 1.95;
  const sw = (CW - lw) / 3;
  groups.forEach(([t, col, list], i) => {
    const y = 1.85 + i * 1.1;
    if (i) s.addShape(pres.shapes.LINE, { x: M, y: y - 0.15, w: CW, h: 0, line: { color: C.text2, width: 0.75 }, objectName: name('rule') });
    s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.12, w: 0.11, h: 0.11, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('kicker-dot') });
    text(s, t.toUpperCase(), { x: M + 0.2, y: y + 0.06, w: lw - 0.3, h: 0.5, fontSize: 9, bold: true, charSpacing: 2, color: C.background1, lineSpacingMultiple: 1.1 });
    list.forEach(([n, l], j) => stat(s, n, l, M + lw + j * sw, y - 0.05, sw - 0.15, col, { size: 22, labelColor: C.background2, lh: 0.4, lsize: 8.5 }));
  });
  caption(s, 'All figures are design values for the Aurora Haven city project.', M, 10.75, CW, 0.22, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 24 · Back cover
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Back Cover' });
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Back Cover' });
  s.addImage({ path: img('renders/back.jpg'), x: 0, y: 0, w: W, h: H, objectName: 'back-picture' });
  kicker(s, 'Until next time', M, 0.6, C.accent1);
  text(s, 'Warm, Green and Ready', { x: M, y: 0.85, w: CW, h: 0.8, fontFace: HEAD, fontSize: 38, bold: true, color: C.background1 });
  const shadow = () => ({ type: 'outer', color: '06102A', blur: 6, offset: 1, angle: 90, opacity: 0.6 });
  text(s, 'Aurora Haven does not just survive the polar environment; it thrives in it. Heat from fusion and geothermal energy keeps every building warm, and clean energy and closed loops mean no fossil fuel and almost no waste. Most importantly, it is a place where 45,000 people can live, learn, work and watch the northern lights together.', {
    x: M, y: 1.8, w: 3.3, h: 2.6, fontSize: 11, color: C.background1, lineSpacingMultiple: 1.12, shadow: shadow(),
  });
  text(s, 'AURORA HAVEN', { x: M, y: 3.5, w: 2.8, h: 0.35, fontFace: HEAD, fontSize: 16, bold: true, charSpacing: 2, color: C.accent1, shadow: shadow() });
  text(s, '[Group name] · [Member names]\n[Class] · [Date]\nBuilt in Eco-Polis 3D Builder\nPolar / Ice City', { x: M, y: 3.87, w: 2.8, h: 0.85, fontSize: 9, color: C.background1, shadow: shadow() });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Wrote', OUT);
})();
