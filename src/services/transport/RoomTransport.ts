import { Player, PlayerAnswer, RoomState } from '../../types';

export type SyncMessage =
  | { type: 'HOST_STATE_UPDATE'; state: RoomState }
  | { type: 'PLAYER_JOIN_REQUEST'; roomCode: string; player: Player }
  | { type: 'PLAYER_LEAVE'; roomCode: string; playerId: string }
  | { type: 'PLAYER_ANSWER_SUBMIT'; roomCode: string; playerId: string; answer: PlayerAnswer }
  | { type: 'EMOJI_REACTION'; roomCode: string; reaction: { id: string; emoji: string; senderName: string; x: number; timestamp: number } }
  | { type: 'HOST_KICK_PLAYER'; roomCode: string; playerId: string }
  | { type: 'REQUEST_ROOM_SYNC'; roomCode: string; playerId: string }
  | { type: 'HOST_HEARTBEAT'; roomCode: string; timestamp: number };

export type MessageHandler = (msg: SyncMessage) => void;

export type TransportType = 'local_demo' | 'websocket' | 'firebase';

/**
 * Transport abstraction layer for real-time multiplayer synchronization.
 * Allows seamless transition between Local BroadcastChannel (demo) and real WebSocket/Backend server.
 */
export interface RoomTransport {
  /** Identifier of the active transport mechanism */
  readonly type: TransportType;

  /** Flag indicating whether this is a local simulation transport */
  readonly isLocalDemo: boolean;

  /** Subscribe to incoming sync messages */
  subscribe(handler: MessageHandler): () => void;

  /** Broadcast a message to other participants in the room/bus */
  broadcast(msg: SyncMessage): void;

  /** Explicitly join a room on the server/transport */
  joinRoom?(roomCode: string, playerId?: string): void;

  /** Explicitly leave a room on the server/transport */
  leaveRoom?(roomCode: string): void;

  /** Clean up resources and close channels */
  disconnect(): void;
}
