import { getAllIPs, getPortsByIpId, getAllChipTags } from "../../db/queries";
import { Cpu, AlertCircle } from "lucide-react";

export function KanbanView() {
  const ips = getAllIPs();
  const showDemo = localStorage.getItem('esd-show-demo') !== '0';
  const filteredIps = showDemo ? ips : ips.filter((ip) => !ip.isDemo);
  const chipTags = getAllChipTags();

  // Group IPs by chip tag
  const groups = new Map<string, typeof filteredIps>();
  groups.set("unassigned", []);

  chipTags.forEach((tag) => groups.set(tag.name, []));

  filteredIps.forEach((ip: any) => {
    // Demo: assign first few IPs to specific tags
    if (ip.name.includes("USB")) groups.set("Phoenix", [...(groups.get("Phoenix") || []), ip]);
    else if (ip.name.includes("DDR")) groups.set("Titan", [...(groups.get("Titan") || []), ip]);
    else if (ip.name.includes("PCIE")) groups.set("Nova", [...(groups.get("Nova") || []), ip]);
    else groups.set("unassigned", [...(groups.get("unassigned") || []), ip]);
  });

  // Filter out empty groups
  const nonEmpty = Array.from(groups.entries()).filter(([, list]) => list.length > 0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">看板视图</h1>

      {nonEmpty.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">{String.fromCodePoint(0x1F4CA)}</div>
          <div className="text-sm">暂无数据</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nonEmpty.map(([tagName, ipList]) => (
            <div key={tagName} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-800">
                  {tagName === "unassigned" ? "未分类" : tagName}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {ipList.length} IP
                </span>
              </div>

              {/* Progress ring summary */}
              <div className="flex items-center gap-4 mb-4">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4"
                    strokeDasharray={`${computeGroupProgress(ipList) * 1.256} 125.6`}
                    strokeLinecap="round" transform="rotate(-90 24 24)"
                  />
                  <text x="24" y="26" textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">
                    {Math.round(computeGroupProgress(ipList))}%
                  </text>
                </svg>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>总端口：{ipList.reduce((sum, ip) => sum + getPortsByIpId(ip.id).length, 0)}</div>
                  <div className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-red-400" />
                    逾期：{ipList.filter((ip) => ip.ddlDate && new Date(ip.ddlDate) < new Date()).length}
                  </div>
                </div>
              </div>

              {/* IP list */}
              <div className="space-y-1.5">
                {ipList.map((ip) => {
                  const ports = getPortsByIpId(ip.id);
                  const done = ports.filter((p) => p.status === "completed").length;
                  return (
                    <div key={ip.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded text-sm">
                      <Cpu size={14} className="text-blue-400" />
                      <span className="flex-1 text-gray-700 truncate">{ip.name}</span>
                      <span className="text-xs text-gray-400">{done}/{ports.length}</span>
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

function computeGroupProgress(ips: any[]): number {
  const allPorts = ips.flatMap((ip) => getPortsByIpId(ip.id));
  if (allPorts.length === 0) return 0;
  const done = allPorts.filter((p) => p.status === "completed").length;
  return (done / allPorts.length) * 100;
}
