import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, X, Send, Check, RefreshCw, MessageSquare, HelpCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Question } from '../../types';
import { sounds } from '../../utils/sound';

interface AIChatWidgetProps {
  quizTitle?: string;
  onApplyQuestions: (newQuestions: Question[]) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isQuestionCard?: boolean;
  questions?: Question[];
  actionStatus?: 'pending' | 'applied' | 'declined';
}

// Demo questions formatted according to the user request
const DEMO_AI_QUESTIONS: Question[] = [
  {
    id: 'ai-gen-1',
    title: 'Какое ключевое слово используется для определения функции в Python?',
    type: 'single',
    timeLimit: 15,
    pointsMultiplier: 1,
    explanation: 'Ключевое слово def используется для определения функций в языке Python.',
    options: [
      { id: 'opt-ai-1-1', text: 'function', isCorrect: false },
      { id: 'opt-ai-1-2', text: 'def', isCorrect: true },
      { id: 'opt-ai-1-3', text: 'func', isCorrect: false },
      { id: 'opt-ai-1-4', text: 'create', isCorrect: false },
    ],
  },
  {
    id: 'ai-gen-2',
    title: 'Какой из перечисленных типов данных в Python является неизменяемым (immutable)?',
    type: 'single',
    timeLimit: 15,
    pointsMultiplier: 1,
    explanation: 'Кортежи (tuple) и строки являются неизменяемыми типами данных.',
    options: [
      { id: 'opt-ai-2-1', text: 'Список (list)', isCorrect: false },
      { id: 'opt-ai-2-2', text: 'Словарь (dict)', isCorrect: false },
      { id: 'opt-ai-2-3', text: 'Кортеж (tuple)', isCorrect: true },
      { id: 'opt-ai-2-4', text: 'Множество (set)', isCorrect: false },
    ],
  },
  {
    id: 'ai-gen-3',
    title: 'Что выведет результат выражения print(2 ** 3) в Python?',
    type: 'single',
    timeLimit: 15,
    pointsMultiplier: 1,
    explanation: 'Оператор ** возводит число в степень: 2 в кубе = 8.',
    options: [
      { id: 'opt-ai-3-1', text: '6', isCorrect: false },
      { id: 'opt-ai-3-2', text: '8', isCorrect: true },
      { id: 'opt-ai-3-3', text: '9', isCorrect: false },
      { id: 'opt-ai-3-4', text: '5', isCorrect: false },
    ],
  },
];

