import { Quiz, Question, RoomState } from '../types';
import { DEFAULT_QUIZZES } from '../data/defaultQuizzes';

const QUIZZES_STORAGE_KEY = 'quizcraft_saved_quizzes';
const ACTIVE_ROOM_KEY = 'quizcraft_active_room';

export const storage = {
  getQuizzes(): Quiz[] {
    if (typeof window === 'undefined') return DEFAULT_QUIZZES;
    try {
      const data = localStorage.getItem(QUIZZES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
        return DEFAULT_QUIZZES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse quizzes from storage', e);
      return DEFAULT_QUIZZES;
    }
  },

  saveQuizzes(quizzes: Quiz[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
    } catch (e) {
      console.error('Failed to save quizzes to storage', e);
    }
  },

  saveQuiz(quiz: Quiz) {
    const quizzes = this.getQuizzes();
    const existingIndex = quizzes.findIndex((q) => q.id === quiz.id);
    if (existingIndex >= 0) {
      quizzes[existingIndex] = { ...quiz, updatedAt: Date.now() };
    } else {
      quizzes.unshift({ ...quiz, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveQuizzes(quizzes);
  },

  deleteQuiz(quizId: string) {
    const quizzes = this.getQuizzes().filter((q) => q.id !== quizId);
    this.saveQuizzes(quizzes);
  },

  duplicateQuiz(quizId: string): Quiz | null {
    const quizzes = this.getQuizzes();
    const original = quizzes.find((q) => q.id === quizId);
    if (!original) return null;

    const copy: Quiz = {
      ...original,
      id: 'quiz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: `${original.title} (Копия)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: original.questions.map((q) => ({
        ...q,
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        options: q.options.map((opt) => ({
          ...opt,
          id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        })),
      })),
    };

    quizzes.unshift(copy);
    this.saveQuizzes(quizzes);
    return copy;
  },

  exportQuizAsJSON(quiz: Quiz) {
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportAllQuizzesAsJSON() {
    const quizzes = this.getQuizzes();
    const blob = new Blob([JSON.stringify(quizzes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizcraft_all_quizzes_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  createNewQuizTemplate(): Quiz {
    const newId = 'quiz-' + Date.now();
    return {
      id: newId,
      title: 'Новый захватывающий квиз',
      description: 'Описание темы и правил для участников',
      category: 'Общий',
      coverEmoji: '🎯',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      questions: [
        {
          id: 'q-' + Date.now() + '-1',
          title: 'Первый вопрос квиза: выберите правильный вариант',
          type: 'single',
          timeLimit: 20,
          pointsMultiplier: 1,
          explanation: 'Краткое и полезное пояснение факта для участников раунда.',
          options: [
            { id: 'opt-1', text: 'Правильный ответ', isCorrect: true },
            { id: 'opt-2', text: 'Вариант 2', isCorrect: false },
            { id: 'opt-3', text: 'Вариант 3', isCorrect: false },
            { id: 'opt-4', text: 'Вариант 4', isCorrect: false },
          ],
        },
      ],
    };
  },

  createDefaultQuestion(type: Question['type'] = 'single'): Question {
    const id = 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    if (type === 'boolean') {
      return {
        id,
        title: 'Правда или ложь: утверждение о факте',
        type: 'boolean',
        timeLimit: 15,
        pointsMultiplier: 1,
        explanation: 'Объяснение, почему это правда или ложь.',
        options: [
          { id: 'b-1', text: 'Правда (True)', isCorrect: true },
          { id: 'b-2', text: 'Ложь (False)', isCorrect: false },
        ],
      };
    }
    if (type === 'order') {
      return {
        id,
        title: 'Расположите элементы в правильной последовательности:',
        type: 'order',
        timeLimit: 30,
        pointsMultiplier: 2,
        explanation: 'Правильный хронологический или логический порядок.',
        options: [
          { id: 'o-1', text: '1-й шаг / этап', orderIndex: 0 },
          { id: 'o-2', text: '2-й шаг / этап', orderIndex: 1 },
          { id: 'o-3', text: '3-й шаг / этап', orderIndex: 2 },
          { id: 'o-4', text: '4-й шаг / этап', orderIndex: 3 },
        ],
      };
    }
    if (type === 'multiple') {
      return {
        id,
        title: 'Выберите все верные утверждения:',
        type: 'multiple',
        timeLimit: 25,
        pointsMultiplier: 2,
        explanation: 'Несколько правильных ответов.',
        options: [
          { id: 'm-1', text: 'Верный пункт A', isCorrect: true },
          { id: 'm-2', text: 'Верный пункт B', isCorrect: true },
          { id: 'm-3', text: 'Неверный пункт C', isCorrect: false },
          { id: 'm-4', text: 'Неверный пункт D', isCorrect: false },
        ],
      };
    }
    if (type === 'text') {
      return {
        id,
        title: 'Введите точный ответ (текст):',
        type: 'text',
        timeLimit: 25,
        pointsMultiplier: 1,
        correctTextAnswer: 'Ответ',
        explanation: 'Пояснение к точному ответу.',
        options: [],
      };
    }
    if (type === 'number') {
      return {
        id,
        title: 'Укажите числовой ответ:',
        type: 'number',
        timeLimit: 20,
        pointsMultiplier: 1,
        correctNumberAnswer: 42,
        numberTolerance: 0,
        explanation: 'Точный ответ или допустимый диапазон.',
        options: [],
      };
    }
    if (type === 'poll') {
      return {
        id,
        title: 'Опрос мнений: выберите ваш вариант',
        type: 'poll',
        timeLimit: 15,
        pointsMultiplier: 0,
        explanation: 'Опрос для вовлечения аудитории без начисления баллов.',
        options: [
          { id: 'p-1', text: 'Вариант 1' },
          { id: 'p-2', text: 'Вариант 2' },
          { id: 'p-3', text: 'Вариант 3' },
          { id: 'p-4', text: 'Вариант 4' },
        ],
      };
    }
    // single choice default
    return {
      id,
      title: 'Текст вашего вопроса...',
      type: 'single',
      timeLimit: 20,
      pointsMultiplier: 1,
      explanation: 'Интересный факт или объяснение правильного ответа.',
      options: [
        { id: 's-1', text: 'Вариант ответа 1', isCorrect: true },
        { id: 's-2', text: 'Вариант ответа 2', isCorrect: false },
        { id: 's-3', text: 'Вариант ответа 3', isCorrect: false },
        { id: 's-4', text: 'Вариант ответа 4', isCorrect: false },
      ],
    };
  },

  saveActiveRoom(room: RoomState | null) {
    if (typeof window === 'undefined') return;
    try {
      if (room) {
        localStorage.setItem(ACTIVE_ROOM_KEY, JSON.stringify(room));
      } else {
        localStorage.removeItem(ACTIVE_ROOM_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  },

  getActiveRoom(): RoomState | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_ROOM_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};
