import React, { useState, useRef } from 'react';
import { Quiz } from '../../types';
import { storage } from '../../utils/storage';
import { Play, Plus, Edit3, Copy, Trash2, Download, Upload, Search, Volume2, VolumeX, Sparkles, Trophy, Gamepad2, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface QuizLibraryProps {
  quizzes: Quiz[];
  onSelectQuizToHost: (quiz: Quiz) => void;
  onEditQuiz: (quizId: string) => void;
  onCreateNewQuiz: () => void;
  onJoinAsPlayer: (pin?: string) => void;
  onRefreshList: () => void;
  onBackToHome?: () => void;
}

export function QuizLibrary({
  quizzes,
  onSelectQuizToHost,
  onEditQuiz,
  onCreateNewQuiz,
  onJoinAsPlayer,
  onRefreshList,
  onBackToHome,
}: QuizLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [pinInput, setPinInput] = useState('');
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Все', ...Array.from(new Set(quizzes.map((q) => q.category || 'Общий')))];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Все' || (q.category || 'Общий') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const handleDuplicate = (quizId: string) => {
    sounds.playClick();
    storage.duplicateQuiz(quizId);
    onRefreshList();
  };

  const handleDelete = (quizId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот квиз?')) {
      sounds.playClick();
      storage.deleteQuiz(quizId);
      onRefreshList();
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((q) => storage.saveQuiz(q));
        } else if (parsed && parsed.title && parsed.questions) {
          storage.saveQuiz(parsed);
        }
        sounds.playCorrect();
        onRefreshList();
      } catch (err) {
        alert('Ошибка при чтении JSON файла');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleQuickJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();
    if (clean) {
      sounds.playClick();
      onJoinAsPlayer(clean);
    }
  };

  return (
    <div id="quiz-library-view" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div
          onClick={() => {
            if (onBackToHome) {
              sounds.playClick();
              onBackToHome();
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Вернуться на главную страницу"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-white text-slate-950 flex items-center justify-center font-black text-lg shadow-md transition-transform group-hover:scale-105">
            QC
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-amber-300 tracking-tight flex items-center gap-2 transition-colors">
              <span>QuizCraft</span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                Библиотека
              </span>
            </div>
            <p className="text-[11px] text-slate-500">← На главную</p>
          </div>
        </div>

        {/* Quick Join + Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick PIN Join Field */}
          <form onSubmit={handleQuickJoinSubmit} className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN комнаты..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="bg-transparent text-xs px-2.5 py-1 text-white placeholder:text-slate-500 font-mono w-28 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!pinInput.trim()}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer"
            >
              Войти
            </button>
          </form>

          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'
                : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            id="btn-join-pin-main"
            onClick={() => {
              sounds.playClick();
              onJoinAsPlayer();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span>Экран Игрока</span>
          </button>

          <button
            id="btn-create-quiz-top"
            onClick={() => {
              sounds.playClick();
              onCreateNewQuiz();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать квиз</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Banner Area */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Интерактивная среда для викторин</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Создавайте квизы. Запускайте арену.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Разнообразные типы вопросов (один выбор, чекбоксы, правда/ложь, порядок, текст, опрос), живые реакции, адаптивные таймеры и моментальная синхронизация с игроками.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 z-10">
            <button
              onClick={() => {
                sounds.playClick();
                onCreateNewQuiz();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Новый квиз</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Импорт JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или описанию..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition"
            />
          </div>

          {/* Categories Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-200 text-slate-950 border-slate-200 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 inline-block shadow-inner">
                    {quiz.coverEmoji || '🎯'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full">
                    {quiz.questions.length} вопр. • {quiz.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1.5">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Без описания'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditQuiz(quiz.id)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                    title="Редактировать в конструкторе"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(quiz.id)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                    title="Создать копию"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => storage.exportQuizAsJSON(quiz)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                    title="Экспорт в JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-xl transition"
                    title="Удалить квиз"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectQuizToHost(quiz);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-3.5 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Хост</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-3">
            <p className="text-sm text-slate-400">Квизы не найдены по текущему запросу</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Все');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
