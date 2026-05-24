import { create } from "zustand";
import type { NavView } from "../types";

interface NavState {
  currentView: NavView;
  adminSubView: string | null;
  history: NavView[];
  navigate: (view: NavView) => void;
  setAdminSubView: (sub: string | null) => void;
  goBack: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  currentView: "tree",
  adminSubView: null,
  history: [],
  navigate: (view) =>
    set((s) => ({
      currentView: view,
      adminSubView: null,
      history: [...s.history, s.currentView].slice(-20),
    })),
  setAdminSubView: (sub) => set({ adminSubView: sub }),
  goBack: () => {
    const { history } = get();
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({ currentView: prev, history: history.slice(0, -1) });
    }
  },
}));
