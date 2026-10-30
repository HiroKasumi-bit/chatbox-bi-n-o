// Builds the Aurora Haven magazine (40 A4 portrait pages) as an editable PowerPoint file.
// Text comes from source/Aurora_Haven_Slide_Content.docx and the place cards in
// source/Aurora_Haven.json; every picture is rendered from the 3D city in ../city3d.
//
//   cd magazine && npm install
//   node build_magazine.js
//
// Output: ../output/Aurora_Haven_Magazine.pptx
//
// Pages are laid out as a printed magazine: even pages are left-hand pages, odd pages are
// right-hand pages, and a double-page spread is an even page and the odd page after it.
// A picture that runs across a spread is stored as two halves (<name>_L.jpg, <name>_R.jpg).
// Pages 2 and 39, the insides of the covers, are left blank for printing.
//
// Pictures are cropped to fill their frame (never stretched): see picture().
// Sources are cited with cite('key') and numbered in order of first use; the list on the
// sources page is built from the same table, so every [n] points at the right source.

const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('./tools/apply_theme.js');

const ASSETS = path.join(__dirname, 'assets');
const OUT = path.join(__dirname, '..', 'output', 'Aurora_Haven_Magazine.pptx');
const img = (p) => path.join(ASSETS, p);
// image-size ships with pptxgenjs; it gives each picture's proportions.
const sizeOf = require(require.resolve('image-size', { paths: [require.resolve('pptxgenjs')] }));
const ratio = (p) => {
  const d = sizeOf(img(p));
  return d.height / d.width;
};

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
pres.author = 'Polar City team, class 11A4, Lê Quý Đôn High School';

const C = pres.SchemeColor;
const W = 8.27;
const H = 11.69;
const M = 0.6; // outer margin
const CW = W - 2 * M; // content width
const GUT = 0.3; // gutter between columns
const COL2 = (CW - GUT) / 2;
const HEAD = '+mj-lt'; // theme heading font
const VN = 'Arial'; // for Vietnamese names: Arial has every Vietnamese accent in PowerPoint and LibreOffice
const FOLIO = 'AURORA HAVEN  ·  ISSUE 01';

// Extra colours for the diagrams (hex, so they stay the same whatever the theme).
const DG = {
  snow: 'F4F8FC',
  snowLine: 'C3D3E6',
  rock: '6E7D96',
  warm: 'FBE6CC',
  water: '74C4E2',
  mud: '8A5A3A',
  glass: 'B7ECF5',
  ground: '24365C',
  pipe: 'C3D3E6',
};

// ---------------------------------------------------------------------------
// Sources: cite('key') returns "[n]", numbered in order of first use in the magazine.
// The sources page lists exactly the cited ones, in that order, and the build stops if
// a source is cited but unknown, or listed but never cited.
// ---------------------------------------------------------------------------
const REFS = {
  tromso: 'Visit Tromsø. Winter in Tromsø: the polar night. visittromso.no',
  rantanen: 'Rantanen, M. et al. (2022). The Arctic has warmed nearly four times faster than the globe since 1979. Communications Earth & Environment, 3, 168. doi.org/10.1038/s43247-022-00498-3',
  hjort: 'Hjort, J. et al. (2018). Degrading permafrost puts Arctic infrastructure at risk by mid-century. Nature Communications, 9, 5147. doi.org/10.1038/s41467-018-07557-4',
  ahdr: 'Arctic Human Development Report (2004). Stefansson Arctic Institute for the Arctic Council: about 4 million people live in the Arctic.',
  lomonosov: 'Akademik Lomonosov (floating nuclear power station, Pevek). Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Akademik_Lomonosov',
  iterFusion: 'ITER Organization. Advantages of fusion. iter.org/sci/Fusion',
  iterBaseline: 'ITER Organization (2024). Baseline 2024: press conference summary, July 2024. iter.org',
  iterTritium: 'ITER Organization. Tritium breeding. iter.org',
  kalundborg: 'Kalundborg Eco-industrial Park. Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Kalundborg_Eco-industrial_Park',
  solarFoods: 'Solar Foods (2024). Factory 01 starts production of Solein in Vantaa, Finland (press release, 15 April 2024) and Factory 01 press kit. solarfoods.com',
  cai: 'Cai, T. et al. (2021). Cell-free chemoenzymatic starch synthesis from carbon dioxide. Science, 373, 1523–1527. doi.org/10.1126/science.abh4049',
  sad: 'Seasonal affective disorder. Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Seasonal_affective_disorder',
  chena: 'Chena Hot Springs, Alaska. Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Chena_Hot_Springs,_Alaska',
  blueLagoon: 'Blue Lagoon (geothermal spa). Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Blue_Lagoon_(geothermal_spa)',
  hasemyer: 'Hasemyer, D. (17 July 2021). Thawing permafrost is artificially chilled to stabilize Alaska oil pipeline. Scientific American / Inside Climate News.',
  aeco: 'AECO. Arctic fox: wildlife guidelines. aeco.no/guideline/wildlife/arctic-fox',
  barbosa: 'Barbosa, G. L. et al. (2015). Comparison of land, water, and energy requirements of lettuce grown using hydroponic vs. conventional agricultural methods. Int. J. Environ. Res. Public Health, 12(6), 6879–6891.',
  kramer: 'Kramer, D. (29 April 2016). ITER costs are pinned down, with caveats. Physics Today. physicstoday.aip.org',
};
const cited = [];
function cite(...keys) {
  return keys.map((k) => {
    if (!(k in REFS)) throw new Error(`cite(): unknown source "${k}"`);
    if (!cited.includes(k)) cited.push(k);
    return `[${cited.indexOf(k) + 1}]`;
  }).join('');
}

// ---------------------------------------------------------------------------
// Masters: plain backgrounds; the page number and running foot are added to each page at the end.
// ---------------------------------------------------------------------------
// The running foot: the magazine's name and the section the page belongs to.
const SECTION_FOLIO = { Welcome: 'WELCOME', 'The City': 'THE CITY', 'Signature Districts': 'THE BREAKTHROUGHS', 'Living in Aurora Haven': 'SYSTEMS & LIFE', Invest: 'INVEST', Guide: 'THE GUIDE' };
const folioOptions = (side) => ({
  x: side === 'L' ? M + 0.5 : W - M - 4.5, y: 11.15, w: 4, h: 0.2, fontSize: 7, bold: true, charSpacing: 2,
  align: side === 'L' ? 'left' : 'right', margin: 0, isTextBox: true, objectName: 'folio',
});
const pageNumber = (side, dark) => ({
  x: side === 'L' ? M : W - M - 0.45, y: 11.13, w: 0.45, h: 0.24, fontSize: 9, bold: true,
  color: dark ? C.background1 : C.text1, align: side === 'L' ? 'left' : 'right', margin: 0,
});

pres.defineSlideMaster({ title: 'COVER', background: { color: C.text1 }, objects: [] });
pres.defineSlideMaster({ title: 'BLANK', background: { color: C.background1 }, objects: [] });
for (const side of ['L', 'R']) {
  pres.defineSlideMaster({ title: `${side}_LIGHT`, background: { color: C.background1 }, objects: [] });
  pres.defineSlideMaster({ title: `${side}_ICE`, background: { color: C.background2 }, objects: [] });
  pres.defineSlideMaster({ title: `${side}_DARK`, background: { color: C.text1 }, objects: [] });
}

let pageNo = 1; // position in the file; the cover is the first sheet
// The printed page number leaves out the cover and its blank inside, so the contents page is page 1.
const FIRST_NUMBERED = 3;
const folio = (n) => n - FIRST_NUMBERED + 1;
const numbered = []; // page numbers are added last, so they sit above full-bleed pictures
function page(kind, section) {
  pageNo += 1;
  const side = pageNo % 2 === 0 ? 'L' : 'R';
  const s = pres.addSlide({ masterName: `${side}_${kind}`, sectionTitle: section });
  numbered.push([s, side, kind === 'DARK', folio(pageNo), section]);
  return s;
}

// A double-page spread: the left page must be an even sheet so the picture meets itself at the fold.
const spreads = []; // sheet numbers of the left pages, checked at the end
function spreadPages(kind, section) {
  if ((pageNo + 1) % 2 !== 0) throw new Error(`A spread must start on an even sheet, but the next sheet is ${pageNo + 1}`);
  const L = page(kind, section);
  spreads.push(pageNo);
  return [L, page(kind, section)];
}

// An empty page with no folio or page number, for the insides of the covers.
function blankPage(section) {
  pageNo += 1;
  return pres.addSlide({ masterName: 'BLANK', sectionTitle: section });
}

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

function title(s, t, x, y, w, h, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontFace: HEAD, fontSize: 38, bold: true, lineSpacingMultiple: 0.92, objectName: name('title') }, o));
}

// A page head for text pages: kicker, then the title.
function pageHead(s, kick, t, color, o = {}) {
  kicker(s, kick, M, o.y ?? 0.55, color, { textColor: o.dark ? C.accent1 : color });
  title(s, t, M, (o.y ?? 0.55) + 0.28, CW, 0.75, { fontSize: o.size || 34, color: o.dark ? C.background1 : C.text1 });
}

// Paragraphs: array of strings -> one text box with paragraph spacing.
function paras(s, list, x, y, w, h, o = {}) {
  const runs = list.map((p, i) => ({ text: p, options: { breakLine: i < list.length - 1, paraSpaceAfter: 7 } }));
  text(s, runs, Object.assign({ x, y, w, h, fontSize: 11, lineSpacingMultiple: 1.12 }, o));
}

// Paragraphs where the first few words are set in bold capitals, as a magazine lead-in.
function leadParas(s, lead, list, x, y, w, h, o = {}) {
  const runs = [{ text: `${lead.toUpperCase()} `, options: { bold: true, charSpacing: 1, paraSpaceAfter: 7 } }];
  list.forEach((p, i) => runs.push({ text: p, options: { breakLine: i < list.length - 1, paraSpaceAfter: 7 } }));
  text(s, runs, Object.assign({ x, y, w, h, fontSize: 11, lineSpacingMultiple: 1.12 }, o));
}

function standfirst(s, t, x, y, w, h, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontFace: HEAD, italic: true, fontSize: 14, color: C.text2, lineSpacingMultiple: 1.1 }, o));
}

function caption(s, t, x, y, w, h = 0.3, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontSize: 8.5, italic: true, color: C.text2 }, o));
}

// A small capitals heading for a block of text.
function label(s, t, x, y, w, color = C.text2) {
  text(s, t.toUpperCase(), { x, y, w, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color });
}

// A pull quote: a short coloured rule, then the quote in large italic serif.
function pullQuote(s, t, x, y, w, h, color, o = {}) {
  if (!o.noRule) s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.6, h: 0.05, fill: { color }, line: { color, width: 0 }, objectName: name('quote-rule') });
  delete o.noRule;
  text(s, t, Object.assign({ x, y: y + 0.18, w, h, fontFace: HEAD, italic: true, bold: true, fontSize: 20, color, lineSpacingMultiple: 1.02 }, o));
}

function stat(s, num, lbl, x, y, w, color, o = {}) {
  const size = o.size || 26;
  const nh = size / 72 + 0.08;
  text(s, num, { x, y, w, h: nh, fontFace: HEAD, fontSize: size, bold: true, color, valign: 'bottom' });
  text(s, lbl, { x, y: y + nh + 0.03, w, h: o.lh || 0.42, fontSize: o.lsize || 9.5, color: o.labelColor || C.text2, lineSpacingMultiple: 1.05 });
}

function marker(s, lbl, x, y, d, color, o = {}) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color: o.ring || color, width: o.ring ? 1.5 : 0 }, objectName: name('marker') });
  text(s, lbl, { x, y, w: d, h: d, fontFace: HEAD, fontSize: o.size || Math.round(d * 30), bold: true, color: o.textColor || C.background1, align: 'center', valign: 'middle' });
}

// A picture cropped to fill its frame, keeping the photo's own proportions (it is never stretched).
// o.fx / o.fy (0 to 1) choose which part stays when the photo is cropped: 0.5 keeps the centre,
// 0 the left or top edge, 1 the right or bottom edge. o.crop = { l, t, r, b } (fractions of the
// photo) trims the edges first, for example the title printed on a plan.
function picture(s, file, x, y, w, h, o = {}) {
  const { fx = 0.5, fy = 0.5, crop, ...rest } = o;
  const d = sizeOf(img(file));
  const c = Object.assign({ l: 0, t: 0, r: 0, b: 0 }, crop);
  const pw = d.width * (1 - c.l - c.r); // the part of the photo we may show, in pixels
  const ph = d.height * (1 - c.t - c.b);
  const k = Math.max(w / pw, h / ph); // inches per pixel, so that the frame is covered
  const iw = d.width * k; // the whole photo at that scale
  const ih = d.height * k;
  const ox = c.l * iw + (pw * k - w) * fx; // where the frame sits on the scaled photo
  const oy = c.t * ih + (ph * k - h) * fy;
  s.addImage(Object.assign({ path: img(file), x, y, w: iw, h: ih, sizing: { type: 'crop', x: ox, y: oy, w, h }, altText: alt(file), objectName: name('picture') }, rest));
}

// Alt text for a picture, from its file name. pptxgenjs would otherwise use the full local
// path, which PowerPoint then writes into the PDF.
function alt(file) {
  return path.basename(file, path.extname(file)).replace(/^\d+_/, '').replace(/_(L|R)$/, '').replace(/_/g, ' ');
}

// Full-bleed picture filling the page. For a spread half, fx keeps the fold side: 1 on the
// left page, 0 on the right page, so the two halves still meet if a crop is ever needed.
const bleed = (s, file, o = {}) => picture(s, file, 0, 0, W, H, o);

// Soft navy gradient over a photo, so white type stays readable; 'fade' ends fully opaque,
// 'topStrong' is a darker top shade for pale pictures. 'fadeTop' is the fade turned upside down.
// layers > 1 stacks the same gradient to darken it further (for text over bright photos).
function shade(s, kind, x, y, w, h, layers = 1) {
  const flip = kind === 'fadeTop';
  const file = { fade: 'ui/fade_bottom.png', fadeTop: 'ui/fade_bottom.png', topStrong: 'ui/shade_top_strong.png' }[kind] || `ui/shade_${kind}.png`;
  for (let i = 0; i < layers; i++) s.addImage({ path: img(file), x, y, w, h, flipV: flip, altText: 'shade', objectName: name(`shade-${kind}`) });
}

