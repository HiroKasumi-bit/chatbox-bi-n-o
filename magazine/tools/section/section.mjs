// Mount Aurora section: an illustrated cut through the snow peak, for page 20 of the magazine.
//   node section.mjs OUT.png [OUT.svg]
// 2121 x 2117 px = the 7.07 x 7.06 in frame on the page at 300 dpi. Labels use Calibri (>= 9 pt).
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// --photos=DIR swaps the drawn sky, ground, rock and rooms for photographs from DIR:
// sky.jpg, strata.jpg, rock.jpg and lvl1.jpg ... lvl4.jpg (each is cropped to fit its area).
const ARGV = process.argv.slice(2);
const PH = (ARGV.find((a) => a.startsWith('--photos=')) || '').slice(9) || null;
const uri = (f) => `data:image/jpeg;base64,${fs.readFileSync(`${PH}/${f}`).toString('base64')}`;
const photo = (f, x, y, w, h) => `<image href="${uri(f)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;

const W = 2121, H = 2117, GY = 1560; // ground line
let s = 11;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const P = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const C = {
  rose: '#C9456F', ice: '#A9C8EA', iceLight: '#EEF3F8', orange: '#E06A2E', heat: '#F2A27A',
  water: '#5FE3E0', waterDeep: '#159BB5', mud: '#7A4E33', mudDark: '#4E3121', wood: '#B9773F',
  floor: '#2A2340', warmTop: '#FFE9C9', warmBottom: '#FFC98F', person: '#3B2B33',
};

// --- shapes -------------------------------------------------------------------------------
const jag = (pts, amp) => pts.map(([x, y], i) => (i === 0 || i === pts.length - 1 ? [x, y] : [x + (rnd() - 0.5) * amp, y + (rnd() - 0.5) * amp]));
const densify = (pts, n = 4) => pts.flatMap(([x0, y0], i) => {
  if (i === pts.length - 1) return [[x0, y0]];
  const [x1, y1] = pts[i + 1];
  return Array.from({ length: n }, (_, k) => [x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
});
const leftSlope = [[250, GY], [330, 1440], [400, 1330], [470, 1215], [530, 1100], [585, 990], [640, 880], [690, 800], [735, 772], [778, 768]];
const rightSlope = [[1142, 768], [1190, 778], [1240, 820], [1290, 892], [1345, 990], [1405, 1100], [1470, 1215], [1540, 1330], [1605, 1440], [1670, GY]];
const rock = [...jag(densify(leftSlope), 18), ...jag(densify(rightSlope), 18)];
// Snow lies thicker towards the summit.
const snow = rock.map(([x, y]) => {
  const k = 22 + Math.max(0, 1150 - y) * 0.07;
  return [x < 960 ? x - k * 1.3 : x + k * 1.3, y - k];
});
snow[0] = [210, GY]; snow[snow.length - 1] = [1712, GY];
const levels = [ // x0, x1, y0 (ceiling), y1 (floor)
  [520, 1400, 1350, 1560], [610, 1310, 1150, 1350], [700, 1220, 960, 1150], [785, 1135, 790, 960],
];
const cavity = [
  [520, GY], [520, 1350], [610, 1350], [610, 1150], [700, 1150], [700, 960], [785, 960], [785, 790],
  [1135, 790], [1135, 960], [1220, 960], [1220, 1150], [1310, 1150], [1310, 1350], [1400, 1350], [1400, GY],
];

const person = (x, y, k = 1, c = C.person) =>
  `<circle cx="${x}" cy="${y - 33 * k}" r="${7 * k}" fill="${c}"/><rect x="${x - 6.5 * k}" y="${y - 26 * k}" width="${13 * k}" height="${26 * k}" rx="${5 * k}" fill="${c}"/>`;
const sitter = (x, y, k = 1, c = C.person) =>
  `<circle cx="${x}" cy="${y - 22 * k}" r="${7 * k}" fill="${c}"/><rect x="${x - 6.5 * k}" y="${y - 15 * k}" width="${13 * k}" height="${15 * k}" rx="${5 * k}" fill="${c}"/>`;
const steam = (x, y, n = 4, spread = 60) => Array.from({ length: n }, () =>
  `<ellipse cx="${x + (rnd() - 0.5) * spread}" cy="${y - rnd() * 40}" rx="${18 + rnd() * 18}" ry="${10 + rnd() * 10}" fill="#ffffff" opacity="${0.18 + rnd() * 0.12}" filter="url(#soft)"/>`).join('');
const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="26" fill="#FFD9A0" opacity="0.35" filter="url(#soft)"/><circle cx="${x}" cy="${y}" r="6" fill="#FFF1D2"/>`;
const pool = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#water)"/>` +
  Array.from({ length: Math.round(w / 70) }, (_, i) => `<path d="M${x + 20 + i * 70} ${y + h * 0.45} q12 -6 24 0 t24 0" stroke="#E9FFFF" stroke-width="2.5" fill="none" opacity="0.7"/>`).join('');
