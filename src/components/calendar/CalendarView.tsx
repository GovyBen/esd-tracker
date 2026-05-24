import { useState } from "react";
import { getAllIPs, getPortsByIpId } from "../../db/queries";
import { getEventsByPortId } from "../../db/queries/event";
import { useDetailStore } from "../../stores/detailStore";
import dayjs from "dayjs";
import { EyeOff } from "lucide-react";

function assignTracks(ips: ReturnType<typeof getAllIPs>) {
  const withDates = ips.filter((ip) => ip.startDate || ip.ddlDate)
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
  const tracks: string[][] = [];
  withDates.forEach((ip) => {
    const s = dayjs(ip.startDate);
    const e = ip.extendedDdlDate ? dayjs(ip.extendedDdlDate) : dayjs(ip.ddlDate);
    let assignedTrack = -1;
    for (let t = 0; t < tracks.length; t++) {
      const overlaps = tracks[t].some((otherId) => {
        const otherIp = withDates.find((x) => x.id === otherId);
        if (!otherIp) return false;
        const os = dayjs(otherIp.startDate);
        const oe = otherIp.extendedDdlDate ? dayjs(otherIp.extendedDdlDate) : dayjs(otherIp.ddlDate);
        return !(e.isBefore(os) || s.isAfter(oe));
      });
      if (!overlaps) { assignedTrack = t; break; }
    }
    if (assignedTrack === -1) { assignedTrack = tracks.length; tracks.push([]); }
    tracks[assignedTrack].push(ip.id);
  });
  return { tracks, withDates };
}

