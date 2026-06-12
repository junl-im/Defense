import Phaser from "phaser";
import { CASUAL_ART_KEYS } from "./AssetMap";

export type CasualArtPromptSlot = "tower" | "monster" | "hero" | "projectile";

export type CasualArtPromptSpec = {
  slot: CasualArtPromptSlot;
  title: string;
  targetPath: string;
  prompt: string;
  recommendedSize: string;
  runtimeFootprint: string;
};

/**
 * v2.35.9 Casual Art Director
 *
 * DALL-E 또는 다른 이미지 생성 파이프라인으로 만든 교체용 이미지를
 * 게임 내 발자국에 맞춰 안전하게 쓰기 위한 얇은 디자인/런타임 레이어다.
 *
 * 원칙:
 * - 원본 PNG가 256px이든 1024px이든 게임 안에서는 같은 크기로 보인다.
 * - 기본 부팅에는 관여하지 않는다. 전투 씬에서 이미 로드된 텍스처만 정규화한다.
 * - 원화풍/벡터풍 이미지가 투명 배경을 갖지 않아도 하얀 스티커 백플레이트로 가독성을 보정한다.
 */
export const CASUAL_ART_PROMPT_SPECS: CasualArtPromptSpec[] = [
  {
    slot: "tower",
    title: "Tower Icon",
    targetPath: "public/assets/ui-kit/icons/fishing_rod.png",
    recommendedSize: "512x512 or 1024x1024 PNG, transparent background preferred",
    runtimeFootprint: "Tower body: about 74-96px tall on a 960x540 battle canvas",
    prompt:
      "Cute cozy 2D casual defense game tower icon, tiny wooden fishing-rod tower with a round stone base, cheerful fantasy kingdom style, single isolated object on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game asset, clean silhouette, no text, no UI, high readability at small size",
  },
  {
    slot: "monster",
    title: "Monster Icon",
    targetPath: "public/assets/art/v30_fish_slime_icon.png",
    recommendedSize: "512x512 or 1024x1024 PNG, transparent background preferred",
    runtimeFootprint: "Normal enemy: about 52-60px tall, boss: about 82-88px tall",
    prompt:
      "Cute chubby fish-slime monster for a mobile tower defense game, friendly but mischievous expression, ocean fantasy theme, simple rounded body, tiny fins, single isolated character on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game sprite asset, no text, no UI, clean silhouette",
  },
  {
    slot: "hero",
    title: "Hero Icon",
    targetPath: "public/assets/ui-kit/icons/hero_seed_knight.png",
    recommendedSize: "512x512 or 1024x1024 PNG, transparent background preferred",
    runtimeFootprint: "Hero body: about 50-58px tall",
    prompt:
      "Cute brave young kingdom seed knight hero for a casual 2D mobile defense game, small cape, tiny wooden sword, warm smile, storybook fantasy style, single isolated character on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game hero icon, no text, no UI, clean silhouette",
  },
  {
    slot: "projectile",
    title: "Projectile Icon",
    targetPath: "public/assets/ui-kit/icons/projectile_seed.png",
    recommendedSize: "512x512 or 1024x1024 PNG, transparent background preferred",
    runtimeFootprint: "Projectile: about 20-30px wide while flying",
    prompt:
      "Cute magical seed-shaped projectile icon for a casual 2D tower defense game, glowing golden seed arrow with sparkles and tiny motion trail, fantasy kingdom style, single isolated object on solid white background, vector illustration, thick outlines, soft pastel colors, mobile game asset, no text, no UI, clean silhouette",
  },
];

const CASUAL_TEXTURE_KEYS = new Set<string>([
  CASUAL_ART_KEYS.battlefieldOcean,
  CASUAL_ART_KEYS.fishSilhouetteSheet,
  CASUAL_ART_KEYS.fishSlime,
  CASUAL_ART_KEYS.towerFishingRod,
  CASUAL_ART_KEYS.towerBase,
  CASUAL_ART_KEYS.heroSeedKnight,
  CASUAL_ART_KEYS.projectileSeed,
]);

export function isCasualArtTextureKey(key: string | undefined): boolean {
  return !!key && CASUAL_TEXTURE_KEYS.has(key);
}

export function getCasualArtPromptMarkdown(): string {
  return CASUAL_ART_PROMPT_SPECS.map(
    (spec, index) =>
      `${index + 1}. ${spec.title}\nTarget: ${spec.targetPath}\n${spec.prompt}`,
  ).join("\n\n");
}

export function fitIsolatedIcon(
  image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  options: {
    maxWidth: number;
    maxHeight: number;
    y?: number;
    x?: number;
    minScale?: number;
    maxScale?: number;
  },
): void {
  const sourceWidth = Math.max(1, image.width);
  const sourceHeight = Math.max(1, image.height);
  const rawScale = Math.min(options.maxWidth / sourceWidth, options.maxHeight / sourceHeight);
  const finalScale = Phaser.Math.Clamp(rawScale, options.minScale ?? 0.01, options.maxScale ?? 4);
  image.setScale(finalScale);
  image.setPosition(options.x ?? image.x, options.y ?? image.y);
}

export function makeStickerBackplate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    fill?: number;
    stroke?: number;
    alpha?: number;
    strokeAlpha?: number;
  },
): Phaser.GameObjects.Ellipse {
  return scene.add
    .ellipse(
      x,
      y,
      width,
      height,
      options?.fill ?? 0xfff7e6,
      options?.alpha ?? 0.9,
    )
    .setStrokeStyle(2, options?.stroke ?? 0x3d2a1a, options?.strokeAlpha ?? 0.2);
}

export function makeSoftGroundShadow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.22,
): Phaser.GameObjects.Ellipse {
  return scene.add.ellipse(x, y, width, height, 0x000000, alpha);
}

export function installArtMapDebugBadge(scene: Phaser.Scene): void {
  const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  if (!query.has("artmapdebug")) return;

  const loaded = Object.values(CASUAL_ART_KEYS).filter((key) => scene.textures.exists(key)).length;
  const total = Object.values(CASUAL_ART_KEYS).length;
  const label = scene.add
    .text(12, 76, `ART MAP ${loaded}/${total}`, {
      fontSize: "12px",
      color: "#fff7d6",
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      backgroundColor: "rgba(18, 24, 38, 0.72)",
      padding: { x: 7, y: 4 },
    })
    .setDepth(140)
    .setScrollFactor(0);

  scene.time.delayedCall(2400, () => label.destroy());
}
