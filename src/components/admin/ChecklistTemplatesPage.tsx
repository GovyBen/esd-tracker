import { useState } from "react";
import { getAllChecklistTemplates, createChecklistTemplate } from "../../db/queries/technology";
import { getDB, saveDB } from "../../db/persistence";
import { generateId } from "../../lib/uuid";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import type { ChecklistItemType } from "../../types";

export function ChecklistTemplatesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newName, setNewName] = useState("");
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemField, setNewItemField] = useState("");
  const [pendingItems, setPendingItems] = useState<ChecklistItemType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const refresh = () => setRefreshKey((k) => k + 1);
  const templates = getAllChecklistTemplates();

  const addPendingItem = () => {
    if (!newItemLabel.trim()) return;
    setPendingItems([...pendingItems, {
      id: generateId(), label: newItemLabel.trim(),
      linkedField: newItemField.trim() || null,
      applicable: true, defaultChecked: false, order: pendingItems.length,
    }]);
    setNewItemLabel(""); setNewItemField("");
  };

  const removePendingItem = (id: string) => {
    setPendingItems(pendingItems.filter((i) => i.id !== id));
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createChecklistTemplate({
      name: newName.trim(),
      items: pendingItems.length > 0 ? pendingItems : [
        { id: generateId(), label: "示例检查项 1", linkedField: null, applicable: true, defaultChecked: false, order: 0 },
      ],
    });
    setNewName(""); setPendingItems([]); refresh();
  };

  const handleDelete = (id: string) => {
    const db = getDB();
    db.checklistTemplates = db.checklistTemplates.filter((t) => t.id !== id);
    saveDB(); refresh();
  };

  const startEdit = (id: string, currentLabel: string) => {
    setEditingId(id); setEditLabel(currentLabel);
  };

  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    const db = getDB();
    const idx = db.checklistTemplates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      db.checklistTemplates[idx] = { ...db.checklistTemplates[idx], name: editLabel.trim(), updatedAt: new Date().toISOString() };
      saveDB(); refresh();
    }
    setEditingId(null);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Checklist 模板管理</h2>

      {/* Create form */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4 space-y-3">
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="模板名称..." autoFocus
            className="flex-1 max-w-xs border rounded px-3 py-2 text-sm outline-none focus:border-blue-400" />
          <button onClick={handleCreate} disabled={!newName.trim()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-40">
            <Plus size={14} /> 创建模板
          </button>
        </div>

        {/* Add items before creating */}
        <div>
          <div className="text-xs text-gray-500 mb-1">检查项列表（可选，创建后可继续编辑）</div>
          <div className="space-y-1 mb-2">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border">
                <span className="w-3 h-3 rounded border border-gray-300" />
                <span className="flex-1 text-gray-700">{item.label}</span>
                {item.linkedField && <span className="text-blue-400 bg-blue-50 px-1 rounded text-[10px]">{item.linkedField}</span>}
                <button onClick={() => removePendingItem(item.id)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPendingItem()}
              placeholder="检查项名称" className="flex-1 max-w-[180px] border rounded px-2 py-1 text-xs" />
            <input value={newItemField} onChange={(e) => setNewItemField(e.target.value)}
              placeholder="关联字段 (可选)" className="w-28 border rounded px-2 py-1 text-xs" />
            <button onClick={addPendingItem} className="text-xs text-blue-500 hover:text-blue-600 px-1"><Plus size={12} /></button>
          </div>
        </div>
      </div>

      {/* Template list */}
      <div className="space-y-2">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              {editingId === tmpl.id ? (
                <div className="flex items-center gap-1">
                  <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(tmpl.id); if (e.key === "Escape") setEditingId(null); }}
                    className="border rounded px-2 py-1 text-sm font-medium" autoFocus />
                  <button onClick={() => saveEdit(tmpl.id)} className="text-green-500"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">{tmpl.name}</h3>
                  <button onClick={() => startEdit(tmpl.id, tmpl.name)} className="text-gray-400 hover:text-blue-500"><Edit3 size={12} /></button>
                </div>
              )}
              <button onClick={() => handleDelete(tmpl.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
            <div className="space-y-1">
              {(tmpl.items && tmpl.items.length > 0) ? tmpl.items.map((item: ChecklistItemType) => (
                <div key={item.id} className="flex items-center gap-2 text-xs text-gray-500 pl-2 border-l-2 border-gray-100">
                  <span className="w-3 h-3 rounded border border-gray-300" />
                  <span>{item.label}</span>
                  {item.linkedField && <span className="text-blue-400 bg-blue-50 px-1 rounded">{item.linkedField}</span>}
                </div>
              )) : <div className="text-xs text-gray-400 pl-2">无检查项</div>}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">暂无模板，请在上方创建</div>
        )}
      </div>
    </div>
  );
}
