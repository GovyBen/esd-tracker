import { useState } from "react";
import type { MergeConflict } from "../../lib/diffEngine";

interface ConflictResolverProps {
  conflicts: MergeConflict[];
  onResolve: (resolved: MergeConflict[]) => void;
  onCancel: () => void;
}

export function ConflictResolver({ conflicts, onResolve, onCancel }: ConflictResolverProps) {
  const [items, setItems] = useState(conflicts);

  const resolveItem = (index: number, resolution: "local" | "remote") => {
    const next = [...items];
    next[index] = { ...next[index], resolved: true, resolution };
    setItems(next);
  };

  const resolvedCount = items.filter((c) => c.resolved).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">冲突解决</h3>
      <p className="text-sm text-gray-500 mb-4">
        已解决 {resolvedCount}/{items.length} 个冲突
      </p>

      <div className="space-y-3 max-h-96 overflow-auto mb-4">
        {items.map((conflict, i) => (
          <div key={i} className={`border rounded p-3 ${conflict.resolved ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{conflict.entityType} / {conflict.field}</span>
              {conflict.resolved && (
                <span className="text-xs text-green-600">
                  已采用：{conflict.resolution === "local" ? "本地" : "导入"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white border border-gray-200 rounded p-2">
                <div className="text-xs text-gray-400 mb-0.5">本地</div>
                <div className="truncate">{String(conflict.localValue ?? "(空)")}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded p-2">
                <div className="text-xs text-gray-400 mb-0.5">导入</div>
                <div className="truncate">{String(conflict.remoteValue ?? "(空)")}</div>
              </div>
            </div>
            {!conflict.resolved && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => resolveItem(i, "local")} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  保留本地
                </button>
                <button onClick={() => resolveItem(i, "remote")} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                  采用导入
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
          取消
        </button>
        <button
          onClick={() => onResolve(items)}
          disabled={resolvedCount < items.length}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          完成合并
        </button>
      </div>
    </div>
  );
}
