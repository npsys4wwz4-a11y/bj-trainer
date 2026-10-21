import {Game,DEFAULTS} from './game.mjs';
import {handTotal,trueCount,hiLo,makeShoe,RANKS} from './engine.mjs';
const $=s=>document.querySelector(s);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
let S=Object.assign({},DEFAULTS,LS.get('bj.settings',{}));
const saveS=()=>LS.set('bj.settings',S);
const ST0={n:0,ok:0,bn:0,bok:0,dn:0,dok:0,in:0,iok:0,qn:0,qok:0,mist:{}};
let ST=Object.assign({},ST0,LS.get('bj.stats',{}));
const saveST=()=>LS.set('bj.stats',ST);
const A_HE={H:'קלף',S:'עמוד',D:'הכפלה',P:'פיצול',R:'כניעה'};
// ---------- icons (designed SVG, stroke icons) ----------
const I={
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
 eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 H:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M12 9v6M9 12h6"/></svg>',
 S:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L4 14.5a1.6 1.6 0 0 1 2.6-1.9L7 13"/></svg>',
 D:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="16" rx="7" ry="3"/><ellipse cx="12" cy="10" rx="7" ry="3"/><path d="M5 10v6M19 10v6"/></svg>',
 P:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="8" height="12" rx="1.5"/><rect x="13.5" y="6" width="8" height="12" rx="1.5"/><path d="M12 3v18" stroke-dasharray="2 2"/></svg>',
 R:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
 ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
 bad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
 deal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="14" rx="1.5"/><path d="M8 4.5l1-1.3a1.5 1.5 0 0 1 2-.3l8.4 6.3a1.5 1.5 0 0 1 .3 2L15 17.5"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>',
};
const SUIT=['M50 6C32 30 6 44 6 64a19 19 0 0 0 36 9L35 94h30l-7-21a19 19 0 0 0 36-9C94 44 68 30 50 6z',
 'M50 93C22 72 5 55 5 33a22 22 0 0 1 45-9 22 22 0 0 1 45 9c0 22-17 39-45 60z',
 'M50 4L88 50 50 96 12 50z',
 'M50 6a20 20 0 0 1 17 30 20 20 0 1 1-8 30l6 28H35l6-28a20 20 0 1 1-8-30A20 20 0 0 1 50 6z'];
const suit=s=>`<svg viewBox="0 0 100 100"><path fill="currentColor" d="${SUIT[s]}"/></svg>`;
function cardHTML(c,sm){if(!c.up)return`<div class="card back${sm?' sm':''}"></div>`;const red=c.s===1||c.s===2;const face='JQK'.includes(c.r);
 return`<div class="card${red?' red':''}${sm?' sm':''}" data-r="${c.r}"><div class="cr">${c.r}${suit(c.s)}</div>${face?`<div class="face">${c.r}</div>`:`<div class="cc">${suit(c.s)}</div>`}</div>`;}
const cardsHTML=(cs,sm)=>`<div class="cards${sm?' sm':''}">${cs.map(c=>cardHTML(c,sm)).join('')}</div>`;
const sgn=n=>(n>0?'+':'')+n;
const totTxt=cs=>{const t=handTotal(cs.filter(c=>c.up!==false));return(t.soft&&t.total<21?`${t.total-10}/`:'')+t.total;};
// ---------- background ----------
(function(){const bg=$('#bg'),cols=['#ffd27a','#ff9f5a','#fff0c2','#e8c873','#ff6b5a','#9fe0c0'];
 for(let i=0;i<22;i++){const b=document.createElement('div');b.className='bokeh';const s=20+Math.random()*90;
 Object.assign(b.style,{width:s+'px',height:s+'px',left:Math.random()*100+'%',top:Math.random()*55+'%',background:cols[i%cols.length],animationDelay:(-Math.random()*14)+'s',opacity:.2+Math.random()*.4});bg.appendChild(b);}
 const chip=(c,e)=>`<svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="40" fill="${c}"/>${[...Array(8)].map((_,k)=>`<rect x="38" y="2" width="8" height="13" rx="1.5" fill="${e}" transform="rotate(${k*45} 42 42)"/>`).join('')}<circle cx="42" cy="42" r="27" fill="none" stroke="${e}" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="42" cy="42" r="22" fill="${c}" stroke="rgba(0,0,0,.25)"/><text x="42" y="48" text-anchor="middle" font-family="Frank Ruhl Libre,serif" font-weight="700" font-size="16" fill="${e}">BJ</text></svg>`;
 const ch=$('#chips');[['#8f1d24','#f3e6c8',10,30,-12],['#14213d','#e8c873',78,8,6],['#0d0d0d','#e8c873',146,34,18]].forEach(([c,e,x,y,r])=>{const d=document.createElement('div');d.innerHTML=chip(c,e);const s=d.firstChild;s.style.left=x+'px';s.style.top=y+'px';s.style.transform=`rotate(${r}deg)`;ch.appendChild(s)});})();
