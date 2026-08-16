import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Key,
  Globe,
  Cpu,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import {
  AIConfig,
  AI_PRESETS,
  DEFAULT_AI_CONFIG,
  getAIConfig,
  saveAIConfig,
  clearAIConfig,
  testAIConnection,
} from '../../utils/aiConfig';
import { sounds } from '../../utils/sound';
import { useLanguage } from '../../contexts/LanguageContext';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: AIConfig) => void;
}

export function AISettingsModal({ isOpen, onClose, onSaved }: AISettingsModalProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<AIConfig>(() => getAIConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state with storage on open
  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetConfig: AIConfig) => {
    sounds.playClick();
    setConfig((prev) => ({
      ...presetConfig,
      apiKey: prev.apiKey || presetConfig.apiKey, // Keep user's key if already typed
    }));
    setTestResult(null);
    setSaveSuccess(false);
  };

  const handleTestConnection = async () => {
    sounds.playClick();
    setIsTesting(true);
    setTestResult(null);

    const result = await testAIConnection(config);
    setIsTesting(false);
    setTestResult(result);

    if (result.ok) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  };

  const handleSave = () => {
    sounds.playPowerup?.() || sounds.playCorrect();
    saveAIConfig(config);
    setSaveSuccess(true);
    if (onSaved) onSaved(config);

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    sounds.playClick();
    clearAIConfig();
    setConfig(DEFAULT_AI_CONFIG);
    setTestResult(null);
    setSaveSuccess(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 id="ai-settings-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('aiSettings.modalTitle')}</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                  {t('aiSettings.byokBadge')}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('aiSettings.subtitle')}
              </p>
            </div>
          </div>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('aiSettings.presets')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_PRESETS.map((preset) => {
                const isActive =
                  config.baseUrl.includes(preset.config.baseUrl) ||
                  (preset.name === 'gemini' && config.baseUrl.includes('googleapis.com')) ||
                  (preset.name === 'openai' && config.baseUrl.includes('openai.com'));

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset.config)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            {/* Base URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('aiSettings.baseUrl')}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">OpenAI / Gemini REST</span>
              </label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => {
                  setConfig({ ...config, baseUrl: e.target.value });
                  setTestResult(null);
                }}
                placeholder="https://generativelanguage.googleapis.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Model Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('aiSettings.modelName')}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">gemini-1.5-flash / gpt-4o-mini</span>
              </label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => {
                  setConfig({ ...config, model: e.target.value });
                  setTestResult(null);
                }}
                placeholder="gemini-1.5-flash"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('aiSettings.apiKey')}</span>
                </span>
                <span className="text-[10px] text-amber-400/80 font-normal">{t('aiSettings.keyStorageNote')}</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => {
                    setConfig({ ...config, apiKey: e.target.value });
                    setTestResult(null);
                  }}
                  placeholder="AIzaSy... sk-proj-..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition cursor-pointer"
                  title={showApiKey ? t('aiSettings.hideKey') : t('aiSettings.showKey')}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('aiSettings.privacyNote')}
            </p>
          </div>

          {/* Test Status Feedback Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
              }`}
            >
              {testResult.ok ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium truncate">
                {testResult.ok
                  ? testResult.message || t('aiSettings.testSuccess')
                  : testResult.error || t('aiSettings.testError')}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-300 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title={t('aiSettings.reset')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('aiSettings.reset')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-3 sm:px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Server className="w-3.5 h-3.5" />}
              <span>{isTesting ? t('aiSettings.testing') : t('aiSettings.testConnection')}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 sm:px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {saveSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveSuccess ? t('aiSettings.saved') : t('aiSettings.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
