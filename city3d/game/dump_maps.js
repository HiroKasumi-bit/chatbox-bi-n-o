const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 700 } });
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto('http://localhost:8790/game.html');
  await p.waitForFunction(() => window.__game, null, { timeout: 300000 });
  const r = await p.evaluate(() => {
    const g = window.__game, hm = g.hm;
    const c = document.createElement('canvas'); c.width = hm.W; c.height = hm.H; const x = c.getContext('2d'); const im = x.createImageData(hm.W, hm.H);
    let mx = -1e9, mn = 1e9;
    for (let r = 0; r < hm.H; r++) for (let q = 0; q < hm.W; q++) { const h = hm.data[r * hm.W + q]; mx = Math.max(mx, h); mn = Math.min(mn, h); const v = Math.max(0, Math.min(255, h * 4 + 20)); const o = ((hm.H - 1 - r) * hm.W + q) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v; im.data[o + 3] = 255; }
    x.putImageData(im, 0, 0);
    const plan = document.querySelector('canvas#bigmap');
    return { hmap: c.toDataURL(), mx, mn, things: g.things.map(t => [t.kind, +t.pos.x.toFixed(1), +t.pos.y.toFixed(2), +t.pos.z.toFixed(1)]) };
  });
  fs.writeFileSync(out + '_h.png', Buffer.from(r.hmap.split(',')[1], 'base64'));
  const plan = await p.evaluate(() => window.__plan && window.__plan.toDataURL());
  if (plan) fs.writeFileSync(out + '_plan.png', Buffer.from(plan.split(',')[1], 'base64'));
  console.log('h range', r.mn, r.mx); console.log(JSON.stringify(r.things));
  await b.close();
})();
