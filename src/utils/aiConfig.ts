export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const AI_STORAGE_KEY = 'quizcraft_ai_config';

export const AI_PRESETS: { name: string; label: string; icon: string; config: AIConfig }[] = [
  {
    name: 'gemini',
    label: 'Google Gemini',
    icon: '✨',
    config: {
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: '',
      model: 'gemini-1.5-flash',
    },
  },
  {
    name: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    config: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
    },
  },
  {
    name: 'groq',
    label: 'Groq (Fast LLM)',
    icon: '⚡',
    config: {
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: '',
      model: 'llama-3.3-70b-versatile',
    },
  },
  {
    name: 'deepseek',
    label: 'DeepSeek',
    icon: '🧠',
    config: {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-chat',
    },
  },
  {
    name: 'ollama',
    label: 'Ollama / Local',
    icon: '🦙',
    config: {
      baseUrl: 'http://localhost:11434/v1',
      apiKey: 'ollama',
      model: 'llama3.2',
    },
  },
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: '',
  model: 'gemini-1.5-flash',
};

/**
 * Retrieves per-browser AI configuration from localStorage
 */
export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;

  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : DEFAULT_AI_CONFIG.baseUrl,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : DEFAULT_AI_CONFIG.model,
    };
  } catch (err) {
    console.warn('[QuizCraft AI] Failed to read AI config from localStorage:', err);
    return DEFAULT_AI_CONFIG;
  }
}

/**
 * Saves AI configuration to localStorage
 */
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      AI_STORAGE_KEY,
      JSON.stringify({
        baseUrl: config.baseUrl.trim(),
        apiKey: config.apiKey.trim(),
        model: config.model.trim(),
      })
    );
  } catch (err) {
    console.error('[QuizCraft AI] Failed to save AI config to localStorage:', err);
  }
}

/**
 * Clears stored AI config from localStorage
 */
export function clearAIConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AI_STORAGE_KEY);
  } catch (err) {
    console.error('[QuizCraft AI] Failed to clear AI config:', err);
  }
}

/**
 * Tests connection to the remote backend / AI provider
 */
export async function testAIConnection(
  config: AIConfig
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const serverUrl = (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_SERVER_URL) ||
    'http://localhost:4000'
  ).replace(/\/+$/, '');

  try {
    const response = await fetch(`${serverUrl}/api/test-ai-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const data = await response.json();
    if (response.ok && data.ok) {
      return { ok: true, message: data.message || 'Подключение успешно проверено!' };
    }
    return { ok: false, error: data.error || 'Ошибка проверки соединения с ИИ' };
  } catch (err: any) {
    return {
      ok: false,
      error: `Не удалось связаться с сервером (${serverUrl}): ${err.message || 'Сеть недоступна'}`,
    };
  }
}
