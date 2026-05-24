import { generateDemoData } from "../db/seed";
import type {
  IPBlockRecord, PortRecord, ChipTagRecord, PortEventRecord,
  TechnologyRecord, TestStandardRecord, ExcitationModeRecord,
  PersonRecord, RoleRecord, ChecklistTemplateRecord, StatusWorkflowRecord,
  PortDiodeInfoRecord, PortChecklistRecord,
} from "../types";
import type { ExtendedEmxData } from "../db/queries/emx";
import type { MilestonePreset } from "../lib/milestones";

const DB_KEY = "esd-tracking-hub-db";
const SEED_KEY = "esd-tracking-hub-seeded";

interface Database {
  ipBlocks: IPBlockRecord[];
  ports: PortRecord[];
  chipTags: ChipTagRecord[];
  events: PortEventRecord[];
  technologies: TechnologyRecord[];
  testStandards: TestStandardRecord[];
  excitationModes: ExcitationModeRecord[];
  persons: PersonRecord[];
  roles: RoleRecord[];
  checklistTemplates: ChecklistTemplateRecord[];
  statusWorkflows: StatusWorkflowRecord[];
  emxData: Record<string, ExtendedEmxData>;
  checklists: Record<string, PortChecklistRecord>;
}

let db: Database | null = null;

function createEmptyDB(): Database {
  return {
    ipBlocks: [],
    ports: [],
    chipTags: [],
    events: [],
    technologies: [],
    testStandards: [],
    excitationModes: [],
    persons: [
      { id: "p1", name: "张三", employeeId: "E001", email: "zhangsan@example.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "p2", name: "李四", employeeId: "E002", email: "lisi@example.com", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    roles: [
      { id: "r1", name: "设计负责人", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "r2", name: "仿真工程师", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "r3", name: "审核人", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    checklistTemplates: [],
    statusWorkflows: [],
    emxData: {},
    checklists: {},
  };
}

function isSeeded(): boolean {
  try { return localStorage.getItem(SEED_KEY) === "1"; } catch { return false; }
}

function markSeeded(): void {
  try { localStorage.setItem(SEED_KEY, "1"); } catch {}
}

function loadSeedData(): void {
  const demo = generateDemoData();
  db!.ipBlocks = demo.ips;
  db!.ports = demo.ports;
  db!.chipTags = demo.chipTags;
  db!.technologies = demo.technologies;
  db!.testStandards = demo.standards;
  db!.checklistTemplates = demo.templates;
  markSeeded();
  saveDB();
}

export function loadDB(): Database {
  if (db) return db;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      db = JSON.parse(raw) as Database;
      // Reconstruct missing keys for backward compatibility
      db.emxData = db.emxData || {};
      db.checklists = db.checklists || {};
      return db;
    }
  } catch {}
  // Fresh start
  db = createEmptyDB();
  loadSeedData();
  return db;
}

export function saveDB(): void {
  if (!db) return;
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch {}
}

export function resetDB(): void {
  db = createEmptyDB();
  loadSeedData();
}

// Direct getter for query modules
export function getDB(): Database {
  return loadDB();
}
