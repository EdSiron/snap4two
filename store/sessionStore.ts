import { create } from 'zustand';

interface SessionState {
  photos: string[];
  partnerPhotos: string[];
  myPosition: 'left' | 'right' | null;
  videoBlob: Blob | null;
  filter: string;
  addPhoto: (photo: string) => void;
  setPartnerPhotos: (photos: string[]) => void;
  setMyPosition: (pos: 'left' | 'right' | null) => void;
  reset: () => void;
  setVideoBlob: (blob: Blob) => void;
  setFilter: (filter: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  photos: [],
  partnerPhotos: [],
  myPosition: null,
  videoBlob: null,
  filter: 'none',
  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
  setPartnerPhotos: (photos) => set({ partnerPhotos: photos }),
  setMyPosition: (pos) => set({ myPosition: pos }),
  reset: () => set({ photos: [], videoBlob: null, partnerPhotos: [] }),
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  setFilter: (filter) => set({ filter }),
}));