// A translucent navy panel for text over a photo.
function panel(s, x, y, w, h, transparency = 22) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.text1, transparency }, line: { color: C.text1, width: 0, transparency: 100 }, objectName: name('panel') });
}

function card(s, x, y, w, h, color, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: o.radius ?? 0.08, fill: { color }, line: { color: o.line || color, width: o.lineWidth || 0 }, objectName: name('card') });
}

function arrow(s, x1, y1, x2, y2, color, width = 2.25) {
  seg(s, x1, y1, x2, y2, color, { width, arrow: true, name: 'arrow' });
}

// A straight line; o.arrow puts an arrowhead on its end, o.dash makes it dashed.
function seg(s, x1, y1, x2, y2, color, o = {}) {
  const line = { color, width: o.width || 2 };
  if (o.arrow) line.endArrowType = 'triangle';
  if (o.dash) line.dashType = o.dash;
  s.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
    flipH: x2 < x1, flipV: y2 < y1, line, objectName: name(o.name || 'line'),
  });
}

// A line through several points; only the last piece carries the arrowhead.
function route(s, pts, color, o = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    seg(s, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], color, Object.assign({}, o, { arrow: o.arrow !== false && i === pts.length - 2 }));
  }
}

// A filled outline through points given in page inches (drawn as an editable freeform shape).
function poly(s, pts, fill, o = {}) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const points = pts.map(([px, py], i) => Object.assign({ x: px - x, y: py - y }, i === 0 ? { moveTo: true } : {}));
  points.push({ close: true });
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, points,
    fill: { color: fill, transparency: o.transparency || 0 },
    line: o.line ? { color: o.line, width: o.lineWidth || 1 } : { color: fill, width: 0.5, transparency: 100 },
    objectName: name(o.name || 'outline'),
  });
}

// A dome (half an ellipse) standing on (x, y + h).
function dome(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x, y, w, h,
    points: [{ x: 0, y: h, moveTo: true }, { x: w, y: h, curve: { type: 'arc', wR: w / 2, hR: h, stAng: 180, swAng: 180 } }, { close: true }],
    fill: { color: fill, transparency: o.transparency || 0 },
    line: { color: o.line || fill, width: o.lineWidth || 1 },
    objectName: name('dome'),
  });
}

// A box in a diagram: a rounded rectangle with a bold name and an optional short note.
function dBox(s, x, y, w, h, fill, head, note, o = {}) {
  card(s, x, y, w, h, fill, { radius: 0.07, line: o.line, lineWidth: o.line ? 1.25 : 0 });
  const ink = o.ink || C.background1;
  const runs = [{ text: head, options: { bold: true, fontSize: o.size || 10.5, color: ink, breakLine: !!note } }];
  if (note) runs.push({ text: note, options: { fontSize: o.noteSize || 9, color: o.noteInk || ink } });
  text(s, runs, { x: x + 0.08, y, w: w - 0.16, h, align: o.align || 'center', valign: 'middle', lineSpacingMultiple: 1.0 });
}

const shadow = () => ({ type: 'outer', color: '06102A', blur: 6, offset: 1, angle: 90, opacity: 0.6 });

// The team's real-world interview video, reached by a QR code (drawn and test-scanned by
// tools/make_graphics.py). The code and the link under it are both clickable in the file.
const INTERVIEW_URL = 'https://youtu.be/QwcP_2Q3Esc';
// The interactive edition of this magazine on FlipHTML5.
const FLIPBOOK_URL = 'https://online.fliphtml5.com/aidsfjas4239PolarCut/Aurora_Haven_Magazine/';
// The two codes on the "Built by Us" page (same links as in tools/make_graphics.py).
const MAP_FILE_URL = 'https://github.com/HiroKasumi-bit/chatbox-bi-n-o/releases/latest/download/Aurora_Haven.json';
const ECOPOLIS_URL = 'https://ecopolis3d.netlify.app/';

// A sidebar on a picture or a page: a kicker heading, an optional big figure and a short text.
// o.light sets dark text on an ice card instead of white text on a navy panel.
function sideBox(s, x, y, w, h, head, body, o = {}) {
  const size = o.size || 9;
  // A long heading in a narrow box wraps onto a second line.
  let ty = y + (head.length * 0.085 > w - 0.6 ? 0.66 : 0.46);
  if (o.fit) {
    // Size the box to its text (a rough estimate of the line count) instead of leaving a gap below.
    const chars = typeof body === 'string' ? body.length : body.map((r) => r.text).join('').length;
    const lines = Math.ceil((chars * size * 0.0072) / (w - 0.32)) + 1;
    h = ty - y + (o.figure ? 0.55 : 0) + (lines * size * 1.3) / 72 + 0.15;
  }
  if (o.light) card(s, x, y, w, h, C.background2);
  else panel(s, x, y, w, h, o.transparency ?? 15);
  const ink = o.light ? C.text1 : C.background1;
  kicker(s, head, x + 0.16, y + 0.16, o.color || C.accent1, { w: w - 0.36, h: 0.42, textColor: o.color || C.accent1 });
  if (o.figure) {
    text(s, o.figure, { x: x + 0.16, y: ty, w: w - 0.32, h: 0.5, fontFace: HEAD, fontSize: o.figureSize || 24, bold: true, color: o.light ? (o.color || C.accent6) : C.background1 });
    ty += 0.55;
  }
  text(s, body, { x: x + 0.16, y: ty, w: w - 0.32, h: y + h - ty - 0.1, fontSize: size, color: ink, lineSpacingMultiple: 1.06 });
  return h;
}

// "In brief": the four questions every breakthrough answers (the problem, the idea, what is
// new and the impact), as a 2 × 2 fact file on a dark panel over the opener's photo.
// cap: the photo's caption, set on the panel's top line so it stays readable on any photo.
function inBrief(s, x, y, w, color, items, rh = 1.1, cap = null) {
  const cw = (w - 0.3) / 2;
  panel(s, x, y, w, 0.42 + 2 * rh, 12);
  kicker(s, 'In brief', x + 0.18, y + 0.14, color, { textColor: C.background1, w: 1.4 });
  if (cap) caption(s, cap, x + 1.7, y + 0.13, w - 1.88, 0.24, { color: C.background2, align: 'right' });
  items.forEach(([head, body], i) => {
    const cx = x + 0.15 + (i % 2) * (cw + 0.05);
    const cy = y + 0.46 + Math.floor(i / 2) * rh;
    text(s, head.toUpperCase(), { x: cx + 0.03, y: cy, w: cw - 0.1, h: 0.2, fontSize: 8, bold: true, charSpacing: 2, color });
    text(s, body, { x: cx + 0.03, y: cy + 0.22, w: cw - 0.1, h: rh - 0.27, fontSize: 9.5, color: C.background1, lineSpacingMultiple: 1.05 });
  });
}

// Paragraph settings (spacing after) must sit on a paragraph's first run: PowerPoint ignores
// them on later runs.
const leadList = (items, o = {}) => items.flatMap(([t, d], i) => [
  { text: `${t} `, options: { bold: true, color: o.lead || undefined, paraSpaceAfter: o.gap ?? 5 } },
  { text: d, options: { breakLine: i < items.length - 1 } },
]);

// A card with the QR code and its label: side by side, or stacked in a narrow card.
function qrCard(s, x, y, w, h, o = {}) {
  card(s, x, y, w, h, o.fill || C.background2);
  // o.flipbook: the code leads to the interactive edition instead of the interview video.
  const url = o.flipbook ? FLIPBOOK_URL : INTERVIEW_URL;
  const link = { url, tooltip: o.flipbook ? 'Read the interactive edition' : 'Watch our real-world interview' };
  const lbl = [
    { text: o.flipbook ? 'SCAN TO READ' : 'SCAN TO WATCH', options: { fontSize: 8, bold: true, charSpacing: 1.5, color: C.accent4, breakLine: true, paraSpaceAfter: 3 } },
    { text: o.flipbook ? 'The interactive edition' : 'Our real-world interview', options: { fontFace: HEAD, fontSize: o.size || 14, bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 3 } },
    { text: o.flipbook ? 'Flip through this magazine online on FlipHTML5' : 'Video on YouTube', options: { fontSize: 8.5, color: C.text2, breakLine: true } },
    { text: o.flipbook ? 'Open the flipbook' : INTERVIEW_URL.replace('https://', ''), options: { fontSize: 8.5, bold: true, color: C.accent6, hyperlink: link } },
  ];
  const code = (qx, qy, q) => s.addImage({ path: img(o.flipbook ? 'ui/qr_flipbook.png' : 'ui/qr_interview.png'), x: qx, y: qy, w: q, h: q, hyperlink: link, altText: `QR code: ${link.tooltip}`, objectName: name('qr-interview') });
  if (w < 2.6) {
    const q = Math.min(w - 0.5, h - 1.25);
    code(x + (w - q) / 2, y + 0.2, q);
    text(s, lbl, { x: x + 0.1, y: y + q + 0.3, w: w - 0.2, h: h - q - 0.4, align: 'center', lineSpacingMultiple: 1.0 });
  } else {
    const q = Math.min(h - 0.3, w * 0.4);
    code(x + 0.15, y + (h - q) / 2, q);
    text(s, lbl, { x: x + q + 0.35, y: y + 0.15, w: w - q - 0.5, h: h - 0.3, valign: 'middle', lineSpacingMultiple: 1.0 });
  }
}

// ---------------------------------------------------------------------------
// 1 · Cover: the whole city from the air under the northern lights
// ---------------------------------------------------------------------------
// The picture is a high aerial render of the whole 3D city, made photographic with an AI image
// tool (Stable Diffusion XL), with the aurora sky of the earlier cover blended in above it.
{
  pres.addSection({ title: 'Cover' });
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Cover' });
  picture(s, 'renders/cover_overview.jpg', 0, 0, W, H);
  shade(s, 'top', 0, 0, W, 2.6);
  shade(s, 'fade', 0, 7.9, W, H - 7.9);

  // Masthead.
  text(s, 'THE IDEAL CITY OF THE FUTURE', { x: M, y: 0.36, w: 4.5, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 3, color: C.accent1 });
  text(s, 'ISSUE 01  ·  2026', { x: W - M - 3, y: 0.36, w: 3, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 3, color: C.background1, align: 'right' });
  text(s, 'AURORA HAVEN', { x: 0.15, y: 0.58, w: W - 0.3, h: 1.2, fontFace: HEAD, fontSize: 68, bold: true, color: C.background1, align: 'center', shadow: shadow() });
  text(s, 'A POLAR CITY THAT THRIVES', { x: M, y: 1.78, w: CW, h: 0.3, fontSize: 11, bold: true, charSpacing: 6, color: C.background1, align: 'center', shadow: shadow() });

  // Slogan, the issue's other stories and the team.
  text(s, [
    { text: 'Its own sun. Its own food.', options: { color: C.background1, breakLine: true } },
    { text: 'A mountain you can walk inside.', options: { color: C.accent1 } },
  ], { x: M, y: 9.12, w: CW, h: 1.0, fontFace: HEAD, fontSize: 25, bold: true, lineSpacingMultiple: 1.0, shadow: shadow() });
  text(s, [
    { text: 'INSIDE   ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: '−45 °C and no sun: the polar challenge  p. 6   ·   Explore our 3D city  p. 21   ·   Invest in Aurora Haven  p. 32', options: { color: C.background1 } },
  ], { x: M, y: 10.2, w: CW, h: 0.3, fontSize: 8.5 });
  s.addShape(pres.shapes.LINE, { x: M, y: 10.62, w: CW, h: 0, line: { color: C.background1, width: 0.5, transparency: 50 }, objectName: 'cover-footer-rule' });
  s.addImage({ path: img('ui/school_logo.png'), x: M, y: 10.76, w: 0.55, h: 0.55, altText: 'Lê Quý Đôn High School logo', objectName: 'cover-school-logo' });
  text(s, 'POLAR CITY  ·  CLASS 11A4  ·  LÊ QUÝ ĐÔN HIGH SCHOOL', { x: M + 0.7, y: 10.9, w: 4.4, h: 0.26, fontFace: VN, fontSize: 8, bold: true, color: C.background1 });
  text(s, 'A CONCEPT MAGAZINE', { x: W - M - 2, y: 10.9, w: 2, h: 0.26, fontSize: 8, bold: true, charSpacing: 2, color: C.background2, align: 'right' });
}

// ---------------------------------------------------------------------------
// 2 · Inside front cover, left blank so the contents open on a right-hand page
// ---------------------------------------------------------------------------
blankPage('Cover');

// ---------------------------------------------------------------------------
// 3 · Contents
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Welcome' });
  const s = page('LIGHT', 'Welcome');
  picture(s, 'renders/street_dusk.jpg', 0, 0, W, 4.3, { fy: 0.6 });
  shade(s, 'bottom', 0, 1.6, W, 2.7, 2);
  kicker(s, 'Inside this issue', M, 3.0, C.accent1, { textColor: C.background1 });
  title(s, 'Contents', M, 3.28, CW, 0.8, { fontSize: 44, color: C.background1 });
  // The issue in its sections, in page order: the left column, then the right column.
  const groups = [
    ['Welcome', C.accent6, [['2', 'Letter from the Founders'], ['4', 'Welcome to Aurora Haven'], ['6', 'The Polar Challenge'], ['7', 'Our Vision & Mission']]],
    ['The city', C.accent6, [['8', 'Nine Blocks, One Short Walk'], ['10', 'The Whole City Plan']]],
    ['The breakthroughs', C.accent5, [
      ['12', "The City's Own Sun", 'Breakthrough 1 · Fusion Power Station', C.accent3],
      ['15', 'Bread and Water from Snow and Air', 'Breakthrough 2 · Snow-to-Food & Water Plant', C.accent4],
      ['17', 'A Snow Mountain You Can Walk Inside', 'Breakthrough 3 · Mount Aurora', C.accent5],
      ['21', 'Built by Us'],
    ]],
    ['Systems & life', C.accent4, [
      ['22', 'Three Districts, One Loop'], ['23', 'A Liveable City Every Day'], ['24', 'Homes for the Polar Night'],
      ['25', 'Energy for the Polar Night'], ['26', 'Nothing Is Wasted'], ['27', 'Wild Neighbours'],
      ['28', 'Getting Around Fossil-Free'], ['29', 'Salad Under the Northern Lights'], ['30', 'Safe and Ready for Any Storm'], ['31', 'Pros & Cons'],
    ]],
    ['Invest', C.accent2, [['32', 'Invest in Aurora Haven']]],
    ['The guide', C.accent1, [['33', 'Take the Tour'], ['34', 'Places to Visit'], ['35', 'Through a Resident’s Eyes'], ['36', 'Sources & Assumptions']]],
  ];
  const top = 4.7;
  let x = M;
  let y = top;
  groups.forEach(([head, color, items], g) => {
    if (g === 3) { x = M + COL2 + GUT; y = top; } // the right-hand column
    kicker(s, head, x, y, color, { w: COL2 - 0.2 });
    y += 0.36;
    items.forEach(([p, t, d, pc]) => {
      text(s, p, { x, y: y - 0.04, w: 0.5, h: 0.32, fontFace: HEAD, fontSize: 15, bold: true, color: pc || C.accent6 });
      text(s, t, { x: x + 0.55, y, w: COL2 - 0.55, h: 0.22, fontSize: 10.5, bold: true });
      if (d) text(s, d, { x: x + 0.55, y: y + 0.21, w: COL2 - 0.55, h: 0.2, fontSize: 8.5, color: pc });
      y += d ? 0.5 : 0.32;
    });
    y += 0.16;
  });
}

