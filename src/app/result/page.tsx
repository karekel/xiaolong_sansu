'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { useVoiceEnabled } from '@/hooks/useVoiceEnabled';
import CharacterCoach from '@/components/CharacterCoach';
import { TYPE_TAG_LABEL, ALL_TYPE_TAGS } from '@/types';
import { weakestTypeTag } from '@/store/sessionStore';

export default function ResultPage() {
  const router = useRouter();
  const { voiceEnabled, toggle, unlock } = useVoiceEnabled();
  const { sessionLog, phase, currentDialog } = useSessionStore();

  useEffect(() => {
    if (phase !== 'finished' || !sessionLog) {
      router.replace('/practice');
    }
  }, [phase, sessionLog, router]);

  if (!sessionLog) return null;

  const { total, correct, byTypeTag, usedTutorCount } = sessionLog;
  const ratePct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const weak    = weakestTypeTag(byTypeTag);

  const emoji =
    ratePct >= 90 ? '🎉' :
    ratePct >= 70 ? '😊' :
    ratePct >= 50 ? '🙂' : '💪';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6 max-w-md mx-auto">
      {/* スコア見出し */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl animate-pop">{emoji}</div>
        <h2 className="text-2xl font-extrabold text-gray-800">きょうの けっか</h2>
      </div>

      {/* スコアカード */}
      <div className="card w-full max-w-xs">
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div className="flex flex-col items-center bg-green-50 rounded-2xl py-3">
            <span className="text-3xl font-bold text-correct">{correct}</span>
            <span className="text-xs text-gray-500">せいかい</span>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-2xl py-3">
            <span className="text-3xl font-bold text-gray-700">{total}</span>
            <span className="text-xs text-gray-500">もんだい</span>
          </div>
          <div className="flex flex-col items-center bg-orange-50 rounded-2xl py-3">
            <span className="text-3xl font-bold text-brand-400">{ratePct}%</span>
            <span className="text-xs text-gray-500">せいかいりつ</span>
          </div>
        </div>
        {usedTutorCount > 0 && (
          <p className="text-xs text-center text-indigo-500">
            てじゅんモード：{usedTutorCount}かい
          </p>
        )}
      </div>

      {/* TypeTag 別成績 */}
      <div className="card w-full max-w-xs">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">もんだいのしゅるいべつ</h3>
        <div className="flex flex-col gap-2">
          {ALL_TYPE_TAGS.map(tag => {
            const s = byTypeTag[tag];
            if (s.total === 0) return null;
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={tag} className="flex items-center gap-2">
                <span className={`text-xs flex-1 truncate ${tag === weak ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                  {tag === weak ? '⚠ ' : ''}{TYPE_TAG_LABEL[tag]}
                </span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? 'bg-correct' : pct >= 50 ? 'bg-brand-400' : 'bg-wrong'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{s.correct}/{s.total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ボタン */}
      <div className="w-full max-w-xs flex flex-col gap-3 pb-28">
        <button
          onClick={() => {
            useSessionStore.getState().startSession();
            router.push('/practice');
          }}
          className="w-full h-16 rounded-3xl bg-gradient-to-br from-brand-300 to-brand-500
                     text-white text-2xl font-extrabold shadow-xl
                     active:scale-95 transition-transform"
        >
          もう1かい やる！ 🔁
        </button>
        <button
          onClick={() => router.push('/practice')}
          className="w-full h-12 rounded-2xl bg-white border-2 border-gray-300
                     text-gray-600 font-bold text-base
                     active:scale-95 transition-transform"
        >
          せっていをかえる
        </button>
      </div>

      {/* キャラクターコーチ（onFinishSession のセリフを表示） */}
      <CharacterCoach
        text={currentDialog}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggle}
        onUnlockVoice={unlock}
      />
    </main>
  );
}
