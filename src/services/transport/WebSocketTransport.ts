import { io, Socket } from 'socket.io-client';
import { MessageHandler, RoomTransport, SyncMessage, TransportType } from './RoomTransport';

/**
 * Real-time WebSocket Transport using Socket.IO.
 * Enables live synchronization between Host and Players across different devices and networks.
 */
export class WebSocketTransport implements RoomTransport {
  public readonly type: TransportType = 'websocket';
  public readonly isLocalDemo: boolean = false;

  private socket: Socket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private joinedRooms: Set<string> = new Set();
  private currentPlayerId: string | null = null;
  private isDisposed: boolean = false;
  private serverUrl: string;

  constructor() {
    // Read WebSocket server URL from Vite environment variable or default to current window host on port 4000
    let defaultUrl = 'http://localhost:4000';
    if (typeof window !== 'undefined' && window.location) {
      defaultUrl = `http://${window.location.hostname}:4000`;
    }

    this.serverUrl = (
      (typeof import.meta !== 'undefined' &&
        (import.meta as any).env &&
        (import.meta as any).env.VITE_WS_SERVER_URL) ||
      defaultUrl
    ).replace(/\/+$/, '');

    this.initSocket();

    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.info(
        `%c[QuizCraft Transport]%c WebSocket transport active connecting to ${this.serverUrl}`,
        'color: #10b981; font-weight: bold;',
        'color: #94a3b8;'
      );
    }
  }

  private initSocket(): void {
    if (typeof window === 'undefined') return;

    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log(`[QuizCraft WS] Connected to server (${this.socket?.id})`);
        // Re-join any active rooms upon reconnect and request sync
        this.joinedRooms.forEach((roomCode) => {
          console.log(`[QuizCraft WS] Auto re-joining room on connect: ${roomCode}`);
          this.socket?.emit('join_room', roomCode, this.currentPlayerId || undefined);
          if (this.currentPlayerId) {
            const syncReq: SyncMessage = {
              type: 'REQUEST_ROOM_SYNC',
              roomCode,
              playerId: this.currentPlayerId,
            };
            console.log('[QuizCraft WS OUTGOING] Sending REQUEST_ROOM_SYNC on reconnect:', syncReq);
            this.socket?.emit('sync_message', syncReq);
          }
        });
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[QuizCraft WS] Disconnected from server: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.warn(`[QuizCraft WS] Connection error:`, error.message);
      });

      // Handle incoming messages relayed by the server
      this.socket.on('sync_message', (msg: SyncMessage) => {
        if (this.isDisposed || !msg) return;
        console.log('[QuizCraft WS INCOMING sync_message]', msg.type, msg);
        this.notifyHandlers(msg);
      });
    } catch (err) {
      console.error('[QuizCraft WS] Failed to initialize socket.io-client:', err);
    }
  }

  /**
   * Subscribe a handler to incoming messages
   */
  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Explicitly join a room
   */
  public joinRoom(roomCode: string, playerId?: string): void {
    if (!roomCode) return;
    const cleanCode = String(roomCode).trim().toUpperCase();
    this.joinedRooms.add(cleanCode);
    if (playerId) {
      this.currentPlayerId = playerId;
    }

    if (this.socket && this.socket.connected) {
      console.log(`[QuizCraft WS OUTGOING join_room] roomCode=${cleanCode}, playerId=${playerId || 'none'}`);
      this.socket.emit('join_room', cleanCode, playerId);
    }
  }

  /**
   * Explicitly leave a room
   */
  public leaveRoom(roomCode: string): void {
    if (!roomCode) return;
    const cleanCode = String(roomCode).trim().toUpperCase();
    this.joinedRooms.delete(cleanCode);

    if (this.socket && this.socket.connected) {
      console.log(`[QuizCraft WS OUTGOING leave_room] roomCode=${cleanCode}`);
      this.socket.emit('leave_room', cleanCode);
    }
  }

  /**
   * Broadcast a SyncMessage to all clients in the room via WebSocket server
   */
  public broadcast(msg: SyncMessage): void {
    if (this.isDisposed) return;

    let roomCode =
      msg.type === 'HOST_STATE_UPDATE'
        ? msg.state?.roomCode
        : 'roomCode' in msg
        ? (msg as any).roomCode
        : null;

    if (roomCode) {
      const cleanCode = String(roomCode).trim().toUpperCase();
      if (!this.joinedRooms.has(cleanCode)) {
        this.joinedRooms.add(cleanCode);
        if (this.socket && this.socket.connected) {
          console.log(`[QuizCraft WS OUTGOING join_room (auto)] roomCode=${cleanCode}`);
          this.socket.emit('join_room', cleanCode, this.currentPlayerId || undefined);
        }
      }
    }

    if (msg.type === 'PLAYER_JOIN_REQUEST' && msg.player?.id) {
      this.currentPlayerId = msg.player.id;
    } else if (msg.type === 'REQUEST_ROOM_SYNC' && msg.playerId) {
      this.currentPlayerId = msg.playerId;
    }

    // 1. Send via WebSocket
    if (this.socket) {
      console.log(`[QuizCraft WS OUTGOING sync_message] type=${msg.type}, connected=${this.socket.connected}`, msg);
      this.socket.emit('sync_message', msg);
    }

    // 2. Notify local handlers in the current browser tab immediately
    this.notifyHandlers(msg);
  }

  /**
   * Cleanup and disconnect socket
   */
  public disconnect(): void {
    this.isDisposed = true;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.joinedRooms.clear();
    this.handlers.clear();
  }

  private notifyHandlers(msg: SyncMessage): void {
    this.handlers.forEach((handler) => {
      try {
        handler(msg);
      } catch (err) {
        console.error('[QuizCraft Transport] Error in message handler:', err);
      }
    });
  }
}
