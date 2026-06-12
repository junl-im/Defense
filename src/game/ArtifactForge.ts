import Phaser from "phaser";
import type { CombatRewardResult } from "./CombatRewards";
import { getStageRewardTable } from "./StageRewardTables";

export type ArtifactRarity = "common" | "rare" | "epic" | "legendary";

export type ArtifactId =
  | "oakLongbow"
  | "arcaneCore"
  | "captainsBanner"
  | "thunderPowder"
  | "merchantLedger"
  | "sunstoneAmulet"
  | "hexedHourglass"
  | "royalBulwark"
  | "shadowDagger"
  | "dragonScale"
  | "voidPrism"
  | "kingsCrown";

export type ArtifactDefinition = {
  id: ArtifactId;
  name: string;
  rarity: ArtifactRarity;
  role: string;
  description: string;
  craftCost: number;
  enhanceBaseCost: number;
  iconColor: number;
};

export type ArtifactState = {
  id: ArtifactId;
  level: number;
  equippedSlot?: number;
};

export type RewardInventory = {
  relicDust: number;
  royalTokens: number;
  artifactShards: Record<ArtifactId, number>;
  artifacts: Partial<Record<ArtifactId, ArtifactState>>;
  openedChests: number;
  lastChest?: ChestLootResult;
  updatedAt: number;
};

export type ChestLootResult = {
  chestTier: CombatRewardResult["chestTier"];
  medal: CombatRewardResult["medal"];
  dust: number;
  royalTokens: number;
  shards: Partial<Record<ArtifactId, number>>;
  featured: ArtifactId[];
  lines: string[];
};

const STORAGE_PREFIX = "kingdom-seed:artifact-forge:";

export const ARTIFACTS: ArtifactDefinition[] = [
  {
    id: "oakLongbow",
    name: "참나무 장궁",
    rarity: "common",
    role: "궁수 강화",
    description: "궁수 피해와 연사 보정. 공중 웨이브 대응에 강합니다.",
    craftCost: 20,
    enhanceBaseCost: 12,
    iconColor: 0x7bdc8a,
  },
  {
    id: "arcaneCore",
    name: "비전 핵",
    rarity: "rare",
    role: "마법 강화",
    description: "마법사 피해와 장갑 적 대응력을 높입니다.",
    craftCost: 28,
    enhanceBaseCost: 16,
    iconColor: 0x7aa7ff,
  },
  {
    id: "captainsBanner",
    name: "대장의 깃발",
    rarity: "common",
    role: "병영 강화",
    description: "병영 병사의 생존력과 전선 유지력을 올립니다.",
    craftCost: 22,
    enhanceBaseCost: 13,
    iconColor: 0xf0d36a,
  },
  {
    id: "thunderPowder",
    name: "천둥 화약",
    rarity: "rare",
    role: "포탑 강화",
    description: "포탑 폭발 범위와 중심 피해를 강화합니다.",
    craftCost: 30,
    enhanceBaseCost: 17,
    iconColor: 0xff925f,
  },
  {
    id: "merchantLedger",
    name: "상단 계약서",
    rarity: "common",
    role: "경제",
    description: "시작 골드와 진행 보너스를 안정적으로 보강합니다.",
    craftCost: 18,
    enhanceBaseCost: 12,
    iconColor: 0xffd079,
  },
  {
    id: "sunstoneAmulet",
    name: "태양석 부적",
    rarity: "rare",
    role: "스펠",
    description: "메테오와 용병 소환 운용을 매끄럽게 만듭니다.",
    craftCost: 30,
    enhanceBaseCost: 18,
    iconColor: 0xffe36a,
  },
  {
    id: "hexedHourglass",
    name: "저주받은 모래시계",
    rarity: "epic",
    role: "제어",
    description: "둔화와 보스 패턴 대응에 특화된 유물입니다.",
    craftCost: 42,
    enhanceBaseCost: 24,
    iconColor: 0xb86bff,
  },
  {
    id: "royalBulwark",
    name: "왕실 방벽",
    rarity: "epic",
    role: "방어",
    description: "라이프 보존, 병영 회복, 보스전 안정성을 올립니다.",
    craftCost: 44,
    enhanceBaseCost: 26,
    iconColor: 0x6ee7ff,
  },
  {
    id: "shadowDagger",
    name: "그림자 단검",
    rarity: "epic",
    role: "처형",
    description: "체력이 낮은 적과 빠른 적을 마무리하는 데 유리합니다.",
    craftCost: 46,
    enhanceBaseCost: 28,
    iconColor: 0xe17bff,
  },
  {
    id: "dragonScale",
    name: "용비늘 장갑",
    rarity: "legendary",
    role: "보스전",
    description: "화산/보스 스테이지에서 큰 방어 보너스를 제공합니다.",
    craftCost: 60,
    enhanceBaseCost: 36,
    iconColor: 0xff6b4a,
  },
  {
    id: "voidPrism",
    name: "공허 프리즘",
    rarity: "legendary",
    role: "마법/제어",
    description: "최종 진화 타워와 마법 계열 효과를 크게 증폭합니다.",
    craftCost: 64,
    enhanceBaseCost: 38,
    iconColor: 0x9b8cff,
  },
  {
    id: "kingsCrown",
    name: "왕의 관",
    rarity: "legendary",
    role: "전역 강화",
    description: "모든 전투 보너스를 소폭 끌어올리는 왕국 최상급 유물입니다.",
    craftCost: 80,
    enhanceBaseCost: 45,
    iconColor: 0xffd86b,
  },
];

