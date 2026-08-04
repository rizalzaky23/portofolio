import { create } from 'zustand';

interface UIState {
  lanyardDone: boolean;        // lanyard scroll-out completed
  navOpen: boolean;            // mobile nav state
  cursorX: number;
  cursorY: number;
  setLanyardDone: (done: boolean) => void;
  setNavOpen: (open: boolean) => void;
  setCursor: (x: number, y: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  lanyardDone: false,
  navOpen: false,
  cursorX: 0,
  cursorY: 0,

  setLanyardDone: (done) => set({ lanyardDone: done }),
  setNavOpen: (open) => set({ navOpen: open }),
  setCursor: (cursorX, cursorY) => set({ cursorX, cursorY }),
}));
