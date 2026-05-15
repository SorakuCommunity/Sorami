"use client";

import { useState } from "react";
import { Users, Copy, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWatchTogether, type UseWatchTogetherOptions } from "@/hooks/useWatchTogether";

interface WatchTogetherProps extends Omit<UseWatchTogetherOptions, "onSync"> {
  onStateUpdate?: (state: { isPlaying: boolean; currentTime: number; episode: number }) => void;
}

export function WatchTogether({ onStateUpdate, ...options }: WatchTogetherProps) {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const {
    isConnected,
    roomState,
    members,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useWatchTogether({
    ...options,
    onSync: (state) => {
      onStateUpdate?.({
        isPlaying: state.status === "playing",
        currentTime: state.currentTime || 0,
        episode: state.episode || 1,
      });
    },
  });

  const handleCreateRoom = () => {
    const newRoomId = createRoom();
    setRoomIdInput(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomIdInput.trim()) {
      joinRoom(roomIdInput.trim());
      setShowJoinInput(false);
    }
  };

  const handleCopyRoomId = async () => {
    if (roomState?.roomId) {
      await navigator.clipboard.writeText(roomState.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Watch Together
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Watch anime with friends in real-time sync.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleCreateRoom} className="flex-1">
              Create Room
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowJoinInput(!showJoinInput)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Join
            </Button>
          </div>
          {showJoinInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
              />
              <Button onClick={handleJoinRoom}>Join</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Watch Together
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={leaveRoom}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roomState && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Room ID:</span>
              <code className="bg-secondary px-2 py-1 rounded text-xs flex-1">
                {roomState.roomId}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopyRoomId}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Status:</span>
              <span className="capitalize">{roomState.status}</span>
              <span>•</span>
              <span>Episode {roomState.episode}</span>
            </div>
            {isHost && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                You are the host
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <span className="text-sm font-medium">Members ({members.length})</span>
          <div className="space-y-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 text-sm p-2 rounded bg-secondary/50"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1">{member.username}</span>
                {member.isHost && (
                  <span className="text-xs text-primary">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}