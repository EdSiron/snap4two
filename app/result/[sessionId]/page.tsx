"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/sessionStore";
import { buildStrip, buildDuoStrip } from "@/lib/canvasUtils";
import { useRetakeRequest } from "@/hooks/useRetakeRequest";

export default function ResultPage() {
  const { photos, partnerPhotos, myPosition, roomId, videoBlob, reset } =
    useSessionStore();
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const router = useRouter();
  const isDuo = roomId !== null;

  const { incomingRequest, partnerAgreed, requestRetake, agreeToRetake } =
    useRetakeRequest(isDuo ? roomId : null);

  const [waitingForPartner, setWaitingForPartner] = useState(false);

  useEffect(() => {
    if (photos.length === 0) return;
    if (partnerPhotos.length >= 4 && myPosition) {
      buildDuoStrip(photos, partnerPhotos, myPosition).then(setStripUrl);
    } else {
      buildStrip(photos).then(setStripUrl);
    }
  }, [photos, partnerPhotos, myPosition]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // once the partner agrees, actually navigate back into the room
  useEffect(() => {
    if (partnerAgreed && isDuo) {
      reset();
      router.push(`/capture/duo/${roomId}`);
    }
  }, [partnerAgreed, isDuo, reset, roomId, router]);

  const handleRetakeClick = () => {
    if (!isDuo) {
      reset();
      router.push("/capture");
      return;
    }
    requestRetake();
    setWaitingForPartner(true);
  };

  const handleAgree = () => {
    agreeToRetake();
    reset();
    router.push(`/capture/duo/${roomId}`);
  };

  if (photos.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-4">
        <p className="text-[#d88fa9] text-xl">No photos yet — go take some first! 🎀</p>
        <button
          onClick={() => router.push("/capture")}
          className="px-6 py-2 rounded-full bg-[#d88fa9] text-white font-semibold"
        >
          Go to Capture
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-6 py-10 px-4">
      <h1 className="text-2xl font-bold text-[#d88fa9]">Your strip is ready! 🩷</h1>

      {stripUrl && (
        <img src={stripUrl} alt="Photo strip" className="rounded-2xl shadow-lg w-full max-w-[300px]" />
      )}

      {videoBlob && videoBlob.size > 0 && (
        <video controls src={URL.createObjectURL(videoBlob)} className="rounded-2xl shadow-lg w-full max-w-[300px]" />
      )}

      {incomingRequest && (
        <div className="bg-white rounded-2xl shadow-md px-5 py-4 flex flex-col items-center gap-3 max-w-xs text-center">
          <p className="text-[#d88fa9]">Your partner wants to retake the photos 🥺</p>
          <button
            onClick={handleAgree}
            className="px-5 py-2 rounded-full bg-[#d88fa9] text-white font-semibold"
          >
            Agree & Retake
          </button>
        </div>
      )}

      {waitingForPartner && !partnerAgreed && (
        <p className="text-[#d88fa9] text-sm">waiting for your partner to agree...</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:w-auto sm:max-w-none justify-center">
        {stripUrl && (
          <a href={stripUrl} download="snap4two-strip.png" className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-[#d88fa9] text-white font-semibold shadow-md">
            Download Strip
          </a>
        )}
        {videoBlob && videoBlob.size > 0 && (
          <a href={URL.createObjectURL(videoBlob)} download="snap4two-session.webm" className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] font-semibold shadow-md">
            Download Video
          </a>
        )}
        <button
          onClick={handleRetakeClick}
          disabled={waitingForPartner}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] font-semibold disabled:opacity-50"
        >
          {isDuo ? (waitingForPartner ? "Waiting for partner..." : "Request Retake") : "Retake"}
        </button>
      </div>
    </main>
  );
}