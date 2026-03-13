import { Problem, TypeTag, ALL_TYPE_TAGS, StepInfo, StepData } from '@/types';
import { DigitLevel, PracticeSettings } from '@/lib/settings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getOnes(n: number): number { return n % 10; }
export function getTens(n: number): number { return Math.floor(n / 10); }

function makeId(): string { return Math.random().toString(36).slice(2, 10); }

// ─── Digit Level Ranges ───────────────────────────────────────────────────────

interface Range { min: number; max: number }

function aRange(lvl: DigitLevel): Range {
  return lvl === '1d1d' ? { min: 1, max: 9 } : { min: 10, max: 99 };
}
function bRange(lvl: DigitLevel): Range {
  return lvl === '2d2d' ? { min: 10, max: 99 } : { min: 1, max: 9 };
}
function rand(r: Range): number {
  return Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
}

// ─── Problem Generation ───────────────────────────────────────────────────────

function tryGenerate(typeTag: TypeTag, digitLevel: DigitLevel = '2d2d'): Problem | null {
  const ar = aRange(digitLevel);
  const br = bRange(digitLevel);

  switch (typeTag) {
    case 'add_no_carry': {
      const a = rand(ar), b = rand(br);
      if (getOnes(a) + getOnes(b) >= 10) return null;
      if (a + b > 99) return null;
      return { id: makeId(), a, b, op: '+', answer: a + b, typeTag };
    }
    case 'add_carry': {
      const a = rand(ar), b = rand(br);
      if (getOnes(a) + getOnes(b) < 10) return null;
      if (a + b > 99) return null;
      return { id: makeId(), a, b, op: '+', answer: a + b, typeTag };
    }
    case 'sub_no_borrow': {
      const a = rand(ar);
      const b = rand({ min: br.min, max: Math.min(br.max, a - 1) });
      if (b <= 0) return null;
      if (getOnes(a) < getOnes(b)) return null;
      if (a - b <= 0) return null;
      return { id: makeId(), a, b, op: '-', answer: a - b, typeTag };
    }
    case 'sub_borrow': {
      const a = rand(ar);
      const b = rand({ min: br.min, max: Math.min(br.max, a - 1) });
      if (b <= 0) return null;
      if (getOnes(a) >= getOnes(b)) return null;
      if (a - b <= 0) return null;
      return { id: makeId(), a, b, op: '-', answer: a - b, typeTag };
    }
  }
}

export function generateProblem(typeTag: TypeTag, digitLevel: DigitLevel = '2d2d'): Problem {
  for (let i = 0; i < 2000; i++) {
    const p = tryGenerate(typeTag, digitLevel);
    if (p) return p;
  }
  throw new Error(`generateProblem: failed for ${typeTag}/${digitLevel}`);
}

// ─── Allowed TypeTags ─────────────────────────────────────────────────────────

export function allowedTypeTags(settings: PracticeSettings): TypeTag[] {
  const { operation, digitLevel } = settings;
  const addTags: TypeTag[] = ['add_no_carry', 'add_carry'];
  const subTags: TypeTag[] = digitLevel === '1d1d'
    ? ['sub_no_borrow']
    : ['sub_no_borrow', 'sub_borrow'];
  if (operation === 'add') return addTags;
  if (operation === 'sub') return subTags;
  return [...addTags, ...subTags];
}

export function filteredWeights(
  weights: Record<TypeTag, number>,
  allowed: TypeTag[],
): Record<TypeTag, number> {
  return Object.fromEntries(
    ALL_TYPE_TAGS.map(t => [t, allowed.includes(t) ? weights[t] : 0]),
  ) as Record<TypeTag, number>;
}

// ─── Adaptive Weighted Sampling ───────────────────────────────────────────────

export function pickTypeTag(weights: Record<TypeTag, number>): TypeTag {
  const total = ALL_TYPE_TAGS.reduce((s, t) => s + weights[t], 0);
  let r = Math.random() * total;
  for (const tag of ALL_TYPE_TAGS) {
    r -= weights[tag];
    if (r <= 0) return tag;
  }
  return ALL_TYPE_TAGS[ALL_TYPE_TAGS.length - 1];
}

