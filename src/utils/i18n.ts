import { Language, translations, TranslationSchema } from '../i18n/translations';

export const LANGUAGE_STORAGE_KEY = 'quizcraft_language';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿' },
];

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'ru';
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (stored && (stored === 'ru' || stored === 'en' || stored === 'uz')) {
      return stored;
    }
  } catch (err) {
    console.warn('[QuizCraft i18n] Failed to read language from localStorage:', err);
  }
  return 'ru';
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (err) {
    console.error('[QuizCraft i18n] Failed to save language to localStorage:', err);
  }
}

/**
 * Resolves a translation string by nested key path (e.g. 'home.heroTitle1' or 'common.save')
 * with optional parameter interpolation like {count}.
 */
export function translate(
  keyPath: string,
  params?: Record<string, string | number>,
  currentLang?: Language
): string {
  const lang = currentLang || getStoredLanguage();
  const dict = translations[lang] || translations.ru;

  const parts = keyPath.split('.');
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to Russian dictionary
      let fallbackCurrent: any = translations.ru;
      for (const fallbackPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fallbackPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fallbackPart];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }
      current = fallbackCurrent !== undefined ? fallbackCurrent : keyPath;
      break;
    }
  }

  let result = typeof current === 'string' ? current : keyPath;

  if (params && typeof result === 'string') {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return result;
}
