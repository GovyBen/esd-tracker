import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

// Helper: JSON serialized as text
function jsonField<T>(name: string) {
  return text(name, { mode: "json" }).$type<T>();
}

// ============ 4.1 人员与角色 ============
export const Person = sqliteTable("person", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  employeeId: text("employee_id"),
  email: text("email"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const Role = sqliteTable("role", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const IPRoleAssignment = sqliteTable("ip_role_assignment", {
  ipId: text("ip_id").notNull(),
  roleId: text("role_id").notNull(),
  personId: text("person_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.ipId, table.roleId] }),
}));

// ============ 4.2 工艺、测试标准、激励模式 ============
export const Technology = sqliteTable("technology", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  specs: jsonField<Record<string, string>>("specs"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const TestStandard = sqliteTable("test_standard", {
  id: text("id").primaryKey(),
  technologyId: text("technology_id").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const ExcitationMode = sqliteTable("excitation_mode", {
  id: text("id").primaryKey(),
  testStandardId: text("test_standard_id").notNull(),
  name: text("name").notNull(),
  params: jsonField<Record<string, string>>("params"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============ 4.3 IP 与端口 ============
export const ChipTag = sqliteTable("chip_tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const IPBlock = sqliteTable("ip_block", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  technologyId: text("technology_id"),
  startDate: text("start_date"),
  ddlDate: text("ddl_date"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const IPChipTag = sqliteTable("ip_chip_tag", {
  ipId: text("ip_id").notNull(),
  chipTagId: text("chip_tag_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.ipId, table.chipTagId] }),
}));

export const Port = sqliteTable("port", {
  id: text("id").primaryKey(),
  ipId: text("ip_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  statusWorkflowId: text("status_workflow_id"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const IPExcitation = sqliteTable("ip_excitation", {
  ipId: text("ip_id").notNull(),
  testStandardId: text("test_standard_id").notNull(),
  excitationModeId: text("excitation_mode_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.ipId, table.testStandardId, table.excitationModeId] }),
}));

// ============ 4.4 端口事件与防护 ============
export const PortEvent = sqliteTable("port_event", {
  id: text("id").primaryKey(),
  portId: text("port_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  status: text("status").notNull().default("pending"),
  plannedDate: text("planned_date"),
  completedDate: text("completed_date"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const PortDiodeInfo = sqliteTable("port_diode_info", {
  portId: text("port_id").primaryKey(),
  diodeType: text("diode_type"),
  params: jsonField<Record<string, string>>("params"),
  emxParasitics: text("emx_parasitics"),
  p2pParasitics: text("p2p_parasitics"),
  clampParasitics: text("clamp_parasitics"),
  notes: text("notes"),
  updatedAt: text("updated_at").notNull(),
});

// ============ 4.5 Checklist ============
export const ChecklistTemplate = sqliteTable("checklist_template", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  items: jsonField<ChecklistItem[]>("items"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const PortChecklist = sqliteTable("port_checklist", {
  portId: text("port_id").primaryKey(),
  templateId: text("template_id"),
  items: jsonField<ChecklistItem[]>("items"),
  updatedAt: text("updated_at").notNull(),
});

// ============ 4.6 状态工作流 ============
export const StatusWorkflow = sqliteTable("status_workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  states: jsonField<WorkflowState[]>("states"),
  transitions: jsonField<WorkflowTransition[]>("transitions"),
  derivationRules: jsonField<DerivationRule[]>("derivation_rules"),
});

// ============ 4.7 日历 ============
export const CalendarEvent = sqliteTable("calendar_event", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  reminderBefore: integer("reminder_before"),
  portId: text("port_id"),
  ipId: text("ip_id"),
  completed: integer("completed").default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============ 4.8 历史与日志 ============
export const StatusHistory = sqliteTable("status_history", {
  id: text("id").primaryKey(),
  portId: text("port_id").notNull(),
  oldStatus: text("old_status").notNull(),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: text("changed_at").notNull(),
});

export const EventHistory = sqliteTable("event_history", {
  id: text("id").primaryKey(),
  portEventId: text("port_event_id").notNull(),
  oldStatus: text("old_status").notNull(),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: text("changed_at").notNull(),
});

// ============ 类型导出 ============
export interface ChecklistItem {
  id: string;
  label: string;
  linkedField: string | null;
  applicable: boolean;
  defaultChecked: boolean;
  order: number;
  completed?: boolean;
  completedDate?: string | null;
}

export interface WorkflowState {
  id: string;
  name: string;
  color: string;
}

export interface WorkflowTransition {
  from: string;
  to: string;
}

export interface DerivationRule {
  priority: number;
  eventStatuses: string[];
  portStatus: string;
}
