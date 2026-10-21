import {webkit,devices} from 'playwright';
const URL=process.argv[2],out=process.argv[3];const b=await webkit.launch();const p=await (await b.newContext({...devices['iPhone 14']})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL);await p.click('[data-go="learn"]');await p.waitForSelector('.grid');
const counts={};
for(const t of ['pairs','soft','hard','surrender']){await p.click(`[data-lt="${t}"]`);counts[t]=await p.$$eval('.grid [data-cell]',x=>x.length);await p.screenshot({path:`${out}learn-${t}.png`,fullPage:true});}
await p.click('[data-lt="hard"]');await p.click('[data-cell="hard|16|10"]');await p.waitForTimeout(200);await p.screenshot({path:out+'learn-explain.png'});await p.click('#xclose');
await p.click('[data-lt="dev"]');counts.dev=await p.$$eval('.devi',x=>x.length);await p.screenshot({path:out+'learn-dev.png',fullPage:true});
await p.click('[data-lt="fc"]');let n=0;for(let i=0;i<15;i++){const a=await p.$('[data-fca]:not([disabled])');await a.click();n++;if(i===0)await p.screenshot({path:out+'learn-flash.png',fullPage:true});await p.click('#fcnext');}
await p.click('[data-fcm="dev"]');for(let i=0;i<10;i++){await (await p.$('[data-fca]:not([disabled])')).click();if(i===0)await p.screenshot({path:out+'learn-flash-dev.png',fullPage:true});await p.click('#fcnext');}
const srs=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('bj.srs')||'{}')).length);
await p.click('#learn [data-go="practice-count"]');await p.waitForSelector('.felt');
console.log(JSON.stringify({counts,n,srs,errs}));await b.close();if(errs.length)process.exit(1);
