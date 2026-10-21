// Transcribed verbatim. Columns = dealer upcard 2,3,4,5,6,7,8,9,10,A.
// Basic: user's BJA basic strategy screenshot. Deviations: BJA_S17.pdf (blackjackapprenticeship.com/wp-content/uploads/2019/07/BJA_S17.pdf).
// Index cells kept as printed strings ("6+", "0-", "-1-"); "" = blank cell.
export const UPCARDS = ['2','3','4','5','6','7','8','9','10','A'];
const r = s => s.trim().split(/\s+/).map(x => x === '.' ? '' : x);
export const BASIC = {
  pairs: {'A,A':r('Y Y Y Y Y Y Y Y Y Y'),'T,T':r('N N N N N N N N N N'),'9,9':r('Y Y Y Y Y N Y Y N N'),'8,8':r('Y Y Y Y Y Y Y Y Y Y'),'7,7':r('Y Y Y Y Y Y N N N N'),'6,6':r('Y/N Y Y Y Y N N N N N'),'5,5':r('N N N N N N N N N N'),'4,4':r('N N N Y/N Y/N N N N N N'),'3,3':r('Y/N Y/N Y Y Y Y N N N N'),'2,2':r('Y/N Y/N Y Y Y Y N N N N')},
  soft: {'A,9':r('S S S S S S S S S S'),'A,8':r('S S S S Ds S S S S S'),'A,7':r('Ds Ds Ds Ds Ds S S H H H'),'A,6':r('H D D D D H H H H H'),'A,5':r('H H D D D H H H H H'),'A,4':r('H H D D D H H H H H'),'A,3':r('H H H D D H H H H H'),'A,2':r('H H H D D H H H H H')},
  hard: {'17':r('S S S S S S S S S S'),'16':r('S S S S S H H H H H'),'15':r('S S S S S H H H H H'),'14':r('S S S S S H H H H H'),'13':r('S S S S S H H H H H'),'12':r('H H S S S H H H H H'),'11':r('D D D D D D D D D D'),'10':r('D D D D D D D D H H'),'9':r('H D D D D H H H H H'),'8':r('H H H H H H H H H H')},
  surrender: {'16':r('. . . . . . . SUR SUR SUR'),'15':r('. . . . . . . . SUR .'),'14':r('. . . . . . . . . .')},
  insurance: "DON'T TAKE"
};
export const S17_DEV = {
  pairs: {'A,A':r('Y Y Y Y Y Y Y Y Y Y'),'T,T':r('N N 6+ 5+ 4+ N N N N N'),'9,9':r('Y Y Y Y Y N Y Y N N'),'8,8':r('Y Y Y Y Y Y Y Y Y Y'),'7,7':r('Y Y Y Y Y Y N N N N'),'6,6':r('Y/N Y Y Y Y N N N N N'),'5,5':r('N N N N N N N N N N'),'4,4':r('N N N Y/N Y/N N N N N N'),'3,3':r('Y/N Y/N Y Y Y Y N N N N'),'2,2':r('Y/N Y/N Y Y Y Y N N N N')},
  soft: {'A,9':r('S S S S S S S S S S'),'A,8':r('S S 3+ 1+ 1+ S S S S S'),'A,7':r('Ds Ds Ds Ds Ds S S H H H'),'A,6':r('1+ D D D D H H H H H'),'A,5':r('H H D D D H H H H H'),'A,4':r('H H D D D H H H H H'),'A,3':r('H H H D D H H H H H'),'A,2':r('H H H D D H H H H H')},
  hard: {'17':r('S S S S S S S S S S'),'16':r('S S S S S H H 4+ 0+ H'),'15':r('S S S S S H H H 4+ H'),'14':r('S S S S S H H H H H'),'13':r('-1- S S S S H H H H H'),'12':r('3+ 2+ 0- S S H H H H H'),'11':r('D D D D D D D D D 1+'),'10':r('D D D D D D D D 4+ 4+'),'9':r('1+ D D D D 3+ H H H H'),'8':r('H H H H 2+ H H H H H')},
  surrender: {'17':r('. . . . . . . . . .'),'16':r('. . . . . . 4+ -1- SUR SUR'),'15':r('. . . . . . . 2+ 0- 2+'),'14':r('. . . . . . . . . .')},
  insurance: '3+'
};