export function CalendarView() {
  const ips = getAllIPs();
  const showDemo = localStorage.getItem("esd-show-demo") !== "0";
  const calendarIps = showDemo ? ips : ips.filter((ip) => !ip.isDemo);
  const { openDetail } = useDetailStore();
  const [hiddenIps, setHiddenIps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showPanel, setShowPanel] = useState(true);

  const toggleHidden = (id: string) => {
    const next = new Set(hiddenIps);
    if (next.has(id)) next.delete(id); else next.add(id);
    setHiddenIps(next);
  };

  const ipData = calendarIps.map((ip) => {
    const ipPorts = getPortsByIpId(ip.id);
    const totalEvents = ipPorts.flatMap((p) => getEventsByPortId(p.id));
    const done = totalEvents.filter((e) => e.status === "completed").length;
    return {
      ipId: ip.id, ipName: ip.name, isCompleted: ip.status === "completed",
      startDate: ip.startDate, ddlDate: ip.ddlDate,
      extensions: (ip as any).extensions || [],
      progress: totalEvents.length > 0 ? Math.round((done / totalEvents.length) * 100) : 0,
      events: ipPorts.flatMap((p) =>
        getEventsByPortId(p.id).filter((e) => e.plannedDate).map((e) => ({
          id: e.id, title: e.title, date: e.plannedDate!, portId: p.id, portName: p.name,
        }))
      ),
    };
  });

  const { tracks } = assignTracks(calendarIps.filter((ip) => !hiddenIps.has(ip.id)));

  const today = dayjs();
  const rangeStart = viewMode === "week" ? today.startOf("week") : today.startOf("month").subtract(1, "month");
  const rangeEnd = viewMode === "week" ? today.endOf("week") : today.add(3, "month").endOf("month");
  const dateRows: dayjs.Dayjs[] = [];
  for (let d = rangeStart; d.isBefore(rangeEnd) || d.isSame(rangeEnd, "day"); d = d.add(1, "day")) { dateRows.push(d); }
  const rowHeight = viewMode === "week" ? 26 : 20;
  const trackWidth = Math.max(100, Math.min(160, tracks.length > 0 ? Math.floor(600 / tracks.length) : 200));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">日历视图</h1>
          <div className="flex bg-gray-100 rounded-md overflow-hidden">
            <button onClick={() => setViewMode("month")} className={"px-3 py-1 text-xs " + (viewMode === "month" ? "bg-white shadow text-gray-800" : "text-gray-500")}>月</button>
            <button onClick={() => setViewMode("week")} className={"px-3 py-1 text-xs " + (viewMode === "week" ? "bg-white shadow text-gray-800" : "text-gray-500")}>周</button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400">{calendarIps.length} IP / {tracks.length} 轨</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-200 border border-red-400" /> 逾期</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-200 border border-green-400" /> 完成</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-200 border border-orange-400" /> 延期</span>
          <button onClick={() => setShowPanel(!showPanel)} className={"px-2 py-1 rounded border text-xs " + (showPanel ? "bg-blue-50 text-blue-600" : "text-gray-500")}>
            {showPanel ? "隐藏列表" : "显示列表"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex" style={{ minHeight: dateRows.length * rowHeight + 50 }}>
            <div className="w-20 shrink-0 border-r border-gray-200 bg-white sticky left-0 z-10">
              <div className="h-12 border-b border-gray-200 flex items-end px-2 pb-1"><span className="text-[10px] text-gray-400">日期</span></div>
              {dateRows.map((d, i) => {
                const isFirstOfMonth = d.date() === 1;
                const isToday = d.isSame(today, "day");
                return <div key={i} className={"flex items-center px-2 border-b border-gray-50 " + (isToday ? "bg-yellow-50" : "")} style={{ height: rowHeight }}>
                  <span className={"text-[10px] " + (isToday ? "text-yellow-700 font-medium" : isFirstOfMonth ? "text-gray-500" : "text-gray-300")}>
                    {isFirstOfMonth ? d.format("M/D") : d.format("D")}
                  </span>
                </div>;
              })}
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="flex" style={{ minWidth: tracks.length * trackWidth }}>
                {tracks.map((trackIpIds, trackIdx) => (
                  <div key={trackIdx} className="shrink-0 border-r border-gray-100" style={{ width: trackWidth }}>
                    <div className="h-12 border-b border-gray-200 bg-gray-50 px-2 flex items-center"><span className="text-[10px] text-gray-400">轨道 {trackIdx + 1}</span></div>
                    <div className="relative">
                      {dateRows.map((d, i) => {
                        const isToday = d.isSame(today, "day");
                        return <div key={i} className={"border-b border-gray-50 " + (isToday ? "bg-yellow-50" : "")} style={{ height: rowHeight }} />;
                      })}
                      {trackIpIds.map((ipId) => {
                        const ip = ipData.find((x) => x.ipId === ipId);
                        if (!ip || !ip.startDate || !ip.ddlDate) return null;
                        const barStart = dayjs(ip.startDate);
                        const barEnd = dayjs(ip.ddlDate);
                        const isOverdue = !ip.isCompleted && barEnd.isBefore(today, "day");
                        const topRow = Math.max(0, barStart.diff(rangeStart, "day"));
                        const barRows = Math.max(1, barEnd.diff(barStart, "day") + 1);
                        return (
                          <div key={ipId}>
                            <div className="absolute left-1 right-1 rounded border cursor-pointer hover:ring-1 hover:ring-blue-400 transition-all"
                              style={{
                                top: topRow * rowHeight, height: Math.min(barRows, dateRows.length - topRow) * rowHeight,
                                backgroundColor: ip.isCompleted ? "#dcfce7" : isOverdue ? "#fecaca" : "#dbeafe",
                                borderColor: ip.isCompleted ? "#22c55e" : isOverdue ? "#ef4444" : "#93c5fd",
                              }}
                              onClick={() => openDetail(ipId, "ip")}
                              title={ip.ipName}>
                              <div className="absolute inset-x-0 bottom-0 rounded-b opacity-30"
                                style={{ height: ip.progress + "%", backgroundColor: isOverdue ? "#ef4444" : "#3b82f6" }} />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 font-medium truncate px-1">{ip.ipName}</span>
                            </div>
                            {ip.extensions.map((ext: { date: string; reason: string }, ei: number) => {
                              const extDate = dayjs(ext.date);
                              if (!extDate.isAfter(barStart)) return null;
                              const extTop = Math.max(0, extDate.diff(rangeStart, "day"));
                              const extH = 3;
                              return (
                                <div key={ei} className="absolute left-1 right-1 bg-orange-200 border border-orange-300 cursor-pointer"
                                  style={{ top: extTop * rowHeight, height: extH * rowHeight }}
                                  title={ext.reason || "延期"} />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showPanel && (
          <div className="w-56 shrink-0 border-l border-gray-200 bg-white overflow-auto">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">IP 可见性</div>
            <div className="p-2 space-y-0.5">
              {calendarIps.map((ip) => {
                const isHidden = hiddenIps.has(ip.id);
                return (
                  <label key={ip.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={!isHidden} onChange={() => toggleHidden(ip.id)} className="w-3.5 h-3.5 rounded" />
                    <span className={"flex-1 truncate " + (isHidden ? "text-gray-300 line-through" : "text-gray-700")}>{ip.name}</span>
                  </label>
                );
              })}
            </div>
            {hiddenIps.size > 0 && (
              <div className="px-3 py-2 border-t border-gray-100"><button onClick={() => setHiddenIps(new Set())} className="text-xs text-blue-500 hover:text-blue-600 w-full text-center">全部显示</button></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
