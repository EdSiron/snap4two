"use client";

import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";

export function useRoomConnection(roomId: string) {
  const socketRef = useRef<PartySocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [shouldInitiate, setShouldInitiate] = useState<boolean | null>(null);

  useEffect(() => {
    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: roomId,
    });

    socket.addEventListener("open", () => setConnected(true));

    socket.addEventListener("message", (evt) => {
      const data = JSON.parse(evt.data);

      if (data.type === "role") {
        setShouldInitiate(data.initiator);
      }
      if (data.type === "peer-joined") {
        setPeerJoined(true);
      }
      if (data.type === 'peer-left') {
  setPeerJoined(false);
  setShouldInitiate(null); // unknown again until a new role arrives
}
    });

    socketRef.current = socket;
    return () => socket.close();
  }, [roomId]);

  const send = (data: unknown) => {
    socketRef.current?.send(JSON.stringify(data));
  };

  return {
    connected,
    peerJoined,
    shouldInitiate,
    setShouldInitiate,
    send,
    socket: socketRef.current,
  };
}
