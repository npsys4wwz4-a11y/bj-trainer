import {webkit,devices} from 'playwright';
const URL=process.argv[2],out=process.argv[3];const b=await webkit.launch();const res=[];const errs=[];
for(const [decks,ticks] of [[1,true],[2,true],[4,true],[6,true],[8,true],[6,false]]){
 const p=await (await b.newContext({...devices['iPhone 14']})).newPage();p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(URL);await p.evaluate(([d,t])=>localStorage.setItem('bj.settings',JSON.stringify({decks:d,trayTicks:t,quizEvery:4,bots:3,pen:85})),[decks,ticks]);
 await p.reload();await p.goto(URL+'#practice-count');await p.waitForSelector('.felt');let quizShot=false;
 for(let r=0;r<Math.min(14,decks*5);r++){for(let g=0;g<20;g++){if(await p.$('[data-ins]')){await p.click('[data-ins="0"]');continue;}const s=await p.$('.ab[data-a="S"]');if(!s)break;await s.click();}
  if(await p.$('#sheet.on')){if(!quizShot&&decks===6&&ticks){await p.screenshot({path:out+'quiz-decks.png'});quizShot=true;}await p.click('#qgo');await p.click('#qgo');}
  const d=await p.$('#dealBtn');if(d)await d.click();}
 const info=await p.$eval('.tray svg',s=>({h:+s.getAttribute('height'),cards:+s.dataset.tray}));res.push({decks,ticks,...info,expectH:decks*14+14});
 await p.screenshot({path:`${out}tray-${decks}d${ticks?'':'-hard'}.png`});await p.close();}
console.log(JSON.stringify({res,errs}));await b.close();
