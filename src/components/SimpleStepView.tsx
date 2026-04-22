'use client';

import { StepInfo, Problem, StepData, StepVisual } from '@/types';

interface Props { step: StepInfo; problem: Problem }

// ─── りんご1個 ────────────────────────────────────────────────────────────────

function Apple({ emoji = '🍎', dim }: { emoji?: string; dim?: boolean }) {
  return (
    <span className={`text-xl leading-none select-none ${dim ? 'opacity-20' : ''}`}>
      {emoji}
    </span>
  );
}

// ─── りんごグループ ───────────────────────────────────────────────────────────

function AppleGroup({
  count, emoji = '🍎', label, bg = 'bg-red-50', border = 'border-red-100',
  labelColor = 'text-red-400',
}: {
  count: number; emoji?: string; label?: string;
  bg?: string; border?: string; labelColor?: string;
}) {
  return (
    <div className={`flex flex-col items-center rounded-2xl px-2 py-2 border ${bg} ${border}`}>
      <div className="flex flex-wrap gap-0.5 justify-center" style={{ maxWidth: '130px' }}>
        {Array.from({ length: Math.max(0, count) }).map((_, i) => (
          <Apple key={i} emoji={emoji} />
        ))}
      </div>
      {label && (
        <span className={`text-[11px] font-bold mt-1 ${labelColor}`}>{label}</span>
      )}
    </div>
  );
}

// ─── 10のまとまりBox ──────────────────────────────────────────────────────────

