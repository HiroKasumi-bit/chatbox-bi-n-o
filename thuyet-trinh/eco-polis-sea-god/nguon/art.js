/* Paper-cut art for "The Sea God Returns" — every figure and set piece is drawn here as SVG.
   One hand: thick brown outlines, flat marker colours, cream cut-out border added by the #cut filter. */
const ART = (() => {
  const OL = '#3a2418';            // outline
  const SK = '#f7d3b2';            // skin
  const SKS = '#eab48e';           // skin shade
  const s = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${OL}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const ln = (d, w = 4, c = OL, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

  // shared SVG defs: paper cut border + grain, wood, fabric
  const DEFS = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="cut" x="-25%" y="-15%" width="150%" height="130%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="w"/>
      <feDisplacementMap in="d" in2="w" scale="7" xChannelSelector="R" yChannelSelector="G" result="dd"/>
      <feFlood flood-color="#f4e9d2"/><feComposite in2="dd" operator="in" result="border"/>
      <feGaussianBlur in="dd" stdDeviation="6" result="b"/><feOffset in="b" dx="7" dy="10" result="ob"/>
      <feFlood flood-color="#000" flood-opacity=".55"/><feComposite in2="ob" operator="in" result="shadow"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .1  0 0 0 .22 0" result="g2"/>
      <feComposite in="g2" in2="dd" operator="in" result="grain"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge>
    </filter>
    <filter id="cutSoft" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="w"/>
      <feDisplacementMap in="d" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G" result="dd"/>
      <feFlood flood-color="#efe2c6"/><feComposite in2="dd" operator="in" result="border"/>
      <feGaussianBlur in="dd" stdDeviation="5" result="b"/><feOffset in="b" dx="5" dy="8" result="ob"/>
      <feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="ob" operator="in" result="shadow"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .08  0 0 0 .2 0" result="g2"/>
      <feComposite in="g2" in2="SourceAlpha" operator="in" result="grain"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge>
    </filter>
    <filter id="grainOnly" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .28 0" result="g2"/>
      <feComposite in="g2" in2="SourceAlpha" operator="in" result="grain"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge>
    </filter>
    <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="#b5814c"/><stop offset=".5" stop-color="#d8a56a"/><stop offset="1" stop-color="#a5713f"/></linearGradient>
    <linearGradient id="velvet" x1="0" x2="1">
      <stop offset="0" stop-color="#5d0610"/><stop offset=".12" stop-color="#a3121f"/><stop offset=".22" stop-color="#c81d2c"/><stop offset=".3" stop-color="#7c0914"/>
      <stop offset=".42" stop-color="#b3162a"/><stop offset=".52" stop-color="#d22636"/><stop offset=".62" stop-color="#8a0c18"/><stop offset=".75" stop-color="#c01b2b"/>
      <stop offset=".86" stop-color="#e03040"/><stop offset="1" stop-color="#6b0712"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#d9a63a"/><stop offset="1" stop-color="#9c6b1c"/></linearGradient>
  </defs></svg>`;

  // ---------- puppet body kit (viewBox 0 0 240 560; feet ≈ y 380, stick below) ----------
  const stick = `<rect x="111" y="330" width="18" height="230" rx="5" fill="url(#wood)" stroke="${OL}" stroke-width="3"/>`;
  const face = (o = {}) => {
    const ey = o.ey || 112;
    let eyes;
    if (o.eyes === 'smile') eyes = ln(`M86 ${ey} q8 -9 16 0`, 4) + ln(`M138 ${ey} q8 -9 16 0`, 4);
    else if (o.eyes === 'angry') eyes = `<circle cx="96" cy="${ey + 2}" r="6" fill="${OL}"/><circle cx="144" cy="${ey + 2}" r="6" fill="${OL}"/>` + ln(`M82 ${ey - 14} l24 8`, 5) + ln(`M158 ${ey - 14} l-24 8`, 5);
    else eyes = `<circle cx="96" cy="${ey}" r="6.5" fill="${OL}"/><circle cx="144" cy="${ey}" r="6.5" fill="${OL}"/><circle cx="98" cy="${ey - 2}" r="2" fill="#fff"/><circle cx="146" cy="${ey - 2}" r="2" fill="#fff"/>`
      + (o.brows ? ln(`M84 ${ey - 16} q12 -6 22 -1`, 4) + ln(`M134 ${ey - 17} q12 -5 22 1`, 4) : '');
    let mouth;
    if (o.mouth === 'grin') mouth = s(`M100 ${ey + 22} q20 22 40 0 z`, '#fff') + ln(`M106 ${ey + 24} l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6`, 2.5);
    else if (o.mouth === 'open') mouth = s(`M108 ${ey + 22} q12 16 24 0 z`, '#a3313f');
    else mouth = ln(`M108 ${ey + 22} q12 10 24 0`, 4);
    const blush = `<ellipse cx="80" cy="${ey + 16}" rx="10" ry="6" fill="#f08a8a" opacity=".55"/><ellipse cx="160" cy="${ey + 16}" rx="10" ry="6" fill="#f08a8a" opacity=".55"/>`;
    return eyes + mouth + blush;
  };
  const head = (o = {}) => s('M60 104 C60 58 86 44 120 44 C154 44 180 58 180 104 C180 146 154 166 120 166 C86 166 60 146 60 104 Z', SK) + face(o);
  const legs = (pants = '#3b3a48', shoes = '#5b3a22') => s('M98 300 L96 362 L116 362 L118 300 Z', pants) + s('M122 300 L124 362 L144 362 L142 300 Z', pants)
    + s('M86 362 Q86 350 98 350 L118 352 L118 372 L88 372 Z', shoes) + s('M122 352 L142 350 Q154 350 154 362 L152 372 L122 372 Z', shoes);
  const arm = (side, sleeve, o = {}) => {
    // side: 'L' (viewer left) or 'R'; arm hangs from shoulder; returns a group with an id for animation
    const x = side === 'L' ? 72 : 168, dir = side === 'L' ? -1 : 1;
    const hand = `<circle cx="${x + dir * 12}" cy="282" r="13" fill="${o.glove || SK}" stroke="${OL}" stroke-width="4"/>`;
    return `<g class="arm arm${side}" data-ox="${x}" data-oy="190">${s(`M${x - 12} 188 Q${x + dir * 6} 186 ${x + dir * 16} 196 L${x + dir * 26} 272 L${x - dir * 2} 278 Z`, sleeve)}${hand}${o.hold || ''}</g>`;
  };

  // ---------- characters ----------
  const P = {};
  P.myNuong = () => `
    ${stick}
    ${s('M54 96 C40 160 44 250 70 330 L170 330 C196 250 200 160 186 96 Z', '#1d1714')}
    ${s('M84 178 L156 178 L190 372 L50 372 Z', '#d63a55')}
    ${s('M96 178 L144 178 L150 236 L90 236 Z', '#f4b63a')}
    ${s('M70 300 Q120 316 170 300 L178 340 Q120 356 62 340 Z', '#b82745')}
    ${ln('M84 250 Q120 262 156 250', 3, '#8e1c33')}
    ${arm('L', '#d63a55')}
    ${arm('R', '#d63a55', { hold: s('M168 268 l40 -6 l2 22 l-40 6 z', '#f1e2bf') + ln('M170 270 l38 -6', 2.5, '#b08a52') + `<circle cx="168" cy="282" r="9" fill="#9c6b1c" stroke="${OL}" stroke-width="3"/><circle cx="210" cy="276" r="9" fill="#9c6b1c" stroke="${OL}" stroke-width="3"/>` })}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({ eyes: 'smile' })}
    ${s('M58 104 C56 52 92 34 122 34 C156 34 186 54 182 104 C170 74 150 62 122 64 C96 62 72 74 58 104 Z', '#1d1714')}
    ${s('M96 30 C96 6 144 6 144 30 C144 44 96 44 96 30 Z', '#1d1714')}
    ${s('M84 44 L92 22 L104 36 L120 12 L136 36 L148 22 L156 44 Z', 'url(#gold)')}
    <circle cx="120" cy="34" r="6" fill="#e0304a" stroke="${OL}" stroke-width="3"/>
    ${s('M166 66 q16 -4 18 10 q-10 4 -18 -10 z', '#f08aa0')}`;
  P.sonTinh = () => `
    ${stick}
    ${s('M60 176 C34 230 30 300 40 356 L200 356 C210 300 206 230 180 176 Z', '#2f7d4a')}
    ${legs('#5a4630', '#4a2f1c')}
    ${s('M78 178 L162 178 L168 304 L72 304 Z', '#8a5a2b')}
    ${s('M78 182 L98 178 L162 292 L150 304 Z', '#f28c28')}
    <text x="122" y="248" font-family="Arial" font-weight="900" font-size="15" fill="#3a2418" transform="rotate(62 122 248)" text-anchor="middle">MAYOR</text>
    ${s('M70 296 L170 296 L172 314 L68 314 Z', '#6a4220')}
    ${arm('L', '#8a5a2b')}
    ${arm('R', '#8a5a2b', { hold: s('M176 266 l-8 -150 l14 0 l8 150 z', '#8b5a2b') + s('M162 128 l14 -36 l14 18 l10 -14 l12 32 z', '#3e8e57') })}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({ brows: true })}
    ${s('M60 98 C58 56 88 40 120 40 C152 40 182 56 180 98 C168 76 146 68 120 70 C94 68 72 76 60 98 Z', '#2a1b12')}
    ${s('M62 58 L80 14 L98 46 L120 0 L142 46 L160 14 L178 58 Z', '#3e8e57')}
    ${s('M80 14 L88 30 L72 34 Z', '#fff', 'stroke-width="2"')}${s('M120 0 L128 18 L112 18 Z', '#fff', 'stroke-width="2"')}${s('M160 14 L168 34 L152 30 Z', '#fff', 'stroke-width="2"')}
    ${s('M60 54 L180 54 L180 70 L60 70 Z', 'url(#gold)')}`;
  P.thuyTinh = () => `
    ${stick}
    ${s('M56 170 C30 240 30 310 44 360 L196 360 C210 310 210 240 184 170 Z', '#1f4f8f')}
    ${legs('#183b66', '#122a4a')}
    ${s('M78 178 L162 178 L172 308 L68 308 Z', '#2b78c2')}
    ${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => ln(`M${84 + c * 16 + (r % 2) * 8} ${200 + r * 24} q8 10 16 0`, 2.5, '#9fd4ff')).join('')).join('')}
    ${arm('L', '#2b78c2', { hold: s('M44 300 C20 260 40 220 70 250 C60 270 66 290 84 300 Z', '#5fc0f0', 'opacity=".95"') })}
    ${arm('R', '#2b78c2', { hold: s('M176 300 l6 -232 l12 0 l-4 232 z', '#d9d9e6') + s('M160 92 l12 -40 l10 30 l10 -40 l10 40 l10 -30 l10 40 l-8 12 l-46 0 z', '#ffcf4a') })}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({ eyes: 'angry', mouth: 'grin' })}
    ${s('M78 140 C80 176 100 200 120 214 C140 200 160 176 162 140 C150 158 136 164 120 164 C104 164 90 158 78 140 Z', '#3aa0c8')}
    ${s('M100 132 q20 -14 40 0 q-20 6 -40 0 z', '#3aa0c8')}
    ${s('M56 108 C40 70 70 34 120 32 C170 34 200 70 184 108 C176 84 158 70 120 70 C82 70 64 84 56 108 Z', '#3aa0c8')}
    ${s('M60 62 C70 34 86 46 92 30 C102 46 112 18 120 34 C128 18 138 46 148 30 C154 46 170 34 180 62 Z', '#2a8fd6')}
    ${ln('M66 60 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 20 0 q10 -12 16 -2', 3.5, '#fff')}`;
  const tee = (logo = '') => s('M74 176 L166 176 L176 304 L64 304 Z', '#1f2d4f') + s('M64 280 L176 280 L176 304 L64 304 Z', '#1f2d4f') + s('M72 246 L168 246 L170 258 L70 258 Z', '#f28c28') + logo;
  P.huy = () => `
    ${stick}
    ${legs('#3b3a48')}
    ${tee()}
    ${arm('L', '#1f2d4f')}
    ${arm('R', '#1f2d4f', { hold: s('M150 262 l66 -24 l8 18 l-66 24 z', '#8ec5ef') + ln('M160 270 l58 -21', 2.5, '#2d5f8f') + `<ellipse cx="218" cy="246" rx="7" ry="11" fill="#cfe7fb" stroke="${OL}" stroke-width="3" transform="rotate(-20 218 246)"/>` })}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({})}
    ${s('M60 100 C58 70 76 60 92 64 C110 58 132 58 150 64 C166 60 182 70 180 100 C170 86 150 80 120 80 C90 80 70 86 60 100 Z', '#2a1b12')}
    ${s('M50 76 C52 22 188 22 190 76 L196 78 L196 90 L44 90 L44 78 Z', '#ffd23a')}
    ${s('M108 24 L132 24 L136 78 L104 78 Z', '#f2bc20')}
    ${s('M56 66 L184 66 L184 78 L56 78 Z', '#333')}
    <circle cx="94" cy="72" r="13" fill="#8fd3ff" stroke="${OL}" stroke-width="4"/><circle cx="146" cy="72" r="13" fill="#8fd3ff" stroke="${OL}" stroke-width="4"/>`;
  const turbine = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})">${s('M-3 0 L3 0 L5 80 L-5 80 Z', '#f4f4f4')}<g class="spin">${s('M0 0 L-6 -46 L6 -46 Z', '#fff')}${s('M0 0 L42 18 L36 28 Z', '#fff')}${s('M0 0 L-38 28 L-42 18 Z', '#fff')}<circle r="6" fill="#ccc" stroke="${OL}" stroke-width="3"/></g></g>`;
  P.bach = () => `
    ${stick}
    ${legs('#3b3a48')}
    ${tee()}
    ${arm('L', '#1f2d4f', { glove: '#8d8d96' })}
    ${s('M64 210 L84 206 L88 226 L66 230 Z', '#f28c28')}
    ${arm('R', '#1f2d4f', { glove: '#8d8d96', hold: turbine(196, 200, .85) })}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({ mouth: 'open' })}
    ${s('M58 96 L66 50 L80 64 L88 34 L104 56 L118 26 L132 54 L148 30 L156 58 L172 44 L182 96 C170 80 150 74 120 74 C90 74 70 80 58 96 Z', '#2a1b12')}`;
  P.khang = () => `
    ${stick}
    ${legs('#3b3a48')}
    ${tee()}
    ${s('M150 206 L172 204 L176 226 L152 230 Z', '#f28c28')}
    <text x="163" y="221" font-family="Arial" font-weight="900" font-size="8" fill="#1f2d4f" text-anchor="middle">SAFETY</text>
    ${arm('L', '#1f2d4f', { hold: s('M36 262 L58 262 L58 304 L36 304 Z', '#2b2b2b') + ln('M42 262 L40 226', 4) + `<circle cx="40" cy="224" r="5" fill="#e33" stroke="${OL}" stroke-width="2"/><rect x="40" y="272" width="14" height="10" fill="#7fe0a0"/>` })}
    ${arm('R', '#1f2d4f')}
    ${s('M108 160 L132 160 L134 182 L106 182 Z', SKS)}
    ${head({ brows: true })}
    ${s('M60 100 C58 72 80 62 120 62 C160 62 182 72 180 100 C170 88 150 82 120 82 C90 82 70 88 60 100 Z', '#2a1b12')}
    ${s('M52 82 C52 24 188 24 188 82 L192 84 L192 94 L48 94 L48 84 Z', '#f2f2f2')}
    ${s('M60 64 L180 64 L182 76 L58 76 Z', '#f7d21a')}${s('M78 34 L162 34 L168 46 L72 46 Z', '#f7d21a')}
    <g class="beacon">${s('M110 10 L130 10 L132 28 L108 28 Z', '#e8293a')}</g>`;

  const puppetSVG = (id, extraClass = '') => `<svg class="pup ${extraClass}" viewBox="-20 -20 280 600" width="280" height="600" filter="url(#cut)">${P[id]()}</svg>`;

  // ---------- stage chrome ----------
  const curtainSide = (flip) => `<svg viewBox="0 0 360 1080" width="360" height="1080" preserveAspectRatio="none" style="${flip ? 'transform:scaleX(-1)' : ''}" filter="url(#cutSoft)">
    <path d="M0 0 L300 0 C250 240 170 420 150 560 C140 640 175 720 220 820 C250 900 230 1000 210 1080 L0 1080 Z" fill="url(#velvet)" stroke="#3a0006" stroke-width="5"/>
    ${[40, 90, 135, 180, 225].map((x, i) => `<path d="M${x} 0 C${x - 20 + i * 4} 300 ${x * .55 + 20} 520 ${x * .5 + 30} 600 C${x * .45 + 30} 700 ${x * .6 + 30} 880 ${x * .7 + 20} 1080" fill="none" stroke="#4d030b" stroke-width="5" opacity=".55"/>`).join('')}
    <path d="M128 560 C170 540 200 600 166 632 C140 650 112 600 128 560 Z" fill="url(#gold)" stroke="#5a3a00" stroke-width="4"/>
    <path d="M150 620 C160 680 150 720 136 770" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linecap="round"/>
    <path d="M128 760 l14 40 l14 -38 z" fill="url(#gold)" stroke="#5a3a00" stroke-width="3"/>
  </svg>`;
  const valance = () => {
    let swags = '';
    for (let i = 0; i < 6; i++) {
      const x = i * 320;
      swags += `<path d="M${x} 0 L${x + 320} 0 L${x + 320} 70 C${x + 250} 180 ${x + 70} 180 ${x} 70 Z" fill="url(#velvet)" stroke="#3a0006" stroke-width="5"/>
      <path d="M${x + 10} 80 C${x + 80} 172 ${x + 240} 172 ${x + 310} 80" fill="none" stroke="#4d030b" stroke-width="5" opacity=".6"/>
      <path d="M${x} 72 C${x + 70} 176 ${x + 250} 176 ${x + 320} 72" fill="none" stroke="url(#gold)" stroke-width="10"/>
      ${Array.from({ length: 15 }, (_, k) => { const t = k / 14, px = x + 10 + t * 300, py = 76 + Math.sin(t * Math.PI) * 96; return `<path d="M${px} ${py} l-5 20 l10 0 z" fill="url(#gold)" stroke="#6b4a00" stroke-width="1.5"/>`; }).join('')}
      <circle cx="${x}" cy="66" r="16" fill="url(#gold)" stroke="#5a3a00" stroke-width="4"/>`;
    }
    return `<svg viewBox="0 0 1920 200" width="1920" height="200" filter="url(#cutSoft)"><rect x="0" y="0" width="1920" height="64" fill="url(#velvet)" stroke="#3a0006" stroke-width="5"/>${swags}</svg>`;
  };
  const curtainClosed = (flip) => `<svg viewBox="0 0 980 1080" width="980" height="1080" preserveAspectRatio="none" style="${flip ? 'transform:scaleX(-1)' : ''}" filter="url(#cutSoft)">
    <path d="M0 0 L980 0 L960 1080 L0 1080 Z" fill="url(#velvet)" stroke="#3a0006" stroke-width="6"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 105} 0 C${50 + i * 105} 360 ${70 + i * 105} 720 ${55 + i * 105} 1080" fill="none" stroke="#4d030b" stroke-width="7" opacity=".55"/>`).join('')}
    <path d="M0 1050 L960 1050" stroke="url(#gold)" stroke-width="16"/>
  </svg>`;

  // ---------- scenery ----------
  const mountainsLegend = () => `<svg viewBox="0 0 1520 460" width="1520" height="460" preserveAspectRatio="none">
    <g filter="url(#cutSoft)"><path d="M0 460 L0 250 L120 140 L210 220 L330 70 L470 230 L560 160 L700 300 L760 460 Z" fill="#6f8f62" stroke="${OL}" stroke-width="4"/>
    <path d="M330 70 L300 110 L330 100 L352 120 L366 96 Z" fill="#f4f1e6" stroke="${OL}" stroke-width="3"/></g>
    <g filter="url(#cutSoft)"><path d="M0 460 L0 330 L150 230 L260 300 L380 200 L520 330 L640 460 Z" fill="#4f7a4c" stroke="${OL}" stroke-width="4"/>
    ${[[120, 300], [180, 320], [330, 280], [420, 300], [470, 350]].map(([x, y]) => `<path d="M${x} ${y} l-16 34 l32 0 z" fill="#2f5f3a" stroke="${OL}" stroke-width="3"/>`).join('')}</g>
  </svg>`;
  const waves = (cls, color, hi, h = 140, amp = 26, period = 160) => {
    let d = `M-200 ${h}`;
    for (let x = -200; x <= 1720 + 200; x += period) d += ` q${period / 4} ${-amp} ${period / 2} 0 q${period / 4} ${amp * .6} ${period / 2} 0`;
    d += ` L1920 ${h + 400} L-200 ${h + 400} Z`;
    let crest = '';
    for (let x = -200; x <= 1920; x += period) crest += `<path d="M${x + period * .12} ${h - amp * .55} q${period * .14} -14 ${period * .3} 0" fill="none" stroke="${hi}" stroke-width="7" stroke-linecap="round"/>`;
    return `<svg class="${cls}" viewBox="-200 0 2120 ${h + 260}" width="2120" height="${h + 260}" filter="url(#cutSoft)"><path d="${d}" fill="${color}" stroke="${OL}" stroke-width="4"/>${crest}</svg>`;
  };
  const cloud = (w = 320, fill = '#6d7686') => `<svg viewBox="0 0 320 170" width="${w}" height="${w * 170 / 320}" filter="url(#cutSoft)"><path d="M30 140 C0 140 0 96 34 92 C30 52 80 40 102 64 C112 20 176 14 190 56 C214 30 268 40 266 84 C304 84 314 140 278 140 Z" fill="${fill}" stroke="${OL}" stroke-width="4"/><path d="M60 118 q30 14 60 0 M150 112 q34 14 70 0" fill="none" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round"/></svg>`;
  const bolt = () => `<svg viewBox="0 0 160 420" width="160" height="420" filter="url(#cutSoft)"><path d="M92 0 L30 190 L84 186 L20 420 L140 150 L84 156 L132 0 Z" fill="#ffe14a" stroke="${OL}" stroke-width="4"/></svg>`;
  const sunSVG = () => `<svg viewBox="0 0 300 300" width="300" height="300" filter="url(#cutSoft)"><g class="spinSlow" style="transform-origin:150px 150px">${Array.from({ length: 12 }, (_, i) => `<path d="M150 150 L${150 + Math.cos(i * Math.PI / 6 - .12) * 140} ${150 + Math.sin(i * Math.PI / 6 - .12) * 140} L${150 + Math.cos(i * Math.PI / 6 + .12) * 140} ${150 + Math.sin(i * Math.PI / 6 + .12) * 140} Z" fill="#ffc54a" stroke="${OL}" stroke-width="3"/>`).join('')}</g><circle cx="150" cy="150" r="78" fill="#ffdd6a" stroke="${OL}" stroke-width="4"/><circle cx="124" cy="140" r="7" fill="${OL}"/><circle cx="176" cy="140" r="7" fill="${OL}"/><path d="M126 172 q24 18 48 0" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><ellipse cx="108" cy="162" rx="10" ry="6" fill="#f08a6a" opacity=".6"/><ellipse cx="192" cy="162" rx="10" ry="6" fill="#f08a6a" opacity=".6"/></svg>`;
  const moonSVG = () => `<svg viewBox="0 0 200 200" width="200" height="200" filter="url(#cutSoft)"><path d="M130 20 C60 20 30 120 90 170 C130 200 180 180 190 150 C130 160 90 110 130 20 Z" fill="#f4ecc8" stroke="${OL}" stroke-width="4"/></svg>`;

  // the paper cliff city (viewBox 0 0 700 640)
  const city = () => {
    const houses = (cx, cy, r, a0, a1, n) => {
      let o = '';
      for (let i = 0; i < n; i++) {
        const a = a0 + (a1 - a0) * i / (n - 1), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .45;
        o += `<g transform="translate(${x} ${y})"><rect x="-11" y="-14" width="22" height="16" fill="#f4e6cf" stroke="${OL}" stroke-width="2.5"/><path d="M-14 -13 L0 -25 L14 -13 Z" fill="#a2462c" stroke="${OL}" stroke-width="2.5"/><rect class="lit" x="-4" y="-9" width="7" height="6" fill="#ffd34d"/></g>`;
      }
      return o;
    };
    const tree = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3f8a4a" stroke="${OL}" stroke-width="3"/>`;
    return `<svg viewBox="0 0 700 640" width="700" height="640" class="citySVG">
    <g filter="url(#cutSoft)">
      <path d="M30 640 L40 520 L22 440 L50 340 L40 250 L70 170 L60 120 L170 96 L300 110 L420 80 L520 120 L640 190 L690 260 L700 640 Z" fill="#8f7d6b" stroke="${OL}" stroke-width="5"/>
      <path d="M50 300 l70 10 M40 420 l90 -6 M60 520 l120 6 M210 300 l60 30 M150 430 l80 20" stroke="#6a5a4b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 120 L170 96 L300 110 L420 80 L520 120 L640 190 L690 260 L640 250 L520 150 L420 112 L300 136 L170 124 L66 148 Z" fill="#5fa152" stroke="${OL}" stroke-width="4"/>
    </g>
    <g filter="url(#cutSoft)">
      ${[[0, 360, 250, 230], [1, 380, 300, 210], [2, 400, 352, 190], [3, 420, 404, 170]].map(([i, cx, cy, r]) => `<path d="M${cx - r * .2} ${cy} q${r * .7} ${-50 + i * 4} ${r * 1.4} ${-40 + i * 6} l12 22 q${-r * .7} ${-36} ${-r * 1.38} ${40 - i * 4} z" fill="#7cbf63" stroke="${OL}" stroke-width="3"/>`).join('')}
    </g>
    <g class="homes">${houses(550, 290, 120, -2.6, -.25, 7)}${houses(560, 340, 115, -2.7, -.2, 7)}${houses(575, 392, 105, -2.8, -.15, 6)}${houses(590, 444, 92, -2.9, -.2, 5)}</g>
    <g class="trees">${[[200, 112], [228, 104], [330, 100], [358, 96], [470, 112], [600, 196], [640, 226], [262, 230], [240, 300], [300, 380], [190, 470]].map(([x, y]) => tree(x, y)).join('')}</g>
    <g class="turbines">${turbine(90, 50, .8)}${turbine(140, 40, .8)}${turbine(190, 52, .7)}</g>
    <g filter="url(#cutSoft)"><rect x="96" y="112" width="70" height="14" fill="#3f6fb5" stroke="${OL}" stroke-width="3" transform="skewX(-20)"/><rect x="420" y="78" width="60" height="30" fill="#e9e2d2" stroke="${OL}" stroke-width="3"/><rect class="lit" x="430" y="86" width="10" height="8" fill="#ffd34d"/><rect class="lit" x="456" y="86" width="10" height="8" fill="#ffd34d"/>
      <ellipse cx="330" cy="118" rx="40" ry="9" fill="#4aa3d8" stroke="${OL}" stroke-width="3"/></g>
    <g class="road">${`<path d="M250 640 L270 600 L360 590 L300 560 L380 540 L310 506 L400 486" fill="none" stroke="#4b4038" stroke-width="16" stroke-linejoin="round"/><path d="M250 640 L270 600 L360 590 L300 560 L380 540 L310 506 L400 486" fill="none" stroke="#e8d9a8" stroke-width="2" stroke-dasharray="8 8"/>`}</g>
    <g class="lift" filter="url(#cutSoft)"><rect x="196" y="140" width="34" height="450" fill="#cfd4da" stroke="${OL}" stroke-width="4"/><path d="M196 140 L230 140 M213 140 L213 590" stroke="#8a929c" stroke-width="3"/><g class="cab"><rect x="199" y="540" width="28" height="40" rx="3" fill="#ffcf4a" stroke="${OL}" stroke-width="3"/><rect x="204" y="548" width="18" height="12" fill="#8fd3ff"/></g></g>
    <path d="M230 160 L410 250" stroke="${OL}" stroke-width="2.5"/><rect x="300" y="190" width="18" height="16" fill="#e8504a" stroke="${OL}" stroke-width="2.5"/>
    <g class="harbour" filter="url(#cutSoft)"><rect x="40" y="600" width="170" height="16" fill="#9a8a78" stroke="${OL}" stroke-width="3"/><path d="M80 600 l10 -16 l36 0 l10 16 z" fill="#e8504a" stroke="${OL}" stroke-width="3"/></g>
    <g class="sensors">${[[120, 300], [250, 420], [470, 220], [560, 470], [140, 430]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff3b55" stroke="#fff" stroke-width="2.5"/>`).join('')}</g>
    <g class="ug">
      <rect x="380" y="480" width="300" height="150" fill="#2d2420" stroke="${OL}" stroke-width="4"/>
      ${['B1 SHOPPING', 'B2 DEPOT · FOOD', 'B3 SHELTER', 'B4 NIGHT MARKET'].map((t, i) => `<rect x="392" y="${488 + i * 35}" width="276" height="29" rx="4" fill="${['#c9a77a', '#a68c6c', '#d9534f', '#e9a23b'][i]}" stroke="${OL}" stroke-width="2.5"/><text x="402" y="${508 + i * 35}" font-family="Arial" font-weight="900" font-size="15" fill="#2a1a12">${t}</text>`).join('')}
      <g class="lanterns">${[430, 470, 510, 550, 590, 630].map(x => `<circle cx="${x}" cy="604" r="6" fill="#ff6a3a" stroke="${OL}" stroke-width="2"/>`).join('')}</g>
      <g class="ugPeople">${[420, 452, 600, 634].map(x => `<circle cx="${x}" cy="566" r="6" fill="#f7d3b2" stroke="${OL}" stroke-width="2"/>`).join('')}</g>
    </g>
    <g class="flap"><path d="M380 480 L690 470 L700 640 L370 640 Z" fill="#7d6c5c" stroke="${OL}" stroke-width="5"/><path d="M400 540 l120 10 M420 600 l160 -8 M560 520 l100 14" stroke="#5e5044" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g class="mud"><path d="M230 640 C220 600 260 560 300 556 C340 520 400 520 410 480 C440 500 430 560 390 590 C380 630 320 640 230 640 Z" fill="#6b4422" stroke="${OL}" stroke-width="4"/><path d="M290 590 q20 -10 40 0 M350 540 q14 -8 30 0" stroke="#4a2c14" stroke-width="4" fill="none"/></g>
  </svg>`;
  };

  const rock = (w = 70, c = '#7a6a5a') => `<svg viewBox="0 0 70 60" width="${w}" height="${w * 60 / 70}" filter="url(#cutSoft)"><path d="M6 40 L14 10 L40 4 L64 22 L60 50 L24 56 Z" fill="${c}" stroke="${OL}" stroke-width="4"/></svg>`;
  const placard = () => `<svg viewBox="0 0 760 200" width="760" height="200" filter="url(#cutSoft)"><path d="M120 0 L170 60 M640 0 L590 60" stroke="#c9a46a" stroke-width="6"/><rect x="40" y="56" width="680" height="128" rx="18" fill="#e9d3a6" stroke="${OL}" stroke-width="5"/><rect x="58" y="72" width="644" height="96" rx="12" fill="none" stroke="#a5713f" stroke-width="3" stroke-dasharray="10 8"/><circle cx="170" cy="62" r="8" fill="#9c6b1c" stroke="${OL}" stroke-width="3"/><circle cx="590" cy="62" r="8" fill="#9c6b1c" stroke="${OL}" stroke-width="3"/></svg>`;
  return { DEFS, puppetSVG, curtainSide, valance, curtainClosed, mountainsLegend, waves, cloud, bolt, sunSVG, moonSVG, city, rock, placard, turbine };
})();
