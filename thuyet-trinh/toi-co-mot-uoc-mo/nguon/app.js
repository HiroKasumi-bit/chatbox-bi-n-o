/* "Tôi có 1 ước mơ" — museum-style deck. Each click = one beat. Layers glide between beats (Smart Animate feel). */
(() => {
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const stage = $('#stage');
  const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
  addEventListener('resize', fit); fit();
  gsap.ticker.lagSmoothing(0);

  // a mirrored copy of the columns for symmetric scenes
  const cols2 = $('#cols').cloneNode(true); cols2.id = 'cols2'; $('#cols').after(cols2);
  const LAY = ['bg', 'sun', 'proc', 'cols', 'cols2', 'march', 'mlk', 'statue', 'leavesB', 'leavesF'];
  const BASE = {
    bg: { x: 0, y: 0, s: 1.15, o: 1, r: 0 }, sun: { x: 1000, y: 700, s: 1, o: 0, r: 0 }, proc: { x: 1000, y: 200, s: .8, o: 0, r: -6 },
    cols: { x: 1500, y: 40, s: 1, o: 0, r: 0 }, cols2: { x: -400, y: 40, s: 1, o: 0, r: 0 },
    march: { x: 1100, y: 260, s: 1, o: 0, r: 0 }, mlk: { x: 1100, y: 330, s: 1, o: 0, r: 0 }, statue: { x: 1100, y: 330, s: 1, o: 0, r: 0 },
    leavesB: { x: -240, y: 800, s: 1, o: 1, r: 0 }, leavesF: { x: -240, y: -135, s: 2.6, o: 0, r: 0 },
  };
  gsap.set('#cols2 img', { scaleX: -1 });
  // beat = { cam: {layer: {x,y,s,o,r}}, tint, nav, warm }
  const B = [
    { p: 0, nav: 0, tint: 'night', cam: { bg: { s: 1.22 }, leavesF: { s: 1, o: 1 }, leavesB: { y: 600 }, cols: { x: 1560, y: 30, o: .35, s: 1.05 }, cols2: { x: -330, y: 30, o: .35, s: 1.05 } } },
    { p: 1, nav: 1, tint: 'moss', cam: { bg: { s: 1.05, x: -40 }, leavesF: { s: 2.6, o: 0 }, leavesB: { y: 780 }, march: { x: 960, y: 230, o: .95 } } },
    { p: 2, nav: 1, tint: 'moss', cam: { bg: { s: 1.12, x: -120 }, statue: { x: 1080, y: 300, o: 1 }, cols: { x: 1440, y: -60, s: 1.1, o: .9 }, proc: { x: 1240, y: 150, o: .45, s: .7, r: -7 }, leavesB: { y: 760 } } },
    { p: 3, nav: 1, tint: 'night', cam: { bg: { s: 1.3, x: -260, y: -60 }, statue: { x: 1440, y: 620, s: .5, o: .28 }, cols: { x: 1660, y: 120, s: .8, o: .3 }, leavesB: { y: 820 } } },
    { p: 4, nav: 2, tint: 'dusk', cam: { bg: { s: 1.25, x: -200 }, mlk: { x: 960, y: 320, o: 1 }, leavesB: { y: 780 } } },
    { p: 5, nav: 2, tint: 'dusk', cam: { bg: { s: 1.35, x: -300 }, mlk: { x: 1180, y: 250, s: 1.3, o: .45 }, leavesB: { y: 840 } }, fx: echo },
    { p: 6, nav: 2, tint: 'dusk', cam: { bg: { s: 1.2, x: -100 }, march: { x: 1000, y: 260, o: 1 }, leavesB: { y: 780 } } },
    { p: 7, nav: 2, tint: 'night', cam: { bg: { s: 1.3, x: -220 }, march: { x: 1340, y: 600, s: .62, o: .3 }, leavesB: { y: 840 } } },
    { p: 8, nav: 2, tint: 'dawn', warm: true, cam: { bg: { s: 1.08 }, sun: { x: 1120, y: 40, o: 1, s: 1.1 }, march: { x: 1020, y: 290, o: 1 }, leavesB: { y: 640 } } },
    { p: 9, nav: 3, tint: 'night', cam: { bg: { s: 1.15 }, cols: { x: 1340, y: -40, s: 1.15, o: .75 }, cols2: { x: -120, y: -40, s: 1.15, o: .75 }, leavesB: { y: 760 } } },
    { p: 10, nav: 3, tint: 'moss', cam: { bg: { s: 1.2, x: -80 }, statue: { x: 1460, y: 610, s: .5, o: .45 }, cols: { x: 1640, y: 200, s: .7, o: .3 }, leavesB: { y: 840 } } },
    { p: 11, nav: 3, tint: 'moss', cam: { bg: { s: 1.12, x: -160 }, statue: { x: 1180, y: 320, s: .95, o: 1 }, cols: { x: 1500, y: -40, s: 1.05, o: .85 }, proc: { x: 1300, y: 120, s: .7, o: .35, r: 6 }, leavesB: { y: 760 } } },
    { p: 12, nav: 3, tint: 'night', cam: { bg: { s: 1.28, x: -240 }, march: { x: 1260, y: 640, s: .58, o: .3 }, leavesB: { y: 840 } } },
    { p: 13, nav: 0, tint: 'dawn', warm: true, cam: { bg: { s: 1.18 }, sun: { x: 510, y: 120, s: 1.1, o: .9 }, leavesF: { s: 1, o: 1 }, leavesB: { y: 600 }, cols: { x: 1560, y: 30, o: .5, s: 1.05 }, cols2: { x: -330, y: 30, o: .5, s: 1.05 } } },
  ];

  // split text into words so each can rise in (the text itself is untouched)
  $$('.P').forEach(p => {
    const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) nodes.push(walk.currentNode);
    nodes.forEach(n => {
      if (n.parentElement.closest('.unk, .sign')) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(tok));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.appendChild(s); }
      });
      n.replaceWith(frag);
    });
  });

  // dust motes
  const cv = $('#dust'), cx = cv.getContext('2d');
  const motes = Array.from({ length: 90 }, () => ({ x: Math.random() * 1920, y: Math.random() * 1080, r: .6 + Math.random() * 2.2, v: .15 + Math.random() * .45, a: Math.random() * 6.28 }));
  let warm = false;
  gsap.ticker.add(() => {
    cx.clearRect(0, 0, 1920, 1080);
    motes.forEach(m => { m.y -= m.v; m.a += .01; m.x += Math.sin(m.a) * .3; if (m.y < -10) { m.y = 1090; m.x = Math.random() * 1920; }
      cx.fillStyle = warm ? 'rgba(255,205,150,.55)' : 'rgba(225,235,210,.38)'; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.28); cx.fill(); });
  });

  // decorative echo of the repeated phrase from the notebook
  let echoes = [];
  function echo() {
    const pos = [[1300, 260, 46], [1480, 420, 64], [1260, 560, 38], [1500, 700, 54], [1330, 850, 42], [1620, 180, 34]];
    pos.forEach(([x, y, f], i) => {
      const e = document.createElement('div'); e.className = 'echo'; e.textContent = 'đây là lúc'; e.style.cssText = `left:${x}px;top:${y}px;font-size:${f}px;z-index:15`;
      stage.appendChild(e); echoes.push(e);
      gsap.fromTo(e, { opacity: 0, x: 60, filter: 'blur(10px)' }, { opacity: .2 + (i % 3) * .2, x: 0, filter: 'blur(0px)', duration: 1.2, delay: 1 + i * .35, ease: 'power3.out' });
      gsap.to(e, { y: '-=24', duration: 3 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 + i * .35 });
    });
  }
  const clearEcho = () => { echoes.forEach(e => { gsap.killTweensOf(e); e.remove(); }); echoes = []; };

  // apply a beat
  let cur = -1;
  const dots = $('#dots'); B.forEach(() => dots.appendChild(document.createElement('i')));
  function go(n, instant = false) {
    if (n < 0 || n >= B.length) return;
    const b = B[n], D = instant ? 0 : 1, fwd = n > cur;
    clearEcho();
    // old panel out
    if (cur >= 0) { const old = $('#p' + B[cur].p); gsap.to(old, { opacity: 0, y: fwd ? -30 : 30, filter: 'blur(6px)', duration: .45 * D, ease: 'power2.in', onComplete: () => old.classList.remove('on') }); }
    // camera
    LAY.forEach(id => {
      const t = { ...BASE[id], ...(b.cam[id] || {}) };
      gsap.to('#' + id, { x: t.x, y: t.y, scale: t.s, opacity: t.o, rotation: t.r, duration: 1.6 * D, ease: 'expo.inOut', overwrite: 'auto' });
    });
    $('#tint').className = b.tint;
    gsap.to('#scrim', { opacity: [0, 9, 13].includes(b.p) ? 0 : 1, duration: 1.2 * D });
    warm = !!b.warm;
    gsap.to('#march img, #mlk img', { filter: b.warm ? 'grayscale(.2) sepia(.45) saturate(1.3) brightness(1.05)' : 'grayscale(1) sepia(.35) brightness(.95) contrast(1.05)', duration: 1.4 * D });
    gsap.to('#leavesB img', { filter: b.warm ? 'sepia(.6) saturate(1.4) brightness(1.25) hue-rotate(-15deg)' : 'none', duration: 1.4 * D });
    // new panel in
    const p = $('#p' + b.p); p.classList.add('on');
    gsap.set(p, { opacity: 1, y: 0, filter: 'blur(0px)' });
    const words = $$('.w', p), cards = $$('.ex, .sign, .unk', p);
    gsap.fromTo(words, { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7 * D, ease: 'power3.out', delay: .55 * D, stagger: Math.min(.025, 1.6 / Math.max(words.length, 1)) * D });
    if (cards.length) gsap.fromTo(cards, { opacity: 0, y: 50, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .9 * D, ease: 'expo.out', delay: .45 * D, stagger: .18 * D });
    const sg = $('.sign', p); if (sg && !instant) gsap.fromTo(sg, { rotation: -18, scale: .6 }, { rotation: -3, scale: 1, duration: 1.1, ease: 'back.out(1.8)', delay: 1.1 });
    if (b.fx && !instant) b.fx();
    $$('#nav .links span').forEach(s => s.classList.toggle('on', +s.dataset.s === b.nav));
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === n));
    $('#count').textContent = String(n + 1).padStart(2, '0') + ' / ' + String(B.length).padStart(2, '0');
    cur = n; history.replaceState(null, '', '#b' + (n + 1));
  }

  // initial state
  LAY.forEach(id => { const t = BASE[id]; gsap.set('#' + id, { x: t.x, y: t.y, scale: t.s, opacity: t.o, rotation: t.r }); });
  gsap.set('#leavesF', { scale: 1, opacity: 1 });
  const start = $('#start');
  const begin = (n = 0) => { start.style.display = 'none'; go(n, n > 0); };
  start.addEventListener('click', e => { e.stopPropagation(); begin(0); });
  stage.addEventListener('click', () => { if (start.style.display === 'none') go(cur + 1); });
  addEventListener('keydown', e => {
    if (start.style.display !== 'none') { if ([' ', 'ArrowRight', 'Enter'].includes(e.key)) { e.preventDefault(); begin(0); } return; }
    if ([' ', 'ArrowRight', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'f' || e.key === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (_) { } }
    else if (e.key === 'Home') go(0);
  });
  const m = location.hash.match(/^#b(\d+)/); if (m) setTimeout(() => begin(Math.min(B.length, +m[1]) - 1), 60);
  window.__deck = { go, n: B.length, get cur() { return cur; } };
})();
