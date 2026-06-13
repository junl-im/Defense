import Phaser from "phaser";
import type { User } from "firebase/auth";
import { playSfx } from "../game/AudioManager";
import { addCoverImage } from "../game/CodeUiKit";
import { addHitZoneDebug } from "../game/HitZoneDebug";
import { safeDelayedCall } from "../game/SceneSafety";
import {
  markSceneTransition,
  noteOptionalWorkBlocked,
  optionalRuntimeWorkAllowed,
  pauseOptionalWork,
} from "../game/RuntimeLoadGovernor";
import { startRegisteredScene, warmMenuFlowScenes } from "./SceneRegistry";
import { KINGDOM_SEED_BUILD_NAME } from "../runtime/Version";
import {
  addLoginPrestigePlate,
  addPrestigeSceneVignette,
  addStaticSignalSweep,
  PRESTIGE_SCENE_FONT,
  usePrestigeSceneFrame,
} from "../game/PrestigeSceneFrame";
import {
  createInstantLocalSession,
  type PlayerSave,
} from "../services/localSave";
import { installSceneReadabilityPass, improveReadableTextTree, readableFontSize, readableHitSize } from "../game/MobileReadableUi";
import { installSceneGraphicFallback } from "../game/PrestigeGraphicFallback";

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private currentUser: User | null = null;
  private currentSave: PlayerSave | null = null;
  private isTransitioning = false;
  private firebaseServicePromise?: Promise<typeof import("../services/firebase")>;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.children.removeAll(true);
    this.isTransitioning = false;
    this.cameras.main.setBackgroundColor("#8fd5ff");

    this.createCinematicSplash();
    installSceneGraphicFallback(this, "login", 3.2);
    addPrestigeSceneVignette(this, "login", 4);
    addLoginPrestigePlate(this);
    addStaticSignalSweep(this, 480, 282, 320, 32);
    this.createStatusOverlay();
    this.createLoginHitZones();
    this.createUtilityHitZones();
    installSceneReadabilityPass(this, { min: 15, strokeThickness: 3 });
    // v2.35.6: 첫 로그인 화면 직후에는 무거운 씬 프리워밍을 바로 시작하지 않는다.
    // RuntimeLoadGovernor가 허용할 때만 MainMenu/WorldMap 코드를 조용히 예열한다.
    warmMenuFlowScenes(this, 2600);

    safeDelayedCall(this, 0, () => {
      window.dispatchEvent(
        new CustomEvent("kingdom-seed:scene-ready", {
          detail: { scene: "MenuScene", version: "2.35.4", at: Date.now() },
        }),
      );
    });

    safeDelayedCall(this, 7800, () => void this.bootstrapRedirectOrExistingUser());
  }

  private getFirebaseService(): Promise<typeof import("../services/firebase")> {
    this.firebaseServicePromise ??= import("../services/firebase");
    return this.firebaseServicePromise;
  }

  private createCinematicSplash(): void {
    const bgKey = this.textures.exists("v1-login-clean-bg")
      ? "v1-login-clean-bg"
      : "v1-login-polished";
    addCoverImage(this, bgKey, 960, 540, 0);

    const topFade = this.add.graphics().setDepth(2);
    topFade.fillGradientStyle(
      0x000000,
      0x000000,
      0x000000,
      0x000000,
      0.24,
      0.24,
      0,
      0,
    );
    topFade.fillRect(0, 0, 960, 126);

    const logoKey = this.textures.exists("v1-title-logo-clean")
      ? "v1-title-logo-clean"
      : "ui-title-logo";
    this.add.image(480, 94, logoKey).setDisplaySize(300, 108).setDepth(10);

    if (this.textures.exists("v1-login-panel-v18")) {
      this.add
        .image(480, 348, "v1-login-panel-v18")
        .setDisplaySize(374, 252)
        .setDepth(20);
    } else {
      const fallback = this.add.graphics().setDepth(20);
      fallback
        .fillStyle(0xf6fbff, 0.92)
        .fillRoundedRect(265, 232, 430, 300, 28);
      fallback
        .lineStyle(4, 0xf1c46a, 0.9)
        .strokeRoundedRect(265, 232, 430, 300, 28);
    }

    this.add
      .text(480, 251, "DEFENSE COMMAND", {
        fontSize: usePrestigeSceneFrame() ? "17px" : "16px",
        color: usePrestigeSceneFrame() ? "#fff2c8" : "#f8fbff",
        align: "center",
        fixedWidth: 320,
        fontFamily:
          PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
        stroke: "#17366c",
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 3,
          color: "#0a2d6a",
          blur: 4,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.add
      .text(480, 273, "전술 정원 방어 작전 · 빠른 시작 우선", {
        fontSize: usePrestigeSceneFrame() ? "10px" : "9px",
        color: usePrestigeSceneFrame() ? "#c7d5ee" : "#8298b8",
        align: "center",
        fixedWidth: 320,
        fontFamily:
          PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
        stroke: usePrestigeSceneFrame() ? "#050b16" : "#ffffff",
        strokeThickness: usePrestigeSceneFrame() ? 3 : 2,
      })
      .setOrigin(0.5)
      .setDepth(31);

    const bottomGlow = this.add
      .ellipse(480, 526, 520, 42, 0x8cdcff, 0.08)
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);
    // v2.29: keep the first connection screen visually stable and lightweight.
    // The original soft glow is static here to avoid startup tween overhead on weak phones.
    bottomGlow.setAlpha(0.12);
  }

  private createStatusOverlay(): void {
    const statusBack = this.add.graphics().setDepth(52);
    if (usePrestigeSceneFrame()) {
      statusBack.fillStyle(0x050b16, 0.78);
      statusBack.fillRoundedRect(338, 296, 284, 27, 13);
      statusBack.fillStyle(0xffd98a, 0.08);
      statusBack.fillRoundedRect(348, 302, 264, 6, 4);
      statusBack.lineStyle(1, 0xffdf9a, 0.35);
      statusBack.strokeRoundedRect(342, 298, 276, 23, 12);
      statusBack.lineStyle(1, 0x9bd7ff, 0.16);
      statusBack.strokeRoundedRect(349, 304, 262, 9, 5);
    } else {
      statusBack.fillStyle(0xf7fbff, 0.9);
      statusBack.fillRoundedRect(342, 298, 276, 23, 12);
      statusBack.lineStyle(2, 0xb9d4ef, 0.82);
      statusBack.strokeRoundedRect(342, 298, 276, 23, 12);
      statusBack.lineStyle(1, 0xffffff, 0.58);
      statusBack.strokeRoundedRect(349, 304, 262, 9, 5);
    }

    this.statusText = this.add
      .text(480, 309, "로그인 확인 중...", {
        fontSize: readableFontSize(10, 14, 18),
        color: usePrestigeSceneFrame() ? "#fff2c8" : "#2f5f9e",
        align: "center",
        fixedWidth: 260,
        fontFamily:
          PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(53);

    const chip = this.add.graphics().setDepth(53);
    chip.fillStyle(0x071c3e, 0.46).fillRoundedRect(16, 14, 214, 24, 14);
    chip.lineStyle(1, 0xffdc82, 0.45).strokeRoundedRect(16, 14, 214, 24, 14);
    this.add
      .text(123, 26, KINGDOM_SEED_BUILD_NAME, {
        fontSize: readableFontSize(8, 12, 16),
        color: "#f7fbff",
        fixedWidth: 204,
        align: "center",
        fontFamily: PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: "#08315f",
          blur: 3,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(54)
      .setAlpha(0.92);
  }

  private createLoginHitZones(): void {
    // v1.8: positions match the separated image buttons exactly.
    this.addLoginButton({
      x: 480,
      y: 346,
      width: 310,
      height: 58,
      imageKey: "v1-login-button-gold-v18",
      label: "빠른 시작",
      icon: usePrestigeSceneFrame() ? "START" : "⚔",
      color: "#174080",
      onClick: () => void this.startQuick(),
    });

    this.addLoginButton({
      x: 480,
      y: 394,
      width: 310,
      height: 58,
      imageKey: "v1-login-button-white-v18",
      label: "Google 로그인",
      icon: "G",
      color: "#315f9c",
      onClick: () => void this.startGoogle(),
    });

    this.addLoginButton({
      x: 413,
      y: 439,
      width: 148,
      height: 44,
      imageKey: "v1-login-button-small-v18",
      label: "이메일 로그인",
      icon: usePrestigeSceneFrame() ? "@" : "✉",
      color: "#315f9c",
      small: true,
      onClick: () => void this.startEmailLogin(),
    });

    this.addLoginButton({
      x: 547,
      y: 439,
      width: 148,
      height: 44,
      imageKey: "v1-login-button-small-v18",
      label: "회원가입",
      icon: usePrestigeSceneFrame() ? "+" : "♥",
      color: "#315f9c",
      small: true,
      onClick: () => void this.startEmailRegister(),
    });
  }

  private createUtilityHitZones(): void {
    const utilities = [
      {
        x: 818,
        label: "공지사항",
        icon: usePrestigeSceneFrame() ? "!" : "📣",
        message: "공지사항은 준비 중입니다.",
      },
      {
        x: 872,
        label: "고객센터",
        icon: usePrestigeSceneFrame() ? "?" : "🎧",
        message: "고객센터는 준비 중입니다.",
      },
      {
        x: 926,
        label: "설정",
        icon: usePrestigeSceneFrame() ? "SYS" : "⚙",
        message: "설정 메뉴는 다음 패치에서 연결합니다.",
      },
    ];
    utilities.forEach((item) =>
      this.addUtilityButton(item.x, 39, item.icon, item.label, () =>
        this.setUtilityStatus(item.message),
      ),
    );
  }

  private addLoginButton(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    imageKey: string;
    label: string;
    icon: string;
    color: string;
    small?: boolean;
    onClick: () => void;
  }): void {
    const c = this.add.container(options.x, options.y).setDepth(60);
    const image = this.textures.exists(options.imageKey)
      ? this.add
          .image(0, 0, options.imageKey)
          .setDisplaySize(options.width, options.height)
      : this.add
          .rectangle(0, 0, options.width, options.height, 0xffffff, 0.88)
          .setStrokeStyle(2, 0xdcae62, 0.9);
    const iconBubble = this.add
      .circle(
        -options.width / 2 + (options.small ? 24 : 32),
        0,
        options.small ? 15 : 18,
        usePrestigeSceneFrame() ? 0x111827 : 0xffffff,
        usePrestigeSceneFrame() ? 0.88 : 0.68,
      )
      .setStrokeStyle(1, usePrestigeSceneFrame() ? 0xffd98a : 0xd2aa66, usePrestigeSceneFrame() ? 0.82 : 0.7);
    const icon = this.add
      .text(iconBubble.x, 0, options.icon, {
        fontSize: usePrestigeSceneFrame() ? (options.small ? "12px" : "11px") : (options.small ? "15px" : "20px"),
        color: usePrestigeSceneFrame() ? "#ffe3a3" : (options.icon === "♥" ? "#dd506a" : "#2f6cb3"),
        fontFamily: PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const label = this.add
      .text(options.small ? 10 : 8, 0, options.label, {
        fontSize: usePrestigeSceneFrame() ? (options.small ? "14px" : "20px") : (options.small ? "13px" : "19px"),
        color: usePrestigeSceneFrame() ? "#fff1c4" : options.color,
        align: "center",
        fontFamily:
          PRESTIGE_SCENE_FONT,
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 2,
        fixedWidth: options.small ? 116 : 220,
      })
      .setOrigin(0.5);
    const hover = this.add.graphics();
    hover
      .fillStyle(0xffffff, 0.18)
      .fillRoundedRect(
        -options.width / 2 + 8,
        -options.height / 2 + 6,
        options.width - 16,
        Math.max(8, options.height * 0.24),
        options.height * 0.18,
      );
    hover.setAlpha(0);
    const hitSize = readableHitSize(options.width + 26, Math.max(options.height + 14, 56));
    const hit = this.add
      .zone(0, 0, hitSize.width, hitSize.height)
      .setInteractive({ useHandCursor: true });
    c.add([image, iconBubble, icon, label, hover, hit]);
    improveReadableTextTree(c, { min: options.small ? 15 : 16, strokeThickness: 3 });
    addHitZoneDebug(
      this,
      c,
      options.width + 26,
      Math.max(options.height + 14, 56),
      options.label,
      options.small ? 0x7cc7ff : 0xffd56c,
      Math.min(22, Math.max(options.height + 14, 56) / 2),
    );
    this.wireButtonHit(c, hover, hit, options.onClick);
  }

  private addUtilityButton(
    x: number,
    y: number,
    iconText: string,
    labelText: string,
    onClick: () => void,
  ): void {
    const c = this.add.container(x, y).setDepth(60);
    const image = this.textures.exists("v1-login-utility-button-v18")
      ? this.add
          .image(0, 0, "v1-login-utility-button-v18")
          .setDisplaySize(38, 38)
      : this.add
          .circle(0, 0, 24, 0x1e5bb6, 0.9)
          .setStrokeStyle(2, 0xffdc82, 0.8);
    const icon = this.add
      .text(0, -2, iconText, {
        fontSize: usePrestigeSceneFrame() ? "11px" : "18px",
        color: usePrestigeSceneFrame() ? "#ffe3a3" : "#ffffff",
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        fontStyle: "bold",
        stroke: "#17366c",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const label = this.add
      .text(0, 30, labelText, {
        fontSize: readableFontSize(9, 13, 17),
        color: "#f8fbff",
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        fontStyle: "bold",
        stroke: "#17366c",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    const hover = this.add
      .circle(0, 0, 26, 0xffffff, 0.16)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const utilityHit = readableHitSize(40, 48);
    const hit = this.add
      .zone(0, 0, utilityHit.width, utilityHit.height)
      .setInteractive({ useHandCursor: true });
    c.add([image, hover, icon, label, hit]);
    improveReadableTextTree(c, { min: 14, strokeThickness: 3 });
    addHitZoneDebug(this, c, 40, 48, labelText, 0x7cc7ff, 18);
    this.wireButtonHit(c, hover, hit, onClick);
  }

  private wireButtonHit(
    container: Phaser.GameObjects.Container,
    hover: Phaser.GameObjects.GameObject & { alpha: number },
    hit: Phaser.GameObjects.Zone,
    onClick: () => void,
  ): void {
    hit.on("pointerover", () => {
      this.tweens.add({
        targets: hover,
        alpha: 1,
        duration: 120,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: container,
        scaleX: 1.018,
        scaleY: 1.018,
        duration: 120,
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
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 90,
        ease: "Sine.easeOut",
      });
    });
    hit.on("pointerdown", () => {
      if (this.isTransitioning) return;
      this.tweens.add({
        targets: container,
        scaleX: 0.982,
        scaleY: 0.982,
        duration: 52,
        yoyo: true,
        ease: "Quad.easeOut",
      });
      onClick();
    });
  }

  private setUtilityStatus(message: string): void {
    playSfx(this, "sfx_click");
    if (this.statusText) {
      this.statusText.setText(message);
    }
  }

  private async bootstrapRedirectOrExistingUser(retry = 0): Promise<void> {
    if (this.isTransitioning) return;
    if (!optionalRuntimeWorkAllowed("firebase", { scene: this, allowDuringBoot: false })) {
      noteOptionalWorkBlocked("firebase", "login-bootstrap");
      if (retry < 3) {
        const delay = 5200 + retry * 3600;
        safeDelayedCall(this, delay, () => void this.bootstrapRedirectOrExistingUser(retry + 1));
      } else if (this.statusText?.active) {
        this.statusText.setText("빠른 시작 가능 · 계정 확인은 로그인 버튼을 누를 때 진행합니다.");
      }
      return;
    }

    try {
      const {
        completePendingRedirectSignIn,
        loadOrCreateSave,
        waitForUser,
      } = await this.getFirebaseService();
      const redirectUser = await completePendingRedirectSignIn(360);
      const existing = redirectUser ?? (await waitForUser(360));
      if (!this.scene.isActive("MenuScene") || !this.statusText?.active) return;
      if (!existing) {
        this.statusText.setText("빠른 시작은 즉시 입장, 계정 연결은 뒤에서 준비됩니다.");
        return;
      }
      this.currentUser = existing;
      this.currentSave = await loadOrCreateSave(existing, {
        timeoutMs: 420,
        allowLocalFallback: true,
      });
      if (!this.scene.isActive("MenuScene") || !this.statusText?.active) return;
      this.statusText.setText(
        `${this.currentSave.nickname} 기록 준비 완료. 바로 시작할 수 있어요!`,
      );
    } catch (error) {
      console.warn("Deferred Firebase bootstrap skipped:", error);
      if (this.scene.isActive("MenuScene") && this.statusText?.active)
        this.statusText.setText("빠른 시작 가능 · 계정 연결은 필요할 때 다시 시도합니다.");
    }
  }

  private startQuick(): void {
    if (this.currentUser && this.currentSave) {
      playSfx(this, "sfx_click");
      this.enterMainMenu(this.currentUser, this.currentSave);
      return;
    }

    playSfx(this, "sfx_click");
    if (this.statusText?.active)
      this.statusText.setText("네트워크 대기 없이 바로 입장합니다.");
    const session = createInstantLocalSession();
    this.enterMainMenu(session.user, session.save);

    window.setTimeout(() => {
      if (!optionalRuntimeWorkAllowed("firebase", { allowDuringBoot: false })) {
        noteOptionalWorkBlocked("firebase", "quick-start-background-sync");
        pauseOptionalWork("quick-start-local-first", 3600);
        return;
      }
      void this.getFirebaseService()
        .then(({ ensureQuickStartSession }) => ensureQuickStartSession(360))
        .catch((error) => console.warn("Background quick-start cloud sync skipped:", error));
    }, 9200);
  }

  private async startGoogle(): Promise<void> {
    await this.withLoading(async () => {
      const { loadOrCreateSave, loginWithGoogle } = await this.getFirebaseService();
      const user = await loginWithGoogle();
      if (!user) {
        this.statusText.setText("Google 이동 중...");
        return;
      }
      const save = await loadOrCreateSave(user, { timeoutMs: 900, allowLocalFallback: true });
      this.enterMainMenu(user, save);
    });
  }

  private async startEmailLogin(): Promise<void> {
    const email = window.prompt("이메일을 입력하세요.");
    if (!email) return;
    const password = window.prompt("비밀번호를 입력하세요.");
    if (!password) return;

    await this.withLoading(async () => {
      const { loadOrCreateSave, loginWithEmail } = await this.getFirebaseService();
      const user = await loginWithEmail(email, password);
      const save = await loadOrCreateSave(user, { timeoutMs: 900, allowLocalFallback: true });
      this.enterMainMenu(user, save);
    });
  }

  private async startEmailRegister(): Promise<void> {
    const email = window.prompt("가입할 이메일을 입력하세요.");
    if (!email) return;
    const password = window.prompt("비밀번호를 입력하세요. 6자 이상 권장");
    if (!password) return;

    await this.withLoading(async () => {
      const { loadOrCreateSave, registerWithEmail } = await this.getFirebaseService();
      const user = await registerWithEmail(email, password);
      const save = await loadOrCreateSave(user, { timeoutMs: 900, allowLocalFallback: true });
      this.enterMainMenu(user, save);
    });
  }

  private async withLoading(
    task: () => Promise<void>,
    label = "계정 연결 중...",
  ): Promise<void> {
    try {
      playSfx(this, "sfx_click");
      if (this.statusText?.active) this.statusText.setText(label);
      await task();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "알 수 없는 오류";
      if (this.scene.isActive("MenuScene") && this.statusText?.active)
        this.statusText.setText(`실패: ${message}`);
    }
  }

  private enterMainMenu(user: User, save: PlayerSave): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    if (this.statusText?.active) this.statusText.setText("로비 코드를 여는 중...");
    this.cameras.main.fadeOut(120, 255, 255, 255);
    safeDelayedCall(this, 120, () => {
      markSceneTransition("menu-to-lobby");
      void startRegisteredScene(this, "MainMenuScene", { user, save }).catch(
        (error) => {
          console.error("Main menu scene registration failed:", error);
          this.isTransitioning = false;
          if (this.scene.isActive("MenuScene") && this.statusText?.active)
            this.statusText.setText("로비 로딩에 실패했습니다. 다시 시도해주세요.");
        },
      );
    });
  }
}
