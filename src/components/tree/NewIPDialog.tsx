import { useState } from "react";
import { createIP, createPort, getAllChipTags } from "../../db/queries";
import { getAllTechnologies } from "../../db/queries/technology";
import { getDB } from "../../db/persistence";
import { useTreeStore } from "../../stores/treeStore";
import { X, Plus } from "lucide-react";

interface NewIPDialogProps { onClose: () => void; }

export function NewIPDialog({ onClose }: NewIPDialogProps) {
  const [name, setName] = useState("");
  const [techId, setTechId] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [ddlDate, setDdlDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ports, setPorts] = useState<{ name: string; cdmStandardId: string; hbmStandardId: string }[]>([
    { name: "", cdmStandardId: "", hbmStandardId: "" },
  ]);
  const incrementVersion = useTreeStore((s) => s.incrementVersion);

  const technologies = getAllTechnologies();
  const chipTags = getAllChipTags();
  const db = getDB();
  const allStandards = db.testStandards;
  const cdmStandards = allStandards.filter((s) => s.type === "CDM");
  const hbmStandards = allStandards.filter((s) => s.type === "HBM");

  const addPort = () => setPorts([...ports, { name: "", cdmStandardId: "", hbmStandardId: "" }]);
  const removePort = (i: number) => { if (ports.length > 1) setPorts(ports.filter((_, j) => j !== i)); };
  const setPortField = (i: number, field: "name" | "cdmStandardId" | "hbmStandardId", val: string) => {
    const next = [...ports]; next[i] = { ...next[i], [field]: val }; setPorts(next);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const ip = createIP({
      name: name.trim(), technologyId: techId || null,
      startDate: startDate || null, ddlDate: ddlDate || null,
      notes: notes.trim() || null, chipTagIds: selectedTags,
    });
    ports.filter((p) => p.name.trim()).forEach((p) => {
      createPort(ip.id, { name: p.name.trim(), cdmStandardId: p.cdmStandardId || null, hbmStandardId: p.hbmStandardId || null });
    });
    incrementVersion(); onClose();
  };

  const selectStyle = "border border-gray-200 rounded px-2 py-1 text-xs bg-white";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">新建 IP 模块</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-xs text-gray-500 block mb-1">IP 名称 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="如 USB3_PHY" autoFocus />
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">工艺</label>
            <select value={techId} onChange={(e) => setTechId(e.target.value)} className={`w-full ${selectStyle} py-1.5`}>
              <option value="">选择工艺...</option>
              {technologies.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          {chipTags.length > 0 && (
            <div><label className="text-xs text-gray-500 block mb-1">芯片标签</label>
              <div className="flex flex-wrap gap-2">
                {chipTags.map((tag) => (
                  <button key={tag.id} onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${selectedTags.includes(tag.id) ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 block mb-1">开始日期</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">DDL 日期</label><input type="date" value={ddlDate} onChange={(e) => setDdlDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border rounded px-3 py-2 text-sm resize-none" /></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium">端口列表（含测试标准）</label>
              <button onClick={addPort} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"><Plus size={12} /> 添加端口</button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_140px_140px_24px] gap-1.5 text-[10px] text-gray-400 px-1">
                <span>端口名称</span><span>CDM 标准</span><span>HBM 标准</span><span />
              </div>
              {ports.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_140px_24px] gap-1.5 items-center">
                  <input value={p.name} onChange={(e) => setPortField(i, "name", e.target.value)}
                    placeholder={`PORT_${String.fromCharCode(65 + i)}`} className="border rounded px-2 py-1 text-xs" />
                  <select value={p.cdmStandardId} onChange={(e) => setPortField(i, "cdmStandardId", e.target.value)} className={selectStyle}>
                    <option value="">无</option>
                    {cdmStandards.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                  <select value={p.hbmStandardId} onChange={(e) => setPortField(i, "hbmStandardId", e.target.value)} className={selectStyle}>
                    <option value="">无</option>
                    {hbmStandards.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                  {ports.length > 1 && <button onClick={() => removePort(i)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button>
          <button onClick={handleCreate} disabled={!name.trim()} className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-40">创建 IP</button>
        </div>
      </div>
    </div>
  );
}
