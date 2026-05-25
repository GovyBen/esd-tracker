import { useState, useEffect } from "react";
import { getEmxData, saveEmxData, getAllDiodes, addDiode, type DiodeEntry, type P2PEntry, type ClampEntry } from "../../db/queries/emx";
import { getIPById } from "../../db/queries/ip";
import { generateId } from "../../lib/uuid";
import { getAllTechnologies } from "../../db/queries/technology";
import { Save, Plus, Trash2, Zap, Radio, Shield, Check, X } from "lucide-react";

const P2P_PRESETS_KEY = "esd-p2p-presets";
const CLAMP_PRESETS_KEY = "esd-clamp-presets";
const DIODE_MODELS_KEY = "esd-diode-models";
const FILTER_SAME_TECH_KEY = "esd-filter-same-tech";

function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}

interface EmxTabProps { portId: string; }

export function EmxTab({ portId }: EmxTabProps) {
  const data = getEmxData(portId);
  const [diodes, setDiodes] = useState(data.appliedDiodes);
  const [p2pItems, setP2pItems] = useState<P2PEntry[]>(data.p2pItems);
  const [clampItems, setClampItems] = useState<ClampEntry[]>(data.clampItems);
  const [notes, setNotes] = useState(data.notes);
  const [saved, setSaved] = useState(false);

  useEffect(() => { const d = getEmxData(portId); setDiodes(d.appliedDiodes); setP2pItems(d.p2pItems); setClampItems(d.clampItems); setNotes(d.notes); }, [portId]);
  // Auto-save on any change
  useEffect(() => { saveEmxData(portId, { appliedDiodes: diodes, p2pItems, clampItems, notes }); }, [diodes, p2pItems, clampItems, notes, portId]);

  const handleSave = () => {
    saveEmxData(portId, { appliedDiodes: diodes, p2pItems, clampItems, notes });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><Zap size={16} className="text-amber-500" /><span className="text-sm font-medium text-gray-700">二极管</span></div>
        <DiodeSection portId={portId} diodes={diodes} onChange={setDiodes} />
      </div>
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><Radio size={16} className="text-indigo-500" /><span className="text-sm font-medium text-gray-700">P2P 带入</span></div>
        <P2PSection items={p2pItems} onChange={setP2pItems} />
      </div>
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><Shield size={16} className="text-teal-500" /><span className="text-sm font-medium text-gray-700">CLAMP</span></div>
        <ClampSection items={clampItems} onChange={setClampItems} />
      </div>
      <div><span className="text-xs text-gray-500 block mb-1">备注</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm min-h-[50px] resize-none" rows={2} />
      </div>
      <button onClick={handleSave} className={`w-full flex items-center justify-center gap-2 py-2 text-sm rounded font-medium transition-colors ${saved ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
        <Save size={14} /> {saved ? "已保存" : "保存"}
      </button>
    </div>
  );
}

// ---- Diode Section ----
function DiodeSection({ portId, diodes, onChange }: { portId: string; diodes: { diodeId: string; modelNumber: string; modelType?: string }[]; onChange: (d: typeof diodes) => void }) {
  const allDiodes = getAllDiodes();
  const filterSameTech = loadJSON(FILTER_SAME_TECH_KEY, false);
  const technologies = getAllTechnologies();
  const diodeModels = loadJSON<{id:string;name:string}[]>(DIODE_MODELS_KEY, [{id:"m1",name:"Overshoot Model"},{id:"m2",name:"VA Model"},{id:"m3",name:"Fab Spectre Model"}]);
  const [selDiodeId, setSelDiodeId] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [selModelType, setSelModelType] = useState("");
  const [customTech, setCustomTech] = useState("N5");
  const [showNewDiode, setShowNewDiode] = useState(false);

  // Get IP technology
  const port = getIPById(portId); // Actually we need a different approach - just use N5 as default
  const techName = "N5";

  let filteredDiodes = allDiodes;
  if (filterSameTech) {
    filteredDiodes = allDiodes.filter((d) => d.technologyName === techName);
  }

  const primaryDiodes = filteredDiodes.filter((d) => d.level === "primary");
  const secondaryDiodes = filteredDiodes.filter((d) => d.level === "secondary");

  const addDiodeEntry = () => {
    if (!selDiodeId) return;
    const diode = allDiodes.find((d) => d.id === selDiodeId);
    if (!diode) return;
    const model = showCustom && customModel.trim() ? customModel.trim() : diode.modelNumber;
    onChange([...diodes, { diodeId: diode.id, modelNumber: model, modelType: selModelType || undefined }]);
    setSelDiodeId(""); setCustomModel(""); setShowCustom(false); setSelModelType("");
  };

  const handleAddCustomDiode = () => {
    const name = window.prompt("二极管名称:") || "";
    if (!name) return;
    const model = window.prompt("型号:") || name;
    const level = window.confirm("是一级二极管吗？（确定=一级，取消=二级）") ? "primary" : "secondary";
    addDiode({ level, name, modelNumber: model, technologyName: customTech });
    setShowNewDiode(false);
  };

  return (
    <div className="space-y-2">
      {diodes.map((entry, i) => {
        const diode = allDiodes.find((d) => d.id === entry.diodeId);
        return (
          <div key={i} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
            <span>
              <span className="text-gray-400">{diode?.level === "primary" ? "一级" : "二级"}: </span>
              <span className="text-gray-700">{diode?.name}</span>
              <span className="text-gray-400 ml-1">({entry.modelNumber})</span>
              {entry.modelType && <span className="text-blue-500 ml-1">[{entry.modelType}]</span>}
            </span>
            <button onClick={() => onChange(diodes.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
          </div>
        );
      })}
      <div className="space-y-1">
        <select value={selDiodeId} onChange={(e) => setSelDiodeId(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs">
          <option value="">选择二极管...</option>
          <optgroup label="一级">{primaryDiodes.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.modelNumber}) [{d.technologyName}]</option>))}</optgroup>
          <optgroup label="二级">{secondaryDiodes.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.modelNumber}) [{d.technologyName}]</option>))}</optgroup>
        </select>
        <select value={selModelType} onChange={(e) => setSelModelType(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs">
          <option value="">模型类型（可选）</option>
          {diodeModels.map((m) => (<option key={m.id} value={m.name}>{m.name}</option>))}
        </select>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-500"><input type="checkbox" checked={showCustom} onChange={(e) => setShowCustom(e.target.checked)} /> 自定义型号</label>
          {showCustom && <input value={customModel} onChange={(e) => setCustomModel(e.target.value)} placeholder="如 DUALDIODE-HIGHSPEED-X2" className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs" />}
        </div>
        <div className="flex gap-2">
          <button onClick={addDiodeEntry} disabled={!selDiodeId} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-30"><Plus size={12} /> 添加</button>
          <button onClick={() => setShowNewDiode(!showNewDiode)} className="text-xs text-gray-500 hover:text-gray-700">+ 自定义二极管</button>
        </div>
        {showNewDiode && (
          <div className="flex gap-1 items-center bg-gray-50 rounded p-2">
            <input value={customTech} onChange={(e) => setCustomTech(e.target.value)} placeholder="工艺" className="w-16 border rounded px-1 py-0.5 text-xs" />
            <button onClick={handleAddCustomDiode} className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">添加</button>
            <button onClick={() => setShowNewDiode(false)} className="text-xs text-gray-400">取消</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- P2P Section ----
function P2PSection({ items, onChange }: { items: P2PEntry[]; onChange: (d: P2PEntry[]) => void }) {
  const presets = loadJSON<{id:string;name:string;value:string}[]>(P2P_PRESETS_KEY, [{id:"p1",name:"R_1stDIO_vss",value:"0.1 ohm"},{id:"p2",name:"R_1stDIO_vdd",value:"0.2 ohm"},{id:"p3",name:"R_2ndDIO_vss",value:"0.5 ohm"}]);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  const addItem = () => { if (newName.trim()) { onChange([...items, { id: generateId(), name: newName.trim(), value: newValue.trim() || "-" }]); setNewName(""); setNewValue(""); } };
  const addPreset = (p: typeof presets[0]) => { onChange([...items, { id: generateId(), name: p.name, value: p.value }]); };
  const startEdit = (item: P2PEntry) => { setEditId(item.id); setEditName(item.name); setEditValue(item.value); };
  const saveEdit = () => { onChange(items.map((i) => i.id === editId ? { ...i, name: editName, value: editValue } : i)); setEditId(null); };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
          {editId === item.id ? (
            <div className="flex items-center gap-1 flex-1">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="border rounded px-1 py-0.5 text-xs w-28 font-mono" autoFocus />
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="border rounded px-1 py-0.5 text-xs w-16" />
              <button onClick={saveEdit} className="text-green-500"><Check size={12} /></button>
              <button onClick={() => setEditId(null)} className="text-gray-400"><X size={12} /></button>
            </div>
          ) : (
            <span className="cursor-pointer hover:text-blue-600" onClick={() => startEdit(item)}><span className="text-gray-700 font-mono">{item.name}</span><span className="text-gray-400 ml-2">{item.value}</span></span>
          )}
          <button onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="text-gray-400 hover:text-red-500 shrink-0"><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex gap-1">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="名称 如 R_1stDIO_vss" className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs" />
        <input value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="值" className="w-20 border border-gray-200 rounded px-2 py-0.5 text-xs" />
        <button onClick={addItem} className="text-xs text-blue-500 hover:text-blue-600 px-1"><Plus size={12} /></button>
      </div>
      {presets.length > 0 && (
        <div>
          <button onClick={() => setShowPresets(!showPresets)} className="text-xs text-gray-400 hover:text-blue-500">从预设添加...</button>
          {showPresets && (
            <div className="bg-gray-50 rounded p-1 space-y-0.5 mt-1">
              {presets.map((p) => (
                <button key={p.id} onClick={() => addPreset(p)} className="w-full text-left text-xs px-2 py-0.5 hover:bg-blue-50 rounded text-gray-600">
                  {p.name} = {p.value}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- CLAMP Section ----
function ClampSection({ items, onChange }: { items: ClampEntry[]; onChange: (d: ClampEntry[]) => void }) {
  const presets = loadJSON<{id:string;modelNumber:string;technologyName:string}[]>(CLAMP_PRESETS_KEY, [{id:"c1",modelNumber:"ESD_PCLAMP_0V8",technologyName:"N5"},{id:"c2",modelNumber:"ESD_PCLAMP_1V2",technologyName:"N5"},{id:"c3",modelNumber:"ESD_NCLAMP_1V8",technologyName:"N3"}]);
  const filterSameTech = loadJSON(FILTER_SAME_TECH_KEY, false);
  const [newModel, setNewModel] = useState("");
  const [hasParasitic, setHasParasitic] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');

  let filteredPresets = presets;
  if (filterSameTech) filteredPresets = presets.filter((p) => p.technologyName === "N5");

  const addItem = () => { if (newModel.trim()) { onChange([...items, { id: generateId(), modelNumber: newModel.trim(), hasParasitics: hasParasitic }]); setNewModel(""); setHasParasitic(false); } };
  const addPreset = (p: typeof presets[0]) => { onChange([...items, { id: generateId(), modelNumber: p.modelNumber, hasParasitics: false }]); };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-mono">{item.modelNumber}</span>
            <label className="flex items-center gap-1 text-gray-500"><input type="checkbox" checked={item.hasParasitics} onChange={() => onChange(items.map((i) => i.id === item.id ? { ...i, hasParasitics: !i.hasParasitics } : i))} className="w-3 h-3" /> 带入寄生</label>
          </div>
          <button onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex gap-1 items-center">
        <input value={newModel} onChange={(e) => setNewModel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="型号" className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs" />
        <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap"><input type="checkbox" checked={hasParasitic} onChange={(e) => setHasParasitic(e.target.checked)} className="w-3 h-3" /> 带入寄生</label>
        <button onClick={addItem} className="text-xs text-blue-500 hover:text-blue-600 px-1"><Plus size={12} /></button>
      </div>
      {filteredPresets.length > 0 && (
        <div>
          <button onClick={() => setShowPresets(!showPresets)} className="text-xs text-gray-400 hover:text-blue-500">从预设添加...</button>
          {showPresets && (
            <div className="bg-gray-50 rounded p-1 space-y-0.5 mt-1">
              {filteredPresets.map((p) => (
                <button key={p.id} onClick={() => addPreset(p)} className="w-full text-left text-xs px-2 py-0.5 hover:bg-blue-50 rounded text-gray-600">
                  {p.modelNumber} [{p.technologyName}]
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
