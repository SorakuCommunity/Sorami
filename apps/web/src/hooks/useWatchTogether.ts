"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSocket, connectSocket, disconnectSocket, type RoomState, type RoomMember, type SyncEvent, type RoomEvent } from "@/lib/socket";

export interface UseWatchTogetherOptions {
  roomId?: string;
  animeId: string;
  animeTitle: string;
  initialEpisode?: number;
  isHost?: boolean;
  onHostChange?: (newHostId: string) => void;
  onUserJoined?: (user: RoomMember) => void;
  onUserLeft?: (userId: string) => void;
  onRoomClosed?: () => void;
  onSync?: (state: Partial<RoomState>) => void;
}

export interface UseWatchTogetherReturn {
  isConnected: boolean;
  roomState: RoomState | null;
  members: RoomMember[];
  currentUserId: string | null;
  isHost: boolean;
  createRoom: () => string;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  play: (currentTime: number) => void;
  pause: (currentTime: number) => void;
  seek: (currentTime: number) => void;
  changeEpisode: (episode: number) => void;
  transferHost: (newHostId: string) => void;
}

export function useWatchTogether({
  roomId: initialRoomId,
  animeId,
  animeTitle,
  initialEpisode = 1,
  isHost = false,
  onHostChange,
  onUserJoined,
  onUserLeft,
  onRoomClosed,
  onSync,
}: UseWatchTogetherOptions): UseWatchTogetherReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentHost, setIsCurrentHost] = useState(isHost);
  const roomIdRef = useRef<string | null>(initialRoomId || null);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      setCurrentUserId(socket.id || null);
      
      if (initialRoomId) {
        socket.emit("join-room", {
          roomId: initialRoomId,
          animeId,
          animeTitle,
        });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("room-state", (state: RoomState) => {
      setRoomState(state);
      onSync?.(state);
    });

    socket.on("sync", (data: SyncEvent) => {
      if (data.type === "sync") {
        setRoomState((prev) => prev ? {
          ...prev,
          currentTime: data.currentTime,
          status: data.status as RoomState["status"],
          episode: data.episode,
        } : null);
        onSync?.({
          currentTime: data.currentTime,
          status: data.status as RoomState["status"],
          episode: data.episode,
        });
      }
    });

    socket.on("sync-play", (data: { currentTime: number }) => {
      setRoomState((prev) => prev ? { ...prev, status: "playing", currentTime: data.currentTime } : null);
      onSync?.({ status: "playing", currentTime: data.currentTime });
    });

    socket.on("sync-pause", (data: { currentTime: number }) => {
      setRoomState((prev) => prev ? { ...prev, status: "paused", currentTime: data.currentTime } : null);
      onSync?.({ status: "paused", currentTime: data.currentTime });
    });

    socket.on("sync-seek", (data: { currentTime: number }) => {
      setRoomState((prev) => prev ? { ...prev, currentTime: data.currentTime } : null);
      onSync?.({ currentTime: data.currentTime });
    });

    socket.on("sync-episode", (data: { episode: number }) => {
      setRoomState((prev) => prev ? { ...prev, episode: data.episode } : null);
      onSync?.({ episode: data.episode });
    });

    socket.on("member-joined", (member: RoomMember) => {
      setMembers((prev) => [...prev.filter(m => m.id !== member.id), member]);
      onUserJoined?.(member);
    });

    socket.on("member-left", (data: { userId: string }) => {
      setMembers((prev) => prev.filter(m => m.id !== data.userId));
      onUserLeft?.(data.userId);
    });

    socket.on("members-list", (memberList: RoomMember[]) => {
      setMembers(memberList);
    });

    socket.on("host-changed", (data: { newHostId: string }) => {
      setIsCurrentHost(data.newHostId === socket.id);
      onHostChange?.(data.newHostId);
    });

    socket.on("room-closed", () => {
      setRoomState(null);
      setMembers([]);
      roomIdRef.current = null;
      onRoomClosed?.();
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room-state");
      socket.off("sync");
      socket.off("sync-play");
      socket.off("sync-pause");
      socket.off("sync-seek");
      socket.off("sync-episode");
      socket.off("member-joined");
      socket.off("member-left");
      socket.off("members-list");
      socket.off("host-changed");
      socket.off("room-closed");
      disconnectSocket();
    };
  }, [initialRoomId, animeId, animeTitle, onHostChange, onUserJoined, onUserLeft, onRoomClosed, onSync]);

  const createRoom = useCallback(() => {
    const newRoomId = `${animeId}-${Date.now()}`;
    roomIdRef.current = newRoomId;
    setIsCurrentHost(true);
    
    const socket = getSocket();
    socket.emit("create-room", {
      roomId: newRoomId,
      animeId,
      animeTitle,
      episode: initialEpisode,
    });
    
    return newRoomId;
  }, [animeId, animeTitle, initialEpisode]);

  const joinRoom = useCallback((roomId: string) => {
    roomIdRef.current = roomId;
    const socket = getSocket();
    socket.emit("join-room", {
      roomId,
      animeId,
      animeTitle,
    });
  }, [animeId, animeTitle]);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (roomIdRef.current) {
      socket.emit("leave-room", { roomId: roomIdRef.current });
    }
    roomIdRef.current = null;
    setRoomState(null);
    setMembers([]);
  }, []);

  const play = useCallback((currentTime: number) => {
    const socket = getSocket();
    if (roomIdRef.current && isCurrentHost) {
      socket.emit("play", { roomId: roomIdRef.current, currentTime });
    }
  }, [isCurrentHost]);

  const pause = useCallback((currentTime: number) => {
    const socket = getSocket();
    if (roomIdRef.current && isCurrentHost) {
      socket.emit("pause", { roomId: roomIdRef.current, currentTime });
    }
  }, [isCurrentHost]);

  const seek = useCallback((currentTime: number) => {
    const socket = getSocket();
    if (roomIdRef.current && isCurrentHost) {
      socket.emit("seek", { roomId: roomIdRef.current, currentTime });
    }
  }, [isCurrentHost]);

  const changeEpisode = useCallback((episode: number) => {
    const socket = getSocket();
    if (roomIdRef.current && isCurrentHost) {
      socket.emit("change-episode", { roomId: roomIdRef.current, episode });
    }
  }, [isCurrentHost]);

  const transferHost = useCallback((newHostId: string) => {
    const socket = getSocket();
    if (roomIdRef.current && isCurrentHost) {
      socket.emit("transfer-host", { roomId: roomIdRef.current, newHostId });
    }
  }, [isCurrentHost]);

  return {
    isConnected,
    roomState,
    members,
    currentUserId,
    isHost: isCurrentHost,
    createRoom,
    joinRoom,
    leaveRoom,
    play,
    pause,
    seek,
    changeEpisode,
    transferHost,
  };
}