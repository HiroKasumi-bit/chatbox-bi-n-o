// Helpers for the Lipid deck: theme, rich text, shapes, icons, animation registry
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const FA = require('react-icons/fa');

const THEME = {
  name: 'Lipid Golden Green',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1F2A24', lt1: 'FFFFFF', dk2: '0E3B2E', lt2: 'EEF5F0',
    accent1: 'F2A93B', accent2: '2E9A6B', accent3: '35B3C6',
    accent4: 'E5634D', accent5: '7B61C9', accent6: 'FFE3A3',
    hlink: '2E9A6B', folHlink: '7B61C9',
  },
};
const HEX = { dk: '0E3B2E', gold: 'F2A93B', green: '2E9A6B', teal: '35B3C6', coral: 'E5634D', violet: '7B61C9', white: 'FFFFFF', text: '1F2A24', pale: 'FFE3A3', mute: '5B7A6C' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Bài 28: Lipid';
pres.subject = 'Khoa học tự nhiên 9 – Chương IX';
const C = pres.SchemeColor;
const SH = pres.shapes;

// ---------- registries ----------
let S = 0;
const ANIM = {}; // slideNo -> {main:[], trig:[]}
const TRANS = {};
let nameCounter = 0;
const nm = (p = 'o') => `${p}_${++nameCounter}`;

function newSlide(master, section, trans = 'morph') {
  S++;
  ANIM[S] = { main: [], trig: [] };
  TRANS[S] = trans;
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  s._n = S;
  return s;
}
// animation steps: {names, eff, start, delay, dur}
function anim(s, start, names, eff = 'fade', o = {}) {
  ANIM[s._n].main.push({ names: [].concat(names), eff, start, delay: o.delay || 0, dur: o.dur || defDur(eff) });
}
const click = (s, n, e, o) => anim(s, 'click', n, e, o);
const withP = (s, n, e, o) => anim(s, 'with', n, e, o);
const after = (s, n, e, o) => anim(s, 'after', n, e, o);
function trig(s, trigger, steps) {
  ANIM[s._n].trig.push({ trigger, steps: steps.map((st, i) => ({ names: [].concat(st.names), eff: st.eff || 'fade', start: st.start || (i === 0 ? 'click' : 'with'), delay: st.delay || 0, dur: st.dur || defDur(st.eff || 'fade') })) });
}
function defDur(e) { return { fade: 500, zoom: 500, float: 700, wipeL: 600, wipeU: 600, teeter: 1000, exitWipe: 60000, pop: 450 }[e] || 500; }
// stagger helper: first gets start, rest 'after'
function stagger(s, start, list, eff = 'float', gap = 0, dur) {
  list.forEach((n, i) => anim(s, i === 0 ? start : 'after', n, eff, { delay: i === 0 ? 0 : gap, dur }));
}

// ---------- rich text ----------
// **bold**, ==accent bold==, leading "• " = bullet, '\n' = new paragraph.
// digits after a letter or ')' become subscripts (chemical formulas) unless opts.nosub
function runs(str, opts = {}) {
  const out = [];
  const paras = String(str).split('\n');
  paras.forEach((p, pi) => {
    let bullet = false;
    if (p.startsWith('• ')) { bullet = true; p = p.slice(2); }
    const toks = [];
    const re = /(\*\*[^*]+\*\*|==[^=]+==)/g;
    let last = 0, m;
    while ((m = re.exec(p))) {
      if (m.index > last) toks.push({ t: p.slice(last, m.index) });
      const inner = m[0].slice(2, -2);
      toks.push(m[0][0] === '*' ? { t: inner, b: true } : { t: inner, b: true, acc: true });
      last = re.lastIndex;
    }
    if (last < p.length) toks.push({ t: p.slice(last) });
    if (!toks.length) toks.push({ t: ' ' });
    const pr = [];
    toks.forEach(tk => {
      let buf = '', sub = false;
      const flush = () => {
        if (!buf) return;
        const o = {};
        if (tk.b) o.bold = true;
        if (tk.acc) o.color = opts.acc || C.accent2;
        if (sub) o.subscript = true;
        pr.push({ text: buf, options: o });
        buf = '';
      };
      for (let i = 0; i < tk.t.length; i++) {
        const ch = tk.t[i];
        const prev = i > 0 ? tk.t[i - 1] : '';
        if (ch === '→') { flush(); const o = { fontFace: 'Arial' }; if (tk.b) o.bold = true; if (tk.acc) o.color = opts.acc || C.accent2; pr.push({ text: ch, options: o }); sub = false; continue; }
        const isSub = !opts.nosub && /[0-9]/.test(ch) && (/[A-Za-z)]/.test(prev) || (sub && /[0-9]/.test(prev)));
        if (isSub !== sub) { flush(); sub = isSub; }
        buf += ch;
      }
      flush();
    });
    if (pr.length) {
      const first = pr[0].options;
      if (bullet) { first.bullet = { indent: opts.bulletIndent || 20 }; }
      else if (opts.anyBullet) first.bullet = false;
      if (opts.psa !== undefined) first.paraSpaceAfter = opts.psa;
      if (pi < paras.length - 1) pr[pr.length - 1].options.breakLine = true;
    }
    out.push(...pr);
  });
  return out;
}