const ARTIFACT_BY_ID = Object.fromEntries(
  ARTIFACTS.map((artifact) => [artifact.id, artifact]),
) as Record<ArtifactId, ArtifactDefinition>;

function makeEmptyShards(): Record<ArtifactId, number> {
  return Object.fromEntries(
    ARTIFACTS.map((artifact) => [artifact.id, 0]),
  ) as Record<ArtifactId, number>;
}

function defaultInventory(): RewardInventory {
  return {
    relicDust: 0,
    royalTokens: 0,
    artifactShards: makeEmptyShards(),
    artifacts: {},
    openedChests: 0,
    updatedAt: Date.now(),
  };
}

function storageKey(uid?: string): string {
  return `${STORAGE_PREFIX}${uid || "local"}`;
}

export function loadRewardInventory(uid?: string): RewardInventory {
  try {
    const raw = window.localStorage.getItem(storageKey(uid));
    if (!raw) return defaultInventory();
    const parsed = JSON.parse(raw) as Partial<RewardInventory>;
    return {
      ...defaultInventory(),
      ...parsed,
      artifactShards: {
        ...makeEmptyShards(),
        ...(parsed.artifactShards ?? {}),
      },
      artifacts: parsed.artifacts ?? {},
    };
  } catch {
    return defaultInventory();
  }
}

export function saveRewardInventory(
  uid: string | undefined,
  inventory: RewardInventory,
): void {
  const next = { ...inventory, updatedAt: Date.now() };
  window.localStorage.setItem(storageKey(uid), JSON.stringify(next));
}

function tierMultiplier(tier: CombatRewardResult["chestTier"]): number {
  if (tier === "MYTHIC") return 3.2;
  if (tier === "ROYAL") return 2.35;
  if (tier === "IRON") return 1.55;
  return 1;
}

function tokenReward(
  tier: CombatRewardResult["chestTier"],
  objectiveCount: number,
): number {
  const base =
    tier === "MYTHIC" ? 6 : tier === "ROYAL" ? 4 : tier === "IRON" ? 2 : 1;
  return base + Math.max(0, objectiveCount - 2);
}

function pickFeaturedArtifacts(
  stageId: string,
  tier: CombatRewardResult["chestTier"],
): ArtifactId[] {
  const table = getStageRewardTable(stageId);
  const picks = [...table.chestBias];
  if (tier === "ROYAL" || tier === "MYTHIC") picks.push("kingsCrown");
  if (tier === "MYTHIC") picks.push("voidPrism", "dragonScale");
  return [...new Set(picks)].slice(0, tier === "MYTHIC" ? 5 : 4);
}

