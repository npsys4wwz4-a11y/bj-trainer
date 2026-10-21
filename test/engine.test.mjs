import assert from 'node:assert';
import {decide,trueCount,indexMet,hiLo,handTotal,takeInsurance,makeShoe} from '../js/engine.mjs';
const C=(...rs)=>rs.map(r=>({r,s:0}));
const base={rules:{h17:false,das:true,surrender:true},rc:0,tc:0,counting:true,canSplit:true,canDouble:true,canSurrender:true};
const d=(cards,up,o={})=>decide({...base,...o,rules:{...base.rules,...(o.rules||{})},cards:C(...cards),up});
const H17={h17:true,das:true,surrender:true};
const t=(name,got,exp)=>{assert.strictEqual(got,exp,name);};
// counts
t('hilo', [..."23456"].map(hiLo).join(), '1,1,1,1,1'); t('hilo0',[7,8,9].map(String).map(hiLo).join(),'0,0,0'); t('hilo-',['10','J','Q','K','A'].map(hiLo).join(),'-1,-1,-1,-1,-1');
t('tc trunc +',trueCount(7,104),3); t('tc trunc -',trueCount(-7,104),-3); t('tc floor -',trueCount(-7,104,'floor'),-4); t('tc round',trueCount(7,104,'round'),4);
t('mkShoe',makeShoe(6).length,312);
// legend
t('0+ rc>0',indexMet('0+',1,0),true); t('0+ rc=0',indexMet('0+',0,0),false); t('0- rc<0',indexMet('0-',-1,0),true); t('-1- tc<=-1',indexMet('-1-',-5,-1),true); t('-1- tc=0',indexMet('-1-',-5,0),false); t('-1+',indexMet('-1+',-3,-1),true);
// S17 deviations
t('16v10 RC+ stand',d(['10','6'],'10',{rc:1,tc:0,canSurrender:false}).action,'S');
t('16v10 RC0 hit',d(['10','6'],'10',{rc:0,tc:0,canSurrender:false}).action,'H');
t('16v10 surrender always',d(['10','6'],'K',{rc:5,tc:5}).action,'R');
t('16v9 surrender above -1',d(['10','6'],'9',{rc:0,tc:0}).action,'R');
const x=d(['10','6'],'9',{rc:-3,tc:-1}); t('16v9 no sur at -1 then hit',x.action,'H');
t('16v9 TC4 no-sur path stand',d(['10','6'],'9',{rc:9,tc:4,canSurrender:false}).action,'S');
t('16v8 sur 4+',d(['10','6'],'8',{tc:4,rc:9}).action,'R'); t('16v8 tc3 hit',d(['10','6'],'8',{tc:3,rc:9}).action,'H');
t('15v10 sur RC>=0',d(['10','5'],'10',{rc:0}).action,'R'); t('15v10 RC<0 no sur -> hit',d(['10','5'],'10',{rc:-1,tc:0}).action,'H');
t('15v10 no sur tc4 stand',d(['10','5'],'10',{rc:8,tc:4,canSurrender:false}).action,'S');
t('15v9 sur 2+',d(['10','5'],'9',{tc:2,rc:4}).action,'R'); t('15vA S17 sur 2+',d(['10','5'],'A',{tc:2,rc:4}).action,'R'); t('15vA S17 tc1',d(['10','5'],'A',{tc:1,rc:4}).action,'H');
t('13v2 -1- hit',d(['10','3'],'2',{tc:-1,rc:-2}).action,'H'); t('13v2 0 stand',d(['10','3'],'2').action,'S');
t('12v2 3+',d(['10','2'],'2',{tc:3,rc:6}).action,'S'); t('12v3 2+',d(['10','2'],'3',{tc:2,rc:6}).action,'S'); t('12v4 RC<0 hit',d(['10','2'],'4',{rc:-1}).action,'H'); t('12v4 RC0 stand',d(['10','2'],'4').action,'S');
t('11vA S17 base hit',d(['6','5'],'A').action,'H'); t('11vA S17 1+',d(['6','5'],'A',{tc:1,rc:2}).action,'D');
t('10v10 4+',d(['6','4'],'10',{tc:4,rc:9}).action,'D'); t('10vA 4+',d(['6','4'],'A',{tc:4,rc:9}).action,'D'); t('10vA 3',d(['6','4'],'A',{tc:3,rc:9}).action,'H');
t('9v2 1+',d(['5','4'],'2',{tc:1,rc:2}).action,'D'); t('9v7 3+',d(['5','4'],'7',{tc:3,rc:9}).action,'D'); t('8v6 2+',d(['5','3'],'6',{tc:2,rc:9}).action,'D');
t('TTv6 4+',d(['10','K'],'6',{tc:4,rc:9}).action,'P'); t('TTv5 4',d(['10','K'],'5',{tc:4,rc:9}).action,'S'); t('TTv4 6+',d(['10','K'],'4',{tc:6,rc:9}).action,'P');
t('A8v6 S17 1+',d(['A','8'],'6',{tc:1,rc:2}).action,'D'); t('A8v6 S17 base',d(['A','8'],'6').action,'S'); t('A8v4 3+',d(['A','8'],'4',{tc:3,rc:9}).action,'D');
t('A6v2 1+',d(['A','6'],'2',{tc:1,rc:2}).action,'D'); t('A6v2 base',d(['A','6'],'2').action,'H');
t('dev src',d(['6','5'],'A',{tc:1,rc:2}).src,'deviation'); t('dev index',d(['6','5'],'A',{tc:1,rc:2}).index,'1+');
// counting off => base play even at high counts; insurance
t('basic mode 16v10 hit',d(['10','6'],'10',{counting:false,rc:20,tc:5,canSurrender:false}).action,'H');
t('ins tc3',takeInsurance(true,3),true); t('ins tc2',takeInsurance(true,2),false); t('ins basic',takeInsurance(false,9),false);
// pairs / DAS / order
t('8,8v7 split',d(['8','8'],'7').action,'P'); t('8,8vA surrender first',d(['8','8'],'A').action,'R'); t('8,8v10 surrender first (BJA order)',d(['8','8'],'10').action,'R');
t('8,8v10 no surrender split',d(['8','8'],'10',{canSurrender:false}).action,'P');
t('2,2v2 DAS split',d(['2','2'],'2').action,'P'); t('2,2v2 noDAS hit',d(['2','2'],'2',{rules:{das:false}}).action,'H');
t('4,4v5 noDAS -> hard 8 hit',d(['4','4'],'5',{rules:{das:false}}).action,'H'); t('5,5v9 -> double',d(['5','5'],'9').action,'D');
t('A,A cannot split -> soft12 hit',d(['A','A'],'6',{canSplit:false}).action,'H'); t('A,7v3 Ds no double -> stand',d(['A','7'],'3',{canDouble:false}).action,'S');
t('3-card 11 vs 5 no double -> hit',d(['2','4','5'],'5',{canDouble:false}).action,'H'); t('hard 18 stand',d(['10','8'],'A').action,'S'); t('hard 7 hit',d(['4','3'],'10').action,'H');
t('3-card soft 18 v 9 hit',d(['A','3','4'],'9').action,'H');
// H17
t('H17 11vA D',d(['6','5'],'A',{rules:H17}).action,'D'); t('H17 A8v6 base Ds',d(['A','8'],'6',{rules:H17}).action,'D'); t('H17 A8v6 RC<0 stand',d(['A','8'],'6',{rules:H17,rc:-1}).action,'S');
t('H17 17vA SUR',d(['10','7'],'A',{rules:H17}).action,'R'); t('S17 17vA stand',d(['10','7'],'A').action,'S');
t('H17 15vA sur -1+',d(['10','5'],'A',{rules:H17,tc:-1,rc:-3}).action,'R'); t('H17 15vA -2 no sur hit',d(['10','5'],'A',{rules:H17,tc:-2,rc:-6}).action,'H');
t('H17 15vA 5+ stand nosur',d(['10','5'],'A',{rules:H17,tc:5,rc:20,canSurrender:false}).action,'S');
t('H17 16vA 3+ stand nosur',d(['10','6'],'A',{rules:H17,tc:3,rc:9,canSurrender:false}).action,'S');
t('H17 10vA 3+',d(['6','4'],'A',{rules:H17,tc:3,rc:9}).action,'D');
t('handTotal soft',handTotal(C('A','6')).soft,true); t('handTotal AA9',handTotal(C('A','A','9')).total,21);
console.log('engine OK');
