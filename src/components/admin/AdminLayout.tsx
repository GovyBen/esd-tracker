import { useNavStore } from "../../stores/navStore";
import { TechnologyPage } from "./TechnologyPage";
import { ExcitationPage } from "./ExcitationPage";
import { PersonPage } from "./PersonPage";
import { ChecklistTemplatesPage } from "./ChecklistTemplatesPage";
import { WorkflowPage } from "./WorkflowPage";
import { FlaskConical, Zap, Users, ClipboardCheck, GitBranch } from "lucide-react";

const adminPages = [
  { id: "technology", label: "工艺", icon: FlaskConical, component: TechnologyPage },
  { id: "excitation", label: "激励", icon: Zap, component: ExcitationPage },
  { id: "person", label: "人员与标签", icon: Users, component: PersonPage },
  { id: "checklist", label: "Checklist 模板", icon: ClipboardCheck, component: ChecklistTemplatesPage },
  { id: "workflow", label: "状态工作流", icon: GitBranch, component: WorkflowPage },
];

export function AdminLayout() {
  const { adminSubView, setAdminSubView } = useNavStore();
  const active = adminSubView ?? "technology";
  const ActiveComponent = adminPages.find((p) => p.id === active)?.component ?? TechnologyPage;

  return (
    <div className="flex h-full">
      <div className="w-48 shrink-0 border-r border-gray-200 bg-white p-3 space-y-1">
        {adminPages.map((page) => {
          const Icon = page.icon;
          return (
            <button key={page.id} onClick={() => setAdminSubView(page.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${active === page.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={16} /> {page.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto p-6"><ActiveComponent /></div>
    </div>
  );
}
