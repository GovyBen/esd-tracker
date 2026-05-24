import type { PortEventRecord } from "../types";

// In-memory store for milestone presets (synced to localStorage)
const STORAGE_KEY = "esd-milestone-presets";

export interface MilestonePreset {
  id: string;
  name: string;
  milestones: { title: string; order: number }[];
}

export function getMilestonePresets(): MilestonePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultPresets();
  } catch {
    return getDefaultPresets();
  }
}

export function saveMilestonePresets(presets: MilestonePreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

function getDefaultPresets(): MilestonePreset[] {
  return [{
    id: "default",
    name: "标准ESD流程",
    milestones: [
      { title: "Testbench READY", order: 0 },
      { title: "仿真 READY", order: 1 },
      { title: "预评审 READY", order: 2 },
      { title: "报告 READY", order: 3 },
    ],
  }];
}

// Event type extension: milestone vs sub_event
export type EventType = "milestone" | "sub_event";

// Extended event record (runtime only, DB stores in notes JSON)
export interface EventWithMeta extends PortEventRecord {
  eventType: EventType;
  parentMilestoneId?: string;
}

// Helper to parse event metadata from notes
export function getEventMeta(event: PortEventRecord): { eventType: EventType; parentMilestoneId?: string } {
  try {
    if (event.notes && event.notes.startsWith("{")) {
      const meta = JSON.parse(event.notes);
      return { eventType: meta.eventType || "milestone", parentMilestoneId: meta.parentMilestoneId };
    }
  } catch {}
  return { eventType: "milestone" };
}

// Compute progress based only on milestones
export function computeMilestoneProgress(events: PortEventRecord[]): number {
  const milestones = events.filter((e) => {
    const meta = getEventMeta(e);
    return meta.eventType === "milestone" && e.status !== "skipped";
  });
  if (milestones.length === 0) return 0;
  const done = milestones.filter((e) => e.status === "completed").length;
  return Math.round((done / milestones.length) * 100);
}
