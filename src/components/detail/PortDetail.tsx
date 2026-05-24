import { useDetailStore } from "../../stores/detailStore";
import { getPortById, getIPById } from "../../db/queries";
import { getDB } from "../../db/persistence";
import { EventTab } from "./EventTab";
import { EmxTab } from "./EmxTab";
import { ChecklistTab } from "./ChecklistTab";
import { Hash } from "lucide-react";

interface PortDetailProps { portId: string; }

export function PortDetail({ portId }: PortDetailProps) {
  const { portTab, setPortTab } = useDetailStore();
  const port = getPortById(portId);
  const ip = port ? getIPById(port.ipId) : null;
  const db = getDB();

  const cdmStd = port?.cdmStandardId ? db.testStandards.find((s) => s.id === port.cdmStandardId) : null;
  const hbmStd = port?.hbmStandardId ? db.testStandards.find((s) => s.id === port.hbmStandardId) : null;

  const tabs: { id: typeof portTab; label: string }[] = [
    { id: "events", label: "事件与状态" },
    { id: "emx", label: "防护与EMX" },
    { id: "checklist", label: "Checklist" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Hash size={18} className="text-orange-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{port?.name || "端口详情"}</h2>
          {ip && <p className="text-xs text-gray-400">{ip.name} / {port?.name}</p>}
        </div>
      </div>

      {/* Standard tags */}
      {(cdmStd || hbmStd) && (
        <div className="flex flex-wrap gap-2">
          {cdmStd && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">CDM: {cdmStd.name}</span>}
          {hbmStd && <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">HBM: {hbmStd.name}</span>}
        </div>
      )}

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setPortTab(tab.id)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${portTab === tab.id ? "border-blue-500 text-blue-600 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {portTab === "events" && <EventTab portId={portId} />}
      {portTab === "emx" && <EmxTab portId={portId} />}
      {portTab === "checklist" && <ChecklistTab portId={portId} />}
    </div>
  );
}
