const URL_PATTERN = /\b(?:https?|file):\/\/[^\s)\]}>"']+/gi;
const UNIX_PATH_PATTERN = /(?:^|\s)(\/(?:home|Users|mnt|tmp|var|private|workspace|runner)\/[^\s)\]}>"']+)/g;
const WINDOWS_PATH_PATTERN = /\b[A-Za-z]:\\[^\s)\]}>"']+/g;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const TOKEN_PATTERN = /\b(?:[A-Fa-f0-9]{32,}|[A-Za-z0-9_-]{48,})\b/g;

function toMessage(error) {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string') return error;
  try { return JSON.stringify(error); } catch { return String(error ?? 'unknown runtime error'); }
}

export function sanitizeRuntimeMessageV148(error, maxLength = 260) {
  return toMessage(error)
    .replace(URL_PATTERN, '[url]')
    .replace(UNIX_PATH_PATTERN, ' [path]')
    .replace(WINDOWS_PATH_PATTERN, '[path]')
    .replace(EMAIL_PATTERN, '[email]')
    .replace(TOKEN_PATTERN, '[token]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, Math.max(80, Number(maxLength) || 260)) || 'unknown runtime error';
}

export class RuntimeHealthAssuranceV148 {
  constructor({ maxErrors = 40, maxFingerprints = 96 } = {}) {
    this.maxErrors = Math.max(10, Number(maxErrors) || 40);
    this.maxFingerprints = Math.max(this.maxErrors, Number(maxFingerprints) || 96);
    this.errors = [];
    this.fingerprints = new Map();
    this.hiddenFrames = 0;
    this.hiddenSeconds = 0;
    this.resumeCount = 0;
    this.suspended = false;
    this.lastResumeAt = null;
    this.totalCaptured = 0;
    this.duplicates = 0;
  }

  capture(error, { source = 'runtime', state = 'unknown', wave = 0, now = Date.now() } = {}) {
    const message = sanitizeRuntimeMessageV148(error);
    const normalizedSource = String(source || 'runtime').slice(0, 80);
    const fingerprint = `${normalizedSource}:${message}`.slice(0, 320);
    const seen = this.fingerprints.has(fingerprint);
    this.totalCaptured += 1;
    if (seen) this.duplicates += 1;
    this.fingerprints.delete(fingerprint);
    this.fingerprints.set(fingerprint, now);
    while (this.fingerprints.size > this.maxFingerprints) {
      this.fingerprints.delete(this.fingerprints.keys().next().value);
    }
    const entry = Object.freeze({
      at: new Date(now).toISOString(),
      source: normalizedSource,
      message,
      state: String(state || 'unknown').slice(0, 40),
      wave: Math.max(0, Number(wave) || 0),
      duplicate: seen
    });
    this.errors.push(entry);
    while (this.errors.length > this.maxErrors) this.errors.shift();
    return Object.freeze({ entry, duplicate: seen, fingerprint });
  }

  noteFrame({ hidden = false, dt = 0 } = {}) {
    const isHidden = Boolean(hidden);
    if (isHidden) {
      this.hiddenFrames += 1;
      this.hiddenSeconds += Math.max(0, Number(dt) || 0);
      this.suspended = true;
      return true;
    }
    if (this.suspended) {
      this.resumeCount += 1;
      this.lastResumeAt = new Date().toISOString();
    }
    this.suspended = false;
    return false;
  }

  get diagnostics() {
    return Object.freeze({
      id: 'DD-RUNTIME-HEALTH-ASSURANCE-V148',
      totalCaptured: this.totalCaptured,
      duplicates: this.duplicates,
      retainedErrors: this.errors.length,
      retainedFingerprints: this.fingerprints.size,
      maxErrors: this.maxErrors,
      maxFingerprints: this.maxFingerprints,
      hiddenFrames: this.hiddenFrames,
      hiddenSeconds: Number(this.hiddenSeconds.toFixed(3)),
      resumeCount: this.resumeCount,
      suspended: this.suspended,
      lastResumeAt: this.lastResumeAt,
      lastError: this.errors.at(-1) || null
    });
  }
}
