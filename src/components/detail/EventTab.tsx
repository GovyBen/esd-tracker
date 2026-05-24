import { useState } from "react";
import { getEventsByPortId, createEvent, updateEvent, deleteEvent } from "../../db/queries/event";
import { getPortById, updatePort } from "../../db/queries/ip";
import { getMilestonePresets, getEventMeta, computeMilestoneProgress, type MilestonePreset } from "../../lib/milestones";
import { useTreeStore } from "../../stores/treeStore";
import { StatusBadge } from "../shared/StatusBadge";
import { generateId, nowISO } from "../../lib/uuid";
import { Plus, Trash2, Check, Milestone, AlertCircle, ChevronDown, ChevronRight, Bookmark } from "lucide-react";

const portStatusOptions = [
  { value: "pending", label: "未开始", color: "#9ca3af" },
  { value: "in_progress", label: "进行中", color: "#3b82f6" },
  { value: "completed", label: "已完成", color: "#22c55e" },
  { value: "problem", label: "问题", color: "#ef4444" },
];

interface EventTabProps { portId: string; }

export function EventTab({ portId }: EventTabProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const incrementVersion = useTreeStore((s) => s.incrementVersion);

  const port = getPortById(portId);
  const events = getEventsByPortId(portId);
  const presets = getMilestonePresets();
  const refresh = () => { setRefreshKey((k) => k + 1); incrementVersion(); };

  const milestoneProgress = computeMilestoneProgress(events);
  const milestones = events.filter((e) => getEventMeta(e).eventType === "milestone");
  const subEvents = (id: string) => events.filter((e) => { const m = getEventMeta(e); return m.eventType === "sub_event" && m.parentMilestoneId === id; });

  const handleStatusChange = (newStatus: string) => {
    updatePort(portId, { status: newStatus }); refresh();
  };

  const handleAddMilestone = (title: string) => { if (!title.trim()) return; createEvent({ portId, title: title.trim(), status: "pending", order: milestones.length, notes: JSON.stringify({ eventType: "milestone" }) }); refresh(); };
  const handleAddSubEvent = (parentMilestoneId: string, title: string) => { if (!title.trim()) return; const siblings = events.filter((e) => { const m = getEventMeta(e); return m.eventType === "sub_event" && m.parentMilestoneId === parentMilestoneId; }); createEvent({ portId, title: title.trim(), status: "pending", order: siblings.length, notes: JSON.stringify({ eventType: "sub_event", parentMilestoneId }) }); refresh(); };
  const handleToggleStatus = (eventId: string, currentStatus: string) => { const ns = currentStatus === "completed" ? "pending" : "completed"; updateEvent(eventId, { status: ns, completedDate: ns === "completed" ? nowISO() : null }); refresh(); };
  const handleDelete = (eventId: string) => { deleteEvent(eventId); refresh(); };
  const applyPreset = (preset: MilestonePreset) => { milestones.forEach((m) => deleteEvent(m.id)); preset.milestones.forEach((m, i) => { createEvent({ portId, title: m.title, status: "pending", order: i, notes: JSON.stringify({ eventType: "milestone" }) }); }); setShowPresetPicker(false); refresh(); };
  const toggleExpand = (id: string) => { const next = new Set(expandedMilestones); if (next.has(id)) next.delete(id); else next.add(id); setExpandedMilestones(next); };

  return (
    <div className="space-y-3">
      {/* Port Status - manual */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">端口状态</span>
          <select value={port?.status || "pending"} onChange={(e) => handleStatusChange(e.target.value)}
            className="ml-2 border rounded px-2 py-0.5 text-xs bg-white">
            {portStatusOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </div>
        <div className="text-right"><div className="text-xs text-gray-400">里程碑进度</div><div className="text-sm font-medium text-gray-700">{milestoneProgress}%</div></div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${milestoneProgress}%` }} /></div>

      <button onClick={() => setShowPresetPicker(!showPresetPicker)} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"><Bookmark size={12} /> 从预设加载里程碑</button>
      {showPresetPicker && (<div className="bg-blue-50 rounded-md p-2 space-y-1">{presets.map((p) => (<button key={p.id} onClick={() => applyPreset(p)} className="w-full text-left px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded">{p.name} ({p.milestones.length} 个阶段)</button>))}</div>)}

      <div className="space-y-2">
        <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">里程碑</span><span className="text-xs text-gray-400">{milestones.length} 项</span></div>
        {milestones.length === 0 ? (<div className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-md">暂无里程碑</div>) : (
          <div className="space-y-1">
            {milestones.sort((a, b) => a.order - b.order).map((ms) => { const subs = subEvents(ms.id); const isExpanded = expandedMilestones.has(ms.id); return (
              <div key={ms.id}>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 border border-blue-100 rounded-md group">
                  <Milestone size={14} className="text-blue-500 shrink-0" /><button onClick={() => toggleExpand(ms.id)} className="text-gray-400">{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>
                  <span className={`flex-1 text-sm font-medium ${ms.status === "completed" ? "line-through text-gray-400" : "text-gray-800"}`}>{ms.title}</span>
                  <StatusBadge status={ms.status} />
                  <button onClick={() => handleToggleStatus(ms.id, ms.status)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
                  <button onClick={() => handleDelete(ms.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
                {isExpanded && (<div className="ml-8 mt-1 space-y-0.5">{subs.map((sub) => (<div key={sub.id} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded group text-xs"><AlertCircle size={12} className="text-amber-400" /><span className={`flex-1 ${sub.status === "completed" ? "line-through text-gray-400" : "text-gray-600"}`}>{sub.title}</span><StatusBadge status={sub.status} /><button onClick={() => handleToggleStatus(sub.id, sub.status)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-green-100 rounded text-green-600"><Check size={12} /></button><button onClick={() => handleDelete(sub.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded text-red-500"><Trash2 size={12} /></button></div>))}<SubEl onAdd={(t) => handleAddSubEvent(ms.id, t)} /></div>)}
              </div>
            );})}
          </div>
        )}
        <MilestoneInput onAdd={handleAddMilestone} />
      </div>
    </div>
  );
}
function MilestoneInput({ onAdd }: { onAdd: (t: string) => void }) { const [v, setV] = useState(""); const h = () => { onAdd(v); setV(""); }; return (<div className="flex gap-2"><input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && h()} placeholder="添加里程碑..." className="flex-1 border rounded px-2 py-1.5 text-sm" /><button onClick={h} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded"><Plus size={14} /> 添加</button></div>); }
function SubEl({ onAdd }: { onAdd: (t: string) => void }) { const [v, setV] = useState(""); const h = () => { onAdd(v); setV(""); }; return (<div className="flex gap-1"><input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && h()} placeholder="子事件..." className="flex-1 border rounded px-1.5 py-0.5 text-xs" /><button onClick={h} className="text-xs text-blue-500 px-1">+</button></div>); }
