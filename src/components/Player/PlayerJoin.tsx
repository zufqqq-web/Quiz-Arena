import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, User, Hash } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface PlayerJoinProps {
  initialPin?: string;
  onJoin: (pin: string, nickname: string, avatarEmoji: string) => void;
  onCancel: () => void;
}

const AVATAR_OPTIONS = ['🦊', '🐼', '🐯', '🚀', '⚡', '🥑', '👾', '🐱', '🦄', '🦁', '🦉', '🎯'];

export function PlayerJoin({ initialPin = '', onJoin, onCancel }: PlayerJoinProps) {
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.replace(/\s+/g, '').trim();
    const cleanNick = nickname.trim();

    if (!cleanPin || cleanPin.length < 4) {
      setError('Введите корректный PIN-код комнаты (от 4 цифр)');
      sounds.playWrong();
      return;
    }
    if (!cleanNick) {
      setError('Введите ваш никнейм для игры');
      sounds.playWrong();
      return;
    }

    sounds.playClick();
    onJoin(cleanPin, cleanNick, avatar);
  };

  return (
    <div id="player-join-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 select-none relative font-sans">
      {/* Subtle background glow */}
      <div className="absolute w-72 h-72 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Вход в игру
          </span>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PIN input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span>PIN-код игры</span>
            </label>
            <input
              id="input-player-pin"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="Например: 482910"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-400 transition"
              autoFocus
            />
          </div>

          {/* Nickname input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Ваш никнейм</span>
            </label>
            <input
              id="input-player-nickname"
              type="text"
              maxLength={18}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder="Как вас зовут?"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-base font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-400 transition"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Выберите аватар
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    sounds.playClick();
                    setAvatar(emoji);
                  }}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center border transition cursor-pointer ${
                    avatar === emoji
                      ? 'bg-slate-800 border-slate-300 ring-2 ring-slate-400 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl p-2.5 text-center">
              {error}
            </div>
          )}

          <button
            id="btn-submit-join"
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Присоединиться к битве</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
