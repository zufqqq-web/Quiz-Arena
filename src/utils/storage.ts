import { Quiz, Question, RoomState, Player } from '../types';
import { DEFAULT_QUIZZES } from '../data/defaultQuizzes';

const QUIZZES_STORAGE_KEY = 'quizcraft_saved_quizzes';
const ACTIVE_ROOM_KEY = 'quizcraft_active_room';
const ACTIVE_HOST_QUIZ_KEY = 'quizcraft_active_host_quiz';
const PLAYER_SESSION_KEY = 'quizcraft_player_session';

export interface PlayerSession {
  roomCode: string;
  player: Player;
  joinedAt?: number;
}

function getServerApiUrl(): string {
  let defaultUrl = 'http://localhost:4000';
  if (typeof window !== 'undefined' && window.location) {
    defaultUrl = `http://${window.location.hostname}:4000`;
  }
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env &&
      (import.meta as any).env.VITE_WS_SERVER_URL) ||
    defaultUrl
  ).replace(/\/+$/, '');
}

export const storage = {
  getQuizzes(): Quiz[] {
    if (typeof window === 'undefined') return DEFAULT_QUIZZES;
    try {
      const data = localStorage.getItem(QUIZZES_STORAGE_KEY);
      if (!data) {
        this.saveQuizzes(DEFAULT_QUIZZES);
        return DEFAULT_QUIZZES;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QUIZZES;
    } catch {
      return DEFAULT_QUIZZES;
    }
  },

  getQuizById(quizId: string): Quiz | null {
    const quizzes = this.getQuizzes();
    return quizzes.find((q) => q.id === quizId) || null;
  },

  saveQuizzes(quizzes: Quiz[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
    } catch (e) {
      console.warn('[QuizCraft Storage] Quota exceeded or error saving quizzes:', e);
    }
  },

  saveQuiz(quiz: Quiz) {
    const quizzes = this.getQuizzes();
    const existingIndex = quizzes.findIndex((q) => q.id === quiz.id);
    let updatedQuiz = { ...quiz, updatedAt: Date.now() };
    if (existingIndex >= 0) {
      quizzes[existingIndex] = updatedQuiz;
    } else {
      updatedQuiz = { ...quiz, createdAt: quiz.createdAt || Date.now(), updatedAt: Date.now() };
      quizzes.unshift(updatedQuiz);
    }
    this.saveQuizzes(quizzes);

    // Asynchronously sync to backend server with silent fallback
    this.syncQuizToServer(updatedQuiz);
  },

  deleteQuiz(quizId: string) {
    const quizzes = this.getQuizzes().filter((q) => q.id !== quizId);
    this.saveQuizzes(quizzes);

    // Asynchronously delete on backend server with silent fallback
    this.deleteQuizFromServer(quizId);
  },

  async syncWithServer(): Promise<Quiz[]> {
    try {
      const url = `${getServerApiUrl()}/api/quizzes`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const serverQuizzes = await res.json();
        if (Array.isArray(serverQuizzes) && serverQuizzes.length > 0) {
          // Merge server quizzes with local quizzes, preferring newer updatedAt
          const localQuizzes = this.getQuizzes();
          const quizMap = new Map<string, Quiz>();

          localQuizzes.forEach((q) => quizMap.set(q.id, q));
          serverQuizzes.forEach((sq: Quiz) => {
            const local = quizMap.get(sq.id);
            if (!local || (sq.updatedAt || 0) >= (local.updatedAt || 0)) {
              quizMap.set(sq.id, sq);
            }
          });

          const merged = Array.from(quizMap.values());
          this.saveQuizzes(merged);
          return merged;
        }
      }
    } catch (e) {
      // Silent fallback to local storage if server unreachable
      console.warn('[QuizCraft Storage] Server quiz sync fallback to local storage:', e);
    }
    return this.getQuizzes();
  },

  async syncQuizToServer(quiz: Quiz): Promise<void> {
    try {
      const url = `${getServerApiUrl()}/api/quizzes`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
        signal: AbortSignal.timeout(3000),
      });
    } catch (e) {
      // Silent fallback
      console.warn('[QuizCraft Storage] Server sync quiz failed, saved locally:', e);
    }
  },

  async deleteQuizFromServer(quizId: string): Promise<void> {
    try {
      const url = `${getServerApiUrl()}/api/quizzes/${encodeURIComponent(quizId)}`;
      await fetch(url, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3000),
      });
    } catch (e) {
      // Silent fallback
      console.warn('[QuizCraft Storage] Server delete quiz failed, deleted locally:', e);
    }
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
    try {
      const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quiz.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[QuizCraft Storage] Export quiz error:', e);
    }
  },

  exportAllQuizzesAsJSON() {
    try {
      const quizzes = this.getQuizzes();
      const blob = new Blob([JSON.stringify(quizzes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizcraft_all_quizzes_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[QuizCraft Storage] Export all quizzes error:', e);
    }
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
          title: 'Первый вопрос квиза: выберите правильный вариант ответа',
          type: 'single',
          timeLimit: 20,
          pointsMultiplier: 1,
          explanation: 'Краткое и полезное пояснение факта для участников раунда.',
          options: [
            { id: 'opt-1', text: 'Правильный вариант ответа', isCorrect: true },
            { id: 'opt-2', text: 'Вариант ответа 2', isCorrect: false },
            { id: 'opt-3', text: 'Вариант ответа 3', isCorrect: false },
            { id: 'opt-4', text: 'Вариант ответа 4', isCorrect: false },
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
        title: 'Правда или ложь: укажите верность утверждения',
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
        title: 'Введите точный текстовый ответ:',
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
        explanation: 'Точный ответ или допустимый диапазон погрешности.',
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
      title: 'Текст вопроса: выберите один правильный ответ',
      type: 'single',
      timeLimit: 20,
      pointsMultiplier: 1,
      explanation: 'Интересный факт или объяснение правильного ответа.',
      options: [
        { id: 's-1', text: 'Вариант ответа 1 (верный)', isCorrect: true },
        { id: 's-2', text: 'Вариант ответа 2', isCorrect: false },
        { id: 's-3', text: 'Вариант ответа 3', isCorrect: false },
        { id: 's-4', text: 'Вариант ответа 4', isCorrect: false },
      ],
    };
  },

  // Active Host & Room State Persistence
  saveActiveRoom(room: RoomState | null) {
    if (typeof window === 'undefined') return;
    try {
      if (room) {
        localStorage.setItem(ACTIVE_ROOM_KEY, JSON.stringify(room));
      } else {
        localStorage.removeItem(ACTIVE_ROOM_KEY);
      }
    } catch {}
  },

  getActiveRoom(): RoomState | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_ROOM_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveHostQuiz(quiz: Quiz | null) {
    if (typeof window === 'undefined') return;
    try {
      if (quiz) {
        localStorage.setItem(ACTIVE_HOST_QUIZ_KEY, JSON.stringify(quiz));
      } else {
        localStorage.removeItem(ACTIVE_HOST_QUIZ_KEY);
      }
    } catch {}
  },

  getActiveHostQuiz(): Quiz | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_HOST_QUIZ_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Active Player Session Persistence
  savePlayerSession(session: PlayerSession | null) {
    if (typeof window === 'undefined') return;
    try {
      if (session) {
        localStorage.setItem(PLAYER_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(PLAYER_SESSION_KEY);
      }
    } catch {}
  },

  getPlayerSession(): PlayerSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(PLAYER_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearPlayerSession() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(PLAYER_SESSION_KEY);
    } catch {}
  },
};
