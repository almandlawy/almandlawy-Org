/**
 * Zustand store — showroom selection + 2D/3D view mode (gltfjsx-style state split).
 */

import { create } from "zustand";

export type ShowroomViewMode = "2d" | "3d";

interface ShowroomState {
  selectedProductId: string;
  viewMode: ShowroomViewMode;
  setSelectedProductId: (id: string) => void;
  setViewMode: (mode: ShowroomViewMode) => void;
  toggleViewMode: () => void;
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  selectedProductId: "pgr-gold-1g-10g",
  viewMode: "3d",
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "2d" ? "3d" : "2d",
    })),
}));
