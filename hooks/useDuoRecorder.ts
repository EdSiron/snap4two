"use client";

import { useRef, useState, useCallback } from "react";

const CELL_W = 320;
const CELL_H = 240;

export function useDuoRecorder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [recording, setRecording] = useState(false);

  const drawLoop = useCallback(
    (leftEl: HTMLVideoElement, rightEl: HTMLVideoElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;

      const draw = () => {
        // left cell, mirrored
        ctx.save();
        ctx.translate(CELL_W, 0);
        ctx.scale(-1, 1);
        if (leftEl.readyState >= 2) ctx.drawImage(leftEl, 0, 0, CELL_W, CELL_H);
        ctx.restore();

        // right cell, mirrored, offset past the left cell
        ctx.save();
        ctx.translate(CELL_W * 2, 0);
        ctx.scale(-1, 1);
        if (rightEl.readyState >= 2)
          ctx.drawImage(rightEl, 0, 0, CELL_W, CELL_H);
        ctx.restore();

        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    },
    [],
  );

  const start = (
    localStream: MediaStream,
    remoteStream: MediaStream,
    myPosition: "left" | "right",
  ) => {
    const localEl = document.createElement("video");
    localEl.srcObject = localStream;
    localEl.muted = true;
    localEl.playsInline = true;
    localEl.play();

    const remoteEl = document.createElement("video");
    remoteEl.srcObject = remoteStream;
    remoteEl.muted = true;
    remoteEl.playsInline = true;
    remoteEl.play();

    const leftEl = myPosition === "left" ? localEl : remoteEl;
    const rightEl = myPosition === "left" ? remoteEl : localEl;

    const canvas = document.createElement("canvas");
    canvas.width = CELL_W * 2;
    canvas.height = CELL_H;
    canvasRef.current = canvas;

    drawLoop(leftEl, rightEl);

    // mix both people's audio into a single track
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const dest = audioCtx.createMediaStreamDestination();
    [localStream, remoteStream].forEach((s) => {
      if (s.getAudioTracks().length > 0) {
        audioCtx.createMediaStreamSource(s).connect(dest);
      }
    });

    const canvasStream = canvas.captureStream(30);
    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(combined, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
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
