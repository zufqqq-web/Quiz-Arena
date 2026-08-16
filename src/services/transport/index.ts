import { RoomTransport } from './RoomTransport';
import { LocalBroadcastTransport } from './LocalBroadcastTransport';

export * from './RoomTransport';
export * from './LocalBroadcastTransport';

let activeTransport: RoomTransport | null = null;

/**
 * Returns the currently active RoomTransport instance.
 * Defaults to LocalBroadcastTransport.
 * In the future, this factory can instantiate a WebSocketTransport or FirebaseTransport based on config.
 */
export function getRoomTransport(): RoomTransport {
  if (!activeTransport) {
    activeTransport = new LocalBroadcastTransport();
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
