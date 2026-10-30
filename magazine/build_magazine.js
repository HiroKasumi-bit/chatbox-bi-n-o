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
  text(s, runs, Object.assign({ x, y, w, h, lineSpacingMultiple: 1.12 }, o));
}

// Paragraphs where the first few words are set in bold capitals, as a magazine lead-in.
function leadParas(s, lead, list, x, y, w, h, o = {}) {
  const runs = [{ text: `${lead.toUpperCase()} `, options: { bold: true, charSpacing: 1 } }];
  list.forEach((p, i) => runs.push({ text: p, options: { breakLine: i < list.length - 1, paraSpaceAfter: 7 } }));
  text(s, runs, Object.assign({ x, y, w, h, lineSpacingMultiple: 1.12 }, o));
}

function standfirst(s, t, x, y, w, h, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontFace: HEAD, italic: true, fontSize: 14, color: C.text2, lineSpacingMultiple: 1.1 }, o));
}

function caption(s, t, x, y, w, h = 0.3, o = {}) {
  text(s, t, Object.assign({ x, y, w, h, fontSize: 8.5, italic: true, color: C.text2 }, o));
}

// A pull quote: a short coloured rule, then the quote in large italic serif.
function pullQuote(s, t, x, y, w, h, color, o = {}) {
  if (!o.noRule) s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.6, h: 0.05, fill: { color }, line: { color, width: 0 }, objectName: name('quote-rule') });
  delete o.noRule;
  text(s, t, Object.assign({ x, y: y + 0.18, w, h, fontFace: HEAD, italic: true, bold: true, fontSize: 20, color, lineSpacingMultiple: 1.02 }, o));
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

// Full-bleed picture filling the page.
const bleed = (s, file) => picture(s, file, 0, 0, W, H);

// Soft navy gradient over a photo, so white type stays readable; 'fade' ends fully opaque,
// 'topStrong' is a darker top shade for pale pictures.
function shade(s, kind, x, y, w, h) {
  const file = { fade: 'ui/fade_bottom.png', topStrong: 'ui/shade_top_strong.png' }[kind] || `ui/shade_${kind}.png`;
  s.addImage({ path: img(file), x, y, w, h, objectName: name(`shade-${kind}`) });
}

// A translucent navy panel for text over a photo.
function panel(s, x, y, w, h, transparency = 22) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.text1, transparency }, line: { color: C.text1, width: 0, transparency: 100 }, objectName: name('panel') });
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

// Numbered stage list (the numbers match the markers on the district plans).
function stages(s, list, x, y, w, rowH, color) {
  list.forEach((st, i) => {
    const yy = y + i * rowH;
    marker(s, st.n, x, yy, 0.36, st.color || color, { size: 12 });
    text(s, st.name, { x: x + 0.5, y: yy - 0.01, w: w - 0.5, h: 0.22, fontSize: 10.5, bold: true });
    text(s, st.text, { x: x + 0.5, y: yy + 0.22, w: w - 0.5, h: rowH - 0.28, fontSize: 9.5, color: C.text2, lineSpacingMultiple: 1.08 });
  });
}

const shadow = () => ({ type: 'outer', color: '06102A', blur: 6, offset: 1, angle: 90, opacity: 0.6 });

// The team's real-world interview video, reached by a QR code (drawn and test-scanned by
// tools/make_graphics.py). The code and the link under it are both clickable in the file.
const INTERVIEW_URL = 'https://youtu.be/QwcP_2Q3Esc';
// The interactive edition of this magazine on FlipHTML5.
const FLIPBOOK_URL = 'https://online.fliphtml5.com/aidsfjas4239PolarCut/Aurora_Haven_Magazine_web/';

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
}

// A short list of bold lead-ins and text, one paragraph each.
// "In brief": the four questions every breakthrough answers (the problem, the idea, what is
// new and the impact), as a 2 × 2 fact file on a dark panel over the opener's photo.
function inBrief(s, x, y, w, color, items) {
  const cw = (w - 0.3) / 2;
  const rh = 1.02;
  panel(s, x, y, w, 0.42 + 2 * rh, 12);
  kicker(s, 'In brief', x + 0.18, y + 0.14, color, { textColor: C.background1 });
  items.forEach(([head, body], i) => {
    const cx = x + 0.15 + (i % 2) * (cw + 0.05);
    const cy = y + 0.46 + Math.floor(i / 2) * rh;
    text(s, head.toUpperCase(), { x: cx + 0.03, y: cy, w: cw - 0.1, h: 0.2, fontSize: 8, bold: true, charSpacing: 2, color });
    text(s, body, { x: cx + 0.03, y: cy + 0.21, w: cw - 0.1, h: rh - 0.26, fontSize: 9.5, color: C.background1, lineSpacingMultiple: 1.05 });
  });
}

const leadList = (items, o = {}) => items.flatMap(([t, d], i) => [
  { text: `${t} `, options: { bold: true, color: o.lead || undefined } },
  { text: d, options: { breakLine: i < items.length - 1, paraSpaceAfter: o.gap ?? 5 } },
]);

// A card with the QR code and its label: side by side, or stacked in a narrow card.
function qrCard(s, x, y, w, h, o = {}) {
  card(s, x, y, w, h, o.fill || C.background2);
  // o.flipbook: the code leads to the interactive edition instead of the interview video.
  const url = o.flipbook ? FLIPBOOK_URL : INTERVIEW_URL;
  const link = { url, tooltip: o.flipbook ? 'Read the interactive edition' : 'Watch our real-world interview' };
  const label = [
    { text: o.flipbook ? 'SCAN TO READ' : 'SCAN TO WATCH', options: { fontSize: 8, bold: true, charSpacing: 1.5, color: C.accent4, breakLine: true, paraSpaceAfter: 3 } },
    { text: o.flipbook ? 'The interactive edition' : 'Our real-world interview', options: { fontFace: HEAD, fontSize: o.size || 14, bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 3 } },
    { text: o.flipbook ? 'Flip through this magazine online on FlipHTML5' : 'Video on YouTube', options: { fontSize: 8.5, color: C.text2, breakLine: true } },
    { text: o.flipbook ? 'Open the flipbook' : INTERVIEW_URL.replace('https://', ''), options: { fontSize: 8.5, bold: true, color: C.accent6, hyperlink: link } },
  ];
  const code = (qx, qy, q) => s.addImage({ path: img(o.flipbook ? 'ui/qr_flipbook.png' : 'ui/qr_interview.png'), x: qx, y: qy, w: q, h: q, hyperlink: link, objectName: name('qr-interview') });
  if (w < 2.6) {
    const q = Math.min(w - 0.5, h - 1.25);
    code(x + (w - q) / 2, y + 0.2, q);
    text(s, label, { x: x + 0.1, y: y + q + 0.3, w: w - 0.2, h: h - q - 0.4, align: 'center', lineSpacingMultiple: 1.0 });
  } else {
    const q = Math.min(h - 0.3, w * 0.4);
    code(x + 0.15, y + (h - q) / 2, q);
    text(s, label, { x: x + q + 0.35, y: y + 0.15, w: w - q - 0.5, h: h - 0.3, valign: 'middle', lineSpacingMultiple: 1.0 });
  }
}

// ---------------------------------------------------------------------------
// 1 · Cover: an aerial photo of the city with the three breakthroughs labelled on it
// ---------------------------------------------------------------------------
// The picture is the cover_aerial render, made photographic with an AI image tool
// (Nano Banana Pro) while keeping the model's layout; see the AI USE note on the sources page.
{
  pres.addSection({ title: 'Cover' });
  const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'Cover' });
  picture(s, 'renders/cover_real.jpg', 0, 0, W, H);
  shade(s, 'top', 0, 0, W, 2.6);
  shade(s, 'fade', 0, 7.9, W, H - 7.9);

  // Masthead.
  text(s, 'THE IDEAL CITY OF THE FUTURE', { x: M, y: 0.36, w: 4.5, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 3, color: C.accent1 });
  text(s, 'ISSUE 01  ·  2026', { x: W - M - 3, y: 0.36, w: 3, h: 0.22, fontSize: 8.5, bold: true, charSpacing: 3, color: C.background1, align: 'right' });
  text(s, 'AURORA HAVEN', { x: 0.15, y: 0.58, w: W - 0.3, h: 1.2, fontFace: HEAD, fontSize: 68, bold: true, color: C.background1, align: 'center', shadow: shadow() });
  text(s, 'A POLAR CITY THAT THRIVES', { x: M, y: 1.78, w: CW, h: 0.3, fontSize: 11, bold: true, charSpacing: 6, color: C.background1, align: 'center', shadow: shadow() });

  // The three breakthroughs, labelled where they stand in the photo: a pin on the building,
  // a leader line and a dark label with the number, the name and the page.
  const callout = (n, head, sub, pg, color, bx, by, bw, tx, ty, lx, ly) => {
    s.addShape(pres.shapes.LINE, {
      x: Math.min(lx, tx), y: Math.min(ly, ty), w: Math.max(Math.abs(tx - lx), 0.001), h: Math.max(Math.abs(ty - ly), 0.001),
      flipH: tx < lx, flipV: ty < ly, line: { color: C.background1, width: 1.25 }, objectName: name('cover-leader'),
    });
    s.addShape(pres.shapes.OVAL, { x: tx - 0.09, y: ty - 0.09, w: 0.18, h: 0.18, fill: { color }, line: { color: C.background1, width: 1.5 }, objectName: name('cover-pin') });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: 0.64, rectRadius: 0.06, fill: { color: C.text1, transparency: 12 }, line: { color, width: 1.25 }, objectName: name('cover-label') });
    marker(s, n, bx + 0.1, by + 0.12, 0.4, color, { size: 12 });
    text(s, [
      { text: head, options: { bold: true, fontSize: 10, charSpacing: 1.5, color: C.background1, breakLine: true } },
      { text: `${sub}  ·  P. ${pg}`, options: { fontSize: 8.5, italic: true, color: C.background2 } },
    ], { x: bx + 0.58, y: by + 0.06, w: bw - 0.66, h: 0.52, valign: 'middle', margin: 0, lineSpacingMultiple: 1.05 });
  };
  callout('1', 'FUSION CORE', 'The city’s own sun', 12, C.accent3, 2.75, 7.45, 2.6, 2.02, 6.72, 2.95, 7.45);
  callout('2', 'SNOW-TO-FOOD PLANT', 'Bread and water from snow', 15, C.accent4, 4.3, 4.2, 2.65, 7.21, 6.66, 6.6, 4.84);
  callout('3', 'MOUNT AURORA', 'A snow mountain you can walk inside', 17, C.accent5, 0.4, 3.85, 2.85, 1.79, 5.2, 1.79, 4.49);

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
  s.addImage({ path: img('ui/school_logo.png'), x: M, y: 10.76, w: 0.55, h: 0.55, objectName: 'cover-school-logo' });
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
  picture(s, 'renders/street_dusk.jpg', 0, 0, W, 4.0);
  shade(s, 'bottom', 0, 1.5, W, 2.5);
  kicker(s, 'Inside this issue', M, 2.68, C.accent1, { textColor: C.background1 });
  title(s, 'Contents', M, 2.96, CW, 0.8, { fontSize: 44, color: C.background1 });
  // The issue in its sections, as the course guidelines order them: context, the city,
  // the three breakthroughs, the systems, the investment case and the guide.
  const groups = [
    ['Welcome', C.accent6, [
      ['2', 'Letter from the Founders', 'Who we are and why we built Aurora Haven'],
      ['4', 'Welcome to Aurora Haven', 'A compact city of 45,000 under a snow peak'],
      ['6', 'The Polar Challenge', 'Cold, darkness, wind and thawing ground'],
      ['7', 'Our Vision & Mission', 'Who is affected, and the five ideas that answer it'],
    ]],
    ['The city', C.accent6, [
      ['8', 'Nine Blocks, One Short Walk', 'Downtown around the Aurora Roundabout'],
      ['10', 'The Whole City Plan', 'From the wind farm to Mount Aurora'],
    ]],
    ['The breakthroughs', C.accent5, [
      ['12', "The City's Own Sun", 'Breakthrough 1 · Fusion Power Station', C.accent3],
      ['15', 'Bread and Water from Snow and Air', 'Breakthrough 2 · Snow-to-Food & Water Plant', C.accent4],
      ['17', 'A Snow Mountain You Can Walk Inside', 'Breakthrough 3 · Mount Aurora', C.accent5],
      ['21', 'Built by Us', 'Our Eco-Polis model, and how to explore it'],
    ]],
    ['Invest', C.accent2, [
      ['32', 'Invest in Aurora Haven', 'Three ways to fund the city, stage by stage'],
    ]],
    ['Systems & life', C.accent4, [
      ['22', 'Three Districts, One Loop', 'How heat, water, oxygen and waste go round'],
      ['23', 'A Livable City Every Day', 'Schools, health, shops and culture'],
      ['24', 'Homes for the Polar Night', 'Housing for every age, built for −45 °C'],
      ['25', 'Energy for the Polar Night', 'Fusion, wind, sun, geothermal and storage'],
      ['26', 'Nothing Is Wasted', 'Water and waste in closed loops'],
      ['27', 'Wild Neighbours', 'Our urban eco-system: plants and animals'],
      ['28', 'Getting Around Fossil-Free', 'Routes, users, capacity, safety and energy'],
      ['29', 'Salad Under the Northern Lights', 'Inside the Evergreen Greenhouse Dome'],
      ['30', 'Safe and Ready for Any Storm', 'Rescue, shelters and blizzard forecasts'],
      ['31', 'Pros & Cons', 'Advantages, risks, costs and trade-offs'],
    ]],
    ['The guide', C.accent1, [
      ['33', 'Take the Tour', 'Eight stops around the city'],
      ['34', 'Places to Visit', '35 key places and what they do'],
      ['35', 'Through a Resident’s Eyes', 'An imagined day in the polar night'],
      ['36', 'Sources & Assumptions', 'Where our facts come from'],
    ]],
  ];
  const rowH = 0.4;
  const headH = 0.36;
  let x = M;
  let y = 4.35;
  groups.forEach(([head, color, items], g) => {
    if (g === 4) { x = M + COL2 + GUT; y = 4.35; } // the right-hand column
    kicker(s, head, x, y, color, { w: COL2 - 0.2 });
    y += headH;
    items.forEach(([p, t, d, pc]) => {
      text(s, p, { x, y: y - 0.03, w: 0.5, h: 0.36, fontFace: HEAD, fontSize: 16, bold: true, color: pc || C.accent6 });
      text(s, t, { x: x + 0.55, y, w: COL2 - 0.55, h: 0.2, fontSize: 10, bold: true });
      text(s, d, { x: x + 0.55, y: y + 0.19, w: COL2 - 0.55, h: 0.2, fontSize: 8, color: C.text2 });
      y += rowH;
    });
    y += 0.12;
  });
}

