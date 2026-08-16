import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, QuestionType, AIClientConfig, GenerateQuizRequest } from './types.js';

const SYSTEM_PROMPT = `
You are an expert interactive quiz generator for QuizCraft (a live multiplayer kahoot-like game).
Generate an engaging, high-quality, balanced quiz strictly adhering to the requested topic, question count, difficulty, and language.

CRITICAL INSTRUCTIONS:
1. TOPIC ADHERENCE:
   The generated questions MUST be directly, strictly, and specifically about the exact topic provided by the user.
   Do NOT generate generic trivia questions unrelated to the topic. If the topic is "JavaScript", all questions MUST be strictly about JavaScript programming. If the topic is "Harry Potter", all questions MUST be strictly about Harry Potter.

2. LANGUAGE RULES:
   - If Language is 'Russian' (ru), all question titles, options, and explanations MUST be strictly in natural, grammatically correct Russian.
   - If Language is 'English' (en), all question titles, options, and explanations MUST be strictly in natural English.
   - If Language is 'Uzbek' (uz), all question titles, options, and explanations MUST be strictly in natural Uzbek language (O'zbek tili, lotin yozuvi / Latin script).

3. OUTPUT FORMAT:
   Return ONLY a valid JSON array of Question objects. Do NOT include markdown code blocks, backticks, or any conversational prose before or after the JSON.

SCHEMA DEFINITION FOR QUESTION:
[
  {
    "id": "q-1",
    "title": "string (the question text, clear and engaging)",
    "type": "single" | "multiple" | "boolean" | "text" | "number" | "order" | "poll",
    "timeLimit": number (seconds: 10, 15, 20, 30, or 60),
    "pointsMultiplier": number (0 for poll, 1 for standard, 2 for hard/double bonus),
    "explanation": "string (brief interesting fact explaining the correct answer)",
    "options": [
      {
        "id": "opt-1",
        "text": "string",
        "isCorrect": boolean (optional, true if correct),
        "orderIndex": number (optional, 0..N for 'order' type)
      }
    ],
    "correctTextAnswer": "string (REQUIRED only for 'text' type, exact answer or short phrase)",
    "correctNumberAnswer": number (REQUIRED only for 'number' type),
    "numberTolerance": number (optional for 'number' type, margin of error e.g. 5)
  }
]

QUESTION TYPE RULES:
1. 'single': Standard 4 multiple-choice options. Exactly ONE option must have "isCorrect": true, others false.
2. 'multiple': Standard 4 multiple-choice options. TWO OR MORE options must have "isCorrect": true.
3. 'boolean': Exactly 2 options ("Правда (True)" / "Haqiqat (True)" / "True" and "Ложь (False)" / "Yolg'on (False)" / "False"). Exactly one has "isCorrect": true.
4. 'text': "options": []. Must provide "correctTextAnswer" with the canonical text answer.
5. 'number': "options": []. Must provide "correctNumberAnswer" (numeric value) and reasonable "numberTolerance".
6. 'order': 4 options. Must assign "orderIndex": 0, 1, 2, 3 to options representing the CORRECT chronological or logical sequence.
7. 'poll': 3-4 options. "pointsMultiplier": 0, no correct answers needed (opinion question).

Mix different question types (single, multiple, boolean, text, number, order, poll) to make the quiz exciting and diverse!
`;

/**
 * Clean and extract JSON output from AI models (strip markdown code fences, pre/post comments, trailing commas)
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }

  // If there's an outer array bracket, extract between first [ and last ]
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');

  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');

  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    if (objectStart === -1 || arrayStart < objectStart || objectEnd < arrayEnd) {
      cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
    } else if (objectStart !== -1 && objectEnd > objectStart) {
      cleaned = cleaned.substring(objectStart, objectEnd + 1);
    }
  } else if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    cleaned = cleaned.substring(objectStart, objectEnd + 1);
  }

  // Remove trailing commas before closing braces/brackets (common LLM JSON syntax error)
  cleaned = cleaned.replace(/,\s*([\]\}])/g, '$1');

  return cleaned.trim();
}

/**
 * Validates and normalizes raw parsed JSON into valid Question array with resilient key name mapping.
 */
