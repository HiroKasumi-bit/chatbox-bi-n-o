// node game/qa_flow.js outdir : plays through the missions with the debug hooks and takes screenshots
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto('http://localhost:8790/game.html?auto' + (process.env.LANG2 ? '&' : ''));
  await p.waitForFunction(() => window.__game && window.__game.G.playing, null, { timeout: 300000 });
  const shot = async (n, w = 2500) => { await p.waitForTimeout(w); await p.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 80, timeout: 180000 }); console.log('shot', n); };
  const ev = (s) => p.evaluate(s);
  const goCard = async (mi, ci) => ev(`(() => { const g = window.__game, t = g.things.find(t => t.kind === 'card' && t.mi === ${mi} && t.ci === ${ci}); g.P.pos.set(t.pos.x + 0.7, t.pos.y, t.pos.z + 0.7); g.P.vy = 0; })()`);
  const goTerm = async (mi) => ev(`(() => { const g = window.__game, t = g.things.find(t => t.kind === 'terminal' && t.mi === ${mi}); g.P.pos.set(t.pos.x + 0.7, t.pos.y, t.pos.z + 0.7); g.P.vy = 0; })()`);
  await shot('01_start', 3000);
  const S0 = +(process.env.START || 0);
  for (let k = 0; k < S0; k++) await ev('window.__game.missionDone()');
  for (let mi = S0; mi < 6; mi++) {
    for (let ci = 0; ci < 3; ci++) {
      await goCard(mi, ci); await p.waitForTimeout(1500);
      if (ci === 0) await shot(`m${mi}_near_card`, 500);
      await ev('window.__game.interact()'); if (ci === 0) await shot(`m${mi}_card`, 800);
      await p.keyboard.press('e'); await p.waitForTimeout(300);
    }
    await goTerm(mi); await p.waitForTimeout(1500);
    console.log('before quiz', await ev('JSON.stringify({got:[...window.__game.G.got], modal: !!window.__game.G.modal, near: (n => n && [n.kind, n.mi])(window.__game.nearThing()), pos: window.__game.P.pos})'));
    await ev('window.__game.interact()');
    console.log('after', await ev('JSON.stringify({modal: !!window.__game.G.modal, html: document.querySelector("#modal").textContent.slice(0,80)})'));
    if (mi === 0) { await p.keyboard.press('1'); await shot('m0_quiz_wrong', 600); }
    const ans = [1, 2, 0, 2, 0, 1][mi]; await p.keyboard.press(String(ans + 1)); await shot(`m${mi}_quiz_right`, 600);
    await p.waitForTimeout(1800);
    console.log('mission', mi, await ev('JSON.stringify({mi: window.__game.G.mi, score: window.__game.G.score, phase: window.__game.G.phase})'));
  }
  await shot('finale_storm', 4000);
  await ev(`(() => { const g = window.__game, t = g.things.find(t => t.kind === 'shelter'); g.P.pos.set(t.pos.x + 2, t.pos.y, t.pos.z + 2); })()`);
  await shot('end', 4500);
  console.log('final', await ev('JSON.stringify({score: window.__game.G.score, done: window.__game.G.done, places: window.__game.G.places.size})'));
  console.log('errors', errs.slice(0, 10)); await b.close();
})();
