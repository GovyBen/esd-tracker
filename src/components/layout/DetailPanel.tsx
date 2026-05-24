import { useRef, useCallback } from "react";
import { useDetailStore } from "../../stores/detailStore";
import { IpDetail } from "../detail/IpDetail";
import { PortDetail } from "../detail/PortDetail";
import { Pin, PinOff, X, ExternalLink } from "lucide-react";

export function DetailPanel() {
  const {
    isPinned,
    isPopout,
    width,
    selectedId,
    selectedType,
    closeDetail,
    togglePin,
    togglePopout,
    setWidth,
  } = useDetailStore();

  const resizeRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const startX = e.clientX;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = startX - ev.clientX;
        setWidth(width + delta);
        (window as unknown as Record<string, number>).__detailStartX = ev.clientX;
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width, setWidth]
  );

  if (isPopout) {
    return null; // Popout window managed by Tauri
  }

  // If not pinned, clicking outside closes
  const panel = (
    <aside
      className="bg-white border-l border-panel-border flex flex-col shrink-0 overflow-hidden"
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-panel-border bg-gray-50 shrink-0">
        <span className="text-sm font-medium truncate">
          {selectedType === "ip" ? "IP 详情" : "端口详情"}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={togglePin} className="p-1 hover:bg-gray-200 rounded" title={isPinned ? "取消钉住" : "钉住"}>
            {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button onClick={togglePopout} className="p-1 hover:bg-gray-200 rounded" title="弹出独立窗口">
            <ExternalLink size={14} />
          </button>
          <button onClick={closeDetail} className="p-1 hover:bg-gray-200 rounded" title="关闭">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {selectedType === "ip" && <IpDetail ipId={selectedId ?? ""} />}
        {selectedType === "port" && <PortDetail portId={selectedId ?? ""} />}
      </div>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={onMouseDown}
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-400 z-10"
        style={{ left: -2 }}
      />
    </aside>
  );

  return panel;
}
