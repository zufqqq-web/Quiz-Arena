import { Question } from '../../types';
import { Plus, Trash2, Copy, MoveUp, MoveDown, HelpCircle, CheckCircle2, ListOrdered, Type, BarChart2 } from 'lucide-react';

interface QuestionSlideListProps {
  questions: Question[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export function QuestionSlideList({
  questions,
  selectedIndex,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onMove,
}: QuestionSlideListProps) {
  const getTypeIcon = (type: Question['type']) => {
    switch (type) {
      case 'single':
        return <HelpCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'boolean':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'multiple':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'order':
        return <ListOrdered className="w-3.5 h-3.5 text-amber-500" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-pink-500" />;
      case 'poll':
        return <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getTypeName = (type: Question['type']) => {
    switch (type) {
      case 'single': return 'Один ответ';
      case 'boolean': return 'Правда / Ложь';
      case 'multiple': return 'Несколько ответов';
      case 'order': return 'Порядок';
      case 'text': return 'Текстовый ответ';
      case 'poll': return 'Опрос';
    }
  };

  return (
    <div id="slide-list-sidebar" className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Слайды ({questions.length})
        </span>
        <button
          id="btn-add-question"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Вопрос</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {questions.map((q, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`group relative rounded-xl border p-2.5 transition cursor-pointer text-left ${
                isSelected
                  ? 'bg-slate-800/90 border-slate-500 shadow-md ring-1 ring-slate-500'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs border border-slate-700/50">
                    {idx + 1}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    {getTypeIcon(q.type)}
                    <span>{getTypeName(q.type)}</span>
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {q.timeLimit}с
                </span>
              </div>

              <div className="text-xs text-slate-200 font-medium line-clamp-2 min-h-[2.5rem]">
                {q.title || <span className="text-slate-500 italic">Без названия</span>}
              </div>

              {/* Action Toolbar on Slide */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(idx, idx - 1);
                    }}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Переместить выше"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === questions.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(idx, idx + 1);
                    }}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Переместить ниже"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(idx);
                    }}
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded"
                    title="Дублировать слайд"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {questions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(idx);
                    }}
                    className="p-1 hover:bg-red-950/80 text-slate-400 hover:text-red-400 rounded"
                    title="Удалить слайд"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
