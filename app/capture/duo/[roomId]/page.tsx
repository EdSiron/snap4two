"use client";

import { useParams } from "next/navigation";
import { useCamera } from "@/hooks/useCamera";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useEffect, useRef } from "react";

export default function DuoCapturePage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const { videoRef, stream, ready } = useCamera();
  const { connected, peerJoined, shouldInitiate, socket } =
    useRoomConnection(roomId);
  const { remoteStream, peerConnected } = usePeerConnection(
    socket,
    stream,
    shouldInitiate,
  );

  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // stable position based on the server-assigned role, same on both screens
  const myPosition: "left" | "right" | null =
    shouldInitiate === null ? null : shouldInitiate ? "left" : "right";

  const localBox = (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
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
        {peerConnected
          ? "🩷 connected with your partner!"
          : peerJoined
            ? "connecting video..."
            : "waiting for your partner..."}
      </p>

      {myPosition && (
        <p className="text-[#d88fa9] text-sm">
          You're on the <strong>{myPosition}</strong> in your final strip
        </p>
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
    </main>
  );
}
