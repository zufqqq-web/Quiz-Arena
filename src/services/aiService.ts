import { Question } from '../types';

export interface GenerateQuizParams {
  topic: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: 'ru' | 'en';
}

export interface TemplatePack {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  category: string;
  questions: Question[];
}

export const CURATED_TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: 'general_smart',
    title: 'Эрудиция и логические парадоксы',
    desc: '5 разнотипных вопросов на сообразительность, парадоксы и научные факты',
    emoji: '🧠',
    category: 'Эрудиция',
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
        title: 'Правда или ложь: Бананы ботанически являются ягодами, а клубника — нет?',
        type: 'boolean',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'В ботанике банан — ягода с семенами внутри мякоти, а клубника — разросшееся цветоложе.',
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
  {
    id: 'dev_life',
    title: 'Жизнь IT-команды, код и релизы',
    desc: '5 вопросов про дедлайны, протоколы, архитектуру и рабочие будни',
    emoji: '💻',
    category: 'IT & Разработка',
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
        title: 'Правда или ложь: Концепция "It works on my machine" решает баги в продакшене?',
        type: 'boolean',
        timeLimit: 10,
        pointsMultiplier: 1,
        explanation: 'Именно поэтому мы используем Docker контейнеры: "Then we will ship your machine!"',
        options: [
          { id: 'd3-1', text: 'Ложь (Нужна воспроизводимая среда)', isCorrect: true },
          { id: 'd3-2', text: 'Правда (Закрываем таску)', isCorrect: false },
        ],
      },
      {
        id: 'dev-4',
        title: 'Какова скорость света в вакууме (в тысячах км/с)?',
        type: 'number',
        timeLimit: 20,
        pointsMultiplier: 1,
        correctNumberAnswer: 300,
        numberTolerance: 10,
        explanation: 'Примерно 299 792 км/с (~300 тыс. км/с).',
        options: [],
      },
      {
        id: 'dev-5',
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
  {
    id: 'cinema_pop',
    title: 'Мировое кино и сериалы',
    desc: 'Культовые цитаты, хронология франшиз и кинематографические факты',
    emoji: '🎬',
    category: 'Кино',
    questions: [
      {
        id: 'cin-1',
        title: 'Какой фильм получил рекордные 11 статуэток «Оскар» наряду с «Бен-Гуром» и «Титаником»?',
        type: 'single',
        timeLimit: 20,
        pointsMultiplier: 1,
        explanation: '«Властелин колец: Возвращение короля» (2003) выиграл во всех 11 номинациях, где был представлен.',
        options: [
          { id: 'c1-1', text: 'Властелин колец: Возвращение короля', isCorrect: true },
          { id: 'c1-2', text: 'Аватар', isCorrect: false },
          { id: 'c1-3', text: 'Криминальное чтиво', isCorrect: false },
          { id: 'c1-4', text: 'Интерстеллар', isCorrect: false },
        ],
      },
      {
        id: 'cin-2',
        title: 'Расположите эпизоды оригинальной трилогии «Звёздных войн» по сюжетной хронологии:',
        type: 'order',
        timeLimit: 25,
        pointsMultiplier: 2,
        explanation: 'Эпизод IV: Новая надежда -> Эпизод V: Империя наносит ответный удар -> Эпизод VI: Возвращение джедая',
        options: [
          { id: 'sw-1', text: 'Эпизод IV: Новая надежда', orderIndex: 0 },
          { id: 'sw-2', text: 'Эпизод V: Империя наносит ответный удар', orderIndex: 1 },
          { id: 'sw-3', text: 'Эпизод VI: Возвращение джедая', orderIndex: 2 },
        ],
      },
      {
        id: 'cin-3',
        title: 'Правда или ложь: В фильме «Матрица» зеленый код состоит из рецептов суши?',
        type: 'boolean',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'Дизайнер Саймон Уайтли отсканировал символы из японских кулинарных книг своей жены.',
        options: [
          { id: 'cm-1', text: 'Правда (Рецепты суши)', isCorrect: true },
          { id: 'cm-2', text: 'Ложь (Бинарный шифр)', isCorrect: false },
        ],
      },
    ],
  },
];

/**
 * Service contract for Question generation.
 * Currently serves curated high-quality template packs.
 * When a backend AI endpoint is connected, this function will call the remote API.
 */
export async function generateQuizWithAI(params: GenerateQuizParams): Promise<Question[]> {
  // Check if there is a matching template pack by topic
  const normalized = params.topic.trim().toLowerCase();
  const pack = CURATED_TEMPLATE_PACKS.find(
    (p) => p.id.includes(normalized) || p.category.toLowerCase().includes(normalized)
  );

  if (pack) {
    return cloneQuestionsWithNewIds(pack.questions);
  }

  // Fallback to general smart pack
  return cloneQuestionsWithNewIds(CURATED_TEMPLATE_PACKS[0].questions);
}

export function cloneQuestionsWithNewIds(questions: Question[]): Question[] {
  return questions.map((q) => ({
    ...q,
    id: 'q-gen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    options: q.options.map((opt) => ({
      ...opt,
      id: 'opt-gen-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    })),
  }));
}