// ---------------------------------------------------------------------------
// 4 · Letter from the founders (the team's own words)
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Welcome');
  kicker(s, 'Letter from the founders', M, 0.55, C.accent6);
  pullQuote(s, '“Our goal was not only to survive the cold but to build a city where people really want to live.”', M, 0.85, CW, 1.2, C.text1, { fontSize: 23, noRule: true });
  picture(s, 'renders/lagoon.jpg', 0, 2.45, W, 3.6);
  caption(s, 'The Aurora Lagoon, an open-air mineral pool at the foot of Mount Aurora, under the northern lights.', M, 6.12, CW, 0.25);
  // The team's opening, set in two columns (one text box each).
  leadParas(s, 'Welcome to this special feature', [
    'on a polar city named Aurora Haven – a bold architectural marvel where human ingenuity meets the call of the wild. In an era shaped by global climate shifts, this project is more than just an urban concept; it represents a strategic vision for survival and sustainable development in the earth’s most extreme polar environments.',
  ], M, 6.6, COL2, 2.9, { fontSize: 12 });
  paras(s, [
    'From its sleek structural design to intelligent renewable energy integration, Aurora Haven redefines how humanity can adapt and thrive under pressure. We invite you to turn the page and step into a world where extreme natural challenges are transformed into a vibrant, resilient, and forward-thinking community.',
  ], M + COL2 + GUT, 6.6, COL2, 2.2, { fontSize: 12 });
  text(s, 'The Polar City team', { x: M + COL2 + GUT, y: 8.95, w: COL2, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12.5, bold: true });
  text(s, 'Class 11A4 · Lê Quý Đôn High School', { x: M + COL2 + GUT, y: 9.23, w: COL2, h: 0.22, fontFace: VN, fontSize: 9, color: C.text2 });
  card(s, M, 9.7, CW, 1.2, C.background2);
  picture(s, 'renders/cover_overview.jpg', M + 0.15, 9.82, 0.68, 0.96);
  kicker(s, 'On the cover', M + 1.0, 9.86, C.accent6, { w: CW - 1.2 });
  text(s, 'The whole of Aurora Haven from the air on a polar night: downtown, the stadium, the greenhouse dome and the plants, under the northern lights.', {
    x: M + 1.0, y: 10.12, w: CW - 1.15, h: 0.7, fontSize: 9.5, lineSpacingMultiple: 1.05,
  });
}

// ---------------------------------------------------------------------------
// 5 · Meet the founders: the team, their roles and the interview
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Welcome');
  pageHead(s, 'The team behind Aurora Haven', 'Meet the Founders', C.accent6);
  standfirst(s, 'Who we are, and what each of us did.', M, 1.6, CW, 0.5, { fontSize: 13 });
  // Six member cards on a 3 × 2 grid, then the interview.
  const team = [
    ['Nguyễn Đông Bảo', 'nguyen_dong_bao', 'Magazine design · 3D city design'],
    ['Nguyễn Bá Hiếu Thiện', 'nguyen_ba_hieu_thien', 'Team leader · Research · 3D city design'],
    ['Phan Minh Khôi', 'phan_minh_khoi', 'Research · Fact-checking'],
    ['Dương Hàng Nguyên', 'duong_hang_nguyen', 'Video filming & editing · 3D city design'],
    ['Phạm Phước Khoa', 'pham_phuoc_khoa', 'Video editing · Magazine design'],
    ['Nguyễn Minh Triết', 'nguyen_minh_triet', 'Magazine design · Report'],
  ];
  const gw = (CW - 0.3) / 3;
  const gh = 3.2;
  const pw = gw - 0.24;
  const ph = pw * 1.19;
  team.forEach(([n, photo, role], i) => {
    const x = M + (i % 3) * (gw + 0.15);
    const y = 2.25 + Math.floor(i / 3) * (gh + 0.15);
    card(s, x, y, gw, gh, C.background2);
    picture(s, `team/${photo}.jpg`, x + 0.12, y + 0.12, pw, ph, { objectName: name('member-photo') });
    text(s, n, { x: x + 0.12, y: y + ph + 0.22, w: pw, h: 0.26, fontFace: VN, fontSize: 11, bold: true });
    text(s, role, { x: x + 0.12, y: y + ph + 0.5, w: pw, h: 0.38, fontSize: 9, bold: true, color: C.accent6, lineSpacingMultiple: 1.0 });
  });
  qrCard(s, M, 9.0, 3.0, 1.9, { size: 12.5 });
  // The team's own conclusion about the interview.
  const ix = M + 3.15;
  kicker(s, 'Interview conclusion', ix, 9.05, C.accent6, { w: W - M - ix - 0.2 });
  text(s, 'Looking back on the interview session, our team not only gathered valuable architectural insights but also learned a great deal about creative thinking and teamwork. Preparing the questions, listening closely, and engaging in direct discussions helped us deeply understand how green technologies can be practically applied to extreme environmental challenges. Overall, this was a truly rewarding experience that broadened our perspectives and allowed us to bring the most inspiring stories to our magazine readers.', {
    x: ix, y: 9.33, w: W - M - ix, h: 1.6, fontSize: 9, italic: true, lineSpacingMultiple: 1.06,
  });
}

// ---------------------------------------------------------------------------
// 6–7 · Welcome to Aurora Haven (spread)
// ---------------------------------------------------------------------------
{
  const band = 7.0;
  const [L, R] = spreadPages('LIGHT', 'Welcome');
  // The same shade on both halves, so the photo stays seamless across the fold.
  picture(L, 'renders/welcome_pano_L.jpg', 0, 0, W, band, { fx: 1 });
  shade(L, 'bottom', 0, band - 3.2, W, 3.2);
  picture(R, 'renders/welcome_pano_R.jpg', 0, 0, W, band, { fx: 0 });
  shade(R, 'bottom', 0, band - 3.2, W, 3.2);

  kicker(L, 'City overview', M, band - 1.95, C.accent1, { textColor: C.background1 });
  title(L, 'Welcome to\nAurora Haven', M, band - 1.65, CW, 1.4, { fontSize: 46, color: C.background1 });
  standfirst(L, 'A compact, zero-carbon city, built to stay warm and happy through the polar night.', M, band + 0.35, CW, 0.7, { fontSize: 15, color: C.text1 });
  leadParas(L, 'Aurora Haven is', [
    'a city for about 45,000 people on the Arctic tundra, under the snow peak of Mount Aurora.',
    'Everything is a short walk away. One heating network warms every building, and almost all water and waste is used again.',
  ], M, band + 1.25, COL2, 2.2);
  pullQuote(L, '“Three big ideas work as one loop.”', M, 9.85, COL2, 0.9, C.accent6, { fontSize: 16 });
  // Project data: where the city is and what it faces, at a glance.
  const px = M + COL2 + GUT;
  card(L, px, band + 1.2, COL2, 2.65, C.background2);
  kicker(L, 'Project data', px + 0.18, band + 1.35, C.accent6, { w: COL2 - 0.4 });
  [['Location', 'Arctic tundra, about 70° North'], ['Population', 'About 45,000'], ['Climate', 'Winters to −45 °C; two months of polar night'], ['Status', 'A concept for the future']]
    .forEach(([k, v], i) => {
      const y = band + 1.75 + i * 0.5;
      text(L, k.toUpperCase(), { x: px + 0.18, y: y + 0.03, w: 1.0, h: 0.2, fontSize: 8, bold: true, charSpacing: 1.5, color: C.text2 });
      text(L, v, { x: px + 1.15, y, w: COL2 - 1.3, h: 0.45, fontSize: 10.5, bold: true, lineSpacingMultiple: 1.0 });
    });

  caption(R, 'Aurora Haven at dusk from the south-east, with the wind farm on the northern edge.', W - M - 4.2, band - 0.45, 4.2, 0.3, { color: C.background1, align: 'right' });
  // The three breakthroughs, each with its own colour and the page where its story starts.
  kicker(R, 'Three big ideas', M, band + 0.35, C.accent6, { w: CW });
  const features = [
    ['1', 'The City’s Own Sun', 'A fusion reactor powers and heats every home.', 'renders/fusion_spread_R.jpg', C.accent3, 12, 0.62],
    ['2', 'Bread and Water from Snow and Air', 'A plant turns snow and air into water and food.', 'renders/food.jpg', C.accent4, 15, 0.65],
    ['3', 'A Snow Mountain You Can Walk Inside', 'Warm pools and saunas inside a snow peak.', 'renders/spa.jpg', C.accent5, 17, 0.5],
  ];
  const rh = 1.08;
  features.forEach(([n, t, d, pic, col, pg, fy], i) => {
    const y = band + 0.72 + i * (rh + 0.1);
    card(R, M, y, CW, rh, C.background2);
    picture(R, pic, M, y, 1.9, rh, { fy });
    marker(R, n, M + 2.05, y + 0.14, 0.4, col, { size: 13 });
    text(R, t, { x: M + 2.6, y: y + 0.12, w: CW - 3.55, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.text1 });
    text(R, d, { x: M + 2.6, y: y + 0.46, w: CW - 2.75, h: 0.5, fontSize: 10, color: C.text1, lineSpacingMultiple: 1.04 });
    text(R, `PAGE ${pg}`, { x: W - M - 0.95, y: y + 0.14, w: 0.8, h: 0.24, fontSize: 8, bold: true, charSpacing: 2, color: col, align: 'right' });
  });
}

// ---------------------------------------------------------------------------
// 8 · The polar challenge
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Welcome');
  // The blizzard picture is pale, so it fades into the navy page and the text sits below it.
  picture(s, 'renders/storm.jpg', 0, 0, W, 6.3, { fy: 0.45 });
  shade(s, 'fade', 0, 3.6, W, 2.75, 2);
  kicker(s, 'The place', M, 5.0, C.accent1, { textColor: C.background1 });
  title(s, 'The Polar Challenge', M, 5.28, CW, 0.8, { fontSize: 44, color: C.background1 });
  standfirst(s, 'One of the hardest places on Earth to build a city.', M, 6.18, CW, 0.45, { color: C.background2, fontSize: 15 });
  paras(s, [
    `Aurora Haven stands on the Arctic tundra at about 70° North. Winter falls to −45 °C, and the sun stays down for about two months, as in Tromsø, Norway ${cite('tromso')}.`,
    `The ground is permafrost: a warm building can thaw it and crack. The Arctic is warming nearly four times faster than the world ${cite('rantanen')}, and much of its infrastructure is at risk by 2050 ${cite('hjort')}.`,
    'With no farmland, winter supplies come by air. So we asked one question about every building:',
  ], M, 6.85, 4.45, 2.75, { color: C.background1, fontSize: 11 });
  pullQuote(s, '“How does it help people stay warm, fed, safe and happy here?”', M, 9.55, 4.45, 0.9, C.accent1, { fontSize: 17 });
  const sx = 5.45;
  [['−45 °C', 'in winter'], ['2 months', 'of polar night'], ['4×', 'faster warming than the world']]
    .forEach(([n, l], i) => stat(s, n, l, sx, 6.85 + i * 1.05, W - M - sx, C.accent1, { size: 26, labelColor: C.background2, lh: 0.42, lsize: 10 }));
  caption(s, 'A blizzard sweeps past planted spruce windbreaks.', sx, 10.4, W - M - sx, 0.45, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 9 · Vision and mission
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Welcome');
  picture(s, 'renders/principles.jpg', 0, 0, W, 2.9);
  caption(s, 'Downtown in the low sun.', M, 2.95, CW, 0.22);
  kicker(s, 'The vision', M, 3.3, C.accent6);
  title(s, 'Our Vision & Mission', M, 3.57, CW, 0.7, { fontSize: 34 });
  pullQuote(s, 'Our mission: a zero-carbon city where 45,000 people stay warm, fed, safe and happy through the polar night, without harming the tundra.', M, 4.2, CW, 0.85, C.accent6, { fontSize: 15.5, noRule: true });
  label(s, 'Who is affected', M, 5.42, CW);
  const who = [
    ['Arctic communities', `About 4 million people live in the Arctic ${cite('ahdr')}, many on thawing ground ${cite('hjort')}.`],
    ['Supply chains', 'In winter, food and medicine come only by air. One long storm can cut a town off.'],
    ['The tundra', 'Foxes, birds and reindeer need frozen land that a careless city could melt.'],
  ];
  const cw3 = (CW - 0.3) / 3;
  who.forEach(([t, d], i) => {
    const x = M + i * (cw3 + 0.15);
    card(s, x, 5.72, cw3, 1.22, C.background2);
    text(s, t, { x: x + 0.14, y: 5.82, w: cw3 - 0.28, h: 0.26, fontFace: HEAD, fontSize: 12, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.14, y: 6.12, w: cw3 - 0.28, h: 0.78, fontSize: 10.5, lineSpacingMultiple: 1.04 });
  });
  label(s, 'The crisis, and our answer', M, 7.25, CW);
  const answers = [
    ['Cold down to −45 °C', 'One shared heating loop and super-insulated homes'],
    ['Two months of darkness', 'Bright public spaces and a warm spa mountain'],
    ['No farmland', 'Water and food made from snow and air'],
    ['Thawing ground', 'Insulated piles and thermosyphons keep it frozen'],
    ['Cut off by storms', 'Our own power, shelters and blizzard warnings'],
  ];
  answers.forEach(([a, b], i) => {
    const y = 7.55 + i * 0.66;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: CW, h: 0.66, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: name('row-band') });
    text(s, a, { x: M + 0.15, y, w: 2.45, h: 0.66, fontSize: 11.5, bold: true, color: C.accent6, valign: 'middle' });
    text(s, '→', { x: M + 2.6, y, w: 0.3, h: 0.66, fontSize: 12, bold: true, color: C.accent6, valign: 'middle' });
    text(s, b, { x: M + 2.95, y, w: CW - 3.05, h: 0.66, fontSize: 11, valign: 'middle' });
  });
}