// text box (optionally on a shape)
function tx(s, str, x, y, w, h, o = {}) {
  const name = o.name || nm('t');
  const hasBullet = /(^|\n)• /.test(str);
  const opt = {
    x, y, w, h, objectName: name,
    fontFace: o.font || THEME.bodyFontFace, fontSize: o.size || 18,
    color: o.color || C.text1, bold: !!o.bold, italic: !!o.italic,
    align: o.align || 'left', valign: o.valign || 'top',
    margin: (o.margin !== undefined ? o.margin : 0.04) * 72,
    paraSpaceAfter: o.psa !== undefined ? o.psa : 4,
    charSpacing: o.cs, lineSpacingMultiple: o.lsm || 1.0,
    rotate: o.rotate,
  };
  if (o.shape) {
    opt.shape = o.shape;
    if (o.shape === SH.ROUNDED_RECTANGLE) opt.rectRadius = o.r !== undefined ? o.r : 0.14;
    opt.fill = o.fill ? (typeof o.fill === 'string' ? { color: o.fill } : o.fill) : undefined;
    opt.line = o.line || { type: 'none' };
    if (o.shadow) opt.shadow = shadow(o.shadow);
    if (!o.fill) opt.fill = { type: 'none' };
  } else {
    opt.isTextBox = true;
    if (o.fill) opt.fill = typeof o.fill === 'string' ? { color: o.fill } : o.fill;
  }
  s.addText(runs(str, { acc: o.acc, nosub: o.nosub, anyBullet: hasBullet, bulletIndent: o.bulletIndent }), opt);
  return name;
}
function shadow(kind) {
  if (kind === 'soft') return { type: 'outer', color: '0E3B2E', opacity: 0.14, blur: 14, offset: 4, angle: 90 };
  if (kind === 'dark') return { type: 'outer', color: '000000', opacity: 0.35, blur: 18, offset: 5, angle: 90 };
  return { type: 'outer', color: '0E3B2E', opacity: 0.1, blur: 8, offset: 2, angle: 90 };
}
function box(s, x, y, w, h, o = {}) {
  const name = o.name || nm('b');
  const opt = { x, y, w, h, objectName: name, fill: o.fill ? (typeof o.fill === 'string' ? { color: o.fill } : o.fill) : { type: 'none' }, line: o.line || { type: 'none' }, rotate: o.rotate };
  const shp = o.shape || SH.ROUNDED_RECTANGLE;
  if (shp === SH.ROUNDED_RECTANGLE) opt.rectRadius = o.r !== undefined ? o.r : 0.16;
  if (o.shadow) opt.shadow = shadow(o.shadow);
  s.addShape(shp, opt);
  return name;
}
function circle(s, x, y, d, o = {}) { return box(s, x, y, d, d, { ...o, shape: SH.OVAL }); }
function line(s, x1, y1, x2, y2, o = {}) {
  const name = o.name || nm('l');
  const opt = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), objectName: name,
    line: { color: o.color || C.accent2, width: o.width || 2, dashType: o.dash, endArrowType: o.arrow ? 'triangle' : undefined, beginArrowType: o.arrowBegin ? 'triangle' : undefined } };
  if (x2 < x1) opt.flipH = true;
  if (y2 < y1) opt.flipV = true;
  s.addShape(SH.LINE, opt);
  return name;
}
function img(s, file, x, y, w, h, o = {}) {
  const name = o.name || nm('img');
  s.addImage({ path: __dirname + '/img/' + file, x, y, w, h, objectName: name, altText: o.alt || 'Hình trang trí', rotate: o.rotate, transparency: o.transparency });
  return name;
}

