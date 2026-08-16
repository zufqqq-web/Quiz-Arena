import { useEffect } from 'react';
import { Player } from '../../types';
import { Trophy, Flame, ArrowRight, Zap } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface HostLeaderboardProps {
  players: Record<string, Player>;
  currentQuestionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  onShowPodium: () => void;
}

export function HostLeaderboard({
  players,
  currentQuestionIndex,
  totalQuestions,
  onNextQuestion,
  onShowPodium,
}: HostLeaderboardProps) {
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  // Sort players by score descending
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  useEffect(() => {
    sounds.playCorrect();
  }, []);

  return (
    <div id="host-leaderboard" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Таблица лидеров</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Раунд {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>

        <button
          id="btn-next-question-or-podium"
          onClick={() => {
            sounds.playClick();
            if (isLastQuestion) {
              onShowPodium();
            } else {
              onNextQuestion();
            }
          }}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-6 py-2.5 rounded-xl transition shadow-xl cursor-pointer"
        >
          <span>{isLastQuestion ? 'Финальный подиум 🏆' : 'Следующий вопрос'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Leaderboard Rankings List */}
      <div className="my-auto max-w-2xl w-full mx-auto space-y-3 z-10">
        {sortedPlayers.slice(0, 5).map((player, rank) => {
          const isTop1 = rank === 0;
          const isTop2 = rank === 1;
          const isTop3 = rank === 2;

          const recentAnswer = player.answers?.[currentQuestionIndex];
          const gainedPoints = recentAnswer?.pointsEarned || 0;

          return (
            <div
              key={player.id}
              className={`rounded-2xl border p-4 flex items-center justify-between transition-all duration-300 transform ${
                isTop1
                  ? 'bg-slate-900 border-amber-500/80 ring-2 ring-amber-500/30 scale-[1.02] shadow-xl'
                  : isTop2
                  ? 'bg-slate-900 border-slate-700 shadow-md'
                  : isTop3
                  ? 'bg-slate-900 border-slate-800 shadow-sm'
                  : 'bg-slate-950/80 border-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                    isTop1
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : isTop2
                      ? 'bg-slate-300 text-slate-950'
                      : isTop3
                      ? 'bg-amber-700/80 text-amber-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {rank + 1}
                </div>

                {/* Avatar & Name */}
                <span className="text-2xl">{player.avatarEmoji}</span>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{player.nickname}</span>
                    {player.streak >= 2 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-950/70 border border-orange-800/60 px-2 py-0.5 rounded-full animate-pulse">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        <span>x{player.streak}</span>
                      </span>
                    )}
                  </div>
                  {gainedPoints > 0 && (
                    <div className="text-[11px] text-emerald-400 font-medium">
                      +{gainedPoints} за этот вопрос
                    </div>
                  )}
                </div>
              </div>

              {/* Total Score */}
              <div className="text-right">
                <div className="text-lg md:text-xl font-mono font-black text-white">
                  {player.score.toLocaleString('ru-RU')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  баллов
                </div>
              </div>
            </div>
          );
        })}

        {sortedPlayers.length > 5 && (
          <div className="text-center text-xs text-slate-500 pt-2 font-medium">
            ...и еще {sortedPlayers.length - 5} игроков в зачете
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
