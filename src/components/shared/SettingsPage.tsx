import { useState, useEffect } from "react";
import { useDBStore } from "../../stores/dbStore";
import { getMilestonePresets, saveMilestonePresets, type MilestonePreset } from "../../lib/milestones";
import { resetDB, getDB } from "../../db/persistence";
import { generateId } from "../../lib/uuid";
import { User, Bookmark, Plus, Trash2, Save, RefreshCw, Database, Zap, Radio, Shield, Filter } from "lucide-react";

// ---- Settings keys ----
const P2P_PRESETS_KEY = "esd-p2p-presets";
const CLAMP_PRESETS_KEY = "esd-clamp-presets";
const DIODE_MODELS_KEY = "esd-diode-models";
const FILTER_SAME_TECH_KEY = "esd-filter-same-tech";

interface P2PPreset { id: string; name: string; value: string; }
interface ClampPreset { id: string; modelNumber: string; technologyName: string; }
interface DiodeModelType { id: string; name: string; }

function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, data: unknown) { localStorage.setItem(key, JSON.stringify(data)); }

export function SettingsPage() {
  const { currentUser, setCurrentUser } = useDBStore();
  const [name, setName] = useState(currentUser);
  const [saved, setSaved] = useState(false);
  const [presets, setPresets] = useState<MilestonePreset[]>(getMilestonePresets());
  const [newPresetName, setNewPresetName] = useState("");
  const [dbInfo, setDbInfo] = useState({ ips: 0, ports: 0 });
  const [resetConfirm, setResetConfirm] = useState(false);

  // P2P presets
  const [p2pPresets, setP2pPresets] = useState<P2PPreset[]>(() => loadJSON(P2P_PRESETS_KEY, [
    { id: "p1", name: "R_1stDIO_vss", value: "0.1 ohm" },
    { id: "p2", name: "R_1stDIO_vdd", value: "0.2 ohm" },
    { id: "p3", name: "R_2ndDIO_vss", value: "0.5 ohm" },
  ]));
  const [newP2PName, setNewP2PName] = useState("");
  const [newP2PValue, setNewP2PValue] = useState("");

  // CLAMP presets
  const [clampPresets, setClampPresets] = useState<ClampPreset[]>(() => loadJSON(CLAMP_PRESETS_KEY, [
    { id: "c1", modelNumber: "ESD_PCLAMP_0V8", technologyName: "N5" },
    { id: "c2", modelNumber: "ESD_PCLAMP_1V2", technologyName: "N5" },
    { id: "c3", modelNumber: "ESD_NCLAMP_1V8", technologyName: "N3" },
  ]));
  const [newClampModel, setNewClampModel] = useState("");
  const [newClampTech, setNewClampTech] = useState("N5");

  // Diode model types
  const [diodeModels, setDiodeModels] = useState<DiodeModelType[]>(() => loadJSON(DIODE_MODELS_KEY, [
    { id: "m1", name: "Overshoot Model" },
    { id: "m2", name: "VA Model" },
    { id: "m3", name: "Fab Spectre Model" },
  ]));
  const [newModelName, setNewModelName] = useState("");

  // Filter toggle
  const [filterSameTech, setFilterSameTech] = useState(() => loadJSON(FILTER_SAME_TECH_KEY, false));
  const [showDemo, setShowDemo] = useState(() => localStorage.getItem('esd-show-demo') !== '0');

  useEffect(() => { const db = getDB(); setDbInfo({ ips: db.ipBlocks.length, ports: db.ports.length }); }, []);

  const handleSaveUser = () => { setCurrentUser(name.trim()); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleSaveAll = () => {
    saveMilestonePresets(presets);
    saveJSON(P2P_PRESETS_KEY, p2pPresets);
    saveJSON(CLAMP_PRESETS_KEY, clampPresets);
    saveJSON(DIODE_MODELS_KEY, diodeModels);
    saveJSON(FILTER_SAME_TECH_KEY, filterSameTech);
  };

  const handleResetDB = () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    resetDB(); window.location.reload();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">设置</h1>
        <button onClick={handleSaveAll} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          <Save size={16} /> 保存全部设置
        </button>
      </div>

      {/* User */}
      <Section icon={<User size={20} className="text-blue-600" />} bg="bg-blue-100" title="当前用户" desc="用于标识数据库修改者">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="输入你的姓名" />
          <button onClick={handleSaveUser} className={`px-4 py-2 text-sm rounded font-medium ${saved ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}>{saved ? "已保存" : "保存"}</button>
        </div>
      </Section>

      {/* Database */}
      <Section icon={<Database size={20} className="text-amber-600" />} bg="bg-amber-100" title="数据库" desc={`IP: ${dbInfo.ips} | 端口: ${dbInfo.ports} | 存储在浏览器 localStorage`}>
        {!resetConfirm ? (
          <button onClick={handleResetDB} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"><RefreshCw size={14} /> 重置数据库</button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-red-600 font-medium">确定要重置？所有数据将丢失！</span>
            <button onClick={handleResetDB} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">确认重置</button>
            <button onClick={() => setResetConfirm(false)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">取消</button>
          </div>
        )}
      </Section>

      {/* Demo toggle */}
      <Section icon={<Database size={20} className="text-gray-600" />} bg="bg-gray-100" title="示例项目" desc="控制是否显示默认的6个演示IP（刷新后生效）">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={showDemo} onChange={(e) => { setShowDemo(e.target.checked); localStorage.setItem('esd-show-demo', e.target.checked ? '1' : '0'); }} className="w-4 h-4" />
          显示默认示例IP项目（USB3_PHY, DDR5_CTRL 等）
        </label>
      </Section>

      {/* Filter toggle */}
      <Section icon={<Filter size={20} className="text-teal-600" />} bg="bg-teal-100" title="显示筛选" desc="控制二极管和CLAMP备选项的显示范围">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={filterSameTech} onChange={(e) => setFilterSameTech(e.target.checked)} className="w-4 h-4" />
          仅显示同工艺下的二极管和CLAMP（后续自定义项增多后推荐开启）
        </label>
      </Section>

      {/* Milestone Presets */}
      <Section icon={<Bookmark size={20} className="text-purple-600" />} bg="bg-purple-100" title="里程碑预设" desc="默认的大阶段模板">
        <div className="space-y-2 mb-3">
          {presets.map((p) => (
            <div key={p.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{p.name}</span><button onClick={() => setPresets(presets.filter((x) => x.id !== p.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div>
              {p.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <input value={m.title} onChange={(e) => {
                    setPresets(presets.map((x) => x.id !== p.id ? x : { ...x, milestones: x.milestones.map((ms, j) => j === i ? { ...ms, title: e.target.value } : ms) }));
                  }} className="flex-1 text-xs border border-gray-100 rounded px-2 py-0.5 outline-none focus:border-blue-300" />
                </div>
              ))}
              <button onClick={() => setPresets(presets.map((x) => x.id !== p.id ? x : { ...x, milestones: [...x.milestones, { title: "新阶段", order: x.milestones.length }] }))}
                className="ml-4 text-xs text-blue-500 flex items-center gap-1 mt-1"><Plus size={10} /> 添加阶段</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="新建预设名称..." className="flex-1 max-w-xs border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
          <button onClick={() => { if (newPresetName.trim()) { setPresets([...presets, { id: generateId(), name: newPresetName.trim(), milestones: [{ title: "Testbench READY", order: 0 }, { title: "仿真 READY", order: 1 }, { title: "预评审 READY", order: 2 }, { title: "报告 READY", order: 3 }] }]); setNewPresetName(""); } }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"><Plus size={14} /> 新建</button>
        </div>
      </Section>

      {/* P2P Presets */}
      <Section icon={<Radio size={20} className="text-indigo-600" />} bg="bg-indigo-100" title="P2P 预设" desc="所有IP通用的P2P电阻项模板">
        <div className="space-y-1 mb-3">
          {p2pPresets.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
              <span><span className="text-gray-700 font-mono">{p.name}</span><span className="text-gray-400 ml-2">{p.value}</span></span>
              <button onClick={() => setP2pPresets(p2pPresets.filter((x) => x.id !== p.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newP2PName} onChange={(e) => setNewP2PName(e.target.value)} placeholder="名称 如 R_1stDIO_vss" className="flex-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
          <input value={newP2PValue} onChange={(e) => setNewP2PValue(e.target.value)} placeholder="值 如 0.1 ohm" className="w-28 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
          <button onClick={() => { if (newP2PName.trim()) { setP2pPresets([...p2pPresets, { id: generateId(), name: newP2PName.trim(), value: newP2PValue.trim() || "-" }]); setNewP2PName(""); setNewP2PValue(""); } }}
            className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"><Plus size={14} /></button>
        </div>
      </Section>

      {/* CLAMP Presets */}
      <Section icon={<Shield size={20} className="text-teal-600" />} bg="bg-teal-100" title="CLAMP 预设" desc="CLAMP型号备选项（含工艺关联）">
        <div className="space-y-1 mb-3">
          {clampPresets.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
              <span><span className="text-gray-700 font-mono">{c.modelNumber}</span><span className="text-xs text-gray-400 ml-2">[{c.technologyName}]</span></span>
              <button onClick={() => setClampPresets(clampPresets.filter((x) => x.id !== c.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newClampModel} onChange={(e) => setNewClampModel(e.target.value)} placeholder="型号 如 ESD_PCLAMP_0V8" className="flex-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
          <input value={newClampTech} onChange={(e) => setNewClampTech(e.target.value)} placeholder="工艺 如 N5" className="w-20 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
          <button onClick={() => { if (newClampModel.trim()) { setClampPresets([...clampPresets, { id: generateId(), modelNumber: newClampModel.trim(), technologyName: newClampTech.trim() || "N5" }]); setNewClampModel(""); setNewClampTech("N5"); } }}
            className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"><Plus size={14} /></button>
        </div>
      </Section>

      {/* Diode Model Types */}
      <Section icon={<Zap size={20} className="text-amber-600" />} bg="bg-amber-100" title="二极管模型类型" desc="仿真用的模型类型选项">
        <div className="space-y-1 mb-3">
          {diodeModels.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
              <span className="text-gray-700">{m.name}</span>
              <button onClick={() => setDiodeModels(diodeModels.filter((x) => x.id !== m.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="模型名称 如 Overshoot Model"
            className="flex-1 max-w-xs border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            onKeyDown={(e) => { if (e.key === "Enter" && newModelName.trim()) { setDiodeModels([...diodeModels, { id: generateId(), name: newModelName.trim() }]); setNewModelName(""); } }} />
          <button onClick={() => { if (newModelName.trim()) { setDiodeModels([...diodeModels, { id: generateId(), name: newModelName.trim() }]); setNewModelName(""); } }}
            className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"><Plus size={14} /></button>
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, bg, title, desc, children }: { icon: React.ReactNode; bg: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>{icon}</div>
          <div><h2 className="text-sm font-medium text-gray-800">{title}</h2><p className="text-xs text-gray-500">{desc}</p></div>
        </div>
        {children}
      </div>
    </div>
  );
}
