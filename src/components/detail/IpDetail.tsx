import { Cpu, FlaskConical, Users, Calendar, X, Plus, Layers, Edit3, Check, AlertTriangle } from "lucide-react";
import { getIPById, getPortsByIpId, updateIP, getAllChipTags } from "../../db/queries";
import { getAllPersons, getAllRoles, getAllTechnologies } from "../../db/queries/technology";
import { useTreeStore } from "../../stores/treeStore";
import { StatusBadge } from "../shared/StatusBadge";
import { useState } from "react";

interface IpDetailProps { ipId: string; }

export function IpDetail({ ipId }: IpDetailProps) {
  const ip = getIPById(ipId);
  const ipPorts = ip ? getPortsByIpId(ip.id) : [];
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const incrementVersion = useTreeStore((s) => s.incrementVersion);

  if (!ip) return <div className="text-sm text-gray-400 py-8 text-center">IP 数据未找到</div>;
  const [localExtensions, setLocalExtensions] = useState(ip.extensions || []);

  const technologies = getAllTechnologies();
  const chipTags = getAllChipTags();
  const tech = technologies.find((t) => t.id === ip.technologyId);
  const completedPorts = ipPorts.filter((p) => p.status === "completed").length;
  const ipChipTags = (ip.chipTagIds || []).map((tid) => chipTags.find((ct) => ct.id === tid)?.name).filter(Boolean) as string[];

  const handleStatusChange = (newStatus: string) => {
    updateIP(ipId, { status: newStatus });
    incrementVersion();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Cpu size={18} className="text-blue-500" /><h2 className="text-lg font-semibold text-gray-800">{ip.name}</h2></div>
        <button onClick={() => setShowConfirm(true)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500"><Edit3 size={16} /></button>
      </div>

      {/* IP Status toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">IP 状态:</span>
        <select value={ip.status || "pending"} onChange={(e) => handleStatusChange(e.target.value)}
          className="border rounded px-2 py-1 text-xs bg-white">
          <option value="pending">未开始</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      {ipChipTags.length > 0 && (
        <div className="flex flex-wrap gap-1">{ipChipTags.map((tag) => <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>)}</div>
      )}

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><FlaskConical size={16} className="text-purple-500" /><span className="text-sm font-medium text-gray-700">工艺与激励</span></div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>工艺：{tech?.name || "未设置"}</p>
          <p>日期：{ip.startDate ?? "未设置"} ~ {ip.ddlDate ?? "未设置"}</p>
          {ip.notes && <p className="text-xs text-gray-400 mt-2">{ip.notes}</p>}
        </div>
      </div>

      <ExtensionSection ipId={ipId} extensions={localExtensions} onUpdate={() => { setLocalExtensions(getIPById(ipId)?.extensions || []); incrementVersion(); }} />

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><Users size={16} className="text-green-500" /><span className="text-sm font-medium text-gray-700">负责人分配</span></div>
        <AssigneeEditor ipId={ipId} />
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3"><Calendar size={16} className="text-blue-500" /><span className="text-sm font-medium text-gray-700">事件摘要</span></div>
        <p className="text-sm text-gray-700">{completedPorts}/{ipPorts.length} 端口完成</p>
        <div className="mt-2 space-y-1">{ipPorts.map((port) => (<div key={port.id} className="flex items-center justify-between text-xs"><span className="text-gray-600">{port.name}</span><StatusBadge status={port.status} /></div>))}</div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[360px] p-6"><h3 className="text-base font-semibold mb-2">修改 IP 设置</h3><p className="text-sm text-gray-600 mb-4">确认要修改 IP "{ip.name}" 的设置吗？</p>
            <div className="flex justify-end gap-2"><button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button><button onClick={() => { setShowConfirm(false); setEditing(true); }} className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">确认修改</button></div></div></div>)}
      {editing && <EditIPDialog ipId={ipId} onDone={() => { setEditing(false); incrementVersion(); }} />}
    </div>
  );
}

function EditIPDialog({ ipId, onDone }: { ipId: string; onDone: () => void }) {
  const ip = getIPById(ipId); if (!ip) return null;
  const technologies = getAllTechnologies(); const chipTags = getAllChipTags();
  const [name, setName] = useState(ip.name); const [techId, setTechId] = useState(ip.technologyId || "");
  const [startDate, setStartDate] = useState(ip.startDate || ""); const [ddlDate, setDdlDate] = useState(ip.ddlDate || "");
  const [notes, setNotes] = useState(ip.notes || ""); const [selectedTags, setSelectedTags] = useState<string[]>(ip.chipTagIds || []);
  const [extensions, setExtensions] = useState(ip.extensions || []);
  const [newExtDate, setNewExtDate] = useState('');
  const [newExtReason, setNewExtReason] = useState('');
  const toggleTag = (id: string) => setSelectedTags((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-h-[85vh] overflow-auto p-6"><h3 className="text-base font-semibold mb-3">编辑 IP: {ip.name}</h3>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500 block mb-1">名称</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-gray-500 block mb-1">工艺</label><select value={techId} onChange={(e) => setTechId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white"><option value="">选择工艺...</option>{technologies.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></div>
          <div><label className="text-xs text-gray-500 block mb-1">芯片标签</label><div className="flex flex-wrap gap-2">{chipTags.map((t) => (<button key={t.id} onClick={() => toggleTag(t.id)} className={`text-xs px-2 py-1 rounded-full border ${selectedTags.includes(t.id) ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200"}`}>{t.name}</button>))}</div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-500 block mb-1">开始日期</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div><div><label className="text-xs text-gray-500 block mb-1">DDL 日期</label><input type="date" value={ddlDate} onChange={(e) => setDdlDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div></div>
          <div><label className="text-xs text-gray-500 block mb-1">延期事件</label>
            <div className="space-y-1">
              {extensions.map((ext, i) => (<div key={i} className="flex items-center gap-1 text-xs bg-orange-50 px-2 py-1 rounded"><span className="text-gray-600">{ext.date}</span><span className="text-gray-400">{ext.reason}</span><button onClick={() => setExtensions(extensions.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-auto"><X size={12} /></button></div>))}
              <div className="flex gap-1"><input value={newExtDate} onChange={(e) => setNewExtDate(e.target.value)} type="date" className="border rounded px-2 py-0.5 text-xs" /><input value={newExtReason} onChange={(e) => setNewExtReason(e.target.value)} placeholder="延期原因" className="flex-1 border rounded px-2 py-0.5 text-xs" /><button onClick={() => { if (newExtDate) { setExtensions([...extensions, { date: newExtDate, reason: newExtReason }]); setNewExtDate(''); setNewExtReason(''); } }} className="text-xs text-blue-500"><Plus size={12} /></button></div>
            </div>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border rounded px-3 py-2 text-sm resize-none" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><button onClick={onDone} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">取消</button><button onClick={() => { updateIP(ipId, { name: name.trim(), technologyId: techId || null, startDate: startDate || null, ddlDate: ddlDate || null, notes: notes.trim() || null, chipTagIds: selectedTags, extensions }); onDone(); }} className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Check size={14} /> 完成</button></div></div></div>);
}

function ExtensionSection({ ipId, extensions, onUpdate }: { ipId: string; extensions: { date: string; reason: string }[]; onUpdate: () => void }) {
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const add = () => {
    if (!newDate) return;
    updateIP(ipId, { extensions: [...extensions, { date: newDate, reason: newReason || '延期' }] });
    setNewDate(''); setNewReason(''); onUpdate();
  };
  const remove = (idx: number) => {
    updateIP(ipId, { extensions: extensions.filter((_, i) => i !== idx) });
    onUpdate();
  };
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-orange-500" /><span className="text-sm font-medium text-gray-700">延期事件</span><span className="text-xs text-gray-400">{extensions.length} 条</span></div>
      {extensions.length > 0 ? (
        <div className="space-y-1 mb-2">
          {extensions.map((ext, i) => (<div key={i} className="flex items-center justify-between text-xs bg-orange-50 border border-orange-100 px-2 py-1 rounded"><span className="text-gray-700">{ext.date}</span><span className="text-gray-500">{ext.reason}</span><button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500"><X size={12} /></button></div>))}
        </div>
      ) : (<div className="text-xs text-gray-400 py-2">暂无延期事件</div>)}
      <div className="flex gap-1">
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="border rounded px-2 py-1 text-xs" />
        <input value={newReason} onChange={(e) => setNewReason(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="原因（可选）" className="flex-1 border rounded px-2 py-1 text-xs" />
        <button onClick={add} disabled={!newDate} className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 disabled:opacity-40"><Plus size={12} /></button>
      </div>
    </div>
  );
}

function AssigneeEditor({ ipId }: { ipId: string }) {
  const roles = getAllRoles(); const persons = getAllPersons();
  const [entries, setEntries] = useState<{ roleId: string; personId: string }[]>([]);
  const [selRole, setSelRole] = useState(""); const [selPerson, setSelPerson] = useState("");
  const add = () => { if (!selRole || !selPerson) return; setEntries([...entries, { roleId: selRole, personId: selPerson }]); setSelRole(""); setSelPerson(""); };
  return (
    <div className="space-y-2">
      {entries.map((e) => { const r = roles.find((x) => x.id === e.roleId); const p = persons.find((x) => x.id === e.personId); return (<div key={e.roleId} className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded"><span><span className="text-gray-400">{r?.name}: </span><span className="text-gray-700">{p?.name}</span></span><button onClick={() => setEntries(entries.filter((x) => x.roleId !== e.roleId))} className="text-gray-400 hover:text-red-500"><X size={14} /></button></div>); })}
      <div className="flex gap-2 items-center">
        <select value={selRole} onChange={(e) => setSelRole(e.target.value)} className="border rounded px-2 py-1 text-xs flex-1"><option value="">角色...</option>{roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}</select>
        <select value={selPerson} onChange={(e) => setSelPerson(e.target.value)} className="border rounded px-2 py-1 text-xs flex-1"><option value="">人员...</option>{persons.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
        <button onClick={add} disabled={!selRole || !selPerson} className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-40"><Plus size={12} /> 分配</button>
      </div>
    </div>
  );
}