function normalizeQuestions(parsed: any): Question[] {
  let list: any[] = [];

  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === 'object') {
    list =
      parsed.questions ||
      parsed.quiz?.questions ||
      parsed.items ||
      parsed.data ||
      parsed.results ||
      parsed.quiz ||
      parsed.list ||
      [];
  }

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('AI response did not contain a valid array of questions');
  }

  const validTypes: QuestionType[] = ['single', 'multiple', 'boolean', 'text', 'number', 'order', 'poll'];

  return list.map((item: any, idx: number): Question => {
    const qId = item.id ? String(item.id).trim() : `q-${Date.now()}-${idx + 1}`;

    // Normalize question title / prompt
    const rawTitle =
      item.title ||
      item.question ||
      item.text ||
      item.prompt ||
      item.query ||
      item.header ||
      `Вопрос №${idx + 1}`;
    const title = String(rawTitle).trim();

    // Normalize question type
    let rawType = String(item.type || item.questionType || item.question_type || 'single').toLowerCase().trim();
    if (rawType === 'multiple_choice' || rawType === 'single_choice' || rawType === 'choice') rawType = 'single';
    if (rawType === 'multi' || rawType === 'checkbox' || rawType === 'multi_choice') rawType = 'multiple';
    if (rawType === 'true_false' || rawType === 'bool' || rawType === 'tf') rawType = 'boolean';
    if (rawType === 'input' || rawType === 'string' || rawType === 'open') rawType = 'text';
    if (rawType === 'numeric' || rawType === 'math') rawType = 'number';
    if (rawType === 'sequence' || rawType === 'sort' || rawType === 'ordering') rawType = 'order';
    if (rawType === 'survey' || rawType === 'opinion') rawType = 'poll';

    const type: QuestionType = validTypes.includes(rawType as QuestionType)
      ? (rawType as QuestionType)
      : 'single';

    // Normalize options
    const rawOptions = Array.isArray(item.options)
      ? item.options
      : Array.isArray(item.answers)
      ? item.answers
      : Array.isArray(item.choices)
      ? item.choices
      : Array.isArray(item.variants)
      ? item.variants
      : [];

    let options = rawOptions.map((opt: any, oIdx: number) => {
      const optText =
        typeof opt === 'string'
          ? opt
          : opt.text || opt.option || opt.answer || opt.title || opt.label || opt.choice || `Вариант ${oIdx + 1}`;

      const isCorrect =
        typeof opt === 'object' && opt !== null
          ? Boolean(opt.isCorrect ?? opt.is_correct ?? opt.correct ?? opt.right ?? opt.is_right)
          : false;

      const orderIdx =
        typeof opt === 'object' && opt !== null
          ? (typeof opt.orderIndex === 'number' ? opt.orderIndex : typeof opt.order_index === 'number' ? opt.order_index : typeof opt.order === 'number' ? opt.order : undefined)
          : undefined;

      return {
        id: opt.id ? String(opt.id) : `opt-${qId}-${oIdx + 1}`,
        text: String(optText).trim(),
        isCorrect,
        ...(typeof orderIdx === 'number' ? { orderIndex: orderIdx } : {}),
      };
    });

    // Fallback for boolean question with missing options
    if (type === 'boolean' && options.length < 2) {
      options = [
        { id: `opt-${qId}-1`, text: 'Правда (True)', isCorrect: true },
        { id: `opt-${qId}-2`, text: 'Ложь (False)', isCorrect: false },
      ];
    }

    // Ensure single choice has at least one correct option
    if (type === 'single' && options.length > 0 && !options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    // Normalize time limit
    const rawTime = item.timeLimit ?? item.time_limit ?? item.time ?? item.duration ?? item.seconds;
    const timeLimit = typeof rawTime === 'number' && rawTime > 0 ? rawTime : 20;

    // Normalize points multiplier
    const rawMultiplier = item.pointsMultiplier ?? item.points_multiplier ?? item.points ?? item.multiplier;
    const pointsMultiplier = type === 'poll' ? 0 : typeof rawMultiplier === 'number' ? rawMultiplier : 1;

    // Normalize explanation
    const rawExp = item.explanation || item.explain || item.description || item.reason || item.notes;
    const explanation = rawExp ? String(rawExp).trim() : undefined;

    // Normalize text answer
    const rawTextAnswer =
      item.correctTextAnswer ||
      item.correct_text_answer ||
      item.correctAnswer ||
      item.correct_answer ||
      item.text_answer ||
      item.answer;
    const correctTextAnswer = rawTextAnswer ? String(rawTextAnswer).trim() : undefined;

    // Normalize number answer
    const rawNumAnswer =
      item.correctNumberAnswer ??
      item.correct_number_answer ??
      item.correct_number ??
      item.numeric_answer ??
      item.number_answer;
    const correctNumberAnswer = typeof rawNumAnswer === 'number' ? rawNumAnswer : undefined;

    // Normalize tolerance
    const rawTolerance = item.numberTolerance ?? item.number_tolerance ?? item.tolerance ?? item.margin;
    const numberTolerance = typeof rawTolerance === 'number' ? rawTolerance : undefined;

    return {
      id: qId,
      title,
      type,
      timeLimit,
      pointsMultiplier,
      options,
      explanation,
      correctTextAnswer,
      correctNumberAnswer,
      numberTolerance,
      imageUrl: item.imageUrl ? String(item.imageUrl).trim() : undefined,
    };
  });
}

