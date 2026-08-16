import { RoomTransport } from './RoomTransport';
import { LocalBroadcastTransport } from './LocalBroadcastTransport';
import { WebSocketTransport } from './WebSocketTransport';

export * from './RoomTransport';
export * from './LocalBroadcastTransport';
export * from './WebSocketTransport';

let activeTransport: RoomTransport | null = null;

/**
 * Returns the currently active RoomTransport instance.
 * Defaults to WebSocketTransport (connecting to server for multi-device real-time sync).
 */
export function getRoomTransport(): RoomTransport {
  if (!activeTransport) {
    activeTransport = new WebSocketTransport();
  }
  return activeTransport;
}

/**
 * Allows swapping transport implementation at runtime (e.g. for WebSocket or testing).
 */
export function setRoomTransport(transport: RoomTransport): void {
  if (activeTransport) {
    activeTransport.disconnect();
  }
  activeTransport = transport;
}
