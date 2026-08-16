import { Player, Question, PlayerAnswer } from '../types';

export const BOT_NAMES = [
  { name: 'Саша Кодер', emoji: '🧑‍💻', accuracy: 0.9, speed: 'fast' as const },
  { name: 'Оля Дедлайн', emoji: '⚡', accuracy: 0.85, speed: 'fast' as const },
  { name: 'Миша Спидран', emoji: '🏎️', accuracy: 0.78, speed: 'fast' as const },
  { name: 'Катя Инсайт', emoji: '💡', accuracy: 0.92, speed: 'average' as const },
  { name: 'Тимофей Багодел', emoji: '👾', accuracy: 0.65, speed: 'slow' as const },
  { name: 'Лера Мем', emoji: '🥑', accuracy: 0.75, speed: 'average' as const },
  { name: 'Артем Нейросеть', emoji: '🤖', accuracy: 0.95, speed: 'fast' as const },
  { name: 'Полина Квиз', emoji: '🏆', accuracy: 0.88, speed: 'average' as const },
];

export const FUN_REACTION_EMOJIS = ['🔥', '🚀', '😱', '🎉', '🧠', '🤯', '❤️', '⚡'];

export function generateBotPlayers(count: number = 4): Player[] {
  const shuffled = [...BOT_NAMES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((b, i) => ({
    id: `bot-${Date.now()}-${i}`,
    nickname: b.name,
    avatarEmoji: b.emoji,
    score: 0,
    streak: 0,
    highestStreak: 0,
    answers: {},
    isBot: true,
    botSpeed: b.speed,
    botAccuracy: b.accuracy,
    connected: true,
  }));
}

// Calculate score based on Kahoot formula:
// Points = round((1 - ((timeSpent / timeLimit) / 2)) * 1000 * multiplier) + streakBonus
export function calculateScore(
  timeSpentMs: number,
  timeLimitSec: number,
  multiplier: number,
  currentStreak: number
): { points: number; streakBonus: number } {
  if (multiplier === 0) return { points: 0, streakBonus: 0 };

  const timeLimitMs = timeLimitSec * 1000;
  const clampedTime = Math.min(Math.max(timeSpentMs, 500), timeLimitMs);
  const timeFactor = 1 - (clampedTime / timeLimitMs) / 2; // Between 0.5 and 1.0
  const basePoints = Math.round(timeFactor * 1000 * multiplier);

  // Streak bonus: +50 for streak >= 2, +100 for >= 3, +150 for >= 4, +200 max
  const streakBonus = currentStreak >= 4 ? 200 : currentStreak >= 3 ? 150 : currentStreak >= 2 ? 100 : currentStreak >= 1 ? 50 : 0;

  return {
    points: basePoints + streakBonus,
    streakBonus,
  };
}

// Simulate bot answering a question
export function simulateBotAnswer(
  bot: Player,
  question: Question,
  questionIndex: number,
  startTime: number
): { answer: PlayerAnswer; delayMs: number } {
  const timeLimitMs = question.timeLimit * 1000;
  
  // Calculate simulated speed delay
  let baseDelayRatio = 0.35;
  if (bot.botSpeed === 'fast') baseDelayRatio = 0.18 + Math.random() * 0.25;
  else if (bot.botSpeed === 'slow') baseDelayRatio = 0.5 + Math.random() * 0.35;
  else baseDelayRatio = 0.3 + Math.random() * 0.35;

  const timeSpentMs = Math.min(Math.round(timeLimitMs * baseDelayRatio), timeLimitMs - 300);
  const accuracy = bot.botAccuracy ?? 0.8;
  const willBeCorrect = question.type === 'poll' ? true : Math.random() < accuracy;

  let selectedOptionIds: string[] = [];
  let textAnswer: string | undefined = undefined;

  if (question.type === 'single' || question.type === 'boolean') {
    const correctOption = question.options.find((o) => o.isCorrect);
    const incorrectOptions = question.options.filter((o) => !o.isCorrect);

    if (willBeCorrect && correctOption) {
      selectedOptionIds = [correctOption.id];
    } else if (incorrectOptions.length > 0) {
      const randomWrong = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      selectedOptionIds = [randomWrong.id];
    } else if (question.options.length > 0) {
      selectedOptionIds = [question.options[0].id];
    }
  } else if (question.type === 'poll') {
    if (question.options.length > 0) {
      const randomOpt = question.options[Math.floor(Math.random() * question.options.length)];
      selectedOptionIds = [randomOpt.id];
    }
  } else if (question.type === 'multiple') {
    const correctOptions = question.options.filter((o) => o.isCorrect);
    if (willBeCorrect) {
      selectedOptionIds = correctOptions.map((o) => o.id);
    } else {
      // Pick random subset
      selectedOptionIds = question.options
        .filter(() => Math.random() > 0.5)
        .map((o) => o.id);
      if (selectedOptionIds.length === 0 && question.options.length > 0) {
        selectedOptionIds = [question.options[0].id];
      }
    }
  } else if (question.type === 'order') {
    const sorted = [...question.options].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    if (willBeCorrect) {
      selectedOptionIds = sorted.map((o) => o.id);
    } else {
      // slightly jumbled
      selectedOptionIds = [...question.options].sort(() => 0.5 - Math.random()).map((o) => o.id);
    }
  } else if (question.type === 'text') {
    if (willBeCorrect && question.correctTextAnswer) {
      textAnswer = question.correctTextAnswer;
    } else {
      textAnswer = 'Неверный вариант';
    }
  }

  const { points, streakBonus } = willBeCorrect
    ? calculateScore(timeSpentMs, question.timeLimit, question.pointsMultiplier, bot.streak)
    : { points: 0, streakBonus: 0 };

  const answer: PlayerAnswer = {
    questionId: question.id,
    questionIndex,
    selectedOptionIds,
    textAnswer,
    isCorrect: willBeCorrect,
    pointsEarned: points,
    timeSpentMs,
    streakBonus,
    answeredAt: startTime + timeSpentMs,
  };

  return { answer, delayMs: timeSpentMs };
}