/**
 * Executes a generation request with Google Gemini API
 */
async function generateWithGemini(
  prompt: string,
  apiKey: string,
  modelName: string = 'gemini-1.5-flash',
  baseUrl?: string
): Promise<string> {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, '') : '';

  // If a custom proxy/endpoint is specified (not default googleapis.com)
  if (cleanBase && !cleanBase.includes('generativelanguage.googleapis.com')) {
    const endpointPath = cleanBase.includes('/v1') ? '' : '/v1beta';
    const endpoint = `${cleanBase}${endpointPath}/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUSER REQUEST:\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini Proxy API error (${response.status}): ${errBody}`);
    }

    const data = (await response.json()) as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response received from Gemini Proxy API');
    }
    return text;
  }

  // Official @google/generative-ai SDK path
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  if (!text) {
    throw new Error('Empty response received from Google Gemini SDK');
  }
  return text;
}

/**
 * Executes a generation request with OpenAI-compatible API endpoint
 */
async function generateWithOpenAICompatible(
  prompt: string,
  apiKey: string,
  modelName: string = 'gpt-4o-mini',
  baseUrl: string = 'https://api.openai.com/v1'
): Promise<string> {
  const sanitizedUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = sanitizedUrl.endsWith('/chat/completions')
    ? sanitizedUrl
    : sanitizedUrl.endsWith('/v1')
    ? `${sanitizedUrl}/chat/completions`
    : `${sanitizedUrl}/v1/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI-compatible API error (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty content in choices from OpenAI-compatible provider');
  }
  return content;
}

/**
 * Main quiz generation handler routing to appropriate provider
 */
export async function generateQuizQuestions(request: GenerateQuizRequest): Promise<Question[]> {
  const { topic, questionCount = 5, difficulty = 'medium', language = 'ru', aiConfig } = request;

  // Resolve API Key, BaseUrl, and Model
  let apiKey = aiConfig?.apiKey?.trim() || '';
  let baseUrl = aiConfig?.baseUrl?.trim() || '';
  let modelName = aiConfig?.model?.trim() || '';

  // Fallback to server environment variables if client did not supply a custom key
  if (!apiKey) {
    if (process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
      if (!baseUrl) baseUrl = 'https://generativelanguage.googleapis.com';
      if (!modelName) modelName = 'gemini-1.5-flash';
    } else if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
      if (!baseUrl) baseUrl = 'https://api.openai.com/v1';
      if (!modelName) modelName = 'gpt-4o-mini';
    }
  }

  if (!apiKey) {
    const err = new Error('AI provider not configured. Please provide an API key in settings or server .env');
    (err as any).statusCode = 400;
    throw err;
  }

  const languageLabel =
    language === 'uz'
      ? 'Uzbek (O\'zbek tili, lotin yozuvida)'
      : language === 'en'
      ? 'English'
      : 'Russian (Русский язык)';

  const userPrompt = `
Topic: "${topic}"
Target question count: ${questionCount}
Difficulty level: ${difficulty} (easy / medium / hard)
Language: ${languageLabel}

MANDATORY INSTRUCTION:
Generate exactly ${questionCount} varied questions strictly about the topic "${topic}".
Every single question MUST be specifically and accurately about "${topic}".
Include diverse question types ('single', 'multiple', 'boolean', 'text', 'number', 'order', 'poll') with engaging titles and explanations.
Return strictly the JSON array of Question objects.
`;

  let rawOutput = '';
  const isGoogle =
    (baseUrl && baseUrl.includes('googleapis.com')) ||
    (!baseUrl && (modelName.includes('gemini') || !!process.env.GEMINI_API_KEY));

  if (isGoogle) {
    rawOutput = await generateWithGemini(userPrompt, apiKey, modelName || 'gemini-1.5-flash', baseUrl);
  } else {
    rawOutput = await generateWithOpenAICompatible(
      userPrompt,
      apiKey,
      modelName || 'gpt-4o-mini',
      baseUrl || 'https://api.openai.com/v1'
    );
  }

  const cleaned = cleanJsonOutput(rawOutput);
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(
      `Failed to parse AI JSON response: ${err.message}. Raw output snippet: ${rawOutput.substring(0, 200)}`
    );
  }

  return normalizeQuestions(parsedJson);
}

/**
 * Tests connection to the specified AI provider with a lightweight query.
 */
export async function testAIProviderConnection(config: AIClientConfig): Promise<{ ok: boolean; message: string }> {
  let apiKey = config?.apiKey?.trim() || '';
  let baseUrl = config?.baseUrl?.trim() || '';
  let modelName = config?.model?.trim() || '';

  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
  }

  if (!apiKey) {
    return { ok: false, message: 'API key is missing' };
  }

  const isGoogle =
    (baseUrl && baseUrl.includes('googleapis.com')) ||
    (!baseUrl && (modelName.includes('gemini') || !!process.env.GEMINI_API_KEY));

  try {
    if (isGoogle) {
      const response = await generateWithGemini(
        'Respond with valid JSON: [{"id":"test","title":"Test","type":"single","timeLimit":15,"pointsMultiplier":1,"options":[{"id":"1","text":"Ok","isCorrect":true}]}]',
        apiKey,
        modelName || 'gemini-1.5-flash',
        baseUrl
      );
      if (response) return { ok: true, message: 'Gemini connection successful!' };
    } else {
      const response = await generateWithOpenAICompatible(
        'Respond with valid JSON: [{"id":"test","title":"Test","type":"single","timeLimit":15,"pointsMultiplier":1,"options":[{"id":"1","text":"Ok","isCorrect":true}]}]',
        apiKey,
        modelName || 'gpt-4o-mini',
        baseUrl || 'https://api.openai.com/v1'
      );
      if (response) return { ok: true, message: 'OpenAI-compatible connection successful!' };
    }
    return { ok: true, message: 'Connection verified!' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection failed' };
  }
}
