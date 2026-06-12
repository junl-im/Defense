import type { EnemyConfig, TowerKind } from "./types";

/**
 * v2.36.0 Battle Art Mode
 *
 * DALL-E의 `Single isolated on solid white background` 아이콘은 검수/교체용 원본이다.
 * 실제 전투 기본값에서는 이 아이콘을 전장 오브젝트로 직접 쓰지 않는다.
 * 기본 전투는 기존 스프라이트/원화풍 패밀리 아트를 우선 사용하고,
 * 아이콘 목업은 `?casualart`, `?iconmock`, `?stickerart`에서만 켠다.
 */
function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function useIconMockBattleArt(): boolean {
  const qs = query();
  return qs.has("casualart") || qs.has("iconmock") || qs.has("stickerart");
}

export function allowPreviewBattlefieldArt(): boolean {
  const qs = query();
  return (
    useIconMockBattleArt() ||
    qs.has("fullart") ||
    qs.has("ultraart") ||
    qs.has("galleryart")
  );
}

export function premiumActorScale(): number {
  const qs = query();
  if (qs.has("compactactors")) return 1.0;
  if (qs.has("largeactors")) return 1.28;
  if (qs.has("cinematicactors")) return 1.36;
  // v2.36.1: 모바일 기본 화면이 작고 장난감처럼 보였던 문제를 줄이기 위해
  // 성능 비용이 거의 없는 표시 스케일만 기본 상향한다.
  return 1.18;
}

export function towerDisplayHeight(kind: TowerKind, level: number): number {
  const base =
    kind === "artillery"
      ? 108
      : kind === "barracks"
        ? 118
        : kind === "mage"
          ? 120
          : 118;
  const levelBoost = level >= 3 ? 1.1 : level === 2 ? 1.05 : 1;
  return base * levelBoost * premiumActorScale();
}

export function enemySpriteScale(config: EnemyConfig): number {
  const scale = config.scale ?? 1;
  const threat = config.threat;
  const base =
    threat === "boss"
      ? 2.18
      : threat === "tank"
        ? 1.78
        : config.flying || threat === "flying"
          ? 1.58
          : threat === "swarm"
            ? 1.42
            : 1.56;
  return scale * base * premiumActorScale();
}

export function enemyDisplayHeight(config: EnemyConfig): number {
  const scale = config.scale ?? 1;
  const threat = config.threat;
  const base =
    threat === "boss"
      ? 116
      : threat === "tank"
        ? 90
        : config.flying || threat === "flying"
          ? 76
          : threat === "swarm"
            ? 62
            : 76;
  return base * scale * premiumActorScale();
}

export function heroDisplayHeight(): number {
  return 74 * premiumActorScale();
}

export function projectileSpriteScale(style: string): number {
  const base = style === "shell" ? 1.34 : style === "slash" ? 1.18 : 1.16;
  return base * Math.min(1.14, premiumActorScale());
}

export function projectileIconFootprint(style: string): { maxWidth: number; maxHeight: number } {
  const scale = Math.min(1.18, premiumActorScale());
  if (style === "shell") return { maxWidth: 48 * scale, maxHeight: 48 * scale };
  if (style === "magic") return { maxWidth: 40 * scale, maxHeight: 40 * scale };
  return { maxWidth: 40 * scale, maxHeight: 36 * scale };
}