// ---------- router ----------
const bar=(t,extra='')=>`<div class="bar"><button class="iconbtn" data-go="" aria-label="חזרה">${I.back}</button><h2>${t}</h2>${extra}</div>`;
function route(){const h=location.hash.slice(1)||'home';document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
 if(h.startsWith('practice')){S.mode=h==='practice-basic'?'basic':'count';saveS();startPractice();$('#practice').classList.add('on');}
 else if(h==='settings'){renderSettings();$('#settings').classList.add('on');}
 else if(h==='drills'){renderDrills();$('#drills').classList.add('on');}
 else if(h==='stats'){renderStats();$('#stats').classList.add('on');}
 else $('#home').classList.add('on');window.scrollTo(0,0);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){location.hash=b.dataset.go;}});
addEventListener('hashchange',route);
// ---------- practice ----------
let G=null,FB=null,peekCount=false;
function startPractice(){G=new Game(S);FB=null;deal();}
function deal(){if(G.quizDue()&&G.phase==='done'&&!G._quizzed){G._quizzed=true;return quiz();}G._quizzed=false;G.start();FB=G.justShuffled&&G.counting&&G.rounds>1?{shuffle:true}:null;render();}
function rec(fb){ST.n++;if(fb.ok)ST.ok++;
 if(fb.kind==='insurance'){ST.in++;if(fb.ok)ST.iok++;}
 else if(fb.devCell&&G.counting){ST.dn++;if(fb.ok)ST.dok++;}else{ST.bn++;if(fb.ok)ST.bok++;}
 if(!fb.ok){const k=fb.kind==='insurance'?'ביטוח':`${fb.total.soft&&fb.total.total<21?'רך ':''}${fb.hand.join(',')} מול ${fb.up}`;ST.mist[k]=(ST.mist[k]||0)+1;}saveST();}
function fbHTML(){if(!FB)return`<div class="fb"><span class="muted">${G.phase==='player'?'מה הפעולה הנכונה?':G.phase==='insurance'?'הדילר מראה אס. לקחת ביטוח?':'לחץ "חלוקה" ליד הבאה.'}</span></div>`;
 if(FB.shuffle)return`<div class="fb"><span class="muted">הנעל עורבב. ספירה רצה מתחילה מ-0.</span></div>`;
 const f=FB,ins=f.kind==='insurance';const want=ins?(f.correct?'לקחת ביטוח':'לא לקחת ביטוח'):A_HE[f.correct];
 let why;const cnt=`RC ${sgn(f.rc)} · TC ${sgn(f.tc)}`;
 if(ins)why=G.counting?`<span class="tag">סטייה</span>ביטוח רק ב-TC 3+ (${cnt})`:`<span class="tag">בסיסי</span>בלי ספירה: אף פעם לא לוקחים ביטוח`;
 else if(f.src==='deviation')why=`<span class="tag">סטייה לפי ספירה</span>${f.cellKey}, אינדקס <b dir="ltr">${f.index}</b> (${cnt})`;
 else if(f.index&&G.counting)why=`<span class="tag">בסיסי</span>תא סטייה ${f.cellKey} (אינדקס <b dir="ltr">${f.index}</b>) לא הופעל ב-${cnt}`;
 else if(f.alsoIndex&&G.counting)why=`<span class="tag">בסיסי</span>נבדק גם ${f.alsoIndex.cellKey} (אינדקס <b dir="ltr">${f.alsoIndex.index}</b>) ולא הופעל`;
 else why=`<span class="tag">בסיסי</span>לפי טבלת ${S.h17?'H17':'S17'}`;
 return`<div class="fb ${f.ok?'ok':'bad'}"><div class="hd">${f.ok?I.ok:I.bad}${f.ok?'נכון':'לא נכון'} · הנכון: ${want}</div><div class="muted">היד: ${ins?'ביטוח מול A':`${f.hand.join(', ')} מול ${f.up}`}</div><div>${why}</div></div>`;}
