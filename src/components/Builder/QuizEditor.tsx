import { useState, useEffect } from 'react';
import { Quiz, Question } from '../../types';
import { storage } from '../../utils/storage';
import { QuestionSlideList } from './QuestionSlideList';
import { QuestionCanvas } from './QuestionCanvas';
import { QuestionSettings } from './QuestionSettings';
import { QuizMetaModal } from './QuizMetaModal';
import { AITemplateModal } from './AITemplateModal';
import { Play, Settings, Sparkles, ArrowLeft, Save, Download, Eye } from 'lucide-react';
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

  // Load Quiz
  useEffect(() => {
    const quizzes = storage.getQuizzes();
    const found = quizzes.find((q) => q.id === quizId);
    if (found) {
      setQuiz(found);
    } else {
      const newTpl = storage.createNewQuizTemplate();
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

  const handleApplyAITemplates = (newQuestions: Question[]) => {
    if (!quiz) return;
    sounds.playCorrect();
    const combined = [...quiz.questions, ...newQuestions];
    handleUpdateQuiz({ ...quiz, questions: combined });
    setSelectedSlideIndex(quiz.questions.length);
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
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quiz Title & Settings trigger */}
          <div
            onClick={() => setIsMetaModalOpen(true)}
            className="flex items-center gap-2 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl cursor-pointer transition max-w-sm"
          >
            <span className="text-xl">{quiz.coverEmoji}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{quiz.title}</span>
              <span className="text-[10px] text-slate-400 truncate">{quiz.category} • {quiz.questions.length} вопр.</span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 ml-1 shrink-0" />
          </div>

          {hasSaved && (
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <Save className="w-3 h-3" />
              <span>Сохранено</span>
            </span>
          )}
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Шаблоны вопросов</span>
          </button>

          <button
            onClick={() => storage.exportQuizAsJSON(quiz)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Экспорт квиза в JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <button
            id="btn-host-start-editor"
            onClick={() => {
              sounds.playClick();
              onLaunchQuiz(quiz);
            }}
            className="flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-4 py-2 rounded-xl transition shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Запустить игру (Хост)</span>
          </button>
        </div>
      </header>

      {/* 2. Main Builder Workspace: Slides (Left) + Canvas (Center) + Settings (Right) */}
      <div className="flex-1 flex overflow-hidden">
        <QuestionSlideList
          questions={quiz.questions}
          selectedIndex={selectedSlideIndex}
          onSelect={(idx) => {
            sounds.playClick();
            setSelectedSlideIndex(idx);
          }}
          onAdd={handleAddQuestion}
          onDelete={handleDeleteQuestion}
          onDuplicate={handleDuplicateQuestion}
          onMove={handleMoveQuestion}
        />

        {currentQuestion && (
          <QuestionCanvas
            question={currentQuestion}
            onChange={handleUpdateQuestion}
          />
        )}

        {currentQuestion && (
          <QuestionSettings
            question={currentQuestion}
            onChange={handleUpdateQuestion}
          />
        )}
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
        onApplyQuestions={handleApplyAITemplates}
      />
    </div>
  );
}
