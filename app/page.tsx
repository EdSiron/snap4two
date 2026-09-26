'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

export default function Home() {
  const router = useRouter();
  const [showDuoOptions, setShowDuoOptions] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const createRoom = () => {
    const roomId = uuid().slice(0, 8); // short, shareable code
    router.push(`/capture/duo/${roomId}`);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return;
    router.push(`/capture/duo/${joinCode.trim()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f3] gap-8 px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-[#d88fa9]">snap4two 🩷</h1>
        <p className="text-[#d88fa9]/80 mt-2">Snap it. Strip it. Send it.</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push('/capture')}
          className="px-6 py-3 rounded-full bg-[#d88fa9] text-white font-semibold shadow-md"
        >
          Start Solo Booth
        </button>

        <button
          onClick={() => setShowDuoOptions((v) => !v)}
          className="px-6 py-3 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] font-semibold shadow-md"
        >
          Duo Booth (Long Distance 💌)
        </button>

        {showDuoOptions && (
          <div className="flex flex-col gap-3 mt-2 p-4 rounded-2xl bg-white shadow-inner">
            <button
              onClick={createRoom}
              className="px-4 py-2 rounded-full bg-[#d88fa9] text-white text-sm font-semibold"
            >
              Create a Room
            </button>

            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter room code"
                className="flex-1 px-3 py-2 rounded-full border border-[#d88fa9]/40 text-sm text-[#d88fa9] outline-none"
              />
              <button
                onClick={joinRoom}
                className="px-4 py-2 rounded-full bg-white border border-[#d88fa9] text-[#d88fa9] text-sm font-semibold"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}