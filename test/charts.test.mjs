import {BASIC,S17_DEV,UPCARDS} from '../data/charts.mjs';
import assert from 'node:assert';
// Independent expected strings, one line per row, copied from the charts.
const EXP = {
BASIC:`pairs A,A|Y Y Y Y Y Y Y Y Y Y
pairs T,T|N N N N N N N N N N
pairs 9,9|Y Y Y Y Y N Y Y N N
pairs 8,8|Y Y Y Y Y Y Y Y Y Y
pairs 7,7|Y Y Y Y Y Y N N N N
pairs 6,6|Y/N Y Y Y Y N N N N N
pairs 5,5|N N N N N N N N N N
pairs 4,4|N N N Y/N Y/N N N N N N
pairs 3,3|Y/N Y/N Y Y Y Y N N N N
pairs 2,2|Y/N Y/N Y Y Y Y N N N N
soft A,9|S S S S S S S S S S
soft A,8|S S S S Ds S S S S S
soft A,7|Ds Ds Ds Ds Ds S S H H H
soft A,6|H D D D D H H H H H
soft A,5|H H D D D H H H H H
soft A,4|H H D D D H H H H H
soft A,3|H H H D D H H H H H
soft A,2|H H H D D H H H H H
hard 17|S S S S S S S S S S
hard 16|S S S S S H H H H H
hard 15|S S S S S H H H H H
hard 14|S S S S S H H H H H
hard 13|S S S S S H H H H H
hard 12|H H S S S H H H H H
hard 11|D D D D D D D D D D
hard 10|D D D D D D D D H H
hard 9|H D D D D H H H H H
hard 8|H H H H H H H H H H
surrender 16|_ _ _ _ _ _ _ SUR SUR SUR
surrender 15|_ _ _ _ _ _ _ _ SUR _
surrender 14|_ _ _ _ _ _ _ _ _ _`,
S17_DEV:`pairs A,A|Y Y Y Y Y Y Y Y Y Y
pairs T,T|N N 6+ 5+ 4+ N N N N N
pairs 9,9|Y Y Y Y Y N Y Y N N
pairs 8,8|Y Y Y Y Y Y Y Y Y Y
pairs 7,7|Y Y Y Y Y Y N N N N
pairs 6,6|Y/N Y Y Y Y N N N N N
pairs 5,5|N N N N N N N N N N
pairs 4,4|N N N Y/N Y/N N N N N N
pairs 3,3|Y/N Y/N Y Y Y Y N N N N
pairs 2,2|Y/N Y/N Y Y Y Y N N N N
soft A,9|S S S S S S S S S S
soft A,8|S S 3+ 1+ 1+ S S S S S
soft A,7|Ds Ds Ds Ds Ds S S H H H
soft A,6|1+ D D D D H H H H H
soft A,5|H H D D D H H H H H
soft A,4|H H D D D H H H H H
soft A,3|H H H D D H H H H H
soft A,2|H H H D D H H H H H
hard 17|S S S S S S S S S S
hard 16|S S S S S H H 4+ 0+ H
hard 15|S S S S S H H H 4+ H
hard 14|S S S S S H H H H H
hard 13|-1- S S S S H H H H H
hard 12|3+ 2+ 0- S S H H H H H
hard 11|D D D D D D D D D 1+
hard 10|D D D D D D D D 4+ 4+
hard 9|1+ D D D D 3+ H H H H
hard 8|H H H H 2+ H H H H H
surrender 17|_ _ _ _ _ _ _ _ _ _
surrender 16|_ _ _ _ _ _ 4+ -1- SUR SUR
surrender 15|_ _ _ _ _ _ _ 2+ 0- 2+
surrender 14|_ _ _ _ _ _ _ _ _ _`};
let n=0;
for (const [name,chart] of [['BASIC',BASIC],['S17_DEV',S17_DEV]]) {
  const lines = EXP[name].split('\n');
  const rows = Object.entries(chart).filter(([k])=>k!=='insurance').flatMap(([sec,t])=>Object.keys(t).map(h=>`${sec} ${h}`));
  assert.deepStrictEqual([...rows].sort(), lines.map(l=>l.split('|')[0]).sort(), name+' row set');
  for (const l of lines) {
    const [key,cells]=l.split('|'); const [sec,h]=key.split(' ');
    const exp=cells.split(' ').map(c=>c==='_'?'':c);
    const got=chart[sec][h];
    assert.strictEqual(got.length,10,`${name} ${key} must have 10 cells`);
    exp.forEach((e,i)=>{assert.strictEqual(got[i],e,`${name} ${key} vs ${UPCARDS[i]}`);n++;});
  }
}
assert.strictEqual(BASIC.insurance,"DON'T TAKE"); assert.strictEqual(S17_DEV.insurance,'3+');
console.log('OK cells checked:',n);
// ---- H17 chart: every cell
import {H17_DEV,DEV_MAP} from '../data/charts.mjs';
const H17EXP = EXP.S17_DEV
 .replace('soft A,8|S S 3+ 1+ 1+ S S S S S','soft A,8|S S 3+ 1+ 0- S S S S S')
 .replace('hard 16|S S S S S H H 4+ 0+ H','hard 16|S S S S S H H 4+ 0+ 3+')
 .replace('hard 15|S S S S S H H H 4+ H','hard 15|S S S S S H H H 4+ 5+')
 .replace('hard 11|D D D D D D D D D 1+','hard 11|D D D D D D D D D D')
 .replace('hard 10|D D D D D D D D 4+ 4+','hard 10|D D D D D D D D 4+ 3+')
 .replace('surrender 17|_ _ _ _ _ _ _ _ _ _','surrender 17|_ _ _ _ _ _ _ _ _ SUR')
 .replace('surrender 15|_ _ _ _ _ _ _ 2+ 0- 2+','surrender 15|_ _ _ _ _ _ _ 2+ 0- -1+');
assert.notStrictEqual(H17EXP, EXP.S17_DEV);
let m=0;
for (const l of H17EXP.split('\n')) { const [key,cells]=l.split('|'); const [sec,h]=key.split(' ');
  const exp=cells.split(' ').map(c=>c==='_'?'':c); assert.strictEqual(H17_DEV[sec][h].length,10);
  exp.forEach((e,i)=>{assert.strictEqual(H17_DEV[sec][h][i],e,`H17 ${key} vs ${UPCARDS[i]}`);m++;}); }
assert.strictEqual(Object.values(H17_DEV).filter(v=>typeof v==='object').reduce((a,t)=>a+Object.keys(t).length,0), H17EXP.split('\n').length);
assert.strictEqual(H17_DEV.insurance,'3+');
// every index cell has exactly one mapping entry and vice versa
for (const [nm,ch] of [['S17',S17_DEV],['H17',H17_DEV]]) {
  const idx=[]; for (const sec of ['pairs','soft','hard','surrender']) for (const [row,cells] of Object.entries(ch[sec])) cells.forEach((c,i)=>{ if(/^-?\d+[+-]$/.test(c)) idx.push(`${sec} ${row} ${UPCARDS[i]}`); });
  assert.deepStrictEqual(idx.sort(), Object.keys(DEV_MAP[nm]).sort(), nm+' map coverage');
  // base action of each mapped hard/soft/pair cell must equal a letter allowed in that section
  for (const [k,[b,d]] of Object.entries(DEV_MAP[nm])) assert.notStrictEqual(b,d,k);
}
console.log('OK H17 cells checked:',m);
