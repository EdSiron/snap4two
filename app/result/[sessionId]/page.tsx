"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/sessionStore";
import { buildStrip } from "@/lib/canvasUtils";

export default function ResultPage() {
  const { photos, videoBlob, reset } = useSessionStore();
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (photos.length === 0) return;
    buildStrip(photos).then(setStripUrl);
  }, [photos]);

  // warn before leaving without downloading
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (photos.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-4">
        <p className="text-[#d88fa9] text-xl">
          No photos yet — go take some first! 🎀
        </p>
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-6 py-10">
      <h1 className="text-2xl font-bold text-[#d88fa9]">
        Your strip is ready! 🩷
      </h1>

      {stripUrl && (
        <img
          src={stripUrl}
          alt="Photo strip"
          className="rounded-2xl shadow-lg w-full max-w-[300px]"
        />
      )}

      {videoBlob && videoBlob.size > 0 && (
        <video
          controls
          src={URL.createObjectURL(videoBlob)}
          className="rounded-2xl shadow-lg w-full max-w-[300px]"
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none px-4">
        {stripUrl && (
          <a
            href={stripUrl}
            download="snap4two-strip.png"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-[#d88fa9] text-white font-semibold shadow-md"
          >
            Download Strip
          </a>
        )}
        {videoBlob && videoBlob.size > 0 && (
          <a
            href={URL.createObjectURL(videoBlob)}
            download="snap4two-session.webm"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] font-semibold shadow-md"
          >
            Download Video
          </a>
        )}
        <button
          onClick={() => {
            reset();
            router.push("/capture");
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] font-semibold"
        >
          Retake
        </button>
      </div>
    </main>
  );
}
