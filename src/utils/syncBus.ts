import { Player, PlayerAnswer, RoomState } from '../types';

export type SyncMessage =
  | { type: 'HOST_STATE_UPDATE'; state: RoomState }
  | { type: 'PLAYER_JOIN_REQUEST'; roomCode: string; player: Player }
  | { type: 'PLAYER_LEAVE'; roomCode: string; playerId: string }
  | { type: 'PLAYER_ANSWER_SUBMIT'; roomCode: string; playerId: string; answer: PlayerAnswer }
  | { type: 'EMOJI_REACTION'; roomCode: string; reaction: { id: string; emoji: string; senderName: string; x: number; timestamp: number } }
  | { type: 'HOST_KICK_PLAYER'; roomCode: string; playerId: string }
  | { type: 'REQUEST_ROOM_SYNC'; roomCode: string; playerId: string };

type MessageHandler = (msg: SyncMessage) => void;

class SyncBus {
  private channel: BroadcastChannel | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private channelName: string = 'quizcraft_sync_bus';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          this.notifyHandlers(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted, falling back to storage events', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'quizcraft_sync_event' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyHandlers(data);
          } catch (e) {
            // ignore
          }
        }
      });
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public broadcast(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Error posting to BroadcastChannel:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        // Trigger storage event for tabs that might not share the same BroadcastChannel
        localStorage.setItem(
          'quizcraft_sync_event',
          JSON.stringify({ ...msg, _t: Date.now() + Math.random() })
        );
      } catch (e) {
        // ignore
      }
    }

    // Also notify current tab handlers immediately
    this.notifyHandlers(msg);
  }

  private notifyHandlers(msg: SyncMessage) {
    this.handlers.forEach((h) => {
      try {
        h(msg);
      } catch (err) {
        console.error('Error in sync handler:', err);
      }
    });
  }
}

export const syncBus = new SyncBus();
