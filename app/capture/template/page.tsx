"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATES, StripTemplate } from "@/lib/templates";
import { SOLO_LAYOUT, DUO_LAYOUT } from "@/lib/canvasUtils";
import { useSessionStore } from "@/store/sessionStore";

type Mode = "solo" | "duo";

function getWindows(mode: Mode) {
  if (mode === "solo") {
    const L = SOLO_LAYOUT;
    return {
      W: L.W,
      H: L.H,
      windows: Array.from({ length: 4 }, (_, i) => ({
        x: L.SIDE,
        y: L.TOP + i * (L.PHOTO_H + L.GAP),
        w: L.PHOTO_W,
        h: L.PHOTO_H,
      })),
    };
  }
  const L = DUO_LAYOUT;
  return {
    W: L.W,
    H: L.H,
    windows: Array.from({ length: 8 }, (_, n) => ({
      x: L.SIDE + (n % 2) * L.COL_W,
      y: L.TOP + Math.floor(n / 2) * (L.ROW_H + L.GAP),
      w: L.COL_W,
      h: L.ROW_H,
    })),
  };
}

function TemplatePreview({
  template,
  mode,
}: {
  template: StripTemplate;
  mode: Mode;
}) {
  const [bgFailed, setBgFailed] = useState(false);
  const [overlayFailed, setOverlayFailed] = useState(false);
  const { W, H, windows } = getWindows(mode);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-sm"
      style={{
        aspectRatio: `${W} / ${H}`,
        backgroundColor: template.background,
      }}
    >
      {!bgFailed && (
        <img
          src={`/templates/${mode}/${template.id}.png`}
          alt=""
          onError={() => setBgFailed(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}

      {windows.map((win, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(win.x / W) * 100}%`,
            top: `${(win.y / H) * 100}%`,
            width: `${(win.w / W) * 100}%`,
            height: `${(win.h / H) * 100}%`,
            backgroundColor: template.background,
          }}
        />
      ))}

      {!overlayFailed && (
        <img
          src={`/overlays/${mode}/${template.id}.png`}
          alt=""
          onError={() => setOverlayFailed(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

// height of the centered strip; scales with the screen so the page never scrolls
const STRIP_H = "min(40dvh, 380px)";

function TemplateSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedTemplate } = useSessionStore();
  const roomId = searchParams.get("room"); // present only in the duo flow
  const mode: Mode = roomId ? "duo" : "solo";
  const { W, H } = getWindows(mode);

  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const last = TEMPLATES.length - 1;

  const go = useCallback(
    (step: number) => setActive((a) => Math.min(last, Math.max(0, a + step))),
    [last],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const choose = (template: StripTemplate) => {
    setSelectedTemplate(template);
    if (roomId) {
      router.push(`/capture/duo/${roomId}?template=${template.id}`);
    } else {
      router.push("/capture");
    }
  };

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#6c233d] bg-white text-2xl leading-none text-[#6c233d] shadow-md transition hover:bg-[#fff0f5] disabled:opacity-30 disabled:hover:bg-white";

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 overflow-hidden bg-[#f4ede7] px-4 py-4 sm:gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#6c233d] sm:text-4xl">
          Pick your <span className="text-[#d88fa9] italic">style</span>
        </h1>
        <p className="mt-1 text-xs text-[#a86b80] sm:text-sm">
          Choose a {mode === "duo" ? "duo" : "photo"} strip for your session.
        </p>
      </div>

      {/* every card stays mounted and slides with transform, so it animates smoothly */}
      <div
        className="relative w-full max-w-2xl"
        style={{ height: `calc(${STRIP_H} + 56px)` }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {TEMPLATES.map((template, i) => {
          const offset = i - active;
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          return (
            <button
              key={template.id}
              onClick={() => (isActive ? choose(template) : setActive(i))}
              tabIndex={isVisible ? 0 : -1}
              className={`absolute top-1/2 left-1/2 rounded-2xl border-2 bg-white p-1.5 transition-[transform,opacity,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                isActive
                  ? "border-[#6c233d] shadow-xl"
                  : "border-[#6c233d]/40 shadow-sm"
              }`}
              style={{
                transform: `translate(${-50 + offset * 90}%, -50%) scale(${isActive ? 1 : 0.7})`,
                opacity: isActive ? 1 : isVisible ? 0.65 : 0,
                zIndex: isActive ? 10 : 5,
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <div
                style={{
                  height: STRIP_H,
                  width: `calc(${STRIP_H} * ${W / H})`,
                }}
              >
                <TemplatePreview template={template} mode={mode} />
              </div>
              <span className="mt-1 block truncate text-center text-xs font-semibold text-[#6c233d]">
                {template.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous style"
          className={arrowClass}
        >
          ‹
        </button>
        <button
          onClick={() => choose(TEMPLATES[active])}
          className="rounded-full bg-[#d88fa9] px-8 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Use this style
        </button>
        <button
          onClick={() => go(1)}
          disabled={active === last}
          aria-label="Next style"
          className={arrowClass}
        >
          ›
        </button>
      </div>
    </main>
  );
}

export default function TemplateSelectPage() {
  return (
    <Suspense>
      <TemplateSelectContent />
    </Suspense>
  );
}
