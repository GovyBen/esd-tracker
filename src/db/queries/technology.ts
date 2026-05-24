import type { TechnologyRecord, TestStandardRecord, ExcitationModeRecord, PersonRecord, RoleRecord, ChecklistTemplateRecord, StatusWorkflowRecord } from "../../types";
import { generateId, nowISO } from "../../lib/uuid";
import { getDB, saveDB } from "../persistence";

// ============ Technology ============
export function getAllTechnologies(): TechnologyRecord[] { return getDB().technologies; }
export function createTechnology(data: Partial<TechnologyRecord>): TechnologyRecord {
  const db = getDB();
  const t: TechnologyRecord = { id: generateId(), name: data.name || "", specs: data.specs || {}, pdkVersions: data.pdkVersions || [], createdAt: nowISO(), updatedAt: nowISO() };
  db.technologies.push(t); saveDB(); return t;
}
export function deleteTechnology(id: string): void {
  const db = getDB(); const idx = db.technologies.findIndex((t) => t.id === id);
  if (idx >= 0) { db.technologies.splice(idx, 1); saveDB(); }
}

// ============ Test Standard (now with params) ============
export function getStandardsByTech(techId: string): TestStandardRecord[] {
  return getDB().testStandards.filter((s) => s.technologyId === techId);
}
export function createStandard(data: Partial<TestStandardRecord>): TestStandardRecord {
  const db = getDB();
  const s: TestStandardRecord = { id: generateId(), technologyId: data.technologyId || "", name: data.name || "", type: data.type || null, params: data.params || {}, createdAt: nowISO(), updatedAt: nowISO() };
  db.testStandards.push(s); saveDB(); return s;
}

// ============ Excitation Mode (deprecated, kept for compat) ============
export function getModesByStandard(standardId: string): ExcitationModeRecord[] {
  return getDB().excitationModes.filter((m) => m.testStandardId === standardId);
}
export function createMode(data: Partial<ExcitationModeRecord>): ExcitationModeRecord {
  const db = getDB();
  const m: ExcitationModeRecord = { id: generateId(), testStandardId: data.testStandardId || "", name: data.name || "", type: data.type || null, params: data.params || {}, createdAt: nowISO(), updatedAt: nowISO() };
  db.excitationModes.push(m); saveDB(); return m;
}

// ============ Person ============
export function getAllPersons(): PersonRecord[] { return getDB().persons; }
export function createPerson(data: Partial<PersonRecord>): PersonRecord {
  const db = getDB();
  const p: PersonRecord = { id: generateId(), name: data.name || "", employeeId: data.employeeId || null, email: data.email || null, createdAt: nowISO(), updatedAt: nowISO() };
  db.persons.push(p); saveDB(); return p;
}
export function deletePerson(id: string): void {
  const db = getDB(); const idx = db.persons.findIndex((p) => p.id === id);
  if (idx >= 0) { db.persons.splice(idx, 1); saveDB(); }
}

// ============ Role ============
export function getAllRoles(): RoleRecord[] { return getDB().roles; }
export function createRole(data: Partial<RoleRecord>): RoleRecord {
  const db = getDB();
  const r: RoleRecord = { id: generateId(), name: data.name || "", createdAt: nowISO(), updatedAt: nowISO() };
  db.roles.push(r); saveDB(); return r;
}
export function deleteRole(id: string): void {
  const db = getDB(); const idx = db.roles.findIndex((r) => r.id === id);
  if (idx >= 0) { db.roles.splice(idx, 1); saveDB(); }
}

// ============ Checklist Templates ============
export function getAllChecklistTemplates(): ChecklistTemplateRecord[] { return getDB().checklistTemplates; }
export function createChecklistTemplate(data: Partial<ChecklistTemplateRecord>): ChecklistTemplateRecord {
  const db = getDB();
  const t: ChecklistTemplateRecord = { id: generateId(), name: data.name || "", items: data.items || [], createdAt: nowISO(), updatedAt: nowISO() };
  db.checklistTemplates.push(t); saveDB(); return t;
}

// ============ Status Workflow ============
export function getAllWorkflows(): StatusWorkflowRecord[] { return getDB().statusWorkflows; }
export function createWorkflow(data: Partial<StatusWorkflowRecord>): StatusWorkflowRecord {
  const db = getDB();
  const w: StatusWorkflowRecord = { id: generateId(), name: data.name || "", states: data.states || [], transitions: data.transitions || [], derivationRules: data.derivationRules || [] };
  db.statusWorkflows.push(w); saveDB(); return w;
}
