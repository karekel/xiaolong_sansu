// ─── Types ───────────────────────────────────────────────────────────────────

export type OperationType = 'add' | 'sub' | 'both';
export type DigitLevel   = '1d1d' | '2d1d' | '2d2d';

export interface PracticeSettings {
  operation:  OperationType;
  digitLevel: DigitLevel;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: PracticeSettings = {
  operation:  'both',
  digitLevel: '2d2d',
};

// ─── Persistence ─────────────────────────────────────────────────────────────

const KEY = 'practice_settings';

export function loadSettings(): PracticeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: PracticeSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export const OPERATION_LABELS: Record<OperationType, string> = {
  add:  'たし算',
  sub:  'ひき算',
  both: 'りょうほう',
};

export const DIGIT_LEVEL_LABELS: Record<DigitLevel, string> = {
  '1d1d': '1けた',
  '2d1d': '2＋1けた(〜20)',
  '2d2d': '2けた(〜20)',
};
