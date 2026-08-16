import React, { useState, useEffect, useRef } from 'react';
import { Quiz } from '../../types';
import { X, Check } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuizMetaModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Quiz>) => void;
}

const EMOJI_PRESETS = ['🎯', '💻', '🚀', '🍿', '🧠', '⚡', '🏆', '🎮', '🎨', '📚', '🧪', '🌍'];
const CATEGORY_PRESETS = ['Общий', 'Технологии', 'Наука', 'Развлечения', 'Кино & Музыка', 'Бизнес', 'Школа'];

export function QuizMetaModal({ quiz, isOpen, onClose, onSave }: QuizMetaModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [category, setCategory] = useState(quiz.category);
  const [coverEmoji, setCoverEmoji] = useState(quiz.coverEmoji);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(quiz.title);
    setDescription(quiz.description);
    setCategory(quiz.category);
    setCoverEmoji(quiz.coverEmoji);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, quiz, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onSave({
      title: title.trim() || t('quizMeta.quizTitlePlaceholder'),
      description: description.trim(),
      category: category.trim() || t('common.general'),
      coverEmoji: coverEmoji || '🎯',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-meta-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 id="quiz-meta-title" className="text-base font-bold text-white">
            {t('quizMeta.modalTitle')}
          </h3>
          <button
            ref={closeButtonRef}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label={t('common.close')}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {t('quizMeta.coverEmoji')}
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    sounds.playClick();
                    setCoverEmoji(emoji);
                  }}
                  aria-label={`Emoji ${emoji}`}
                  className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border transition cursor-pointer ${
                    coverEmoji === emoji
                      ? 'bg-slate-800 border-[var(--accent-400)] ring-2 ring-[var(--accent-400)]/40'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quiz-title-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {t('quizMeta.quizTitle')}
            </label>
            <input
              id="quiz-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('quizMeta.quizTitlePlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--accent-400)] transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {t('quizMeta.category')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    sounds.playClick();
                    setCategory(cat);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    category === cat
                      ? 'bg-[var(--accent-500)] text-slate-950 border-[var(--accent-500)] font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quiz-desc-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {t('quizMeta.description')}
            </label>
            <textarea
              id="quiz-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('quizMeta.descriptionPlaceholder')}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--accent-400)] transition resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-[var(--accent-500)] hover:brightness-110 active:brightness-90 text-slate-950 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('quizMeta.saveMeta')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