export function grantBattleRewardInventory(
  uid: string | undefined,
  stageId: string,
  reward: CombatRewardResult,
): ChestLootResult {
  const inventory = loadRewardInventory(uid);
  const table = getStageRewardTable(stageId);
  const mult = tierMultiplier(reward.chestTier);
  const featured = pickFeaturedArtifacts(stageId, reward.chestTier);
  const dust = Math.round(reward.relicDust + table.guaranteedDust * mult);
  const royalTokens = tokenReward(reward.chestTier, reward.objectiveCount);
  const shards: Partial<Record<ArtifactId, number>> = {};

  featured.forEach((artifactId, index) => {
    const rarity = ARTIFACT_BY_ID[artifactId].rarity;
    const rarityBias =
      rarity === "legendary"
        ? 0.72
        : rarity === "epic"
          ? 0.9
          : rarity === "rare"
            ? 1.05
            : 1.18;
    const amount = Math.max(
      1,
      Math.round(
        (table.shardBonus + reward.objectiveCount + (featured.length - index)) *
          mult *
          rarityBias,
      ),
    );
    shards[artifactId] = amount;
    inventory.artifactShards[artifactId] += amount;
  });

  inventory.relicDust += dust;
  inventory.royalTokens += royalTokens;
  inventory.openedChests += 1;

  const result: ChestLootResult = {
    chestTier: reward.chestTier,
    medal: reward.medal,
    dust,
    royalTokens,
    shards,
    featured,
    lines: [
      `${reward.chestTier} 상자 개봉`,
      `유물 파편 가루 +${dust}`,
      `왕실 토큰 +${royalTokens}`,
      ...featured.map(
        (id) => `${ARTIFACT_BY_ID[id].name} 파편 +${shards[id] ?? 0}`,
      ),
    ],
  };

  inventory.lastChest = result;
  saveRewardInventory(uid, inventory);
  return result;
}

export function getArtifactDefinition(id: ArtifactId): ArtifactDefinition {
  return ARTIFACT_BY_ID[id];
}

export function craftArtifact(
  uid: string | undefined,
  artifactId: ArtifactId,
): { ok: boolean; message: string; inventory: RewardInventory } {
  const inventory = loadRewardInventory(uid);
  const def = getArtifactDefinition(artifactId);
  if (inventory.artifacts[artifactId])
    return { ok: false, message: "이미 보유 중인 유물입니다.", inventory };
  if ((inventory.artifactShards[artifactId] ?? 0) < def.craftCost)
    return { ok: false, message: "파편이 부족합니다.", inventory };
  inventory.artifactShards[artifactId] -= def.craftCost;
  inventory.artifacts[artifactId] = { id: artifactId, level: 1 };
  saveRewardInventory(uid, inventory);
  return { ok: true, message: `${def.name} 제작 완료`, inventory };
}

export function enhanceArtifact(
  uid: string | undefined,
  artifactId: ArtifactId,
): { ok: boolean; message: string; inventory: RewardInventory } {
  const inventory = loadRewardInventory(uid);
  const artifact = inventory.artifacts[artifactId];
  const def = getArtifactDefinition(artifactId);
  if (!artifact)
    return { ok: false, message: "먼저 유물을 제작하세요.", inventory };
  if (artifact.level >= 5)
    return { ok: false, message: "이미 최대 강화입니다.", inventory };
  const shardCost = def.enhanceBaseCost + artifact.level * 8;
  const dustCost = 20 + artifact.level * 12;
  if ((inventory.artifactShards[artifactId] ?? 0) < shardCost)
    return { ok: false, message: "강화 파편이 부족합니다.", inventory };
  if (inventory.relicDust < dustCost)
    return { ok: false, message: "유물 가루가 부족합니다.", inventory };
  inventory.artifactShards[artifactId] -= shardCost;
  inventory.relicDust -= dustCost;
  artifact.level += 1;
  saveRewardInventory(uid, inventory);
  return {
    ok: true,
    message: `${def.name} +${artifact.level} 강화`,
    inventory,
  };
}

export function equipArtifact(
  uid: string | undefined,
  artifactId: ArtifactId,
  slot: number,
): { ok: boolean; message: string; inventory: RewardInventory } {
  const inventory = loadRewardInventory(uid);
  const artifact = inventory.artifacts[artifactId];
  if (!artifact)
    return { ok: false, message: "보유하지 않은 유물입니다.", inventory };
  Object.values(inventory.artifacts).forEach((owned) => {
    if (owned?.equippedSlot === slot) delete owned.equippedSlot;
    if (owned?.id === artifactId) delete owned.equippedSlot;
  });
  artifact.equippedSlot = slot;
  saveRewardInventory(uid, inventory);
  return {
    ok: true,
    message: `${getArtifactDefinition(artifactId).name} ${slot + 1}번 슬롯 장착`,
    inventory,
  };
}

