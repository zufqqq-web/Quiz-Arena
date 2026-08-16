import React, { useState, useRef } from 'react';
import { Quiz } from '../../types';
import { storage } from '../../utils/storage';
import { sounds } from '../../utils/sound';
import {
  Play,
  Plus,
  Edit3,
  Copy,
  Download,
  Upload,
  Sparkles,
  Gamepad2,
  Trophy,
  Zap,
  Shield,
  BarChart3,
  Layers,
  ArrowRight,
  Volume2,
  VolumeX,
  HelpCircle,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Smartphone,
  Cpu,
  Bot,
} from 'lucide-react';

interface HomePageProps {
  quizzes: Quiz[];
  onCreateNewQuiz: () => void;
  onOpenLibrary: () => void;
  onHostQuiz: (quiz: Quiz) => void;
  onEditQuiz: (quizId: string) => void;
  onJoinAsPlayer: (pin?: string) => void;
  onRefreshList: () => void;
}

export function HomePage({
  quizzes,
  onCreateNewQuiz,
  onOpenLibrary,
  onHostQuiz,
  onEditQuiz,
  onJoinAsPlayer,
  onRefreshList,
}: HomePageProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const recentQuizzes = [...quizzes]
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
    .slice(0, 4);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) {
      setPinError('Введите 6-значный PIN комнаты');
      return;
    }
    sounds.playClick();
    onJoinAsPlayer(cleanPin);
  };

  const handleQuickDemoHost = () => {
    sounds.playClick();
    if (quizzes.length > 0) {
      onHostQuiz(quizzes[0]);
    } else {
      const demo = storage.createNewQuizTemplate();
      storage.saveQuiz(demo);
      onHostQuiz(demo);
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

  return (
    <div id="quizcraft-home-page" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none font-sans relative overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-0 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-white/5 border border-white/20">
            QC
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>QuizCraft</span>
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Интерактивный конструктор и Квиз-Арена</p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden md:flex items-center gap-1 mr-2 text-xs font-semibold text-slate-300">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLibrary();
              }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition cursor-pointer"
            >
              Библиотека ({totalQuizzes})
            </button>
            <a
              href="#features-section"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition cursor-pointer"
            >
              Возможности
            </a>
            <a
              href="#how-it-works-section"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition cursor-pointer"
            >
              Как это работает
            </a>
          </nav>

          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'
                : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            id="nav-join-player-btn"
            onClick={() => {
              sounds.playClick();
              onJoinAsPlayer();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Войти как</span> Игрок
          </button>

          <button
            id="nav-create-quiz-btn"
            onClick={() => {
              sounds.playClick();
              onCreateNewQuiz();
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-slate-100 hover:bg-white text-slate-950 px-4 py-2.5 rounded-xl transition shadow-lg shadow-white/5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать квиз</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* ================= HERO SECTION ================= */}
        <section id="hero-section" className="relative flex flex-col items-center text-center space-y-6 pt-4 sm:pt-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/60 px-4 py-1.5 rounded-full shadow-inner animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Платформа для живых викторин, тестов и опросов</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Создавайте викторины. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
                Зажигайте арену.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Полноценный конструктор интерактивных квизов и многопользовательская комната в реальном времени. 7 форматов вопросов, карточки усилений, боевой режим со стриками и подробная аналитика.
            </p>
          </div>

          {/* Central PIN Join Box & Primary CTAs */}
          <div className="w-full max-w-xl mx-auto space-y-4 pt-2">
            {/* Quick PIN Input Card */}
            <form
              onSubmit={handlePinSubmit}
              className="bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-500/60 focus-within:border-indigo-400 rounded-3xl p-3 sm:p-4 backdrop-blur-xl shadow-2xl transition flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="flex-1 w-full flex items-center gap-3 px-3">
                <span className="text-xl">🎮</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="Введите PIN (например 847291)"
                  className="w-full bg-transparent text-lg sm:text-xl font-mono font-bold text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Присоединиться</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {pinError && <p className="text-xs text-rose-400 text-center">{pinError}</p>}

            {/* Quick Secondary Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="hero-create-btn"
                onClick={() => {
                  sounds.playClick();
                  onCreateNewQuiz();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 text-xs sm:text-sm font-extrabold transition shadow-lg shadow-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Создать новый квиз</span>
              </button>

              <button
                id="hero-library-btn"
                onClick={() => {
                  sounds.playClick();
                  onOpenLibrary();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Библиотека квизов ({totalQuizzes})</span>
              </button>

              <button
                id="hero-demo-host-btn"
                onClick={handleQuickDemoHost}
                className="px-4 py-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80 text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
                title="Быстрый запуск игры с готовым квизом"
              >
                <Play className="w-3.5 h-3.5 fill-slate-300" />
                <span>Быстрый тест (Хост)</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= LOCAL STATS BENTO BAR ================= */}
        <section id="stats-section" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Квизов создано</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalQuizzes}</div>
            <p className="text-[11px] text-slate-500 mt-1">Доступно в хранилище</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Всего вопросов</span>
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalQuestions}</div>
            <p className="text-[11px] text-slate-500 mt-1">Готово к запуску</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Форматы вопросов</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">7 типов</div>
            <p className="text-[11px] text-slate-500 mt-1">Один, Мульти, Текст, Число, Опрос...</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Мультиплеер</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">Арена + Боты</div>
            <p className="text-[11px] text-slate-500 mt-1">Стрики, 50/50, Щиты, 2x Очки</p>
          </div>
        </section>

        {/* ================= QUICK ACTIONS BENTO GRID ================= */}
        <section id="quick-actions-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Быстрые действия</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Create New */}
            <div
              onClick={() => {
                sounds.playClick();
                onCreateNewQuiz();
              }}
              className="group bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Конструктор квиза
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Создайте викторину с нуля: настройте время, баллы, типы вопросов и медиа.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-amber-400">
                <span>Открыть редактор</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Action 2: Open Library */}
            <div
              onClick={() => {
                sounds.playClick();
                onOpenLibrary();
              }}
              className="group bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Библиотека квизов
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Управляйте тестами, ищите по категориям, дублируйте и запускайте.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-indigo-400">
                <span>Перейти в каталог</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Action 3: Player Join */}
            <div
              onClick={() => {
                sounds.playClick();
                onJoinAsPlayer();
              }}
              className="group bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    Экран игрока
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Подключитесь к комнате с устройства, выберите аватар и участвуйте в битве.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>Войти по PIN</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Action 4: Import JSON */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Импорт из JSON
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Загрузите готовый набор вопросов из файла или перенесите квиз с другого ПК.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>Выбрать файл JSON</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* ================= RECENT QUIZZES ================= */}
        <section id="recent-quizzes-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Последние созданные квизы</h2>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLibrary();
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Смотреть все ({totalQuizzes})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 inline-block shadow-inner">
                      {quiz.coverEmoji || '🎯'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full">
                      {quiz.questions.length} вопр.
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Без описания'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onEditQuiz(quiz.id);
                    }}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                    title="Редактировать"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onHostQuiz(quiz);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-3.5 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Хост</span>
                  </button>
                </div>
              </div>
            ))}

            {recentQuizzes.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-3">
                <p className="text-sm text-slate-400">У вас пока нет квизов. Создайте первый прямо сейчас!</p>
                <button
                  onClick={onCreateNewQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold hover:bg-white transition"
                >
                  Создать квиз
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= PLATFORM FEATURES (BENTO GRID) ================= */}
        <section id="features-section" className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Возможности QuizCraft
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Всё необходимое для проведения увлекательных интеллектуальных баталий в аудитории или онлайн.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1: 7 Question Formats */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">7 разнообразных форматов</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Один выбор, чекбоксы, Правда/Ложь, ввод текста, числовые ответы с погрешностью, сортировка хронологии и опросы мнений.
              </p>
            </div>

            {/* Feature 2: Battle Royale & Multipliers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Боевой режим и стрики</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Динамические множители (x1.1, x1.25, x1.5) за серии правильных ответов, перемещение в рейтинге и азарт за первое место.
              </p>
            </div>

            {/* Feature 3: Power-ups */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Карточки усилений</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Игроки могут тактически использовать 50/50, 2x удвоение очков или активировать Щит для защиты серии от сгорания.
              </p>
            </div>

            {/* Feature 4: Smart Bot Simulator */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Симулятор виртуальных ботов</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Добавляйте реалистичных ботов с разным временем реакции и точностью, чтобы протестировать квиз без других людей.
              </p>
            </div>

            {/* Feature 5: Author Analytics */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Глубокая аналитика автора</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Автоматическое выявление сложных и простых вопросов, графики распределения ответов и экспорт подробного отчёта в CSV.
              </p>
            </div>

            {/* Feature 6: Sound & Live Reactions */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Звуки и живые реакции</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Синтезированное звуковое сопровождение таймера и подиума, а также всплывающие эмодзи-реакции прямо во время раунда.
              </p>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (STEP BY STEP) ================= */}
        <section id="how-it-works-section" className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Как это работает
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Всего 4 простых шага от идеи до интерактивной игры со зрителями.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-sm flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-white">Создайте квиз</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Добавьте вопросы в интуитивном редакторе, настройте лимиты времени, баллы и загрузите медиа.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-mono font-bold text-sm flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-white">Запустите лобби</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Выведите экран хоста на проектор или в Zoom/Discord и покажите сгенерированный 6-значный PIN.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-purple-400 font-mono font-bold text-sm flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-white">Участники играют</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Игроки вводят PIN со смартфонов, отвечают на скорость, шлют реакции и используют усиления.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center">
                04
              </div>
              <h3 className="text-base font-bold text-white">Итоги и аналитика</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Торжественный подиум победителей с конфетти и подробная статистика ответов для ведущего.
              </p>
            </div>
          </div>
        </section>

        {/* ================= FINAL CALL TO ACTION ================= */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3 z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Готовы провести свой квиз?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Запустите готовый тест или соберите собственный за пару минут. Никакой сложной регистрации.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 z-10">
            <button
              onClick={() => {
                sounds.playClick();
                onCreateNewQuiz();
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-extrabold text-sm transition shadow-xl cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Создать квиз</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onOpenLibrary();
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition cursor-pointer flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Открыть библиотеку</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-8 mt-12 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold">
          <span>QuizCraft</span>
          <span>•</span>
          <span>Интерактивный конструктор и Квиз-Арена</span>
        </div>
        <p>Все данные сохраняются локально в вашем браузере (LocalStorage). Доступно в офлайн-режиме.</p>
      </footer>
    </div>
  );
}
