import { useState, useEffect } from 'react';
import { Quiz, Question } from '../../types';
import { storage } from '../../utils/storage';
import { validateQuiz, ValidationError } from '../../utils/quizValidator';
import { QuestionSlideList } from './QuestionSlideList';
import { QuestionCanvas } from './QuestionCanvas';
import { QuestionSettings } from './QuestionSettings';
import { QuizMetaModal } from './QuizMetaModal';
import { AITemplateModal } from './AITemplateModal';
import { Play, Settings, Sparkles, ArrowLeft, Save, Download, AlertCircle, LayoutGrid, Sliders, Edit3 } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface QuizEditorProps {
  quizId: string;
  onBack: () => void;
  onLaunchQuiz: (quiz: Quiz) => void;
}

export function QuizEditor({ quizId, onBack, onLaunchQuiz }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [mobileTab, setMobileTab] = useState<'slides' | 'canvas' | 'settings'>('canvas');

  // Load Quiz
  useEffect(() => {
    const quizzes = storage.getQuizzes();
    const found = quizzes.find((q) => q.id === quizId);
    if (found) {
      setQuiz(found);
    } else {
      const newTpl = storage.createNewQuizTemplate();
      newTpl.id = quizId.startsWith('quiz-') ? quizId : 'quiz-' + quizId;
      setQuiz(newTpl);
      storage.saveQuiz(newTpl);
    }
  }, [quizId]);

  // Auto-save debounced or on change
  const handleUpdateQuiz = (updated: Quiz) => {
    setQuiz(updated);
    storage.saveQuiz(updated);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 1800);

    // clear validation errors on edit
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setShowValidationAlert(false);
    }
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (!quiz) return;
    const newQuestions = [...quiz.questions];
    newQuestions[selectedSlideIndex] = updatedQuestion;
    handleUpdateQuiz({ ...quiz, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    if (!quiz) return;
    sounds.playClick();
    const newQ = storage.createDefaultQuestion('single');
    const newQuestions = [...quiz.questions, newQ];
    handleUpdateQuiz({ ...quiz, questions: newQuestions });
    setSelectedSlideIndex(newQuestions.length - 1);
    setMobileTab('canvas');
  };

  const handleDeleteQuestion = (index: number) => {
    if (!quiz || quiz.questions.length <= 1) return;
    sounds.playClick();
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    handleUpdateQuiz({ ...quiz, questions: newQuestions });
    if (selectedSlideIndex >= newQuestions.length) {
      setSelectedSlideIndex(newQuestions.length - 1);
    }
  };

  const handleDuplicateQuestion = (index: number) => {
    if (!quiz) return;
    sounds.playClick();
    const original = quiz.questions[index];
    const duplicate: Question = {
      ...original,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: `${original.title} (Копия)`,
      options: original.options.map((o) => ({
        ...o,
        id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      })),
    };
    const newQuestions = [...quiz.questions];
    newQuestions.splice(index + 1, 0, duplicate);
    handleUpdateQuiz({ ...quiz, questions: newQuestions });
    setSelectedSlideIndex(index + 1);
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (!quiz || toIndex < 0 || toIndex >= quiz.questions.length) return;
    sounds.playClick();
    const list = [...quiz.questions];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    handleUpdateQuiz({ ...quiz, questions: list });
    setSelectedSlideIndex(toIndex);
  };

  const handleApplyTemplates = (newQuestions: Question[]) => {
    if (!quiz) return;
    sounds.playCorrect();
    const combined = [...quiz.questions, ...newQuestions];
    handleUpdateQuiz({ ...quiz, questions: combined });
    setSelectedSlideIndex(quiz.questions.length);
  };

  const handleLaunchWithValidation = () => {
    if (!quiz) return;
    const { isValid, errors } = validateQuiz(quiz);
    if (!isValid) {
      sounds.playWrong();
      setValidationErrors(errors);
      setShowValidationAlert(true);
      if (errors[0]?.questionIndex !== undefined) {
        setSelectedSlideIndex(errors[0].questionIndex);
        setMobileTab('canvas');
      }
      return;
    }
    sounds.playClick();
    onLaunchQuiz(quiz);
  };

  if (!quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
        Загрузка редактора квиза...
      </div>
    );
  }

  const currentQuestion = quiz.questions[selectedSlideIndex] || quiz.questions[0];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* 1. Header Toolbar */}
      <header className="h-14 sm:h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              sounds.playClick();
              onBack();
            }}
            aria-label="Назад к библиотеке"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Quiz Title & Settings trigger */}
          <div
            onClick={() => {
              sounds.playClick();
              setIsMetaModalOpen(true);
            }}
            className="flex items-center gap-2 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl cursor-pointer transition max-w-xs sm:max-w-sm truncate"
            title="Нажмите для настройки названия и обложки"
          >
            <span className="text-lg sm:text-xl shrink-0">{quiz.coverEmoji}</span>
            <div className="flex flex-col min-w-0 truncate">
              <span className="text-xs sm:text-sm font-bold text-white truncate">{quiz.title}</span>
              <span className="text-[10px] text-slate-400 truncate">
                {quiz.category} • {quiz.questions.length} вопр.
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 ml-1 shrink-0 hidden sm:block" />
          </div>

          {hasSaved && (
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0 hidden md:flex">
              <Save className="w-3 h-3" />
              <span>Сохранено</span>
            </span>
          )}
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setIsTemplateModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer"
            title="Добавить готовые наборы вопросов"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Шаблоны вопросов</span>
          </button>

          <button
            onClick={() => storage.exportQuizAsJSON(quiz)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer hidden md:block"
            title="Экспорт квиза в JSON"
            aria-label="Экспорт квиза в JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <button
            id="btn-host-start-editor"
            onClick={handleLaunchWithValidation}
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-3 sm:px-4 py-2 rounded-xl transition shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Запустить игру</span>
          </button>
        </div>
      </header>

      {/* Validation Warning Alert if there are errors */}
      {showValidationAlert && validationErrors.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200 z-20 shrink-0"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">Исправьте ошибки перед запуском:</span>
            <span className="truncate max-w-md">{validationErrors[0].message}</span>
            {validationErrors.length > 1 && (
              <span className="text-[10px] bg-rose-900 px-1.5 py-0.5 rounded font-mono">
                +{validationErrors.length - 1} еще
              </span>
            )}
          </div>
          <button
            onClick={() => setShowValidationAlert(false)}
            className="text-rose-400 hover:text-white text-xs underline cursor-pointer ml-4"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Mobile Sub-Navigation Tabs (Visible on < lg screens) */}
      <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 px-3 py-1.5 flex items-center justify-around text-xs shrink-0">
        <button
          onClick={() => setMobileTab('slides')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            mobileTab === 'slides' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Слайды ({quiz.questions.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            mobileTab === 'canvas' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Вопрос #{selectedSlideIndex + 1}</span>
        </button>
        <button
          onClick={() => setMobileTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            mobileTab === 'settings' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Параметры</span>
        </button>
      </div>

      {/* 2. Main Builder Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide List Sidebar */}
        <div className={`h-full ${mobileTab === 'slides' ? 'block w-full' : 'hidden'} lg:block lg:w-64 shrink-0`}>
          <QuestionSlideList
            questions={quiz.questions}
            selectedIndex={selectedSlideIndex}
            onSelect={(idx) => {
              sounds.playClick();
              setSelectedSlideIndex(idx);
              setMobileTab('canvas');
            }}
            onAdd={handleAddQuestion}
            onDelete={handleDeleteQuestion}
            onDuplicate={handleDuplicateQuestion}
            onMove={handleMoveQuestion}
          />
        </div>

        {/* Canvas Center Area */}
        <div className={`flex-1 h-full overflow-hidden ${mobileTab === 'canvas' ? 'flex flex-col' : 'hidden'} lg:flex lg:flex-col`}>
          {currentQuestion && (
            <QuestionCanvas
              question={currentQuestion}
              onChange={handleUpdateQuestion}
            />
          )}
        </div>

        {/* Settings Sidebar */}
        <div className={`h-full ${mobileTab === 'settings' ? 'block w-full' : 'hidden'} lg:block lg:w-72 shrink-0`}>
          {currentQuestion && (
            <QuestionSettings
              question={currentQuestion}
              onChange={handleUpdateQuestion}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <QuizMetaModal
        quiz={quiz}
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={(updated) => handleUpdateQuiz({ ...quiz, ...updated })}
      />

      <AITemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyQuestions={handleApplyTemplates}
      />
    </div>
  );
}
