import Phaser from "phaser";
import type { User } from "firebase/auth";
import type { PlayerSave } from "../services/localSave";
import {
  ARTIFACTS,
  artifactPowerLabel,
  artifactRarityColor,
  craftArtifact,
  enhanceArtifact,
  equipArtifact,
  getArtifactDefinition,
  loadRewardInventory,
  playArtifactChestBounce,
  playArtifactForgeBurst,
  type ArtifactId,
  type RewardInventory,
} from "../game/ArtifactForge";
import { createArtifactIcon } from "../game/PremiumRewardForgeUi";
import { playMusic, playSfx } from "../game/AudioManager";
import { startRegisteredScene } from "./SceneRegistry";
import { installSceneReadabilityPass, readableFontSize, readableHitSize } from "../game/MobileReadableUi";

const SLOT_X = [698, 786, 874];

export class ArtifactForgeScene extends Phaser.Scene {
  user!: User;
  save!: PlayerSave;
  inventory!: RewardInventory;
  selectedId: ArtifactId = "oakLongbow";
  listRoot!: Phaser.GameObjects.Container;
  detailRoot!: Phaser.GameObjects.Container;
  toastText!: Phaser.GameObjects.Text;

  constructor() {
    super("ArtifactForgeScene");
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.inventory = loadRewardInventory(this.user?.uid);
  }

