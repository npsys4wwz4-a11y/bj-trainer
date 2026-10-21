import {decide,takeInsurance,trueCount,hiLo,handTotal,isBJ,makeShoe,val} from './engine.mjs';
export const DEFAULTS={decks:6,pen:75,bots:2,h17:false,das:true,resplit:true,resplitAces:false,hitSplitAces:false,surrender:true,payout:'3:2',mode:'count',showCount:false,quizEvery:5,tcMethod:'trunc'};
export class Game{
  constructor(settings,rand=Math.random){this.set=Object.assign({},DEFAULTS,settings);this.rand=rand;this.rounds=0;this.bank=0;this.newShoe();}
  get counting(){return this.set.mode==='count';}
  get rules(){const s=this.set;return{h17:s.h17,das:s.das,surrender:s.surrender};}
  newShoe(){this.shoe=makeShoe(this.set.decks,this.rand);this.total=this.shoe.length;this.rc=0;this.justShuffled=true;}
  get tc(){return trueCount(this.rc,this.shoe.length,this.set.tcMethod);}
  get decksLeft(){return this.shoe.length/52;}
  draw(visible=true){if(!this.shoe.length)this.newShoe();const c=this.shoe.pop();c.up=visible;if(visible)this.rc+=hiLo(c.r);return c;}
  needShuffle(){return this.set.mode==='basic'||(this.total-this.shoe.length)>=this.total*this.set.pen/100;}
  start(){this.justShuffled=false;if(this.needShuffle())this.newShoe();this.rounds++;
    const n=this.set.bots,pi=Math.floor(n/2);this.playerSeat=pi;
    this.seats=[];for(let i=0;i<=n;i++)this.seats.push({bot:i!==pi,hands:[{cards:[],bet:1}]});
    this.dealer=[];this.log=[];
    for(let k=0;k<2;k++){for(const s of this.seats)s.hands[0].cards.push(this.draw());this.dealer.push(this.draw(k===0));}
    this.hi=0;this.phase='insurance';this.insurance=null;
    if(this.dealer[0].r==='A')return this.emit('insurance');
    return this.afterInsurance();}
  emit(p){this.phase=p;return p;}
  get up(){return this.dealer[0].r;}
  /** player insurance decision (true/false) => feedback */
  insure(take){const correct=takeInsurance(this.counting,this.tc);const fb={kind:'insurance',chosen:take,correct,ok:take===correct,tc:this.tc,rc:this.rc,src:this.counting?'deviation':'basic',index:this.counting?'3+':null};
    this.insurance=take;this.lastFb=fb;this.afterInsurance();return fb;}
  afterInsurance(){const peek=this.up==='A'||val(this.up)===10;
    if(peek&&isBJ(this.dealer)){this.revealHole();this.settle();return this.emit('done');}
    this.seatIdx=0;return this.advance();}
  revealHole(){const h=this.dealer[1];if(!h.up){h.up=true;this.rc+=hiLo(h.r);}}
  seat(){return this.seats[this.seatIdx];}
  hand(){return this.seat().hands[this.hi];}
  advance(){ // move through seats/hands; bots play automatically
    while(this.seatIdx<this.seats.length){const s=this.seat();
      while(this.hi<s.hands.length){const h=s.hands[this.hi];
        if(h.cards.length===1){h.cards.push(this.draw());if(h.splitAces&&!this.set.hitSplitAces)h.done=true;}
        if(isBJ(h.cards)&&s.hands.length===1)h.done=true;
        if(handTotal(h.cards).total>=21)h.done=true;
        if(h.done){this.hi++;continue;}
        if(!s.bot)return this.emit('player');
        this.apply(decide(this.ctx()).action);}
      this.seatIdx++;this.hi=0;}
    this.dealerPlay();this.settle();return this.emit('done');}
  allowed(){const s=this.seat(),h=this.hand(),two=h.cards.length===2,pair=two&&val(h.cards[0].r)===val(h.cards[1].r);
    const isA=pair&&h.cards[0].r==='A';const maxH=this.set.resplit?4:2;
    const canSplit=pair&&s.hands.length<maxH&&(!h.splitAces||this.set.resplitAces)&&(s.hands.length===1||this.set.resplit)&&(!isA||!h.splitAces||this.set.resplitAces);
    const canDouble=two&&(!h.fromSplit||this.set.das)&&!(h.splitAces);
    const canSurrender=this.set.surrender&&two&&s.hands.length===1;
    return{H:!(h.splitAces&&!this.set.hitSplitAces),S:true,D:canDouble,P:canSplit,R:canSurrender};}
  ctx(){const a=this.allowed();return{cards:this.hand().cards,up:this.up,rules:this.rules,rc:this.rc,tc:this.tc,counting:this.counting,canSplit:a.P,canDouble:a.D,canSurrender:a.R};}
  /** player action => feedback object */
  act(a){const al=this.allowed();if(!al[a])return null;const ctx=this.ctx();const exp=decide(ctx);
    const fb={kind:'play',chosen:a,correct:exp.action,ok:a===exp.action,src:exp.src,index:exp.index,cellKey:exp.cellKey,alsoIndex:exp.alsoIndex,rc:this.rc,tc:this.tc,
      hand:ctx.cards.map(c=>c.r),up:this.up,total:handTotal(ctx.cards),devCell:!!(exp.index||exp.alsoIndex)};
    this.lastFb=fb;this.apply(a);this.advance();return fb;}
  apply(a){const s=this.seat(),h=this.hand();
    if(a==='H'){h.cards.push(this.draw());if(handTotal(h.cards).total>=21)h.done=true;}
    else if(a==='S')h.done=true;
    else if(a==='D'){h.bet*=2;h.doubled=true;h.cards.push(this.draw());h.done=true;}
    else if(a==='R'){h.surrendered=true;h.done=true;}
    else if(a==='P'){const c2=h.cards.pop();const aces=c2.r==='A';const nh={cards:[c2],bet:h.bet,fromSplit:true,splitAces:aces};h.fromSplit=true;h.splitAces=aces;s.hands.splice(this.hi+1,0,nh);
      h.cards.push(this.draw());if(aces&&!this.set.hitSplitAces)h.done=true;if(handTotal(h.cards).total>=21)h.done=true;}}
  dealerPlay(){this.revealHole();const live=this.seats.some(s=>s.hands.some(h=>!h.surrendered&&handTotal(h.cards).total<=21&&!(isBJ(h.cards)&&s.hands.length===1)));
    if(!live)return;for(;;){const {total,soft}=handTotal(this.dealer);if(total<17||(total===17&&soft&&this.set.h17))this.dealer.push(this.draw());else break;}}
  settle(){const d=handTotal(this.dealer).total,dBJ=isBJ(this.dealer),bj=this.set.payout==='6:5'?1.2:1.5;
    for(const s of this.seats)for(const h of s.hands){const t=handTotal(h.cards).total,pBJ=isBJ(h.cards)&&s.hands.length===1;let w;
      if(h.surrendered)w=-0.5*h.bet;else if(dBJ)w=pBJ?0:-h.bet;else if(pBJ)w=bj*h.bet;else if(t>21)w=-h.bet;else if(d>21||t>d)w=h.bet;else if(t===d)w=0;else w=-h.bet;
      h.win=w;}
    const me=this.seats[this.playerSeat];let net=me.hands.reduce((a,h)=>a+h.win,0);
    if(this.insurance)net+=dBJ?1:-0.5;me.net=net;this.bank+=net;}
  quizDue(){return this.counting&&!this.set.showCount&&this.set.quizEvery>0&&this.rounds>0&&this.rounds%this.set.quizEvery===0;}
}