function resTag(w){return w>0?`<span class="res w">+${w}</span>`:w<0?`<span class="res l">${w}</span>`:`<span class="res p">push</span>`;}
function render(){const g=G,done=g.phase==='done';const me=g.seats[g.playerSeat];
 const countPill=`<button class="pill" id="cnt">${S.showCount||peekCount||!g.counting?`RC <b>${sgn(g.rc)}</b> · TC <b>${sgn(g.tc)}</b>`:`${I.eye.replace('<svg','<svg width="14" height="14" style="vertical-align:-2px"')} ספירה מוסתרת`}</button>`;
 const bots=g.seats.map((s,i)=>s.bot?`<div class="bot">${s.hands.map(h=>cardsHTML(h.cards,true)).join('')}<div class="seatname">שחקן ${i+1}</div></div>`:'').join('');
 const mine=me.hands.map((h,i)=>`<div class="h${g.phase==='player'&&g.seats[g.seatIdx]===me&&g.hi===i?' act':''}">${cardsHTML(h.cards)}<div class="lbl">${me.hands.length>1?'יד '+(i+1):'אתה'}<span class="tot">${totTxt(h.cards)}</span>${h.doubled?' · כפול':''}${h.surrendered?' · כניעה':''}</div>${done?resTag(h.win):''}</div>`).join('');
 let acts;if(g.phase==='player'){const al=g.allowed();acts=`<div class="acts">${['H','S','D','P','R'].map(a=>`<button class="ab" data-a="${a}" ${al[a]?'':'disabled'}>${I[a]}${A_HE[a]}</button>`).join('')}</div>`;}
 else if(g.phase==='insurance')acts=`<div class="acts two"><button class="ab" data-ins="1">${I.ok}לקחת ביטוח</button><button class="ab" data-ins="0">${I.bad}לא לקחת</button></div>`;
 else acts=`<div class="acts one"><button class="ab gold" id="dealBtn">${I.deal}חלוקה${done&&me.net!==undefined?` · יד אחרונה ${sgn(me.net)}`:''}</button></div>`;
 $('#practice').innerHTML=bar(g.counting?'תרגול עם ספירה':'אסטרטגיה בסיסית',`${countPill}<button class="iconbtn" data-go="settings" aria-label="הגדרות">${I.gear}</button>`)+
 `<div class="felt"><div class="zone">${cardsHTML(g.dealer)}<div class="lbl">דילר<span class="tot">${totTxt(g.dealer)}</span></div></div>
  <div class="arc">${S.h17?'DEALER HITS SOFT 17':'DEALER STANDS ON ALL 17'} · BLACKJACK PAYS ${S.payout} · INSURANCE PAYS 2:1</div>
  <div class="bots">${bots}</div><div class="mine">${mine}</div></div>${fbHTML()}
  <div class="note">${g.counting?`נעל ${S.decks} חפיסות · נותרו ${g.decksLeft.toFixed(1)} · חיתוך ${S.pen}%`:'ערבוב רציף (CSM)'} · מאזן ${sgn(+g.bank.toFixed(1))} יח'</div>${acts}`;}
$('#practice').addEventListener('click',e=>{const a=e.target.closest('[data-a]'),i=e.target.closest('[data-ins]');
 if(a&&!a.disabled){const fb=G.act(a.dataset.a);if(fb){FB=fb;rec(fb);}render();}
 else if(i){FB=G.insure(i.dataset.ins==='1');rec(FB);render();}
 else if(e.target.closest('#dealBtn'))deal();
 else if(e.target.closest('#cnt')&&G.counting&&!S.showCount){peekCount=!peekCount;render();}});