export function bumpWeight(weights: Record<TypeTag, number>, tag: TypeTag): Record<TypeTag, number> {
  return { ...weights, [tag]: Math.min(3.0, weights[tag] + 0.5) };
}

export function initialWeights(): Record<TypeTag, number> {
  return { add_no_carry: 1, add_carry: 1, sub_no_borrow: 1, sub_borrow: 1 };
}

// ─── Step Generation（さくらんぼ算） ─────────────────────────────────────────

function makeBase(
  aOnes: number, bOnes: number, aTens: number, bTens: number,
  op: '+' | '-',
): StepData {
  if (op === '+') {
    const onesSum     = aOnes + bOnes;
    const carry       = onesSum >= 10 ? 1 : 0;
    const onesWritten = onesSum % 10;
    const tensResult  = aTens + bTens + carry;
    const splitFirst  = carry ? 10 - aOnes : 0;   // さくらんぼ: bOnes → (10-aOnes) + onesWritten
    const splitSecond = carry ? onesWritten   : 0;
    return {
      aOnes, bOnes, aTens, bTens,
      onesResult: onesSum, onesWritten, tensResult, carry,
      borrowed: false, borrowedOnesResult: 0,
      finalAnswer: aOnes + bOnes + (aTens + bTens) * 10,
      splitFirst, splitSecond,
    };
  } else {
    const needsBorrow        = aOnes < bOnes;
    const borrowedOnesResult = needsBorrow ? (10 + aOnes) - bOnes : aOnes - bOnes;
    const onesWritten        = borrowedOnesResult;
    const tensResult         = needsBorrow ? (aTens - 1) - bTens : aTens - bTens;
    // さくらんぼ: bOnes → aOnes + (bOnes - aOnes)
    // (10 + aOnes) - aOnes = 10, then 10 - (bOnes - aOnes) = onesWritten
    const splitFirst  = needsBorrow ? aOnes           : 0;
    const splitSecond = needsBorrow ? bOnes - aOnes   : 0;
    return {
      aOnes, bOnes, aTens, bTens,
      onesResult: needsBorrow ? 10 + aOnes : aOnes - bOnes,
      onesWritten, tensResult, carry: 0,
      borrowed: needsBorrow, borrowedOnesResult,
      finalAnswer: (aTens * 10 + aOnes) - (bTens * 10 + bOnes),
      splitFirst, splitSecond,
    };
  }
}

