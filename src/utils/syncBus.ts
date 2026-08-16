import { getRoomTransport, RoomTransport, SyncMessage, MessageHandler } from '../services/transport';

export type { SyncMessage, MessageHandler, RoomTransport };

/**
 * Backward-compatible facade over the RoomTransport abstraction.
 * All existing components importing `syncBus` will continue to work seamlessly.
 */
class SyncBusFacade {
  private get transport(): RoomTransport {
    return getRoomTransport();
  }

  public get isLocalDemo(): boolean {
    return this.transport.isLocalDemo;
  }

  public get transportType(): string {
    return this.transport.type;
  }

  public subscribe(handler: MessageHandler): () => void {
    return this.transport.subscribe(handler);
  }

  public broadcast(msg: SyncMessage): void {
    this.transport.broadcast(msg);
  }

  public joinRoom(roomCode: string, playerId?: string): void {
    this.transport.joinRoom?.(roomCode, playerId);
  }

  public leaveRoom(roomCode: string): void {
    this.transport.leaveRoom?.(roomCode);
  }
}

export const syncBus = new SyncBusFacade();
