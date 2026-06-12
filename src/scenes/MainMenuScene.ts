import Phaser from "phaser";
import type { User } from "firebase/auth";
import { playMusicWhenReady, playSfx } from "../game/AudioManager";
import { STAGE_LIST } from "../game/balance";
import { addCoverImage } from "../game/CodeUiKit";
import { addHitZoneDebug } from "../game/HitZoneDebug";
import { addCuteLobbyAccents } from "../game/CuteFantasyPolishV216";
import { loadProgressiveArtBundle, warmProgressiveArtBundle } from "../game/ProgressiveAssetLoader";
import { clearTimer, safeDelayedCall } from "../game/SceneSafety";
import { markSceneTransition } from "../game/RuntimeLoadGovernor";
import { allowArtPrewarm, allowPremiumStaticArt, mobileUiScale, preferReducedMotion, useCumulativeArtLayers } from "../game/PerformanceMode";
import type { PlayerSave } from "../services/localSave";

type HotspotTone = "gold" | "blue" | "white" | "red" | "green";

type HotspotOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  tone?: HotspotTone;
  onClick: () => void;
};

const TONE_TINT: Record<HotspotTone, number> = {
  gold: 0xffd56c,
  blue: 0x62b8ff,
  white: 0xffffff,
  red: 0xff8a6c,
  green: 0x8be878,
};

