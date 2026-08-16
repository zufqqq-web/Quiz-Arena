import { GoogleGenerativeAI } from '@google/generative-ai';
const SYSTEM_PROMPT = `
You are an expert interactive quiz generator for QuizCraft (a live multiplayer kahoot-like game).
Generate an engaging, high-quality, balanced quiz strictly adhering to the requested topic, question count, difficulty, and language.

CRITICAL INSTRUCTION:
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
3. 'boolean': Exactly 2 options ("Правда (True)" and "Ложь (False)"). Exactly one has "isCorrect": true.
4. 'text': "options": []. Must provide "correctTextAnswer" with the canonical text answer.
5. 'number': "options": []. Must provide "correctNumberAnswer" (numeric value) and reasonable "numberTolerance".
6. 'order': 4 options. Must assign "orderIndex": 0, 1, 2, 3 to options representing the CORRECT chronological or logical sequence.
7. 'poll': 3-4 options. "pointsMultiplier": 0, no correct answers needed (opinion question).

Mix different question types (single, multiple, boolean, text, number, order, poll) to make the quiz exciting and diverse!
`;
/**
 * Clean JSON output from AI models (strip markdown code fences, comments, etc.)
 */
function cleanJsonOutput(raw) {
    let cleaned = raw.trim();
    // Remove markdown code fences ```json ... ``` or ``` ... ```
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    }
    cleaned = cleaned.trim();
    // If wrapped inside a JSON object like {"questions": [...]} or {"quiz": [...]}, extract array
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
    }
    return cleaned;
}
/**
 * Validates and normalizes raw parsed JSON into valid Question array.
 */
function normalizeQuestions(parsed) {
    const list = Array.isArray(parsed) ? parsed : (parsed?.questions || parsed?.items || []);
    if (!Array.isArray(list) || list.length === 0) {
        throw new Error('AI response did not contain an array of questions');
    }
    const validTypes = ['single', 'multiple', 'boolean', 'text', 'number', 'order', 'poll'];
    return list.map((item, idx) => {
        const rawType = String(item.type || 'single').toLowerCase();
        const type = validTypes.includes(rawType)
            ? rawType
            : 'single';
        const qId = item.id ? String(item.id) : `q-${Date.now()}-${idx + 1}`;
        const rawOptions = Array.isArray(item.options) ? item.options : [];
        const options = rawOptions.map((opt, oIdx) => ({
            id: opt.id ? String(opt.id) : `opt-${qId}-${oIdx + 1}`,
            text: String(opt.text || `Вариант ${oIdx + 1}`),
            isCorrect: Boolean(opt.isCorrect),
            ...(typeof opt.orderIndex === 'number' ? { orderIndex: opt.orderIndex } : {}),
        }));
        return {
            id: qId,
            title: String(item.title || `Вопрос №${idx + 1}`),
            type,
            timeLimit: typeof item.timeLimit === 'number' ? item.timeLimit : 20,
            pointsMultiplier: typeof item.pointsMultiplier === 'number' ? item.pointsMultiplier : 1,
            options,
            explanation: item.explanation ? String(item.explanation) : undefined,
            correctTextAnswer: item.correctTextAnswer ? String(item.correctTextAnswer) : undefined,
            correctNumberAnswer: typeof item.correctNumberAnswer === 'number' ? item.correctNumberAnswer : undefined,
            numberTolerance: typeof item.numberTolerance === 'number' ? item.numberTolerance : undefined,
            imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        };
    });
}
/**
 * Executes a generation request with Google Gemini API
 */
async function generateWithGemini(prompt, apiKey, modelName = 'gemini-1.5-flash', baseUrl) {
    // If a custom baseUrl is provided for Gemini REST endpoint
    if (baseUrl && baseUrl.includes('googleapis.com')) {
        const endpoint = `${baseUrl.replace(/\/+$/, '')}/models/${modelName}:generateContent?key=${apiKey}`;
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
            throw new Error(`Gemini REST API error (${response.status}): ${errBody}`);
        }
        const data = (await response.json());
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('Empty response received from Gemini API');
        }
        return text;
    }
    // Official @google/generative-ai SDK path
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
/**
 * Executes a generation request with OpenAI-compatible API endpoint
 */
