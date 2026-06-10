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
    const spriteKey = scene.textures.exists("fx-click-burst-v42") ? "fx-click-burst-v42" : "fx_click_burst_v41";
    if (!scene.textures.exists(spriteKey)) return;

    const image = scene.add.image(x, y, spriteKey).setDepth(9999).setScale(0.28).setAlpha(0.92);
    scene.tweens.add({ targets: image, scale: 0.86, alpha: 0, duration: 260, ease: "Cubic.easeOut", onComplete: () => image.destroy() });
  }

  static goldToast(scene: Phaser.Scene, text: string, x = 640, y = 96): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y).setDepth(10000);
    const bg = scene.textures.exists("toast_success_v41")
      ? scene.add.image(0, 0, "toast_success_v41").setDisplaySize(420, 96)
      : scene.add.rectangle(0, 0, 420, 72, 0x101a29, 0.94).setStrokeStyle(2, 0xf7d36b, 0.54);
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

let installed = false;

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('button, a, [role="button"], canvas, .clickable, .shell-start-card'));
}

function spawnDomRipple(x: number, y: number): void {
  const ring = document.createElement('div');
  ring.className = 'ks-dom-click-ripple';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  window.setTimeout(() => ring.remove(), 420);
}

function pulseCanvas(): void {
  const game = document.getElementById('game');
  if (!game) return;
  game.classList.add('ks-game-tap-pulse');
  window.setTimeout(() => game.classList.remove('ks-game-tap-pulse'), 110);
}

export function installGlobalPremiumDomFeedback(): void {
  if (installed) return;
  installed = true;

  window.addEventListener('pointerdown', (event) => {
    if (!isInteractiveElement(event.target)) return;
    spawnDomRipple(event.clientX, event.clientY);
    pulseCanvas();
  }, { passive: true });

  window.addEventListener('kingdom-seed:emergency-save', () => {
    document.documentElement.classList.add('ks-emergency-save-flash');
    window.setTimeout(() => document.documentElement.classList.remove('ks-emergency-save-flash'), 220);
  });
}
