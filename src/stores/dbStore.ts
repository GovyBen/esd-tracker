import { create } from "zustand";

interface DBState {
  dbPath: string | null;
  dbName: string | null;
  lastModified: string | null;
  currentUser: string;
  isOpen: boolean;
  setDatabase: (path: string, name: string, modified: string) => void;
  setCurrentUser: (user: string) => void;
  closeDatabase: () => void;
}

export const useDBStore = create<DBState>((set) => ({
  dbPath: null,
  dbName: null,
  lastModified: null,
  currentUser: localStorage.getItem("esd-current-user") || "",
  isOpen: false,
  setDatabase: (path, name, modified) =>
    set({ dbPath: path, dbName: name, lastModified: modified, isOpen: true }),
  setCurrentUser: (user) => {
    localStorage.setItem("esd-current-user", user);
    set({ currentUser: user });
  },
  closeDatabase: () =>
    set({ dbPath: null, dbName: null, lastModified: null, isOpen: false }),
}));
