import { useState } from "react";
import { getDB, saveDB } from "../../db/persistence";
import { generateId, nowISO } from "../../lib/uuid";
import { getAllTechnologies } from "../../db/queries/technology";
import { Plus, Trash2, Tag } from "lucide-react";

export function ExcitationPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const refresh = () => setRefreshKey((k) => k + 1);
  const db = getDB();
  const standards = db.testStandards;
  const technologies = getAllTechnologies();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">测试标准管理</h2>
          <p className="text-xs text-gray-500 mt-1">独立的测试标准，设置 CDM/HBM 类型标签后可在端口创建时筛选。</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 新建标准</button>
      </div>

      <div className="space-y-2">
        {standards.map((std) => {
          const tech = technologies.find((t) => t.id === std.technologyId);
          return (
            <div key={std.id} className="border border-gray-200 rounded-lg bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{std.name}</span>
                  {std.type && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${std.type === "CDM" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {std.type}
                    </span>
                  )}
                  {tech && <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{tech.name}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    const types = ["CDM", "HBM", ""];
                    const current = std.type || "";
                    const next = types[(types.indexOf(current) + 1) % types.length];
                    const idx = db.testStandards.findIndex((s) => s.id === std.id);
                    if (idx >= 0) { db.testStandards[idx] = { ...db.testStandards[idx], type: next || null }; saveDB(); refresh(); }
                  }} className={`text-xs px-2 py-0.5 rounded border ${std.type === "CDM" ? "bg-amber-50 text-amber-700 border-amber-200" : std.type === "HBM" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {std.type || "无标签"}
                  </button>
                  <button onClick={() => {
                    const newKey = prompt("参数名:") || ""; if (!newKey) return;
                    const newVal = prompt("值:") || "";
                    const idx = db.testStandards.findIndex((s) => s.id === std.id);
                    if (idx >= 0) { const params = { ...(db.testStandards[idx].params || {}) }; params[newKey] = newVal; db.testStandards[idx] = { ...db.testStandards[idx], params }; saveDB(); refresh(); }
                  }} className="text-xs text-blue-500 hover:text-blue-600">+ 参数</button>
                  <button onClick={() => {
                    const idx = db.testStandards.findIndex((s) => s.id === std.id);
                    if (idx >= 0) { const keys = Object.keys(db.testStandards[idx].params || {}); if (keys.length === 0) return; const key = prompt("删除参数:\n" + keys.join(", ")) || ""; if (key && db.testStandards[idx].params?.[key] !== undefined) { const params = { ...db.testStandards[idx].params }; delete params[key]; db.testStandards[idx] = { ...db.testStandards[idx], params }; saveDB(); refresh(); } }
                  }} className="text-xs text-gray-400 hover:text-red-500">- 参数</button>
                  <button onClick={() => {
                    const techName = prompt("关联工艺（留空取消）:", tech?.name || "") || "";
                    const idx = db.testStandards.findIndex((s) => s.id === std.id); if (idx >= 0) { const t = technologies.find((t) => t.name === techName); db.testStandards[idx] = { ...db.testStandards[idx], technologyId: t?.id || null }; saveDB(); refresh(); }
                  }} className="text-xs text-gray-400 hover:text-purple-500"><Tag size={12} /></button>
                  <button onClick={() => { db.testStandards = db.testStandards.filter((s) => s.id !== std.id); saveDB(); refresh(); }} className="text-xs text-gray-400 hover:text-red-500 ml-1"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {(std.params && Object.keys(std.params).length > 0) ? (
                  Object.entries(std.params).map(([k, v]) => (<span key={k} className="bg-gray-100 border border-gray-200 rounded px-2 py-0.5"><span className="text-gray-600 font-mono">{k}</span><span className="text-gray-400 mx-0.5">=</span><span className="text-gray-700">{v}</span></span>))
                ) : (<span className="text-gray-400">暂无电气参数</span>)}
              </div>
            </div>
          );
        })}
      </div>

      {standards.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">暂无测试标准</div>}
      {showNew && <NewStandardForm onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); refresh(); }} />}
    </div>
  );
}

function NewStandardForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [params, setParams] = useState<[string, string][]>([["", ""]]);
  const db = getDB();
  const setParam = (i: number, field: 0 | 1, val: string) => { const next = [...params]; next[i] = [...next[i]] as [string, string]; next[i][field] = val; setParams(next); };
  const handleCreate = () => {
    if (!name.trim()) return;
    const p: Record<string, string> = {}; params.forEach(([k, v]) => { if (k.trim()) p[k.trim()] = v.trim(); });
    db.testStandards.push({ id: generateId(), technologyId: null, name: name.trim(), type: type || null, params: p, createdAt: nowISO(), updatedAt: nowISO() });
    saveDB(); onCreated();
  };
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-3">新建测试标准</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="标准名 如 CDM75V1A" className="border rounded px-3 py-2 text-sm" autoFocus />
            <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white"><option value="">无标签</option><option value="CDM">CDM</option><option value="HBM">HBM</option></select>
          </div>
          <div className="text-xs text-gray-600 font-medium">电气参数</div>
          {params.map(([k, v], i) => (<div key={i} className="flex gap-1 items-center"><input value={k} onChange={(e) => setParam(i, 0, e.target.value)} placeholder="参数名" className="w-24 border rounded px-1.5 py-1 text-xs" /><span className="text-gray-400">=</span><input value={v} onChange={(e) => setParam(i, 1, e.target.value)} placeholder="值" className="flex-1 border rounded px-1.5 py-1 text-xs" />{params.length > 1 && <button onClick={() => setParams(params.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">x</button>}</div>))}
          <button onClick={() => setParams([...params, ["", ""]])} className="text-xs text-blue-500">+ 添加参数行</button>
        </div>
        <div className="flex justify-end gap-2 mt-4"><button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button><button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">创建</button></div>
      </div>
    </div>
  );
}
