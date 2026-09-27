"use client";

import { useParams, useRouter } from "next/navigation";
import { useCamera } from "@/hooks/useCamera";
import { useDuoRecorder } from "@/hooks/useDuoRecorder";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useSyncedCapture } from "@/hooks/useSyncedCapture";
import { CountdownOverlay } from "@/components/capture/CountdownOverlay";
import { captureFrame } from "@/lib/canvasUtils";
import { useSessionStore } from "@/store/sessionStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";

export default function DuoCapturePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const { videoRef, stream } = useCamera();
  const { start: startRecording, stop: stopRecording } = useDuoRecorder();
  const { peerJoined, shouldInitiate, socket } = useRoomConnection(roomId);

  const [partnerPhotos, setPartnerPhotos] = useState<string[]>([]);
  const handlePeerData = useCallback((raw: string) => {
    try {
      const data = JSON.parse(raw);
      if (data.type === "photo") {
        setPartnerPhotos((prev) => [...prev, data.photo]);
      }
    } catch {}
  }, []);

  const { remoteStream, peerConnected, sendData } = usePeerConnection(
    socket,
    stream,
    shouldInitiate,
    handlePeerData,
  );

  const { count, shotIndex, running, captureSignal, start } =
    useSyncedCapture(socket);

  const {
    addPhoto,
    reset,
    setPartnerPhotos: saveStorePartnerPhotos,
    setMyPosition,
    setRoomId,
    setVideoBlob,
  } = useSessionStore();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const lastCaptureSignal = useRef(0);
  const partnerPhotosRef = useRef<string[]>([]);
  const navigatedRef = useRef(false);
  const wasRunningRef = useRef(false);
  const [myCaptureDone, setMyCaptureDone] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const myPosition: "left" | "right" | null =
    shouldInitiate === null ? null : shouldInitiate ? "left" : "right";

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (
      running &&
      !wasRunningRef.current &&
      stream &&
      remoteStream &&
      myPosition
    ) {
      reset();
      setPartnerPhotos([]);
      startRecording(stream, remoteStream, myPosition);
    }
    wasRunningRef.current = running;
  }, [running, reset, startRecording, stream, remoteStream, myPosition]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    partnerPhotosRef.current = partnerPhotos;
  }, [partnerPhotos]);

  useEffect(() => {
    if (captureSignal === 0 || captureSignal === lastCaptureSignal.current)
      return;
    lastCaptureSignal.current = captureSignal;

    if (videoRef.current) {
      const frame = captureFrame(videoRef.current, 4 / 3);
      addPhoto(frame);
      sendData(JSON.stringify({ type: "photo", photo: frame }));
    }

    if (captureSignal === 4) {
      stopRecording().then(setVideoBlob);
      setMyCaptureDone(true);
    }
  }, [
    captureSignal,
    videoRef,
    addPhoto,
    sendData,
    stopRecording,
    setVideoBlob,
  ]);

  useEffect(() => {
    if (!myCaptureDone || navigatedRef.current) return;

    const finish = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      saveStorePartnerPhotos(partnerPhotosRef.current);
      setMyPosition(myPosition);
      setRoomId(roomId);
      const sessionId = uuid();
      router.push(`/result/${sessionId}`);
    };

    if (partnerPhotos.length >= 4) {
      finish();
      return;
    }

    const timeoutId = setTimeout(finish, 3000);
    return () => clearTimeout(timeoutId);
  }, [
    myCaptureDone,
    partnerPhotos,
    myPosition,
    router,
    saveStorePartnerPhotos,
    setMyPosition,
    setRoomId,
    roomId,
  ]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied("code");
    setTimeout(() => setCopied(null), 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 1500);
  };

  const localBox = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black shadow-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full scale-x-[-1] object-cover"
      />
      {running && <CountdownOverlay count={count} />}
      <span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white sm:text-xs">
        You
      </span>
    </div>
  );

  const remoteBox = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black shadow-xl">
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full scale-x-[-1] object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-[85%] rounded-2xl bg-black/50 px-4 py-3 text-center text-xs text-white/90 sm:text-sm">
            <p className="font-semibold">Waiting for a friend...</p>
            <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
              Video connects directly — nothing is stored.
            </p>
          </div>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white sm:text-xs">
        Partner
      </span>
    </div>
  );

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
          {myCaptureDone
            ? "Session complete 🩷"
            : peerConnected
              ? "Connected 🩷"
              : peerJoined
                ? "Connecting..."
                : "Duo Booth"}
        </span>
      </div>

      {!peerJoined && (
        <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md sm:flex-row sm:justify-between sm:px-5">
          <div className="flex items-center gap-2 text-left">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#d88fa9]" />
            <div>
              <p className="text-sm font-semibold text-[#5c3a49]">
                Invite your partner
              </p>
              <p className="text-[11px] text-[#8fae8f]">
                🔒 Private &amp; secure — invite-only
              </p>
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              onClick={copyCode}
              className="flex-1 rounded-full border border-[#d88fa9]/40 px-3 py-2 text-xs font-semibold whitespace-nowrap text-[#d88fa9] sm:flex-none"
            >
              {copied === "code" ? "Copied!" : `Code: ${roomId}`}
            </button>
            <button
              onClick={copyLink}
              className="flex-1 rounded-full bg-[#d88fa9] px-4 py-2 text-xs font-semibold whitespace-nowrap text-white sm:flex-none"
            >
              {copied === "link" ? "Copied!" : "Share invite link"}
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-2xl flex-row gap-2 sm:gap-3">
        <div
          className={
            myPosition === "right"
              ? "order-2 min-w-0 flex-1"
              : "order-1 min-w-0 flex-1"
          }
        >
          {localBox}
        </div>
        <div
          className={
            myPosition === "right"
              ? "order-1 min-w-0 flex-1"
              : "order-2 min-w-0 flex-1"
          }
        >
          {remoteBox}
        </div>
      </div>

      <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-3xl bg-white px-4 py-4 shadow-md sm:px-6">
        <div className="flex gap-2">
          <button
            disabled
            title="Filters — coming soon"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0d3dd] text-base text-[#d88fa9]/40"
          >
            🎨
          </button>
          <button
            disabled
            title="Backgrounds — coming soon"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0d3dd] text-base text-[#d88fa9]/40"
          >
            🖼️
          </button>
        </div>

        {peerConnected && !running && !myCaptureDone && shotIndex < 4 ? (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-full bg-[#d88fa9] px-8 py-3 font-semibold text-white shadow-md"
          >
            📸 Capture
          </button>
        ) : (
          <span className="text-sm font-medium text-[#a86b80]">
            {running ? `shot ${shotIndex + 1} of 4` : "waiting to connect..."}
          </span>
        )}

        <div className="w-11 sm:w-24" />
      </div>
    </main>
  );
}
