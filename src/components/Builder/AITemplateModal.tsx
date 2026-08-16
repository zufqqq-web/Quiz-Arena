import { useState } from 'react';
import { Question } from '../../types';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';

interface AITemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuestions: (newQuestions: Question[]) => void;
}

const TEMPLATE_PACKS: Record<string, { title: string; desc: string; emoji: string; questions: Question[] }> = {
  general_smart: {
    title: '🧠 Эрудиция & Логические парадоксы',
    desc: '5 разнотипных вопросов на логику, факты и сообразительность',
    emoji: '🧠',
    questions: [
      {
        id: 'tpl-1',
        title: 'Какое колесо автомобиля не вращается во время правого поворота?',
        type: 'single',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'Запасное колесо спокойно лежит в багажнике!',
        options: [
          { id: 't1-1', text: 'Запасное', isCorrect: true },
          { id: 't1-2', text: 'Правое заднее', isCorrect: false },
          { id: 't1-3', text: 'Левое переднее', isCorrect: false },
          { id: 't1-4', text: 'Рулевое', isCorrect: false },
        ],
      },
      {
        id: 'tpl-2',
        title: 'Правда или ложь: Бананы генетически являются ягодами, а клубника — нет?',
        type: 'boolean',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'В ботанике банан — это ягода с кожистым околоплодником, а клубника — разросшееся цветоложе с орешками.',
        options: [
          { id: 't2-1', text: 'Правда (True)', isCorrect: true },
          { id: 't2-2', text: 'Ложь (False)', isCorrect: false },
        ],
      },
      {
        id: 'tpl-3',
        title: 'Сколько месяцев в году имеют 28 дней?',
        type: 'single',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'Все 12 месяцев имеют как минимум 28 дней!',
        options: [
          { id: 't3-1', text: 'Все 12 месяцев', isCorrect: true },
          { id: 't3-2', text: 'Только 1 (февраль)', isCorrect: false },
          { id: 't3-3', text: 'Только в високосный год', isCorrect: false },
          { id: 't3-4', text: 'Ни одного', isCorrect: false },
        ],
      },
      {
        id: 'tpl-4',
        title: 'Расположите слои атмосферы Земли от поверхности вверх:',
        type: 'order',
        timeLimit: 30,
        pointsMultiplier: 2,
        explanation: 'Тропосфера (0-12 км) -> Стратосфера (12-50 км) -> Мезосфера (50-85 км) -> Термосфера (85-600 км)',
        options: [
          { id: 'ord-a1', text: 'Тропосфера', orderIndex: 0 },
          { id: 'ord-a2', text: 'Стратосфера', orderIndex: 1 },
          { id: 'ord-a3', text: 'Мезосфера', orderIndex: 2 },
          { id: 'ord-a4', text: 'Термосфера', orderIndex: 3 },
        ],
      },
      {
        id: 'tpl-5',
        title: 'В каком городе находится знаменитый музей Лувр?',
        type: 'text',
        timeLimit: 20,
        pointsMultiplier: 1,
        correctTextAnswer: 'Париж',
        explanation: 'Лувр расположен в центре Парижа на правом берегу Сены.',
        options: [],
      },
    ],
  },
  dev_life: {
    title: '💻 Жизнь IT-команды и Мемы',
    desc: '5 вопросов про дедлайны, код-ревью и пятничные релизы',
    emoji: '💻',
    questions: [
      {
        id: 'dev-1',
        title: 'В какой день недели строго не рекомендуется деплоить в прод без острой необходимости?',
        type: 'single',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'Пятничный деплой — верный путь провести незабываемые выходные с дежурным инженером!',
        options: [
          { id: 'd1-1', text: 'Пятница вечер', isCorrect: true },
          { id: 'd1-2', text: 'Вторник утро', isCorrect: false },
          { id: 'd1-3', text: 'Среда полдень', isCorrect: false },
          { id: 'd1-4', text: 'Понедельник', isCorrect: false },
        ],
      },
      {
        id: 'dev-2',
        title: 'Что означает статус ответа HTTP 418?',
        type: 'single',
        timeLimit: 20,
        pointsMultiplier: 2,
        explanation: 'HTTP 418 I\'m a teapot — первоапрельский шуточный стандарт HTCPCP 1998 года.',
        options: [
          { id: 'd2-1', text: 'I\'m a teapot (Я чайник)', isCorrect: true },
          { id: 'd2-2', text: 'Internal Server Exploded', isCorrect: false },
          { id: 'd2-3', text: 'Coffee Required', isCorrect: false },
          { id: 'd2-4', text: 'Too Many Requests', isCorrect: false },
        ],
      },
      {
        id: 'dev-3',
        title: 'Правда или ложь: Выражение "It works on my machine" решает проблему в проде?',
        type: 'boolean',
        timeLimit: 10,
        pointsMultiplier: 1,
        explanation: 'Именно поэтому мы используем Docker контейнеры: "Then we will ship your machine!"',
        options: [
          { id: 'd3-1', text: 'Ложь (Docker в помощь)', isCorrect: true },
          { id: 'd3-2', text: 'Правда (Закрываем таску)', isCorrect: false },
        ],
      },
      {
        id: 'dev-4',
        title: 'Опрос: Какая тема в вашей IDE стоит прямо сейчас?',
        type: 'poll',
        timeLimit: 15,
        pointsMultiplier: 0,
        explanation: 'Темная тема бережет глаза и заряд батареи, но светлая идеальна при ярком солнце!',
        options: [
          { id: 'dp-1', text: '🌑 True Dark (Dracula / OneDark / Midnight)' },
          { id: 'dp-2', text: '☀️ Light (Светлая классика)' },
          { id: 'dp-3', text: '🌈 Cyberpunk / Синтвейв' },
          { id: 'dp-4', text: '⚡ Авто по системному таймеру' },
        ],
      },
    ],
  },
};

export function AITemplateModal({ isOpen, onClose, onApplyQuestions }: AITemplateModalProps) {
  const [selectedPackKey, setSelectedPackKey] = useState<string>('general_smart');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pack = TEMPLATE_PACKS[selectedPackKey];
      if (pack) {
        // give fresh unique ids
        const cloned = pack.questions.map((q) => ({
          ...q,
          id: 'gen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          options: q.options.map((o) => ({
            ...o,
            id: 'gen-opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          })),
        }));
        onApplyQuestions(cloned);
      }
      setIsGenerating(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Генератор готовых наборов</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Выберите готовый сбалансированный пакет вопросов разных типов (один ответ, правда/ложь, порядок, ввод текста, опрос) и мгновенно добавьте их в квиз:
          </p>

          <div className="space-y-3">
            {Object.entries(TEMPLATE_PACKS).map(([key, pack]) => {
              const isSelected = selectedPackKey === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedPackKey(key)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-slate-800 border-slate-400 ring-1 ring-slate-400'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{pack.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{pack.title}</span>
                      <span className="text-[11px] font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {pack.questions.length} вопросов
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{pack.desc}</div>
                  </div>
                </div>
              );
            })}
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
              onClick={handleApply}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-white text-slate-950 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Добавление...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Вставить вопросы в квиз</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
