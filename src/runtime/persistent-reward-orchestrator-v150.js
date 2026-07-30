import { HERO_MASTERY_STORAGE_KEY, awardHeroMastery, getHeroMasteryEntry, sanitizeHeroMastery } from '../hero-mastery.js';
import { EQUIPMENT_STORAGE_KEY, awardEquipmentDrop, sanitizeEquipmentState } from '../equipment-system.js';
import { CODEX_STORAGE_KEY } from '../codex-progression.js';

export const META_PROGRESS_STORAGE_KEY_V150 = 'dokkaebi-guardian-growth-v1';
export const LOCAL_SCORE_STORAGE_KEY_V150 = 'dokkaebi-luck-scores';

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeMetaProgress(raw = {}) {
  const next = clone(raw || {});
  next.shards = Math.max(0, Math.floor(Number(next.shards) || 0));
  next.traits = next.traits && typeof next.traits === 'object' ? next.traits : {};
  return next;
}

function normalizeScore(entry = {}, now = Date.now) {
  return Object.freeze({
    name: String(entry.name || '달빛 수호자').trim().slice(0, 12) || '달빛 수호자',
    score: Math.max(0, Math.round(Number(entry.score) || 0)),
    wave: Math.max(0, Math.round(Number(entry.wave) || 0)),
    kills: Math.max(0, Math.round(Number(entry.kills) || 0)),
    maxRank: Math.max(0, Math.round(Number(entry.maxRank) || 0)),
    mode: String(entry.mode || ''),
    seed: String(entry.seed || ''),
    edict: String(entry.edict || ''),
    bossKills: Math.max(0, Math.round(Number(entry.bossKills) || 0)),
    date: Math.max(0, Math.round(Number(entry.date) || Number(now()) || Date.now()))
  });
}

export function calculateShardRewardV150({ won = false, currentWave = 0, activeRunMode = {}, runStats = {}, kills = 0, maxRank = 0 } = {}) {
  const progress = Math.max(1, Number(currentWave) || 1);
  const modeBonus = activeRunMode?.id === 'abyss' ? 1.35 : activeRunMode?.id === 'eclipse' ? 1.18 : 1;
  const expeditionBonus = (Number(runStats.trialsCompleted) || 0) * 1.5 + (Number(runStats.relicsChosen) || 0) * 1.25;
  const reward = (8 + progress * 2.4 + Math.floor((Number(kills) || 0) / 18) + (Number(maxRank) || 0) * 2 + (won ? 20 : 0) + expeditionBonus) * modeBonus;
  return clamp(Math.round(reward), 8, 95);
}

export class PersistentRewardOrchestratorV150 {
  constructor({ persistence, snapshots, isOnlineEnabled = () => false, submitOnlineScore = null, loadOnlineScores = null, now = Date.now } = {}) {
    if (!persistence || typeof persistence.getJSON !== 'function') throw new TypeError('PersistentRewardOrchestratorV150 requires persistence');
    if (!snapshots || typeof snapshots.commit !== 'function') throw new TypeError('PersistentRewardOrchestratorV150 requires atomic snapshots');
    this.persistence = persistence;
    this.snapshots = snapshots;
    this.isOnlineEnabled = typeof isOnlineEnabled === 'function' ? isOnlineEnabled : () => false;
    this.submitOnlineScore = typeof submitOnlineScore === 'function' ? submitOnlineScore : null;
    this.loadOnlineScores = typeof loadOnlineScores === 'function' ? loadOnlineScores : null;
    this.now = typeof now === 'function' ? now : Date.now;
    this.completedRuns = new Map();
    this.stats = { runAwards: 0, duplicateRunAwards: 0, scoreSaves: 0, onlineScoreSaves: 0, onlineFallbacks: 0, failedCommits: 0 };
  }

