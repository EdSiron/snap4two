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
    if (data.type === "photo-update") {
      setPartnerPhotos((prev) => {
        const next = [...prev];
        next[data.index] = data.photo;
        return next;
      });
    }
  } catch {
    // ignore malformed data messages
  }
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
    setVideoBlob,
    setRoomId,
  } = useSessionStore();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const lastCaptureSignal = useRef(0);
  const partnerPhotosRef = useRef<string[]>([]);
  const navigatedRef = useRef(false);
  const wasRunningRef = useRef(false);
  const [myCaptureDone, setMyCaptureDone] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const myPosition: "left" | "right" | null =
    shouldInitiate === null ? null : shouldInitiate ? "left" : "right";
  
  const [reviewing, setReviewing] = useState(false);
const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

useEffect(() => {
  if (!myCaptureDone || reviewing) return;

  if (partnerPhotos.length >= 4) {
    setReviewing(true);
    return;
  }

  const timeoutId = setTimeout(() => setReviewing(true), 3000);
  return () => clearTimeout(timeoutId);
}, [myCaptureDone, partnerPhotos, reviewing]);

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
      setPartnerPhotos([]); // clear any stale partner frames from a previous run
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
      const frame = captureFrame(videoRef.current);
      addPhoto(frame);
      sendData(JSON.stringify({ type: "photo", photo: frame }));
    }

    if (captureSignal === 4) {
      stopRecording().then(setVideoBlob);
      setMyCaptureDone(true);
    }
  }, [captureSignal, videoRef, addPhoto, sendData, stopRecording, setVideoBlob]);

  useEffect(() => {
    if (!myCaptureDone || navigatedRef.current) return;

    const finish = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      saveStorePartnerPhotos(partnerPhotosRef.current);
      setMyPosition(myPosition);
      setRoomId(roomId); // NEW
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
  ]);

  const localBox = (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      {running && <CountdownOverlay count={count} />}
      <span className="absolute bottom-1 left-1 text-white text-[10px] sm:text-xs bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
        You
      </span>
    </div>
  );

  const remoteBox = (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-black">
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
          waiting...
        </div>
      )}
      <span className="absolute bottom-1 left-1 text-white text-[10px] sm:text-xs bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
        Partner
      </span>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-4 px-4 py-8">
      <p className="text-[#d88fa9] font-semibold">
        {myCaptureDone
          ? "🩷 session complete! preparing your strip..."
          : peerConnected
            ? "🩷 connected with your partner!"
            : peerJoined
              ? "connecting video..."
              : "waiting for your partner..."}
      </p>

      {!peerJoined && (
        <div className="bg-white rounded-2xl shadow-md px-4 py-3 flex flex-col items-center gap-2 max-w-xs">
          <p className="text-sm text-[#d88fa9]">
            Share this link with your partner:
          </p>
          <div className="flex gap-2 items-center">
            <code className="text-xs bg-[#fff0f5] px-2 py-1 rounded-full text-[#d88fa9] break-all">
              {shareUrl}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              disabled={!shareUrl}
              className="text-xs px-3 py-1 rounded-full bg-[#d88fa9] text-white font-semibold shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-2 sm:gap-3 w-full max-w-2xl px-2">
        <div className={myPosition === "right" ? "order-2 flex-1 min-w-0" : "order-1 flex-1 min-w-0"}>
          {localBox}
        </div>
        <div className={myPosition === "right" ? "order-1 flex-1 min-w-0" : "order-2 flex-1 min-w-0"}>
          {remoteBox}
        </div>
      </div>

      {peerConnected && !running && !myCaptureDone && shotIndex < 4 && (
        <button
          onClick={start}
          className="px-8 py-3 rounded-full bg-[#d88fa9] text-white font-semibold shadow-md"
        >
          Start Capture
        </button>
      )}

      {running && <p className="text-[#d88fa9]">shot {shotIndex + 1} of 4</p>}
    </main>
  );
}