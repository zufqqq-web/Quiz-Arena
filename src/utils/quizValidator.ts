import { Quiz, Question } from '../types';

export interface ValidationError {
  questionIndex?: number;
  questionId?: string;
  field: string;
  message: string;
}

export function validateQuiz(quiz: Quiz): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!quiz.title || quiz.title.trim() === '') {
    errors.push({ field: 'title', message: 'Укажите название квиза' });
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push({ field: 'questions', message: 'Квиз должен содержать как минимум один вопрос' });
    return { isValid: false, errors };
  }

  quiz.questions.forEach((q, idx) => {
    if (!q.title || q.title.trim() === '') {
      errors.push({
        questionIndex: idx,
        questionId: q.id,
        field: 'title',
        message: `Вопрос #${idx + 1}: введите текст вопроса`,
      });
    }

    if (q.type === 'single' || q.type === 'multiple') {
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'options',
          message: `Вопрос #${idx + 1}: выберите хотя бы один правильный ответ`,
        });
      }
      const emptyOption = q.options.some((opt) => !opt.text || opt.text.trim() === '');
      if (emptyOption) {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'options',
          message: `Вопрос #${idx + 1}: заполните текст всех вариантов ответа`,
        });
      }
    } else if (q.type === 'boolean') {
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'options',
          message: `Вопрос #${idx + 1} (Правда/Ложь): отметьте верный вариант`,
        });
      }
    } else if (q.type === 'text') {
      if (!q.correctTextAnswer || q.correctTextAnswer.trim() === '') {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'correctTextAnswer',
          message: `Вопрос #${idx + 1} (Текст): укажите ожидаемый текстовый ответ`,
        });
      }
    } else if (q.type === 'number') {
      if (q.correctNumberAnswer === undefined || isNaN(q.correctNumberAnswer)) {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'correctNumberAnswer',
          message: `Вопрос #${idx + 1} (Число): задайте верное числовое значение`,
        });
      }
    } else if (q.type === 'order') {
      if (!q.options || q.options.length < 2) {
        errors.push({
          questionIndex: idx,
          questionId: q.id,
          field: 'options',
          message: `Вопрос #${idx + 1} (Порядок): должно быть не менее 2 пунктов для сортировки`,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
