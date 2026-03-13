'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { unlockSpeechSynthesis, initVoices } from '@/lib/speech';

const STORAGE_KEY = 'tashihikizan_voice';

/**
 * voiceEnabled の状態を localStorage と Zustand ストアで同期する。
 * 各ページのトップで1回呼べば OK。
 */
export function useVoiceEnabled() {
  const voiceEnabled    = useSessionStore(s => s.voiceEnabled);
  const setVoiceEnabled = useSessionStore(s => s.setVoiceEnabled);

  // マウント時に localStorage から復元 + 音声リストをプリロード
  useEffect(() => {
    initVoices();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setVoiceEnabled(saved === 'true');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    const next = !voiceEnabled;
    localStorage.setItem(STORAGE_KEY, String(next));
    setVoiceEnabled(next);
  }

  function unlock() {
    unlockSpeechSynthesis();
  }

  return { voiceEnabled, toggle, unlock };
}
