interface IpBarProps {
  ipId: string;
  ipName: string;
  startDate: string;
  ddlDate: string;
  progress: number;
}

export function IpBar({ ipId, ipName, startDate, ddlDate, progress }: IpBarProps) {
  return (
    <div className="relative h-6 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 transition-colors min-w-[40px]"
      title={`${ipName}: ${startDate} ~ ${ddlDate} (${progress}%)`}
    >
      <div className="absolute inset-y-0 left-0 bg-blue-400 rounded" style={{ width: `${progress}%` }} />
      <div className="absolute inset-0 flex items-center px-1">
        <span className="text-xs text-blue-800 truncate">{ipName}</span>
      </div>
    </div>
  );
}
