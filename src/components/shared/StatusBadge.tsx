interface StatusBadgeProps {
  status: string;
  color?: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "未开始", color: "#9ca3af" },
  in_progress: { label: "进行中", color: "#3b82f6" },
  completed: { label: "已完成", color: "#22c55e" },
  skipped: { label: "跳过", color: "#a855f7" },
  blocked: { label: "阻塞", color: "#ef4444" },
  problem: { label: "问题", color: "#ef4444" },
};

export function StatusBadge({ status, color }: StatusBadgeProps) {
  const info = statusMap[status];
  const bg = color ?? info?.color ?? "#9ca3af";
  const label = info?.label ?? status;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg + "20", color: bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bg }} />
      {label}
    </span>
  );
}
