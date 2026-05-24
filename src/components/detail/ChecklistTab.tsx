import { useState, useEffect } from "react";
import { getChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } from "../../db/queries/checklist";
import { getAllChecklistTemplates } from "../../db/queries/technology";
import { generateId } from "../../lib/uuid";
import { Plus, Trash2, Check, Link2, Bookmark, X } from "lucide-react";
import type { ChecklistItemType } from "../../types";

interface ChecklistTabProps { portId: string; }

export function ChecklistTab({ portId }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItemType[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    const cl = getChecklist(portId);
    setItems(cl.items || []);
    setTemplateId(cl.templateId);
  }, [portId]);

  const refresh = () => {
    const cl = getChecklist(portId);
    setItems(cl.items || []);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addChecklistItem(portId, { id: generateId(), label: newLabel.trim(), linkedField: null, applicable: true, defaultChecked: false, order: items.length });
    setNewLabel(""); refresh();
  };

  const handleToggle = (itemId: string, current: boolean) => {
    updateChecklistItem(portId, itemId, { completed: !current }); refresh();
  };

  const handleDelete = (itemId: string) => {
    deleteChecklistItem(portId, itemId); refresh();
  };

  const handleApplyTemplate = (tId: string) => {
    const tmpl = getAllChecklistTemplates().find((t) => t.id === tId);
    if (!tmpl || !tmpl.items) return;
    // Remove existing items, add template items
    const existing = getChecklist(portId).items || [];
    existing.forEach((i: ChecklistItemType) => deleteChecklistItem(portId, i.id));
    tmpl.items.forEach((item: ChecklistItemType) => {
      addChecklistItem(portId, { ...item, id: generateId(), completed: false });
    });
    setShowTemplates(false); refresh();
  };

  const completed = items.filter((i) => i.completed).length;
  const templates = getAllChecklistTemplates();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">检查清单</span>
          <span className="text-xs text-gray-400 ml-2">{completed}/{items.length} 完成</span>
        </div>
        {templates.length > 0 && (
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-600">
            <Bookmark size={12} /> 应用模板
          </button>
        )}
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="bg-purple-50 rounded-md p-2 space-y-1 border border-purple-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-purple-700">选择模板</span>
            <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
          </div>
          {templates.map((tmpl) => (
            <button key={tmpl.id} onClick={() => handleApplyTemplate(tmpl.id)}
              className="w-full text-left px-2 py-1.5 text-xs text-purple-700 hover:bg-purple-100 rounded flex items-center justify-between">
              <span>{tmpl.name}</span>
              <span className="text-gray-400">{(tmpl.items || []).length} 项</span>
            </button>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.round((completed / items.length) * 100)}%` }} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-md">
          暂无检查项，可从上方应用模板或手动添加
        </div>
      ) : (
        <div className="space-y-1">
          {items.sort((a, b) => a.order - b.order).map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md group">
              <button onClick={() => handleToggle(item.id, !!item.completed)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${item.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-blue-400"}`}>
                {item.completed && <Check size={10} className="text-white" />}
              </button>
              <span className={`flex-1 text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>{item.label}</span>
              {item.linkedField && <Link2 size={12} className="text-blue-400" />}
              <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="输入检查项..." className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
        <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 添加</button>
      </div>
    </div>
  );
}
