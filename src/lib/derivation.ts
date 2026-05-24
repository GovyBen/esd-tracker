import type { PortEventRecord, DerivationRuleType } from "../types";

/**
 * Port status derivation engine.
 * Maps event statuses to port status based on configured rules.
 */
export function derivePortStatus(
  events: PortEventRecord[],
  rules: DerivationRuleType[]
): string {
  const activeEvents = events.filter((e) => e.status !== "skipped");
  const activeStatuses = new Set(activeEvents.map((e) => e.status));

  // Sort rules by priority (lower number = higher priority)
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    const allMatch = rule.eventStatuses.every((s) => activeStatuses.has(s));
    const anyMatch = rule.eventStatuses.some((s) => activeStatuses.has(s));

    // Check if rule conditions are met
    if (rule.eventStatuses.length > 0) {
      if (allMatch || anyMatch) {
        return rule.portStatus;
      }
    }
  }

  // Default rules if no custom rules configured
  if (activeStatuses.has("blocked") || activeStatuses.has("problem")) {
    return "problem";
  }
  if (activeStatuses.has("in_progress")) {
    return "in_progress";
  }
  if (activeEvents.length > 0 && activeEvents.every((e) => e.status === "completed")) {
    return "completed";
  }

  return "pending";
}

/**
 * Compute event progress (completed / total non-skipped).
 */
export function computeEventProgress(events: PortEventRecord[]): number {
  const active = events.filter((e) => e.status !== "skipped");
  if (active.length === 0) return 0;
  const completed = active.filter((e) => e.status === "completed").length;
  return Math.round((completed / active.length) * 100);
}