// ---------------------------------------------------------------------------
// 10–11 · Downtown (spread)
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'The City' });
  const [L, R] = spreadPages('DARK', 'The City');
  // The same two shades on both halves: dark enough for white type, seamless across the fold.
  bleed(L, 'renders/liberty_dusk_L.jpg', { fx: 1 });
  shade(L, 'fade', 0, 4.6, W, H - 4.6, 2);
  bleed(R, 'renders/liberty_dusk_R.jpg', { fx: 0 });
  shade(R, 'fade', 0, 4.6, W, H - 4.6, 2);
  kicker(L, 'Downtown', M, 8.05, C.accent1, { textColor: C.background1 });
  title(L, 'Nine Blocks,\nOne Short Walk', M, 8.33, CW, 1.3, { fontSize: 42, color: C.background1 });
  standfirst(L, 'Shops, schools, healthcare and homes, all a short walk from the Founding Mayor Monument.', M, 9.68, CW, 0.62, { color: C.background2, fontSize: 14 });
  text(L, 'Liberty Mall, the pedestrian heart of downtown, hosts markets and festivals.', {
    x: M, y: 10.38, w: CW, h: 0.5, fontSize: 10.5, color: C.background1, lineSpacingMultiple: 1.1,
  });
  caption(R, 'Liberty Mall at dusk, looking north to the Founding Mayor Monument.', W - M - 4.4, 10.5, 4.4, 0.35, { color: C.background1, align: 'right' });
}