const fin = (x, y0, y1) => Array.from({ length: 6 }, (_, i) => `<line x1="${x - 22}" y1="${y0 + i * ((y1 - y0) / 5)}" x2="${x + 22}" y2="${y0 + i * ((y1 - y0) / 5)}" stroke="#9FB6CF" stroke-width="5" stroke-linecap="round"/>`).join('');

// --- labels -------------------------------------------------------------------------------
const FONT = "font-family=\"Calibri, 'Segoe UI', Arial\"";
const label = (x, y, head, note, opts = {}) => {
  const a = opts.align === 'end' ? 'end' : 'start';
  const hc = opts.headColor || '#FFFFFF', nc = opts.noteColor || C.ice;
  const lines = Array.isArray(note) ? note : note ? [note] : [];
  return `<text ${FONT} x="${x}" y="${y}" text-anchor="${a}" font-size="44" font-weight="700" fill="${hc}">${head}</text>` +
    lines.map((t, i) => `<text ${FONT} x="${x}" y="${y + 46 + i * 42}" text-anchor="${a}" font-size="38" fill="${nc}">${t}</text>`).join('');
};
const leader = (x0, y0, x1, y1) => `<polyline points="${P([[x0, y0], [x1, y1]])}" stroke="${C.ice}" stroke-width="2.5" fill="none" opacity="0.9"/><circle cx="${x1}" cy="${y1}" r="7" fill="#FFFFFF"/>`;

