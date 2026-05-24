import type { NavView } from "../../types";
import { useNavStore } from "../../stores/navStore";
import { useDBStore } from "../../stores/dbStore";
import {
  FolderTree,
  LayoutGrid,
  Calendar,
  Settings2,
  FileUp,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavSidebarProps {
  expanded: boolean;
  onToggleExpand: () => void;
}

const navItems: { id: NavView; label: string; icon: typeof FolderTree }[] = [
  { id: "tree", label: "树形视图", icon: FolderTree },
  { id: "kanban", label: "看板视图", icon: LayoutGrid },
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "admin", label: "管理后台", icon: Settings2 },
  { id: "import", label: "导入/导出", icon: FileUp },
  { id: "settings", label: "设置", icon: Wrench },
];

export function NavSidebar({ expanded, onToggleExpand }: NavSidebarProps) {
  const { currentView, navigate } = useNavStore();
  const { dbName, lastModified } = useDBStore();

  return (
    <aside
      className="flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-200 shrink-0"
      style={{ width: expanded ? "200px" : "56px" }}
    >
      {/* Toggle */}
      <button
        onClick={onToggleExpand}
        className="h-10 flex items-center justify-center hover:bg-sidebar-hover text-sidebar-muted"
        title={expanded ? "折叠" : "展开"}
      >
        {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Nav items */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                ${active ? "bg-sidebar-active text-white" : "hover:bg-sidebar-hover text-sidebar-muted hover:text-sidebar-text"}
                ${!expanded ? "justify-center" : ""}`}
              title={item.label}
            >
              <Icon size={20} />
              {expanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom: DB info */}
      <div className={`border-t border-sidebar-hover p-2 text-xs text-sidebar-muted ${!expanded ? "text-center" : ""}`}>
        {expanded && dbName ? (
          <>
            <div className="truncate">{dbName}</div>
            <div className="truncate opacity-60">{lastModified}</div>
          </>
        ) : expanded ? (
          <div className="opacity-60">未打开数据库</div>
        ) : null}
      </div>
    </aside>
  );
}