// ---------------------------------------------------------------------------
// 12 · The whole city plan, on one page
// ---------------------------------------------------------------------------
{
  const s = page('ICE', 'The City');
  kicker(s, 'The map', M, 0.55, C.accent6);
  title(s, 'The Whole City Plan', M, 0.83, CW, 0.75, { fontSize: 36 });
  // Only the map itself is shown: the plan's own title line and scale bar are cropped away,
  // because distances in the model were stretched so the buildings do not overlap.
  const file = 'plans/01_city_master_plan.png';
  const crop = { l: 0.019, t: 0.098, r: 0.287, b: 0.136 };
  const d = sizeOf(img(file));
  const mh = W * ((d.height * (1 - crop.t - crop.b)) / (d.width * (1 - crop.l - crop.r)));
  picture(s, file, 0, 1.75, W, mh, { crop, objectName: 'master-plan' });
  caption(s, 'An illustrative plan from our 3D model, not to scale. North is up; the numbers are the places on page 34.', M, 1.82 + mh, CW, 0.4);
  const zones = [
    ['Downtown', 'Nine blocks around the Founding Mayor Monument.', C.text1],
    ['North', 'Wind and solar farms, the rescue station and the airport.', C.accent6],
    ['West', 'Eco-homes behind a planted tree belt.', C.text2],
    ['East', 'The fusion station, the Snow-to-Food plant and the greenhouses.', C.accent4],
    ['South', 'Mount Aurora, with its spa inside.', C.accent5],
  ];
  zones.forEach(([t, z, col], i) => {
    const x = M + (i % 2) * (COL2 + GUT);
    const y = 2.4 + mh + Math.floor(i / 2) * 0.82;
    kicker(s, t, x, y, col, { w: COL2 - 0.2 });
    text(s, z, { x, y: y + 0.28, w: COL2, h: 0.5, fontSize: 10.5, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 13 · The nine blocks
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'The City');
  pageHead(s, 'Downtown', 'The Nine Blocks', C.accent6);
  picture(s, 'renders/downtown_aerial.jpg', 0, 1.65, W, 5.3);
  caption(s, 'Downtown from the south-east; the cards follow the city plan.', M, 7.02, CW, 0.25);
  const blocks = [
    ['Polaris Quarter', 'AI control tower · police'],
    ['Knowledge Quarter', 'University · library'],
    ['Financial District', 'Stock exchange · courthouse'],
    ['West Market Street', 'Fire station · night market'],
    ['Civic Core & Liberty Mall', 'Monument · hospital · school · metro'],
    ['East Gallery Avenue', 'Glacier Mall · music hall'],
    ['Snowpine Residences', 'Family homes · senior care'],
    ['Mount Aurora Approach', 'Guesthouse · spa shuttle'],
    ['Aurora 81 District', 'Landmark tower · twin towers'],
  ];
  const gy = 7.42;
  const gap = 0.1;
  const bw = (CW - 2 * gap) / 3;
  const bh = 1.02;
  blocks.forEach(([t, d], i) => {
    const x = M + (i % 3) * (bw + gap);
    const y = gy + Math.floor(i / 3) * (bh + gap);
    const heart = i === 4;
    card(s, x, y, bw, bh, heart ? C.text1 : C.background2);
    text(s, t, { x: x + 0.13, y: y + 0.12, w: bw - 0.26, h: 0.24, fontSize: 11, bold: true, color: heart ? C.accent1 : C.accent6 });
    text(s, d, { x: x + 0.13, y: y + 0.44, w: bw - 0.26, h: bh - 0.5, fontSize: 10.5, color: heart ? C.background1 : C.text1, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 14–16 · Breakthrough 1: the Fusion Power Station
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Signature Districts' });
  const [L, R] = spreadPages('DARK', 'Signature Districts');
  // Matching shades on both halves (top for the headline, bottom for the caption).
  for (const [s, f, fx] of [[L, 'renders/fusion_spread_L.jpg', 1], [R, 'renders/fusion_spread_R.jpg', 0]]) {
    bleed(s, f, { fx });
    shade(s, 'topStrong', 0, 0, W, 5.6, 2);
    shade(s, 'bottom', 0, 8.4, W, H - 8.4);
  }
  marker(L, '1', M, 0.6, 0.8, C.accent3, { size: 28, ring: C.background1 });
  kicker(L, 'Breakthrough 1 · Fusion Power Station', M, 1.65, C.accent3, { textColor: C.background1 });
  title(L, "The City's Own Sun", M, 1.93, CW, 0.95, { fontSize: 50, color: C.background1 });
  standfirst(L, 'Our big idea: a fusion reactor inside the city that powers and heats every home.', M, 2.95, 5.6, 0.75, { color: C.background1, fontSize: 15 });
  inBrief(L, M - 0.2, 8.05, CW + 0.2, C.accent3, [
    ['The problem', 'Two months of polar night at −45 °C. The city needs heat and power that never stop.'],
    ['The idea', 'A compact fusion reactor makes the city’s electricity and heat, with fuel from snowmelt.'],
    ['What’s new', `A floating fission plant already heats the Arctic town of Pevek, Russia ${cite('lomonosov')}. Ours is fusion, fuelled by snowmelt, with no long-lived waste ${cite('iterFusion')}.`],
    ['The impact', 'No fuel to ship in and no CO₂. If anything fails, the reaction simply stops.'],
  ], 1.12);

  const bw = (CW - 0.2) / 2;
  sideBox(R, M, 0.6, bw, 2.05, 'Where the world is today', `No fusion plant sells power yet. ITER plans to burn fusion fuel in 2039 ${cite('iterBaseline')}, and breeding tritium is still to be tested ${cite('iterTritium')}.`, { color: C.accent3, size: 10.5 });
  sideBox(R, M + bw + 0.2, 0.6, bw, 2.05, 'Reality check', 'Our estimate: all the fuel for a full day of city power and heat. Until fusion is proven, wind, sun and geothermal run the city (page 31).', { color: C.accent3, size: 10.5, figure: '≈ 0.2 kg a day' });
  caption(R, 'The Fusion Core under the northern lights.', W - M - 4.0, 10.5, 4.0, 0.35, { color: C.background1, align: 'right' });
}
{
  // How it works: the energy flow, from snowmelt to the city, with wind and sun as starter and backup.
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Fusion Power Station · How it works', 'How Our Sun Works', C.accent3);
  const top = 1.7;
  card(s, M, top, CW, 6.85, C.background2);
  label(s, 'From snow to power and heat', M + 0.2, top + 0.15, 4, C.accent3);
  // Three columns: fuel from snow, fuel from lithium, and the wind and sun that start it.
  const colA = 0.85;
  const colB = 3.0;
  const colC = 5.45;
  const bwA = 1.85;
  const bwC = 2.0;
  const r1 = top + 0.62;
  const r2 = r1 + 1.12;
  const bh = 0.75;
  const big = { size: 11, noteSize: 9.5 };
  dBox(s, colA, r1, bwA, bh, C.accent6, 'Snowmelt water', 'from the food plant', big);
  dBox(s, colB, r1, bwA, bh, C.text2, 'Lithium', 'in the reactor wall', big);
  dBox(s, colC, r1, bwC, bh, C.accent1, 'Wind + sun', null, big);
  dBox(s, colA, r2, bwA, bh, C.accent6, 'Deuterium', 'heavy hydrogen', big);
  dBox(s, colB, r2, bwA, bh, C.text2, 'Tritium', 'bred inside the reactor', big);
  dBox(s, colC, r2, bwC, bh, C.accent1, 'Battery bank', 'stores the start-up power', big);
  [colA + bwA / 2, colB + bwA / 2].forEach((cx) => arrow(s, cx, r1 + bh + 0.04, cx, r2 - 0.05, C.text2, 2));
  arrow(s, colC + bwC / 2, r1 + bh + 0.04, colC + bwC / 2, r2 - 0.05, C.accent1, 2);
  // The core, between the two fuel columns.
  const cd = 1.75;
  const ccx = (colA + bwA / 2 + colB + bwA / 2) / 2;
  const ccy = r2 + bh + 1.15;
  s.addShape(pres.shapes.OVAL, { x: ccx - cd / 2, y: ccy - cd / 2, w: cd, h: cd, fill: { color: C.accent3 }, line: { color: 'C9B6F5', width: 4 }, objectName: name('core') });
  text(s, [
    { text: 'FUSION CORE', options: { bold: true, fontSize: 11.5, charSpacing: 1, breakLine: true } },
    { text: 'a star in a magnetic bottle', options: { fontSize: 9, italic: true } },
  ], { x: ccx - cd / 2 + 0.15, y: ccy - 0.4, w: cd - 0.3, h: 0.8, align: 'center', valign: 'middle', color: C.background1, lineSpacingMultiple: 1.0 });
  arrow(s, colA + bwA / 2, r2 + bh + 0.04, ccx - 0.48, ccy - cd / 2 + 0.16, C.accent6, 2.25);
  arrow(s, colB + bwA / 2, r2 + bh + 0.04, ccx + 0.48, ccy - cd / 2 + 0.16, C.text2, 2.25);
  // Start-up: the battery bank powers the magnets and heaters that light the plasma.
  route(s, [[colC + bwC / 2, r2 + bh + 0.04], [colC + bwC / 2, ccy - 0.1], [ccx + cd / 2 + 0.06, ccy - 0.1]], C.accent1, { width: 2.25 });
  text(s, 'start-up power', { x: ccx + cd / 2 + 0.2, y: ccy - 0.42, w: 1.6, h: 0.26, fontSize: 9.5, bold: true, color: C.accent1 });
  // What comes out: electricity and heat, to the city.
  const r4 = ccy + cd / 2 + 0.35;
  const ow = 1.75;
  const oh = 0.66;
  dBox(s, ccx - 1.95, r4, ow, oh, C.accent3, 'Electricity', null, big);
  dBox(s, ccx + 0.2, r4, ow, oh, C.accent2, 'Heat', null, big);
  arrow(s, ccx - 0.5, ccy + cd / 2 - 0.12, ccx - 1.95 + ow / 2, r4 - 0.05, C.accent3, 2.25);
  arrow(s, ccx + 0.5, ccy + cd / 2 - 0.12, ccx + 0.2 + ow / 2, r4 - 0.05, C.accent2, 2.25);
  const cy5 = r4 + oh + 0.4;
  dBox(s, colA, cy5, colB + bwA - colA, 0.72, C.text1, 'THE CITY', 'homes · hospital · metro · food plant', { size: 11, noteSize: 9.5, noteInk: C.background2 });
  arrow(s, ccx - 1.95 + ow / 2, r4 + oh + 0.04, ccx - 1.95 + ow / 2, cy5 - 0.05, C.accent3, 2.25);
  arrow(s, ccx + 0.2 + ow / 2, r4 + oh + 0.04, ccx + 0.2 + ow / 2, cy5 - 0.05, C.accent2, 2.25);
  // Backup: if the core stops, wind, sun, geothermal and stored heat keep the essentials going.
  const bx = colC;
  const by = ccy + 0.3;
  card(s, bx, by, bwC, 1.65, C.background1, { line: C.accent1, lineWidth: 1.25 });
  text(s, [
    { text: 'BACKUP', options: { bold: true, fontSize: 9, charSpacing: 2, color: C.accent1, breakLine: true, paraSpaceAfter: 3 } },
    { text: 'If the core stops, wind, sun, geothermal and stored heat keep basic heating, the hospital and the shelters going.', options: { fontSize: 10, color: C.text1 } },
  ], { x: bx + 0.12, y: by + 0.1, w: bwC - 0.24, h: 1.5, lineSpacingMultiple: 1.04 });
  route(s, [[bx + bwC / 2, by + 1.69], [bx + bwC / 2, cy5 + 0.36], [colB + bwA + 0.06, cy5 + 0.36]], C.accent1, { width: 2, dash: 'dash' });

  // Three short notes under the diagram.
  const notes = [
    ['Fuel from snow', `Deuterium comes from snowmelt; tritium is made from lithium in the reactor wall ${cite('iterFusion')}.`],
    ['Safe by design', 'If anything goes wrong, the plasma cools in seconds. Tritium stays in sealed loops.'],
    ['Nothing burns', 'No CO₂, and the reactor’s spare heat melts the snow we drink.'],
  ];
  const nw = (CW - 0.4) / 3;
  notes.forEach(([t, d], i) => {
    const x = M + i * (nw + 0.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 8.85, w: nw, h: 0.05, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: name('note-rule') });
    text(s, t, { x, y: 9.0, w: nw, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.accent3 });
    text(s, d, { x, y: 9.35, w: nw, h: 1.55, fontSize: 10.5, lineSpacingMultiple: 1.1 });
  });
}

// ---------------------------------------------------------------------------
// 17–18 · Breakthrough 2: the Snow-to-Food & Water Plant
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Signature Districts');
  bleed(s, 'renders/food.jpg');
  shade(s, 'topStrong', 0, 0, W, 6.2, 3);
  shade(s, 'bottom', 0, 7.2, W, H - 7.2);
  marker(s, '2', M, 0.6, 0.8, C.accent4, { size: 28, ring: C.background1 });
  kicker(s, 'Breakthrough 2 · Snow-to-Food & Water Plant', M, 1.65, C.accent1, { textColor: C.background1 });
  title(s, 'Bread and Water from Snow and Air', M, 1.93, CW, 1.6, { fontSize: 44, color: C.background1 });
  standfirst(s, 'Our big idea: a plant that makes water and food from snow and air.', M, 3.55, 6.2, 0.7, { color: C.background1, fontSize: 15 });
  inBrief(s, M - 0.2, 8.05, CW + 0.4, C.accent1, [
    ['The problem', 'Almost nothing grows at −45 °C, and winter food comes only by air.'],
    ['The idea', 'Spare fusion heat melts snow for drinking water; microbes turn hydrogen and CO₂ into protein flour.'],
    ['What’s new', `Solar Foods makes protein from air ${cite('solarFoods')}, and Denmark’s Kalundborg factories share heat and water ${cite('kalundborg')}. We join both in one closed loop inside a city.`],
    ['The impact', 'Bread, noodles and drinks made here all year, with fewer supply flights.'],
  ], 1.12, 'Above: the Bioreactor Silos in the low sun.');
}
{
  // How it works: the chain from snow to supper.
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Snow-to-Food & Water Plant · How it works', 'From Snow to Supper', C.accent4);
  const top = 1.7;
  card(s, M, top, CW, 7.4, C.background2);
  label(s, 'From snow and air to water and food', M + 0.2, top + 0.15, 5, C.accent4);
  const sx = 0.85; // the main chain, top to bottom
  const sw = 2.55;
  const bx = 4.25; // what goes in or comes out at each step
  const bw = W - M - 0.25 - bx;
  const rh = 0.76;
  const pitch = 1.14;
  const r0 = top + 0.6;
  const big = { size: 11, noteSize: 9.5 };
  const chain = [
    ['Snow', 'fresh in winter, stored for summer', C.accent6],
    ['Melt hall', null, C.accent4],
    ['Clean water', null, C.accent6],
    ['Electrolysis', 'splits water with fusion power', C.accent4],
    ['Microbes & enzymes', 'in the bioreactor silos', C.accent4],
    ['Protein flour & starch', null, C.accent4],
  ];
  chain.forEach(([t, n, col], i) => {
    const y = r0 + i * pitch;
    dBox(s, sx, y, sw, rh, col, t, n, big);
    if (i < chain.length - 1) arrow(s, sx + sw / 2, y + rh + 0.03, sx + sw / 2, y + pitch - 0.04, C.text2, 2);
  });
  text(s, 'hydrogen', { x: sx + sw / 2 + 0.12, y: r0 + 3 * pitch + rh + 0.04, w: 1.0, h: 0.22, fontSize: 9.5, bold: true, italic: true, color: C.accent4 });
  // Side boxes: [row, direction (+1 out of the chain, -1 into it), head, note, colour].
  const side = [
    [1, -1, 'Spare heat', 'from the Fusion Core', C.accent2],
    [2, 1, 'Drinking water', 'for every tap', C.accent6],
    [3, 1, 'Oxygen + deuterium-rich water', 'for the hospital and the Fusion Core', C.accent1],
    [4, -1, 'CO₂', 'from the waste converter and the air', C.text2],
    [5, 1, 'Bread, noodles, drinks', null, C.text1],
  ];
  side.forEach(([row, dir, t, n, col]) => {
    const y = r0 + row * pitch;
    dBox(s, bx, y, bw, rh, col, t, n, big);
    if (dir > 0) arrow(s, sx + sw + 0.06, y + rh / 2, bx - 0.06, y + rh / 2, col, 2.25);
    else arrow(s, bx - 0.06, y + rh / 2, sx + sw + 0.06, y + rh / 2, col, 2.25);
  });

  const cw2 = (CW - 0.2) / 2;
  sideBox(s, M, 9.3, cw2, 1.6, 'Where the world is today', `Solar Foods in Finland already makes Solein protein from air and electricity ${cite('solarFoods')}. Starch from CO₂ works, but only in a lab so far ${cite('cai')}.`, { light: true, color: C.accent4, size: 11 });
  sideBox(s, M + cw2 + 0.2, 9.3, cw2, 1.6, 'Reality check', 'Snow does not fall all year, so winter snow and ice are stored for summer and most water is recycled. Our estimate: melting it takes only a little spare heat.', { light: true, color: C.accent4, size: 11 });
}

// ---------------------------------------------------------------------------
// 19–22 · Breakthrough 3: Mount Aurora
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Signature Districts');
  bleed(s, 'renders/spa.jpg');
  shade(s, 'topStrong', 0, 0, W, 5.2, 2);
  shade(s, 'bottom', 0, 7.0, W, H - 7.0);
  marker(s, '3', M, 0.6, 0.8, C.accent5, { size: 28, ring: C.background1 });
  kicker(s, 'Breakthrough 3 · Mount Aurora', M, 1.65, C.accent5, { textColor: C.background1 });
  title(s, 'A Snow Mountain\nYou Can Walk Inside', M, 1.93, CW, 1.45, { fontSize: 38, color: C.background1 });
  standfirst(s, 'Our big idea: the mountain is the building, with warm pools and saunas inside a snow peak.', M, 3.45, 6.4, 0.8, { color: C.background1, fontSize: 14.5 });
  inBrief(s, M - 0.2, 8.05, CW + 0.4, C.accent5, [
    ['The problem', `Long, dark winters are linked to seasonal affective disorder, a winter depression ${cite('sad')}. People need a warm, bright place to meet.`],
    ['The idea', 'Four warm spa levels inside an insulated snow peak, heated by a hot spring.'],
    ['What’s new', `Alaska’s Chena Hot Springs makes its own geothermal power and grows vegetables in greenhouses ${cite('chena')}. We turn a whole snow peak into an insulated building that is also a shelter.`],
    ['The impact', 'Rest and light for residents, income from visitors and a refuge in a disaster.'],
  ], 1.12, 'Cutaway view: four spa levels inside the snow peak, crowned by the glass Aurora Eye.');
}
{
  const [L, R] = spreadPages('DARK', 'Signature Districts');
  for (const [s, f, fx] of [[L, 'renders/grotto_L.jpg', 1], [R, 'renders/grotto_R.jpg', 0]]) {
    bleed(s, f, { fx });
    shade(s, 'topStrong', 0, 0, W, 5.0);
    shade(s, 'bottom', 0, 9.2, W, H - 9.2);
  }
  kicker(L, 'Mount Aurora · Level 1', M, 0.6, C.accent5, { textColor: C.background1 });
  title(L, 'Inside the Mountain', M, 0.88, CW, 0.9, { fontSize: 46, color: C.background1 });
  text(L, 'Level 1 is the arrival floor: a welcome hall, changing rooms and the Mineral Lake grotto.', {
    x: M, y: 1.95, w: 4.6, h: 0.85, fontFace: HEAD, italic: true, fontSize: 15, color: C.background1, lineSpacingMultiple: 1.08,
  });

  const gw = (CW - 0.2) / 2;
  sideBox(R, M, 0.6, gw, 2.05, 'Where the world is today', `Iceland’s Blue Lagoon bathes visitors in water from a geothermal power plant ${cite('blueLagoon')}. Mount Aurora goes further: the peak itself is the building.`, { color: C.accent5, size: 10.5 });
  sideBox(R, M + gw + 0.2, 0.6, gw, 2.05, 'Reality check', `An insulated rock shell keeps the spa warm at −45 °C. The hot spring must still be confirmed by drilling, and thermosyphons keep the ground frozen ${cite('hasemyer')}.`, { color: C.accent5, size: 10.5, figure: '28 °C inside' });
  caption(R, 'The Mineral Lake grotto and its larch footbridge.', W - M - 4.4, 10.5, 4.4, 0.35, { color: C.background1, align: 'right' });
}
{
  // How it works: a section through the mountain.
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Mount Aurora · How it works', 'Four Floors of Warmth', C.accent5);
  // A section through the mountain built from real interior photos, rendered at 300 dpi by
  // tools/section/section.mjs; its labels are part of the picture.
  const top = 1.7;
  const bottom = 8.756;
  s.addImage({ path: img('diagrams/mount_aurora_section.png'), x: M, y: top, w: CW, h: bottom - top, altText: 'Section through Mount Aurora: four warm spa levels inside an insulated snow peak, the Aurora Eye dome on top, a hot spring below and thermosyphons keeping the permafrost frozen', objectName: name('section') });

  const notes = [
    ['How it stays warm', 'A hot spring heats the pools, and the rock and snow hold the warmth in, like an igloo.'],
    ['Also a shelter', 'In a blizzard or a power cut, its heat comes from the ground, not the grid.'],
  ];
  notes.forEach(([t, d], i) => {
    const x = M + i * (COL2 + GUT);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 9.0, w: COL2, h: 0.05, fill: { color: C.accent5 }, line: { color: C.accent5, width: 0 }, objectName: name('note-rule') });
    text(s, t, { x, y: 9.15, w: COL2, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.accent5 });
    text(s, d, { x, y: 9.5, w: COL2, h: 1.4, fontSize: 11, lineSpacingMultiple: 1.1 });
  });
}

// ---------------------------------------------------------------------------
// 23 · Built by us: the team’s Eco-Polis model and how to explore it
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Our Eco-Polis model', 'Built by Us', C.accent6);
  standfirst(s, 'Before any picture, we built Aurora Haven ourselves in the Eco-Polis Builder, place by place.', M, 1.6, CW, 0.6, { fontSize: 13 });
  const ow = CW;
  const oh = ow * ratio('ecopolis/overview.jpg');
  picture(s, 'ecopolis/overview.jpg', M, 2.3, ow, oh);
  caption(s, 'The whole city in our Eco-Polis model.', M, 2.33 + oh, CW, 0.22);
  const shots = [['ecopolis/fusion.jpg', 'Fusion Power Station'], ['ecopolis/food.jpg', 'Snow-to-Food & Water Plant'], ['ecopolis/mount.jpg', 'Mount Aurora'], ['ecopolis/downtown.jpg', 'Downtown']];
  const tw = (CW - 0.3) / 4;
  const th = tw * 0.8;
  const ty = 2.65 + oh;
  shots.forEach(([f, c], i) => {
    picture(s, f, M + i * (tw + 0.1), ty, tw, th);
    caption(s, c, M + i * (tw + 0.1), ty + th + 0.03, tw, 0.22);
  });
  // Two QR codes and a short guide to opening the model.
  const qy = ty + th + 0.5;
  const q = 1.4;
  const codes = [['ui/qr_map_file.png', '1 · Download our map', 'Aurora_Haven.json', MAP_FILE_URL], ['ui/qr_ecopolis.png', '2 · Open Eco-Polis', 'ecopolis3d.netlify.app', ECOPOLIS_URL]];
  codes.forEach(([f, t, d, url], i) => {
    const x = M + i * (q + 0.3);
    s.addImage({ path: img(f), x, y: qy, w: q, h: q, hyperlink: { url, tooltip: t }, altText: `QR code: ${t}`, objectName: name('qr') });
    text(s, t, { x: x - 0.1, y: qy + q + 0.05, w: q + 0.2, h: 0.22, fontSize: 9, bold: true, align: 'center' });
    text(s, d, { x: x - 0.15, y: qy + q + 0.27, w: q + 0.3, h: 0.2, fontSize: 7.5, color: C.text2, align: 'center' });
  });
  const gx = M + 2 * (q + 0.3) + 0.1;
  sideBox(s, gx, qy - 0.05, W - M - gx, 10.9 - qy + 0.05, 'Explore our 3D city', leadList([
    ['1.', 'Scan code 1 to download our map file.'],
    ['2.', 'Scan code 2 to open the Eco-Polis Builder.'],
    ['3.', 'Click Load (the folder icon) and choose Aurora_Haven.json.'],
    ['4.', 'Click Lock (View), then Full Screen.'],
    ['5.', 'Drag to turn, scroll to zoom, click a building to read about it.'],
  ], { lead: C.accent6, gap: 6 }), { light: true, color: C.accent6, size: 11 });
}

// ---------------------------------------------------------------------------
// 24 · Three districts, one loop
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Living in Aurora Haven' });
  const s = page('DARK', 'Living in Aurora Haven');
  pageHead(s, 'The big idea', 'Three Districts, One Loop', C.accent1, { dark: true });
  standfirst(s, 'Our three breakthroughs work as one system, so heat, water and waste go round.', M, 1.6, CW, 0.75, { color: C.background2 });

  // Four nodes: the two plants on top, the city and the mountain below them.
  const node = (x, y, dd, col, t1, t2) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: dd, h: dd, fill: { color: col }, line: { color: C.background1, width: 2 }, objectName: name('loop-node') });
    text(s, t1, { x: x + 0.15, y: y + dd / 2 - 0.45, w: dd - 0.3, h: 0.5, fontFace: HEAD, fontSize: 15, bold: true, color: C.background1, align: 'center', valign: 'bottom' });
    text(s, t2, { x: x + 0.15, y: y + dd / 2 + 0.08, w: dd - 0.3, h: 0.45, fontSize: 9.5, color: C.background1, align: 'center' });
  };
  const d = 2.0;
  const fx = M + 0.15; // Fusion Power Station
  const fy = 2.55;
  const px = W - M - 0.15 - d; // Snow-to-Food & Water Plant
  const fcx = fx + d / 2;
  const pcx = px + d / 2;
  node(fx, fy, d, C.accent3, 'Fusion Power Station', 'heat · power · waste converter');
  node(px, fy, d, C.accent4, 'Snow-to-Food Plant', 'water · food · oxygen');
  const sd = 1.7;
  const sx = pcx - sd / 2;
  const sy = 5.75;
  node(sx, sy, sd, C.accent5, 'Mount Aurora', 'geothermal spa · shelter');
  const cityW = 2.0;
  const cityH = 1.3;
  const cityX = fcx - cityW / 2;
  const cityY = sy + sd / 2 - cityH / 2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cityX, y: cityY, w: cityW, h: cityH, rectRadius: 0.1, fill: { color: C.text1 }, line: { color: C.background1, width: 2 }, objectName: 'loop-node-city' });
  text(s, 'The City', { x: cityX + 0.1, y: cityY + 0.16, w: cityW - 0.2, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: C.background1, align: 'center' });
  text(s, '45,000 people, homes and greenhouses', { x: cityX + 0.15, y: cityY + 0.58, w: cityW - 0.3, h: 0.6, fontSize: 9.5, color: C.background2, align: 'center' });

  // Between the two plants.
  const ax1 = fx + d + 0.08;
  const ax2 = px - 0.08;
  [
    ['Spare heat melts the snow', C.accent2, 1],
    ['Hydrogen & CO₂ made from rubbish', C.background2, 1],
    ['Deuterium-rich water returns as fuel', C.accent6, -1],
  ].forEach(([t, col, dir], i) => {
    const y = fy + 0.4 + i * 0.45;
    if (dir > 0) arrow(s, ax1, y + 0.27, ax2, y + 0.27, col);
    else arrow(s, ax2, y + 0.27, ax1, y + 0.27, col);
    text(s, t, { x: ax1, y, w: ax2 - ax1, h: 0.22, fontSize: 9.5, bold: true, color: col, align: 'center' });
  });
  // Fusion <-> the city.
  arrow(s, fcx - 0.3, fy + d + 0.08, fcx - 0.3, cityY - 0.08, C.accent2);
  arrow(s, fcx + 0.3, cityY - 0.08, fcx + 0.3, fy + d + 0.08, C.background2);
  text(s, [
    { text: '↓ Heat and power', options: { color: C.accent2, breakLine: true, paraSpaceAfter: 6 } },
    { text: '↑ Rubbish for the converter', options: { color: C.background2 } },
  ], { x: fcx + 0.45, y: fy + d + 0.25, w: 1.4, h: 0.9, fontSize: 9.5, bold: true });
  // Food plant -> the city.
  arrow(s, px + 0.28, fy + d - 0.3, cityX + cityW + 0.08, cityY + 0.25, C.accent4, 2.25);
  text(s, 'Drinking water, food and medical oxygen', { x: 5.15, y: 4.8, w: 1.6, h: 0.5, fontSize: 9.5, bold: true, color: C.background2 });
  // Mount Aurora: the hot spring comes in, warm water goes on to the city's greenhouses.
  arrow(s, sx - 0.08, sy + sd / 2 + 0.25, cityX + cityW + 0.08, sy + sd / 2 + 0.25, C.accent5, 2.5);
  text(s, 'Warm spa water heats the greenhouses', { x: cityX + cityW + 0.35, y: sy + sd / 2 + 0.35, w: sx - cityX - cityW - 0.6, h: 0.45, fontSize: 9.5, bold: true, color: 'F08CAE', align: 'center' });
  arrow(s, pcx, sy + sd + 0.55, pcx, sy + sd + 0.06, C.accent2);
  text(s, 'Hot spring', { x: pcx - 1.5, y: sy + sd + 0.25, w: 1.35, h: 0.25, fontSize: 9.5, bold: true, color: C.accent2, align: 'right' });

  const rows = [
    ['Heat', 'Spare fusion heat melts the snow: snow is the reactor’s cooling tower.', C.accent2],
    ['Water', 'Deuterium-rich water returns as fuel; oxygen goes to the hospital.', C.accent6],
    ['Waste', 'Rubbish becomes hydrogen and CO₂ for food.', C.background2],
    ['Wellbeing', 'Spa water heats the greenhouses; the mountain is a shelter.', C.accent5],
  ];
  rows.forEach(([t, dd, col], i) => {
    const x = M + (i % 2) * (COL2 + GUT);
    const y = 8.45 + Math.floor(i / 2) * 1.12;
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.05, w: 0.14, h: 0.14, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('flow-dot') });
    text(s, t, { x: x + 0.25, y, w: COL2 - 0.25, h: 0.24, fontSize: 11, bold: true, color: C.background1 });
    text(s, dd, { x: x + 0.25, y: y + 0.27, w: COL2 - 0.25, h: 0.75, fontSize: 10, color: C.background2, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 25 · A liveable city
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Everyday life', 'A Liveable City Every Day', C.accent6);
  picture(s, 'renders/houses_dusk.jpg', 0, 1.65, W, 4.4, { fy: 0.55 });
  caption(s, 'Snowpine Residences at dusk, sheltered by planted spruces.', M, 6.12, CW, 0.25);
  const cats = [
    ['Homes', 'Family houses, eco-homes and high-rise apartments.'],
    ['Learning', 'Kindergartens, two schools and Arctic University.'],
    ['Health', 'Snowflake General Hospital, open around the clock.'],
    ['Shopping', 'A supermarket, a night market and a mall with an indoor park.'],
    ['Culture and green space', 'A cinema, an all-night library, the Snow Stadium and parks.'],
  ];
  cats.forEach(([t, d], i) => {
    const y = 6.6 + i * 0.86;
    kicker(s, t, M, y, C.accent6, { w: COL2 - 0.2 });
    text(s, d, { x: M, y: y + 0.27, w: COL2 + 0.15, h: 0.55, fontSize: 10.5, lineSpacingMultiple: 1.05 });
  });
  const rx = M + COL2 + GUT + 0.15;
  const rw = W - M - rx;
  picture(s, 'renders/approach_dusk.jpg', rx, 6.6, rw, 3.6);
  caption(s, 'The Mount Aurora Approach: low buildings and soft lamps keep the aurora in view.', rx, 10.27, rw, 0.6);
}

// ---------------------------------------------------------------------------
// 26 · Homes for the polar night (housing)
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  picture(s, 'renders/homes.jpg', 0, 0, W, 4.1);
  caption(s, 'The western eco-homes at dusk, with the wind farm behind.', M, 4.15, CW, 0.25);
  kicker(s, 'Housing', M, 4.55, C.accent6);
  title(s, 'Homes for the Polar Night', M, 4.82, CW, 0.7, { fontSize: 36 });
  standfirst(s, 'Every home stays warm and bright at −45 °C without thawing the ground beneath it.', M, 5.55, CW, 0.6, { fontSize: 13 });

  label(s, 'How a home beats the cold', M, 6.32, CW);
  const ideas = [
    ['Insulated piles', 'Homes stand on piles above an air gap, so their warmth does not reach the permafrost.'],
    ['Super-insulated shell', 'Thick walls and triple glazing keep the heat in.'],
    ['Heat-recovery air', 'Outgoing air warms the fresh air coming in.'],
    ['Winter gardens', 'Glazed balconies add a warm buffer.'],
    ['Snow-shedding roofs', 'Steep roofs let heavy snow slide off.'],
    ['Light in the dark', 'Light tubes and dawn lamps for the polar night.'],
  ];
  const iw = (CW - 0.3) / 3;
  ideas.forEach(([t, d], i) => {
    const x = M + (i % 3) * (iw + 0.15);
    const y = 6.62 + Math.floor(i / 3) * 1.38;
    card(s, x, y, iw, 1.28, C.background2);
    text(s, t, { x: x + 0.12, y: y + 0.11, w: iw - 0.24, h: 0.24, fontSize: 11, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: y + 0.4, w: iw - 0.24, h: 0.84, fontSize: 10.5, lineSpacingMultiple: 1.04 });
  });

  card(s, M, 9.5, CW, 1.35, C.text1);
  text(s, [
    { text: 'A HOME FOR EVERYONE  ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: 'Family houses, apartment towers, co-living, and homes for students and older people, all close to the heating loop and the metro.', options: { color: C.background1 } },
  ], { x: M + 0.2, y: 9.58, w: CW - 0.4, h: 1.2, fontSize: 11, valign: 'middle', lineSpacingMultiple: 1.1 });
}

// ---------------------------------------------------------------------------
// 27 · Clean energy: wind and sun start the fusion station, then stand by
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Clean energy, day and polar night', 'Energy for the Polar Night', C.accent6);
  picture(s, 'renders/renewable.jpg', 0, 1.65, W, 6.35);
  caption(s, 'The wind and solar farms of the Northern Renewable Park.', M, 8.07, CW, 0.25);
  standfirst(s, 'Wind and sun start the city’s own sun. Once fusion runs, they stand guard.', M, 8.42, CW, 0.45, { fontSize: 14 });
  const steps = [
    ['1 · Start-up', 'Wind and solar farms charge a battery bank that starts the reactor.', C.accent1],
    ['2 · Running', 'Fusion then powers and heats the whole city, day and night.', C.accent3],
    ['3 · Backup', 'If the reactor stops, wind, sun, geothermal and stored heat keep basic heating, the hospital and the shelters going.', C.accent6],
  ];
  const sw = (CW - 0.6) / 3;
  steps.forEach(([t, d, col], i) => {
    const x = M + i * (sw + 0.3);
    const cy = 9.0;
    card(s, x, cy, sw, 1.85, C.background2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: sw, h: 0.4, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('step-head') });
    text(s, t.toUpperCase(), { x: x + 0.14, y: cy, w: sw - 0.28, h: 0.4, fontSize: 9.5, bold: true, charSpacing: 2, color: C.background1, valign: 'middle' });
    text(s, d, { x: x + 0.14, y: cy + 0.52, w: sw - 0.28, h: 1.3, fontSize: 11, lineSpacingMultiple: 1.08 });
    if (i < 2) arrow(s, x + sw + 0.03, cy + 1.0, x + sw + 0.27, cy + 1.0, C.text2, 2.5);
  });
}

