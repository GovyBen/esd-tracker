import type { PortChecklistRecord, ChecklistItemType } from "../../types";
import { generateId, nowISO } from "../../lib/uuid";
import { getDB, saveDB } from "../persistence";

export function getChecklist(portId: string): PortChecklistRecord {
  const db = getDB();
  return db.checklists[portId] || { portId, templateId: null, items: [], updatedAt: nowISO() };
}

export function saveChecklist(portId: string, data: Partial<PortChecklistRecord>): PortChecklistRecord {
  const db = getDB();
  const existing = db.checklists[portId] || { portId, templateId: null, items: [], updatedAt: nowISO() };
  db.checklists[portId] = { ...existing, ...data, updatedAt: nowISO() };
  saveDB();
  return db.checklists[portId];
}

export function addChecklistItem(portId: string, item: ChecklistItemType): PortChecklistRecord {
  const cl = getChecklist(portId);
  const items = [...(cl.items || []), { ...item, id: item.id || generateId() }];
  return saveChecklist(portId, { items });
}

export function updateChecklistItem(portId: string, itemId: string, data: Partial<ChecklistItemType>): PortChecklistRecord {
  const cl = getChecklist(portId);
  const items = (cl.items || []).map((item) => item.id === itemId ? { ...item, ...data } : item);
  return saveChecklist(portId, { items });
}

export function deleteChecklistItem(portId: string, itemId: string): PortChecklistRecord {
  const cl = getChecklist(portId);
  const items = (cl.items || []).filter((item) => item.id !== itemId);
  return saveChecklist(portId, { items });
}