// ---------------------------------------------------------------------------
// 4 · Letter from the founders
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Welcome');
  kicker(s, 'Letter from the founders', M, 0.55, C.accent6);
  pullQuote(s, '“Our goal was not only to survive the cold but to build a city where people really want to live.”', M, 0.85, CW, 1.2, C.text1, { fontSize: 23, noRule: true });
  picture(s, 'renders/lagoon.jpg', 0, 2.45, W, 3.5);
  caption(s, 'The Aurora Lagoon, a 38 °C open-air mineral pool at the foot of Mount Aurora, under the northern lights.', M, 6.02, CW, 0.25);
  // The team's opening, set in two columns (one text box each).
  leadParas(s, 'Welcome to this special feature', [
    'on a polar city named Aurora Haven – a bold architectural marvel where human ingenuity meets the call of the wild. In an era shaped by global climate shifts, this project is more than just an urban concept; it represents a strategic vision for survival and sustainable development in the earth’s most extreme polar environments.',
  ], M, 6.45, COL2, 2.4, { fontSize: 11 });
  paras(s, [
    'From its sleek structural design to intelligent renewable energy integration, Aurora Haven redefines how humanity can adapt and thrive under pressure. We invite you to turn the page and step into a world where extreme natural challenges are transformed into a vibrant, resilient, and forward-thinking community.',
  ], M + COL2 + GUT, 6.45, COL2, 1.7, { fontSize: 11 });
  text(s, 'The Polar City team', { x: M + COL2 + GUT, y: 8.3, w: COL2, h: 0.25, fontFace: HEAD, italic: true, fontSize: 12, bold: true });
  text(s, 'Class 11A4 · Lê Quý Đôn High School', { x: M + COL2 + GUT, y: 8.57, w: COL2, h: 0.22, fontFace: VN, fontSize: 9, color: C.text2 });
  card(s, M, 9.4, CW, 1.45, C.background2);
  picture(s, 'renders/cover_real.jpg', M + 0.15, 9.55, 0.8, 1.15);
  kicker(s, 'On the cover', M + 1.15, 9.57, C.accent6, { w: CW - 1.35 });
  text(s, 'Aurora Haven on a polar night, seen from the east: the Fusion Core and its violet rings in front, Mount Aurora and its glass dome on the left, and on the right Aurora 81, the Polar Landmark Tower named in honour of Landmark 81 in Ho Chi Minh City.', {
    x: M + 1.15, y: 9.83, w: CW - 1.3, h: 0.9, fontSize: 9.5, lineSpacingMultiple: 1.05,
  });
}

// ---------------------------------------------------------------------------
// 5 · Meet the founders: the team, their roles and the interview
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Welcome');
  pageHead(s, 'The team behind Aurora Haven', 'Meet the Founders', C.accent6);
  standfirst(s, 'The people who planned, built and wrote Aurora Haven, and what each of us did.', M, 1.6, CW, 0.5, { fontSize: 13 });
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
    if (photo) {
      s.addImage({ path: img(`team/${photo}.jpg`), x: x + 0.12, y: y + 0.12, w: pw, h: ph, objectName: name('member-photo') });
    } else {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.12, y: y + 0.12, w: pw, h: ph, fill: { color: C.background1 }, line: { color: C.text2, width: 1, dashType: 'dash' }, objectName: name('photo-space') });
      text(s, '[Photo]', { x: x + 0.12, y: y + 0.12, w: pw, h: ph, fontSize: 10, color: C.text2, align: 'center', valign: 'middle' });
    }
    text(s, n, { x: x + 0.12, y: y + ph + 0.22, w: pw, h: 0.26, fontFace: VN, fontSize: 11, bold: true });
    text(s, role, { x: x + 0.12, y: y + ph + 0.5, w: pw, h: 0.38, fontSize: 9, bold: true, color: C.accent6, lineSpacingMultiple: 1.0 });
  });
  qrCard(s, M, 9.0, 3.0, 1.9);
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
  const L = page('LIGHT', 'Welcome');
  picture(L, 'renders/welcome_pano_L.jpg', 0, 0, W, band);
  shade(L, 'bottom', 0, band - 3.2, W, 3.2);
  kicker(L, 'City overview', M, band - 1.95, C.accent1, { textColor: C.background1 });
  title(L, 'Welcome to\nAurora Haven', M, band - 1.65, CW, 1.4, { fontSize: 46, color: C.background1 });
  standfirst(L, 'Designed not just to survive the polar night, but to make life here warm, healthy and sustainable.', M, band + 0.35, CW, 0.7, { fontSize: 15, color: C.text1 });
  leadParas(L, 'Aurora Haven is', [
    'a compact polar city of around 45,000 people, built on a frozen tundra plateau beneath the snow peak of Mount Aurora. Winters fall to −45 °C, the sun disappears for two months of polar night, and almost nothing can grow.',
  ], M, band + 1.25, COL2, 2.7);
  paras(L, [
    'The whole city is shaped around one idea: heat, energy, water and food should never be wasted. Every building shares a single heating network, the city runs on zero-carbon energy, and nearly all of its water and waste is recycled.',
    'Homes, schools, healthcare, shops and parks sit within a short walk of each other, connected by a downtown metro, electric trams and heated streets.',
  ], M + COL2 + GUT, band + 1.25, COL2, 2.75);
  pullQuote(L, '“Three ideas work as one closed loop that keeps the city powered, fed and happy in one of the harshest places on Earth.”', M, 10.0, CW, 0.85, C.accent6, { fontSize: 14.5 });

  const R = page('LIGHT', 'Welcome');
  picture(R, 'renders/welcome_pano_R.jpg', 0, 0, W, band);
  shade(R, 'bottom', 0, band - 1.3, W, 1.3);
  caption(R, 'Aurora Haven at dusk, seen from the south-east: the fusion station in front, downtown and Aurora 81 in the middle, the wind farm on the windy northern edge.', W - M - 4.2, band - 0.62, 4.2, 0.45, { color: C.background1, align: 'right' });
  // The three standout features, each with its own colour and the page where its story starts.
  kicker(R, 'Three things only Aurora Haven has', M, band + 0.35, C.accent6, { w: CW });
  const features = [
    ['1', 'The City’s Own Sun', 'A compact fusion reactor inside the city lights every home, heats every street and melts the snow we drink.', 'renders/fusion_spread_R.jpg', C.accent3, 12],
    ['2', 'Bread and Water from Snow and Air', 'A factory turns snow and air into drinking water, bread and protein, so a city with no farmland can feed itself.', 'renders/food.jpg', C.accent4, 15],
    ['3', 'A Snow Mountain You Can Walk Inside', 'Mineral lakes, mud pools and saunas stay at 28 °C inside a 35-metre snow peak, all winter long.', 'renders/spa.jpg', C.accent5, 17],
  ];
  const rh = 0.98;
  features.forEach(([n, t, d, pic, col, pg], i) => {
    const y = band + 0.72 + i * (rh + 0.1);
    card(R, M, y, CW, rh, C.background2);
    picture(R, pic, M, y, 1.55, rh);
    marker(R, n, M + 1.72, y + 0.14, 0.4, col, { size: 13 });
    text(R, t, { x: M + 2.25, y: y + 0.1, w: CW - 3.25, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: C.text1 });
    text(R, d, { x: M + 2.25, y: y + 0.42, w: CW - 3.25, h: 0.5, fontSize: 9.5, color: C.text1, lineSpacingMultiple: 1.04 });
    text(R, `PAGE ${pg}`, { x: W - M - 0.95, y: y + 0.12, w: 0.8, h: 0.24, fontSize: 8, bold: true, charSpacing: 2, color: col, align: 'right' });
  });
}