  create(): void {
    playMusic(this, "bgm_world");
    this.drawBackground();
    this.drawHeader();
    this.drawResourceBar();
    this.drawEquipSlots();
    this.listRoot = this.add.container(0, 0).setDepth(20);
    this.detailRoot = this.add.container(0, 0).setDepth(22);
    this.renderArtifactList();
    this.renderDetail();
    installSceneReadabilityPass(this, { min: 15, strokeThickness: 3 });
    this.toastText = this.add
      .text(480, 506, "", {
        fontSize: readableFontSize(16, 16, 23),
        color: "#fff4c2",
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: "#000000",
          blur: 2,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(80)
      .setAlpha(0);
  }

  private drawBackground(): void {
    if (this.textures.exists("ui-forge-bg-v36")) {
      this.add.image(480, 270, "ui-forge-bg-v36").setDisplaySize(960, 540);
    } else {
      this.add.rectangle(480, 270, 960, 540, 0x111827);
    }
    this.add.rectangle(480, 270, 960, 540, 0x020713, 0.2);
    this.add.rectangle(480, 30, 960, 60, 0x05070c, 0.48);
    this.add.rectangle(480, 514, 960, 52, 0x05070c, 0.55);
  }

  private drawHeader(): void {
    this.add
      .text(42, 25, "왕국 유물 제작소", {
        fontSize: "31px",
        color: "#ffe28a",
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 4,
          color: "#000000",
          blur: 4,
          fill: true,
        },
      })
      .setOrigin(0, 0.5)
      .setDepth(10);
    this.add
      .text(
        44,
        54,
        "보급 상자를 열고, 유물을 제작·강화·장착해 전투력을 올리세요.",
        {
          fontSize: readableFontSize(13, 15, 20),
          color: "#dbe7ff",
          fontStyle: "bold",
        },
      )
      .setOrigin(0, 0.5)
      .setDepth(10);
    this.makeButton(
      860,
      36,
      150,
      42,
      "월드맵",
      0x284f39,
      () =>
        void startRegisteredScene(this, "WorldMapScene", { user: this.user, save: this.save }),
      10,
    );
  }

  private drawResourceBar(): void {
    const panel = this.textures.exists("ui-forge-resource-panel-v36")
      ? this.add
          .image(492, 91, "ui-forge-resource-panel-v36")
          .setDisplaySize(842, 50)
      : this.add
          .rectangle(492, 91, 842, 50, 0x172131, 0.92)
          .setStrokeStyle(2, 0xffef9a, 0.25);
    panel.setDepth(8);
    this.add
      .text(102, 91, `유물 가루  ${this.inventory.relicDust}`, {
        fontSize: readableFontSize(18, 18, 25),
        color: "#fff4c2",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(12);
    this.add
      .text(326, 91, `왕실 토큰  ${this.inventory.royalTokens}`, {
        fontSize: readableFontSize(18, 18, 25),
        color: "#dbe7ff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(12);
    this.add
      .text(560, 91, `개봉한 보급 상자  ${this.inventory.openedChests}`, {
        fontSize: readableFontSize(18, 18, 25),
        color: "#ffef9a",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(12);
  }

  private drawEquipSlots(): void {
    this.add
      .text(702, 132, "장착 슬롯", {
        fontSize: "20px",
        color: "#ffe28a",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(12);
    SLOT_X.forEach((x, slot) => {
      const bg = this.add
        .rectangle(x, 179, 70, 70, 0x101722, 0.94)
        .setStrokeStyle(2, 0xffef9a, 0.25)
        .setDepth(12);
      const equipped = Object.values(this.inventory.artifacts).find(
        (item) => item?.equippedSlot === slot,
      );
      if (equipped)
        createArtifactIcon(this, x, 179, equipped.id, 54).setDepth(14);
      else
        this.add
          .text(x, 179, `${slot + 1}`, {
            fontSize: "24px",
            color: "#516070",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setDepth(14);
      bg.setInteractive({ useHandCursor: true }).on("pointerdown", () =>
        this.tryEquip(slot),
      );
    });
  }

  private renderArtifactList(): void {
    this.listRoot.removeAll(true);
    this.add
      .text(60, 132, "유물 컬렉션", {
        fontSize: "20px",
        color: "#ffe28a",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(20);
    ARTIFACTS.forEach((artifact, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 89 + col * 128;
      const y = 188 + row * 82;
      const owned = this.inventory.artifacts[artifact.id];
      const shards = this.inventory.artifactShards[artifact.id] ?? 0;
      const selected = this.selectedId === artifact.id;
      const card = this.add
        .rectangle(x, y, 112, 68, 0x131d2b, owned ? 0.96 : 0.62)
        .setStrokeStyle(
          selected ? 3 : 2,
          selected ? 0xffef9a : artifactRarityColor(artifact.rarity),
          selected ? 0.82 : 0.36,
        )
        .setInteractive({ useHandCursor: true });
      card.on("pointerdown", () => {
        playSfx(this, "sfx_click");
        this.selectedId = artifact.id;
        this.renderArtifactList();
        this.renderDetail();
      });
      const icon = createArtifactIcon(this, x - 34, y - 4, artifact.id, 42);
      const name = this.add
        .text(x + 8, y - 17, artifact.name, {
          fontSize: readableFontSize(12, 14, 19),
          color: "#fff4c2",
          fontStyle: "bold",
          wordWrap: { width: 58 },
        })
        .setOrigin(0.5);
      const meta = this.add
        .text(
          x + 8,
          y + 16,
          owned ? `Lv.${owned.level}` : `${shards}/${artifact.craftCost}`,
          {
            fontSize: readableFontSize(12, 14, 19),
            color: owned ? "#9ee37d" : "#dbe7ff",
            fontStyle: "bold",
          },
        )
        .setOrigin(0.5);
      this.listRoot.add([card, icon, name, meta]);
    });
  }

  private renderDetail(): void {
    this.detailRoot.removeAll(true);
    const def = getArtifactDefinition(this.selectedId);
    const owned = this.inventory.artifacts[this.selectedId];
    const shards = this.inventory.artifactShards[this.selectedId] ?? 0;
    const rarityColor = artifactRarityColor(def.rarity);

    const panel = this.textures.exists("ui-forge-detail-panel-v36")
      ? this.add
          .image(706, 344, "ui-forge-detail-panel-v36")
          .setDisplaySize(438, 260)
      : this.add
          .rectangle(706, 344, 438, 260, 0x111927, 0.96)
          .setStrokeStyle(3, rarityColor, 0.55);
    this.detailRoot.add(panel);
    this.detailRoot.add(createArtifactIcon(this, 520, 277, def.id, 76));
    this.detailRoot.add(
      this.add
        .text(574, 255, def.name, {
          fontSize: "26px",
          color: "#fff4c2",
          fontStyle: "bold",
          shadow: {
            offsetX: 0,
            offsetY: 3,
            color: "#000000",
            blur: 3,
            fill: true,
          },
        })
        .setOrigin(0, 0.5),
    );
    this.detailRoot.add(
      this.add
        .text(
          576,
          286,
          `${def.rarity.toUpperCase()} · ${artifactPowerLabel(owned, def)}`,
          { fontSize: readableFontSize(14, 15, 21), color: "#dbe7ff", fontStyle: "bold" },
        )
        .setOrigin(0, 0.5),
    );
    this.detailRoot.add(
      this.add
        .text(520, 329, def.description, {
          fontSize: readableFontSize(15, 16, 22),
          color: "#ffffff",
          wordWrap: { width: 365 },
          lineSpacing: 6,
        })
        .setOrigin(0, 0),
    );
    this.detailRoot.add(
      this.add
        .text(520, 397, `보유 파편: ${shards}`, {
          fontSize: readableFontSize(17, 17, 24),
          color: "#ffe28a",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5),
    );

    if (!owned) {
      this.makeButton(
        606,
        446,
        164,
        42,
        `제작 ${def.craftCost}`,
        0x2b6b55,
        () => this.doCraft(),
        24,
        this.detailRoot,
      );
    } else {
      const enhanceCost = `${def.enhanceBaseCost + owned.level * 8} 파편 / ${20 + owned.level * 12} 가루`;
      this.makeButton(
        606,
        446,
        164,
        42,
        `강화`,
        0x24486b,
        () => this.doEnhance(),
        24,
        this.detailRoot,
      );
      this.detailRoot.add(
        this.add
          .text(606, 477, enhanceCost, {
            fontSize: readableFontSize(12, 14, 19),
            color: "#dbe7ff",
            fontStyle: "bold",
          })
          .setOrigin(0.5),
      );
      this.makeButton(
        800,
        446,
        146,
        42,
        "선택 슬롯 장착",
        0x6b3f91,
        () => this.tryEquip(0),
        24,
        this.detailRoot,
      );
    }
  }

  private doCraft(): void {
    const result = craftArtifact(this.user?.uid, this.selectedId);
    this.inventory = result.inventory;
    this.showToast(result.message, result.ok);
    if (result.ok) {
      const def = getArtifactDefinition(this.selectedId);
      playArtifactForgeBurst(
        this,
        706,
        344,
        artifactRarityColor(def.rarity),
        result.message,
      );
      this.time.delayedCall(620, () =>
        this.scene.restart({ user: this.user, save: this.save }),
      );
    }
  }

  private doEnhance(): void {
    const result = enhanceArtifact(this.user?.uid, this.selectedId);
    this.inventory = result.inventory;
    this.showToast(result.message, result.ok);
    if (result.ok) {
      const def = getArtifactDefinition(this.selectedId);
      playArtifactForgeBurst(
        this,
        706,
        344,
        artifactRarityColor(def.rarity),
        result.message,
      );
      this.time.delayedCall(620, () =>
        this.scene.restart({ user: this.user, save: this.save }),
      );
    }
  }

  private tryEquip(slot: number): void {
    const result = equipArtifact(this.user?.uid, this.selectedId, slot);
    this.inventory = result.inventory;
    this.showToast(result.message, result.ok);
    if (result.ok) {
      const def = getArtifactDefinition(this.selectedId);
      playArtifactChestBounce(
        this,
        SLOT_X[slot] ?? 786,
        179,
        undefined,
        artifactRarityColor(def.rarity),
      );
      this.time.delayedCall(420, () =>
        this.scene.restart({ user: this.user, save: this.save }),
      );
    }
  }

  private makeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void,
    depth = 20,
    parent?: Phaser.GameObjects.Container,
  ): Phaser.GameObjects.Rectangle {
    const hitSize = readableHitSize(width, height);
    const rect = this.add
      .rectangle(x, y, hitSize.width, hitSize.height, color, 1)
      .setStrokeStyle(2, 0xffef9a, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);
    const shine = this.add
      .rectangle(x, y - height * 0.28, width - 16, 4, 0xffffff, 0.12)
      .setDepth(depth + 1);
    const text = this.add
      .text(x, y, label, {
        fontSize: readableFontSize(16, 16, 23),
        color: "#ffffff",
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: "#000000",
          blur: 1,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(depth + 2);
    rect.on("pointerdown", () => {
      playSfx(this, "sfx_click");
      onClick();
    });
    rect.on("pointerover", () => {
      rect.setAlpha(0.88);
      shine.setAlpha(0.22);
    });
    rect.on("pointerout", () => {
      rect.setAlpha(1);
      shine.setAlpha(0.12);
    });
    if (parent) parent.add([rect, shine, text]);
    return rect;
  }

  private showToast(message: string, ok = true): void {
    this.toastText
      .setText(message)
      .setColor(ok ? "#fff4c2" : "#ff9f9f")
      .setAlpha(1)
      .setY(506);
    this.tweens.add({
      targets: this.toastText,
      y: 492,
      alpha: 0,
      duration: 900,
      delay: 450,
      ease: "Cubic.easeIn",
    });
  }
}
