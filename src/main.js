import { installTitlePresentationGuardV123 } from './runtime/title-presentation-guard-v123.js';
installTitlePresentationGuardV123();
import * as THREE from 'three';
import './style.css';
import { isFirebaseEnabled, loadOnlineScores, submitOnlineScore } from './firebase.js';
import { PUBLIC_GAME_VERSION, LEGACY_LINEAGE_VERSION, BUILD_ID, CACHE_REVISION, VERSION_POLICY } from './version-policy.js';
import SoundEngine from './sound-engine.js';
import { RANKS, UNIT_TYPES, UNIT_KEYS, ENEMY_TYPES, SYNERGIES, BLESSINGS, CONTRACTS } from './game-data.js';
import { selectMoonOmen, rollEliteAffix } from './run-director.js';
import { RUN_MODES, RELICS, getRunMode, getRelicById, selectRelicOptions, getRelicSetProgress, activateRelicSetBonuses, rollWaveTrial, getWaveTrialProgress, getWaveTrialReward, formatTrialProgress } from './expedition-director.js';
import { RUN_SEED_MODES, createSeededRandom, createDailySeed, createRandomSeed, getDailyEdict } from './daily-expedition.js';
import { BOSS_PROFILES, getBossTypeForWave, getBossSpawnCount, isBossWave } from './boss-director.js';
import { getBattlefieldTheme } from './battlefield-themes.js';
import { CODEX_SECTION_META, CODEX_SECTION_ORDER, getCodexEntries, getCodexTotals } from './codex-data.js';
import { ENGINE_VERSION, MobileGameEngine, InstanceBatch, BlobShadowSystem, ObjectPool, RenderStatsHUD, AssetPipeline, AnimationStateSystem, FrameBudgetScheduler } from './engine/index.js';
import { isMovementCode } from './runtime/native-input-policy-v231.js';
import { createArtApprovalReportV115 } from './runtime/art-approval-pipeline-v115.js';
import { createAssetApprovalReportV117 } from './runtime/asset-approval-pipeline-v117.js';
import { createStaticDeploymentGateReportV118 } from './runtime/static-deployment-gate-v118.js';
import { createBundleMarkerGateReportV119 } from './runtime/bundle-marker-gate-v119.js';
import { createHeroHudPolishReportV120 } from './runtime/hero-hud-polish-v120.js';
import LiveCombatDirectorV121 from './runtime/live-combat-director-v121.js';
import BattlefieldClarityDirectorV122 from './runtime/battlefield-clarity-director-v122.js';
import ReleaseAssuranceDirectorV124 from './runtime/release-assurance-director-v124.js';
import ActionAssetAssuranceDirectorV125 from './runtime/action-asset-assurance-director-v125.js';
import BossEncounterAssuranceDirectorV126 from './runtime/boss-encounter-assurance-director-v126.js';
import BossTacticalAssuranceDirectorV127 from './runtime/boss-tactical-assurance-director-v127.js';
import BattlefieldVisibilityAssuranceDirectorV128 from './runtime/battlefield-visibility-assurance-director-v128.js';
import AssetRefinementAssuranceDirectorV129 from './runtime/asset-refinement-assurance-director-v129.js';
import AssetLineageAssuranceDirectorV131 from './runtime/asset-lineage-assurance-director-v131.js';
import SilhouetteAssuranceDirectorV132 from './runtime/silhouette-assurance-director-v132.js';
import BossIdentityAssuranceDirectorV133 from './runtime/boss-identity-assurance-director-v133.js';
import { DEFAULT_CAMERA_PROFILE_ID, getCameraProfile, sanitizeCameraProfileId, cycleCameraProfile, resolveCameraDistance } from './engine/camera-profile.js';
import { BOOT_ASSET_CATALOG, DEFERRED_ASSET_CATALOG, ASSET_LOADING_PLAN_V115, PLAYER_ASSET_ID, GUARDIAN_ASSET_IDS, MONSTER_ASSET_IDS, BOSS_ASSET_IDS } from './engine/asset-catalog.js';
import { HERO_CLASSES, HERO_CLASS_ORDER, HERO_CLASS_ASSET_IDS, getHeroClass } from './hero-classes.js';
import { applyHeroArchetypeModifiers, getHeroArchetypePassive, HERO_ARCHETYPE_SUMMARY } from './hero-archetype-system.js';
import { IP_ASSET_LIBRARY_V15, atlasSpriteMarkup } from './ip-asset-library-v15.js';
import { applyHeroClassVisuals, applyRelicVisuals } from './hero-visual-loadout.js';
import { applyEnemyCandidateVisuals } from './enemy-candidate-visuals.js';
import { getBossHudState } from './boss-hud-contract.js';
import { EQUIPMENT_ITEMS, EQUIPMENT_SLOTS, EQUIPMENT_RARITIES, EQUIPMENT_FORGE_MAX_LEVEL, loadEquipmentState, saveEquipmentState, equipItem, getEquippedItems, getEquipmentForgeLevel, getEquipmentForgeCost, forgeEquipmentItem, applyEquipmentBonuses, awardEquipmentDrop } from './equipment-system.js';
import { loadHeroMastery, saveHeroMastery, getHeroMasteryEntry, getHeroMasteryBonus, xpForNextLevel, awardHeroMastery, HERO_MASTERY_MAX_LEVEL } from './hero-mastery.js';
import { getStageProgress } from './stage-progression.js';
import CodexViewer from './codex-viewer.js';
import { createPremiumGuardian, createPremiumEnemy, createPremiumSacredTree, applyPremiumBossPhase, prepareImportedGuardian, prepareImportedEnemy } from './premium-assets.js';
import { DirectionalImpostorSelector } from './engine/directional-impostor.js';
import { buildAssetDiagnostics } from './asset-diagnostics.js';
import { ART_PRODUCTION_SUMMARY, MASSIVE_UPDATE_MILESTONES } from './art-production-gate.js';
import { GOLDEN_SLICE_CERTIFICATION_SUMMARY } from './golden-slice-certification.js';
import { CHARACTER_DNA_SUMMARY } from './character-dna.js';
import { ProductionConsole } from './production-console.js';
import { GOLDEN_SAMPLE_CLIPS, GOLDEN_SAMPLE_SOCKETS, GOLDEN_SAMPLE_TEXTURE_MAPS } from './golden-sample-spec.js';
import { loadCodexProgress, saveCodexProgress, recordCodexEncounter, recordCodexDefeat, recordGuardianUse, getCodexKnowledge, getCodexProgressSummary, getWeaknessDamageBonus, getWeaknessLabel } from './codex-progression.js';
import { RuntimeLifecycle } from './runtime-lifecycle.js';
import AdaptiveHudLayout from './ui-layout-manager.js';
import CombatPresentation, { faceActorTowards, resolveAttackOrigin } from './combat-presentation.js';
import EncounterDirector from './combat/encounter-director.js';
import StatusEffectSystem from './combat/status-effect-system.js';
import CombatTelemetry from './combat/combat-telemetry.js';
import RuntimeBudgetManager from './engine/runtime-budget-manager.js';
import { migrateSaveSchema, SAVE_SCHEMA_VERSION } from './runtime/save-schema.js';
import ElementalReactionSystem from './combat/elemental-reaction-system.js';
import BattleMomentumSystem from './combat/battle-momentum-system.js';
import BossEscalationDirector from './combat/boss-escalation-director.js';
import BossBreakSystem from './combat/boss-break-system.js';
import MoonfrontCampaignDirector from './combat/moonfront-campaign-director.js';
import { GUARDIAN_COUNCIL_STORAGE_KEY, GUARDIAN_COUNCIL_SUPPORTS, applyGuardianCouncilModifiers, resolveGuardianCouncil, sanitizeCouncilSupportId } from './guardian-council-system.js';
import BattlefieldSpriteDirectorV16 from './runtime/battlefield-sprite-director-v16.js';
import CameraDirectorV16 from './engine/camera-director-v16.js';
import BattlefieldPropSystem from './runtime/battlefield-prop-system.js';
import BattlefieldEventDirector from './combat/battlefield-event-director.js';
import { auditRuntimeVisuals } from './runtime/runtime-visual-audit.js';
import WaveFlowGuard from './runtime/wave-flow-guard.js';
import WaveReliabilityDirector from './runtime/wave-reliability-director.js';
import BrowserReliabilityLab from './runtime/browser-reliability-lab.js';
import { installKoreanLanguageGuard } from './runtime/korean-language-guard.js';
import VisualIntegrationDirector from './runtime/visual-integration-director.js';
import AssetPresenceEnforcer from './runtime/asset-presence-enforcer.js';
import MobileHudDirectorV23 from './runtime/mobile-hud-director-v23.js';
import CombatReadabilityDirectorV21 from './combat/combat-readability-director-v21.js';
import GuardianTargetingDirectorV22 from './combat/guardian-targeting-director-v22.js';
import AutomationDirectorV22 from './runtime/automation-director-v22.js';
import CoreFoundationDirectorV101 from './runtime/core-foundation-director-v101.js';
import AppStateMachineV103 from './runtime/app-state-machine-v103.js';
import FirstPresentationDirectorV107 from './runtime/first-presentation-director-v107.js';
import CombatArtPolishDirectorV114 from './runtime/combat-art-polish-director-v114.js';
import CrossPlatformShellV112 from './runtime/cross-platform-shell-v112.js';
// CameraDirector v14/v15 lineage is preserved by CameraDirectorV16.

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const tempV = new THREE.Vector3();
const tempV2 = new THREE.Vector3();
const tempColor = new THREE.Color();
const tempQ = new THREE.Quaternion();

const ui = {
  canvas: $('#game-canvas'), loading: $('#loading'), loadingStatus: $('#loading-status'), loadingProgress: $('#loading-progress'), loadingDetail: $('#loading-detail'), title: $('#title-screen'), start: $('#start-btn'), titleSetup: $('#title-setup-btn'), titleSetupModal: $('#title-setup-modal'), titleVault: $('#title-vault-btn'), titleVaultModal: $('#title-vault-modal'), titleLoadoutSummary: $('#title-loadout-summary'),
  how: $('#how-btn'), collection: $('#collection-btn'), meta: $('#meta-btn'), equipment: $('#equipment-btn'), hudEquipment: $('#hud-equipment-btn'), pauseEquipment: $('#pause-equipment-btn'), titleShards: $('#title-shards'), runPreview: $('#run-preview'), howModal: $('#how-modal'), collectionModal: $('#collection-modal'),
  blessingModal: $('#blessing-modal'), blessingOptions: $('#blessing-options'), blessingRecommend: $('#blessing-recommend-btn'), collectionGrid: $('#collection-grid'), collectionTabs: $('#collection-tabs'), collectionSummary: $('#collection-summary'),
  choiceSummonModal: $('#choice-summon-modal'), choiceSummonOptions: $('#choice-summon-options'), summonTicket: $('#summon-ticket'),
  controls: $('#controls-btn'), pauseControls: $('#pause-controls-btn'), controlsModal: $('#controls-modal'), controlsReset: $('#controls-reset-btn'),
  rotateSensitivity: $('#rotate-sensitivity'), rotateSensitivityValue: $('#rotate-sensitivity-value'), pinchSensitivity: $('#pinch-sensitivity'), pinchSensitivityValue: $('#pinch-sensitivity-value'),
  wheelSensitivity: $('#wheel-sensitivity'), wheelSensitivityValue: $('#wheel-sensitivity-value'), minimumZoom: $('#minimum-zoom'), minimumZoomValue: $('#minimum-zoom-value'), maximumZoom: $('#maximum-zoom'), maximumZoomValue: $('#maximum-zoom-value'),
  shakeIntensity: $('#shake-intensity'), shakeIntensityValue: $('#shake-intensity-value'), flashIntensity: $('#flash-intensity'), flashIntensityValue: $('#flash-intensity-value'), performanceExport: $('#performance-export-btn'),
  assetDiagnosticsSummary: $('#asset-diagnostics-summary'), assetDiagnosticsCount: $('#asset-diagnostics-count'), assetDiagnosticsList: $('#asset-diagnostics-list'), goldenSamplePreview: $('#golden-sample-preview-btn'), productionConsole: $('#production-console-btn'), assetApprovalV117: $('#asset-approval-v117-btn'),
  contractModal: $('#contract-modal'), contractOptions: $('#contract-options'), contractSkip: $('#contract-skip-btn'), metaModal: $('#meta-modal'), metaShards: $('#meta-shards'), metaTraitList: $('#meta-trait-list'),
  equipmentModal: $('#equipment-modal'), equipmentSlots: $('#equipment-slots'), equipmentList: $('#equipment-list'), equipmentEssence: $('#equipment-essence'), equipmentBonus: $('#equipment-bonus'), equipmentMastery: $('#equipment-mastery'),
  hud: $('#hud'), hudLayout: $('#hud-layout-btn'), heroHudPortrait: $('#hero-hud-portrait'), corePillV120: $('#core-pill-v120'), hp: $('#hp-value'), coreHpProgressV120: $('#core-hp-progress-v120'), gold: $('#gold-value'), waveLabel: $('#wave-label'), waveProgress: $('#wave-progress'),
  enemyCount: $('#enemy-count'), menu: $('#menu-btn'), sound: $('#sound-btn'), synergyPanel: $('#synergy-panel'),
  leftUiToggle: $('#left-ui-toggle'), synergyToggle: $('#synergy-toggle'), synergyCount: $('#synergy-count'), synergyList: $('#synergy-list'),
  luckMeter: $('#luck-meter'), luckValue: $('#luck-value'), luckProgress: $('#luck-progress'), unitStrip: $('#unit-strip'),
  joystick: $('#joystick-zone'), joystickKnob: $('#joystick-knob'), lookZone: $('#look-zone'), actionDock: $('#action-dock'),
  blessingAutoSeconds: $('#blessing-auto-seconds'), blessingAutoProgress: $('#blessing-auto-progress'), relicAutoSeconds: $('#relic-auto-seconds'), relicAutoProgress: $('#relic-auto-progress'), contractAutoSeconds: $('#contract-auto-seconds'), contractAutoProgress: $('#contract-auto-progress'), choiceAutoSeconds: $('#choice-auto-seconds'), choiceAutoProgress: $('#choice-auto-progress'),
  dash: $('#dash-btn'), dashCooldown: $('#dash-cooldown'), skill: $('#skill-btn'), skillLabel: $('#skill-label'), skillCooldown: $('#skill-cooldown'), interact: $('#interact-btn'), interactLabel: $('#interact-label'), interactState: $('#interact-state'),
  summon: $('#summon-btn'), summonCost: $('#summon-cost'), wave: $('#wave-btn'), waveLabelAction: $('#wave-btn-label'), waveText: $('#wave-btn-text'), autoWavePanel: $('#auto-wave-panel'), autoWaveTitle: $('#auto-wave-title'), autoWaveCopy: $('#auto-wave-copy'), autoWaveSeconds: $('#auto-wave-seconds'), autoWavePanelProgress: $('#auto-wave-panel-progress'),
  waveRecovery: $('#wave-recovery'), waveRecoveryTitle: $('#wave-recovery-title'), waveRecoveryCopy: $('#wave-recovery-copy'),
  toast: $('#toast'), combo: $('#combo-banner'), comboText: $('#combo-text'), boss: $('#boss-banner'), bossName: $('#boss-name'),
  mission: $('#mission-banner'), missionKicker: $('#mission-kicker'), missionTitle: $('#mission-title'), missionCopy: $('#mission-copy'),
  evolution: $('#evolution-banner'), evolutionSymbol: $('#evolution-symbol'), evolutionName: $('#evolution-name'), evolutionUltimate: $('#evolution-ultimate'),
  bossHealth: $('#boss-health'), bossHealthName: $('#boss-health-name'), bossHealthValue: $('#boss-health-value'), bossHealthDamage: $('#boss-health-damage'), bossHealthProgress: $('#boss-health-progress'), bossBreak: $('#boss-break'), bossBreakValue: $('#boss-break-value'), bossBreakProgress: $('#boss-break-progress'), bossBreakState: $('#boss-break-state'),
  bossIntent: $('#boss-intent'), bossIntentIcon: $('#boss-intent-icon'), bossIntentType: $('#boss-intent-type'), bossIntentProgress: $('#boss-intent-progress'), bossPhase: $('#boss-phase'), bossIntentLabel: $('#boss-intent-label'), bossIntentTime: $('#boss-intent-time'), bossDangerFrame: $('#boss-danger-frame'),
  killChain: $('#kill-chain'), killChainValue: $('#kill-chain-value'), killChainBonus: $('#kill-chain-bonus'),
  moonOmen: $('#moon-omen'), moonOmenIcon: $('#moon-omen-icon'), moonOmenName: $('#moon-omen-name'), moonOmenEffect: $('#moon-omen-effect'),
  moonWard: $('#moon-ward'), moonWardValue: $('#moon-ward-value'), jackpot: $('#jackpot-rush'), jackpotTime: $('#jackpot-rush-time'),
  waveTrial: $('#wave-trial'), waveTrialIcon: $('#wave-trial-icon'), waveTrialName: $('#wave-trial-name'), waveTrialProgress: $('#wave-trial-progress'), waveTrialReward: $('#wave-trial-reward'),
  relicPanel: $('#relic-panel'), relicStrip: $('#relic-strip'), relicCount: $('#relic-count'), relicLoadout: $('#relic-loadout'), relicModal: $('#relic-modal'), relicOptions: $('#relic-options'), relicRecommend: $('#relic-recommend-btn'),
  burstMeter: $('#burst-meter'), burstValue: $('#burst-value'), burstProgress: $('#burst-progress'), burst: $('#burst-btn'), burstState: $('#burst-state'),
  momentumMeter: $('#momentum-meter'), momentumValue: $('#momentum-value'), momentumProgress: $('#momentum-progress'), momentumState: $('#momentum-state'),
  dangerHint: $('#danger-hint'), dangerArrow: $('#danger-arrow'), dangerLevel: $('#danger-level'), dangerLabel: $('#danger-label'), dangerTime: $('#danger-time'),
  firstMissionPanel: $('#first-mission-panel'), firstMissionStep: $('#first-mission-step'), firstMissionTitle: $('#first-mission-title'),
  firstMissionProgress: $('#first-mission-progress'), firstMissionCopy: $('#first-mission-copy'),
  combatTextRoot: $('#combat-text-root'), qualityBadge: $('#quality-badge'),
  damageFlash: $('#damage-flash'), combatImpactFlash: $('#combat-impact-flash'), pauseModal: $('#pause-modal'), resume: $('#resume-btn'), restart: $('#restart-btn'),
  titleBtn: $('#title-btn'), resultModal: $('#result-modal'), resultKicker: $('#result-kicker'), resultTitle: $('#result-title'),
  resultScore: $('#result-score'), resultKills: $('#result-kills'), resultRank: $('#result-rank'), resultUnits: $('#result-units'), resultAnalysis: $('#result-analysis'), resultShards: $('#result-shards'), resultShardsTotal: $('#result-shards-total'), resultGrowth: $('#result-growth-btn'), resultEquipmentReward: $('#result-equipment-reward'), resultMasteryReward: $('#result-mastery-reward'),
  playerName: $('#player-name'), saveScore: $('#save-score-btn'), resultRetry: $('#result-retry-btn'), leaderboard: $('#leaderboard'),
  runModeOptions: $('#run-mode-options'), runModeSummary: $('#run-mode-summary'), heroClassOptions: $('#hero-class-options'), heroClassSummary: $('#hero-class-summary'), councilOptions: $('#council-options'), councilSummary: $('#council-summary'), seedModeOptions: $('#seed-mode-options'), dailyEdictPreview: $('#daily-edict-preview'),
  runSeedChip: $('#run-seed-chip'), runSeedIcon: $('#run-seed-icon'), runSeedMode: $('#run-seed-mode'), runSeedValue: $('#run-seed-value'), runEdictName: $('#run-edict-name'), stageChip: $('#stage-chip'), stageIcon: $('#stage-icon'), stageName: $('#stage-name'), stageZone: $('#stage-zone'), stageProgress: $('#stage-progress'), councilChip: $('#council-chip'), councilChipIcon: $('#council-chip-icon'), councilChipName: $('#council-chip-name'), councilChipSupport: $('#council-chip-support'), resultNewRun: $('#result-new-run-btn'),
  codexPreviewModal: $('#codex-preview-modal'), codexPreviewCanvas: $('#codex-preview-canvas'), codexPreviewTitle: $('#codex-preview-title'), codexPreviewSubtitle: $('#codex-preview-subtitle'),
  codexFrameStatus: $('#codex-frame-status'), codexAssetSet: $('#codex-asset-set'), codexLodReadout: $('#codex-lod-readout'), codexDirectionReadout: $('#codex-direction-readout'), codexImpostorBtn: $('#codex-impostor-btn'),
  codexProgressReadout: $('#codex-progress-readout'), codexWeaknessReadout: $('#codex-weakness-readout'), codexLootReadout: $('#codex-loot-readout'), codexResearchTip: $('#codex-research-tip')
};

const GAME_VERSION = '1.0.37';
// const GAME_VERSION = '23.1.0'; historical lineage marker for pre-normalization contracts.
if (GAME_VERSION !== PUBLIC_GAME_VERSION) throw new Error('Public version policy mismatch');
function runtimeSpriteMarkup(path, alt = '', className = '') {
  if (!path) return '';
  const atlas = atlasSpriteMarkup(path, alt, className);
  return atlas || `<img class="${className}" src="${path}?v=${GAME_VERSION}" alt="${alt}" loading="lazy">`;
}
function equipmentIconMarkup(item, className = '') {
  if (item?.iconImage) return runtimeSpriteMarkup(item.iconImage, item.name || '', `equipment-sprite ${className}`);
  return `<span class="equipment-glyph ${className}">${item?.icon || '◆'}</span>`;
}

const CHARACTER_ASSET_IDS = Object.freeze([...new Set([
  ...Object.values(HERO_CLASS_ASSET_IDS),
  ...Object.values(GUARDIAN_ASSET_IDS),
  ...Object.values(MONSTER_ASSET_IDS),
  ...Object.values(BOSS_ASSET_IDS)
])]);
const CHARACTER_ASSET_LABELS = Object.freeze({
  [HERO_CLASS_ASSET_IDS.warrior]: '도깨비 전사 · 골든 샘플',
  [HERO_CLASS_ASSET_IDS.archer]: '도깨비 궁수 · 공용 리그 후보',
  [HERO_CLASS_ASSET_IDS.mage]: '도깨비 법사·도사·무당 · 공용 리그 후보',
  [GUARDIAN_ASSET_IDS.ember]: '불씨 깨비', [GUARDIAN_ASSET_IDS.frost]: '달서리 깨비',
  [GUARDIAN_ASSET_IDS.wind]: '바람 갓깨비', [GUARDIAN_ASSET_IDS.stone]: '바위 몽둥깨비',
  [GUARDIAN_ASSET_IDS.bell]: '방울 무당깨비', [GUARDIAN_ASSET_IDS.thunder]: '번개 장군깨비',
  [MONSTER_ASSET_IDS.imp]: '장난 요괴', [MONSTER_ASSET_IDS.runner]: '두억 질주꾼',
  [MONSTER_ASSET_IDS.brute]: '돌갑옷 귀수', [MONSTER_ASSET_IDS.shaman]: '저주 무당',
  [MONSTER_ASSET_IDS.ghost]: '달그림자 귀신', [MONSTER_ASSET_IDS.skeleton]: '백골 무사', [MONSTER_ASSET_IDS.crow]: '먹구름 까마귀',
  [BOSS_ASSET_IDS.tiger]: '저승 호랑이', [BOSS_ASSET_IDS.serpent]: '청월 이무기', [BOSS_ASSET_IDS.king]: '백귀 야행왕'
});

const FIRST_MISSIONS = [
  { id: 'summons', title: '수호대 3회 강림', goal: 3, reward: 35, copy: '무료 강림도 포함됩니다.' },
  { id: 'merges', title: '첫 자동 합성 성공', goal: 1, reward: 45, copy: '같은 도깨비·같은 별 3개를 모으세요.' },
  { id: 'bosses', title: '저승 호랑이 격파', goal: 1, reward: 80, copy: '완료 보상으로 삼지선다 소환권도 획득합니다.', ticket: 1 }
];

const META_STORAGE_KEY = 'dokkaebi-guardian-growth-v1';
const CONTROL_STORAGE_KEY = 'dokkaebi-control-settings-v1';
const DEFAULT_CONTROL_SETTINGS = Object.freeze({
  rotateSensitivity: 1,
  pinchSensitivity: 1,
  wheelSensitivity: 1,
  cameraProfile: DEFAULT_CAMERA_PROFILE_ID,
  minZoom: 10,
  maxZoom: 28,
  handedness: 'right',
  vibration: true,
  shakeIntensity: 1,
  flashIntensity: 1,
  reducedMotion: false,
  autoHudLayout: true,
  force3DModels: false
});
const META_TRAITS = {
  pouch: { icon: '◉', name: '달빛 주머니', copy: '매 판 시작 엽전을 10개씩 늘립니다.', effect: (level) => `시작 엽전 +${level * 10}`, costs: [12, 22, 34, 50, 70] },
  ward: { icon: '◆', name: '신목 결계', copy: '신목 최대 체력을 단계마다 7 늘립니다.', effect: (level) => `신목 체력 +${level * 7}`, costs: [12, 22, 34, 50, 70] },
  bond: { icon: '鬼', name: '깨비 맹약', copy: '모든 도깨비의 공격력을 단계마다 3.5% 높입니다.', effect: (level) => `도깨비 피해 +${(level * 3.5).toFixed(level % 2 ? 1 : 0)}%`, costs: [15, 25, 38, 56, 78] },
  stride: { icon: '➶', name: '야행 보법', copy: '이동 속도를 단계마다 2.5% 높입니다.', effect: (level) => `이동 속도 +${(level * 2.5).toFixed(level % 2 ? 1 : 0)}%`, costs: [14, 24, 37, 54, 75] },
  fortune: { icon: '三', name: '운명 부적', copy: '대박 기운 획득량을 단계마다 5% 높입니다.', effect: (level) => `대박 기운 +${level * 5}%`, costs: [14, 24, 37, 54, 75] },
  spirit: { icon: '✦', name: '수호신 그릇', copy: '매 판 수호신 혼불을 8%씩 충전한 채 시작합니다.', effect: (level) => `시작 혼불 ${level * 8}%`, costs: [16, 27, 41, 60, 84] }
};

class DokkaebiLuckDefense {
  constructor() {
    this.sound = new SoundEngine();
    this.clock = new THREE.Clock();
    this.engine = new MobileGameEngine();
    this.lifecycle = new RuntimeLifecycle();
    this.lowPower = this.engine.device.mobile || this.engine.device.lowEnd;
    this.appState = new AppStateMachineV103({
      initial: 'loading',
      onTransition: (entry) => {
        if (!entry.valid) console.warn('[AppStateMachineV103] non-contract transition', entry);
      }
    });
    Object.defineProperty(this, 'state', {
      configurable: false,
      enumerable: true,
      get: () => this.appState.current,
      set: (next) => this.transitionState(next, 'legacy-assignment')
    });
    this.disposed = false;
    this.animationFrameId = 0;
    this.transientVisuals = new Set();
    this.renderedFrameSerial = 0;
    this.renderFrameWaiters = [];
    this.firstPresentation = null;
    this.firstPresentationReport = null;
    this.startRunPending = false;
    this.deferredAssetPromise = null;
    this.deferredAssetsReady = false;
    this.deferredAssetReport = null;
    this.assetLoadingPlanV115 = ASSET_LOADING_PLAN_V115;
    this.artApprovalReportV115 = createArtApprovalReportV115();
    this.artApprovalReportV117 = createAssetApprovalReportV117();
    window.__DOKKAEBI_ART_APPROVAL_V117__ = this.artApprovalReportV117;
    this.staticDeploymentGateV118 = createStaticDeploymentGateReportV118();
    window.__DOKKAEBI_STATIC_DEPLOYMENT_V118__ = this.staticDeploymentGateV118;
    this.bundleMarkerGateV119 = createBundleMarkerGateReportV119();
    window.__DOKKAEBI_BUNDLE_MARKER_V119__ = this.bundleMarkerGateV119;
    this.heroHudPolishV120 = createHeroHudPolishReportV120();
    window.__DOKKAEBI_HERO_HUD_POLISH_V120__ = this.heroHudPolishV120;
    this.liveCombatV121 = null;
    this.battlefieldClarityV122 = null;
    this.releaseAssuranceV124 = null;
    this.actionAssetAssuranceV125 = null;
    this.bossEncounterAssuranceV126 = null;
    this.bossTacticalAssuranceV127 = null;
    this.battlefieldVisibilityV128 = null;
    this.assetRefinementV129 = null;
    this.assetLineageV131 = null;
    this.silhouetteAssuranceV132 = null;
    this.bossIdentityAssuranceV133 = null;
    this.elapsed = 0;
    this.shake = 0;
    const initialCameraProfile = getCameraProfile(DEFAULT_CAMERA_PROFILE_ID);
    this.cameraYaw = Math.PI * .25;
    this.cameraPitch = initialCameraProfile.pitch;
    this.cameraDistance = initialCameraProfile.distance;
    this.cameraDistanceTarget = initialCameraProfile.distance;
    this.cameraCollisionDistance = initialCameraProfile.distance;
    this.activeCameraProfile = initialCameraProfile;
    this.lastAppliedCameraPreset = initialCameraProfile.id;
    this.pointerDown = null;
    this.lookPointer = null;
    this.lookPointers = new Map();
    this.pinchState = null;
    this.mapTouchDiagnosticsV116 = {
      version: '1.0.21', accepted: 0, rejected: 0, cancelled: 0,
      bands: { left: 0, center: 0, right: 0 }, lastBand: '', lastNdc: null
    };
    window.__DOKKAEBI_MAP_TOUCH_V116__ = this.mapTouchDiagnosticsV116;
    this.cinematic = null;
    this.input = { x: 0, y: 0, keys: new Set() };
    this.moveTarget = null;
    this.moveTargetRaw = null;
    this.moveTargetMarker = null;
    this.navigationObstacles = [];
    this.cameraObstacles = [];
    this.keyboardMoveActive = false;
    this.runStats = this.createRunStats();
    this.killChain = 0;
    this.killChainTimer = 0;
    this.combatTextCount = 0;
    this.qualityScale = this.engine.qualityScale;
    this.qualityAdjusted = false;
    this.modalStack = [];
    this.modalOrigins = new WeakMap();
    this.modalParents = new WeakMap();
    this.currentCodexSection = 'guardian';

    this.enemies = [];
    this.units = [];
    this.projectiles = [];
    this.coins = [];
    this.particles = [];
    this.wisps = [];
    this.unitPads = [];
    this.gates = [];
    this.hazards = [];
    this.warningFlags = new Set();
    this.pendingContract = null;
    this.activeContract = null;
    this.bossSpecialSerial = 0;
    this.metaProgress = this.loadMetaProgress();
    this.equipmentState = loadEquipmentState();
    this.heroMastery = loadHeroMastery();
    this.progressRewarded = false;
    this.codexProgress = loadCodexProgress();
    this.controlSettings = this.loadControlSettings();
    this.mods = this.createDefaultMods();
    this.runRewarded = false;
    this.lastShardReward = 0;
    this.lastDangerKey = '';
    this.dangerHapticCooldown = 0;
    this.displayDanger = null;
    this.pendingDangerKey = '';
    this.pendingDangerTimer = 0;
    this.dangerLostGrace = 0;
    this.hazardSerial = 0;
    this.enemySerial = 0;
    this.commandCooldown = 0;
    this.commandActiveKey = '';
    this.geometryCache = new Map();
    this.enemyPools = {};
    this.enemyPoolRoot = null;
    this.lodFrame = 0;
    this.worldReady = false;
    this.activeOmen = null;
    this.lastOmenId = '';
    this.moonWard = 0;
    this.jackpotTimer = 0;
    this.eliteKills = 0;
    this.selectedRunModeId = this.loadRunMode();
    this.activeRunMode = getRunMode(this.selectedRunModeId);
    this.selectedHeroClassId = this.loadHeroClass();
    this.heroClass = getHeroClass(this.selectedHeroClassId);
    this.selectedCouncilSupportId = this.loadCouncilSupport();
    this.guardianCouncil = resolveGuardianCouncil(this.selectedHeroClassId, this.selectedCouncilSupportId);
    this.selectedSeedModeId = this.loadSeedMode();
    this.runSeed = '';
    this.runRandom = Math.random;
    this.dailyEdict = getDailyEdict(createDailySeed());
    this.relicHistory = [];
    this.activeRelicSets = [];
    this.lastRelicOfferBossWave = false;
    this.battlefieldTheme = getBattlefieldTheme('default');
    this.themeTarget = getBattlefieldTheme('default');
    this.currentTrial = null;
    this.lastTrialId = '';
    this.postWaveQueue = [];
    this.autoWaveCountdown = 0;
    this.autoWaveCountdownDuration = 10;
    this.autoWaveAnnounced = -1;
    this.soulGauge = 0;
    this.guardianBurstTimer = 0;
    this.waveMaxChain = 0;
    this.waveTrialEliteSpawned = 0;
    this.animations = new AnimationStateSystem({ lowPower: this.lowPower, mobile: this.engine.device.mobile });
    this.codexViewer = null;
    this.fxAtlasTexture = null;
    this.viewportProfile = '';
    this.uiBound = false;
    this.hudLayout = null;
    this.frameScheduler = new FrameBudgetScheduler();
    this.coreFoundation = new CoreFoundationDirectorV101({ versionPolicy: VERSION_POLICY, lowPower: this.lowPower });
    this.encounterDirector = new EncounterDirector({ random: () => this.random() });
    this.statusEffects = new StatusEffectSystem({ random: () => this.random() });
    this.combatTelemetry = new CombatTelemetry();
    this.runtimeBudget = new RuntimeBudgetManager({ config: this.engine.config, lowPower: this.lowPower });
    this.elementalReactions = new ElementalReactionSystem();
    this.battleMomentum = new BattleMomentumSystem();
    this.bossEscalation = new BossEscalationDirector();
    this.bossBreak = new BossBreakSystem();
    this.campaign = new MoonfrontCampaignDirector();
    this.battlefieldEvents = new BattlefieldEventDirector({ random: () => this.random() });
    this.battlefieldProps = new BattlefieldPropSystem({ lowPower: this.lowPower });
    this.waveFlowGuard = new WaveFlowGuard();
    this.waveReliability = new WaveReliabilityDirector();
    this.browserReliability = new BrowserReliabilityLab({ version: GAME_VERSION });
    this.assetPresence = new AssetPresenceEnforcer({ version: GAME_VERSION });
    this.mobileHudV23 = new MobileHudDirectorV23();
    this.crossPlatformShellV112 = new CrossPlatformShellV112();
    this.guardianTargetingV22 = new GuardianTargetingDirectorV22();
    this.automationV22 = new AutomationDirectorV22();
    this.autoPausedByVisibility = false;
    this.autoPausedByContextLoss = false;
    this.lastVisibilityResumeSeconds = 0;
    this.runtimeErrors = [];
    this.runtimeErrorKeys = new Set();
    this.saveMigration = migrateSaveSchema();
    this.activeEncounterPlan = null;
    this.lastEncounterResult = null;
    this.productionConsole = null;

    this.assertRequiredUI();
    this.hudLayout = new AdaptiveHudLayout({
      elements: {
        hud: ui.hud, runSeed: ui.runSeedChip, stageChip: ui.stageChip, councilChip: ui.councilChip, moonOmen: ui.moonOmen, moonWard: ui.moonWard,
        luckMeter: ui.luckMeter, burstMeter: ui.burstMeter, momentumMeter: ui.momentumMeter, waveTrial: ui.waveTrial,
        synergyPanel: ui.synergyPanel, firstMission: ui.firstMissionPanel, killChain: ui.killChain,
        relicPanel: ui.relicPanel, unitStrip: ui.unitStrip, bossHealth: ui.bossHealth,
        joystick: ui.joystick, actionDock: ui.actionDock
      }
    });
    this.hudLayout.mount();
    this.mobileHudV23.install();
    this.crossPlatformShellV112.install();
    this.assetPresence.install();
    this.applyViewportUiProfile();
    this.initThree();
    this.firstPresentation = new FirstPresentationDirectorV107({
      titleRoot: ui.title,
      canvas: ui.canvas,
      schedule: (callback, delay) => this.scheduleUi(callback, delay),
      cancel: (token) => this.lifecycle.ui.cancel(token),
      waitForFrames: (count, timeout) => this.waitForRenderedFrames(count, timeout),
      applyFallback: (context) => this.applyFirstPresentationFallback(context),
      updateLoading: (status, detail) => this.setLoadingProgress(94, status, detail)
    });
    this.browserReliability.mount({
      canvas: ui.canvas,
      getRuntimeSnapshot: () => this.getBrowserReliabilitySnapshot()
    });
    this.combatPresentation = new CombatPresentation({
      parent: this.pooledEffectRoot,
      flashElement: ui.combatImpactFlash,
      lowPower: this.lowPower,
      reducedMotion: () => Boolean(this.controlSettings?.reducedMotion)
    });
    this.bindUI();
    this.listen(window, 'pagehide', (event) => { if (!event.persisted) this.dispose(); }, {}, 'pagehide-dispose');
    this.populateCollection();
    this.renderMetaProgress();
    this.renderRunModeSelector();
    this.renderHeroClassSelector();
    this.updateTitleLoadoutSummary();
    this.renderCouncilSelector();
    this.renderSeedModeSelector();
    this.renderRelicStrip();
    this.renderEquipmentModal();
    this.animate();
    this.ready = this.initializeGame();

    console.info(`[DokkaebiLuckDefense3D] game v${GAME_VERSION} / engine v${ENGINE_VERSION}`, this.engine.diagnostics);
  }

  transitionState(next, source = 'runtime', detail = null) {
    return this.appState.transition(next, { source, detail });
  }

  listen(target, type, handler, options = {}, key = '') {
    return this.lifecycle.events.listen(target, type, handler, options, key);
  }

  scheduleUi(callback, delay = 0, options = {}) {
    return this.lifecycle.ui.schedule(callback, delay, options);
  }

  scheduleRun(callback, delay = 0, options = {}) {
    const runId = this.runId;
    const guard = options.guard;
    return this.lifecycle.run.schedule(callback, delay, {
      ...options,
      guard: () => this.runId === runId && (!guard || guard())
    });
  }

  scheduleEffect(callback, delay = 0, options = {}) {
    const runId = this.runId;
    const guard = options.guard;
    return this.lifecycle.effects.schedule(callback, delay, {
      ...options,
      guard: () => this.runId === runId && (!guard || guard())
    });
  }

  animateTransientVisual({ duration = 0.3, update, cleanup, guard = null } = {}) {
    if (typeof update !== 'function' || typeof cleanup !== 'function') throw new TypeError('Transient visual requires update and cleanup callbacks.');
    const runId = this.runId;
    const startedAt = this.elapsed;
    const entry = { frame: 0, finished: false, finish: null };
    const finish = () => {
      if (entry.finished) return;
      entry.finished = true;
      if (entry.frame) this.lifecycle.frames.cancel(entry.frame);
      entry.frame = 0;
      this.transientVisuals.delete(entry);
      cleanup();
    };
    entry.finish = finish;
    const step = () => {
      if (this.disposed || this.runId !== runId || (guard && !guard())) {
        finish();
        return;
      }
      const progress = clamp((this.elapsed - startedAt) / Math.max(0.001, Number(duration) || 0.3), 0, 1);
      update(progress);
      if (progress >= 1) {
        finish();
        return;
      }
      entry.frame = this.lifecycle.frames.request(step, { guard: () => !this.disposed && this.runId === runId });
    };
    this.transientVisuals.add(entry);
    step();
    return finish;
  }

  clearTransientVisuals() {
    for (const entry of [...this.transientVisuals]) entry.finish?.();
    this.transientVisuals.clear();
  }

  assertRequiredUI() {
    const missing = Object.entries(ui).filter(([, element]) => !element).map(([name]) => name);
    if (missing.length) throw new Error(`UI 연결 누락: ${missing.join(', ')}`);
  }

  setLoadingProgress(percent, status, detail = '') {
    const value = clamp(Math.round(percent), 0, 100);
    ui.loadingProgress.style.width = `${value}%`;
    ui.loadingProgress.parentElement?.setAttribute('aria-valuenow', String(value));
    if (status) ui.loadingStatus.textContent = status;
    if (detail) ui.loadingDetail.textContent = detail;
    window.__DOKKAEBI_UPDATE_BOOT_GATE__?.({
      status: status || ui.loadingStatus?.textContent || '',
      detail: detail || ui.loadingDetail?.textContent || '',
      mode: value >= 90 ? 'presentation' : 'loading'
    });
  }

  waitForUiPaint(frames = 2, timeoutMs = 900) {
    const targetFrames = Math.max(1, Number(frames) || 1);
    return new Promise((resolve) => {
      let remaining = targetFrames;
      let settled = false;
      let timeoutToken = 0;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        this.lifecycle.ui.cancel(timeoutToken);
        resolve(value);
      };
      const step = () => {
        if (settled) return;
        remaining -= 1;
        if (remaining <= 0) finish(true);
        else window.requestAnimationFrame(step);
      };
      timeoutToken = this.scheduleUi(() => finish(false), Math.max(120, Number(timeoutMs) || 900));
      window.requestAnimationFrame(step);
    });
  }

  waitForRenderedFrames(count = 2, timeoutMs = 2600) {
    const target = this.renderedFrameSerial + Math.max(1, Number(count) || 1);
    return new Promise((resolve) => {
      const waiter = { target, resolve, timer: 0 };
      waiter.timer = this.scheduleUi(() => {
        this.renderFrameWaiters = this.renderFrameWaiters.filter((entry) => entry !== waiter);
        resolve(false);
      }, timeoutMs);
      this.renderFrameWaiters.push(waiter);
      this.flushRenderedFrameWaiters();
    });
  }

  flushRenderedFrameWaiters() {
    if (!this.renderFrameWaiters.length) return;
    const pending = [];
    for (const waiter of this.renderFrameWaiters) {
      if (waiter.target <= this.renderedFrameSerial) {
        this.lifecycle.ui.cancel(waiter.timer);
        waiter.resolve(true);
      } else pending.push(waiter);
    }
    this.renderFrameWaiters = pending;
  }

  applyFirstPresentationFallback({ reason = 'frame-timeout' } = {}) {
    const result = this.engine.applyPresentationSafeMode?.({ reason }) || { applied: false };
    this.lowPower = true;
    document.documentElement.dataset.presentationFallback = result.applied ? 'active' : 'requested';
    document.body.classList.add('presentation-safe-mode');
    this.renderer?.setSize?.(window.innerWidth, window.innerHeight, false);
    this.camera?.updateProjectionMatrix?.();
    this.browserReliability?.noteMilestone('first-presentation-fallback', { reason, ...result });
    return result.applied;
  }

  async prepareFirstPresentation() {
    try {
      this.firstPresentationReport = await this.firstPresentation.prepare();
    } catch (error) {
      this.recordRuntimeError(error, 'first-presentation');
      this.applyFirstPresentationFallback({ reason: 'presentation-director-error' });
      document.documentElement.dataset.presentationGate = 'released-safe';
      document.documentElement.dataset.presentationQuality = 'safe';
      this.firstPresentationReport = Object.freeze({
        status: 'ready',
        stableFrames: false,
        fallbackApplied: true,
        failOpen: true,
        degraded: true,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return this.firstPresentationReport;
  }

  async initializeGame() {
    const bootStartedAt = performance.now();
    this.setLoadingProgress(8, '빠른 시작 엔진을 준비하는 중...', `초기 ${BOOT_ASSET_CATALOG.length}개 · 백그라운드 ${DEFERRED_ASSET_CATALOG.length}개`);
    const decoderState = await this.assetPipeline.warmDecoders(BOOT_ASSET_CATALOG);
    this.setLoadingProgress(20, '필수 로더 준비 완료', decoderState.deferred ? '무거운 GLB 로더는 타이틀 화면 이후에 준비합니다.' : '필수 디코더를 준비했습니다.');

    const report = await this.assetPipeline.preload(BOOT_ASSET_CATALOG, {
      concurrency: this.lowPower ? 2 : 4,
      onProgress: ({ ratio, label, status, detail }) => {
        const percent = 20 + ratio * 45;
        const stateLabel = status === 'failed' ? '안전 에셋 적용' : status === 'fallback' ? '기본 그래픽 사용' : '첫 화면 에셋 확인 중';
        this.setLoadingProgress(percent, stateLabel, `${label || 'critical asset'}${detail ? ` · ${detail}` : ''}`);
      }
    });
    this.assetReport = report;
    this.applyPrototypeTextures();
    this.renderAssetDiagnostics();

    // The optional battlefield atlas and the remaining art are intentionally
    // not part of the first-screen gate. The procedural environment is already
    // complete enough to show the title immediately.
    this.setLoadingProgress(72, '달빛 장터를 빠르게 배치하는 중...', `필수 텍스처 ${report.textureMemoryMB.toFixed(1)}MB / ${report.textureBudgetMB}MB`);
    this.createWorld(true);
    this.runRuntimeVisualAudit();
    this.state = 'title';
    ui.title.classList.add('visible');
    this.setLoadingProgress(90, '첫 장면을 여는 중...', '경량 타이틀 아트와 첫 렌더 프레임만 확인합니다.');
    const presentation = await this.prepareFirstPresentation();
    const bootMs = Math.round(performance.now() - bootStartedAt);
    const readyDetail = presentation.fallbackApplied
      ? `안전 그래픽 모드 · ${bootMs}ms`
      : `빠른 시작 완료 · ${bootMs}ms`;
    this.setLoadingProgress(100, '준비 완료', readyDetail);
    ui.loading.classList.remove('visible');
    this.browserReliability?.noteMilestone('critical-boot-ready-v115', {
      durationMs: bootMs,
      criticalAssets: BOOT_ASSET_CATALOG.length,
      deferredAssets: DEFERRED_ASSET_CATALOG.length
    });
    this.startDeferredAssetPreload();
    const loadedModels = CHARACTER_ASSET_IDS.filter((id) => this.assetPipeline.get(id)?.scene).length;
    const combatArt = this.combatVisualV112?.diagnostics || { loaded: 0, expected: 21 };
    ui.qualityBadge.textContent = `빠른 시작 · 전투 아트 ${combatArt.loaded}/${combatArt.expected} · 나머지 백그라운드 준비`;
    ui.qualityBadge.classList.remove('hidden');
    this.scheduleUi(() => ui.qualityBadge.classList.add('hidden'), 1800, { key: 'quality-badge-hide' });
    return this;
  }

  startDeferredAssetPreload() {
    if (this.deferredAssetPromise) return this.deferredAssetPromise;
    const task = async () => {
      const startedAt = performance.now();
      await this.assetPipeline.warmDecoders(DEFERRED_ASSET_CATALOG);
      const report = await this.assetPipeline.preload(DEFERRED_ASSET_CATALOG, {
        concurrency: this.lowPower ? 2 : 4
      });
      await this.battlefieldSprites.preload();
      if (this.state === 'title' && this.worldRoot) {
        this.battlefieldSprites.populate(this.worldRoot, { titleMode: true });
      }
      this.deferredAssetsReady = true;
      this.deferredAssetReport = report;
      this.renderAssetDiagnostics();
      this.browserReliability?.noteMilestone('deferred-assets-ready-v115', {
        durationMs: Math.round(performance.now() - startedAt),
        loaded: report.assets.size,
        failures: report.failures.length,
        battlefieldAtlas: Boolean(this.battlefieldSprites?.loaded)
      });
      return report;
    };
    this.deferredAssetPromise = new Promise((resolve, reject) => {
      const run = () => task().then(resolve, reject);
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 700 });
      } else {
        this.scheduleUi(run, 80, { key: 'deferred-assets-v115' });
      }
    }).catch((error) => {
      this.recordRuntimeError(error, 'deferred-assets-v115');
      return null;
    });
    return this.deferredAssetPromise;
  }

  async waitForDeferredAssets(timeoutMs = 1200) {
    if (this.deferredAssetsReady) return true;
    const pending = this.startDeferredAssetPreload();
    let timer = 0;
    const timeout = new Promise((resolve) => {
      timer = this.scheduleUi(() => resolve(false), Math.max(0, timeoutMs));
    });
    const ready = await Promise.race([pending.then(() => this.deferredAssetsReady), timeout]);
    this.lifecycle.ui.cancel(timer);
    return Boolean(ready);
  }

  initThree() {
    this.renderer = this.engine.createRenderer(ui.canvas);
    this.battlefieldSprites = new BattlefieldSpriteDirectorV16({ lowPower: this.lowPower });
    this.cameraDirectorV16 = new CameraDirectorV16();
    this.assetPipeline = new AssetPipeline(this.renderer, {
      qualityTier: this.engine.assetQualityTier,
      textureBudgetMB: this.engine.textureBudgetMB,
      lowPower: this.lowPower
    });
    this.combatVisualV112 = new CombatArtPolishDirectorV114({ assetPipeline: this.assetPipeline, lowPower: this.lowPower });
    this.liveCombatV121 = new LiveCombatDirectorV121({
      combatVisual: this.combatVisualV112,
      engine: this.engine,
      hud: ui.hud,
      bossHealth: ui.bossHealth
    });
    this.liveCombatV121.install();
    this.battlefieldClarityV122 = new BattlefieldClarityDirectorV122({
      combatVisual: this.combatVisualV112,
      liveCombat: this.liveCombatV121,
      hud: ui.hud,
      bossHealth: ui.bossHealth
    });
    this.battlefieldClarityV122.install();
    this.releaseAssuranceV124 = new ReleaseAssuranceDirectorV124({
      combatVisual: this.combatVisualV112,
      hud: ui.hud,
      bossHealth: ui.bossHealth
    });
    this.releaseAssuranceV124.install();
    this.actionAssetAssuranceV125 = new ActionAssetAssuranceDirectorV125({
      combatVisual: this.combatVisualV112,
      hud: ui.hud,
      bossHealth: ui.bossHealth,
      resultModal: ui.resultModal,
      collectionModal: ui.collectionModal
    });
    this.actionAssetAssuranceV125.install();
    this.bossEncounterAssuranceV126 = new BossEncounterAssuranceDirectorV126({
      combatVisual: this.combatVisualV112,
      hud: ui.hud,
      bossHealth: ui.bossHealth,
      bossHealthProgress: ui.bossHealthProgress,
      bossHealthDamage: ui.bossHealthDamage,
      bossIntent: ui.bossIntent,
      dangerHint: ui.dangerHint,
      mission: ui.mission,
      bossBanner: ui.boss
    });
    this.bossEncounterAssuranceV126.install();
    this.bossTacticalAssuranceV127 = new BossTacticalAssuranceDirectorV127({
      hud: ui.hud,
      bossHealth: ui.bossHealth,
      combatVisual: this.combatVisualV112
    });
    this.bossTacticalAssuranceV127.install();
    this.battlefieldVisibilityV128 = new BattlefieldVisibilityAssuranceDirectorV128({
      tacticalDirector: this.bossTacticalAssuranceV127,
      combatVisual: this.combatVisualV112
    });
    this.battlefieldVisibilityV128.install();
    this.assetRefinementV129 = new AssetRefinementAssuranceDirectorV129({
      visibilityDirector: this.battlefieldVisibilityV128,
      tacticalDirector: this.bossTacticalAssuranceV127,
      combatVisual: this.combatVisualV112
    });
    this.assetRefinementV129.install();
    this.assetLineageV131 = new AssetLineageAssuranceDirectorV131({ combatVisual: this.combatVisualV112 });
    this.assetLineageV131.install();
    this.silhouetteAssuranceV132 = new SilhouetteAssuranceDirectorV132({
      combatVisual: this.combatVisualV112,
      refinementDirector: this.assetRefinementV129
    });
    this.silhouetteAssuranceV132.install();
    this.bossIdentityAssuranceV133 = new BossIdentityAssuranceDirectorV133({
      bossHealth: ui.bossHealth,
      combatVisual: this.combatVisualV112
    });
    this.bossIdentityAssuranceV133.install();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38275a);
    this.scene.fog = new THREE.FogExp2(0x4a356b, .015);

    const initialCameraProfile = getCameraProfile(this.controlSettings?.cameraProfile || DEFAULT_CAMERA_PROFILE_ID);
    this.camera = new THREE.PerspectiveCamera(initialCameraProfile.fov, window.innerWidth / window.innerHeight, .1, 160);
    this.camera.position.set(14, 16, 18);

    this.hemiLight = new THREE.HemisphereLight(0xcfe8ff, 0x6d4765, 1.7);
    this.scene.add(this.hemiLight);
    this.moonLight = new THREE.DirectionalLight(0xffd39a, 2.65);
    this.moonLight.position.set(14, 24, 11);
    this.moonLight.castShadow = this.renderer.shadowMap.enabled;
    this.moonLight.shadow.mapSize.set(this.lowPower ? 512 : 1024, this.lowPower ? 512 : 1024);
    this.moonLight.shadow.camera.left = -34;
    this.moonLight.shadow.camera.right = 34;
    this.moonLight.shadow.camera.top = 34;
    this.moonLight.shadow.camera.bottom = -34;
    this.scene.add(this.moonLight);
    this.rimLight = new THREE.DirectionalLight(0x78bfff, 1.25);
    this.rimLight.position.set(-18, 15, -16);
    this.rimLight.castShadow = false;
    this.scene.add(this.rimLight);

    this.worldRoot = new THREE.Group();
    this.dynamicRoot = new THREE.Group();
    this.effectRoot = new THREE.Group();
    this.pooledEffectRoot = new THREE.Group();
    this.enemyPoolRoot = new THREE.Group();
    this.enemyPoolRoot.name = 'EnemyPoolRoot';
    this.enemyPoolRoot.visible = false;
    this.scene.add(this.worldRoot, this.dynamicRoot, this.effectRoot, this.pooledEffectRoot, this.enemyPoolRoot);
    this.combatReadability = new CombatReadabilityDirectorV21({ effectRoot: this.effectRoot, lowPower: this.lowPower });
    this.blobShadows = new BlobShadowSystem(this.lowPower ? 72 : 128);
    this.scene.add(this.blobShadows.batch.mesh);
    this.particleGeometry = new THREE.TetrahedronGeometry(.1, 0);
    const particleLimit = this.lowPower ? this.engine.config.budgets.activeParticlesMobile : this.engine.config.budgets.activeParticlesDesktop;
    this.particlePool = new ObjectPool({
      initialSize: this.lowPower ? 36 : 72,
      maxSize: particleLimit,
      create: () => {
        const mesh = new THREE.Mesh(this.particleGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        mesh.visible = false;
        this.pooledEffectRoot.add(mesh);
        return { mesh, velocity: new THREE.Vector3(), life: 0, maxLife: 1, gravity: 0 };
      },
      reset: (particle) => {
        particle.mesh.visible = false;
        particle.mesh.material.opacity = 0;
        particle.mesh.scale.setScalar(1);
        particle.velocity.set(0, 0, 0);
        particle.life = 0;
      }
    });
    this.initReusablePools();
    this.renderStatsHud = new RenderStatsHUD(this.renderer);
    this.productionConsole = new ProductionConsole({
      artSummary: ART_PRODUCTION_SUMMARY,
      milestones: MASSIVE_UPDATE_MILESTONES,
      getDiagnostics: () => ({
        versionPolicy: VERSION_POLICY,
        coreFoundation: this.coreFoundation?.diagnostics || {},
        performance: this.engine.monitor.snapshot,
        quality: this.engine.qualityGovernor?.diagnostics || {},
        qualityScale: this.engine.qualityScale,
        effectBudgetScale: this.engine.effectBudgetScale,
        drawCalls: this.renderer.info?.render?.calls || 0,
        triangles: this.renderer.info?.render?.triangles || 0,
        assets: this.assetPipeline?.diagnostics || {},
        combatArt: this.combatVisualV112?.diagnostics || {},
        encounter: this.encounterDirector?.diagnostics || {},
        combat: this.combatTelemetry?.snapshot || {},
        statusEffects: this.statusEffects?.diagnostics || {},
        runtimeBudget: this.runtimeBudget?.diagnostics || {},
        reactions: this.elementalReactions?.diagnostics || {},
        momentum: this.battleMomentum?.diagnostics || {},
        bossEscalation: this.bossEscalation?.diagnostics || {},
        bossBreak: this.bossBreak?.diagnostics || {},
        campaign: this.campaign?.diagnostics || {},
        council: this.guardianCouncil || {},
        equipmentForge: { forged: this.equipmentState?.forged || 0, essence: this.equipmentState?.essence || 0 },
        heroRoster: { classes: HERO_CLASS_ORDER.length, selected: this.selectedHeroClassId, passive: this.activeHeroPassive?.id || '' },
        assetForge: IP_ASSET_LIBRARY_V15,
        spriteAtlas: this.battlefieldSprites?.diagnostics || {},
        battlefieldProps: this.battlefieldProps?.diagnostics || {},
        runtimeVisualAudit: this.runtimeVisualAudit || null,
        waveFlow: this.waveFlowGuard?.diagnostics || {},
        reliability: this.waveReliability?.diagnostics || {},
        waveReliability: this.waveReliability?.report || {},
        browserReliability: this.browserReliability?.diagnostics || {},
        assetPresence: this.assetPresence?.report || {},
        mobileHudV23: this.mobileHudV23?.report || {},
        crossPlatformShellV112: this.crossPlatformShellV112?.report || {},
        combatReadability: this.combatReadability?.snapshot || {},
        runtimeErrors: { count: this.runtimeErrors.length, last: this.runtimeErrors.at(-1) || null },
        battlefieldEvent: this.battlefieldEvents?.diagnostics || {},
        cameraDirector: this.cameraDirectorV16?.snapshot || {},
        goldenSlice: GOLDEN_SLICE_CERTIFICATION_SUMMARY,
        camera: { profile: this.activeCameraProfile?.id || this.controlSettings.cameraProfile, label: this.activeCameraProfile?.label || '', distance: Number(this.cameraDistance.toFixed(2)), target: Number(this.cameraDistanceTarget.toFixed(2)), fov: this.camera?.fov || 0 },
        saveSchemaVersion: SAVE_SCHEMA_VERSION
      })
    });

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.listen(window, 'resize', () => this.onResize(), {}, 'window-resize');
    if (window.visualViewport) this.listen(window.visualViewport, 'resize', () => this.applyViewportUiProfile(), {}, 'visual-viewport-resize');
  }

  initReusablePools() {
    const projectileBudget = this.lowPower
      ? this.engine.config.budgets.activeProjectilesMobile
      : this.engine.config.budgets.activeProjectilesDesktop;
    const orbCapacity = Math.max(16, Math.round(projectileBudget * .6));
    const specialCapacity = Math.max(8, Math.floor((projectileBudget - orbCapacity) / 2));
    const makeProjectilePool = (poolKey, geometry, capacity) => new ObjectPool({
      initialSize: Math.min(capacity, this.lowPower ? 8 : 14),
      maxSize: capacity,
      create: () => {
        const mesh = new THREE.Mesh(geometry, this.createProjectileMaterial(poolKey));
        mesh.visible = false;
        mesh.frustumCulled = false;
        if (!this.lowPower) {
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(.52, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false })
          );
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(.82, .07, 6, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false })
          );
          ring.rotation.x = Math.PI / 2;
          const trail = new THREE.Mesh(
            new THREE.ConeGeometry(.38, 1.5, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
          );
          trail.rotation.x = Math.PI / 2;
          trail.position.z = -.82;
          trail.scale.set(1, 1, 1.25);
          mesh.add(core, ring, trail);
          mesh.userData.fxCore = core;
          mesh.userData.fxRing = ring;
          mesh.userData.fxTrail = trail;
        }
        this.pooledEffectRoot.add(mesh);
        return { mesh, poolKey, hitTargets: new Set(), alive: false, target: null, owner: null, life: 0 };
      },
      reset: (projectile) => {
        projectile.mesh.visible = false;
        projectile.mesh.material.opacity = 0;
        projectile.mesh.position.set(0, -100, 0);
        projectile.mesh.rotation.set(0, 0, 0);
        projectile.mesh.scale.setScalar(1);
        projectile.hitTargets.clear();
        projectile.alive = false;
        projectile.target = null;
        projectile.owner = null;
        projectile.life = 0;
      }
    });
    this.projectilePools = {
      orb: makeProjectilePool('orb', new THREE.SphereGeometry(1, 8, 6), orbCapacity),
      stone: makeProjectilePool('stone', new THREE.DodecahedronGeometry(1.55, 0), specialCapacity),
      wind: makeProjectilePool('wind', new THREE.ConeGeometry(.65, 3.4, 7), specialCapacity)
    };
    this.projectilePoolCapacity = orbCapacity + specialCapacity * 2;

    this.coinPoolCapacity = this.lowPower
      ? this.engine.config.budgets.activeCoinsMobile
      : this.engine.config.budgets.activeCoinsDesktop;
    const coinGeometry = new THREE.CylinderGeometry(.18, .18, .07, 12);
    this.coinPool = new ObjectPool({
      initialSize: this.lowPower ? 24 : 40,
      maxSize: this.coinPoolCapacity,
      create: () => {
        const mesh = new THREE.Mesh(coinGeometry, new THREE.MeshStandardMaterial({ color: 0xffd25e, emissive: 0xd57c1d, emissiveIntensity: 1.4, metalness: .45, roughness: .3 }));
        mesh.visible = false;
        mesh.frustumCulled = false;
        this.pooledEffectRoot.add(mesh);
        return { mesh, value: 0, velocity: new THREE.Vector3(), age: 0, grounded: false, phase: 0 };
      },
      reset: (coin) => {
        coin.mesh.visible = false;
        coin.mesh.position.set(0, -100, 0);
        coin.mesh.rotation.set(0, 0, 0);
        coin.value = 0;
        coin.velocity.set(0, 0, 0);
        coin.age = 0;
        coin.grounded = false;
        coin.phase = 0;
      }
    });
  }

  bindUI() {
    if (this.uiBound) return;
    this.uiBound = true;
    const on = (target, type, handler, options = {}, key = '') => this.listen(target, type, handler, options, key);

    on(ui.start, 'click', () => this.startRunFromTitle({ reuseSeed: false }), {}, 'start-run');
    on(ui.title, 'pointerup', (event) => {
      if (this.state !== 'title' || ui.start?.disabled || this.startRunPending) return;
      if (event.target.closest('button, a, input, select, textarea, [role="button"]')) return;
      this.startRunFromTitle({ reuseSeed: false });
    }, { passive: true }, 'title-touch-anywhere');
    on(window, 'keydown', (event) => {
      if (this.state !== 'title' || ui.start?.disabled || this.startRunPending || this.isTypingTarget(event.target)) return;
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      this.startRunFromTitle({ reuseSeed: false });
    }, { passive: false }, 'title-key-start');
    on(ui.titleSetup, 'click', () => this.showModal(ui.titleSetupModal, { trigger: ui.titleSetup }), {}, 'open-title-setup');
    on(ui.titleVault, 'click', () => this.showModal(ui.titleVaultModal, { trigger: ui.titleVault }), {}, 'open-title-vault');
    on(ui.how, 'click', () => this.showModal(ui.howModal, { parent: ui.titleVaultModal, trigger: ui.how }), {}, 'open-how');
    on(ui.collection, 'click', () => { this.renderCodex(this.currentCodexSection); this.showModal(ui.collectionModal, { parent: ui.titleVaultModal, trigger: ui.collection }); }, {}, 'open-codex');
    on(ui.meta, 'click', () => { this.renderMetaProgress(); this.showModal(ui.metaModal, { parent: ui.titleVaultModal, trigger: ui.meta }); }, {}, 'open-meta');
    on(ui.equipment, 'click', () => { this.renderEquipmentModal(); this.showModal(ui.equipmentModal, { parent: ui.titleVaultModal, trigger: ui.equipment }); }, {}, 'open-equipment-title');
    on(ui.hudEquipment, 'click', () => this.openEquipmentModal(ui.hudEquipment), {}, 'open-equipment-hud');
    on(ui.pauseEquipment, 'click', () => this.openEquipmentModal(ui.pauseEquipment), {}, 'open-equipment-pause');
    on(ui.controls, 'click', () => this.openControlSettings(null, ui.controls), {}, 'open-controls-title');
    on(ui.pauseControls, 'click', () => this.openControlSettings(ui.pauseModal, ui.pauseControls), {}, 'open-controls-pause');
    on(ui.resultGrowth, 'click', () => this.openMetaModal(), {}, 'open-meta-result');
    on(ui.runModeOptions, 'click', (event) => {
      const button = event.target.closest('[data-run-mode]');
      if (button) this.selectRunMode(button.dataset.runMode);
    }, {}, 'run-mode-options');
    on(ui.heroClassOptions, 'click', (event) => {
      const button = event.target.closest('[data-hero-class]');
      if (button) this.selectHeroClass(button.dataset.heroClass);
    }, {}, 'hero-class-options');
    on(ui.councilOptions, 'click', (event) => {
      const button = event.target.closest('[data-council-support]');
      if (button) this.selectCouncilSupport(button.dataset.councilSupport);
    }, {}, 'council-options');
    on(ui.seedModeOptions, 'click', (event) => {
      const button = event.target.closest('[data-seed-mode]');
      if (button) this.selectSeedMode(button.dataset.seedMode);
    }, {}, 'seed-mode-options');
    $$('[data-close]').forEach((button, index) => on(button, 'click', () => this.hideModal($(`#${button.dataset.close}`)), {}, `modal-close-${button.dataset.close}-${index}`));
    on(ui.collectionTabs, 'click', (event) => {
      const button = event.target.closest('[data-codex-tab]');
      if (button) this.renderCodex(button.dataset.codexTab);
    }, {}, 'codex-tabs');
    on(ui.collectionGrid, 'click', (event) => {
      const card = event.target.closest('[data-codex-id]');
      if (card) this.openCodexPreview(card.dataset.codexSection, card.dataset.codexId, card);
    }, {}, 'codex-grid-click');
    on(ui.collectionGrid, 'keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      const card = event.target.closest('[data-codex-id]');
      if (!card) return;
      event.preventDefault();
      this.openCodexPreview(card.dataset.codexSection, card.dataset.codexId, card);
    }, {}, 'codex-grid-keydown');
    $$('[data-codex-state]').forEach((button, index) => on(button, 'click', () => {
      this.codexViewer?.setState(button.dataset.codexState);
      $$('[data-codex-state]').forEach((item) => item.classList.toggle('active', item === button));
      ui.codexFrameStatus.textContent = `${button.textContent} 동작 미리보기`;
    }, {}, `codex-state-${index}`));
    $$('[data-codex-mode]').forEach((button, index) => on(button, 'click', () => {
      if (button.disabled) return;
      this.codexViewer?.setMode(button.dataset.codexMode);
      $$('[data-codex-mode]').forEach((item) => item.classList.toggle('active', item === button));
      const impostor = button.dataset.codexMode === 'impostor';
      ui.codexLodReadout.textContent = impostor ? 'LOD2 · 11방향 WebP' : 'LOD0 · 절차형 3D';
      ui.codexDirectionReadout.textContent = impostor ? '프레임 01 / 11' : '3D 자유 회전';
    }, {}, `codex-mode-${index}`));
    on(ui.hudLayout, 'click', () => this.cycleHudDensity(), {}, 'hud-layout');
    on(ui.sound, 'click', () => {
      this.sound.enabled = !this.sound.enabled;
      ui.sound.textContent = this.sound.enabled ? '♪' : '×';
      if (this.sound.enabled) { this.sound.unlock(); this.sound.ui(); }
    }, {}, 'sound-toggle');
    on(ui.menu, 'click', () => this.pauseGame(), {}, 'pause');
    on(ui.resume, 'click', () => this.resumeGame(), {}, 'resume');
    on(ui.restart, 'click', () => { this.hideModal(ui.pauseModal); this.startRun({ reuseSeed: true }); }, {}, 'restart');
    on(ui.titleBtn, 'click', () => { this.hideModal(ui.pauseModal); this.returnToTitle(); }, {}, 'return-title');
    on(ui.resultRetry, 'click', () => { this.hideModal(ui.resultModal); this.startRun({ reuseSeed: true }); }, {}, 'retry');
    on(ui.resultNewRun, 'click', () => { this.hideModal(ui.resultModal); this.startRun({ reuseSeed: false }); }, {}, 'new-run');
    on(ui.performanceExport, 'click', () => this.exportPerformanceLog(), {}, 'performance-export');
    on(ui.goldenSamplePreview, 'click', () => this.openGoldenSamplePreview(ui.goldenSamplePreview), {}, 'golden-sample-preview');
    on(ui.productionConsole, 'click', () => {
      const enabled = this.productionConsole?.toggle();
      this.showToast(enabled ? '제작 디렉터 콘솔을 표시합니다.' : '제작 디렉터 콘솔을 숨깁니다.');
    }, {}, 'production-console');
    on(ui.assetApprovalV117, 'click', () => {
      const opened = window.open('./asset-approval-v117.html', 'dokkaebi-asset-approval-v117', 'noopener,noreferrer');
      if (!opened) this.showToast('팝업이 차단되었습니다. asset-approval-v117.html을 직접 열어 주세요.');
    }, {}, 'asset-approval-v117');
    on(ui.saveScore, 'click', () => this.saveScore(), {}, 'save-score');
    on(ui.summon, 'click', () => this.summonUnit(), {}, 'summon');
    on(ui.wave, 'click', () => { if (this.autoWaveCountdown > 0) this.automationV22.noteWaveSkip(); this.startWave({ manual: true }); }, {}, 'wave');
    on(ui.autoWavePanel, 'click', () => { if (this.state === 'playing' && !this.waveActive) { this.automationV22.noteWaveSkip(); this.startWave({ manual: true }); } }, {}, 'auto-wave-panel-click');
    on(ui.autoWavePanel, 'keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && this.state === 'playing' && !this.waveActive) { event.preventDefault(); this.automationV22.noteWaveSkip(); this.startWave({ manual: true }); } }, {}, 'auto-wave-panel-key');
    on(ui.dash, 'click', () => this.useDash(), {}, 'dash');
    on(ui.skill, 'click', () => this.useHeroSkill(), {}, 'skill');
    on(ui.burst, 'click', () => this.activateGuardianBurst(), {}, 'burst');
    on(ui.synergyToggle, 'click', () => ui.synergyPanel.classList.toggle('collapsed'), {}, 'synergy-toggle');
    on(ui.leftUiToggle, 'click', () => this.toggleLeftMobileUi(), {}, 'left-ui-toggle');
    try { this.setLeftMobileUiCollapsed(localStorage.getItem('dokkaebi-left-ui-collapsed') === '1'); } catch { this.setLeftMobileUiCollapsed(false); }
    on(ui.contractSkip, 'click', () => this.skipContract(), {}, 'contract-skip');
    on(ui.blessingRecommend, 'click', () => this.selectRecommendedReward('blessing'), {}, 'blessing-recommend');
    on(ui.relicRecommend, 'click', () => this.selectRecommendedReward('relic'), {}, 'relic-recommend');

    const bindControlRange = (element, key, transform = (value) => value) => {
      on(element, 'input', () => this.updateControlSetting(key, transform(Number(element.value))), {}, `control-range-${key}`);
    };
    bindControlRange(ui.rotateSensitivity, 'rotateSensitivity', (value) => value / 100);
    bindControlRange(ui.pinchSensitivity, 'pinchSensitivity', (value) => value / 100);
    bindControlRange(ui.wheelSensitivity, 'wheelSensitivity', (value) => value / 100);
    bindControlRange(ui.minimumZoom, 'minZoom', (value) => value / 10);
    bindControlRange(ui.maximumZoom, 'maxZoom', (value) => value / 10);
    bindControlRange(ui.shakeIntensity, 'shakeIntensity', (value) => value / 100);
    bindControlRange(ui.flashIntensity, 'flashIntensity', (value) => value / 100);
    $$('[data-control-toggle]').forEach((button, index) => on(button, 'click', () => this.updateControlSetting(button.dataset.controlToggle, button.getAttribute('aria-pressed') !== 'true'), {}, `control-toggle-${index}`));
    $$('[data-handedness]').forEach((button, index) => on(button, 'click', () => this.updateControlSetting('handedness', button.dataset.handedness), {}, `handedness-${index}`));
    $$('[data-camera-preset]').forEach((button, index) => on(button, 'click', () => this.updateControlSetting('cameraProfile', button.dataset.cameraPreset), {}, `camera-preset-${index}`));
    on(ui.controlsReset, 'click', () => this.resetControlSettings(), {}, 'controls-reset');
    this.applyControlSettings();
    this.renderControlSettings();

    on(ui.unitStrip, 'click', (event) => {
      const button = event.target.closest('[data-command-key]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      this.useUnitCommand(button.dataset.commandKey);
    }, {}, 'unit-command');
    on(ui.metaTraitList, 'click', (event) => {
      const button = event.target.closest('[data-meta-upgrade]');
      if (button && !button.disabled) this.upgradeMetaTrait(button.dataset.metaUpgrade);
    }, {}, 'meta-upgrade');
    on(ui.relicOptions, 'click', (event) => {
      const button = event.target.closest('[data-relic]');
      if (button) this.selectRelic(button.dataset.relic);
    }, {}, 'relic-select');
    on(ui.equipmentList, 'click', (event) => {
      const forgeButton = event.target.closest('[data-equipment-forge]');
      if (forgeButton) {
        this.forgeEquipment(forgeButton.dataset.equipmentForge);
        return;
      }
      const button = event.target.closest('[data-equipment-id]');
      if (button) this.selectEquipmentItem(button.dataset.equipmentId);
    }, {}, 'equipment-select');
    on(ui.interact, 'click', () => this.interactWithBattlefieldProp(), {}, 'battlefield-interact');
    on(ui.choiceSummonOptions, 'click', (event) => {
      const button = event.target.closest('[data-choice-type]');
      if (button) this.selectChoiceSummon(button.dataset.choiceType);
    }, {}, 'choice-summon-select');
    on(ui.contractOptions, 'click', (event) => {
      const button = event.target.closest('[data-contract]');
      if (button) this.selectContract(button.dataset.contract);
    }, {}, 'contract-select');
    on(ui.blessingOptions, 'click', (event) => {
      const button = event.target.closest('[data-blessing]');
      if (button) this.selectBlessing(button.dataset.blessing);
    }, {}, 'blessing-select');
    on(window, 'error', (event) => this.recordRuntimeError(event.error || event.message, 'window-error'), {}, 'runtime-window-error');
    on(window, 'unhandledrejection', (event) => this.recordRuntimeError(event.reason, 'unhandled-rejection'), {}, 'runtime-unhandled-rejection');
    on(window, 'dokkaebi:webgl-recovery', (event) => this.handleWebGLRecovery(event.detail || {}), {}, 'webgl-recovery');

    this.setupJoystick();
    this.setupLookControls();

    on(window, 'keydown', (event) => {
      if (this.isTypingTarget(event.target)) return;
      const code = this.normalizeInputCode(event);
      if (!isMovementCode(code)) return;
      event.preventDefault();
      this.input.keys.add(code);
      this.cancelMoveTarget();
    }, { passive: false }, 'keyboard-movement-down');
    on(window, 'keyup', (event) => {
      const code = this.normalizeInputCode(event);
      if (isMovementCode(code)) this.input.keys.delete(code);
    }, {}, 'keyboard-movement-up');
    on(window, 'blur', () => this.resetMovementInput(), {}, 'window-blur');
    on(document, 'visibilitychange', () => this.handleVisibilityChange(document.hidden), {}, 'visibility-change');
    on(window, 'pageshow', (event) => {
      if (event.persisted || !document.hidden) this.handleVisibilityChange(false, { pageShow: true });
    }, {}, 'page-show-recovery');
    on(window, 'focus', () => {
      if (!document.hidden && this.autoPausedByVisibility) this.handleVisibilityChange(false, { focus: true });
    }, {}, 'window-focus-recovery');
  }

  loadControlSettings() {
    const fallback = { ...DEFAULT_CONTROL_SETTINGS };
    try {
      const stored = JSON.parse(localStorage.getItem(CONTROL_STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') return fallback;
      const settings = {
        cameraProfile: sanitizeCameraProfileId(stored.cameraProfile || fallback.cameraProfile),
        rotateSensitivity: clamp(Number(stored.rotateSensitivity ?? stored.rotate) || fallback.rotateSensitivity, .6, 1.6),
        pinchSensitivity: clamp(Number(stored.pinchSensitivity ?? stored.pinch) || fallback.pinchSensitivity, .55, 1.45),
        wheelSensitivity: clamp(Number(stored.wheelSensitivity ?? stored.pinch) || fallback.wheelSensitivity, .6, 1.6),
        minZoom: clamp(Number(stored.minZoom) || fallback.minZoom, 8.5, 13),
        maxZoom: clamp(Number(stored.maxZoom) || fallback.maxZoom, 18, 30),
        handedness: stored.handedness === 'left' ? 'left' : 'right',
        vibration: stored.vibration !== false,
        shakeIntensity: clamp(Number(stored.shakeIntensity ?? fallback.shakeIntensity), 0, 1),
        flashIntensity: clamp(Number(stored.flashIntensity ?? fallback.flashIntensity), 0, 1),
        reducedMotion: stored.reducedMotion === true,
        autoHudLayout: stored.autoHudLayout !== false,
        force3DModels: stored.force3DModels === true
      };
      if (settings.maxZoom < settings.minZoom + 5) settings.maxZoom = Math.min(30, settings.minZoom + 5);
      return settings;
    } catch {
      return fallback;
    }
  }

  saveControlSettings() {
    try { localStorage.setItem(CONTROL_STORAGE_KEY, JSON.stringify(this.controlSettings)); } catch {}
  }

  getCameraZoomBounds() {
    const min = clamp(this.controlSettings?.minZoom ?? DEFAULT_CONTROL_SETTINGS.minZoom, 8.5, 13);
    const max = clamp(this.controlSettings?.maxZoom ?? DEFAULT_CONTROL_SETTINGS.maxZoom, Math.max(18, min + 5), 30);
    return { min, max };
  }

  applyControlSettings() {
    document.body.classList.toggle('controls-left-handed', this.controlSettings.handedness === 'left');
    document.body.classList.toggle('reduced-motion', Boolean(this.controlSettings.reducedMotion));
    document.body.classList.toggle('force-3d-models', Boolean(this.controlSettings.force3DModels));
    const cameraProfile = getCameraProfile(this.controlSettings.cameraProfile);
    this.activeCameraProfile = cameraProfile;
    document.body.dataset.cameraProfile = cameraProfile.id;
    if (this.camera && this.lastAppliedCameraPreset !== cameraProfile.id) {
      this.cameraPitch = cameraProfile.pitch;
      this.cameraDistanceTarget = clamp(cameraProfile.distance, this.controlSettings.minZoom, this.controlSettings.maxZoom);
      this.camera.fov = cameraProfile.fov;
      this.camera.updateProjectionMatrix();
      this.lastAppliedCameraPreset = cameraProfile.id;
    }
    if (this.hudLayout) {
      if (this.controlSettings.autoHudLayout && this.hudLayout.mode === 'full') this.hudLayout.setMode('auto');
      if (!this.controlSettings.autoHudLayout && this.hudLayout.mode === 'auto') this.hudLayout.setMode('full');
      this.syncHudLayoutButton();
    }
    document.documentElement.style.setProperty('--flash-strength', String(this.controlSettings.flashIntensity));
    const { min, max } = this.getCameraZoomBounds();
    this.cameraDistanceTarget = clamp(this.cameraDistanceTarget, min, max);
    this.cameraDistance = clamp(this.cameraDistance, min, max);
    this.cameraCollisionDistance = Math.min(this.cameraCollisionDistance || this.cameraDistance, this.cameraDistance);
  }

  renderControlSettings() {
    const settings = this.controlSettings;
    ui.rotateSensitivity.value = String(Math.round(settings.rotateSensitivity * 100));
    ui.pinchSensitivity.value = String(Math.round(settings.pinchSensitivity * 100));
    ui.wheelSensitivity.value = String(Math.round(settings.wheelSensitivity * 100));
    ui.minimumZoom.value = String(Math.round(settings.minZoom * 10));
    ui.maximumZoom.value = String(Math.round(settings.maxZoom * 10));
    ui.shakeIntensity.value = String(Math.round(settings.shakeIntensity * 100));
    ui.flashIntensity.value = String(Math.round(settings.flashIntensity * 100));
    ui.rotateSensitivityValue.textContent = `${Math.round(settings.rotateSensitivity * 100)}%`;
    ui.pinchSensitivityValue.textContent = `${Math.round(settings.pinchSensitivity * 100)}%`;
    ui.wheelSensitivityValue.textContent = `${Math.round(settings.wheelSensitivity * 100)}%`;
    ui.minimumZoomValue.textContent = settings.minZoom.toFixed(1);
    ui.maximumZoomValue.textContent = settings.maxZoom.toFixed(1);
    ui.shakeIntensityValue.textContent = `${Math.round(settings.shakeIntensity * 100)}%`;
    ui.flashIntensityValue.textContent = `${Math.round(settings.flashIntensity * 100)}%`;
    $$('[data-camera-preset]').forEach((button) => {
      const active = button.dataset.cameraPreset === settings.cameraProfile;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $$('[data-control-toggle]').forEach((button) => {
      const key = button.dataset.controlToggle;
      const active = Boolean(settings[key]);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'ON' : 'OFF';
    });
    $$('[data-handedness]').forEach((button) => {
      const active = button.dataset.handedness === settings.handedness;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  updateControlSetting(key, value) {
    if (key === 'cameraProfile') this.controlSettings.cameraProfile = sanitizeCameraProfileId(value);
    else if (key === 'handedness') this.controlSettings.handedness = value === 'left' ? 'left' : 'right';
    else if (key === 'rotateSensitivity') this.controlSettings.rotateSensitivity = clamp(value, .6, 1.6);
    else if (key === 'pinchSensitivity') this.controlSettings.pinchSensitivity = clamp(value, .55, 1.45);
    else if (key === 'wheelSensitivity') this.controlSettings.wheelSensitivity = clamp(value, .6, 1.6);
    else if (key === 'shakeIntensity') this.controlSettings.shakeIntensity = clamp(value, 0, 1);
    else if (key === 'flashIntensity') this.controlSettings.flashIntensity = clamp(value, 0, 1);
    else if (key === 'vibration' || key === 'reducedMotion' || key === 'autoHudLayout' || key === 'force3DModels') this.controlSettings[key] = Boolean(value);
    else if (key === 'minZoom') {
      this.controlSettings.minZoom = clamp(value, 8.5, 13);
      this.controlSettings.maxZoom = Math.max(this.controlSettings.maxZoom, this.controlSettings.minZoom + 5);
    } else if (key === 'maxZoom') {
      this.controlSettings.maxZoom = clamp(value, 18, 30);
      this.controlSettings.minZoom = Math.min(this.controlSettings.minZoom, this.controlSettings.maxZoom - 5);
    }
    this.applyControlSettings();
    this.renderControlSettings();
    this.saveControlSettings();
    if (key === 'cameraProfile') {
      const profile = getCameraProfile(this.controlSettings.cameraProfile);
      this.showToast(`카메라 · ${profile.label} (${profile.distance.toFixed(1)})`);
    }
    if (key === 'autoHudLayout') {
      this.hudLayout?.setMode(this.controlSettings.autoHudLayout ? 'auto' : 'full');
      this.syncHudLayoutButton();
      this.showToast(this.controlSettings.autoHudLayout ? 'HUD 자동 정리를 사용합니다.' : 'HUD 전체 표시를 고정합니다.');
    }
    if (key === 'force3DModels') {
      this.syncImpostorVisibility();
      this.showToast(this.controlSettings.force3DModels ? '3D 모델 고정: 원거리 이미지 LOD를 사용하지 않습니다.' : '거리 기반 11방향 LOD를 다시 사용합니다.');
    }
  }

  renderAssetDiagnostics() {
    if (!ui.assetDiagnosticsList || !this.assetPipeline) return;
    const diagnostic = buildAssetDiagnostics(this.assetPipeline.getModelStatuses(CHARACTER_ASSET_IDS), CHARACTER_ASSET_LABELS, PLAYER_ASSET_ID);
    ui.assetDiagnosticsCount.textContent = diagnostic.count;
    ui.assetDiagnosticsSummary.textContent = diagnostic.summary;
    ui.assetDiagnosticsList.innerHTML = diagnostic.html;
  }

  syncImpostorVisibility() {
    const force3D = Boolean(this.controlSettings?.force3DModels);
    for (const unit of this.units) {
      const impostor = unit.impostor;
      if (!impostor || !force3D) continue;
      impostor.active = false;
      impostor.plane.visible = false;
      impostor.lod0Children.forEach((child) => { child.visible = true; });
    }
    for (const enemy of this.enemies) {
      const impostor = enemy.group?.userData?.impostor;
      if (!impostor || !force3D) continue;
      impostor.active = false;
      impostor.plane.visible = false;
      impostor.lod0Children.forEach((child) => { child.visible = true; });
      enemy.group.userData.lodState = 'high';
    }
  }

  cycleCameraView() {
    const next = cycleCameraProfile(this.controlSettings.cameraProfile);
    this.updateControlSetting('cameraProfile', next);
    return next;
  }

  resetControlSettings() {
    this.controlSettings = { ...DEFAULT_CONTROL_SETTINGS };
    this.applyControlSettings();
    this.renderControlSettings();
    this.saveControlSettings();
    this.haptic(12);
    this.showToast('카메라와 조작 설정을 기본값으로 복원했습니다.');
  }

  openControlSettings(parent = null, trigger = document.activeElement) {
    this.renderControlSettings();
    this.renderAssetDiagnostics();
    this.showModal(ui.controlsModal, { parent, trigger });
  }

  setupJoystick() {
    let pointerId = null;
    const getTravelRadius = (rect) => {
      const raw = Number.parseFloat(getComputedStyle(document.body).getPropertyValue('--touch-joystick-travel'));
      return Number.isFinite(raw) && raw > 12 ? raw : rect.width * .31;
    };
    const move = (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault?.();
      const rect = ui.joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let x = event.clientX - cx;
      let y = event.clientY - cy;
      const max = getTravelRadius(rect);
      const length = Math.hypot(x, y) || 1;
      if (length > max) { x = x / length * max; y = y / length * max; }
      this.input.x = x / max;
      this.input.y = y / max;
      if (Math.hypot(this.input.x, this.input.y) > .08) this.cancelMoveTarget();
      ui.joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    const end = (event) => {
      if (event.pointerId !== pointerId) return;
      try { ui.joystick.releasePointerCapture(event.pointerId); } catch {}
      pointerId = null;
      this.input.x = 0;
      this.input.y = 0;
      ui.joystickKnob.style.transform = 'translate(-50%, -50%)';
    };
    this.listen(ui.joystick, 'pointerdown', (event) => {
      if (this.state !== 'playing') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      pointerId = event.pointerId;
      try { ui.joystick.setPointerCapture(pointerId); } catch {}
      move(event);
    }, { passive: false }, 'joystick-down');
    this.listen(ui.joystick, 'pointermove', move, { passive: false }, 'joystick-move');
    this.listen(ui.joystick, 'pointerup', end, {}, 'joystick-up');
    this.listen(ui.joystick, 'pointercancel', end, {}, 'joystick-cancel');
    this.listen(window, 'pointerup', end, {}, 'joystick-window-up');
    this.listen(window, 'pointercancel', end, {}, 'joystick-window-cancel');
  }

  normalizeInputCode(event) {
    if (event.code) return event.code;
    const key = String(event.key || '').toLowerCase();
    return ({ w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD', ' ': 'Space' })[key] || event.key;
  }

  isTypingTarget(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
  }


  resetMovementInput() {
    this.input.keys.clear();
    this.input.x = 0;
    this.input.y = 0;
    this.cancelMoveTarget();
    ui.joystickKnob.style.transform = 'translate(-50%, -50%)';
  }

  setLeftMobileUiCollapsed(collapsed) {
    document.body.classList.toggle('left-ui-collapsed', collapsed);
    ui.leftUiToggle.setAttribute('aria-expanded', String(!collapsed));
    ui.leftUiToggle.setAttribute('aria-label', collapsed ? '왼쪽 정보 펼치기' : '왼쪽 정보 접기');
    ui.leftUiToggle.textContent = collapsed ? '›' : '‹';
  }

  toggleLeftMobileUi() {
    const collapsed = !document.body.classList.contains('left-ui-collapsed');
    this.setLeftMobileUiCollapsed(collapsed);
    try { localStorage.setItem('dokkaebi-left-ui-collapsed', collapsed ? '1' : '0'); } catch {}
  }

  adjustCameraZoom(delta) {
    const { min, max } = this.getCameraZoomBounds();
    this.cameraDistanceTarget = clamp(this.cameraDistanceTarget + Number(delta || 0), min, max);
    this.showToast(`카메라 거리 ${this.cameraDistanceTarget.toFixed(1)}`);
  }

  startRewardAutoChoice(type, seconds = 10) {
    this.automationV22.beginReward(type, seconds);
    this.updateRewardAutoCountdown();
  }

  cancelRewardAutoChoice(type = '') {
    this.automationV22.cancelReward(type);
    this.updateRewardAutoCountdown();
  }

  updateRewardAutoCountdown() {
    const reward = this.automationV22.reward;
    const map = {
      blessing: [ui.blessingAutoSeconds, ui.blessingAutoProgress], relic: [ui.relicAutoSeconds, ui.relicAutoProgress],
      contract: [ui.contractAutoSeconds, ui.contractAutoProgress], choice: [ui.choiceAutoSeconds, ui.choiceAutoProgress]
    };
    Object.entries(map).forEach(([type, [secondsEl, progressEl]]) => {
      const active = reward?.type === type;
      const seconds = active ? Math.max(0, Math.ceil(reward.remaining)) : 10;
      if (secondsEl) secondsEl.textContent = String(seconds);
      if (progressEl) progressEl.style.width = `${active ? Math.round((1 - reward.remaining / reward.duration) * 100) : 0}%`;
      secondsEl?.closest('.reward-auto-countdown')?.classList.toggle('imminent', active && reward.remaining <= 3);
    });
  }

  updateAutomationV22(dt) {
    const action = this.automationV22.update(dt, this.state);
    this.updateRewardAutoCountdown();
    if (action?.type === 'auto-select-reward') {
      this.showCombo('자동 추천 선택', 760);
      this.selectRecommendedReward(action.rewardType);
    }
  }

  vacuumRemainingCoins() {
    if (!this.coins.length || !this.player?.group) return { count: 0, value: 0 };
    const target = this.player.group.position.clone().add(new THREE.Vector3(0, 1, 0));
    const coins = [...this.coins];
    let value = 0;
    for (let index = coins.length - 1; index >= 0; index -= 1) {
      const coin = coins[index];
      value += Math.max(0, Number(coin.value) || 0);
      const start = coin.mesh.position.clone();
      this.createLightningLine(start, target, 0xffd66b);
      this.spawnTinyParticle(start, 0xffd66b);
      this.releaseCoin(coin);
    }
    this.gold += value;
    this.score += value * 2;
    this.runStats.coinsCollected += value;
    this.gainSoul(Math.min(18, value * .12), 'wave-vacuum');
    this.spawnParticles(target, 0xffd66b, Math.min(28, 8 + coins.length), 3.4);
    this.automationV22.noteVacuum(coins.length, value);
    this.showToast(`웨이브 전리품 자동 회수 · 엽전 +${value}`);
    return { count: coins.length, value };
  }

  setupLookControls() {
    const getTapProfile = (pointerType = 'touch') => {
      if (pointerType === 'mouse') return { dragThreshold: 8, tapDuration: 420 };
      if (pointerType === 'pen') return { dragThreshold: 14, tapDuration: 720 };
      return { dragThreshold: 20, tapDuration: 900 };
    };
    const pointerDistance = () => {
      const points = [...this.lookPointers.values()];
      return points.length >= 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
    };
    const beginPinch = () => {
      if (this.lookPointers.size < 2) return;
      this.pinchState = { distance: pointerDistance(), cameraDistance: this.cameraDistanceTarget };
      this.lookPointer = null;
    };
    this.listen(ui.lookZone, 'pointerdown', (event) => {
      if (this.state !== 'playing') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      this.lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try { ui.lookZone.setPointerCapture(event.pointerId); } catch {}
      if (this.lookPointers.size >= 2) {
        beginPinch();
        return;
      }
      const profile = getTapProfile(event.pointerType);
      this.lookPointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        dragging: false,
        dragThreshold: profile.dragThreshold,
        tapDuration: profile.tapDuration,
        pointerType: event.pointerType || 'touch'
      };
    }, {}, 'look-down');
    this.listen(ui.lookZone, 'pointermove', (event) => {
      if (!this.lookPointers.has(event.pointerId)) return;
      this.lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.lookPointers.size >= 2 && this.pinchState) {
        const distance = pointerDistance();
        const delta = distance - this.pinchState.distance;
        const { min, max } = this.getCameraZoomBounds();
        this.cameraDistanceTarget = clamp(this.pinchState.cameraDistance - delta * .018 * this.controlSettings.pinchSensitivity, min, max);
        return;
      }
      if (!this.lookPointer || this.lookPointer.id !== event.pointerId) return;
      const totalDistance = Math.hypot(event.clientX - this.lookPointer.startX, event.clientY - this.lookPointer.startY);
      if (!this.lookPointer.dragging && totalDistance >= this.lookPointer.dragThreshold) this.lookPointer.dragging = true;
      if (!this.lookPointer.dragging) return;
      const dx = event.clientX - this.lookPointer.x;
      const dy = event.clientY - this.lookPointer.y;
      const rotationScale = this.controlSettings.rotateSensitivity;
      this.cameraYaw -= dx * .006 * rotationScale;
      this.cameraPitch = clamp(this.cameraPitch + dy * .004 * rotationScale, .38, .9);
      this.lookPointer.x = event.clientX;
      this.lookPointer.y = event.clientY;
    }, {}, 'look-move');
    const end = (event, cancelled = false) => {
      const wasPinching = Boolean(this.pinchState);
      const pointer = this.lookPointer;
      this.lookPointers.delete(event.pointerId);
      if (wasPinching) {
        if (this.lookPointers.size >= 2) beginPinch();
        else {
          this.pinchState = null;
          this.lookPointer = null;
        }
        if (cancelled) this.mapTouchDiagnosticsV116.cancelled += 1;
        return;
      }
      if (!pointer || pointer.id !== event.pointerId) return;
      this.lookPointer = null;
      if (cancelled) {
        this.mapTouchDiagnosticsV116.cancelled += 1;
        return;
      }
      const duration = performance.now() - pointer.startedAt;
      const endX = Number.isFinite(event.clientX) ? event.clientX : pointer.x;
      const endY = Number.isFinite(event.clientY) ? event.clientY : pointer.y;
      const travel = Math.hypot(endX - pointer.startX, endY - pointer.startY);
      if (!pointer.dragging && travel <= pointer.dragThreshold * 1.2 && duration <= pointer.tapDuration && this.state === 'playing') {
        this.setMoveTargetFromScreen(endX, endY);
      }
    };
    this.listen(ui.lookZone, 'pointerup', (event) => end(event, false), {}, 'look-up');
    this.listen(ui.lookZone, 'pointercancel', (event) => end(event, true), {}, 'look-cancel');
    this.listen(ui.lookZone, 'lostpointercapture', (event) => end(event, true), {}, 'look-lost-capture-v116');
    this.listen(window, 'wheel', (event) => {
      if (this.state !== 'playing' || this.isTypingTarget(event.target) || event.target?.closest?.('button, input, select, textarea, .modal-card')) return;
      event.preventDefault();
      const normalized = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * innerHeight : event.deltaY;
      const { min, max } = this.getCameraZoomBounds();
      this.cameraDistanceTarget = clamp(this.cameraDistanceTarget + normalized * .0075 * this.controlSettings.wheelSensitivity, min, max);
    }, { passive: false, capture: true }, 'camera-wheel-global');
  }

  setMoveTargetFromScreen(clientX, clientY) {
    if (!this.player || this.state !== 'playing') {
      this.mapTouchDiagnosticsV116.rejected += 1;
      return false;
    }
    const rect = ui.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      this.mapTouchDiagnosticsV116.rejected += 1;
      return false;
    }
    const ratioX = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ratioY = clamp((clientY - rect.top) / rect.height, 0, 1);
    const band = ratioX < 1 / 3 ? 'left' : ratioX < 2 / 3 ? 'center' : 'right';
    this.pointer.set(ratioX * 2 - 1, -(ratioY * 2) + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const rawPoint = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(groundPlane, rawPoint)) {
      this.mapTouchDiagnosticsV116.rejected += 1;
      return false;
    }
    this.mapTouchDiagnosticsV116.accepted += 1;
    this.mapTouchDiagnosticsV116.bands[band] += 1;
    this.mapTouchDiagnosticsV116.lastBand = band;
    this.mapTouchDiagnosticsV116.lastNdc = { x: this.pointer.x, y: this.pointer.y };
    rawPoint.y = 0;
    const resolved = this.resolveNavigationPoint(rawPoint.clone());
    this.moveTargetRaw = rawPoint.clone();
    this.moveTarget = resolved.clone();
    this.runStats.moveOrders += 1;
    this.showMoveTargetMarker(rawPoint, resolved);
    const adjusted = rawPoint.distanceTo(resolved) > .12;
    this.haptic(8);
    return true;
  }

  resolveNavigationPoint(point) {
    point.y = 0;
    const maxRadius = 25.15;
    const radius = Math.hypot(point.x, point.z);
    if (radius > maxRadius) point.multiplyScalar(maxRadius / radius);
    for (let pass = 0; pass < 4; pass += 1) {
      let changed = false;
      for (const obstacle of this.navigationObstacles) {
        const dx = point.x - obstacle.x;
        const dz = point.z - obstacle.z;
        const distance = Math.hypot(dx, dz);
        const clearance = obstacle.radius + .62;
        if (distance < clearance) {
          const angle = distance > .001 ? Math.atan2(dz, dx) : Math.atan2(point.z || 1, point.x || 1);
          point.x = obstacle.x + Math.cos(angle) * clearance;
          point.z = obstacle.z + Math.sin(angle) * clearance;
          changed = true;
        }
      }
      if (!changed) break;
    }
    const finalRadius = Math.hypot(point.x, point.z);
    if (finalRadius > maxRadius) point.multiplyScalar(maxRadius / finalRadius);
    return point;
  }

  resolvePlayerNavigation(position) {
    const resolved = this.resolveNavigationPoint(position.clone().setY(0));
    position.x = resolved.x;
    position.z = resolved.z;
  }

  getNavigationDirection(from, target) {
    const desiredVector = target.clone().sub(from).setY(0);
    const targetDistance = desiredVector.length();
    if (targetDistance < .001) return desiredVector.set(0, 0, 0);
    const desired = desiredVector.normalize();
    let selectedWaypoint = null;
    let selectedSeverity = 0;
    for (const obstacle of this.navigationObstacles) {
      const center = new THREE.Vector3(obstacle.x, 0, obstacle.z);
      const toObstacle = center.clone().sub(from).setY(0);
      const forwardDistance = toObstacle.dot(desired);
      if (forwardDistance <= .05 || forwardDistance >= Math.min(targetDistance, 6.5)) continue;
      const closest = from.clone().addScaledVector(desired, forwardDistance);
      const lateralDistance = closest.distanceTo(center);
      const clearance = obstacle.radius + .85;
      if (lateralDistance >= clearance) continue;
      const radial = from.clone().sub(center).setY(0);
      if (radial.lengthSq() < .001) radial.set(-desired.z, 0, desired.x);
      radial.normalize();
      const tangentA = new THREE.Vector3(-radial.z, 0, radial.x);
      const tangentB = tangentA.clone().multiplyScalar(-1);
      const waypointA = center.clone().addScaledVector(tangentA, clearance + .28);
      const waypointB = center.clone().addScaledVector(tangentB, clearance + .28);
      const costA = from.distanceTo(waypointA) + waypointA.distanceTo(target);
      const costB = from.distanceTo(waypointB) + waypointB.distanceTo(target);
      const waypoint = costA <= costB ? waypointA : waypointB;
      const severity = 1 - lateralDistance / clearance;
      if (severity > selectedSeverity) {
        selectedSeverity = severity;
        selectedWaypoint = waypoint;
      }
    }
    if (!selectedWaypoint) return desired;
    const around = selectedWaypoint.sub(from).setY(0).normalize();
    return desired.multiplyScalar(.38).addScaledVector(around, .62 + selectedSeverity * .48).normalize();
  }

  showMoveTargetMarker(rawPoint, resolvedPoint) {
    if (this.moveTargetMarker?.parent) this.effectRoot.remove(this.moveTargetMarker);
    if (this.moveTargetMarker) {
      this.moveTargetMarker.traverse((object) => {
        object.geometry?.dispose?.();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
      });
    }
    const group = new THREE.Group();
    const adjusted = rawPoint.distanceTo(resolvedPoint) > .12;
    const color = adjusted ? 0xffc45e : 0x79f4ff;
    const ring = this.mesh(new THREE.RingGeometry(.38, .58, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false }), 0, .055, 0, false, false);
    ring.rotation.x = -Math.PI / 2;
    const dot = this.mesh(new THREE.CircleGeometry(.12, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false }), 0, .061, 0, false, false);
    dot.rotation.x = -Math.PI / 2;
    const beam = this.mesh(new THREE.CylinderGeometry(.025, .08, 1.35, 10, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .38, depthWrite: false }), 0, .68, 0, false, false);
    group.add(ring, dot, beam);
    group.position.copy(resolvedPoint);
    group.userData.life = 2.4;
    group.userData.ring = ring;
    group.userData.beam = beam;
    this.effectRoot.add(group);
    this.moveTargetMarker = group;
  }

  updateMoveTargetMarker(dt) {
    if (!this.moveTargetMarker) return;
    this.moveTargetMarker.userData.life -= dt;
    const pulse = 1 + Math.sin(this.elapsed * 10) * .12;
    this.moveTargetMarker.userData.ring.scale.setScalar(pulse);
    this.moveTargetMarker.userData.ring.rotation.z += dt * 1.8;
    this.moveTargetMarker.userData.beam.material.opacity = .24 + (Math.sin(this.elapsed * 8) + 1) * .1;
    if (this.moveTargetMarker.userData.life <= 0 && !this.moveTarget) this.removeMoveTargetMarker();
  }

  removeMoveTargetMarker() {
    if (!this.moveTargetMarker) return;
    this.effectRoot.remove(this.moveTargetMarker);
    this.moveTargetMarker.traverse((object) => {
      object.geometry?.dispose?.();
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
    });
    this.moveTargetMarker = null;
  }

  cancelMoveTarget(removeMarker = true) {
    this.moveTarget = null;
    this.moveTargetRaw = null;
    if (removeMarker) this.removeMoveTargetMarker();
  }

  showModal(element, { parent = null, trigger = document.activeElement } = {}) {
    if (!element) return;
    this.sound.ui();
    const existingIndex = this.modalStack.indexOf(element);
    if (existingIndex >= 0) this.modalStack.splice(existingIndex, 1);
    this.modalStack.push(element);
    this.modalOrigins.set(element, trigger instanceof HTMLElement ? trigger : null);
    if (parent?.classList.contains('visible')) {
      this.modalParents.set(element, parent);
      parent.classList.add('modal-obscured');
      parent.setAttribute('aria-hidden', 'true');
    } else this.modalParents.delete(element);
    element.style.setProperty('--modal-layer', String(130 + this.modalStack.length * 12));
    element.classList.add('visible');
    element.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => {
      const focusTarget = element.querySelector('[autofocus], .modal-x, button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      focusTarget?.focus?.({ preventScroll: true });
    });
  }

  hideModal(element) {
    if (!element) return;
    if (element === ui.codexPreviewModal) this.codexViewer?.setActive(false);
    element.classList.remove('visible');
    element.setAttribute('aria-hidden', 'true');
    element.style.removeProperty('--modal-layer');
    const stackIndex = this.modalStack.lastIndexOf(element);
    if (stackIndex >= 0) this.modalStack.splice(stackIndex, 1);
    const parent = this.modalParents.get(element);
    if (parent?.classList.contains('visible')) {
      parent.classList.remove('modal-obscured');
      parent.setAttribute('aria-hidden', 'false');
    }
    this.modalParents.delete(element);
    const origin = this.modalOrigins.get(element);
    this.modalOrigins.delete(element);
    if (!this.modalStack.length) document.body.classList.remove('modal-open');
    requestAnimationFrame(() => origin?.focus?.({ preventScroll: true }));
  }

  hideAllModals() {
    [...this.modalStack].reverse().forEach((element) => this.hideModal(element));
  }

  haptic(pattern = 18) {
    if (this.controlSettings?.vibration !== false && 'vibrate' in navigator) navigator.vibrate(pattern);
  }

  random() {
    return Math.min(.999999, Math.max(0, Number(this.runRandom?.()) || 0));
  }

  randomPick(array) {
    return array[Math.min(array.length - 1, Math.floor(this.random() * array.length))];
  }

  shuffled(array) {
    const result = [...array];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  createRunStats() {
    return {
      damageByType: Object.fromEntries(UNIT_KEYS.map((type) => [type, 0])),
      heroDamage: 0,
      skillDamage: 0,
      commandDamage: 0,
      commandsUsed: 0,
      coinsCollected: 0,
      moveOrders: 0,
      dangerDodges: 0,
      eliteKills: 0,
      wardBlocks: 0,
      jackpotTriggers: 0,
      dashUses: 0,
      guardianBursts: 0,
      trialsCompleted: 0,
      relicsChosen: 0,
      maxKillChain: 0,
      bossKills: 0,
      eliteBurstDodges: 0,
      eliteBurstHits: 0,
      relicSetsActivated: 0,
      bossHazardHits: 0,
      codexDiscoveries: 0,
      weaknessUnlocks: 0,
      weaknessHits: 0,
      codexDrops: 0,
      bossBreaks: 0,
      actsCleared: 0,
      forgedAtStart: 0,
      councilInterventions: 0
    };
  }

  loadMetaProgress() {
    const fallback = { shards: 0, traits: Object.fromEntries(Object.keys(META_TRAITS).map((id) => [id, 0])) };
    try {
      const stored = JSON.parse(localStorage.getItem(META_STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') return fallback;
      const traits = {};
      Object.keys(META_TRAITS).forEach((id) => { traits[id] = clamp(Number(stored.traits?.[id]) || 0, 0, 5); });
      return { shards: Math.max(0, Math.floor(Number(stored.shards) || 0)), traits };
    } catch {
      return fallback;
    }
  }

  saveMetaProgress() {
    try { localStorage.setItem(META_STORAGE_KEY, JSON.stringify(this.metaProgress)); } catch {}
  }

  renderMetaProgress() {
    if (!this.metaProgress) return;
    const shards = Math.max(0, Math.floor(this.metaProgress.shards || 0));
    ui.titleShards.textContent = shards.toLocaleString();
    ui.metaShards.textContent = shards.toLocaleString();
    ui.resultShardsTotal.textContent = shards.toLocaleString();
    this.renderRunPreview();
    ui.metaTraitList.innerHTML = Object.entries(META_TRAITS).map(([id, trait]) => {
      const level = clamp(this.metaProgress.traits[id] || 0, 0, 5);
      const cost = level < 5 ? trait.costs[level] : 0;
      const affordable = level < 5 && shards >= cost;
      const pips = Array.from({ length: 5 }, (_, index) => `<i class="${index < level ? 'on' : ''}"></i>`).join('');
      return `<article class="meta-trait">
        <span>${trait.icon}</span><h3>${trait.name}</h3><p>${trait.copy}</p>
        <div class="meta-level"><span>LEVEL ${level} / 5</span><b>${trait.effect(level)}</b></div>
        <div class="meta-pips">${pips}</div>
        <button class="meta-upgrade" data-meta-upgrade="${id}" ${level >= 5 || !affordable ? 'disabled' : ''}>${level >= 5 ? '최대 성장' : `혼불 ${cost} · 강화`}</button>
      </article>`;
    }).join('');
  }

  renderRunPreview() {
    if (!ui.runPreview || !this.metaProgress) return;
    const traits = this.metaProgress.traits || {};
    const gold = 70 + (traits.pouch || 0) * 10;
    const hp = 100 + (traits.ward || 0) * 7;
    const damage = (traits.bond || 0) * 3.5;
    const spirit = (traits.spirit || 0) * 8;
    const mode = getRunMode(this.selectedRunModeId);
    const heroClass = getHeroClass(this.selectedHeroClassId);
    const passive = getHeroArchetypePassive(heroClass.id);
    const council = resolveGuardianCouncil(heroClass.id, this.selectedCouncilSupportId);
    const forged = Number(this.equipmentState?.forged || 0);
    ui.runPreview.innerHTML = `
      <span><small>원정 모드</small><b>${mode.name}</b></span>
      <span><small>대장 깨비</small><b>${heroClass.name}</b></span>
      <span><small>직업 패시브</small><b>${passive.icon} ${passive.name}</b></span>
      <span><small>수호 의회</small><b>${council.bond.icon} ${council.bond.name}</b></span>
      <span><small>장비 단조</small><b>${forged}회 · 정수 ${this.equipmentState?.essence || 0}</b></span>
      <span><small>시드 방식</small><b>${RUN_SEED_MODES[this.selectedSeedModeId]?.name || RUN_SEED_MODES.daily.name}</b></span>
      <span><small>시작 엽전</small><b>${gold + mode.startGold}</b></span>
      <span><small>신목 체력</small><b>${hp}</b></span>
      <span><small>깨비 피해</small><b>+${damage.toFixed(damage % 1 ? 1 : 0)}%</b></span>
      <span><small>시작 혼불</small><b>${spirit}%</b></span>`;
  }

  openMetaModal() {
    this.renderMetaProgress();
    this.showModal(ui.metaModal);
  }

  upgradeMetaTrait(id) {
    const trait = META_TRAITS[id];
    if (!trait) return;
    const level = clamp(this.metaProgress.traits[id] || 0, 0, 5);
    if (level >= 5) return;
    const cost = trait.costs[level];
    if (this.metaProgress.shards < cost) { this.showToast(`혼불 조각이 ${cost - this.metaProgress.shards}개 부족합니다.`); return; }
    this.metaProgress.shards -= cost;
    this.metaProgress.traits[id] = level + 1;
    this.saveMetaProgress();
    this.renderMetaProgress();
    this.sound.merge(Math.min(5, level + 2));
    this.haptic([18, 18, 42]);
    this.showToast(`${trait.name} LEVEL ${level + 1} 달성`);
  }

  calculateShardReward(won) {
    const progress = Math.max(1, this.currentWave || 1);
    const modeBonus = this.activeRunMode?.id === 'abyss' ? 1.35 : this.activeRunMode?.id === 'eclipse' ? 1.18 : 1;
    const expeditionBonus = this.runStats.trialsCompleted * 1.5 + this.runStats.relicsChosen * 1.25;
    const reward = (8 + progress * 2.4 + Math.floor(this.kills / 18) + this.maxRank * 2 + (won ? 20 : 0) + expeditionBonus) * modeBonus;
    return clamp(Math.round(reward), 8, 95);
  }

  awardRunShards(won) {
    if (this.runRewarded) return this.lastShardReward;
    this.runRewarded = true;
    this.lastShardReward = this.calculateShardReward(won);
    this.metaProgress.shards += this.lastShardReward;
    this.saveMetaProgress();
    this.renderMetaProgress();
    return this.lastShardReward;
  }

  showMission(title, copy, kicker = 'MOON MARKET ALERT', duration = 1600) {
    this.lifecycle.ui.cancel('mission-hide');
    this.lifecycle.ui.cancel('mission-collapse');
    ui.missionKicker.textContent = kicker;
    ui.missionTitle.textContent = title;
    ui.missionCopy.textContent = copy;
    ui.mission.classList.remove('show', 'hidden');
    requestAnimationFrame(() => ui.mission.classList.add('show'));
    this.scheduleUi(() => {
      ui.mission.classList.remove('show');
      this.scheduleUi(() => ui.mission.classList.add('hidden'), 320, { key: 'mission-collapse' });
    }, duration, { key: 'mission-hide' });
  }

  playMythicEvolution(unit) {
    if (!unit || unit.rank !== 5 || unit.showcase) return;
    const config = UNIT_TYPES[unit.type];
    this.lifecycle.ui.cancel('evolution-hide');
    this.lifecycle.ui.cancel('evolution-collapse');
    ui.evolutionSymbol.textContent = config.symbol;
    ui.evolutionName.textContent = `${config.name} · 신화 각성`;
    ui.evolutionUltimate.textContent = `궁극기 「${config.ultimateName}」 개방`;
    ui.evolution.classList.remove('hidden');
    requestAnimationFrame(() => ui.evolution.classList.add('show'));
    this.scheduleUi(() => {
      ui.evolution.classList.remove('show');
      this.scheduleUi(() => ui.evolution.classList.add('hidden'), 360, { key: 'evolution-collapse' });
    }, 2300, { key: 'evolution-hide' });
    this.cinematic = { unit, time: 2.25, total: 2.25, startYaw: this.cameraYaw };
    this.score += 1200;
    unit.ultimateCooldown = 1.6;
    this.sound.merge(5);
    this.sound.tone(920, .55, 'sine', .045, 560, .12);
    this.haptic([35, 35, 70, 45, 120]);
    this.shake = Math.max(this.shake, .75);
    const position = unit.group.position.clone();
    const runId = this.runId;
    for (let index = 0; index < 5; index += 1) {
      this.scheduleEffect(() => {
        if (!unit.group.parent) return;
        this.spawnRing(position, RANKS[4].color, 2.6 + index * 1.15);
      }, index * 95, { guard: () => this.runId === runId });
    }
    this.spawnParticles(position.clone().add(new THREE.Vector3(0, 1.4, 0)), RANKS[4].color, 54, 7.2);
  }

  recordFirstMission(id, amount = 1) {
    if (!this.firstMissionActive || !this.firstMissionStats || !(id in this.firstMissionStats)) return;
    this.firstMissionStats[id] += amount;
    let completedAny = false;
    while (this.firstMissionIndex < FIRST_MISSIONS.length) {
      const mission = FIRST_MISSIONS[this.firstMissionIndex];
      if ((this.firstMissionStats[mission.id] || 0) < mission.goal) break;
      this.gold += mission.reward;
      this.score += mission.reward * 25;
      if (mission.ticket) this.choiceTickets += mission.ticket;
      this.showToast(`초행 임무 완료 · +${mission.reward} 엽전${mission.ticket ? ' · 선택권 +1' : ''}`);
      this.haptic([18, 24, 42]);
      ui.firstMissionPanel.classList.remove('complete');
      requestAnimationFrame(() => ui.firstMissionPanel.classList.add('complete'));
      this.firstMissionIndex += 1;
      completedAny = true;
    }
    if (this.firstMissionIndex >= FIRST_MISSIONS.length) {
      this.firstMissionActive = false;
      try { localStorage.setItem('dokkaebi-first-missions-complete', '1'); } catch {}
      this.showMission('초행 수호 임무 완수', '이제 진짜 운빨 수호대의 밤이 시작됩니다.', 'FIRST NIGHT COMPLETE', 1900);
      this.scheduleRun(() => ui.firstMissionPanel.classList.add('hidden'), 900, { key: 'first-mission-hide' });
    }
    this.updateFirstMissionPanel();
    if (completedAny) this.updateHUD();
  }

  updateFirstMissionPanel() {
    if (!this.firstMissionActive || this.firstMissionIndex >= FIRST_MISSIONS.length) {
      ui.firstMissionPanel.classList.add('hidden');
      return;
    }
    const mission = FIRST_MISSIONS[this.firstMissionIndex];
    const progress = Math.min(mission.goal, this.firstMissionStats?.[mission.id] || 0);
    ui.firstMissionStep.textContent = `${this.firstMissionIndex + 1} / ${FIRST_MISSIONS.length}`;
    ui.firstMissionTitle.textContent = mission.title;
    ui.firstMissionProgress.style.width = `${progress / mission.goal * 100}%`;
    ui.firstMissionCopy.textContent = `${progress} / ${mission.goal} · 보상 ${mission.reward} 엽전`;
    ui.firstMissionPanel.title = mission.copy;
    ui.firstMissionPanel.classList.remove('hidden');
  }

  showCombatText(position, value, options = {}) {
    if (!ui.combatTextRoot || this.combatTextCount >= (this.lowPower ? 12 : 26)) return;
    if (this.lowPower && !options.crit && Math.random() > .42) return;
    const projected = position.clone().project(this.camera);
    if (projected.z < -1 || projected.z > 1) return;
    const x = (projected.x * .5 + .5) * window.innerWidth;
    const y = (-projected.y * .5 + .5) * window.innerHeight;
    const node = document.createElement('span');
    node.className = `combat-text${options.crit ? ' crit' : ''}${options.heal ? ' heal' : ''}`;
    node.textContent = options.label || Math.max(1, Math.round(value)).toLocaleString();
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    ui.combatTextRoot.appendChild(node);
    this.combatTextCount += 1;
    this.scheduleUi(() => {
      node.remove();
      this.combatTextCount = Math.max(0, this.combatTextCount - 1);
    }, 760);
  }

  populateCollection() {
    this.renderCodex(this.currentCodexSection);
  }

  saveCodexState() {
    saveCodexProgress(this.codexProgress);
  }

  recordCodexDiscovery(section, id, { announce = true } = {}) {
    const result = recordCodexEncounter(this.codexProgress, section, id);
    if (result.newDiscovery) {
      this.runStats.codexDiscoveries += 1;
      if (announce) this.showToast(`달빛 도감 발견 · ${getCodexEntries(section).find((entry) => entry.id === id)?.name || id}`);
    }
    this.saveCodexState();
    return result;
  }

  recordGuardianCodexUse(id) {
    const result = recordGuardianUse(this.codexProgress, id);
    if (result.newDiscovery) {
      this.runStats.codexDiscoveries += 1;
      this.showToast(`수호대 도감 등록 · ${UNIT_TYPES[id]?.name || id}`);
    }
    this.saveCodexState();
    return result;
  }

  handleCodexEnemyDefeat(enemy) {
    const section = enemy.boss ? 'boss' : 'monster';
    const result = recordCodexDefeat(this.codexProgress, section, enemy.type, () => this.random());
    if (result.newDiscovery) this.runStats.codexDiscoveries += 1;
    if (result.newWeakness) {
      this.runStats.weaknessUnlocks += 1;
      this.showMission(`${ENEMY_TYPES[enemy.type].name} 약점 해독`, `${getWeaknessLabel(enemy.type)} 공격의 영구 연구 보너스가 활성화됐습니다.`, 'CODEX RESEARCH COMPLETE', 1750);
    }
    for (const drop of result.drops) {
      this.runStats.codexDrops += 1;
      this.metaProgress.shards += drop.shards;
      this.showCombo(`${drop.icon} 전리품 · ${drop.name} · 혼불 +${drop.shards}`, drop.rarity === 'boss' ? 1800 : 1250);
    }
    if (result.drops.length) {
      this.saveMetaProgress();
      this.renderMetaProgress();
    }
    this.saveCodexState();
    return result;
  }

  openCodex(trigger = document.activeElement) {
    this.renderCodex(this.currentCodexSection);
    this.showModal(ui.collectionModal, { trigger });
  }

  renderCodex(section = 'guardian') {
    const nextSection = CODEX_SECTION_ORDER.includes(section) ? section : 'guardian';
    this.currentCodexSection = nextSection;
    const meta = CODEX_SECTION_META[nextSection];
    const entries = getCodexEntries(nextSection);
    const totals = getCodexTotals();
    const summary = getCodexProgressSummary(this.codexProgress);
    ui.collectionTabs.querySelectorAll('[data-codex-tab]').forEach((button) => {
      const active = button.dataset.codexTab === nextSection;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const sectionDiscovered = entries.filter((entry) => getCodexKnowledge(this.codexProgress, nextSection, entry.id).discovered).length;
    ui.collectionSummary.innerHTML = `<span>${meta.icon}</span><div><b>${meta.label} ${sectionDiscovered} / ${entries.length}</b><small>${meta.copy}</small></div><em>발견 ${summary.discovered}/${summary.discoverable} · 약점 ${summary.weaknesses}/${summary.weaknessTotal} · 전리품 ${summary.lootOwned}/${summary.lootTotal}</em>`;
    ui.collectionGrid.dataset.section = nextSection;
    ui.collectionGrid.innerHTML = entries.map((entry) => {
      const knowledge = getCodexKnowledge(this.codexProgress, nextSection, entry.id);
      const locked = !knowledge.discovered;
      const color = Number.isFinite(entry.color) ? `#${entry.color.toString(16).padStart(6, '0')}` : '#b995ff';
      const masteryPips = Array.from({ length: 4 }, (_, index) => `<i class="${index < knowledge.mastery ? 'on' : ''}"></i>`).join('');
      const displayName = locked ? (nextSection === 'guardian' ? '미강림 수호대' : nextSection === 'boss' ? '미조우 월식 보스' : '미발견 요괴') : entry.name;
      const subtitle = locked ? '원정에서 조우하면 기록됩니다.' : entry.subtitle || '';
      const weakness = knowledge.research ? (knowledge.weaknessUnlocked ? `${getWeaknessLabel(entry.id)} · ×${knowledge.research.multiplier.toFixed(2)}` : `연구 ${knowledge.defeats}/${nextSection === 'boss' ? 1 : 3}`) : '환경 기록';
      const lootOwned = knowledge.loot.reduce((sum, loot) => sum + (loot.count > 0 ? 1 : 0), 0);
      return `<article class="collection-item codex-item${locked ? ' locked' : ''}" tabindex="0" role="button" data-codex-section="${nextSection}" data-codex-id="${entry.id}" aria-label="${this.escapeHtml(displayName)} ${locked ? '미발견' : '3D 보기'}" style="--unit-color:${color};--unit-soft:${color}22;--unit-line:${color}66">
        <div class="portrait" aria-hidden="true">${locked ? '?' : entry.art ? runtimeSpriteMarkup(entry.art, entry.name || '', 'codex-atlas-sprite') : entry.symbol || meta.icon}</div>
        <div class="codex-item-head"><b>${this.escapeHtml(displayName)}</b><small>${this.escapeHtml(subtitle)}</small></div>
        <p>${locked ? '실루엣과 약점, 전리품 정보가 아직 달빛 장부에 기록되지 않았습니다.' : this.escapeHtml(entry.description || entry.signature || '')}</p>
        <div class="codex-research-row"><span>숙련 <b>LV.${knowledge.mastery}</b></span><span class="codex-mastery-pips">${masteryPips}</span><span>${this.escapeHtml(weakness)}</span>${knowledge.loot.length ? `<span>전리품 ${lootOwned}/${knowledge.loot.length}</span>` : ''}</div>
        <dl class="codex-detail">
          <div><dt>실루엣</dt><dd>${locked ? '???' : this.escapeHtml(entry.shape || '큰 형태 우선')}</dd></div>
          <div><dt>민담 모티프</dt><dd>${locked ? '???' : this.escapeHtml(entry.motif || '달빛 야시장')}</dd></div>
          <div><dt>대표 연출</dt><dd>${locked ? '조우 후 공개' : this.escapeHtml(entry.signature || entry.ultimate || '')}</dd></div>
          <div><dt>연구 기록</dt><dd>${locked ? '원정에서 발견하세요.' : `${nextSection === 'guardian' ? `강림 ${knowledge.uses}회` : `조우 ${knowledge.encounters} · 격파 ${knowledge.defeats}`}`}</dd></div>
        </dl><span class="codex-view-label">${locked ? '미발견' : '3D · 연구'}</span>
      </article>`;
    }).join('');
  }


  createProjectileMaterial(poolKey = 'orb') {
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    if (this.fxAtlasTexture) {
      const map = this.fxAtlasTexture.clone();
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(.25, .25);
      const cell = poolKey === 'wind' ? 2 : poolKey === 'stone' ? 3 : 0;
      map.offset.set((cell % 4) * .25, (3 - Math.floor(cell / 4)) * .25);
      map.needsUpdate = true;
      material.map = map;
      material.alphaTest = .01;
      material.needsUpdate = true;
      material.userData.disposeMap = true;
    }
    return material;
  }

  applyPrototypeTextures() {
    const groundSource = this.assetPipeline.get('moon-market-ground-v1')?.texture || null;
    if (groundSource) {
      this.prototypeGroundTexture?.dispose?.();
      this.prototypeGroundTexture = groundSource.clone();
      this.prototypeGroundTexture.wrapS = this.prototypeGroundTexture.wrapT = THREE.RepeatWrapping;
      this.prototypeGroundTexture.colorSpace = THREE.SRGBColorSpace;
      this.prototypeGroundTexture.needsUpdate = true;
    }
    this.fxAtlasTexture = this.assetPipeline.get('moon-fx-atlas-v1')?.texture || null;
    if (this.fxAtlasTexture) {
      Object.entries(this.projectilePools || {}).forEach(([key, pool]) => {
        [...pool.free, ...pool.active].forEach((projectile) => {
          const old = projectile.mesh.material;
          projectile.mesh.material = this.createProjectileMaterial(key);
          if (old?.userData?.disposeMap) old.map?.dispose?.();
          old?.dispose?.();
        });
      });
    }
  }

  getImpostorTextureSet(baseKey) {
    const set = {};
    for (const state of ['idle', 'move', 'attack']) {
      const texture = this.assetPipeline.get(`${baseKey}-${state}-impostor-v2`)?.texture || null;
      if (texture) set[state] = texture;
    }
    return set;
  }

  getAllImpostorTextures() {
    const textures = {};
    for (const baseKey of ['ember', 'imp']) {
      const set = this.getImpostorTextureSet(baseKey);
      for (const [state, texture] of Object.entries(set)) textures[`${baseKey}-${state}`] = texture;
    }
    return textures;
  }

  createNextGenCodexModel(section, id, entry, context = {}) {
    if (section === 'golden') {
      const root = this.assetPipeline.instantiateModel(PLAYER_ASSET_ID);
      if (root) return prepareImportedGuardian(root, 'player', 3, context.config || { color: 0x6c4592 }, context.rankConfig || RANKS[2], { lowPower: this.lowPower });
    }
    if (section === 'guardian') {
      const assetId = GUARDIAN_ASSET_IDS[id];
      const root = assetId ? this.assetPipeline.instantiateModel(assetId) : null;
      if (root) return prepareImportedGuardian(root, id, 4, context.config || UNIT_TYPES[id], context.rankConfig || RANKS[3], { lowPower: this.lowPower });
    }
    if (section === 'monster' || section === 'boss') {
      const assetId = section === 'boss' ? BOSS_ASSET_IDS[id] : MONSTER_ASSET_IDS[id];
      const root = assetId ? this.assetPipeline.instantiateModel(assetId) : null;
      if (root) {
        const model = prepareImportedEnemy(root, id, context.config || ENEMY_TYPES[id], { lowPower: this.lowPower });
        if (section === 'boss') applyPremiumBossPhase(model, id, context.bossPhase || 1);
        return model;
      }
    }
    return null;
  }

  ensureCodexViewer() {
    if (this.codexViewer) return this.codexViewer;
    try {
      this.codexViewer = new CodexViewer(ui.codexPreviewCanvas, {
        impostorTextures: this.getAllImpostorTextures(),
        onFrame: (frame) => this.updateCodexFrameReadout(frame),
        modelFactory: (section, id, entry, context) => this.createNextGenCodexModel(section, id, entry, context)
      });
      ui.codexFrameStatus.textContent = '드래그 회전 · 핀치/휠 확대';
    } catch (error) {
      console.warn('[CodexViewer] WebGL preview unavailable.', error);
      ui.codexFrameStatus.textContent = '이 환경에서는 3D 미리보기를 열 수 없습니다.';
      ui.codexPreviewCanvas.classList.add('unavailable');
    }
    return this.codexViewer;
  }

  openGoldenSamplePreview(trigger = document.activeElement) {
    ui.codexPreviewTitle.textContent = '도깨비 전사 · 골든 샘플';
    ui.codexPreviewSubtitle.textContent = '실제 Skin · 7 AnimationClip · 무기/장식 소켓 기술 검수';
    ui.codexImpostorBtn.disabled = true;
    ui.codexImpostorBtn.title = '골든 샘플 검수에서는 실제 3D 모델만 표시합니다.';
    ui.codexAssetSet.textContent = 'Art Review GLB · Stylized PBR';
    ui.codexLodReadout.textContent = 'LOD0 · Skinned GLB';
    ui.codexDirectionReadout.textContent = '3D 자유 회전';
    ui.codexProgressReadout.textContent = `Skin 1 · Clip ${GOLDEN_SAMPLE_CLIPS.length} · Socket ${GOLDEN_SAMPLE_SOCKETS.length}`;
    ui.codexWeaknessReadout.textContent = '기술 검수 통과 · 아트 승인 대기';
    ui.codexLootReadout.textContent = GOLDEN_SAMPLE_TEXTURE_MAPS.join(' · ');
    ui.codexResearchTip.textContent = '대기·걷기·달리기·공격·기술·피격·사망 모션을 각각 확인하세요.';
    $$('[data-codex-state]').forEach((button) => button.classList.toggle('active', button.dataset.codexState === 'idle'));
    $$('[data-codex-mode]').forEach((button) => button.classList.toggle('active', button.dataset.codexMode === 'model'));
    const viewer = this.ensureCodexViewer();
    if (viewer) {
      viewer.setEntry('golden', 'player', { name: '도깨비 전사' }, { config: { color: 0x6c4592 }, rankConfig: RANKS[2] });
      viewer.setActive(true);
    }
    this.showModal(ui.codexPreviewModal, { parent: ui.controlsModal, trigger });
  }

  openCodexPreview(section, id, trigger = document.activeElement) {
    const entry = getCodexEntries(section).find((item) => item.id === id);
    if (!entry) return;
    const knowledge = getCodexKnowledge(this.codexProgress, section, id);
    if (!knowledge.discovered) {
      this.showToast(section === 'guardian' ? '해당 수호대를 강림시키면 도감이 열립니다.' : '원정에서 먼저 조우해야 도감이 열립니다.');
      return;
    }
    ui.codexPreviewTitle.textContent = entry.name;
    ui.codexPreviewSubtitle.textContent = `${entry.subtitle || CODEX_SECTION_META[section]?.label || ''} · 드래그 회전 / 핀치 확대`;
    const baseKey = section === 'guardian' && id === 'ember' ? 'ember' : section === 'monster' && id === 'imp' ? 'imp' : '';
    const canImpostor = Boolean(baseKey && this.getImpostorTextureSet(baseKey).idle);
    ui.codexImpostorBtn.disabled = !canImpostor;
    ui.codexImpostorBtn.title = canImpostor ? `${entry.name} 대기·이동·공격 11방향 아틀라스` : '현재 11방향 애니메이션 세트는 불씨 깨비와 장난 요괴에 적용되었습니다.';
    ui.codexAssetSet.textContent = canImpostor ? 'NextGen GLB · 3D + 11방향' : section === 'boss' ? 'NextGen PBR · 페이즈 모델' : 'NextGen PBR · 실시간 3D';
    ui.codexLodReadout.textContent = (id === 'ember' || id === 'imp' || id === 'tiger') ? 'LOD0 · NextGen GLB' : 'LOD0 · NextGen 절차형';
    ui.codexDirectionReadout.textContent = '3D 자유 회전';
    ui.codexProgressReadout.textContent = `LV.${knowledge.mastery} · ${section === 'guardian' ? `강림 ${knowledge.uses}회` : `격파 ${knowledge.defeats}회`}`;
    ui.codexWeaknessReadout.textContent = knowledge.research
      ? knowledge.weaknessUnlocked ? `${getWeaknessLabel(id)} ×${knowledge.research.multiplier.toFixed(2)}` : `미해독 · ${knowledge.defeats}/${section === 'boss' ? 1 : 3}`
      : '연구 대상 없음';
    const ownedLoot = knowledge.loot.filter((loot) => loot.count > 0);
    ui.codexLootReadout.textContent = knowledge.loot.length ? (ownedLoot.length ? ownedLoot.map((loot) => `${loot.icon} ${loot.name} ×${loot.count}`).join(' · ') : `미발견 0/${knowledge.loot.length}`) : '전리품 없음';
    ui.codexResearchTip.textContent = knowledge.research
      ? knowledge.weaknessUnlocked ? knowledge.research.tip : `${section === 'boss' ? '1회' : '3회'} 격파하면 약점 연구가 완성됩니다.`
      : section === 'guardian' ? '강림 횟수가 쌓이면 숙련 단계가 상승합니다.' : '전장과 효과 항목은 원정 기록과 함께 자동 등록됩니다.';
    $$('[data-codex-state]').forEach((button) => button.classList.toggle('active', button.dataset.codexState === 'idle'));
    $$('[data-codex-mode]').forEach((button) => button.classList.toggle('active', button.dataset.codexMode === 'model'));
    const viewer = this.ensureCodexViewer();
    if (viewer) {
      const context = section === 'guardian'
        ? { config: UNIT_TYPES[id], rankConfig: RANKS[3], mastery: knowledge.mastery }
        : section === 'monster' || section === 'boss'
          ? { config: ENEMY_TYPES[id], bossPhase: section === 'boss' ? Math.max(1, Math.min(BOSS_PROFILES[id]?.phases || 1, knowledge.mastery)) : 1, mastery: knowledge.mastery }
          : { mastery: knowledge.mastery };
      viewer.setEntry(section, id, entry, context);
      viewer.setActive(true);
    }
    this.showModal(ui.codexPreviewModal, { parent: ui.collectionModal, trigger });
  }

  updateCodexFrameReadout(frame) {
    ui.codexDirectionReadout.textContent = `프레임 ${String(frame + 1).padStart(2, '0')} / 11`;
  }

  cloneDirectionalTexture(source) {
    const texture = source.clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(.25, 1 / 3);
    texture.offset.set(0, 2 / 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createDirectionalImpostor(baseKey, planeSize = 2.85, planeY = 1.46) {
    const sources = this.getImpostorTextureSet(baseKey);
    if (!sources.idle) return null;
    const textures = {};
    for (const state of ['idle', 'move', 'attack']) textures[state] = this.cloneDirectionalTexture(sources[state] || sources.idle);
    const material = new THREE.MeshBasicMaterial({ map: textures.idle, transparent: true, alphaTest: .035, depthWrite: false, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), material);
    plane.position.set(0, planeY, 0);
    plane.visible = false;
    plane.frustumCulled = false;
    return {
      plane, material, textures,
      selector: new DirectionalImpostorSelector({ directions: 11, hysteresis: .1 }),
      active: false, state: 'idle', lod0Children: []
    };
  }

  setDirectionalImpostorState(impostor, state = 'idle') {
    if (!impostor) return;
    const normalized = state === 'attack' || state === 'skill' ? 'attack' : state === 'move' || state === 'run' ? 'move' : 'idle';
    if (normalized === impostor.state) return;
    impostor.state = normalized;
    impostor.material.map = impostor.textures[normalized] || impostor.textures.idle;
    impostor.material.needsUpdate = true;
  }

  updateDirectionalImpostorFrame(impostor, worldRotationY = 0, parent = null) {
    if (!impostor?.active || !this.camera) return;
    const frame = impostor.selector.update(worldRotationY, this.cameraYaw || 0);
    const column = frame % 4;
    const row = Math.floor(frame / 4);
    impostor.material.map.offset.set(column * .25, (2 - row) / 3);
    if (parent) {
      parent.getWorldQuaternion(tempQ);
      impostor.plane.quaternion.copy(tempQ.invert().multiply(this.camera.quaternion));
    } else impostor.plane.quaternion.copy(this.camera.quaternion);
  }

  disposeDirectionalImpostor(impostor) {
    if (!impostor) return;
    Object.values(impostor.textures || {}).forEach((texture) => texture?.dispose?.());
    impostor.plane?.geometry?.dispose?.();
    impostor.material?.dispose?.();
  }

  attachUnitImpostor(unit) {
    if (unit.group?.userData?.combatVisualSpriteV110) return;
    if (unit.type !== 'ember') return;
    const impostor = this.createDirectionalImpostor('ember', 2.85, 1.46);
    if (!impostor) return;
    impostor.lod0Children = [...unit.group.children];
    unit.group.add(impostor.plane);
    unit.impostor = impostor;
  }

  updateUnitImpostor(unit) {
    const impostor = unit.impostor;
    if (!impostor || !this.camera) return;
    if (this.controlSettings?.force3DModels) {
      if (impostor.active || impostor.plane.visible) {
        impostor.active = false;
        impostor.plane.visible = false;
        impostor.lod0Children.forEach((child) => { child.visible = true; });
      }
      return;
    }
    const distance = unit.group.getWorldPosition(tempV).distanceTo(this.camera.position);
    const enterDistance = this.lowPower ? 15 : 21;
    const exitDistance = enterDistance - 2.5;
    const nextActive = impostor.active ? distance > exitDistance : distance > enterDistance;
    if (nextActive !== impostor.active) {
      impostor.active = nextActive;
      impostor.lod0Children.forEach((child) => { child.visible = !nextActive; });
      impostor.plane.visible = nextActive;
    }
    const state = unit.animation?.state || 'idle';
    this.setDirectionalImpostorState(impostor, state);
    if (!impostor.active) return;
    this.updateDirectionalImpostorFrame(impostor, unit.group.rotation.y, unit.group);
  }

  attachEnemyImpostor(group, type) {
    if (group?.userData?.combatVisualSpriteV110) return;
    if (type !== 'imp') return;
    const scale = Math.max(.82, group.userData.scale || .9);
    const impostor = this.createDirectionalImpostor('imp', 2.5 * scale, 1.25 * scale);
    if (!impostor) return;
    impostor.lod0Children = [...group.children];
    group.add(impostor.plane);
    group.userData.impostor = impostor;
  }


  cachedGeometry(key, factory) {
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, factory());
    return this.geometryCache.get(key);
  }

  getEnemyPool(type) {
    if (this.enemyPools[type]) return this.enemyPools[type];
    const initialSize = ENEMY_TYPES[type].boss ? 0 : this.lowPower ? 3 : 5;
    const maxSize = ENEMY_TYPES[type].boss ? 2 : this.lowPower ? 18 : 30;
    this.enemyPools[type] = new ObjectPool({
      initialSize,
      maxSize,
      create: () => {
        const group = this.createEnemyModel(type, ENEMY_TYPES[type]);
        group.visible = false;
        this.enemyPoolRoot.add(group);
        return group;
      },
      reset: (group) => {
        group.visible = false;
        group.position.set(0, -100, 0);
        group.rotation.set(0, 0, 0);
        group.scale.setScalar(1);
        const body = group.userData.body;
        if (body?.material) {
          body.material.emissive?.set(group.userData.baseColor || 0x000000);
          body.material.emissiveIntensity = group.userData.isBoss ? .24 : 0;
        }
        if (group.userData.isBoss) applyPremiumBossPhase(group, type, 1);
        const shield = group.userData.shield;
        if (shield?.material) shield.material.emissiveIntensity = .18;
        const eliteAura = group.userData.eliteAura;
        if (eliteAura) eliteAura.visible = false;
        group.userData.lodState = 'high';
        (group.userData.lodHigh || []).forEach((object) => { object.visible = true; });
        this.combatVisualV112?.restoreVisibility(group);
        const impostor = group.userData.impostor;
        if (impostor) {
          impostor.active = false;
          impostor.plane.visible = false;
          impostor.lod0Children.forEach((object) => { object.visible = true; });
          this.setDirectionalImpostorState(impostor, 'idle');
        }
        this.enemyPoolRoot.add(group);
      }
    });
    return this.enemyPools[type];
  }

  acquireEnemyModel(type) {
    const group = this.getEnemyPool(type).acquire();
    if (!group) return null;
    group.visible = true;
    this.combatVisualV112?.restoreVisibility(group);
    this.dynamicRoot.add(group);
    return group;
  }

  releaseEnemyModel(enemy) {
    if (!enemy?.group) return;
    this.removeEnemyTelegraph(enemy);
    this.getEnemyPool(enemy.type).release(enemy.group);
  }

  releaseAllEnemyModels() {
    this.enemies.forEach((enemy) => this.releaseEnemyModel(enemy));
    this.enemies.length = 0;
    Object.values(this.enemyPools).forEach((pool) => pool.releaseAll());
  }

  updateEnemyLOD(enemy, distanceToCamera) {
    if (enemy.group?.userData?.combatVisualSpriteV110) {
      this.combatVisualV112?.restoreVisibility(enemy.group);
      return;
    }
    if (enemy.boss) return;
    const impostor = enemy.group.userData.impostor;
    if (impostor) {
      if (this.controlSettings?.force3DModels) {
        impostor.active = false;
        impostor.plane.visible = false;
        impostor.lod0Children.forEach((object) => { object.visible = true; });
        enemy.group.userData.lodState = 'high';
        return;
      }
      const enterDistance = this.lowPower ? 16 : 22;
      const exitDistance = enterDistance - 2.5;
      const nextActive = impostor.active ? distanceToCamera > exitDistance : distanceToCamera > enterDistance;
      if (nextActive !== impostor.active) {
        impostor.active = nextActive;
        enemy.group.userData.lodState = nextActive ? 'impostor' : 'high';
        impostor.lod0Children.forEach((object) => { object.visible = !nextActive; });
        impostor.plane.visible = nextActive;
      }
      this.setDirectionalImpostorState(impostor, enemy.animation?.state || 'idle');
      if (impostor.active) this.updateDirectionalImpostorFrame(impostor, enemy.group.rotation.y, enemy.group);
      return;
    }
    const high = enemy.group.userData.lodHigh || [];
    if (!high.length) return;
    const threshold = this.lowPower ? 19 : 25;
    const next = distanceToCamera > threshold ? 'low' : 'high';
    if (next === enemy.group.userData.lodState) return;
    enemy.group.userData.lodState = next;
    high.forEach((object) => { object.visible = next === 'high'; });
  }

  createMaterial(color, roughness = .75, metalness = .05, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
  }

  mesh(geometry, material, x = 0, y = 0, z = 0, cast = true, receive = true) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = cast;
    item.receiveShadow = receive;
    return item;
  }

  clearWorld() {
    this.worldReady = false;
    this.cancelAutoWaveCountdown();
    this.combatPresentation?.clear();
    this.combatVisualV112?.clearTransient();
    this.units.forEach((unit) => {
      this.animations.remove(unit?.animation);
      this.combatVisualV112?.detach(unit?.group);
    });
    this.enemies.forEach((enemy) => this.animations.remove(enemy?.animation));
    this.animations.remove(this.player?.animation);
    this.combatVisualV112?.detach(this.player?.group);
    this.combatVisualV112?.detach(this.core);
    this.releaseAllEnemyModels();
    this.units.length = 0;
    this.projectilePools && Object.values(this.projectilePools).forEach((pool) => pool.releaseAll());
    this.coinPool?.releaseAll();
    this.projectiles.length = 0;
    this.coins.length = 0;
    this.particles.forEach((particle) => this.particlePool?.release(particle));
    this.particles.length = 0;
    this.wisps.length = 0;
    this.unitPads.length = 0;
    this.gates.length = 0;
    this.hazards.length = 0;
    this.navigationObstacles.length = 0;
    this.cameraObstacles.length = 0;
    this.engine.worldChunks.clear();
    this.moveTarget = null;
    this.moveTargetRaw = null;
    this.moveTargetMarker = null;
    this.disposeGroup(this.worldRoot);
    this.disposeGroup(this.dynamicRoot);
    this.disposeGroup(this.effectRoot);
    this.battlefieldProps?.clear();
    ui.interact?.classList.add('hidden');
    this.battlefieldSprites?.clear();
    this.player = null;
    this.core = null;
  }

  disposeGroup(root) {
    while (root.children.length) {
      const child = root.children.pop();
      child.traverse((object) => {
        if (object.geometry && !object.userData?.sharedAssetGeometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => { if (object.userData.disposeMap) material.map?.dispose?.(); material.dispose(); });
        }
      });
    }
  }

  createWorld(titleMode = false) {
    this.clearWorld();
    this.worldReady = false;
    this.scene.background.set(0x10091f);
    this.scene.fog.color.set(0x130b26);

    const groundMat = this.createMaterial(0x241933, .96);
    if (this.prototypeGroundTexture) { groundMat.map = this.prototypeGroundTexture; groundMat.map.repeat.set(5.5, 5.5); groundMat.needsUpdate = true; }
    this.groundMaterial = groundMat;
    const ground = this.mesh(new THREE.CylinderGeometry(34, 35, 1.2, 64), groundMat, 0, -.65, 0, false, true);
    ground.userData.navigationGround = true;
    this.worldRoot.add(ground);
    this.navigationObstacles.push({ x: 0, z: 0, radius: 1.82, type: 'core' });
    // The central guardian castle is intentionally excluded from camera collision.
    // v15 treated it as a solid camera obstacle and snapped Scenic view into a close-up.

    const ringMat = this.createMaterial(0x51405f, .82);
    this.ringMaterial = ringMat;
    const ring = this.mesh(new THREE.RingGeometry(8.2, 12.5, 64), ringMat, 0, .015, 0, false, true);
    ring.rotation.x = -Math.PI / 2;
    this.worldRoot.add(ring);

    this.innerMaterial = this.createMaterial(0x34233d, .9);
    const inner = this.mesh(new THREE.CircleGeometry(7.8, 64), this.innerMaterial, 0, .025, 0, false, true);
    inner.rotation.x = -Math.PI / 2;
    this.worldRoot.add(inner);

    this.createRockField(28);
    this.createLanternField(16);

    this.createMarketField(8);
    this.createMarketHeritageProps();
    this.createMoonMarketModuleSet();
    this.createNextGenEnvironmentPass();
    this.battlefieldSprites?.populate(this.worldRoot, { titleMode });
    this.battlefieldProps?.populate(this.worldRoot, this.battlefieldSprites, { titleMode });

    for (let i = 0; i < 4; i += 1) {
      const angle = i / 4 * Math.PI * 2;
      const gateX = Math.cos(angle) * 28.5;
      const gateZ = Math.sin(angle) * 28.5;
      const gate = this.createGate(gateX, gateZ, angle + Math.PI / 2, i);
      this.gates.push(gate);
      this.cameraObstacles.push({ x: gateX, z: gateZ, radius: 3.15, height: 6.4, type: 'gate' });
    }

    this.initUnitPadBatches(15);
    for (let i = 0; i < 15; i += 1) {
      const angle = i / 15 * Math.PI * 2;
      const radius = 10.15;
      this.createUnitPad(Math.cos(angle) * radius, Math.sin(angle) * radius, angle, i);
    }
    this.unitPadBaseBatch.commit();
    this.unitPadRuneBatch.commit();

    this.core = this.createSacredTree();
    this.player = this.createHero();
    this.player.group.position.set(0, 0, 6.2);

    for (let i = 0; i < (this.lowPower ? 18 : 32); i += 1) this.createWisp();
    this.createMoon();

    if (titleMode) {
      const showcase = [
        ['ember', 2, 0], ['frost', 2, 3], ['wind', 3, 6], ['stone', 2, 9], ['bell', 3, 12]
      ];
      showcase.forEach(([type, rank, padIndex]) => this.createUnit(type, rank, this.unitPads[padIndex], true));
    }
    this.setBattlefieldTheme('default', true);
    this.worldReady = true;
  }

  createMoon() {
    const moon = this.mesh(new THREE.SphereGeometry(4.2, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffe5a2 }), -28, 30, -48, false, false);
    this.worldRoot.add(moon);
    const halo = this.mesh(new THREE.SphereGeometry(5.4, 24, 16), new THREE.MeshBasicMaterial({ color: 0xd9c5ff, transparent: true, opacity: .08, side: THREE.BackSide }), -28, 30, -48, false, false);
    this.worldRoot.add(halo);
    this.moonMesh = moon;
    this.moonHalo = halo;
  }

  createRockField(count) {
    const items = [];
    for (let i = 0; i < count; i += 1) {
      const angle = i / count * Math.PI * 2;
      const radius = rand(13.5, 31.5);
      const scale = rand(.45, 1.1);
      items.push({
        position: new THREE.Vector3(Math.cos(angle) * radius + rand(-1.2, 1.2), .35 * scale, Math.sin(angle) * radius + rand(-1.2, 1.2)),
        rotation: new THREE.Euler(rand(-.3, .3), rand(0, Math.PI), rand(-.2, .2)),
        scale
      });
    }
    const chunks = new Map();
    items.forEach((item) => {
      const key = this.engine.worldChunks.keyFromPosition(item.position);
      if (!chunks.has(key)) chunks.set(key, []);
      chunks.get(key).push(item);
    });
    for (const [key, chunkItems] of chunks) {
      const batch = new InstanceBatch(
        new THREE.DodecahedronGeometry(.7, 0),
        this.createMaterial(0x45384d, 1),
        chunkItems.length,
        { name: `StaticRocks:${key}`, receiveShadow: false }
      );
      chunkItems.forEach((item) => batch.add(item));
      batch.commit();
      this.worldRoot.add(batch.mesh);
      this.engine.worldChunks.register(key, batch.mesh);
    }
  }

  createLanternField(count) {
    const wood = this.createMaterial(0x3a2029, .9);
    const warm = this.createMaterial(0xffbe58, .35, .05, 0xff7b28, 2.6);
    const posts = new InstanceBatch(new THREE.CylinderGeometry(.12, .15, 3.5, 6), wood, count, { name: 'LanternPosts' });
    const arms = new InstanceBatch(new THREE.BoxGeometry(1.2, .13, .13), wood, count, { name: 'LanternArms' });
    const lamps = new InstanceBatch(new THREE.CylinderGeometry(.34, .27, .68, 7), warm, count, { name: 'LanternLamps' });
    const lightLimit = this.engine.config.budgets.pointLightsMobile;
    let mobileLights = 0;
    for (let i = 0; i < count; i += 1) {
      const angle = i / count * Math.PI * 2;
      const radius = i % 2 ? 19.5 : 23.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotation = angle + Math.PI / 2;
      const offset = (distance, y) => new THREE.Vector3(x + Math.cos(rotation) * distance, y, z - Math.sin(rotation) * distance);
      posts.add({ position: new THREE.Vector3(x, 1.75, z), rotation: new THREE.Euler(0, rotation, 0) });
      arms.add({ position: offset(.48, 3.32), rotation: new THREE.Euler(0, rotation, 0) });
      lamps.add({ position: offset(.91, 2.85), rotation: new THREE.Euler(0, rotation, 0) });
      const allowLight = !this.lowPower ? i % 2 === 0 : mobileLights < lightLimit && i % 4 === 0;
      if (allowLight) {
        const light = new THREE.PointLight(0xff9c42, this.lowPower ? .38 : .65, 7, 2);
        light.position.copy(offset(.91, 2.85));
        this.worldRoot.add(light);
        mobileLights += 1;
      }
    }
    posts.commit(); arms.commit(); lamps.commit();
    this.worldRoot.add(posts.mesh, arms.mesh, lamps.mesh);
    this.engine.worldChunks.register('0:0', posts.mesh);
    this.engine.worldChunks.register('0:0', arms.mesh);
    this.engine.worldChunks.register('0:0', lamps.mesh);
  }

  createRock(x, z, scale = 1) {
    const rock = this.mesh(new THREE.DodecahedronGeometry(.7 * scale, 0), this.createMaterial(0x45384d, 1), x, .35 * scale, z);
    rock.rotation.set(rand(-.3, .3), rand(0, Math.PI), rand(-.2, .2));
    this.worldRoot.add(rock);
  }

  createLantern(x, z, rotation, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const wood = this.createMaterial(0x3a2029, .9);
    const warm = this.createMaterial(0xffbe58, .35, .05, 0xff7b28, 2.6);
    const post = this.mesh(new THREE.CylinderGeometry(.12, .15, 3.5, 7), wood, 0, 1.75, 0);
    const arm = this.mesh(new THREE.BoxGeometry(1.2, .13, .13), wood, .48, 3.32, 0);
    const lamp = this.mesh(new THREE.CylinderGeometry(.34, .27, .68, 8), warm, .91, 2.85, 0);
    group.add(post, arm, lamp);
    if (!this.lowPower && index % 2 === 0) {
      const light = new THREE.PointLight(0xff9c42, .65, 7, 2);
      light.position.set(.91, 2.85, 0);
      group.add(light);
    }
    this.worldRoot.add(group);
  }

  createMarketField(count) {
    const whiteWood = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, metalness: .05, vertexColors: true });
    const whiteCloth = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .83, metalness: .02, vertexColors: true });
    const counters = new InstanceBatch(new THREE.BoxGeometry(3.1, 1.05, 1.35), whiteWood, count, { name: 'MarketCounters' });
    const roofs = new InstanceBatch(new THREE.BoxGeometry(3.5, .18, 1.8), whiteCloth, count, { name: 'MarketRoofs' });
    const poles = new InstanceBatch(new THREE.BoxGeometry(.12, 2.2, .12), whiteWood, count * 2, { name: 'MarketPoles' });
    const jarColors = [0xd87a62, 0x73a976, 0xc7a65e];
    const jars = jarColors.map((color, index) => new InstanceBatch(
      new THREE.SphereGeometry(.22 + index * .03, 7, 5),
      this.createMaterial(color, .7),
      count,
      { name: `MarketJars${index + 1}` }
    ));
    const woodColors = [0x39283b, 0x432235];
    const clothColors = [0x813c68, 0x365d73, 0x74463d, 0x4f467c];
    const parent = new THREE.Matrix4();
    const local = new THREE.Matrix4();
    const world = new THREE.Matrix4();
    const parentQuaternion = new THREE.Quaternion();
    const localQuaternion = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    const compose = (batch, parentPosition, parentRotation, localPosition, localRotation, color) => {
      parentQuaternion.setFromEuler(parentRotation);
      localQuaternion.setFromEuler(localRotation);
      parent.compose(parentPosition, parentQuaternion, one);
      local.compose(localPosition, localQuaternion, one);
      world.multiplyMatrices(parent, local);
      batch.addMatrix(world.clone(), color ? new THREE.Color(color) : undefined);
    };
    for (let i = 0; i < count; i += 1) {
      const angle = i / count * Math.PI * 2 + Math.PI / count;
      const position = new THREE.Vector3(Math.cos(angle) * 16.2, 0, Math.sin(angle) * 16.2);
      const rotation = new THREE.Euler(0, angle + Math.PI / 2, 0);
      const woodColor = woodColors[i % woodColors.length];
      compose(counters, position, rotation, new THREE.Vector3(0, .53, 0), new THREE.Euler(), woodColor);
      compose(roofs, position, rotation, new THREE.Vector3(0, 2.65, -.05), new THREE.Euler(0, 0, i % 2 ? -.06 : .06), clothColors[i % clothColors.length]);
      compose(poles, position, rotation, new THREE.Vector3(-1.35, 1.65, .52), new THREE.Euler(), woodColor);
      compose(poles, position, rotation, new THREE.Vector3(1.35, 1.65, .52), new THREE.Euler(), woodColor);
      for (let jarIndex = 0; jarIndex < jars.length; jarIndex += 1) {
        compose(jars[jarIndex], position, rotation, new THREE.Vector3(-.65 + jarIndex * .62, 1.2, -.18), new THREE.Euler());
      }
      this.navigationObstacles.push({ x: position.x, z: position.z, radius: 2.05, type: 'stall' });
      this.cameraObstacles.push({ x: position.x, z: position.z, radius: 2.45, height: 3.25, type: 'stall' });
    }
    const batches = [counters, roofs, poles, ...jars];
    batches.forEach((batch) => {
      batch.commit();
      this.worldRoot.add(batch.mesh);
      this.engine.worldChunks.register('0:0', batch.mesh);
    });
  }

  createMarketHeritageProps() {
    const root = new THREE.Group();
    root.name = 'MoonMarketHeritageProps';
    const wood = this.createMaterial(0x5a3440, .91);
    const darkWood = this.createMaterial(0x2b1a2d, .94);
    const ink = this.createMaterial(0x19101f, .8);
    const paper = this.createMaterial(0xe8d5aa, .84);
    const jade = this.createMaterial(0x67d9ca, .38, .05, 0x2bc9c1, 1.3);
    const gold = this.createMaterial(0xd9a755, .5, .25, 0x8c4e1d, .35);
    const ceramic = this.createMaterial(0xd9d8ca, .25, .04, 0x8196a4, .12);
    const crimson = this.createMaterial(0x8e3554, .78);

    const createJangseung = (angle, variant = 0) => {
      const group = new THREE.Group();
      const radius = 13.7;
      group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      group.rotation.y = -angle + Math.PI / 2;
      const post = this.mesh(new THREE.CylinderGeometry(.35, .48, 3.15, 7), variant % 2 ? darkWood : wood, 0, 1.58, 0);
      const face = this.mesh(new THREE.BoxGeometry(.68, .82, .16), paper, 0, 2.18, .36);
      face.rotation.x = -.04;
      const brow1 = this.mesh(new THREE.BoxGeometry(.22, .055, .035), ink, -.17, 2.33, .46, false, false); brow1.rotation.z = -.16;
      const brow2 = brow1.clone(); brow2.position.x = .17; brow2.rotation.z = .16;
      const eye1 = this.mesh(new THREE.SphereGeometry(.045, 5, 3), jade, -.17, 2.21, .47, false, false);
      const eye2 = eye1.clone(); eye2.position.x = .17;
      const mouth = this.mesh(new THREE.TorusGeometry(.13, .025, 5, 10, Math.PI), ink, 0, 2.05, .46, false, false); mouth.rotation.z = Math.PI;
      const hat = this.mesh(new THREE.ConeGeometry(.62, .52, 6), crimson, 0, 3.22, 0);
      const brim = this.mesh(new THREE.CylinderGeometry(.7, .7, .09, 8), darkWood, 0, 3.0, 0);
      const rope = this.mesh(new THREE.TorusGeometry(.43, .045, 5, 18), gold, 0, .85, 0); rope.rotation.x = Math.PI / 2;
      group.add(post, face, brow1, brow2, eye1, eye2, mouth, hat, brim, rope);
      return group;
    };

    for (let i = 0; i < 4; i += 1) root.add(createJangseung(Math.PI / 4 + i * Math.PI / 2, i));

    const jarPositions = [
      [-8.8, -7.3, .72], [8.7, -7.1, .62], [-9.3, 7.2, .58], [9.1, 7.4, .7],
      [-12.2, 1.7, .48], [12.1, -1.6, .52]
    ];
    jarPositions.forEach(([x, z, scale], index) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const body = this.mesh(new THREE.SphereGeometry(.62 * scale, 12, 8), ceramic, 0, .58 * scale, 0);
      body.scale.y = 1.16;
      const neck = this.mesh(new THREE.CylinderGeometry(.24 * scale, .32 * scale, .34 * scale, 10), ceramic, 0, 1.1 * scale, 0);
      const rim = this.mesh(new THREE.TorusGeometry(.28 * scale, .045 * scale, 6, 16), index % 2 ? jade : gold, 0, 1.27 * scale, 0); rim.rotation.x = Math.PI / 2;
      group.add(body, neck, rim);
      root.add(group);
    });

    const shrine = new THREE.Group();
    shrine.position.set(5.4, 0, -5.1);
    shrine.rotation.y = -.38;
    const pedestal = this.mesh(new THREE.CylinderGeometry(.72, .9, .42, 8), darkWood, 0, .21, 0);
    const mascotBody = this.mesh(new THREE.SphereGeometry(.48, 10, 7), crimson, 0, 1.0, 0); mascotBody.scale.set(1, 1.15, .86);
    const mascotHead = this.mesh(new THREE.SphereGeometry(.39, 10, 7), paper, 0, 1.67, 0);
    const horn1 = this.mesh(new THREE.ConeGeometry(.12, .46, 5), gold, -.23, 2.08, 0); horn1.rotation.z = -.28;
    const horn2 = horn1.clone(); horn2.position.x = .23; horn2.rotation.z = .28;
    const eye1 = this.mesh(new THREE.SphereGeometry(.045, 5, 3), jade, -.13, 1.72, .35, false, false);
    const eye2 = eye1.clone(); eye2.position.x = .13;
    const moonRing = this.mesh(new THREE.TorusGeometry(.78, .045, 6, 24), jade, 0, 1.42, -.16); moonRing.rotation.x = Math.PI / 2;
    shrine.add(pedestal, moonRing, mascotBody, mascotHead, horn1, horn2, eye1, eye2);
    root.add(shrine);

    this.worldRoot.add(root);
    this.heritageProps = root;
  }

  createMoonMarketModuleSet() {
    const root = new THREE.Group();
    root.name = 'MoonMarketModuleSetV1';
    const wood = this.createMaterial(0x432735, .9);
    const dark = this.createMaterial(0x211522, .94);
    const brass = this.createMaterial(0xc79b52, .48, .34, 0x8c5720, .28);
    const paper = this.createMaterial(0xe6c98d, .82, .02, 0xffbc63, .24);
    const jade = this.createMaterial(0x64d8ce, .35, .08, 0x2ed9cb, 1.1);
    const cloths = [0x75354f, 0x355a73, 0x66407f, 0x79613c].map((color) => this.createMaterial(color, .82));

    const createPavilion = (angle, variant) => {
      const group = new THREE.Group();
      const radius = 20.4;
      group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      group.rotation.y = -angle + Math.PI / 2;
      const deck = this.mesh(new THREE.CylinderGeometry(2.05, 2.25, .28, 8), dark, 0, .14, 0);
      const counter = this.mesh(new THREE.BoxGeometry(3.5, .92, 1.3), wood, 0, .72, 0);
      const roof = this.mesh(new THREE.ConeGeometry(2.65, 1.05, 4), cloths[variant % cloths.length], 0, 3.2, 0);
      roof.rotation.y = Math.PI / 4;
      const finial = this.mesh(new THREE.ConeGeometry(.16, .78, 6), brass, 0, 4.03, 0);
      group.add(deck, counter, roof, finial);
      for (const x of [-1.55, 1.55]) {
        const post = this.mesh(new THREE.CylinderGeometry(.09, .12, 2.35, 6), wood, x, 1.85, .38);
        const lantern = this.mesh(new THREE.CylinderGeometry(.25, .2, .48, 8), paper, x, 2.36, .42);
        const tassel = this.mesh(new THREE.ConeGeometry(.07, .35, 5), brass, x, 2.0, .42);
        group.add(post, lantern, tassel);
      }
      for (let index = 0; index < 4; index += 1) {
        const box = this.mesh(new THREE.BoxGeometry(.48, .32, .5), index % 2 ? dark : wood, -1.1 + index * .72, 1.34, -.12);
        group.add(box);
      }
      const sign = this.mesh(new THREE.BoxGeometry(.9, .54, .08), paper, 0, 2.48, .75);
      const rune = this.mesh(new THREE.TorusGeometry(.16, .032, 5, 12), jade, 0, 2.48, .81, false, false);
      group.add(sign, rune);
      return group;
    };

    for (let index = 0; index < 4; index += 1) root.add(createPavilion(Math.PI / 4 + index * Math.PI / 2, index));

    for (let index = 0; index < 12; index += 1) {
      const angle = index / 12 * Math.PI * 2 + Math.PI / 12;
      const radius = 18.1 + (index % 2) * .55;
      const bundle = new THREE.Group();
      bundle.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      bundle.rotation.y = -angle;
      const basket = this.mesh(new THREE.CylinderGeometry(.34, .46, .45, 8), this.createMaterial(index % 2 ? 0x8b6342 : 0x68422f, .9), 0, .23, 0);
      const goods = this.mesh(new THREE.IcosahedronGeometry(.26, 0), index % 3 === 0 ? jade : index % 3 === 1 ? brass : paper, 0, .57, 0);
      const flag = this.mesh(new THREE.PlaneGeometry(.52, .78), cloths[index % cloths.length], .52, 1.25, 0, false, false);
      const pole = this.mesh(new THREE.CylinderGeometry(.035, .05, 1.9, 5), wood, .26, .95, 0);
      flag.rotation.y = Math.PI / 2;
      bundle.add(basket, goods, pole, flag);
      root.add(bundle);
    }

    this.worldRoot.add(root);
    this.marketModuleSet = root;
  }

  createNextGenEnvironmentPass() {
    const root = new THREE.Group();
    root.name = 'MoonMarketNextGenEnvironment';
    const lacquer = this.createMaterial(0x201322, .38, .22, 0x0d0711, .06);
    const redLacquer = this.createMaterial(0x6f263d, .46, .18, 0x2d0b1c, .12);
    const brass = this.createMaterial(0xd3a253, .3, .7, 0xffbb55, .24);
    const jade = this.createMaterial(0x52d6c6, .26, .12, 0x22d7c9, 1.25);
    const paper = this.createMaterial(0xf1d89b, .86, .01, 0xffa949, .42);
    const stone = this.createMaterial(0x42384d, .92, .03);
    const clothPalette = [0x722a49, 0x314e6d, 0x584078, 0x745132].map((color) => this.createMaterial(color, .78, .02));

    for (let index = 0; index < 4; index += 1) {
      const angle = Math.PI / 4 + index * Math.PI / 2;
      const pavilion = new THREE.Group();
      pavilion.position.set(Math.cos(angle) * 23.6, 0, Math.sin(angle) * 23.6);
      pavilion.rotation.y = -angle + Math.PI / 2;
      const base = this.mesh(new THREE.CylinderGeometry(2.2, 2.42, .34, 8), stone, 0, .17, 0);
      const deck = this.mesh(new THREE.BoxGeometry(3.65, .28, 2.05), lacquer, 0, .48, 0);
      pavilion.add(base, deck);
      for (const x of [-1.42, 1.42]) {
        const post = this.mesh(new THREE.CylinderGeometry(.13, .17, 2.7, 8), index % 2 ? redLacquer : lacquer, x, 1.83, .46);
        const collar = this.mesh(new THREE.TorusGeometry(.2, .035, 6, 16), brass, x, 2.86, .46); collar.rotation.x = Math.PI / 2;
        const lamp = this.mesh(new THREE.CylinderGeometry(.29, .23, .62, 10), paper, x, 2.5, .55);
        const cap = this.mesh(new THREE.ConeGeometry(.35, .22, 8), brass, x, 2.86, .55);
        pavilion.add(post, collar, lamp, cap);
      }
      const roofLower = this.mesh(new THREE.BoxGeometry(4.25, .16, 2.5), clothPalette[index], 0, 3.25, 0); roofLower.rotation.z = index % 2 ? -.035 : .035;
      const roofUpper = this.mesh(new THREE.BoxGeometry(3.55, .16, 2.05), clothPalette[(index + 1) % clothPalette.length], 0, 3.53, -.04);
      const ridge = this.mesh(new THREE.CylinderGeometry(.095, .095, 3.75, 8), brass, 0, 3.72, 0); ridge.rotation.z = Math.PI / 2;
      const finial = this.mesh(new THREE.OctahedronGeometry(.18, 1), jade, 0, 3.93, 0);
      pavilion.add(roofLower, roofUpper, ridge, finial);
      for (const side of [-1, 1]) {
        const eave = this.mesh(new THREE.ConeGeometry(.16, .55, 7), brass, side * 2.08, 3.18, 0); eave.rotation.z = side * -.9;
        pavilion.add(eave);
      }
      const sign = this.mesh(new THREE.BoxGeometry(1.12, .62, .09), paper, 0, 2.44, .78);
      const seal = this.mesh(new THREE.TorusGeometry(.19, .038, 6, 18), jade, 0, 2.44, .84); seal.rotation.x = Math.PI / 2;
      pavilion.add(sign, seal);
      root.add(pavilion);
    }

    for (let index = 0; index < 12; index += 1) {
      const angle = index / 12 * Math.PI * 2;
      const radius = 14.8 + (index % 2) * 1.2;
      const charmRoot = new THREE.Group();
      charmRoot.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      charmRoot.rotation.y = -angle;
      const pole = this.mesh(new THREE.CylinderGeometry(.035, .05, 2.15, 6), lacquer, 0, 1.08, 0);
      const banner = this.mesh(new THREE.PlaneGeometry(.58, 1.18, 1, 3), clothPalette[index % clothPalette.length], .32, 1.42, 0, false, false); banner.rotation.y = Math.PI / 2;
      const seal = this.mesh(new THREE.TorusGeometry(.14, .03, 6, 14), index % 3 === 0 ? jade : brass, .33, 1.55, .025, false, false); seal.rotation.y = Math.PI / 2;
      charmRoot.add(pole, banner, seal);
      root.add(charmRoot);
    }

    const runeOuter = this.mesh(new THREE.RingGeometry(12.82, 12.94, 96), new THREE.MeshBasicMaterial({ color: 0x8de8ff, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false }), 0, .035, 0, false, false);
    runeOuter.rotation.x = -Math.PI / 2;
    const runeInner = this.mesh(new THREE.RingGeometry(7.92, 8.02, 96), new THREE.MeshBasicMaterial({ color: 0xffc36a, transparent: true, opacity: .08, side: THREE.DoubleSide, depthWrite: false }), 0, .04, 0, false, false);
    runeInner.rotation.x = -Math.PI / 2;
    root.add(runeOuter, runeInner);
    this.worldRoot.add(root);
    this.nextGenEnvironment = root;
  }

  createMarketStall(x, z, rotation, variant) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const wood = this.createMaterial(variant % 2 ? 0x432235 : 0x39283b, .9);
    const clothColors = [0x813c68, 0x365d73, 0x74463d, 0x4f467c];
    const cloth = this.createMaterial(clothColors[variant % clothColors.length], .83);
    const counter = this.mesh(new THREE.BoxGeometry(3.1, 1.05, 1.35), wood, 0, .53, 0);
    const roof = this.mesh(new THREE.BoxGeometry(3.5, .18, 1.8), cloth, 0, 2.65, -.05);
    roof.rotation.z = variant % 2 ? -.06 : .06;
    const pole1 = this.mesh(new THREE.BoxGeometry(.12, 2.2, .12), wood, -1.35, 1.65, .52);
    const pole2 = pole1.clone(); pole2.position.x = 1.35;
    group.add(counter, roof, pole1, pole2);
    for (let i = 0; i < 3; i += 1) {
      const jar = this.mesh(new THREE.SphereGeometry(.22 + i * .03, 9, 7), this.createMaterial([0xd87a62, 0x73a976, 0xc7a65e][i], .7), -.65 + i * .62, 1.2, -.18);
      group.add(jar);
    }
    this.worldRoot.add(group);
  }

  createGate(x, z, rotation, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const stone = this.createMaterial(0x342541, .8);
    const glowColor = [0xff567f, 0x7d6cff, 0x56d7d0, 0xe09b52][index];
    const glow = this.createMaterial(glowColor, .35, .05, glowColor, 2.4);
    const left = this.mesh(new THREE.BoxGeometry(1.25, 5.1, 1.35), stone, -2.15, 2.55, 0);
    const right = left.clone(); right.position.x = 2.15;
    const top = this.mesh(new THREE.BoxGeometry(5.9, .8, 1.55), stone, 0, 5.05, 0);
    const horn1 = this.mesh(new THREE.ConeGeometry(.48, 1.7, 6), stone, -2.15, 5.8, 0); horn1.rotation.z = -.28;
    const horn2 = horn1.clone(); horn2.position.x = 2.15; horn2.rotation.z = .28;
    const portal = this.mesh(new THREE.PlaneGeometry(3.35, 4.05), new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false }), 0, 2.45, .05, false, false);
    const rune = this.mesh(new THREE.TorusGeometry(1.45, .08, 8, 32), glow, 0, 2.48, .14, false, false);
    const innerRune = this.mesh(new THREE.TorusGeometry(1.1, .035, 7, 30), new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 2.48, .18, false, false);
    const roofA = this.mesh(new THREE.BoxGeometry(6.5, .18, 1.82), this.createMaterial(index % 2 ? 0x5d2946 : 0x283f59, .62, .14), 0, 5.52, 0); roofA.rotation.z = index % 2 ? -.035 : .035;
    const roofB = this.mesh(new THREE.BoxGeometry(5.4, .16, 1.58), this.createMaterial(0x1d1424, .5, .18), 0, 5.78, -.03);
    const crest = this.mesh(new THREE.OctahedronGeometry(.28, 1), glow, 0, 6.12, 0);
    const mask = this.mesh(new THREE.CylinderGeometry(.48, .54, .12, 8), this.createMaterial(0xd9bd83, .58, .08), 0, 5.02, .84); mask.rotation.x = Math.PI / 2;
    const eyeL = this.mesh(new THREE.SphereGeometry(.055, 7, 5), glow, -.17, 5.05, .91, false, false);
    const eyeR = eyeL.clone(); eyeR.position.x = .17;
    group.add(left, right, top, horn1, horn2, portal, rune, innerRune, roofA, roofB, crest, mask, eyeL, eyeR);
    group.userData = { portal, rune, index, baseColor: glowColor };
    this.worldRoot.add(group);
    return group;
  }

  initUnitPadBatches(capacity) {
    this.unitPadBaseBatch = new InstanceBatch(
      new THREE.CylinderGeometry(1.08, 1.2, .28, 8),
      this.createMaterial(0x44354d, .78),
      capacity,
      { name: 'UnitPadBases' }
    );
    this.unitPadRuneBatch = new InstanceBatch(
      new THREE.RingGeometry(.56, .78, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }),
      capacity,
      { name: 'UnitPadRunes', dynamic: true, frustumCulled: false }
    );
    this.worldRoot.add(this.unitPadBaseBatch.mesh, this.unitPadRuneBatch.mesh);
  }

  createUnitPad(x, z, angle, index) {
    const pad = new THREE.Object3D();
    pad.position.set(x, 0, z);
    pad.userData = { index, occupied: false, angle };
    this.unitPadBaseBatch.add({ position: new THREE.Vector3(x, .14, z) });
    this.unitPadRuneBatch.add({
      position: new THREE.Vector3(x, .295, z),
      rotation: new THREE.Euler(-Math.PI / 2, 0, angle),
      scale: .86,
      color: new THREE.Color(0x594968)
    });
    this.unitPads.push(pad);
  }

  setUnitPadVisual(pad, occupied, color = 0x9a7bc1) {
    if (!pad || !this.unitPadRuneBatch) return;
    pad.userData.occupied = occupied;
    this.unitPadRuneBatch.set(pad.userData.index, {
      position: new THREE.Vector3(pad.position.x, .295, pad.position.z),
      rotation: new THREE.Euler(-Math.PI / 2, 0, pad.userData.angle),
      scale: occupied ? 1.04 : .86,
      color: new THREE.Color(occupied ? color : 0x594968)
    });
    this.unitPadRuneBatch.commit();
  }

  createSacredTree() {
    const premium = createPremiumSacredTree({ lowPower: this.lowPower });
    premium.scale.setScalar(.62);
    premium.userData.visualScale = .62;
    premium.userData.damageAnchorY = 3.65;
    premium.userData.impactY = 3.0;
    premium.userData.occlusionMaterials = [];
    premium.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const cloned = materials.map((material) => material.clone());
      object.material = Array.isArray(object.material) ? cloned : cloned[0];
      cloned.forEach((material) => premium.userData.occlusionMaterials.push({
        material,
        baseOpacity: Number.isFinite(material.opacity) ? material.opacity : 1,
        baseTransparent: Boolean(material.transparent),
        baseDepthWrite: material.depthWrite !== false
      }));
    });
    this.worldRoot.add(premium);
    this.combatVisualV112?.attachCitadel(premium, {
      getHp: () => this.coreHp,
      getMaxHp: () => this.coreMaxHp,
      getShield: () => this.moonWard,
      getMaxShield: () => 3,
      getStatuses: () => this.coreHp / Math.max(1, this.coreMaxHp) <= .28 ? ['curse'] : []
    });
    return premium;
  }

  updateCoreOcclusion(dt, target, desired) {
    const entries = this.core?.userData?.occlusionMaterials || [];
    if (!entries.length || !target || !desired) return;
    const line = tempV.copy(target).sub(desired);
    const lengthSq = Math.max(.0001, line.lengthSq());
    const center = tempV2.set(0, 2.55, 0);
    const t = clamp(center.clone().sub(desired).dot(line) / lengthSq, 0, 1);
    const closest = desired.clone().addScaledVector(line, t);
    const lineDistance = closest.distanceTo(center);
    const playerDistance = this.player?.group ? Math.hypot(this.player.group.position.x, this.player.group.position.z) : 99;
    const occluded = lineDistance < 2.45 && playerDistance < 6.3;
    const targetOpacity = occluded ? .28 : 1;
    const blend = 1 - Math.pow(occluded ? .0008 : .025, dt);
    for (const entry of entries) {
      const desiredOpacity = entry.baseOpacity * targetOpacity;
      entry.material.opacity = lerp(entry.material.opacity, desiredOpacity, blend);
      const faded = entry.material.opacity < entry.baseOpacity * .98;
      entry.material.transparent = faded || entry.baseTransparent;
      entry.material.depthWrite = faded ? false : entry.baseDepthWrite;
      entry.material.needsUpdate = true;
    }
  }

  createHero() {
    const fallback = () => {
      const group = new THREE.Group();
      const bodyMat = this.createMaterial(0x4d2a68, .65);
      const skinMat = this.createMaterial(0xd39a7b, .75);
      const clothMat = this.createMaterial(0x242139, .7);
      const glowMat = this.createMaterial(0x6eeeff, .28, .1, 0x37d8ff, 3.4);
      const body = this.mesh(new THREE.SphereGeometry(.55, 7, 5), bodyMat, 0, 1.05, 0); body.scale.set(1, 1.25, .82);
      const head = this.mesh(new THREE.SphereGeometry(.43, 7, 5), skinMat, 0, 1.85, 0);
      const hat = this.mesh(new THREE.ConeGeometry(.72, .62, 8), clothMat, 0, 2.28, 0); hat.rotation.z = -.08;
      const brim = this.mesh(new THREE.CylinderGeometry(.78, .78, .08, 8), clothMat, 0, 2.04, 0);
      const horn1 = this.mesh(new THREE.ConeGeometry(.14, .5, 5), glowMat, -.26, 2.48, 0); horn1.rotation.z = -.24;
      const horn2 = horn1.clone(); horn2.position.x = .26; horn2.rotation.z = .24;
      const foot1 = this.mesh(new THREE.SphereGeometry(.22, 5, 3), clothMat, -.28, .35, .03); foot1.scale.set(1, .7, 1.35);
      const foot2 = foot1.clone(); foot2.position.x = .28;
      const flame = this.mesh(new THREE.SphereGeometry(.22, 6, 4), glowMat, .72, 1.25, .1);
      group.add(body, head, hat, brim, horn1, horn2, foot1, foot2, flame);
      group.userData.parts = { head, signature: flame, halo: flame };
      group.userData.assetTier = 'procedural-fallback';
      return group;
    };
    const heroClass = getHeroClass(this.selectedHeroClassId);
    const assetId = heroClass.assetId || PLAYER_ASSET_ID;
    const imported = this.assetPipeline.instantiateModel(assetId);
    if (!imported) this.assetPipeline.recordFallback(assetId);
    const group = imported
      ? prepareImportedGuardian(imported, heroClass.id, 3, { color: heroClass.color }, RANKS[2], { lowPower: this.lowPower })
      : fallback();
    applyHeroClassVisuals(group, heroClass.id);
    const flame = group.userData.parts?.signature || group.getObjectByName('signature') || group;
    group.traverse((object) => { if (object.isMesh) object.userData.baseY = object.position.y; });
    this.dynamicRoot.add(group);
    const animation = this.animations.createController(group, group.userData.animations || [], { procedural: !(group.userData.animations?.length) });
    const player = {
      group, flame, classConfig: heroClass, attackCooldown: 0, dashCooldown: 0, skillCooldown: 0, dashTimer: 0, stunTimer: 0,
      hp: 100, maxHp: 100,
      facing: new THREE.Vector3(0,0,-1), attackFacing: new THREE.Vector3(0,0,-1), attackFacingLock: 0,
      animation
    };
    this.combatVisualV112?.attachHero(group, heroClass.id, {
      getHp: () => player.hp,
      getMaxHp: () => player.maxHp
    });
    this.combatVisualV112?.bindActor(group, { animation, getHp: () => player.hp, getMaxHp: () => player.maxHp });
    this.engine.geometryBudget.inspect('hero', group, 'unitTriangles');
    this.renderAssetDiagnostics();
    return player;
  }

  createWisp() {
    const color = Math.random() < .55 ? 0x75ecff : 0xb989ff;
    const mesh = this.mesh(new THREE.SphereGeometry(rand(.055,.11), 7, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: rand(.35,.8) }), 0, 0, 0, false, false);
    const angle = rand(0, Math.PI * 2);
    const radius = rand(4, 31);
    mesh.position.set(Math.cos(angle) * radius, rand(.4, 6), Math.sin(angle) * radius);
    this.effectRoot.add(mesh);
    this.wisps.push({ mesh, angle, radius, speed: rand(.08,.22), phase: rand(0, Math.PI*2), baseY: mesh.position.y });
  }

  createDefaultMods(metaTraits = {}) {
    return {
      goldMultiplier: 1,
      pickupRadius: 1.65,
      moveSpeed: 1 + (metaTraits.stride || 0) * .025,
      unitDamage: 1 + (metaTraits.bond || 0) * .035,
      unitCooldown: 1,
      heroDamage: 1,
      skillDamage: 1,
      skillCooldown: 1,
      dashCooldown: 1,
      commandCooldown: 1,
      luckGain: 1 + (metaTraits.fortune || 0) * .05,
      soulGain: 1,
      burstDuration: 0,
      burstPower: 1,
      objectiveReward: 1,
      coreDamage: 1,
      coreHealing: 1,
      reactionDamage: 1,
      statusDuration: 1,
      statusPotency: 1,
      summonDiscount: 0,
      eliteReward: 1,
      dodgeReward: 1,
      bossDamage: 1,
      critChanceBonus: 0
    };
  }



  updateTitleLoadoutSummary() {
    if (!ui.titleLoadoutSummary) return;
    const mode = getRunMode(this.selectedRunModeId);
    const hero = getHeroClass(this.selectedHeroClassId);
    const council = resolveGuardianCouncil(this.selectedHeroClassId, this.selectedCouncilSupportId);
    const seed = RUN_SEED_MODES[this.selectedSeedModeId] || RUN_SEED_MODES.daily;
    ui.titleLoadoutSummary.innerHTML = `${runtimeSpriteMarkup(hero.conceptArt || hero.icon, `${hero.name} 초상`, 'title-loadout-portrait')}<div><b>${hero.name} · ${mode.name}</b><small>${council.support.name} 지원 · ${seed.name}</small></div>`;
    this.updateHeroHudPortrait();
  }

  updateHeroHudPortrait() {
    if (!ui.heroHudPortrait) return;
    const hero = getHeroClass(this.selectedHeroClassId);
    ui.heroHudPortrait.innerHTML = runtimeSpriteMarkup(hero.conceptArt || hero.icon, `${hero.name} 전투 초상`, 'hero-hud-atlas');
  }

  runRuntimeVisualAudit() {
    const report = auditRuntimeVisuals({
      spriteDirector: this.battlefieldSprites,
      propSystem: this.battlefieldProps,
      cameraProfile: this.activeCameraProfile || getCameraProfile(this.controlSettings?.cameraProfile),
      titleScreen: ui.title,
      heroOptions: ui.heroClassOptions,
      coreObstacleCount: this.cameraObstacles.filter((entry) => entry.type === 'core').length
    });
    this.runtimeVisualAudit = report;
    globalThis.__DOKKAEBI_VISUAL_AUDIT__ = report;
    if (!report.passed) console.warn('[RuntimeVisualAuditV17]', report.warnings);
    return report;
  }

  loadHeroClass() {
    try { return HERO_CLASSES[localStorage.getItem('dokkaebi-hero-class-v1')] ? localStorage.getItem('dokkaebi-hero-class-v1') : 'warrior'; }
    catch { return 'warrior'; }
  }

  selectHeroClass(id) {
    const selected = getHeroClass(id);
    this.selectedHeroClassId = selected.id;
    this.heroClass = selected;
    try { localStorage.setItem('dokkaebi-hero-class-v1', selected.id); } catch {}
    this.renderHeroClassSelector();
    this.renderCouncilSelector();
    this.updateTitleLoadoutSummary();
    this.updateTitleLoadoutSummary();
    this.renderRunPreview();
    this.sound.ui();
  }

  renderHeroClassSelector() {
    const selected = getHeroClass(this.selectedHeroClassId);
    const selectedMastery = getHeroMasteryEntry(this.heroMastery, selected.id);
    ui.heroClassOptions.innerHTML = HERO_CLASS_ORDER.map((id) => {
      const entry = HERO_CLASSES[id];
      const mastery = getHeroMasteryEntry(this.heroMastery, entry.id);
      return `<button type="button" class="hero-class-option ${entry.id === selected.id ? 'active' : ''}" data-hero-class="${entry.id}" aria-pressed="${entry.id === selected.id}">${runtimeSpriteMarkup(entry.conceptArt || entry.icon, `${entry.name} 아틀라스 프레젠테이션`, 'hero-class-sprite')}<span><b>${entry.name}</b><small>${entry.role} · 숙련 Lv.${mastery.level}</small></span></button>`;
    }).join('');
    const masteryNeed = selectedMastery.level >= HERO_MASTERY_MAX_LEVEL ? 'MAX' : `${selectedMastery.xp}/${xpForNextLevel(selectedMastery.level)}`;
    const passive = getHeroArchetypePassive(selected.id);
    ui.heroClassSummary.innerHTML = `<b>${selected.name} · 숙련 Lv.${selectedMastery.level}</b><span>${selected.description}</span><small>${passive.icon} ${passive.name} · ${passive.description} · 투명 REVIEW 파생본 · 최종 승인 아님 · 숙련 ${masteryNeed}</small>`;
    if (ui.skillLabel) ui.skillLabel.textContent = selected.skill.name.replace(/ .*/, '').slice(0, 5);
  }

  loadCouncilSupport() {
    try { return sanitizeCouncilSupportId(localStorage.getItem(GUARDIAN_COUNCIL_STORAGE_KEY)); }
    catch { return 'shaman'; }
  }

  selectCouncilSupport(id) {
    this.selectedCouncilSupportId = sanitizeCouncilSupportId(id);
    this.guardianCouncil = resolveGuardianCouncil(this.selectedHeroClassId, this.selectedCouncilSupportId);
    try { localStorage.setItem(GUARDIAN_COUNCIL_STORAGE_KEY, this.selectedCouncilSupportId); } catch {}
    this.renderCouncilSelector();
    this.updateTitleLoadoutSummary();
    this.renderRunPreview();
    this.sound.ui();
  }

  renderCouncilSelector() {
    if (!ui.councilOptions || !ui.councilSummary) return;
    const selectedId = sanitizeCouncilSupportId(this.selectedCouncilSupportId);
    this.guardianCouncil = resolveGuardianCouncil(this.selectedHeroClassId, selectedId);
    ui.councilOptions.innerHTML = Object.values(GUARDIAN_COUNCIL_SUPPORTS).map((entry) => `
      <button type="button" class="council-option ${entry.id === selectedId ? 'active' : ''}" data-council-support="${entry.id}" aria-pressed="${entry.id === selectedId}">
        <span>${entry.icon}</span><b>${entry.name}</b><small>${entry.role}</small>
      </button>`).join('');
    ui.councilSummary.innerHTML = `<span>${this.guardianCouncil.bond.icon}</span><div><small>${this.guardianCouncil.support.name} 지원</small><b>${this.guardianCouncil.bond.name}</b><em>${this.guardianCouncil.bond.description}</em></div>`;
  }

  updateCouncilHUD() {
    if (!ui.councilChip) return;
    const council = this.guardianCouncil || resolveGuardianCouncil(this.selectedHeroClassId, this.selectedCouncilSupportId);
    ui.councilChipIcon.textContent = council.bond.icon;
    ui.councilChipName.textContent = council.bond.name;
    ui.councilChipSupport.textContent = `${council.support.name} · ${council.support.role} 지원`;
  }

  applyHeroClassRunModifiers() {
    const selected = getHeroClass(this.selectedHeroClassId);
    this.heroClass = selected;
    this.mods.moveSpeed *= selected.modifiers.moveSpeed;
    this.mods.heroDamage *= selected.modifiers.heroDamage;
    this.mods.skillDamage *= selected.modifiers.skillDamage;
    this.activeHeroPassive = applyHeroArchetypeModifiers(this.mods, selected.id);
    this.guardianCouncil = applyGuardianCouncilModifiers(this.mods, selected.id, this.selectedCouncilSupportId);
    const mastery = getHeroMasteryBonus(this.heroMastery, selected.id);
    this.mods.heroDamage *= mastery.heroDamage;
    this.mods.skillDamage *= mastery.skillDamage;
    this.mods.moveSpeed *= mastery.moveSpeed;
    this.activeEquipmentBonuses = applyEquipmentBonuses(this.mods, this.equipmentState);
    if (this.player) this.player.classConfig = selected;
  }

  openEquipmentModal(origin = null) {
    this.renderEquipmentModal();
    const parent = this.modalStack.at(-1);
    this.showModal(ui.equipmentModal, { parent: parent === ui.pauseModal ? parent : null, trigger: origin });
  }

  selectEquipmentItem(itemId) {
    const previous = this.equipmentState;
    this.equipmentState = saveEquipmentState(equipItem(previous, itemId));
    const item = EQUIPMENT_ITEMS.find((entry) => entry.id === itemId);
    this.renderEquipmentModal();
    this.renderRunPreview();
    this.sound.ui();
    if (item) this.showToast(`${item.name} 장착 완료${this.state === 'playing' || this.state === 'paused' ? ' · 다음 원정부터 적용' : ''}`);
  }

  forgeEquipment(itemId) {
    const result = forgeEquipmentItem(this.equipmentState, itemId);
    this.equipmentState = saveEquipmentState(result.state);
    this.renderEquipmentModal();
    this.renderRunPreview();
    if (result.upgraded) {
      this.sound.merge(Math.min(5, result.level));
      this.haptic([18, 20, 36]);
      this.showToast(`${result.item.name} +${result.level} 단조 완료 · 정수 -${result.cost}`);
    } else if (result.reason === 'max-level') {
      this.showToast(`${result.item?.name || '장비'}는 이미 +${EQUIPMENT_FORGE_MAX_LEVEL}입니다.`);
    } else if (result.reason === 'insufficient-essence') {
      this.showToast(`장비 정수 ${result.cost}개가 필요합니다.`);
    }
  }

  renderEquipmentModal() {
    if (!ui.equipmentList) return;
    const equipped = getEquippedItems(this.equipmentState);
    ui.equipmentEssence.textContent = Number(this.equipmentState?.essence || 0).toLocaleString();
    ui.equipmentSlots.innerHTML = EQUIPMENT_SLOTS.map((slot) => {
      const item = equipped.find((entry) => entry.slot === slot.id);
      const rarity = item ? EQUIPMENT_RARITIES[item.rarity] : null;
      const forgeLevel = item ? getEquipmentForgeLevel(this.equipmentState, item.id) : 0;
      return `<article class="equipment-slot-card" style="--rarity:${rarity?.color || '#697386'}">${item ? equipmentIconMarkup(item) : `<span>${slot.icon}</span>`}<div><small>${slot.name}${forgeLevel ? ` · FORGE +${forgeLevel}` : ''}</small><b>${item?.name || '비어 있음'}</b><em>${item?.desc || '장비를 선택하세요.'}</em></div></article>`;
    }).join('');
    ui.equipmentList.innerHTML = EQUIPMENT_SLOTS.map((slot) => {
      const items = EQUIPMENT_ITEMS.filter((item) => item.slot === slot.id && this.equipmentState.owned.includes(item.id));
      return `<section class="equipment-group"><header><span>${slot.icon}</span><b>${slot.name}</b><small>${items.length}종 보유</small></header><div>${items.map((item) => {
        const rarity = EQUIPMENT_RARITIES[item.rarity];
        const active = this.equipmentState.equipped[slot.id] === item.id;
        const forgeLevel = getEquipmentForgeLevel(this.equipmentState, item.id);
        const forgeCost = getEquipmentForgeCost(item, forgeLevel);
        const maxed = forgeLevel >= EQUIPMENT_FORGE_MAX_LEVEL;
        const canForge = !maxed && this.equipmentState.essence >= forgeCost;
        return `<article class="equipment-item-row ${active ? 'active' : ''}" style="--rarity:${rarity.color}"><button type="button" class="equipment-item ${active ? 'active' : ''}" data-equipment-id="${item.id}">${equipmentIconMarkup(item)}<div><b>${item.name}${forgeLevel ? ` +${forgeLevel}` : ''}</b><small>${rarity.name} · ${item.desc}</small></div><em>${active ? '장착 중' : '장착'}</em></button><button type="button" class="equipment-forge" data-equipment-forge="${item.id}" ${maxed || !canForge ? 'disabled' : ''}><span>鍛</span><b>${maxed ? 'MAX' : `+${forgeLevel + 1}`}</b><small>${maxed ? '완성' : `정수 ${forgeCost}`}</small></button></article>`;
      }).join('')}</div></section>`;
    }).join('');
    const bonuses = applyEquipmentBonuses({ heroDamage:1, skillDamage:1, moveSpeed:1, dashCooldown:1, soulGain:1, bossDamage:1, pickupRadius:0 }, this.equipmentState);
    ui.equipmentBonus.textContent = `대장 +${Math.round((bonuses.heroDamage - 1) * 100)}% · 기술 +${Math.round((bonuses.skillDamage - 1) * 100)}% · 이동 +${Math.round((bonuses.moveSpeed - 1) * 100)}% · 단조 ${this.equipmentState.forged || 0}회`;
    const mastery = getHeroMasteryEntry(this.heroMastery, this.selectedHeroClassId);
    ui.equipmentMastery.textContent = `${this.heroClass?.name || '도깨비 전사'} 숙련 Lv.${mastery.level} · 원정 ${mastery.runs}회 · 승리 ${mastery.wins}회`;
  }

  refreshHeroVisualLoadout() {
    if (!this.player?.group) return;
    const state = applyRelicVisuals(this.player.group, this.relicHistory || []);
    if (ui.relicLoadout) ui.relicLoadout.innerHTML = `<span>외형 장착</span><b>${state.labels.length ? state.labels.join(' · ') : `${this.heroClass?.name || '도깨비 전사'} 기본 장비`}</b>`;
  }

  loadSeedMode() {
    try { return localStorage.getItem('dokkaebi-seed-mode-v1') === 'random' ? 'random' : 'daily'; }
    catch { return 'daily'; }
  }

  selectSeedMode(id) {
    this.selectedSeedModeId = id === 'random' ? 'random' : 'daily';
    try { localStorage.setItem('dokkaebi-seed-mode-v1', this.selectedSeedModeId); } catch {}
    this.dailyEdict = getDailyEdict(createDailySeed());
    this.renderSeedModeSelector();
    this.updateTitleLoadoutSummary();
    this.renderRunPreview();
    this.sound.ui();
  }

  renderSeedModeSelector() {
    const selected = RUN_SEED_MODES[this.selectedSeedModeId] || RUN_SEED_MODES.daily;
    const dailySeed = createDailySeed();
    const edict = getDailyEdict(dailySeed);
    ui.seedModeOptions.innerHTML = Object.values(RUN_SEED_MODES).map((mode) => `
      <button type="button" class="seed-mode-option ${mode.id === selected.id ? 'active' : ''}" data-seed-mode="${mode.id}" aria-pressed="${mode.id === selected.id}">
        <span>${mode.icon}</span><b>${mode.name}</b><small>${mode.tag}</small>
      </button>`).join('');
    ui.dailyEdictPreview.innerHTML = `<span>${edict.icon}</span><div><small>오늘의 칙령 · ${dailySeed}</small><b>${edict.name}</b><em>${edict.desc}</em></div>`;
  }

  prepareRunSeed(reuseSeed = false) {
    if (!reuseSeed || !this.runSeed) {
      this.runSeed = this.selectedSeedModeId === 'daily' ? createDailySeed() : createRandomSeed();
    }
    this.runRandom = createSeededRandom(this.runSeed);
    this.dailyEdict = getDailyEdict(this.runSeed);
  }

  renderRunSeedChip() {
    const mode = RUN_SEED_MODES[this.selectedSeedModeId] || RUN_SEED_MODES.daily;
    ui.runSeedIcon.textContent = mode.icon;
    ui.runSeedMode.textContent = mode.id === 'daily' ? "TODAY'S EXPEDITION" : 'SEEDED EXPEDITION';
    ui.runSeedValue.textContent = this.runSeed;
    ui.runEdictName.textContent = `${this.dailyEdict.icon} ${this.dailyEdict.name}`;
    ui.runSeedChip.classList.remove('hidden');
  }

  loadRunMode() {
    try { return getRunMode(localStorage.getItem('dokkaebi-run-mode-v1')).id; }
    catch { return 'guardian'; }
  }

  selectRunMode(id) {
    this.selectedRunModeId = getRunMode(id).id;
    this.activeRunMode = getRunMode(this.selectedRunModeId);
    try { localStorage.setItem('dokkaebi-run-mode-v1', this.selectedRunModeId); } catch {}
    this.renderRunModeSelector();
    this.updateTitleLoadoutSummary();
    this.renderRunPreview();
    this.sound.ui();
  }

  renderRunModeSelector() {
    const selected = getRunMode(this.selectedRunModeId);
    ui.runModeOptions.innerHTML = Object.values(RUN_MODES).map((mode) => `
      <button type="button" class="run-mode-option ${mode.id === selected.id ? 'active' : ''}" data-run-mode="${mode.id}" aria-pressed="${mode.id === selected.id}">
        <span>${mode.icon}</span><b>${mode.name}</b><small>${mode.tag}</small>
      </button>`).join('');
    ui.runModeSummary.innerHTML = `<b>${selected.name}</b><span>${selected.description}</span><small>적 체력 ×${selected.enemyHp.toFixed(2)} · 점수 ×${selected.score.toFixed(2)} · 정예 +${Math.round(selected.eliteChance * 100)}%</small>`;
  }

  renderRelicStrip() {
    const relics = this.relicHistory.map((id) => getRelicById(id)).filter(Boolean);
    const setProgress = getRelicSetProgress(this.relicHistory);
    ui.relicCount.textContent = `${relics.length}/5`;
    ui.relicStrip.innerHTML = relics.length
      ? relics.map((relic) => `<span class="relic-chip ${relic.cursed ? 'cursed' : ''} ${setProgress[relic.set]?.active ? 'set-active' : ''}" title="${relic.name} · ${relic.desc}">${relic.icon}<small>${relic.name}</small></span>`).join('')
      : '<span class="relic-empty">원정 유물 없음</span>';
  }

  offerRelic() {
    if (this.state !== 'playing') return;
    this.state = 'relic';
    const options = selectRelicOptions(this.relicHistory, () => this.random(), 3, { guaranteeCursed: this.lastRelicOfferBossWave || this.currentWave >= 8 });
    ui.relicOptions.innerHTML = options.map((relic) => `
      <button class="relic-option" data-relic="${relic.id}">
        <span>${relic.icon}</span><b>${relic.name}</b><p>${relic.desc}</p><small>${relic.grade} · ${relic.tag}</small>
      </button>`).join('');
    this.showModal(ui.relicModal);
    this.startRewardAutoChoice('relic', 10);
    this.scheduleUi(() => {
      if (this.state === 'relic' && !ui.relicModal.classList.contains('visible')) this.restoreRewardModal('relic');
    }, 420, { key: 'relic-modal-visibility-guard' });
  }

  selectRelic(id) {
    const relic = RELICS.find((item) => item.id === id);
    if (!relic || this.relicHistory.includes(id)) return;
    relic.apply(this);
    this.cancelRewardAutoChoice('relic');
    this.relicHistory.push(id);
    const activatedSets = activateRelicSetBonuses(this);
    this.runStats.relicsChosen += 1;
    this.hideModal(ui.relicModal);
    this.state = 'playing';
    this.waveFlowGuard.noteProgress(this.getWaveFlowSnapshot(), 'relic-selected');
    this.renderRelicStrip();
    this.renderEquipmentModal();
    this.refreshHeroVisualLoadout();
    this.sound.merge(Math.min(5, 2 + this.relicHistory.length));
    this.haptic([20, 24, 50]);
    this.showCombo(`${relic.icon} ${relic.cursed ? '저주 전설' : '원정 유물'} · ${relic.name}`, 1700);
    if (activatedSets.length) {
      this.runStats.relicSetsActivated += activatedSets.length;
      this.scheduleRun(() => this.showMission(`${activatedSets[0].icon} ${activatedSets[0].name}`, activatedSets[0].desc, 'RELIC SET AWAKENED', 1450), 420);
    }
    this.advancePostWaveRewards();
    this.updateHUD();
  }

  assignWaveTrial() {
    this.currentTrial = rollWaveTrial(this.currentWave, this.activeRunMode.id, this.lastTrialId, () => this.random());
    this.lastTrialId = this.currentTrial.id;
    this.currentTrial.start = {
      eliteKills: this.runStats.eliteKills,
      coinsCollected: this.runStats.coinsCollected,
      skillDamage: this.runStats.skillDamage,
      dashUses: this.runStats.dashUses
    };
    this.waveMaxChain = 0;
    this.waveTrialEliteSpawned = 0;
    ui.waveTrialIcon.textContent = this.currentTrial.icon;
    ui.waveTrialName.textContent = this.currentTrial.name;
    const reward = getWaveTrialReward(this.currentWave, this.activeRunMode.id, this.mods.objectiveReward * (this.dailyEdict?.reward || 1));
    ui.waveTrialReward.textContent = `보상 ${reward.gold} 엽전 · 혼불 ${reward.soul}%`;
    ui.waveTrial.classList.remove('hidden', 'complete', 'failed');
    this.updateWaveTrial(true);
  }

  updateWaveTrial(force = false) {
    if (!this.currentTrial || (!this.waveActive && !force)) return;
    this.currentTrial.progress = getWaveTrialProgress(this, this.currentTrial);
    const complete = this.currentTrial.progress >= this.currentTrial.target;
    if (this.currentTrial.id === 'perfect' && this.currentTrial.progress < 1) ui.waveTrial.classList.add('failed');
    if (complete && !this.currentTrial.completed && this.currentTrial.id !== 'perfect') {
      this.currentTrial.completed = true;
      ui.waveTrial.classList.add('complete');
      this.showCombo(`${this.currentTrial.icon} 도전 달성 · ${this.currentTrial.name}`, 1100);
      this.gainSoul(5, 'trial');
    }
    ui.waveTrialProgress.textContent = formatTrialProgress(this.currentTrial);
  }

  resolveWaveTrial(perfect) {
    if (!this.currentTrial) return;
    this.updateWaveTrial(true);
    if (this.currentTrial.id === 'perfect') this.currentTrial.completed = perfect;
    const reward = getWaveTrialReward(this.currentWave, this.activeRunMode.id, this.mods.objectiveReward * (this.dailyEdict?.reward || 1));
    if (this.currentTrial.completed) {
      this.gold += reward.gold;
      this.score += reward.score;
      this.gainSoul(reward.soul, 'trial-reward');
      this.runStats.trialsCompleted += 1;
      ui.waveTrial.classList.add('complete');
      this.showCombo(`${this.currentTrial.icon} ${this.currentTrial.name} 완수 · +${reward.gold} 엽전`, 1500);
    } else {
      this.currentTrial.failed = true;
      ui.waveTrial.classList.add('failed');
      this.showToast(`${this.currentTrial.name} 도전 실패 · 다음 습격에서 다시 도전하세요.`);
    }
  }

  gainSoul(amount, reason = '') {
    if (!Number.isFinite(amount) || amount <= 0 || this.guardianBurstTimer > 0) return;
    const omenGain = this.activeOmen?.soulGain || 1;
    const modeGain = this.activeRunMode?.soulGain || 1;
    const edictGain = this.dailyEdict?.soulGain || 1;
    const before = this.soulGauge;
    this.soulGauge = clamp(this.soulGauge + amount * this.mods.soulGain * omenGain * modeGain * edictGain * (this.battlefieldEvents?.soulMultiplier || 1), 0, 100);
    if (before < 100 && this.soulGauge >= 100) {
      this.showCombo('수호신 혼불 충전 완료 · 폭주 가능!', 1350);
      this.haptic([18, 20, 45]);
    }
  }

  activateGuardianBurst() {
    if (this.state !== 'playing' || this.soulGauge < 100 || this.guardianBurstTimer > 0) return;
    this.soulGauge = 0;
    this.guardianBurstTimer = 10 + this.mods.burstDuration;
    this.runStats.guardianBursts += 1;
    this.sound.skill();
    this.haptic([28, 24, 50, 28, 78]);
    this.spawnRing(this.player.group.position, 0x8cecff, 7.2);
    this.spawnParticles(this.player.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x8cecff, 36, 6.2);
    this.showMission('수호신 폭주', '대장과 수호대의 공격·기동력이 폭발적으로 증가합니다.', 'GUARDIAN SPIRIT UNLEASHED', 1600);
  }

  buildPostWaveQueue() {
    const queue = [];
    this.lastRelicOfferBossWave = isBossWave(this.currentWave);
    if ([2, 4, 5, 7, 9].includes(this.currentWave)) queue.push('relic');
    if (this.currentWave === 5 || this.currentWave === 8) queue.push('contract');
    if (this.currentWave % 3 === 0) queue.push('blessing');
    this.postWaveQueue = queue;
  }

  advancePostWaveRewards() {
    if (this.state !== 'playing') return;
    const next = this.postWaveQueue.shift();
    if (next === 'relic') { this.offerRelic(); return; }
    if (next === 'contract') { this.offerContract(); return; }
    if (next === 'blessing') { this.offerBlessing(); return; }
    ui.wave.disabled = false;
    ui.waveText.textContent = `${this.currentWave + 1}`;
    this.beginAutoWaveCountdown(10);
  }

  beginAutoWaveCountdown(seconds = 10) {
    if (this.state !== 'playing' || this.waveActive || this.currentWave >= this.maxWaves) return;
    this.autoWaveCountdownDuration = Math.max(1, Number(seconds) || 10);
    this.autoWaveCountdown = this.autoWaveCountdownDuration;
    this.autoWaveAnnounced = Math.ceil(this.autoWaveCountdown);
    ui.wave.classList.add('auto-countdown');
    ui.wave.style.setProperty('--auto-wave-progress', '0deg');
    ui.autoWavePanel?.classList.remove('hidden', 'imminent');
    if (ui.autoWavePanel) {
      void ui.autoWavePanel.offsetWidth;
      ui.autoWavePanel.classList.add('show');
    }
    this.showToast(`전열 정비 · ${Math.ceil(this.autoWaveCountdown)}초 후 다음 습격 자동 시작`);
    this.updateAutoWaveButton();
  }

  cancelAutoWaveCountdown() {
    this.autoWaveCountdown = 0;
    this.autoWaveAnnounced = -1;
    ui.wave?.classList.remove('auto-countdown', 'auto-imminent');
    ui.wave?.style.removeProperty('--auto-wave-progress');
    ui.autoWavePanel?.classList.remove('show', 'imminent');
    ui.autoWavePanel?.classList.add('hidden');
    ui.autoWavePanelProgress?.style.removeProperty('width');
    if (ui.waveLabelAction) ui.waveLabelAction.textContent = '다음 습격';
  }

  updateAutoWaveCountdown(dt) {
    if (this.autoWaveCountdown <= 0 || this.state !== 'playing' || this.waveActive) return;
    this.autoWaveCountdown = Math.max(0, this.autoWaveCountdown - dt);
    const whole = Math.ceil(this.autoWaveCountdown);
    if (whole !== this.autoWaveAnnounced) {
      this.autoWaveAnnounced = whole;
      if (whole > 0 && whole <= 3) {
        this.showCombo(`${whole}초 후 다음 습격`, 620);
        this.haptic(whole === 1 ? 18 : 8);
      }
    }
    ui.wave.classList.toggle('auto-imminent', this.autoWaveCountdown <= 3);
    this.updateAutoWaveButton();
    if (this.autoWaveCountdown <= 0) this.startWave({ auto: true });
  }

  updateAutoWaveButton() {
    if (!ui.wave || this.autoWaveCountdown <= 0) return;
    const progress = 1 - this.autoWaveCountdown / Math.max(1, this.autoWaveCountdownDuration);
    const seconds = Math.max(1, Math.ceil(this.autoWaveCountdown));
    ui.wave.style.setProperty('--auto-wave-progress', `${Math.round(progress * 360)}deg`);
    if (ui.waveLabelAction) ui.waveLabelAction.textContent = '자동 진군';
    ui.waveText.textContent = `${seconds}초`;
    ui.wave.setAttribute('aria-label', `${seconds}초 후 다음 습격 자동 시작. 누르면 즉시 시작`);
    if (ui.autoWavePanel) {
      ui.autoWavePanel.classList.remove('hidden');
      ui.autoWavePanel.classList.add('show');
      ui.autoWavePanel.classList.toggle('imminent', seconds <= 3);
      ui.autoWavePanel.setAttribute('aria-label', `${seconds}초 후 웨이브 ${this.currentWave + 1} 자동 시작. 누르면 즉시 출발`);
    }
    if (ui.autoWaveTitle) ui.autoWaveTitle.textContent = `웨이브 ${this.currentWave + 1} 진군 준비`;
    if (ui.autoWaveCopy) ui.autoWaveCopy.textContent = seconds <= 3 ? '월문이 열립니다 · 즉시 출발 가능' : '수호대를 정비하세요 · 누르면 즉시 출발';
    if (ui.autoWaveSeconds) ui.autoWaveSeconds.textContent = `${seconds}`;
    if (ui.autoWavePanelProgress) ui.autoWavePanelProgress.style.width = `${Math.round(progress * 100)}%`;
  }

  async startRunFromTitle({ reuseSeed = false } = {}) {
    if (this.startRunPending || this.state !== 'title') return false;
    this.startRunPending = true;
    const entryStartedAt = performance.now();
    if (ui.start) {
      ui.start.disabled = true;
      ui.start.setAttribute('aria-busy', 'true');
      ui.start.dataset.ready = 'false';
      const startLabel = document.getElementById('title-start-label');
      if (startLabel) startLabel.textContent = '월문을 여는 중...';
      ui.start.setAttribute('aria-label', '월문을 여는 중...');
    }
    ui.title?.classList.remove('visible');
    ui.title?.setAttribute('aria-hidden', 'true');
    if (ui.loadingStatus) ui.loadingStatus.textContent = '수호대를 전장으로 부르는 중...';
    if (ui.loadingDetail) ui.loadingDetail.textContent = '달빛 장터와 전투 UI를 안전하게 전환하고 있습니다.';
    ui.loading?.classList.add('visible', 'run-entry-loading-v108');
    await this.waitForUiPaint(2, 900);
    try {
      this.sound.unlock();
      this.sound.ui();
      const deferredReady = await this.waitForDeferredAssets(this.lowPower ? 900 : 1200);
      if (!deferredReady && ui.loadingDetail) ui.loadingDetail.textContent = '남은 에셋은 전투 중 안전하게 이어서 준비합니다.';
      this.startRun({ reuseSeed });
      if (this.state !== 'playing') throw new Error(`전투 상태 전환 실패: ${this.state}`);
      this.browserReliability?.noteMilestone('start-run-entered', {
        runId: this.runId,
        seed: this.runSeed,
        transitionMs: Math.round(performance.now() - entryStartedAt)
      });
      return true;
    } catch (error) {
      this.recordRuntimeError(error, 'title-start-run');
      this.lifecycle.endRun();
      this.runId = (this.runId || 0) + 1;
      try { this.state = 'title'; } catch { /* state recovery is best effort */ }
      try { this.showGameUI(false); } catch { /* UI recovery is best effort */ }
      try { this.createWorld(true); } catch { /* world recovery is best effort */ }
      ui.title?.classList.add('visible');
      ui.title?.setAttribute('aria-hidden', 'false');
      const reason = error instanceof Error ? error.message : String(error);
      window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(`전투 진입 중 오류가 발생했습니다: ${reason}`);
      return false;
    } finally {
      this.startRunPending = false;
      ui.loading?.classList.remove('visible', 'run-entry-loading-v108');
      if (ui.start && this.state === 'title') {
        ui.start.disabled = false;
        ui.start.setAttribute('aria-busy', 'false');
        const startLabel = document.getElementById('title-start-label');
        if (startLabel) startLabel.textContent = 'TOUCH TO START';
        ui.start.dataset.ready = 'true';
        ui.start.setAttribute('aria-label', 'TOUCH TO START');
      }
      if (this.state === 'playing') {
        ui.title?.classList.remove('visible');
        ui.title?.setAttribute('aria-hidden', 'true');
      }
    }
  }

  startRun({ reuseSeed = false } = {}) {
    this.prepareRunSeed(reuseSeed);
    this.lifecycle.beginRun();
    this.resetTransientUi();
    this.runId = (this.runId || 0) + 1;
    const activeRunId = this.runId;
    ui.title.classList.remove('visible');
    this.hideModal(ui.resultModal);
    this.hideModal(ui.pauseModal);
    this.createWorld(false);
    this.state = 'playing';
    this.currentWave = 0;
    this.maxWaves = 10;
    this.activeRunMode = getRunMode(this.selectedRunModeId);
    this.waveActive = false;
    this.spawnRemaining = 0;
    this.spawnTotal = 0;
    this.spawnTimer = 0;
    this.waveFlowGuard.reset();
    this.waveReliability.resetRun({ seed: this.runSeed, mode: this.selectedRunModeId, hero: this.selectedHeroClassId, maxWaves: 10 });
    this.autoPausedByVisibility = false;
    this.lastVisibilityResumeSeconds = 0;
    const metaTraits = this.metaProgress.traits;
    this.coreMaxHp = 100 + (metaTraits.ward || 0) * 7;
    this.coreHp = this.coreMaxHp;
    this.gold = 70 + (metaTraits.pouch || 0) * 10 + this.activeRunMode.startGold;
    this.score = 0;
    this.kills = 0;
    this.summonCount = 0;
    this.luck = 0;
    this.maxRank = 1;
    this.killChain = 0;
    this.killChainTimer = 0;
    this.qualitySampleTime = 0;
    this.qualityFrames = 0;
    this.blessingHistory = [];
    this.choiceTickets = 0;
    this.pendingSummon = null;
    this.pendingContract = null;
    this.activeContract = null;
    this.cinematic = null;
    this.cameraCollisionDistance = this.cameraDistance;
    this.runRewarded = false;
    this.progressRewarded = false;
    this.lastShardReward = 0;
    this.commandCooldown = 0;
    this.commandActiveKey = '';
    this.activeOmen = null;
    this.lastOmenId = '';
    this.moonWard = Math.min(3, (this.activeRunMode.startWard || 0) + (this.dailyEdict?.startWard || 0));
    this.jackpotTimer = 0;
    this.guardianBurstTimer = 0;
    this.soulGauge = clamp((metaTraits.spirit || 0) * 8, 0, 100);
    this.relicHistory = [];
    this.activeRelicSets = [];
    this.currentTrial = null;
    this.lastTrialId = '';
    this.postWaveQueue = [];
    this.waveMaxChain = 0;
    this.waveTrialEliteSpawned = 0;
    this.eliteKills = 0;
    this.runStats = this.createRunStats();
    this.combatTelemetry.resetRun();
    this.battleMomentum.resetRun();
    this.bossEscalation.resetRun();
    this.bossBreak.resetRun();
    this.campaign.resetRun();
    document.body.classList.remove('momentum-overdrive');
    this.activeEncounterPlan = null;
    this.lastEncounterResult = null;
    this.cancelMoveTarget();
    this.displayDanger = null;
    this.pendingDangerKey = '';
    this.pendingDangerTimer = 0;
    this.dangerLostGrace = 0;
    ui.resultShards.textContent = '+0';
    this.lifecycle.ui.cancel('evolution-hide');
    this.lifecycle.ui.cancel('evolution-collapse');
    ui.evolution.classList.remove('show');
    ui.evolution.classList.add('hidden');
    this.warningFlags.clear();
    try { this.firstMissionActive = localStorage.getItem('dokkaebi-first-missions-complete') !== '1'; }
    catch { this.firstMissionActive = true; }
    this.firstMissionIndex = 0;
    this.firstMissionStats = { summons: 0, merges: 0, bosses: 0 };
    this.mods = this.createDefaultMods(metaTraits);
    this.runStats.forgedAtStart = this.equipmentState?.forged || 0;
    this.applyHeroClassRunModifiers();
    this.mods.reactionDamage *= this.activeRunMode.reactionDamage || 1;
    this.mods.bossDamage *= this.activeRunMode.bossDamage || 1;
    this.mods.statusDuration *= this.activeRunMode.statusDuration || 1;
    this.mods.heroDamage *= this.dailyEdict?.heroDamage || 1;
    this.mods.luckGain *= this.dailyEdict?.luckGain || 1;
    this.renderRelicStrip();
    this.refreshHeroVisualLoadout();
    this.renderRunSeedChip();
    this.updateCouncilHUD();
    ui.waveTrial.classList.add('hidden');
    this.player.group.position.set(0, 0, 6.2);
    this.player.attackCooldown = 0;
    this.player.dashCooldown = 0;
    this.player.skillCooldown = 0;
    this.player.stunTimer = 0;
    this.showGameUI(true);
    ui.bossHealth.classList.add('hidden');
    ui.bossDangerFrame.classList.add('hidden');
    document.body.classList.remove('boss-active');
    ui.killChain.classList.add('hidden');
    ui.saveScore.disabled = false;
    ui.saveScore.textContent = '기록 저장';
    this.updateSynergies();
    this.updateUnitStrip();
    this.updateFirstMissionPanel();
    this.updateHUD();
    this.showMission(`${this.heroClass.name} · ${this.activeRunMode.name}`, `${this.guardianCouncil.bond.icon} ${this.guardianCouncil.bond.name} · ${this.guardianCouncil.support.name} 지원`, `${this.selectedSeedModeId === 'daily' ? 'TODAY' : 'SEEDED'} EXPEDITION · ${this.runSeed}`, 1850);
    this.scheduleRun(() => {
      if (this.units.length === 0) this.summonUnit({ free: true, guaranteedRank: 2, starter: true });
    }, 520, { key: 'starter-summon', guard: () => this.runId === activeRunId && this.state === 'playing' });
    this.scheduleRun(() => {
      if (!this.waveActive && this.currentWave === 0) {
        this.showMission('사방의 요괴문 개방', '직접 뛰어 엽전을 줍고 수호대를 늘리세요.', 'WAVE 01 · AUTO START', 1350);
        this.startWave();
      }
    }, 2450, { key: 'auto-wave-start', guard: () => this.runId === activeRunId && this.state === 'playing' });
  }

  returnToTitle() {
    this.lifecycle.endRun();
    this.resetTransientUi();
    this.runId = (this.runId || 0) + 1;
    this.state = 'title';
    this.cinematic = null;
    this.cancelMoveTarget();
    ui.evolution.classList.remove('show');
    ui.evolution.classList.add('hidden');
    this.showGameUI(false);
    ui.bossHealth.classList.add('hidden');
    ui.bossDangerFrame.classList.add('hidden');
    document.body.classList.remove('boss-active');
    ui.killChain.classList.add('hidden');
    this.createWorld(true);
    this.renderMetaProgress();
    ui.title.classList.add('visible');
  }

  resetTransientUi() {
    this.clearTransientVisuals();
    this.lifecycle.ui.cancel('mission-hide');
    this.lifecycle.ui.cancel('mission-collapse');
    this.lifecycle.ui.cancel('evolution-hide');
    this.lifecycle.ui.cancel('evolution-collapse');
    this.lifecycle.ui.cancel('combo-hide');
    this.lifecycle.ui.cancel('combo-collapse');
    this.lifecycle.ui.cancel('damage-flash-hide');
    ui.mission.classList.remove('show');
    ui.mission.classList.add('hidden');
    ui.evolution.classList.remove('show');
    ui.evolution.classList.add('hidden');
    ui.combo.classList.remove('show');
    ui.combo.classList.add('hidden');
    ui.boss.classList.remove('show');
    ui.boss.classList.add('hidden');
    ui.damageFlash.classList.remove('show');
    ui.combatImpactFlash.classList.remove('show', 'critical', 'heavy');
    ui.autoWavePanel?.classList.remove('show', 'imminent');
    ui.autoWavePanel?.classList.add('hidden');
    ui.combatTextRoot.replaceChildren();
    this.combatTextCount = 0;
  }

  showGameUI(show) {
    [ui.hud, ui.synergyPanel, ui.luckMeter, ui.unitStrip, ui.joystick, ui.actionDock, ui.leftUiToggle, ui.stageChip, ui.councilChip].forEach((element) => element.classList.toggle('hidden', !show));
    ui.autoWavePanel?.classList.toggle('hidden', !show || this.autoWaveCountdown <= 0);
    ui.firstMissionPanel.classList.toggle('hidden', !show || !this.firstMissionActive);
    ui.moonOmen.classList.toggle('hidden', !show || !this.activeOmen);
    ui.runSeedChip.classList.toggle('hidden', !show || !this.runSeed);
    ui.moonWard.classList.toggle('hidden', !show);
    ui.jackpot.classList.toggle('hidden', !show || this.jackpotTimer <= 0);
    ui.waveTrial.classList.toggle('hidden', !show || !this.currentTrial);
    ui.relicPanel.classList.toggle('hidden', !show);
    ui.burstMeter.classList.toggle('hidden', !show);
    ui.momentumMeter.classList.toggle('hidden', !show);
    if (!show) {
      ui.dangerHint.classList.remove('visible', 'urgent');
      ui.dangerHint.classList.add('hidden');
      this.displayDanger = null;
      this.pendingDangerKey = '';
      this.cancelMoveTarget();
    }
  }

  getSummonCost() {
    return Math.max(18, 30 + Math.floor(this.summonCount / 4) * 5 - this.mods.summonDiscount);
  }

  summonUnit(options = {}) {
    if (this.state !== 'playing') return;
    if (!options.free && this.waveActive && this.activeContract?.id === 'summonSeal') {
      this.showToast('강림 봉인 계약 중에는 전투 소환을 사용할 수 없습니다.');
      this.haptic(12);
      return;
    }
    const cost = options.free ? 0 : this.getSummonCost();
    if (this.gold < cost) { this.showToast(`엽전이 ${cost - this.gold}개 부족합니다.`); return; }

    this.gold -= cost;
    if (!options.free) this.summonCount += 1;
    const rank = options.guaranteedRank || this.rollSummonRank();

    if (!options.free && this.choiceTickets > 0 && !options.skipChoice) {
      this.choiceTickets -= 1;
      const types = this.shuffled(UNIT_KEYS).slice(0, 3);
      this.pendingSummon = { rank, types, options };
      this.openChoiceSummon();
      this.updateHUD();
      return;
    }

    return this.completeSummon(options.type || this.randomPick(UNIT_KEYS), rank, options);
  }

  openChoiceSummon() {
    const pending = this.pendingSummon;
    if (!pending) return;
    this.state = 'choice';
    const rankConfig = RANKS[pending.rank - 1];
    ui.choiceSummonOptions.innerHTML = pending.types.map((type) => {
      const unit = UNIT_TYPES[type];
      const color = `#${unit.color.toString(16).padStart(6, '0')}`;
      return `<button class="choice-summon-option" data-choice-type="${type}" style="--choice-color:${color}">
        <span>${unit.symbol}</span><small>${rankConfig.name} · ${'★'.repeat(pending.rank)}</small><b>${unit.name}</b><p>${unit.role} · ${unit.description}</p>
      </button>`;
    }).join('');
    this.showModal(ui.choiceSummonModal);
    this.startRewardAutoChoice('choice', 10);
    this.haptic([18, 22, 32]);
  }

  selectChoiceSummon(type) {
    const pending = this.pendingSummon;
    if (!pending || !pending.types.includes(type)) return;
    this.pendingSummon = null;
    this.cancelRewardAutoChoice('choice');
    this.hideModal(ui.choiceSummonModal);
    this.state = 'playing';
    this.completeSummon(type, pending.rank, { ...pending.options, chosen: true });
  }

  completeSummon(type, rank, options = {}) {
    let pad = this.unitPads.find((item) => !item.userData.occupied);
    if (!pad) {
      const weakest = [...this.units].sort((a, b) => a.rank - b.rank || a.createdAt - b.createdAt)[0];
      if (!weakest) return;
      pad = weakest.pad;
      this.removeUnit(weakest, true);
      this.showToast('진형이 가득 차 가장 약한 도깨비가 환생했습니다.');
    }

    const unit = this.createUnit(type, rank, pad, false);
    this.recordGuardianCodexUse(type);
    if (rank >= 4) this.triggerJackpotRush(rank);
    this.recordFirstMission('summons', 1);
    this.sound.summon(rank);
    this.haptic(rank >= 3 ? [24, 35, 45] : 22);
    this.spawnSummonEffect(pad.position, RANKS[rank - 1].color, rank);
    const prefix = options.starter ? '무료 강림 · ' : options.chosen ? '운명 선택 · ' : '';
    this.showCombo(`${prefix}${RANKS[rank - 1].name} ${UNIT_TYPES[type].name}!`, rank >= 3 || options.starter || options.chosen ? 1450 : 900);
    this.score += rank * 35;
    this.maxRank = Math.max(this.maxRank, rank);
    if (rank === 5) this.playMythicEvolution(unit);
    this.autoMerge(type, rank);
    this.updateSynergies();
    this.updateUnitStrip();
    this.updateHUD();
    return unit;
  }

  rollSummonRank() {
    if (this.luck >= 100) {
      this.luck = 0;
      return this.random() < .12 ? 4 : 3;
    }
    const roll = this.random();
    let rank = 1;
    if (roll < .018) rank = 4;
    else if (roll < .105) rank = 3;
    else if (roll < .29) rank = 2;

    const omenLuck = this.activeOmen?.luckGain || 1;
    if (rank === 1) this.luck = Math.min(100, this.luck + 11 * this.mods.luckGain * this.getSynergyLuckMultiplier() * omenLuck);
    else if (rank === 2) this.luck = Math.min(100, this.luck + 5 * this.mods.luckGain * this.getSynergyLuckMultiplier() * omenLuck);
    else this.luck = Math.max(0, this.luck - 16);
    return rank;
  }

  createUnit(type, rank, pad, showcase = false) {
    const model = this.createDokkaebiModel(type, rank);
    model.position.copy(pad.position);
    model.position.y = .3;
    model.rotation.y = -Math.atan2(pad.position.z, pad.position.x) + Math.PI / 2;
    this.dynamicRoot.add(model);
    this.setUnitPadVisual(pad, true, RANKS[rank - 1].color);
    const animation = this.animations.createController(model, model.userData.animations || [], { procedural: !(model.userData.animations?.length) });
    const unit = {
      id: crypto.randomUUID?.() || `${Date.now()}-${this.random()}`,
      type, rank, pad, group: model, cooldown: this.random() * .5, createdAt: this.elapsed,
      showcase, shotCount: 0, streakTarget: null, streak: 0,
      hp: 100 + rank * 25, maxHp: 100 + rank * 25,
      commandTimer: 0, baseScale: model.scale.x,
      ultimateCooldown: rank === 5 ? 1.8 + this.random() * 1.3 : Infinity,
      animation
    };
    this.combatVisualV112?.bindActor(model, { animation, getHp: () => unit.hp, getMaxHp: () => unit.maxHp });
    this.attachUnitImpostor(unit);
    this.units.push(unit);
    this.engine.geometryBudget.inspect(`unit:${type}:rank${rank}`, model, 'unitTriangles');
    return unit;
  }

  createDokkaebiModel(type, rank) {
    const config = UNIT_TYPES[type];
    const rankConfig = RANKS[rank - 1];
    const assetId = GUARDIAN_ASSET_IDS[type];
    const root = assetId ? this.assetPipeline.instantiateModel(assetId) : null;
    const model = root
      ? prepareImportedGuardian(root, type, rank, config, rankConfig, { lowPower: this.lowPower })
      : createPremiumGuardian(type, rank, config, rankConfig, { lowPower: this.lowPower });
    if (!root) this.assetPipeline.recordFallback(assetId || `guardian-${type}`);
    this.combatVisualV112?.attachGuardian(model, type, rank);
    return model;
  }

  autoMerge(type, rank) {
    if (rank >= 5) return;
    const matching = this.units.filter((unit) => unit.type === type && unit.rank === rank && !unit.showcase);
    if (matching.length < 3) return;
    const chosen = matching.slice(0, 3);
    const targetPad = chosen[0].pad;
    const center = targetPad.position.clone();
    const inheritedCommand = Math.max(...chosen.map((unit) => unit.commandTimer || 0));
    chosen.forEach((unit) => this.removeUnit(unit, false));
    const merged = this.createUnit(type, rank + 1, targetPad, false);
    if (inheritedCommand > 0) {
      merged.commandTimer = inheritedCommand;
      this.applyUnitCommandEffect(merged, type);
      this.commandActiveKey = `${type}-${rank + 1}`;
    }
    this.maxRank = Math.max(this.maxRank, rank + 1);
    this.score += (rank + 1) * 170;
    this.sound.merge(rank + 1);
    this.haptic(rank + 1 >= 4 ? [30, 35, 55, 45, 80] : [25, 30, 45]);
    this.spawnMergeEffect(center, RANKS[rank].color, rank + 1);
    this.showCombo(`${rank + 1}★ 자동 합성!`, 1400);
    this.shake = Math.max(this.shake, .3 + rank * .08);
    this.recordFirstMission('merges', 1);
    if (rank + 1 === 5) this.playMythicEvolution(merged);
    this.updateSynergies();
    this.updateUnitStrip();
    const mergeRunId = this.runId;
    this.scheduleRun(() => this.autoMerge(type, rank + 1), 120, { guard: () => this.runId === mergeRunId });
    return merged;
  }

  removeUnit(unit, recycle = false) {
    const index = this.units.indexOf(unit);
    if (index >= 0) this.units.splice(index, 1);
    this.setUnitPadVisual(unit.pad, false);
    this.animations.remove(unit.animation);
    this.combatVisualV112?.detach(unit.group);
    if (unit.impostor) {
      unit.group.remove(unit.impostor.plane);
      this.disposeDirectionalImpostor(unit.impostor);
      unit.impostor = null;
    }
    this.dynamicRoot.remove(unit.group);
    unit.group.traverse((object) => {
      if (!object.userData?.sharedAssetGeometry) object.geometry?.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => { if (object.userData.disposeMap || material.userData?.disposeMap) material.map?.dispose?.(); material.dispose(); });
      }
    });
    if (recycle) {
      const refund = 6 + unit.rank * 5;
      this.gold += refund;
      this.spawnParticles(unit.pad.position.clone().add(new THREE.Vector3(0,1,0)), 0xffd36b, 10, 2.6);
    }
  }

  interactWithBattlefieldProp() {
    if (this.state !== 'playing' || !this.player?.group) return;
    const result = this.battlefieldProps?.interact({
      wave: this.currentWave,
      event: this.battlefieldEvents?.active,
      soulMultiplier: this.battlefieldEvents?.soulMultiplier || 1,
      coreMaxHp: this.coreMaxHp,
      addGold: (amount) => { this.gold += amount; },
      healCore: (amount) => {
        const applied = Math.max(0, Math.min(amount, this.coreMaxHp - this.coreHp));
        this.coreHp += applied;
        return applied;
      },
      gainSoul: (amount) => this.gainSoul(amount, 'battlefield-prop'),
      spawnEffect: (position, type) => this.spawnBattlefieldPropEffect(position, type)
    });
    if (!result) return;
    this.showCombo(`${result.propLabel} · ${result.label}`, 1150);
    this.haptic([14, 18, 32]);
    this.updateHUD();
  }

  spawnBattlefieldPropEffect(position, type = 'gold', target = null) {
    const colors = { gold: 0xffd36b, heal: 0x75ff99, soul: 0x8cecff, ember: 0xff7b3f, frost: 0x75d9ff, thunder: 0xc68cff, stone: 0xe3bd72 };
    const color = colors[type] || colors.gold;
    this.spawnRing(position, color, target ? 3.8 : 2.8);
    this.spawnParticles(position.clone().add(new THREE.Vector3(0, .8, 0)), color, target ? 18 : 12, target ? 4.4 : 3.1);
    if (target) this.combatPresentation?.impact({ position: target, origin: position, color, source: type, heavy: type === 'thunder' });
  }

  updateBattlefieldProps(dt) {
    if (!this.battlefieldProps || !this.player?.group) return;
    const nearest = this.battlefieldProps.update(dt, {
      elapsed: this.elapsed,
      wave: this.currentWave,
      waveActive: this.waveActive,
      playerPosition: this.player.group.position,
      enemies: this.enemies,
      propRateMultiplier: this.battlefieldEvents?.propRateMultiplier || 1,
      damageEnemy: (enemy, damage, source, origin) => this.damageEnemy(enemy, damage, source, origin, null, source),
      spawnAttackEffect: (position, source, target) => this.spawnBattlefieldPropEffect(position, source, target)
    });
    if (!ui.interact) return;
    const visible = Boolean(nearest && this.state === 'playing');
    ui.interact.classList.toggle('hidden', !visible);
    ui.interact.disabled = !visible;
    if (visible) {
      ui.interactLabel.textContent = nearest.label;
      ui.interactState.textContent = `${nearest.prompt} · G`;
      ui.interact.setAttribute('aria-label', `${nearest.label} ${nearest.prompt}`);
    }
  }

  startWave({ manual = false, auto = false } = {}) {
    if (this.state !== 'playing' || this.waveActive || this.currentWave >= this.maxWaves) return;
    const wasCountingDown = this.autoWaveCountdown > 0;
    this.cancelAutoWaveCountdown();
    this.currentWave += 1;
    const campaignEntry = this.campaign.enterWave(this.currentWave);
    this.waveActive = true;
    this.waveStartHp = this.coreHp;
    this.activeOmen = selectMoonOmen(this.lastOmenId, () => this.random());
    this.lastOmenId = this.activeOmen.id;
    this.showMoonOmen();
    this.assignWaveTrial();
    this.activatePendingContract();
    const bossWave = isBossWave(this.currentWave);
    const battlefieldEvent = this.battlefieldEvents.beginWave({ wave: this.currentWave, boss: bossWave });
    this.battlefieldProps?.beginWave();
    this.activeEncounterPlan = this.encounterDirector.beginWave({
      wave: this.currentWave,
      boss: bossWave,
      coreHpRatio: this.coreHp / Math.max(1, this.coreMaxHp),
      modeId: this.activeRunMode?.id || 'guardian'
    });
    this.combatTelemetry.startWave(this.currentWave, this.activeEncounterPlan);
    const baseSpawnCount = bossWave ? getBossSpawnCount(this.currentWave) : 7 + this.currentWave * 3;
    this.spawnRemaining = Math.max(1, Math.round(baseSpawnCount * (this.activeEncounterPlan?.spawnCountMultiplier || 1)));
    this.spawnTotal = this.spawnRemaining;
    this.spawnTimer = .2;
    this.waveSpawned = 0;
    this.waveFlowGuard.beginWave(this.currentWave, this.getWaveFlowSnapshot());
    this.waveReliability.beginWave(this.currentWave, this.getWaveFlowSnapshot());
    ui.wave.disabled = true;
    if (bossWave) {
      const bossType = getBossTypeForWave(this.currentWave);
      ui.bossName.textContent = ENEMY_TYPES[bossType].name;
      ui.boss.classList.remove('hidden');
      requestAnimationFrame(() => ui.boss.classList.add('show'));
      this.sound.boss();
      this.haptic([45, 40, 70]);
      this.scheduleRun(() => ui.boss.classList.remove('show'), 1900, { key: 'boss-banner-hide' });
      this.scheduleRun(() => ui.boss.classList.add('hidden'), 2350, { key: 'boss-banner-collapse' });
    }
    if (this.currentWave === 1 || campaignEntry.changed) {
      const act = campaignEntry.act;
      this.showMission(`${act.icon} ACT ${act.index} · ${act.name}`, act.description, `${act.subtitle} · WAVE ${act.startWave}-${act.endWave}`, 1850);
    }
    const doctrine = this.activeEncounterPlan;
    this.showToast(`${auto ? '자동 진군 · ' : manual && wasCountingDown ? '즉시 진군 · ' : ''}웨이브 ${this.currentWave} 시작! ${doctrine?.icon || '☾'} ${doctrine?.name || '달빛 진군'} · ${battlefieldEvent.icon} ${battlefieldEvent.name}`);
    this.showMission(battlefieldEvent.name, battlefieldEvent.description, `LIVING BATTLEFIELD · ${battlefieldEvent.id.toUpperCase()}`, 1250);
    if (!bossWave && doctrine?.mutatorId !== 'standard') {
      this.showMission(doctrine.name, doctrine.description, `BATTLE DOCTRINE · ${doctrine.mutatorId.toUpperCase()}`, 1450);
    }
    this.updateHUD();
  }

  spawnEnemy({ forceType = '', emergency = false } = {}) {
    let type = forceType || 'imp';
    const wave = this.currentWave;
    const progress = this.waveSpawned / Math.max(1, this.spawnTotal);
    const bossType = getBossTypeForWave(wave);
    if (!forceType && bossType && this.spawnRemaining === 1) type = bossType;
    else if (!forceType) {
      type = this.encounterDirector.selectEnemyType({
        wave,
        fallback: 'imp',
        random: () => this.random(),
        available: [
          { id: 'imp', minWave: 1, weight: 1.5 },
          { id: 'runner', minWave: 2, weight: 1.15 },
          { id: 'brute', minWave: 4, weight: .72 },
          { id: 'skeleton', minWave: 5, weight: .78 },
          { id: 'ghost', minWave: 6, weight: .72 },
          { id: 'shaman', minWave: 7, weight: .58 },
          { id: 'crow', minWave: 8, weight: .54 }
        ]
      });
    }
    const gate = this.gates[(this.waveSpawned + Math.floor(this.random() * 2)) % Math.max(1, this.gates.length)];
    const gatePosition = gate?.position || new THREE.Vector3(0, 0, 18);
    const spawnPos = gatePosition.clone();
    const perpendicular = new THREE.Vector3(-spawnPos.z, 0, spawnPos.x).normalize().multiplyScalar(-2.2 + this.random() * 4.4);
    spawnPos.add(perpendicular).multiplyScalar(.96);
    const trialNeedsElite = this.currentTrial?.id === 'hunt' && this.waveTrialEliteSpawned < this.currentTrial.target;
    const forceElite = trialNeedsElite && !ENEMY_TYPES[type]?.boss && this.waveSpawned >= 1 && (this.spawnRemaining <= Math.max(3, this.currentTrial.target * 3) || this.random() < .28);
    let enemy = null;
    let resolvedType = type;
    try {
      enemy = this.createEnemy(type, spawnPos, progress, { forceElite });
    } catch (error) {
      this.waveFlowGuard.recordSpawnFailure(error instanceof Error ? error.message : String(error));
      this.recordRuntimeError(error, `spawn:${type}`);
    }
    if (!enemy && type !== 'imp' && !ENEMY_TYPES[type]?.boss) {
      resolvedType = 'imp';
      try {
        enemy = this.createEnemy('imp', spawnPos, progress, { forceElite: false });
        this.assetPipeline?.recordFallback?.(MONSTER_ASSET_IDS[type] || type);
      } catch (error) {
        this.waveFlowGuard.recordSpawnFailure(error instanceof Error ? error.message : String(error));
        this.recordRuntimeError(error, `spawn-fallback:${type}`);
      }
    }
    if (!enemy) {
      this.spawnRemaining = Math.max(0, this.spawnRemaining - 1);
      this.waveSpawned += 1;
      this.combatTelemetry.recordDroppedSpawn();
      this.waveFlowGuard.recordSpawnFailure(`unavailable:${type}`);
      if (emergency) this.showWaveRecovery('적 소환 대체', `${type} 모델을 건너뛰고 웨이브를 계속합니다.`);
      this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), 'spawn-slot-skipped');
      return false;
    }
    if (enemy.elite) this.waveTrialEliteSpawned += 1;
    this.enemies.push(enemy);
    this.recordCodexDiscovery(enemy.boss ? 'boss' : 'monster', resolvedType);
    if (enemy.boss) {
      this.bossEscalation.register(enemy);
      this.bossBreak.register(enemy);
      this.showMission(ENEMY_TYPES[resolvedType].name, '강력한 우두머리가 신목으로 돌진합니다.', 'BOSS HAS ENTERED', 1550);
      this.haptic([70, 45, 100]);
      this.updateBossHUD();
    }
    this.spawnRemaining = Math.max(0, this.spawnRemaining - 1);
    this.waveSpawned += 1;
    this.encounterDirector.recordSpawn();
    this.waveFlowGuard.noteProgress(this.getWaveFlowSnapshot(), emergency ? 'emergency-spawn' : 'spawn');
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), emergency ? 'emergency-spawn' : 'spawn');
    return true;
  }

  createEnemy(type, position, progress = 0, options = {}) {
    const config = ENEMY_TYPES[type];
    const waveScale = 1 + (this.currentWave - 1) * .19 + progress * .08;
    const group = this.acquireEnemyModel(type);
    if (!group) return null;
    this.engine.geometryBudget.inspect(`enemy:${type}`, group, ENEMY_TYPES[type].boss ? 'bossTriangles' : 'enemyTriangles');
    group.position.copy(position);
    this.dynamicRoot.add(group);
    const contractHp = this.activeContract?.id === 'bloodMoon' ? 1.45 : 1;
    const contractSpeed = this.activeContract?.id === 'bloodMoon' ? 1.12 : 1;
    const omen = this.activeOmen || {};
    const mode = this.activeRunMode || RUN_MODES.guardian;
    const trialEliteChance = this.currentTrial?.id === 'hunt' ? .12 : 0;
    const encounter = this.activeEncounterPlan || {};
    const campaign = this.campaign?.modifiers || {};
    const elite = config.boss ? null : rollEliteAffix(this.currentWave, omen, () => this.random(), mode.eliteChance + trialEliteChance + (this.dailyEdict?.eliteChance || 0) + (encounter.eliteChanceBonus || 0) + (campaign.eliteChance || 0), options.forceElite);
    const hp = config.hp * waveScale * contractHp * (omen.enemyHp || 1) * mode.enemyHp * (this.dailyEdict?.enemyHp || 1) * (elite?.hp || 1) * (encounter.hpMultiplier || 1) * (campaign.enemyHp || 1);
    const speed = config.speed * (1 + Math.min(.22, this.currentWave * .012)) * contractSpeed * (omen.enemySpeed || 1) * mode.enemySpeed * (this.dailyEdict?.enemySpeed || 1) * (elite?.speed || 1) * (encounter.speedMultiplier || 1) * (campaign.enemySpeed || 1);
    const damage = config.damage * (1 + (this.currentWave - 1) * .1) * (omen.enemyDamage || 1) * mode.enemyDamage * (this.dailyEdict?.enemyDamage || 1) * (elite?.damage || 1) * (encounter.damageMultiplier || 1) * (campaign.enemyDamage || 1);
    this.applyEliteVisual(group, elite);
    if (elite) this.showCombatText(group.position.clone().add(new THREE.Vector3(0, 2.15, 0)), elite.name, { label: `${elite.icon} 정예` });
    const animation = this.animations.createController(group, group.userData.animations || [], { procedural: !(group.userData.animations?.length) });
    const enemy = {
      id: ++this.enemySerial,
      type, group, hp, maxHp: hp, speed,
      damage, reward: config.reward, elite, eliteShield: elite?.shield ? hp * elite.shield : 0, eliteShieldMax: elite?.shield ? hp * elite.shield : 0,
      slowTimer: 0, slowFactor: 1, statusSpeedMultiplier: 1, statusEffects: new Map(), attackTimer: 0, phase: rand(0, Math.PI*2), dead: false,
      boss: !!config.boss, bossPhase: 1, specialIndex: 0, specialTimer: config.boss ? 4.5 : 0, intentDuration: config.boss ? 4.5 : 0, flash: 0, shieldFlash: 0,
      abilityTimer: type === 'runner' ? rand(2.2, 3.6) : type === 'shaman' ? rand(2.8, 4.2) : 0,
      abilityState: 'move', abilityTime: 0, telegraphMesh: null, chargeDirection: new THREE.Vector3(), chargeHitPlayer: false,
      animation
    };
    this.combatVisualV112?.bindActor(group, {
      animation,
      getHp: () => enemy.hp,
      getMaxHp: () => enemy.maxHp,
      getShield: () => enemy.eliteShield,
      getMaxShield: () => enemy.eliteShieldMax,
      getBreak: () => enemy.boss ? (this.bossBreak.getState(enemy)?.gauge || 0) / 100 : 0,
      getStatuses: () => this.statusEffects.getActiveTypes(enemy)
    });
    return enemy;
  }

  showMoonOmen() {
    if (!this.activeOmen) return;
    ui.moonOmenIcon.textContent = this.activeOmen.icon;
    ui.moonOmenName.textContent = this.activeOmen.name;
    ui.moonOmenEffect.textContent = this.activeOmen.description;
    ui.moonOmen.classList.remove('hidden');
    this.setBattlefieldTheme(this.activeOmen.id);
    this.showMission(this.activeOmen.name, this.activeOmen.description, `WAVE ${String(this.currentWave).padStart(2, '0')} · MOON OMEN`, 1350);
  }

  applyEliteVisual(group, elite) {
    const aura = group?.userData?.eliteAura;
    if (!aura) return;
    aura.visible = Boolean(elite);
    if (elite) {
      aura.material.color.setHex(elite.color);
      aura.material.opacity = .72;
    }
  }

  triggerJackpotRush(rank) {
    const duration = rank >= 5 ? 12 : 8;
    this.jackpotTimer = Math.max(this.jackpotTimer, duration);
    this.runStats.jackpotTriggers += 1;
    this.showCombo(`왕대박 폭주! 수호대 공격 강화 · ${duration}초`, 1500);
    this.haptic(rank >= 5 ? [28, 24, 48, 30, 72] : [20, 20, 42]);
  }

  updateRunMomentum(dt) {
    if (this.jackpotTimer > 0) this.jackpotTimer = Math.max(0, this.jackpotTimer - dt);
    if (this.guardianBurstTimer > 0) this.guardianBurstTimer = Math.max(0, this.guardianBurstTimer - dt);
    const auraSpeed = this.jackpotTimer > 0 || this.guardianBurstTimer > 0 ? 1.9 : 1;
    for (const unit of this.units) {
      const aura = unit?.group?.userData?.aura;
      if (aura && (this.jackpotTimer > 0 || this.guardianBurstTimer > 0)) aura.rotation.z += dt * auraSpeed;
    }
  }

  createEnemyModel(type, config) {
    const assetId = config.boss ? BOSS_ASSET_IDS[type] : MONSTER_ASSET_IDS[type];
    const root = assetId ? this.assetPipeline.instantiateModel(assetId) : null;
    const model = root
      ? prepareImportedEnemy(root, type, config, { lowPower: this.lowPower })
      : createPremiumEnemy(type, config, { lowPower: this.lowPower });
    if (!root && assetId) this.assetPipeline.recordFallback(assetId);
    applyEnemyCandidateVisuals(model, type);
    this.combatVisualV112?.attachEnemy(model, type, config);
    this.attachEnemyImpostor(model, type);
    return model;
  }

  getBrowserReliabilitySnapshot() {
    return {
      releaseVersion: GAME_VERSION,
      lineageVersion: LEGACY_LINEAGE_VERSION,
      buildId: BUILD_ID,
      foundation: this.coreFoundation?.diagnostics || {},
      combatArt: this.combatVisualV112?.diagnostics || {},
      state: this.state,
      wave: this.currentWave || 0,
      fps: this.engine?.monitor?.lastFps || 0,
      renderer: {
        drawCalls: this.renderer?.info?.render?.calls || 0,
        triangles: this.renderer?.info?.render?.triangles || 0,
        textures: this.renderer?.info?.memory?.textures || 0
      },
      counts: {
        enemies: this.enemies?.length || 0,
        units: this.units?.length || 0,
        projectiles: this.projectiles?.length || 0,
        particles: this.particles?.length || 0
      }
    };
  }

  getBrowserAutomationSnapshot() {
    return Object.freeze({
      version: GAME_VERSION,
      releaseVersion: GAME_VERSION,
      lineageVersion: LEGACY_LINEAGE_VERSION,
      buildId: BUILD_ID,
      cacheRevision: CACHE_REVISION,
      coreFoundation: this.coreFoundation?.diagnostics || {},
      combatArt: this.combatVisualV112?.diagnostics || {},
      engineVersion: ENGINE_VERSION,
      saveSchemaVersion: SAVE_SCHEMA_VERSION,
      state: this.state,
      currentWave: this.currentWave || 0,
      maxWaves: this.maxWaves || 10,
      waveActive: Boolean(this.waveActive),
      enemies: this.enemies?.length || 0,
      spawnRemaining: this.spawnRemaining || 0,
      postWaveQueueLength: this.postWaveQueue?.length || 0,
      modalState: this.modalStack?.at(-1)?.id || '',
      bootReady: Boolean(window.__DOKKAEBI_BOOT_OK__),
      runtimeErrors: this.runtimeErrors.length,
      reliability: this.waveReliability?.diagnostics || {},
      browserReliability: this.browserReliability?.diagnostics || {}
    });
  }

  handleWebGLRecovery({ lost = false } = {}) {
    if (lost) {
      this.autoPausedByContextLoss = this.state === 'playing';
      if (this.autoPausedByContextLoss) this.pauseGame({ automatic: true });
      document.body.classList.add('webgl-context-lost');
      this.showWaveRecovery('그래픽 복구 중', '화면 컨텍스트를 다시 연결하고 있습니다.');
      return;
    }
    document.body.classList.remove('webgl-context-lost');
    if (this.autoPausedByContextLoss && this.state === 'paused') this.resumeGame({ automatic: true });
    this.autoPausedByContextLoss = false;
    this.showToast('그래픽 화면이 복구되었습니다.');
  }

  recordRuntimeError(error, source = 'runtime') {
    const message = error instanceof Error ? error.message : String(error || 'unknown runtime error');
    const key = `${source}:${message}`.slice(0, 220);
    const entry = Object.freeze({
      at: new Date().toISOString(),
      source,
      message: message.slice(0, 240),
      state: this.state,
      wave: this.currentWave || 0
    });
    this.runtimeErrors.push(entry);
    if (this.runtimeErrors.length > 30) this.runtimeErrors.shift();
    this.browserReliability?.noteMilestone('runtime-error', { source, message: entry.message, wave: entry.wave });
    if (this.runtimeErrorKeys.has(key)) return entry;
    this.runtimeErrorKeys.add(key);
    console.error(`[RuntimeGuard:${source}]`, error);
    if (this.state === 'playing') this.showWaveRecovery('오류 자동 복구', `${source} 경로를 격리하고 전투를 계속합니다.`);
    return entry;
  }

  runSafe(source, callback) {
    try { return callback(); }
    catch (error) { this.recordRuntimeError(error, source); return undefined; }
  }

  selectRecommendedReward(type) {
    if (type === 'blessing' && this.state === 'blessing') {
      const option = ui.blessingOptions?.querySelector('[data-blessing]');
      if (option) this.selectBlessing(option.dataset.blessing);
      return;
    }
    if (type === 'relic' && this.state === 'relic') {
      const option = ui.relicOptions?.querySelector('[data-relic]');
      if (option) this.selectRelic(option.dataset.relic);
      return;
    }
    if (type === 'contract' && this.state === 'contract') {
      const option = ui.contractOptions?.querySelector('[data-contract]');
      if (option) this.selectContract(option.dataset.contract); else this.skipContract();
      return;
    }
    if (type === 'choice' && this.state === 'choice') {
      const option = ui.choiceSummonOptions?.querySelector('[data-choice-type]');
      if (option) this.selectChoiceSummon(option.dataset.choiceType);
    }
  }

  getRewardModalForState(state = this.state) {
    if (state === 'blessing') return ui.blessingModal;
    if (state === 'relic') return ui.relicModal;
    if (state === 'contract') return ui.contractModal;
    if (state === 'choice') return ui.choiceSummonModal;
    return null;
  }

  getWaveFlowSnapshot() {
    const rewardModal = this.getRewardModalForState();
    const livingEnemies = this.enemies.filter((enemy) => !enemy.dead);
    let enemyHealthSignature = 0;
    let enemyRadiusSignature = 0;
    let invalidEnemyCount = 0;
    for (const enemy of livingEnemies) {
      const hpRatio = Number(enemy.maxHp) > 0 ? Number(enemy.hp) / Number(enemy.maxHp) : 0;
      const position = enemy.group?.position;
      if (!Number.isFinite(hpRatio) || !position || ![position.x, position.y, position.z].every(Number.isFinite)) invalidEnemyCount += 1;
      enemyHealthSignature += Math.max(0, Math.round((Number.isFinite(hpRatio) ? hpRatio : 0) * 1000));
      enemyRadiusSignature += position ? Math.round(Math.hypot(position.x || 0, position.z || 0) * 10) : 0;
    }
    return {
      state: this.state,
      waveActive: Boolean(this.waveActive),
      currentWave: this.currentWave || 0,
      maxWaves: this.maxWaves || 10,
      spawnRemaining: this.spawnRemaining || 0,
      waveSpawned: this.waveSpawned || 0,
      enemyCount: livingEnemies.length,
      enemyHealthSignature,
      enemyRadiusSignature,
      invalidEnemyCount,
      enemyCap: this.runtimeBudget?.diagnostics?.caps?.enemies || (this.lowPower ? 18 : 30),
      postWaveQueueLength: this.postWaveQueue?.length || 0,
      autoWaveCountdown: this.autoWaveCountdown || 0,
      modalVisible: Boolean(rewardModal?.classList.contains('visible')),
      coreHp: this.coreHp || 0,
      gold: this.gold || 0,
      score: this.score || 0
    };
  }

  showWaveRecovery(title, copy, duration = 2100) {
    if (!ui.waveRecovery) return;
    ui.waveRecoveryTitle.textContent = title;
    ui.waveRecoveryCopy.textContent = copy;
    ui.waveRecovery.classList.remove('hidden');
    this.scheduleUi(() => ui.waveRecovery.classList.add('hidden'), duration, { key: 'wave-recovery-hide' });
  }

  restoreRewardModal(state) {
    const modal = this.getRewardModalForState(state);
    if (!modal) return false;
    this.showModal(modal);
    this.showWaveRecovery('선택 화면 복구', '숨겨진 보상 선택 화면을 다시 표시했습니다.');
    return true;
  }

  updateWaveFlowGuard(dt) {
    const action = this.waveFlowGuard.update(dt, this.getWaveFlowSnapshot());
    if (!action) return;
    if (action.type === 'restore-modal') {
      this.restoreRewardModal(action.state);
      return;
    }
    if (action.type === 'force-spawn' && this.waveActive && this.spawnRemaining > 0) {
      const spawned = this.spawnEnemy({ forceType: 'imp', emergency: true });
      this.spawnTimer = spawned ? .42 : .18;
      this.showWaveRecovery('웨이브 소환 복구', spawned ? '지연된 적 소환을 대체 경로로 이어갑니다.' : '손상된 소환 항목을 건너뛰고 진행합니다.');
      return;
    }
    if (action.type === 'complete-wave' && this.waveActive && this.spawnRemaining <= 0 && this.enemies.length === 0) {
      this.showWaveRecovery('웨이브 종료 복구', '남은 적이 없어 다음 단계로 진행합니다.');
      this.completeWave();
      return;
    }
    if (action.type === 'resume-countdown' && this.state === 'playing' && !this.waveActive) {
      this.showWaveRecovery('다음 습격 복구', '진행 대기 상태를 감지해 자동 진군을 다시 시작합니다.');
      this.beginAutoWaveCountdown(5);
    }
  }

  handleVisibilityChange(hidden, detail = {}) {
    const snapshot = this.getWaveFlowSnapshot();
    if (hidden) {
      this.resetMovementInput();
      const visibility = this.waveReliability.noteVisibility(true, snapshot);
      if (visibility.autoPaused && this.state === 'playing') this.pauseGame({ automatic: true });
      return;
    }
    const visibility = this.waveReliability.noteVisibility(false, snapshot);
    this.lastVisibilityResumeSeconds = visibility.durationSeconds || 0;
    this.clock.getDelta();
    if (visibility.autoPaused && this.autoPausedByVisibility && this.state === 'paused') {
      this.resumeGame({ automatic: true });
      const seconds = Math.round(visibility.durationSeconds || 0);
      this.showWaveRecovery('전투 시간 복구', seconds > 0 ? `백그라운드 ${seconds}초를 보정하고 전투를 이어갑니다.` : '백그라운드 전환 후 전투를 안전하게 이어갑니다.');
      this.waveReliability.noteRecovery('background-resume', this.getWaveFlowSnapshot(), detail);
    }
  }

  unstickWaveEnemies(reason = 'enemy-progress-stall') {
    const living = this.enemies.filter((enemy) => !enemy.dead);
    let moved = 0;
    let repaired = 0;
    for (let index = 0; index < living.length; index += 1) {
      const enemy = living[index];
      const position = enemy.group?.position;
      if (!position) continue;
      const validPosition = [position.x, position.y, position.z].every(Number.isFinite);
      const validHp = Number.isFinite(enemy.hp) && Number.isFinite(enemy.maxHp) && enemy.maxHp > 0;
      if (!validPosition || !validHp) {
        position.set(Math.sin(index + 1) * 11, 0, Math.cos(index + 1) * 11);
        enemy.hp = Math.max(1, Number.isFinite(enemy.maxHp) ? enemy.maxHp * .25 : 1);
        repaired += 1;
      } else {
        const radius = Math.hypot(position.x, position.z);
        if (radius > 14 || radius < 2.6 || enemy.abilityState === 'windup' || enemy.abilityState === 'charge' || enemy.abilityState === 'casting') {
          const angle = radius > .01 ? Math.atan2(position.z, position.x) : (index / Math.max(1, living.length)) * Math.PI * 2;
          const targetRadius = 8.5 + (index % 4) * 1.15;
          position.set(Math.cos(angle) * targetRadius, 0, Math.sin(angle) * targetRadius);
          moved += 1;
        }
      }
      enemy.abilityState = 'move';
      enemy.abilityTime = 0;
      enemy.abilityTimer = Math.min(Number(enemy.abilityTimer) || 0, 1.2);
      enemy.attackTimer = Math.min(Number(enemy.attackTimer) || .4, .4);
      this.removeEnemyTelegraph(enemy);
    }
    this.waveReliability.noteRecovery('unstick-enemies', this.getWaveFlowSnapshot(), { reason, moved, repaired });
    this.showWaveRecovery('적 경로 복구', `${moved + repaired}개 적의 위치·행동 상태를 정상화했습니다.`);
    return moved + repaired;
  }

  updateWaveReliability(dt) {
    const action = this.waveReliability.update(dt, this.getWaveFlowSnapshot());
    if (!action) return;
    if (action.type === 'unstick-enemies') {
      this.unstickWaveEnemies(action.reason);
      return;
    }
    if (action.type === 'reward-reminder') {
      this.waveReliability.noteRecovery('reward-reminder', this.getWaveFlowSnapshot(), { state: action.state });
      this.restoreRewardModal(action.state);
      this.showWaveRecovery('보상 선택 대기', '추천 선택 버튼으로 즉시 다음 웨이브를 이어갈 수 있습니다.', 3200);
      return;
    }
    if (action.type === 'resume-reward-queue' && this.state === 'playing' && !this.waveActive && this.postWaveQueue.length > 0) {
      this.waveReliability.noteRecovery('resume-reward-queue', this.getWaveFlowSnapshot());
      this.showWaveRecovery('보상 흐름 복구', '대기 중인 웨이브 보상을 다시 불러옵니다.');
      this.advancePostWaveRewards();
      return;
    }
    if (action.type === 'resume-first-wave' && this.state === 'playing' && this.currentWave === 0 && !this.waveActive) {
      this.waveReliability.noteRecovery('resume-first-wave', this.getWaveFlowSnapshot());
      this.showWaveRecovery('첫 습격 복구', '초기 진군 타이머를 다시 시작합니다.');
      this.beginAutoWaveCountdown(2);
    }
  }

  updateWave(dt) {
    if (!this.waveActive) return;
    this.updateWaveTrial();
    if (this.spawnRemaining > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const profile = this.engine.qualityProfile?.id || this.engine.qualityGovernor?.profile?.id || 'high';
        this.runtimeBudget.update({ profile, performance: this.engine.monitor.snapshot });
        if (this.runtimeBudget.canSpawn('enemies', this.enemies.length, profile)) {
          this.spawnEnemy();
          const base = this.currentWave >= 8 ? .42 : .62;
          this.spawnTimer = (base + this.random() * .26)
            * (this.activeOmen?.spawnInterval || 1)
            * (this.dailyEdict?.spawnInterval || 1)
            * (this.activeEncounterPlan?.spawnIntervalMultiplier || 1);
        } else {
          this.combatTelemetry.recordDroppedSpawn();
          this.spawnTimer = .14;
        }
      }
    } else if (this.enemies.length === 0) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveActive = false;
    this.vacuumRemainingCoins();
    this.waveFlowGuard.noteProgress(this.getWaveFlowSnapshot(), 'wave-complete');
    this.waveReliability.completeWave(this.currentWave, this.getWaveFlowSnapshot());
    const perfect = this.coreHp >= this.waveStartHp - .01;
    const battlefieldEvent = this.battlefieldEvents?.active;
    const perfectBonus = perfect ? 10 + this.currentWave * 2 : 0;
    const encounterResult = this.encounterDirector.completeWave({ perfect, coreHpRatio: this.coreHp / Math.max(1, this.coreMaxHp) });
    this.lastEncounterResult = encounterResult;
    this.combatTelemetry.endWave({ wave: this.currentWave, perfect, coreHpRatio: this.coreHp / Math.max(1, this.coreMaxHp), planResult: encounterResult });
    this.notifyMomentumActivation(this.battleMomentum.recordWave({ perfect }));
    const campaignResult = this.campaign.completeWave(this.currentWave);
    if (campaignResult.completed) this.runStats.actsCleared = campaignResult.clearedCount;
    const reward = Math.round((24 + this.currentWave * 7 + perfectBonus) * this.activeRunMode.reward * (this.dailyEdict?.reward || 1) * (this.activeEncounterPlan?.rewardMultiplier || 1) * (this.campaign.modifiers.reward || 1) * this.battleMomentum.rewardMultiplier * (battlefieldEvent?.rewardMultiplier || 1));
    this.gold += reward;
    const battlefieldEventResult = this.battlefieldEvents.completeWave({ coreHp: this.coreHp, coreMaxHp: this.coreMaxHp });
    if (battlefieldEventResult.heal > 0) {
      this.coreHp += battlefieldEventResult.heal;
      this.showToast(`${battlefieldEventResult.event.icon} ${battlefieldEventResult.event.name} · 신목 회복 +${battlefieldEventResult.heal}`);
      this.spawnBattlefieldPropEffect(new THREE.Vector3(0, .2, 0), 'heal');
    }
    this.applyCouncilWaveIntervention(perfect);
    this.score += Math.round((this.currentWave * 250 + this.coreHp * 8) * this.activeRunMode.score * (this.dailyEdict?.score || 1));
    this.showCombo(`웨이브 ${this.currentWave} 격파 · +${reward} 엽전${perfectBonus ? ' · 무결점!' : ''}`, 1600);
    const clearImpact = this.combatPresentation?.impact({
      position: new THREE.Vector3(0, 0, 0),
      origin: this.player?.group?.position,
      color: perfect ? 0xffe28b : 0x8cecff,
      source: 'skill',
      heavy: perfect
    });
    if (clearImpact?.shake) this.shake = Math.max(this.shake, clearImpact.shake * .72);
    this.spawnRing(new THREE.Vector3(0, 0, 0), perfect ? 0xffe28b : 0x8cecff, perfect ? 7.5 : 5.8);
    if (perfectBonus) {
      this.score += Math.round(perfectBonus * 25 * this.activeRunMode.score);
      this.moonWard = Math.min(3, this.moonWard + 1);
      this.gainSoul(10, 'perfect-wave');
      this.showToast(`무결점 결계 충전 · 달빛 방패 ${this.moonWard}/3`);
      this.haptic([18, 24, 42]);
    }
    this.resolveWaveTrial(perfect);
    this.resolveActiveContract(perfect);
    if (this.currentWave >= this.maxWaves) {
      this.scheduleRun(() => this.finishRun(true), 900, { key: 'finish-run-win' });
      return;
    }
    this.buildPostWaveQueue();
    this.advancePostWaveRewards();
    this.updateHUD();
  }

  applyCouncilWaveIntervention(perfect = false) {
    const supportId = this.selectedCouncilSupportId;
    let message = '';
    if (supportId === 'warrior' && this.currentWave % 3 === 0) {
      const before = this.moonWard;
      this.moonWard = Math.min(3, this.moonWard + 1);
      if (this.moonWard > before) message = '철벽 호위 · 달빛 방패 +1';
    } else if (supportId === 'archer') {
      const bonus = Math.round(6 + this.currentWave * 1.5 + (perfect ? 5 : 0));
      this.gold += bonus;
      message = `월영 척후 · 추적 전리품 +${bonus}`;
    } else if (supportId === 'mage') {
      const soul = 6 + (perfect ? 4 : 0);
      this.gainSoul(soul, 'council-mage');
      message = `원소 참모 · 혼불 +${soul}`;
    } else if (supportId === 'taoist') {
      const luck = 4 + (perfect ? 3 : 0);
      this.luck = clamp(this.luck + luck, 0, 100);
      message = `봉인 도사 · 대박 기운 +${luck}%`;
    } else if (supportId === 'shaman') {
      const heal = Math.max(1, Math.round(this.coreMaxHp * .045 * (this.mods.coreHealing || 1)));
      const applied = Math.max(0, Math.min(heal, this.coreMaxHp - this.coreHp));
      this.coreHp += applied;
      if (applied > 0) message = `신목 무당 · 신목 회복 +${applied}`;
    }
    if (!message) return;
    this.runStats.councilInterventions += 1;
    this.showToast(message);
    this.spawnRing(new THREE.Vector3(0, 0, 0), 0x8cecff, 4.6);
  }

  offerContract() {
    if (this.state !== 'playing') return;
    this.state = 'contract';
    const options = this.shuffled(CONTRACTS);
    ui.contractOptions.innerHTML = options.map((contract) => `
      <button class="contract-option" data-contract="${contract.id}">
        <span>${contract.icon}</span><b>${contract.name}</b><p>${contract.desc}</p><small>${contract.tag}</small>
      </button>
    `).join('');
    this.showModal(ui.contractModal);
    this.startRewardAutoChoice('contract', 10);
  }

  selectContract(id) {
    const contract = CONTRACTS.find((item) => item.id === id);
    if (!contract) return;
    this.pendingContract = { ...contract };
    this.cancelRewardAutoChoice('contract');
    this.hideModal(ui.contractModal);
    this.state = 'playing';
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), 'contract-selected');
    this.showCombo(`${contract.icon} ${contract.name} 체결`, 1600);
    this.showToast('다음 한 웨이브에 계약이 적용됩니다.');
    this.haptic([18, 20, 38]);
    this.advancePostWaveRewards();
    this.updateHUD();
  }

  skipContract() {
    if (this.state !== 'contract') return;
    this.pendingContract = null;
    this.cancelRewardAutoChoice('contract');
    this.hideModal(ui.contractModal);
    this.state = 'playing';
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), 'contract-skipped');
    this.showToast('이번에는 안전하게 전열을 정비합니다.');
    this.advancePostWaveRewards();
  }

  activatePendingContract() {
    this.activeContract = this.pendingContract;
    this.pendingContract = null;
    if (!this.activeContract) return;
    this.showMission(this.activeContract.name, this.activeContract.desc, 'RISK CONTRACT ACTIVE', 1750);
  }

  resolveActiveContract(perfect) {
    const contract = this.activeContract;
    if (!contract) return;
    if (contract.id === 'bloodMoon') {
      this.choiceTickets += 1;
      this.score += 1200;
      this.showCombo('혈월 계약 완수 · 선택권 +1', 1600);
    } else if (contract.id === 'treeOath') {
      if (perfect) {
        this.gold += 120;
        this.score += 3200;
        this.showCombo('신목의 맹세 완수 · +120 엽전', 1800);
        this.haptic([28, 30, 70]);
      } else {
        this.gold += 20;
        this.showToast('맹세는 깨졌지만 위로금 20 엽전을 얻었습니다.');
      }
    } else if (contract.id === 'summonSeal') {
      this.choiceTickets += 1;
      this.showCombo('강림 봉인 해제 · 3성 강림!', 1700);
      const runId = this.runId;
      this.scheduleRun(() => {
        if (this.state === 'playing') this.summonUnit({ free: true, guaranteedRank: 3 });
      }, 420, { guard: () => this.runId === runId });
    }
    this.activeContract = null;
    this.updateHUD();
  }

  getContractRewardMultiplier() {
    return this.activeContract?.id === 'bloodMoon' ? 1.65 : 1;
  }

  getContractCoreDamageMultiplier() {
    return this.activeContract?.id === 'treeOath' ? 1.8 : 1;
  }

  offerBlessing() {
    if (this.state !== 'playing') return;
    this.state = 'blessing';
    const available = BLESSINGS.filter((item) => !this.blessingHistory.includes(item.id));
    const pool = available.length >= 3 ? available : BLESSINGS;
    let options = this.shuffled(pool).slice(0, 3);
    if (this.currentWave === 3 && !this.blessingHistory.includes('choice')) {
      const choice = BLESSINGS.find((item) => item.id === 'choice');
      options = [choice, ...this.shuffled(pool.filter((item) => item.id !== 'choice')).slice(0, 2)];
    }
    ui.blessingOptions.innerHTML = options.map((blessing) => `
      <button class="blessing-option" data-blessing="${blessing.id}"><span>${blessing.icon}</span><b>${blessing.name}</b><p>${blessing.desc}</p><small>${blessing.tag}</small></button>
    `).join('');
    this.showModal(ui.blessingModal);
    this.startRewardAutoChoice('blessing', 10);
    this.scheduleUi(() => {
      if (this.state === 'blessing' && !ui.blessingModal.classList.contains('visible')) this.restoreRewardModal('blessing');
    }, 420, { key: 'blessing-modal-visibility-guard' });
  }

  selectBlessing(id) {
    const blessing = BLESSINGS.find((item) => item.id === id);
    if (!blessing) return;
    blessing.apply(this);
    this.blessingHistory.push(id);
    this.cancelRewardAutoChoice('blessing');
    this.hideModal(ui.blessingModal);
    this.state = 'playing';
    this.waveFlowGuard.noteProgress(this.getWaveFlowSnapshot(), 'blessing-selected');
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), 'blessing-selected');
    this.sound.merge(2);
    this.showCombo(`${blessing.icon} ${blessing.name}`, 1500);
    this.advancePostWaveRewards();
    this.updateHUD();
  }

  updatePlayer(dt) {
    if (!this.player) return;
    const left = this.input.keys.has('KeyA') || this.input.keys.has('ArrowLeft');
    const rightKey = this.input.keys.has('KeyD') || this.input.keys.has('ArrowRight');
    const up = this.input.keys.has('KeyW') || this.input.keys.has('ArrowUp');
    const down = this.input.keys.has('KeyS') || this.input.keys.has('ArrowDown');
    const keyboardX = (rightKey ? 1 : 0) - (left ? 1 : 0);
    const keyboardY = (down ? 1 : 0) - (up ? 1 : 0);
    const manualX = clamp(this.input.x + keyboardX, -1, 1);
    const manualY = clamp(this.input.y + keyboardY, -1, 1);
    const manualLength = Math.hypot(manualX, manualY);
    this.keyboardMoveActive = Math.hypot(keyboardX, keyboardY) > 0;

    this.player.stunTimer = Math.max(0, this.player.stunTimer - dt);
    const stunned = this.player.stunTimer > 0;
    const move = tempV.set(0, 0, 0);
    let movementStrength = 0;

    if (manualLength > .05) {
      this.cancelMoveTarget();
      const x = manualX / Math.max(1, manualLength);
      const y = manualY / Math.max(1, manualLength);
      const forward = this.camera.getWorldDirection(tempV2).setY(0);
      if (forward.lengthSq() < .0001) forward.set(0, 0, -1);
      forward.normalize();
      const cameraRight = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0).setY(0);
      if (cameraRight.lengthSq() < .0001) cameraRight.crossVectors(forward, this.camera.up);
      cameraRight.normalize();
      move.addScaledVector(cameraRight, x).addScaledVector(forward, -y);
      movementStrength = Math.min(1, manualLength);
    } else if (this.moveTarget) {
      const toTarget = this.moveTarget.clone().sub(this.player.group.position).setY(0);
      const distance = toTarget.length();
      if (distance <= .2) {
        this.cancelMoveTarget(false);
        this.moveTargetMarker && (this.moveTargetMarker.userData.life = Math.min(this.moveTargetMarker.userData.life, .42));
      } else {
        move.copy(this.getNavigationDirection(this.player.group.position, this.moveTarget));
        movementStrength = clamp(distance / 1.55, .22, 1);
      }
    }

    if (stunned) movementStrength *= .3;
    const moving = move.lengthSq() > .0001 && movementStrength > .01;
    const locomotionState = moving ? (this.player.dashTimer > 0 ? 'run' : 'move') : 'idle';
    this.animations.setBaseState(this.player.animation, locomotionState);
    if (moving) {
      move.normalize();
      if (this.player.attackFacingLock <= 0) this.player.facing.lerp(move, .22).normalize();
      const burstMove = this.guardianBurstTimer > 0 ? 1.18 : 1;
      const speed = 5.25 * this.mods.moveSpeed * burstMove * (this.player.dashTimer > 0 ? 2.5 : 1) * movementStrength;
      this.player.group.position.addScaledVector(move, speed * dt);
      this.resolvePlayerNavigation(this.player.group.position);
      if (this.player.attackFacingLock <= 0) {
        const targetRot = Math.atan2(move.x, move.z);
        this.player.group.rotation.y = this.lerpAngle(this.player.group.rotation.y, targetRot, 1 - Math.pow(.001, dt));
      }
    }

    this.player.dashTimer = Math.max(0, this.player.dashTimer - dt);
    this.player.dashCooldown = Math.max(0, this.player.dashCooldown - dt);
    this.player.skillCooldown = Math.max(0, this.player.skillCooldown - dt);
    this.player.attackCooldown -= dt;
    this.player.attackFacingLock = Math.max(0, (this.player.attackFacingLock || 0) - dt);
    if (this.player.attackFacingLock > 0 && this.player.attackFacing?.lengthSq() > .001) {
      const attackRotation = Math.atan2(this.player.attackFacing.x, this.player.attackFacing.z);
      this.player.group.rotation.y = this.lerpAngle(this.player.group.rotation.y, attackRotation, 1 - Math.pow(.00001, dt));
    }

    const bob = Math.sin(this.elapsed * (moving ? 11 : 4)) * (moving ? .09 : .04);
    this.player.group.position.y = bob;
    this.player.flame.position.y = 1.25 + Math.sin(this.elapsed * 7) * .12;
    this.player.flame.scale.setScalar(1 + Math.sin(this.elapsed * 9) * .14);

    if (this.player.attackCooldown <= 0 && !stunned) {
      const classConfig = this.player.classConfig || getHeroClass(this.selectedHeroClassId);
      const attack = classConfig.attack;
      const target = this.findNearestEnemy(this.player.group.position, attack.range);
      if (target) {
        this.player.attackCooldown = attack.cooldown;
        const attackDirection = faceActorTowards(this.player.group, target.group.position, .92) || this.player.facing;
        this.player.facing.copy(attackDirection).normalize();
        this.player.attackFacing.copy(attackDirection).normalize();
        this.player.attackFacingLock = .18;
        const origin = resolveAttackOrigin(this.player.group, 1.35, .22);
        const burstDamage = this.guardianBurstTimer > 0 ? 1.48 * this.mods.burstPower : 1;
        const damage = (attack.damage + this.currentWave * 1.2) * this.mods.heroDamage * this.getThunderHeroMultiplier() * (this.activeOmen?.heroDamage || 1) * (this.jackpotTimer > 0 ? 1.15 : 1) * burstDamage;
        this.animations.trigger(this.player.animation, 'attack', .24);
        this.combatPresentation?.muzzle({ position: origin, direction: attackDirection, color: classConfig.color, style: classConfig.attackStyle || 'hero' });
        this.fireProjectile({ kind: 'hero', type: classConfig.attackStyle || 'hero', damageSource: classConfig.damageSource || 'hero', origin, target, damage, speed: attack.speed, color: classConfig.color, radius: attack.radius, pierce: attack.pierce || 0, splash: attack.splash || 0, chain: attack.chain || 0 });
        this.sound.shoot(classConfig.attackStyle === 'wind' ? 'wind' : 'hero');
      }
    }
  }

  useDash() {
    if (this.state !== 'playing' || this.player.dashCooldown > 0) return;
    this.cancelMoveTarget();
    this.player.dashCooldown = 4.2 * this.mods.dashCooldown;
    this.runStats.dashUses += 1;
    this.player.dashTimer = .34;
    const direction = this.player.facing.clone();
    if (direction.lengthSq() < .1) direction.set(0,0,-1);
    this.player.group.position.addScaledVector(direction,1.1);
    this.spawnParticles(this.player.group.position.clone().add(new THREE.Vector3(0,.7,0)),0x8cecff,16,4.5);
    this.shake = Math.max(this.shake,.13);
    this.sound.tone(260,.12,'sawtooth',.025,520);
    this.haptic(14);
  }

  useHeroSkill() {
    if (this.state !== 'playing' || this.player.skillCooldown > 0) return;
    const classConfig = this.player.classConfig || getHeroClass(this.selectedHeroClassId);
    const skill = classConfig.skill;
    this.player.skillCooldown = skill.cooldown * this.mods.skillCooldown;
    this.animations.trigger(this.player.animation, 'skill', .52);
    this.sound.skill();
    this.haptic([25, 25, 65]);
    const center = this.player.group.position.clone();
    const facingTarget = this.findNearestEnemy(center, skill.radius);
    if (facingTarget) {
      const direction = faceActorTowards(this.player.group, facingTarget.group.position, 1);
      if (direction) {
        this.player.facing.copy(direction);
        this.player.attackFacing.copy(direction);
        this.player.attackFacingLock = .36;
      }
    }
    const burstDamage = this.guardianBurstTimer > 0 ? 1.45 * this.mods.burstPower : 1;
    const damage = (skill.damage + this.currentWave * 10) * this.mods.heroDamage * this.mods.skillDamage * (this.activeOmen?.heroDamage || 1) * (this.jackpotTimer > 0 ? 1.15 : 1) * burstDamage;

    if (classConfig.id === 'archer') {
      const targets = this.enemies.filter((enemy) => !enemy.dead && enemy.group.position.distanceTo(center) <= skill.radius).sort((a, b) => a.group.position.distanceTo(center) - b.group.position.distanceTo(center)).slice(0, 6);
      targets.forEach((target, index) => {
        const origin = center.clone().add(new THREE.Vector3((index - 2.5) * .08, 1.35, 0));
        this.fireProjectile({ kind: 'hero-skill', type: 'wind', damageSource: 'skill-archer', origin, target, damage: damage * .72, speed: 34, color: classConfig.color, radius: .17, pierce: 2 });
      });
      this.spawnRing(center, classConfig.color, 3.2);
    } else if (classConfig.id === 'taoist') {
      const targets = this.enemies.filter((enemy) => !enemy.dead && enemy.group.position.distanceTo(center) <= skill.radius).sort((a, b) => a.group.position.distanceTo(center) - b.group.position.distanceTo(center)).slice(0, skill.targets || 8);
      targets.forEach((enemy, index) => {
        const scale = 1 - index * .045;
        this.damageEnemy(enemy, damage * Math.max(.68, scale), 'skill-taoist', center);
        this.spawnParticles(enemy.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)), classConfig.color, 8, 3.2);
      });
      this.spawnRing(center, classConfig.color, skill.radius * .72);
    } else {
      this.spawnSkillEffect(center);
      const source = classConfig.id === 'mage' ? 'skill-mage' : classConfig.id === 'shaman' ? 'skill-shaman' : 'skill';
      this.enemies.slice().forEach((enemy) => {
        const distance = enemy.group.position.distanceTo(center);
        if (distance > skill.radius) return;
        this.damageEnemy(enemy, damage * (1 - distance / (skill.radius + 5)), source, center);
        if (classConfig.id === 'mage') {
          enemy.slowTimer = Math.max(enemy.slowTimer, skill.slow || 2.4);
          enemy.slowFactor = Math.min(enemy.slowFactor, .5);
        }
      });
      if (classConfig.id === 'shaman') {
        const healing = Math.round((skill.healCore || 0) * (this.mods.coreHealing || 1));
        const before = this.coreHp;
        this.coreHp = Math.min(this.coreMaxHp, this.coreHp + healing);
        const restored = Math.max(0, Math.round(this.coreHp - before));
        this.moonWard = Math.min(3, this.moonWard + (restored >= 8 ? 1 : 0));
        this.showToast(`신령 치유굿 · 신목 ${restored ? `+${restored}` : '최대'}${restored >= 8 ? ' · 달빛 방패 +1' : ''}`);
        this.updateHUD();
      }
    }
    this.shake = Math.max(this.shake, .6);
    this.showCombo(`${skill.name}!`, 1000);
  }

  updateUnits(dt) {
    if (this.state === 'playing') this.commandCooldown = Math.max(0, (this.commandCooldown || 0) - dt);
    const burstCooldown = this.guardianBurstTimer > 0 ? .76 : 1;
    const cooldownMult = (this.mods?.unitCooldown ?? 1) * this.getWindCooldownMultiplier() * (this.activeOmen?.unitCooldown || 1) * (this.jackpotTimer > 0 ? .82 : 1) * burstCooldown;
    let activeCommandFound = false;
    this.units.forEach((unit) => {
      const config = UNIT_TYPES[unit.type];
      unit.cooldown -= dt;
      unit.commandTimer = Math.max(0, (unit.commandTimer || 0) - dt);
      const commandActive = unit.commandTimer > 0 && !unit.showcase;
      if (commandActive) activeCommandFound = true;
      const phase = unit.group.userData.phase;
      unit.group.position.y = .3 + Math.sin(this.elapsed*3.5+phase)*.06;
      unit.group.rotation.z = Math.sin(this.elapsed*2.1+phase)*.02;
      const pulseScale = commandActive ? 1.045 + Math.sin(this.elapsed * 11 + phase) * .025 : 1;
      unit.group.scale.setScalar((unit.baseScale || 1) * pulseScale);
      this.updateUnitImpostor(unit);
      if (unit.group.userData.aura && !unit.impostor?.active) {
        unit.group.userData.aura.rotation.z += dt*(.7+unit.rank*.16)*(commandActive ? 2.2 : 1);
        unit.group.userData.aura.material.opacity = commandActive ? .92 : .5;
      }
      if (unit.showcase || this.state !== 'playing') { this.animations.setState(unit.animation, 'idle'); return; }
      if (unit.cooldown > 0 && unit.cooldown <= .16) {
        const anticipation = this.guardianTargetingV22.select(unit, this.enemies, { baseRange: config.range, wave: this.currentWave, preferFarthest: unit.type === 'wind' });
        if (anticipation?.target) faceActorTowards(unit.group, anticipation.target.group.position, .34);
      }
      if (unit.rank === 5) {
        unit.ultimateCooldown -= dt * (commandActive ? 1.7 : 1);
        if (unit.ultimateCooldown <= 0 && this.triggerUnitUltimate(unit)) {
          unit.ultimateCooldown = config.ultimateCooldown;
          return;
        }
      }
      if (unit.cooldown <= 0) {
        const selection = this.guardianTargetingV22.select(unit, this.enemies, { baseRange: config.range, wave: this.currentWave, preferFarthest: unit.type === 'wind' });
        const target = selection?.target;
        if (!target) return;
        const stats = this.getUnitStats(unit);
        this.guardianTargetingV22.noteShot(selection);
        const cursed = this.hazards.some((hazard) => hazard.type === 'curse' && hazard.phase === 'active' && hazard.life > 0 && hazard.position.distanceTo(unit.group.position) <= hazard.radius);
        unit.cooldown = stats.cooldown * cooldownMult * (commandActive ? .62 : 1) * (cursed ? 1.85 : 1);
        const direction = target.group.position.clone().sub(unit.group.position);
        const targetRot = Math.atan2(direction.x,direction.z);
        unit.group.rotation.y = this.lerpAngle(unit.group.rotation.y,targetRot,.9);
        const aimDirection = direction.setY(0).normalize();
        const origin = resolveAttackOrigin(unit.group, 1.55, .16);
        this.animations.trigger(unit.animation, 'attack', .24);
        this.combatPresentation?.muzzle({ position: origin, direction: aimDirection, color: config.color, style: unit.type, heavy: unit.rank >= 5 || commandActive });
        this.fireProjectile({
          kind:'unit', type:unit.type, origin, target, damage:stats.damage * (selection?.damageMultiplier || 1), speed:config.projectileSpeed,
          color:config.color, radius:(.11+unit.rank*.025)*(commandActive ? 1.22 : 1), splash:config.splash ? config.splash*(1+unit.rank*.04) + (commandActive ? unit.commandSplashBonus || 0 : 0):0,
          slow:config.slow ? config.slow+unit.rank*.12:0, chain:config.chain ? config.chain+Math.floor(unit.rank/3) + (commandActive ? unit.commandChainBonus || 0 : 0):0,
          pierce:config.pierce ? config.pierce+Math.floor(unit.rank/3) + (commandActive ? unit.commandPierceBonus || 0 : 0):0, execute:(config.execute || 0) + (commandActive ? unit.commandExecuteBonus || 0 : 0), owner:unit
        });
        this.sound.shoot(unit.type);
      }
    });
    if (!activeCommandFound) this.commandActiveKey = '';
  }

  getUnitStats(unit) {
    const config = UNIT_TYPES[unit.type];
    const rank = RANKS[unit.rank-1];
    const commandDamage = unit.commandTimer > 0 ? 1.55 : 1;
    const jackpotDamage = this.jackpotTimer > 0 ? 1.22 : 1;
    const burstDamage = this.guardianBurstTimer > 0 ? 1.3 * this.mods.burstPower : 1;
    return { damage:config.damage*rank.mult*this.mods.unitDamage*this.getFireDamageMultiplier()*commandDamage*jackpotDamage*burstDamage, cooldown:config.cooldown };
  }

  triggerUnitUltimate(unit) {
    const config = UNIT_TYPES[unit.type];
    const stats = this.getUnitStats(unit);
    const origin = unit.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const living = this.enemies.filter((enemy) => !enemy.dead);
    const runId = this.runId;
    if (!living.length) return false;
    this.animations.trigger(unit.animation, 'skill', .58);
    let affected = 0;

    if (unit.type === 'ember') {
      const target = this.findNearestEnemy(unit.group.position, 13);
      if (!target) return false;
      const center = target.group.position.clone();
      const victims = living.filter((enemy) => enemy.group.position.distanceTo(center) <= 5.4);
      victims.forEach((enemy) => this.damageEnemy(enemy, stats.damage * 1.35, 'ultimate-ember', origin));
      this.spawnRing(center, config.color, 5.4);
      this.spawnParticles(center.clone().add(new THREE.Vector3(0, .8, 0)), config.color, 30, 6.2);
      affected = victims.length;
    } else if (unit.type === 'frost') {
      const victims = living.filter((enemy) => enemy.group.position.distanceTo(unit.group.position) <= 10.5);
      if (!victims.length) return false;
      victims.forEach((enemy) => {
        this.damageEnemy(enemy, stats.damage * .72, 'ultimate-frost', origin);
        if (!enemy.dead) {
          enemy.slowTimer = Math.max(enemy.slowTimer, 4.8);
          enemy.slowFactor = Math.min(enemy.slowFactor, .24);
        }
      });
      for (let index = 0; index < 3; index += 1) this.scheduleEffect(() => {
        if (unit.group.parent) this.spawnRing(unit.group.position, config.color, 4 + index * 3.1);
      }, index * 75, { guard: () => this.runId === runId });
      this.spawnParticles(origin, config.color, 34, 5.5);
      affected = victims.length;
    } else if (unit.type === 'wind') {
      const victims = living
        .filter((enemy) => enemy.group.position.distanceTo(unit.group.position) <= 14.5)
        .sort((a, b) => b.group.position.distanceTo(unit.group.position) - a.group.position.distanceTo(unit.group.position))
        .slice(0, 12);
      if (!victims.length) return false;
      victims.forEach((enemy, index) => {
        this.scheduleRun(() => {
          if (enemy.dead || !unit.group.parent) return;
          const end = enemy.group.position.clone().add(new THREE.Vector3(0, .9, 0));
          this.createLightningLine(origin, end, config.color);
          this.damageEnemy(enemy, stats.damage * 1.12, 'ultimate-wind', origin);
        }, index * 24, { guard: () => this.runId === runId });
      });
      this.spawnRing(unit.group.position, config.color, 8.5);
      affected = victims.length;
    } else if (unit.type === 'stone') {
      const target = this.findNearestEnemy(unit.group.position, 11.5);
      if (!target) return false;
      const center = target.group.position.clone();
      const victims = living.filter((enemy) => enemy.group.position.distanceTo(center) <= 4.8);
      victims.forEach((enemy) => {
        this.damageEnemy(enemy, stats.damage * 1.65, 'ultimate-stone', origin);
        if (!enemy.dead && !enemy.boss) {
          const push = enemy.group.position.clone().sub(center).setY(0);
          if (push.lengthSq() < .02) push.set(rand(-1, 1), 0, rand(-1, 1));
          enemy.group.position.add(push.normalize().multiplyScalar(1.25));
        }
      });
      this.spawnRing(center, config.color, 5.2);
      this.spawnParticles(center.clone().add(new THREE.Vector3(0, 2.5, 0)), config.color, 42, 7.8);
      this.shake = Math.max(this.shake, .48);
      affected = victims.length;
    } else if (unit.type === 'bell') {
      const victims = living
        .filter((enemy) => enemy.group.position.distanceTo(unit.group.position) <= 13)
        .sort((a, b) => a.group.position.distanceTo(unit.group.position) - b.group.position.distanceTo(unit.group.position))
        .slice(0, 10);
      if (!victims.length) return false;
      let previous = origin;
      victims.forEach((enemy, index) => {
        const end = enemy.group.position.clone().add(new THREE.Vector3(0, .9, 0));
        this.scheduleRun(() => {
          if (enemy.dead) return;
          this.createLightningLine(previous, end, config.color);
          this.damageEnemy(enemy, stats.damage * .94, 'ultimate-bell', origin);
          previous = end;
        }, index * 48, { guard: () => this.runId === runId });
      });
      this.spawnParticles(origin, config.color, 28, 5.2);
      affected = victims.length;
    } else if (unit.type === 'thunder') {
      const candidates = living.filter((enemy) => enemy.group.position.distanceTo(unit.group.position) <= 13.5);
      if (!candidates.length) return false;
      const target = candidates.sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)[0];
      const threshold = target.boss ? .12 : .34;
      const damage = target.hp / target.maxHp <= threshold ? target.hp + 1 : stats.damage * 2.45;
      const end = target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
      for (let index = 0; index < 3; index += 1) {
        const sky = end.clone().add(new THREE.Vector3(rand(-2.5, 2.5), 9 + index * 1.2, rand(-2.5, 2.5)));
        this.scheduleEffect(() => this.createLightningLine(sky, end, config.color), index * 65, { guard: () => this.runId === runId });
      }
      this.scheduleRun(() => this.damageEnemy(target, damage, 'ultimate-thunder', origin), 130, { guard: () => this.runId === runId && !target.dead });
      this.spawnRing(target.group.position, config.color, 3.7);
      this.shake = Math.max(this.shake, .58);
      affected = 1;
    }

    if (!affected) return false;
    this.score += 90 + affected * 18;
    this.showCombo(`${config.symbol} 5★ 궁극 · ${config.ultimateName}!`, 1050);
    this.sound.skill();
    this.haptic([18, 20, 42]);
    return true;
  }

  fireProjectile(data) {
    const poolKey = data.type === 'stone' ? 'stone' : data.type === 'wind' ? 'wind' : 'orb';
    const projectile = this.projectilePools[poolKey].acquire();
    if (!projectile) {
      this.resolveProjectileHit({ ...data, mesh: { position: data.origin }, hitTargets: new Set() }, data.target);
      return;
    }
    Object.assign(projectile, data, { poolKey, alive: true, life: 3.2, launchOrigin: data.origin.clone() });
    projectile.hitTargets.clear();
    projectile.mesh.visible = true;
    projectile.mesh.position.copy(data.origin);
    projectile.mesh.scale.setScalar(data.radius * 1.32);
    projectile.mesh.material.color.set(data.color);
    projectile.mesh.material.opacity = 1;
    for (const child of [projectile.mesh.userData.fxCore, projectile.mesh.userData.fxRing, projectile.mesh.userData.fxTrail]) {
      if (child?.material?.color) child.material.color.set(data.color);
    }
    if (projectile.mesh.userData.fxCore) projectile.mesh.userData.fxCore.material.opacity = .88;
    if (projectile.mesh.userData.fxRing) projectile.mesh.userData.fxRing.material.opacity = .72;
    if (projectile.mesh.userData.fxTrail) projectile.mesh.userData.fxTrail.material.opacity = poolKey === 'wind' ? .7 : .5;
    if (poolKey === 'wind') projectile.mesh.rotation.set(Math.PI / 2, 0, 0);
    else projectile.mesh.rotation.set(0, 0, 0);
    this.projectiles.push(projectile);
  }

  updateProjectiles(dt) {
    for (let i=this.projectiles.length-1;i>=0;i-=1) {
      const projectile=this.projectiles[i];
      projectile.life-=dt;
      if (!projectile.alive || projectile.life<=0 || !projectile.target || projectile.target.dead) {
        this.removeProjectile(projectile,i); continue;
      }
      const targetPos=projectile.target.group.position.clone().add(new THREE.Vector3(0,.9,0));
      const direction=targetPos.sub(projectile.mesh.position);
      const distance=direction.length();
      const step=projectile.speed*dt;
      if (distance<=step+.22) {
        this.resolveProjectileHit(projectile,projectile.target);
        if (projectile.pierce>0 && projectile.hitTargets.size<=projectile.pierce) {
          const next=this.findNearestEnemy(projectile.mesh.position,4.5,projectile.hitTargets);
          if (next) { projectile.target=next; continue; }
        }
        this.removeProjectile(projectile,i);
      } else {
        direction.normalize();
        projectile.mesh.position.addScaledVector(direction,step);
        const pulse = 1 + Math.sin(this.elapsed * 18 + i) * .12;
        projectile.mesh.scale.setScalar(projectile.radius * pulse);
        projectile.mesh.rotation.z += dt * (projectile.type === 'stone' ? 2.4 : 7.5);
        if (projectile.mesh.userData.fxRing) {
          projectile.mesh.userData.fxRing.rotation.z += dt * 5.5;
          projectile.mesh.userData.fxRing.scale.setScalar(1 + Math.sin(this.elapsed * 14 + i) * .12);
        }
        if (projectile.mesh.userData.fxCore) projectile.mesh.userData.fxCore.scale.setScalar(.82 + pulse * .16);
        projectile.mesh.lookAt(targetPos.add(direction));
        if (Math.random()<dt*(this.lowPower ? 8 : 18)) this.spawnTinyParticle(projectile.mesh.position,projectile.color);
      }
    }
  }

  resolveProjectileHit(projectile,target) {
    if (!target || target.dead) return;
    projectile.hitTargets.add(target);
    let damage=projectile.damage;
    if (projectile.type==='ember' && projectile.owner) {
      if (projectile.owner.streakTarget===target) projectile.owner.streak=Math.min(6,projectile.owner.streak+1);
      else { projectile.owner.streakTarget=target;projectile.owner.streak=0; }
      damage*=1+projectile.owner.streak*.07;
    }
    if (projectile.execute && target.hp/target.maxHp<projectile.execute && !target.boss) damage=target.hp+1;
    this.damageEnemy(target,damage,projectile.damageSource || projectile.type,projectile.launchOrigin || projectile.mesh.position,projectile.owner,projectile.type,projectile.color);
    if (projectile.slow) { target.slowTimer=Math.max(target.slowTimer,projectile.slow);target.slowFactor=.58; }
    if (projectile.splash) {
      this.enemies.slice().forEach((enemy)=>{
        if (enemy!==target && !enemy.dead && enemy.group.position.distanceTo(target.group.position)<=projectile.splash) this.damageEnemy(enemy,damage*.55,projectile.type,target.group.position,projectile.owner,projectile.type,projectile.color);
      });
      this.spawnRing(target.group.position,projectile.color,projectile.splash);
    }
    if (projectile.chain) this.chainDamage(target,damage*.62,projectile.chain,projectile.color,new Set([target]),projectile.owner);
    this.spawnParticles(target.group.position.clone().add(new THREE.Vector3(0,.8,0)),projectile.color,projectile.type==='stone'?10:5,projectile.type==='stone'?3.8:2.3);
  }

  chainDamage(source,damage,remaining,color,visited,owner=null) {
    if (remaining<=0) return;
    const next=this.enemies.filter((enemy)=>!enemy.dead&&!visited.has(enemy)&&enemy.group.position.distanceTo(source.group.position)<4.2).sort((a,b)=>a.group.position.distanceTo(source.group.position)-b.group.position.distanceTo(source.group.position))[0];
    if (!next) return;
    visited.add(next);
    this.createLightningLine(source.group.position.clone().add(new THREE.Vector3(0,.8,0)),next.group.position.clone().add(new THREE.Vector3(0,.8,0)),color);
    this.damageEnemy(next,damage,'bell',source.group.position,owner);
    this.chainDamage(next,damage*.78,remaining-1,color,visited,owner);
  }

  removeProjectile(projectile,index=this.projectiles.indexOf(projectile)) {
    projectile.alive=false;
    if (index>=0) this.projectiles.splice(index,1);
    this.projectilePools?.[projectile.poolKey]?.release(projectile);
  }

  findNearestEnemy(position,range,exclude=new Set()) {
    let best=null;let bestDistance=range;
    this.enemies.forEach((enemy)=>{
      if (enemy.dead||exclude.has(enemy)) return;
      const distance=enemy.group.position.distanceTo(position);
      if (distance<bestDistance) { best=enemy;bestDistance=distance; }
    });
    return best;
  }

  findFarthestEnemyInRange(position,range) {
    let best=null;let bestDistance=0;
    this.enemies.forEach((enemy)=>{
      if (enemy.dead) return;
      const distance=enemy.group.position.distanceTo(position);
      if (distance<=range && distance>bestDistance) { best=enemy;bestDistance=distance; }
    });
    return best;
  }

  updateEnemies(dt) {
    this.lodFrame = (this.lodFrame + 1) % 8;
    for (let i=this.enemies.length-1;i>=0;i-=1) {
      const enemy=this.enemies[i];
      if (enemy.dead) continue;
      const statusState = this.statusEffects.update(enemy, dt, {
        onDamage: (damage, statusSource) => this.damageEnemy(enemy, damage, statusSource, enemy.group.position, null, statusSource)
      });
      if (enemy.dead) continue;
      const breakState = enemy.boss ? this.bossBreak.update(enemy, dt) : null;
      enemy.statusSpeedMultiplier = statusState.speedMultiplier;
      enemy.slowTimer=Math.max(0,enemy.slowTimer-dt);
      if (enemy.slowTimer<=0) enemy.slowFactor=lerp(enemy.slowFactor,1,dt*5);
      enemy.flash=Math.max(0,enemy.flash-dt);
      enemy.shieldFlash=Math.max(0,enemy.shieldFlash-dt);
      enemy.weaknessTextCooldown=Math.max(0,(enemy.weaknessTextCooldown||0)-dt);
      enemy.statusTextCooldown=Math.max(0,(enemy.statusTextCooldown||0)-dt);
      if (enemy.flash<=0) enemy.group.userData.body.material.emissiveIntensity = enemy.boss ? (enemy.bossPhase > 1 ? .56 + enemy.bossPhase * .16 : .24) : 0;
      if (enemy.group.userData.shield) enemy.group.userData.shield.material.emissiveIntensity = enemy.shieldFlash > 0 ? 2.4 : .18;
      if (enemy.group.userData.phaseVisual) {
        const phaseVisual = enemy.group.userData.phaseVisual;
        phaseVisual.rotation.y += dt * (enemy.type === 'tiger' ? 1.4 : .85);
        phaseVisual.scale.setScalar(1 + Math.sin(this.elapsed * 5 + enemy.phase) * .055);
      }
      if (enemy.group.userData.eliteAura?.visible) {
        enemy.group.userData.eliteAura.rotation.z += dt * (enemy.elite?.id === 'swift' ? 2.8 : 1.35);
        enemy.group.userData.eliteAura.material.opacity = .55 + Math.sin(this.elapsed * 7 + enemy.phase) * .16;
      }

      const position=enemy.group.position;
      const distance=position.length();
      if (this.lodFrame === 0 || enemy.group.userData.impostor?.active) this.updateEnemyLOD(enemy, position.distanceTo(this.camera.position));
      let abilityLocked = Boolean(breakState?.staggered);
      if (abilityLocked) {
        this.animations.setBaseState(enemy.animation, 'idle');
        enemy.group.rotation.z = Math.sin(this.elapsed * 22) * .075;
        enemy.group.userData.body.material.emissive.setHex(0x8cecff);
        enemy.group.userData.body.material.emissiveIntensity = 1.15;
      } else if (enemy.type === 'runner') abilityLocked = this.updateRunnerAbility(enemy, dt, distance);
      else if (enemy.type === 'shaman') abilityLocked = this.updateShamanAbility(enemy, dt, distance);

      if (!abilityLocked) {
        if (distance>2.2) {
          this.animations.setBaseState(enemy.animation, 'move');
          const direction=tempV.set(-position.x,0,-position.z).normalize();
          let speed=enemy.speed*enemy.slowFactor*(enemy.statusSpeedMultiplier || 1);
          if (enemy.boss && enemy.specialTimer<.7) speed*=1.7;
          position.addScaledVector(direction,speed*dt);
          enemy.group.rotation.y=this.lerpAngle(enemy.group.rotation.y,Math.atan2(direction.x,direction.z),1-Math.pow(.002,dt));
          enemy.group.position.y=Math.sin(this.elapsed*(enemy.boss?4:7)+enemy.phase)*(.04*enemy.group.userData.scale);
        } else {
          this.animations.setBaseState(enemy.animation, 'idle');
          faceActorTowards(enemy.group, new THREE.Vector3(0, 0, 0), 1 - Math.pow(.0008, dt));
          enemy.attackTimer-=dt;
          if (enemy.attackTimer<=0) { enemy.attackTimer=enemy.boss?1.45:1;this.animations.trigger(enemy.animation, 'attack', .32);this.damageCore(enemy.damage * (enemy.boss ? this.bossEscalation.damageMultiplier(enemy) : 1)); }
        }
      }

      enemy.group.rotation.z=Math.sin(this.elapsed*5+enemy.phase)*.035;
      if (enemy.boss) {
        const escalation = this.bossEscalation.update(enemy, dt);
        if (escalation?.enteredEnrage) {
          this.combatTelemetry.recordBossEnrage();
          this.showMission('월식 광폭화', '보스의 공격력과 패턴 속도가 극한까지 상승합니다.', 'MYTHIC BOSS ENRAGE', 1800);
          this.showCombo('⚠ 월식 광폭화 · 처치 보상 +20%', 1500);
          this.spawnRing(enemy.group.position, 0xff4f82, 7.2);
          this.haptic([50, 30, 80, 35, 110]);
        }
        if (!breakState?.staggered) {
          enemy.specialTimer-=dt;
          if (enemy.specialTimer<=0) this.triggerBossSpecial(enemy);
        }
      }
    }
  }

  updateRunnerAbility(enemy, dt, distance) {
    if (enemy.abilityState === 'windup') {
      enemy.abilityTime -= dt;
      if (enemy.telegraphMesh) enemy.telegraphMesh.material.opacity = .24 + Math.sin(this.elapsed * 24) * .16;
      if (enemy.abilityTime <= 0) {
        this.removeEnemyTelegraph(enemy);
        enemy.abilityState = 'charge';
        enemy.abilityTime = .72;
        enemy.chargeHitPlayer = false;
        this.sound.tone(110,.18,'sawtooth',.035,440);
        this.haptic(18);
      }
      return true;
    }
    if (enemy.abilityState === 'charge') {
      enemy.abilityTime -= dt;
      enemy.group.position.addScaledVector(enemy.chargeDirection, 11.5 * dt);
      enemy.group.rotation.y = Math.atan2(enemy.chargeDirection.x, enemy.chargeDirection.z);
      if (Math.random() < dt * 34) this.spawnTinyParticle(enemy.group.position.clone().add(new THREE.Vector3(0,.5,0)), 0xff654f);
      if (!enemy.chargeHitPlayer && enemy.group.position.distanceTo(this.player.group.position) < 1.25) {
        enemy.chargeHitPlayer = true;
        const push=this.player.group.position.clone().sub(enemy.group.position).setY(0);
        if (push.lengthSq()<.01) push.set(1,0,0);
        this.player.group.position.add(push.normalize().multiplyScalar(1.8));
        this.player.stunTimer=Math.max(this.player.stunTimer,.65);
        this.showCombo('질주 충돌 · 비틀거림!',700);
        this.haptic([25,18,36]);
      }
      if (enemy.group.position.length() <= 2.2) {
        this.damageCore(enemy.damage * 1.65);
        enemy.abilityTime = 0;
      }
      if (enemy.abilityTime <= 0) {
        enemy.abilityState = 'recover';
        enemy.abilityTime = .45;
      }
      return true;
    }
    if (enemy.abilityState === 'recover') {
      enemy.abilityTime -= dt;
      if (enemy.abilityTime <= 0) {
        enemy.abilityState = 'move';
        enemy.abilityTimer = rand(4.2, 6.2);
      }
      return true;
    }
    enemy.abilityTimer -= dt;
    if (enemy.abilityTimer <= 0 && distance > 7) {
      enemy.abilityState = 'windup';
      enemy.abilityTime = .82;
      this.animations.trigger(enemy.animation, 'skill', .82);
      enemy.chargeDirection.copy(enemy.group.position).multiplyScalar(-1).normalize();
      this.createChargeTelegraph(enemy);
      if (!this.warningFlags.has('runner')) {
        this.warningFlags.add('runner');
        this.showMission('붉은 돌진선을 피하세요', '질주꾼이 신목까지 단숨에 돌진합니다.', 'ENEMY PATTERN · CHARGE', 1500);
      }
      return true;
    }
    return false;
  }

  createChargeTelegraph(enemy) {
    const distance = Math.max(2, enemy.group.position.length() - 2);
    const midpoint = enemy.group.position.clone().multiplyScalar(.5);
    const material = new THREE.MeshBasicMaterial({ color:0xff493f, transparent:true, opacity:.62, depthWrite:false, blending:THREE.AdditiveBlending });
    const mesh = this.mesh(new THREE.BoxGeometry(1.08,.04,distance),material,midpoint.x,.075,midpoint.z,false,false);
    mesh.rotation.y = Math.atan2(enemy.chargeDirection.x, enemy.chargeDirection.z);
    this.effectRoot.add(mesh);
    enemy.telegraphMesh = mesh;
  }

  removeEnemyTelegraph(enemy) {
    if (!enemy.telegraphMesh) return;
    this.effectRoot.remove(enemy.telegraphMesh);
    enemy.telegraphMesh.geometry.dispose();
    enemy.telegraphMesh.material.dispose();
    enemy.telegraphMesh = null;
  }

  updateShamanAbility(enemy, dt, distance) {
    if (enemy.abilityState === 'casting') {
      enemy.abilityTime -= dt;
      if (enemy.abilityTime <= 0) enemy.abilityState = 'move';
      return true;
    }
    enemy.abilityTimer -= dt;
    if (enemy.abilityTimer <= 0 && distance > 4.5 && distance <= 12.5 && enemy.group.position.distanceTo(this.player.group.position) <= 10.5) {
      const target = this.player.group.position.clone();
      this.combatReadability?.spawnThreatTracer(enemy.group.position, target, 0xb15cff, .82);
      this.createCurseZone(target);
      enemy.abilityState = 'casting';
      enemy.abilityTime = .72;
      this.animations.trigger(enemy.animation, 'skill', .72);
      enemy.abilityTimer = rand(5.6, 7.4);
      if (!this.warningFlags.has('curse')) {
        this.warningFlags.add('curse');
        this.showMission('저주를 수호대 밖으로 유도!', '보랏빛 장판이 굳기 전에 도깨비 진형에서 멀어지세요.', 'ENEMY PATTERN · CURSE', 1650);
      }
      return true;
    }
    return false;
  }

  createCurseZone(position) {
    this.createHazard({
      type:'curse', position, radius:3.25, color:0xb15cff, warning:.82, duration:5.2,
      onTrigger: (hazard) => {
        this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0,.5,0)),0xb15cff,14,2.8);
        this.sound.tone(190,.28,'sine',.025,-70);
      }
    });
  }

  createHazard({ type, position, radius, color, warning, duration, onTrigger }) {
    const group = new THREE.Group();
    group.position.set(position.x,.065,position.z);
    const warningDuration = Math.max(.05, Number(warning) || .05);
    const fill = this.mesh(new THREE.CircleGeometry(radius,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false}),0,0,0,false,false);
    fill.rotation.x=-Math.PI/2;
    const outline = this.mesh(new THREE.RingGeometry(radius*.96,radius*1.075,48),new THREE.MeshBasicMaterial({color:0x120b1b,transparent:true,opacity:.64,side:THREE.DoubleSide,depthWrite:false}),0,.009,0,false,false);
    outline.rotation.x=-Math.PI/2;
    const ring = this.mesh(new THREE.RingGeometry(radius*.78,radius,44),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.86,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),0,.018,0,false,false);
    ring.rotation.x=-Math.PI/2;
    const core = this.mesh(new THREE.RingGeometry(radius*.09,radius*.17,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.68,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),0,.026,0,false,false);
    core.rotation.x=-Math.PI/2;
    group.add(fill,outline,ring,core);
    group.userData.hazardTypeV126 = type;
    group.userData.warningDurationV126 = warningDuration;
    this.effectRoot.add(group);
    this.hazards.push({id:++this.hazardSerial,type,position:position.clone(),radius,color,warning:warningDuration,initialWarning:warningDuration,warningProgress:0,life:duration,phase:'warning',group,fill,outline,ring,core,onTrigger});
  }

  updateHazards(dt) {
    for (let i=this.hazards.length-1;i>=0;i-=1) {
      const hazard=this.hazards[i];
      if (hazard.phase==='warning') {
        hazard.warning-=dt;
        hazard.warningProgress=clamp(1-hazard.warning/Math.max(.05,hazard.initialWarning||.05),0,1);
        const urgency=hazard.warningProgress;
        const pulse=.96+Math.sin(this.elapsed*(14+urgency*10))*(.025+urgency*.035);
        hazard.group.scale.setScalar(pulse);
        hazard.ring.material.opacity=.48+urgency*.4+Math.sin(this.elapsed*20)*.08;
        hazard.outline.material.opacity=.56+urgency*.26;
        hazard.fill.material.opacity=.07+urgency*.16;
        hazard.core.material.opacity=.35+urgency*.55;
        hazard.core.scale.setScalar(.72+urgency*.82);
        hazard.ring.rotation.z+=dt*(.22+urgency*.58);
        hazard.group.userData.warningProgressV126=hazard.warningProgress;
        if (hazard.warning<=0) {
          hazard.phase='active';
          hazard.group.scale.setScalar(1);
          hazard.fill.material.opacity=hazard.type==='curse'?.16:.09;
          hazard.ring.material.opacity=hazard.type==='curse'?.52:.78;
          hazard.outline.material.opacity=.78;
          hazard.core.material.opacity=.92;
          hazard.core.scale.setScalar(1.65);
          hazard.onTrigger?.(hazard);
        }
      } else {
        hazard.life-=dt;
        hazard.core.material.opacity=Math.max(0,hazard.core.material.opacity-dt*2.8);
        hazard.outline.material.opacity=Math.max(.34,hazard.outline.material.opacity-dt*.7);
        if (hazard.type==='curse') {
          hazard.ring.rotation.z+=dt*.7;
          hazard.fill.material.opacity=.11+Math.sin(this.elapsed*4)*.04;
        } else {
          hazard.fill.material.opacity=Math.max(.025,hazard.fill.material.opacity-dt*.24);
          hazard.ring.material.opacity=Math.max(.24,hazard.ring.material.opacity-dt*.72);
        }
      }
      if (hazard.life<=0) {
        this.effectRoot.remove(hazard.group);
        hazard.group.traverse((object)=>{object.geometry?.dispose();if(object.material)object.material.dispose();});
        this.hazards.splice(i,1);
      }
    }
  }

  distanceToSegmentXZ(point, start, end) {
    const abx = end.x - start.x;
    const abz = end.z - start.z;
    const lengthSq = abx * abx + abz * abz || 1;
    const t = clamp(((point.x - start.x) * abx + (point.z - start.z) * abz) / lengthSq, 0, 1);
    const dx = point.x - (start.x + abx * t);
    const dz = point.z - (start.z + abz * t);
    return Math.hypot(dx, dz);
  }

  getDangerCandidate() {
    if (!this.player || this.state !== 'playing') return null;
    const playerPosition = this.player.group.position;
    const candidates = [];
    const dangerNames = {
      curse: ['저주를 진형 밖으로 유도', '저주 장판 밖으로 이동'],
      bossPounce: ['착지 원 밖으로 회피', '착지 충격에서 이탈'],
      nightMarch: ['야행진 장판 밖으로', '야행진 장판 이탈'],
      bossShock: ['충격파 범위 밖으로', '충격파 범위 이탈'],
      'elite-burst': ['파열 정예 폭발에서 이탈', '파열 폭발 범위 이탈'],
      serpentRing: ['독월 고리를 피하세요', '독월 고리 이탈'],
      serpentSnare: ['혼령 덫 밖으로 질주', '혼령 덫 이탈']
    };
    const severity = { curse: 2.8, nightMarch: 4.1, bossPounce: 4.7, bossShock: 5, 'elite-burst': 4.4, serpentRing: 4.2, serpentSnare: 4.8 };

    this.hazards.forEach((hazard) => {
      const distance = playerPosition.distanceTo(hazard.position);
      const margin = hazard.type === 'curse' ? 1.4 : .8;
      const inside = distance <= hazard.radius + margin;
      if (!inside || (hazard.phase !== 'warning' && hazard.type !== 'curse')) return;
      const direction = playerPosition.clone().sub(hazard.position).setY(0);
      if (direction.lengthSq() < .08) {
        direction.copy(playerPosition).setY(0);
        if (direction.lengthSq() < .08) direction.set(this.player.facing.z, 0, -this.player.facing.x);
      }
      const warning = hazard.phase === 'warning' ? Math.max(0, hazard.warning) : 0;
      const score = (severity[hazard.type] || 3) * 100 - warning * 28 - distance;
      candidates.push({
        key: `hazard-${hazard.id}`, direction: direction.normalize(), color: hazard.color, score,
        label: dangerNames[hazard.type]?.[hazard.phase === 'warning' ? 0 : 1] || '위험 범위 밖으로 이동',
        time: hazard.phase === 'warning' ? warning : 0, active: hazard.phase !== 'warning'
      });
    });

    this.enemies.forEach((enemy) => {
      if (enemy.dead || enemy.type !== 'runner' || enemy.abilityState !== 'windup') return;
      const start = enemy.group.position;
      const end = enemy.group.position.clone().addScaledVector(enemy.chargeDirection, Math.max(3, enemy.group.position.length() - 1.4));
      const distance = this.distanceToSegmentXZ(playerPosition, start, end);
      if (distance > 1.65) return;
      const perpendicular = new THREE.Vector3(-enemy.chargeDirection.z, 0, enemy.chargeDirection.x);
      if (playerPosition.clone().sub(start).dot(perpendicular) < 0) perpendicular.multiplyScalar(-1);
      candidates.push({
        key: `runner-${enemy.id}`, direction: perpendicular.normalize(), color: 0xff554b,
        score: 430 - enemy.abilityTime * 24 - distance, label: '돌진선 옆으로 회피', time: Math.max(0, enemy.abilityTime), active: false
      });
    });

    return candidates.sort((a, b) => b.score - a.score)[0] || null;
  }

  updateDangerHint(dt) {
    this.dangerHapticCooldown = Math.max(0, this.dangerHapticCooldown - dt);
    const candidate = this.cinematic ? null : this.getDangerCandidate();

    if (candidate) {
      this.dangerLostGrace = .2;
      if (!this.displayDanger || candidate.key === this.displayDanger.key) {
        this.displayDanger = candidate;
        this.pendingDangerKey = '';
        this.pendingDangerTimer = 0;
      } else {
        const urgentSwitch = candidate.active || candidate.time <= .34 || candidate.score > (this.displayDanger.score || 0) + 72;
        if (urgentSwitch) {
          this.displayDanger = candidate;
          this.pendingDangerKey = '';
          this.pendingDangerTimer = 0;
        } else {
          if (this.pendingDangerKey !== candidate.key) {
            this.pendingDangerKey = candidate.key;
            this.pendingDangerTimer = .14;
          } else {
            this.pendingDangerTimer -= dt;
            if (this.pendingDangerTimer <= 0) {
              this.displayDanger = candidate;
              this.pendingDangerKey = '';
            }
          }
        }
      }
    } else if (this.displayDanger && this.dangerLostGrace > 0) {
      this.dangerLostGrace -= dt;
      if (!this.displayDanger.active) this.displayDanger.time = Math.max(0, this.displayDanger.time - dt);
    } else {
      this.displayDanger = null;
      this.pendingDangerKey = '';
    }

    const danger = this.displayDanger;
    if (!danger) {
      ui.dangerHint.classList.remove('visible', 'urgent');
      ui.dangerHint.classList.add('hidden');
      this.lastDangerKey = '';
      return;
    }
    const forward = tempV.set(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = tempV2.set(forward.z, 0, -forward.x);
    const angle = Math.atan2(danger.direction.dot(right), danger.direction.dot(forward)) * 180 / Math.PI;
    ui.dangerArrow.style.transform = `rotate(${angle}deg)`;
    ui.dangerHint.style.setProperty('--danger-color', `#${danger.color.toString(16).padStart(6, '0')}`);
    ui.dangerLevel.textContent = danger.active ? '위험 지역' : danger.time <= .42 ? '즉시 회피' : '공격 예고';
    ui.dangerLabel.textContent = danger.label;
    ui.dangerTime.textContent = danger.active ? '지금 이동하세요' : `${danger.time.toFixed(1)}초 후 발동`;
    ui.dangerHint.classList.remove('hidden');
    ui.dangerHint.classList.add('visible');
    ui.dangerHint.classList.toggle('urgent', danger.active || danger.time <= .42);
    if (danger.key !== this.lastDangerKey && this.dangerHapticCooldown <= 0) {
      this.lastDangerKey = danger.key;
      this.dangerHapticCooldown = .75;
      this.haptic(danger.time <= .42 ? [18, 15, 28] : 12);
    }
  }

  getBossSpecialDelay(enemy) {
    let delay = 5.1 + this.random() * 1.1;
    if (enemy.type === 'tiger') delay = enemy.bossPhase >= 2 ? 3.35 + this.random() * .9 : 4.8 + this.random();
    else if (enemy.type === 'serpent') delay = enemy.bossPhase >= 2 ? 3.1 + this.random() * .8 : 4.35 + this.random() * .8;
    else if (enemy.bossPhase >= 3) delay = 2.9 + this.random() * .8;
    else if (enemy.bossPhase >= 2) delay = 3.6 + this.random();
    return delay * this.bossEscalation.specialDelayMultiplier(enemy);
  }

  getBossIntentName(enemy) {
    const index = enemy.specialIndex || 0;
    if (enemy.type === 'tiger') {
      if (enemy.bossPhase >= 2) return index % 2 === 0 ? '혈월 도약' : '광폭 충격파';
      return '사자후 충격파';
    }
    if (enemy.type === 'serpent') {
      if (enemy.bossPhase >= 2) return index % 3 === 0 ? '청월 윤무' : index % 3 === 1 ? '혼령 덫' : '이무기 포효';
      return index % 2 === 0 ? '독월 고리' : '혼령 덫';
    }
    if (enemy.bossPhase >= 3) return ['백귀 야행진', '처형 도약', '왕의 충격파'][index % 3];
    if (enemy.bossPhase >= 2) return index % 2 === 0 ? '백귀 소환' : '왕의 충격파';
    return '왕의 충격파';
  }

  triggerBossSpecial(enemy) {
    if (!enemy || enemy.dead) return;
    this.animations.trigger(enemy.animation, 'skill', .64);
    const index = enemy.specialIndex || 0;
    if (enemy.type === 'tiger') {
      if (enemy.bossPhase >= 2 && index % 2 === 0) this.bossPounce(enemy, { radius: 3.3, warning: .92, color: 0xff5b47 });
      else this.bossRoar(enemy, enemy.bossPhase >= 2 ? { radius: 6.6, warning: .88 } : undefined);
    } else if (enemy.type === 'serpent') {
      if (enemy.bossPhase >= 2 && index % 3 === 0) this.serpentMoonDance(enemy);
      else if (index % 2 === 0) this.serpentPoisonRings(enemy);
      else this.serpentSpiritSnare(enemy);
    } else if (enemy.bossPhase >= 3) {
      const mode = index % 3;
      if (mode === 0) this.kingNightMarch(enemy);
      else if (mode === 1) this.bossPounce(enemy, { radius: 3.7, warning: .82, color: 0xff4fd8 });
      else this.bossRoar(enemy, { radius: 7.1, warning: .9, color: 0xffc85a });
    } else if (enemy.bossPhase >= 2) {
      if (index % 2 === 0) this.spawnBossAdds(enemy, 4);
      else this.bossRoar(enemy, { radius: 6.3, warning: .98, color: 0xffc85a });
    } else {
      this.bossRoar(enemy, { color: 0xffc85a });
    }
    enemy.specialIndex = index + 1;
    enemy.specialTimer = this.getBossSpecialDelay(enemy);
    enemy.intentDuration = enemy.specialTimer;
  }

  checkBossPhase(enemy) {
    if (!enemy?.boss || enemy.dead) return;
    const ratio = enemy.hp / enemy.maxHp;
    if (enemy.type === 'tiger' && enemy.bossPhase === 1 && ratio <= .5) {
      this.enterBossPhase(enemy, 2, '저승 호랑이 광폭', '도약과 더 넓은 충격파를 번갈아 사용합니다.', 0xff5a45);
      enemy.speed *= 1.28;
      enemy.damage *= 1.24;
    } else if (enemy.type === 'serpent' && enemy.bossPhase === 1 && ratio <= .56) {
      this.enterBossPhase(enemy, 2, '청월 비늘 개방', '고리 장판이 연속으로 번지고 혼령 덫이 혼불을 삼킵니다.', 0x43f0c1);
      enemy.speed *= 1.2;
      enemy.damage *= 1.2;
      this.spawnBossAdds(enemy, 4);
    } else if (enemy.type === 'king' && enemy.bossPhase === 1 && ratio <= .68) {
      this.enterBossPhase(enemy, 2, '백귀 장막 개방', '야행왕이 부하를 불러 전장을 압박합니다.', 0xa864ff);
      enemy.speed *= 1.12;
      enemy.damage *= 1.15;
      this.spawnBossAdds(enemy, 3);
    } else if (enemy.type === 'king' && enemy.bossPhase === 2 && ratio <= .32) {
      this.enterBossPhase(enemy, 3, '백귀 야행 최종막', '연속 장판과 처형 도약이 시작됩니다.', 0xff4fd8);
      enemy.speed *= 1.22;
      enemy.damage *= 1.25;
      this.spawnBossAdds(enemy, 5);
    }
  }

  enterBossPhase(enemy, phase, title, copy, color) {
    enemy.bossPhase = phase;
    this.bossEscalation.recordPhase(enemy, phase);
    applyPremiumBossPhase(enemy.group, enemy.type, phase);
    enemy.specialIndex = 0;
    enemy.specialTimer = .9;
    enemy.intentDuration = .9;
    enemy.group.scale.multiplyScalar(1.055);
    enemy.group.userData.body.material.emissive.set(color);
    enemy.group.userData.body.material.emissiveIntensity = .75;
    if (enemy.group.userData.phaseAura) {
      enemy.group.remove(enemy.group.userData.phaseAura);
      enemy.group.userData.phaseAura.geometry.dispose();
      enemy.group.userData.phaseAura.material.dispose();
    }
    const aura = this.mesh(
      new THREE.TorusGeometry(1.45 * enemy.group.userData.scale, .07 * enemy.group.userData.scale, 7, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .72, depthWrite: false }),
      0, .18, 0, false, false
    );
    aura.rotation.x = Math.PI / 2;
    enemy.group.add(aura);
    enemy.group.userData.phaseAura = aura;
    this.showMission(title, copy, `BOSS PHASE ${phase}`, 1900);
    this.showCombo(`PHASE ${phase} · ${title}`, 1750);
    this.spawnParticles(enemy.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), color, 34, 6.2);
    this.spawnRing(enemy.group.position, color, 5.5 + phase);
    this.sound.boss();
    this.haptic([55, 35, 85, 40, 110]);
    this.shake = Math.max(this.shake, .72);
  }

  spawnBossAdds(enemy, count) {
    if (!enemy || enemy.dead) return;
    const choices = enemy.type === 'king' ? ['runner', 'shaman', 'brute'] : enemy.type === 'serpent' ? ['shaman', 'runner', 'imp'] : ['runner', 'imp'];
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2 + rand(-.2, .2);
      const position = enemy.group.position.clone().add(new THREE.Vector3(Math.cos(angle) * 2.6, 0, Math.sin(angle) * 2.6));
      const add = this.createEnemy(pick(choices), position, .7);
      add.hp *= .78;
      add.maxHp = add.hp;
      this.enemies.push(add);
    }
    this.showCombo(`백귀 소환 · 요괴 ${count}마리`, 1150);
    this.spawnParticles(enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xa864ff, 22, 4.5);
  }

  bossPounce(enemy, options = {}) {
    const target = this.player.group.position.clone();
    const radius = options.radius || 3.2;
    const color = options.color || ENEMY_TYPES[enemy.type].color;
    this.createHazard({
      type: 'bossPounce', position: target, radius, color, warning: options.warning || .95, duration: .14,
      onTrigger: (hazard) => {
        if (!enemy || enemy.dead || !enemy.group.parent) return;
        enemy.group.position.set(hazard.position.x, 0, hazard.position.z);
        this.spawnRing(hazard.position, color, radius + 1.2);
        this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0, 1.2, 0)), color, 28, 6.5);
        this.shake = Math.max(this.shake, .58);
        if (hazard.position.distanceTo(this.player.group.position) < radius) {
          this.player.stunTimer = Math.max(this.player.stunTimer, 1.15);
          this.player.skillCooldown += 2;
          this.showCombo('보스 도약 피격 · 혼절!', 1050);
          this.haptic([40, 25, 65]);
        } else {
          this.score += 180;
          this.runStats.dangerDodges += 1;
          this.showCombo('도약 회피! +180', 850);
        }
      }
    });
    this.showMission('착지 원 밖으로 이동!', '보스가 현재 위치를 향해 도약합니다.', 'BOSS INTENT · POUNCE', 1200);
  }

  serpentPoisonRings(enemy) {
    const center = this.player.group.position.clone();
    const count = enemy.bossPhase >= 2 ? 6 : 4;
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2 + (enemy.specialIndex || 0) * .42;
      const distance = index % 2 === 0 ? 3.2 : 5.5;
      const position = center.clone().add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
      this.createHazard({
        type: 'serpentRing', position, radius: 1.45, color: 0x55efc3, warning: .62 + index * .08, duration: .18,
        onTrigger: (hazard) => {
          const hit = hazard.position.distanceTo(this.player.group.position) < hazard.radius;
          this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0, .45, 0)), 0x55efc3, 16, 4.5);
          if (hit) {
            this.player.stunTimer = Math.max(this.player.stunTimer, .5);
            this.soulGauge = Math.max(0, this.soulGauge - 10);
            this.player.skillCooldown += 1.2;
            this.runStats.bossHazardHits += 1;
            this.haptic([22, 18, 34]);
          } else {
            this.score += Math.round(45 * this.mods.dodgeReward);
          }
        }
      });
    }
    this.showMission('독월 고리 확산', '고리 사이의 빈 공간을 따라 이동하세요.', 'BOSS INTENT · MOON RINGS', 1350);
  }

  serpentSpiritSnare(enemy) {
    const target = this.player.group.position.clone();
    this.createHazard({
      type: 'serpentSnare', position: target, radius: 2.65, color: 0x4be6c5, warning: 1.05, duration: .2,
      onTrigger: (hazard) => {
        const hit = hazard.position.distanceTo(this.player.group.position) < hazard.radius;
        this.spawnRing(hazard.position, 0x4be6c5, 3.4);
        if (hit) {
          this.soulGauge = Math.max(0, this.soulGauge - 24);
          this.player.stunTimer = Math.max(this.player.stunTimer, .85);
          this.player.skillCooldown += 2;
          this.showCombo('혼령 덫 피격 · 혼불 -24%', 1000);
          this.haptic([30, 22, 50]);
        } else {
          const reward = Math.round(140 * this.mods.dodgeReward);
          this.score += reward;
          this.gainSoul(5, 'serpent-dodge');
          this.runStats.dangerDodges += 1;
          this.showCombo(`혼령 덫 회피! +${reward}`, 850);
        }
      }
    });
    this.showMission('혼령 덫에서 이탈!', '초록 결계가 닫히기 전에 원 밖으로 달리세요.', 'BOSS INTENT · SPIRIT SNARE', 1300);
  }

  serpentMoonDance(enemy) {
    this.serpentPoisonRings(enemy);
    const runId = this.runId;
    this.scheduleRun(() => {
      if (enemy && !enemy.dead) this.serpentSpiritSnare(enemy);
    }, 720, { guard: () => this.runId === runId });
    this.showCombo('청월 윤무 · 연속 장판!', 1100);
  }

  kingNightMarch(enemy) {
    const origin = this.player.group.position.clone();
    const forward = origin.clone().sub(enemy.group.position).setY(0).normalize();
    const side = new THREE.Vector3(-forward.z, 0, forward.x);
    const positions = [origin, origin.clone().addScaledVector(side, 3.6), origin.clone().addScaledVector(side, -3.6)];
    positions.forEach((position, index) => {
      const color = index === 1 ? 0xffc85a : 0xff4fd8;
      this.createHazard({
        type: 'nightMarch', position, radius: 2.75, color, warning: .72 + index * .22, duration: .14,
        onTrigger: (hazard) => {
          this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0, .6, 0)), color, 18, 4.8);
          if (hazard.position.distanceTo(this.player.group.position) < hazard.radius) {
            this.player.stunTimer = Math.max(this.player.stunTimer, .7);
            this.player.skillCooldown += 1;
            this.haptic([24, 18, 35]);
          } else this.score += 70;
        }
      });
    });
    this.showMission('백귀 야행진', '세 개의 장판 사이 안전 공간을 찾으세요.', 'FINAL PHASE · NIGHT MARCH', 1350);
  }

  bossRoar(enemy, options = {}) {
    const pos=enemy.group.position.clone();
    const color=options.color || ENEMY_TYPES[enemy.type].color;
    const radius=options.radius || 5.5;
    this.createHazard({
      type:'bossShock', position:pos, radius, color, warning:options.warning || 1.08, duration:.12,
      onTrigger: (hazard) => {
        this.spawnRing(hazard.position,color,radius);
        this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0,1.8,0)),color,22,5.2);
        this.shake=Math.max(this.shake,.45);
        this.sound.boss();
        const playerDistance=hazard.position.distanceTo(this.player.group.position);
        if (playerDistance<radius) {
          const push=this.player.group.position.clone().sub(hazard.position).setY(0);
          if (push.lengthSq()<.01) push.set(1,0,0);
          this.player.group.position.add(push.normalize().multiplyScalar(2.5));
          this.player.stunTimer=Math.max(this.player.stunTimer,1.05);
          this.player.skillCooldown+=1.5;
          this.showCombo('충격파 피격 · 혼절!',1100);
          this.haptic([45,30,70]);
        } else {
          this.score+=120;
          this.runStats.dangerDodges += 1;
          this.showCombo('충격파 회피! +120',850);
        }
      }
    });
    if (!this.warningFlags.has('bossShock')) {
      this.warningFlags.add('bossShock');
      this.showMission('바닥 예고 링 밖으로!', '링이 꽉 차기 전에 충격파 범위를 벗어나세요.', 'BOSS PATTERN · SHOCKWAVE', 1500);
    }
  }

  notifyMomentumActivation(activated) {
    if (!activated) return;
    this.combatTelemetry.recordOverdrive();
    this.showMission('도깨비 신명 폭주', '피해 +22% · 전리품 +14% · 7.5초 지속', 'MYTHIC MOMENTUM', 1450);
    this.showCombo('✦ 신명 폭주 발동!', 1350);
    this.haptic([24, 18, 42, 22, 68]);
  }

  updateBattleMomentum(dt) {
    const active = this.battleMomentum.update(dt);
    document.body.classList.toggle('momentum-overdrive', active);
  }

  damageEnemy(enemy,amount,source='',hitOrigin=null,owner=null,impactSource=source,impactColor=null) {
    if (!enemy || enemy.dead) return;
    const isStatusTick = String(source).startsWith('status-');
    const incomingStatusType = this.statusEffects.getTypeForSource(source);
    const reaction = this.elementalReactions.resolve(enemy, incomingStatusType, amount, { boss: enemy.boss });
    if (reaction) {
      const reactionDamage = reaction.bonusDamage * (this.mods.reactionDamage || 1) * (this.campaign.modifiers.reactionDamage || 1);
      amount += reactionDamage;
      this.combatTelemetry.recordReaction(reaction.id, reactionDamage);
      this.notifyMomentumActivation(this.battleMomentum.recordReaction(reaction.momentum));
      this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.boss ? 4.15 : 2.7, 0)), reactionDamage, { label: `${reaction.icon} ${reaction.label}` });
      this.spawnRing(enemy.group.position, reaction.color, enemy.boss ? 4.8 : 2.7);
    }
    if (!isStatusTick) {
      amount *= this.statusEffects.damageTakenMultiplier(enemy);
      amount *= this.battleMomentum.damageMultiplier;
    }
    const attackerType = owner?.type || (source.startsWith('ultimate-') ? source.slice('ultimate-'.length) : UNIT_KEYS.includes(source) ? source : '');
    const weaknessMultiplier = attackerType ? getWeaknessDamageBonus(this.codexProgress, enemy.type, attackerType) : 1;
    if (weaknessMultiplier > 1) {
      amount *= weaknessMultiplier;
      this.runStats.weaknessHits += 1;
      if (!enemy.weaknessTextCooldown || enemy.weaknessTextCooldown <= 0) {
        enemy.weaknessTextCooldown = .55;
        this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.boss ? 3.55 : 2.18, 0)), 0, { label: `약점 ×${weaknessMultiplier.toFixed(2)}` });
      }
    }
    if (enemy.boss) {
      amount *= this.mods.bossDamage;
      amount *= this.bossBreak.damageTakenMultiplier(enemy);
    }
    if (enemy.eliteShield > 0) {
      const absorbed = Math.min(enemy.eliteShield, amount);
      enemy.eliteShield -= absorbed;
      amount -= absorbed;
      enemy.flash = .08;
      this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, 2.1, 0)), absorbed, { label: enemy.eliteShield > 0 ? '결계' : '결계 파괴!' });
      if (enemy.eliteShield <= 0) {
        this.spawnRing(enemy.group.position, enemy.elite?.color || 0x8de8ff, 1.8);
        this.haptic(10);
      }
      if (amount <= 0) return;
    }
    let shielded = false;
    const ultimate = source.startsWith('ultimate-');
    if (enemy.type === 'brute' && hitOrigin && source !== 'skill' && !ultimate) {
      const incoming = hitOrigin.clone().sub(enemy.group.position).setY(0).normalize();
      const forward = new THREE.Vector3(Math.sin(enemy.group.rotation.y),0,Math.cos(enemy.group.rotation.y));
      if (forward.dot(incoming) > .18) { amount *= .35; shielded = true; enemy.shieldFlash = .14; }
    }
    const baseCritChance = source.startsWith('hero') ? .12 : source === 'thunder' ? .18 : source === 'wind' ? .08 : .035;
    const critChance = shielded ? 0 : clamp(baseCritChance + (this.mods.critChanceBonus || 0), 0, .42);
    const crit = !source.startsWith('skill') && !ultimate && this.random() < critChance;
    if (crit) amount *= 1.75;
    const appliedStatus = this.statusEffects.applyFromSource(enemy, source, amount, { potencyMultiplier: this.mods.statusPotency || 1, durationMultiplier: this.mods.statusDuration || 1 });
    if (appliedStatus) {
      this.combatTelemetry.recordStatus(appliedStatus.type);
      if (!enemy.statusTextCooldown || enemy.statusTextCooldown <= 0) {
        enemy.statusTextCooldown = .7;
        this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.boss ? 3.85 : 2.42, 0)), 0, { label: `${appliedStatus.definition.icon} ${appliedStatus.definition.label} ×${appliedStatus.stacks}` });
      }
    }
    const appliedDamage = Math.max(0, Math.min(enemy.hp, amount));
    const breakResult = enemy.boss ? this.bossBreak.recordDamage(enemy, appliedDamage, { reaction: Boolean(reaction), critical: crit, status: isStatusTick, source }) : null;
    if (breakResult?.triggered) {
      this.runStats.bossBreaks += 1;
      enemy.specialTimer = Math.max(enemy.specialTimer, breakResult.duration + 1.1);
      this.showMission('보스 파훼 성공', `균형 붕괴 ${breakResult.duration.toFixed(1)}초 · 받는 피해 +22%`, 'SOVEREIGN BREAK', 1600);
      this.showCombo('⚡ BREAK · 집중 공격!', 1350);
      this.spawnRing(enemy.group.position, 0x8cecff, 7.4);
      this.spawnParticles(enemy.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), 0x8cecff, enemy.boss ? 30 : 14, 5.5);
      this.haptic([30, 20, 65, 25, 85]);
    }
    this.combatTelemetry.recordDamage(source, appliedDamage);
    if (!isStatusTick) this.notifyMomentumActivation(this.battleMomentum.recordDamage(appliedDamage));
    if (owner?.type && owner.commandTimer > 0) this.runStats.commandDamage += appliedDamage;
    if (owner?.type && this.runStats.damageByType[owner.type] !== undefined) this.runStats.damageByType[owner.type] += appliedDamage;
    else if (source.startsWith('hero')) this.runStats.heroDamage += appliedDamage;
    else if (source.startsWith('skill')) this.runStats.skillDamage += appliedDamage;
    else if (source.startsWith('ultimate-')) {
      const type = source.slice('ultimate-'.length);
      if (this.runStats.damageByType[type] !== undefined) this.runStats.damageByType[type] += appliedDamage;
    }
    enemy.hp-=amount;
    if (enemy.boss && enemy.hp > 0) this.checkBossPhase(enemy);
    enemy.flash=.09;
    this.animations.trigger(enemy.animation, 'hit', .16);
    enemy.group.userData.body.material.emissive.set(0xffffff);
    enemy.group.userData.body.material.emissiveIntensity=1.6;
    this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.boss ? 3.1 : 1.8, 0)), amount, { crit, label: shielded ? '방패!' : undefined });
    const presentationColor = impactColor
      || (source === 'hero' || source === 'skill' ? this.heroClass?.color : null)
      || (attackerType ? UNIT_TYPES[attackerType]?.color : null)
      || enemy.elite?.color
      || ENEMY_TYPES[enemy.type]?.color
      || 0xffffff;
    const presentation = this.combatPresentation?.impact({
      position: enemy.group.position,
      origin: hitOrigin,
      color: shielded ? 0x9deaff : presentationColor,
      source: impactSource,
      critical: crit,
      heavy: enemy.boss || ultimate || source === 'skill',
      shielded
    });
    if (presentation?.shake) this.shake = Math.max(this.shake, presentation.shake);
    if (crit) this.haptic(10);
    this.sound.hit();
    if (enemy.hp<=0) this.killEnemy(enemy,source);
  }

  killEnemy(enemy,source) {
    if (enemy.dead) return;
    const deathPosition = enemy.group.position.clone();
    const bossEscalationReward = this.bossEscalation.rewardMultiplier(enemy);
    enemy.dead=true;
    this.statusEffects.clear(enemy);
    this.bossEscalation.unregister(enemy);
    this.bossBreak.unregister(enemy);
    this.encounterDirector.recordKill();
    this.combatTelemetry.recordKill({ boss: enemy.boss });
    const index=this.enemies.indexOf(enemy);
    if (index>=0) this.enemies.splice(index,1);
    this.animations.trigger(enemy.animation, 'death', .28);
    this.combatVisualV112?.playDeathEcho(enemy.group, this.effectRoot, { duration: enemy.boss ? .52 : .36, state: 'death' });
    this.animations.remove(enemy.animation);
    this.releaseEnemyModel(enemy);
    const color=ENEMY_TYPES[enemy.type].color;
    this.spawnParticles(deathPosition.clone().add(new THREE.Vector3(0,.8,0)),color,enemy.boss?35:12,enemy.boss?6:3.4);
    const eliteOmenReward = enemy.elite ? (this.activeOmen?.eliteReward || 1) : 1;
    const reward=Math.max(2,Math.round(enemy.reward*(this.activeEncounterPlan?.rewardMultiplier || 1)*this.mods.goldMultiplier*this.getSpiritGoldMultiplier()*this.getContractRewardMultiplier()*(this.activeOmen?.reward || 1)*this.activeRunMode.reward*(enemy.elite?.reward || 1)*eliteOmenReward*(this.dailyEdict?.reward || 1)*(enemy.elite ? this.mods.eliteReward : 1)*bossEscalationReward*(this.campaign.modifiers.reward || 1)*this.battleMomentum.rewardMultiplier*(this.battlefieldEvents?.rewardMultiplier || 1)));
    this.dropCoins(deathPosition,reward,enemy.boss?9:Math.min(4,1+Math.floor(reward/7)));
    this.kills+=1;
    this.gainSoul(enemy.boss ? 24 : enemy.elite ? 8 : 2, 'kill');
    if (enemy.elite?.deathBurst) this.createEliteDeathBurst(deathPosition, enemy.damage);
    if (enemy.elite) {
      this.eliteKills += 1;
      this.runStats.eliteKills += 1;
      this.showCombo(`${enemy.elite.icon} 정예 ${enemy.elite.name} 격파!`, 900);
    }
    this.killChain = this.killChainTimer > 0 ? this.killChain + 1 : 1;
    this.killChainTimer = 1.85;
    this.notifyMomentumActivation(this.battleMomentum.recordKill({ boss: enemy.boss, elite: Boolean(enemy.elite), chain: this.killChain }));
    this.waveMaxChain = Math.max(this.waveMaxChain, this.killChain);
    this.runStats.maxKillChain = Math.max(this.runStats.maxKillChain, this.killChain);
    const chainMultiplier = 1 + Math.min(.6, Math.max(0, this.killChain - 1) * .018);
    this.score+=Math.round(enemy.maxHp*(enemy.boss?3:1)*chainMultiplier*(this.activeOmen?.score || 1)*this.activeRunMode.score*(enemy.elite?.score || 1)*(this.dailyEdict?.score || 1));
    if (this.killChain >= 2) {
      ui.killChain.classList.remove('hidden');
      ui.killChainValue.textContent = `x${this.killChain}`;
      ui.killChainBonus.textContent = `점수 +${Math.round((chainMultiplier - 1) * 100)}%`;
    }
    if (this.killChain > 0 && this.killChain % 10 === 0) {
      const chainGold = 8 + Math.floor(this.killChain / 10) * 5;
      this.gold += chainGold;
      this.showCombo(`${this.killChain} 연속 처치 · +${chainGold} 엽전`, 1200);
      this.haptic([18, 22, 35]);
    }
    this.handleCodexEnemyDefeat(enemy);
    if (enemy.boss) {
      this.runStats.bossKills += 1;
      this.showCombo(`${ENEMY_TYPES[enemy.type].name} 격파!`,1800);
      this.shake=.85;
      this.haptic([65, 35, 85, 40, 120]);
      ui.bossHealth.classList.add('hidden');
      if (enemy.type === 'tiger') this.recordFirstMission('bosses', 1);
    }
  }


  createEliteDeathBurst(position, damage) {
    this.createHazard({
      type: 'elite-burst', position, radius: 3.15, color: 0xff765d, warning: .72, duration: .5,
      onTrigger: (hazard) => {
        const distance = this.player.group.position.distanceTo(hazard.position);
        if (distance <= hazard.radius) {
          const soulLoss = Math.min(18, 10 + Math.round(damage * .12));
          const goldLoss = Math.min(this.gold, Math.max(3, Math.round(damage * .18)));
          this.player.stunTimer = Math.max(this.player.stunTimer, .55);
          this.player.skillCooldown += 1.4;
          this.soulGauge = Math.max(0, this.soulGauge - soulLoss);
          this.gold = Math.max(0, this.gold - goldLoss);
          this.runStats.eliteBurstHits += 1;
          this.shake = Math.max(this.shake, .36);
          this.showCombatText(this.player.group.position.clone().add(new THREE.Vector3(0, 2.2, 0)), soulLoss, { label: `파열 · 혼불 -${soulLoss}%` });
          this.showToast(`파열 충격으로 엽전 ${goldLoss}개를 잃었습니다.`);
          this.haptic([28, 18, 46]);
        } else {
          const reward = Math.round(160 * this.mods.dodgeReward);
          this.score += reward;
          this.gainSoul(6, 'elite-burst-dodge');
          this.runStats.eliteBurstDodges += 1;
          this.runStats.dangerDodges += 1;
          this.showCombo(`파열 회피! +${reward} · 혼불 +6%`, 900);
        }
        if (hazard.position.length() <= 4.4) this.damageCore(damage * .32);
        this.spawnParticles(hazard.position.clone().add(new THREE.Vector3(0, .45, 0)), 0xff765d, 22, 5);
        this.sound.tone(120, .24, 'sawtooth', .028, 80);
      }
    });
  }

  damageCore(amount) {
    if (this.moonWard > 0) {
      this.moonWard -= 1;
      this.runStats.wardBlocks += 1;
      this.showCombo(`달빛 방패가 피해를 막았습니다 · ${this.moonWard}/3`, 1100);
      this.spawnRing(new THREE.Vector3(0, 0, 0), 0x8cecff, 4.4);
      this.haptic([16, 18, 38]);
      this.updateHUD();
      return;
    }
    const reduced=amount*this.mods.coreDamage*this.getMountainDamageMultiplier()*this.getContractCoreDamageMultiplier();
    this.coreHp=Math.max(0,this.coreHp-reduced);
    this.showCombatText(new THREE.Vector3(0, this.core?.userData?.damageAnchorY || 4.55, 0), reduced, { label: `-${Math.ceil(reduced)}` });
    this.core.userData.hitPulse=.35;
    ui.damageFlash.classList.add('show');
    this.scheduleUi(() => ui.damageFlash.classList.remove('show'), 100, { key: 'damage-flash-hide' });
    this.shake=Math.max(this.shake,.25);
    this.haptic([25, 25, 35]);
    this.spawnParticles(new THREE.Vector3(0,this.core?.userData?.impactY || 3.7,.78),0xff6688,10,3.5);
    if (this.coreHp<=0) this.finishRun(false);
    this.updateHUD();
  }

  dropCoins(position,total,count) {
    const each=Math.max(1,Math.round(total/count));
    for (let i=0;i<count;i+=1) {
      const coin=this.coinPool.acquire();
      const value=i===count-1?Math.max(1,total-each*(count-1)):each;
      if (!coin) {
        const existing=this.coins[this.coins.length-1];
        if (existing) existing.value+=value;
        else this.gold+=value;
        continue;
      }
      coin.mesh.visible=true;
      coin.mesh.position.set(position.x,position.y+.55,position.z);
      coin.mesh.rotation.set(Math.PI/2,0,0);
      coin.value=value;
      coin.velocity.set(rand(-2.3,2.3),rand(2.6,4.8),rand(-2.3,2.3));
      coin.age=0;coin.grounded=false;coin.phase=rand(0,Math.PI*2);
      this.coins.push(coin);
    }
  }

  releaseCoin(coin,index=this.coins.indexOf(coin)) {
    if(index>=0) this.coins.splice(index,1);
    this.coinPool.release(coin);
  }

  updateCoins(dt) {
    for (let i=this.coins.length-1;i>=0;i-=1) {
      const coin=this.coins[i];coin.age+=dt;
      if (!coin.grounded) {
        coin.velocity.y-=10*dt;
        coin.mesh.position.addScaledVector(coin.velocity,dt);
        if (coin.mesh.position.y<=.25) {coin.mesh.position.y=.25;coin.velocity.set(0,0,0);coin.grounded=true;}
      } else {
        coin.mesh.position.y=.29+Math.sin(this.elapsed*5+coin.phase)*.08;
        coin.mesh.rotation.z+=dt*4;
      }
      const distance=coin.mesh.position.distanceTo(this.player.group.position);
      const pickup=this.mods.pickupRadius;
      if (distance<pickup+2.2 && coin.grounded) {
        const attraction=clamp((pickup+2.2-distance)/2.2,0,1);
        tempV.copy(this.player.group.position); tempV.y += 1;
        coin.mesh.position.lerp(tempV,dt*(5+attraction*12));
      }
      if (distance<pickup) {
        this.gold+=coin.value;
        this.score+=coin.value*2;
        this.runStats.coinsCollected+=coin.value;
        this.gainSoul(Math.min(3.2, coin.value * .12), 'coin');
        this.sound.coin();
        this.spawnTinyParticle(coin.mesh.position,0xffd36b);
        this.releaseCoin(coin,i);
      } else if (coin.age>22) {
        this.releaseCoin(coin,i);
      }
    }
  }

  setBattlefieldTheme(omenId = 'default', immediate = false) {
    const theme = getBattlefieldTheme(omenId);
    this.battlefieldTheme = theme;
    this.themeTarget = theme;
    this.themeColors = {
      background: new THREE.Color(theme.background), fog: new THREE.Color(theme.fog), hemiSky: new THREE.Color(theme.hemiSky),
      hemiGround: new THREE.Color(theme.hemiGround), moonLight: new THREE.Color(theme.moonLight), moon: new THREE.Color(theme.moon),
      halo: new THREE.Color(theme.halo), portal: new THREE.Color(theme.portal), ground: new THREE.Color(theme.ground),
      ring: new THREE.Color(theme.ring), inner: new THREE.Color(theme.inner), wisp: new THREE.Color(theme.wisp)
    };
    if (immediate) this.updateBattlefieldTheme(10);
  }

  updateBattlefieldTheme(dt) {
    if (!this.themeTarget || !this.themeColors) return;
    const factor = clamp(1 - Math.pow(.035, Math.max(.001, dt)), 0, 1);
    this.scene.background.lerp(this.themeColors.background, factor);
    this.scene.fog.color.lerp(this.themeColors.fog, factor);
    this.scene.fog.density = lerp(this.scene.fog.density, this.themeTarget.fogDensity, factor);
    this.hemiLight.color.lerp(this.themeColors.hemiSky, factor);
    this.hemiLight.groundColor.lerp(this.themeColors.hemiGround, factor);
    this.moonLight.color.lerp(this.themeColors.moonLight, factor);
    this.moonMesh?.material?.color?.lerp(this.themeColors.moon, factor);
    this.moonHalo?.material?.color?.lerp(this.themeColors.halo, factor);
    this.groundMaterial?.color?.lerp(this.themeColors.ground, factor);
    this.ringMaterial?.color?.lerp(this.themeColors.ring, factor);
    this.innerMaterial?.color?.lerp(this.themeColors.inner, factor);
    this.gates.forEach((gate) => gate.userData.portal?.material?.color?.lerp(this.themeColors.portal, factor));
    this.wisps.forEach((wisp) => wisp.mesh?.material?.color?.lerp(this.themeColors.wisp, factor * .32));
  }

  updateWorldEffects(dt) {
    this.updateBattlefieldTheme(dt);
    this.wisps.forEach((wisp)=>{
      wisp.angle+=dt*wisp.speed;
      wisp.mesh.position.x=Math.cos(wisp.angle)*wisp.radius;
      wisp.mesh.position.z=Math.sin(wisp.angle)*wisp.radius;
      wisp.mesh.position.y=wisp.baseY+Math.sin(this.elapsed*1.8+wisp.phase)*.55;
      wisp.mesh.material.opacity=.3+(Math.sin(this.elapsed*2.7+wisp.phase)+1)*.23;
    });
    this.gates.forEach((gate,index)=>{
      gate.userData.rune.rotation.z+=dt*(index%2?.3:-.3);
      gate.userData.portal.material.opacity=.14+(Math.sin(this.elapsed*2+index)+1)*.06;
    });
    if (this.core) {
      this.core.userData.orb.scale.setScalar(1+Math.sin(this.elapsed*3)*.11+this.core.userData.hitPulse*.65);
      this.core.userData.hitPulse=Math.max(0,this.core.userData.hitPulse-dt*2.8);
    }
  }

  spawnParticles(position,color,count=8,speed=3) {
    const motionScale = this.controlSettings?.reducedMotion ? .45 : 1;
    const actual = Math.max(1, Math.ceil(count * (this.engine.effectBudgetScale || (this.lowPower ? .58 : 1)) * motionScale));
    for (let i=0;i<actual;i+=1) {
      const particle = this.particlePool.acquire();
      if (!particle) break;
      const size=rand(.045,.13);
      particle.mesh.visible = true;
      particle.mesh.position.set(position.x+rand(-.25,.25),position.y+rand(-.2,.25),position.z+rand(-.25,.25));
      particle.mesh.scale.setScalar(size / .1);
      particle.mesh.material.color.setHex(color);
      particle.mesh.material.opacity=.95;
      particle.velocity.set(rand(-1,1),rand(.1,1.25),rand(-1,1)).normalize().multiplyScalar(rand(speed*.45,speed));
      particle.life=rand(.35,.85);particle.maxLife=particle.life;particle.gravity=rand(1.5,5);
      this.particles.push(particle);
    }
  }

  spawnTinyParticle(position,color) {
    const particle = this.particlePool.acquire();
    if (!particle) return;
    particle.mesh.visible = true;
    particle.mesh.position.copy(position);
    particle.mesh.scale.setScalar(.35);
    particle.mesh.material.color.setHex(color);
    particle.mesh.material.opacity=.7;
    particle.velocity.set(rand(-.3,.3),rand(.1,.7),rand(-.3,.3));
    particle.life=.25;particle.maxLife=.25;particle.gravity=0;
    this.particles.push(particle);
  }

  updateParticles(dt) {
    for (let i=this.particles.length-1;i>=0;i-=1) {
      const particle=this.particles[i];
      particle.life-=dt;particle.velocity.y-=particle.gravity*dt;particle.mesh.position.addScaledVector(particle.velocity,dt);
      particle.mesh.material.opacity=clamp(particle.life/particle.maxLife,0,1);
      particle.mesh.scale.multiplyScalar(Math.max(.92,1-dt*1.7));
      if (particle.life<=0) {this.particlePool.release(particle);this.particles.splice(i,1);}
    }
  }

  spawnRing(position,color,radius) {
    const mesh=this.mesh(new THREE.RingGeometry(.5,.62,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}),position.x,.09,position.z,false,false);
    mesh.rotation.x=-Math.PI/2;
    this.effectRoot.add(mesh);
    this.animateTransientVisual({
      duration: .42,
      guard: () => Boolean(mesh.parent),
      update: (t) => {
        mesh.scale.setScalar(lerp(.3,radius,t));
        mesh.material.opacity=(1-t)*.65;
      },
      cleanup: () => {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    });
  }

  spawnSummonEffect(position,color,rank) {
    this.spawnRing(position,color,2.2+rank*.25);
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1,0)),color,14+rank*4,3.5+rank*.45);
    const beam=this.mesh(new THREE.CylinderGeometry(.18,.55,5.5,12,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}),position.x,2.8,position.z,false,false);
    this.effectRoot.add(beam);
    this.animateTransientVisual({
      duration: .45,
      guard: () => Boolean(beam.parent),
      update: (t) => {
        beam.scale.x=beam.scale.z=1+t*.9;
        beam.material.opacity=(1-t)*.32;
      },
      cleanup: () => {
        beam.removeFromParent();
        beam.geometry.dispose();
        beam.material.dispose();
      }
    });
  }

  spawnMergeEffect(position,color,rank) {
    for (let i = 0; i < 3; i += 1) this.scheduleEffect(() => this.spawnRing(position, color, 2.4 + i * .9), i * 90);
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1.2,0)),color,24+rank*5,5.5);
  }

  spawnSkillEffect(position) {
    const color=0x6befff;
    for (let i = 0; i < 4; i += 1) this.scheduleEffect(() => this.spawnRing(position, color, 3 + i * 1.75), i * 70);
    for(let i=0;i<18;i+=1){
      const angle=i/18*Math.PI*2;
      const start=position.clone().add(new THREE.Vector3(Math.cos(angle)*.5,1,Math.sin(angle)*.5));
      const end=position.clone().add(new THREE.Vector3(Math.cos(angle)*7,rand(.3,2),Math.sin(angle)*7));
      this.createLightningLine(start,end,color);
    }
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1,0)),color,36,7);
  }

  createLightningLine(start,end,color) {
    const points=[start.clone()];
    for(let i=1;i<5;i+=1){const t=i/5;points.push(start.clone().lerp(end,t).add(new THREE.Vector3(rand(-.25,.25),rand(-.2,.3),rand(-.25,.25))));}
    points.push(end.clone());
    const geometry=new THREE.BufferGeometry().setFromPoints(points);
    const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.9});
    const line=new THREE.Line(geometry,material);this.effectRoot.add(line);
    this.animateTransientVisual({
      duration: .16,
      guard: () => Boolean(line.parent),
      update: (t) => { material.opacity=1-t; },
      cleanup: () => {
        line.removeFromParent();
        geometry.dispose();
        material.dispose();
      }
    });
  }

  lerpAngle(a,b,t) { let diff=(b-a+Math.PI)%(Math.PI*2)-Math.PI;if(diff<-Math.PI)diff+=Math.PI*2;return a+diff*t; }

  resolveCameraCollisionDistance(target, requestedDistance, profileId = 'scenic') {
    if (!this.cameraObstacles.length) return requestedDistance;
    const horizontal = Math.cos(this.cameraPitch) * requestedDistance;
    const dx = Math.sin(this.cameraYaw) * horizontal;
    const dy = Math.sin(this.cameraPitch) * requestedDistance;
    const dz = Math.cos(this.cameraYaw) * horizontal;
    const a = dx * dx + dz * dz;
    if (a < .0001) return requestedDistance;
    let collisionFraction = 1;
    for (const obstacle of this.cameraObstacles) {
      if (obstacle.type === 'core') continue;
      const radius = obstacle.radius + .32;
      const ox = target.x - obstacle.x;
      const oz = target.z - obstacle.z;
      const c = ox * ox + oz * oz - radius * radius;
      if (c <= 0) continue;
      const b = 2 * (ox * dx + oz * dz);
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) continue;
      const sqrt = Math.sqrt(discriminant);
      const roots = [(-b - sqrt) / (2 * a), (-b + sqrt) / (2 * a)].sort((left, right) => left - right);
      const hit = roots.find((value) => value > .08 && value < collisionFraction);
      if (hit === undefined) continue;
      const heightAtHit = target.y + dy * hit;
      if (heightAtHit > obstacle.height + .55) continue;
      collisionFraction = Math.max(.58, hit - .035);
    }
    const minimumByProfile = profileId === 'scenic' ? 14.8 : profileId === 'balanced' ? 12.8 : 10.4;
    return clamp(requestedDistance * collisionFraction, minimumByProfile, requestedDistance);
  }



  updateCamera(dt) {
    if (!this.player) return;
    this.cameraDistance = lerp(this.cameraDistance, this.cameraDistanceTarget, 1 - Math.pow(.00008, dt));
    let target;
    let desired;
    if (this.cinematic?.unit?.group?.parent && this.cinematic.time > 0) {
      this.cinematic.time = Math.max(0, this.cinematic.time - dt);
      const progress = 1 - this.cinematic.time / this.cinematic.total;
      const eased = 1 - Math.pow(1 - progress, 3);
      target = this.cinematic.unit.group.position.clone().add(new THREE.Vector3(0, 1.42, 0));
      const angle = this.cinematic.startYaw + eased * 1.08;
      const distance = lerp(8.4, 6.4, Math.sin(progress * Math.PI));
      desired = new THREE.Vector3(
        target.x + Math.sin(angle) * distance,
        target.y + 3.5 + Math.sin(progress * Math.PI) * 1.1,
        target.z + Math.cos(angle) * distance
      );
      if (this.cinematic.time <= 0) this.cinematic = null;
    } else {
      const profile = this.activeCameraProfile || getCameraProfile(this.controlSettings?.cameraProfile);
      const bossActive = this.enemies.some((enemy) => enemy.boss && !enemy.dead);
      const cameraDirective = this.cameraDirectorV16.update({
        player: this.player,
        enemies: this.enemies,
        waveActive: this.waveActive,
        bossActive,
        interestPoints: this.battlefieldProps?.interestPoints || [],
        aspect: this.camera.aspect,
        corePosition: this.core?.position || tempV.set(0, 0, 0),
        dt
      });
      const tacticalDirectiveV127 = this.bossTacticalAssuranceV127?.getCameraDirective?.() || null;
      const tacticalDistanceBonusV127 = tacticalDirectiveV127?.active ? tacticalDirectiveV127.distanceBonus : 0;
      const tacticalFovBonusV127 = tacticalDirectiveV127?.active ? tacticalDirectiveV127.fovBonus : 0;
      const framedDistance = resolveCameraDistance(profile.id, { waveActive: this.waveActive, bossActive, manualDistance: this.cameraDistance }) + cameraDirective.spreadBonus + tacticalDistanceBonusV127;
      const desiredFov = profile.fov + cameraDirective.fovBonus + tacticalFovBonusV127;
      if (Math.abs(this.camera.fov - desiredFov) > .01) {
        this.camera.fov = lerp(this.camera.fov, desiredFov, 1 - Math.pow(.02, dt));
        this.camera.updateProjectionMatrix();
      }
      target=this.player.group.position.clone().add(new THREE.Vector3(0,profile.targetHeight,0));
      if (cameraDirective.focusWeight > .001) target.lerp(this.cameraDirectorV16.focusPoint, cameraDirective.focusWeight);
      if (tacticalDirectiveV127?.active && tacticalDirectiveV127.focus && typeof tacticalDirectiveV127.focus.x === 'number') {
        tempV2.set(tacticalDirectiveV127.focus.x, tacticalDirectiveV127.focus.y || 0, tacticalDirectiveV127.focus.z);
        tempV2.y += .8;
        target.lerp(tempV2, tacticalDirectiveV127.focusWeight);
      }
      const safeDistance = this.resolveCameraCollisionDistance(target, framedDistance, profile.id);
      const collisionBlend = safeDistance < this.cameraCollisionDistance ? 1 - Math.pow(.000001, dt) : 1 - Math.pow(.02, dt);
      this.cameraCollisionDistance = lerp(this.cameraCollisionDistance, safeDistance, collisionBlend);
      const horizontal=Math.cos(this.cameraPitch)*this.cameraCollisionDistance;
      desired=new THREE.Vector3(
        target.x+Math.sin(this.cameraYaw)*horizontal,
        target.y+Math.sin(this.cameraPitch)*this.cameraCollisionDistance,
        target.z+Math.cos(this.cameraYaw)*horizontal
      );
    }
    this.updateCoreOcclusion(dt, target, desired);
    this.camera.position.lerp(desired,1-Math.pow(.0007,dt));
    const shakePreference = this.controlSettings?.reducedMotion ? Math.min(.2, this.controlSettings.shakeIntensity) : this.controlSettings?.shakeIntensity ?? 1;
    const cameraShakeLimit = this.cameraDirectorV16?.shakeLimit ?? .86;
    const shakeAmount=Math.min(this.shake, cameraShakeLimit)*Math.min(this.shake, cameraShakeLimit)*shakePreference;
    if(shakeAmount>.001)this.camera.position.add(new THREE.Vector3(rand(-shakeAmount,shakeAmount),rand(-shakeAmount,shakeAmount),rand(-shakeAmount,shakeAmount)));
    this.shake=Math.max(0,this.shake-dt*1.9);
    this.camera.lookAt(target);
  }

  updateSynergies() {
    const counts={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{const element=UNIT_TYPES[unit.type].element;counts[element]=(counts[element]||0)+1;});
    this.synergyCounts=counts;
    let active=0;
    ui.synergyList.innerHTML=SYNERGIES.map((synergy)=>{
      const count=counts[synergy.element]||0;
      const tier=count>=synergy.thresholds[1]?2:count>=synergy.thresholds[0]?1:0;
      if(tier)active+=1;
      const next=tier===2?'MAX':`${count}/${synergy.thresholds[tier]}`;
      const value=tier?synergy.values[tier-1]:synergy.values[0];
      return `<div class="synergy-row ${tier?'':'off'}"><span>${synergy.icon}</span><div><b>${synergy.element} 인연 ${tier?value:''}</b><small>${synergy.text} · ${next}</small></div></div>`;
    }).join('');
    ui.synergyCount.textContent=active;
  }

  getSynergyTier(element) { const count=this.synergyCounts?.[element]||0;return count>=4?2:count>=2?1:0; }
  getFireDamageMultiplier(){return [1,1.15,1.32][this.getSynergyTier('화염')];}
  getSynergyLuckMultiplier(){return [1,1.3,1.65][this.getSynergyTier('달빛')];}
  getWindCooldownMultiplier(){return [1,.88,.75][this.getSynergyTier('바람')];}
  getMountainDamageMultiplier(){return [1,.85,.7][this.getSynergyTier('산')];}
  getSpiritGoldMultiplier(){return [1,1.18,1.38][this.getSynergyTier('혼령')];}
  getThunderHeroMultiplier(){return [1,1.25,1.6][this.getSynergyTier('천둥')];}

  useBestUnitCommand() {
    if (this.state !== 'playing') return;
    const candidates = this.units.filter((unit) => !unit.showcase);
    if (!candidates.length) return;
    const best = candidates.sort((a, b) => b.rank - a.rank || UNIT_TYPES[b.type].damage - UNIT_TYPES[a.type].damage)[0];
    this.useUnitCommand(`${best.type}-${best.rank}`);
  }

  useUnitCommand(key) {
    if (this.state !== 'playing') return;
    if (this.commandCooldown > 0) {
      this.showToast(`집중 명령 재충전 ${Math.ceil(this.commandCooldown)}초`);
      this.haptic(10);
      return;
    }
    const [type, rankString] = String(key).split('-');
    const rank = Number(rankString);
    const targets = this.units.filter((unit) => !unit.showcase && unit.type === type && unit.rank === rank);
    if (!targets.length || !UNIT_TYPES[type]) return;
    this.commandCooldown = 18 * this.mods.commandCooldown;
    this.commandActiveKey = key;
    this.runStats.commandsUsed += 1;
    targets.forEach((unit) => {
      unit.commandTimer = 7;
      unit.cooldown = Math.min(unit.cooldown, .08);
      if (unit.rank === 5) unit.ultimateCooldown = Math.max(.35, unit.ultimateCooldown - 4);
      this.applyUnitCommandEffect(unit, type);
      this.spawnRing(unit.group.position, UNIT_TYPES[type].color, 1.6 + unit.rank * .18);
      this.spawnParticles(unit.group.position.clone().add(new THREE.Vector3(0, 1.15, 0)), UNIT_TYPES[type].color, 12, 3.2);
    });
    this.score += 35 * targets.length;
    this.sound.skill();
    this.haptic([20, 18, 42]);
    this.showCombo(`${UNIT_TYPES[type].symbol} 집중 명령 · ${UNIT_TYPES[type].name} ${rank}★`, 1200);
    this.showToast(this.getUnitCommandDescription(type, targets.length));
    this.updateCommandChipStates();
  }

  applyUnitCommandEffect(unit, type) {
    if (type === 'ember') unit.streak = Math.max(unit.streak || 0, 4);
    if (type === 'frost') {
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && enemy.group.position.distanceTo(unit.group.position) <= 9.5) {
          enemy.slowTimer = Math.max(enemy.slowTimer, 2.4);
          enemy.slowFactor = .48;
        }
      });
    }
    if (type === 'wind') unit.commandPierceBonus = 3;
    if (type === 'stone') unit.commandSplashBonus = 1.45;
    if (type === 'bell') unit.commandChainBonus = 3;
    if (type === 'thunder') unit.commandExecuteBonus = .1;
  }

  getUnitCommandDescription(type, count) {
    const descriptions = {
      ember: `${count}기의 연속 공격이 즉시 달아오릅니다.`,
      frost: `${count}기가 주변 요괴를 얼리고 둔화를 강화합니다.`,
      wind: `${count}기의 관통 수가 증가합니다.`,
      stone: `${count}기의 폭발 범위가 크게 넓어집니다.`,
      bell: `${count}기의 연쇄 대상이 증가합니다.`,
      thunder: `${count}기의 처형 기준이 높아집니다.`
    };
    return descriptions[type] || `${count}기의 수호대가 강화됩니다.`;
  }

  updateCommandChipStates() {
    const cooldown = Math.max(0, this.commandCooldown || 0);
    ui.unitStrip.querySelectorAll('[data-command-key]').forEach((button) => {
      const key = button.dataset.commandKey;
      const activeUnits = this.units.filter((unit) => !unit.showcase && `${unit.type}-${unit.rank}` === key && unit.commandTimer > 0);
      const status = button.querySelector('[data-command-status]');
      const activeTime = activeUnits.length ? Math.max(...activeUnits.map((unit) => unit.commandTimer)) : 0;
      button.classList.toggle('command-active', activeTime > 0);
      button.classList.toggle('command-cooling', cooldown > 0 && activeTime <= 0);
      button.classList.toggle('command-ready', cooldown <= 0 && activeTime <= 0);
      if (status) status.textContent = activeTime > 0 ? `집중 ${activeTime.toFixed(1)}초` : cooldown > 0 ? `재충전 ${Math.ceil(cooldown)}초` : '눌러 집중 명령';
    });
  }

  updateUnitStrip() {
    const groups={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{const key=`${unit.type}-${unit.rank}`;groups[key]=(groups[key]||0)+1;});
    const entries=Object.entries(groups).sort((a,b)=>Number(b[0].split('-')[1])-Number(a[0].split('-')[1])).slice(0,6);
    ui.unitStrip.innerHTML=entries.map(([key,count])=>{
      const [type,rankString]=key.split('-');const rank=Number(rankString);const config=UNIT_TYPES[type];const color=`#${config.color.toString(16).padStart(6,'0')}`;
      const mergeStatus=rank===5?`궁극 · ${config.ultimateName}`:`합성 ${Math.min(count,2)}/3`;
      return `<button type="button" class="unit-chip ${rank===5?'mythic':''}" data-command-key="${key}" style="--chip:${color}33;--unit-color:${color}"><span class="unit-face">${config.symbol}</span><div><b>${config.name}</b><small class="stars">${'★'.repeat(rank)}</small><small class="merge-status">${mergeStatus}</small><small class="command-status" data-command-status>눌러 집중 명령</small></div><b>×${count}</b></button>`;
    }).join('');
    this.updateCommandChipStates();
  }

  updateKillChain(dt) {
    if (this.killChainTimer <= 0) return;
    this.killChainTimer = Math.max(0, this.killChainTimer - dt);
    if (this.killChainTimer === 0) {
      this.killChain = 0;
      ui.killChain.classList.add('hidden');
    }
  }

  updateBossHUD() {
    const boss = this.enemies.find((enemy) => enemy.boss && !enemy.dead);
    if (!boss) {
      ui.bossHealth.classList.add('hidden');
      ui.bossDangerFrame.classList.add('hidden');
      ui.bossDangerFrame.dataset.urgency = 'stable';
      document.body.classList.remove('boss-active');
      if (ui.bossBreakProgress) ui.bossBreakProgress.style.width = '0%';
      if (ui.bossBreakValue) ui.bossBreakValue.textContent = '0%';
      if (ui.bossBreakState) ui.bossBreakState.textContent = '원소 반응과 치명타로 파훼';
      ui.bossHealth.querySelector('.boss-health-track')?.setAttribute('aria-valuenow', '0');
      ui.bossHealth.querySelector('.boss-health-track')?.setAttribute('aria-valuetext', '보스 체력 0%');
      ui.bossBreak?.setAttribute('aria-valuenow', '0');
      ui.bossBreak?.setAttribute('aria-valuetext', '보스 파훼 0%');
      return;
    }
    const percent = clamp(boss.hp / boss.maxHp, 0, 1);
    const breakState = this.bossBreak.getState(boss);
    const breakGauge = clamp(breakState?.gauge || 0, 0, 100);
    ui.bossBreakProgress.style.width = `${breakState?.staggerRemaining > 0 ? 100 : breakGauge}%`;
    ui.bossBreakValue.textContent = breakState?.staggerRemaining > 0 ? `${breakState.staggerRemaining.toFixed(1)}s` : `${Math.round(breakGauge)}%`;
    ui.bossBreak.setAttribute('aria-valuenow', String(Math.round(breakState?.staggerRemaining > 0 ? 100 : breakGauge)));
    ui.bossBreak.setAttribute('aria-valuetext', breakState?.staggerRemaining > 0 ? `보스 파훼 완료, 경직 ${breakState.staggerRemaining.toFixed(1)}초` : `보스 파훼 ${Math.round(breakGauge)}%`);
    ui.bossBreakState.textContent = breakState?.staggerRemaining > 0 ? '균형 붕괴 · 받는 피해 +22%' : breakState?.immunityRemaining > 0 ? `재정비 ${breakState.immunityRemaining.toFixed(1)}s` : '원소 반응과 치명타로 파훼';
    ui.bossBreak.classList.toggle('staggered', breakState?.staggerRemaining > 0);
    ui.bossBreak.classList.toggle('immune', breakState?.immunityRemaining > 0 && breakState?.staggerRemaining <= 0);
    const intentName = this.getBossIntentName(boss);
    const hudState = getBossHudState(boss, intentName);
    ui.bossHealthName.textContent = ENEMY_TYPES[boss.type].name;
    const bossHealthPercent = Math.ceil(percent * 100);
    ui.bossHealthValue.textContent = `${bossHealthPercent}%`;
    ui.bossHealthProgress.style.width = `${percent * 100}%`;
    const bossHealthTrack = ui.bossHealth.querySelector('.boss-health-track');
    bossHealthTrack?.setAttribute('aria-valuenow', String(bossHealthPercent));
    bossHealthTrack?.setAttribute('aria-valuetext', `${ENEMY_TYPES[boss.type].name} 체력 ${bossHealthPercent}%`);
    ui.bossPhase.textContent = `PHASE ${hudState.phase}`;
    ui.bossIntentLabel.textContent = `다음 공격 · ${intentName}`;
    ui.bossIntentType.textContent = `${hudState.type.label} 패턴`;
    ui.bossIntentTime.textContent = `${hudState.timer.toFixed(1)}s`;
    ui.bossIntentProgress.style.width = `${(1 - hudState.progress) * 100}%`;
    ui.bossIntent.style.setProperty('--boss-intent-color', hudState.type.color);
    ui.bossIntent.dataset.urgency = hudState.urgency;
    ui.bossDangerFrame.dataset.urgency = hudState.urgency;
    ui.bossDangerFrame.classList.toggle('hidden', hudState.urgency === 'stable');
    const iconUrl = new URL(hudState.type.icon, document.baseURI);
    iconUrl.searchParams.set('v', GAME_VERSION);
    ui.bossIntentIcon.src = iconUrl.href;
    ui.bossHealth.classList.remove('hidden');
    document.body.classList.add('boss-active');
  }

  updateStageHUD() {
    const state = getStageProgress(this.currentWave, this.maxWaves);
    ui.stageIcon.textContent = state.zone.icon;
    const act = this.campaign?.current;
    ui.stageName.textContent = act ? `${act.icon} ${act.name}` : state.stage.name;
    ui.stageZone.textContent = act ? `ACT ${act.index} · ${state.zone.name} · ${state.zone.copy}` : `${state.zone.name} · ${state.zone.copy}`;
    ui.stageProgress.style.width = `${Math.round(state.progress * 100)}%`;
    ui.stageChip.style.setProperty('--stage-accent', state.stage.accent);
  }

  updateHUD() {
    if (!this.coreHp && this.coreHp!==0) return;
    ui.hp.textContent=Math.ceil(this.coreHp);
    const coreHpRatioV120 = clamp(this.coreHp / Math.max(1, this.coreMaxHp), 0, 1);
    if (ui.coreHpProgressV120) ui.coreHpProgressV120.style.width = `${(coreHpRatioV120 * 100).toFixed(1)}%`;
    if (ui.corePillV120) ui.corePillV120.dataset.hpState = coreHpRatioV120 <= .28 ? 'critical' : (coreHpRatioV120 <= .58 ? 'warning' : 'stable');
    ui.gold.textContent=Math.floor(this.gold);
    ui.waveLabel.textContent=this.currentWave?`WAVE ${this.currentWave} / ${this.maxWaves} · ${this.activeRunMode.icon}`:`${this.activeRunMode.icon} WAVE 준비`;
    const alive=this.enemies.length;
    const progress=this.waveActive?1-(this.spawnRemaining+alive)/Math.max(1,this.spawnTotal*1.18):0;
    ui.waveProgress.style.width=`${clamp(progress*100,0,100)}%`;
    const eliteAlive = this.enemies.filter((enemy) => enemy.elite && !enemy.dead).length;
    ui.enemyCount.textContent=this.waveActive?`남은 요괴 ${this.spawnRemaining+alive}${eliteAlive ? ` · 정예 ${eliteAlive}` : ''}`:`${this.currentWave+1}번째 습격 준비`;
    ui.luckValue.textContent=`${Math.floor(this.luck)}%`;
    ui.luckProgress.style.width=`${clamp(this.luck,0,100)}%`;
    ui.summonCost.textContent=this.getSummonCost();
    ui.summonTicket.textContent=`선택권 ×${this.choiceTickets||0}`;
    ui.summonTicket.classList.toggle('hidden',!(this.choiceTickets>0));
    const summonLocked = this.waveActive && this.activeContract?.id === 'summonSeal';
    ui.summon.disabled=this.gold<this.getSummonCost() || summonLocked;
    ui.summon.title = summonLocked ? '강림 봉인 계약 중' : '';
    ui.dashCooldown.textContent=this.player?.dashCooldown>0?`${this.player.dashCooldown.toFixed(1)}s`:'준비';
    ui.skillCooldown.textContent=this.player?.skillCooldown>0?`${this.player.skillCooldown.toFixed(1)}s`:'준비';
    ui.dash.classList.toggle('cooling',this.player?.dashCooldown>0);
    ui.skill.classList.toggle('cooling',this.player?.skillCooldown>0);
    ui.wave.disabled=this.waveActive||this.currentWave>=this.maxWaves;
    if (this.autoWaveCountdown > 0 && !this.waveActive) this.updateAutoWaveButton();
    else {
      ui.waveText.textContent=this.waveActive?'전투중':this.currentWave===0?'시작':`${this.currentWave+1}`;
      ui.wave.setAttribute('aria-label', this.waveActive ? '현재 습격 전투 중' : '다음 습격 시작');
    }
    ui.moonWardValue.textContent = `${this.moonWard}/3`;
    ui.moonWard.classList.toggle('charged', this.moonWard > 0);
    ui.jackpot.classList.toggle('hidden', this.jackpotTimer <= 0);
    ui.jackpotTime.textContent = this.jackpotTimer > 0 ? `${this.jackpotTimer.toFixed(1)}s` : '0.0s';
    const burstActive = this.guardianBurstTimer > 0;
    ui.burstValue.textContent = burstActive ? `${this.guardianBurstTimer.toFixed(1)}s` : `${Math.floor(this.soulGauge)}%`;
    ui.burstProgress.style.width = `${burstActive ? 100 : clamp(this.soulGauge, 0, 100)}%`;
    ui.burstState.textContent = burstActive ? '폭주 중' : this.soulGauge >= 100 ? '발동 가능' : '혼불 충전';
    ui.burst.disabled = burstActive || this.soulGauge < 100;
    ui.burst.classList.toggle('ready', !burstActive && this.soulGauge >= 100);
    ui.burst.classList.toggle('active', burstActive);
    const mythicMomentum = this.battleMomentum.diagnostics;
    ui.momentumValue.textContent = mythicMomentum.active ? `${mythicMomentum.overdriveRemaining.toFixed(1)}s` : `${Math.floor(mythicMomentum.gauge)}%`;
    ui.momentumProgress.style.width = `${mythicMomentum.active ? 100 : clamp(mythicMomentum.gauge, 0, 100)}%`;
    ui.momentumState.textContent = mythicMomentum.active ? '신명 폭주 · 피해 +22% · 전리품 +14%' : '반응과 연속 처치로 충전';
    ui.momentumMeter.classList.toggle('active', mythicMomentum.active);
    this.updateCommandChipStates();
    this.updateCouncilHUD();
    this.updateStageHUD();
    this.updateBossHUD();
  }

  showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add('show');
    this.scheduleUi(() => ui.toast.classList.remove('show'), 1800, { key: 'toast-hide' });
  }

  showCombo(message, duration = 1100) {
    this.lifecycle.ui.cancel('combo-hide');
    this.lifecycle.ui.cancel('combo-collapse');
    ui.comboText.textContent = message;
    ui.combo.classList.remove('hidden');
    requestAnimationFrame(() => ui.combo.classList.add('show'));
    this.scheduleUi(() => {
      ui.combo.classList.remove('show');
      this.scheduleUi(() => ui.combo.classList.add('hidden'), 250, { key: 'combo-collapse' });
    }, duration, { key: 'combo-hide' });
  }

  exportPerformanceLog() {
    const payload = {
      exportedAt: new Date().toISOString(),
      gameVersion: GAME_VERSION,
      lineageVersion: LEGACY_LINEAGE_VERSION,
      buildId: BUILD_ID,
      cacheRevision: CACHE_REVISION,
      engineVersion: ENGINE_VERSION,
      coreFoundation: this.coreFoundation?.diagnostics || {},
      run: {
        seed: this.runSeed || '',
        seedMode: this.selectedSeedModeId,
        edict: this.dailyEdict?.id || '',
        mode: this.activeRunMode?.id || this.selectedRunModeId,
        wave: this.currentWave || 0,
        active: Boolean(this.waveActive),
        score: Math.round(this.score || 0),
        stats: this.runStats
      },
      renderer: {
        qualityScale: this.engine.qualityScale,
        effectBudgetScale: this.engine.effectBudgetScale,
        fps: this.engine.monitor.lastFps,
        assetQualityTier: this.engine.assetQualityTier,
        lowPower: this.lowPower,
        performance: this.engine.monitor.snapshot
      },
      diagnostics: {
        engine: this.engine.diagnostics,
        hudLayout: this.hudLayout?.getReport() || null,
        assets: this.assetPipeline?.diagnostics || null,
        chunks: this.engine.worldChunks.diagnostics,
        animations: this.animations?.diagnostics || null,
        lifecycle: this.lifecycle.diagnostics,
        artProduction: ART_PRODUCTION_SUMMARY,
        goldenSliceCertification: GOLDEN_SLICE_CERTIFICATION_SUMMARY,
        cameraProfile: { id: this.activeCameraProfile?.id || this.controlSettings.cameraProfile, distance: this.cameraDistance, target: this.cameraDistanceTarget, fov: this.camera?.fov || 0 },
        characterDNA: CHARACTER_DNA_SUMMARY,
        heroArchetypes: HERO_ARCHETYPE_SUMMARY,
        assetForge: IP_ASSET_LIBRARY_V15,
        spriteAtlas: this.battlefieldSprites?.diagnostics || {},
        battlefieldProps: this.battlefieldProps?.diagnostics || {},
        runtimeVisualAudit: this.runtimeVisualAudit || null,
        waveFlow: this.waveFlowGuard?.diagnostics || {},
        reliability: this.waveReliability?.diagnostics || {},
        browserReliability: this.browserReliability?.report || {},
        runtimeErrors: { count: this.runtimeErrors.length, last: this.runtimeErrors.at(-1) || null },
        battlefieldEvent: this.battlefieldEvents?.diagnostics || {},
        cameraDirector: this.cameraDirectorV16?.snapshot || {},
        activeHeroPassive: this.activeHeroPassive || null,
        qualityGovernor: this.engine.qualityGovernor?.diagnostics || null,
        frameScheduler: this.frameScheduler.diagnostics,
        encounterDirector: this.encounterDirector.diagnostics,
        combatTelemetry: this.combatTelemetry.snapshot,
        statusEffects: this.statusEffects.diagnostics,
        runtimeBudget: this.runtimeBudget.diagnostics,
        reactions: this.elementalReactions?.diagnostics,
        momentum: this.battleMomentum?.diagnostics,
        bossEscalation: this.bossEscalation?.diagnostics,
        bossBreak: this.bossBreak?.diagnostics,
        campaign: this.campaign?.diagnostics,
        guardianCouncil: this.guardianCouncil,
        saveMigration: this.saveMigration
      },
      progression: {
        heroClass: this.selectedHeroClassId,
        councilSupport: this.selectedCouncilSupportId,
        mastery: getHeroMasteryEntry(this.heroMastery, this.selectedHeroClassId),
        equipment: { equipped: { ...this.equipmentState.equipped }, upgrades: { ...(this.equipmentState.upgrades || {}) }, ownedCount: this.equipmentState.owned.length, essence: this.equipmentState.essence, forged: this.equipmentState.forged || 0 }
      },
      settings: this.controlSettings,
      viewport: { width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio || 1 },
      userAgent: navigator.userAgent
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dokkaebi-reliability-${this.runSeed || 'title'}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    this.lifecycle.system.schedule(() => URL.revokeObjectURL(url), 1000);
    this.showToast('성능·웨이브 진단 JSON을 저장했습니다.');
  }

  pauseGame({ automatic = false } = {}) {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.autoPausedByVisibility = Boolean(automatic);
    if (!automatic) this.showModal(ui.pauseModal);
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), automatic ? 'auto-pause-background' : 'manual-pause');
  }

  resumeGame({ automatic = false } = {}) {
    if (this.state !== 'paused') return;
    if (ui.pauseModal.classList.contains('visible')) this.hideModal(ui.pauseModal);
    this.state = 'playing';
    this.clock.getDelta();
    this.autoPausedByVisibility = false;
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), automatic ? 'auto-resume-background' : 'manual-resume');
  }

  finishRun(won) {
    if (this.state === 'result') return;
    this.waveReliability.noteProgress(this.getWaveFlowSnapshot(), won ? 'run-finished-win' : 'run-finished-loss');
    this.lifecycle.endRun();
    this.resetTransientUi();
    this.state = 'result';this.waveActive=false;this.cinematic=null;this.showGameUI(false);
    ui.evolution.classList.remove('show');ui.evolution.classList.add('hidden');
    ui.bossHealth.classList.add('hidden');
    ui.bossDangerFrame.classList.add('hidden');
    document.body.classList.remove('boss-active');
    ui.killChain.classList.add('hidden');
    ui.mission.classList.remove('show');
    ui.mission.classList.add('hidden');
    won?this.sound.win():this.sound.fail();
    if(won)this.score+=5000+Math.round(this.coreHp*30);
    ui.resultKicker.textContent=won?'MOON MARKET SAVED':'THE TREE HAS FALLEN';
    ui.resultTitle.textContent=won?'달빛 장터 수호 성공!':'신목을 지키지 못했습니다';
    ui.resultScore.textContent=Math.round(this.score).toLocaleString();
    ui.resultKills.textContent=this.kills.toLocaleString();
    ui.resultRank.textContent=`${this.maxRank}★`;
    const summary={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{summary[unit.type]=Math.max(summary[unit.type]||0,unit.rank);});
    ui.resultUnits.innerHTML=Object.entries(summary).map(([type,rank])=>`<span class="result-unit">${UNIT_TYPES[type].symbol} ${UNIT_TYPES[type].name} ${'★'.repeat(rank)}</span>`).join('')||'<span class="result-unit">소환 기록 없음</span>';
    const damageEntries = Object.entries(this.runStats.damageByType).sort((a,b)=>b[1]-a[1]);
    const [topType, topDamage] = damageEntries[0] || [null, 0];
    ui.resultAnalysis.innerHTML = `
      <div><span>최고 피해</span><b>${topType && topDamage > 0 ? `${UNIT_TYPES[topType].symbol} ${UNIT_TYPES[topType].name}` : '대장 깨비'}</b><small>${Math.round(topDamage || this.runStats.heroDamage).toLocaleString()} 피해</small></div>
      <div><span>집중 명령</span><b>${this.runStats.commandsUsed}회</b><small>${Math.round(this.runStats.commandDamage).toLocaleString()} 강화 피해</small></div>
      <div><span>이동·수집</span><b>${this.runStats.moveOrders}회 지정</b><small>엽전 ${Math.round(this.runStats.coinsCollected).toLocaleString()} · 회피 ${this.runStats.dangerDodges}</small></div>
      <div><span>월식 전과</span><b>보스 ${this.runStats.bossKills} · 정예 ${this.runStats.eliteKills}</b><small>결계 방어 ${this.runStats.wardBlocks}회 · 대박 폭주 ${this.runStats.jackpotTriggers}회</small></div>
      <div><span>원정 기록</span><b>${this.activeRunMode.icon} ${this.activeRunMode.name}</b><small>도전 ${this.runStats.trialsCompleted}회 · 유물 ${this.runStats.relicsChosen}개 · 세트 ${this.runStats.relicSetsActivated}</small></div>
      <div><span>위험 패턴</span><b>회피 ${this.runStats.dangerDodges}회</b><small>파열 회피 ${this.runStats.eliteBurstDodges} · 피격 ${this.runStats.eliteBurstHits} · 보스 피격 ${this.runStats.bossHazardHits}</small></div>
      <div><span>수호신 폭주</span><b>${this.runStats.guardianBursts}회</b><small>최대 연속 처치 ${this.runStats.maxKillChain} · 질주 ${this.runStats.dashUses}회</small></div>
      <div><span>도감 연구</span><b>발견 ${this.runStats.codexDiscoveries} · 전리품 ${this.runStats.codexDrops}</b><small>약점 해독 ${this.runStats.weaknessUnlocks} · 약점 공격 ${this.runStats.weaknessHits.toLocaleString()}회</small></div>
      <div><span>수호 의회</span><b>${this.guardianCouncil.bond.icon} ${this.guardianCouncil.bond.name}</b><small>${this.guardianCouncil.support.name} · 캠페인 ACT ${this.runStats.actsCleared}/4</small></div>
      <div><span>보스 파훼</span><b>BREAK ${this.runStats.bossBreaks}회</b><small>장비 단조 누적 ${this.equipmentState.forged || 0}회 · 정수 ${this.equipmentState.essence || 0}</small></div>
      <div><span>원정 시드</span><b>${this.runSeed}</b><small>${this.dailyEdict.icon} ${this.dailyEdict.name} · ${this.selectedSeedModeId === 'daily' ? '오늘의 원정' : '자유 원정'}</small></div>`;
    const shardReward = this.awardRunShards(won);
    const persistentReward = this.awardPersistentProgress(won);
    ui.resultShards.textContent = `+${shardReward}`;
    ui.resultShardsTotal.textContent = this.metaProgress.shards.toLocaleString();
    ui.resultEquipmentReward.innerHTML = persistentReward.drop ? `<span style="--rarity:${EQUIPMENT_RARITIES[persistentReward.drop.item.rarity].color}">${equipmentIconMarkup(persistentReward.drop.item, 'reward-sprite')}</span><div><small>${persistentReward.drop.duplicate ? '중복 장비 분해' : '새 장비 획득'}</small><b>${persistentReward.drop.item.name}</b><em>${persistentReward.drop.duplicate ? `장비 정수 +${persistentReward.drop.essence}` : persistentReward.drop.item.desc}</em></div>` : '<span>–</span><div><small>장비 보상</small><b>웨이브 3부터 획득</b><em>더 깊은 원정에서 장비를 발견하세요.</em></div>';
    ui.resultMasteryReward.innerHTML = `<span>Lv.${persistentReward.mastery.entry.level}</span><div><small>${this.heroClass.name} 숙련</small><b>숙련 경험치 +${persistentReward.mastery.gained}</b><em>${persistentReward.mastery.levelsGained ? `${persistentReward.mastery.levelsGained}레벨 상승!` : `원정 ${persistentReward.mastery.entry.runs}회 누적`}</em></div>`;
    this.renderLeaderboard(this.getLocalScores());
    this.scheduleUi(() => { if (this.state === 'result') this.showModal(ui.resultModal); }, 700, { key: 'result-modal-show' });
  }

  awardPersistentProgress(won) {
    if (this.progressRewarded) {
      return { mastery: { gained: 0, levelsGained: 0, entry: getHeroMasteryEntry(this.heroMastery, this.selectedHeroClassId) }, drop: null };
    }
    this.progressRewarded = true;
    const mastery = awardHeroMastery(this.heroMastery, this.selectedHeroClassId, { wave: this.currentWave, won });
    this.heroMastery = saveHeroMastery(mastery.state);
    let drop = null;
    if (this.currentWave >= 3) {
      drop = awardEquipmentDrop(this.equipmentState, { wave: this.currentWave, won, random: () => this.random() });
      this.equipmentState = saveEquipmentState(drop.state);
    }
    this.renderHeroClassSelector();
    this.renderEquipmentModal();
    return { mastery, drop };
  }

  getLocalScores() {
    try{return JSON.parse(localStorage.getItem('dokkaebi-luck-scores')||'[]');}catch{return[];}
  }

  async saveScore() {
    const name=(ui.playerName.value.trim()||'달빛 수호자').slice(0,12);
    const entry={name,score:Math.round(this.score),wave:this.currentWave,kills:this.kills,maxRank:this.maxRank,mode:this.activeRunMode.id,seed:this.runSeed,edict:this.dailyEdict?.id||'',bossKills:this.runStats.bossKills,date:Date.now()};
    const local=[...this.getLocalScores(),entry].sort((a,b)=>b.score-a.score).slice(0,10);
    localStorage.setItem('dokkaebi-luck-scores',JSON.stringify(local));
    ui.saveScore.disabled=true;ui.saveScore.textContent='저장 완료';
    let scores=local;
    if(isFirebaseEnabled()) {
      try { await submitOnlineScore(entry);scores=await loadOnlineScores();this.showToast('온라인 달빛 명부에 기록했습니다.'); }
      catch { this.showToast('로컬 기록으로 저장했습니다.'); }
    } else this.showToast('기기에 기록을 저장했습니다.');
    this.renderLeaderboard(scores);
  }

  renderLeaderboard(scores) {
    const list=(scores||[]).slice(0,5);
    ui.leaderboard.innerHTML=`<h3>달빛 명부 TOP 5</h3>${list.length?list.map((entry,index)=>`<div class="rank-row"><span>${index+1}</span><span>${this.escapeHtml(entry.name)}</span><span>${Number(entry.score).toLocaleString()}</span></div>`).join(''):'<div class="rank-row"><span>–</span><span>첫 기록을 남겨보세요</span><span>0</span></div>'}`;
  }

  escapeHtml(value) {return String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

  getRenderPixelRatio() {
    return this.engine.pixelRatio();
  }

  updateAdaptiveQuality(dt) {
    if (this.state !== 'playing') return;
    const result = this.engine.updateAdaptiveQuality(dt);
    if (!result) return;
    this.qualityScale = this.engine.qualityScale;
    ui.qualityBadge.textContent = `Engine ${ENGINE_VERSION} ${result.id.toUpperCase()} · ${Math.round(result.fps)} FPS · 해상도 ${Math.round(this.qualityScale * 100)}% · FX ${Math.round(this.engine.effectBudgetScale * 100)}%`;
    ui.qualityBadge.classList.remove('hidden');
    this.scheduleUi(() => ui.qualityBadge.classList.add('hidden'), 2400, { key: 'quality-badge-hide' });
    this.qualityAdjusted = true;
  }

  updateBlobShadows() {
    if (!this.blobShadows || !this.worldReady) return;
    const entries = [];
    if (this.player?.group && this.player.group.visible !== false) entries.push({ position: this.player.group.position, radius: .78 });
    for (const unit of this.units) {
      if (!unit?.group || unit.group.visible === false) continue;
      entries.push({ position: unit.group.position, radius: .68 + unit.rank * .07 });
    }
    for (const enemy of this.enemies) {
      if (!enemy?.group || enemy.dead || enemy.group.visible === false) continue;
      entries.push({ position: enemy.group.position, radius: .58 * (enemy.group.userData.scale || 1) });
    }
    this.blobShadows.update(entries);
  }

  applyViewportUiProfile() {
    const width = Math.max(1, window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 1);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 1);
    const compact = width <= 540 || height <= 720;
    const ultraCompact = height <= 610 || (width <= 390 && height <= 680);
    const landscapeCompact = width > height && height <= 560;
    document.body.classList.toggle('ui-compact', compact);
    document.body.classList.toggle('ui-ultra-compact', ultraCompact);
    document.body.classList.toggle('ui-landscape-compact', landscapeCompact);
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    this.viewportProfile = ultraCompact ? 'ultra' : compact ? 'compact' : 'standard';
    this.hudLayout?.refresh({ width, height });
    this.syncHudLayoutButton();
  }

  cycleHudDensity() {
    const mode = this.hudLayout?.cycleMode() || 'auto';
    this.controlSettings.autoHudLayout = mode === 'auto';
    this.saveControlSettings();
    this.renderControlSettings();
    this.syncHudLayoutButton();
    this.showToast(`HUD 정보 표시 · ${this.hudLayout?.getModeLabel() || '자동'}`);
  }

  syncHudLayoutButton() {
    if (!ui.hudLayout || !this.hudLayout) return;
    const label = this.hudLayout.getModeLabel();
    const icon = this.hudLayout.mode === 'minimal' ? '▤' : this.hudLayout.mode === 'full' ? '▦' : '◫';
    ui.hudLayout.querySelector('span')?.replaceChildren(document.createTextNode(icon));
    ui.hudLayout.setAttribute('aria-label', `HUD 정보 표시: ${label}`);
    ui.hudLayout.title = `HUD 정보 표시 · ${label}`;
    ui.hudLayout.dataset.mode = this.hudLayout.mode;
  }

  onResize() {
    this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();
    this.engine.resize(window.innerWidth, window.innerHeight);
    this.applyViewportUiProfile();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    for (const waiter of this.renderFrameWaiters.splice(0)) {
      this.lifecycle.ui.cancel(waiter.timer);
      waiter.resolve(false);
    }
    this.firstPresentation?.dispose?.();
    this.clearTransientVisuals();
    this.lifecycle?.dispose();
    const disposables = [
      this.releaseAssuranceV124,
      this.actionAssetAssuranceV125,
      this.bossEncounterAssuranceV126,
      this.assetRefinementV129,
      this.battlefieldVisibilityV128,
      this.bossTacticalAssuranceV127,
      this.battlefieldClarityV122,
      this.liveCombatV121,
      this.crossPlatformShellV112,
      this.mobileHudV23,
      this.hudLayout,
      this.assetPresence,
      this.browserReliability,
      this.combatReadability,
      this.combatPresentation,
      this.combatVisualV112,
      this.productionConsole,
      this.renderStatsHud,
      this.blobShadows,
      this.assetPipeline,
      this.codexViewer
    ];
    for (const disposable of disposables) {
      try { disposable?.dispose?.(); } catch (error) { console.warn('[DokkaebiLuckDefense3D] dispose warning', error); }
    }
    for (const geometry of this.geometryCache?.values?.() || []) {
      try { geometry?.dispose?.(); } catch {}
    }
    this.geometryCache?.clear?.();
    this.particleGeometry?.dispose?.();
    this.renderer?.renderLists?.dispose?.();
    this.renderer?.dispose?.();
    if (window.__DOKKAEBI_GAME__ === this) delete window.__DOKKAEBI_GAME__;
  }

  animate() {
    if (this.disposed) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    const dt = Math.min(.033, this.clock.getDelta());
    this.frameScheduler.tick(dt);
    this.coreFoundation.sampleFrame(dt, { state: this.state, hidden: document.hidden });
    this.runSafe('combat-presentation', () => this.combatPresentation?.update(dt));
    const impactScale = this.combatPresentation?.timeScale ?? 1;
    const gameDt = (this.cinematic ? dt * .42 : dt) * impactScale;
    this.elapsed += dt;

    this.runSafe('world-effects', () => this.updateWorldEffects(dt));
    this.runSafe('battlefield-sprites', () => this.battlefieldSprites?.update(this.elapsed));
    this.runSafe('battlefield-props', () => this.updateBattlefieldProps(dt));
    this.runSafe('wave-flow-guard', () => this.updateWaveFlowGuard(dt));
    this.runSafe('wave-reliability', () => this.updateWaveReliability(dt));
    if (this.frameScheduler.shouldRun('browser-reliability', this.coreFoundation.cadence('browser-reliability', 4, { minHz: 1.5 }))) this.runSafe('browser-reliability', () => this.browserReliability?.update(dt, this.getBrowserReliabilitySnapshot()));
    if (this.frameScheduler.shouldRun('asset-presence-v21', this.coreFoundation.cadence('asset-presence-v21', 4, { minHz: 1.5 }))) this.runSafe('asset-presence-v21', () => this.assetPresence?.update(dt, {
      heroes: this.player ? 1 : 0,
      monsters: this.enemies.filter((enemy) => !enemy.dead && !enemy.boss).length,
      bosses: this.enemies.filter((enemy) => !enemy.dead && enemy.boss).length,
      projectiles: this.projectiles.length,
      hazards: this.hazards.length,
      battlefieldSprites: this.battlefieldSprites?.diagnostics?.activeSprites || 0
    }));
    if (this.frameScheduler.shouldRun('cross-platform-shell-v112', this.coreFoundation.cadence('cross-platform-shell-v112', 12, { minHz: 4, criticalScale: .7 }))) this.runSafe('cross-platform-shell-v112', () => this.crossPlatformShellV112?.update(dt));
    if (this.frameScheduler.shouldRun('mobile-hud-v23', this.coreFoundation.cadence('mobile-hud-v23', 24, { minHz: 12, criticalScale: .65 }))) this.runSafe('mobile-hud-v23', () => this.mobileHudV23?.update(dt));
    this.runSafe('automation-v22', () => this.updateAutomationV22(dt));
    this.runSafe('combat-readability-v21', () => this.combatReadability?.update(dt, { enemies: this.enemies, state: this.state }));
    if (this.frameScheduler.shouldRun('live-combat-v121', this.coreFoundation.cadence('live-combat-v121', 5, { minHz: 3, criticalScale: .8 }))) this.runSafe('live-combat-v121', () => this.liveCombatV121?.update(dt, {
      enemies: this.enemies,
      projectiles: this.projectiles.length,
      particles: this.particles.length,
      hazards: this.hazards.length,
      bossActive: this.enemies.some((enemy) => !enemy.dead && enemy.boss),
      performance: this.engine.monitor.snapshot
    }));
    if (this.frameScheduler.shouldRun('battlefield-clarity-v122', this.coreFoundation.cadence('battlefield-clarity-v122', 6, { minHz: 3, criticalScale: .78 }))) this.runSafe('battlefield-clarity-v122', () => this.battlefieldClarityV122?.update(dt, {
      liveCombat: this.liveCombatV121?.report || {},
      performance: this.engine.monitor.snapshot,
      fps: this.engine.monitor.lastFps,
      enemies: this.enemies.length,
      units: this.units.length
    }));
    if (this.frameScheduler.shouldRun('release-assurance-v124', this.coreFoundation.cadence('release-assurance-v124', 4, { minHz: 2, criticalScale: .7 }))) this.runSafe('release-assurance-v124', () => this.releaseAssuranceV124?.update(dt, {
      state: this.state,
      performance: this.engine.monitor.snapshot
    }));
    if (this.frameScheduler.shouldRun('action-asset-assurance-v125', this.coreFoundation.cadence('action-asset-assurance-v125', 4, { minHz: 2, criticalScale: .7 }))) this.runSafe('action-asset-assurance-v125', () => this.actionAssetAssuranceV125?.update(dt, {
      state: this.state,
      wave: this.currentWave,
      enemies: this.enemies.filter((enemy) => !enemy.dead).length,
      units: this.units.length + (this.player ? 1 : 0),
      particles: this.particles.length,
      projectiles: this.projectiles.length,
      performance: this.engine.monitor.snapshot
    }));
    if (this.frameScheduler.shouldRun('boss-encounter-assurance-v126', this.coreFoundation.cadence('boss-encounter-assurance-v126', 5, { minHz: 2.5, criticalScale: .78 }))) this.runSafe('boss-encounter-assurance-v126', () => {
      const bossV126 = this.enemies.find((enemy) => enemy.boss && !enemy.dead) || null;
      const intentV126 = bossV126 ? getBossHudState(bossV126, this.getBossIntentName(bossV126)) : null;
      this.bossEncounterAssuranceV126?.update(dt, {
        state: this.state,
        wave: this.currentWave,
        boss: bossV126 ? {
          hp: bossV126.hp,
          maxHp: bossV126.maxHp,
          phase: bossV126.bossPhase,
          intentUrgency: intentV126?.urgency || 'stable',
          intentRemaining: intentV126?.timer || 0
        } : null,
        hazards: this.hazards,
        enemies: this.enemies.filter((enemy) => !enemy.dead).length,
        units: this.units.length + (this.player ? 1 : 0),
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        performance: this.engine.monitor.snapshot
      });
    });
    if (this.frameScheduler.shouldRun('boss-tactical-assurance-v127', this.coreFoundation.cadence('boss-tactical-assurance-v127', 10, { minHz: 5, criticalScale: .82 }))) this.runSafe('boss-tactical-assurance-v127', () => {
      const bossV127 = this.enemies.find((enemy) => enemy.boss && !enemy.dead) || null;
      const intentV127 = bossV127 ? getBossHudState(bossV127, this.getBossIntentName(bossV127)) : null;
      this.bossTacticalAssuranceV127?.update(dt, {
        state: this.state,
        wave: this.currentWave,
        camera: this.camera,
        player: this.player?.group || null,
        boss: bossV127 ? {
          hp: bossV127.hp,
          maxHp: bossV127.maxHp,
          phase: bossV127.bossPhase,
          intentUrgency: intentV127?.urgency || 'stable',
          intentRemaining: intentV127?.timer || 0,
          position: bossV127.group?.position || bossV127.position || null
        } : null,
        hazards: this.hazards,
        enemies: this.enemies.filter((enemy) => !enemy.dead).length,
        units: this.units.length + (this.player ? 1 : 0),
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        performance: this.engine.monitor.snapshot
      });
    });
    if (this.frameScheduler.shouldRun('battlefield-visibility-v128', this.coreFoundation.cadence('battlefield-visibility-v128', 10, { minHz: 5, criticalScale: .82 }))) this.runSafe('battlefield-visibility-v128', () => {
      const occludersV128 = (this.battlefieldProps?.props || []).map((entry) => ({
        id: entry.definition?.id || 'prop',
        position: entry.sprite?.position || null,
        radius: Math.max(.8, Number(entry.definition?.scale || 1) * .52)
      }));
      this.battlefieldVisibilityV128?.update(dt, {
        state: this.state,
        wave: this.currentWave,
        camera: this.camera,
        hazards: this.hazards,
        occluders: occludersV128,
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        fps: this.engine.monitor.lastFps,
        performance: this.engine.monitor.snapshot
      });
    });
    if (this.frameScheduler.shouldRun('asset-refinement-v129', this.coreFoundation.cadence('asset-refinement-v129', 4, { minHz: 2, criticalScale: .72 }))) this.runSafe('asset-refinement-v129', () => {
      this.assetRefinementV129?.update({
        state: this.state,
        wave: this.currentWave,
        hazards: this.hazards,
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        fps: this.engine.monitor.lastFps,
        performance: this.engine.monitor.snapshot
      });
    });
    if (this.frameScheduler.shouldRun('asset-lineage-v131', this.coreFoundation.cadence('asset-lineage-v131', 5, { minHz: 1, criticalScale: .62 }))) this.runSafe('asset-lineage-v131', () => {
      this.assetLineageV131?.update({
        wave: this.currentWave,
        hazards: this.hazards,
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        fps: this.engine.monitor.lastFps
      });
    });
    if (this.frameScheduler.shouldRun('silhouette-assurance-v132', this.coreFoundation.cadence('silhouette-assurance-v132', 5, { minHz: 1, criticalScale: .6 }))) this.runSafe('silhouette-assurance-v132', () => {
      this.silhouetteAssuranceV132?.update({
        wave: this.currentWave,
        hazards: this.hazards,
        directionGroups: this.assetRefinementV129?.directionGroups || [],
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        fps: this.engine.monitor.lastFps
      });
    });

    if (this.frameScheduler.shouldRun('boss-identity-assurance-v133', this.coreFoundation.cadence('boss-identity-assurance-v133', 5, { minHz: 1, criticalScale: .58 }))) this.runSafe('boss-identity-assurance-v133', () => {
      const bossV133 = this.enemies.find((enemy) => enemy?.boss && !enemy.dead) || null;
      this.bossIdentityAssuranceV133?.update({
        wave: this.currentWave,
        boss: bossV133 ? {
          type: bossV133.type,
          phase: bossV133.bossPhase || 1,
          intent: this.getBossIntentName(bossV133)
        } : null,
        hazards: this.hazards,
        directionGroups: this.assetRefinementV129?.directionGroups || [],
        particles: this.particles.length,
        projectiles: this.projectiles.length,
        fps: this.engine.monitor.lastFps
      });
    });


    if (this.state === 'playing') {
      this.runSafe('auto-wave', () => this.updateAutoWaveCountdown(dt));
      this.runSafe('run-momentum', () => this.updateRunMomentum(gameDt));
      this.runSafe('battle-momentum', () => this.updateBattleMomentum(gameDt));
      this.runSafe('player', () => this.updatePlayer(gameDt));
      this.runSafe('wave', () => this.updateWave(gameDt));
      this.runSafe('enemies', () => this.updateEnemies(gameDt));
      this.runSafe('hazards', () => this.updateHazards(gameDt));
      this.runSafe('danger-hint', () => this.updateDangerHint(gameDt));
      this.runSafe('units', () => this.updateUnits(gameDt));
      this.runSafe('projectiles', () => this.updateProjectiles(gameDt));
      this.runSafe('coins', () => this.updateCoins(gameDt));
      this.runSafe('particles', () => this.updateParticles(gameDt));
      this.runSafe('move-marker', () => this.updateMoveTargetMarker(gameDt));
      this.runSafe('kill-chain', () => this.updateKillChain(gameDt));
      this.runSafe('adaptive-quality', () => this.updateAdaptiveQuality(dt));
      this.runSafe('animations', () => this.animations.update(gameDt, this.camera));
      if (this.frameScheduler.shouldRun('hud', this.engine.qualityProfile?.hudHz || 30)) this.runSafe('hud', () => this.updateHUD());
    } else if (this.state === 'title') {
      this.runSafe('title-units', () => this.updateUnits(dt));
      this.runSafe('title-animations', () => this.animations.update(dt, this.camera));
      this.runSafe('title-particles', () => this.updateParticles(dt));
      if (this.player) {
        this.player.group.rotation.y += dt * .18;
        this.player.group.position.y = Math.sin(this.elapsed * 2.3) * .05;
      }
    } else {
      this.runSafe('modal-particles', () => this.updateParticles(dt));
    }

    this.runSafe('combat-art-polish-v114', () => this.combatVisualV112?.update(this.state === 'playing' ? gameDt : dt, this.camera, this.elapsed, { showHealth: this.state === 'playing' }));

    if (this.player?.group && this.worldReady && this.frameScheduler.shouldRun('chunks', this.engine.qualityProfile?.chunkHz || 15)) {
      this.runSafe('world-chunks', () => this.engine.worldChunks.update(this.player.group.position));
    }
    if (this.frameScheduler.shouldRun('shadows', this.engine.qualityProfile?.shadowHz || 18)) this.runSafe('blob-shadows', () => this.updateBlobShadows());
    this.runSafe('camera', () => this.updateCamera(dt));
    this.runSafe('renderer', () => {
      this.renderer.render(this.scene, this.camera);
      this.renderedFrameSerial += 1;
      this.flushRenderedFrameWaiters();
    });
    if (this.frameScheduler.shouldRun('production-console', this.coreFoundation.cadence('production-console', 8, { minHz: 2 }))) this.runSafe('production-console', () => this.productionConsole?.update(dt));
    if (this.frameScheduler.shouldRun('render-stats', this.coreFoundation.cadence('render-stats', 8, { minHz: 2 }))) this.runSafe('render-stats', () => this.renderStatsHud?.update(dt, {
      releaseVersion: GAME_VERSION,
      lineageVersion: LEGACY_LINEAGE_VERSION,
      buildId: BUILD_ID,
      appState: this.appState?.diagnostics || {},
      coreFoundation: this.coreFoundation?.diagnostics || {},
      engineVersion: ENGINE_VERSION,
      fps: this.engine.monitor.lastFps,
      performance: this.engine.monitor.snapshot,
      qualityScale: this.engine.qualityScale,
      chunks: this.engine.worldChunks.diagnostics,
      assets: this.assetPipeline?.diagnostics,
      animations: this.animations?.diagnostics,
      lifecycle: this.lifecycle.diagnostics,
      encounter: this.encounterDirector?.diagnostics,
      combat: this.combatTelemetry?.snapshot,
      statusEffects: this.statusEffects?.diagnostics,
      runtimeBudget: this.runtimeBudget?.diagnostics,
      reactions: this.elementalReactions?.diagnostics,
      momentum: this.battleMomentum?.diagnostics,
      bossEscalation: this.bossEscalation?.diagnostics,
      waveFlow: this.waveFlowGuard?.diagnostics,
      reliability: this.waveReliability?.diagnostics,
      browserReliability: this.browserReliability?.diagnostics,
      runtimeErrors: this.runtimeErrors.length,
      pools: {
        projectiles: this.projectiles.length,
        projectileCapacity: this.projectilePoolCapacity,
        coins: this.coins.length,
        coinCapacity: this.coinPoolCapacity
      }
    }));
  }

}

window.__DOKKAEBI_VERSION_POLICY__ = VERSION_POLICY;
installKoreanLanguageGuard();
const visualIntegration = new VisualIntegrationDirector().install();

try {
  const game = new DokkaebiLuckDefense();
  window.__DOKKAEBI_GAME__ = game;
  game.ready.then(() => {
    window.__DOKKAEBI_BOOT_OK__ = true;
    window.__DOKKAEBI_TEST_API__ = Object.freeze({
      version: GAME_VERSION,
      lineageVersion: LEGACY_LINEAGE_VERSION,
      buildId: BUILD_ID,
      snapshot: () => game.getBrowserAutomationSnapshot(),
      stateMachine: () => game.appState?.diagnostics || {},
      startRun: async () => {
        if (game.state === 'title') await game.startRunFromTitle();
        return game.getBrowserAutomationSnapshot();
      },
      startWave: () => {
        if (game.state === 'playing' && !game.waveActive) game.startWave();
        return game.getBrowserAutomationSnapshot();
      },
      chooseRecommendedReward: () => {
        if (game.state === 'blessing') game.selectRecommendedReward('blessing');
        else if (game.state === 'relic') game.selectRecommendedReward('relic');
        else if (game.state === 'contract') game.skipContract();
        return game.getBrowserAutomationSnapshot();
      },
      foundationReport: () => game.coreFoundation?.report || {},
      dispose: () => game.dispose(),
      reliabilityReport: () => ({ foundation: game.coreFoundation?.report || {}, wave: game.waveReliability?.report || {}, browser: game.browserReliability?.report || {}, firstPresentation: game.firstPresentationReport || game.firstPresentation?.report || {}, automation: game.automationV22?.report || {}, targeting: game.guardianTargetingV22?.report || {}, mobileHud: game.mobileHudV23?.report || {}, crossPlatformShell: game.crossPlatformShellV112?.report || {}, combatVisual: game.combatVisualV112?.diagnostics || {}, artApprovalV115: game.artApprovalReportV115 || {}, artApprovalV117: game.artApprovalReportV117 || {}, assetLoadingV115: { plan: game.assetLoadingPlanV115, ready: game.deferredAssetsReady, report: game.deferredAssetReport }, heroHudPolishV120: game.heroHudPolishV120 || {}, liveCombatV121: game.liveCombatV121?.report || {}, battlefieldClarityV122: game.battlefieldClarityV122?.report || {}, releaseAssuranceV124: game.releaseAssuranceV124?.report || {}, actionAssetAssuranceV125: game.actionAssetAssuranceV125?.report || {}, bossEncounterAssuranceV126: game.bossEncounterAssuranceV126?.report || {}, bossTacticalAssuranceV127: game.bossTacticalAssuranceV127?.report || {}, battlefieldVisibilityV128: game.battlefieldVisibilityV128?.report || {}, assetRefinementV129: game.assetRefinementV129?.report || {}, assetLineageV131: game.assetLineageV131?.report || {}, silhouetteAssuranceV132: game.silhouetteAssuranceV132?.report || {}, bossIdentityAssuranceV133: game.bossIdentityAssuranceV133?.report || {} })
    });
    game.browserReliability?.noteMilestone('game-ready', { state: game.state });
    window.dispatchEvent(new Event('dokkaebi:boot-ready'));
  }).catch((error) => {
    console.error('[DokkaebiLuckDefense3D] async boot failed', error);
    const reason = error instanceof Error ? error.message : String(error);
    window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(`에셋 초기화 오류: ${reason}`);
  });
} catch (error) {
  console.error('[DokkaebiLuckDefense3D] boot failed', error);
  const reason = error instanceof Error ? error.message : String(error);
  window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(`초기화 오류: ${reason}`);
}
