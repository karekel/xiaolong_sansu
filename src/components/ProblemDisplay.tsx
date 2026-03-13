'use client';

import { Problem } from '@/types';

interface ProblemDisplayProps {
  problem: Problem;
  showAnswer?: boolean;
  isCorrect?: boolean | null;
}

export default function ProblemDisplay({ problem, showAnswer, isCorrect }: ProblemDisplayProps) {
  const borderColor =
    isCorrect === true  ? 'border-correct' :
    isCorrect === false ? 'border-wrong'   :
                          'border-brand-200';

  const bgColor =
    isCorrect === true  ? 'bg-green-50' :
    isCorrect === false ? 'bg-red-50'   :
                          'bg-white';

  return (
    <div className={`w-full max-w-sm mx-auto rounded-3xl border-4 ${borderColor} ${bgColor}
                     shadow-md px-6 py-5 flex flex-col items-center gap-2
                     transition-colors duration-200`}>
      {/* 問題 */}
      <div className="flex items-center gap-3 text-5xl font-bold text-gray-800">
        <span>{problem.a}</span>
        <span className={problem.op === '+' ? 'text-correct' : 'text-wrong'}>
          {problem.op}
        </span>
        <span>{problem.b}</span>
        <span className="text-gray-500">=</span>
        {showAnswer ? (
          <span className={isCorrect ? 'text-correct' : 'text-wrong animate-pop'}>
            {problem.answer}
          </span>
        ) : (
          <span className="text-gray-300">?</span>
        )}
      </div>

      {/* 正誤メッセージ */}
      {isCorrect === true && (
        <div className="text-correct font-bold text-xl animate-pop">
          ⭕ せいかい！
        </div>
      )}
      {isCorrect === false && (
        <div className="text-wrong font-bold text-xl animate-shake">
          ❌ こたえは {problem.answer} だよ
        </div>
      )}
    </div>
  );
}
