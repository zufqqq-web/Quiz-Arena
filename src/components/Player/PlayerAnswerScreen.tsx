import React, { useState } from 'react';
import { Question, Player, PowerUpType } from '../../types';
import { Check, ArrowUp, ArrowDown, Send, Sparkles, Shield, Zap, Scissors, Clock } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface PlayerAnswerScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  player: Player;
  hasAnswered: boolean;
  onSubmitAnswer: (selectedOptionIds: string[], textAnswer?: string, numberAnswer?: number) => void;
  onSendReaction: (emoji: string) => void;
  onUsePowerUp?: (type: PowerUpType) => void;
}

const SHAPE_BUTTONS = [
  { symbol: '▲', color: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-red-500' },
  { symbol: '◆', color: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white border-blue-500' },
  { symbol: '●', color: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border-amber-400' },
  { symbol: '■', color: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500' },
];

const REACTION_EMOJIS = ['🔥', '🚀', '😱', '🎉', '🧠', '⚡'];

export function PlayerAnswerScreen({
  question,
  questionIndex,
  totalQuestions,
  player,
  hasAnswered,
  onSubmitAnswer,
  onSendReaction,
  onUsePowerUp,
}: PlayerAnswerScreenProps) {
  // State for multiple choice
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  // State for ordering
  const [orderOptions, setOrderOptions] = useState<typeof question.options>(() => [...question.options]);
  // State for text input
  const [textInput, setTextInput] = useState('');
  // State for number input
  const [numberInput, setNumberInput] = useState('');

  const powerUps = player.powerUps || { fiftyFifty: 1, doublePoints: 1, shield: 1, freeze: 1 };
  const activePowerUp = player.activePowerUp;
  const removedOptionIds = player.removedOptionIds || [];

  // Handle single / poll option click
  const handleSingleClick = (optionId: string) => {
    if (hasAnswered || removedOptionIds.includes(optionId)) return;
    sounds.playClick();
    onSubmitAnswer([optionId]);
  };

  // Handle boolean click
  const handleBooleanClick = (optionId: string) => {
    if (hasAnswered) return;
    sounds.playClick();
    onSubmitAnswer([optionId]);
  };

  // Handle multiple choice submit
  const handleToggleMulti = (optId: string) => {
    if (hasAnswered || removedOptionIds.includes(optId)) return;
    sounds.playClick();
    if (selectedMulti.includes(optId)) {
      setSelectedMulti(selectedMulti.filter((id) => id !== optId));
    } else {
      setSelectedMulti([...selectedMulti, optId]);
    }
  };

  const handleConfirmMulti = () => {
    if (hasAnswered || selectedMulti.length === 0) return;
    sounds.playClick();
    onSubmitAnswer(selectedMulti);
  };

  // Handle order move & confirm
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderOptions.length) return;
    sounds.playClick();
    const updated = [...orderOptions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setOrderOptions(updated);
  };

  const handleConfirmOrder = () => {
    if (hasAnswered) return;
    sounds.playClick();
    onSubmitAnswer(orderOptions.map((o) => o.id));
  };

  // Handle text submit
  const handleConfirmText = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !textInput.trim()) return;
    sounds.playClick();
    onSubmitAnswer([], textInput.trim());
  };

  // Handle number submit
  const handleConfirmNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !numberInput.trim()) return;
    sounds.playClick();
    const num = parseFloat(numberInput);
    onSubmitAnswer([], numberInput.trim(), num);
  };

  return (
    <div id="player-answer-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 select-none relative font-sans">
      {/* Top Header info */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">{player.avatarEmoji}</span>
          <span className="text-xs font-bold text-slate-300">{player.nickname}</span>
          {player.streak >= 2 && (
            <span className="text-[10px] font-bold text-orange-400 bg-orange-950 px-2 py-0.5 rounded-full border border-orange-800 animate-pulse">
              🔥 x{player.streak}
            </span>
          )}
        </div>

        <div className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          Вопрос {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Power-ups Action Bar (When answering) */}
      {!hasAnswered && onUsePowerUp && (
        <div className="z-10 max-w-lg w-full mx-auto my-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 backdrop-blur-md flex items-center justify-around gap-2">
          {/* 50/50 */}
          <button
            type="button"
            disabled={powerUps.fiftyFifty <= 0 || activePowerUp !== null || (question.type !== 'single' && question.type !== 'multiple')}
            onClick={() => onUsePowerUp('fifty_fifty')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
              activePowerUp === 'fifty_fifty'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                : powerUps.fiftyFifty > 0 && (question.type === 'single' || question.type === 'multiple')
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                : 'bg-slate-950/60 text-slate-600 border border-slate-900 cursor-not-allowed opacity-40'
            }`}
            title="50:50 — Убирает 2 неверных ответа"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>50/50</span>
            <span className="text-[10px] font-mono bg-slate-950/60 text-white px-1.5 py-0.2 rounded-full">
              {powerUps.fiftyFifty}
            </span>
          </button>

          {/* 2x Double Points */}
          <button
            type="button"
            disabled={powerUps.doublePoints <= 0 || activePowerUp !== null}
            onClick={() => onUsePowerUp('double_points')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
              activePowerUp === 'double_points'
                ? 'bg-purple-500 text-white ring-2 ring-purple-400 animate-pulse'
                : powerUps.doublePoints > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
                : 'bg-slate-950/60 text-slate-600 border border-slate-900 cursor-not-allowed opacity-40'
            }`}
            title="2x Баллы — Удваивает очки за этот вопрос"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2x Очки</span>
            <span className="text-[10px] font-mono bg-slate-950/60 text-white px-1.5 py-0.2 rounded-full">
              {powerUps.doublePoints}
            </span>
          </button>

          {/* Shield */}
          <button
            type="button"
            disabled={powerUps.shield <= 0 || activePowerUp !== null}
            onClick={() => onUsePowerUp('shield')}
            className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
              activePowerUp === 'shield'
                ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
                : powerUps.shield > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-950/60 text-slate-600 border border-slate-900 cursor-not-allowed opacity-40'
            }`}
            title="Щит — Сохраняет стрик при ошибке"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Щит</span>
            <span className="text-[10px] font-mono bg-slate-950/60 text-white px-1.5 py-0.2 rounded-full">
              {powerUps.shield}
            </span>
          </button>
        </div>
      )}

      {/* Answer Area */}
      <div className="my-auto max-w-lg w-full mx-auto flex-1 flex flex-col justify-center py-4 z-10">
        {hasAnswered ? (
          /* Waiting for other players after answer submitted */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mx-auto animate-pulse">
              ⌛
            </div>
            <h3 className="text-xl font-bold text-white">Ответ принят!</h3>
            <p className="text-xs text-slate-400">
              Ждем, пока остальные участники ответят или истечет таймер...
            </p>
          </div>
        ) : (
          /* Active Interactive Controls */
          <>
            {/* TYPE 1: Single choice & Poll 4 tactile blocks */}
            {(question.type === 'single' || question.type === 'poll') && (
              <div className="grid grid-cols-2 gap-3.5 h-full min-h-[300px]">
                {question.options.map((opt, idx) => {
                  const isRemoved = removedOptionIds.includes(opt.id);
                  const btn = SHAPE_BUTTONS[idx % SHAPE_BUTTONS.length];
                  return (
                    <button
                      key={opt.id}
                      disabled={isRemoved}
                      onClick={() => handleSingleClick(opt.id)}
                      className={`rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl cursor-pointer ${
                        isRemoved
                          ? 'opacity-20 bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed pointer-events-none'
                          : btn.color
                      }`}
                    >
                      <span className="text-4xl md:text-5xl font-black">{isRemoved ? '✕' : btn.symbol}</span>
                      <span className="text-xs md:text-sm font-bold text-center line-clamp-2">
                        {isRemoved ? 'Исключено 50/50' : opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: Boolean True / False */}
            {question.type === 'boolean' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[220px]">
                {question.options.map((opt) => {
                  const isTrue = opt.text.toLowerCase().includes('правда') || opt.text.toLowerCase().includes('true');
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleBooleanClick(opt.id)}
                      className={`rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl cursor-pointer ${
                        isTrue
                          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-red-600 hover:bg-red-500 border-red-400 text-white'
                      }`}
                    >
                      <span className="text-5xl">{isTrue ? '✅' : '❌'}</span>
                      <span className="text-xl font-bold">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: Multiple Checkboxes */}
            {question.type === 'multiple' && (
              <div className="space-y-3">
                <div className="text-xs text-purple-400 font-semibold text-center mb-1">
                  Выберите все верные варианты и нажмите «Отправить»:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt, idx) => {
                    const isChecked = selectedMulti.includes(opt.id);
                    const isRemoved = removedOptionIds.includes(opt.id);
                    const btn = SHAPE_BUTTONS[idx % SHAPE_BUTTONS.length];
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isRemoved}
                        onClick={() => handleToggleMulti(opt.id)}
                        className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                          isRemoved
                            ? 'opacity-25 bg-slate-950 border-slate-900 text-slate-600 pointer-events-none'
                            : isChecked
                            ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base">{isRemoved ? '✕' : btn.symbol}</span>
                          <span className="text-sm font-semibold">{isRemoved ? 'Исключено 50/50' : opt.text}</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                            isChecked ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={selectedMulti.length === 0}
                  onClick={handleConfirmMulti}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Отправить ответ ({selectedMulti.length})
                </button>
              </div>
            )}

            {/* TYPE 4: Order Arrange */}
            {question.type === 'order' && (
              <div className="space-y-2.5">
                <div className="text-xs text-amber-400 font-semibold text-center mb-1">
                  Упорядочите элементы сверху вниз стрелками:
                </div>
                {orderOptions.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">{opt.text}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderOptions.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleConfirmOrder}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition shadow-xl cursor-pointer"
                >
                  Подтвердить порядок
                </button>
              </div>
            )}

            {/* TYPE 5: Text Input */}
            {question.type === 'text' && (
              <form onSubmit={handleConfirmText} className="space-y-4">
                <div className="text-xs text-pink-400 font-semibold text-center">
                  Введите ваш ответ текстом:
                </div>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ваш ответ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-400"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить ответ</span>
                </button>
              </form>
            )}

            {/* TYPE 6: Number Input */}
            {question.type === 'number' && (
              <form onSubmit={handleConfirmNumber} className="space-y-4">
                <div className="text-xs text-blue-400 font-semibold text-center">
                  Введите числовое значение:
                </div>
                <input
                  type="number"
                  step="any"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder="Например: 1961"
                  className="w-full bg-slate-900 border border-blue-500/50 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!numberInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить число</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Bottom Reactions Quick Bar */}
      <div className="z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 max-w-sm w-full mx-auto flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-2">
          Реакции:
        </span>
        <div className="flex gap-1.5">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sounds.playPop();
                onSendReaction(emoji);
              }}
              className="text-xl p-1.5 rounded-xl hover:bg-slate-800 active:scale-80 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
