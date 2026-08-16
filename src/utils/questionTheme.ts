import { QuestionType } from '../types';

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  iconEmoji: string;
  description: string;
}

export const QUESTION_TYPE_THEMES: Record<QuestionType, QuestionTypeMeta> = {
  single: {
    type: 'single',
    label: 'Один ответ',
    shortLabel: '1 ответ',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-300',
    accentColor: '#f59e0b',
    iconEmoji: '🔘',
    description: 'Выберите один правильный вариант',
  },
  multiple: {
    type: 'multiple',
    label: 'Несколько ответов',
    shortLabel: 'Мульти',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-300',
    accentColor: '#6366f1',
    iconEmoji: '☑️',
    description: 'Отметьте все правильные варианты',
  },
  boolean: {
    type: 'boolean',
    label: 'Правда / Ложь',
    shortLabel: 'T / F',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-300',
    accentColor: '#10b981',
    iconEmoji: '⚖️',
    description: 'Определите верность утверждения',
  },
  text: {
    type: 'text',
    label: 'Ввод текста',
    shortLabel: 'Текст',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-300',
    accentColor: '#06b6d4',
    iconEmoji: '✍️',
    description: 'Напечатайте точный ответ словом',
  },
  number: {
    type: 'number',
    label: 'Числовой ответ',
    shortLabel: 'Число',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-300',
    accentColor: '#14b8a6',
    iconEmoji: '🔢',
    description: 'Введите точное число или диапазон',
  },
  order: {
    type: 'order',
    label: 'Сортировка / Порядок',
    shortLabel: 'Порядок',
    badgeBg: 'bg-orange-500/10',
    badgeBorder: 'border-orange-500/30',
    badgeText: 'text-orange-300',
    accentColor: '#f97316',
    iconEmoji: '🔀',
    description: 'Расставьте пункты в правильной хронологии',
  },
  poll: {
    type: 'poll',
    label: 'Опрос мнений',
    shortLabel: 'Опрос',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-300',
    accentColor: '#a855f7',
    iconEmoji: '📊',
    description: 'Голосование аудитории без баллов',
  },
};

export function getQuestionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return QUESTION_TYPE_THEMES[type] || QUESTION_TYPE_THEMES.single;
}