// ---------------------------------------------------------------------------
// 8 · The polar challenge
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'The City' });
  const s = page('DARK', 'The City');
  // The blizzard picture is pale, so it fades into the navy page and the text sits below it.
  picture(s, 'renders/storm.jpg', 0, 0, W, 6.3);
  shade(s, 'fade', 0, 3.9, W, 2.45);
  kicker(s, 'The place', M, 5.05, C.accent1, { textColor: C.background1 });
  title(s, 'The Polar Challenge', M, 5.33, CW, 0.8, { fontSize: 44, color: C.background1 });
  standfirst(s, 'One of the hardest places on Earth to build a city, so every building had to answer one question.', M, 6.2, CW, 0.65, { color: C.background2, fontSize: 15 });
  paras(s, [
    'Aurora Haven sits in one of the hardest environments on Earth. In winter the temperature falls to minus 45 degrees. For about two months the sun never rises, as in Tromsø, Norway, which sees no sunrise from late November to mid-January [19]. Blizzards can reach 120 kilometres per hour.',
    'The ground is permafrost, so a warm building can thaw it and crack its own foundations. Across the Arctic, about 70% of today’s buildings, roads and pipelines on permafrost stand where the ground could thaw by 2050 [2]. There is almost no farmland, and in deep winter supplies can only arrive by air.',
    'So we asked one question about every building in the city:',
  ], M, 7.0, 4.3, 2.9, { color: C.background1, fontSize: 10 });
  pullQuote(s, '“How does it help people stay warm, fed, safe and happy here?”', M, 9.35, 4.3, 0.9, C.accent1, { fontSize: 17 });
  const sx = 5.3;
  [['−45 °C', 'winter temperatures'], ['2 months', 'of polar night, and two of midnight sun'], ['120 km/h', 'blizzards'], ['≈4×', 'faster warming in the Arctic than the world since 1979 [1]']]
    .forEach(([n, l], i) => stat(s, n, l, sx, 6.95 + i * 0.92, W - M - sx, C.accent1, { size: 24, labelColor: C.background2, lh: 0.4 }));
  caption(s, 'A blizzard sweeps past the snowbreak pines towards the Ice-Proof Wind Farm on the windy northern edge.', sx, 10.65, W - M - sx, 0.45, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 9 · Vision and mission
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'The City');
  picture(s, 'renders/principles.jpg', 0, 0, W, 2.9);
  caption(s, 'Downtown in the low sun, with Aurora 81, the food plant silos and Mount Aurora behind.', M, 2.95, CW, 0.22);
  kicker(s, 'The vision', M, 3.3, C.accent6);
  title(s, 'Our Vision & Mission', M, 3.57, CW, 0.7, { fontSize: 34 });
  pullQuote(s, 'Our mission: a zero-carbon city where 45,000 people stay warm, fed, safe and happy through the polar night, without harming the tundra.', M, 4.2, CW, 0.85, C.accent6, { fontSize: 15.5, noRule: true });
  text(s, 'THE PEOPLE AND PLACES AT RISK', { x: M, y: 5.45, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const who = [
    ['45,000 residents', 'Families, children, older people and shift workers face −45 °C, two months without sun and 120 km/h blizzards every winter.'],
    ['4 million Arctic people', 'About 4 million people live in the Arctic today [3]. By 2050, nearly 4 million people may live where thawing ground can crack homes, roads and pipes [2].'],
    ['Supply chains', 'In deep winter, food, medicine and spare parts can only arrive by air, so one long storm can cut a city off.'],
    ['The tundra and its wildlife', 'Arctic foxes, hares, ptarmigans and reindeer depend on fragile, frozen land that a careless city would pollute, light up or melt.'],
  ];
  const cw2 = (CW - 0.2) / 2;
  who.forEach(([t, d], i) => {
    const x = M + (i % 2) * (cw2 + 0.2);
    const y = 5.75 + Math.floor(i / 2) * 1.22;
    card(s, x, y, cw2, 1.12, C.background2);
    text(s, t, { x: x + 0.15, y: y + 0.1, w: cw2 - 0.3, h: 0.24, fontFace: HEAD, fontSize: 12, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.15, y: y + 0.38, w: cw2 - 0.3, h: 0.7, fontSize: 9, lineSpacingMultiple: 1.04 });
  });
  text(s, 'FIVE DESIGN PRINCIPLES', { x: M, y: 8.3, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const pr = [
    ['Heat is life', 'one heating loop, fed by fusion and geothermal heat, warms every building; insulated piles keep the permafrost frozen.'],
    ['Zero carbon', 'no fossil fuel burns anywhere; power comes from fusion, wind, sun and geothermal heat.'],
    ['Closed loops', 'about 95% of water is recycled and rubbish is reused instead of thrown away.'],
    ['Compact and car-light', 'daily needs within a 10-minute walk; the few cars are electric.'],
    ['Resilient and healthy', 'shelters for 30 days, and light, parks, culture and a spa for the polar night.'],
  ];
  pr.forEach(([t, d], i) => {
    const y = 8.62 + i * 0.47;
    text(s, `0${i + 1}`, { x: M, y: y - 0.04, w: 0.5, h: 0.36, fontFace: HEAD, fontSize: 16, bold: true, color: C.accent6 });
    text(s, [
      { text: `${t}: `, options: { bold: true, color: C.text1 } },
      { text: d, options: { color: C.text2 } },
    ], { x: M + 0.55, y: y + 0.01, w: CW - 0.55, h: 0.44, fontSize: 10, lineSpacingMultiple: 1.04 });
  });
}

// ---------------------------------------------------------------------------
// 10–11 · Downtown (spread)
// ---------------------------------------------------------------------------
{
  const L = page('DARK', 'The City');
  bleed(L, 'renders/liberty_dusk_L.jpg');
  shade(L, 'bottom', 0, 5.6, W, H - 5.6);
  kicker(L, 'Downtown', M, 7.55, C.accent1, { textColor: C.background1 });
  title(L, 'Nine Blocks,\nOne Short Walk', M, 7.83, CW, 1.5, { fontSize: 44, color: C.background1 });
  standfirst(L, 'Shops, schools, healthcare and homes within a short walk of each other, around the Aurora Roundabout.', M, 9.3, CW, 0.65, { color: C.background2, fontSize: 14 });
  text(L, 'Downtown is laid out in nine blocks around the Aurora Roundabout and the Founding Mayor Monument. The metro interchange lies under Liberty Mall, the tree-lined promenade through the four central blocks, which hosts festivals, markets and parades.', {
    x: M, y: 10.05, w: CW, h: 0.95, fontSize: 10, color: C.background1, lineSpacingMultiple: 1.1,
  });

  const R = page('DARK', 'The City');
  bleed(R, 'renders/liberty_dusk_R.jpg');
  shade(R, 'bottom', 0, 9.0, W, H - 9.0);
  caption(R, 'Liberty Mall at dusk, looking north to the Founding Mayor Monument. Its granite plaza is warmed from below by the heating loop and never ices, and twin lanterns line the way.', W - M - 4.4, 10.25, 4.4, 0.6, { color: C.background1, align: 'right' });
}

// ---------------------------------------------------------------------------
// 12 · The whole city plan, on one page
// ---------------------------------------------------------------------------
{
  const zones = [
    ['Downtown', 'Nine blocks around the Aurora Roundabout and the Founding Mayor Monument, with the hospital, schools, shops and the metro interchange.', C.text1],
    ['North', 'The windy north holds the Northern Renewable Park, the energy hub, the Polar Rescue and Resilience Station and the airport.', C.accent6],
    ['West', 'The air base and garrison, behind a belt of trees that screens the eco-homes.', C.text2],
    ['East', 'Greenhouses, the snow stadium, the fusion station and the Snow-to-Food plant, linked by pipe bridges and heat mains.', C.accent4],
    ['South', 'Framed by Liberty Mall, Mount Aurora rises with its geothermal spa resort inside.', C.accent5],
  ];
  const s = page('ICE', 'The City');
  kicker(s, 'The map', M, 0.55, C.accent6);
  title(s, 'The Whole City Plan', M, 0.83, CW, 0.75, { fontSize: 36 });
  const file = 'plans/01_city_master_plan.png';
  const ph = W * ratio(file);
  s.addImage({ path: img(file), x: 0, y: 1.75, w: W, h: ph, objectName: 'master-plan' });
  caption(s, 'Aurora Haven – City Master Plan. North is up; one unit is one metre. Drawn from the 3D model; the numbers are the 35 places listed on page 34.', M, 1.8 + ph, CW, 0.25);
  zones.forEach(([t, d, col], i) => {
    const x = M + (i % 2) * (COL2 + GUT);
    const y = 2.35 + ph + Math.floor(i / 2) * 0.95;
    kicker(s, t, x, y, col, { w: COL2 - 0.2 });
    text(s, d, { x, y: y + 0.28, w: COL2, h: 0.62, fontSize: 9.5, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 13 · The nine blocks
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'The City');
  pageHead(s, 'Downtown', 'The Nine Blocks', C.accent6);
  picture(s, 'renders/downtown_aerial.jpg', 0, 1.65, W, 4.6);
  caption(s, 'Downtown from the south-east. The map below follows the city plan, with north at the top.', M, 6.32, CW, 0.25);
  const blocks = [
    ['Polaris Quarter', 'Aurora Core – AI Control Tower · Aurora Haven Police Headquarters · Polaris Green Office Tower'],
    ['Knowledge Quarter', 'Arctic University – Main Hall · Aurora Public Library'],
    ['Financial District', 'Arctic Stock Exchange · Aurora Green Finance Hall · Snowline Courthouse · Aurora Business Hotel'],
    ['West Market Street', 'West Market Fire & Ambulance Station · Aurora Night Market Hall · Polar Pharmacy'],
    ['Civic Core & Liberty Mall', 'Founding Mayor Monument · Civic Center · Snowflake General Hospital · Northern Lights School · Igloo Fresh · Aurora Cinema · Metro'],
    ['East Gallery Avenue', 'Aurora Glacier Mall & Crystal Atrium · Snow Lantern Primary School · Northern Lights Music Hall'],
    ['Snowpine Residences', 'Family homes · Pinecone Kindergarten · Snowpine Senior Care Home'],
    ['Mount Aurora Approach', 'Mount Aurora Guesthouse · Southside Police & Mountain Rescue Post · spa shuttle street'],
    ['Aurora 81 District', 'Aurora 81 – Polar Landmark Tower · Aurora 81 Residences (Twin Towers)'],
  ];
  const gy = 6.75;
  const gap = 0.1;
  const bw = (CW - 2 * gap) / 3;
  const bh = 1.33;
  blocks.forEach(([t, d], i) => {
    const x = M + (i % 3) * (bw + gap);
    const y = gy + Math.floor(i / 3) * (bh + gap);
    const heart = i === 4;
    card(s, x, y, bw, bh, heart ? C.text1 : C.background2);
    text(s, t, { x: x + 0.13, y: y + 0.12, w: bw - 0.26, h: 0.24, fontSize: 10.5, bold: true, color: heart ? C.accent1 : C.accent6 });
    text(s, d, { x: x + 0.13, y: y + 0.42, w: bw - 0.26, h: bh - 0.5, fontSize: 10, color: heart ? C.background1 : C.text1, lineSpacingMultiple: 1.05 });
  });
}

// ---------------------------------------------------------------------------
// 14–16 · Fusion Power Station
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Signature Districts' });
  const L = page('DARK', 'Signature Districts');
  bleed(L, 'renders/fusion_spread_L.jpg');
  shade(L, 'top', 0, 0, W, 4.6);
  marker(L, '1', M, 0.6, 0.8, C.accent3, { size: 28, ring: C.background1 });
  kicker(L, 'Signature district 1 · Fusion Power Station', M, 1.65, C.accent3, { textColor: C.background1 });
  title(L, "The City's Own Sun", M, 1.93, CW, 0.95, { fontSize: 50, color: C.background1 });
  standfirst(L, 'Our big idea: put a fusion reactor inside the city itself, so one machine lights every home, heats every street and melts the snow we drink.', M, 2.95, 5.6, 1.0, { color: C.background1, fontSize: 15 });
  inBrief(L, M - 0.2, 8.25, CW + 0.2, C.accent3, [
    ['The problem', 'Two months of polar night at −45 °C. The city needs heat and power that never stop, even when supply flights cannot land.'],
    ['The idea', 'A compact tokamak inside the city burns about 170 g of fuel a day and gives 300 MW of electricity and 450 MW of heat.'],
    ['What’s new', 'No fusion plant sells power yet (page 13). We build a whole city around one, with fuel from snowmelt and tritium bred on site.'],
    ['The impact', 'No fuel to ship in and no CO₂. If anything fails, the plasma simply goes out, so it cannot melt down.'],
  ]);

  const R = page('DARK', 'Signature Districts');
  bleed(R, 'renders/fusion_spread_R.jpg');
  const bw = (CW - 0.2) / 2;
  sideBox(R, M, 0.6, bw, 2.75, 'Where the world is today', 'Fusion is still being tested. The compact SPARC tokamak aims for its first plasma around 2027 [5], and ITER in France plans to burn deuterium–tritium fuel in 2039 [4]. No fusion plant sells power yet: Aurora Haven is designed for the day one does.', { color: C.accent3, fit: true, size: 9.5 });
  sideBox(R, M + bw + 0.2, 0.6, bw, 2.75, 'Reality check', 'A day at 800 MW needs about 0.2 kg of fuel, close to our 170 g design. Breeding tritium at scale is unproven [11] and ITER costs €18–22 billion [12], so the city starts on wind, sun and geothermal power (page 25).', { color: C.accent3, fit: true, size: 9.5, figure: '≈ 0.2 kg a day' });
  shade(R, 'bottom', 0, 9.4, W, H - 9.4);
  caption(R, 'The Fusion Core, a compact D-T tokamak, glowing violet under the northern lights.', W - M - 4.0, 10.45, 4.0, 0.4, { color: C.background1, align: 'right' });
}
{
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Fusion Power Station · How it works', 'Five Stages, One Sun', C.accent3);
  const ph = CW * ratio('plans/02_fusion_power_station_plan.png');
  s.addImage({ path: img('plans/02_fusion_power_station_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'fusion-plan' });
  caption(s, 'Fusion Power Station – District Plan. Signature district 1: a compact D-T tokamak.', M, 1.7 + ph + 0.05, CW, 0.25);
  const ly = Math.max(5.45, 1.7 + ph + 0.45);
  const rowH = Math.min(0.9, (10.95 - ly) / 6);
  stages(s, [
    { n: '1', name: 'Heavy-water separation', text: 'Takes deuterium from the deuterium-rich water left by the food plant’s electrolysers and purifies it to 99.8% heavy water.' },
    { n: '2', name: 'Lithium blanket & tritium fuel cycle', text: 'Breeds the tritium the reactor burns inside sealed, leak-monitored loops, so none is imported. Recovered helium cools MRI scanners.' },
    { n: '3', name: 'Fusion core: compact D-T tokamak', text: 'Superconducting magnets hold a 150-million-degree plasma. If anything fails, the plasma simply goes out: it cannot melt down.' },
    { n: '4', name: 'Power conversion & heat export', text: 'Turbines driven by CO₂ sealed in a closed loop make about 300 MW of electricity and send about 450 MW of heat to the city.' },
    { n: '5', name: 'Plasma waste converter', text: 'Torches hotter than 5,000 °C turn about 20 tonnes of rubbish a day into hydrogen and CO₂ for the food plant, metals and paving blocks.' },
    { n: 'C', name: 'Control & visitor centre', text: 'Operators and an AI digital twin can stop the plasma in milliseconds; a public gallery faces the reactor.', color: C.text1 },
  ], M, ly, 4.55, rowH, C.accent3);
  const sx = 5.55;
  const sw = W - M - sx;
  sideBox(s, sx, ly - 0.05, sw, 10.9 - ly, 'Why it’s green', leadList([
    ['94% used.', 'Of 800 MW of heat, 300 MW becomes power and 450 MW warms the city.'],
    ['No CO₂.', 'Nothing burns, and the turbines’ CO₂ never leaves its loop.'],
    ['Fuel from snow.', 'Deuterium comes from meltwater: no mines, no tankers.'],
    ['Rubbish reused.', 'The converter’s hydrogen and CO₂ feed the food plant.'],
    ['Little waste.', 'Its radioactive waste is mostly short-lived, under 100 years, unlike spent fission fuel [20].'],
  ], { lead: C.accent3, gap: 4 }), { light: true, color: C.accent3, size: 8.5 });
}

// ---------------------------------------------------------------------------
// 17–18 · Snow-to-Food & Water Plant
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Signature Districts');
  bleed(s, 'renders/food.jpg');
  shade(s, 'topStrong', 0, 0, W, 5.6);
  shade(s, 'bottom', 0, 7.4, W, H - 7.4);
  marker(s, '2', M, 0.6, 0.8, C.accent4, { size: 28, ring: C.background1 });
  kicker(s, 'Signature district 2 · Snow-to-Food & Water Plant', M, 1.65, C.accent1, { textColor: C.background1 });
  title(s, 'Bread and Water from Snow and Air', M, 1.93, CW, 1.6, { fontSize: 44, color: C.background1 });
  standfirst(s, 'Our big idea: a factory that bakes bread and pours drinking water out of snow and air, so a city with no farmland can feed itself.', M, 3.55, 6.2, 0.8, { color: C.background1, fontSize: 14.5 });
  caption(s, 'The six Bioreactor Silos in the low sun.', M, 7.95, CW, 0.25, { color: C.background2 });
  inBrief(s, M - 0.2, 8.3, CW + 0.4, C.accent1, [
    ['The problem', 'Almost nothing grows at −45 °C, and in deep winter food can only arrive by air.'],
    ['The idea', 'Spare fusion heat melts 3,000 tonnes of snow a day for drinking water; microbes turn water and CO₂ into about 2.5 tonnes of protein a day.'],
    ['What’s new', 'Each step exists today, but apart (page 16). We link them in one plant that also cools the fusion station.'],
    ['The impact', 'Bread, noodles and drinks made in the city all year, with no farmland and fewer supply flights.'],
  ]);
}
{
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Snow-to-Food & Water Plant · How it works', 'Six Stages from Snow to Supper', C.accent4);
  const ph = CW * ratio('plans/03_snow_to_food_water_plant_plan.png');
  s.addImage({ path: img('plans/03_snow_to_food_water_plant_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'food-plan' });
  caption(s, 'Snow-to-Food & Water Plant – District Plan. All drinking water and about half of the city’s protein, from snow and air.', M, 1.7 + ph + 0.05, CW, 0.25);
  const ly = Math.max(5.8, 1.7 + ph + 0.5);
  const rowH = Math.min(0.86, (10.95 - ly) / 6);
  stages(s, [
    { n: '1', name: 'Snow harvest & melt hall', text: 'Electric harvesters gather wind-packed snow upwind of the city; about 14 MW of spare fusion heat melts it.' },
    { n: '2', name: 'Drinking-water & mineral works', text: 'Membranes and UV light remove every germ, calcite adds calcium and magnesium, and sensors test the water every five minutes.' },
    { n: '3', name: 'Electrolysis, air capture & green ammonia', text: 'About 5 tonnes of hydrogen a day; the oxygen goes to the hospital and the waste converter.' },
    { n: '4', name: 'Carbon-fixation chemistry', text: 'A copper catalyst makes methanol, and enzymes build it into starch about eight times faster than a maize field.' },
    { n: '5', name: 'Bioreactor silos', text: 'Hydrogen-eating bacteria make protein flour; yeasts and algae make oils and vitamins, 24 hours a day.' },
    { n: '6', name: 'Food kitchen, bottling & distribution', text: 'Bread, noodles, protein mince and dairy-style drinks, delivered overnight in heated electric vans.' },
  ], M, ly, 4.55, rowH, C.accent4);
  const sx = 5.55;
  const sw = W - M - sx;
  const half = (10.9 - ly - 0.15) / 2;
  sideBox(s, sx, ly - 0.05, sw, half, 'Where the world is today', 'Each step exists, but apart: Solein protein from Finland [6], starch made from CO₂ in a lab [7] and air capture in Iceland [8]. We link them in one plant.', { light: true, color: C.accent4, size: 9.5 });
  sideBox(s, sx, ly + half + 0.1, sw, half, 'Reality check', 'Melting 3,000 tonnes of snow a day takes about 13 MW, inside the 14 MW of spare fusion heat. Starch from CO₂ is still lab-scale [7].', { light: true, color: C.accent4, size: 9.5, figure: '≈ 13 MW', figureSize: 20 });
}

// ---------------------------------------------------------------------------
// 19–22 · Mount Aurora Geothermal Spa Resort
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Signature Districts');
  bleed(s, 'renders/spa.jpg');
  shade(s, 'top', 0, 0, W, 4.8);
  shade(s, 'bottom', 0, 7.6, W, H - 7.6);
  marker(s, '3', M, 0.6, 0.8, C.accent5, { size: 28, ring: C.background1 });
  kicker(s, 'Signature district 3 · Mount Aurora', M, 1.65, C.accent5, { textColor: C.background1 });
  title(s, 'A Snow Mountain\nYou Can Walk Inside', M, 1.93, CW, 1.45, { fontSize: 38, color: C.background1 });
  standfirst(s, 'Our big idea: the mountain is the building. Inside a 35-metre snow peak shaped like Nepal’s Ama Dablam, a whole leisure world stays at 28 °C all winter.', M, 3.5, 6.4, 0.8, { color: C.background1, fontSize: 14 });
  caption(s, 'The four spa levels step out of the north face, crowned by the glass Aurora Eye.', M, 7.95, CW, 0.25, { color: C.background2 });
  inBrief(s, M - 0.2, 8.3, CW + 0.4, C.accent5, [
    ['The problem', 'Months of darkness bring winter blues, and the city needs a warm place to meet and to shelter in a disaster.'],
    ['The idea', 'The mountain is the building: a 35-metre snow peak wraps four spa levels, kept at 28 °C by a geothermal spring.'],
    ['What’s new', 'Spas like Iceland’s Blue Lagoon use geothermal water (page 19). We turn a whole snow peak into an insulated leisure world.'],
    ['The impact', 'Rest and health for residents, tourists and income for the city, and shelter for up to 1,000 people.'],
  ]);
}
{
  const L = page('DARK', 'Signature Districts');
  bleed(L, 'renders/grotto_L.jpg');
  shade(L, 'top', 0, 0, W, 4.4);
  kicker(L, 'Mount Aurora · Level 1', M, 0.6, C.accent5, { textColor: C.background1 });
  title(L, 'Inside the Mountain', M, 0.88, CW, 0.9, { fontSize: 46, color: C.background1 });
  text(L, 'The ground level and arrival floor of the spa: a welcome hall, two changing suites, a 7 × 13 m geothermal Mineral Lake grotto and an onsen garden with hot, warm and glacier-cold pools.', {
    x: M, y: 1.95, w: 4.6, h: 1.2, fontFace: HEAD, italic: true, fontSize: 14, color: C.background1, lineSpacingMultiple: 1.08,
  });
  text(L, 'A 40 °C silica- and bicarbonate-rich spring rises from the geothermal field into the lake, spills over a basalt wall and flows on to the outdoor Aurora Lagoon.', {
    x: M, y: 3.2, w: 4.6, h: 0.8, fontSize: 10, color: C.background2, lineSpacingMultiple: 1.08,
  });

  const R = page('DARK', 'Signature Districts');
  bleed(R, 'renders/grotto_R.jpg');
  const gw = (CW - 0.2) / 2;
  sideBox(R, M, 0.6, gw, 2.75, 'Where the world is today', 'Iceland’s Blue Lagoon bathes visitors in 37–39 °C water from a geothermal power plant [9], and Switzerland’s Therme Vals is cut into a hillside [10]. Mount Aurora goes further: the whole snow peak becomes the building.', { color: C.accent5, fit: true, size: 9.5 });
  sideBox(R, M + gw + 0.2, 0.6, gw, 2.75, 'Reality check', 'An insulated rock shell holds 28 °C inside at −45 °C outside. It needs a hot spring below, to be confirmed by drilling, and thermosyphons like the Trans-Alaska Pipeline’s [14] keep the ground frozen.', { color: C.accent5, fit: true, size: 9.5, figure: '73 °C apart' });
  shade(R, 'bottom', 0, 9.6, W, H - 9.6);
  caption(R, 'The Mineral Lake Grotto: a larch footbridge crosses the 7 × 13 m lake, and stone lanterns light the shore below the basalt wall.', W - M - 4.4, 10.3, 4.4, 0.6, { color: C.background1, align: 'right' });
}
{
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Mount Aurora · Level by level', 'Four Floors of Warmth', C.accent5);
  const ph = CW * ratio('plans/04_mount_aurora_spa_resort_plan.png');
  s.addImage({ path: img('plans/04_mount_aurora_spa_resort_plan.png'), x: M, y: 1.7, w: CW, h: ph, objectName: 'spa-plan' });
  caption(s, 'Mount Aurora Geothermal Spa Resort – Level Plans. The glass lift links all four levels.', M, 1.7 + ph + 0.05, CW, 0.25);
  const levels = [
    ['Level 1 · 0 m', 'Welcome Hall, Mineral Lake Grotto & Onsen Garden', 'A 40 °C silica-rich spring rises into a 7 × 13 m Mineral Lake; hot, warm and glacier-cold pools boost circulation.'],
    ['Level 2 · 4.5 m', 'Volcanic Mud Terraces', 'An 8 × 10 m mud field held at 39 °C. The mud is filtered and UV-sterilised every night and reused for months.'],
    ['Level 3 · 9 m', 'Treatment Suites & Himalayan Salt Sauna', 'Hot-stone massage, arctic kelp wraps and a 75 °C pink salt sauna heated by the geothermal loop.'],
    ['Level 4 · 13.5 m', 'Summit Sanctuary & Aurora Eye', 'A 35 °C float pool, a meditation circle and a heated glass bubble for watching the northern lights.'],
  ];
  const gy = Math.max(5.95, 1.7 + ph + 0.4);
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
  const ty = gy + 3.35;
  card(s, M, ty - 0.05, CW, 0.85, C.text1);
  text(s, [
    { text: 'ALSO A SHELTER  ', options: { bold: true, charSpacing: 2, color: C.accent5 } },
    { text: 'In a disaster, the mountain becomes a warm refuge for up to 1,000 people: geothermal heat, mineral water and the food reserve keep it running even if the city’s power fails.', options: { color: C.background1 } },
  ], { x: M + 0.15, y: ty, w: CW - 0.3, h: 0.75, fontSize: 9.5, valign: 'middle' });
  text(s, 'Route through the spa: North Portal → grotto → Welcome Hall → changing suites → Mineral Lake & Onsen Garden → glass lift → mud terraces → treatments & salt sauna → Summit Sanctuary and the Aurora Eye.', { x: M, y: ty + 1.0, w: CW, h: 0.55, fontSize: 9, italic: true, color: C.text2 });
}

// ---------------------------------------------------------------------------
// 23 · Built by us: the team’s Eco-Polis model and how to explore it
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Signature Districts');
  pageHead(s, 'Our Eco-Polis model', 'Built by Us', C.accent6);
  standfirst(s, 'Before any picture in this magazine, we built Aurora Haven ourselves in the Eco-Polis Builder: 241 named places, each with its own purpose and special features.', M, 1.6, CW, 0.6, { fontSize: 12.5 });
  const ow = CW;
  const oh = ow * ratio('ecopolis/overview.jpg');
  picture(s, 'ecopolis/overview.jpg', M, 2.3, ow, oh);
  caption(s, 'The whole city in our Eco-Polis model.', M, 2.33 + oh, CW, 0.22);
  const shots = [['ecopolis/fusion.jpg', 'Fusion Power Station'], ['ecopolis/food.jpg', 'Snow-to-Food & Water Plant'], ['ecopolis/mount.jpg', 'Mount Aurora'], ['ecopolis/downtown.jpg', 'Downtown']];
  const tw = (CW - 0.3) / 4;
  const ty = 2.65 + oh;
  shots.forEach(([f, c], i) => {
    picture(s, f, M + i * (tw + 0.1), ty, tw, tw * 0.67);
    caption(s, c, M + i * (tw + 0.1), ty + tw * 0.67 + 0.03, tw, 0.22);
  });
  // Two QR codes and a short guide to opening the model.
  const qy = ty + tw * 0.67 + 0.45;
  const q = 1.25;
  const codes = [['ui/qr_map_file.png', '1 · Download our map', 'Aurora_Haven.json'], ['ui/qr_ecopolis.png', '2 · Open Eco-Polis', 'ecopolis3d.netlify.app']];
  codes.forEach(([f, t, d], i) => {
    const x = M + i * (q + 0.3);
    s.addImage({ path: img(f), x, y: qy, w: q, h: q, objectName: name('qr') });
    text(s, t, { x: x - 0.1, y: qy + q + 0.05, w: q + 0.2, h: 0.22, fontSize: 9, bold: true, align: 'center' });
    text(s, d, { x: x - 0.15, y: qy + q + 0.27, w: q + 0.3, h: 0.2, fontSize: 7.5, color: C.text2, align: 'center' });
  });
  const gx = M + 2 * (q + 0.3) + 0.1;
  sideBox(s, gx, qy - 0.05, W - M - gx, 10.9 - qy + 0.05, 'Explore our 3D city', leadList([
    ['1.', 'Scan the first code to download our map file.'],
    ['2.', 'Scan the second code to open the Eco-Polis Builder.'],
    ['3.', 'Click the Load button (folder icon) and choose Aurora_Haven.json.'],
    ['4.', 'Click Lock (View), then Full Screen.'],
    ['5.', 'Drag to turn, scroll to zoom, and click a building to read about it.'],
  ], { lead: C.accent6, gap: 5 }), { light: true, color: C.accent6, size: 10 });
}

// ---------------------------------------------------------------------------
// 24 · Three districts, one loop
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Signature Districts');
  pageHead(s, 'The big idea', 'Three Districts, One Loop', C.accent1, { dark: true });
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
// 25 · A livable city
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Living in Aurora Haven' });
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Everyday life', 'A Livable City Every Day', C.accent6);
  picture(s, 'renders/houses_dusk.jpg', 0, 1.65, W, 4.0);
  caption(s, 'Snowpine Residences at dusk. Sidewalks warmed by district-heating return water stay snow-free, and spruces shelter the courtyards from the wind.', M, 5.72, CW, 0.4);
  const cats = [
    ['Homes', 'Family houses in Snowpine Residences, the western eco-homes, towers such as the Aurora 81 Residences and Ice Crystal Apartments, co-living, student and senior housing.'],
    ['Learning', 'Three kindergartens, Snow Lantern Primary School, the Northern Lights School for ages 6 to 18, and Arctic University.'],
    ['Health', 'Snowflake General Hospital with about 250 beds and a 24-hour emergency department, a campus clinic and a 24-hour pharmacy.'],
    ['Shopping', 'Igloo Fresh Supermarket, Tundra Grocery, the night and fish markets and the Aurora Glacier Mall with its indoor atrium park.'],
    ['Culture and parks', 'Aurora Cinema, a music hall, a library open 24 hours in the polar night, the Snow Stadium and parks with heated benches.'],
  ];
  cats.forEach(([t, d], i) => {
    const y = 6.3 + i * 0.93;
    kicker(s, t, M, y, C.accent6, { w: COL2 - 0.2 });
    text(s, d, { x: M, y: y + 0.27, w: COL2 + 0.15, h: 0.65, fontSize: 9.5, lineSpacingMultiple: 1.05 });
  });
  const rx = M + COL2 + GUT + 0.15;
  const rw = W - M - rx;
  picture(s, 'renders/approach_dusk.jpg', rx, 6.3, rw, 2.25);
  caption(s, 'The Mount Aurora Approach: low buildings keep the summit in view, and warm, low-glare lanterns do not hide the aurora.', rx, 8.6, rw, 0.6);
  [['250', 'hospital beds'], ['5,000', 'students at Arctic University']]
    .forEach(([n, l], i) => stat(s, n, l, rx + (i % 2) * (rw / 2), 9.3 + Math.floor(i / 2) * 0.82, rw / 2 - 0.1, C.accent6, { size: 20, lh: 0.32, lsize: 8.5 }));
}

// ---------------------------------------------------------------------------
// 26 · Homes for the polar night (housing)
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  picture(s, 'renders/homes.jpg', 0, 0, W, 4.1);
  caption(s, 'The western eco-homes at dusk, with the Ice-Proof Wind Farm and the air base behind.', M, 4.15, CW, 0.25);
  kicker(s, 'Housing', M, 4.55, C.accent6);
  title(s, 'Homes for the Polar Night', M, 4.82, CW, 0.7, { fontSize: 36 });
  standfirst(s, 'From passive eco-homes to towers with sky gardens, every home is built to stay warm, bright and safe at −45 °C, without thawing the ground beneath it.', M, 5.55, CW, 0.6, { fontSize: 12.5 });

  text(s, 'HOW A HOME BEATS THE COLD', { x: M, y: 6.3, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const ideas = [
    ['Insulated piles', 'Homes stand on insulated piles above a ventilated air gap, so their warmth never thaws the permafrost.'],
    ['Passive-house shell', 'Thick walls, triple glazing and an airtight shell: an eco-home needs about 80% less heat than an ordinary house.'],
    ['Heat-recovery air', 'Fresh air is warmed by the stale air going out, saving about 80% of the heat that would escape.'],
    ['Winter-garden balconies', 'Glass-enclosed balconies stay usable at −45 °C and act as a warm buffer for the wall behind.'],
    ['Snow-shedding roofs', 'Steep, smooth roofs shed heavy snow by themselves, so they never overload or need shovelling.'],
    ['Light in the dark', 'Light tubes bring daylight deep inside, and dawn-simulating lamps wake families in the polar night.'],
  ];
  const iw = (CW - 0.3) / 3;
  ideas.forEach(([t, d], i) => {
    const x = M + (i % 3) * (iw + 0.15);
    const y = 6.6 + Math.floor(i / 3) * 1.27;
    card(s, x, y, iw, 1.17, C.background2);
    text(s, t, { x: x + 0.12, y: y + 0.1, w: iw - 0.24, h: 0.24, fontSize: 10, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: y + 0.37, w: iw - 0.24, h: 0.76, fontSize: 8.5, lineSpacingMultiple: 1.03 });
  });

  text(s, 'A HOME FOR EVERYONE', { x: M, y: 9.2, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const homes = [
    ['600', 'apartments in the Aurora 81 Residences'], ['350', 'apartments in Ice Crystal Apartments'], ['150', 'older residents in Golden Aurora Senior Residences'],
    ['120', 'rooms in the Student Residence Hall'], ['12', 'residents in the Snowpine Senior Care Home'],
  ];
  const hw = CW / 5;
  homes.forEach(([n, l], i) => stat(s, n, l, M + i * hw, 9.45, hw - 0.12, C.accent6, { size: 20, lh: 0.55, lsize: 8.5 }));
  text(s, 'Plus family houses in Snowpine Residences and the Frostline Co-Living Tower for newcomers, young workers and visiting researchers.', { x: M, y: 10.6, w: CW, h: 0.3, fontSize: 8.5, italic: true, color: C.text2 });
}

// ---------------------------------------------------------------------------
// 27 · Clean energy: wind and sun start the fusion station, then stand by
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Clean energy, day and polar night', 'Energy for the Polar Night', C.accent6);
  picture(s, 'renders/renewable.jpg', 0, 1.65, W, 4.6);
  caption(s, 'Northern Renewable Park in the low sun: the Ice-Proof Wind Farm behind the Bifacial Solar Farm.', M, 6.3, CW, 0.25);
  standfirst(s, 'Wind and sun start the city’s own sun. Once fusion is running, they step back and stand guard.', M, 6.62, CW, 0.45, { fontSize: 13.5 });
  const steps = [
    ['1 · Start-up', '200 MWh', 'The Ice-Proof Wind Farm (60 MW) and the Bifacial Solar Farm fill the battery bank, which gives the big burst of power that starts the reactor’s magnets and heaters. The panels also catch light off the snow: tests in snowy Canada found about +19% [17].', C.accent6],
    ['2 · Running', '300 + 450 MW', 'Once the plasma burns, the fusion station keeps itself going and gives the whole city electricity and heat, day and polar night.', C.accent3],
    ['3 · Backup', '12 h', 'If the reactor stops for repair, wind, sun, the batteries, the 24-hour geothermal plant and the 12-hour heat tank take over, so no home goes cold.', C.accent1],
  ];
  const sw = (CW - 0.6) / 3;
  steps.forEach(([t, n, d, col], i) => {
    const x = M + i * (sw + 0.3);
    const cy = 7.25;
    card(s, x, cy, sw, 3.6, C.background2);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: sw, h: 0.38, fill: { color: col }, line: { color: col, width: 0 }, objectName: name('step-head') });
    text(s, t.toUpperCase(), { x: x + 0.14, y: cy, w: sw - 0.28, h: 0.38, fontSize: 9.5, bold: true, charSpacing: 2, color: C.background1, valign: 'middle' });
    text(s, n, { x: x + 0.14, y: cy + 0.5, w: sw - 0.28, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: col });
    text(s, d, { x: x + 0.14, y: cy + 1.1, w: sw - 0.28, h: 2.4, fontSize: 10.5, lineSpacingMultiple: 1.08 });
    if (i < 2) arrow(s, x + sw + 0.03, cy + 1.8, x + sw + 0.27, cy + 1.8, C.text2, 2.5);
  });
}

// ---------------------------------------------------------------------------
// 28 · Water and waste
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Water and waste', 'Nothing Is Wasted', C.accent4);
  picture(s, 'renders/water.jpg', 0, 1.65, W, 4.0);
  caption(s, 'The six-stage Water Recycling Line in the Northern Renewable Park, with the wind farm behind.', M, 5.7, CW, 0.25);
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
  [['95%', 'of water is used again'], ['30 tonnes', 'of materials sorted every day'], ['0', 'rubbish sent to landfill']]
    .forEach(([n, l], i) => stat(s, n, l, M + i * (CW / 3), 9.75, CW / 3 - 0.15, C.accent4, { size: 26, lh: 0.4 }));
}

// ---------------------------------------------------------------------------
// 29 · Urban eco-system
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  picture(s, 'renders/ecosystem.jpg', 0, 0, W, 4.3);
  caption(s, 'The eco-tour reindeer herd grazing on the tundra by the Snow Garden Park, with the foothill pines and Mount Aurora behind.', M, 4.35, CW, 0.25);
  kicker(s, 'Urban eco-system', M, 4.75, C.accent1, { textColor: C.accent4 });
  title(s, 'Wild Neighbours', M, 5.02, CW, 0.7, { fontSize: 36 });
  standfirst(s, 'Aurora Haven is built to share the tundra: animals can move through the city, plants work as snow fences, and farmed life closes the food loop.', M, 5.75, CW, 0.6, { fontSize: 12.5 });
  const col = (x, head, color, items) => {
    text(s, head, { x, y: 6.48, w: COL2, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color });
    text(s, items.flatMap(([t, d], i) => [
      { text: `${t}. `, options: { bold: true, color: C.text1 } },
      { text: d, options: { color: C.text1, breakLine: i < items.length - 1, paraSpaceAfter: 5 } },
    ]), { x, y: 6.78, w: COL2, h: 3.05, fontSize: 10.5, lineSpacingMultiple: 1.08 });
  };
  col(M, 'ANIMALS', C.accent4, [
    ['Wildlife corridors', 'Snowy tree belts on the east and west edges link the tundra to the parks for foxes, hares and ptarmigans; the roads beside them have dim lights and underpasses.'],
    ['Fences with gaps', 'Open rails let drifting snow blow through, and gaps at ground level let foxes and hares pass.'],
    ['Reindeer', 'Herders who follow Sámi traditions care for the eco-tour herd; rides are short, and GPS collars track the animals on the tundra.'],
    ['Polar bears', 'Fibre-optic sensors in the air base fence call a wildlife team when a bear comes close.'],
  ]);
  col(M + COL2 + GUT, 'PLANTS AND FARMED LIFE', C.accent1, [
    ['Living snow fences', 'Belts of spruce and pine trap drifting snow before it reaches the streets; the clean snow goes to the food plant.'],
    ['Green stepping stones', 'Snow lindens on Liberty Mall and heated planters on the Aurora 81 Sky Garden give birds stepping stones across the city.'],
    ['Aquaponics', 'In the Evergreen Aquaponics Dome, Arctic char and trout feed lettuce, herbs and strawberries; the loop loses under 2% of its water a day.'],
    ['Shelter and science', 'Rock gardens shelter ptarmigans and hares, and nest-box cameras let schoolchildren count them.'],
  ]);
  card(s, M, 9.95, CW, 0.95, C.background2);
  text(s, [
    { text: 'HOW THEY SURVIVE  ', options: { bold: true, charSpacing: 2, color: C.accent4 } },
    { text: 'Arctic foxes grow a deep, pale winter coat that blends into the snow and keeps them warm down to about −50 °C [15]. The city helps them with cover, safe crossings and dark nights: outdoor lights switch on only when something moves.', options: { color: C.text1 } },
  ], { x: M + 0.15, y: 10.03, w: CW - 0.3, h: 0.8, fontSize: 9.5, valign: 'middle', lineSpacingMultiple: 1.04 });
}

// ---------------------------------------------------------------------------
// 30 · Getting around
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Transport', 'Getting Around Fossil-Free', C.accent6);
  picture(s, 'renders/airport.jpg', 0, 1.65, W, 3.0);
  caption(s, 'Compact Polar Airport at dusk: the glass terminal, the control tower and Flight VN-81 climbing out.', M, 4.7, CW, 0.25);
  paras(s, [
    'Everything that moves in Aurora Haven is electric and built for the cold. Two driverless metro lines, the north–south Aurora Line and the east–west Glacier Line, run deep underground and meet under Liberty Mall, so blizzards never stop them.',
    'Above ground, electric trams, buses and shared robotaxis stop at heated shelters. Streets are warmed from below, as in Reykjavík, where water returning from home heating melts the snow [18].',
    'The airport, with its heated runway and e-fuel planes, keeps the city supplied through deep winter.',
  ], M, 5.1, 3.95, 3.0, { fontSize: 10.5 });
  // Metro diagram: the two lines cross at the interchange.
  const mx = 4.95;
  const mw = W - M - mx;
  const cx = mx + mw / 2;
  const cy = 6.6;
  s.addShape(pres.shapes.LINE, { x: cx, y: 5.15, w: 0, h: 2.75, line: { color: C.accent6, width: 7 }, objectName: 'metro-aurora-line' });
  s.addShape(pres.shapes.LINE, { x: mx, y: cy, w: mw, h: 0, line: { color: C.accent4, width: 7 }, objectName: 'metro-glacier-line' });
  s.addShape(pres.shapes.OVAL, { x: cx - 0.22, y: cy - 0.22, w: 0.44, h: 0.44, fill: { color: C.background1 }, line: { color: C.text1, width: 3 }, objectName: 'metro-interchange' });
  text(s, 'Aurora Line\nnorth–south', { x: cx + 0.14, y: 5.15, w: 1.3, h: 0.4, fontSize: 9, bold: true, color: C.accent6 });
  text(s, 'Glacier Line\neast–west', { x: mx, y: cy + 0.16, w: 1.1, h: 0.4, fontSize: 9, bold: true, color: C.accent4 });
  text(s, 'Central Interchange Station, under Liberty Mall', { x: cx + 0.3, y: cy - 0.62, w: 1.15, h: 0.55, fontSize: 8.5, bold: true, valign: 'bottom' });
  const facts = [
    ['Who rides', 'Commuters, students, shoppers and stadium fans. Heated cars have space for wheelchairs, prams and skis.'],
    ['How many', 'Our estimate: if a four-car train carries about 400 people, a train every 3 min moves about 8,000 people an hour each way. After stadium events, trains every 90 s could clear the 8,000 seats in about 30 minutes.'],
    ['Safe in a storm', 'Deep, insulated tunnels kept at about +5 °C, emergency walkways with glow strips, and doors straight into the four shelters.'],
    ['Powered by', 'All-electric and driverless. Braking returns about 30% of the energy, and insulation, not heaters, keeps the tunnels above freezing.'],
  ];
  const fw = (CW - 3 * 0.12) / 4;
  facts.forEach(([t, d], i) => {
    const x = M + i * (fw + 0.12);
    card(s, x, 8.4, fw, 2.4, C.background2);
    text(s, t, { x: x + 0.12, y: 8.52, w: fw - 0.24, h: 0.26, fontSize: 11, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: 8.84, w: fw - 0.24, h: 1.9, fontSize: 10, lineSpacingMultiple: 1.06 });
  });
}

// ---------------------------------------------------------------------------
// 31 · Salad under the northern lights
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Living in Aurora Haven');
  bleed(s, 'renders/greenhouse.jpg');
  shade(s, 'top', 0, 0, W, 3.9);
  shade(s, 'bottom', 0, 6.4, W, H - 6.4);
  kicker(s, 'Evergreen Greenhouse Dome', M, 0.6, C.accent1, { textColor: C.background1 });
  title(s, 'Salad Under the Northern Lights', M, 0.88, CW, 1.6, { fontSize: 44, color: C.background1 });
  standfirst(s, 'Fresh salad, tomatoes, peppers, herbs and berries all year, even in the polar night and in winters when supplies can only arrive by air.', M, 2.5, 6.2, 0.8, { color: C.background1, fontSize: 14 });
  paras(s, [
    'The dome is heated by the district-heating loop and wrapped in thermal curtains at night. LED grow lights give the plants 18-hour “days” on stacked hydroponic racks, and CO₂ from the biogas plant and the waste converter boosts growth.',
  ], M, 9.3, 4.4, 1.6, { color: C.background1, fontSize: 10 });
  const sx = 5.4;
  [['18 h', 'LED “days” for the plants'], ['90%', 'less water than fields [16]']]
    .forEach(([n, l], i) => stat(s, n, l, sx, 9.05 + i * 0.85, W - M - sx, C.accent1, { size: 26, labelColor: C.background2, lh: 0.25 }));
  caption(s, 'Inside the Evergreen Greenhouse Dome, where the flowers for the monument’s red and yellow beds are raised too.', M, 8.65, CW, 0.45, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 32 · Safety
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Safety', 'Safe and Ready for Any Storm', C.accent2);
  picture(s, 'renders/rescue.jpg', 0, 1.65, W, 4.9);
  caption(s, 'The Polar Rescue and Resilience Station in the Energy Hub, north of downtown, with its helipad.', M, 6.6, CW, 0.25);
  paras(s, [
    'In the polar night, safety comes first. The Polar Rescue and Resilience Station is home to the fire brigade, ambulances, ice rescue and the 112 emergency centre, and its vehicles leave within 60 seconds.',
    'The West Market Fire & Ambulance Station reaches any downtown address in about four minutes, and a rescue helicopter is ready day and night.',
  ], M, 7.05, COL2, 2.2);
  paras(s, [
    'Under Liberty Mall, four underground shelters can keep every resident safe for 30 days. Aurora Core, the AI control tower, forecasts blizzards up to 48 hours ahead and alerts every phone.',
    'Cafés and lobbies act as warm points, and the air base runway is a backup for supply flights.',
  ], M + COL2 + GUT, 7.05, COL2, 2.2);
  const st = [['60 s', 'for rescue vehicles to leave'], ['30 days', 'of supplies for every resident'], ['48 h', 'blizzard forecasts']];
  const sw = CW / 3;
  st.forEach(([n, l], i) => stat(s, n, l, M + (i % 3) * sw, 9.45, sw - 0.15, C.accent2, { size: 28, lh: 0.45 }));
}

// ---------------------------------------------------------------------------
// 33 · Pros and cons
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Living in Aurora Haven');
  pageHead(s, 'Weighing it up · an honest balance sheet', 'Pros & Cons', C.accent2);
  standfirst(s, 'No city is perfect. Here is what Aurora Haven does well, where it could fail, what it costs and what we gave up to make it work.', M, 1.5, CW, 0.6, { fontSize: 12.5 });
  const list = (x, y, w, head, color, items) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.34, fill: { color }, line: { color, width: 0 }, objectName: name('list-head') });
    text(s, head, { x: x + 0.12, y, w: w - 0.24, h: 0.34, fontSize: 9.5, bold: true, charSpacing: 2, color: C.background1, valign: 'middle' });
    text(s, items.flatMap(([t, d], i) => [
      { text: `${t}. `, options: { bold: true, color: C.text1 } },
      { text: d[0].toUpperCase() + d.slice(1), options: { color: C.text1, breakLine: i < items.length - 1, paraSpaceAfter: 6 } },
    ]), { x: x + 0.05, y: y + 0.46, w: w - 0.1, h: 2.95, fontSize: 10, lineSpacingMultiple: 1.05 });
  };
  list(M, 2.25, COL2, 'ADVANTAGES', C.accent1, [
    ['Zero carbon', 'no fossil fuel burns anywhere; four clean energy sources cover for each other.'],
    ['Water and waste', 'about 95% of water is recycled, and nothing goes to landfill in the permafrost.'],
    ['Food security', 'all tap water and about half of the protein are made in the city.'],
    ['Safety', 'shelters for every resident for 30 days, 48-hour blizzard warnings and a metro that storms cannot stop.'],
    ['Wellbeing', 'daily needs within a 10-minute walk, plus a spa, a 24-hour library and parks for the polar night.'],
  ]);
  list(M + COL2 + GUT, 2.25, COL2, 'LIMITATIONS AND RISKS', C.accent2, [
    ['Fusion is not ready', 'ITER plans deuterium-tritium operation only in 2039 [4]; until fusion works, the city depends on geothermal, wind, sun and storage.'],
    ['One heating loop', 'if it fails at −45 °C, homes cool fast; the 12-hour heat tank and the geothermal plant are the safety net.'],
    ['Thawing ground', 'any heat leak could crack foundations, as thaw already threatens Arctic infrastructure [2]; sensors must watch it constantly.'],
    ['Cut off by storms', 'in deep winter all supplies come by air.'],
    ['High-tech risks', 'AI control systems need cyber-security and skilled staff, and new foods need people’s trust.'],
  ]);
  text(s, 'COSTS', { x: M, y: 5.72, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  paras(s, [
    'Building: a fusion plant is one of the most expensive machines ever made: ITER alone is estimated at €18–22 billion to first plasma [12]. Solar Foods’ first protein factory cost about €42 million for up to 160 tonnes a year [6]. Heated streets, insulated tunnels and triple glazing all cost more than ordinary ones.',
  ], M, 6.02, COL2, 1.55, { fontSize: 10 });
  paras(s, [
    'Running: direct air capture uses a lot of energy and still costs hundreds of dollars per tonne of CO₂ [13]. Hydroponic lettuce needs about 82 times more energy than field lettuce, but about 92% less water and 11 times less land [16].',
  ], M + COL2 + GUT, 6.02, COL2, 1.55, { fontSize: 10 });
  text(s, 'TRADE-OFFS: WHAT WE CHOSE, AND WHAT WE GAVE UP', { x: M, y: 7.72, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const trades = [
    ['Compact blocks that save heat', 'smaller homes and less private space'],
    ['Metro, trams and shared robotaxis', 'fewer private cars and less freedom to drive'],
    ['Lights that switch on only when needed', 'darker streets, for the aurora and the wildlife'],
    ['Limited reindeer rides, protected corridors', 'less tourist income, healthier animals'],
    ['Factory-made food', 'no farmland needed, but more electricity and new tastes'],
  ];
  trades.forEach(([a, b2], i) => {
    const y = 8.02 + i * 0.4;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: CW, h: 0.4, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: name('row-band') });
    text(s, a, { x: M + 0.1, y, w: 3.3, h: 0.4, fontSize: 10, bold: true, valign: 'middle' });
    text(s, '→', { x: M + 3.45, y, w: 0.3, h: 0.4, fontSize: 11, bold: true, color: C.accent2, valign: 'middle' });
    text(s, b2, { x: M + 3.8, y, w: CW - 3.9, h: 0.4, fontSize: 10, color: C.text2, valign: 'middle' });
  });
  card(s, M, 10.15, CW, 0.75, C.text1);
  text(s, [
    { text: 'OUR PLAN B  ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: 'Build in stages: first the geothermal plant, the wind and solar farms, the battery bank and the heat tank; add the fusion station when the technology is proven. Until then, the city grows more slowly.', options: { color: C.background1 } },
  ], { x: M + 0.15, y: 10.2, w: CW - 0.3, h: 0.65, fontSize: 10, valign: 'middle' });
}

// ---------------------------------------------------------------------------
// 34 · Invest in Aurora Haven
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Invest' });
  const s = page('LIGHT', 'Invest');
  picture(s, 'renders/approach_dusk.jpg', 0, 0, W, 3.3);
  shade(s, 'bottom', 0, 1.2, W, 2.1);
  kicker(s, 'Investment opportunity', M, 2.12, C.accent1, { textColor: C.background1 });
  title(s, 'Invest in Aurora Haven', M, 2.4, CW, 0.8, { fontSize: 38, color: C.background1 });
  caption(s, 'The Mount Aurora Approach at dusk: the street from downtown to the spa.', M, 3.36, CW, 0.22);
  standfirst(s, 'Aurora Haven needs partners to build it. We are looking for investors who want a share in a zero-carbon city, built step by step, starting with technology that already works today.', M, 3.68, CW, 0.7, { fontSize: 13 });

  text(s, 'THREE WAYS TO INVEST', { x: M, y: 4.5, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const ways = [
    ['Green city bonds', 'Fund Stage 1: the geothermal plant, the wind and solar farms, the battery bank and the heat tank, paid back from selling heat and power to the city.'],
    ['Community shares', 'Residents and visitors buy shares in the wind and solar farms through the Aurora Green Finance Hall and share in the income they make.'],
    ['Research partnerships', 'Companies and universities test new food, energy and building ideas with Arctic University and the Polar Climate & Ice Research Institute.'],
  ];
  const ww = (CW - 0.3) / 3;
  ways.forEach(([t, d], i) => {
    const x = M + i * (ww + 0.15);
    card(s, x, 4.78, ww, 1.72, C.background2);
    marker(s, String(i + 1), x + 0.12, 4.9, 0.36, C.accent1, { size: 12 });
    text(s, t, { x: x + 0.58, y: 4.95, w: ww - 0.68, h: 0.26, fontSize: 10.5, bold: true });
    text(s, d, { x: x + 0.12, y: 5.36, w: ww - 0.24, h: 1.08, fontSize: 9, color: C.text2, lineSpacingMultiple: 1.04 });
  });

  text(s, 'WHAT YOUR MONEY BUILDS, STAGE BY STAGE', { x: M, y: 6.68, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const stagesList = [
    ['Stage 1 · A clean base', 'Technology that works today: the geothermal plant, the wind and solar farms, the battery bank, the heat tank, heated streets and the metro.'],
    ['Stage 2 · Food and water', 'The Snow-to-Food & Water Plant, starting small. For scale, Solar Foods’ first protein factory in Finland cost about €42 million for up to 160 tonnes a year [6].'],
    ['Stage 3 · Fusion', 'Built only when fusion power is proven. It is the most expensive part: ITER alone is estimated at €18–22 billion to first plasma [12], which is why it comes last.'],
  ];
  s.addShape(pres.shapes.LINE, { x: M + 0.2, y: 7.12, w: 0, h: 1.3, line: { color: C.accent1, width: 2 }, objectName: 'stage-line' });
  stagesList.forEach(([t, d], i) => {
    const y = 6.98 + i * 0.62;
    marker(s, String(i + 1), M, y, 0.4, C.accent1, { size: 13 });
    text(s, [
      { text: `${t}. `, options: { bold: true, color: C.text1 } },
      { text: d, options: { color: C.text1 } },
    ], { x: M + 0.55, y: y + 0.01, w: CW - 0.55, h: 0.56, fontSize: 9.5, lineSpacingMultiple: 1.04 });
  });

  text(s, 'WHAT INVESTORS GET BACK', { x: M, y: 8.95, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const gains = [
    'Steady income from heat, power, water and food sold to 45,000 residents',
    'Visitors to the Mount Aurora spa and the Snow Stadium all year',
    'Know-how other Arctic towns can use: about 4 million people live in the Arctic [3]',
    'A city with no fuel to import and no carbon to pay for',
  ];
  const gw2 = (CW - 0.36) / 4;
  gains.forEach((t, i) => {
    const x = M + i * (gw2 + 0.12);
    card(s, x, 9.2, gw2, 0.68, C.background2);
    text(s, t, { x: x + 0.08, y: 9.22, w: gw2 - 0.16, h: 0.64, fontSize: 8.5, lineSpacingMultiple: 1.02, valign: 'middle' });
  });
  text(s, 'Please note: these are future concepts, not tested projects. Costs and returns still have to be worked out in a full business plan, and no return is guaranteed. The risks are on page 31.', {
    x: M, y: 9.92, w: CW, h: 0.36, fontSize: 8.5, italic: true, color: C.text2,
  });
  card(s, M, 10.33, CW, 0.57, C.text1);
  text(s, [
    { text: 'READY TO BUILD THE FUTURE?  ', options: { bold: true, charSpacing: 2, color: C.accent1 } },
    { text: 'Visit the Aurora Green Finance Hall in the Financial District, or meet our team on page 3.', options: { color: C.background1 } },
  ], { x: M + 0.15, y: 10.36, w: CW - 0.3, h: 0.51, fontSize: 9.5, valign: 'middle' });
}

// ---------------------------------------------------------------------------
// 35 · Take the tour
// ---------------------------------------------------------------------------
{
  pres.addSection({ title: 'Guide' });
  const s = page('ICE', 'Guide');
  pageHead(s, 'Explore', 'Take the Tour: Eight Stops', C.accent6);
  standfirst(s, 'A walk around Aurora Haven in eight stops, from the civic heart of downtown out to the plants, the snow peak and the windy northern edge.', M, 1.6, CW, 0.75);
  const stops = [
    ['Founding Mayor Monument', 'The civic heart of the city on the Aurora Roundabout.'],
    ['Metro Entrance – Central Interchange Station', 'Escalators down to the metro and the shelters.'],
    ['Snowflake General Hospital', 'About 250 beds and a 24-hour emergency department.'],
    ['Fusion Core – Compact D-T Tokamak', 'The city’s own sun.'],
    ['Snow Harvest & Melt Hall', 'Melts about 3,000 tonnes of snow a day with spare fusion heat.'],
    ['Mount Aurora – Snow Peak & Hanging Glacier', 'The 35 m peak with the spa inside.'],
    ['Ice-Proof Wind Farm', 'Two rows of turbines making about 60 MW.'],
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
  picture(s, 'renders/stadium.jpg', bx, 2.65, bw, 4.0);
  caption(s, 'Aurora Snow Stadium at dusk.', bx + 0.18, 6.72, bw - 0.36, 0.22);
  kicker(s, 'Behind the build', bx + 0.18, 7.15, C.accent6, { w: bw - 0.4 });
  [['35', 'key places, numbered on the master plan'], ['9', 'downtown blocks around the Aurora Roundabout']]
    .forEach(([n, l], i) => stat(s, n, l, bx + 0.18, 7.6 + i * 1.4, bw - 0.36, C.accent6, { size: 22, lh: 0.4, lsize: 9 }));
}

// ---------------------------------------------------------------------------
// 36 · Places to visit (Appendix A of the slide content)
// ---------------------------------------------------------------------------
const PLACES = [
  ['Founding Mayor Monument', 'The city’s civic heart on Aurora Roundabout: ceremonies, national holidays and walking tours.'],
  ['Aurora Civic Center & Municipal Hall', 'Town hall for the city council, ID cards, permits, housing and family services.'],
  ['Snowflake General Hospital', 'Main hospital with about 250 beds and a 24-hour emergency department.'],
  ['Northern Lights School & Botanical Conservatory', 'Primary and secondary school for about 900 pupils aged 6–18.'],
  ['Igloo Fresh Supermarket & Food Hall', 'Downtown’s main supermarket and food court; about half its food is made in the city.'],
  ['Aurora Cinema & Performing Arts Center', 'Cinema and theatre for films, concerts, ballet and school shows.'],
  ['Underground Metro & Emergency Shelters', 'Metro interchange linked to four shelters that last 30 days.'],
  ['Aurora Core – AI Control Tower', 'Operations centre where an AI digital twin runs traffic, heat, power and alerts.'],
  ['Aurora Haven Police Headquarters', 'Central police station with a 24-hour police control room.'],
  ['Arctic University – Main Hall', 'Lecture halls for about 5,000 students of polar engineering, fusion, food science, medicine and climate.'],
  ['Aurora Public Library', 'Free library, open 24 hours in the polar night; lends skis, telescopes and light-therapy lamps.'],
  ['West Market Fire & Ambulance Station', 'Downtown fire and ambulance branch that reaches any downtown address in about 4 minutes.'],
  ['Aurora Glacier Mall & Crystal Atrium', 'Largest downtown mall, with an indoor atrium park of real trees.'],
  ['Snow Lantern Primary School', 'Primary school for about 450 children aged 6–11 from the southern districts.'],
  ['Pinecone Kindergarten', 'Kindergarten and day nursery for about 40 children aged 1–6.'],
  ['Aurora 81 – Polar Landmark Tower', 'Tallest tower and skyline symbol: offices, hotel and sky apartments, net-zero energy.'],
  ['Aurora Snow Garden Park', 'Public park with heated benches, a sledging slope and a snow-sculpture trail.'],
  ['Mount Aurora – Snow Peak & Hanging Glacier', '35 m landmark peak with the four-level spa inside.'],
  ['Summit Sanctuary & Aurora Eye', 'Float pool, meditation circle and the Aurora Eye viewing bubble for the northern lights.'],
  ['Aurora Lagoon – Outdoor Geothermal Mineral Pool', '38 °C open-air silica pool for bathing under the northern lights.'],
  ['Fusion Core – Compact D-T Tokamak', '150-million-degree plasma giving about 800 MW of heat; it cannot melt down.'],
  ['Power Conversion & Heat Export Hall', 'Makes about 300 MW of electricity and sends about 450 MW of heat to the city.'],
  ['Plasma Waste Converter', 'Turns about 20 tonnes of rubbish a day into clean gas, recovered metals and building blocks.'],
  ['Snow Harvest & Melt Hall', 'Melts about 3,000 tonnes of clean snow a day with spare fusion heat.'],
  ['Drinking-Water & Mineral Works', 'Makes about 2,500 m³ of drinking water a day, all of the city’s tap water.'],
  ['Bioreactor Silos', 'Six silos where microbes make about 2.5 tonnes of protein flour a day.'],
  ['Ice-Proof Wind Farm', 'Two rows of ice-proof turbines making about 60 MW.'],
  ['Bifacial Solar Farm', 'Double-sided panels that make power 24 hours a day in the midnight-sun months.'],
  ['Water Recycling Line – Recycled Water Tower', 'Stores recycled water for toilets, laundries, street cleaning, irrigation and hydrants.'],
  ['Geothermal Power Plant', 'Clean electricity and hot water around the clock; the second heat source.'],
  ['Polar Rescue and Resilience Station', 'Fire, ambulance and ice-rescue headquarters, home of the 112 emergency centre.'],
  ['Glass Terminal, Control Tower & Gate 1 Dreamliner', 'Passenger and cargo airport; the city’s supply link in deep winter.'],
  ['Evergreen Greenhouse Dome', 'Grows fresh vegetables and berries all year under LED light.'],
  ['Circular Recycling Center', 'Sorts, repairs and recycles about 30 tonnes of materials a day.'],
  ['Aurora Snow Stadium', 'About 8,000 seats for snow sports, school sports days and the Midwinter Aurora Festival.'],
];
{
  const s = page('LIGHT', 'Guide');
  pageHead(s, 'Guide · 35 key places', 'Places to Visit', C.accent6);
  text(s, 'The numbers match the markers on the city master plan on page 10.', { x: M, y: 1.58, w: CW, h: 0.25, fontSize: 9.5, italic: true, color: C.text2 });
  const per = 18;
  const rowH = (10.95 - 1.95) / per;
  PLACES.forEach(([n, d], i) => {
    const x = M + Math.floor(i / per) * (COL2 + GUT);
    const y = 1.95 + (i % per) * rowH;
    text(s, String(i + 1), { x, y, w: 0.36, h: 0.25, fontFace: HEAD, fontSize: 11, bold: true, color: C.accent6 });
    text(s, n, { x: x + 0.38, y, w: COL2 - 0.38, h: 0.2, fontSize: 9, bold: true });
    text(s, d, { x: x + 0.38, y: y + 0.19, w: COL2 - 0.38, h: rowH - 0.2, fontSize: 8, color: C.text2, lineSpacingMultiple: 1.0 });
  });
}

// ---------------------------------------------------------------------------
// 37 · Through a resident’s eyes: an imagined day
// ---------------------------------------------------------------------------
{
  const s = page('DARK', 'Guide');
  picture(s, 'renders/resident.jpg', 0, 0, W, 5.6);
  shade(s, 'fade', 0, 3.4, W, 2.25);
  kicker(s, 'A day in Aurora Haven · an imagined story', M, 4.45, C.accent1, { textColor: C.background1 });
  title(s, 'Through a Resident’s Eyes', M, 4.73, CW, 0.75, { fontSize: 38, color: C.background1 });
  standfirst(s, 'It is January, and the sun has not risen for six weeks. This is how a winter day could feel for Mai, sixteen, a student at the Northern Lights School.', M, 5.6, CW, 0.65, { color: C.background2, fontSize: 13 });
  const day = [
    ['07:30', 'Mai’s flat in the Aurora 81 Residences is warm without a single heater: the district-heating loop brings the fusion station’s heat to every room. Breakfast is bread baked with starch made from snow and air.'],
    ['08:10', 'The heated sidewalk outside is dry. She rides the driverless Aurora Line under Liberty Mall, every three minutes, blizzard or not.'],
    ['12:30', 'Lunch is a salad grown under LED light in the Evergreen Greenhouse Dome. After school she borrows a light-therapy lamp from the 24-hour library.'],
    ['17:00', 'Every phone pings a blizzard warning, two days ahead. The football match moves indoors; nobody panics.'],
    ['20:00', 'The spa shuttle takes her to Mount Aurora. She floats in the 38 °C Aurora Lagoon as green curtains of light ripple over the snow peak.'],
  ];
  text(s, day.flatMap(([t, d], i) => [
    { text: `${t}  `, options: { bold: true, fontFace: HEAD, color: C.accent1 } },
    { text: d, options: { color: C.background1, breakLine: i < day.length - 1, paraSpaceAfter: 7 } },
  ]), { x: M, y: 6.45, w: 4.6, h: 4.5, fontSize: 11, lineSpacingMultiple: 1.1 });
  pullQuote(s, '“In the polar night, my city is the warmest place I know.”', 5.45, 7.0, W - M - 5.45, 2.0, C.accent1, { fontSize: 18 });
  caption(s, 'Walking home on a heated sidewalk under the northern lights.', 5.45, 10.45, W - M - 5.45, 0.45, { color: C.background2 });
}

// ---------------------------------------------------------------------------
// 38 · Sources and assumptions
// ---------------------------------------------------------------------------
{
  const s = page('LIGHT', 'Guide');
  pageHead(s, 'Research integrity', 'Sources & Assumptions', C.accent6);
  text(s, 'HOW TO READ OUR NUMBERS', { x: M, y: 1.55, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const kinds = [
    ['Design values', 'Figures for our own city plan, such as 300 MW of electricity or 3,000 tonnes of snow a day. They come from our design, not from a real city.'],
    ['Our estimates', 'Calculations we made ourselves and marked “our estimate”, such as the metro capacity, or worked out in the Reality check boxes. They show an idea is reasonable, not exact.'],
    ['Future concepts', 'The fusion station and the snow-to-food plant do not exist at this size today. They are our team’s ideas for the future; no prototype has been tested.'],
  ];
  const kw = (CW - 0.3) / 3;
  kinds.forEach(([t, d], i) => {
    const x = M + i * (kw + 0.15);
    card(s, x, 1.85, kw, 1.15, C.background2);
    text(s, t, { x: x + 0.12, y: 1.93, w: kw - 0.24, h: 0.24, fontSize: 10, bold: true, color: C.accent6 });
    text(s, d, { x: x + 0.12, y: 2.2, w: kw - 0.24, h: 0.78, fontSize: 8.5, lineSpacingMultiple: 1.02 });
  });
  text(s, 'REFERENCES', { x: M, y: 3.25, w: CW, h: 0.22, fontSize: 9, bold: true, charSpacing: 3, color: C.text2 });
  const refs = [
    'Rantanen, M. et al. (2022). The Arctic has warmed nearly four times faster than the globe since 1979. Communications Earth & Environment, 3, 168. doi.org/10.1038/s43247-022-00498-3',
    'Hjort, J. et al. (2018). Degrading permafrost puts Arctic infrastructure at risk by mid-century. Nature Communications, 9, 5147. doi.org/10.1038/s41467-018-07557-4',
    'Arctic Human Development Report (2004). Stefansson Arctic Institute for the Arctic Council: about 4 million people live in the Arctic.',
    'ITER Organization (2024). Baseline 2024: press conference summary, July 2024. iter.org',
    'SPARC (tokamak). Wikipedia, accessed October 2026. en.wikipedia.org/wiki/SPARC_(tokamak)',
    'Solar Foods (2024). Factory 01 starts production of Solein in Vantaa, Finland (press release, 15 April 2024) and Factory 01 press kit. solarfoods.com',
    'Cai, T. et al. (2021). Cell-free chemoenzymatic starch synthesis from carbon dioxide. Science, 373, 1523–1527. doi.org/10.1126/science.abh4049',
    'Dezeen (9 September 2021). Climeworks opens Orca, a direct air capture plant in Iceland. dezeen.com',
    'Blue Lagoon (geothermal spa). Wikipedia, accessed October 2026. en.wikipedia.org/wiki/Blue_Lagoon_(geothermal_spa)',
    'Swissinfo. Stone and water temple delights the senses (the Therme Vals by Peter Zumthor). swissinfo.ch',
    'ITER Organization. Tritium breeding. iter.org',
    'Kramer, D. (29 April 2016). ITER costs are pinned down, with caveats. Physics Today. physicstoday.aip.org',
    'Sendi, M., Bui, M., Mac Dowell, N. & Fennell, P. (2024). Geospatial techno-economic and environmental assessment of different energy options for solid sorbent direct air capture. Cell Reports Sustainability, 1(8), 100151.',
    'Hasemyer, D. (17 July 2021). Thawing permafrost is artificially chilled to stabilize Alaska oil pipeline. Scientific American / Inside Climate News.',
    'AECO. Arctic fox: wildlife guidelines. aeco.no/guideline/wildlife/arctic-fox',
    'Barbosa, G. L. et al. (2015). Comparison of land, water, and energy requirements of lettuce grown using hydroponic vs. conventional agricultural methods. Int. J. Environ. Res. Public Health, 12(6), 6879–6891.',
    'pv magazine (23 May 2022). Bifacial solar modules shine in snowy environments. pv-magazine.com',
    'Iceland Review. Does Reykjavík have heated sidewalks? icelandreview.com',
    'Visit Tromsø. Winter in Tromsø: the polar night. visittromso.no',
    'Packer, L. W. et al. (2023). Neutron activation of ITER materials at JET. UKAEA-CCFE-CP(23)34. scientific-publications.ukaea.uk',
  ];
  // Two columns of numbered references, set as flowing paragraphs.
  const column = (from, to, x) => text(s, refs.slice(from, to).flatMap((r, i) => [
    { text: `[${from + i + 1}]  `, options: { bold: true, color: C.accent6 } },
    { text: r, options: { breakLine: from + i + 1 < to, paraSpaceAfter: 6 } },
  ]), { x, y: 3.55, w: COL2, h: 6.15, fontSize: 9.5, lineSpacingMultiple: 1.04 });
  column(0, 10, M);
  column(10, refs.length, M + COL2 + GUT);
  card(s, M, 9.85, CW, 1.05, C.background2);
  text(s, [
    { text: 'PICTURES  ', options: { bold: true, charSpacing: 2, color: C.accent6 } },
    { text: 'Every picture, plan and diagram in this magazine was made from our own 3D model of Aurora Haven (built with three.js). The cover photo is a render of that model made photo-realistic with an AI image tool (Nano Banana Pro), keeping its layout. Text facts about the city come from our city plan and its place cards.', options: { breakLine: true, paraSpaceAfter: 4 } },
    { text: 'AI USE  ', options: { bold: true, charSpacing: 2, color: C.accent6 } },
    { text: 'We used AI tools to help us build the 3D model of the city and make the pictures, plans and diagrams in this magazine, and to check our spelling and fix logic errors in the text.' },
  ], { x: M + 0.15, y: 9.93, w: CW - 0.3, h: 0.9, fontSize: 9, valign: 'middle', lineSpacingMultiple: 1.04 });
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
  s.addImage({ path: img('renders/back.jpg'), x: 0, y: 0, w: W, h: H, objectName: 'back-picture' });
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
    { text: 'Buy a community share in our wind and solar farms through the Aurora Green Finance Hall, study polar science at Arctic University, or come for a night at the Mount Aurora spa.', options: { color: C.background1 } },
  ], { x: M, y: 4.5, w: tw, h: 0.95, fontSize: 9.5, lineSpacingMultiple: 1.08 });

  // Contact panel: the city logo, the team's details, a space for the school logo and the QR code.
  const px = 4.15;
  const pw = W - M - px;
  panel(s, px, 0.55, pw, 5.0, 28);
  s.addImage({ path: img('ui/logo.png'), x: px + 0.2, y: 0.75, w: 1.05, h: 1.05, objectName: 'city-logo' });
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
  s.addImage({ path: img('ui/school_logo.png'), x: px + pw - 1.22, y: 2.05, w: 1.05, h: 1.05, objectName: 'school-logo' });
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

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Wrote', OUT);
})();