export class MainMenuScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private isReady = false;
  private toastText?: Phaser.GameObjects.Text;
  private toastBack?: Phaser.GameObjects.Graphics;
  private toastHideTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("MainMenuScene");
  }

  init(data: { user?: User; save?: PlayerSave }): void {
    if (!data.user || !data.save) {
      this.isReady = false;
      return;
    }
    this.user = data.user;
    this.save = data.save;
    this.isReady = true;
  }

  create(): void {
    if (!this.isReady) {
      markSceneTransition("fallback-to-login");
      this.scene.start("MenuScene");
      return;
    }

    playMusicWhenReady(this, "bgm_world", 0.2);

    this.createIllustrationLedLobby();
    if (useCumulativeArtLayers()) this.installCumulativeLobbyArt();
    this.createV210CleanChrome();
    if (allowPremiumStaticArt("lobby")) this.installPremiumStaticLobbyArt();
    this.installProgressiveLobbyArt();
    this.createLobbyTextOverlay();
    this.createV26ExpansionShelf();
    this.createPremiumHitZones();
    this.createSmallStatusToast();
    this.installSceneCleanup();

    safeDelayedCall(this, 0, () => {
      window.dispatchEvent(
        new CustomEvent("kingdom-seed:scene-ready", {
          detail: { scene: "MainMenuScene", version: "2.34.0", at: Date.now() },
        }),
      );
    });
  }


  private installCumulativeLobbyArt(): void {
    addCuteLobbyAccents(this, this.save.nickname, this.save.stars);
    safeDelayedCall(this, 900, () => {
      if (!this.scene.isActive("MainMenuScene")) return;
      void Promise.all([
        import("../game/CuteFantasyArtV217"),
        import("../game/CuteFantasyArtV218"),
        import("../game/CuteFantasyArtV219"),
        import("../game/CuteFantasyArtV220"),
        import("../game/CuteFantasyArtV221"),
        import("../game/CuteFantasyArtV222"),
      ]).then(([v217, v218, v219, v220, v221, v222]) => {
        if (!this.scene.isActive("MainMenuScene")) return;
        v217.addV217LobbyArt(this, this.save.nickname, this.save.stars);
        v218.addV218LobbyArt(this, this.save.nickname, this.save.stars);
        v219.addV219LobbyArt(this, this.save.nickname, this.save.stars);
        v220.addV220LobbyArt(this, this.save.nickname, this.save.stars);
        v221.addV221LobbyArt(this, this.save.nickname, this.save.stars);
        v222.addV222LobbyArt(this, this.save.nickname, this.save.stars);
      }).catch((error) => console.warn("Cumulative lobby art skipped:", error));
    });
  }

  private installPremiumStaticLobbyArt(): void {
    safeDelayedCall(this, 1200, () => {
      if (!this.scene.isActive("MainMenuScene")) return;
      void import("../game/PremiumIllustrationArtV224")
        .then(({ addV224LobbyArt }) => {
          if (this.scene.isActive("MainMenuScene")) addV224LobbyArt(this, this.save.nickname, this.save.stars);
        })
        .catch((error) => console.warn("Premium lobby art skipped:", error));
    });
  }

  private installProgressiveLobbyArt(): void {
    loadProgressiveArtBundle(this, "lobby", () => {
      if (!this.scene.isActive("MainMenuScene")) return;
      void Promise.all([
        import("../game/PremiumIllustrationArtV225"),
        import("../game/PremiumIllustrationArtV226"),
        import("../game/PremiumIllustrationArtV227"),
      ]).then(([v225, v226, v227]) => {
        if (!this.scene.isActive("MainMenuScene")) return;
        v225.addV225LobbyArt(this, this.save.nickname, this.save.stars);
        v226.addV226LobbyArt(this, this.save.nickname, this.save.stars);
        v227.addV227LobbyArt(this, this.save.nickname, this.save.stars);
        if (allowArtPrewarm()) warmProgressiveArtBundle(this, "world", { delayMs: 5200 });
      }).catch((error) => console.warn("Progressive lobby art skipped:", error));
    }, { delayMs: 760 });
  }

  private createV210CleanChrome(): void {
    const addAsset = (
      key: string,
      x: number,
      y: number,
      w: number,
      h: number,
      depth = 7,
    ): boolean => {
      if (!this.textures.exists(key)) return false;
      this.add
        .image(x, y, key)
        .setDisplaySize(w, h)
        .setDepth(depth)
        .setAlpha(0.96);
      return true;
    };

    const nav = this.add.graphics().setDepth(6);
    nav.fillStyle(0x06142c, 0.3).fillRoundedRect(132, 472, 696, 46, 22);
    nav.lineStyle(1, 0xffdc82, 0.28).strokeRoundedRect(132, 472, 696, 46, 22);
    nav.lineStyle(1, 0x9fe8ff, 0.15).strokeRoundedRect(144, 478, 672, 34, 18);

    [
      [208, 501, 158, 38],
      [480, 501, 184, 44],
      [752, 501, 158, 38],
    ].forEach(([x, y, w, h]) =>
      addAsset(
        "v2-lobby-side-button-v210",
        Number(x),
        Number(y),
        Number(w),
        Number(h),
        8,
      ),
    );

    [
      [86, 270],
      [86, 322],
      [86, 374],
      [86, 426],
      [86, 478],
      [858, 135],
      [858, 194],
      [858, 253],
      [858, 313],
      [858, 373],
    ].forEach(([x, y]) =>
      addAsset("v2-lobby-side-button-v210", Number(x), Number(y), 112, 34, 8),
    );

    [
      [500, 35],
      [638, 35],
      [770, 35],
    ].forEach(([x, y]) =>
      addAsset("v2-resource-pill-v210", Number(x), Number(y), 108, 28, 8),
    );

    const profile = this.add.graphics().setDepth(7);
    profile.fillStyle(0x071c3e, 0.48).fillRoundedRect(32, 164, 146, 50, 17);
    profile
      .lineStyle(1, 0x9fe8ff, 0.32)
      .strokeRoundedRect(32, 164, 146, 50, 17);
  }

  private createIllustrationLedLobby(): void {
    const key = this.textures.exists("v1-main-menu-splash-v18")
      ? "v1-main-menu-splash-v18"
      : this.textures.exists("v1-main-menu-splash")
        ? "v1-main-menu-splash"
        : "v1-main-menu-bg";
    addCoverImage(this, key, 960, 540, 0);

    const topGlow = this.add
      .rectangle(480, 3, 950, 12, 0xc6efff, 0.18)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);
    const bottomGlow = this.add
      .ellipse(480, 518, 600, 44, 0x90d7ff, 0.12)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);

    if (!preferReducedMotion()) {
      this.tweens.add({
        targets: topGlow,
        alpha: 0.3,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.tweens.add({
        targets: bottomGlow,
        alpha: 0.22,
        scaleX: 1.02,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private createLobbyTextOverlay(): void {
    const uiScale = mobileUiScale();
    const fs = (size: number): string => `${Math.round(size * uiScale)}px`;
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif",
      color: "#f7fbff",
      fontStyle: "bold",
      stroke: "#12366d",
      strokeThickness: 2,
      align: "center",
    };

    const addLabel = (
      x: number,
      y: number,
      text: string,
      size = 13,
      width = 128,
    ): void => {
      this.add
        .text(x, y, text, {
          ...labelStyle,
          fontSize: fs(Math.max(13, size + 2)),
          fixedWidth: width,
        })
        .setOrigin(0.5)
        .setDepth(9);
    };

    addLabel(208, 501, "월드맵", 14, 172);
    addLabel(480, 500, "전투", 17, 204);
    addLabel(752, 501, "모험", 14, 172);

    [
      ["상점", 86, 270],
      ["영웅", 86, 322],
      ["도감", 86, 374],
      ["우편함", 86, 426],
      ["이벤트", 86, 478],
      ["퀘스트", 858, 135],
      ["패스", 858, 194],
      ["길드", 858, 253],
      ["랭킹", 858, 313],
      ["설정", 858, 373],
    ].forEach(([text, x, y]) =>
      addLabel(Number(x), Number(y), String(text), 12, 122),
    );

    this.add
      .text(500, 35, `⭐ ${this.save.stars}`, {
        ...labelStyle,
        fontSize: fs(13),
        fixedWidth: 136,
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.add
      .text(638, 35, "재화", {
        ...labelStyle,
        fontSize: fs(13),
        fixedWidth: 136,
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.add
      .text(770, 35, "보석", {
        ...labelStyle,
        fontSize: fs(13),
        fixedWidth: 136,
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.add
      .text(105, 189, `${this.save.nickname}`, {
        ...labelStyle,
        fontSize: fs(13),
        fixedWidth: 164,
      })
      .setOrigin(0.5)
      .setDepth(9);
  }

  private createV26ExpansionShelf(): void {
    const cards = [
      {
        x: 320,
        title: "원정 9-12",
        sub: "신규 지역 개방",
        tone: 0x8fdcff,
        onClick: () => this.goWorldMap(),
      },
      {
        x: 480,
        title: "웨이브 변수",
        sub: "보급 · 정예 · 폭풍",
        tone: 0xffd56c,
        onClick: () =>
          this.showToast("전투 중 웨이브 변수가 자동으로 등장합니다."),
      },
      {
        x: 640,
        title: "연합 시너지",
        sub: "타워 조합 보너스",
        tone: 0x8be878,
        onClick: () => this.quickBattle(),
      },
    ];
    cards.forEach((card) => {
      const c = this.add.container(card.x, 414).setDepth(16);
      const bg = this.textures.exists("v2-lobby-strategy-card-v210")
        ? this.add
            .image(0, 0, "v2-lobby-strategy-card-v210")
            .setDisplaySize(168, 64)
        : this.textures.exists("v2-strategy-card")
          ? this.add.image(0, 0, "v2-strategy-card").setDisplaySize(168, 64)
          : this.add
              .rectangle(0, 0, 168, 64, 0x071c3e, 0.62)
              .setStrokeStyle(1, card.tone, 0.55);
      const sparkle = this.add
        .circle(-52, -8, 9, card.tone, 0.35)
        .setStrokeStyle(1, 0xffffff, 0.35)
        .setBlendMode(Phaser.BlendModes.ADD);
      const title = this.add
        .text(-34, -11, card.title, {
          fontSize: "14px",
          color: "#fff7d6",
          fontStyle: "bold",
          fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
          stroke: "#12366d",
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5);
      const sub = this.add
        .text(-34, 10, card.sub, {
          fontSize: "12px",
          color: "#dbe7ff",
          fontStyle: "bold",
          fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
          fixedWidth: 98,
        })
        .setOrigin(0, 0.5);
      const hit = this.add
        .zone(0, 0, 168, 64)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerdown", card.onClick);
      hit.on("pointerover", () =>
        this.tweens.add({
          targets: c,
          scale: 1.035,
          duration: 100,
          ease: "Sine.easeOut",
        }),
      );
      hit.on("pointerout", () =>
        this.tweens.add({
          targets: c,
          scale: 1,
          duration: 100,
          ease: "Sine.easeOut",
        }),
      );
      c.add([bg, sparkle, title, sub, hit]);
      addHitZoneDebug(this, c, 168, 64, card.title, card.tone, 18);
    });
  }

  private createPremiumHitZones(): void {
    // Bottom primary navigation from the baked premium lobby art.
    this.addHotspot({
      x: 208,
      y: 502,
      width: 188,
      height: 54,
      radius: 28,
      tone: "blue",
      onClick: () => this.goWorldMap(),
    });
    this.addHotspot({
      x: 480,
      y: 501,
      width: 220,
      height: 60,
      radius: 32,
      tone: "gold",
      onClick: () => this.quickBattle(),
    });
    this.addHotspot({
      x: 752,
      y: 502,
      width: 188,
      height: 54,
      radius: 28,
      tone: "blue",
      onClick: () => this.goScene("MissionBoardScene"),
    });

    // Left vertical lobby buttons.
    this.addHotspot({
      x: 86,
      y: 271,
      width: 132,
      height: 48,
      radius: 24,
      tone: "white",
      onClick: () => this.showToast("상점은 원화급 상점 패스에서 연결합니다."),
    });
    this.addHotspot({
      x: 86,
      y: 323,
      width: 132,
      height: 48,
      radius: 24,
      tone: "blue",
      onClick: () => this.goScene("HeroHallScene"),
    });
    this.addHotspot({
      x: 86,
      y: 375,
      width: 132,
      height: 48,
      radius: 24,
      tone: "gold",
      onClick: () => this.goScene("CodexScene"),
    });
    this.addHotspot({
      x: 86,
      y: 428,
      width: 132,
      height: 48,
      radius: 24,
      tone: "white",
      onClick: () => this.showToast("우편함은 보상/출석 패스에서 연결합니다."),
    });
    this.addHotspot({
      x: 86,
      y: 480,
      width: 132,
      height: 48,
      radius: 24,
      tone: "red",
      onClick: () => this.goScene("MissionBoardScene"),
    });

    // Right vertical lobby buttons.
    this.addHotspot({
      x: 858,
      y: 135,
      width: 136,
      height: 50,
      radius: 25,
      tone: "white",
      onClick: () => this.goScene("MissionBoardScene"),
    });
    this.addHotspot({
      x: 858,
      y: 194,
      width: 136,
      height: 50,
      radius: 25,
      tone: "gold",
      onClick: () =>
        this.showToast("패스 화면은 다음 원화급 UI 패스에서 제작합니다."),
    });
    this.addHotspot({
      x: 858,
      y: 253,
      width: 136,
      height: 50,
      radius: 25,
      tone: "blue",
      onClick: () => this.showToast("길드 화면은 추후 연결합니다."),
    });
    this.addHotspot({
      x: 858,
      y: 313,
      width: 136,
      height: 50,
      radius: 25,
      tone: "white",
      onClick: () =>
        this.showToast("랭킹은 월드맵 명예의 전당에서 먼저 확인하세요."),
    });
    this.addHotspot({
      x: 858,
      y: 373,
      width: 136,
      height: 50,
      radius: 25,
      tone: "blue",
      onClick: () =>
        this.showToast("설정 메뉴는 별도 팝업으로 분리 예정입니다."),
    });

    // Top resource buttons / hamburger. They stay interactive even though the visual is baked into the asset.
    this.addHotspot({
      x: 440,
      y: 35,
      width: 126,
      height: 40,
      radius: 20,
      tone: "gold",
      onClick: () => this.showToast(`보유 별 ${this.save.stars}개`),
    });
    this.addHotspot({
      x: 570,
      y: 35,
      width: 126,
      height: 40,
      radius: 20,
      tone: "gold",
      onClick: () =>
        this.showToast("골드/재화 상세 패널은 상점 패스에서 연결합니다."),
    });
    this.addHotspot({
      x: 704,
      y: 35,
      width: 126,
      height: 40,
      radius: 20,
      tone: "blue",
      onClick: () => this.showToast("보석 재화는 상점 패스에서 연결합니다."),
    });
    this.addHotspot({
      x: 907,
      y: 36,
      width: 46,
      height: 46,
      radius: 26,
      tone: "white",
      onClick: () => this.showToast("메뉴 설정은 다음 패치에서 팝업화합니다."),
    });

    // Profile card hotspot.
    this.addHotspot({
      x: 105,
      y: 189,
      width: 158,
      height: 58,
      radius: 20,
      tone: "blue",
      onClick: () => this.goScene("HeroHallScene"),
    });
  }

  private addHotspot(options: HotspotOptions): void {
    const radius =
      options.radius ?? Math.min(options.width, options.height) / 2;
    const tint = TONE_TINT[options.tone ?? "white"];
    const c = this.add.container(options.x, options.y).setDepth(50);

    const hover = this.add.graphics();
    hover.fillStyle(tint, 0.16);
    hover.fillRoundedRect(
      -options.width / 2,
      -options.height / 2,
      options.width,
      options.height,
      radius,
    );
    hover.lineStyle(2, 0xffffff, 0.52);
    hover.strokeRoundedRect(
      -options.width / 2 + 1,
      -options.height / 2 + 1,
      options.width - 2,
      options.height - 2,
      Math.max(4, radius - 1),
    );
    hover.setAlpha(0);

    const glint = this.add
      .rectangle(
        -options.width * 0.18,
        -options.height * 0.28,
        options.width * 0.52,
        Math.max(5, options.height * 0.16),
        0xffffff,
        0.2,
      )
      .setRotation(-0.09)
      .setAlpha(0);

    const hit = this.add
      .zone(0, 0, options.width, options.height)
      .setInteractive({ useHandCursor: true });
    c.add([hover, glint, hit]);
    addHitZoneDebug(
      this,
      c,
      options.width,
      options.height,
      `hotspot ${Math.round(options.x)},${Math.round(options.y)}`,
      tint,
      radius,
    );

    hit.on("pointerover", () => {
      this.tweens.add({
        targets: hover,
        alpha: 1,
        duration: 115,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: glint,
        alpha: 1,
        x: options.width * 0.18,
        duration: 180,
        ease: "Sine.easeOut",
      });
    });

    hit.on("pointerout", () => {
      this.tweens.add({
        targets: hover,
        alpha: 0,
        duration: 120,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: glint,
        alpha: 0,
        x: -options.width * 0.18,
        duration: 120,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: c,
        scaleX: 1,
        scaleY: 1,
        duration: 80,
        ease: "Sine.easeOut",
      });
    });

    hit.on("pointerdown", () => {
      this.tweens.add({
        targets: c,
        scaleX: 0.985,
        scaleY: 0.985,
        duration: 50,
        yoyo: true,
        ease: "Quad.easeOut",
      });
      options.onClick();
    });
  }

  private createSmallStatusToast(): void {
    this.toastBack = this.add.graphics().setDepth(80);
    this.toastBack.setAlpha(0);
    this.toastText = this.add
      .text(480, 459, `${this.save.nickname} 지휘관님, 왕국 방어 준비 완료`, {
        fontSize: "11px",
        color: "#f8fbff",
        fontFamily: "Inter, Pretendard, Noto Sans KR, Arial, sans-serif",
        fontStyle: "bold",
        align: "center",
        stroke: "#17366c",
        strokeThickness: 2,
        fixedWidth: 420,
      })
      .setOrigin(0.5)
      .setDepth(81)
      .setAlpha(0);

    safeDelayedCall(this, 450, () => {
      this.showToast(
        `${this.save.nickname} 지휘관님, 왕국 방어 준비 완료`,
        1700,
        false,
      );
    });
  }

  private showToast(message: string, holdMs = 1500, withSfx = true): void {
    if (!this.scene.isActive("MainMenuScene")) return;
    if (withSfx) playSfx(this, "sfx_click");
    if (!this.toastBack || !this.toastText) return;

    this.toastBack.clear();
    this.toastBack.fillStyle(0x071c3e, 0.66);
    this.toastBack.fillRoundedRect(276, 441, 408, 36, 18);
    this.toastBack.lineStyle(2, 0xffdc82, 0.6);
    this.toastBack.strokeRoundedRect(276, 441, 408, 36, 18);
    this.toastBack.lineStyle(1, 0xffffff, 0.28);
    this.toastBack.strokeRoundedRect(281, 446, 398, 26, 13);

    this.toastText.setText(message);
    this.toastHideTimer = clearTimer(this.toastHideTimer);
    this.tweens.killTweensOf([this.toastBack, this.toastText]);
    this.toastBack.setAlpha(0);
    this.toastText.setAlpha(0).setY(463);
    this.tweens.add({
      targets: [this.toastBack, this.toastText],
      alpha: 1,
      duration: 130,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: this.toastText,
      y: 459,
      duration: 180,
      ease: "Back.easeOut",
    });
    this.toastHideTimer = safeDelayedCall(this, holdMs, () => {
      if (!this.toastBack || !this.toastText) return;
      this.tweens.add({
        targets: [this.toastBack, this.toastText],
        alpha: 0,
        duration: 220,
        ease: "Sine.easeIn",
      });
      this.toastHideTimer = undefined;
    });
  }

  private installSceneCleanup(): void {
    const cleanup = (): void => {
      this.toastHideTimer = clearTimer(this.toastHideTimer);
      this.tweens.killTweensOf([this.toastBack, this.toastText]);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  private goScene(sceneKey: string): void {
    if (!this.scene.isActive("MainMenuScene")) return;
    playSfx(this, "sfx_click");
    markSceneTransition(`lobby-to-${sceneKey}`);
    this.scene.start(sceneKey, { user: this.user, save: this.save });
  }

  private goWorldMap(): void {
    this.goScene("WorldMapScene");
  }

  private quickBattle(): void {
    if (!this.scene.isActive("MainMenuScene")) return;
    playSfx(this, "sfx_click");
    const playable = STAGE_LIST.reduce((best, stage) => {
      if (
        !stage.unlockRequires ||
        this.save.clearedStages[stage.unlockRequires]?.bestStars
      )
        return stage;
      return best;
    }, STAGE_LIST[0]);
    markSceneTransition("lobby-to-battle");
    this.scene.start("GameScene", {
      user: this.user,
      save: this.save,
      stageId: playable.id,
    });
  }
}
