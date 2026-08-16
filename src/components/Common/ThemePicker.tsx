import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { sounds } from '../../utils/sound';

export function ThemePicker() {
  const { theme, setTheme, presets, currentTheme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (presetId: string) => {
    sounds.playClick();
    setTheme(presetId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition cursor-pointer shadow-sm select-none"
        title={t('common.theme')}
        aria-label={t('common.theme')}
        aria-expanded={isOpen}
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-inner ring-1 ring-white/20 shrink-0"
          style={{ backgroundColor: currentTheme.dotColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 select-none">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            {t('common.theme')}
          </div>
          <div className="space-y-0.5 px-1">
            {presets.map((preset) => {
              const isSelected = preset.id === theme;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset.id)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-white/30 shrink-0"
                      style={{ backgroundColor: preset.dotColor }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
