export type QuestionType = 'single' | 'multiple' | 'boolean' | 'text' | 'order' | 'poll';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  timeLimit: number; // in seconds (e.g. 5, 10, 15, 20, 30, 60)
  pointsMultiplier: number; // 0 (no points), 1 (standard 1000), 2 (double 2000)
  options: QuestionOption[];
  correctTextAnswer?: string; // for 'text' question type (case insensitive match)
  explanation?: string;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  coverEmoji: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface PlayerAnswer {
  questionId: string;
  questionIndex: number;
  selectedOptionIds: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentMs: number;
  streakBonus: number;
  answeredAt: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatarEmoji: string;
  score: number;
  streak: number;
  highestStreak: number;
  answers: Record<number, PlayerAnswer>;
  isBot?: boolean;
  botSpeed?: 'fast' | 'average' | 'slow';
  botAccuracy?: number; // 0 to 1
  connected: boolean;
}

export interface GameReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number; // 10% to 90%
  timestamp: number;
}

export type GameStatus =
  | 'lobby'
  | 'countdown'
  | 'question_active'
  | 'question_reveal'
  | 'leaderboard'
  | 'podium'
  | 'finished';

export interface RoomState {
  roomCode: string;
  quiz: Quiz;
  status: GameStatus;
  currentQuestionIndex: number;
  questionStartTime: number;
  questionEndTime: number;
  players: Record<string, Player>;
  showCorrectAnswers: boolean;
  hostTabId: string;
}
