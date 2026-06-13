import Phaser from 'phaser';
import { ENEMIES } from './balance';
import type { EnemyKind, WaveSpawn } from './types';
import { getBossProfile, getMonsterTraits, MONSTER_TRAITS, type MonsterTrait } from './MonsterIntel';
import { PRESTIGE_HUD_FONT, usePrestigeCombatHud } from './BattleHudPrestige';
import { createReferenceBossCutinPortrait, createReferenceEncounterPortrait } from './ReferenceEncounterDirector';

export function renderWaveIntelPanel(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container | undefined,
  groups: WaveSpawn[] | undefined,
  options: { inCombat?: boolean; completed?: boolean; nextWaveNumber?: number } = {}
): void {
  if (!panel) return;
  panel.removeAll(true);

  const prestigeHud = usePrestigeCombatHud();
  const panelWidth = prestigeHud ? 330 : 316;
  const panelHeight = prestigeHud ? 42 : 38;
  const bg = scene.add.rectangle(0, 0, panelWidth, panelHeight, prestigeHud ? 0x070b12 : 0x080c14, prestigeHud ? 0.78 : 0.28)
    .setStrokeStyle(1, prestigeHud ? 0xffd996 : 0xffe0a3, prestigeHud ? 0.26 : 0.18);
  panel.add(bg);

  if (prestigeHud) {
    panel.add(scene.add.rectangle(0, -panelHeight / 2 + 6, panelWidth - 22, 3, 0xffffff, 0.045));
    panel.add(scene.add.rectangle(0, panelHeight / 2 - 5, panelWidth - 24, 2, 0xffd996, 0.11));
  }

  if (options.completed || !groups || groups.length === 0) {
    const done = scene.add.text(0, 0, prestigeHud ? '전장 확보 · 공세 종료' : '최종 공세 완료', {
      fontSize: prestigeHud ? '15px' : '14px', color: '#fff4c2', fontStyle: 'bold', fontFamily: PRESTIGE_HUD_FONT,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5);
    panel.add(done);
    return;
  }

  const visibleGroups = groups.slice(0, 3);
  const startX = prestigeHud ? -110 : -112;
  visibleGroups.forEach((group, index) => {
    const cfg = ENEMIES[group.kind];
    const x = startX + index * (prestigeHud ? 110 : 112);
    const threatColor = cfg.threat === 'boss' ? 0xff5b4f : cfg.accentColor ?? 0xf7d36b;
    const card = scene.add.rectangle(x, 0, prestigeHud ? 104 : 102, prestigeHud ? 36 : 34, prestigeHud ? 0x10151f : 0x15100c, prestigeHud ? 0.96 : 0.92)
      .setStrokeStyle(prestigeHud ? 1 : 2, threatColor, cfg.threat === 'boss' ? 0.86 : prestigeHud ? 0.38 : 0.48);
    const portraitBg = prestigeHud
      ? scene.add.rectangle(x - 35, 0, 27, 27, 0x080b11, 0.96).setStrokeStyle(1, threatColor, 0.42)
      : scene.add.circle(x - 34, 0, 16, cfg.accentColor ?? 0x9ad7ff, 0.22).setStrokeStyle(1, 0xffffff, 0.16);
    panel.add([card, portraitBg]);

    const referencePortrait = createReferenceEncounterPortrait(scene, group.kind, {
      x: x - 35,
      y: 0,
      width: prestigeHud ? 32 : 30,
      height: prestigeHud ? 32 : 30,
      count: group.count,
      inCombat: options.inCombat,
      noMotion: true,
    });
    if (referencePortrait) {
      panel.add(referencePortrait);
    } else {
      const textureKey = `enemy-${group.kind}`;
      if (scene.textures.exists(textureKey)) {
        const sprite = scene.add.sprite(x - 35, 1, textureKey, 0).setScale(cfg.threat === 'boss' ? 1.14 : 1.02);
        sprite.setTint(0xffffff);
        scene.time.delayedCall(70, () => sprite.clearTint());
        panel.add(sprite);
      } else if (prestigeHud) {
        panel.add(createThreatCrest(scene, x - 35, 0, cfg.color ?? 0xffffff, threatColor, cfg.threat === 'boss'));
      } else {
        panel.add(scene.add.circle(x - 34, 0, 10, cfg.color ?? 0xffffff, 1));
      }
    }

    const name = compactName(cfg.label);
    const title = scene.add.text(x - 12, prestigeHud ? -8 : -9, name, {
      fontSize: prestigeHud ? '11px' : '10px', color: '#fff4c2', fontStyle: 'bold', fixedWidth: 66, fontFamily: PRESTIGE_HUD_FONT,
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    const count = scene.add.text(x - 12, prestigeHud ? 9 : 8, prestigeHud ? `전력 x${group.count}` : `x${group.count}`, {
      fontSize: prestigeHud ? '11px' : '12px', color: options.inCombat ? '#ffb86b' : '#9ee7ff', fontStyle: 'bold', fontFamily: PRESTIGE_HUD_FONT
    }).setOrigin(0, 0.5);
    panel.add([title, count]);

    const traits = getMonsterTraits(group.kind).slice(0, prestigeHud ? 1 : 2);
    traits.forEach((trait, tIndex) => panel.add(createTinyTraitBadge(scene, x + 36 - tIndex * 20, prestigeHud ? 11 : 10, trait)));
  });

  if (groups.length > 3) {
    const more = scene.add.text(154, 0, `+${groups.length - 3}`, { fontSize: '13px', color: '#f7d36b', fontStyle: 'bold', fontFamily: PRESTIGE_HUD_FONT }).setOrigin(0.5);
    panel.add(more);
  }
}

function createThreatCrest(scene: Phaser.Scene, x: number, y: number, color: number, accent: number, boss: boolean): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const shadow = scene.add.ellipse(0, 11, boss ? 26 : 22, 6, 0x000000, 0.28);
  const body = scene.add.polygon(0, 0, boss ? [0, -15, 12, -5, 9, 11, -9, 11, -12, -5] : [0, -12, 10, -3, 7, 10, -7, 10, -10, -3], color, 0.94)
    .setStrokeStyle(1, accent, 0.62);
  const cut = scene.add.rectangle(0, -1, boss ? 12 : 10, boss ? 5 : 4, 0xffffff, 0.1);
  const eye = scene.add.rectangle(0, -5, boss ? 10 : 8, 2, accent, 0.75);
  c.add([shadow, body, cut, eye]);
  return c;
}

export function showBossCutin(scene: Phaser.Scene, kind: EnemyKind, waveSummary: string): void {
  const cfg = ENEMIES[kind];
  const profile = getBossProfile(kind) ?? {
    title: cfg.label,
    subtitle: '보스 공세',
    warning: '전술 자원을 집중하세요.',
    quote: '왕국을 무너뜨려라.',
    accent: cfg.accentColor ?? 0xff5b4f,
  };

  const overlay = scene.add.container(480, 270).setDepth(128);
  const dim = scene.add.rectangle(0, 0, 960, 540, 0x050306, 0.66);
  const slash = scene.add.rectangle(0, -10, 1120, 150, profile.accent, 0.18).setRotation(-0.07)
    .setStrokeStyle(2, 0xfff0a3, 0.22);
  const panel = scene.add.rectangle(0, 0, 690, 190, 0x130907, 0.96)
    .setStrokeStyle(4, profile.accent, 0.85);
  const topLine = scene.add.rectangle(0, -94, 650, 4, 0xfff0a3, 0.72);
  const bottomLine = scene.add.rectangle(0, 94, 650, 4, 0xfff0a3, 0.38);
  overlay.add([dim, slash, panel, topLine, bottomLine]);

  const referenceBossPortrait = createReferenceBossCutinPortrait(scene, kind, -255, 14);
  if (referenceBossPortrait) {
    overlay.add(referenceBossPortrait);
  } else {
    const textureKey = `enemy-${kind}`;
    if (scene.textures.exists(textureKey)) {
      const sprite = scene.add.sprite(-255, 14, textureKey, 0).setScale(cfg.threat === 'boss' ? 4.4 : 3.6);
      sprite.setTint(0xffffff);
      const aura = scene.add.circle(-255, 16, 86, profile.accent, 0.16).setStrokeStyle(3, profile.accent, 0.44);
      overlay.add([aura, sprite]);
      scene.tweens.add({ targets: aura, scale: 1.15, alpha: 0.06, duration: 520, yoyo: true, repeat: 2 });
    }
  }

  const warning = scene.add.text(-10, -68, 'BOSS WAVE', {
    fontSize: '23px', color: '#ffddd2', fontStyle: 'bold', letterSpacing: 2,
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 2, fill: true }
  }).setOrigin(0.5);
  const title = scene.add.text(62, -30, profile.title, {
    fontSize: '34px', color: '#fff4c2', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 3, fill: true }
  }).setOrigin(0.5);
  const subtitle = scene.add.text(62, 4, profile.subtitle, { fontSize: '17px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5);
  const quote = scene.add.text(62, 36, `“${profile.quote}”`, { fontSize: '15px', color: '#dbe7ff', fontStyle: 'italic' }).setOrigin(0.5);
  const tip = scene.add.text(62, 68, profile.warning, { fontSize: '13px', color: '#ffffff', fixedWidth: 430, align: 'center' }).setOrigin(0.5);
  overlay.add([warning, title, subtitle, quote, tip]);

  const traits = getMonsterTraits(kind).slice(0, 4);
  traits.forEach((trait, index) => overlay.add(createTraitPill(scene, -90 + index * 88, 102, trait)));

  overlay.setAlpha(0);
  overlay.setScale(1.04);
  scene.tweens.add({ targets: overlay, alpha: 1, scale: 1, duration: 170, ease: 'Cubic.easeOut' });
  scene.cameras.main.shake(140, 0.006);
  scene.time.delayedCall(1850, () => {
    scene.tweens.add({ targets: overlay, alpha: 0, scale: 1.02, duration: 260, ease: 'Cubic.easeIn', onComplete: () => overlay.destroy() });
  });
}

function createTinyTraitBadge(scene: Phaser.Scene, x: number, y: number, trait: MonsterTrait): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, 18, 12, trait.color, 0.94).setStrokeStyle(1, 0xffffff, 0.25);
  const text = scene.add.text(0, 0, trait.shortLabel.slice(0, 3), { fontSize: '6px', color: '#101010', fontStyle: 'bold' }).setOrigin(0.5);
  c.add([bg, text]);
  return c;
}

function createTraitPill(scene: Phaser.Scene, x: number, y: number, trait: MonsterTrait): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, 76, 22, trait.color, 0.9).setStrokeStyle(1, 0xffffff, 0.22);
  const text = scene.add.text(0, 0, trait.label, { fontSize: '11px', color: '#111111', fontStyle: 'bold' }).setOrigin(0.5);
  c.add([bg, text]);
  return c;
}

function compactName(label: string): string {
  if (label.length <= 5) return label;
  return label.replace('그림자 ', '').replace('흑요석 ', '').replace('공허 ', '').slice(0, 5);
}