// ---------------------------------------------------------------------------
// 28 · Water and waste
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Water and waste', 'Nothing Is Wasted', C.accent4);
  picture(s, 'renders/water.jpg', 0, 1.65, W, 4.0);
  caption(s, 'The Water Recycling Line.', M, 5.72, CW, 0.25);
  label(s, 'Used water, cleaned in six steps', M, 6.15, CW, C.accent4);
  const st = ['Used water in', 'Screens', 'Settling basins', 'Sand & membrane filters', 'UV light', 'Recycled water tower'];
  const stw = CW / 6;
  st.forEach((t, i) => {
    const x = M + i * stw;
    if (i < 5) arrow(s, x + stw / 2 + 0.25, 6.73, x + stw * 1.5 - 0.25, 6.73, C.accent4, 1.75);
    marker(s, String(i + 1), x + stw / 2 - 0.22, 6.51, 0.44, C.accent4, { size: 14 });
    text(s, t, { x: x + 0.03, y: 7.05, w: stw - 0.06, h: 0.45, fontSize: 9, bold: true, align: 'center', lineSpacingMultiple: 1.0 });
  });
  paras(s, [
    'Water from sinks and showers is cleaned in six steps and reused in toilets, laundries and greenhouses. Toilet water is treated on its own and becomes biogas.',
  ], M, 7.8, COL2, 1.9);
  paras(s, [
    'The Circular Recycling Center sorts and repairs materials. Food scraps become biogas, and a plasma converter turns the rest into gas and building blocks.',
  ], M + COL2 + GUT, 7.8, COL2, 1.9);
  // The two results, side by side.
  card(s, M, 9.75, CW, 1.1, C.background2);
  text(s, '95%', { x: M + 0.2, y: 9.8, w: 1.4, h: 1.0, fontFace: HEAD, fontSize: 32, bold: true, color: C.accent4, valign: 'middle' });
  text(s, 'of the city’s water is used again', { x: M + 1.55, y: 9.8, w: 1.7, h: 1.0, fontSize: 11, bold: true, valign: 'middle' });
  s.addShape(pres.shapes.LINE, { x: M + COL2 + 0.15, y: 9.95, w: 0, h: 0.7, line: { color: C.accent4, width: 1 }, objectName: name('divider') });
  text(s, 'Almost nothing goes to landfill in the permafrost.', { x: M + COL2 + GUT + 0.1, y: 9.8, w: COL2 - 0.3, h: 1.0, fontFace: HEAD, fontSize: 14, bold: true, italic: true, color: C.accent4, valign: 'middle' });
}

// ---------------------------------------------------------------------------
// 29 · Urban eco-system
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  picture(s, 'renders/ecosystem.jpg', 0, 0, W, 4.75, { fy: 0.55 });
  caption(s, 'The eco-tour reindeer herd on the tundra by the Snow Garden Park.', M, 4.8, CW, 0.25);
  kicker(s, 'Urban eco-system', M, 5.2, C.accent1, { textColor: C.accent4 });
  title(s, 'Wild Neighbours', M, 5.47, CW, 0.7, { fontSize: 36 });
  standfirst(s, 'We share the tundra: animals move through the city, and planted trees work as snow fences.', M, 6.2, CW, 0.6, { fontSize: 13 });
  const col = (x, head, color, items) => {
    label(s, head, x, 7.15, COL2, color);
    text(s, items.flatMap(([t, d], i) => [
      { text: `${t}. `, options: { bold: true, color: C.text1, paraSpaceAfter: 8 } },
      { text: d, options: { color: C.text1, breakLine: i < items.length - 1 } },
    ]), { x, y: 7.45, w: COL2, h: 1.85, fontSize: 11, lineSpacingMultiple: 1.1 });
  };
  col(M, 'Animals', C.accent4, [
    ['Wildlife corridors', 'Tree belts link the tundra to the parks, with dim lights and underpasses.'],
    ['Reindeer', 'Local herders keep a small eco-tour herd.'],
    ['Polar bears', 'Fence sensors call a wildlife team when a bear comes close.'],
  ]);
  col(M + COL2 + GUT, 'Plants and farmed life', C.accent1, [
    ['Living snow fences', 'Belts of hardy spruce trap drifting snow and slow the wind.'],
    ['Aquaponics', 'Fish feed lettuce and herbs in the greenhouse.'],
    ['Shelter and science', 'Rock gardens shelter ptarmigans and hares.'],
  ]);
  card(s, M, 9.6, CW, 1.25, C.background2);
  text(s, [
    { text: 'HOW THEY SURVIVE  ', options: { bold: true, charSpacing: 2, color: C.accent4, paraSpaceAfter: 0 } },
    { text: `Arctic foxes grow a thick winter coat that lets them survive down to about −50 °C ${cite('aeco')}. The city gives them cover, safe crossings and dark nights.`, options: { color: C.text1 } },
  ], { x: M + 0.2, y: 9.66, w: CW - 0.4, h: 1.13, fontSize: 11, valign: 'middle', lineSpacingMultiple: 1.08 });
}

