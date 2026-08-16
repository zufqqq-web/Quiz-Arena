import React, { useState } from 'react';
import { Quiz } from '../../types';
import { X, Check } from 'lucide-react';

interface QuizMetaModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Quiz>) => void;
}

const EMOJI_PRESETS = ['🎯', '💻', '🚀', '🍿', '🧠', '⚡', '🏆', '🎮', '🎨', '📚', '🧪', '🌍'];
const CATEGORY_PRESETS = ['Общий', 'Технологии', 'Наука', 'Развлечения', 'Кино & Музыка', 'Бизнес', 'Школа'];

export function QuizMetaModal({ quiz, isOpen, onClose, onSave }: QuizMetaModalProps) {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description);
  const [category, setCategory] = useState(quiz.category);
  const [coverEmoji, setCoverEmoji] = useState(quiz.coverEmoji);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'Без названия',
      description: description.trim(),
      category: category.trim() || 'Общий',
      coverEmoji: coverEmoji || '🎯',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Настройки квиза</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Иконка / Обложка
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setCoverEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition ${
                    coverEmoji === emoji
                      ? 'bg-slate-800 border-slate-300 ring-2 ring-slate-400'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Название квиза
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Супер-квиз для разработчиков"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Категория
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    category === cat
                      ? 'bg-slate-200 text-slate-950 border-slate-200 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Краткое описание (для игроков)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чем этот тест, сколько вопросов и кому подойдет..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-white text-slate-950 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
