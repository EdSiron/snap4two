"use client";

import { useRef, useState } from "react";

export function useRecorder(stream: MediaStream | null) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  const start = () => {
    if (!stream) return;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) return resolve(new Blob());
      recorder.onstop = () => {
        setRecording(false);
        resolve(new Blob(chunksRef.current, { type: "video/webm" }));
      };
      recorder.stop();
    });

  return { start, stop, recording };
}
