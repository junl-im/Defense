# Kingdom Seed v3.5 - Reward Objective Loop

## Goal
v3.5 turns stage clear into a more modern mobile-defense result loop.
Instead of only showing score, the result screen now evaluates tactical objectives,
awards a chest tier, shows bonus gold/relic dust, and adds leaderboard rank medals.

## Added Systems

### 1. Tactical Objective Banner
At the beginning of combat, a short mission banner explains what kind of play the
stage rewards:

- Early stages: no-leak and life preservation
- Mid stages: boss preparation and final tower evolution
- Late stages: tower replacement, target priority, and spell timing

### 2. Reward Chest Calculation
Reward tier is determined from objective completion:

- BRONZE / WOOD chest
- SILVER / IRON chest
- GOLD / ROYAL chest
- LEGEND / MYTHIC chest

Inputs:

- lives remaining
- total leaks
- best kill streak
- clear time
- stage number

### 3. Result UI Upgrade
The clear screen now separates:

- top stage clear header
- central reward chest card
- left tactical objective result panel
- right leaderboard medal panel
- bottom action buttons

### 4. Leaderboard Medals
Top 3 daily leaderboard rows now display rank medals.

## Files

- `src/game/CombatRewards.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/BootScene.ts`
- `public/assets/ui/*_v35.png`

## Future Hook
The UI currently displays bonus gold and relic dust as battle-result rewards.
If you want persistent storage later, add fields such as `relicDust` and
`rewardClaims` to `/users/{uid}` and update Firestore rules accordingly.
