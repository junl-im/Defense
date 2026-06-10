import Phaser from "phaser";

export type PremiumButtonState = "idle" | "hover" | "pressed" | "disabled";

export class PremiumMicroInteractions {
  static press(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & { scale?: number; setScale?: (value: number) => unknown }): void {
    const baseScale = typeof target.scale === "number" ? target.scale : 1;
    if (typeof target.setScale !== "function") return;

    scene.tweens.add({
      targets: target,
      scale: baseScale * 0.94,
      duration: 55,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  static pulse(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, intensity = 1): void {
    scene.tweens.add({
      targets: target,
      alpha: { from: 0.85, to: 1 },
      duration: 420 / Math.max(0.5, intensity),
      yoyo: true,
      repeat: 1,
      ease: "Sine.easeInOut",
    });
  }

  static spawnClickBurst(scene: Phaser.Scene, x: number, y: number): void {
    const key = "fx_click_burst_v41";
    if (!scene.textures.exists(key)) return;

    const sprite = scene.add.sprite(x, y, key).setDepth(9999).setScale(0.72);
    if (!scene.anims.exists(`${key}_anim`)) {
      scene.anims.create({
        key: `${key}_anim`,
        frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 7 }),
        frameRate: 24,
        repeat: 0,
      });
    }
    sprite.play(`${key}_anim`);
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sprite.destroy());
  }

  static goldToast(scene: Phaser.Scene, text: string, x = 640, y = 96): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y).setDepth(10000);
    const bg = scene.add.image(0, 0, "toast_success_v41").setDisplaySize(420, 96);
    const label = scene.add.text(0, -4, text, {
      fontFamily: "Georgia, serif",
      fontSize: "24px",
      color: "#ffe7a3",
      stroke: "#1a0d05",
      strokeThickness: 4,
    }).setOrigin(0.5);
    container.add([bg, label]);
    container.setAlpha(0).setScale(0.94);
    scene.tweens.add({ targets: container, alpha: 1, scale: 1, y: y + 8, duration: 220, ease: "Back.easeOut" });
    scene.time.delayedCall(1550, () => {
      scene.tweens.add({ targets: container, alpha: 0, y: y - 18, duration: 220, onComplete: () => container.destroy() });
    });
    return container;
  }
}
