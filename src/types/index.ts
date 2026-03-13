// ─── Problem Types ──────────────────────────────────────────────────────────

export type TypeTag =
  | 'add_no_carry'   // 足し算・繰り上がりなし
  | 'add_carry'      // 足し算・繰り上がりあり
  | 'sub_no_borrow'  // 引き算・繰り下がりなし
  | 'sub_borrow';    // 引き算・繰り下がりあり

export const ALL_TYPE_TAGS: TypeTag[] = [
  'add_no_carry',
  'add_carry',
  'sub_no_borrow',
  'sub_borrow',
];

export const TYPE_TAG_LABEL: Record<TypeTag, string> = {
  add_no_carry:  'たし算（くりあがりなし）',
  add_carry:     'たし算（くりあがりあり）',
  sub_no_borrow: 'ひき算（くりさがりなし）',
  sub_borrow:    'ひき算（くりさがりあり）',
};

export interface Problem {
  id: string;
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  typeTag: TypeTag;
}

// ─── Step Mode ──────────────────────────────────────────────────────────────

export type StepVisual =
  | 'ones'          // 1のくらい（くりあがり/くりさがりなし）
  | 'tens'          // 10のくらい
  | 'combine'       // こたえ合わせ
  // さくらんぼ算（くりあがり）
  | 'cherry_split'  // bOnes を分解する
  | 'cherry_ten'    // aOnes + splitFirst = 10、+splitSecond
  // さくらんぼ算（くりさがり）
  | 'borrow_start'  // aOnes < bOnes → 10をかりる
  | 'borrow_split'  // bOnes を分解する
  | 'borrow_done';  // 10 - splitSecond = onesWritten

export interface StepInfo {
  title: string;
  explanation: string;
  visual: StepVisual;
  data: StepData;
}

export interface StepData {
  aOnes: number;
  bOnes: number;
  aTens: number;
  bTens: number;
  onesResult: number;      // ones after calc (may be > 9 for add)
  onesWritten: number;     // digit written in ones place
  tensResult: number;
  carry: number;           // 0 or 1
  borrowed: boolean;
  borrowedOnesResult: number; // after borrow: (10 + aOnes) - bOnes
  finalAnswer: number;
  // さくらんぼ算 分解
  splitFirst:  number;     // bOnes を分けた 1つ目（add: 10-aOnes / sub: aOnes）
  splitSecond: number;     // bOnes を分けた 2つ目（add: onesWritten / sub: bOnes-aOnes）
}

// ─── Dialog Events ───────────────────────────────────────────────────────────

export type DialogEvent =
  | 'onStart'
  | 'onProblem'
  | 'onCorrect'
  | 'onWrong'
  | 'onHintInvite'
  | 'onStepExplain'
  | 'onMilestone3'
  | 'onMilestone5'
  | 'onFinish';

// ─── Storage Types ───────────────────────────────────────────────────────────

export interface TypeTagStats {
  total: number;
  correct: number;
}

export interface SessionLog {
  id: string;
  startedAt: string;
  endedAt: string;
  total: number;
  correct: number;
  byTypeTag: Record<TypeTag, TypeTagStats>;
  usedTutorCount: number;
}

export interface DailySummary {
  date: string;       // 'YYYY-MM-DD'
  sessions: SessionLog[];
  lastPlayedAt: string;
}

// ─── Session Phase ───────────────────────────────────────────────────────────

export type SessionPhase =
  | 'idle'      // 未開始
  | 'answering' // 回答中
  | 'judged'    // 判定済み（正解/不正解表示）
  | 'step'      // 手順モード
  | 'finished'; // セッション終了
