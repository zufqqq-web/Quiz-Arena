import { useEffect, useState } from 'react';
import { Question, Player } from '../../types';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/sound';

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
  const playerList = Object.values(players);
  const answeredCount = playerList.filter(
    (p) => p.answers && p.answers[questionIndex] !== undefined
  ).length;

  const isAllAnswered = playerList.length > 0 && answeredCount >= playerList.length;

  // Sound tick in last 5 seconds
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      sounds.playTick(true);
    }
  }, [timeRemaining]);

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  return (
    <div id="host-question-active" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Top Status Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Вопрос {questionIndex + 1} из {totalQuestions}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {question.type === 'boolean'
              ? 'Правда / Ложь'
              : question.type === 'multiple'
              ? 'Несколько ответов'
              : question.type === 'order'
              ? 'Правильный порядок'
              : question.type === 'text'
              ? 'Ввод текста'
              : question.type === 'poll'
              ? 'Опрос аудитории'
              : 'Один верный ответ'}
          </span>
        </div>

        {/* Answer Counter + Skip Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <Users className="w-4 h-4 text-slate-400" />
            <span className={answeredCount === playerList.length ? 'text-emerald-400' : 'text-white'}>
              {answeredCount} / {playerList.length} ответили
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onTimeUpOrSkip();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>Вскрыть ответы</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Question Prompt Area & Timer */}
      <div className="my-auto max-w-5xl w-full mx-auto flex flex-col items-center z-10 text-center">
        {/* Giant Timer Ring / Badge */}
        <div className="mb-4 flex items-center justify-center">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center font-mono font-black text-2xl md:text-3xl transition-all shadow-xl ${
              timeRemaining <= 5
                ? 'border-red-500 bg-red-950/40 text-red-400 scale-110 animate-pulse'
                : 'border-slate-700 bg-slate-900 text-white'
            }`}
          >
            {timeRemaining}
          </div>
        </div>

        {/* Question Title Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl w-full">
          <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">
            {question.title}
          </h1>

          {/* Optional Media Image */}
          {question.imageUrl && (
            <div className="mt-4 max-h-56 overflow-hidden rounded-2xl border border-slate-800 flex items-center justify-center bg-black/40">
              <img
                src={question.imageUrl}
                alt="Question media"
                referrerPolicy="no-referrer"
                className="max-h-56 w-auto object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Question Options Grid Presentation */}
      <div className="max-w-5xl w-full mx-auto z-10">
        {/* Timer Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full mb-4 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timeRemaining <= 5 ? 'bg-red-500' : 'bg-slate-200'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Choices Display (for Single, Multi, Poll, Boolean) */}
        {(question.type === 'single' || question.type === 'multiple' || question.type === 'poll') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {question.options.map((opt, idx) => {
              const theme = OPTION_THEMES[idx % OPTION_THEMES.length];
              return (
                <div
                  key={opt.id}
                  className={`rounded-2xl border-2 p-4 flex items-center gap-3.5 backdrop-blur-md ${theme.bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${theme.labelColor}`}>
                    {theme.symbol}
                  </div>
                  <span className="text-base md:text-lg font-semibold text-white">
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => {
              const isTrue = opt.text.toLowerCase().includes('правда') || opt.text.toLowerCase().includes('true');
              return (
                <div
                  key={opt.id}
                  className={`rounded-2xl border-2 p-6 flex items-center justify-center gap-4 text-xl font-bold ${
                    isTrue
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/50 text-red-300'
                  }`}
                >
                  <span className="text-3xl">{isTrue ? '✅' : '❌'}</span>
                  <span>{opt.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'order' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300">
            <span className="text-amber-400 font-semibold">Игроки упорядочивают элементы на своих устройствах...</span>
          </div>
        )}

        {question.type === 'text' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300">
            <span className="text-pink-400 font-semibold">Игроки вводят точный текстовый ответ на своих экранах...</span>
          </div>
        )}

        {question.type === 'number' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-300">
            <span className="text-blue-400 font-semibold">Игроки вводят числовое значение на своих экранах...</span>
          </div>
        )}
      </div>
    </div>
  );
}
