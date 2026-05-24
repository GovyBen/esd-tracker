import { getDB, saveDB } from "../persistence";

export interface DiodeEntry {
  id: string;
  level: "primary" | "secondary";
  name: string;
  modelNumber: string;
  technologyName: string;
}

export interface P2PEntry {
  id: string;
  name: string;
  value: string;
}

export interface ClampEntry {
  id: string;
  modelNumber: string;
  hasParasitics: boolean;
}

export interface ExtendedEmxData {
  appliedDiodes: { diodeId: string; modelNumber: string }[];
  p2pItems: P2PEntry[];
  clampItems: ClampEntry[];
  diodeType: string;
  emxParasitics: string;
  p2pParasitics: string;
  clampParasitics: string;
  notes: string;
}

// Static diode catalog (not per-port)
let diodeCatalog: DiodeEntry[] = [
  { id: "d1", level: "primary", name: "GGNMOS", modelNumber: "GGNMOS-STD", technologyName: "N5" },
  { id: "d2", level: "primary", name: "GDPNOS", modelNumber: "GDPNOS-STD", technologyName: "N5" },
  { id: "d3", level: "secondary", name: "DUALDIODE", modelNumber: "DUALDIODE-HIGHSPEED-X2", technologyName: "N5" },
  { id: "d4", level: "secondary", name: "DIODE-STACK", modelNumber: "DIODE-STACK-3V3", technologyName: "N3" },
  { id: "d5", level: "primary", name: "SCR", modelNumber: "SCR-LOWTRIG", technologyName: "N5" },
];

export function getAllDiodes(): DiodeEntry[] { return diodeCatalog; }
export function getDiodesByTechnology(techName: string): DiodeEntry[] {
  const same = diodeCatalog.filter((d) => d.technologyName === techName);
  const other = diodeCatalog.filter((d) => d.technologyName !== techName);
  return [...same, ...other];
}
export function addDiode(data: Omit<DiodeEntry, "id">): DiodeEntry {
  const d: DiodeEntry = { ...data, id: `d${diodeCatalog.length + 1}` };
  diodeCatalog.push(d);
  return d;
}

// Per-port EMX data
export function getEmxData(portId: string): ExtendedEmxData {
  const db = getDB();
  const existing = db.emxData[portId];
  if (existing) return existing;
  const d: ExtendedEmxData = {
    appliedDiodes: [], p2pItems: [], clampItems: [],
    diodeType: "", emxParasitics: "", p2pParasitics: "", clampParasitics: "", notes: "",
  };
  db.emxData[portId] = d;
  return d;
}

export function saveEmxData(portId: string, data: Partial<ExtendedEmxData>): ExtendedEmxData {
  const db = getDB();
  const existing = db.emxData[portId] || {
    appliedDiodes: [], p2pItems: [], clampItems: [],
    diodeType: "", emxParasitics: "", p2pParasitics: "", clampParasitics: "", notes: "",
  };
  db.emxData[portId] = { ...existing, ...data };
  saveDB();
  return db.emxData[portId];
}
