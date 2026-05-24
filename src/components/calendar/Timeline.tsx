import { useDetailStore } from "../../stores/detailStore";
import dayjs from "dayjs";

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  portId: string;
}

interface IpTimelineData {
  ipId: string;
  ipName: string;
  startDate: string;
  ddlDate: string;
  progress: number;
  events: TimelineEvent[];
}

interface TimelineProps {
  viewMode: "month" | "week";
  ipData: IpTimelineData[];
}

export function Timeline({ viewMode, ipData }: TimelineProps) {
  const { openDetail } = useDetailStore();

  if (ipData.length === 0) return null;

  const viewDays = viewMode === "week" ? 7 : 30;
  const start = viewMode === "month" ? dayjs().startOf("month") : dayjs().startOf("week");
  const columns: dayjs.Dayjs[] = [];
  for (let i = 0; i < viewDays; i++) {
    columns.push(start.add(i, "day"));
  }

  const dayWidth = Math.max(30, Math.floor(800 / viewDays));

  return (
    <div className="flex">
      {/* Left: IP names */}
      <div className="w-40 shrink-0 border-r border-gray-200 pr-3">
        <div className="text-xs font-medium text-gray-400 mb-1 px-1">IP 模块</div>
        {ipData.map((ip) => (
          <div
            key={ip.ipId}
            className="h-10 flex items-center px-1 text-sm text-gray-700 truncate hover:bg-gray-50 rounded cursor-pointer"
            title={ip.ipName}
            onClick={() => openDetail(ip.ipId, "ip")}
          >
            {ip.ipName}
          </div>
        ))}
      </div>

      {/* Right: Timeline */}
      <div className="flex-1 overflow-x-auto">
        {/* Date headers */}
        <div className="flex" style={{ minWidth: columns.length * dayWidth }}>
          {columns.map((col, i) => (
            <div
              key={i}
              className="text-[10px] text-gray-400 text-center border-r border-gray-100 py-1"
              style={{ width: dayWidth }}
            >
              {col.format(viewMode === "week" ? "ddd D" : "D")}
              {col.date() === 1 && (
                <div className="text-gray-500 font-medium">{col.format("M月")}</div>
              )}
            </div>
          ))}
        </div>

        {/* IP bars */}
        <div className="relative" style={{ minWidth: columns.length * dayWidth }}>
          {/* Grid lines */}
          {columns.map((col, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-r border-gray-50"
              style={{ left: i * dayWidth, width: dayWidth }}
            />
          ))}

          {ipData.map((ip) => {
            const barStart = dayjs(ip.startDate);
            const barEnd = dayjs(ip.ddlDate);
            const leftOffset = Math.max(0, barStart.diff(start, "day"));
            const barWidth = Math.max(2, barEnd.diff(barStart, "day") + 1);

            return (
              <div key={ip.ipId} className="relative h-10 flex items-center">
                {/* Bar */}
                <div
                  className="absolute h-5 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 border border-blue-200"
                  style={{
                    left: leftOffset * dayWidth,
                    width: barWidth * dayWidth,
                  }}
                  title={`${ip.ipName}: ${ip.startDate} ~ ${ip.ddlDate}`}
                  onClick={() => openDetail(ip.ipId, "ip")}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-400 rounded opacity-40"
                    style={{ width: `${ip.progress}%` }}
                  />
                  {/* Event dots */}
                  <div className="absolute inset-0 flex items-center gap-0.5 px-1 overflow-hidden">
                    {ip.events.map((evt) => {
                      const evtDay = dayjs(evt.date);
                      const evtOffset = evtDay.diff(barStart, "day");
                      if (evtOffset < 0 || evtOffset > barEnd.diff(barStart, "day")) return null;
                      return (
                        <div
                          key={evt.id}
                          className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 cursor-pointer hover:scale-150 transition-transform"
                          style={{ marginLeft: evtOffset * 2 }}
                          title={`${evt.title} (${evt.date})`}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openDetail(evt.portId, "port");
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
