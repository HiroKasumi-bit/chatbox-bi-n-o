const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{const out=process.argv[2]||'qa';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});
await p.goto('file://'+__dirname+'/deck.html');await p.addStyleTag({content:'img{max-width:100%}'});await p.waitForTimeout(1500);
await p.mouse.click(960,540);
const n=await p.evaluate(()=>window.__deck.n);
for(let i=0;i<n;i++){await p.waitForTimeout(3600);await p.screenshot({path:`${out}/b${String(i+1).padStart(2,'0')}.png`});if(i<n-1)await p.keyboard.press('ArrowRight');}
await b.close();console.log('done',n);})();
