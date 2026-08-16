import { Player, Quiz } from '../../types';
import { ArrowLeft, CheckCircle2, Clock, Award, BarChart3, HelpCircle, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { useLanguage } from '../../contexts/LanguageContext';

interface HostAnalyticsProps {
  quiz: Quiz;
  players: Record<string, Player>;
  onBackToPodium: () => void;
  onExit: () => void;
  onPlayAgain: () => void;
}

export function HostAnalytics({
  quiz,
  players,
  onBackToPodium,
  onExit,
  onPlayAgain,
}: HostAnalyticsProps) {
  const { t } = useLanguage();
  const playerList = Object.values(players);
  const totalPlayers = playerList.length;
  const totalQuestions = quiz.questions.length;

  // Calculate overall metrics
  let totalAnswersCount = 0;
  let totalCorrectCount = 0;
  let totalResponseTimeMs = 0;

  // Question diagnostics
  const questionStats = quiz.questions.map((q, idx) => {
    let qAnswerCount = 0;
    let qCorrectCount = 0;
    let qTotalTime = 0;

    playerList.forEach((p) => {
      const ans = p.answers?.[idx];
      if (ans) {
        qAnswerCount++;
        totalAnswersCount++;
        qTotalTime += ans.timeSpentMs;
        totalResponseTimeMs += ans.timeSpentMs;
        if (ans.isCorrect) {
          qCorrectCount++;
          totalCorrectCount++;
        }
      }
    });

    const accuracyPct = qAnswerCount > 0 ? Math.round((qCorrectCount / qAnswerCount) * 100) : 0;
    const avgTimeSec = qAnswerCount > 0 ? (qTotalTime / qAnswerCount / 1000).toFixed(1) : '0';

    return {
      index: idx + 1,
      title: q.title,
      type: q.type,
      timeLimit: q.timeLimit,
      accuracyPct,
      correctCount: qCorrectCount,
      totalCount: qAnswerCount,
      avgTimeSec,
    };
  });

  const overallAccuracy = totalAnswersCount > 0 ? Math.round((totalCorrectCount / totalAnswersCount) * 100) : 0;
  const avgOverallResponseTimeSec = totalAnswersCount > 0 ? (totalResponseTimeMs / totalAnswersCount / 1000).toFixed(1) : '0';

  // Find hardest question
  const hardestQuestion = [...questionStats].sort((a, b) => a.accuracyPct - b.accuracyPct)[0];

  // Sorted player rankings
  const rankedPlayers = [...playerList].sort((a, b) => b.score - a.score);

  // Export CSV
  const handleExportCSV = () => {
    sounds.playClick();
    const rows = [
      ['Ранг', 'Игрок', 'Баллы', 'Правильных ответов', 'Точность %', 'Макс. стрик', 'Тип'],
      ...rankedPlayers.map((p, i) => {
        const correctAnswers = Object.values(p.answers || {}).filter((a) => a.isCorrect).length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        return [
          i + 1,
          p.nickname,
          p.score,
          `${correctAnswers}/${totalQuestions}`,
          `${accuracy}%`,
          p.highestStreak || p.streak || 0,
          p.isBot ? 'Bot' : 'Player',
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quizcraft_analytics_${quiz.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="host-analytics-dashboard" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToPodium();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{quiz.coverEmoji}</span>
              <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
            </div>
            <p className="text-xs text-slate-400">{t('host.analyticsTitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t('host.exportCsv')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('host.playAgain')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onExit();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <span>{t('host.returnHome')}</span>
          </button>
        </div>
      </div>

      {/* Main Analytics Content Container */}
      <div className="max-w-6xl w-full mx-auto py-6 space-y-8 flex-1">
        {/* 1. Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>{t('host.totalAccuracy')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {overallAccuracy}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {totalCorrectCount} / {totalAnswersCount} {t('common.correct') || 'correct'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>{t('host.hardestQuestion')}</span>
              <HelpCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-sm font-bold text-white line-clamp-1">
              {hardestQuestion ? `#${hardestQuestion.index}` : '—'}
            </div>
            <div className="text-[11px] text-red-400 font-medium mt-1">
              {hardestQuestion ? `${hardestQuestion.accuracyPct}%` : '—'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>{t('host.avgResponseTime')}</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {avgOverallResponseTimeSec}s
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t('common.seconds')}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>{t('host.participants')}</span>
              <Award className="w-4 h-4 text-[var(--accent-400)]" />
            </div>
            <div className="text-3xl font-black font-mono text-[var(--accent-400)]">
              {totalPlayers}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {totalQuestions} {t('aiTemplate.questionsSuffix')}
            </div>
          </div>
        </div>

        {/* 2. Question-by-Question Performance Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>{t('host.questionStats')}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {quiz.questions.length} {t('aiTemplate.questionsSuffix')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">{t('editor.questionType')}</th>
                  <th className="pb-3">{t('host.accuracy')}</th>
                  <th className="pb-3">{t('host.avgResponseTime')}</th>
                  <th className="pb-3 pr-2 text-right">{t('common.correct')} / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {questionStats.map((q) => (
                  <tr key={q.index} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-500">{q.index}</td>
                    <td className="py-3.5 font-medium text-slate-200 max-w-xs truncate pr-4">
                      {q.title}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${
                              q.accuracyPct >= 70
                                ? 'bg-emerald-500'
                                : q.accuracyPct >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${q.accuracyPct}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            q.accuracyPct >= 70
                              ? 'text-emerald-400'
                              : q.accuracyPct >= 40
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {q.accuracyPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">
                      {q.avgTimeSec}s
                    </td>
                    <td className="py-3.5 pr-2 text-right font-mono font-semibold text-slate-300">
                      {q.correctCount} / {q.totalCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Detailed Players Performance Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--accent-400)]" />
              <span>{t('host.playerRankings')}</span>
            </h2>
            <span className="text-xs text-slate-500">{rankedPlayers.length} {t('host.participants')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">#</th>
                  <th className="pb-3">{t('player.joinTitle')}</th>
                  <th className="pb-3">{t('host.accuracy')}</th>
                  <th className="pb-3">Streak</th>
                  <th className="pb-3 pr-2 text-right">{t('player.score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rankedPlayers.map((p, idx) => {
                  const correctCount = Object.values(p.answers || {}).filter((a) => a.isCorrect).length;
                  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 pl-2 font-mono font-bold">
                        <span
                          className={`inline-block w-6 h-6 rounded-lg text-center leading-6 text-xs font-mono font-bold ${
                            idx === 0
                              ? 'bg-[var(--accent-500)] text-slate-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-800 text-amber-100'
                              : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.avatarEmoji}</span>
                          <span className="font-bold text-slate-200">{p.nickname}</span>
                          {p.isBot && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              bot
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 font-mono">
                        <span className={accuracy >= 70 ? 'text-emerald-400' : 'text-slate-300'}>
                          {correctCount}/{totalQuestions} ({accuracy}%)
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-orange-400 font-semibold">
                        🔥 x{p.highestStreak || p.streak || 0}
                      </td>
                      <td className="py-3.5 pr-2 text-right font-mono font-black text-sm text-white">
                        {p.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
