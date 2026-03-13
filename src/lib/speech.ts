// ─── Voice Engine ─────────────────────────────────────────────────────────────
//
//  NEXT_PUBLIC_VOICE_ENGINE=browser_tts  (デフォルト)
//  NEXT_PUBLIC_VOICE_ENGINE=external_api (外部 TTS API — 下の speakExternal を実装)
//
export type VoiceEngine = 'browser_tts' | 'external_api';

export const VOICE_ENGINE: VoiceEngine =
  (process.env.NEXT_PUBLIC_VOICE_ENGINE as VoiceEngine) ?? 'browser_tts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

// ─── Voice preference ─────────────────────────────────────────────────────────

let preferredVoiceName: string | null = null;

export function setPreferredVoiceName(name: string | null) {
  preferredVoiceName = name;
}

export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  return window.speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('ja'));
}

// ─── iOS unlock ───────────────────────────────────────────────────────────────

/**
 * iOS Safari では最初のユーザー操作後にしか音声が再生できない。
 * ボタン押下などのイベントハンドラ内でこの関数を呼ぶことで以降の発話を有効化する。
 */
export function unlockSpeechSynthesis() {
  if (typeof window === 'undefined') return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

// ─── Voice init ───────────────────────────────────────────────────────────────

/**
 * 利用可能な音声リストをプリロードする。
 * voiceschanged イベントが発火してから正しい声が選ばれる。
 */
export function initVoices(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener(
    'voiceschanged',
    () => { window.speechSynthesis.getVoices(); },
    { once: true },
  );
}

// ─── Browser TTS ──────────────────────────────────────────────────────────────

function speakBrowserTTS(text: string, opt: SpeakOptions = {}): void {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;

  // 連発時に重ならないよう前の発話を停止
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang   = opt.lang   ?? 'ja-JP';
  u.rate   = opt.rate   ?? 0.92;  // ゆっくり・聞き取りやすく
  u.pitch  = opt.pitch  ?? 1.6;   // 高め・かわいい女の子寄せ
  u.volume = opt.volume ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const jp = voices.filter(v => (v.lang || '').toLowerCase().startsWith('ja'));

  const preferred = preferredVoiceName
    ? jp.find(v => v.name === preferredVoiceName)
    : null;

  // 女性ボイスを強く優先：Kyoko (macOS/iOS), Haruka (Win), Google日本語女性, Nanami etc.
  const femaleVoices = jp.filter(v =>
    /female|woman|kyoko|haruka|mizuki|nanami|hikari|ずんだもん|四国めたん/i.test(v.name)
  );
  const fallbackCandidates = femaleVoices.length > 0 ? femaleVoices : jp;

  u.voice = preferred ?? fallbackCandidates[0] ?? voices[0] ?? null;

  window.speechSynthesis.speak(u);
}

// ─── External API stub ────────────────────────────────────────────────────────

/**
 * 将来 Gemini / ElevenLabs 等の外部音声 API に差し替える場合はここを実装する。
 *
 * 手順:
 *   1. .env.local に NEXT_PUBLIC_VOICE_ENGINE=external_api を設定
 *   2. NEXT_PUBLIC_GEMINI_API_KEY など必要なキーを追加
 *   3. 下記 TODO 部分に API 呼び出しコードを書く
 *
 * 未実装 / API キー未設定の場合は browser_tts にフォールバックする。
 */
async function speakExternal(text: string, opt: SpeakOptions = {}): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    speakBrowserTTS(text, opt);
    return;
  }

  // TODO: 外部 TTS API を呼ぶ実装をここに書く
  // 例:
  //   const audioBlob = await fetchGeminiTTS(text, apiKey);
  //   await playAudioBlob(audioBlob);
  console.info('[speakExternal] not yet implemented — falling back to browser TTS');
  speakBrowserTTS(text, opt);
}

// ─── Main speak (統一エントリポイント) ──────────────────────────────────────────
//
//  アプリ全体でこの関数のみを呼ぶこと。
//  VOICE_ENGINE 設定に応じて browser_tts / external_api を切り替える。
//

export function speak(text: string, enabled: boolean, opt: SpeakOptions = {}) {
  if (!enabled) return;
  if (VOICE_ENGINE === 'external_api') {
    speakExternal(text, opt);
  } else {
    speakBrowserTTS(text, opt);
  }
}
