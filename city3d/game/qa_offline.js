const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto('file://' + path.resolve(__dirname, '../../output/Aurora_Haven_Explorer.html'));
  await p.waitForFunction(() => window.__game, null, { timeout: 300000 });
  const shot = async (n, w = 2000) => { await p.waitForTimeout(w); await p.screenshot({ path: `${out}_${n}.jpg`, type: 'jpeg', quality: 82, timeout: 180000 }); console.log('shot', n); };
  await shot('title', 3000);
  await p.click('.lang button[data-l="vi"]'); await shot('title_vi', 800);
  await p.click('#play'); await shot('play_vi', 4000);
  await p.keyboard.press('m'); await shot('map', 1500); await p.keyboard.press('Escape');
  await p.evaluate(() => window.__game.teleport(60, 40)); await p.keyboard.press('t'); await shot('dusk', 5000);
  await p.evaluate(() => window.__game.teleport(0, 300)); await p.evaluate(() => { const g = window.__game; g.C.yaw = Math.PI; g.C.pitch = 0.15; g.C.dist = 12; }); await p.keyboard.press('t'); await shot('mountain_sun', 5000);
  console.log('errors', errs.slice(0, 8)); await b.close();
})();
