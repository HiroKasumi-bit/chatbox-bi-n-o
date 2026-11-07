/* "Tôi có một ước mơ" — museum-style deck. Opens straight into a cinematic intro; each click = one beat. */
(() => {
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const stage = $('#stage');
  const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
  addEventListener('resize', fit); fit();
  gsap.ticker.lagSmoothing(0);

  const cols2 = $('#cols').cloneNode(true); cols2.id = 'cols2'; $('#cols').after(cols2);
  gsap.set('#cols2 img', { scaleX: -1 });
  const LAY = ['bg', 'sun', 'proc', 'cols', 'cols2', 'march', 'mlk', 'statue', 'portrait', 'phWide', 'phFountain', 'phVote', 'phLeaders', 'leavesB'];
  const BASE = {
    bg: { x: 0, y: 0, s: 1.15, o: 1, r: 0 }, sun: { x: 510, y: 1100, s: 1.1, o: 0, r: 0 }, proc: { x: 1000, y: 200, s: .8, o: 0, r: -6 },
    cols: { x: 1500, y: 40, s: 1, o: 0, r: 0 }, cols2: { x: -400, y: 40, s: 1, o: 0, r: 0 },
    march: { x: 1100, y: 260, s: 1, o: 0, r: 0 }, mlk: { x: 1100, y: 330, s: 1, o: 0, r: 0 }, statue: { x: 1100, y: 330, s: 1, o: 0, r: 0 },
    leavesB: { x: -240, y: 800, s: 1, o: 1, r: 0 },
    portrait: { x: 1300, y: 240, s: 1, o: 0, r: 0 }, phWide: { x: 1420, y: 260, s: 1, o: 0, r: 6 }, phFountain: { x: 1260, y: 380, s: 1, o: 0, r: 4 },
    phVote: { x: 1420, y: 260, s: 1, o: 0, r: 8 }, phLeaders: { x: 1240, y: 400, s: 1, o: 0, r: 4 },
  };
  // leaf curtain: 0 = closed, 1 = framing the edges, 2 = gone
  const LEAF = [{ x: 0, s: 1.3 }, { x: 430, s: 1.06 }, { x: 1400, s: 1.2 }];
  const B = [
    { p: '0', nav: 0, tint: 'night', leaf: 1, rays: .55, scrim: 0, cam: { bg: { s: 1.2 }, leavesB: { y: 620 }, cols: { x: 1600, y: 30, o: .3, s: 1.05 }, cols2: { x: -370, y: 30, o: .3, s: 1.05 } } },
    { p: 'A', nav: 1, tint: 'dusk', leaf: 2, cam: { bg: { s: 1.3, x: -260 }, portrait: { x: 1180, y: 190, o: 1 }, leavesB: { y: 800 } } },
    { p: 'B', nav: 2, tint: 'moss', leaf: 2, src: 1, cam: { bg: { s: 1.02, x: 20, y: -10 }, phWide: { x: 1300, y: 190, o: 1, r: 2.5 }, leavesB: { y: 860 } } },
    { p: '1', nav: 3, tint: 'moss', leaf: 2, cam: { bg: { s: 1.05, x: -40 }, leavesB: { y: 780 }, phFountain: { x: 1140, y: 300, o: 1, r: -2 } } },
    { p: '2', nav: 3, tint: 'moss', leaf: 2, cam: { bg: { s: 1.12, x: -120 }, statue: { x: 1080, y: 300, o: 1 }, cols: { x: 1440, y: -60, s: 1.1, o: .9 }, proc: { x: 1240, y: 150, o: .45, s: .7, r: -7 }, leavesB: { y: 760 } } },
    { p: '3', nav: 3, tint: 'night', leaf: 2, cam: { bg: { s: 1.3, x: -260, y: -60 }, statue: { x: 1440, y: 620, s: .5, o: .28 }, cols: { x: 1660, y: 120, s: .8, o: .3 }, leavesB: { y: 820 } } },
    { p: '4', nav: 4, tint: 'dusk', leaf: 2, cam: { bg: { s: 1.25, x: -200 }, phVote: { x: 1290, y: 170, o: 1, r: 3 }, leavesB: { y: 780 } } },
    { p: '5', nav: 4, tint: 'dusk', leaf: 2, cam: { bg: { s: 1.35, x: -300 }, mlk: { x: 1180, y: 250, s: 1.3, o: .45 }, leavesB: { y: 840 } }, fx: echo },
    { p: '6', nav: 4, tint: 'dusk', leaf: 2, cam: { bg: { s: 1.2, x: -100 }, phLeaders: { x: 1130, y: 330, o: 1, r: -2 }, leavesB: { y: 780 } } },
    { p: '7', nav: 4, tint: 'night', leaf: 2, cam: { bg: { s: 1.3, x: -220 }, cols: { x: 1500, y: 60, s: 1, o: .35 }, cols2: { x: -260, y: 60, s: 1, o: .35 }, leavesB: { y: 840 } } },
    { p: '8', nav: 4, tint: 'dawn', warm: true, leaf: 2, rays: .35, cam: { bg: { s: 1.08 }, sun: { x: 1120, y: 40, o: 1 }, march: { x: 1020, y: 290, o: 1 }, leavesB: { y: 640 } } },
    { p: 'E', nav: 0, tint: 'dawn', warm: true, leaf: 1, rays: 1, scrim: 0, cam: { bg: { s: 1.16 }, sun: { x: 510, y: 60, s: 1.25, o: 1 }, leavesB: { y: 600 }, cols: { x: 1600, y: 30, o: .55, s: 1.05 }, cols2: { x: -370, y: 30, o: .55, s: 1.05 } } },
  ];

  // split running text into words, and opening/ending lines into letters (text unchanged)
  $$('.P').forEach(p => {
    const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) nodes.push(walk.currentNode);
    nodes.forEach(n => {
      if (n.parentElement.closest('.sign, .split')) return;
      const f = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t)); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; f.appendChild(s); } });
      n.replaceWith(f);
    });
  });
  $$('.split').forEach(el => {
    const text = el.textContent; el.textContent = '';
    text.split(/(\s+)/).forEach(t => {
      if (/^\s+$/.test(t)) { el.appendChild(document.createTextNode(' ')); return; }
      const wd = document.createElement('span'); wd.className = 'wd';
      [...t].forEach(c => { const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c; wd.appendChild(ch); });
      el.appendChild(wd);
    });
  });

  // canvases: dust + burst, light rays
  const cv = $('#dust'), cx = cv.getContext('2d');
  const motes = Array.from({ length: 90 }, () => ({ x: Math.random() * 1920, y: Math.random() * 1080, r: .6 + Math.random() * 2.2, v: .15 + Math.random() * .45, a: Math.random() * 6.28 }));
  let warm = false, burst = [];
  const rc = $('#rays').getContext('2d'); let rayT = 0;
  gsap.ticker.add(() => {
    cx.clearRect(0, 0, 1920, 1080);
    motes.forEach(m => { m.y -= m.v; m.a += .01; m.x += Math.sin(m.a) * .3; if (m.y < -10) { m.y = 1090; m.x = Math.random() * 1920; }
      cx.fillStyle = warm ? 'rgba(255,205,150,.55)' : 'rgba(225,235,210,.38)'; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.28); cx.fill(); });
    burst.forEach(b => { b.vx *= .985; b.vy = b.vy * .985 + .05; b.x += b.vx; b.y += b.vy; b.l -= .006;
      cx.globalAlpha = Math.max(0, b.l); cx.fillStyle = b.c; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.28); cx.fill(); });
    cx.globalAlpha = 1; burst = burst.filter(b => b.l > 0);
    if (+getComputedStyle($('#rays')).opacity > 0) {
      rayT += .0025; rc.clearRect(0, 0, 1920, 1080);
      const ox = 960, oy = -260, col = warm ? '255,206,140' : '210,225,200';
      for (let i = 0; i < 14; i++) {
        const a = Math.PI / 2 + Math.sin(rayT + i * 1.7) * .08 + (i - 6.5) * .085, w = .018 + (i % 3) * .01, L = 1700;
        const g = rc.createLinearGradient(ox, oy, ox + Math.cos(a) * L, oy + Math.sin(a) * L);
        g.addColorStop(0, `rgba(${col},${.22 + (i % 4) * .05})`); g.addColorStop(1, `rgba(${col},0)`);
        rc.fillStyle = g; rc.beginPath(); rc.moveTo(ox, oy); rc.lineTo(ox + Math.cos(a - w) * L, oy + Math.sin(a - w) * L); rc.lineTo(ox + Math.cos(a + w) * L, oy + Math.sin(a + w) * L); rc.closePath(); rc.fill();
      }
    }
  });
  const goldBurst = () => { const cs = ['#ffe3a1', '#d2ae68', '#fff6e0', '#e8875a']; for (let i = 0; i < 260; i++) { const a = Math.random() * 6.28, v = 3 + Math.random() * 12; burst.push({ x: 960, y: 470, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: 1 + Math.random() * 3.2, l: 1 + Math.random() * .4, c: cs[i % 4] }); } };

  // marquee of the original English title
  const marq = $('#marq'); gsap.set(marq, { y: 600, opacity: 0 });
  gsap.to(marq, { x: -1800, duration: 60, repeat: -1, ease: 'none' });

  let echoes = [];
  function echo() {
    [[1300, 260, 46], [1480, 420, 64], [1260, 560, 38], [1500, 700, 54], [1330, 850, 42], [1620, 180, 34]].forEach(([x, y, f], i) => {
      const e = document.createElement('div'); e.className = 'echo'; e.textContent = 'đây là lúc'; e.style.cssText = `left:${x}px;top:${y}px;font-size:${f}px;z-index:15`;
      stage.appendChild(e); echoes.push(e);
      gsap.fromTo(e, { opacity: 0, x: 60, filter: 'blur(10px)' }, { opacity: .2 + (i % 3) * .2, x: 0, filter: 'blur(0px)', duration: 1.2, delay: 1 + i * .35, ease: 'power3.out' });
      gsap.to(e, { y: '-=24', duration: 3 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 + i * .35 });
    });
  }
  const clearEcho = () => { echoes.forEach(e => { gsap.killTweensOf(e); e.remove(); }); echoes = []; };

  // letter cascade for the opening and ending titles
  let loops = [], titleTls = [];
  function titleIn(p, delay, ending) {
    const kick = $$('.kick .ch, .vb .ch', p), big = $$('.big .ch', p), sub = $$('.auth .ch, .thanks .ch', p), sweep = $('.sweep', p);
    const tl = gsap.timeline({ delay });
    tl.fromTo(kick, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, stagger: .025, ease: 'power2.out' }, 0)
      .fromTo(big, { opacity: 0, y: 140, rotationX: -95, filter: 'blur(14px)', transformOrigin: '50% 100% -40px' },
        { opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', duration: 1.3, stagger: .055, ease: 'expo.out' }, .2)
      .fromTo(sub, { opacity: 0, y: ending ? 24 : 0, x: ending ? 0 : 30, filter: 'blur(6px)' }, { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', duration: .8, stagger: ending ? .03 : .04, ease: 'power3.out' }, 1.3)
      .fromTo(sweep, { backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0', duration: 1.6, ease: 'power2.inOut' }, 1.4);
    titleTls.push(tl);
    loops.push(gsap.to(sweep, { backgroundPosition: '-20% 0', startAt: { backgroundPosition: '120% 0' }, duration: 1.8, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.2, delay: delay + 4 }));
    return tl;
  }

  let cur = -1, introTl = null;
  const dots = $('#dots'); B.forEach(() => dots.appendChild(document.createElement('i')));
  function go(n, instant = false) {
    if (n < 0 || n >= B.length) return;
    const b = B[n], D = instant ? 0 : 1, fwd = n > cur;
    clearEcho(); loops.forEach(l => l.kill()); loops = [];
    if (introTl) { introTl.progress(1); introTl = null; }
    if (cur >= 0) { const old = $('#p' + B[cur].p); gsap.to(old, { opacity: 0, y: fwd ? -30 : 30, filter: 'blur(6px)', duration: .45 * D, ease: 'power2.in', onComplete: () => old.classList.remove('on') }); }
    LAY.forEach(id => { const t = { ...BASE[id], ...(b.cam[id] || {}) }; gsap.to('#' + id, { x: t.x, y: t.y, scale: t.s, opacity: t.o, rotation: t.r, duration: (id === 'sun' && b.p === 'E' ? 3.2 : 1.6) * D, ease: id === 'sun' ? 'power2.out' : 'expo.inOut', overwrite: 'auto' }); });
    const lf = LEAF[b.leaf];
    gsap.to('#leafL', { x: -lf.x, scale: lf.s, duration: 2 * D, ease: 'expo.inOut', overwrite: 'auto' });
    gsap.to('#leafR', { x: lf.x, scale: lf.s, duration: 2 * D, ease: 'expo.inOut', overwrite: 'auto' });
    $('#tint').className = b.tint; warm = !!b.warm;
    gsap.to('#rays', { opacity: b.rays || 0, duration: 1.6 * D });
    gsap.to('#scrim', { opacity: b.scrim === 0 ? 0 : 1, duration: 1.2 * D });
    gsap.to('#marq', { opacity: b.p === '0' || b.p === 'E' ? 1 : 0, duration: 1.2 * D });
    gsap.to('#marq', { webkitTextStroke: '1.5px ' + (b.warm ? 'rgba(255,214,160,.28)' : 'rgba(239,233,221,.16)'), duration: 1 * D });
    gsap.to('#halo', { opacity: b.p === 'E' ? 1 : 0, scale: b.p === 'E' ? 1 : .6, duration: 2.4 * D });
    gsap.to('#src', { opacity: b.src ? 1 : 0, duration: .8 * D });
    gsap.to('#pinB', { opacity: b.p === 'B' ? 1 : 0, x: b.p === 'B' ? 0 : 40, duration: .9 * D, delay: b.p === 'B' ? 1.6 * D : 0 });
    $('#nav').classList.toggle('hide', !b.nav);
    gsap.to('#march img, #mlk img, #portrait img, .frame img', { filter: b.warm ? 'grayscale(.2) sepia(.45) saturate(1.3) brightness(1.05)' : 'grayscale(1) sepia(.35) brightness(.95) contrast(1.05)', duration: 1.4 * D });
    gsap.to('#leavesB img, .leafHalf img', { filter: b.warm ? 'sepia(.6) saturate(1.4) brightness(1.25) hue-rotate(-15deg)' : 'none', duration: 1.4 * D });
    gsap.to('#bg img', { filter: b.p === 'E' ? 'brightness(1.12) saturate(1.15)' : 'none', duration: 2 * D });

    const p = $('#p' + b.p); p.classList.add('on'); gsap.set(p, { opacity: 1, y: 0, filter: 'blur(0px)' });
    if (b.p === '0' || b.p === 'E') {
      if (instant) gsap.set($$('.ch', p), { opacity: 1, y: 0, x: 0, rotationX: 0, filter: 'blur(0px)' });
      else titleIn(p, b.p === 'E' ? 1.1 : .5, b.p === 'E');
      if (b.p === 'E' && !instant) { gsap.delayedCall(2.4, goldBurst); gsap.fromTo('#flash', { opacity: .35 }, { opacity: 0, duration: 1.2, delay: 2.3 }); }
    } else {
      const words = $$('.w', p), cards = $$('.ex, .sign, .row, .fact', p), line = $('.tl .line', p);
      gsap.fromTo(words, { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7 * D, ease: 'power3.out', delay: .55 * D, stagger: Math.min(.025, 1.6 / Math.max(words.length, 1)) * D });
      if (cards.length) gsap.fromTo(cards, { opacity: 0, y: 40, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .9 * D, ease: 'expo.out', delay: .8 * D, stagger: .16 * D });
      if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 1.4 * D, ease: 'power2.inOut', delay: .8 * D });
      const sg = $('.sign', p); if (sg && !instant) gsap.fromTo(sg, { rotation: -18, scale: .6 }, { rotation: -3, scale: 1, duration: 1.1, ease: 'back.out(1.8)', delay: 1.1 });
      if (b.fx && !instant) b.fx();
    }
    $$('#nav .links span').forEach(s => s.classList.toggle('on', +s.dataset.s === b.nav));
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === n));
    $('#count').textContent = String(n + 1).padStart(2, '0') + ' / ' + String(B.length).padStart(2, '0');
    cur = n;
  }

  // opening: black → date → through the leaves into the memorial
  function intro() {
    const intro = $('#intro');
    cur = -1; go(0, true);
    gsap.set('#bg', { scale: 1.65 }); gsap.set(['#leafL', '#leafR'], { x: 0, scale: 1.3 });
    gsap.set($$('#p0 .ch'), { opacity: 0 }); gsap.set('#marq', { opacity: 0 }); gsap.set('#rays', { opacity: 0 });
    const dch = $$('.date .ch', intro);
    introTl = gsap.timeline({ onComplete: () => { introTl = null; } });
    introTl.fromTo(dch, { opacity: 0, y: 26, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .6, stagger: .07, ease: 'power3.out' }, .3)
      .to('#intro .bar', { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, .5)
      .to('#intro .place', { opacity: 1, letterSpacing: '.3em', duration: 1, ease: 'power2.out' }, 1.1)
      .to(intro, { scale: 1.6, opacity: 0, filter: 'blur(14px)', duration: 1.1, ease: 'power3.in' }, 2.7)
      .fromTo('#flash', { opacity: 0 }, { opacity: .55, duration: .18, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 3.55)
      .to('#bg', { scale: 1.2, duration: 3, ease: 'expo.out' }, 3.5)
      .to('#leafL', { x: -LEAF[1].x, scale: LEAF[1].s, duration: 2.6, ease: 'expo.inOut' }, 3.4)
      .to('#leafR', { x: LEAF[1].x, scale: LEAF[1].s, duration: 2.6, ease: 'expo.inOut' }, 3.4)
      .add(() => { intro.style.display = 'none'; }, 3.9);
    introTl.to('#rays', { opacity: B[0].rays, duration: 2.4 }, 4).to('#marq', { opacity: 1, duration: 2 }, 4.4)
      .add(() => titleIn($('#p0'), 0, false), 4.3);
  }

  // while the opening is still playing, a click only finishes it (stays on the cover)
  const next = () => {
    if (introTl) { introTl.progress(1); titleTls.forEach(t => t.progress(1)); return; }
    go(cur + 1);
  };
  stage.addEventListener('click', next);
  addEventListener('keydown', e => {
    if ([' ', 'ArrowRight', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'f' || e.key === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (_) { } }
    else if (e.key === 'Home') go(0);
  });
  const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(intro);
  window.__deck = { go, n: B.length, get cur() { return cur; } };
})();
