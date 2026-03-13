import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff8f0',
          100: '#ffe5c2',
          200: '#ffcc85',
          300: '#ffae42',
          400: '#ff8c00',
          500: '#e07800',
        },
        correct: '#22c55e',
        wrong:   '#ef4444',
        step:    '#6366f1',
      },
      fontFamily: {
        rounded: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-8px)' },
          '40%':     { transform: 'translateX(8px)' },
          '60%':     { transform: 'translateX(-6px)' },
          '80%':     { transform: 'translateX(6px)' },
        },
        bounce_in: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        // ── キャラクター別アニメーション ──────────────────────────
        // happy: 元気よくジャンプ
        char_happy: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '30%':      { transform: 'translateY(-14px) scale(1.06)' },
          '55%':      { transform: 'translateY(-5px) scale(1.02)' },
          '75%':      { transform: 'translateY(-9px) scale(1.04)' },
        },
        // study: ゆっくり前後に揺れる（集中）
        char_study: {
          '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
          '25%':      { transform: 'rotate(-3deg) translateY(-2px)' },
          '75%':      { transform: 'rotate(3deg) translateY(2px)' },
        },
        // idea: ぴょんと元気に揺れる（ひらめき）
        char_idea: {
          '0%, 100%': { transform: 'rotate(-4deg) scale(1)' },
          '40%':      { transform: 'rotate(4deg) scale(1.08)' },
        },
        // sad: しょんぼり左右にゆれる
        char_sad: {
          '0%, 100%': { transform: 'rotate(-4deg) translateY(0)' },
          '50%':      { transform: 'rotate(4deg) translateY(4px)' },
        },
      },
      animation: {
        pop:        'pop 0.35s ease-out both',
        shake:      'shake 0.4s ease-in-out',
        bounce_in:  'bounce_in 0.3s ease-out both',
        char_happy: 'char_happy 1.2s ease-in-out infinite',
        char_study: 'char_study 2.2s ease-in-out infinite',
        char_idea:  'char_idea 0.9s ease-in-out infinite',
        char_sad:   'char_sad 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
