import { MessageHandler, RoomTransport, SyncMessage, TransportType } from './RoomTransport';

/**
 * Local BroadcastChannel & Storage Event Transport.
 * Designed for local multi-tab / single-device simulation.
 * Transparently indicates demo mode and handles cross-tab messages safely.
 */
export class LocalBroadcastTransport implements RoomTransport {
  public readonly type: TransportType = 'local_demo';
  public readonly isLocalDemo: boolean = true;

  private channel: BroadcastChannel | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private readonly channelName: string = 'quizcraft_sync_bus';
  private readonly storageKey: string = 'quizcraft_sync_event';
  private isDisposed: boolean = false;

  constructor() {
    this.initBroadcastChannel();
    this.initStorageEventListener();

    // Explicit diagnostic log so developers & users understand the runtime sync mode
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.info(
        '%c[QuizCraft Transport]%c Initialized Local Demo Broadcast Transport (cross-tab / single-device). Ready for WebSocket/Server backend adapter integration.',
        'color: #f59e0b; font-weight: bold;',
        'color: #94a3b8;'
      );
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (this.isDisposed) return;
          this.notifyHandlers(event.data);
        };
      } catch (err) {
        console.warn('[QuizCraft Transport] BroadcastChannel restricted or not supported, using storage events.', err);
      }
    }
  }

  private initStorageEventListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (this.isDisposed) return;
    if (event.key === this.storageKey && event.newValue) {
      try {
        const data = JSON.parse(event.newValue) as SyncMessage;
        this.notifyHandlers(data);
      } catch {
        // Ignore malformed storage messages
      }
    }
  };

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public broadcast(msg: SyncMessage): void {
    if (this.isDisposed) return;

    // 1. Send via BroadcastChannel if available
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('[QuizCraft Transport] Error posting to BroadcastChannel:', err);
      }
    }

    // 2. Trigger localStorage event for browsers/contexts without shared BroadcastChannel
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({ ...msg, _t: Date.now() + Math.random() })
        );
      } catch {
        // Ignore storage quota errors gracefully
      }
    }

    // 3. Notify subscribers in the active window/tab immediately
    this.notifyHandlers(msg);
  }

  public disconnect(): void {
    this.isDisposed = true;
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // ignore
      }
      this.channel = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
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
