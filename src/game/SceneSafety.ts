import Phaser from 'phaser';

export function isSceneActive(scene: Phaser.Scene, key = scene.scene.key): boolean {
  return scene.scene.isActive(key) && scene.sys.isActive();
}

export function safeDelayedCall(
  scene: Phaser.Scene,
  delay: number,
  callback: () => void,
  options: { key?: string; canRun?: () => boolean } = {}
): Phaser.Time.TimerEvent {
  const key = options.key ?? scene.scene.key;
  const event = scene.time.delayedCall(delay, () => {
    if (!isSceneActive(scene, key)) return;
    if (options.canRun && !options.canRun()) return;
    callback();
  });

  const cleanup = (): void => {
    if (!event.hasDispatched) event.remove(false);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  return event;
}

export function clearTimer(event?: Phaser.Time.TimerEvent): undefined {
  event?.remove(false);
  return undefined;
}
