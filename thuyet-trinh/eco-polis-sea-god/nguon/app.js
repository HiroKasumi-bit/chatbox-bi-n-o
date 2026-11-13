/* The Sea God Returns — paper puppet theatre deck for the Eco-Polis final pitch.
   Each click moves to the next "beat" of the script. A beat is a full description of the stage, so ← works too.
   When an engineer or the safety commander speaks, the stage blurs and their puppet appears with the city structure. */
(() => {
  const $ = (q, r = document) => r.querySelector(q);
  const stage = $('#stage'), world = $('#world');
  function fit() { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
  addEventListener('resize', fit); fit();
  document.body.insertAdjacentHTML('afterbegin', ART.DEFS);
  gsap.ticker.lagSmoothing(0); // keep every move on time, even on a slow laptop
  const el = (tag, cls, html, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (css) e.style.cssText = css; if (parent) parent.appendChild(e); return e; };

  // ---------------- SOUND (synthesised, no files) ----------------
  const SND = (() => {
    let ctx, master, on = true, rainGain, rainSrc, windGain;
    const init = () => {
      if (ctx) return; ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
      const buf = noiseBuf(2); rainSrc = ctx.createBufferSource(); rainSrc.buffer = buf; rainSrc.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .5; rainGain = ctx.createGain(); rainGain.gain.value = 0;
      rainSrc.connect(f); f.connect(rainGain); rainGain.connect(master); rainSrc.start();
      const w = ctx.createBufferSource(); w.buffer = buf; w.loop = true; const wf = ctx.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 500; windGain = ctx.createGain(); windGain.gain.value = 0;
      w.connect(wf); wf.connect(windGain); windGain.connect(master); w.start();
      const lfo = ctx.createOscillator(); lfo.frequency.value = .17; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(wf.frequency); lfo.start();
    };
    const noiseBuf = (sec) => { const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + dec); };
    const noise = (dur, type, freq, peak, a = .01, q = 1, delay = 0) => {
      if (!ctx || !on) return; const t = ctx.currentTime + delay, s = ctx.createBufferSource(); s.buffer = noiseBuf(dur + .1);
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); env(g, t, a, peak, dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + a + .1); return f;
    };
    const tone = (freq, dur, type = 'sine', peak = .2, delay = 0, slideTo) => {
      if (!ctx || !on) return; const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur); env(g, t, .008, peak, dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    };
    const fx = {
      curtain() { const f = noise(1.6, 'bandpass', 900, .5, .25, .6); if (f) f.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 1.4); },
      thunder() { noise(.25, 'highpass', 2000, .7, .005); noise(3.2, 'lowpass', 260, 1.1, .05, .7, .05); noise(2.6, 'lowpass', 120, 1, .3, .7, .4); },
      pop() { tone(520, .12, 'triangle', .25, 0, 820); },
      whoosh() { const f = noise(.7, 'bandpass', 400, .45, .15, 1.2); if (f) f.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + .6); },
      back() { const f = noise(.6, 'bandpass', 2600, .35, .1, 1.2); if (f) f.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + .5); },
      drum() { [0, .28, .56, .7].forEach((d, i) => { tone(i === 3 ? 70 : 95, .35, 'sine', .9, d, 45); noise(.1, 'lowpass', 900, .3, .002, 1, d); }); },
      zap() { for (let i = 0; i < 6; i++) noise(.06, 'highpass', 3000, .5, .002, 1, i * .07 + Math.random() * .03); tone(180, .9, 'sawtooth', .16, .45, 30); },
      powerOn() { tone(60, .9, 'sawtooth', .1, 0, 240); tone(880, .3, 'sine', .12, .7); },
      thud() { tone(80, .4, 'sine', 1, 0, 40); noise(.2, 'lowpass', 400, .6, .002); },
      splash() { noise(1.2, 'bandpass', 700, .6, .05, .8); noise(.8, 'highpass', 2500, .25, .1, 1, .2); },
      mud() { noise(1.8, 'lowpass', 300, .9, .2, 1); for (let i = 0; i < 8; i++) tone(90 + Math.random() * 60, .12, 'sine', .3, .2 + i * .17, 50); },
      tick() { tone(1800, .05, 'square', .12); tone(900, .07, 'triangle', .2); },
      ding() { [1318, 1760, 2637].forEach((f, i) => tone(f, 1.6, 'sine', .22 / (i + 1), 0)); },
      hum() { tone(70, 5, 'sawtooth', .06, 0, 140); },
      rumble() { noise(4, 'lowpass', 160, 1.2, .4, .8); for (let i = 0; i < 10; i++) noise(.25, 'lowpass', 600, .5, .01, 1, .3 + i * .33); },
      alarm() {
        // two-tone emergency attention signal (853 Hz + 960 Hz), pulsed, plus a siren sweep
        for (let k = 0; k < 7; k++) { tone(853, .38, 'square', .09, k * .55); tone(960, .38, 'square', .09, k * .55); }
        if (!ctx || !on) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth';
        for (let i = 0; i < 4; i++) { o.frequency.setValueAtTime(520, t + i * 1); o.frequency.linearRampToValueAtTime(1150, t + i * 1 + .5); o.frequency.linearRampToValueAtTime(520, t + i * 1 + 1); }
        g.gain.setValueAtTime(.0, t); g.gain.linearRampToValueAtTime(.07, t + .1); g.gain.setValueAtTime(.07, t + 3.8); g.gain.linearRampToValueAtTime(0, t + 4); o.connect(g); g.connect(master); o.start(t); o.stop(t + 4.1);
      },
      chime() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 1.4, 'sine', .16, i * .12)); },
      coin() { tone(988, .08, 'square', .1); tone(1318, .5, 'square', .1, .08); },
      applause() { for (let i = 0; i < 90; i++) noise(.05, 'bandpass', 1500 + Math.random() * 2500, .25 + Math.random() * .2, .002, 1.5, Math.random() * 3.2); },
      sparkle() { for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 1600, .3, 'sine', .07, i * .09); },
      boing() { tone(200, .5, 'triangle', .3, 0, 520); },
      sad() { tone(392, .4, 'triangle', .18); tone(370, .4, 'triangle', .18, .35); tone(349, .9, 'triangle', .18, .7); },
    };
    return {
      init, play(n) { try { fx[n] && fx[n](); } catch (e) { } },
      rain(level) { if (!ctx) return; rainGain.gain.setTargetAtTime(on ? [0, .08, .18, .32][level] : 0, ctx.currentTime, .6); },
      wind(level) { if (!ctx) return; windGain.gain.setTargetAtTime(on ? [0, .15, .35, .6][level] : 0, ctx.currentTime, .8); },
      toggle() { on = !on; if (ctx) master.gain.value = on ? .9 : 0; return on; },
    };
  })();

  // ---------------- BUILD THE STAGE ----------------
  const L = id => $('#' + id);
  L('legend').innerHTML = ART.mountainsLegend(); gsap.set('#legend', { x: 150, y: 500 });
  L('sun').innerHTML = ART.sunSVG(); gsap.set('#sun', { x: 1330, y: 120, scale: .8 });
  L('moon').innerHTML = ART.moonSVG(); gsap.set('#moon', { x: 1420, y: 130 });
  const clouds = [[260, 100, 380], [640, 80, 330], [1000, 110, 400], [1380, 90, 360], [450, 190, 300], [1180, 200, 300]].map(([x, y, w], i) => {
    const c = el('div', 'layer', ART.cloud(w, i > 3 ? '#555d6c' : '#6d7686'), L('clouds')); c.dataset.x = x; c.dataset.y = y; gsap.set(c, { x, y: -320 }); return c;
  });
  L('city').innerHTML = ART.city(); gsap.set('#city', { x: 1040, y: 300 });
  const cityEl = L('city');
  const cab = $('.cab', cityEl), flap = $('.flap', cityEl), mud = $('.mud', cityEl);
  // sea layers
  const seaB = el('div', 'layer', ART.waves('waveA', '#3c8ccc', '#d6f1ff', 120, 22, 180), L('seaBack')); gsap.set(seaB, { x: -100, y: 770 });
  const seaB2 = el('div', 'layer', ART.waves('waveB', '#2466a8', '#bfe8ff', 120, 26, 150), L('seaBack')); gsap.set(seaB2, { x: -100, y: 812 });
  const seaF = el('div', 'layer', ART.waves('waveC', '#1f5b9c', '#cdeeff', 130, 34, 200), L('seaFront')); gsap.set(seaF, { x: -100, y: 1100 });
  // floor
  L('floor').innerHTML = `<svg viewBox="0 0 1920 190" width="1920" height="190"><defs><linearGradient id="boards" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4a2a17"/><stop offset="1" stop-color="#2a160b"/></linearGradient></defs>
    <path d="M150 0 L1770 0 L1920 110 L0 110 Z" fill="url(#boards)"/>${Array.from({ length: 13 }, (_, i) => { const t = i / 12; return `<path d="M${150 + t * 1620} 0 L${t * 1920} 110" stroke="#1d0e06" stroke-width="3" opacity=".7"/>`; }).join('')}
    <path d="M100 38 L1820 38 M50 74 L1870 74" stroke="#1d0e06" stroke-width="2" opacity=".5"/>
    <rect x="0" y="108" width="1920" height="82" fill="#5d0610"/><rect x="0" y="108" width="1920" height="12" fill="url(#gold)"/><rect x="0" y="176" width="1920" height="6" fill="url(#gold)" opacity=".7"/></svg>`;
  // curtains
  const cur = L('curtains');
  const curL = el('div', 'abs', ART.curtainSide(false), cur), curR = el('div', 'abs', ART.curtainSide(true), cur); gsap.set(curR, { x: 1560 });
  const closeL = el('div', 'abs', ART.curtainClosed(false), cur), closeR = el('div', 'abs', ART.curtainClosed(true), cur); gsap.set(closeL, { x: 0 }); gsap.set(closeR, { x: 940 });
  el('div', 'abs', ART.valance(), cur);
  // effects layer: bolts, rocks, typhoon, vs
  const fxL = L('fx');
  const bolts = [el('div', 'layer', ART.bolt(), fxL), el('div', 'layer', ART.bolt(), fxL)]; gsap.set(bolts[0], { x: 1180, y: 120, opacity: 0 }); gsap.set(bolts[1], { x: 520, y: 140, opacity: 0, scaleX: -1 });
  const rocks = Array.from({ length: 6 }, (_, i) => { const r = el('div', 'layer', ART.rock(50 + (i % 3) * 18), fxL); gsap.set(r, { x: 1500 + i * 24, y: 260 - i * 10, opacity: 0 }); return r; });
  const typhoon = el('div', 'layer', `<svg viewBox="0 0 400 400" width="400" height="400" filter="url(#cutSoft)"><g class="spin" style="animation-duration:3s">${[0, 1, 2].map(i => `<path d="M200 200 m-${150 - i * 40} 0 a${150 - i * 40} ${150 - i * 40} 0 1 1 ${80 - i * 10} ${120 - i * 30}" fill="none" stroke="${['#7d8aa0', '#9aa7bd', '#c4cfe0'][i]}" stroke-width="${26 - i * 6}" stroke-linecap="round" transform="rotate(${i * 120} 200 200)"/>`).join('')}<circle cx="200" cy="200" r="22" fill="#2f3440" stroke="#3a2418" stroke-width="4"/></g></svg>`, fxL);
  gsap.set(typhoon, { x: 1250, y: 90, opacity: 0, scale: .4 });
  // props
  const PR = L('props');
  const placard = el('div', 'prop', ART.placard() + `<div class="txt"><div><div class="k"></div><div class="t"></div></div></div>`, PR); placard.id = 'placard'; gsap.set(placard, { y: -260, opacity: 1 });
  const title = el('div', 'prop', `<div class="k">Eco-Polis · The Cliff City presents</div><div class="t">The Sea God Returns</div><div class="s">Sơn Tinh &amp; Thủy Tinh · the year 2050</div><div class="g">Group 6 · Class 11A4 · Le Quy Don High School</div><div class="logos"><img src="img/logo_eco.png" alt="Eco-Polis logo"><img src="img/logo_school.png" alt="Le Quy Don High School logo"></div>`, null); title.id = 'title';
  const crisisData = [['⛰', 'Landslides', 'rain loosens the slopes'], ['▭', 'Almost no flat land', 'homes fight for narrow ledges'], ['⇄', 'One road in, one road out', 'a jam that becomes a trap'], ['💧', 'No rivers on top', 'rain runs off the bare rock']];
  const crisis = crisisData.map((c, i) => { const d = el('div', 'prop card chipcard', `<div class="ic">${c[0]}</div><div class="h">${c[1]}</div><div class="d">${c[2]}</div>`, PR); gsap.set(d, { x: [500, 850, 500, 850][i], y: [330, 330, 620, 620][i], rotation: [-3, 2, 2, -2][i] }); return d; });
  const news = el('div', 'prop card', `<div class="m">The Mountain Times · Sept 2024</div><div class="h">Typhoon Yagi cuts off whole villages</div><div class="d">Lao Cai and Yen Bai are isolated. Army helicopters fly in food and supplies.</div>`, PR); news.id = 'news'; gsap.set(news, { x: 1230, y: 470 });
  const qrCard = el('div', 'prop card', `<div class="h">Our street interviews</div><img src="img/qr_interview.png" alt="QR code: interview video"><div class="d">9 people from other countries</div>`, PR); qrCard.id = 'qrCard'; gsap.set(qrCard, { x: 690, y: 300, rotation: -2 });
  const interview = [['✓', 'Good infrastructure'], ['✓', 'Easy transit'], ['✓', 'Green spaces'], ['✗', 'Housing costs & traffic']].map((c, i) => {
    const d = el('div', 'prop card', `<span style="font-size:40px;color:${c[0] === '✓' ? '#2f8a4a' : '#c0283a'};margin-right:12px">${c[0]}</span><span style="font-family:var(--title);font-size:34px">${c[1]}</span>`, PR);
    d.style.width = '470px'; gsap.set(d, { x: 1250, y: 320 + i * 140, rotation: i % 2 ? 1.5 : -1.5 }); return d;
  });
  const counter = el('div', 'prop', '', PR); counter.id = 'counter'; gsap.set(counter, { y: 330 });
  const rideCab = el('div', 'prop', `<svg viewBox="0 0 220 280" width="220" height="280" filter="url(#cutSoft)"><path d="M10 10 H210 V270 H10 Z M30 50 V250 H190 V50 Z" fill="#ffcf4a" fill-rule="evenodd" stroke="#3a2418" stroke-width="5"/><rect x="60" y="18" width="100" height="24" rx="6" fill="#3a2418"/><text x="110" y="36" font-family="Arial" font-weight="900" font-size="16" fill="#ffcf4a" text-anchor="middle">150 m · 40 s</text></svg>`, null);
  rideCab.style.zIndex = 5;
  const scroll = el('div', 'prop card', '', PR); scroll.id = 'scroll'; gsap.set(scroll, { x: 640, y: 320, rotation: -1.5 });
  const stem = el('div', 'prop', `<svg viewBox="0 0 680 310" width="680" height="310" filter="url(#cutSoft)"><rect x="10" y="10" width="660" height="290" rx="18" fill="#cfe8c4" stroke="#3a2418" stroke-width="5"/><rect x="34" y="34" width="612" height="242" rx="12" fill="none" stroke="#2f7a45" stroke-width="4" stroke-dasharray="12 8"/>
    <circle cx="150" cy="155" r="88" fill="#a8d69a" stroke="#2f7a45" stroke-width="5"/><text x="150" y="190" font-family="Yeseva One, Georgia" font-size="110" fill="#2f7a45" text-anchor="middle">$</text>
    <text x="440" y="120" font-family="Yeseva One, Georgia" font-size="58" fill="#1f5a33" text-anchor="middle">STEM DOLLARS</text><text x="440" y="178" font-family="Patrick Hand, Arial" font-size="36" fill="#2f5a3a" text-anchor="middle">Invest in Eco-Polis</text>
    <text x="440" y="232" font-family="Patrick Hand, Arial" font-size="28" fill="#2f5a3a" text-anchor="middle">a home on the edge of tomorrow</text></svg>`, PR); stem.id = 'stem'; gsap.set(stem, { x: 960, y: 330, rotation: -4 });
  const slogan = el('div', 'prop', `<div class="r">Carved by nature. Powered by the sea.<br>Built for everyone!</div>`, PR); slogan.id = 'slogan';
  const vs = el('div', 'prop', `<svg viewBox="0 0 200 200" width="200" height="200" filter="url(#cutSoft)"><path d="M100 6 L124 70 L194 70 L138 110 L160 180 L100 138 L40 180 L62 110 L6 70 L76 70 Z" fill="#ffcf4a" stroke="#3a2418" stroke-width="5"/><text x="100" y="128" font-family="Yeseva One, Georgia" font-size="58" fill="#b3162a" text-anchor="middle">VS</text></svg>`, PR); vs.id = 'vs';
  const qa = el('div', 'prop', `<div class="t">Questions from the Sharks</div><div class="s">Thank you for watching our play!</div><div class="row">
    <div class="card"><img src="img/qr_interview.png" alt="QR code: street interview video"><b>Street interviews</b><span>9 people, real answers</span></div>
    <div class="card"><img src="img/qr_island.png" alt="QR code: Eco-Polis 3D island"><b>Our 3D island</b><span>spin it, tap any building</span></div></div>`, null); qa.id = 'qa';
  // title + qa + ride cab sit in front of the curtains / props
  cur.appendChild(title); cur.appendChild(qa); L('pups').appendChild(rideCab);
  // puppets
  const PUP = {};
  const PNAMES = { mn: ['myNuong', 'Linh', 'Princess Mỵ Nương'], st: ['sonTinh', 'Nguyên', 'Sơn Tinh · the Mayor'], tt: ['thuyTinh', 'Hưng', 'Thủy Tinh · the Sea God'], hu: ['huy', 'Huy', 'Chief Architect'], ba: ['bach', 'Bách', 'Energy Engineer'], kh: ['khang', 'Khang', 'Safety Commander'] };
  Object.entries(PNAMES).forEach(([k, [art, n, role]]) => {
    const w = el('div', 'pw', `<div class="flip"><div class="bob">${ART.puppetSVG(art)}</div></div>`, L('pups'));
    $('.bob', w).style.animationDelay = (-Math.random() * 2) + 's';
    gsap.set(w, { x: 960 - 140, y: 1500, transformOrigin: '140px 392px', scale: .85 });
    const plate = el('div', 'plate card', `<b>${n}</b>${role}`, PR);
    PUP[k] = { w, plate, cur: null };
  });
  const arm = (k, side) => $('.arm' + side, PUP[k].w);
  const armTween = (k, side, deg, dur = .5, opts = {}) => { const a = arm(k, side); if (!a) return; return gsap.to(a, { rotation: deg, svgOrigin: `${a.dataset.ox} ${a.dataset.oy}`, duration: dur, ease: 'back.out(2)', ...opts }); };

  // ---------------- CANVASES: rain, energy, confetti ----------------
  const rainC = L('rain').getContext('2d'); let rainLevel = 0; const drops = Array.from({ length: 420 }, () => ({ x: Math.random() * 1920, y: Math.random() * 1080, v: 18 + Math.random() * 14, l: 26 + Math.random() * 30 }));
  const enC = L('energy').getContext('2d'); let enT = 0;
  const cfC = L('confetti').getContext('2d'); let conf = [];
  function frame(t) {
    rainC.clearRect(0, 0, 1920, 1080);
    if (rainLevel > 0) {
      const n = [0, 120, 260, 420][rainLevel]; rainC.lineCap = 'round';
      for (let i = 0; i < n; i++) { const d = drops[i]; d.y += d.v; d.x -= d.v * .28; if (d.y > 980) { d.y = 60 + Math.random() * 80; d.x = 150 + Math.random() * 1900; }
        rainC.strokeStyle = 'rgba(244,233,210,.9)'; rainC.lineWidth = 7; rainC.beginPath(); rainC.moveTo(d.x, d.y); rainC.lineTo(d.x + d.l * .28, d.y - d.l); rainC.stroke();
        rainC.strokeStyle = '#7fc4ee'; rainC.lineWidth = 3.5; rainC.stroke(); }
    }
    if (+L('energy').style.opacity > 0) {
      enT += .02; enC.clearRect(0, 0, 1920, 1080);
      const paths = [[[300, 900], [600, 760], [980, 820], [1240, 700], [1290, 560]], [[500, 930], [800, 860], [1100, 760], [1380, 640], [1480, 520]], [[150, 880], [520, 820], [900, 700], [1150, 520], [1360, 410]]];
      paths.forEach((p, k) => {
        enC.lineCap = 'round'; enC.lineJoin = 'round';
        const draw = (w, c, dash, off) => { enC.setLineDash(dash); enC.lineDashOffset = off; enC.strokeStyle = c; enC.lineWidth = w; enC.beginPath(); enC.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; enC.quadraticCurveTo(p[i][0], p[i][1], mx, my); } enC.lineTo(p[p.length - 1][0], p[p.length - 1][1]); enC.stroke(); };
        draw(18, 'rgba(244,233,210,.85)', [], 0); draw(10, '#ffd34d', [30, 26], -enT * 140 - k * 30);
      });
    }
    if (conf.length) {
      cfC.clearRect(0, 0, 1920, 1080);
      conf.forEach(c => { c.vy += .12; c.x += c.vx; c.y += c.vy; c.r += c.vr; cfC.save(); cfC.translate(c.x, c.y); cfC.rotate(c.r); cfC.fillStyle = c.c; cfC.strokeStyle = '#3a2418'; cfC.lineWidth = 2; cfC.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); cfC.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h); cfC.restore(); });
      conf = conf.filter(c => c.y < 1200);
      if (!conf.length) cfC.clearRect(0, 0, 1920, 1080);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  const confetti = () => { const cols = ['#ffcf4a', '#e8504a', '#3c8ccc', '#5fa152', '#f4e9d2', '#f08aa0']; for (let i = 0; i < 260; i++) conf.push({ x: 960 + (Math.random() - .5) * 400, y: 300, vx: (Math.random() - .5) * 26, vy: -8 - Math.random() * 14, r: Math.random() * 6, vr: (Math.random() - .5) * .3, w: 14 + Math.random() * 14, h: 8 + Math.random() * 10, c: cols[i % cols.length] }); };
  const flash = (o = .85, d = .5) => gsap.fromTo('#flash', { opacity: o }, { opacity: 0, duration: d, ease: 'power2.out' });
  let stormTimer = null;
  const setStorm = (on) => { clearInterval(stormTimer); stormTimer = null; if (!on) return; stormTimer = setInterval(() => { if (Math.random() < .55) strike(); }, 3600); };
  const strike = (big) => { const b = bolts[Math.random() < .5 ? 0 : 1]; gsap.fromTo(b, { opacity: 1 }, { opacity: 0, duration: .5, delay: .15, ease: 'steps(3)' }); flash(big ? .95 : .5, .45); SND.play('thunder'); };

  // ---------------- STATE ----------------
  const DEF = { curtain: 'open', title: false, sky: 'legend', legend: false, city: false, lights: true, flap: false, mud: false, cab: 'bottom', rocks: false, rain: 0, wind: 0, clouds: false, storm: false,
    sea: 'calm', flood: false, sun: false, moon: false, placard: null, pups: {}, names: false, talk: null, crisis: false, news: false, qr: false, interview: false, vs: false, counter: '', ride: false,
    scroll: null, stem: false, slogan: false, energy: false, typhoon: false, alarm: false, lantern: false, inside: false, sense: false, qa: false, dim: false };
  let cur_ = {};
  const show = (e, on, from = { y: 30 }, d = .6) => { if (on) gsap.to(e, { opacity: 1, ...Object.fromEntries(Object.keys(from).map(k => [k, e._base?.[k] ?? 0])), duration: d, ease: 'back.out(1.6)', overwrite: 'auto' }); else gsap.to(e, { opacity: 0, duration: d * .6, overwrite: 'auto' }); };
  // remember props' resting positions so show() can rise into them
  [...crisis, news, qrCard, ...interview, scroll, stem].forEach(e => { e._base = { y: gsap.getProperty(e, 'y') }; });
  const popIn = (e, on, dy = 40) => { const by = e._base ? e._base.y : 0; if (on) { gsap.fromTo(e, { y: by + dy, opacity: 0 }, { y: by, opacity: 1, duration: .6, ease: 'back.out(1.7)', overwrite: true }); } else gsap.to(e, { opacity: 0, y: by + dy, duration: .35, overwrite: true }); };

  function apply(st, instant) {
    const s = { ...DEF, ...st }, p = cur_, D = instant ? 0 : 1;
    // curtains
    if (s.curtain !== p.curtain) {
      const open = s.curtain === 'open';
      gsap.to(closeL, { x: open ? -1000 : 0, duration: 1.6 * D, ease: 'power3.inOut' }); gsap.to(closeR, { x: open ? 1940 : 940, duration: 1.6 * D, ease: 'power3.inOut' });
      if (!instant) SND.play('curtain');
    }
    if (s.title !== p.title) gsap.to(title, { opacity: s.title ? 1 : 0, y: s.title ? 0 : -30, duration: .8 * D });
    if (s.qa !== p.qa) gsap.to(qa, { opacity: s.qa ? 1 : 0, y: s.qa ? 0 : 30, duration: .8 * D, delay: s.qa ? .8 * D : 0 });
    if (s.sky !== p.sky) L('bg').className = s.sky;
    if (s.legend !== p.legend) gsap.to('#legend', { opacity: s.legend ? 1 : 0, y: s.legend ? 500 : 760, duration: 1.2 * D, ease: 'power2.inOut' });
    if (s.city !== p.city || s.flap !== p.flap) gsap.to(cityEl, { opacity: s.city ? 1 : 0, y: s.city ? (s.flap ? 160 : 300) : 900, duration: 1.4 * D, ease: s.city ? 'power2.inOut' : 'power2.in' });
    cityEl.classList.toggle('dark', !s.lights); cityEl.classList.toggle('alarm', s.alarm); cityEl.classList.toggle('lantern', s.lantern); cityEl.classList.toggle('inside', s.inside); cityEl.classList.toggle('sense', s.sense);
    if (s.flap !== p.flap) gsap.to(flap, { scaleX: s.flap ? -.04 : 1, svgOrigin: '370 560', duration: 1 * D, ease: 'power2.inOut' });
    if (s.mud !== p.mud) gsap.to(mud, { opacity: s.mud ? 1 : 0, y: s.mud ? 0 : -120, duration: 1.2 * D, ease: 'bounce.out' });
    if (s.cab !== p.cab) gsap.to(cab, { y: s.cab === 'top' ? -390 : 0, duration: (s.ride ? 5.2 : 1.2) * D, ease: s.ride ? 'none' : 'power2.inOut' });
    if (s.rocks !== p.rocks) rocks.forEach((r, i) => s.rocks
      ? gsap.fromTo(r, { x: 1500 + i * 30, y: 230 - i * 8, opacity: 1, rotation: 0 }, { x: 1300 + i * 46, y: 800 + (i % 2) * 30, rotation: 540 + i * 60, duration: 1.6 * D + i * .12 * D, ease: 'bounce.out', delay: i * .1 * D })
      : gsap.to(r, { opacity: 0, duration: .4 }));
    if (s.rain !== p.rain) { rainLevel = s.rain; SND.rain(s.rain); }
    if (s.wind !== p.wind) SND.wind(s.wind);
    if (s.clouds !== p.clouds) clouds.forEach((c, i) => gsap.to(c, { y: s.clouds ? +c.dataset.y : -320, duration: 1.2 * D, delay: i * .08 * D, ease: s.clouds ? 'back.out(1.4)' : 'power2.in' }));
    if (s.storm !== p.storm) setStorm(s.storm);
    if (s.sea !== p.sea || s.flap !== p.flap) { L('seaBack').classList.toggle('rough', s.sea !== 'calm'); L('seaFront').classList.toggle('rough', s.sea !== 'calm');
      gsap.to(seaB, { y: s.flap ? 880 : s.sea === 'calm' ? 770 : 735, duration: 1 * D }); gsap.to(seaB2, { y: s.flap ? 905 : s.sea === 'calm' ? 812 : 780, duration: 1 * D }); }
    if (s.flood !== p.flood) gsap.to(seaF, { y: s.flood ? 790 : 1100, duration: 1.4 * D, ease: 'power2.inOut' });
    if (s.sun !== p.sun) gsap.to('#sun', { opacity: s.sun ? 1 : 0, y: s.sun ? 120 : 420, duration: 1.4 * D, ease: 'power2.out' });
    if (s.moon !== p.moon) gsap.to('#moon', { opacity: s.moon ? 1 : 0, y: s.moon ? 130 : 400, duration: 1.2 * D });
    if (s.typhoon !== p.typhoon) gsap.to(typhoon, { opacity: s.typhoon ? .95 : 0, scale: s.typhoon ? 1 : .4, duration: 1 * D, ease: 'back.out(1.4)' });
    if (s.energy !== p.energy) gsap.to('#energy', { opacity: s.energy ? 1 : 0, duration: .8 * D });
    if (s.alarm !== p.alarm) { gsap.to('#alarm', { opacity: s.alarm ? 1 : 0, duration: .3 }); document.body.classList.toggle('alarmOn', s.alarm); }
    // placard
    const pk = JSON.stringify(s.placard), ppk = JSON.stringify(p.placard);
    if (pk !== ppk) {
      const set = () => { if (s.placard) { $('.k', placard).textContent = s.placard[0]; $('.t', placard).textContent = s.placard[1]; } };
      if (!s.placard) gsap.to(placard, { y: -260, duration: .5 * D, ease: 'power2.in' });
      else if (!p.placard) { set(); gsap.fromTo(placard, { y: -260 }, { y: 150, duration: 1 * D, ease: 'bounce.out' }); }
      else gsap.timeline().to(placard, { y: -260, duration: .4 * D, ease: 'power2.in', onComplete: set }).to(placard, { y: 150, duration: .9 * D, ease: 'bounce.out' });
    }
    // props
    if (s.crisis !== p.crisis) crisis.forEach((c, i) => setTimeout(() => popIn(c, s.crisis), s.crisis ? i * 260 * D : 0));
    if (s.news !== p.news) popIn(news, s.news);
    if (s.qr !== p.qr) popIn(qrCard, s.qr, 60);
    if (s.interview !== p.interview) interview.forEach((c, i) => setTimeout(() => popIn(c, s.interview), s.interview ? (600 + i * 250) * D : 0));
    if (s.vs !== p.vs) gsap.to(vs, { opacity: s.vs ? 1 : 0, scale: s.vs ? 1 : .2, rotation: s.vs ? 0 : -90, duration: .7 * D, ease: 'back.out(2)' });
    if (!s.ride) { counter.textContent = ''; gsap.to(counter, { opacity: 0, duration: .3 }); }
    if (s.ride !== p.ride) { gsap.to(rideCab, { opacity: s.ride ? 1 : 0, duration: .5 * D }); }
    if (s.ride) gsap.to(rideCab, { x: 1153, y: s.cab === 'top' ? 230 : 650, duration: s.cab === 'top' && p.cab !== 'top' ? 5.2 * D : 0, ease: 'none' });
    const sk = JSON.stringify(s.scroll);
    if (sk !== JSON.stringify(p.scroll)) {
      if (s.scroll) { scroll.className = 'prop card ' + s.scroll.kind; scroll.innerHTML = `<div class="h">${s.scroll.h}</div><ul>${s.scroll.items.map(t => `<li>${t}</li>`).join('')}</ul>`; popIn(scroll, true); }
      else popIn(scroll, false);
    }
    if (s.stem !== p.stem) gsap.to(stem, s.stem ? { opacity: 1, x: 960, y: 330, rotation: -4, scale: 1, duration: 1 * D, ease: 'back.out(1.6)' } : { opacity: 0, scale: .6, duration: .4 });
    if (s.slogan !== p.slogan) gsap.fromTo(slogan, { opacity: s.slogan ? 0 : 1, y: s.slogan ? -60 : 0 }, { opacity: s.slogan ? 1 : 0, y: 0, duration: .8 * D, ease: 'back.out(1.5)' });
    // puppets
    Object.entries(PUP).forEach(([k, P]) => {
      const t = s.pups[k], was = p.pups ? p.pups[k] : null;
      if (t) {
        const x = t.x - 140, y = (t.y ?? 890) - 392, sc = t.s ?? .85, d = (t.d ?? 1) * D;
        if (!was) { gsap.set(P.w, { x, scale: sc }); gsap.fromTo(P.w, { y: y + 700 }, { y, duration: .9 * D, ease: 'back.out(1.2)', delay: (t.delay || 0) * D }); if (!instant) setTimeout(() => SND.play('pop'), (t.delay || 0) * 1000); }
        else gsap.to(P.w, { x, y, scale: sc, duration: d, ease: t.ease || 'power2.inOut', delay: (t.delay || 0) * D });
        gsap.to($('.flip', P.w), { scaleX: t.f ? -1 : 1, duration: .4 * D });
        gsap.to($('.bob', P.w), { rotation: t.r || 0, duration: .5 * D });
        P.w.style.zIndex = t.z || 1;
        P.w.classList.toggle('talk', s.talk === k);
        // nameplate
        gsap.to(P.plate, { opacity: s.names ? 1 : 0, duration: .4 });
        P.plate.style.left = t.x + 'px';
      } else {
        if (was) gsap.to(P.w, { y: '+=700', duration: .6 * D, ease: 'power2.in' });
        gsap.to(P.plate, { opacity: 0, duration: .3 });
        P.w.classList.remove('talk');
      }
    });
    // stage dim while an expert explains
    world.classList.toggle('dim', !!s.dim);
    cur_ = s;
  }

  // ---------------- EXPERT OVERLAY ----------------
  const OVP = { hu: ['huy', 'Architect Huy', 'Chief Architect'], ba: ['bach', 'Engineer Bách', 'Energy Engineer'], kh: ['khang', 'Commander Khang', 'Safety Commander'] };
  const IMGS = { cutaway: [2048, 1530], terraces: [1056, 899] };
  const SRC = { cutaway: 'img/cutaway.jpg', terraces: 'img/terraces_top.jpg' };
  const BW = 1120, BH = 560;
  const batteryDiagram = (mode) => `<svg class="diag" viewBox="0 0 1120 560" width="1120" height="560">
    <defs><linearGradient id="skyD" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9fd6ee"/><stop offset="1" stop-color="#e9f6fb"/></linearGradient>
    <linearGradient id="skyN" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b2550"/><stop offset="1" stop-color="#3a4a80"/></linearGradient>
    <path id="pUp" d="M470 452 C560 450 600 420 640 360 C690 290 700 230 760 182"/><path id="pDn" d="M760 182 C700 230 690 290 640 360 C600 420 560 450 470 452"/></defs>
    <rect class="skyD" width="1120" height="560" fill="url(#skyD)"/><rect class="skyN" width="1120" height="560" fill="url(#skyN)" opacity="0"/>
    <g class="sunD"><circle cx="650" cy="150" r="50" fill="#ffd34d" stroke="#3a2418" stroke-width="4"/></g>
    <g class="moonN" opacity="0"><path d="M670 100 C620 100 600 170 640 205 C670 225 705 210 712 190 C670 198 640 160 670 100 Z" fill="#f4ecc8" stroke="#3a2418" stroke-width="4"/></g>
    <g filter="url(#cutSoft)">
      <path d="M0 440 Q140 420 280 440 T560 440 L560 560 L0 560 Z" fill="#2f7fc1" stroke="#3a2418" stroke-width="4"/>
      <path d="M520 560 L560 430 L620 380 L660 300 L700 230 L720 170 L1120 170 L1120 560 Z" fill="#8f7d6b" stroke="#3a2418" stroke-width="5"/>
      <path d="M720 170 L1120 170 L1120 150 L716 152 Z" fill="#5fa152" stroke="#3a2418" stroke-width="4"/>
      <path d="M740 120 L1000 120 L990 175 L752 175 Z" fill="#2f7fc1" stroke="#3a2418" stroke-width="5"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${770 + i * 44}" y="128" width="34" height="14" fill="#2b4f8f" stroke="#fff" stroke-width="2"/>`).join('')}
      <rect x="430" y="420" width="80" height="60" rx="6" fill="#e9e2d2" stroke="#3a2418" stroke-width="4"/>
      <g transform="translate(470 450)"><g class="spin" style="animation-duration:${mode === 'night' ? '1s' : '6s'}"><path d="M0 0 L-6 -24 L6 -24 Z M0 0 L22 10 L18 18 Z M0 0 L-18 18 L-22 10 Z" fill="#ffcf4a" stroke="#3a2418" stroke-width="2.5"/></g></g>
      ${[1040, 1072].map((x, i) => `<rect x="${x}" y="${96 - i * 20}" width="28" height="${56 + i * 20}" fill="#e9e2d2" stroke="#3a2418" stroke-width="3"/><rect class="win" x="${x + 8}" y="${108 - i * 20}" width="10" height="10" fill="#ffd34d"/>`).join('')}
    </g>
    <path d="M470 452 C560 450 600 420 640 360 C690 290 700 230 760 182" fill="none" stroke="#3a2418" stroke-width="20" stroke-linecap="round"/>
    <path d="M470 452 C560 450 600 420 640 360 C690 290 700 230 760 182" fill="none" stroke="#9fb3c8" stroke-width="12" stroke-linecap="round"/>
    <g class="dotsUp">${[0, 1, 2, 3, 4, 5].map(i => `<circle r="7" fill="#5fc0f0" stroke="#fff" stroke-width="2"><animateMotion dur="2.4s" begin="${i * .4}s" repeatCount="indefinite"><mpath href="#pUp"/></animateMotion></circle>`).join('')}</g>
    <g class="dotsDn" opacity="0">${[0, 1, 2, 3, 4, 5].map(i => `<circle r="7" fill="#5fc0f0" stroke="#fff" stroke-width="2"><animateMotion dur="1.6s" begin="${i * .27}s" repeatCount="indefinite"><mpath href="#pDn"/></animateMotion></circle>`).join('')}</g>
    <path d="M1090 172 L1090 448" stroke="#3a2418" stroke-width="4" stroke-dasharray="10 8"/><path d="M1078 184 L1090 168 L1102 184 M1078 436 L1090 452 L1102 436" fill="none" stroke="#3a2418" stroke-width="4"/>
    <rect x="928" y="290" width="150" height="56" rx="10" fill="#fff7e2" stroke="#3a2418" stroke-width="3"/><text x="1003" y="327" font-family="Patrick Hand, Arial" font-size="30" text-anchor="middle" fill="#3a2418">≈ 140 m</text>
    <g font-family="Patrick Hand, Arial" font-size="27" fill="#3a2418"><rect x="740" y="56" width="360" height="46" rx="10" fill="#fff7e2" stroke="#3a2418" stroke-width="3"/><text x="920" y="88" text-anchor="middle">Clifftop reservoir + floating solar</text>
    <rect x="40" y="500" width="250" height="44" rx="10" fill="#fff7e2" stroke="#3a2418" stroke-width="3"/><text x="165" y="530" text-anchor="middle">The sea = lower lake</text>
    <rect x="340" y="370" width="200" height="40" rx="10" fill="#fff7e2" stroke="#3a2418" stroke-width="3"/><text x="440" y="398" text-anchor="middle">Turbine house</text></g>
    <g class="phase"><rect x="24" y="24" width="560" height="64" rx="14" fill="#3a2418"/><text class="phT" x="304" y="66" font-family="Yeseva One, Georgia" font-size="30" text-anchor="middle" fill="#ffe08a">DAY · pump seawater UP</text></g>
    ${mode === 'risks' ? `<g font-family="Patrick Hand, Arial" font-size="27"><rect x="560" y="214" width="250" height="44" rx="10" fill="#ffe0e3" stroke="#c0283a" stroke-width="4"/><text x="685" y="244" text-anchor="middle" fill="#7a1020">⚠ plastic (FRP) pipes</text>
      <rect x="780" y="186" width="230" height="40" rx="10" fill="#ffe0e3" stroke="#c0283a" stroke-width="4" transform="translate(0 0)"/><text x="895" y="214" text-anchor="middle" fill="#7a1020">⚠ fully lined basin</text>
      <rect x="40" y="380" width="290" height="44" rx="10" fill="#ffe0e3" stroke="#c0283a" stroke-width="4"/><text x="185" y="410" text-anchor="middle" fill="#7a1020">⚠ brine diluted offshore</text></g>` : ''}
  </svg>`;
  let phaseTimer = null;
  const runBattery = (box, mode) => {
    clearInterval(phaseTimer);
    const setPhase = (night) => {
      gsap.to($('.skyN', box), { opacity: night ? 1 : 0, duration: .8 }); gsap.to($('.moonN', box), { opacity: night ? 1 : 0, duration: .8 }); gsap.to($('.sunD', box), { opacity: night ? 0 : 1, duration: .8 });
      gsap.to($('.dotsUp', box), { opacity: night ? 0 : 1, duration: .4 }); gsap.to($('.dotsDn', box), { opacity: night ? 1 : 0, duration: .4 });
      $('.phT', box).textContent = night ? 'NIGHT · water falls, lights stay on' : 'DAY · spare power pumps water UP';
      $('.spin', box).style.animationDuration = night ? '.8s' : '6s';
      box.querySelectorAll('.win').forEach(w => w.setAttribute('fill', night ? '#ffd34d' : '#cfd4da'));
    };
    let night = false; setPhase(night);
    if (mode !== 'static') phaseTimer = setInterval(() => { night = !night; setPhase(night); }, 3800);
  };
  const networkDiagram = () => {
    const nodes = [['Slope sensors', 'rain + ground', '#ff6b7d', 'M-14 6 a14 14 0 0 1 28 0 M-24 -2 a24 24 0 0 1 48 0', 'circle'], ['“Go Below”', 'city-wide alarm', '#ffcf4a', 'M-16 10 L16 10 L12 4 L12 -8 A12 12 0 0 0 -12 -8 L-12 4 Z M-4 14 a4 4 0 0 0 8 0', ''], ['Shelters', 'B1 · B2 · B3 · B4', '#e9a23b', 'M-20 14 L-20 -4 L0 -18 L20 -4 L20 14 Z M-6 14 L-6 2 L6 2 L6 14', ''], ['Ridge Cistern', '6,000 m³ of water', '#5fc0f0', 'M0 -20 C10 -6 16 2 16 8 A16 16 0 0 1 -16 8 C-16 2 -10 -6 0 -20 Z', ''], ['Heli-Base', 'rescue flights', '#9ad18a', 'M-22 -12 L22 -12 M0 -12 L0 -6 M-16 -6 L12 -6 Q20 -6 20 2 L20 6 L-10 6 Q-18 6 -18 0 Z M-6 6 L-6 14 M8 6 L8 14 M-12 14 L14 14', '']];
    return `<svg class="diag" viewBox="0 0 1120 560" width="1120" height="560"><rect width="1120" height="560" fill="#2b2126"/>
      <text x="560" y="70" font-family="Yeseva One, Georgia" font-size="40" fill="#ffe08a" text-anchor="middle">One network: warn · shelter · water · rescue</text>
      ${nodes.map((n, i) => { const x = 120 + i * 220; return `<g class="nd" style="opacity:0" transform="translate(${x} 270)"><g filter="url(#cutSoft)"><circle r="78" fill="${n[2]}" stroke="#3a2418" stroke-width="5"/></g><g transform="scale(2.1)"><path d="${n[3]}" fill="${n[4] ? 'none' : '#fff7e2'}" stroke="#3a2418" stroke-width="3" stroke-linecap="round"/>${n[4] ? '<circle r="5" fill="#3a2418"/>' : ''}</g>
        <text y="130" font-family="Yeseva One, Georgia" font-size="30" fill="#fff3df" text-anchor="middle">${n[0]}</text><text y="166" font-family="Patrick Hand, Arial" font-size="26" fill="#e7d3b5" text-anchor="middle">${n[1]}</text></g>
        ${i < 4 ? `<path class="ar" style="opacity:0" d="M${x + 86} 270 L${x + 132} 270 M${x + 120} 258 L${x + 134} 270 L${x + 120} 282" fill="none" stroke="#ffe08a" stroke-width="6" stroke-linecap="round"/>` : ''}`; }).join('')}
    </svg>`;
  };
  const OV = {
    huTerr: { who: 'hu', k: 'Architect Huy · Housing', t: 'No house sits on a loose slope', img: 'cutaway', f: [.66, .42, 1.6],
      rings: [[.74, .42, .17, .13, 'Four solid terraces']], chips: [[['6', 'districts on one rock'], ['4', 'curved terraces of eco-homes'], ['Car-free', 'pedestrian zones · cars stop at the gate']]] },
    huGreen: { who: 'hu', k: 'Architect Huy · Green spaces', t: 'Trees hold the mountain together', img: 'cutaway', f: [.5, .335, 1.0],
      rings: [[.585, .085, .1, .045, 'Forest on the plateau'], [.5, .575, .045, .065, 'Roots pin the slopes']], chips: [[['40 %', 'of the land stays green'], ['Roots', 'hold the slopes together'], ['Every roof', 'gives back a garden']]] },
    huHouse: { who: 'hu', k: 'Architect Huy · Housing costs', t: 'Homes people can afford', img: 'terraces', f: [.55, .45, 1.05],
      rings: [[.72, .46, .22, .3, 'Family eco-homes'], [.4, .27, .08, .1, 'Park & pond']], chips: [[['1 in 3', 'homes: rent capped at 30 % of income'], ['Shared', 'kitchens · tools · workspaces'], ['Land trust', 'buyers pay only for the building']]] },
    baEnergy: { who: 'ba', k: 'Engineer Bách · Energy', t: 'Clean power made on the cliff', img: 'cutaway', f: [.24, .32, 2.0],
      rings: [[.22, .26, .06, .12, '5 wind turbines', '', [.68, .17]], [.25, .37, .085, .09, '3 solar arrays', '', [.76, .74]]], chips: [[['100 %', 'renewable energy target'], ['≈ 130 MWh', 'clean power every day'], ['5 + 3', 'wind turbines + solar arrays']]] },
    baBattery: { who: 'ba', k: 'Engineer Bách · Innovation 01', t: 'Your sea becomes our battery', diag: 'battery',
      chips: [[['≈ 58 MWh', 'stored in the clifftop reservoir'], ['140 m', 'drop through the turbine'], ['≈ 18 h', 'to run the whole city']],
        [['Okinawa', 'Japan ran a seawater plant, 1999–2016'], ['No diesel', 'no smoke · a tiny carbon footprint'], ['Eco-friendly', 'power stays local in a storm']]] },
    huRoad: { who: 'hu', k: 'Architect Huy · Transit', t: 'The pass road is for service only', img: 'cutaway', f: [.43, .66, 1.7],
      rings: [[.46, .77, .09, .09, 'Pass road: buses, deliveries, emergencies', 'bad'], [.405, .555, .03, .14, 'Innovation 02: the Vertical Lifeline', '', [.3, .17]]], chips: [[['Service only', 'buses · deliveries · emergencies'], ['Most people', 'ride the Vertical Lifeline']]] },
    huLift: { who: 'hu', k: 'Architect Huy · Innovation 02', t: 'The Vertical Lifeline', img: 'cutaway', f: [.46, .53, 1.6],
      rings: [[.405, .555, .03, .14, '150 m cliff elevator'], [.52, .5, .06, .08, 'Panorama ropeway']], chips: [[['40 s', 'harbour → clifftop, 150 m'], ['≈ 2,400', 'people an hour, 2 cars'], ['1 ticket', 'lift · ropeway · car lift'], ['Regen', 'lifts going down make power']]] },
    khSense: { who: 'kh', k: 'Commander Khang · Safety', t: 'Slope sensors raise the alarm', img: 'cutaway', f: [.52, .5, 1.25],
      pings: [[.52, .42], [.6, .58], [.47, .66], [.66, .3], [.36, .5], [.8, .45]], chips: [[['Rain', 'measured on every slope'], ['Ground', 'movement on the cut benches'], ['Go Below', 'alarm before a slope fails']]] },
    khDown: { who: 'kh', k: 'Commander Khang · Innovation 03', t: 'We go down, into the rock', img: 'cutaway', f: [.7, .74, 1.55],
      rings: [[.71, .76, .2, .14, 'The Deep Refuge Network']], chips: [[['Innovation 03', 'the Deep Refuge Network'], ['Into the rock', 'safe from landslides and floods']]] },
    khRefuge: { who: 'kh', k: 'Commander Khang · Innovation 03', t: 'Everyone has a place in the rock', img: 'cutaway', f: [.7, .74, 1.55],
      rings: [[.71, .76, .2, .14, 'B1–B4 shelter halls', '', [.74, .16]]], insets: [['img/shelter_photo.jpg', 20, 20, 520, 108, 'B3 shelter: bunks and blast doors'], ['img/cistern.jpg', 20, 150, 260, 184, 'Ridge Cistern']],
      chips: [[['< 10 min', 'to a shelter from any terrace'], ['B3', 'sealed by blast doors'], ['6,000 m³', 'of water for 30+ days'], ['Heli-Base', 'flies the injured out']]] },
    khNet: { who: 'kh', k: 'Commander Khang · Dual-use shelters', t: 'One network, like Helsinki', diag: 'network',
      chips: [[['Helsinki', '≈ 5,500 shelters, used every day'], ['Dual-use', 'a market by day, a shelter in a storm'], ['1 network', 'shelters · water · rescue · warnings']]] },
    baRisk: { who: 'ba', k: 'Engineer Bách · Honest limits', t: 'Seawater is tough on machines', diag: 'risks',
      chips: [[['Corrosion', 'lined reservoir + plastic (FRP) pipes'], ['Brine', 'blended, then released far offshore'], ['Okinawa', 'solved it the same way']]] },
  };
  let ovCur = null;
  const ov = $('#ov'), ovPup = $('#ovPup'), bImg = $('#bImg'), chipsEl = $('#chips');
  function showOverlay(id, step = 0, instant) {
    const D = instant ? 0 : 1;
    if (!id) {
      if (ovCur) { gsap.to(['#board', '#ovName'], { opacity: 0, y: 40, duration: .4 * D }); gsap.to(ovPup, { y: 500, opacity: 0, duration: .5 * D, ease: 'power2.in' }); gsap.to('#ovSpot', { opacity: 0, duration: .4 * D, onComplete: () => { if (!ovCur) { ov.style.visibility = 'hidden'; bImg.innerHTML = ''; } } }); if (!instant) SND.play('back'); }
      ovCur = null; clearInterval(phaseTimer); return;
    }
    const o = OV[id]; ov.style.visibility = 'visible';
    const sameBoard = ovCur && ovCur.id === id;
    if (!sameBoard) {
      const whoChanged = !ovCur || OV[ovCur.id].who !== o.who;
      if (whoChanged) {
        ovPup.innerHTML = `<div class="bob" style="width:504px;height:1080px;transform-origin:252px 900px;animation:talk .55s ease-in-out infinite">${ART.puppetSVG(OVP[o.who][0])}</div>`;
        $('.pup', ovPup).setAttribute('width', 504); $('.pup', ovPup).setAttribute('height', 1080);
        $('#ovName b').textContent = OVP[o.who][1]; $('#ovName span').textContent = OVP[o.who][2];
        gsap.fromTo(ovPup, { y: 600, opacity: 1 }, { y: 0, duration: .8 * D, ease: 'back.out(1.3)' });
        gsap.fromTo('#ovName', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .5 * D, delay: .3 * D });
      }
      gsap.to('#ovSpot', { opacity: 1, duration: .5 * D });
      $('#bHead .k').textContent = o.k; $('#bHead h2').textContent = o.t;
      bImg.innerHTML = '';
      if (o.img) {
        const [W, H] = IMGS[o.img], [fx, fy, z] = o.f;
        const base = Math.max(BW / W, BH / H), sc = base * z;
        let tx = BW / 2 - fx * W * sc, ty = BH / 2 - fy * H * sc;
        tx = Math.min(0, Math.max(BW - W * sc, tx)); ty = Math.min(0, Math.max(BH - H * sc, ty));
        const pan = el('div', 'pan', `<img src="${SRC[o.img]}" width="${W}" height="${H}" alt="">`, bImg);
        const P = (x, y) => [x * W * sc + tx, y * H * sc + ty];
        gsap.fromTo(pan, { x: tx + (BW / 2 - (tx + W * sc / 2)) * .15, y: ty, scale: sc * .92 }, { x: tx, y: ty, scale: sc, duration: 1.4 * D, ease: 'power2.out' });
        const svg = el('div', '', `<svg class="marks" viewBox="0 0 ${BW} ${BH}">${(o.rings || []).map((r, i) => { const [cx, cy] = P(r[0], r[1]); const rx = r[2] * W * sc, ry = r[3] * H * sc;
          return `<ellipse class="ring" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(255,207,74,.12)" stroke="${r[5] ? '#d0283a' : '#ffcf4a'}" stroke-width="8" stroke-dasharray="22 12"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#3a2418" stroke-width="3" class="ring2"/>`; }).join('')}
          ${(o.pings || []).map(pp => { const [cx, cy] = P(pp[0], pp[1]); return `<g class="ping" transform="translate(${cx} ${cy})"><circle r="14" fill="#ff3b55" stroke="#fff" stroke-width="4"/><circle r="14" fill="none" stroke="#ff3b55" stroke-width="5"><animate attributeName="r" from="14" to="60" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="1.2s" repeatCount="indefinite"/></circle></g>`; }).join('')}</svg>`, bImg).firstChild;
        const placed = [];
        (o.rings || []).forEach((r, i) => { const [cx, cy] = P(r[0], r[1]); const ry = r[3] * H * sc;
          const t = el('div', 'tag' + (r[5] ? ' bad' : ''), `<i>${r[5] ? '✗' : i + 1}</i>${r[4]}`, bImg);
          let left = Math.min(BW - 200, Math.max(200, cx)), top = cy - ry - 14; if (top < 60) top = Math.min(BH - 20, Math.max(cy + ry + 60, 70));
          if (r[6]) { left = r[6][0] * BW; top = r[6][1] * BH; }
          // keep labels from sitting on each other
          for (let k = 0; k < 6 && placed.some(([l2, t2]) => Math.abs(l2 - left) < 300 && Math.abs(t2 - top) < 54); k++) top += 58;
          placed.push([left, top]); t.style.left = left + 'px'; t.style.top = top + 'px';
          gsap.to(t, { opacity: 1, duration: .5, delay: (.9 + i * .5) * D }); });
        gsap.from(svg.querySelectorAll('.ring'), { strokeDashoffset: 400, opacity: 0, duration: 1, delay: .6 * D, stagger: .5 });
        gsap.from(svg.querySelectorAll('.ring2, .ping'), { opacity: 0, duration: .5, delay: .6 * D, stagger: .3 });
        (o.insets || []).forEach((n, i) => { const im = el('img', 'inset', '', bImg); im.src = n[0]; im.alt = n[5]; Object.assign(im.style, { left: n[1] + 'px', top: n[2] + 'px', width: n[3] + 'px', height: n[4] + 'px' }); gsap.to(im, { opacity: 1, duration: .5, delay: (1.4 + i * .4) * D }); });
      } else if (o.diag === 'battery' || o.diag === 'risks') {
        bImg.innerHTML = batteryDiagram(o.diag === 'risks' ? 'risks' : 'live'); runBattery(bImg, o.diag === 'risks' ? 'static' : 'live');
        if (o.diag === 'risks') { const night = () => { gsap.set($('.skyN', bImg), { opacity: .0 }); }; night(); }
      } else if (o.diag === 'network') {
        bImg.innerHTML = networkDiagram();
        gsap.to(bImg.querySelectorAll('.nd'), { opacity: 1, duration: .5, stagger: .35, delay: .4 * D });
        gsap.to(bImg.querySelectorAll('.ar'), { opacity: 1, duration: .3, stagger: .35, delay: .6 * D });
      }
      gsap.fromTo('#board', { opacity: 0, y: 60, rotation: 1.5 }, { opacity: 1, y: 0, rotation: 0, duration: .7 * D, ease: 'back.out(1.4)' });
      if (!instant) SND.play('whoosh');
    }
    // chips for this step
    const set = o.chips[Math.min(step, o.chips.length - 1)];
    const key = id + ':' + step;
    if (!ovCur || ovCur.key !== key) {
      chipsEl.innerHTML = set.map(c => `<div class="chip${c[0].length > 8 ? ' wide' : ''}"><div class="n">${c[0]}</div><div class="l">${c[1]}</div></div>`).join('');
      gsap.fromTo(chipsEl.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, stagger: .22, delay: (sameBoard ? .1 : 1.0) * D, ease: 'back.out(1.6)' });
    }
    ovCur = { id, step, key };
  }

  // ---------------- THE PLAY: one entry per click ----------------
  // puppet helper: X feet position, s scale, f flip (face left)
  const at = (x, o = {}) => ({ x, ...o });
  const WH = ['st', 'hu', 'ba', 'kh'];
  const BEATS = [
    { who: '—', cue: 'Màn mở: tên vở kịch (chưa ai nói)', st: { curtain: 'closed', title: true, sky: 'dark' } },
    // Scene 1
    { who: 'Linh (Mỵ Nương)', cue: '"Four thousand years ago, two gods wanted to marry me…"', st: { sky: 'legend', legend: true, sea: 'calm', placard: ['Scene 1', 'The Legend Returns'], talk: 'mn',
      pups: { mn: at(960, { s: .95 }), st: at(470, { s: .75 }), tt: at(1450, { s: .75, f: 1 }) } } },
    { who: 'Hưng (Thủy Tinh)', cue: '"I am Thuy Tinh, King of the Sea! It is the year 2050…"', st: { sky: 'storm', legend: true, sea: 'rough', clouds: true, storm: true, wind: 2, placard: ['The year', '2050'], talk: 'tt',
      pups: { mn: at(620, { s: .85 }), tt: at(1250, { s: 1, f: 1 }) } },
      fx: () => { strike(true); armTween('tt', 'R', -30, .4, { yoyo: true, repeat: 3 }); SND.play('splash'); } },
    { who: 'Nguyên (Sơn Tinh)', cue: '"Not so fast, old friend. I am Son Tinh… Meet my team."', st: { sky: 'day', city: true, sea: 'calm', clouds: false, wind: 1, placard: ['2050', 'Mayor Sơn Tinh'], talk: 'st',
      pups: { mn: at(420, { s: .82 }), st: at(660, { s: 1 }), tt: at(1560, { s: .9, f: 1 }) } }, fx: () => SND.play('chime') },
    { who: 'Huy, Bách, Khang, Linh, Hưng', cue: 'Từng người tự giới thiệu: "I\'m Huy…", "I\'m Bách…", "I\'m Khang…"', st: { sky: 'day', city: true, names: true, placard: ['Meet', 'The Eco-Polis team'],
      pups: { mn: at(300, { s: .78 }), st: at(500, { s: .82 }), hu: at(700, { s: .78, delay: .2 }), ba: at(890, { s: .78, delay: .45 }), kh: at(1080, { s: .78, delay: .7 }), tt: at(1500, { s: .82, f: 1 }) } } },
    { who: 'Nguyên (Sơn Tinh)', cue: '"Our city sits on a sea cliff… Eco-Polis is our answer."', st: { sky: 'day', city: true, crisis: true, news: true, placard: ['The crisis', 'Life on a sea cliff'], talk: 'st',
      pups: { st: at(300, { s: .85 }) } } },
    { who: 'Hưng (Thủy Tinh)', cue: '"Ha! Then let the battle begin!"', st: { sky: 'storm', city: true, clouds: true, sea: 'rough', vs: true, wind: 1, placard: ['Let the battle', 'begin!'], talk: 'tt',
      pups: { st: at(560, { s: .95 }), tt: at(1360, { s: .95, f: 1 }) } }, fx: () => { SND.play('drum'); strike(); } },
    // Scene 2 — the flood
    { who: 'Hưng (Thủy Tinh)', cue: '"Your houses look so weak! My rain will wash them down…"', st: { sky: 'storm', city: true, clouds: true, rain: 2, wind: 2, sea: 'rough', flood: true, storm: true, placard: ['Attack 1', 'The Flood'], talk: 'tt',
      pups: { st: at(420, { s: .85 }), hu: at(620, { s: .85 }), tt: at(1300, { s: 1, f: 1 }) } }, fx: () => { SND.play('splash'); armTween('tt', 'L', 30, .35, { yoyo: true, repeat: 5 }); } },
    { who: 'Huy (EXPERT)', cue: '"Look closely. Six districts on one rock…"', ov: 'huTerr', st: { sky: 'storm', city: true, rain: 1, wind: 1, dim: true, pups: { st: at(420), hu: at(620), tt: at(1300, { f: 1 }) } } },
    { who: 'Hưng (Thủy Tinh)', cue: '"But my water will loosen your soil!"', st: { sky: 'storm', city: true, clouds: true, rain: 3, wind: 2, sea: 'rough', flood: true, storm: true, sense: false, placard: ['Attack 1', 'The Flood'], talk: 'tt',
      pups: { hu: at(560, { s: .85 }), tt: at(1250, { s: 1.05, f: 1 }) } }, fx: () => { strike(); gsap.fromTo(cityEl, { x: 1040 }, { x: 1046, duration: .06, repeat: 9, yoyo: true, onComplete: () => gsap.set(cityEl, { x: 1040 }) }); } },
    { who: 'Huy (EXPERT)', cue: '"Forty percent of our land remains green…"', ov: 'huGreen', st: { sky: 'storm', city: true, rain: 1, dim: true, pups: { hu: at(560), tt: at(1250, { f: 1 }) } } },
    { who: 'Linh (Mỵ Nương)', cue: '"Before building anything, our team interviewed nine people… Scan this QR code!"', st: { sky: 'day', city: true, qr: true, interview: true, placard: ['Our research', 'Street interviews'], talk: 'mn',
      pups: { mn: at(500, { s: .95 }) } }, fx: () => SND.play('sparkle') },
    { who: 'Huy (EXPERT)', cue: '"So our homes share kitchens, tools and workspaces…"', ov: 'huHouse', st: { sky: 'day', city: true, dim: true, pups: { mn: at(500) } } },
    // Scene 3 — the blackout
    { who: 'Hưng (Thủy Tinh)', cue: '"Then I\'ll knock down your power lines!"', st: { sky: 'night', city: true, lights: false, clouds: true, storm: true, wind: 1, sea: 'rough', placard: ['Attack 2', 'The Blackout'], talk: 'tt',
      pups: { ba: at(560, { s: .85 }), tt: at(1300, { s: 1, f: 1 }) } }, fx: () => { strike(true); SND.play('zap'); } },
    { who: 'Bách (EXPERT)', cue: '"Sorry, Thuy Tinh. Our target is one hundred percent renewable energy…"', ov: 'baEnergy', st: { sky: 'night', city: true, lights: false, dim: true, pups: { ba: at(560), tt: at(1300, { f: 1 }) } } },
    { who: 'Bách (EXPERT)', cue: '"By day, spare power pumps seawater up the cliff…"', ov: 'baBattery', st: { sky: 'night', city: true, dim: true, pups: { ba: at(560), tt: at(1300, { f: 1 }) } } },
    { who: 'Hưng (Thủy Tinh)', cue: '"Wait… you are using MY seawater?"', st: { sky: 'night', city: true, lights: true, energy: true, moon: true, sea: 'calm', placard: ['Attack 2', 'The Blackout'], talk: 'tt',
      pups: { ba: at(520, { s: .85 }), tt: at(1000, { s: 1, r: -8 }) } }, fx: () => { SND.play('powerOn'); SND.play('boing'); } },
    { who: 'Bách (EXPERT)', cue: '"Exactly. Your sea becomes our battery! Japan tested this idea at Okinawa…"', ov: 'baBattery', step: 1, st: { sky: 'night', city: true, energy: true, moon: true, dim: true, pups: { ba: at(520), tt: at(1000) } } },
    { who: 'Hưng (Thủy Tinh)', cue: '(dậm chân) "That sounds unfair!"', st: { sky: 'night', city: true, moon: true, placard: ['Attack 2', 'The Blackout'], talk: 'tt', pups: { ba: at(520, { s: .85 }), tt: at(1100, { s: 1, f: 1 }) } },
      fx: () => { setTimeout(() => { SND.play('thud'); gsap.fromTo('#world', { y: 0 }, { y: 8, duration: .05, repeat: 5, yoyo: true }); gsap.fromTo(PUP.tt.w, { y: '-=60' }, { y: '+=60', duration: .35, ease: 'bounce.out' }); }, 300); } },
    // Scene 4 — the blocked road
    { who: 'Hưng (Thủy Tinh)', cue: '"Then I\'ll block your only mountain road with mud!"', st: { sky: 'storm', city: true, mud: true, clouds: true, rain: 1, wind: 1, placard: ['Attack 3', 'The Blocked Road'], talk: 'tt',
      pups: { hu: at(560, { s: .85 }), mn: at(380, { s: .8 }), tt: at(1000, { s: 1, f: 1 }) } }, fx: () => { SND.play('mud'); armTween('tt', 'R', -35, .4, { yoyo: true, repeat: 1 }); } },
    { who: 'Huy (EXPERT)', cue: '"Go ahead. That road is only for buses, deliveries and emergencies…"', ov: 'huRoad', st: { sky: 'storm', city: true, mud: true, dim: true, pups: { hu: at(560), mn: at(380), tt: at(1000, { f: 1 }) } } },
    { who: 'CẢ NHÓM đếm', cue: '"Ten… twenty… thirty… forty!" (Huy + Linh trong thang máy)', st: { sky: 'day', city: true, mud: true, ride: true, cab: 'top', placard: ['Innovation 02', 'Vertical Lifeline'],
      pups: { hu: at(1215, { s: .36, y: 880 - 0, z: 6 }), mn: at(1293, { s: .36, y: 880, z: 6 }) } }, fx: () => elevatorRide() },
    { who: 'Huy (EXPERT)', cue: '"Harbour to clifftop: 150 metres in 40 seconds…"', ov: 'huLift', st: { sky: 'day', city: true, mud: true, cab: 'top', dim: true, pups: { hu: at(700), mn: at(500) } } },
    { who: 'Linh (Mỵ Nương)', cue: '"It feels like flying, and there is no traffic jam at all!"', st: { sky: 'day', city: true, mud: true, cab: 'top', sun: true, placard: ['Innovation 02', 'Vertical Lifeline'], talk: 'mn',
      pups: { mn: at(700, { s: .95, y: 700, r: -8 }), hu: at(480, { s: .85 }) } }, fx: () => { SND.play('sparkle'); gsap.to(PUP.mn.w, { y: '-=30', duration: 1.2, yoyo: true, repeat: 3, ease: 'sine.inOut', delay: 1 }); } },
    // Scene 5 — the landslide
    { who: 'Hưng (Thủy Tinh)', cue: '"Enough! My final weapon: a typhoon and a LANDSLIDE!"', st: { sky: 'storm', city: true, clouds: true, storm: true, typhoon: true, rocks: true, rain: 3, wind: 3, sea: 'rough', flood: true, placard: ['Final attack', 'The Landslide'], talk: 'tt',
      pups: { kh: at(560, { s: .85 }), tt: at(1180, { s: 1.08, f: 1 }) } }, fx: () => { strike(true); SND.play('rumble'); armTween('tt', 'R', -40, .5); } },
    { who: 'Khang (EXPERT) · BÁO ĐỘNG', cue: '"Attention! Slope sensors show heavy rain and ground movement. This is a Go Below alarm!"', ov: 'khSense', st: { sky: 'storm', city: true, alarm: true, rain: 3, wind: 2, typhoon: true, dim: true, pups: { kh: at(560), tt: at(1180, { f: 1 }) } },
      fx: () => { SND.play('alarm'); gsap.fromTo('#goBelow', { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)', delay: .4 }); }, after: () => gsap.to('#goBelow', { opacity: 0, duration: .3 }) },
    { who: 'Hưng (Thủy Tinh)', cue: '"Ha! Now you must run down the mountain road!"', st: { sky: 'storm', city: true, alarm: true, sense: true, rocks: true, typhoon: true, rain: 3, wind: 2, clouds: true, sea: 'rough', placard: ['Final attack', 'The Landslide'], talk: 'tt',
      pups: { kh: at(520, { s: .85 }), tt: at(1000, { s: 1.05, f: 1 }) } }, fx: () => armTween('tt', 'R', -50, .4, { yoyo: true, repeat: 1 }) },
    { who: 'Khang (EXPERT)', cue: '"No. We never evacuate down one dangerous road. We go down, into the rock…"', ov: 'khDown', st: { sky: 'storm', city: true, alarm: true, rain: 2, dim: true, pups: { kh: at(520), tt: at(1000, { f: 1 }) } } },
    { who: 'CẢ NHÓM (trừ Hưng) đi xuống', cue: '(mọi người đi thành hàng, giả vờ xuống cầu thang)', st: { sky: 'storm', city: true, flap: true, lantern: true, inside: true, rain: 2, wind: 1, clouds: true, placard: ['Go below', 'Into the rock'],
      pups: { tt: at(760, { s: .95, f: 1 }) } }, fx: () => goBelowWalk() },
    { who: 'Khang (EXPERT)', cue: '"Our sensor technology gives an early warning… Level B3 closes behind blast doors…"', ov: 'khRefuge', st: { sky: 'storm', city: true, flap: true, lantern: true, inside: true, rain: 1, dim: true, pups: { tt: at(760, { f: 1 }) } } },
    { who: 'Linh (Mỵ Nương)', cue: '"The shelter looks bright and feels safe. People are even eating at the Night Market!"', st: { sky: 'storm', city: true, flap: true, lantern: true, inside: true, rain: 1, placard: ['Safe below', 'The Night Market'], talk: 'mn',
      pups: { mn: at(640, { s: .95 }) } }, fx: () => SND.play('sparkle') },
    { who: 'Khang (EXPERT)', cue: '"Helsinki already uses dual-use shelters like this…"', ov: 'khNet', st: { sky: 'storm', city: true, flap: true, lantern: true, inside: true, dim: true, pups: { mn: at(640) } } },
    { who: 'Hưng (Thủy Tinh) quỳ xuống', cue: '(tiếng bão nhỏ dần, Hưng quỳ xuống)', st: { sky: 'dawn', city: true, flap: false, sun: true, sea: 'calm', placard: ['The storm', 'is over'],
      pups: { kh: at(520, { s: .85 }), st: at(330, { s: .85 }), tt: at(1060, { s: .95, f: 1, y: 960, r: 12 }) } }, fx: () => SND.play('sad') },
    // Scene 6 — peace and the pitch
    { who: 'Hưng → Nguyên', cue: 'Hưng: "Is your city perfect?" · Nguyên: "No city is perfect…"', st: { sky: 'dawn', city: true, sun: true, placard: ['Scene 6', 'Peace & the Pitch'], talk: 'st',
      scroll: { kind: 'cons', h: 'An honest look', items: ['Building into a cliff costs a lot', 'It takes a long time to build', 'Lifts need constant maintenance', 'Some people may not enjoy being underground'] },
      pups: { st: at(380, { s: .9 }), tt: at(1350, { s: .9, f: 1, y: 940, r: 8 }) } } },
    { who: 'Bách (EXPERT)', cue: '"We also have to handle seawater corrosion and brine very carefully."', ov: 'baRisk', st: { sky: 'dawn', city: true, sun: true, dim: true, pups: { st: at(380), tt: at(1350, { f: 1 }) } } },
    { who: 'Nguyên (Sơn Tinh)', cue: '"But we accept a higher cost today for a city that remains safe for the next hundred years…"', st: { sky: 'dawn', city: true, sun: true, placard: ['Scene 6', 'Worth it'], talk: 'st',
      scroll: { kind: 'pros', h: 'Safe for 100 years', items: ['No fuel imports', 'Cheaper homes', 'Far less rebuilding after disasters', 'A shelter place for every resident'] },
      pups: { st: at(380, { s: .9 }), tt: at(1350, { s: .9, f: 1, y: 940, r: 8 }) } } },
    { who: 'Hưng → Nguyên bắt tay', cue: 'Hưng: "Then let\'s stop fighting. From today, my sea will power your city."', st: { sky: 'dawn', city: true, sun: true, energy: true, placard: ['Peace', 'Powered by the sea'], talk: 'tt',
      pups: { st: at(620, { s: .95 }), tt: at(860, { s: .95, f: 1 }) } }, fx: () => { SND.play('chime'); armTween('tt', 'R', -60, .8); armTween('st', 'R', -20, .8); } },
    { who: 'Nguyên (Sơn Tinh)', cue: '"Dear Sharks, the gods have made peace. Now it\'s your turn. Invest your STEM Dollars…"', st: { sky: 'day', city: true, sun: true, stem: true, placard: ['Dear Sharks', 'Your turn!'], talk: 'st',
      pups: { st: at(560, { s: 1 }) } }, fx: () => { SND.play('coin'); setTimeout(() => SND.play('coin'), 300); } },
    { who: 'CẢ NHÓM', cue: '"Carved by nature. Powered by the sea. Built for everyone!"', st: { sky: 'day', city: true, sun: true, slogan: true, names: true,
      pups: { mn: at(300, { s: .78 }), st: at(500, { s: .82 }), hu: at(700, { s: .78 }), ba: at(890, { s: .78 }), kh: at(1080, { s: .78 }), tt: at(1280, { s: .82, f: 1 }) } }, fx: () => { confetti(); SND.play('applause'); bow(); } },
    { who: 'Q&A với Sharks', cue: 'Bắt đầu phần hỏi đáp 2 phút', st: { curtain: 'closed', qa: true, sky: 'dark' }, fx: () => SND.play('applause') },
  ];

  // special effects used by some beats
  function elevatorRide() {
    const me = beat; SND.play('hum'); counter.textContent = '';
    gsap.set(rideCab, { x: 1153, y: 650, opacity: 1 });
    gsap.fromTo(rideCab, { y: 650 }, { y: 230, duration: 5.2, ease: 'none' });
    ['hu', 'mn'].forEach(k => gsap.fromTo(PUP[k].w, { y: 880 - 392 }, { y: 460 - 392, duration: 5.2, ease: 'none' }));
    [10, 20, 30, 40].forEach((n, i) => setTimeout(() => { if (beat !== me) return; counter.textContent = n; gsap.to(counter, { opacity: 1, duration: .1 }); gsap.fromTo(counter, { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(2)' }); SND.play(n === 40 ? 'ding' : 'tick'); }, 600 + i * 1300));
  }
  function goBelowWalk() {
    const team = ['st', 'mn', 'hu', 'ba', 'kh'];
    team.forEach((k, i) => {
      const w = PUP[k].w; w.style.zIndex = 4;
      gsap.timeline().set(w, { x: 300 + i * 120 - 140, y: 890 - 392, scale: .7 })
        .fromTo(w, { y: 890 - 392 + 700 }, { y: 890 - 392, duration: .5, delay: i * .15 })
        .to(w, { x: 1480 - 140, y: 770 - 392, scale: .3, duration: 2.4, ease: 'power1.inOut', delay: .3 + i * .25 })
        .to(w, { opacity: 0, duration: .4 }).set(w, { y: 1500, opacity: 1 });
    });
  }
  function bow() { Object.keys(PUP).forEach((k, i) => gsap.to($('.bob', PUP[k].w), { rotation: 18, duration: .5, delay: 1.2 + i * .08, yoyo: true, repeat: 1, ease: 'power2.inOut' })); }

  // ---------------- NAVIGATION ----------------
  let beat = -1;
  const dots = $('#dots'); BEATS.forEach(() => el('i', '', '', dots));
  function go(n, instant = false) {
    if (n < 0 || n >= BEATS.length) return;
    const prev = BEATS[beat]; if (prev && prev.after) prev.after();
    const forward = n === beat + 1; beat = n; const b = BEATS[n];
    if (n === 0 || !forward) gsap.to('#goBelow', { opacity: 0, duration: .2 });
    const st = b.st; apply(st, instant);
    showOverlay(b.ov || null, b.step || 0, instant);
    if (forward && b.fx && !instant) b.fx();
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === n));
    $('#notes').innerHTML = `<b>${n + 1}/${BEATS.length} · ${b.who}</b><br>${b.cue}` + (BEATS[n + 1] ? `<br><span style="opacity:.6">Tiếp theo: ${BEATS[n + 1].who}</span>` : '');
    location.hash = 'b' + (n + 1);
  }
  const next = () => go(beat + 1), prev = () => go(beat - 1);
  const start = $('#start');
  function begin(at = 0) { SND.init(); start.style.display = 'none'; go(at, at > 0); }
  start.addEventListener('click', e => { e.stopPropagation(); begin(0); });
  stage.addEventListener('click', e => { if (start.style.display !== 'none') return; next(); });
  addEventListener('keydown', e => {
    if (start.style.display !== 'none') { if (['ArrowRight', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); begin(0); } return; }
    if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (e.key === 'n' || e.key === 'N') $('#notes').classList.toggle('show');
    else if (e.key === 'm' || e.key === 'M') SND.toggle();
    else if (e.key === 'Home') go(0, true);
  });
  // initial hidden states
  apply({ curtain: 'closed', sky: 'dark' }, true);
  gsap.set([title, qa], { opacity: 0 }); gsap.set('#board', { opacity: 0 });
  // deep link / capture helper: #b12 jumps straight to beat 12
  const m = location.hash.match(/^#b(\d+)/); if (m) { setTimeout(() => begin(Math.min(BEATS.length, +m[1]) - 1), 50); }
  window.__deck = { go, BEATS, get beat() { return beat; } };
})();
