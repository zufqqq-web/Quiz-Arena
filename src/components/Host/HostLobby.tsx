import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Quiz } from '../../types';
import { Play, Users, Bot, Volume2, VolumeX, Copy, Check, ArrowLeft, Trash2 } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { generateBotPlayers } from '../../utils/botSimulator';
import { buttonHoverTap } from '../../utils/motionVariants';
import { useLanguage } from '../../contexts/LanguageContext';

interface HostLobbyProps {
  roomCode: string;
  quiz: Quiz;
  players: Record<string, Player>;
  onStartGame: () => void;
  onAddBots: (bots: Player[]) => void;
  onKickPlayer: (playerId: string) => void;
  onExit: () => void;
}

export function HostLobby({
  roomCode,
  quiz,
  players,
  onStartGame,
  onAddBots,
  onKickPlayer,
  onExit,
}: HostLobbyProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playerList = Object.values(players);

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMusic = () => {
    if (isMusicPlaying) {
      sounds.stopLobbyMusic();
      setIsMusicPlaying(false);
    } else {
      sounds.startLobbyMusic();
      setIsMusicPlaying(true);
    }
  };

  const handleAddSampleBots = () => {
    sounds.playClick();
    const newBots = generateBotPlayers(4);
    onAddBots(newBots);
  };

  return (
    <div id="host-lobby" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Background visual subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.stopLobbyMusic();
            onExit();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('host.leaveLobby')}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">{quiz.coverEmoji}</span>
          <span className="text-sm font-bold text-white max-w-xs truncate">{quiz.title}</span>
          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
            {quiz.questions.length} {t('aiTemplate.questionsSuffix')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMusic}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isMusicPlaying
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span>{isMusicPlaying ? t('host.musicPlaying') : t('host.musicEnable')}</span>
          </button>
        </div>
      </div>

      {/* Center Huge Room PIN Card */}
      <div className="my-auto text-center flex flex-col items-center z-10">
        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-400 mb-3 backdrop-blur-md">
          <span>{t('host.joinWithPin')}</span>
        </div>

        <div
          onClick={handleCopyPin}
          className="group relative cursor-pointer bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 hover:border-slate-400 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-200"
        >
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
            {t('host.roomPin')}
          </div>
          <div className="text-5xl md:text-7xl font-mono font-black tracking-widest text-white group-hover:scale-105 transition-transform">
            {roomCode.slice(0, 3)} {roomCode.slice(3)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-200">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{t('host.copiedToClipboard')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('host.clickToCopy')}</span>
              </>
            )}
          </div>
        </div>

        {/* Quick helper tip for multi-tab test */}
        <div className="mt-3 text-xs text-slate-500 max-w-md">
          {t('host.multiplayerTip')}
        </div>
      </div>

      {/* Bottom Players List & Start Game Area */}
      <div className="z-10 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{t('host.playersInRoom')}:</span>
              <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center font-mono text-slate-200">
                {playerList.length}
              </span>
            </div>

            <button
              onClick={handleAddSampleBots}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
              title={t('host.addBots')}
            >
              <Bot className="w-3.5 h-3.5 text-[var(--accent-400)]" />
              <span>+ {t('host.addBots')} (4)</span>
            </button>
          </div>

          <motion.button
            id="btn-host-start-game"
            variants={buttonHoverTap}
            whileHover={playerList.length > 0 ? "hover" : undefined}
            whileTap={playerList.length > 0 ? "tap" : undefined}
            disabled={playerList.length === 0}
            onClick={() => {
              sounds.stopLobbyMusic();
              sounds.playClick();
              onStartGame();
            }}
            className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-[var(--accent-500)] hover:brightness-110 active:brightness-90 text-slate-950 font-bold text-base transition flex items-center justify-center gap-2 shadow-xl shadow-[var(--accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{t('host.startGame')} ({playerList.length})</span>
          </motion.button>
        </div>

        {/* Players Grid with AnimatePresence */}
        <div className="min-h-[90px] max-h-48 overflow-y-auto">
          {playerList.length === 0 ? (
            <div className="h-24 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <span>{t('host.waitingFirstPlayer')}</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence>
                {playerList.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="group bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-sm transition"
                  >
                    <span className="text-xl">{p.avatarEmoji}</span>
                    <span className="text-xs font-semibold text-slate-200">{p.nickname}</span>
                    {p.isBot && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        bot
                      </span>
                    )}
                    <button
                      onClick={() => onKickPlayer(p.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 rounded transition cursor-pointer"
                      title={t('host.kickPlayer')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
