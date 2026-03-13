'use client';

import { useState } from 'react';
import Image from 'next/image';

// ─── 表情タイプ ────────────────────────────────────────────────────────────────

export type CharEmotion = 'happy' | 'study' | 'idea' | 'sad';

const CHAR_IMAGES: Record<CharEmotion, string> = {
  happy: '/characters/char_happy.png',  // 手を挙げて嬉しい
  study: '/characters/char_study.png',  // 勉強中
  idea:  '/characters/char_idea.png',   // アイデア・ひらめき
  sad:   '/characters/char_sad.png',    // 困っている
};

const CHAR_ANIMS: Record<CharEmotion, string> = {
  happy: 'animate-char_happy',
  study: 'animate-char_study',
  idea:  'animate-char_idea',
  sad:   'animate-char_sad',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CharacterCoachProps {
  text:          string;
  voiceEnabled:  boolean;
  onToggleVoice: () => void;
  onUnlockVoice: () => void;
  emotion?:      CharEmotion;
  /** インラインモード: 左カラムに埋め込む（fixed 解除） */
  inline?:       boolean;
}

export default function CharacterCoach({
  text,
  voiceEnabled,
  onToggleVoice,
  onUnlockVoice,
  emotion = 'happy',
  inline  = false,
}: CharacterCoachProps) {
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock() {
    onUnlockVoice();
    setUnlocked(true);
  }

  const imgSrc  = CHAR_IMAGES[emotion];
  const animCls = CHAR_ANIMS[emotion];

  // ─── インラインモード（左カラム埋め込み） ──────────────────────────────────

  if (inline) {
    return (
      <div className="flex flex-col items-center justify-end w-full h-full select-none gap-2 pb-2">
        {/* ── 吹き出し ── */}
        {text && (
          <div className="relative z-20 bg-white/95 rounded-2xl border-2 border-brand-200
                          shadow-md px-3 py-2 animate-bounce_in mb-[-10px]">
            <p className="text-[30px] font-rounded leading-snug text-gray-800
                          whitespace-pre-wrap text-center">
              {text}
            </p>
            {/* 下向きのしっぽ */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[8px] w-0 h-0
                            border-l-[8px] border-l-transparent
                            border-r-[8px] border-r-transparent
                            border-t-[10px] border-t-white" />
          </div>
        )}

        {/* ── キャラクター画像 ── */}
        <div className={`relative w-full aspect-square flex-shrink-0 ${animCls} z-10`}>
          <Image
            src={imgSrc}
            alt="しょうろんぽーキャラ"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>

        {/* ── 音声ボタン ── */}
        <div className="relative z-30 flex flex-row gap-2 justify-center pointer-events-auto mt-[-40px]">
          <button
            onClick={onToggleVoice}
            className="flex items-center gap-1 bg-white/90 backdrop-blur-sm
                       rounded-xl shadow border border-gray-200
                       px-2 py-1 text-[11px] font-bold text-gray-600
                       active:scale-95 transition-transform"
          >
            <span className="text-sm">{voiceEnabled ? '🔊' : '🔇'}</span>
            <span>{voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {!unlocked && (
            <button
              onClick={handleUnlock}
              className="flex items-center gap-1 bg-brand-100 border border-brand-300
                         rounded-xl shadow px-2 py-1 text-[11px] font-bold text-brand-500
                         active:scale-95 transition-transform"
            >
              <span className="text-sm">🎵</span>
              <span>おとON</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── 固定モード（ホーム画面など）──────────────────────────────────────────

  return (
    <div className="fixed bottom-4 left-3 z-50 flex items-end gap-2 select-none">
      <div className={`pointer-events-none relative w-20 h-20 flex-shrink-0 drop-shadow-lg ${animCls}`}>
        <Image
          src={imgSrc}
          alt="しょうろんぽーキャラ"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="flex flex-col gap-1.5 items-start max-w-[210px]">
        {text && (
          <div className="pointer-events-none relative bg-white rounded-2xl rounded-bl-sm
                          shadow-lg border-2 border-brand-200 px-4 py-2.5 animate-bounce_in">
            <div className="absolute -left-[10px] bottom-3 w-0 h-0
                            border-t-[7px] border-t-transparent
                            border-r-[11px] border-r-white
                            border-b-[7px] border-b-transparent" />
            <p className="text-[13px] font-rounded leading-snug text-gray-800 whitespace-pre-wrap">
              {text}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 pointer-events-auto">
          <button
            onClick={onToggleVoice}
            className="flex items-center gap-1 bg-white/90 backdrop-blur-sm
                       rounded-xl shadow border border-gray-200
                       px-3 py-1.5 text-xs font-bold text-gray-600
                       active:scale-95 transition-transform"
          >
            <span className="text-base">{voiceEnabled ? '🔊' : '🔇'}</span>
            <span>{voiceEnabled ? 'おとON' : 'おとOFF'}</span>
          </button>

          {!unlocked && (
            <button
              onClick={handleUnlock}
              className="flex items-center gap-1 bg-brand-100 border border-brand-300
                         rounded-xl shadow px-3 py-1.5 text-xs font-bold text-brand-500
                         active:scale-95 transition-transform"
            >
              <span className="text-base">🎵</span>
              <span>おとゆうこう</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