// icons (rasterised react-icons)
const iconCache = {};
async function prepIcons(list) {
  for (const [n, col] of list) {
    const key = n + col;
    if (iconCache[key]) continue;
    const Comp = FA[n];
    if (!Comp) throw new Error('icon missing ' + n);
    const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: '#' + col, size: 256 }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    iconCache[key] = 'image/png;base64,' + buf.toString('base64');
  }
}
function icon(s, n, col, x, y, sz, o = {}) {
  const key = n + col;
  if (!iconCache[key]) throw new Error('icon not prepared ' + key);
  const name = o.name || nm('ic');
  s.addImage({ data: iconCache[key], x, y, w: sz, h: sz, objectName: name, altText: o.alt || 'Biểu tượng' });
  return name;
}
// icon inside a tinted circle; returns [circleName, iconName]
function iconDot(s, n, col, x, y, d, o = {}) {
  const c = circle(s, x, y, d, { fill: o.fill || { color: o.tint || C.accent2, transparency: o.tr !== undefined ? o.tr : 85 }, name: o.name });
  const pad = d * (o.pad || 0.24);
  const i = icon(s, n, col, x + pad, y + pad, d - 2 * pad);
  return [c, i];
}

// ---------- background bubbles (morph motif) ----------
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bubbles(s, dark = false, variant = 0) {
  const r = rng(s._n * 7919 + variant);
  const j = (a, b) => a + (b - a) * r();
  const tr = dark ? 78 : 86;
  const L = [
    { n: '!!bub1', d: j(2.8, 3.6), x: j(11.0, 12.1), y: j(5.2, 6.0), c: C.accent1 },
    { n: '!!bub2', d: j(1.2, 1.7), x: j(11.9, 12.6), y: j(-0.7, -0.2), c: C.accent3 },
    { n: '!!bub3', d: j(0.7, 1.0), x: j(-0.45, -0.15), y: j(2.6, 5.0), c: C.accent2 },
    { n: '!!bub4', d: j(0.28, 0.42), x: j(11.2, 12.2), y: j(1.05, 1.35), c: C.accent1 },
  ];
  if (dark) {
    L[0].d = j(3.6, 4.6); L[0].x = j(10.2, 11.4); L[0].y = j(4.4, 5.4);
    L.push({ n: '!!bub5', d: j(1.6, 2.2), x: j(-0.9, -0.3), y: j(-0.9, -0.3), c: C.accent3 });
  }
  L.forEach(b => circle(s, b.x, b.y, b.d, { fill: { color: b.c, transparency: tr }, name: b.n }));
}

function kicker(s, text, dark = false) {
  return tx(s, text, 0.6, 0.28, 9.5, 0.34, { size: 13, bold: true, color: dark ? C.accent1 : C.accent2, cs: 3, margin: 0, name: '!!kicker' });
}
function title(s, text) { s.addText(runs(text), { placeholder: 'title' }); }

module.exports = { pres, C, SH, HEX, THEME, ANIM, TRANS, newSlide, click, withP, after, trig, stagger, anim, runs, tx, box, circle, line, img, icon, iconDot, prepIcons, bubbles, kicker, title, nm, shadow, getS: () => S };
