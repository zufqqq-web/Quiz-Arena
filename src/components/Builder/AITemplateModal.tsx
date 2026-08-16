import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types';
import { CURATED_TEMPLATE_PACKS, TemplatePack, cloneQuestionsWithNewIds, generateQuizWithAI } from '../../services/aiService';
import { Layers, X, Check, Search, Tag, Sparkles, Settings, Loader2, Wand2, RefreshCw, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { AISettingsModal } from '../Common/AISettingsModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface AITemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuestions: (newQuestions: Question[]) => void;
}

export function AITemplateModal({ isOpen, onClose, onApplyQuestions }: AITemplateModalProps) {
  const { t, language: uiLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'templates' | 'generate'>('templates');
  const [selectedPackId, setSelectedPackId] = useState<string>(CURATED_TEMPLATE_PACKS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Generation Form State
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState<number>(5);
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [genLanguage, setGenLanguage] = useState<'ru' | 'en' | 'uz'>(() => (uiLang === 'uz' ? 'uz' : uiLang === 'en' ? 'en' : 'ru'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync default generation language with UI language when opened
  useEffect(() => {
    if (isOpen) {
      setGenLanguage(uiLang === 'uz' ? 'uz' : uiLang === 'en' ? 'en' : 'ru');
      setFallbackWarning(null);
    }
  }, [isOpen, uiLang]);

  // Close on Escape & Accessibility Focus Management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSettingsOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSettingsOpen, onClose]);

  if (!isOpen) return null;

  const filteredPacks = CURATED_TEMPLATE_PACKS.filter(
    (pack) =>
      pack.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pack.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pack.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const selectedPack = CURATED_TEMPLATE_PACKS.find((p) => p.id === selectedPackId) || CURATED_TEMPLATE_PACKS[0];

  const handleApplyCurated = () => {
    sounds.playClick();
    const cloned = cloneQuestionsWithNewIds(selectedPack.questions);
    onApplyQuestions(cloned);
    onClose();
  };

  const handleRunAIGeneration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!genTopic.trim()) return;

    sounds.playClick();
    setIsGenerating(true);
    setGenError(null);
    setFallbackWarning(null);

    try {
      const result = await generateQuizWithAI({
        topic: genTopic.trim(),
        questionCount: genCount,
        difficulty: genDifficulty,
        language: genLanguage,
      });

      if (result && result.questions && result.questions.length > 0) {
        sounds.playCorrect();
        setGeneratedQuestions(result.questions);

        if (result.usedFallback) {
          setFallbackWarning(
            result.errorReason || t('aiTemplate.fallbackWarning', { reason: 'Offline / Config error' })
          );
        } else {
          setFallbackWarning(null);
        }
      } else {
        throw new Error('Не удалось сгенерировать вопросы по данной теме');
      }
    } catch (err: any) {
      sounds.playWrong();
      setGenError(err.message || 'Ошибка генерации вопросов');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyGenerated = () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;
    sounds.playPowerup?.() || sounds.playCorrect();
    onApplyQuestions(generatedQuestions);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
        aria-describedby="template-modal-desc"
      >
        <div
          ref={modalRef}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-500)]/30 text-[var(--accent-300)] flex items-center justify-center">
                {activeTab === 'templates' ? <Layers className="w-5 h-5 text-[var(--accent-400)]" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
              </div>
              <div>
                <h3 id="template-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeTab === 'templates' ? t('aiTemplate.modalTitleTemplates') : t('aiTemplate.modalTitleGenerate')}</span>
                </h3>
                <p id="template-modal-desc" className="text-xs text-slate-400">
                  {activeTab === 'templates'
                    ? t('aiTemplate.subtitleTemplates')
                    : t('aiTemplate.subtitleGenerate')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsSettingsOpen(true);
                }}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                title={t('common.aiSettings')}
                aria-label={t('common.aiSettings')}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                ref={closeButtonRef}
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                aria-label={t('common.close')}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-950/40">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('templates');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'templates'
                  ? 'border-[var(--accent-400)] text-[var(--accent-300)] bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('aiTemplate.tabTemplates')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('generate');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'generate'
                  ? 'border-indigo-400 text-indigo-300 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{t('aiTemplate.tabGenerate')}</span>
            </button>
          </div>

          {/* Tab 1: Curated Templates */}
          {activeTab === 'templates' && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={t('aiTemplate.searchPlaceholder')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--accent-400)] transition"
                  aria-label={t('common.search')}
                />
              </div>

              {/* Pack Selection List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {filteredPacks.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedPackId(pack.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPackId(pack.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      aria-label={`${pack.title}`}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] ${
                        isSelected
                          ? 'bg-slate-800/90 border-[var(--accent-500)]/50 shadow-md ring-1 ring-[var(--accent-500)]/30'
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                        {pack.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">{pack.title}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Tag className="w-3 h-3 text-slate-500" />
                              {pack.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--accent-300)] bg-[var(--accent-subtle)] border border-[var(--accent-500)]/30 px-2 py-0.5 rounded-md">
                              {pack.questions.length} {t('aiTemplate.questionsSuffix')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.desc}</p>
                      </div>
                    </div>
                  );
                })}

                {filteredPacks.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-500">{t('aiTemplate.notFound')}</p>
                )}
              </div>

              {/* Selected Pack Preview Breakdown */}
              {selectedPack && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('aiTemplate.packContent', { title: selectedPack.title })}
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 max-h-28 overflow-y-auto">
                    {selectedPack.questions.map((q, idx) => (
                      <li key={q.id || idx} className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-slate-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                          {q.type}
                        </span>
                        <span className="truncate text-slate-200">{q.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleApplyCurated}
                  className="px-5 py-2.5 text-xs font-bold bg-[var(--accent-500)] hover:brightness-110 active:brightness-90 text-slate-950 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)] cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t('aiTemplate.insertQuestions', { count: selectedPack?.questions.length || 0 })}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Dynamic Real AI Generation */}
          {activeTab === 'generate' && (
            <div className="p-4 sm:p-6 space-y-4">
              <form onSubmit={handleRunAIGeneration} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>{t('aiTemplate.topicLabel')}</span>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{t('aiTemplate.configureKey')}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      placeholder={t('aiTemplate.topicPlaceholder')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      disabled={isGenerating}
                    />
                    <button
                      type="submit"
                      disabled={!genTopic.trim() || isGenerating}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{isGenerating ? t('aiTemplate.creating') : t('aiTemplate.createBtn')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">{t('aiTemplate.questionsCount')}</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
                      disabled={isGenerating}
                    >
                      <option value={3}>3 {t('aiTemplate.questionsSuffix')}</option>
                      <option value={5}>5 {t('aiTemplate.questionsSuffix')}</option>
                      <option value={8}>8 {t('aiTemplate.questionsSuffix')}</option>
                      <option value={10}>10 {t('aiTemplate.questionsSuffix')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">{t('aiTemplate.difficulty')}</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
                      disabled={isGenerating}
                    >
                      <option value="easy">{t('aiTemplate.difficultyEasy')}</option>
                      <option value="medium">{t('aiTemplate.difficultyMedium')}</option>
                      <option value="hard">{t('aiTemplate.difficultyHard')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">{t('aiTemplate.language')}</label>
                    <select
                      value={genLanguage}
                      onChange={(e) => setGenLanguage(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none cursor-pointer"
                      disabled={isGenerating}
                    >
                      <option value="ru">Русский (RU)</option>
                      <option value="en">English (EN)</option>
                      <option value="uz">O'zbekcha (UZ)</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Error feedback */}
              {genError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t('common.error')}: </span>
                    <span>{genError}</span>
                  </div>
                </div>
              )}

              {/* Fallback Warning Banner */}
              {fallbackWarning && (
                <div className="p-3 bg-amber-950/50 border border-amber-700/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-amber-300">
                      Не удалось выполнить онлайн-генерацию ИИ
                    </div>
                    <div className="text-[11px] text-amber-200/90 leading-relaxed">
                      Причина: <span className="font-mono text-amber-100">{fallbackWarning}</span>. Использован демо-шаблон вопросов.
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Questions Preview */}
              {generatedQuestions && generatedQuestions.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('aiTemplate.packContent', { title: genTopic || 'AI Quiz' })} ({generatedQuestions.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRunAIGeneration}
                      disabled={isGenerating}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('aiTemplate.regenerate')}</span>
                    </button>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
                    {generatedQuestions.map((q, idx) => (
                      <li key={q.id || idx} className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono flex items-center justify-center shrink-0 border border-indigo-800/50">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                          {q.type}
                        </span>
                        <span className="truncate text-slate-200">{q.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  disabled={!generatedQuestions || generatedQuestions.length === 0}
                  onClick={handleApplyGenerated}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t('aiTemplate.insertQuestions', { count: generatedQuestions?.length || 0 })}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