// ---------------------------------------------------------------------------
// 30 · Getting around
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Transport', 'Getting Around Fossil-Free', C.accent6);
  picture(s, 'renders/airport.jpg', 0, 1.65, W, 3.7);
  caption(s, 'Compact Polar Airport, the city’s winter supply link.', M, 5.42, CW, 0.25);
  paras(s, [
    'On the ground, everything is electric. Public transport starts with two driverless metro lines that meet under Liberty Mall, deep below the blizzards. Trams, buses and shared robotaxis stop at heated shelters.',
    `Warm streets and tunnels sit on thick insulation, and thermosyphons, as on the Trans-Alaska Pipeline, keep the ground below frozen ${cite('hasemyer')}.`,
    'Planes fly on e-fuel made with clean power.',
  ], M, 5.85, 4.05, 2.9, { fontSize: 11 });
  // Metro diagram: the two lines cross at the interchange.
  const mx = 5.0;
  const mw = W - M - mx;
  const cx = mx + mw / 2;
  const cy = 7.2;
  s.addShape(pres.shapes.LINE, { x: cx, y: 5.9, w: 0, h: 2.6, line: { color: C.accent6, width: 7 }, objectName: 'metro-aurora-line' });
  s.addShape(pres.shapes.LINE, { x: mx, y: cy, w: mw, h: 0, line: { color: C.accent4, width: 7 }, objectName: 'metro-glacier-line' });
  s.addShape(pres.shapes.OVAL, { x: cx - 0.22, y: cy - 0.22, w: 0.44, h: 0.44, fill: { color: C.background1 }, line: { color: C.text1, width: 3 }, objectName: 'metro-interchange' });
  text(s, 'Aurora Line\nnorth–south', { x: cx + 0.14, y: 5.9, w: 1.3, h: 0.42, fontSize: 9.5, bold: true, color: C.accent6 });
  text(s, 'Glacier Line\neast–west', { x: mx, y: cy + 0.16, w: 1.1, h: 0.42, fontSize: 9.5, bold: true, color: C.accent4 });
  text(s, 'Central Interchange, under Liberty Mall', { x: cx + 0.3, y: cy - 0.66, w: 1.1, h: 0.58, fontSize: 9.5, bold: true, valign: 'bottom' });
  const facts = [
    ['Who rides', 'Commuters, students and fans, with room for wheelchairs and skis.'],
    ['How many', 'About 8,000 people an hour each way (our estimate).'],
    ['Safe in a storm', 'Insulated tunnels with doors straight into the shelters.'],
    ['Energy', 'All-electric; braking trains feed power back.'],
  ];
  const fw = (CW - 3 * 0.12) / 4;
  facts.forEach(([t, d], i) => {
    const x = M + i * (fw + 0.12);
    card(s, x, 8.9, fw, 1.95, C.background2);
    text(s, t, { x: x + 0.12, y: 9.02, w: fw - 0.24, h: 0.26, fontSize: 11.5, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: 9.35, w: fw - 0.24, h: 1.45, fontSize: 11, lineSpacingMultiple: 1.08 });
  });
}

// ---------------------------------------------------------------------------
// 31 · Salad under the northern lights
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Living in Aurora Haven');
  bleed(s, 'renders/greenhouse.jpg');
  shade(s, 'topStrong', 0, 0, W, 4.6, 2);
  shade(s, 'fade', 0, 5.6, W, H - 5.6, 2);
  kicker(s, 'Evergreen Greenhouse Dome', M, 0.6, C.accent1, { textColor: C.background1 });
  title(s, 'Salad Under the Northern Lights', M, 0.88, CW, 1.6, { fontSize: 44, color: C.background1 });
  standfirst(s, 'Fresh salad, tomatoes and berries all year, even in the polar night.', M, 2.5, 6.2, 0.75, { color: C.background1, fontSize: 15 });
  paras(s, [
    'The clear roof catches the midnight sun in summer. In the polar night, LEDs take over and thermal curtains keep the heat in, with warmth from the heating loop and Mount Aurora’s spa water.',
  ], M, 9.15, 4.5, 1.6, { color: C.background1, fontSize: 11 });
  stat(s, '≈ 90%', `less water than field farming ${cite('barbosa')}`, 5.55, 9.1, W - M - 5.55, C.accent1, { size: 28, labelColor: C.background2, lh: 0.5, lsize: 10 });
  caption(s, 'Inside the Evergreen Greenhouse Dome.', M, 8.65, CW, 0.3, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 32 · Safety
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Safety', 'Safe and Ready for Any Storm', C.accent2);
  picture(s, 'renders/rescue.jpg', 0, 1.65, W, 5.4);
  caption(s, 'The Polar Rescue and Resilience Station, north of downtown.', M, 7.1, CW, 0.25);
  paras(s, [
    'The rescue station houses the fire brigade, ambulances, ice rescue and the 112 emergency centre, with a helicopter ready day and night.',
  ], M, 7.55, COL2, 1.9);
  paras(s, [
    'Under Liberty Mall, four shelters hold supplies for every resident. Aurora Core, the city’s AI control tower, sends blizzard warnings to every phone.',
  ], M + COL2 + GUT, 7.55, COL2, 1.9);
  [['30 days', 'of supplies for every resident'], ['48 h', 'warning before a blizzard']]
    .forEach(([n, l], i) => stat(s, n, l, M + i * (COL2 + GUT), 9.65, COL2, C.accent2, { size: 30, lh: 0.45, lsize: 10.5 }));
}

// ---------------------------------------------------------------------------
// 33 · Pros and cons
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Weighing it up', 'Pros & Cons', C.accent2);
  standfirst(s, 'No city is perfect: here is our honest balance sheet.', M, 1.5, CW, 0.6, { fontSize: 13 });
  const list = (x, y, w, head, color, items) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.34, fill: { color }, line: { color, width: 0 }, objectName: name('list-head') });
    text(s, head, { x: x + 0.12, y, w: w - 0.24, h: 0.34, fontSize: 9.5, bold: true, charSpacing: 2, color: C.background1, valign: 'middle' });
    text(s, items.flatMap(([t, d], i) => [
      { text: `${t}. `, options: { bold: true, color: C.text1, paraSpaceAfter: 7 } },
      { text: d[0].toUpperCase() + d.slice(1), options: { color: C.text1, breakLine: i < items.length - 1 } },
    ]), { x: x + 0.05, y: y + 0.46, w: w - 0.1, h: 2.3, fontSize: 11.5, lineSpacingMultiple: 1.05 });
  };
  list(M, 2.2, COL2, 'ADVANTAGES', C.accent1, [
    ['Zero carbon', 'no fossil fuel burns anywhere.'],
    ['Closed loops', 'water and waste go round, not to landfill.'],
    ['Food security', 'tap water and much of the food are made here.'],
    ['Safety', 'shelters, blizzard warnings and a storm-proof metro.'],
    ['Wellbeing', 'everything a short walk away, plus a spa.'],
  ]);
  list(M + COL2 + GUT, 2.2, COL2, 'LIMITATIONS AND RISKS', C.accent2, [
    ['Fusion is not ready', `ITER plans to burn fusion fuel only from 2039 ${cite('iterBaseline')}.`],
    ['One heating loop', 'if it fails, backup heat goes to the hospital and shelters first.'],
    ['Thawing ground', `a heat leak could crack foundations ${cite('hjort')}.`],
    ['Isolation', 'in deep winter, supplies come only by air.'],
    ['High-tech risks', 'AI systems need cyber-security; new foods need trust.'],
  ]);
  label(s, 'Costs', M, 5.1, CW);
  text(s, `Fusion is one of the most expensive machines ever built: ITER alone is estimated at €18–22 billion ${cite('kramer')}. Indoor farms save water but use far more electricity ${cite('barbosa')}.`, {
    x: M, y: 5.4, w: CW, h: 0.8, fontSize: 11, lineSpacingMultiple: 1.1,
  });
  label(s, 'Trade-offs: what we chose → what we gave up', M, 6.5, CW);
  const trades = [
    ['Compact blocks that save heat', 'smaller homes and less private space'],
    ['Metro, trams and shared robotaxis', 'fewer private cars and less freedom to drive'],
    ['Lights that switch on only when needed', 'darker streets, for the aurora and the wildlife'],
    ['Factory-made food', 'no farmland needed, but more electricity and new tastes'],
  ];
  trades.forEach(([a, b2], i) => {
    const y = 6.8 + i * 0.6;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: CW, h: 0.6, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: name('row-band') });
    text(s, a, { x: M + 0.1, y, w: 3.3, h: 0.6, fontSize: 11, bold: true, valign: 'middle' });
    text(s, '→', { x: M + 3.45, y, w: 0.3, h: 0.6, fontSize: 11, bold: true, color: C.accent2, valign: 'middle' });
    text(s, b2, { x: M + 3.8, y, w: CW - 3.9, h: 0.6, fontSize: 11, color: C.text2, valign: 'middle' });
  });
  card(s, M, 9.75, CW, 1.0, C.text1);
  text(s, [
    { text: 'OUR PLAN B  ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: 'Build in stages: geothermal, wind, sun and storage first; fusion only once it is proven.', options: { color: C.background1 } },
  ], { x: M + 0.2, y: 9.8, w: CW - 0.4, h: 0.9, fontSize: 11.5, valign: 'middle', lineSpacingMultiple: 1.1 });
}

// ---------------------------------------------------------------------------
// 34 · Invest in Aurora Haven
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Invest' });
  const s = page('LIGHT', 'Invest');
  picture(s, 'renders/approach_dusk.jpg', 0, 0, W, 3.3, { fy: 0.45 });
  shade(s, 'bottom', 0, 1.0, W, 2.3, 2);
  kicker(s, 'Investment opportunity', M, 2.12, C.accent1, { textColor: C.background1 });
  title(s, 'Invest in Aurora Haven', M, 2.4, CW, 0.8, { fontSize: 38, color: C.background1 });
  caption(s, 'The Mount Aurora Approach at dusk.', M, 3.36, CW, 0.22);
  standfirst(s, 'We are looking for partners to build a zero-carbon city, step by step.', M, 3.7, CW, 0.7, { fontSize: 14 });

  label(s, 'Three ways to invest', M, 4.6, CW);
  const ways = [
    ['Green city bonds', 'Fund Stage 1, repaid from heat and power sales.'],
    ['Community shares', 'Residents co-own the wind and solar farms.'],
    ['Research partnerships', 'Test new ideas with Arctic University.'],
  ];
  const ww = (CW - 0.3) / 3;
  ways.forEach(([t, d], i) => {
    const x = M + i * (ww + 0.15);
    card(s, x, 4.9, ww, 1.35, C.background2);
    marker(s, String(i + 1), x + 0.12, 5.02, 0.36, C.accent1, { size: 12 });
    text(s, t, { x: x + 0.58, y: 5.07, w: ww - 0.68, h: 0.26, fontSize: 10.5, bold: true });
    text(s, d, { x: x + 0.12, y: 5.5, w: ww - 0.24, h: 0.7, fontSize: 10.5, color: C.text2, lineSpacingMultiple: 1.04 });
  });

  label(s, 'What your money builds, stage by stage', M, 6.6, CW);
  const stagesList = [
    ['Stage 1 · A clean base', 'geothermal, wind, sun, storage and the metro.'],
    ['Stage 2 · Food and water', 'the Snow-to-Food plant, starting small.'],
    ['Stage 3 · Fusion', 'only once fusion is proven (page 31).'],
  ];
  s.addShape(pres.shapes.LINE, { x: M + 0.2, y: 7.05, w: 0, h: 1.3, line: { color: C.accent1, width: 2 }, objectName: 'stage-line' });
  stagesList.forEach(([t, d], i) => {
    const y = 6.9 + i * 0.65;
    marker(s, String(i + 1), M, y, 0.4, C.accent1, { size: 13 });
    text(s, [
      { text: `${t}: `, options: { bold: true, color: C.text1 } },
      { text: d, options: { color: C.text1 } },
    ], { x: M + 0.55, y: y + 0.06, w: CW - 0.55, h: 0.36, fontSize: 11, lineSpacingMultiple: 1.04 });
  });

  label(s, 'What investors get back', M, 8.95, CW);
  const gains = [
    'Steady income from heat, power and food',
    'Visitors all year',
    'Know-how for other Arctic towns',
    'No fuel or carbon bills',
  ];
  const gw2 = (CW - 0.36) / 4;
  gains.forEach((t, i) => {
    const x = M + i * (gw2 + 0.12);
    card(s, x, 9.22, gw2, 0.7, C.background2);
    text(s, t, { x: x + 0.1, y: 9.24, w: gw2 - 0.2, h: 0.66, fontSize: 10, lineSpacingMultiple: 1.02, valign: 'middle' });
  });
  text(s, 'Future concepts, not tested projects: no return is guaranteed.', {
    x: M, y: 9.98, w: CW, h: 0.25, fontSize: 9.5, italic: true, color: C.text2,
  });
  card(s, M, 10.3, CW, 0.6, C.text1);
  text(s, [
    { text: 'READY TO BUILD THE FUTURE?  ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: 'Join Stage 1 with a green city bond.', options: { color: C.background1 } },
  ], { x: M + 0.15, y: 10.33, w: CW - 0.3, h: 0.54, fontSize: 10.5, valign: 'middle' });
}

