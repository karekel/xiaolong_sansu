'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { useVoiceEnabled } from '@/hooks/useVoiceEnabled';
import CharacterCoach, { CharEmotion } from '@/components/CharacterCoach';
import Numpad from '@/components/Numpad';
import ProblemDisplay from '@/components/ProblemDisplay';
import SimpleStepView from '@/components/SimpleStepView';
import {
  PracticeSettings, OperationType, DigitLevel,
  loadSettings, saveSettings,
  OPERATION_LABELS, DIGIT_LEVEL_LABELS,
} from '@/lib/settings';

const OPS: OperationType[] = ['add', 'sub', 'both'];
const LEVELS: DigitLevel[] = ['1d1d', '2d1d', '2d2d'];

export default function PracticePage() {
  const router = useRouter();
  const { voiceEnabled, toggle, unlock } = useVoiceEnabled();

  const {
    phase,
    currentProblem,
    userInput,
    lastCorrect,
    steps,
    currentStep,
    currentDialog,
    total,
    correct,
    addDigit,
    deleteDigit,
    submitAnswer,
    nextProblem,
    enterStepMode,
    nextStep,
    prevStep,
    endSession,
    startSession,
    setSettings,
  } = useSessionStore();

  const [settings, setLocalSettings] = useState<PracticeSettings>(loadSettings);

  // マウント時に常にセッション開始（result画面から戻ってきた場合も含む）
  useEffect(() => {
    setSettings(settings);
    startSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // finished → 結果画面（マウント直後の startSession 前には発火しないよう started フラグで管理）
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) { setStarted(true); return; }
    if (phase === 'finished') router.replace('/result');
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // judged → 自動で次の問題へ（正解:1.2秒、不正解:2.5秒）
  useEffect(() => {
    if (phase !== 'judged') return;
    const delay = lastCorrect ? 1200 : 2500;
    const timer = setTimeout(() => nextProblem(), delay);
    return () => clearTimeout(timer);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // 設定変更（次の問題から反映）
  function updateOperation(op: OperationType) {
    const next = { ...settings, operation: op };
    setLocalSettings(next);
    saveSettings(next);
    setSettings(next);
  }
  function updateDigitLevel(lvl: DigitLevel) {
    const next = { ...settings, digitLevel: lvl };
    setLocalSettings(next);
    saveSettings(next);
    setSettings(next);
  }

  const inStep = phase === 'step';
  const isJudged = phase === 'judged';
  const stepData = steps[currentStep];

  // キャラ表情の決定
  const emotion: CharEmotion =
    phase === 'step' ? 'idea' :
      phase === 'judged' && lastCorrect ? 'happy' :
        phase === 'judged' && lastCorrect === false ? 'sad' :
          phase === 'answering' ? 'study' :
            'happy';

  return (
    <main className="flex h-screen max-w-5xl mx-auto overflow-hidden items-center justify-center bg-amber-50/10 gap-16">

      {/* ── 左カラム：キャラクター ── */}
      <div className="w-[50%] max-w-[500px] h-full flex items-center justify-center border-r border-amber-100 bg-amber-50/60 relative">
        <div className="h-[600px] w-full relative">
          <CharacterCoach
            inline
            text={currentDialog}
            voiceEnabled={voiceEnabled}
            onToggleVoice={toggle}
            emotion={emotion}
            onUnlockVoice={unlock}
          />
        </div>
      </div>{/* /left col */}

      {/* ── 右カラム ── */}
      <div className="flex-1 h-full flex flex-col justify-center py-6 px-4 gap-4 overflow-y-auto bg-white/50">

        {/* コンパクト設定バー */}
        <div className="flex flex-wrap gap-1 items-center">
          {OPS.map(op => (
            <button
              key={op}
              onClick={() => updateOperation(op)}
              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors
                ${settings.operation === op
                  ? 'bg-brand-400 text-white'
                  : 'bg-brand-100 text-brand-500'
                }`}
            >
              {OPERATION_LABELS[op]}
            </button>
          ))}
          <span className="text-gray-300 text-xs">｜</span>
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => updateDigitLevel(lvl)}
              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors
                ${settings.digitLevel === lvl
                  ? 'bg-brand-400 text-white'
                  : 'bg-brand-100 text-brand-500'
                }`}
            >
              {DIGIT_LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>

        {/* スコア＋おわるボタン */}
        {currentProblem && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 font-bold">
              {correct} / {total} もん
            </div>
            <button
              onClick={endSession}
              className="text-xs text-gray-400 underline"
            >
              おわる
            </button>
          </div>
        )}

        {/* 問題表示 */}
        {currentProblem && (
          <ProblemDisplay
            problem={currentProblem}
            showAnswer={isJudged || inStep}
            isCorrect={isJudged ? lastCorrect : null}
          />
        )}

        {/* 手順モード：シンプルステップ */}
        {inStep && stepData && currentProblem && (
          <SimpleStepView step={stepData} problem={currentProblem} />
        )}

        {/* 通常モード：テンキー */}
        {!inStep && currentProblem && (
          <div className="flex flex-col gap-2">
            <Numpad
              value={userInput}
              onDigit={addDigit}
              onDelete={deleteDigit}
              onSubmit={submitAnswer}
              disabled={isJudged}
            />

            {!isJudged && (
              <button
                onClick={enterStepMode}
                className="w-full h-11 rounded-2xl
                           bg-step/10 hover:bg-step/20 border-2 border-step
                           text-step font-bold text-sm
                           active:scale-95 transition-transform"
              >
                てじゅんモード で かくにん
              </button>
            )}

            {isJudged && lastCorrect === false && (
              <button
                onClick={enterStepMode}
                className="w-full h-11 rounded-2xl bg-step/10 hover:bg-step/20
                           border-2 border-step text-step font-bold text-sm
                           active:scale-95 transition-transform"
              >
                てじゅんを みる
              </button>
            )}
          </div>
        )}

        {/* 手順モード：進捗ドット＋ボタン */}
        {inStep && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${i < currentStep ? 'bg-step' :
                      i === currentStep ? 'bg-step ring-2 ring-step/50' :
                        'bg-gray-300'
                    }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevStep}
                className="h-14 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200
                           text-gray-600 font-bold text-xl shadow-sm
                           active:scale-95 transition-transform"
              >
                ← もどる
              </button>
              <button
                onClick={nextStep}
                className="flex-1 h-14 rounded-2xl bg-step hover:bg-indigo-700
                           text-white font-bold text-xl shadow-md
                           active:scale-95 transition-transform"
              >
                {currentStep < steps.length - 1 ? 'つぎへ →' : 'つぎのもんだいへ →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
