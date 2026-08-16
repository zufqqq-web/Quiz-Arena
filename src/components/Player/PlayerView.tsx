import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, RoomState, PlayerAnswer, GameReaction, PowerUpType } from '../../types';
import { syncBus, SyncMessage } from '../../utils/syncBus';
import { storage } from '../../utils/storage';
import { calculateScore } from '../../utils/botSimulator';
import { screenVariants } from '../../utils/motionVariants';
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
  // Restore player from stored session if present and matching
  const [player, setPlayer] = useState<Player | null>(() => {
    const saved = storage.getPlayerSession();
    if (saved && (!initialPin || String(saved.roomCode).trim().toUpperCase() === String(initialPin).trim().toUpperCase())) {
      return saved.player;
    }
    return null;
  });

  const [roomCode, setRoomCode] = useState<string>(() => {
    const saved = storage.getPlayerSession();
    if (saved && (!initialPin || String(saved.roomCode).trim().toUpperCase() === String(initialPin).trim().toUpperCase())) {
      return String(saved.roomCode).trim().toUpperCase();
    }
    return String(initialPin || '').trim().toUpperCase();
  });

  const [roomState, setRoomState] = useState<RoomState | null>(() => {
    const active = storage.getActiveRoom();
    if (active && (!initialPin || String(active.roomCode).trim().toUpperCase() === String(initialPin).trim().toUpperCase())) {
      return active;
    }
    return null;
  });

  const [reactions, setReactions] = useState<GameReaction[]>([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);

  // Refs for permanent subscription closure safety
  const playerRef = useRef<Player | null>(player);
  const roomCodeRef = useRef<string>(roomCode);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  // Sync player session to storage
  useEffect(() => {
    if (player && roomCode) {
      storage.savePlayerSession({ roomCode, player });
    }
  }, [player, roomCode]);

  // Permanent subscription to Sync Bus for entire component lifecycle
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg: SyncMessage) => {
      // Diagnostic logging immediately upon receiving any sync message
      console.log('[PlayerView INCOMING sync_message]', msg.type, msg);

      const cleanCode = (c: any) => String(c || '').trim().toUpperCase();
      const currentRoom = cleanCode(roomCodeRef.current);
      const curPlayer = playerRef.current;

      if (msg.type === 'HOST_STATE_UPDATE') {
        const msgRoom = cleanCode(msg.state?.roomCode);
        const isPlayerInState = curPlayer && msg.state?.players && !!msg.state.players[curPlayer.id];
        const isRoomMatch = currentRoom && msgRoom && currentRoom === msgRoom;

        console.log(`[PlayerView HOST_STATE_UPDATE] msgRoom=${msgRoom}, currentRoom=${currentRoom}, isMatch=${isRoomMatch || isPlayerInState}, status=${msg.state?.status}, qIdx=${msg.state?.currentQuestionIndex}`);

        if (isRoomMatch || isPlayerInState) {
          // Unconditionally apply authoritative host state
          setRoomState(msg.state);
          if (msgRoom && !currentRoom) {
            setRoomCode(msgRoom);
          }

          // Update local player state from host's authoritative state if present
          if (curPlayer && msg.state?.players?.[curPlayer.id]) {
            setPlayer(msg.state.players[curPlayer.id]);
          }
        }
      } else if (msg.type === 'HOST_KICK_PLAYER') {
        const msgRoom = cleanCode(msg.roomCode);
        if (currentRoom === msgRoom && curPlayer && msg.playerId === curPlayer.id) {
          sounds.playWrong();
          alert('Вы были удалены из комнаты ведущим.');
          setPlayer(null);
          setRoomState(null);
          storage.clearPlayerSession();
        }
      } else if (msg.type === 'EMOJI_REACTION') {
        const msgRoom = cleanCode(msg.roomCode);
        if (currentRoom === msgRoom) {
          setReactions((prev) => [...prev.slice(-15), msg.reaction]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Request sync and ensure room join on mount / roomCode change
  useEffect(() => {
    if (roomCode) {
      const cleanPin = String(roomCode).trim().toUpperCase();
      syncBus.joinRoom(cleanPin, player?.id);

      if (player) {
        syncBus.broadcast({
          type: 'REQUEST_ROOM_SYNC',
          roomCode: cleanPin,
          playerId: player.id,
        });
      }

      // Also check local active room
      const active = storage.getActiveRoom();
      if (active && String(active.roomCode).trim().toUpperCase() === cleanPin) {
        setRoomState(active);
      }
    }
  }, [roomCode, player?.id]);

  // Reset hasAnswered on question change
  useEffect(() => {
    if (roomState?.status === 'question_active') {
      const currentAns = player?.answers?.[roomState.currentQuestionIndex];
      setHasAnsweredCurrent(!!currentAns);
    }
  }, [roomState?.currentQuestionIndex, roomState?.status, player?.answers]);

  // Join handler
  const handleJoin = (enteredPin: string, nickname: string, avatarEmoji: string) => {
    const cleanPin = String(enteredPin).trim().toUpperCase();
    const newPlayer: Player = {
      id: 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nickname,
      avatarEmoji,
      score: 0,
      streak: 0,
      highestStreak: 0,
      answers: {},
      powerUps: {
        fiftyFifty: 1,
        doublePoints: 1,
        shield: 1,
        freeze: 1,
      },
      activePowerUp: null,
      removedOptionIds: [],
      connected: true,
    };

    setPlayer(newPlayer);
    setRoomCode(cleanPin);
    storage.savePlayerSession({ roomCode: cleanPin, player: newPlayer });

    // Explicitly join room on server socket
    syncBus.joinRoom(cleanPin, newPlayer.id);

    // Broadcast join request to Host
    syncBus.broadcast({
      type: 'PLAYER_JOIN_REQUEST',
      roomCode: cleanPin,
      player: newPlayer,
    });

    // Check if host is in local storage
    const active = storage.getActiveRoom();
    if (active && String(active.roomCode).trim().toUpperCase() === cleanPin) {
      setRoomState(active);
    }
  };

  // Use Power-up
  const handleUsePowerUp = (type: PowerUpType) => {
    if (!player || !roomState) return;
    const inv = player.powerUps || { fiftyFifty: 0, doublePoints: 0, shield: 0, freeze: 0 };
    const currentQ = roomState.quiz.questions[roomState.currentQuestionIndex];
    if (!currentQ) return;

    if (type === 'fifty_fifty') {
      if (inv.fiftyFifty <= 0) return;
      sounds.playPowerup();
      // Remove 2 incorrect options
      const incorrectIds = currentQ.options.filter((o) => !o.isCorrect).map((o) => o.id);
      const toRemove = incorrectIds.slice(0, 2);
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              removedOptionIds: toRemove,
              powerUps: { ...inv, fiftyFifty: inv.fiftyFifty - 1 },
              activePowerUp: 'fifty_fifty',
            }
          : prev
      );
    } else if (type === 'double_points') {
      if (inv.doublePoints <= 0) return;
      sounds.playPowerup();
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              activePowerUp: 'double_points',
              powerUps: { ...inv, doublePoints: inv.doublePoints - 1 },
            }
          : prev
      );
    } else if (type === 'shield') {
      if (inv.shield <= 0) return;
      sounds.playShield();
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              activePowerUp: 'shield',
              powerUps: { ...inv, shield: inv.shield - 1 },
            }
          : prev
      );
    } else if (type === 'freeze') {
      if (inv.freeze <= 0) return;
      sounds.playPowerup();
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              activePowerUp: 'freeze',
              powerUps: { ...inv, freeze: inv.freeze - 1 },
            }
          : prev
      );
    }
  };

  // Submit player answer
  const handleSubmitAnswer = (selectedOptionIds: string[], textAnswer?: string, numberAnswer?: number) => {
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
    } else if (currentQ.type === 'number') {
      const expectedNum = currentQ.correctNumberAnswer ?? 0;
      const tolerance = currentQ.numberTolerance ?? 0;
      const userNum = numberAnswer !== undefined ? numberAnswer : parseFloat(textAnswer || '0');
      const diff = Math.abs(userNum - expectedNum);
      isCorrect = diff <= tolerance;
    }

    const isShieldActive = player.activePowerUp === 'shield';

    const { points, streakBonus, streakMultiplier } = isCorrect
      ? calculateScore(
          timeSpentMs,
          currentQ.timeLimit,
          currentQ.pointsMultiplier,
          player.streak,
          player.activePowerUp
        )
      : { points: 0, streakBonus: 0, streakMultiplier: 1.0 };

    const answerRecord: PlayerAnswer = {
      questionId: currentQ.id,
      questionIndex: roomState.currentQuestionIndex,
      selectedOptionIds,
      textAnswer,
      numberAnswer,
      isCorrect,
      pointsEarned: points,
      timeSpentMs,
      streakBonus,
      streakMultiplier,
      powerUpUsed: player.activePowerUp || undefined,
      shieldProtected: !isCorrect && isShieldActive,
      answeredAt: now,
    };

    setHasAnsweredCurrent(true);

    // Update local player state with active power-ups cleared for next question
    setPlayer((prev) =>
      prev
        ? {
            ...prev,
            activePowerUp: null,
            removedOptionIds: [],
          }
        : prev
    );

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
      const cleanPin = String(roomCode).trim().toUpperCase();
      syncBus.leaveRoom(cleanPin);
      syncBus.broadcast({
        type: 'PLAYER_LEAVE',
        roomCode: cleanPin,
        playerId: player.id,
      });
    }
    setPlayer(null);
    setRoomState(null);
    storage.clearPlayerSession();
    onExit();
  };

  // If player hasn't joined room yet
  if (!player) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="player-join"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-h-screen"
        >
          <PlayerJoin
            initialPin={roomCode}
            onJoin={handleJoin}
            onCancel={onExit}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Room not yet found / waiting for host
  if (!roomState) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="player-waiting"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-h-screen"
        >
          <PlayerWaitingLobby
            player={player}
            onSendReaction={handleSendReaction}
            onLeave={handleLeave}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Sorted rank calculation
  const allPlayersSorted = (Object.values(roomState.players) as Player[]).sort((a, b) => b.score - a.score);
  const myRank = allPlayersSorted.findIndex((p) => p.id === player.id) + 1 || 1;
  const currentQ = roomState.quiz.questions[roomState.currentQuestionIndex] || roomState.quiz.questions[0];
  const myAnswerForCurrent = player.answers?.[roomState.currentQuestionIndex];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <ReactionsStream reactions={reactions} />

      <AnimatePresence mode="wait" initial={false}>
        {roomState.status === 'lobby' ? (
          <motion.div
            key="player-lobby"
            custom="default"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <PlayerWaitingLobby
              player={player}
              quiz={roomState.quiz}
              onSendReaction={handleSendReaction}
              onLeave={handleLeave}
            />
          </motion.div>
        ) : roomState.status === 'question_active' ? (
          <motion.div
            key={`player-question-${roomState.currentQuestionIndex}`}
            custom="lobby-start"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <PlayerAnswerScreen
              question={currentQ}
              questionIndex={roomState.currentQuestionIndex}
              totalQuestions={roomState.quiz.questions.length}
              player={player}
              hasAnswered={hasAnsweredCurrent}
              onSubmitAnswer={handleSubmitAnswer}
              onSendReaction={handleSendReaction}
              onUsePowerUp={handleUsePowerUp}
            />
          </motion.div>
        ) : roomState.status === 'question_reveal' || roomState.status === 'leaderboard' ? (
          <motion.div
            key={`player-result-${roomState.currentQuestionIndex}-${roomState.status}`}
            custom="reveal"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <PlayerAnswerResult
              player={player}
              question={currentQ}
              questionIndex={roomState.currentQuestionIndex}
              answer={myAnswerForCurrent}
              rank={myRank}
              totalPlayers={allPlayersSorted.length}
            />
          </motion.div>
        ) : roomState.status === 'podium' || roomState.status === 'finished' ? (
          <motion.div
            key="player-podium"
            custom="podium"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-h-screen"
          >
            <PlayerPodiumResult
              player={player}
              quiz={roomState.quiz}
              rank={myRank}
              totalPlayers={allPlayersSorted.length}
              onExit={handleLeave}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
