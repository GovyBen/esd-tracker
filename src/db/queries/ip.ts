import type { IPBlockRecord, PortRecord, TreeNode, ChipTagRecord } from "../../types";
import { generateId, nowISO } from "../../lib/uuid";
import { getDB, saveDB } from "../persistence";

// ============ IP CRUD ============
export function getAllIPs(): IPBlockRecord[] { return getDB().ipBlocks; }
export function getIPById(id: string): IPBlockRecord | undefined { return getDB().ipBlocks.find((ip) => ip.id === id); }

export function createIP(data: Partial<IPBlockRecord>): IPBlockRecord {
  const db = getDB(); const now = nowISO();
  const ip: IPBlockRecord = {
    id: generateId(), name: data.name || "New IP", technologyId: data.technologyId ?? null,
    startDate: data.startDate ?? null, ddlDate: data.ddlDate ?? null,
    notes: data.notes ?? null, chipTagIds: data.chipTagIds || [], extendedDdlDate: data.extendedDdlDate ?? null, extensions: data.extensions || [], status: data.status || "pending", isDemo: data.isDemo || false,
    createdAt: now, updatedAt: now,
  };
  db.ipBlocks.push(ip); saveDB(); return ip;
}

export function updateIP(id: string, data: Partial<IPBlockRecord>): IPBlockRecord | null {
  const db = getDB(); const idx = db.ipBlocks.findIndex((ip) => ip.id === id);
  if (idx === -1) return null;
  db.ipBlocks[idx] = { ...db.ipBlocks[idx], ...data, updatedAt: nowISO() };
  saveDB(); return db.ipBlocks[idx];
}

export function deleteIP(id: string): boolean {
  const db = getDB(); const idx = db.ipBlocks.findIndex((ip) => ip.id === id);
  if (idx === -1) return false;
  db.ipBlocks.splice(idx, 1); db.ports = db.ports.filter((p) => p.ipId !== id);
  saveDB(); return true;
}

// ============ Port CRUD ============
export function getPortsByIpId(ipId: string): PortRecord[] { return getDB().ports.filter((p) => p.ipId === ipId); }
export function getPortById(id: string): PortRecord | undefined { return getDB().ports.find((p) => p.id === id); }

export function createPort(ipId: string, data: Partial<PortRecord>): PortRecord {
  const db = getDB(); const now = nowISO();
  const port: PortRecord = {
    id: generateId(), ipId, name: data.name || "New Port", status: data.status || "pending",
    statusWorkflowId: data.statusWorkflowId ?? null, notes: data.notes ?? null, cdmStandardId: data.cdmStandardId ?? null, hbmStandardId: data.hbmStandardId ?? null,
    createdAt: now, updatedAt: now,
  };
  db.ports.push(port); saveDB(); return port;
}

export function updatePort(id: string, data: Partial<PortRecord>): PortRecord | null {
  const db = getDB(); const idx = db.ports.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.ports[idx] = { ...db.ports[idx], ...data, updatedAt: nowISO() };
  saveDB(); return db.ports[idx];
}

export function deletePort(id: string): boolean {
  const db = getDB(); const idx = db.ports.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.ports.splice(idx, 1); saveDB(); return true;
}

export function getAllChipTags(): ChipTagRecord[] { return getDB().chipTags; }

export function getTreeNodes(): TreeNode[] {
  const db = getDB();
  return db.ipBlocks.map((ip) => {
    const ipPorts = db.ports.filter((p) => p.ipId === ip.id);
    return {
      id: ip.id, name: ip.name, type: "ip" as const, technology: null, chipTags: null,
      assignees: null, startDate: ip.startDate, ddlDate: ip.ddlDate,
      children: ipPorts.map((port, pi) => ({
        id: port.id, name: port.name, type: "port" as const,
        status: port.status, eventProgress: pi * 20,
        lastEventDate: null, lastEventPerson: null,
      })),
    };
  });
}
