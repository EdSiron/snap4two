"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [showDuoModal, setShowDuoModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const createRoom = () => {
    const roomId = uuid().slice(0, 8);
    router.push(`/capture/template?room=${roomId}`);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return;
    router.push(`/capture/duo/${joinCode.trim()}`);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff8f3]">
      {/* NAV */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-xl font-bold text-[#d88fa9]">snap4two 🩷</span>
        <div className="hidden gap-8 text-sm font-medium text-[#a86b80] sm:flex">
          <a href="#how-it-works" className="transition hover:text-[#d88fa9]">
            How it works
          </a>
          <a href="#features" className="transition hover:text-[#d88fa9]">
            Features
          </a>
          <a href="#duo" className="transition hover:text-[#d88fa9]">
            Long Distance
          </a>
        </div>
        <button
          onClick={() => router.push("/capture")}
          className="rounded-full bg-[#d88fa9] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          Start Booth
        </button>
      </nav>

      {/* HERO */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pt-10 pb-16 text-center sm:pt-20">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-full bg-[#ffe9f0] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#d88fa9] uppercase"
        >
          Now with Long Distance Duo Mode 💌
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl text-4xl leading-tight font-bold text-[#6c233d] sm:text-6xl"
        >
          A photobooth for moments,{" "}
          <span className="text-[#d88fa9]">no matter the distance.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-base text-[#a86b80] sm:text-lg"
        >
          Capture a classic 4-cut photo strip and the full video of your session
          — solo, or together in real time with someone miles away. All from
          your browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <button
            onClick={() => router.push("/capture/template")}
            className="rounded-full bg-[#d88fa9] px-8 py-3.5 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Solo Booth
          </button>
          <button
            onClick={() => setShowDuoModal(true)}
            className="rounded-full border border-[#d88fa9] bg-white px-8 py-3.5 font-semibold text-[#d88fa9] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Start Duo Booth 💌
          </button>
        </motion.div>

        {/* mock strip preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rotate-[-2deg] rounded-3xl bg-white p-3 shadow-xl"
        >
          <div className="grid w-[220px] grid-cols-2 gap-1.5 sm:w-[280px]">
            {[
              "from-pink-200 to-pink-300",
              "from-rose-200 to-rose-300",
              "from-fuchsia-200 to-fuchsia-300",
              "from-pink-300 to-rose-200",
            ].map((g, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-gradient-to-br ${g}`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-sm font-bold text-[#d88fa9]">
            snap4two 🩷
          </p>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-6 py-16 sm:py-24"
      >
        <h2 className="mb-12 text-center text-2xl font-bold text-[#6c233d] sm:text-3xl">
          How it works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              emoji: "🔗",
              title: "Start or share a link",
              desc: "Jump into a solo session, or create a room and send the link to someone far away.",
            },
            {
              emoji: "📸",
              title: "Strike a pose, together",
              desc: "A synced countdown captures 4 photos — side by side if you're in Duo Mode.",
            },
            {
              emoji: "💾",
              title: "Download your keepsake",
              desc: "Get your photo strip and the full session recording, instantly, right in your browser.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <span className="text-4xl">{step.emoji}</span>
              <h3 className="font-semibold text-[#6c233d]">{step.title}</h3>
              <p className="text-sm text-[#a86b80]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DUO / LONG DISTANCE SPOTLIGHT */}
      <section id="duo" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-10 rounded-3xl bg-[#fff0f5] p-8 sm:flex-row sm:p-14">
          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-semibold tracking-wide text-[#d88fa9] uppercase">
              For long-distance couples
            </span>
            <h2 className="mt-2 mb-4 text-2xl font-bold text-[#6c233d] sm:text-3xl">
              You don't need to be in the same room to make a memory.
            </h2>
            <p className="mb-6 text-[#a86b80]">
              Duo Mode opens both of your cameras side by side, in real time —
              so you can pose together, count down together, and walk away with
              a strip that looks like you were in the same room the whole time.
            </p>
            <button
              onClick={() => setShowDuoModal(true)}
              className="rounded-full bg-[#d88fa9] px-8 py-3.5 font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Try Duo Booth
            </button>
          </div>
          <div className="flex flex-1 justify-center gap-3">
            <div className="aspect-[3/4] w-28 rounded-2xl bg-gradient-to-br from-pink-200 to-rose-300 shadow-lg sm:w-36" />
            <div className="mt-6 aspect-[3/4] w-28 rounded-2xl bg-gradient-to-br from-rose-200 to-fuchsia-300 shadow-lg sm:w-36" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mb-12 text-center text-2xl font-bold text-[#6c233d] sm:text-3xl">
          Everything a real photobooth has — and more
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🎞️",
              title: "4-cut photo strip",
              desc: "A classic strip layout, generated instantly in your browser.",
            },
            {
              icon: "🎥",
              title: "Full session recording",
              desc: "Every pose, every laugh — captured on video automatically.",
            },
            {
              icon: "💌",
              title: "Duo Mode",
              desc: "Two cameras, one room, synced countdowns — built for distance.",
            },
            {
              icon: "🔒",
              title: "Private by design",
              desc: "Nothing is uploaded to a server — your photos stay yours.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-[#6c233d]">{f.title}</h3>
              <p className="text-sm text-[#a86b80]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
        <h2 className="mb-4 text-2xl font-bold text-[#6c233d] sm:text-4xl">
          Ready to make a memory?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-[#a86b80]">
          No downloads, no sign-ups — just open your camera and start.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => router.push("/capture/template")}
            className="rounded-full bg-[#d88fa9] px-8 py-3.5 font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            Start Solo Booth
          </button>
          <button
            onClick={() => setShowDuoModal(true)}
            className="rounded-full border border-[#d88fa9] bg-white px-8 py-3.5 font-semibold text-[#d88fa9] shadow-sm transition hover:shadow-md"
          >
            Start Duo Booth
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#f3d9e2] px-6 py-8 text-center text-sm text-[#a86b80]">
        <p>snap4two 🩷 — made for moments, near or far.</p>
      </footer>

      {/* DUO MODAL */}
      <AnimatePresence>
        {showDuoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowDuoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl sm:p-8"
            >
              <h3 className="text-center text-lg font-bold text-[#6c233d]">
                Duo Booth 💌
              </h3>
              <p className="text-center text-sm text-[#a86b80]">
                Create a room and send the link to your partner, or join with a
                code they sent you.
              </p>

              <button
                onClick={createRoom}
                className="rounded-full bg-[#d88fa9] px-4 py-3 font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Create a Room
              </button>

              <div className="flex items-center gap-2 text-xs text-[#c98ba0]">
                <div className="h-px flex-1 bg-[#f3d9e2]" />
                or join with a code
                <div className="h-px flex-1 bg-[#f3d9e2]" />
              </div>

              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter room code"
                  className="flex-1 rounded-full border border-[#d88fa9]/30 px-4 py-2.5 text-sm text-[#6c233d] outline-none focus:border-[#d88fa9]"
                />
                <button
                  onClick={joinRoom}
                  className="rounded-full border border-[#d88fa9] bg-white px-4 py-2.5 text-sm font-semibold text-[#d88fa9] transition hover:bg-[#fff0f5]"
                >
                  Join
                </button>
              </div>

              <button
                onClick={() => setShowDuoModal(false)}
                className="mt-1 text-xs text-[#c98ba0] hover:text-[#d88fa9]"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
