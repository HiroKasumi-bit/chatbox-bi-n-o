const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'qa'; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); });
  await p.goto('file://' + __dirname + '/deck.html');
  await p.addStyleTag({ content: 'img{max-width:100%}' });
  // a click 1.5 s into the opening must finish it and stay on the cover
  await p.waitForTimeout(1500); await p.mouse.click(960, 540); await p.waitForTimeout(1500);
  console.log('after early click, slide =', await p.evaluate(() => window.__deck.cur));
  await p.screenshot({ path: `${out}/o_skip.png` });
  await p.reload(); await p.addStyleTag({ content: 'img{max-width:100%}' });
  let last = 0;
  for (const t of [1200, 3700, 5000, 9000]) { await p.waitForTimeout(t - last); last = t; await p.screenshot({ path: `${out}/o_${t}.png` }); }
  await p.screenshot({ path: `${out}/b01.png` });
  const n = await p.evaluate(() => window.__deck.n);
  for (let i = 1; i < n; i++) {
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(i === n - 1 ? 6500 : 3800);
    await p.screenshot({ path: `${out}/b${String(i + 1).padStart(2, '0')}.png` });
  }
  await b.close(); console.log('done', n);
})();
