import React from 'react';
import { Question } from '../../types';
import { Check, Image as ImageIcon, Sparkles, ArrowUp, ArrowDown, Info } from 'lucide-react';

interface QuestionCanvasProps {
  question: Question;
  onChange: (updated: Question) => void;
}

const OPTION_STYLES = [
  { bg: 'bg-red-500/10 border-red-500/30 text-red-400', symbol: '▲', labelColor: 'bg-red-500 text-white' },
  { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', symbol: '◆', labelColor: 'bg-blue-500 text-white' },
  { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', symbol: '●', labelColor: 'bg-amber-500 text-neutral-900' },
  { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', symbol: '■', labelColor: 'bg-emerald-500 text-white' },
];

export function QuestionCanvas({ question, onChange }: QuestionCanvasProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...question, title: e.target.value });
  };

  const handleOptionTextChange = (optId: string, text: string) => {
    const newOptions = question.options.map((opt) =>
      opt.id === optId ? { ...opt, text } : opt
    );
    onChange({ ...question, options: newOptions });
  };

  const handleToggleCorrect = (optId: string) => {
    if (question.type === 'single' || question.type === 'boolean') {
      // only one can be correct
      const newOptions = question.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optId,
      }));
      onChange({ ...question, options: newOptions });
    } else if (question.type === 'multiple') {
      // multiple toggle
      const newOptions = question.options.map((opt) =>
        opt.id === optId ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
      onChange({ ...question, options: newOptions });
    }
  };

  const handleMoveOrderOption = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= question.options.length) return;

    const list = [...question.options];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-index
    const updated = list.map((opt, idx) => ({ ...opt, orderIndex: idx }));
    onChange({ ...question, options: updated });
  };

  const hasCorrectSelected =
    question.type === 'poll' ||
    (question.type === 'text' && !!question.correctTextAnswer?.trim()) ||
    question.options.some((o) => o.isCorrect);

  return (
    <div id="question-canvas" className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-6 md:p-8 overflow-y-auto">
      {/* Top Warning Banner if no correct answer is marked */}
      {!hasCorrectSelected && (
        <div className="w-full max-w-3xl mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Обратите внимание: отметьте хотя бы один вариант как правильный для начисления баллов.</span>
        </div>
      )}

      {/* Question Prompt Center Card */}
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all">
        <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-1.5 flex items-center justify-between">
          <span>Текст вопроса</span>
          <span className="text-slate-500 lowercase font-normal">{question.title.length}/200 симв.</span>
        </label>
        <textarea
          id="input-question-title"
          rows={2}
          value={question.title}
          onChange={handleTitleChange}
          placeholder="Например: В каком году человек впервые полетел в космос?"
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 text-base md:text-lg font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-400 resize-none transition"
        />

        {/* Media / Image URL Optional Field */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>Картинка (URL):</span>
          </div>
          <input
            id="input-question-image"
            type="url"
            value={question.imageUrl || ''}
            onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/... (необязательно)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
          />
          {question.imageUrl && (
            <button
              onClick={() => onChange({ ...question, imageUrl: '' })}
              className="text-xs text-red-400 hover:underline cursor-pointer"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Answer Grid based on Question Type */}
      <div className="w-full max-w-3xl my-6 flex-1 flex flex-col justify-center">
        {/* TYPE 1: Single Choice & Poll (4 classic boxes) */}
        {(question.type === 'single' || question.type === 'poll') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {question.options.map((opt, idx) => {
              const style = OPTION_STYLES[idx % OPTION_STYLES.length];
              const isCorrect = opt.isCorrect;
              return (
                <div
                  key={opt.id}
                  className={`relative rounded-2xl border p-3 flex items-center gap-3 transition-all ${
                    isCorrect
                      ? 'bg-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${style.labelColor}`}>
                    {style.symbol}
                  </div>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                    placeholder={`Вариант ${idx + 1}...`}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none font-medium"
                  />
                  {question.type !== 'poll' && (
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(opt.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                          : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-500'
                      }`}
                      title={isCorrect ? 'Правильный ответ' : 'Сделать правильным'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TYPE 2: Boolean (True / False) */}
        {question.type === 'boolean' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((opt) => {
              const isTrue = opt.text.toLowerCase().includes('правда') || opt.text.toLowerCase().includes('true');
              const isCorrect = opt.isCorrect;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isCorrect
                      ? isTrue
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-lg'
                        : 'bg-red-950/40 border-red-500 text-red-300 shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl">{isTrue ? '✅' : '❌'}</span>
                  <span className="text-lg font-bold">{opt.text}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCorrect ? 'Правильный ответ' : 'Нажмите, чтобы выбрать'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TYPE 3: Multiple Choice (Checkboxes) */}
        {question.type === 'multiple' && (
          <div className="space-y-2.5">
            <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Отметьте один или несколько правильных вариантов (чекбоксы):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((opt, idx) => {
                const style = OPTION_STYLES[idx % OPTION_STYLES.length];
                const isCorrect = opt.isCorrect;
                return (
                  <div
                    key={opt.id}
                    className={`rounded-2xl border p-3 flex items-center gap-3 transition-all ${
                      isCorrect
                        ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${style.labelColor}`}>
                      {style.symbol}
                    </div>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                      placeholder={`Вариант ${idx + 1}...`}
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(opt.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE 4: Order / Sequence */}
        {question.type === 'order' && (
          <div className="space-y-2.5">
            <div className="text-xs text-amber-400 font-medium mb-1">
              Расположите элементы в правильном хронологическом/логическом порядке сверху вниз:
            </div>
            {question.options.map((opt, idx) => (
              <div
                key={opt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                    placeholder={`Шаг ${idx + 1}...`}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none font-medium"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveOrderOption(idx, 'up')}
                    className="p-1 hover:bg-slate-800 text-slate-400 rounded disabled:opacity-20"
                    title="Вверх"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === question.options.length - 1}
                    onClick={() => handleMoveOrderOption(idx, 'down')}
                    className="p-1 hover:bg-slate-800 text-slate-400 rounded disabled:opacity-20"
                    title="Вниз"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TYPE 5: Text Input */}
        {question.type === 'text' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs text-slate-400 font-medium">
              Игроки будут вводить ответ текстом вручную. Проверка происходит без учета регистра.
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Эталонный правильный ответ:
              </label>
              <input
                type="text"
                value={question.correctTextAnswer || ''}
                onChange={(e) => onChange({ ...question, correctTextAnswer: e.target.value })}
                placeholder="Например: 1961 или Юрий Гагарин"
                className="w-full bg-slate-950 border border-pink-500/40 rounded-xl px-4 py-3 text-base text-pink-300 placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Explanation Field (Shown after reveal for educational value) */}
      <div className="w-full max-w-3xl bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
        <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-1">
          Пояснение для участников (показывается после ответа):
        </label>
        <input
          type="text"
          value={question.explanation || ''}
          onChange={(e) => onChange({ ...question, explanation: e.target.value })}
          placeholder="Краткий интересный факт, почему этот ответ верный..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
        />
      </div>
    </div>
  );
}