export function artifactRarityColor(rarity: ArtifactRarity): number {
  if (rarity === "legendary") return 0xffd86b;
  if (rarity === "epic") return 0xb86bff;
  if (rarity === "rare") return 0x6ee7ff;
  return 0x9ee37d;
}

export function artifactPowerLabel(
  artifact: ArtifactState | undefined,
  def: ArtifactDefinition,
): string {
  const level = artifact?.level ?? 0;
  if (!artifact) return "미제작";
  const percent = 5 + level * 4;
  return `Lv.${level} · ${def.role} +${percent}%`;
}

type ForgeBounceTarget = Phaser.GameObjects.GameObject & {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  setScale?: (x: number, y?: number) => Phaser.GameObjects.GameObject;
};

export function playArtifactForgeBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xffd86b,
  label = "유물 완성",
): void {
  // 유물 제작/강화 성공 시 사용하는 가벼운 보상 연출 레이어.
  // 이미지 에셋이 있으면 이미지 기반으로, 누락 시에도 플레이가 멈추지 않도록 얇은 폴백만 쓴다.
  const root = scene.add.container(x, y).setDepth(150);
  const glow = scene.textures.exists("ui-fx-reward-glimmer-v43")
    ? scene.add
        .image(0, 0, "ui-fx-reward-glimmer-v43")
        .setDisplaySize(210, 210)
        .setBlendMode(Phaser.BlendModes.ADD)
    : scene.add
        .circle(0, 0, 74, color, 0.18)
        .setBlendMode(Phaser.BlendModes.ADD);
  const ring = scene.textures.exists("ui-reward-chest-glow-v42")
    ? scene.add
        .image(0, 0, "ui-reward-chest-glow-v42")
        .setDisplaySize(250, 250)
        .setBlendMode(Phaser.BlendModes.ADD)
    : scene.add
        .circle(0, 0, 96, color, 0.08)
        .setStrokeStyle(3, color, 0.55)
        .setBlendMode(Phaser.BlendModes.ADD);
  const text = scene.add
    .text(0, 84, label, {
      fontSize: "21px",
      color: "#fff4c2",
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      stroke: "#2b1605",
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 3, color: "#000000", blur: 3, fill: true },
    })
    .setOrigin(0.5);
  root.add([ring, glow, text]);

  scene.tweens.add({
    targets: ring,
    angle: 90,
    scale: 1.18,
    alpha: 0,
    duration: 760,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: glow,
    angle: 180,
    scale: 1.35,
    alpha: 0,
    duration: 920,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: text,
    y: 62,
    alpha: 0,
    duration: 900,
    delay: 120,
    ease: "Cubic.easeOut",
  });

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    const shard = scene.textures.exists("ui-icon-spark")
      ? scene.add
          .image(0, 0, "ui-icon-spark")
          .setDisplaySize(18, 18)
          .setTint(color)
      : scene.add.star(0, 0, 5, 4, 10, color, 0.86);
    shard.setBlendMode(Phaser.BlendModes.ADD);
    root.add(shard);
    scene.tweens.add({
      targets: shard,
      x: Math.cos(angle) * Phaser.Math.Between(70, 122),
      y: Math.sin(angle) * Phaser.Math.Between(42, 86),
      scale: 0.25,
      alpha: 0,
      duration: 620 + i * 18,
      ease: "Quad.easeOut",
    });
  }

  scene.time.delayedCall(980, () => root.destroy());
}

export function playArtifactChestBounce(
  scene: Phaser.Scene,
  x: number,
  y: number,
  target?: Phaser.GameObjects.GameObject,
  color = 0xffd86b,
): void {
  // 보상 상자/유물 아이콘을 통통 튀게 만드는 공용 인터랙션.
  const bounceTarget = target as ForgeBounceTarget | undefined;
  const baseScaleX = bounceTarget?.scaleX ?? 1;
  const baseScaleY = bounceTarget?.scaleY ?? 1;
  if (bounceTarget?.setScale) {
    scene.tweens.add({
      targets: bounceTarget,
      y: (bounceTarget.y ?? y) - 10,
      scaleX: baseScaleX * 1.12,
      scaleY: baseScaleY * 0.9,
      duration: 120,
      yoyo: true,
      repeat: 1,
      ease: "Back.easeOut",
      onComplete: () => bounceTarget.setScale?.(baseScaleX, baseScaleY),
    });
  }

  playArtifactForgeBurst(scene, x, y, color, "보상 개봉");
}
