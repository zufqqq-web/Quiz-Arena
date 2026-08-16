import { Question, QuestionType } from '../../types';
import { Clock, Award, Layers, HelpCircle, CheckCircle2, ListOrdered, Type, BarChart2, Hash } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuestionSettingsProps {
  question: Question;
  onChange: (updated: Question) => void;
}

const TIME_LIMITS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function QuestionSettings({ question, onChange }: QuestionSettingsProps) {
  const { t } = useLanguage();

  const questionTypes: Array<{ type: QuestionType; label: string; desc: string; icon: any }> = [
    { type: 'single', label: t('editor.singleChoice'), desc: '4 options, 1 correct', icon: HelpCircle },
    { type: 'multiple', label: t('editor.multipleChoice'), desc: 'Multiple correct options', icon: Layers },
    { type: 'boolean', label: t('editor.trueFalse'), desc: 'True / False', icon: CheckCircle2 },
    { type: 'text', label: t('editor.textInput'), desc: 'Open text word', icon: Type },
    { type: 'number', label: t('editor.numberInput'), desc: 'Numeric with tolerance ±', icon: Hash },
    { type: 'order', label: t('editor.orderSequence'), desc: 'Sequence order', icon: ListOrdered },
    { type: 'poll', label: t('editor.pollSurvey'), desc: 'Opinion / No correct answer', icon: BarChart2 },
  ];

  const handleTypeChange = (type: QuestionType) => {
    let options = [...question.options];

    if (type === 'boolean') {
      options = [
        { id: 'b-1', text: t('editor.trueOption'), isCorrect: true },
        { id: 'b-2', text: t('editor.falseOption'), isCorrect: false },
      ];
    } else if (type === 'single' || type === 'multiple' || type === 'poll') {
      if (options.length < 4) {
        options = [
          { id: 'opt-1', text: `${t('editor.optionPlaceholder', { num: 1 })}`, isCorrect: true },
          { id: 'opt-2', text: `${t('editor.optionPlaceholder', { num: 2 })}`, isCorrect: false },
          { id: 'opt-3', text: `${t('editor.optionPlaceholder', { num: 3 })}`, isCorrect: false },
          { id: 'opt-4', text: `${t('editor.optionPlaceholder', { num: 4 })}`, isCorrect: false },
        ];
      }
    } else if (type === 'order') {
      options = [
        { id: 'ord-1', text: `${t('editor.optionPlaceholder', { num: 1 })}`, orderIndex: 0 },
        { id: 'ord-2', text: `${t('editor.optionPlaceholder', { num: 2 })}`, orderIndex: 1 },
        { id: 'ord-3', text: `${t('editor.optionPlaceholder', { num: 3 })}`, orderIndex: 2 },
        { id: 'ord-4', text: `${t('editor.optionPlaceholder', { num: 4 })}`, orderIndex: 3 },
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
          <span>{t('editor.questionType')}</span>
        </label>
        <div className="space-y-1.5">
          {questionTypes.map((item) => {
            const isSelected = question.type === item.type;
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => handleTypeChange(item.type)}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-[var(--accent-400)] text-white shadow-sm ring-1 ring-[var(--accent-400)]/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
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
          <span>{t('editor.timeLimit')}</span>
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
                    ? 'bg-[var(--accent-500)] text-slate-950 border-[var(--accent-500)] shadow-sm font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {sec} {t('common.seconds')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Points Multiplier */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Award className="w-3.5 h-3.5 text-slate-300" />
          <span>{t('editor.pointsMultiplier')}</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: 1, label: t('editor.pointsStandard'), badge: '1000' },
            { value: 2, label: t('editor.pointsDouble'), badge: '2000' },
            { value: 0, label: t('editor.pointsNone'), badge: '0' },
          ].map((p) => {
            const isSelected = question.pointsMultiplier === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onChange({ ...question, pointsMultiplier: p.value })}
                className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-500)] text-slate-950 border-[var(--accent-500)] shadow-sm font-bold'
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
    </div>
  );
}
