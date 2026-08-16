import { useState, useEffect, useCallback } from 'react';
import { Player, RoomState, PlayerAnswer, GameReaction } from '../../types';
import { syncBus, SyncMessage } from '../../utils/syncBus';
import { storage } from '../../utils/storage';
import { calculateScore } from '../../utils/botSimulator';
import { PlayerJoin } from './PlayerJoin';
import { PlayerWaitingLobby } from './PlayerWaitingLobby';
import { PlayerAnswerScreen } from './PlayerAnswerScreen';
import { PlayerAnswerResult } from './PlayerAnswerResult';
import { PlayerPodiumResult } from './PlayerPodiumResult';
import { ReactionsStream } from '../Common/ReactionsStream';
import { sounds } from '../../utils/sound';

interface PlayerViewProps {
  initialPin?: string;
  onExit: () => void;
}

export function PlayerView({ initialPin = '', onExit }: PlayerViewProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [roomCode, setRoomCode] = useState<string>(initialPin);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [reactions, setReactions] = useState<GameReaction[]>([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Listen to Sync Bus
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg: SyncMessage) => {
      if (msg.type === 'HOST_STATE_UPDATE') {
        if (roomCode && msg.state.roomCode === roomCode) {
          setRoomState(msg.state);

          // Update local player state from host's authoritative state if present
          if (player && msg.state.players[player.id]) {
            setPlayer(msg.state.players[player.id]);
          }
        }
      } else if (msg.type === 'HOST_KICK_PLAYER') {
        if (roomCode && msg.roomCode === roomCode && player && msg.playerId === player.id) {
          sounds.playWrong();
          alert('Вы были удалены из комнаты ведущим.');
          setPlayer(null);
          setRoomState(null);
        }
      } else if (msg.type === 'EMOJI_REACTION') {
        if (roomCode && msg.roomCode === roomCode) {
          setReactions((prev) => [...prev.slice(-15), msg.reaction]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, player]);

  // Request sync on mount if roomCode exists
  useEffect(() => {
    if (roomCode && player) {
      syncBus.broadcast({
        type: 'REQUEST_ROOM_SYNC',
        roomCode,
        playerId: player.id,
      });

      // Also check local active room
      const active = storage.getActiveRoom();
      if (active && active.roomCode === roomCode) {
        setRoomState(active);
      }
    }
  }, [roomCode, player]);

  // Reset hasAnswered on question change
  useEffect(() => {
    if (roomState?.status === 'question_active') {
      setHasAnsweredCurrent(false);
    }
  }, [roomState?.currentQuestionIndex, roomState?.status]);

  // Join handler
  const handleJoin = (enteredPin: string, nickname: string, avatarEmoji: string) => {
    const newPlayer: Player = {
      id: 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nickname,
      avatarEmoji,
      score: 0,
      streak: 0,
      highestStreak: 0,
      answers: {},
      connected: true,
    };

    setPlayer(newPlayer);
    setRoomCode(enteredPin);

    // Broadcast join request to Host
    syncBus.broadcast({
      type: 'PLAYER_JOIN_REQUEST',
      roomCode: enteredPin,
      player: newPlayer,
    });

    // Check if host is in local storage
    const active = storage.getActiveRoom();
    if (active && active.roomCode === enteredPin) {
      setRoomState(active);
    }
  };

  // Submit player answer
  const handleSubmitAnswer = (selectedOptionIds: string[], textAnswer?: string) => {
    if (!roomState || !player) return;

    const currentQ = roomState.quiz.questions[roomState.currentQuestionIndex];
    if (!currentQ) return;

    const now = Date.now();
    const startTime = roomState.questionStartTime || now - 2000;
    const timeSpentMs = Math.max(500, now - startTime);

    let isCorrect = false;
    if (currentQ.type === 'single' || currentQ.type === 'boolean') {
      const correctOption = currentQ.options.find((o) => o.isCorrect);
      isCorrect = !!correctOption && selectedOptionIds.includes(correctOption.id);
    } else if (currentQ.type === 'poll') {
      isCorrect = true; // Poll is always valid
    } else if (currentQ.type === 'multiple') {
      const correctIds = currentQ.options.filter((o) => o.isCorrect).map((o) => o.id);
      const selectedSorted = [...selectedOptionIds].sort().join(',');
      const correctSorted = [...correctIds].sort().join(',');
      isCorrect = selectedSorted === correctSorted;
    } else if (currentQ.type === 'order') {
      const correctSortedIds = [...currentQ.options]
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((o) => o.id)
        .join(',');
      isCorrect = selectedOptionIds.join(',') === correctSortedIds;
    } else if (currentQ.type === 'text') {
      const cleanExpected = (currentQ.correctTextAnswer || '').trim().toLowerCase();
      const cleanActual = (textAnswer || '').trim().toLowerCase();
      isCorrect = !!cleanExpected && cleanExpected === cleanActual;
    }

    const { points, streakBonus } = isCorrect
      ? calculateScore(timeSpentMs, currentQ.timeLimit, currentQ.pointsMultiplier, player.streak)
      : { points: 0, streakBonus: 0 };

    const answerRecord: PlayerAnswer = {
      questionId: currentQ.id,
      questionIndex: roomState.currentQuestionIndex,
      selectedOptionIds,
      textAnswer,
      isCorrect,
      pointsEarned: points,
      timeSpentMs,
      streakBonus,
      answeredAt: now,
    };

    setHasAnsweredCurrent(true);

    // Send answer to Host
    syncBus.broadcast({
      type: 'PLAYER_ANSWER_SUBMIT',
      roomCode,
      playerId: player.id,
      answer: answerRecord,
    });
  };

  // Send reaction
  const handleSendReaction = (emoji: string) => {
    if (!player || !roomCode) return;
    const rx: GameReaction = {
      id: 'rx-' + Date.now() + Math.random(),
      emoji,
      senderName: player.nickname,
      x: 20 + Math.random() * 60,
      timestamp: Date.now(),
    };
    syncBus.broadcast({
      type: 'EMOJI_REACTION',
      roomCode,
      reaction: rx,
    });
  };

  // Leave room
  const handleLeave = () => {
    if (player && roomCode) {
      syncBus.broadcast({
        type: 'PLAYER_LEAVE',
        roomCode,
        playerId: player.id,
      });
    }
    setPlayer(null);
    setRoomState(null);
    onExit();
  };

  // If player hasn't joined room yet
  if (!player) {
    return (
      <PlayerJoin
        initialPin={initialPin}
        onJoin={handleJoin}
        onCancel={onExit}
      />
    );
  }

  // Room not yet found / waiting for host
  if (!roomState) {
    return (
      <PlayerWaitingLobby
        player={player}
        onSendReaction={handleSendReaction}
        onLeave={handleLeave}
      />
    );
  }

  // Sorted rank calculation
  const allPlayersSorted = (Object.values(roomState.players) as Player[]).sort((a, b) => b.score - a.score);
  const myRank = allPlayersSorted.findIndex((p) => p.id === player.id) + 1 || 1;
  const currentQ = roomState.quiz.questions[roomState.currentQuestionIndex] || roomState.quiz.questions[0];
  const myAnswerForCurrent = player.answers?.[roomState.currentQuestionIndex];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans">
      <ReactionsStream reactions={reactions} />

      {roomState.status === 'lobby' ? (
        <PlayerWaitingLobby
          player={player}
          quiz={roomState.quiz}
          onSendReaction={handleSendReaction}
          onLeave={handleLeave}
        />
      ) : roomState.status === 'question_active' ? (
        <PlayerAnswerScreen
          question={currentQ}
          questionIndex={roomState.currentQuestionIndex}
          totalQuestions={roomState.quiz.questions.length}
          player={player}
          hasAnswered={hasAnsweredCurrent}
          onSubmitAnswer={handleSubmitAnswer}
          onSendReaction={handleSendReaction}
        />
      ) : roomState.status === 'question_reveal' || roomState.status === 'leaderboard' ? (
        <PlayerAnswerResult
          player={player}
          question={currentQ}
          questionIndex={roomState.currentQuestionIndex}
          answer={myAnswerForCurrent}
          rank={myRank}
          totalPlayers={allPlayersSorted.length}
        />
      ) : roomState.status === 'podium' || roomState.status === 'finished' ? (
        <PlayerPodiumResult
          player={player}
          quiz={roomState.quiz}
          rank={myRank}
          totalPlayers={allPlayersSorted.length}
          onExit={handleLeave}
        />
      ) : null}
    </div>
  );
}