// ---------------------------------------------------------------------------
// 35 · Take the tour
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Guide' });
  const s = page('ICE', 'Guide');
  pageHead(s, 'Explore', 'Take the Tour: Eight Stops', C.accent6);
  standfirst(s, 'From downtown out to the plants, the snow peak and the windy north.', M, 1.6, CW, 0.7);
  const stops = [
    ['Founding Mayor Monument', 'The civic heart of the city.'],
    ['Central Interchange Station', 'Down to the metro and shelters.'],
    ['Snowflake General Hospital', 'The main hospital.'],
    ['Fusion Core', 'The city’s own sun.'],
    ['Snow Harvest & Melt Hall', 'Where snow becomes water.'],
    ['Mount Aurora', 'The snow peak with a spa inside.'],
    ['Ice-Proof Wind Farm', 'Turbines built for storms.'],
    ['Polar Rescue and Resilience Station', 'The 112 emergency centre.'],
  ];
  // Two columns of four stops, each column joined by a dashed route.
  const ly = 2.45;
  const rh = 0.92;
  [0, 1].forEach((c) => {
    const lx = M + c * (COL2 + GUT);
    s.addShape(pres.shapes.LINE, { x: lx + 0.22, y: ly + 0.2, w: 0, h: rh * 3, line: { color: C.accent6, width: 2, dashType: 'dash' }, objectName: name('tour-route') });
    stops.slice(c * 4, c * 4 + 4).forEach(([t, d], j) => {
      const y = ly + j * rh;
      marker(s, String(c * 4 + j + 1), lx, y, 0.44, C.accent6, { size: 14 });
      text(s, [
        { text: t, options: { fontSize: 11.5, bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 2 } },
        { text: d, options: { fontSize: 10.5, color: C.text2 } },
      ], { x: lx + 0.6, y: y + 0.02, w: COL2 - 0.6, h: rh - 0.1, lineSpacingMultiple: 1.0 });
    });
  });
  picture(s, 'renders/stadium.jpg', 0, 6.3, W, 4.15);
  caption(s, 'Aurora Snow Stadium at dusk.', M, 10.52, CW, 0.25);
}

// ---------------------------------------------------------------------------
// 36 · Places to visit (Appendix A of the slide content)
// ---------------------------------------------------------------------------
const PLACES = [
  'Founding Mayor Monument', 'Aurora Civic Center & Municipal Hall', 'Snowflake General Hospital',
  'Northern Lights School & Botanical Conservatory', 'Igloo Fresh Supermarket & Food Hall', 'Aurora Cinema & Performing Arts Center',
  'Underground Metro & Emergency Shelters', 'Aurora Core – AI Control Tower', 'Aurora Haven Police Headquarters',
  'Arctic University – Main Hall', 'Aurora Public Library', 'West Market Fire & Ambulance Station',
  'Aurora Glacier Mall & Crystal Atrium', 'Snow Lantern Primary School', 'Pinecone Kindergarten',
  'Aurora 81 – Polar Landmark Tower', 'Aurora Snow Garden Park', 'Mount Aurora – Snow Peak & Hanging Glacier',
  'Summit Sanctuary & Aurora Eye', 'Aurora Lagoon – Outdoor Geothermal Mineral Pool', 'Fusion Core – Compact D-T Tokamak',
  'Power Conversion & Heat Export Hall', 'Plasma Waste Converter', 'Snow Harvest & Melt Hall',
  'Drinking-Water & Mineral Works', 'Bioreactor Silos', 'Ice-Proof Wind Farm',
  'Bifacial Solar Farm', 'Water Recycling Line – Recycled Water Tower', 'Geothermal Power Plant',
  'Polar Rescue and Resilience Station', 'Glass Terminal, Control Tower & Gate 1 Dreamliner', 'Evergreen Greenhouse Dome',
  'Circular Recycling Center', 'Aurora Snow Stadium',
];
{
  const s = page('LIGHT', 'Guide');
  pageHead(s, 'Guide · 35 key places', 'Places to Visit', C.accent6);
  text(s, 'The numbers match the markers on the city plan on page 10.', { x: M, y: 1.58, w: CW, h: 0.25, fontSize: 10.5, italic: true, color: C.text2 });
  const per = 18;
  const top = 2.05;
  const rowH = (10.9 - top) / per;
  PLACES.forEach((n, i) => {
    const x = M + Math.floor(i / per) * (COL2 + GUT);
    const y = top + (i % per) * rowH;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x, y, w: COL2, h: rowH, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: name('row-band') });
    text(s, String(i + 1), { x: x + 0.08, y, w: 0.38, h: rowH, fontFace: HEAD, fontSize: 12, bold: true, color: C.accent6, valign: 'middle' });
    text(s, n, { x: x + 0.5, y, w: COL2 - 0.6, h: rowH, fontSize: 10.5, bold: true, valign: 'middle', lineSpacingMultiple: 1.0 });
  });
}

// ---------------------------------------------------------------------------
// 37 · Through a resident’s eyes: an imagined day
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Guide');
  picture(s, 'renders/resident.jpg', 0, 0, W, 6.6);
  shade(s, 'fade', 0, 4.1, W, 2.55, 2);
  kicker(s, 'A day in Aurora Haven · an imagined story', M, 5.35, C.accent1, { textColor: C.background1 });
  title(s, 'Through a Resident’s Eyes', M, 5.63, CW, 0.75, { fontSize: 38, color: C.background1 });
  standfirst(s, 'January, six weeks without a sunrise: a winter day for Mai, sixteen, a student here.', M, 6.5, CW, 0.65, { color: C.background2, fontSize: 13.5 });
  const day = [
    ['07:30', 'Mai’s flat in the Aurora 81 Residences is warm without a heater. Breakfast is bread made from snow and air.'],
    ['08:10', 'The driverless metro takes her to school, blizzard or not.'],
    ['12:30', 'Lunch is a greenhouse salad. After school, she borrows a light-therapy lamp from the library.'],
    ['17:00', 'Every phone pings a blizzard warning two days ahead. Nobody panics.'],
    ['20:00', 'At Mount Aurora, she floats in the warm lagoon under the northern lights.'],
  ];
  text(s, day.flatMap(([t, d], i) => [
    { text: `${t}  `, options: { bold: true, fontFace: HEAD, color: C.accent1, paraSpaceAfter: 10 } },
    { text: d, options: { color: C.background1, breakLine: i < day.length - 1 } },
  ]), { x: M, y: 7.4, w: 4.6, h: 3.5, fontSize: 12, lineSpacingMultiple: 1.12 });
  pullQuote(s, '“In the polar night, my city is the warmest place I know.”', 5.45, 7.55, W - M - 5.45, 2.0, C.accent1, { fontSize: 19 });
  caption(s, 'Walking home under the northern lights.', 5.45, 10.5, W - M - 5.45, 0.35, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 38 · Sources and assumptions
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Guide');
  pageHead(s, 'Research integrity', 'Sources & Assumptions', C.accent6);
  label(s, 'How to read our numbers', M, 1.55, CW);
  const kinds = [
    ['Design values', 'Figures from our own plan, such as 45,000 residents, not from a real city.'],
    ['Our estimates', 'Our own sums, marked “our estimate”: reasonable, not exact.'],
    ['Future concepts', 'The fusion station and the food plant do not exist at this size yet. Nothing has been tested.'],
  ];
  const kw = (CW - 0.3) / 3;
  kinds.forEach(([t, d], i) => {
    const x = M + i * (kw + 0.15);
    card(s, x, 1.85, kw, 1.2, C.background2);
    text(s, t, { x: x + 0.12, y: 1.93, w: kw - 0.24, h: 0.24, fontSize: 10.5, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: 2.2, w: kw - 0.24, h: 0.8, fontSize: 9, lineSpacingMultiple: 1.02 });
  });
  label(s, 'References', M, 3.3, CW);
  // Every source cited in the magazine, in the order it is first cited.
  const unused = Object.keys(REFS).filter((k) => !cited.includes(k));
  if (unused.length) throw new Error(`Sources listed but never cited: ${unused.join(', ')}`);
  const refs = cited.map((k) => REFS[k]);
  const half = Math.ceil(refs.length / 2);
  // Two columns of numbered references, set as flowing paragraphs.
  const column = (from, to, x) => text(s, refs.slice(from, to).flatMap((r, i) => [
    { text: `[${from + i + 1}]  `, options: { bold: true, color: C.accent6, paraSpaceAfter: 9 } },
    { text: r, options: { breakLine: from + i + 1 < to } },
  ]), { x, y: 3.6, w: COL2, h: 5.95, fontSize: 10, lineSpacingMultiple: 1.06 });
  column(0, half, M);
  column(half, refs.length, M + COL2 + GUT);
  card(s, M, 9.7, CW, 1.2, C.background2);
  text(s, [
    { text: 'PICTURES  ', options: { bold: true, charSpacing: 2, color: C.accent6 } },
    { text: 'The cover and the city pictures are photo-realistic images made with AI tools (Stable Diffusion XL, and Nano Banana Pro for the cover sky) from renders of our own 3D model. The maps and diagrams are drawn from our model, and the Eco-Polis photos on page 21 are real screenshots.', options: { breakLine: true, paraSpaceAfter: 4 } },
    { text: 'AI USE  ', options: { bold: true, charSpacing: 2, color: C.accent6 } },
    { text: 'We used AI tools to help us build the 3D model of the city and make the pictures, plans and diagrams in this magazine, and to check our spelling and fix logic errors in the text.' },
  ], { x: M + 0.15, y: 9.76, w: CW - 0.3, h: 1.08, fontSize: 9, valign: 'middle', lineSpacingMultiple: 1.04 });
}

// ---------------------------------------------------------------------------
// 39 · Inside back cover, left blank so the back cover is the last page
// ---------------------------------------------------------------------------
blankPage('Guide');

// ---------------------------------------------------------------------------
// 40 · Back cover
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Back Cover' });
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Back Cover' });
  bleed(s, 'renders/back.jpg', { objectName: 'back-picture' });
  const tw = 3.15;
  kicker(s, 'Join us', M, 0.6, C.accent1);
  text(s, 'Warm, Green and Ready', { x: M, y: 0.85, w: tw + 0.35, h: 1.3, fontFace: HEAD, fontSize: 36, bold: true, color: C.background1, lineSpacingMultiple: 0.92, shadow: shadow() });
  panel(s, M - 0.2, 2.15, tw + 0.4, 3.4, 28);
  // The team's conclusion.
  text(s, 'As we conclude this feature on Aurora Haven, we are left with more than just an impression of futuristic design – we are reminded of our shared responsibility toward the planet. The project clearly demonstrates that advanced technology and nature can coexist in harmony when guided by vision and innovation. Aurora Haven not only sets a precedent for resilient urban planning in extreme climates, but also serves as a powerful inspiration for a sustainable future where human communities are built to endure. May the concepts presented here spark further dialog and inspire bold solutions for generations to come.', {
    x: M, y: 2.3, w: tw, h: 2.4, fontSize: 9.5, color: C.background1, lineSpacingMultiple: 1.08,
  });
  text(s, [
    { text: 'Be one of the first polar citizens. ', options: { bold: true, color: C.accent1 } },
    { text: 'Buy a community share, study at Arctic University, or spend a night at the Mount Aurora spa.', options: { color: C.background1 } },
  ], { x: M, y: 4.55, w: tw, h: 0.9, fontSize: 9.5, lineSpacingMultiple: 1.08 });

  // Contact panel: the city logo, the team's details, the school logo and the QR code.
  const px = 4.15;
  const pw = W - M - px;
  panel(s, px, 0.55, pw, 5.0, 28);
  s.addImage({ path: img('ui/logo.png'), x: px + 0.2, y: 0.75, w: 1.05, h: 1.05, altText: 'Aurora Haven logo', objectName: 'city-logo' });
  text(s, 'AURORA HAVEN', { x: px + 1.4, y: 0.92, w: pw - 1.55, h: 0.32, fontFace: HEAD, fontSize: 16, bold: true, charSpacing: 1, color: C.background1 });
  text(s, 'A polar city that thrives', { x: px + 1.4, y: 1.25, w: pw - 1.55, h: 0.3, fontFace: HEAD, italic: true, fontSize: 11, color: C.background2 });
  text(s, [
    { text: 'CONTACT THE TEAM', options: { bold: true, charSpacing: 2, color: C.accent1, breakLine: true, paraSpaceAfter: 4 } },
    { text: 'Polar City', options: { bold: true, breakLine: true } },
    // One name per line, so no name is broken across two lines.
    ...['Nguyễn Đông Bảo', 'Nguyễn Bá Hiếu Thiện', 'Phan Minh Khôi', 'Dương Hàng Nguyên', 'Phạm Phước Khoa', 'Nguyễn Minh Triết']
      .map((n) => ({ text: n, options: { fontFace: VN, fontSize: 8, breakLine: true } })),
    { text: 'Class 11A4 · Lê Quý Đôn High School', options: { fontFace: VN, fontSize: 8 } },
  ], { x: px + 0.2, y: 1.9, w: pw - 1.55, h: 1.5, fontSize: 9.5, color: C.background1, lineSpacingMultiple: 1.0 });
  s.addImage({ path: img('ui/school_logo.png'), x: px + pw - 1.22, y: 2.05, w: 1.05, h: 1.05, altText: 'Lê Quý Đôn High School logo', objectName: 'school-logo' });
  qrCard(s, px + 0.15, 3.4, pw - 0.3, 1.95, { fill: C.background1, size: 12, flipbook: true });
}

for (const [s, side, dark, n, section] of numbered) {
  s.addText(String(n), Object.assign(pageNumber(side, dark), { isTextBox: true, objectName: 'page-number' }));
  s.addText([
    { text: `${FOLIO}  ·  `, options: { color: dark ? C.background2 : C.text2 } },
    { text: SECTION_FOLIO[section] || section.toUpperCase(), options: { color: dark ? C.background1 : C.accent6 } },
  ], folioOptions(side));
}
if (pageNo !== 39) throw new Error(`Expected 39 inside pages before the back cover, got ${pageNo}`);
// The four photo spreads must stay on printed pages 4–5, 8–9, 12–13 and 18–19 (sheets 6, 10, 14, 20).
if (spreads.join(',') !== '6,10,14,20') throw new Error(`The spreads moved: they start on sheets ${spreads.join(', ')}`);

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Wrote', OUT);
})();
