import { generateId, nowISO } from "../lib/uuid";

/**
 * Initialize a fresh database with seed data.
 * Called when a new .db file is created.
 */
export async function initDatabase(): Promise<void> {
  console.log("Database init: tables should be created via Drizzle migrations.");
}

/**
 * Create default seed data for a new database.
 */
export function getSeedData() {
  const now = nowISO();

  // Default status workflow
  const defaultWorkflowId = generateId();
  const defaultWorkflow = {
    id: defaultWorkflowId,
    name: "默认工作流",
    states: [
      { id: "pending", name: "未开始", color: "#9ca3af" },
      { id: "in_progress", name: "进行中", color: "#3b82f6" },
      { id: "completed", name: "已完成", color: "#22c55e" },
      { id: "problem", name: "问题", color: "#ef4444" },
      { id: "blocked", name: "阻塞", color: "#ef4444" },
    ],
    transitions: [
      { from: "pending", to: "in_progress" },
      { from: "in_progress", to: "completed" },
      { from: "in_progress", to: "problem" },
      { from: "in_progress", to: "blocked" },
      { from: "problem", to: "in_progress" },
      { from: "problem", to: "completed" },
      { from: "blocked", to: "in_progress" },
      { from: "completed", to: "in_progress" },
    ],
    derivationRules: [
      { priority: 1, eventStatuses: ["blocked"], portStatus: "blocked" },
      { priority: 2, eventStatuses: ["in_progress"], portStatus: "in_progress" },
      { priority: 3, eventStatuses: ["completed"], portStatus: "completed" },
      { priority: 4, eventStatuses: ["pending"], portStatus: "pending" },
    ],
  };

  return {
    defaultWorkflow,
    now,
  };
}
