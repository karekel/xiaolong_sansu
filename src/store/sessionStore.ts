import { create } from 'zustand';
import {
  Problem, TypeTag, TypeTagStats, SessionLog,
  SessionPhase, ALL_TYPE_TAGS, StepInfo, StepVisual,
} from '@/types';
import {
  generateProblem, pickTypeTag, bumpWeight,
  initialWeights, buildSteps, allowedTypeTags, filteredWeights,
} from '@/lib/problems';
import { lines, pick } from '@/lib/lines';
import { saveSession } from '@/lib/storage';
import { speak } from '@/lib/speech';
import { PracticeSettings, loadSettings } from '@/lib/settings';

const SESSION_SECONDS = 15 * 60;

// ─── Step line mapping ────────────────────────────────────────────────────────

function stepLine(visual: StepVisual, op: '+' | '-'): string {
  // さくらんぼ算
  if (visual === 'cherry_split') return pick(lines.stepCherrySplit);
  if (visual === 'cherry_ten')   return pick(lines.stepCherryTen);
  if (visual === 'borrow_start') return pick(lines.stepBorrowStart);
  if (visual === 'borrow_split') return pick(lines.stepBorrowSplit);
  if (visual === 'borrow_done')  return pick(lines.stepBorrowDone);

  if (op === '+') {
    if (visual === 'ones')  return pick(lines.stepAdd_ones);
    if (visual === 'tens')  return pick(lines.stepAdd_tens);
    return pick(lines.stepCombine);
  } else {
    if (visual === 'ones')  return pick(lines.stepSub_ones);
    if (visual === 'tens')  return pick(lines.stepSub_tens);
    return pick(lines.stepCombine);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyByTypeTag(): Record<TypeTag, TypeTagStats> {
  return Object.fromEntries(
    ALL_TYPE_TAGS.map(t => [t, { total: 0, correct: 0 }])
  ) as Record<TypeTag, TypeTagStats>;
}

function pickWithSettings(
  weights: Record<TypeTag, number>,
  settings: PracticeSettings,
): TypeTag {
  const allowed = allowedTypeTags(settings);
  return pickTypeTag(filteredWeights(weights, allowed));
}

// ─── State Shape ──────────────────────────────────────────────────────────────

interface SessionState {
  phase: SessionPhase;

  // Timer
  startedAt: string | null;
  timeLeft: number;

  // Problem
  currentProblem: Problem | null;
  userInput: string;
  lastCorrect: boolean | null;

  // Step mode
  steps: StepInfo[];
  currentStep: number;

  // Stats
  total: number;
  correct: number;
  byTypeTag: Record<TypeTag, TypeTagStats>;
  usedTutorCount: number;
  consecutiveCorrect: number;

  // Adaptive weights
  typeTagWeights: Record<TypeTag, number>;

  // Character dialog
  currentDialog: string;
  sessionLog: SessionLog | null;

  // Voice
  voiceEnabled: boolean;

  // Practice settings
  settings: PracticeSettings;

  // Actions
  startSession: () => void;
  tickTimer: () => boolean;
  addDigit: (d: string) => void;
  deleteDigit: () => void;
  submitAnswer: () => void;
  nextProblem: () => void;
  enterStepMode: () => void;
  nextStep: () => void;
  endSession: () => void;
  setDialog: (text: string) => void;
  setVoiceEnabled: (v: boolean) => void;
  setSettings: (s: PracticeSettings) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  phase: 'idle',
  startedAt: null,
  timeLeft: SESSION_SECONDS,
  currentProblem: null,
  userInput: '',
  lastCorrect: null,
  steps: [],
  currentStep: 0,
  total: 0,
  correct: 0,
  byTypeTag: emptyByTypeTag(),
  usedTutorCount: 0,
  consecutiveCorrect: 0,
  typeTagWeights: initialWeights(),
  currentDialog: '',
  sessionLog: null,
  voiceEnabled: true, // useVoiceEnabled hook がマウント時に localStorage から同期
  settings: loadSettings(),

  // ─── startSession ─────────────────────────────────────────────────────────

  startSession() {
    const { voiceEnabled, settings } = get();
    const dialog = pick(lines.onStartSession);
    speak(dialog, voiceEnabled);

    const weights = initialWeights();
    const tag     = pickWithSettings(weights, settings);
    const problem = generateProblem(tag, settings.digitLevel);
    const probDialog = pick(lines.onProblem);
    setTimeout(() => {
      speak(probDialog, get().voiceEnabled, { rate: 0.95 });
      set({ currentDialog: probDialog });
    }, 1500);

    set({
      phase: 'answering',
      startedAt: new Date().toISOString(),
      timeLeft: SESSION_SECONDS,
      currentProblem: problem,
      userInput: '',
      lastCorrect: null,
      steps: [],
      currentStep: 0,
      total: 0,
      correct: 0,
      byTypeTag: emptyByTypeTag(),
      usedTutorCount: 0,
      consecutiveCorrect: 0,
      typeTagWeights: weights,
      currentDialog: dialog,
      sessionLog: null,
    });
  },

  // ─── tickTimer ────────────────────────────────────────────────────────────

  tickTimer() {
    const { timeLeft, phase } = get();
    if (phase === 'finished') return false;
    if (timeLeft <= 1) { get().endSession(); return true; }
    set({ timeLeft: timeLeft - 1 });
    return false;
  },

  // ─── Input ────────────────────────────────────────────────────────────────

  addDigit(d: string) {
    const { phase, userInput } = get();
    if (phase !== 'answering') return;
    if (userInput.length >= 3) return;
    set({ userInput: userInput + d });
  },

  deleteDigit() {
    set({ userInput: get().userInput.slice(0, -1) });
  },

  // ─── submitAnswer ─────────────────────────────────────────────────────────

  submitAnswer() {
    const {
      currentProblem, userInput, byTypeTag, typeTagWeights,
      consecutiveCorrect, total, correct,
    } = get();
    if (!currentProblem || userInput === '') return;

    const answer    = parseInt(userInput, 10);
    const isCorrect = answer === currentProblem.answer;
    const tag       = currentProblem.typeTag;
    const ve        = get().voiceEnabled;

    const newByTypeTag: Record<TypeTag, TypeTagStats> = {
      ...byTypeTag,
      [tag]: {
        total:   byTypeTag[tag].total + 1,
        correct: byTypeTag[tag].correct + (isCorrect ? 1 : 0),
      },
    };

    const newConsec = isCorrect ? consecutiveCorrect + 1 : 0;
    let dialog: string;

    if (isCorrect) {
      if (newConsec === 5)      { dialog = pick(lines.onStreak5); }
      else if (newConsec === 3) { dialog = pick(lines.onStreak3); }
      else                      { dialog = pick(lines.onCorrect); }
      speak(dialog, ve);
    } else {
      // 不正解：onWrong を読み上げ、吹き出しには onHintInvite も添える
      const wrongText = pick(lines.onWrong);
      const hintText  = pick(lines.onHintInvite);
      speak(wrongText, ve);
      dialog = wrongText + '\n' + hintText;
    }

    set({
      phase: 'judged',
      lastCorrect: isCorrect,
      total: total + 1,
      correct: correct + (isCorrect ? 1 : 0),
      byTypeTag: newByTypeTag,
      consecutiveCorrect: newConsec,
      typeTagWeights: isCorrect ? typeTagWeights : bumpWeight(typeTagWeights, tag),
      currentDialog: dialog,
    });
  },

  // ─── nextProblem ──────────────────────────────────────────────────────────

  nextProblem() {
    const { typeTagWeights, settings } = get();
    const tag     = pickWithSettings(typeTagWeights, settings);
    const problem = generateProblem(tag, settings.digitLevel);
    const dialog  = pick(lines.onProblem);
    speak(dialog, get().voiceEnabled, { rate: 0.95 });
    set({
      phase: 'answering',
      currentProblem: problem,
      userInput: '',
      lastCorrect: null,
      steps: [],
      currentStep: 0,
      currentDialog: dialog,
    });
  },

  // ─── enterStepMode ────────────────────────────────────────────────────────

  enterStepMode() {
    const { currentProblem, usedTutorCount } = get();
    if (!currentProblem) return;
    const steps  = buildSteps(currentProblem);
    const dialog = stepLine(steps[0].visual, currentProblem.op);
    speak(dialog, get().voiceEnabled);
    set({
      phase: 'step',
      steps,
      currentStep: 0,
      usedTutorCount: usedTutorCount + 1,
      currentDialog: dialog,
    });
  },

  // ─── nextStep ─────────────────────────────────────────────────────────────

  nextStep() {
    const { steps, currentStep, currentProblem } = get();
    if (!currentProblem) return;

    if (currentStep < steps.length - 1) {
      const next   = currentStep + 1;
      const dialog = stepLine(steps[next].visual, currentProblem.op);
      speak(dialog, get().voiceEnabled, { rate: 0.9 });
      set({ currentStep: next, currentDialog: dialog });
    } else {
      // 手順終了 → 回答モードへ
      const dialog = 'では、じぶんでこたえてみよう！';
      speak(dialog, get().voiceEnabled);
      set({ phase: 'answering', userInput: '', lastCorrect: null, currentDialog: dialog });
    }
  },

  // ─── endSession ───────────────────────────────────────────────────────────

  endSession() {
    const { startedAt, total, correct, byTypeTag, usedTutorCount } = get();
    const endedAt = new Date().toISOString();
    const log: SessionLog = {
      id: Math.random().toString(36).slice(2, 10),
      startedAt: startedAt ?? endedAt,
      endedAt,
      total,
      correct,
      byTypeTag,
      usedTutorCount,
    };
    saveSession(log).catch(console.error);

    const dialog = pick(lines.onFinishSession);
    speak(dialog, get().voiceEnabled);
    set({ phase: 'finished', sessionLog: log, currentDialog: dialog });
  },

  // ─── setDialog ────────────────────────────────────────────────────────────

  setDialog(text: string) { set({ currentDialog: text }); },

  // ─── setVoiceEnabled ──────────────────────────────────────────────────────

  setVoiceEnabled(v: boolean) { set({ voiceEnabled: v }); },

  // ─── setSettings ──────────────────────────────────────────────────────────

  setSettings(s: PracticeSettings) { set({ settings: s }); },
}));

// ─── Computed Helper ──────────────────────────────────────────────────────────

export function weakestTypeTag(
  byTypeTag: Record<TypeTag, TypeTagStats>
): TypeTag | null {
  let worst: TypeTag | null = null;
  let worstRate = Infinity;
  for (const tag of ALL_TYPE_TAGS) {
    const s = byTypeTag[tag];
    if (s.total === 0) continue;
    const rate = s.correct / s.total;
    if (rate < worstRate) { worstRate = rate; worst = tag; }
  }
  return worst;
}
