import type { PortEventRecord } from "../../types";
import { generateId, nowISO } from "../../lib/uuid";
import { getDB, saveDB } from "../persistence";

export function getEventsByPortId(portId: string): PortEventRecord[] {
  return getDB().events.filter((e) => e.portId === portId);
}

export function createEvent(data: Partial<PortEventRecord>): PortEventRecord {
  const db = getDB();
  const now = nowISO();
  const event: PortEventRecord = {
    id: generateId(),
    portId: data.portId || "",
    title: data.title || "New Event",
    order: data.order ?? db.events.filter((e) => e.portId === data.portId).length,
    status: data.status || "pending",
    plannedDate: data.plannedDate ?? null,
    completedDate: data.completedDate ?? null,
    notes: data.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  db.events.push(event);
  saveDB();
  return event;
}

export function updateEvent(id: string, data: Partial<PortEventRecord>): PortEventRecord | null {
  const db = getDB();
  const idx = db.events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  db.events[idx] = { ...db.events[idx], ...data, updatedAt: nowISO() };
  saveDB();
  return db.events[idx];
}

export function deleteEvent(id: string): boolean {
  const db = getDB();
  const idx = db.events.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  db.events.splice(idx, 1);
  saveDB();
  return true;
}
