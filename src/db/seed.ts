import { generateId, nowISO } from "../lib/uuid";
import type { IPBlockRecord, PortRecord, ChipTagRecord } from "../types";
import dayjs from "dayjs";

export function generateDemoData() {
  const now = nowISO(); const today = dayjs();

  const chipTags: ChipTagRecord[] = [
    { id: generateId(), name: "Phoenix" }, { id: generateId(), name: "Titan" }, { id: generateId(), name: "Nova" },
  ];

  const techIds = { N5: generateId(), N3: generateId(), N7: generateId() };
  const technologies = [
    { id: techIds["N5"], name: "N5", specs: {}, pdkVersions: ["M1-M5", "M1-M8"], createdAt: now, updatedAt: now },
    { id: techIds["N3"], name: "N3", specs: {}, pdkVersions: ["M1-M3"], createdAt: now, updatedAt: now },
    { id: techIds["N7"], name: "N7", specs: {}, pdkVersions: [], createdAt: now, updatedAt: now },
  ];

  const standards = [
    { id: generateId(), technologyId: null, name: "CDM75V1A", type: "CDM", params: { R1: "1.5k", L1: "2nH", C1: "100fF", R2: "-", C2: "-" }, createdAt: now, updatedAt: now },
    { id: generateId(), technologyId: null, name: "CDM100V2A", type: "CDM", params: { R1: "1k", L1: "3nH", C1: "-", R2: "-", C2: "-" }, createdAt: now, updatedAt: now },
    { id: generateId(), technologyId: null, name: "HBM2kV", type: "HBM", params: { R1: "-", L1: "-", C1: "-", R2: "1.5k", C2: "100pF" }, createdAt: now, updatedAt: now },
    { id: generateId(), technologyId: null, name: "HBM4kV", type: "HBM", params: { R1: "-", L1: "-", C1: "-", R2: "2k", C2: "150pF" }, createdAt: now, updatedAt: now },
  ];

  const ips: IPBlockRecord[] = [
    { id: generateId(), name: "USB3_PHY", technologyId: techIds["N5"], startDate: today.format("YYYY-MM-DD"), ddlDate: today.add(45, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [{ date: today.add(60, "day").format("YYYY-MM-DD"), reason: "等待EMX寄生" }], notes: "USB 3.2 Gen2", chipTagIds: [chipTags[0].id, chipTags[1].id], status: "in_progress", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
    { id: generateId(), name: "DDR5_CTRL", technologyId: techIds["N3"], startDate: today.add(-15, "day").format("YYYY-MM-DD"), ddlDate: today.add(30, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [], notes: "DDR5 controller", chipTagIds: [chipTags[1].id], status: "in_progress", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
    { id: generateId(), name: "PCIE6_PHY", technologyId: techIds["N5"], startDate: today.add(10, "day").format("YYYY-MM-DD"), ddlDate: today.add(80, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [], notes: "PCIe 6.0", chipTagIds: [chipTags[2].id], status: "pending", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
    { id: generateId(), name: "MIPI_DSI", technologyId: techIds["N7"], startDate: today.add(-30, "day").format("YYYY-MM-DD"), ddlDate: today.add(20, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [], notes: null, chipTagIds: [], status: "completed", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
    { id: generateId(), name: "SATA_CTRL", technologyId: techIds["N5"], startDate: today.add(20, "day").format("YYYY-MM-DD"), ddlDate: today.add(70, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [], notes: "SATA controller", chipTagIds: [chipTags[0].id], status: "pending", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
    { id: generateId(), name: "HDMI_TX", technologyId: techIds["N3"], startDate: today.add(-5, "day").format("YYYY-MM-DD"), ddlDate: today.add(50, "day").format("YYYY-MM-DD"), extendedDdlDate: null, extensions: [], notes: "HDMI TX", chipTagIds: [chipTags[2].id], status: "in_progress", isDemo: true, assignments: [], createdAt: now, updatedAt: now },
  ];

  const ports: PortRecord[] = [];
  const portStatuses = ["pending", "in_progress", "completed", "problem"];
  ips.forEach((ip, ipIdx) => {
    for (let p = 0; p < 2 + ipIdx; p++) {
      ports.push({ id: generateId(), ipId: ip.id, name: `PORT_${String.fromCharCode(65 + p)}`, status: portStatuses[(ipIdx + p) % portStatuses.length], statusWorkflowId: null, notes: null, cdmStandardId: null, hbmStandardId: null, createdAt: now, updatedAt: now });
    }
  });

  const templates = [
    { id: generateId(), name: "标准ESD Checklist", items: [
      { id: generateId(), label: "二极管选型确认", linkedField: null, applicable: true, defaultChecked: false, order: 0 },
      { id: generateId(), label: "EMX寄生检查", linkedField: "emxParasitics", applicable: true, defaultChecked: false, order: 1 },
      { id: generateId(), label: "P2P带入确认", linkedField: "p2pParasitics", applicable: true, defaultChecked: false, order: 2 },
      { id: generateId(), label: "Clamp寄生检查", linkedField: "clampParasitics", applicable: true, defaultChecked: false, order: 3 },
      { id: generateId(), label: "仿真报告提交", linkedField: null, applicable: true, defaultChecked: false, order: 4 },
    ], createdAt: now, updatedAt: now },
  ];

  return { ips, ports, chipTags, technologies, standards, templates };
}
