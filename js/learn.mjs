// Pure helpers shared by the Learn screen and its tests. Everything derives from chart data + engine.decide.
import {UPCARDS,DEV_MAP} from '../data/charts.mjs';
import {chartFor,decide,indexMet} from './engine.mjs';
export const SECTIONS=['pairs','soft','hard','surrender'];
const IDX=/^(-?\d+)([+-])$/;
export const isIndex=c=>IDX.test(c);
const upRank=u=>u==='10'?'10':u;
/** Representative 2-card hand for a chart row. */
export function handFor(sec,row){
  if(sec==='pairs'){const r=row.split(',')[0];const k=r==='T'?'10':r;return[k,k==='10'?'K':k];}
  if(sec==='soft')return['A',row.split(',')[1]];
  const t=+row;const m={17:['10','7'],16:['10','6'],15:['10','5'],14:['10','4'],13:['10','3'],12:['10','2'],11:['7','4'],10:['6','4'],9:['5','4'],8:['5','3']};return m[t];}
/** Rows of a section for the given rules (H17 has a 17 surrender row; S17 printed one too). */
export const rowsOf=(rules,sec)=>Object.keys(chartFor(rules).ch[sec]).sort((a,b)=>sec==='hard'||sec==='surrender'?(+b)-(+a):0);
/** Is surrender available against this upcard under the rules? */
export const surAllowed=(rules,up)=>!!rules.surrender&&(up!=='A'||!!rules.surrenderA);
/** Info for one cell: printed code, base code (index resolved to base), deviation mapping. */
export function cellInfo(rules,sec,row,up){const {name,ch}=chartFor(rules);const printed=ch[sec][row][UPCARDS.indexOf(up)];
  if(!isIndex(printed))return{printed,base:printed,dev:null};const [base,dev]=DEV_MAP[name][`${sec} ${row} ${up}`];return{printed,base,dev,index:printed};}
/** Decision context the Learn screen uses for a cell (first two cards, everything allowed that the rules allow). */
export function ctxFor(rules,sec,row,up,{counting=false,rc=0,tc=0}={}){const cards=handFor(sec,row).map((r,i)=>({r,s:i}));
  return{cards,up:upRank(up),rules,rc,tc,counting,canSplit:sec==='pairs',canDouble:true,canSurrender:sec==='surrender'&&surAllowed(rules,up)};}
export const answer=(rules,sec,row,up,o)=>decide(ctxFor(rules,sec,row,up,o));
/** All deviation cells usable under the rules. */
export function devCells(rules){const {name}=chartFor(rules);return Object.entries(DEV_MAP[name]).map(([k,[base,dev]])=>{const [sec,row,up]=k.split(' ');return{sec,row,up,base,dev,index:cellInfo(rules,sec,row,up).printed,key:k};})
  .filter(c=>c.sec!=='surrender'||surAllowed(rules,c.up));}
/** A (rc,tc) pair (decksLeft d) that does / does not satisfy an index. */
export function countFor(index,want,rand=Math.random,d=3){const m=IDX.exec(index);const n=+m[1],plus=m[2]==='+';
  if(n===0){const pos=plus?want:!want;const rc=pos?1+Math.floor(rand()*8):-(1+Math.floor(rand()*8));return{rc:rc===0?1:rc,tc:Math.trunc(rc/d)};}
  let tc;for(let i=0;i<50;i++){tc=n+Math.floor(rand()*7)-3;if(indexMet(index,99*Math.sign(tc||1),tc)===want)break;}
  return{rc:tc*d+(tc>=0?Math.floor(rand()*d):-Math.floor(rand()*d)),tc};}