function quiz(){const tc=G.tc,rc=G.rc;sheet(`<h3>בוחן ספירה</h3><div class="note">אחרי ${G.rounds} ידיים. נותרו ${G.decksLeft.toFixed(2)} חפיסות. שיטת TC: ${TCM[S.tcMethod]}.</div>
 <div class="field"><span>ספירה רצה (RC)</span>${numCtl('qrc',0)}</div><div class="field"><span>ספירה אמיתית (TC)</span>${numCtl('qtc',0)}</div>
 <button class="ab gold" id="qgo" style="width:100%;margin-top:10px">בדיקה</button><div id="qres"></div>`);
 $('#qgo').onclick=()=>{if($('#qgo').dataset.d){closeSheet();return deal();}const a=+$('#qrc').value,b=+$('#qtc').value;const ok=a===rc&&b===tc;ST.qn++;if(ok)ST.qok++;saveST();
  $('#qres').innerHTML=`<div class="fb ${ok?'ok':'bad'}" style="margin:12px 0 0"><div class="hd">${ok?I.ok:I.bad}${ok?'מדויק':'לא מדויק'}</div>RC ${sgn(rc)} · TC ${sgn(tc)} <span class="muted">(${sgn(rc)} / ${G.decksLeft.toFixed(2)} = ${(rc/G.decksLeft).toFixed(2)})</span></div>`;$('#qgo').textContent='המשך';$('#qgo').dataset.d=1;};}
