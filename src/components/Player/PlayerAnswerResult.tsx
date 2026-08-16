import { useEffect } from 'react';
import { Player, Question, PlayerAnswer } from '../../types';
import { Check, X, Flame, Award, Zap } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface PlayerAnswerResultProps {
  player: Player;
  question: Question;
  questionIndex: number;
  answer?: PlayerAnswer;
  rank: number;
  totalPlayers: number;
}

export function PlayerAnswerResult({
  player,
  question,
  questionIndex,
  answer,
  rank,
  totalPlayers,
}: PlayerAnswerResultProps) {
  const isCorrect = answer?.isCorrect ?? false;
  const points = answer?.pointsEarned ?? 0;
  const isPoll = question.type === 'poll';

  useEffect(() => {
    if (isPoll) {
      sounds.playCorrect();
    } else if (isCorrect) {
      sounds.playCorrect();
      if (player.streak >= 2) {
        setTimeout(() => sounds.playStreak(player.streak), 300);
      }
    } else {
      sounds.playWrong();
    }
  }, [isCorrect, isPoll, player.streak]);

  return (
    <div id="player-answer-result" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden text-center font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">{player.avatarEmoji}</span>
          <span className="text-xs font-bold text-slate-300">{player.nickname}</span>
        </div>

        <div className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          Счет: {player.score.toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Center Result Banner */}
      <div className="my-auto max-w-sm w-full mx-auto flex flex-col items-center z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {isPoll ? (
          <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center text-5xl shadow-2xl">
            📊
          </div>
        ) : isCorrect ? (
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-5xl shadow-2xl ring-4 ring-emerald-500/20 animate-pulse">
            <Check className="w-12 h-12 stroke-[3]" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center text-5xl shadow-2xl">
            <X className="w-12 h-12 stroke-[3]" />
          </div>
        )}

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {isPoll ? 'Голос учтен!' : isCorrect ? 'Правильно!' : 'Неверно!'}
          </h2>
          {points > 0 ? (
            <div className="text-base font-mono font-bold text-emerald-400 mt-1">
              +{points} баллов
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-1">
              {isPoll ? 'Спасибо за участие в опросе' : '+0 баллов'}
            </div>
          )}
        </div>

        {/* Streak bonus card */}
        {player.streak >= 2 && isCorrect && (
          <div className="bg-orange-950/60 border border-orange-800/80 text-orange-300 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg animate-bounce">
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span>Серия побед: x{player.streak} подряд! (+{answer?.streakBonus || 100} бонус)</span>
          </div>
        )}

        {/* Rank Standing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Текущая позиция:</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {rank} из {totalPlayers}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Смотрите подробный разбор на главном экране ведущего...
        </p>
      </div>

      <div className="h-6" />
    </div>
  );
}
