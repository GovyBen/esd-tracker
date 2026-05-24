import { useState } from "react";
import { updatePort } from "../../db/queries";
import { useTreeStore } from "../../stores/treeStore";
import type { TreeNode } from "../../types";
import { Edit3, Check, X } from "lucide-react";

interface PortNodeProps { node: TreeNode; }

const statusColors: Record<string, string> = {
  pending: "#9ca3af", in_progress: "#3b82f6", completed: "#22c55e", problem: "#ef4444",
};

export function PortNode({ node }: PortNodeProps) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const incrementVersion = useTreeStore((s) => s.incrementVersion);

  const color = statusColors[node.status ?? "pending"] || "#9ca3af";
  const progress = node.eventProgress ?? 0;

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== node.name) {
      updatePort(node.id, { name: newName.trim() });
      incrementVersion();
    }
    setRenaming(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded group">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {renaming ? (
        <div className="flex items-center gap-1 flex-1">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
            className="flex-1 border border-blue-300 rounded px-1.5 py-0.5 text-sm outline-none"
            autoFocus onClick={(e) => e.stopPropagation()} />
          <button onClick={handleRename} className="text-green-500 p-0.5" title="确认"><Check size={14} /></button>
          <button onClick={() => setRenaming(false)} className="text-gray-400 p-0.5" title="取消"><X size={14} /></button>
        </div>
      ) : (
        <>
          <span className="text-sm text-gray-700 truncate flex-1">{node.name}</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs text-gray-400 w-8 text-right">{progress}%</span>
          <button
            onClick={(e) => { e.stopPropagation(); setRenaming(true); setNewName(node.name); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded text-gray-400"
            title="重命名">
            <Edit3 size={12} />
          </button>
        </>
      )}
    </div>
  );
}