function TenBox({ count = 1 }: { count?: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-2 border-dashed border-orange-400 rounded-xl
                                bg-orange-50 px-1.5 py-1 flex flex-wrap gap-0.5 justify-center"
             style={{ width: '62px' }}>
          {Array.from({ length: 10 }).map((_, j) => (
            <span key={j} className="text-sm leading-none">🍎</span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── さくらんぼ分解図 ──────────────────────────────────────────────────────────

function CherryDiagram({
  total, left, right, leftLabel, rightLabel,
}: {
  total: number; left: number; right: number;
  leftLabel?: string; rightLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 元の数 */}
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-full
                      w-10 h-10 flex items-center justify-center text-xl font-extrabold text-yellow-700">
        {total}
      </div>
      {/* 枝（SVG） */}
      <svg width="80" height="20" className="overflow-visible">
        <line x1="40" y1="0" x2="12" y2="18" stroke="#aaa" strokeWidth="2"/>
        <line x1="40" y1="0" x2="68" y2="18" stroke="#aaa" strokeWidth="2"/>
      </svg>
      {/* 2つの数 */}
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-0.5">
          <div className="bg-orange-100 border-2 border-orange-400 rounded-full
                          w-10 h-10 flex items-center justify-center text-xl font-extrabold text-orange-700">
            {left}
          </div>
          {leftLabel && <span className="text-[10px] text-orange-500 font-bold">{leftLabel}</span>}
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="bg-blue-100 border-2 border-blue-400 rounded-full
                          w-10 h-10 flex items-center justify-center text-xl font-extrabold text-blue-700">
            {right}
          </div>
          {rightLabel && <span className="text-[10px] text-blue-500 font-bold">{rightLabel}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── 各ステップの図解 ──────────────────────────────────────────────────────────

function StepIllustration({ visual, data, op }: { visual: StepVisual; data: StepData; op: '+' | '-' }) {

  // ── ones（くりあがり・くりさがりなし）──────────────────────────────────────

  if (visual === 'ones') {
    if (op === '+') {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <AppleGroup count={data.aOnes} emoji="🍎" label={`${data.aOnes}こ`}
              bg="bg-red-50" border="border-red-100" labelColor="text-red-400" />
            <span className="text-2xl font-bold text-gray-400">＋</span>
            <AppleGroup count={data.bOnes} emoji="🍎" label={`${data.bOnes}こ`}
              bg="bg-yellow-50" border="border-yellow-100" labelColor="text-yellow-500" />
            <span className="text-2xl font-bold text-gray-400">＝</span>
            <AppleGroup count={data.onesResult}
              emoji="🍎" label={`あわせて${data.onesResult}こ`}
              bg="bg-green-50" border="border-green-100" labelColor="text-green-600" />
          </div>
        </div>
      );
    }
    // sub no-borrow
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap gap-0.5 justify-center bg-red-50 border border-red-100 rounded-2xl px-3 py-2"
             style={{ maxWidth: '160px' }}>
          {Array.from({ length: data.aOnes }).map((_, i) => (
            <Apple key={i} emoji="🍎" dim={i < data.bOnes} />
          ))}
          <span className="w-full text-center text-[11px] text-red-400 font-bold mt-1">
            {data.bOnes}こ とる → のこり {data.onesWritten}こ
          </span>
        </div>
      </div>
    );
  }

  // ── cherry_split（さくらんぼ：bOnesを分解）────────────────────────────────

  if (visual === 'cherry_split') {
    const leftLabel  = op === '+' ? `${data.aOnes}+${data.splitFirst}=10` : `${10 + data.aOnes}-${data.splitFirst}=10`;
    const rightLabel = op === '+' ? 'のこり'                              : 'のこり';
    return (
      <div className="flex flex-col items-center gap-3">
        {/* さくらんぼ図 */}
        <CherryDiagram
          total={data.bOnes}
          left={data.splitFirst}
          right={data.splitSecond}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
        />
        {/* りんご視覚 */}
        <div className="flex gap-2 flex-wrap justify-center">
          <AppleGroup count={data.splitFirst} emoji="🍎"
            label={`${data.splitFirst}こ`}
            bg="bg-orange-50" border="border-orange-100" labelColor="text-orange-500" />
          <AppleGroup count={data.splitSecond} emoji="🍎"
            label={`${data.splitSecond}こ`}
            bg="bg-yellow-50" border="border-yellow-100" labelColor="text-yellow-500" />
        </div>
      </div>
    );
  }

  // ── cherry_ten（さくらんぼ：10をつくる）──────────────────────────────────

  if (visual === 'cherry_ten') {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* step1: aOnes + splitFirst = 10 */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <AppleGroup count={data.aOnes} emoji="🍎" label={`${data.aOnes}こ`}
            bg="bg-red-50" border="border-red-100" labelColor="text-red-400" />
          <span className="text-2xl font-bold text-gray-400">＋</span>
          <AppleGroup count={data.splitFirst} emoji="🍎" label={`${data.splitFirst}こ`}
            bg="bg-orange-50" border="border-orange-100" labelColor="text-orange-500" />
          <span className="text-2xl font-bold text-gray-400">＝</span>
          <div className="flex flex-col items-center">
            <TenBox count={1} />
            <span className="text-[11px] font-bold text-orange-600 mt-1">10のまとまり！</span>
          </div>
        </div>
        {/* step2: 10 + splitSecond = answer */}
        {data.splitSecond > 0 && (
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            <div className="flex flex-col items-center">
              <TenBox count={1} />
              <span className="text-[11px] font-bold text-orange-600 mt-1">10</span>
            </div>
            <span className="text-2xl font-bold text-gray-400">＋</span>
            <AppleGroup count={data.splitSecond} emoji="🍎" label={`${data.splitSecond}こ`}
              bg="bg-yellow-50" border="border-yellow-100" labelColor="text-yellow-500" />
            <span className="text-2xl font-bold text-gray-400">＝</span>
            <span className="text-3xl font-extrabold text-white bg-brand-400 rounded-2xl px-3 py-1.5 shadow">
              {10 + data.splitSecond}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── borrow_start（10をかりる） ─────────────────────────────────────────────

  if (visual === 'borrow_start') {
    const borrowed10 = 10 + data.aOnes;
    return (
      <div className="flex flex-col items-center gap-2">
        {/* aOnes < bOnes → できない */}
        <div className="flex items-center gap-2">
          <AppleGroup count={data.aOnes} emoji="🍎" label={`${data.aOnes}こ`}
            bg="bg-red-50" border="border-red-200" labelColor="text-red-400" />
          <div className="text-sm font-bold text-red-500 bg-red-50 rounded-xl px-2 py-1">
            {data.bOnes}こ ひけない！
          </div>
        </div>
        <div className="text-xl text-gray-400">↓ 10をかりる</div>
        {/* 10のまとまり + aOnes */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <TenBox count={1} />
            <span className="text-[11px] font-bold text-orange-600 mt-1">かりた10</span>
          </div>
          <span className="text-2xl font-bold text-gray-400">＋</span>
          <AppleGroup count={data.aOnes} emoji="🍎" label={`もとの${data.aOnes}こ`}
            bg="bg-red-50" border="border-red-100" labelColor="text-red-400" />
          <span className="text-2xl font-bold text-gray-400">＝</span>
          <div className="bg-green-100 border-2 border-green-400 rounded-2xl px-3 py-2 text-center">
            <span className="text-2xl font-extrabold text-green-700">{borrowed10}こ</span>
          </div>
        </div>
      </div>
    );
  }

  // ── borrow_split（さくらんぼ：bOnesを分解）────────────────────────────────

  if (visual === 'borrow_split') {
    const borrowed10 = 10 + data.aOnes;
    return (
      <div className="flex flex-col items-center gap-3">
        <CherryDiagram
          total={data.bOnes}
          left={data.splitFirst}
          right={data.splitSecond}
          leftLabel={`${borrowed10}-${data.splitFirst}=10`}
          rightLabel="のこり"
        />
        <div className="flex gap-2 flex-wrap justify-center">
          <AppleGroup count={data.splitFirst} emoji="🍎"
            label={`${data.splitFirst}こ ひく`}
            bg="bg-orange-50" border="border-orange-100" labelColor="text-orange-500" />
          <AppleGroup count={data.splitSecond} emoji="🍎"
            label={`さらに${data.splitSecond}こ ひく`}
            bg="bg-amber-50" border="border-amber-100" labelColor="text-amber-500" />
        </div>
      </div>
    );
  }

  // ── borrow_done（計算完了） ───────────────────────────────────────────────

  if (visual === 'borrow_done') {
    const borrowed10 = 10 + data.aOnes;
    return (
      <div className="flex flex-col items-center gap-2">
        {/* borrowed10 - splitFirst = 10 */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl px-2 py-1 text-center">
            <span className="text-xl font-extrabold text-green-700">{borrowed10}こ</span>
          </div>
          <span className="text-xl font-bold text-gray-400">－</span>
          <AppleGroup count={data.splitFirst} emoji="🍎" label={`${data.splitFirst}こ`}
            bg="bg-orange-50" border="border-orange-100" labelColor="text-orange-500" />
          <span className="text-xl font-bold text-gray-400">＝</span>
          <div className="flex flex-col items-center">
            <TenBox count={1} />
            <span className="text-[11px] font-bold text-orange-600 mt-1">10こ</span>
          </div>
        </div>
        {/* 10 - splitSecond = onesWritten */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex flex-col items-center">
            <TenBox count={1} />
            <span className="text-[11px] font-bold text-orange-600 mt-1">10こ</span>
          </div>
          <span className="text-xl font-bold text-gray-400">－</span>
          <AppleGroup count={data.splitSecond} emoji="🍎" label={`${data.splitSecond}こ`}
            bg="bg-orange-50" border="border-orange-100" labelColor="text-orange-500" />
          <span className="text-xl font-bold text-gray-400">＝</span>
          <AppleGroup count={data.onesWritten} emoji="🍎" label={`こたえ${data.onesWritten}こ`}
            bg="bg-green-50" border="border-green-200" labelColor="text-green-600" />
        </div>
      </div>
    );
  }

  // ── tens（10のくらい）────────────────────────────────────────────────────

  if (visual === 'tens') {
    const tensA = op === '-' && data.borrowed ? data.aTens - 1 : data.aTens;
    if (op === '+') {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {tensA > 0 && (
              <>
                <div className="flex flex-col items-center gap-1">
                  {Array.from({ length: tensA }).map((_, i) => (
                    <div key={i} className="border-2 border-dashed border-orange-400 rounded-xl
                                            bg-orange-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <span key={j} className="text-xs">🍎</span>
                      ))}
                    </div>
                  ))}
                  <span className="text-[11px] text-orange-500 font-bold">{tensA}たば</span>
                </div>
                <span className="text-xl font-bold text-gray-400">＋</span>
              </>
            )}
            {data.bTens > 0 && (
              <>
                <div className="flex flex-col items-center gap-1">
                  {Array.from({ length: data.bTens }).map((_, i) => (
                    <div key={i} className="border-2 border-dashed border-blue-400 rounded-xl
                                            bg-blue-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <span key={j} className="text-xs">🍎</span>
                      ))}
                    </div>
                  ))}
                  <span className="text-[11px] text-blue-500 font-bold">{data.bTens}たば</span>
                </div>
              </>
            )}
            {data.carry > 0 && (
              <>
                <span className="text-xl font-bold text-gray-400">＋</span>
                <div className="bg-amber-100 border border-amber-300 rounded-xl px-2 py-1
                                text-xs font-bold text-amber-700 text-center">
                  くりあげ<br />1たば
                </div>
              </>
            )}
            <span className="text-xl font-bold text-gray-400">＝</span>
            <div className="flex flex-col items-center gap-1">
              {Array.from({ length: data.tensResult }).map((_, i) => (
                <div key={i} className="border-2 border-dashed border-green-500 rounded-xl
                                        bg-green-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <span key={j} className="text-xs">🍎</span>
                  ))}
                </div>
              ))}
              <span className="text-[11px] text-green-600 font-bold">{data.tensResult}たば</span>
            </div>
          </div>
        </div>
      );
    }
    // sub tens
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {tensA > 0 && (
            <>
              <div className="flex flex-col items-center gap-1">
                {Array.from({ length: tensA }).map((_, i) => (
                  <div key={i} className="border-2 border-dashed border-orange-400 rounded-xl
                                          bg-orange-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <span key={j} className="text-xs">🍎</span>
                    ))}
                  </div>
                ))}
                <span className="text-[11px] text-orange-500 font-bold">
                  {data.borrowed ? `${data.aTens}たば(かりた後${tensA}たば)` : `${tensA}たば`}
                </span>
              </div>
            </>
          )}
          {data.bTens > 0 && (
            <>
              <span className="text-xl font-bold text-gray-400">－</span>
              <div className="flex flex-col items-center gap-1">
                {Array.from({ length: data.bTens }).map((_, i) => (
                  <div key={i} className="border-2 border-dashed border-blue-400 rounded-xl
                                          bg-blue-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center opacity-40">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <span key={j} className="text-xs">🍎</span>
                    ))}
                  </div>
                ))}
                <span className="text-[11px] text-blue-500 font-bold">{data.bTens}たば</span>
              </div>
            </>
          )}
          <span className="text-xl font-bold text-gray-400">＝</span>
          {data.tensResult > 0 ? (
            <div className="flex flex-col items-center gap-1">
              {Array.from({ length: data.tensResult }).map((_, i) => (
                <div key={i} className="border-2 border-dashed border-green-500 rounded-xl
                                        bg-green-50 px-1 py-0.5 flex gap-0.5 w-[58px] justify-center">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <span key={j} className="text-xs">🍎</span>
                  ))}
                </div>
              ))}
              <span className="text-[11px] text-green-600 font-bold">{data.tensResult}たば</span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-500">0たば</span>
          )}
        </div>
      </div>
    );
  }

  // ── combine ──────────────────────────────────────────────────────────────

  if (visual === 'combine') {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* 合わせる素材を横並び（折り返しても重ならないよう gap 確保） */}
        <div className="flex gap-4 justify-center items-end">
          {data.tensResult > 0 && (
            <div className="flex flex-col items-center gap-1">
              {Array.from({ length: data.tensResult }).map((_, i) => (
                <div key={i} className="border-2 border-dashed border-orange-400 rounded-xl
                                        bg-orange-50 px-1 py-0.5 flex gap-0.5 w-[62px] justify-center">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <span key={j} className="text-xs">🍎</span>
                  ))}
                </div>
              ))}
              <span className="text-[11px] text-orange-500 font-bold">{data.tensResult}たば</span>
            </div>
          )}
          {data.tensResult > 0 && data.onesWritten > 0 && (
            <span className="text-2xl font-bold text-gray-400 pb-4">＋</span>
          )}
          {data.onesWritten > 0 && (
            <AppleGroup count={data.onesWritten} emoji="🍎"
              label={`${data.onesWritten}こ`}
              bg="bg-green-50" border="border-green-100" labelColor="text-green-600" />
          )}
        </div>
        {/* 矢印＋答え */}
        <span className="text-2xl text-gray-400">↓</span>
        <span className="text-5xl font-extrabold text-white bg-brand-400 rounded-3xl px-6 py-2 shadow-lg">
          {data.finalAnswer}
        </span>
      </div>
    );
  }

  return null;
}

// ─── SimpleStepView ───────────────────────────────────────────────────────────

export default function SimpleStepView({ step, problem }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow border-2 border-indigo-100 px-3 py-4 flex flex-col gap-3">
      <div className="text-sm font-extrabold text-step">{step.title}</div>
      <div className="flex justify-center">
        <StepIllustration visual={step.visual} data={step.data} op={problem.op} />
      </div>
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        {step.explanation}
      </p>
    </div>
  );
}