export function buildSteps(p: Problem): StepInfo[] {
  const aOnes = getOnes(p.a);
  const bOnes = getOnes(p.b);
  const aTens = getTens(p.a);
  const bTens = getTens(p.b);
  const is2D  = aTens > 0 || bTens > 0;
  const base  = makeBase(aOnes, bOnes, aTens, bTens, p.op);

  // ── たし算 ──────────────────────────────────────────────────────────────────

  if (p.op === '+') {
    const { carry, onesResult, onesWritten, tensResult, splitFirst, splitSecond } = base;

    if (carry === 0) {
      // くりあがりなし
      const steps: StepInfo[] = [{
        title:       '① 1のくらいをたそう',
        explanation: `${aOnes} + ${bOnes} = ${onesResult}  1のくらいは【${onesResult}】だよ`,
        visual: 'ones', data: base,
      }];
      if (is2D) {
        steps.push({
          title:       '② 10のくらいをたそう',
          explanation: `${aTens} + ${bTens} = ${tensResult}  10のくらいは【${tensResult}】だよ`,
          visual: 'tens', data: base,
        });
        steps.push({
          title:       '③ こたえをあわせよう',
          explanation: `10のくらい【${tensResult}】と 1のくらい【${onesWritten}】→ こたえは【${p.answer}】！`,
          visual: 'combine', data: base,
        });
      } else {
        steps.push({
          title:       '② こたえはいくつ？',
          explanation: `こたえは【${p.answer}】！`,
          visual: 'combine', data: base,
        });
      }
      return steps;
    }

    // くりあがりあり → さくらんぼ算
    const steps: StepInfo[] = [
      {
        title:       `① ${bOnes}を「${splitFirst}と${splitSecond}」に わけよう`,
        explanation: `${aOnes}に たすと 10に なる のは ${splitFirst}。だから ${bOnes} は「${splitFirst}と${splitSecond}」に わける`,
        visual: 'cherry_split', data: base,
      },
      {
        title:       `② ${aOnes} ＋ ${splitFirst} ＝ 10、のこり ${splitSecond}`,
        explanation: `${aOnes} + ${splitFirst} = 10！  のこり ${splitSecond} だから 1のくらいは【${onesWritten}】、くりあげ1`,
        visual: 'cherry_ten', data: base,
      },
    ];
    if (is2D) {
      steps.push({
        title:       '③ 10のくらいをたそう',
        explanation: `${aTens} + ${bTens} + くりあげ1 = ${tensResult}  10のくらいは【${tensResult}】だよ`,
        visual: 'tens', data: base,
      });
      steps.push({
        title:       '④ こたえをあわせよう',
        explanation: `10のくらい【${tensResult}】と 1のくらい【${onesWritten}】→ こたえは【${p.answer}】！`,
        visual: 'combine', data: base,
      });
    } else {
      steps.push({
        title:       `③ 10 ＋ ${splitSecond} ＝ こたえ`,
        explanation: `10 + ${splitSecond} = ${p.answer}  こたえは【${p.answer}】！`,
        visual: 'combine', data: base,
      });
    }
    return steps;
  }

  // ── ひき算 ──────────────────────────────────────────────────────────────────

  const { borrowed, onesWritten, tensResult, splitFirst, splitSecond } = base;

  if (!borrowed) {
    // くりさがりなし
    const steps: StepInfo[] = [{
      title:       '① 1のくらいをひこう',
      explanation: `${aOnes} - ${bOnes} = ${onesWritten}  1のくらいは【${onesWritten}】だよ`,
      visual: 'ones', data: base,
    }];
    if (is2D) {
      steps.push({
        title:       '② 10のくらいをひこう',
        explanation: `${aTens} - ${bTens} = ${tensResult}  10のくらいは【${tensResult}】だよ`,
        visual: 'tens', data: base,
      });
      steps.push({
        title:       '③ こたえをあわせよう',
        explanation: `10のくらい【${tensResult}】と 1のくらい【${onesWritten}】→ こたえは【${p.answer}】！`,
        visual: 'combine', data: base,
      });
    } else {
      steps.push({
        title:       '② こたえはいくつ？',
        explanation: `こたえは【${p.answer}】！`,
        visual: 'combine', data: base,
      });
    }
    return steps;
  }

  // くりさがりあり → さくらんぼ算
  const borrowed10 = 10 + aOnes;
  const steps: StepInfo[] = [
    {
      title:       `① ${aOnes} - ${bOnes} は できない！ 10をかりよう`,
      explanation: `10のくらいから 1 かりて、${aOnes} を 10+${aOnes}=${borrowed10} にするよ`,
      visual: 'borrow_start', data: base,
    },
    {
      title:       `② ${bOnes}を「${splitFirst}と${splitSecond}」に わけよう`,
      explanation: `${borrowed10} から ひく ${bOnes} を「${splitFirst}と${splitSecond}」に わける`,
      visual: 'borrow_split', data: base,
    },
    {
      title:       `③ ${borrowed10} - ${splitFirst} = 10、10 - ${splitSecond} = ${onesWritten}`,
      explanation: `${borrowed10} - ${splitFirst} = 10、つぎ 10 - ${splitSecond} = ${onesWritten}  1のくらいは【${onesWritten}】！`,
      visual: 'borrow_done', data: base,
    },
  ];
  if (is2D) {
    steps.push({
      title:       '④ 10のくらいをひこう',
      explanation: `${aTens} - 1(かりた) - ${bTens} = ${tensResult}  10のくらいは【${tensResult}】だよ`,
      visual: 'tens', data: base,
    });
    steps.push({
      title:       '⑤ こたえをあわせよう',
      explanation: `10のくらい【${tensResult}】と 1のくらい【${onesWritten}】→ こたえは【${p.answer}】！`,
      visual: 'combine', data: base,
    });
  } else {
    steps.push({
      title:       '④ こたえはいくつ？',
      explanation: `こたえは【${p.answer}】！`,
      visual: 'combine', data: base,
    });
  }
  return steps;
}
