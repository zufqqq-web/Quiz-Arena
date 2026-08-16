export type QuestionType = 'single' | 'multiple' | 'boolean' | 'text' | 'number' | 'order' | 'poll';

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
  correctNumberAnswer?: number; // for 'number' question type
  numberTolerance?: number; // margin of error (e.g. ±2)
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

export type PowerUpType = 'fifty_fifty' | 'double_points' | 'shield' | 'freeze';

export interface PlayerPowerUps {
  fiftyFifty: number;
  doublePoints: number;
  shield: number;
  freeze: number;
}

export interface PlayerAnswer {
  questionId: string;
  questionIndex: number;
  selectedOptionIds: string[];
  textAnswer?: string;
  numberAnswer?: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentMs: number;
  streakBonus: number;
  streakMultiplier?: number;
  powerUpUsed?: PowerUpType;
  shieldProtected?: boolean;
  rank?: number;
  rankDelta?: number; // +2, -1, 0
  answeredAt: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatarEmoji: string;
  score: number;
  previousScore?: number;
  streak: number;
  highestStreak: number;
  fastestAnswerMs?: number;
  answers: Record<number, PlayerAnswer>;
  powerUps?: PlayerPowerUps;
  activePowerUp?: PowerUpType | null;
  removedOptionIds?: string[]; // for 50/50
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
  powerUpsEnabled?: boolean;
  questionStats?: Record<
    number,
    {
      totalAnswers: number;
      correctAnswers: number;
      successRatePct: number;
      avgTimeSec: number;
      optionDistribution: Record<string, number>;
    }
  >;
}
