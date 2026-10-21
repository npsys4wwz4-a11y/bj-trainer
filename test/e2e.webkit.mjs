import {webkit,devices} from 'playwright';
const out='/workspace/bj/screens/';const b=await webkit.launch();const ctx=await b.newContext({...devices['iPhone 14']});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const URL=process.argv[2]||'http://localhost:8765/';
await p.goto(URL);await p.waitForTimeout(1200);await p.screenshot({path:out+'home.png'});
await p.click('[data-go="practice-count"]');await p.waitForSelector('.felt');
let fbShot=false,plays=0;
for(let r=0;r<40;r++){
  for(let g=0;g<20;g++){
    if(await p.$('[data-ins]')){await p.click('[data-ins="0"]');continue;}
    const btn=await p.$('.ab[data-a]:not([disabled])');if(!btn)break;
    await btn.click();plays++;
    if(!fbShot&&await p.$('.fb.bad, .fb.ok')){await p.screenshot({path:out+'feedback.png'});fbShot=true;}
  }
  if(await p.$('#sheet.on')){await p.screenshot({path:out+'quiz.png'});await p.click('#qgo');await p.click('#qgo');}
  if(r===2)await p.screenshot({path:out+'table.png'});
  const d=await p.$('#dealBtn');if(d)await d.click();
}
await p.click('#cnt');await p.screenshot({path:out+'table-count.png'});
await p.goto(URL+'#settings');await p.waitForTimeout(300);await p.screenshot({path:out+'settings.png',fullPage:true});
await p.click('[data-k="h17"][data-v="true"]');
await p.goto(URL+'#practice-basic');await p.waitForSelector('.felt');await p.screenshot({path:out+'basic.png'});
await p.goto(URL+'#drills');await p.click('[data-spd="0"]');await p.click('#dk');for(let i=0;i<60;i++){const n=await p.$('#dnext');if(!n)break;await n.click();}
await p.click('#dans');await p.screenshot({path:out+'drill-deck.png'});
await p.goto(URL+'#drills');await p.click('#tcd');await p.click('#tcans');await p.screenshot({path:out+'drill-tc.png'});
await p.goto(URL+'#stats');await p.waitForTimeout(200);await p.screenshot({path:out+'stats.png',fullPage:true});
const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('bj.stats')));
console.log(JSON.stringify({plays,decisions:st.n,quiz:st.qn,errs}));await b.close();if(errs.length||plays<10)process.exit(1);
