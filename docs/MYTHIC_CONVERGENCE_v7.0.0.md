# Mythic Convergence v7.0.0

## Runtime pillars

- Ten deterministic elemental reactions built on the six existing status effects.
- Battle Momentum gauge with a 7.5 second Mythic Overdrive window.
- Boss escalation state that reacts to health, phase and encounter duration.
- Player-facing momentum meter and production-console diagnostics.
- Combat telemetry v2 and save schema v7.

## Elemental reaction rules

A reaction requires an existing status and a different incoming elemental status. The reaction deals bounded bonus damage, consumes only its configured statuses and reports its event to telemetry. Boss reaction damage is reduced to preserve encounter readability.

## Momentum rules

Damage, kills, elite kills, boss kills, reactions and wave clears fill momentum. At 100, Mythic Overdrive activates for 7.5 seconds and grants damage and reward multipliers. Additional momentum during Overdrive extends the window within a hard cap.

## Boss escalation rules

Boss rage rises with lost health, elapsed encounter time and phase count. Enrage accelerates special attacks, increases core damage and raises the kill reward. It never changes the authored art approval state.

## Art policy

Absolute Art Bible v2.0 and Character DNA v3.0 remain immutable. The 19 current runtime GLBs remain legacy candidates with zero production approvals. Mass production remains locked until all six golden vertical-slice categories pass.