export function AIChatWidget({ quizTitle, onApplyQuestions }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default preset demo conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Привет! 👋 Я ИИ-ассистент QuizArena. Чем помочь в создании квиза?',
      timestamp: '12:00',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Помоги создать 3 квиза основываясь на вопросах и тайтле квиза',
      timestamp: '12:01',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: `Конечно! Вот вам 3 сгенерированных вопроса по теме "${quizTitle || 'Python'}":`,
      timestamp: '12:01',
      isQuestionCard: true,
      questions: DEMO_AI_QUESTIONS,
      actionStatus: 'pending',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const handleToggleChat = () => {
    sounds.playClick();
    setIsOpen((prev) => !prev);
  };

  const handleApply = (messageId: string, questions: Question[]) => {
    sounds.playCorrect();
    onApplyQuestions(questions);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, actionStatus: 'applied' } : msg
      )
    );

    // Add automated confirmation message from AI
    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: '🎉 Отлично! 3 вопроса успешно добавлены в ваш квиз. Вы можете отредактировать их в любое время.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      sounds.playPowerup();
    }, 400);
  };

  const handleDecline = (messageId: string) => {
    sounds.playClick();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, actionStatus: 'declined' } : msg
      )
    );

    setTimeout(() => {
      const declineMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: 'Понял, эти вопросы отменены. Напишите мне, если нужны другие варианты!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, declineMsg]);
    }, 300);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    sounds.playClick();
    const userText = inputValue.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart AI response
    setTimeout(() => {
      setIsTyping(false);
      sounds.playPop();

      let replyText = 'Я проанализировал ваш запрос! Я могу сгенерировать новые вопросы, перефразировать варианты или проверить правильные ответы.';
      let cardQuestions: Question[] | undefined = undefined;

      if (userText.toLowerCase().includes('еще') || userText.toLowerCase().includes('ещё') || userText.toLowerCase().includes('вопрос')) {
        replyText = `Вот еще 3 отличных вопроса по теме "${quizTitle || 'Программирование'}":`;
        cardQuestions = DEMO_AI_QUESTIONS.map((q, idx) => ({
          ...q,
          id: `ai-gen-extra-${Date.now()}-${idx}`,
          title: idx === 0 
            ? 'Что вернет функция type([]) в Python?' 
            : idx === 1 
            ? 'Какой символ используется для комментариев в Python?' 
            : 'Какая функция используется для получения ввода пользователя?',
          options: idx === 0
            ? [
                { id: `o-1-${idx}`, text: '<class "list">', isCorrect: true },
                { id: `o-2-${idx}`, text: '<class "array">', isCorrect: false },
                { id: `o-3-${idx}`, text: '<class "tuple">', isCorrect: false },
              ]
            : idx === 1
            ? [
                { id: `o-4-${idx}`, text: '//', isCorrect: false },
                { id: `o-5-${idx}`, text: '#', isCorrect: true },
                { id: `o-6-${idx}`, text: '/*', isCorrect: false },
              ]
            : [
                { id: `o-7-${idx}`, text: 'input()', isCorrect: true },
                { id: `o-8-${idx}`, text: 'read()', isCorrect: false },
                { id: `o-9-${idx}`, text: 'scan()', isCorrect: false },
              ],
        }));
      }

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuestionCard: !!cardQuestions,
        questions: cardQuestions,
        actionStatus: cardQuestions ? 'pending' : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 900);
  };

  const handleResetChat = () => {
    sounds.playClick();
    setMessages([
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'Привет! 👋 Я ИИ-ассистент QuizArena. Чем помочь в создании квиза?',
        timestamp: '12:00',
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Помоги создать 3 квиза основываясь на вопросах и тайтле квиза',
        timestamp: '12:01',
      },
      {
        id: 'msg-3',
        sender: 'ai',
        text: `Конечно! Вот вам 3 сгенерированных вопроса по теме "${quizTitle || 'Python'}":`,
        timestamp: '12:01',
        isQuestionCard: true,
        questions: DEMO_AI_QUESTIONS,
        actionStatus: 'pending',
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating Robot Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 select-none">
        {/* Helper tooltip if chat is closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl text-xs font-semibold text-indigo-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>ИИ Бот Ассистент</span>
          </motion.div>
        )}

        <button
          onClick={handleToggleChat}
          aria-label={isOpen ? 'Закрыть чат с ИИ ботом' : 'Открыть чат с ИИ ботом'}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border ${
            isOpen
              ? 'bg-slate-800 text-slate-300 border-slate-700 shadow-slate-950/50'
              : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 text-white border-indigo-400/40 shadow-indigo-500/30 hover:shadow-indigo-500/50 ring-4 ring-indigo-500/10'
          }`}
        >
          {/* Online green indicator */}
          <span className="absolute top-0 right-0 flex h-3 w-3 -mt-0.5 -mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-950"></span>
          </span>

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </motion.div>
        </button>
      </div>

      {/* 2. Chat Popup Window with Smooth Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[430px] h-[540px] max-h-[calc(100vh-6.5rem)] z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col font-sans select-none"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight">ИИ-Помощник QuizArena</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      AI 3.6
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Онлайн • Генерация вопросов</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Перезапустить демонстрационный диалог"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleChat}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body (Messages) */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2 ${isAi ? 'text-slate-200' : 'text-white'}`}>
                      <div
                        className={`p-3 rounded-2xl leading-relaxed ${
                          isAi
                            ? 'bg-slate-800/90 border border-slate-700/60 rounded-tl-sm text-slate-200 shadow-sm'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      {/* Question Card Render (Markdown style card for generated questions) */}
                      {msg.isQuestionCard && msg.questions && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 pb-1.5 border-b border-slate-800">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Сгенерировано 3 вопроса</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Python Pack</span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {msg.questions.map((q, idx) => (
                              <div key={q.id} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                                <div className="font-semibold text-slate-200 flex items-start gap-1.5 text-[11px]">
                                  <span className="text-amber-400 font-mono">{idx + 1}.</span>
                                  <span>{q.title}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pt-1">
                                  {q.options.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className={`px-2 py-1 rounded-lg text-[10px] flex items-center justify-between border ${
                                        opt.isCorrect
                                          ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-semibold'
                                          : 'bg-slate-950 border-slate-800 text-slate-400'
                                      }`}
                                    >
                                      <span className="truncate">{opt.text}</span>
                                      {opt.isCorrect && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons: Allow / Decline */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                            {msg.actionStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleDecline(msg.id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-800/50 transition cursor-pointer flex items-center gap-1.5 font-semibold text-[11px]"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Отклонить</span>
                                </button>
                                <button
                                  onClick={() => handleApply(msg.id, msg.questions!)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 transition cursor-pointer flex items-center gap-1.5 font-bold text-[11px] shadow-lg shadow-emerald-500/20"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Вставить в квиз</span>
                                </button>
                              </>
                            )}

                            {msg.actionStatus === 'applied' && (
                              <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 flex items-center justify-center gap-1.5 font-bold text-[11px]">
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Вопросы вставлены в квиз ✓</span>
                              </div>
                            )}

                            {msg.actionStatus === 'declined' && (
                              <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center gap-1.5 font-semibold text-[11px]">
                                <X className="w-3.5 h-3.5 text-slate-500" />
                                <span>Генерация отклонена</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={`text-[10px] text-slate-500 px-1 ${isAi ? 'text-left' : 'text-right'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => {
                  setInputValue('Помоги создать еще 3 вопроса');
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[10px] transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Еще 3 вопроса</span>
              </button>
              <button
                onClick={() => {
                  setInputValue('Сделай вопросы сложнее');
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[10px] transition cursor-pointer"
              >
                <span>🎯 Сложные вопросы</span>
              </button>
              <button
                onClick={() => {
                  setInputValue('Сгенерируй вопрос с типом True/False');
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[10px] transition cursor-pointer"
              >
                <span>⚡ True / False</span>
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Задайте вопрос ИИ боту..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                  inputValue.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
