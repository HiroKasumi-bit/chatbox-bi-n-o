const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'qa'; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); });
  await p.goto('file://' + __dirname + '/deck.html');
  await p.addStyleTag({ content: 'img{max-width:100%}' }); // the online host adds this rule
  // an early click must only finish the opening and stay on the cover
  await p.waitForTimeout(1500); await p.mouse.click(960, 540); await p.waitForTimeout(600);
  console.log('after early click, slide =', await p.evaluate(() => window.__deck.cur));
  await p.reload(); await p.addStyleTag({ content: 'img{max-width:100%}' });
  let last = 0;
  for (const t of [1500, 3900, 4700]) { await p.waitForTimeout(t - last); last = t; await p.screenshot({ path: `${out}/o_${t}.png` }); }
  await p.waitForTimeout(4300); await p.screenshot({ path: `${out}/b01.png` });
  const n = await p.evaluate(() => window.__deck.n);
  for (let i = 1; i < n; i++) {
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(950); await p.screenshot({ path: `${out}/m${String(i + 1).padStart(2, '0')}.png` });
    await p.waitForTimeout(i === 7 ? 4600 : 3600);
    await p.screenshot({ path: `${out}/b${String(i + 1).padStart(2, '0')}.png` });
  }
  await b.close(); console.log('done', n);
})();
