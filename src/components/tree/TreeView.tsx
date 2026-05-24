import { useEffect } from "react";
import { useTreeStore } from "../../stores/treeStore";
import { useDetailStore } from "../../stores/detailStore";
import { TreeToolbar } from "./TreeToolbar";
import { IpNode } from "./IpNode";
import { PortNode } from "./PortNode";
import { getAllIPs, getPortsByIpId, createPort, getAllChipTags } from "../../db/queries";
import { getEventsByPortId } from "../../db/queries/event";
import { getAllTechnologies } from "../../db/queries/technology";
import { computeMilestoneProgress } from "../../lib/milestones";
import { loadDB } from "../../db/persistence";
import { Plus } from "lucide-react";
import type { TreeNode } from "../../types";

function buildTreeData(): TreeNode[] {
  const ips = getAllIPs();
  const technologies = getAllTechnologies();
  const chipTags = getAllChipTags();

  return ips.map((ip) => {
    const tech = technologies.find((t) => t.id === ip.technologyId);
    const ipChipTags = (ip.chipTagIds || []).map((tid) => chipTags.find((ct) => ct.id === tid)?.name).filter(Boolean) as string[];
    return {
      id: ip.id, name: ip.name, type: "ip" as const,
      technology: tech?.name || null,
      chipTags: ipChipTags.length > 0 ? ipChipTags : null,
      assignees: null, startDate: ip.startDate, ddlDate: ip.ddlDate,
      children: getPortsByIpId(ip.id).map((port) => ({
        id: port.id, name: port.name, type: "port" as const,
        status: port.status,
        eventProgress: computeMilestoneProgress(getEventsByPortId(port.id)),
        lastEventDate: null, lastEventPerson: null,
      })),
    };
  });
}

export function TreeView() {
  const { treeData, expandedIds, searchQuery, setExpanded, setTreeData, treeVersion, incrementVersion } = useTreeStore();
  const { openDetail } = useDetailStore();

  useEffect(() => { loadDB(); const nodes = buildTreeData(); const showDemo = localStorage.getItem('esd-show-demo') !== '0'; const filtered = showDemo ? nodes : nodes.filter((n) => { const ip = getAllIPs().find((x) => x.id === n.id); return !ip?.isDemo; }); setTreeData(filtered); if (filtered.length > 0 && expandedIds.size === 0) setExpanded([filtered[0].id]); }, [treeVersion]);

  const handleAddPort = (ipId: string) => {
    const existing = getPortsByIpId(ipId);
    createPort(ipId, { name: `PORT_${String.fromCharCode(65 + existing.length)}` });
    incrementVersion();
  };

  const filteredData = treeData.filter((ip) => {
    if (searchQuery) { const q = searchQuery.toLowerCase(); return ip.name.toLowerCase().includes(q) || ip.children?.some((p) => p.name.toLowerCase().includes(q)); }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <TreeToolbar />
      <div className="flex-1 overflow-auto p-3">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400"><div className="text-center"><div className="text-4xl mb-2">{String.fromCodePoint(0x1F333)}</div><div className="text-sm">暂无数据，请先创建 IP 模块</div></div></div>
        ) : (
          <div className="space-y-1">
            {filteredData.map((ip) => (
              <div key={ip.id}>
                <div onClick={() => { const next = new Set(expandedIds); if (next.has(ip.id)) next.delete(ip.id); else next.add(ip.id); setExpanded([...next]); openDetail(ip.id, "ip"); }} className="cursor-pointer">
                  <IpNode node={ip} expanded={expandedIds.has(ip.id)} />
                </div>
                {expandedIds.has(ip.id) && (
                  <div className="ml-6">
                    {ip.children?.map((port) => (<div key={port.id} onClick={() => openDetail(port.id, "port")} className="cursor-pointer"><PortNode node={port} /></div>))}
                    <button onClick={() => handleAddPort(ip.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 py-1 px-2 mt-1"><Plus size={12} /> 新建端口</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
