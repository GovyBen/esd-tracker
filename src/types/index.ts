// TypeScript types for ESD Tracking Hub

export interface PersonRecord {
  id: string;
  name: string;
  employeeId: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPRoleAssignmentRecord {
  ipId: string;
  roleId: string;
  personId: string;
}

export interface TechnologyRecord {
  id: string;
  name: string;
  specs: Record<string, string> | null;
  pdkVersions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestStandardRecord {
  id: string;
  technologyId: string | null;
  name: string;
  type: string | null;
  params: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExcitationModeRecord {
  id: string;
  testStandardId: string;
  name: string;
  type: string | null;
  params: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChipTagRecord {
  id: string;
  name: string;
}

export interface IPBlockRecord {
  chipTagIds: string[];
  id: string;
  name: string;
  extendedDdlDate: string | null;
  extensions: { date: string; reason: string }[];
  status: string;
  isDemo: boolean;
  technologyId: string | null;
  startDate: string | null;
  ddlDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortRecord {
  cdmStandardId: string | null;
  hbmStandardId: string | null;
  id: string;
  ipId: string;
  name: string;
  status: string;
  statusWorkflowId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortEventRecord {
  id: string;
  portId: string;
  title: string;
  order: number;
  status: string;
  plannedDate: string | null;
  completedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortDiodeInfoRecord {
  portId: string;
  diodeType: string | null;
  params: Record<string, string> | null;
  emxParasitics: string | null;
  p2pParasitics: string | null;
  clampParasitics: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface ChecklistTemplateRecord {
  id: string;
  name: string;
  items: ChecklistItemType[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortChecklistRecord {
  portId: string;
  templateId: string | null;
  items: ChecklistItemType[] | null;
  updatedAt: string;
}

export interface StatusWorkflowRecord {
  id: string;
  name: string;
  states: WorkflowStateType[] | null;
  transitions: WorkflowTransitionType[] | null;
  derivationRules: DerivationRuleType[] | null;
}

export interface CalendarEventRecord {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  reminderBefore: number | null;
  portId: string | null;
  ipId: string | null;
  completed: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryRecord {
  id: string;
  portId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

export interface ChecklistItemType {
  id: string;
  label: string;
  linkedField: string | null;
  applicable: boolean;
  defaultChecked: boolean;
  order: number;
  completed?: boolean;
  completedDate?: string | null;
}

export interface WorkflowStateType {
  id: string;
  name: string;
  color: string;
}

export interface WorkflowTransitionType {
  from: string;
  to: string;
}

export interface DerivationRuleType {
  priority: number;
  eventStatuses: string[];
  portStatus: string;
}

// Tree node for react-arborist
export interface TreeNode {
  id: string;
  name: string;
  type: "ip" | "port";
  children?: TreeNode[];
  // IP-specific
  technology?: string | null;
  chipTags?: string[] | null;
  assignees?: string | null;
  startDate?: string | null;
  ddlDate?: string | null;
  // Port-specific
  status?: string;
  eventProgress?: number;
  lastEventDate?: string | null;
  lastEventPerson?: string | null;
}

// Navigation
export type NavView = "tree" | "kanban" | "calendar" | "admin" | "import" | "settings";

