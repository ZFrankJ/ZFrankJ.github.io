Original prompt: I see, I manually revise it a bit, then could you revise the colors of two planes, they are still too similar. Also, avoid using a different color for vertical tail.

## 2026-02-08
- Applied camouflage color split:
  - P1/ME uses grass-family olive greens.
  - P2/ENY uses sky-family blue-greys.
  - Vertical tails now match each plane body color.
- Rebalanced roles across single and duo modes:
  - P1/ME: lower speed, higher HP and ammo.
  - P2/ENY: higher speed, lower HP and ammo.
- Updated default HUD text values to match runtime values.

TODO
- Run a quick in-browser verification for both 1P and 2P to confirm readability and feel.
2026-02-08 13:41:56 updated colors/tracers/fps in index.html
2026-02-08 15:14:18 2P controls: increased P2 yaw/pitch rates (30/26 deg/s) for faster left-right and up-down turns.
2026-02-08 19:21:55 Added weather system: sunny/cloudy/rainy with menu buttons + hotkeys 7/8/9. Weather now controls fog/light/clouds and rain particles; state output includes weather.
2026-02-08 19:28:24 Refined weather clouds to layered cloud deck: dense primary layer at fixed altitude + sparse higher layer above; per-weather deck density and holes.
2026-02-10 14:38:55 Set single-player speeds to fixed values matching duo mode: player 22, enemy 28. Removed HP-based speed scaling in single mode.
