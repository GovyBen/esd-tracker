export interface MergeConflict {
  entityType: string;
  entityId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  resolved: boolean;
  resolution?: "local" | "remote" | "manual";
  manualValue?: unknown;
}

export interface MergeResult {
  conflicts: MergeConflict[];
  autoResolved: number;
  totalEntities: number;
}

/**
 * Compare two values and return true if they differ.
 */
export function valuesDiffer(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (a == null && b == null) return false;
  return JSON.stringify(a) !== JSON.stringify(b);
}

/**
 * Compare two entity records field by field.
 */
export function diffEntities(
  entityType: string,
  local: Record<string, unknown>,
  remote: Record<string, unknown>
): MergeConflict[] {
  const conflicts: MergeConflict[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    if (key === "updatedAt" || key === "createdAt") continue;
    if (valuesDiffer(local[key], remote[key])) {
      conflicts.push({
        entityType,
        entityId: String(local.id || local.portId || ""),
        field: key,
        localValue: local[key],
        remoteValue: remote[key],
        resolved: false,
      });
    }
  }

  return conflicts;
}

/**
 * Two-way merge engine.
 * Placeholder - full implementation in Phase 5.
 */
export function mergeDatabases(
  localData: Record<string, unknown[]>,
  remoteData: Record<string, unknown[]>
): MergeResult {
  const conflicts: MergeConflict[] = [];
  let autoResolved = 0;
  let totalEntities = 0;

  return {
    conflicts,
    autoResolved,
    totalEntities,
  };
}
