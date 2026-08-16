import { Player, Quiz } from '../../types';
import { Loader2, LogOut, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { useLanguage } from '../../contexts/LanguageContext';

interface PlayerWaitingLobbyProps {
  player: Player;
  quiz?: Quiz;
  onSendReaction: (emoji: string) => void;
  onLeave: () => void;
}

const QUICK_REACTION_EMOJIS = ['🔥', '🚀', '😱', '🎉', '🧠', '🤯', '❤️', '⚡'];

export function PlayerWaitingLobby({
  player,
  quiz,
  onSendReaction,
  onLeave,
}: PlayerWaitingLobbyProps) {
  const { t } = useLanguage();

  return (
    <div id="player-waiting-lobby" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden text-center font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playClick();
            onLeave();
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('player.leaveGame')}</span>
        </button>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{t('player.inGameStatus')}</span>
        </span>
      </div>

      {/* Center Player Card */}
      <div className="my-auto max-w-sm w-full mx-auto flex flex-col items-center z-10 space-y-5">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center text-6xl shadow-2xl animate-bounce duration-1000">
          {player.avatarEmoji}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">{player.nickname}</h2>
          <p className="text-xs text-slate-400 mt-1">{t('player.connectedSuccess')}</p>
        </div>

        {quiz && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 w-full flex items-center justify-center gap-2 text-xs text-slate-300">
            <span>{quiz.coverEmoji}</span>
            <span className="font-semibold truncate">{quiz.title}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
          <span>{t('player.waitingHost')}</span>
        </div>
      </div>

      {/* Bottom Floating Reaction Buttons */}
      <div className="z-10 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 max-w-sm w-full mx-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--accent-400)]" />
          <span>{t('player.sendReaction')}</span>
        </div>
        <div className="flex justify-center gap-2">
          {QUICK_REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sounds.playPop();
                onSendReaction(emoji);
              }}
              className="text-2xl p-2 rounded-xl hover:bg-slate-800 active:scale-90 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
