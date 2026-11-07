const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/deck.html');
await p.addStyleTag({content:'img{max-width:100%}'}); // same reset the online page gets
await p.waitForTimeout(800);await p.mouse.click(960,540);
const beats=[9,11,13,15,21,23,26,28,30];
for(const n of beats){await p.evaluate(n=>window.__deck.go(n-1),n);await p.waitForTimeout(3500);
 const el=await p.$('#board');await el.screenshot({path:`ov${n}.jpg`,type:'jpeg',quality:75});}
await b.close();})();
