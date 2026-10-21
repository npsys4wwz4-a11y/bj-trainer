# מאמן בלאק ג'ק — Hi-Lo trainer (v1)

Strategy follows ONLY the Blackjack Apprenticeship charts, cell by cell:
- S17: https://www.blackjackapprenticeship.com/wp-content/uploads/2019/07/BJA_S17.pdf
- H17: https://www.blackjackapprenticeship.com/wp-content/uploads/2019/07/BJA_H17.pdf

`data/charts.mjs` holds the transcribed charts and the deviation-action map. `npm test` checks every cell.
Index legend (as printed): `n+` TC ≥ n, `n-` TC ≤ n, `0+`/`0-` any positive/negative running count.
Decision order (BJA): surrender → split → double → hit/stand. TC = RC ÷ (cards left ÷ 52), truncated toward zero by default.
