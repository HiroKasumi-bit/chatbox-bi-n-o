// node game/qa_spa.js outdir : the mountain from outside, the four spa levels, the walk map under the pipes
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../../output/Aurora_Haven_Explorer.html') + '?auto');
  await p.waitForFunction(() => window.__game && window.__game.G.playing, null, { timeout: 300000 });
  const shot = async (n, w = 4000) => { await p.waitForTimeout(w); await p.screenshot({ path: `${out}/${n}.jpg`, quality: 80, timeout: 180000 }); console.log('shot', n); };
  const ev = (s) => p.evaluate(s);
  // walk test under the heat main (pipes at 5 m on the line x 140..320, z 128) and across a snow bank
  console.log('under pipes', JSON.stringify(await ev('window.__game.walkTest(200, 118, 200, 140)')), 'old top-map height', await ev('window.__game.hm.at(200, 128).toFixed(2)'), 'walk', await ev('window.__game.hm.walk(200, 128).toFixed(2)'));
  console.log('into a building (must fail)', JSON.stringify(await ev('window.__game.walkTest(0, 22, 0, -14)')));
  await ev(`(() => { const g = window.__game; g.P.pos.set(0, 0, 175); g.C.yaw = Math.PI * 0; g.C.pitch = 0.12; g.C.dist = 9; })()`); await shot('mountain_out');
  for (const r of ['L1', 'L2', 'L3', 'L4']) { await ev(`window.__game.goRoom('${r}')`); await shot('room_' + r, 5000); }
  await ev(`(() => { const g = window.__game; g.C.yaw += Math.PI; g.C.pitch = -0.3; })()`); await shot('room_L4_up', 2500);
  console.log('errors', errs); await b.close();
})();
