import { useState } from "react";
import { getAllTechnologies, createTechnology, deleteTechnology } from "../../db/queries/technology";
import { getDB, saveDB } from "../../db/persistence";
import { Plus, Trash2, ChevronRight, ChevronDown, Layers } from "lucide-react";

export function TechnologyPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTechName, setNewTechName] = useState("");
  const [showNewTech, setShowNewTech] = useState(false);
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const technologies = getAllTechnologies();
  const refresh = () => setRefreshKey((k) => k + 1);

  const handleAddTech = () => {
    if (!newTechName.trim()) return;
    createTechnology({ name: newTechName.trim() });
    setNewTechName(""); setShowNewTech(false); refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">工艺管理</h2>
          <p className="text-xs text-gray-500 mt-1">管理芯片制造工艺名称及 PDK 版本</p>
        </div>
        <button onClick={() => setShowNewTech(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 新建工艺</button>
      </div>

      {showNewTech && (
        <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <input value={newTechName} onChange={(e) => setNewTechName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
            placeholder="工艺名称 如 N5" className="border rounded px-3 py-2 text-sm mr-2" autoFocus />
          <button onClick={handleAddTech} className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">创建</button>
          <button onClick={() => setShowNewTech(false)} className="ml-2 px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button>
        </div>
      )}

      <div className="space-y-2">
        {technologies.map((tech) => (
          <div key={tech.id} className="border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedTech(expandedTech === tech.id ? null : tech.id)}>
              <div className="flex items-center gap-2">
                {expandedTech === tech.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <span className="text-sm font-medium text-gray-700">{tech.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteTechnology(tech.id); refresh(); }}
                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
            {expandedTech === tech.id && (
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 mb-2"><Layers size={14} className="text-gray-400" /><span className="text-xs font-medium text-gray-500">PDK 版本 / 金属化选项</span></div>
                <PDKSection techId={tech.id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {technologies.length === 0 && !showNewTech && (
        <div className="text-center py-12 text-gray-400 text-sm">暂无工艺，点击"新建工艺"创建</div>
      )}
    </div>
  );
}

function PDKSection({ techId }: { techId: string }) { const db = getDB(); const tech = db.technologies.find((t: any) => t.id === techId);
  
  const [items, setItems] = useState<string[]>(tech?.pdkVersions || []);
  const [newItem, setNewItem] = useState("");
  const save = (u: string[]) => { setItems(u); const idx = db.technologies.findIndex((t: any) => t.id === techId); if (idx >= 0) { db.technologies[idx] = { ...db.technologies[idx], pdkVersions: u }; saveDB(); } };
  return (
    <div className="space-y-1 ml-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          <span>{item}</span><button onClick={() => save(items.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex gap-1">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { save([...items, newItem.trim()]); setNewItem(""); } }}
          placeholder="如 M1-M5, 2P4M" className="flex-1 max-w-[220px] border rounded px-2 py-0.5 text-xs" />
        <button onClick={() => { if (newItem.trim()) { save([...items, newItem.trim()]); setNewItem(""); } }} className="text-xs text-blue-500"><Plus size={12} /></button>
      </div>
    </div>
  );
}
