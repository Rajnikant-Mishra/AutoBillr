import { create } from "zustand";

export const useUIStore = create((set) => ({
  overlayCount: 0,

  openOverlay: () =>
    set((state) => ({
      overlayCount: state.overlayCount + 1,
    })),

  closeOverlay: () =>
    set((state) => ({
      overlayCount: Math.max(
        0,
        state.overlayCount - 1
      ),
    })),
}));