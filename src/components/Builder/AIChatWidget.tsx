import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, X, Send, Check, RefreshCw, MessageSquare, HelpCircle, AlertCircle, ChevronRight, Settings } from 'lucide-react';
import { Question } from '../../types';
import { sounds } from '../../utils/sound';
import { generateQuizWithAI } from '../../services/aiService';
import { AISettingsModal } from '../Common/AISettingsModal';
import { useLanguage } from '../../contexts/LanguageContext';

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
  isFallback?: boolean;
  errorReason?: string;
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
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default preset conversation
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-1',
      sender: 'ai',
      text: t('aiChat.welcomeMsg'),
      timestamp: '12:00',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: t('aiChat.sampleUserMsg'),
      timestamp: '12:01',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: t('aiChat.sampleAiMsg', { topic: quizTitle || 'Python' }),
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
        text: t('aiChat.appliedFollowup'),
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
        text: t('aiChat.declinedFollowup'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, declineMsg]);
    }, 300);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
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

    const isQuestionRequest =
      userText.toLowerCase().includes('вопрос') ||
      userText.toLowerCase().includes('question') ||
      userText.toLowerCase().includes('savol') ||
      userText.toLowerCase().includes('квиз') ||
      userText.toLowerCase().includes('quiz') ||
      userText.toLowerCase().includes('еще') ||
      userText.toLowerCase().includes('more') ||
      userText.toLowerCase().includes('яна') ||
      userText.toLowerCase().includes('создай') ||
      userText.toLowerCase().includes('create') ||
      userText.toLowerCase().includes('yarat') ||
      userText.toLowerCase().includes('сгенерируй') ||
      userText.toLowerCase().includes('generate');

    try {
      if (isQuestionRequest) {
        // Run generation with real AI / backend
        const topic = quizTitle || userText;
        const result = await generateQuizWithAI({
          topic,
          questionCount: 3,
          language: language === 'uz' ? 'uz' : language === 'en' ? 'en' : 'ru',
        });

        setIsTyping(false);
        sounds.playPop();

        let aiText = t('aiChat.sampleAiMsg', { topic });
        if (result.usedFallback) {
          aiText = t('aiChat.fallbackNotice', {
            topic,
            reason: result.errorReason || 'Offline demo',
          });
        }

        const aiMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isQuestionCard: true,
          questions: result.questions,
          actionStatus: 'pending',
          isFallback: result.usedFallback,
          errorReason: result.errorReason,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Chat assistance response
        setTimeout(() => {
          setIsTyping(false);
          sounds.playPop();

          const aiMsg: ChatMessage = {
            id: 'msg-' + (Date.now() + 1),
            sender: 'ai',
            text: t('aiChat.genericHelp'),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
        }, 600);
      }
    } catch {
      setIsTyping(false);
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: t('aiChat.errorMsg'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  const handleResetChat = () => {
    sounds.playClick();
    setMessages([
      {
        id: 'msg-1',
        sender: 'ai',
        text: t('aiChat.welcomeMsg'),
        timestamp: '12:00',
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: t('aiChat.sampleUserMsg'),
        timestamp: '12:01',
      },
      {
        id: 'msg-3',
        sender: 'ai',
        text: t('aiChat.sampleAiMsg', { topic: quizTitle || 'Python' }),
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
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl text-xs font-semibold text-indigo-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-400)] animate-pulse" />
            <span>{t('aiChat.floatingTooltip')}</span>
          </motion.div>
        )}

        <button
          onClick={handleToggleChat}
          aria-label={isOpen ? t('common.close') : t('aiChat.botTitle')}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border ${
            isOpen
              ? 'bg-slate-800 text-slate-300 border-slate-700 shadow-slate-950/50'
              : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-[var(--accent-500)] text-white border-indigo-400/40 shadow-indigo-500/30 hover:shadow-indigo-500/50 ring-4 ring-indigo-500/10'
          }`}
        >
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

      {/* 2. Chat Popup Window */}
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
                    <h3 className="text-sm font-bold text-white tracking-tight">{t('aiChat.botTitle')}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      AI 3.6
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t('aiChat.botStatus')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsSettingsOpen(true);
                  }}
                  title={t('common.aiSettings')}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetChat}
                  title={t('common.reset')}
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

                      {/* Question Card Render */}
                      {msg.isQuestionCard && msg.questions && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--accent-300)] pb-1.5 border-b border-slate-800">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-400)]" />
                              <span>{t('aiChat.generatedHeader')}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">QuizPack</span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {msg.questions.map((q, idx) => (
                              <div key={q.id} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                                <div className="font-semibold text-slate-200 flex items-start gap-1.5 text-[11px]">
                                  <span className="text-[var(--accent-400)] font-mono">{idx + 1}.</span>
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

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                            {msg.actionStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleDecline(msg.id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-800/50 transition cursor-pointer flex items-center gap-1.5 font-semibold text-[11px]"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>{t('aiChat.decline')}</span>
                                </button>
                                <button
                                  onClick={() => handleApply(msg.id, msg.questions!)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 transition cursor-pointer flex items-center gap-1.5 font-bold text-[11px] shadow-lg shadow-emerald-500/20"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>{t('aiChat.apply')}</span>
                                </button>
                              </>
                            )}

                            {msg.actionStatus === 'applied' && (
                              <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 flex items-center justify-center gap-1.5 font-bold text-[11px]">
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>{t('aiChat.appliedSuccess')}</span>
                              </div>
                            )}

                            {msg.actionStatus === 'declined' && (
                              <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center gap-1.5 font-semibold text-[11px]">
                                <X className="w-3.5 h-3.5 text-slate-500" />
                                <span>{t('aiChat.declinedStatus')}</span>
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
                <Sparkles className="w-3 h-3 text-[var(--accent-400)]" />
                <span>{t('aiChat.chipMoreQuestions')}</span>
              </button>
              <button
                onClick={() => {
                  setInputValue('Сделай вопросы сложнее');
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[10px] transition cursor-pointer"
              >
                <span>{t('aiChat.chipHarder')}</span>
              </button>
              <button
                onClick={() => {
                  setInputValue('Сгенерируй вопрос с типом True/False');
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 text-[10px] transition cursor-pointer"
              >
                <span>{t('aiChat.chipTrueFalse')}</span>
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
                placeholder={t('aiChat.inputPlaceholder')}
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

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