const numCtl=(id,v)=>`<div class="num"><button data-step="-1" data-for="${id}">−</button><output id="${id}" value="${v}">${v}</output><button data-step="1" data-for="${id}">+</button></div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(!b)return;const o=document.getElementById(b.dataset.for);o.value=+o.value+ +b.dataset.step;o.textContent=sgn(+o.value);});
function sheet(h){$('#sheetIn').innerHTML=h;$('#sheet').classList.add('on');}function closeSheet(){$('#sheet').classList.remove('on');}
// ---------- settings ----------
const TCM={trunc:'קיצוץ לכיוון 0',floor:'עיגול כלפי מטה',round:'עיגול לקרוב'};
function renderSettings(){const seg=(k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-k="${k}" data-v="${v}" class="${String(S[k])===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
 const sw=k=>`<button class="sw ${S[k]?'on':''}" data-sw="${k}" aria-label="${k}"></button>`;
 const r=(k,sub,ctl)=>`<div class="row"><div class="k">${k}${sub?`<small>${sub}</small>`:''}</div>${ctl}</div>`;
 $('#settings').innerHTML=bar('הגדרות')+`<div class="panel"><h4>שולחן</h4>
 ${r('חפיסות','',seg('decks',[[1,1],[2,2],[4,4],[6,6],[8,8]]))}
 ${r('שחקנים נוספים','משחקים אסטרטגיה בסיסית',seg('bots',[0,1,2,3,4,5,6].map(n=>[n,n])))}
 ${r('חדירת נעל','מתי מערבבים (מצב ספירה)',seg('pen',[[50,'50%'],[65,'65%'],[75,'75%'],[85,'85%']]))}</div>
 <div class="panel"><h4>חוקי הקזינו</h4>
 ${r('דילר על 17 רך','בוחר את טבלת BJA המתאימה',seg('h17',[[false,'S17'],[true,'H17']]))}
 ${r('הכפלה אחרי פיצול (DAS)','קובע תאי Y/N',sw('das'))}
 ${r('פיצול חוזר','עד 4 ידיים',sw('resplit'))}
 ${r('פיצול חוזר של אסים','',sw('resplitAces'))}
 ${r('קלף נוסף לאסים מפוצלים','',sw('hitSplitAces'))}
 ${r('כניעה מאוחרת','',sw('surrender'))}
 ${r('תשלום בלאק ג\'ק','',seg('payout',[['3:2','3:2'],['6:5','6:5']]))}</div>
 <div class="panel"><h4>ספירה</h4>
 ${r('הצג ספירה תמיד','מוסתר כברירת מחדל; הקשה על הספירה מציצה',sw('showCount'))}
 ${r('בוחן ספירה כל','ידיים (כשהספירה מוסתרת)',seg('quizEvery',[[0,'כבוי'],[3,3],[5,5],[10,10]]))}
 ${r('המרה ל-TC','RC חלקי חפיסות שנותרו',seg('tcMethod',[['trunc','קיצוץ'],['floor','מטה'],['round','קרוב']]))}</div>
 <p class="note">TC = ספירה רצה ÷ (קלפים שנותרו בנעל ÷ 52). ברירת מחדל: קיצוץ לכיוון אפס (למשל 2.7 → 2, ‎-2.7 → ‎-2). אינדקסים לפי טבלאות Blackjack Apprenticeship: "n+" = TC ≥ n, "n-" = TC ≤ n, "0+"/"0-" = ספירה רצה חיובית/שלילית (לפי מקרא הטבלה). סדר החלטות לפי BJA: כניעה, פיצול, הכפלה, קלף/עמידה.</p>
 <div class="panel"><div class="row"><div class="k">איפוס סטטיסטיקה</div><button class="pill" id="rst">איפוס</button></div></div>`;}
$('#settings').addEventListener('click',e=>{const b=e.target.closest('[data-k]'),w=e.target.closest('[data-sw]');
 if(b){let v=b.dataset.v;v=v==='true'?true:v==='false'?false:isNaN(+v)?v:+v;S[b.dataset.k]=v;}else if(w)S[w.dataset.sw]=!S[w.dataset.sw];
 else if(e.target.closest('#rst')){if(confirm('לאפס את כל הסטטיסטיקה?')){ST=JSON.parse(JSON.stringify(ST0));saveST();}return;}else return;saveS();renderSettings();});
// ---------- drills ----------
let DR=null;
function renderDrills(){clearInterval(DR?.t);DR=null;$('#drills').innerHTML=bar('תרגילים')+`<div class="panel"><h4>ספירת חפיסה נגד השעון</h4><p class="note" style="margin:0">חפיסה אחת, 1-3 קלפים מוסתרים. ספור את השאר ומצא את הספירה הסופית.</p>
 <div class="row"><div class="k">מהירות</div><div class="seg">${[[1500,'איטי'],[800,'בינוני'],[400,'מהיר'],[0,'ידני']].map(([v,l])=>`<button data-spd="${v}" class="${v===800?'on':''}">${l}</button>`).join('')}</div></div>
 <div class="row"><button class="ab gold" id="dk" style="width:100%">${I.deal}התחל</button></div></div>
 <div class="panel"><h4>המרה לספירה אמיתית</h4><p class="note" style="margin:0">שיטה: ${TCM[S.tcMethod]} (משנים בהגדרות).</p><div class="row"><button class="ab gold" id="tcd" style="width:100%">התחל</button></div></div>`;}
let SPD=800;
$('#drills').addEventListener('click',e=>{const s=e.target.closest('[data-spd]');if(s){SPD=+s.dataset.spd;document.querySelectorAll('[data-spd]').forEach(b=>b.classList.toggle('on',b===s));}
 if(e.target.closest('#dk'))deckDrill();if(e.target.closest('#tcd'))tcDrill();if(e.target.closest('#dnext'))step();if(e.target.closest('#dans'))deckAns();if(e.target.closest('#tcans'))tcAns();if(e.target.closest('#tcd2'))tcDrill();});
function deckDrill(){const sh=makeShoe(1);const hid=sh.splice(0,1+Math.floor(Math.random()*3));DR={sh,i:0,ans:-hid.reduce((a,c)=>a+hiLo(c.r),0),t0:Date.now(),hidN:hid.length};
 $('#drills').innerHTML=bar('ספירת חפיסה')+`<div class="drillstage"><div class="lbl" id="dprog"></div><div id="dcard"></div><div class="big" id="dclock">0.0</div>${SPD?'':`<button class="ab gold" id="dnext" style="width:100%">הקלף הבא</button>`}</div>`;
 DR.t=setInterval(()=>{const c=$('#dclock');if(c)c.textContent=((Date.now()-DR.t0)/1000).toFixed(1);if(SPD&&Date.now()-DR.last>=SPD)step();},50);DR.last=0;step();}
function step(){if(!DR)return;DR.last=Date.now();if(DR.i>=DR.sh.length){clearInterval(DR.t);DR.time=(Date.now()-DR.t0)/1000;
  $('.drillstage').innerHTML=`<div class="lbl">זמן ${DR.time.toFixed(1)} שנ' · ${DR.hidN} קלפים הוסתרו</div><div class="field" style="width:100%"><span>ספירה סופית</span>${numCtl('dv',0)}</div><button class="ab gold" id="dans" style="width:100%">בדיקה</button><div id="dres" style="width:100%"></div>`;return;}
 const c={...DR.sh[DR.i++],up:true};$('#dcard').innerHTML=cardHTML(c);$('#dprog').textContent=`${DR.i} / ${DR.sh.length}`;}
