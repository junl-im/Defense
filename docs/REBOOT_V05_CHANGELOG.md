# Defense Reboot v0.5 — Boss Patterns / Heroine Lobby / Pause

Date: 2026-10-18. All changes on Draft PR #1 feature branch, NOT on main.

## Code delivered
- Three deterministic, phase-specific boss attack patterns: targeted lane slam, outer-lane sweep (center safe), central pulse (edges safe).
- Target is snapshotted when warning appears; movement after warning can evade it. Three pure attack hitbox/damage unit tests and extra validation.
- Boss motion: Witch CC0 GLB uses `Sword_Slash`, `Gun_Shoot`, `Punch_Left` and `Death` animations (actual available clips).
- Heroine and companions switch to licensed `Run_Shoot` animation clips.
- Animated boss attack warning lanes, phase indicator, attack text and CSS hit vignette.
- Dating-sim style opening card sourced from our existing `ally-female.png` (PNG, no SVG).
- PC P/Escape and touch-accessible pause + resume menu; while paused, time/distance stop and no shots are spawned.
- WebGL Playwright QA now checks stage entry, 3D model fetches, active PNG crowd, boss health loss and animation activation, pause/resume on desktop and mobile.

## Safety and verification
- No SVG used or introduced.
- No commercial Unity code or ripped assets.
- GLB (Quaternius) is original licensed CC0 pack and art direction approval is separate from technical verification.
- Unity main baseline remains unchanged; PR not merged.
- CI and live screenshots must pass before considering v0.5 complete. Software-renderer FPS is not indicative of actual devices.
