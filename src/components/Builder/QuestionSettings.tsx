import { Question, QuestionType } from '../../types';
import { Clock, Award, Layers, HelpCircle, CheckCircle2, ListOrdered, Type, BarChart2, Hash } from 'lucide-react';

interface QuestionSettingsProps {
  question: Question;
  onChange: (updated: Question) => void;
}

const QUESTION_TYPES: Array<{ type: QuestionType; label: string; desc: string; icon: any }> = [
  { type: 'single', label: 'Один ответ', desc: '4 цветных варианта, 1 верный', icon: HelpCircle },
  { type: 'multiple', label: 'Чекбоксы', desc: 'Несколько верных ответов', icon: Layers },
  { type: 'boolean', label: 'Правда / Ложь', desc: 'Два варианта (Да / Нет)', icon: CheckCircle2 },
  { type: 'text', label: 'Ввод текста', desc: 'Игрок сам вводит слово', icon: Type },
  { type: 'number', label: 'Числовой ответ', desc: 'Число с погрешностью ±', icon: Hash },
  { type: 'order', label: 'Сопоставление / Порядок', desc: 'Расположить по очереди', icon: ListOrdered },
  { type: 'poll', label: 'Опрос / Голосование', desc: 'Без правильного ответа', icon: BarChart2 },
];

const TIME_LIMITS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function QuestionSettings({ question, onChange }: QuestionSettingsProps) {
  const handleTypeChange = (type: QuestionType) => {
    let options = [...question.options];

    if (type === 'boolean') {
      options = [
        { id: 'b-1', text: 'Правда (True)', isCorrect: true },
        { id: 'b-2', text: 'Ложь (False)', isCorrect: false },
      ];
    } else if (type === 'single' || type === 'multiple' || type === 'poll') {
      if (options.length < 4) {
        options = [
          { id: 'opt-1', text: 'Вариант 1', isCorrect: true },
          { id: 'opt-2', text: 'Вариант 2', isCorrect: false },
          { id: 'opt-3', text: 'Вариант 3', isCorrect: false },
          { id: 'opt-4', text: 'Вариант 4', isCorrect: false },
        ];
      }
    } else if (type === 'order') {
      options = [
        { id: 'ord-1', text: 'Шаг 1', orderIndex: 0 },
        { id: 'ord-2', text: 'Шаг 2', orderIndex: 1 },
        { id: 'ord-3', text: 'Шаг 3', orderIndex: 2 },
        { id: 'ord-4', text: 'Шаг 4', orderIndex: 3 },
      ];
    } else if (type === 'number') {
      options = [];
    }

    const pointsMultiplier = type === 'poll' ? 0 : question.pointsMultiplier === 0 ? 1 : question.pointsMultiplier;
    const correctNumberAnswer = question.correctNumberAnswer ?? 42;
    const numberTolerance = question.numberTolerance ?? 0;
    onChange({ ...question, type, options, pointsMultiplier, correctNumberAnswer, numberTolerance });
  };

  return (
    <div id="question-settings-sidebar" className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto select-none p-4 space-y-6">
      {/* 1. Question Type */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-slate-300" />
          <span>Тип вопроса</span>
        </label>
        <div className="space-y-1.5">
          {QUESTION_TYPES.map((t) => {
            const isSelected = question.type === t.type;
            const Icon = t.icon;
            return (
              <button
                key={t.type}
                onClick={() => handleTypeChange(t.type)}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-slate-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timer Limit */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Clock className="w-3.5 h-3.5 text-slate-300" />
          <span>Лимит времени</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TIME_LIMITS.map((sec) => {
            const isSelected = question.timeLimit === sec;
            return (
              <button
                key={sec}
                onClick={() => onChange({ ...question, timeLimit: sec })}
                className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-200 text-slate-950 border-slate-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {sec} сек
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Points Multiplier */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Award className="w-3.5 h-3.5 text-slate-300" />
          <span>Начисление баллов</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: 1, label: 'Стандарт', badge: '1000' },
            { value: 2, label: 'x2 Двойные', badge: '2000' },
            { value: 0, label: '0 Без баллов', badge: '0' },
          ].map((p) => {
            const isSelected = question.pointsMultiplier === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onChange({ ...question, pointsMultiplier: p.value })}
                className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-200 text-slate-950 border-slate-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-bold">{p.label}</div>
                <div className="text-[9px] opacity-75">{p.badge} pts</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tips Card */}
      <div className="mt-auto bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-400 mb-1">💡 Совет для ведущего:</p>
        Оптимальное время на вопрос — 15-20 секунд. Это поддерживает динамичный темп и азарт в зале.
      </div>
    </div>
  );
}