// --- the picture --------------------------------------------------------------------------
const stars = Array.from({ length: 170 }, () => `<circle cx="${rnd() * W}" cy="${rnd() * 640}" r="${0.8 + rnd() * 2.2}" fill="#FFFFFF" opacity="${0.35 + rnd() * 0.6}"/>`).join('');
const strata = Array.from({ length: 9 }, (_, i) => {
  const y = GY + 70 + i * 52;
  const d = Array.from({ length: 12 }, (_, k) => `${(k * W) / 11},${y + Math.sin(k * 1.3 + i) * 10}`).join(' L');
  return `<path d="M${d}" stroke="#0B1222" stroke-width="3" fill="none" opacity="0.55"/>`;
}).join('');
const cracks = Array.from({ length: 26 }, () => {
  let x = 300 + rnd() * 1300, y = 820 + rnd() * 700;
  const pts = [[x, y]];
  for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 80; y += 20 + rnd() * 50; pts.push([x, y]); }
  return `<polyline points="${P(pts)}" stroke="#151A28" stroke-width="2.5" fill="none" opacity="0.5"/>`;
}).join('');
const crystals = Array.from({ length: 26 }, () => {
  const x = 40 + rnd() * (W - 80), y = GY + 30 + rnd() * 120, r = 6 + rnd() * 6;
  return `<g stroke="#CFE6FF" stroke-width="2" opacity="0.55"><line x1="${x - r}" y1="${y}" x2="${x + r}" y2="${y}"/><line x1="${x}" y1="${y - r}" x2="${x}" y2="${y + r}"/><line x1="${x - r * 0.7}" y1="${y - r * 0.7}" x2="${x + r * 0.7}" y2="${y + r * 0.7}"/><line x1="${x - r * 0.7}" y1="${y + r * 0.7}" x2="${x + r * 0.7}" y2="${y - r * 0.7}"/></g>`;
}).join('');
const dome = (() => {
  const cx = 960, cy = 790, r = 175;
  let g = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="url(#glass)" stroke="#E8FFFF" stroke-width="5"/>`;
  for (const k of [0.35, 0.65]) g += `<path d="M${cx - r * Math.sqrt(1 - k * k)} ${cy - r * k} L${cx + r * Math.sqrt(1 - k * k)} ${cy - r * k}" stroke="#E8FFFF" stroke-width="2.5" opacity="0.7"/>`;
  for (const k of [-0.6, -0.25, 0.25, 0.6]) g += `<path d="M${cx + r * k} ${cy} Q${cx + r * k * 0.55} ${cy - r * 0.95} ${cx} ${cy - r}" stroke="#E8FFFF" stroke-width="2.5" fill="none" opacity="0.7"/>`;
  g += `<path d="M${cx - r * 0.55} ${cy - r * 0.55} A${r * 0.8} ${r * 0.8} 0 0 1 ${cx - r * 0.1} ${cy - r * 0.92}" stroke="#FFFFFF" stroke-width="7" fill="none" opacity="0.55" stroke-linecap="round"/>`;
  return g + (PH ? '' : person(910, 788, 1.05, '#20314A') + person(1012, 788, 1.05, '#20314A'));
})();

// Photo mode: each level shows a photograph of that room, with a warm wash so the rooms read
// as one building; the glass lift is drawn over them.
const rooms = PH ? levels.map(([x0, x1, y0, y1], i) => photo(`lvl${i + 1}.jpg`, x0, y0, x1 - x0, y1 - y0)).join('')
  + `<polygon points="${P(cavity)}" fill="#FFB766" opacity="0.10"/>` : '';
const lift = `<rect x="1090" y="790" width="30" height="${GY - 790}" fill="#C9F4FF" opacity="0.30" stroke="#8FE3F0" stroke-width="3"/><rect x="1093" y="1196" width="24" height="38" rx="3" fill="#FFF1D2"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070C22"/><stop offset="0.55" stop-color="#16194A"/><stop offset="1" stop-color="#3B2C70"/></linearGradient>
  <linearGradient id="aurora1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CFFC8" stop-opacity="0"/><stop offset="0.6" stop-color="#3CF0A8" stop-opacity="0.55"/><stop offset="1" stop-color="#1FB58F" stop-opacity="0"/></linearGradient>
  <linearGradient id="aurora2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C79BFF" stop-opacity="0"/><stop offset="0.6" stop-color="#9A6BFF" stop-opacity="0.45"/><stop offset="1" stop-color="#7B4FD6" stop-opacity="0"/></linearGradient>
  <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#E3EEFA"/><stop offset="1" stop-color="#B9CBE0"/></linearGradient>
  <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6E7486"/><stop offset="0.5" stop-color="#4E5466"/><stop offset="1" stop-color="#383C4C"/></linearGradient>
  <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.warmTop}"/><stop offset="1" stop-color="${C.warmBottom}"/></linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.water}"/><stop offset="1" stop-color="${C.waterDeep}"/></linearGradient>
  <linearGradient id="mud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.mud}"/><stop offset="1" stop-color="${C.mudDark}"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9FFF6" stop-opacity="0.85"/><stop offset="1" stop-color="#2EC4C9" stop-opacity="0.55"/></linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D3A57"/><stop offset="1" stop-color="#121829"/></linearGradient>
  <radialGradient id="spring" cx="0.5" cy="1" r="0.75"><stop offset="0" stop-color="#FF8A3D" stop-opacity="0.95"/><stop offset="0.55" stop-color="#E06A2E" stop-opacity="0.45"/><stop offset="1" stop-color="#E06A2E" stop-opacity="0"/></radialGradient>
  <pattern id="hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="22" stroke="#FFFFFF" stroke-width="2" opacity="0.10"/></pattern>
  <pattern id="salt" width="34" height="20" patternUnits="userSpaceOnUse"><rect width="34" height="20" fill="#F2A7A0"/><rect x="1.5" y="1.5" width="31" height="17" rx="2" fill="#F7C2B6"/></pattern>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="haze" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="40"/></filter>
  <clipPath id="rockClip"><polygon points="${P(rock)}"/></clipPath>
  <clipPath id="snowClip"><polygon points="${P(snow)}"/></clipPath>
  <clipPath id="cavClip"><polygon points="${P(cavity)}"/></clipPath>
</defs>

<!-- night sky, stars and the northern lights -->
${PH ? `${photo('sky.jpg', 0, 0, W, GY)}<rect width="${W}" height="${GY}" fill="#070C22" opacity="0.18"/>` : `<rect width="${W}" height="${GY}" fill="url(#sky)"/>
${stars}
<path d="M-50 420 C 300 250, 620 520, 980 300 S 1650 180, 2180 360 L 2180 120 C 1700 0, 1300 160, 980 60 S 300 40, -50 160 Z" fill="url(#aurora1)" filter="url(#glow)"/>
<path d="M1100 520 C 1400 380, 1750 520, 2180 330 L 2180 200 C 1800 330, 1450 230, 1100 380 Z" fill="url(#aurora2)" filter="url(#glow)"/>`}
<ellipse cx="960" cy="700" rx="380" ry="170" fill="#2EC4C9" opacity="0.18" filter="url(#haze)"/>

<!-- ground, permafrost and the hot spring deep below -->
${PH ? `${photo('strata.jpg', 0, GY, W, H - GY)}<rect y="${GY}" width="${W}" height="${H - GY}" fill="url(#ground)" opacity="0.62"/>` : `<rect y="${GY}" width="${W}" height="${H - GY}" fill="url(#ground)"/>`}
<rect y="${GY}" width="${W}" height="170" fill="#8FB5DA" opacity="0.16"/>
${PH ? '' : strata}
${crystals}
<ellipse cx="840" cy="${H + 40}" rx="760" ry="260" fill="url(#spring)"/>
${Array.from({ length: 14 }, () => `<circle cx="${560 + rnd() * 560}" cy="${H - 30 - rnd() * 120}" r="${4 + rnd() * 6}" fill="#FFD3A8" opacity="0.6"/>`).join('')}

<!-- snow, then the rock shell cut open -->
${PH ? `<g clip-path="url(#snowClip)">${photo('rock.jpg', 150, 650, 1620, 950)}<rect width="${W}" height="${H}" fill="#F4F8FF" opacity="0.74"/><rect width="${W}" height="${H}" fill="url(#snow)" opacity="0.35"/></g>`
    : `<polygon points="${P(snow)}" fill="url(#snow)"/>`}
${PH ? `<g clip-path="url(#rockClip)">${photo('rock.jpg', 200, 700, 1520, 900)}<rect width="${W}" height="${H}" fill="#1A2030" opacity="0.28"/><rect width="${W}" height="${H}" fill="url(#hatch)"/></g>`
    : `<polygon points="${P(rock)}" fill="url(#rock)"/>
<g clip-path="url(#rockClip)"><rect width="${W}" height="${H}" fill="url(#hatch)"/>${cracks}</g>`}

<!-- the warm, stepped inside -->
${PH ? rooms : `<polygon points="${P(cavity)}" fill="url(#warm)"/>`}
<polyline points="${P(cavity)}" stroke="#F6D7A6" stroke-width="9" fill="none" stroke-linejoin="round"/>
${PH ? lift : `<g clip-path="url(#cavClip)">
  ${lamp(700, 1385)}${lamp(1000, 1385)}${lamp(1300, 1385)}${lamp(760, 1185)}${lamp(1060, 1185)}${lamp(850, 995)}${lamp(1120, 995)}
  <!-- level 1: basalt wall and waterfall, Mineral Lake, larch footbridge, welcome hall -->
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${528 + i * 9}" y="${1372 + (i % 3) * 14}" width="8" height="${176 - (i % 3) * 14}" fill="#2B2E3A"/>`).join('')}
  <rect x="588" y="1392" width="30" height="112" fill="#CFF8FF" opacity="0.85"/>
  ${pool(600, 1494, 450, 54)}
  ${steam(700, 1478, 5, 300)}
  <rect x="690" y="1480" width="290" height="10" fill="${C.wood}"/>
  ${[700, 760, 820, 880, 940, 970].map((x) => `<rect x="${x}" y="1446" width="5" height="36" fill="${C.wood}"/>`).join('')}
  <rect x="696" y="1446" width="282" height="5" fill="${C.wood}"/>
  ${person(790, 1480)}${person(860, 1480, 0.95, '#5A3B47')}${sitter(1030, 1494, 0.9)}
  <rect x="1180" y="1500" width="140" height="48" rx="6" fill="#8C5A3A"/>
  ${person(1150, 1548)}${person(1265, 1500, 0.9, '#4A3540')}${person(1350, 1548, 1, '#5A3B47')}
  <circle cx="1105" cy="1525" r="20" fill="#3E8E5A"/><rect x="1101" y="1525" width="8" height="23" fill="#6B4A2E"/>
  <!-- level 2: volcanic mud terraces and loungers -->
  <rect x="640" y="1296" width="150" height="42" rx="8" fill="url(#mud)"/>
  <rect x="800" y="1282" width="150" height="56" rx="8" fill="url(#mud)"/>
  <rect x="960" y="1268" width="150" height="70" rx="8" fill="url(#mud)"/>
  ${steam(870, 1262, 6, 380)}
  ${sitter(700, 1300, 0.9)}${sitter(880, 1286, 0.9, '#5A3B47')}${sitter(1030, 1272, 0.9)}
  ${[1150, 1205, 1260].map((x) => `<path d="M${x - 22} 1336 L${x + 18} 1336 L${x + 26} 1318" stroke="#E8D3B5" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}
  ${sitter(1205, 1330, 0.85, '#4A3540')}
  <!-- level 3: Himalayan salt sauna and treatment beds -->
  <rect x="738" y="1028" width="196" height="110" rx="6" fill="${C.wood}"/>
  <rect x="752" y="1040" width="168" height="84" fill="url(#salt)"/>
  ${[790, 840, 890].map((x) => `<path d="M${x} 1016 q8 -10 0 -20 t0 -20" stroke="${C.heat}" stroke-width="4" fill="none"/>`).join('')}
  ${sitter(800, 1124, 0.85)}${sitter(870, 1124, 0.85, '#5A3B47')}
  ${[985, 1100].map((x) => `<rect x="${x}" y="1110" width="90" height="16" rx="5" fill="#F3E3CC"/><rect x="${x + 6}" y="1126" width="6" height="12" fill="#8C5A3A"/><rect x="${x + 78}" y="1126" width="6" height="12" fill="#8C5A3A"/>`).join('')}
  <rect x="990" y="1098" width="60" height="12" rx="6" fill="${C.person}"/>${person(1080, 1138, 0.85, '#5A3B47')}
  <!-- level 4: Summit Sanctuary, float pool, meditation circle -->
  ${pool(818, 912, 170, 36)}
  <rect x="870" y="912" width="64" height="10" rx="5" fill="${C.person}"/>
  ${[1010, 1040, 1070].map((x) => `<ellipse cx="${x}" cy="944" rx="13" ry="6" fill="#B8A0D8"/>`).join('')}
  ${sitter(1040, 940, 0.8)}
  <!-- glass lift through all four levels -->
  <rect x="1090" y="790" width="30" height="${GY - 790}" fill="#C9F4FF" opacity="0.35" stroke="#8FE3F0" stroke-width="3"/>
  <rect x="1093" y="1196" width="24" height="38" rx="3" fill="#FFF1D2"/>
</g>`}
<!-- floors between the levels -->
${levels.slice(1).map(([x0, x1, , y1]) => `<rect x="${x0}" y="${y1 - 12}" width="${x1 - x0}" height="12" fill="${C.floor}"/>`).join('')}
<rect x="520" y="${GY - 12}" width="880" height="12" fill="${C.floor}"/>

<!-- the Aurora Eye on the summit -->
<ellipse cx="960" cy="720" rx="220" ry="120" fill="#2EC4C9" opacity="0.25" filter="url(#glow)"/>
${dome}

<!-- hot spring rising into the Mineral Lake -->
<path d="M840 ${H - 60} C 760 1960, 920 1880, 830 1800 S 760 1660, 840 1548" stroke="#FF9A55" stroke-width="30" fill="none" opacity="0.35" filter="url(#soft)"/>
<path d="M840 ${H - 60} C 760 1960, 920 1880, 830 1800 S 760 1660, 840 1548" stroke="${C.orange}" stroke-width="14" fill="none" stroke-linecap="round"/>
<path d="M840 ${H - 60} C 760 1960, 920 1880, 830 1800 S 760 1660, 840 1548" stroke="#FFD3A8" stroke-width="5" fill="none" stroke-dasharray="14 18"/>
<polygon points="${P([[840, 1532], [818, 1572], [862, 1572]])}" fill="${C.orange}"/>

<!-- warm water on to the outdoor lagoon -->
<path d="M1040 1548 L1040 1610 L1860 1610 L1860 1556" stroke="${C.orange}" stroke-width="12" fill="none" stroke-linejoin="round"/>
<polygon points="${P([[1860, 1540], [1840, 1576], [1880, 1576]])}" fill="${C.orange}"/>
<rect x="1820" y="1532" width="250" height="28" rx="10" fill="url(#water)"/>
${steam(1945, 1520, 6, 220)}
${[1795, 2092].map((x) => `<polygon points="${P([[x, 1470], [x - 24, 1556], [x + 24, 1556]])}" fill="#26404A"/><rect x="${x - 4}" y="1556" width="8" height="10" fill="#4A3424"/>`).join('')}

<!-- thermosyphons at the foot of the peak keep the ground frozen -->
${[150, 1720].map((x) => `<ellipse cx="${x}" cy="1760" rx="70" ry="120" fill="#BFE3FF" opacity="0.22" filter="url(#soft)"/><line x1="${x}" y1="1440" x2="${x}" y2="1840" stroke="#8EA7C2" stroke-width="12" stroke-linecap="round"/>${fin(x, 1450, 1540)}`).join('')}

<!-- labels -->
<text ${FONT} x="60" y="108" font-size="40" font-weight="700" letter-spacing="7" fill="${C.rose}">A SECTION THROUGH THE MOUNTAIN</text>
<text ${FONT} x="60" y="200" font-size="64" font-weight="700" fill="${C.ice}">−45 °C outside</text>
${label(1765, 600, 'Aurora Eye', ['glass dome under', 'the northern lights'])}${leader(1755, 625, 1120, 700)}
${label(1765, 830, 'Level 4', ['Summit Sanctuary,', 'float pool'])}${leader(1755, 855, 1135, 880)}
${label(1765, 1035, 'Level 3', ['salt sauna,', 'treatments'])}${leader(1755, 1060, 1220, 1070)}
${label(1765, 1235, 'Level 2', 'warm mud terraces')}${leader(1755, 1260, 1310, 1270)}
${label(1765, 1400, 'Level 1', ['welcome hall,', 'Mineral Lake'])}${leader(1755, 1425, 1400, 1440)}
${label(60, 600, 'Snow cap', '')}${leader(260, 590, 690, 760)}
${label(60, 900, 'Insulated rock', 'shell')}${leader(320, 905, 560, 1030)}
<text ${FONT} x="60" y="1240" font-size="58" font-weight="700" fill="${C.warmBottom}">28 °C inside</text>${leader(380, 1222, 640, 1240)}
${label(215, 1790, 'Permafrost', ['kept frozen by', 'thermosyphons'], { headColor: '#CFE6FF' })}
${label(900, 1880, 'Hot spring', ['from deep below'], { headColor: C.heat, noteColor: '#FFD3A8' })}
${label(2060, 1955, 'Warm water flows on', ['to the Aurora Lagoon', 'and the greenhouses'], { align: 'end', headColor: C.heat, noteColor: '#FFD3A8' })}
</svg>`;

// Modes: "full" (picture and labels), "art" (picture only, for repainting), "labels" (labels and
// leader lines on a transparent background, with a soft dark halo so they read on any picture).
const args = process.argv.slice(2);
const mode = (args.find((a) => a.startsWith('--mode=')) || '--mode=full').slice(7);
const [out, svgOut] = args.filter((a) => !a.startsWith('--'));
const cut = svg.indexOf('<!-- labels -->');
const open = svg.slice(0, svg.indexOf('>') + 1);
const labelPart = svg.slice(cut, svg.lastIndexOf('</svg>'));
const doc = mode === 'art' ? svg.slice(0, cut) + '</svg>'
  : mode === 'labels' ? `${open}<defs><filter id="halo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs>`
    + `<g filter="url(#halo)" opacity="0.85">${labelPart.replace(/fill="[^"]*"/g, 'fill="#05081A"').replace(/stroke="[^"]*"/g, 'stroke="#05081A"')}</g>${labelPart}</svg>`
  : svg;
if (svgOut) fs.writeFileSync(svgOut, doc);
const png = new Resvg(doc, { font: { loadSystemFonts: true, defaultFontFamily: 'Calibri' }, fitTo: { mode: 'original' } }).render().asPng();
fs.writeFileSync(out, png);
console.log('wrote', out, mode, `${W}x${H}`);
