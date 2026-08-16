import { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, RoomState, Player, GameReaction, PlayerAnswer } from '../../types';
import { syncBus, SyncMessage } from '../../utils/syncBus';
import { storage } from '../../utils/storage';
import { simulateBotAnswer } from '../../utils/botSimulator';
import { HostLobby } from './HostLobby';
import { HostQuestionActive } from './HostQuestionActive';
import { HostQuestionReveal } from './HostQuestionReveal';
import { HostLeaderboard } from './HostLeaderboard';
import { HostPodium } from './HostPodium';
import { HostAnalytics } from './HostAnalytics';
import { ReactionsStream } from '../Common/ReactionsStream';

interface HostViewProps {
  quiz: Quiz;
  onExit: () => void;
}

export function HostView({ quiz, onExit }: HostViewProps) {
  // Generate stable 6-digit room pin
  const [roomState, setRoomState] = useState<RoomState>(() => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const initial: RoomState = {
      roomCode: pin,
      quiz,
      status: 'lobby',
      currentQuestionIndex: 0,
      questionStartTime: 0,
      questionEndTime: 0,
      players: {},
      showCorrectAnswers: false,
      hostTabId: 'host-' + Date.now(),
    };
    storage.saveActiveRoom(initial);
    return initial;
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [reactions, setReactions] = useState<GameReaction[]>([]);
  const [showAnalyticsView, setShowAnalyticsView] = useState<boolean>(false);

  const botTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Broadcast current state to all connected tabs/players whenever roomState changes
  const broadcastCurrentState = useCallback((stateToBroadcast: RoomState) => {
    syncBus.broadcast({
      type: 'HOST_STATE_UPDATE',
      state: stateToBroadcast,
    });
    storage.saveActiveRoom(stateToBroadcast);
  }, []);

  // Listen to Sync Bus for player join requests, answers, reactions
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg: SyncMessage) => {
      if (msg.type === 'PLAYER_JOIN_REQUEST') {
        if (msg.roomCode === roomState.roomCode) {
          setRoomState((prev) => {
            const updated = {
              ...prev,
              players: {
                ...prev.players,
                [msg.player.id]: msg.player,
              },
            };
            broadcastCurrentState(updated);
            return updated;
          });
        }
      } else if (msg.type === 'REQUEST_ROOM_SYNC') {
        if (msg.roomCode === roomState.roomCode) {
          broadcastCurrentState(roomState);
        }
      } else if (msg.type === 'PLAYER_LEAVE') {
        if (msg.roomCode === roomState.roomCode) {
          setRoomState((prev) => {
            const nextPlayers = { ...prev.players };
            delete nextPlayers[msg.playerId];
            const updated = { ...prev, players: nextPlayers };
            broadcastCurrentState(updated);
            return updated;
          });
        }
      } else if (msg.type === 'PLAYER_ANSWER_SUBMIT') {
        if (msg.roomCode === roomState.roomCode) {
          handlePlayerAnswer(msg.playerId, msg.answer);
        }
      } else if (msg.type === 'EMOJI_REACTION') {
        if (msg.roomCode === roomState.roomCode) {
          setReactions((prev) => [...prev.slice(-15), msg.reaction]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomState.roomCode, broadcastCurrentState]);

  // Clean reaction stream
  useEffect(() => {
    if (reactions.length > 0) {
      const timer = setTimeout(() => {
        setReactions((prev) => prev.filter((r) => Date.now() - r.timestamp < 3000));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reactions]);

  // Process player answer
  const handlePlayerAnswer = (playerId: string, answer: PlayerAnswer) => {
    setRoomState((prev) => {
      const player = prev.players[playerId];
      if (!player) return prev;

      const newStreak = answer.isCorrect ? (player.streak || 0) + 1 : 0;
      const highestStreak = Math.max(player.highestStreak || 0, newStreak);
      const newScore = (player.score || 0) + answer.pointsEarned;

      const updatedPlayer: Player = {
        ...player,
        score: newScore,
        streak: newStreak,
        highestStreak,
        answers: {
          ...player.answers,
          [prev.currentQuestionIndex]: answer,
        },
      };

      const updated: RoomState = {
        ...prev,
        players: {
          ...prev.players,
          [playerId]: updatedPlayer,
        },
      };

      broadcastCurrentState(updated);
      return updated;
    });
  };

  // Start game from lobby
  const handleStartGame = () => {
    const firstQ = quiz.questions[0];
    const now = Date.now();
    const limit = firstQ.timeLimit || 20;

    const nextState: RoomState = {
      ...roomState,
      status: 'question_active',
      currentQuestionIndex: 0,
      questionStartTime: now,
      questionEndTime: now + limit * 1000,
      showCorrectAnswers: false,
    };

    setRoomState(nextState);
    setTimeRemaining(limit);
    broadcastCurrentState(nextState);
    startQuestionTimer(limit, 0, nextState.players);
  };

  // Start question timer & schedule bots
  const startQuestionTimer = (seconds: number, qIndex: number, currentPlayers: Record<string, Player>) => {
    // Clear previous
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    botTimeoutsRef.current.forEach((t) => clearTimeout(t));
    botTimeoutsRef.current = [];

    const question = quiz.questions[qIndex];
    const now = Date.now();

    // Schedule bots answering
    Object.values(currentPlayers).forEach((player) => {
      if (player.isBot) {
        const { answer, delayMs } = simulateBotAnswer(player, question, qIndex, now);
        const botTimer = setTimeout(() => {
          handlePlayerAnswer(player.id, answer);

          // Occasionally bot sends spontaneous reaction
          if (Math.random() < 0.4) {
            const emojis = ['🔥', '🚀', '🧠', '😱', '🎉', '⚡'];
            const rx: GameReaction = {
              id: 'rx-bot-' + Date.now() + Math.random(),
              emoji: emojis[Math.floor(Math.random() * emojis.length)],
              senderName: player.nickname,
              x: 15 + Math.random() * 70,
              timestamp: Date.now(),
            };
            setReactions((prev) => [...prev.slice(-15), rx]);
          }
        }, delayMs);
        botTimeoutsRef.current.push(botTimer);
      }
    });

    // Countdown interval
    let rem = seconds;
    setTimeRemaining(rem);

    timerIntervalRef.current = setInterval(() => {
      rem -= 1;
      setTimeRemaining(rem);

      if (rem <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        handleRevealAnswers();
      }
    }, 1000);
  };

  // Reveal Answers
  const handleRevealAnswers = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    botTimeoutsRef.current.forEach((t) => clearTimeout(t));

    setRoomState((prev) => {
      const nextState: RoomState = {
        ...prev,
        status: 'question_reveal',
        showCorrectAnswers: true,
      };
      broadcastCurrentState(nextState);
      return nextState;
    });
  };

  // Proceed to Leaderboard
  const handleShowLeaderboard = () => {
    setRoomState((prev) => {
      const nextState: RoomState = {
        ...prev,
        status: 'leaderboard',
      };
      broadcastCurrentState(nextState);
      return nextState;
    });
  };

  // Next Question
  const handleNextQuestion = () => {
    const nextIdx = roomState.currentQuestionIndex + 1;
    if (nextIdx >= quiz.questions.length) {
      handleShowPodium();
      return;
    }

    const nextQ = quiz.questions[nextIdx];
    const now = Date.now();
    const limit = nextQ.timeLimit || 20;

    const nextState: RoomState = {
      ...roomState,
      status: 'question_active',
      currentQuestionIndex: nextIdx,
      questionStartTime: now,
      questionEndTime: now + limit * 1000,
      showCorrectAnswers: false,
    };

    setRoomState(nextState);
    setTimeRemaining(limit);
    broadcastCurrentState(nextState);
    startQuestionTimer(limit, nextIdx, nextState.players);
  };

  // Show Podium
  const handleShowPodium = () => {
    setRoomState((prev) => {
      const nextState: RoomState = {
        ...prev,
        status: 'podium',
      };
      broadcastCurrentState(nextState);
      return nextState;
    });
  };

  // Add bots
  const handleAddBots = (bots: Player[]) => {
    setRoomState((prev) => {
      const newPlayers = { ...prev.players };
      bots.forEach((b) => {
        newPlayers[b.id] = b;
      });
      const updated = { ...prev, players: newPlayers };
      broadcastCurrentState(updated);
      return updated;
    });
  };

  // Kick player
  const handleKickPlayer = (playerId: string) => {
    setRoomState((prev) => {
      const newPlayers = { ...prev.players };
      delete newPlayers[playerId];
      const updated = { ...prev, players: newPlayers };
      syncBus.broadcast({
        type: 'HOST_KICK_PLAYER',
        roomCode: prev.roomCode,
        playerId,
      });
      broadcastCurrentState(updated);
      return updated;
    });
  };

  // Reset to Play Again
  const handlePlayAgain = () => {
    setShowAnalyticsView(false);
    // reset scores and answers but keep players
    const resetPlayers: Record<string, Player> = {};
    (Object.values(roomState.players) as Player[]).forEach((p) => {
      resetPlayers[p.id] = {
        ...p,
        score: 0,
        streak: 0,
        highestStreak: 0,
        answers: {},
      };
    });

    const nextState: RoomState = {
      ...roomState,
      status: 'lobby',
      currentQuestionIndex: 0,
      showCorrectAnswers: false,
      players: resetPlayers,
    };
    setRoomState(nextState);
    broadcastCurrentState(nextState);
  };

  const currentQ = quiz.questions[roomState.currentQuestionIndex] || quiz.questions[0];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans">
      <ReactionsStream reactions={reactions} />

      {showAnalyticsView ? (
        <HostAnalytics
          quiz={quiz}
          players={roomState.players}
          onBackToPodium={() => setShowAnalyticsView(false)}
          onExit={onExit}
          onPlayAgain={handlePlayAgain}
        />
      ) : roomState.status === 'lobby' ? (
        <HostLobby
          roomCode={roomState.roomCode}
          quiz={quiz}
          players={roomState.players}
          onStartGame={handleStartGame}
          onAddBots={handleAddBots}
          onKickPlayer={handleKickPlayer}
          onExit={onExit}
        />
      ) : roomState.status === 'question_active' ? (
        <HostQuestionActive
          question={currentQ}
          questionIndex={roomState.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          timeRemaining={timeRemaining}
          totalTime={currentQ.timeLimit}
          players={roomState.players}
          onTimeUpOrSkip={handleRevealAnswers}
        />
      ) : roomState.status === 'question_reveal' ? (
        <HostQuestionReveal
          question={currentQ}
          questionIndex={roomState.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          players={roomState.players}
          onProceedToLeaderboard={handleShowLeaderboard}
        />
      ) : roomState.status === 'leaderboard' ? (
        <HostLeaderboard
          players={roomState.players}
          currentQuestionIndex={roomState.currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          onNextQuestion={handleNextQuestion}
          onShowPodium={handleShowPodium}
        />
      ) : roomState.status === 'podium' ? (
        <HostPodium
          quiz={quiz}
          players={roomState.players}
          onOpenAnalytics={() => setShowAnalyticsView(true)}
          onPlayAgain={handlePlayAgain}
          onExitToLibrary={onExit}
        />
      ) : null}
    </div>
  );
}
