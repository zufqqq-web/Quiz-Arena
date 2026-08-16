import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, Quiz } from '../../types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { AnimatedCounter } from '../Common/AnimatedCounter';
import { staggerContainer, staggerItem, buttonHoverTap } from '../../utils/motionVariants';
import { useLanguage } from '../../contexts/LanguageContext';

interface PlayerPodiumResultProps {
  player: Player;
  quiz: Quiz;
  rank: number;
  totalPlayers: number;
  onExit: () => void;
}

export function PlayerPodiumResult({
  player,
  quiz,
  rank,
  totalPlayers: _totalPlayers,
  onExit,
}: PlayerPodiumResultProps) {
  const { t } = useLanguage();
  const isTop3 = rank <= 3;
  const correctCount = Object.values(player.answers || {}).filter((a) => a.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Personal Badge Assignment
  let badgeTitle = 'Scholar';
  let badgeEmoji = '🧠';
  let badgeDesc = 'Solid and steady performance';

  if (rank === 1) {
    badgeTitle = 'Champion';
    badgeEmoji = '👑';
    badgeDesc = '1st place';
  } else if (player.highestStreak >= 3) {
    badgeTitle = 'Streak Master';
    badgeEmoji = '🔥';
    badgeDesc = `Streak of ${player.highestStreak}`;
  } else if (accuracyPct >= 80) {
    badgeTitle = 'Sharpshooter';
    badgeEmoji = '🎯';
    badgeDesc = `${accuracyPct}% accuracy`;
  }

  useEffect(() => {
    if (isTop3) {
      sounds.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      sounds.playCorrect();
    }
  }, [isTop3]);

  return (
    <div id="player-podium-result" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{quiz.coverEmoji}</span>
          <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">{quiz.title}</span>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer transition"
        >
          {t('host.returnHome')}
        </button>
      </div>

      {/* Main Certificate Card with Stagger */}
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="show"
        className="my-auto max-w-md w-full mx-auto space-y-6 z-10"
      >
        <motion.div
          variants={staggerItem}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl backdrop-blur-xl"
        >
          {/* Avatar & Place Ring */}
          <div className="relative inline-block mx-auto">
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-5xl shadow-xl"
            >
              {player.avatarEmoji}
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
              className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full font-mono font-black text-sm flex items-center justify-center border-2 border-slate-900 shadow-md ${
                rank === 1
                  ? 'bg-[var(--accent-500)] text-slate-950 font-bold'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-950'
                  : rank === 3
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              #{rank}
            </motion.div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">{player.nickname}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {rank === 1
                ? '🎉 Congratulations on your victory!'
                : isTop3
                ? '👏 Podium finish! Great job!'
                : 'Quiz completed, thanks for playing!'}
            </p>
          </div>

          {/* Key Score & Accuracy Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {t('player.score')}
              </div>
              <div className="text-xl font-black font-mono text-white mt-1">
                <AnimatedCounter value={player.score} duration={800} />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {t('host.accuracy')}
              </div>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {correctCount}/{totalQuestions} ({accuracyPct}%)
              </div>
            </div>
          </div>

          {/* Personal Badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
              {badgeEmoji}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{badgeTitle}</span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                  Badge
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{badgeDesc}</div>
            </div>
          </div>
        </motion.div>

        {/* Answers Breakdown Accordion List */}
        <motion.div
          variants={staggerItem}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('host.questionStats')}
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {quiz.questions.map((q, idx) => {
              const ans = player.answers?.[idx];
              const isCorrect = ans?.isCorrect ?? false;
              return (
                <div
                  key={q.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="text-slate-300 truncate font-medium">
                      {idx + 1}. {q.title}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">
                    +{ans?.pointsEarned || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.button
          variants={buttonHoverTap}
          whileHover="hover"
          whileTap="tap"
          onClick={onExit}
          className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition shadow-xl cursor-pointer"
        >
          {t('host.returnHome')}
        </motion.button>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
