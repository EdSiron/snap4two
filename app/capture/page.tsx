'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useRecorder } from '@/hooks/useRecorder';
import { captureFrame } from '@/lib/canvasUtils';
import { useSessionStore } from '@/store/sessionStore';
import { CountdownOverlay } from '@/components/capture/CountdownOverlay';
import { v4 as uuid } from 'uuid';

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
    if (videoRef.current) {
      addPhoto(captureFrame(videoRef.current));
    }
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
      <main className="min-h-screen flex items-center justify-center bg-[#fff8f3]">
        <p className="text-[#d88fa9] text-xl">we need your camera 🥺</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-6">
      <div className="relative w-[480px] max-w-[90vw] aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <CountdownOverlay count={count} />
      </div>

      <p className="text-[#d88fa9]">
        {photos.length > 0 ? `${photos.length} / ${TOTAL_SHOTS} captured` : ''}
      </p>

      <button
        onClick={runSequence}
        disabled={!ready || running}
        className="px-8 py-3 rounded-full bg-[#d88fa9] text-white font-semibold shadow-md disabled:opacity-50"
      >
        {running ? 'Say cheese...' : 'Start Capture'}
      </button>
    </main>
  );
}