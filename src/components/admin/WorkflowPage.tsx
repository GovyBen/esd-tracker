import { useState } from "react";
import { getAllWorkflows, createWorkflow } from "../../db/queries/technology";
import { generateId } from "../../lib/uuid";
import { Plus } from "lucide-react";

const defaultStates = [
  { id: "pending", name: "未开始", color: "#9ca3af" },
  { id: "in_progress", name: "进行中", color: "#3b82f6" },
  { id: "completed", name: "已完成", color: "#22c55e" },
  { id: "problem", name: "问题", color: "#ef4444" },
];

export function WorkflowPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newName, setNewName] = useState("");
  const workflows = getAllWorkflows();
  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkflow({
      name: newName.trim(),
      states: defaultStates,
      transitions: [
        { from: "pending", to: "in_progress" },
        { from: "in_progress", to: "completed" },
        { from: "in_progress", to: "problem" },
        { from: "problem", to: "in_progress" },
      ],
      derivationRules: [
        { priority: 1, eventStatuses: ["blocked"], portStatus: "problem" },
        { priority: 2, eventStatuses: ["in_progress"], portStatus: "in_progress" },
        { priority: 3, eventStatuses: ["completed"], portStatus: "completed" },
      ],
    });
    setNewName("");
    refresh();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">状态工作流管理</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="工作流名称..."
          className="flex-1 max-w-xs border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-400"
        />
        <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          <Plus size={14} /> 新建工作流
        </button>
      </div>

      <div className="space-y-3">
        {workflows.map((wf) => (
          <div key={wf.id} className="border border-gray-200 rounded-lg bg-white p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{wf.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(wf.states || []).map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: s.color + "20", color: s.color }}
                >
                  {s.name}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              {(wf.transitions || []).length} 条流转 | {(wf.derivationRules || []).length} 条推导规则
            </div>
          </div>
        ))}
        {workflows.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">暂无工作流</div>
        )}
      </div>
    </div>
  );
}
