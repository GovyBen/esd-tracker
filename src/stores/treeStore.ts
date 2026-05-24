import { create } from "zustand";
import type { TreeNode } from "../types";

// --- Updated IPBlockRecord to include chipTagIds ---
// This is done in types/index.ts

interface TreeState {
  treeData: TreeNode[];
  selectedNodeId: string | null;
  selectedNodeType: "ip" | "port" | null;
  expandedIds: Set<string>;
  searchQuery: string;
  chipTagFilter: string[];
  multiSelectIds: Set<string>;
  treeVersion: number;
  setTreeData: (data: TreeNode[]) => void;
  selectNode: (id: string, type: "ip" | "port") => void;
  toggleExpand: (id: string) => void;
  setExpanded: (ids: string[]) => void;
  setSearchQuery: (q: string) => void;
  setChipTagFilter: (tags: string[]) => void;
  toggleMultiSelect: (id: string) => void;
  clearSelection: () => void;
  incrementVersion: () => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  treeData: [], selectedNodeId: null, selectedNodeType: null, expandedIds: new Set<string>(),
  searchQuery: "", chipTagFilter: [], multiSelectIds: new Set<string>(), treeVersion: 0,
  setTreeData: (data) => set({ treeData: data }),
  selectNode: (id, type) => set({ selectedNodeId: id, selectedNodeType: type, multiSelectIds: new Set() }),
  toggleExpand: (id) => set((s) => { const next = new Set(s.expandedIds); if (next.has(id)) next.delete(id); else next.add(id); return { expandedIds: next }; }),
  setExpanded: (ids) => set({ expandedIds: new Set(ids) }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setChipTagFilter: (tags) => set({ chipTagFilter: tags }),
  toggleMultiSelect: (id) => set((s) => { const next = new Set(s.multiSelectIds); if (next.has(id)) next.delete(id); else next.add(id); return { multiSelectIds: next }; }),
  clearSelection: () => set({ selectedNodeId: null, selectedNodeType: null, multiSelectIds: new Set() }),
  incrementVersion: () => set((s) => ({ treeVersion: s.treeVersion + 1 })),
}));
