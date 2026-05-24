import { create } from "zustand";

interface DetailState {
  isOpen: boolean;
  isPinned: boolean;
  isPopout: boolean;
  width: number;
  selectedId: string | null;
  selectedType: "ip" | "port" | null;
  portTab: "events" | "emx" | "checklist";
  openDetail: (id: string, type: "ip" | "port") => void;
  closeDetail: () => void;
  togglePin: () => void;
  togglePopout: () => void;
  setWidth: (w: number) => void;
  setPortTab: (tab: "events" | "emx" | "checklist") => void;
}

export const useDetailStore = create<DetailState>((set) => ({
  isOpen: false,
  isPinned: false,
  isPopout: false,
  width: 360,
  selectedId: null,
  selectedType: null,
  portTab: "events",
  openDetail: (id, type) => set({ isOpen: true, selectedId: id, selectedType: type }),
  closeDetail: () => set({ isOpen: false, selectedId: null, selectedType: null }),
  togglePin: () => set((s) => ({ isPinned: !s.isPinned })),
  togglePopout: () => set((s) => ({ isPopout: !s.isPopout })),
  setWidth: (w) => set({ width: Math.max(280, Math.min(w, 600)) }),
  setPortTab: (tab) => set({ portTab: tab }),
}));
