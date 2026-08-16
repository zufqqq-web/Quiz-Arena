import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types';
import { CURATED_TEMPLATE_PACKS, TemplatePack, cloneQuestionsWithNewIds } from '../../services/aiService';
import { Layers, X, Check, Search, Tag } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface AITemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuestions: (newQuestions: Question[]) => void;
}

export function AITemplateModal({ isOpen, onClose, onApplyQuestions }: AITemplateModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>(CURATED_TEMPLATE_PACKS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape & Accessibility Focus Management
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPacks = CURATED_TEMPLATE_PACKS.filter(
    (pack) =>
      pack.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pack.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pack.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedPack = CURATED_TEMPLATE_PACKS.find((p) => p.id === selectedPackId) || CURATED_TEMPLATE_PACKS[0];

  const handleApply = () => {
    sounds.playClick();
    const cloned = cloneQuestionsWithNewIds(selectedPack.questions);
    onApplyQuestions(cloned);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      aria-describedby="template-modal-desc"
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 id="template-modal-title" className="text-base font-bold text-white">
                Готовые наборы вопросов
              </h3>
              <p id="template-modal-desc" className="text-xs text-slate-400">
                Сбалансированные пакеты вопросов разных типов для быстрого старта
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Закрыть окно шаблонов"
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Поиск по теме или названию набора..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
              aria-label="Поиск шаблонов"
            />
          </div>

          {/* Pack Selection List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {filteredPacks.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPackId(pack.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPackId(pack.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Выбрать набор ${pack.title}`}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                    {pack.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white tracking-tight">{pack.title}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {pack.category}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded-md">
                          {pack.questions.length} вопр.
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.desc}</p>
                  </div>
                </div>
              );
            })}

            {filteredPacks.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">Наборов по вашему запросу не найдено</p>
            )}
          </div>

          {/* Selected Pack Preview Breakdown */}
          {selectedPack && (
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Содержимое набора «{selectedPack.title}»:
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 max-h-32 overflow-y-auto">
                {selectedPack.questions.map((q, idx) => (
                  <li key={q.id || idx} className="flex items-center gap-2 truncate">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-slate-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                      {q.type}
                    </span>
                    <span className="truncate text-slate-200">{q.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Вставить {selectedPack?.questions.length || 0} вопросов</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
