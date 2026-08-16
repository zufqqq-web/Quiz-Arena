import { useEffect } from 'react';
import { Question, Player } from '../../types';
import { Check, X, ArrowRight, Lightbulb, BarChart2 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface HostQuestionRevealProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  players: Record<string, Player>;
  onProceedToLeaderboard: () => void;
}

const OPTION_THEMES = [
  { bg: 'bg-red-500/10 border-red-500/30', symbol: '▲', labelColor: 'bg-red-500 text-white' },
  { bg: 'bg-blue-500/10 border-blue-500/30', symbol: '◆', labelColor: 'bg-blue-500 text-white' },
  { bg: 'bg-amber-500/10 border-amber-500/30', symbol: '●', labelColor: 'bg-amber-500 text-slate-950' },
  { bg: 'bg-emerald-500/10 border-emerald-500/30', symbol: '■', labelColor: 'bg-emerald-500 text-white' },
];

export function HostQuestionReveal({
  question,
  questionIndex,
  totalQuestions,
  players,
  onProceedToLeaderboard,
}: HostQuestionRevealProps) {
  const playerList = Object.values(players);
  const totalPlayers = playerList.length;

  useEffect(() => {
    sounds.playReveal();
  }, []);

  // Calculate stats for each option
  const optionVotes: Record<string, number> = {};
  question.options.forEach((opt) => {
    optionVotes[opt.id] = 0;
  });

  let correctCount = 0;

  playerList.forEach((p) => {
    const ans = p.answers?.[questionIndex];
    if (ans) {
      if (ans.isCorrect) correctCount++;
      ans.selectedOptionIds.forEach((optId) => {
        optionVotes[optId] = (optionVotes[optId] || 0) + 1;
      });
    }
  });

  const correctRatePercent = totalPlayers > 0 ? Math.round((correctCount / totalPlayers) * 100) : 0;

  return (
    <div id="host-question-reveal" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Результаты раунда {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Точность: <strong className={correctRatePercent >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{correctRatePercent}%</strong> ({correctCount}/{totalPlayers})
          </span>
        </div>

        <button
          id="btn-next-leaderboard"
          onClick={() => {
            sounds.playClick();
            onProceedToLeaderboard();
          }}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-5 py-2 rounded-xl transition shadow-lg cursor-pointer"
        >
          <span>Таблица лидеров</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center Question & Result Distribution Bars */}
      <div className="my-auto max-w-4xl w-full mx-auto flex flex-col gap-6 z-10">
        {/* Question Title */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
            {question.title}
          </h2>
        </div>

        {/* Options Breakdown Chart */}
        {(question.type === 'single' || question.type === 'multiple' || question.type === 'poll' || question.type === 'boolean') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt, idx) => {
              const theme = OPTION_THEMES[idx % OPTION_THEMES.length];
              const votes = optionVotes[opt.id] || 0;
              const votePct = totalPlayers > 0 ? Math.round((votes / totalPlayers) * 100) : 0;
              const isCorrect = opt.isCorrect;

              return (
                <div
                  key={opt.id}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                      : 'bg-slate-900 border-slate-800 opacity-70'
                  }`}
                >
                  {/* Progress Fill Background */}
                  <div
                    className={`absolute inset-0 transition-all duration-1000 ${
                      isCorrect ? 'bg-emerald-500/20' : 'bg-slate-800/40'
                    }`}
                    style={{ width: `${votePct}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${theme.labelColor}`}>
                        {theme.symbol}
                      </div>
                      <span className={`text-base font-bold ${isCorrect ? 'text-emerald-200' : 'text-slate-200'}`}>
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCorrect && (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                      <span className="font-mono text-sm font-bold bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                        {votes} ({votePct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Text Answer Reveal */}
        {question.type === 'text' && (
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 text-center shadow-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
              Правильный текстовый ответ:
            </span>
            <div className="text-2xl md:text-3xl font-mono font-black text-emerald-400">
              «{question.correctTextAnswer}»
            </div>
          </div>
        )}

        {/* Order Answer Reveal */}
        {question.type === 'order' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block mb-2">
              Правильная последовательность:
            </span>
            {[...question.options]
              .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((opt, idx) => (
                <div key={opt.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3 text-sm font-medium text-white">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{opt.text}</span>
                </div>
              ))}
          </div>
        )}

        {/* Educational Explanation Box */}
        {question.explanation && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs md:text-sm text-slate-300 backdrop-blur-md">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Разбор факта:</span>
              <span>{question.explanation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
}
