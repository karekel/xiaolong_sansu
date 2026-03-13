'use client';

import Image from 'next/image';

interface CharacterProps {
  dialog: string;
  animate?: boolean;
}

export default function Character({ dialog, animate }: CharacterProps) {
  return (
    <div className="fixed left-20 top-1/2 -translate-y-1/2 z-50 flex items-end gap-2 select-none pointer-events-none">
      {/* キャラクター画像 */}
      <div className={`relative w-100 h-100 flex-shrink-0 ${animate ? 'animate-pop' : ''}`}>
        <Image
          src="/shoronpo.png"
          alt="小籠包キャラ"
          fill
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>

      {/* 吹き出し */}
      {dialog && (
        <div className="relative bg-white rounded-2xl rounded-bl-sm shadow-lg border-2 border-brand-200
                        px-4 py-3 max-w-[220px] min-w-[120px] animate-bounce_in">
          {/* しっぽ */}
          <div className="absolute -left-2 bottom-3 w-0 h-0
                          border-t-8 border-t-transparent
                          border-r-[12px] border-r-white
                          border-b-8 border-b-transparent" />
          <p className="text-sm font-rounded leading-snug text-gray-800 whitespace-pre-wrap">
            {dialog}
          </p>
        </div>
      )}
    </div>
  );
}
