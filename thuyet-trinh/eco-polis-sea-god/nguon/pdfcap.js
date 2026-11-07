const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{fs.mkdirSync('pdfshots',{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+__dirname+'/deck.html');await p.addStyleTag({content:'img{max-width:100%}'});await p.waitForTimeout(1500);await p.mouse.click(960,540);
const n=await p.evaluate(()=>window.__deck.BEATS.length);
const waits={22:7000,29:5000};
for(let i=0;i<n;i++){await p.waitForTimeout(waits[i+1]||4200);await p.screenshot({path:`pdfshots/p${String(i+1).padStart(2,'0')}.png`});
 if(i<n-1) await p.keyboard.press('ArrowRight');}
await b.close();console.log('done',n);})();