async function generateWithOpenAICompatible(prompt, apiKey, modelName = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1') {
    const sanitizedUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = sanitizedUrl.endsWith('/chat/completions')
        ? sanitizedUrl
        : `${sanitizedUrl}/chat/completions`;
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
    const data = (await response.json());
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('Empty content in choices from OpenAI-compatible provider');
    }
    return content;
}
/**
 * Main quiz generation handler routing to appropriate provider
 */
export async function generateQuizQuestions(request) {
    const { topic, questionCount = 5, difficulty = 'medium', language = 'ru', aiConfig } = request;
    // Resolve API Key, BaseUrl, and Model
    let apiKey = aiConfig?.apiKey?.trim() || '';
    let baseUrl = aiConfig?.baseUrl?.trim() || '';
    let modelName = aiConfig?.model?.trim() || '';
    // Fallback to server environment variables if client did not supply a custom key
    if (!apiKey) {
        if (process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY;
            if (!baseUrl)
                baseUrl = 'https://generativelanguage.googleapis.com';
            if (!modelName)
                modelName = 'gemini-1.5-flash';
        }
        else if (process.env.OPENAI_API_KEY) {
            apiKey = process.env.OPENAI_API_KEY;
            if (!baseUrl)
                baseUrl = 'https://api.openai.com/v1';
            if (!modelName)
                modelName = 'gpt-4o-mini';
        }
    }
    if (!apiKey) {
        const err = new Error('AI provider not configured. Please provide an API key in settings or server .env');
        err.statusCode = 400;
        throw err;
    }
    const userPrompt = `
Topic: "${topic}"
Target question count: ${questionCount}
Difficulty level: ${difficulty} (easy / medium / hard)
Language: ${language === 'ru' ? 'Russian' : 'English'}

Generate exactly ${questionCount} varied questions about "${topic}".
Include diverse question types ('single', 'multiple', 'boolean', 'text', 'number', 'order', 'poll') with engaging titles and explanations.
Return strictly the JSON array of Question objects.
`;
    let rawOutput = '';
    const isGoogle = (baseUrl && baseUrl.includes('googleapis.com')) || (!baseUrl && (modelName.includes('gemini') || !!process.env.GEMINI_API_KEY));
    if (isGoogle) {
        rawOutput = await generateWithGemini(userPrompt, apiKey, modelName || 'gemini-1.5-flash', baseUrl);
    }
    else {
        rawOutput = await generateWithOpenAICompatible(userPrompt, apiKey, modelName || 'gpt-4o-mini', baseUrl || 'https://api.openai.com/v1');
    }
    const cleaned = cleanJsonOutput(rawOutput);
    let parsedJson;
    try {
        parsedJson = JSON.parse(cleaned);
    }
    catch (err) {
        throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw output snippet: ${rawOutput.substring(0, 200)}`);
    }
    return normalizeQuestions(parsedJson);
}
/**
 * Tests connection to the specified AI provider with a lightweight query.
 */
export async function testAIProviderConnection(config) {
    let apiKey = config?.apiKey?.trim() || '';
    let baseUrl = config?.baseUrl?.trim() || '';
    let modelName = config?.model?.trim() || '';
    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
    }
    if (!apiKey) {
        return { ok: false, message: 'API key is missing' };
    }
    const isGoogle = (baseUrl && baseUrl.includes('googleapis.com')) || (!baseUrl && (modelName.includes('gemini') || !!process.env.GEMINI_API_KEY));
    try {
        if (isGoogle) {
            const response = await generateWithGemini('Respond with valid JSON: {"status": "ok"}', apiKey, modelName || 'gemini-1.5-flash', baseUrl);
            if (response)
                return { ok: true, message: 'Gemini connection successful!' };
        }
        else {
            const response = await generateWithOpenAICompatible('Respond with valid JSON: {"status": "ok"}', apiKey, modelName || 'gpt-4o-mini', baseUrl || 'https://api.openai.com/v1');
            if (response)
                return { ok: true, message: 'OpenAI-compatible connection successful!' };
        }
        return { ok: true, message: 'Connection verified!' };
    }
    catch (err) {
        return { ok: false, message: err.message || 'Connection failed' };
    }
}
