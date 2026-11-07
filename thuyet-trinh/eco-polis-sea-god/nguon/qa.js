const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{const out=process.argv[2]||'qa';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/deck.html');await p.waitForTimeout(1500);
await p.mouse.click(960,540);
const n=await p.evaluate(()=>window.__deck.BEATS.length);
const waits=JSON.parse(process.argv[3]||'{}');
for(let i=0;i<n;i++){await p.waitForTimeout(waits[i+1]||2600);await p.screenshot({path:`${out}/b${String(i+1).padStart(2,'0')}.jpg`,type:'jpeg',quality:70});
 if(i<n-1) await p.keyboard.press('ArrowRight');}
await b.close();})();
