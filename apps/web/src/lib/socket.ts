import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export interface RoomState {
  roomId: string;
  animeId: string;
  animeTitle: string;
  episode: number;
  status: "waiting" | "playing" | "paused";
  currentTime: number;
  hostId: string;
}

export interface RoomMember {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
}

export type SyncEvent = 
  | { type: "play"; currentTime: number }
  | { type: "pause"; currentTime: number }
  | { type: "seek"; currentTime: number }
  | { type: "episode-change"; episode: number }
  | { type: "sync"; currentTime: number; status: string; episode: number };

export type RoomEvent = 
  | { type: "user-joined"; user: RoomMember }
  | { type: "user-left"; userId: string }
  | { type: "host-changed"; newHostId: string }
  | { type: "room-closed" };