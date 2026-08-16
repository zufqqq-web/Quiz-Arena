import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, Quiz } from '../../types';
import { BarChart3, RotateCcw, Home } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { AnimatedCounter } from '../Common/AnimatedCounter';
import { podiumItemVariants, buttonHoverTap } from '../../utils/motionVariants';
import { useLanguage } from '../../contexts/LanguageContext';

interface HostPodiumProps {
  quiz: Quiz;
  players: Record<string, Player>;
  onOpenAnalytics: () => void;
  onPlayAgain: () => void;
  onExitToLibrary: () => void;
}

export function HostPodium({
  quiz,
  players,
  onOpenAnalytics,
  onPlayAgain,
  onExitToLibrary,
}: HostPodiumProps) {
  const { t } = useLanguage();
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  useEffect(() => {
    sounds.playVictory();

    // Trigger confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div id="host-podium" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">{quiz.coverEmoji}</span>
          <span className="text-sm font-bold text-white">{quiz.title}</span>
          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
            {t('host.finalPodium')}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            id="btn-open-host-analytics"
            variants={buttonHoverTap}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              sounds.playClick();
              onOpenAnalytics();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{t('host.analyticsBtn')}</span>
          </motion.button>

          <motion.button
            variants={buttonHoverTap}
            whileHover="hover"
            whileTap="tap"
            onClick={() => {
              sounds.playClick();
              onExitToLibrary();
            }}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t('host.returnHome')}</span>
          </motion.button>
        </div>
      </div>

      {/* Center 3D Pedestal Podium with Sequential Entrance */}
      <div className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center z-10">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl font-black text-center mb-10 text-white tracking-tight flex items-center gap-3"
        >
          <span>🏆</span>
          <span>{t('host.winnersTitle')}</span>
          <span>🏆</span>
        </motion.h1>

        <div className="w-full flex items-end justify-center gap-3 md:gap-6 pt-10">
          {/* 2nd Place */}
          {second && (
            <motion.div
              variants={podiumItemVariants(0.55)}
              initial="hidden"
              animate="visible"
              className="flex-1 max-w-[200px] flex flex-col items-center"
            >
              <div className="text-3xl mb-2">{second.avatarEmoji}</div>
              <div className="text-sm font-bold text-slate-200 truncate max-w-full mb-1">
                {second.nickname}
              </div>
              <div className="text-xs font-mono font-bold text-slate-400 mb-3">
                <AnimatedCounter value={second.score} duration={1000} /> {t('player.pts')}
              </div>
              <div className="w-full h-44 bg-gradient-to-b from-slate-800 to-slate-900 border-t-4 border-slate-400 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 font-mono font-black text-lg flex items-center justify-center mb-1 shadow-inner">
                  2
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  2nd
                </span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {first && (
            <motion.div
              variants={podiumItemVariants(1.1)}
              initial="hidden"
              animate="visible"
              className="flex-1 max-w-[220px] flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-2 filter drop-shadow-lg scale-110"
              >
                {first.avatarEmoji}
              </motion.div>
              <div className="text-base font-black text-[var(--accent-300)] truncate max-w-full mb-1 flex items-center gap-1">
                <span>👑</span>
                <span>{first.nickname}</span>
              </div>
              <div className="text-sm font-mono font-black text-[var(--accent-400)] mb-3">
                <AnimatedCounter value={first.score} duration={1200} /> {t('player.pts')}
              </div>
              <div className="w-full h-60 bg-gradient-to-b from-[var(--accent-subtle)] via-slate-900 to-slate-950 border-t-4 border-[var(--accent-400)] rounded-t-2xl flex flex-col items-center justify-center p-4 shadow-2xl ring-2 ring-[var(--accent-500)]/20">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-500)] text-slate-950 font-mono font-black text-2xl flex items-center justify-center mb-2 shadow-lg">
                  1
                </div>
                <span className="text-xs font-black text-[var(--accent-300)] uppercase tracking-widest">
                  1st
                </span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {third && (
            <motion.div
              variants={podiumItemVariants(0.15)}
              initial="hidden"
              animate="visible"
              className="flex-1 max-w-[200px] flex flex-col items-center"
            >
              <div className="text-3xl mb-2">{third.avatarEmoji}</div>
              <div className="text-sm font-bold text-slate-200 truncate max-w-full mb-1">
                {third.nickname}
              </div>
              <div className="text-xs font-mono font-bold text-slate-400 mb-3">
                <AnimatedCounter value={third.score} duration={800} /> {t('player.pts')}
              </div>
              <div className="w-full h-32 bg-gradient-to-b from-slate-800/90 to-slate-900 border-t-4 border-amber-700/80 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-lg">
                <div className="w-9 h-9 rounded-full bg-amber-900/60 text-amber-200 font-mono font-bold text-base flex items-center justify-center mb-1">
                  3
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  3rd
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="flex justify-center items-center gap-3 z-10"
      >
        <motion.button
          variants={buttonHoverTap}
          whileHover="hover"
          whileTap="tap"
          onClick={() => {
            sounds.playClick();
            onPlayAgain();
          }}
          className="flex items-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl border border-slate-800 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('host.playAgain')}</span>
        </motion.button>

        <motion.button
          variants={buttonHoverTap}
          whileHover="hover"
          whileTap="tap"
          onClick={() => {
            sounds.playClick();
            onOpenAnalytics();
          }}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-6 py-2.5 rounded-xl transition shadow-xl cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 text-slate-950" />
          <span>{t('host.analyticsBtn')} →</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
