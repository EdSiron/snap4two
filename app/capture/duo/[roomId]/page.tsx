"use client";

import { useParams, useRouter } from "next/navigation";
import { useCamera } from "@/hooks/useCamera";
// remove: import { useRecorder } from '@/hooks/useRecorder';
import { useDuoRecorder } from "@/hooks/useDuoRecorder";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useSyncedCapture } from "@/hooks/useSyncedCapture";
import { CountdownOverlay } from "@/components/capture/CountdownOverlay";
import { captureFrame } from "@/lib/canvasUtils";
import { useSessionStore } from "@/store/sessionStore";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export default function DuoCapturePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const { videoRef, stream } = useCamera();
  const { start: startRecording, stop: stopRecording } = useDuoRecorder();
  const { peerJoined, shouldInitiate, socket } = useRoomConnection(roomId);
  const { remoteStream, peerConnected } = usePeerConnection(
    socket,
    stream,
    shouldInitiate,
  );
  const {
    count,
    shotIndex,
    running,
    captureSignal,
    partnerPhotos,
    start,
    sendPhoto,
  } = useSyncedCapture(socket);

  const { addPhoto, reset, setPartnerPhotos, setMyPosition, setVideoBlob } =
    useSessionStore();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const lastCaptureSignal = useRef(0);
  const partnerPhotosRef = useRef<string[]>([]);
  const navigatedRef = useRef(false);
  const [myCaptureDone, setMyCaptureDone] = useState(false);

  const myPosition: "left" | "right" | null =
    shouldInitiate === null ? null : shouldInitiate ? "left" : "right";

  const wasRunningRef = useRef(false);

  const [shareUrl, setShareUrl] = useState("");

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
      sendPhoto(frame);
    }

    if (captureSignal === 4) {
      stopRecording().then(setVideoBlob);
      setMyCaptureDone(true);
    }
  }, [
    captureSignal,
    videoRef,
    addPhoto,
    sendPhoto,
    stopRecording,
    setVideoBlob,
  ]);

  useEffect(() => {
    if (!myCaptureDone || navigatedRef.current) return;

    const finish = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      setPartnerPhotos(partnerPhotosRef.current);
      setMyPosition(myPosition);
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
    setPartnerPhotos,
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
      <span className="absolute bottom-2 left-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full">
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
      <span className="absolute bottom-2 left-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full">
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
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <div
          className={
            myPosition === "right" ? "order-2 flex-1" : "order-1 flex-1"
          }
        >
          {localBox}
        </div>
        <div
          className={
            myPosition === "right" ? "order-1 flex-1" : "order-2 flex-1"
          }
        >
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