function deckAns(){const v=+$('#dv').value,ok=v===DR.ans;ST.qn++;if(ok)ST.qok++;saveST();const best=LS.get('bj.best',null);if(ok&&(!best||DR.time<best))LS.set('bj.best',DR.time);
 $('#dres').innerHTML=`<div class="fb ${ok?'ok':'bad'}" style="margin:0"><div class="hd">${ok?I.ok:I.bad}${ok?'נכון':'לא נכון'} · הספירה: ${sgn(DR.ans)}</div><span class="muted">שיא: ${(LS.get('bj.best',null)??'-')}${LS.get('bj.best',null)?' שנ\'':''}</span></div><button class="ab" id="dk" style="width:100%;margin-top:10px">שוב</button>`;}
let TQ=null;
function tcDrill(){const dl=[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6][Math.floor(Math.random()*12)],rc=Math.round((Math.random()*2-1)*16);TQ={rc,dl,ans:trueCount(rc,dl*52,S.tcMethod)};
 $('#drills').innerHTML=bar('המרה ל-TC')+`<div class="drillstage"><div class="lbl">ספירה רצה</div><div class="big">${sgn(rc)}</div><div class="lbl">חפיסות שנותרו</div><div class="big">${dl}</div>
 <div class="field" style="width:100%"><span>TC</span>${numCtl('tv',0)}</div><button class="ab gold" id="tcans" style="width:100%">בדיקה</button><div id="tres" style="width:100%"></div></div>`;}
function tcAns(){const v=+$('#tv').value,ok=v===TQ.ans;ST.qn++;if(ok)ST.qok++;saveST();
 $('#tres').innerHTML=`<div class="fb ${ok?'ok':'bad'}" style="margin:0"><div class="hd">${ok?I.ok:I.bad}TC = ${sgn(TQ.ans)}</div><span class="muted" dir="ltr">${sgn(TQ.rc)} / ${TQ.dl} = ${(TQ.rc/TQ.dl).toFixed(2)} → ${TCM[S.tcMethod]}</span></div><button class="ab" id="tcd2" style="width:100%;margin-top:10px">הבא</button>`;}
// ---------- stats ----------
function renderStats(){const p=(a,b)=>b?Math.round(100*a/b)+'%':'—';const m=Object.entries(ST.mist).sort((a,b)=>b[1]-a[1]).slice(0,10);
 $('#stats').innerHTML=bar('סטטיסטיקה')+`<div class="stat"><div class="box"><div class="v">${p(ST.ok,ST.n)}</div><div class="l">דיוק כללי (${ST.n})</div></div>
 <div class="box"><div class="v">${p(ST.bok,ST.bn)}</div><div class="l">אסטרטגיה בסיסית (${ST.bn})</div></div>
 <div class="box"><div class="v">${p(ST.dok,ST.dn)}</div><div class="l">תאי סטייה (${ST.dn})</div></div>
 <div class="box"><div class="v">${p(ST.iok,ST.in)}</div><div class="l">ביטוח (${ST.in})</div></div>
 <div class="box" style="grid-column:span 2"><div class="v">${p(ST.qok,ST.qn)}</div><div class="l">בחני ספירה ותרגילים (${ST.qn})</div></div></div>
 <div class="panel"><h4>טעויות נפוצות</h4>${m.length?m.map(([k,v])=>`<div class="mist"><span>${k}</span><b>${v}</b></div>`).join(''):'<p class="note">אין עדיין טעויות.</p>'}</div>`;}
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet'){closeSheet();deal();}});
route();
