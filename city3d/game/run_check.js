// node game/run_check.js out.png [query] : loads game.html, prints errors, timing and fps, saves a screenshot
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || 'shot.png', q = process.argv[3] || 'auto';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text().slice(0, 300)); });
  const t0 = Date.now();
  await p.goto('http://localhost:8790/game.html?' + q);
  await p.waitForFunction(() => window.__game, null, { timeout: 300000 });
  console.log('ready in', (Date.now() - t0) / 1000, 's');
  if (process.env.STEPS) for (const s of process.env.STEPS.split(';')) { await p.evaluate(s); await p.waitForTimeout(+(process.env.WAIT || 1500)); }
  await p.waitForTimeout(+(process.env.FINAL || 3000));
  console.log('fps', await p.evaluate(() => window.__fps), 'pos', await p.evaluate(() => JSON.stringify(window.__game.P.pos)));
  await p.screenshot({ path: out });
  console.log('errors', errs.slice(0, 12)); await b.close();
})();
