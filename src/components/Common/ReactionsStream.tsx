import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameReaction } from '../../types';
import { sounds } from '../../utils/sound';

interface ReactionsStreamProps {
  reactions: GameReaction[];
  onSendReaction?: (emoji: string) => void;
  showControls?: boolean;
}

const QUICK_EMOJIS = ['🔥', '🚀', '😱', '🎉', '🧠', '🤯', '❤️', '⚡'];

export function ReactionsStream({ reactions, onSendReaction, showControls = false }: ReactionsStreamProps) {
  useEffect(() => {
    if (reactions.length > 0) {
      sounds.playPop();
    }
  }, [reactions.length]);

  return (
    <>
      {/* Floating Reactions Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 100, scale: 0.5, x: `${r.x}vw` }}
              animate={{ opacity: 1, y: -400, scale: 1.4, x: `${r.x + (Math.sin(r.timestamp) * 5)}vw` }}
              exit={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
              className="absolute bottom-20 flex flex-col items-center select-none"
            >
              <span className="text-4xl filter drop-shadow-md">{r.emoji}</span>
              {r.senderName && (
                <span className="mt-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm shadow-sm">
                  {r.senderName}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive reaction buttons for players/viewers */}
      {showControls && onSendReaction && (
        <div id="reactions-bar" className="flex items-center justify-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl max-w-fit mx-auto">
          {QUICK_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                sounds.playPop();
                onSendReaction(emoji);
              }}
              className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={`Отправить реакцию ${emoji}`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      )}
    </>
  );
}
