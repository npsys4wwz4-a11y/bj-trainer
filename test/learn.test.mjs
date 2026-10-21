import assert from 'node:assert';
import {UPCARDS} from '../data/charts.mjs';
import {SECTIONS,rowsOf,cellInfo,answer,devCells,countFor,surAllowed,isIndex} from '../js/learn.mjs';
import {indexMet,trueCount} from '../js/engine.mjs';
const SPLIT=c=>c==='Y';const map={H:'H',S:'S',D:'D',Ds:'D'};let n=0;
for(const h17 of [false,true])for(const das of [false,true])for(const surrender of [false,true])for(const surrenderA of [false,true]){
 const R={h17,das,surrender,surrenderA};
 for(const sec of SECTIONS)for(const row of rowsOf(R,sec))for(const up of UPCARDS){const ci=cellInfo(R,sec,row,up);const a=answer(R,sec,row,up).action;n++;
  // Learn-view base code must agree with the engine (counting off)
  if(sec==='pairs'){const split=ci.base==='Y'||(ci.base==='Y/N'&&das);assert.strictEqual(a==='P',split,`${JSON.stringify(R)} ${row} v${up}`);}
  else if(sec==='surrender'){const sur=ci.base==='SUR'&&surAllowed(R,up);assert.strictEqual(a==='R',sur,`sur ${JSON.stringify(R)} ${row} v${up}`);}
  else assert.strictEqual(a,map[ci.base],`${sec} ${row} v${up} ${JSON.stringify(R)}`);}
 // every deviation cell: met => dev action, not met => base action (in its own section)
 for(const c of devCells(R)){for(const want of [true,false]){const {rc,tc}=countFor(c.index,want);assert.strictEqual(indexMet(c.index,rc,tc),want,c.key+' countFor');
   const a=answer(R,c.sec,c.row,c.up,{counting:true,rc,tc}).action;const code=want?c.dev:c.base;
   if(c.sec==='pairs')assert.strictEqual(a==='P',code==='Y',c.key);else if(c.sec==='surrender')assert.strictEqual(a==='R',code==='SUR',c.key);else assert.strictEqual(a,map[code],c.key+' '+want);n++;}}
 if(!surrender)assert.ok(devCells(R).every(c=>c.sec!=='surrender'));
 if(!surrenderA)assert.ok(devCells(R).every(c=>!(c.sec==='surrender'&&c.up==='A')));
}
// countFor rc/tc consistent with 3 decks left truncation
for(let i=0;i<200;i++){const {rc,tc}=countFor('4+',true);assert.strictEqual(trueCount(rc,156),tc);}
console.log('learn OK checks:',n);
