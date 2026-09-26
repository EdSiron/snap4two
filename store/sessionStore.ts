import { create } from 'zustand';

interface SessionState {
  photos: string[];
  videoBlob: Blob | null;
  filter: string;
  addPhoto: (photo: string) => void;
  reset: () => void;
  setVideoBlob: (blob: Blob) => void;
  setFilter: (filter: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  photos: [],
  videoBlob: null,
  filter: 'none',
  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
  reset: () => set({ photos: [], videoBlob: null }),
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  setFilter: (filter) => set({ filter }),
}));