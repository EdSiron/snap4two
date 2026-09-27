"use client";

import { useEffect, useState, useCallback } from "react";
import type { SocketLike } from "@/hooks/useRoomConnection";

const TOTAL_SHOTS = 4;

export function useSyncedCapture(socket: SocketLike | null) {
  const [count, setCount] = useState<number | null>(null);
  const [shotIndex, setShotIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [captureSignal, setCaptureSignal] = useState(0);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runLocalSequence = useCallback(async () => {
    setRunning(true);
    for (let shot = 0; shot < TOTAL_SHOTS; shot++) {
      setShotIndex(shot);
      for (let c = 3; c > 0; c--) {
        setCount(c);
        await sleep(700);
      }
      setCount(0);
      setCaptureSignal((n) => n + 1);
      await sleep(500);
      setCount(null);
      await sleep(600);
    }
    setRunning(false);
  }, []);

  const start = () => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "start-sequence" }));
    runLocalSequence();
  };

  useEffect(() => {
    if (!socket) return;
    const handler = (evt: MessageEvent) => {
      const data = JSON.parse(evt.data);
      if (data.type === "start-sequence") {
        runLocalSequence();
      }
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, runLocalSequence]);

  return { count, shotIndex, running, captureSignal, start };
}