  awardRun(context = {}) {
    const token = String(context.runToken ?? '').trim() || `run-${Number(this.now()) || Date.now()}`;
    if (this.completedRuns.has(token)) {
      this.stats.duplicateRunAwards += 1;
      return Object.freeze({ ...this.completedRuns.get(token), duplicate: true });
    }
    const metaProgress = sanitizeMetaProgress(context.metaProgress);
    const heroMastery = sanitizeHeroMastery(context.heroMastery);
    const equipmentState = sanitizeEquipmentState(context.equipmentState);
    const shardReward = calculateShardRewardV150(context);
    metaProgress.shards += shardReward;
    const mastery = awardHeroMastery(heroMastery, context.selectedHeroClassId, { wave: context.currentWave, won: context.won });
    let drop = null;
    let nextEquipment = equipmentState;
    if (Number(context.currentWave) >= 3) {
      drop = awardEquipmentDrop(equipmentState, { wave: context.currentWave, won: context.won, random: typeof context.random === 'function' ? context.random : Math.random });
      nextEquipment = drop.state;
    }
    const commit = this.snapshots.commit({
      [META_PROGRESS_STORAGE_KEY_V150]: metaProgress,
      [HERO_MASTERY_STORAGE_KEY]: mastery.state,
      [EQUIPMENT_STORAGE_KEY]: nextEquipment,
      [CODEX_STORAGE_KEY]: context.codexProgress || {}
    }, 'finish-run-rewards');
    if (!commit.ok) {
      this.stats.failedCommits += 1;
      return Object.freeze({
        ok: false,
        duplicate: false,
        shardReward: 0,
        metaProgress: sanitizeMetaProgress(context.metaProgress),
        heroMastery,
        equipmentState,
        mastery: Object.freeze({ gained: 0, levelsGained: 0, entry: getHeroMasteryEntry(heroMastery, context.selectedHeroClassId) }),
        drop: null,
        commit
      });
    }
    const result = Object.freeze({
      ok: true,
      duplicate: false,
      shardReward,
      metaProgress,
      heroMastery: mastery.state,
      equipmentState: nextEquipment,
      mastery,
      drop,
      commit
    });
    this.completedRuns.set(token, result);
    while (this.completedRuns.size > 8) this.completedRuns.delete(this.completedRuns.keys().next().value);
    this.stats.runAwards += 1;
    return result;
  }

  getLocalScores() {
    const scores = this.persistence.getJSON(LOCAL_SCORE_STORAGE_KEY_V150, []);
    return Array.isArray(scores) ? scores : [];
  }

  async submitScore(entry = {}) {
    const normalized = normalizeScore(entry, this.now);
    const previous = this.getLocalScores();
    const local = [...previous, normalized].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 10);
    const commit = this.snapshots.commit({ [LOCAL_SCORE_STORAGE_KEY_V150]: local }, 'score-save');
    if (!commit.ok) {
      this.stats.failedCommits += 1;
      return Object.freeze({ ok: false, localSaved: false, online: 'not-attempted', scores: previous, entry: normalized, commit });
    }
    this.stats.scoreSaves += 1;
    if (!this.isOnlineEnabled() || !this.submitOnlineScore || !this.loadOnlineScores) {
      return Object.freeze({ ok: true, localSaved: true, online: 'disabled', scores: local, entry: normalized, commit });
    }
    try {
      await this.submitOnlineScore(normalized);
      const onlineScores = await this.loadOnlineScores();
      this.stats.onlineScoreSaves += 1;
      return Object.freeze({ ok: true, localSaved: true, online: 'saved', scores: Array.isArray(onlineScores) ? onlineScores : local, entry: normalized, commit });
    } catch {
      this.stats.onlineFallbacks += 1;
      return Object.freeze({ ok: true, localSaved: true, online: 'fallback-local', scores: local, entry: normalized, commit });
    }
  }

  get diagnostics() {
    return Object.freeze({ id: 'DD-PERSISTENT-REWARD-ORCHESTRATOR-V150', completedRunTokens: this.completedRuns.size, ...this.stats });
  }
}
