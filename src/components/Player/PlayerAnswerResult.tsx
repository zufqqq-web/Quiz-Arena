import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Player, Question, PlayerAnswer } from '../../types';
import { Check, X, Flame, Award, Zap } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { AnimatedCounter } from '../Common/AnimatedCounter';
import { shakeVariant } from '../../utils/motionVariants';

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
          Счет: <AnimatedCounter value={player.score} duration={600} />
        </div>
      </div>

      {/* Center Result Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="my-auto max-w-sm w-full mx-auto flex flex-col items-center z-10 space-y-6"
      >
        {isPoll ? (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-24 h-24 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center text-5xl shadow-2xl"
          >
            📊
          </motion.div>
        ) : isCorrect ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-5xl shadow-2xl ring-4 ring-emerald-500/20"
          >
            <Check className="w-12 h-12 stroke-[3]" />
          </motion.div>
        ) : (
          <motion.div
            variants={shakeVariant}
            animate="shake"
            initial={{ scale: 0.7, opacity: 0 }}
            className="w-24 h-24 rounded-3xl bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center text-5xl shadow-2xl"
          >
            <X className="w-12 h-12 stroke-[3]" />
          </motion.div>
        )}

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {isPoll ? 'Голос учтен!' : isCorrect ? 'Правильно!' : 'Неверно!'}
          </h2>
          {points > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base font-mono font-bold text-emerald-400 mt-1"
            >
              +{points} баллов
            </motion.div>
          ) : (
            <div className="text-xs text-slate-500 mt-1">
              {isPoll ? 'Спасибо за участие в опросе' : '+0 баллов'}
            </div>
          )}
        </div>

        {/* Streak bonus card */}
        {player.streak >= 2 && isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: [1, 1.04, 1] }}
            transition={{ duration: 0.5 }}
            className="bg-orange-950/60 border border-orange-800/80 text-orange-300 px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg"
          >
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span>
              Серия: x{player.streak} подряд! {answer?.streakMultiplier && answer.streakMultiplier > 1 && `(Множитель ×${answer.streakMultiplier})`}
            </span>
          </motion.div>
        )}

        {/* Shield protection notification */}
        {answer?.shieldProtected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg"
          >
            <span>🛡️</span>
            <span>Щит спас вашу серию побед от сгорания!</span>
          </motion.div>
        )}

        {/* 2x points notification */}
        {answer?.powerUpUsed === 'double_points' && isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/60 border border-purple-800/80 text-purple-300 px-4 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Бонус 2x удвоения очков применен!</span>
          </motion.div>
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
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
