'use client';

interface NumpadProps {
  value: string;
  onDigit: (d: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const ROWS = [['1','2','3'],['4','5','6'],['7','8','9']];

export default function Numpad({ value, onDigit, onDelete, onSubmit, disabled }: NumpadProps) {
  return (
    <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
      {/* 入力表示 */}
      <div className="bg-white border-4 border-brand-300 rounded-2xl text-center
                      text-5xl font-bold tracking-widest h-20 flex items-center justify-center
                      text-gray-800 shadow-inner min-w-[160px]">
        {value === '' ? (
          <span className="text-gray-300 text-3xl">?</span>
        ) : (
          value
        )}
      </div>

      {/* 数字ボタン */}
      <div className="grid grid-cols-3 gap-3">
        {ROWS.map(row =>
          row.map(d => (
            <button
              key={d}
              onClick={() => onDigit(d)}
              disabled={disabled}
              className="h-16 rounded-2xl bg-brand-100 hover:bg-brand-200 active:bg-brand-300
                         text-3xl font-bold text-gray-800 shadow-md
                         active:scale-95 transition-transform
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {d}
            </button>
          ))
        )}
      </div>

      {/* 0 + 削除 */}
      <div className="grid grid-cols-3 gap-3">
        <div /> {/* spacer */}
        <button
          onClick={() => onDigit('0')}
          disabled={disabled}
          className="h-16 rounded-2xl bg-brand-100 hover:bg-brand-200 active:bg-brand-300
                     text-3xl font-bold text-gray-800 shadow-md
                     active:scale-95 transition-transform
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          0
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="h-16 rounded-2xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                     text-2xl font-bold text-gray-700 shadow-md
                     active:scale-95 transition-transform
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⌫
        </button>
      </div>

      {/* こたえるボタン */}
      <button
        onClick={onSubmit}
        disabled={disabled || value === ''}
        className="w-full h-16 rounded-2xl bg-correct hover:bg-green-600 active:bg-green-700
                   text-white text-2xl font-bold shadow-lg
                   active:scale-95 transition-transform
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        こたえる
      </button>
    </div>
  );
}
