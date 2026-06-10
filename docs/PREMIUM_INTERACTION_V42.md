# Kingdom Seed v4.2 Premium Interaction Pass

## Focus

- Tower panel commercial-grade polish
- Reward chest opening anticipation
- Battle start loading presentation
- Global click/touch feedback
- KakaoTalk/in-app browser back-button guard hardening

## Browser notes

Mobile in-app browsers can ignore `beforeunload` and may close a webview without giving the page a chance to show a custom prompt. v4.2 adds a multi-layer guard:

1. duplicated History API guard states
2. `popstate` custom exit modal
3. `hashchange` fallback
4. `pagehide` and `visibilitychange` emergency-save events
5. mobile-only re-arm on pointerdown/focus/visibility restore

This improves KakaoTalk Android behavior, but no web page can guarantee a custom exit modal if the host app force-closes the webview.

## New assets

- `battle_loading_frame_v42.png`
- `loading_crest_v42.png`
- `tower_panel_v42.png`
- `reward_stage_panel_v42.png`
- `button_action_v42.png`
- `button_blue_v42.png`
- `button_danger_v42.png`
- `reward_chest_glow_v42.png`
- `tower_action_icons_v42.png`
- `fx_click_burst_v42.png`
