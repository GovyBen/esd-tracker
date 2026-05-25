import { useState } from "react";
import { getAllIPs, getPortsByIpId, getAllChipTags } from "../../db/queries";
import { getDB, saveDB } from "../../db/persistence";
import { generateId } from "../../lib/uuid";
import { Cpu, AlertCircle, Plus } from "lucide-react";

export function KanbanView() {
  const showDemo = localStorage.getItem("esd-show-demo") !== "0";
  const allIps = getAllIPs();
  const ips = showDemo ? allIps : allIps.filter((ip: any) => !ip.isDemo);
  const chipTags = getAllChipTags();
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const db = getDB();
    if (!db.chipTags.some((t) => t.name === newTagName.trim())) {
      db.chipTags.push({ id: generateId(), name: newTagName.trim() });
      saveDB();
    }
    setNewTagName("");
  };

  const groups = new Map<string, typeof ips>();
  groups.set("unassigned", []);
  chipTags.forEach((tag) => groups.set(tag.name, []));
  ips.forEach((ip: any) => {
    if (ip.name.includes("USB")) groups.set("Phoenix", [...(groups.get("Phoenix") || []), ip]);
    else if (ip.name.includes("DDR")) groups.set("Titan", [...(groups.get("Titan") || []), ip]);
    else if (ip.name.includes("PCIE")) groups.set("Nova", [...(groups.get("Nova") || []), ip]);
    else groups.set("unassigned", [...(groups.get("unassigned") || []), ip]);
  });
  const nonEmpty = Array.from(groups.entries()).filter(([, list]) => list.length > 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">看板视图</h1>
        <div className="flex gap-2">
          <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="新建标签..." className="border rounded px-2 py-1 text-xs w-28" />
          <button onClick={handleAddTag} className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
            <Plus size={12} /> 新建标签
          </button>
        </div>
      </div>

      {nonEmpty.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">{String.fromCodePoint(0x1F4CA)}</div><div className="text-sm">暂无数据</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nonEmpty.map(([tagName, ipList]) => (
            <div key={tagName} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-800">{tagName === "unassigned" ? "未分类" : tagName}</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ipList.length} IP</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4"
                    strokeDasharray={`${computeGroupProgress(ipList) * 1.256} 125.6`} strokeLinecap="round" transform="rotate(-90 24 24)" />
                  <text x="24" y="26" textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">{Math.round(computeGroupProgress(ipList))}%</text>
                </svg>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>总端口：{ipList.reduce((sum: number, ip: any) => sum + getPortsByIpId(ip.id).length, 0)}</div>
                  <div className="flex items-center gap-1"><AlertCircle size={12} className="text-red-400" />逾期：{ipList.filter((ip: any) => ip.ddlDate && new Date(ip.ddlDate) < new Date()).length}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {ipList.map((ip: any) => {
                  const ports = getPortsByIpId(ip.id);
                  const done = ports.filter((p: any) => p.status === "completed").length;
                  return (
                    <div key={ip.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded text-sm">
                      <Cpu size={14} className="text-blue-400" /><span className="flex-1 text-gray-700 truncate">{ip.name}</span><span className="text-xs text-gray-400">{done}/{ports.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function computeGroupProgress(ips: any[]): number { const allPorts = ips.flatMap((ip: any) => getPortsByIpId(ip.id)); if (allPorts.length === 0) return 0; return (allPorts.filter((p: any) => p.status === "completed").length / allPorts.length) * 100; }
