'use client';

interface TimerProps {
  secondsLeft: number;
}

export default function Timer({ secondsLeft }: TimerProps) {
  const m  = Math.floor(secondsLeft / 60);
  const s  = secondsLeft % 60;
  const pct = secondsLeft / (15 * 60);
  const isLow = secondsLeft <= 60;

  return (
    <div className="flex items-center gap-2">
      {/* テキスト */}
      <span className={`font-bold tabular-nums text-lg ${isLow ? 'text-wrong' : 'text-gray-700'}`}>
        ⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>

      {/* プログレスバー */}
      <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-wrong' : 'bg-brand-400'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
