import { useState } from "react";
import { useNavStore } from "../../stores/navStore";
import { useDetailStore } from "../../stores/detailStore";
import { NavSidebar } from "./NavSidebar";
import { DetailPanel } from "./DetailPanel";
import { TreeView } from "../tree/TreeView";
import { KanbanView } from "../kanban/KanbanView";
import { CalendarView } from "../calendar/CalendarView";
import { AdminLayout } from "../admin/AdminLayout";
import { MergeWizard } from "../merge/MergeWizard";
import { SettingsPage } from "../shared/SettingsPage";

export function AppShell() {
  const { currentView } = useNavStore();
  const { isOpen } = useDetailStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const renderMainContent = () => {
    switch (currentView) {
      case "tree": return <TreeView />;
      case "kanban": return <KanbanView />;
      case "calendar": return <CalendarView />;
      case "admin": return <AdminLayout />;
      case "import": return <MergeWizard />;
      case "settings": return <SettingsPage />;
      default: return <TreeView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <NavSidebar
        expanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
      />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          {renderMainContent()}
        </div>
        {isOpen && <DetailPanel />}
      </main>
    </div>
  );
}
