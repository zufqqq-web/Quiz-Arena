import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, Player } from '../../types';
import { Users, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import { useLanguage } from '../../contexts/LanguageContext';

interface HostQuestionActiveProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalTime: number;
  players: Record<string, Player>;
  onTimeUpOrSkip: () => void;
}

const OPTION_THEMES = [
  { bg: 'bg-red-500/15 border-red-500/40 text-red-100', symbol: '▲', labelColor: 'bg-red-500 text-white' },
  { bg: 'bg-blue-500/15 border-blue-500/40 text-blue-100', symbol: '◆', labelColor: 'bg-blue-500 text-white' },
  { bg: 'bg-amber-500/15 border-amber-500/40 text-amber-100', symbol: '●', labelColor: 'bg-amber-500 text-slate-950' },
  { bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100', symbol: '■', labelColor: 'bg-emerald-500 text-white' },
];

export function HostQuestionActive({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  totalTime,
  players,
  onTimeUpOrSkip,
}: HostQuestionActiveProps) {
  const { t } = useLanguage();
  const playerList = Object.values(players);
  const answeredCount = playerList.filter(
    (p) => p.answers && p.answers[questionIndex] !== undefined
  ).length;

  // Sound tick in last 5 seconds
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      sounds.playTick(true);
    }
  }, [timeRemaining]);

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isUrgent = timeRemaining <= 5;

  const getTypeName = (type: Question['type']) => {
    switch (type) {
      case 'boolean': return t('editor.trueFalse');
      case 'multiple': return t('editor.multipleChoice');
      case 'order': return t('editor.orderSequence');
      case 'text': return t('editor.textInput');
      case 'poll': return t('editor.pollSurvey');
      case 'number': return t('editor.numberInput');
      default: return t('editor.singleChoice');
    }
  };

  return (
    <div id="host-question-active" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Top Status Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            {t('host.questionCounter', { current: questionIndex + 1, total: totalQuestions })}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {getTypeName(question.type)}
          </span>
        </div>

        {/* Answer Counter + Skip Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <Users className="w-4 h-4 text-slate-400" />
            <span className={answeredCount === playerList.length ? 'text-emerald-400' : 'text-white'}>
              {t('host.answeredCount', { count: answeredCount, total: playerList.length })}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onTimeUpOrSkip();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>{t('host.revealAnswers')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Question Prompt Area & Timer */}
      <div className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center z-10 text-center py-4">
        {/* Giant Smooth Timer Ring / Badge */}
        <div className="mb-4 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isUrgent ? [1, 1.08, 1] : 1,
              borderColor: isUrgent ? '#ef4444' : '#334155',
              backgroundColor: isUrgent ? 'rgba(69, 10, 10, 0.6)' : 'rgba(15, 23, 42, 0.95)',
              color: isUrgent ? '#f87171' : '#ffffff',
              boxShadow: isUrgent
                ? '0 0 30px rgba(239, 68, 68, 0.45)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            transition={{
              scale: isUrgent ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
              duration: 0.3,
            }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center font-mono font-black text-2xl md:text-3xl"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={timeRemaining}
                initial={{ opacity: 0.6, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.6, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                {timeRemaining}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Question Title Box */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl w-full"
        >
          <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">
            {question.title}
          </h1>

          {/* Optional Media Image */}
          {question.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="mt-4 max-h-56 overflow-hidden rounded-2xl border border-slate-800 flex items-center justify-center bg-black/40"
            >
              <img
                src={question.imageUrl}
                alt="Question media"
                referrerPolicy="no-referrer"
                className="max-h-56 w-auto object-contain rounded-xl"
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Question Options Grid Presentation */}
      <div className="max-w-5xl w-full mx-auto z-10">
        {/* Timer Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full mb-4 overflow-hidden border border-slate-800">
          <motion.div
            className="h-full"
            animate={{
              width: `${progressPercent}%`,
              backgroundColor: isUrgent ? '#ef4444' : '#e2e8f0',
            }}
            transition={{
              width: { duration: 1, ease: 'linear' },
              backgroundColor: { duration: 0.3 },
            }}
          />
        </div>

        {/* Choices Display (for Single, Multi, Poll) */}
        {(question.type === 'single' || question.type === 'multiple' || question.type === 'poll') && (
          <motion.div
            variants={staggerContainer(0.06, 0.05)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {question.options.map((opt, idx) => {
              const theme = OPTION_THEMES[idx % OPTION_THEMES.length];
              return (
                <motion.div
                  key={opt.id}
                  variants={staggerItem}
                  className={`rounded-2xl border-2 p-4 flex items-center gap-3.5 backdrop-blur-md ${theme.bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${theme.labelColor}`}>
                    {theme.symbol}
                  </div>
                  <span className="text-base md:text-lg font-semibold text-white">
                    {opt.text}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {question.type === 'boolean' && (
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {question.options.map((opt) => {
              const isTrue =
                opt.text.toLowerCase().includes('правда') ||
                opt.text.toLowerCase().includes('true') ||
                opt.text.toLowerCase().includes('to\'g\'ri') ||
                opt.text.toLowerCase().includes('haqiqat');
              return (
                <motion.div
                  key={opt.id}
                  variants={staggerItem}
                  className={`rounded-2xl border-2 p-6 flex items-center justify-center gap-4 text-xl font-bold ${
                    isTrue
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/50 text-red-300'
                  }`}
                >
                  <span className="text-3xl">{isTrue ? '✅' : '❌'}</span>
                  <span>{opt.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {question.type === 'order' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300"
          >
            <span className="text-[var(--accent-300)] font-semibold">{t('host.playersAnswering')}</span>
          </motion.div>
        )}

        {question.type === 'text' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300"
          >
            <span className="text-pink-400 font-semibold">{t('host.playersAnswering')}</span>
          </motion.div>
        )}

        {question.type === 'number' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300"
          >
            <span className="text-blue-400 font-semibold">{t('host.playersAnswering')}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
