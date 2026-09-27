"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useRecorder } from "@/hooks/useRecorder";
import { captureFrame } from "@/lib/canvasUtils";
import { useSessionStore } from "@/store/sessionStore";
import { CountdownOverlay } from "@/components/capture/CountdownOverlay";
import { v4 as uuid } from "uuid";

const TOTAL_SHOTS = 4;

export default function CapturePage() {
  const { videoRef, stream, error, ready } = useCamera();
  const { start: startRecording, stop: stopRecording } = useRecorder(stream);
  const { photos, addPhoto, reset, setVideoBlob } = useSessionStore();
  const [count, setCount] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const router = useRouter();

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runSequence = async () => {
    reset();
    setRunning(true);
    startRecording();

    for (let shot = 0; shot < TOTAL_SHOTS; shot++) {
      for (let c = 3; c > 0; c--) {
        setCount(c);
        await sleep(700);
      }
      setCount(0);
      if (videoRef.current) addPhoto(captureFrame(videoRef.current, 4 / 3));
      await sleep(500);
      setCount(null);
      await sleep(600);
    }

    const videoBlob = await stopRecording();
    setVideoBlob(videoBlob);
    setRunning(false);
    const sessionId = uuid();
    router.push(`/result/${sessionId}`);
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4ede7] px-4">
        <p className="text-center text-xl text-[#d88fa9]">
          we need your camera 🥺
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4ede7] px-3 py-6 sm:px-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-bold text-[#d88fa9]"
        >
          snap4two 🩷
        </button>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#a86b80] shadow-sm">
          Solo Booth
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl bg-black shadow-xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full scale-x-[-1] object-cover"
        />
        <CountdownOverlay count={count} />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-2xl bg-black/50 px-5 py-3 text-center text-sm text-white/90">
              warming up the camera...
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white">
            {photos.length} / {TOTAL_SHOTS} captured
          </span>
        )}
      </div>

      <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-3xl bg-white px-4 py-4 shadow-md sm:px-6">
        <div className="flex gap-2">
          <button
            disabled
            title="Filters — coming soon"
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-[#f0d3dd] text-base text-[#d88fa9]/40"
          >
            🎨
          </button>
          <button
            disabled
            title="Backgrounds — coming soon"
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-[#f0d3dd] text-base text-[#d88fa9]/40"
          >
            🖼️
          </button>
        </div>

        <button
          onClick={runSequence}
          disabled={!ready || running}
          className="flex items-center gap-2 rounded-full bg-[#d88fa9] px-8 py-3 font-semibold text-white shadow-md disabled:opacity-50"
        >
          📸 {running ? "Say cheese..." : "Capture"}
        </button>

        <div className="w-11 sm:w-24" />
      </div>
    </main>
  );
}
