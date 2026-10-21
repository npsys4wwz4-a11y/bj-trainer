import {S17_DEV,H17_DEV,DEV_MAP,UPCARDS} from '../data/charts.mjs';
export const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const val=r=>r==='A'?11:(r==='J'||r==='Q'||r==='K'||r==='10')?10:+r;
export const hiLo=r=>{const v=val(r);return v>=2&&v<=6?1:(v>=10?-1:0);};
export const upKey=r=>r==='A'?'A':String(val(r));
export function handTotal(cards){let t=0,a=0;for(const c of cards){t+=val(c.r);if(c.r==='A')a++;}while(t>21&&a){t-=10;a--;}return{total:t,soft:a>0};}
export const isBJ=cards=>cards.length===2&&handTotal(cards).total===21;
/** True count = RC / decks remaining (cards left / 52). method: 'trunc' (toward zero, default) | 'floor' | 'round' */
export function trueCount(rc,cardsLeft,method='trunc'){const x=rc/Math.max(cardsLeft/52,1/52);const f=method==='floor'?Math.floor:method==='round'?Math.round:Math.trunc;return f(x)+0;}
const IDX=/^(-?\d+)([+-])$/;
/** Is deviation condition met? per BJA legend: n+ TC>=n, n- TC<=n, 0+ RC>0, 0- RC<0 */
export function indexMet(cell,rc,tc){const m=IDX.exec(cell);if(!m)return false;const n=+m[1];
  if(n===0)return m[2]==='+'?rc>0:rc<0; return m[2]==='+'?tc>=n:tc<=n;}
export const chartFor=rules=>rules.h17?{name:'H17',ch:H17_DEV}:{name:'S17',ch:S17_DEV};
/** Resolve one chart cell to a code + provenance. counting=false => base play (deviations off). */
function cell(rules,sec,row,up,ctx){const {name,ch}=chartFor(rules);const ui=UPCARDS.indexOf(up);const t=ch[sec][row];if(!t)return null;const c=t[ui];
  if(!IDX.test(c))return{code:c,src:'basic'};
  const [base,dev]=DEV_MAP[name][`${sec} ${row} ${up}`];const met=ctx.counting&&indexMet(c,ctx.rc,ctx.tc);
  return{code:met?dev:base,src:met?'deviation':'basic',index:c,cellKey:`${sec} ${row} vs ${up}`,base,dev};}
const pairRow=r=>{const v=val(r);return v===11?'A,A':v===10?'T,T':`${v},${v}`;};
/**
 * Correct action: split (when chart says split) > surrender > double > hit/stand.
 * s = {cards, up (rank), rules, rc, tc, counting, canSplit, canDouble, canSurrender}
 * returns {action:'H'|'S'|'D'|'P'|'R', src, index?, cellKey?, note}
 */
export function decide(s){const up=upKey(s.up),ctx={counting:s.counting,rc:s.rc,tc:s.tc},R=s.rules;const {total,soft}=handTotal(s.cards);
  let info=null;const out=(action,c,extra)=>({action,src:c?c.src:'basic',index:c&&c.index,cellKey:c&&c.cellKey,...extra});
  if(total>=21)return out('S',null,{note:'21'});
  // 1 split (user rule: a chart split beats surrender, e.g. 8,8 always splits)
  if(s.canSplit&&s.cards.length===2&&val(s.cards[0].r)===val(s.cards[1].r)){const c=cell(R,'pairs',pairRow(s.cards[0].r),up,ctx);
    if(c.code==='Y'||(c.code==='Y/N'&&R.das))return out('P',c);if(c.index)info=info||c;}
  // 2 surrender (late; vs Ace only if the casino allows it)
  if(s.canSurrender&&!soft&&R.surrender&&(up!=='A'||R.surrenderA)&&s.cards.length===2){const c=cell(R,'surrender',String(total),up,ctx);if(c){if(c.code==='SUR')return out('R',c);if(c.index)info=info||c;}}
  // 3/4 totals
  let c;if(soft){if(total===12)return out('H',null,{note:'soft 12 (A,A not split): not in chart, hit'});c=total>=21?null:cell(R,'soft',`A,${total-11}`,up,ctx);}
  else{if(total>=17)c=cell(R,'hard','17',up,ctx);else if(total<=8)c=total===8?cell(R,'hard','8',up,ctx):null;else c=cell(R,'hard',String(total),up,ctx);}
  if(!c)return out(total<=7?'H':'S',null,{note:'outside chart rows'});
  const code=c.code;let a=code;if(code==='D')a=s.canDouble?'D':'H';else if(code==='Ds')a=s.canDouble?'D':'S';
  const r=out(a,c);if(!c.index&&info){r.alsoIndex=info;}return r;}
/** Insurance / even money: only in counting mode, take at TC >= 3 (both charts "3+"). */
export const takeInsurance=(counting,tc)=>counting&&tc>=3;
export function makeShoe(decks,rand=Math.random){const s=[];for(let d=0;d<decks;d++)for(let su=0;su<4;su++)for(const r of RANKS)s.push({r,s:su});for(let i=s.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[s[i],s[j]]=[s[j],s[i]];}return s;}
