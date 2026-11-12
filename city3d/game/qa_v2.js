// node game/qa_v2.js outdir : moving cars and people, aurora, falling snow, inside Mount Aurora, a fake PS5 controller
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push('PE ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.addInitScript(() => { // a fake DualSense the test can steer
    window.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), connected: true, mapping: 'standard', id: 'DualSense Wireless Controller' };
    navigator.getGamepads = () => [window.__pad];
  });
  await p.goto('file://' + path.resolve(__dirname, '../../output/Aurora_Haven_Explorer.html') + '?auto');
  await p.waitForFunction(() => window.__game && window.__game.G.playing, null, { timeout: 300000 });
  const shot = async (n, w = 1500) => { await p.waitForTimeout(w); await p.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 80, timeout: 180000 }); console.log('shot', n); };
  const ev = (s) => p.evaluate(s);
  console.log('agents', await ev('JSON.stringify(window.__game.agents().count)'));
  await ev(`(() => { const g = window.__game; g.P.pos.set(0, 0.2, 40); g.C.yaw = Math.PI; g.C.pitch = 0.35; g.C.dist = 16; })()`);
  await shot('street_a', 2500); await shot('street_b', 2500);
  // the fake controller walks the explorer forward
  const z0 = await ev('window.__game.P.pos.z');
  await ev('window.__pad.axes[1] = -1'); await p.waitForTimeout(4000); await ev('window.__pad.axes[1] = 0');
  console.log('pad walk dz', (await ev('window.__game.P.pos.z')) - z0);
  await ev(`(() => { const g = window.__game; g.P.pos.set(240, 0, 190); g.C.yaw = Math.PI * 0; g.C.pitch = 0.3; g.C.dist = 18; })()`);
  await shot('fusion_road', 3000);
  await ev(`(() => { const g = window.__game; g.teleport(0, 30); g.C.yaw = Math.PI; g.C.pitch = -0.2; g.C.dist = 6; g.toggleTime(); })()`);
  await shot('aurora_a', 4000); await shot('aurora_b', 1500);
  await ev('window.__game.goInside(true)'); await shot('inside', 4000);
  await ev(`(() => { const g = window.__game; g.C.yaw = Math.PI; g.C.pitch = 0.4; })()`); await shot('inside_back', 1500);
  console.log('errors', errs.slice(0, 10)); await b.close();
})();
