# 🚀 Руководство по запуску бэкенд-сервера и мультиплеера QuizCraft

Это руководство описывает процесс запуска **Node.js + WebSocket + AI** сервера для синхронизации ведущего (Host) и игроков (Players) в реальном времени с любых компьютеров и телефонов, а также генерации квизов с помощью нейросетей (Google Gemini / OpenAI / Groq / Ollama).

---

## 📁 Структура проекта

```
Quiz-Arena/
├── server/                     # Backend Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── index.ts           # Сервер Socket.IO + REST API
│   │   ├── aiProvider.ts      # Генерация вопросов через Gemini / OpenAI REST
│   │   └── types.ts           # TypeScript типы (Question, RoomState, SyncMessage)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Переменные окружения сервера
│
├── src/                        # React + TypeScript + Vite фронтенд
│   ├── services/
│   │   ├── transport/         # WebSocketTransport + LocalBroadcastTransport
│   │   └── aiService.ts       # Клиент генерации ИИ с фолбэком на шаблоны
│   ├── components/
│   │   └── Common/
│   │       └── AISettingsModal.tsx # Окно настройки API-ключа и провайдера
│   └── utils/
│       └── aiConfig.ts        # Сохранение настроек ИИ в localStorage
└── SERVER_SETUP.md
```

---

## ⚡ Быстрый старт

### 1. Запуск Backend-сервера

1. Перейдите в папку сервера:
   ```bash
   cd server
   ```

2. Установите зависимости:
   ```bash
   npm install
   # или bun install / pnpm install
   ```

3. (Опционально) Настройте `.env` в папке `server/`:
   ```env
   PORT=4000
   NODE_ENV=development

   # Если хотите задать дефолтный ключ для сервера (не обязательно, можно вводить прямо в UI браузера):
   GEMINI_API_KEY=ваш_ключ_gemini
   OPENAI_API_KEY=ваш_ключ_openai
   ```

4. Запустите сервер в режиме разработки:
   ```bash
   npm run dev
   ```
   Сервер запустится на `http://localhost:4000`.

---

### 2. Запуск фронтенда

1. В корневой директории `Quiz-Arena`:
   ```bash
   npm install
   # или bun install
   ```

2. Убедитесь, что в файле `.env.local` указаны адреса сервера:
   ```env
   VITE_WS_SERVER_URL=http://localhost:4000
   VITE_API_SERVER_URL=http://localhost:4000
   ```

3. Запустите фронтенд:
   ```bash
   npm run dev
   ```
   Приложение откроется на `http://localhost:3000`.

---

## 📱 Игра с телефонов и других устройств в локальной сети (Wi-Fi)

Чтобы игроки могли подключиться с телефонов или других ноутбуков в той же сети:

1. Узнайте ваш локальный IP-адрес (например, `192.168.1.50`):
   - Windows: в командной строке выполните `ipconfig` (строка IPv4-адрес)
   - macOS / Linux: выполните `ifconfig` или `ip a`

2. В `.env.local` фронтенда укажите локальный IP:
   ```env
   VITE_WS_SERVER_URL=http://192.168.1.50:4000
   VITE_API_SERVER_URL=http://192.168.1.50:4000
   ```

3. Ведущий открывает: `http://192.168.1.50:3000` → запускает квиз и видит **PIN**.
4. Игроки на телефонах открывают `http://192.168.1.50:3000` в мобильном браузере и вводят **PIN**. Все ответы, очки и реакции синхронизируются мгновенно через WebSocket!

---

## 🤖 Настройка ИИ-генератора (BYOK — Bring Your Own Key)

В интерфейсе приложения (в редакторе квиза, библиотеке или на главной странице) доступна кнопка **«Настройки ИИ» (иконка робота/шестеренки)**:

1. **Google Gemini (по умолчанию)**:
   - Base URL: `https://generativelanguage.googleapis.com`
   - Model: `gemini-1.5-flash` или `gemini-2.0-flash`
   - API Key: получить бесплатный ключ на [Google AI Studio](https://aistudio.google.com/)

2. **OpenAI / Прокси / Groq / DeepSeek / Ollama**:
   - OpenAI: `https://api.openai.com/v1`, модель `gpt-4o-mini`
   - Groq: `https://api.groq.com/openai/v1`, модель `llama-3.3-70b-versatile`
   - DeepSeek: `https://api.deepseek.com/v1`, модель `deepseek-chat`
   - Локальная Ollama: `http://localhost:11434/v1`, модель `llama3.2`

3. Нажмите кнопку **«Проверить соединение»** для мгновенной верификации ключа.
4. Настройки сохраняются индивидуально в `localStorage` каждого браузера участников.
5. При отсутствии ключа или отключенном сервере система **автоматически и незаметно** переключается на курированные наборы шаблонов, так что демо никогда не ломается!

---

## 🛠 Архитектура WebSocket событий

- `HOST_STATE_UPDATE`: Ведущий обновляет состояние игры (вопросы, время, очки, статус).
- `PLAYER_JOIN_REQUEST`: Игрок подключается к комнате по PIN-коду.
- `PLAYER_ANSWER_SUBMIT`: Игрок отправляет ответ на текущий вопрос.
- `EMOJI_REACTION`: Игрок отправляет плавающую эмодзи-реакцию.
- `HOST_KICK_PLAYER`: Ведущий удаляет игрока из комнаты.
- `REQUEST_ROOM_SYNC`: Синхронизация нового или переподключенного клиента.
