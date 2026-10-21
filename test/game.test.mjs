import assert from 'node:assert';
import {Game} from '../js/game.mjs';
import {hiLo,handTotal,decide} from '../js/engine.mjs';
let seed=1;const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
for (const rules of [{h17:false},{h17:true},{das:false,surrender:false,payout:'6:5'},{resplit:false,hitSplitAces:true,resplitAces:true},{mode:'basic'},{decks:1,bots:6},{decks:8,bots:0},{surrenderA:true},{surrenderA:true,h17:true}]){
  const g=new Game({...rules},rnd);
  for(let r=0;r<400;r++){g.start();let guard=0;
    while(g.phase!=='done'&&guard++<50){
      if(g.phase==='insurance'){g.insure(false);continue;}
      const exp=decide(g.ctx()).action; const fb=g.act(exp); assert.ok(fb&&fb.ok,'engine-chosen action must be allowed and correct');}
    assert.strictEqual(g.phase,'done');
    // running count = sum of hi-lo of all visible cards since last shuffle (verify on fresh-shoe rounds)
    const d=g.dealer;const dt=handTotal(d);
    const anyLive=g.seats.some(s=>s.hands.some(h=>!h.surrendered&&handTotal(h.cards).total<=21&&!(h.cards.length===2&&handTotal(h.cards).total===21&&s.hands.length===1)));
    if(anyLive&&!(d.length===2&&dt.total===21)){assert.ok(dt.total>=17,'dealer stands >=17'); if(g.set.h17) assert.ok(!(dt.total===17&&dt.soft),'H17 hits soft 17');}
    assert.ok(d.every(c=>c.up),'hole revealed');
  }
  // RC check: fresh game, one round
  const g2=new Game({...rules},rnd);g2.start();while(g2.phase!=='done'){if(g2.phase==='insurance')g2.insure(false);else g2.act(decide(g2.ctx()).action);}
  const all=[...g2.dealer,...g2.seats.flatMap(s=>s.hands.flatMap(h=>h.cards))];assert.strictEqual(g2.rc,all.reduce((a,c)=>a+hiLo(c.r),0),'RC');
  assert.strictEqual(all.length+g2.shoe.length,g2.total,'card conservation');
}
// S17 dealer stands soft 17
const g=new Game({h17:false});g.dealer=[{r:'A',up:true},{r:'6',up:true}];g.seats=[{hands:[{cards:[{r:'10'},{r:'8'}],bet:1}]}];g.dealerPlay();assert.strictEqual(g.dealer.length,2);
const gh=new Game({h17:true});gh.dealer=[{r:'A',up:true},{r:'6',up:true}];gh.seats=[{hands:[{cards:[{r:'10'},{r:'8'}],bet:1}]}];gh.dealerPlay();assert.ok(gh.dealer.length>2);
// insurance feedback
const gi=new Game({});gi.start();gi.rc=30;assert.ok(gi.tc>=3);assert.strictEqual(gi.insure(true).ok,true);
const gb=new Game({mode:'basic'});gb.start();gb.rc=30;assert.strictEqual(gb.insure(true).ok,false);
const ga=new Game({});ga.start();ga.dealer[0]={r:'A',up:true,s:0};assert.strictEqual(ga.allowed().R,false,'no surrender vs A by default');
const gA=new Game({surrenderA:true});gA.start();gA.dealer[0]={r:'A',up:true,s:0};gA.seatIdx=gA.playerSeat;gA.hi=0;assert.strictEqual(gA.allowed().R,true);
console.log('game OK');
// discard tray count
{const g=new Game({decks:2});assert.strictEqual(g.trayCards(),0);g.start();const used=()=>g.total-g.shoe.length;while(g.phase!=='done'){if(g.phase==='insurance')g.insure(false);else g.act(decide(g.ctx()).action);}
 const after=used();assert.strictEqual(g.trayCards(),after);g.start();assert.strictEqual(g.trayCards(),g.justShuffled?0:after);console.log('tray OK');}
