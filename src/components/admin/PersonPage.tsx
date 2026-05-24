import { useState } from "react";
import { getAllPersons, createPerson, deletePerson, getAllRoles, createRole, deleteRole } from "../../db/queries/technology";
import { getAllChipTags } from "../../db/queries/ip";
import { getDB, saveDB } from "../../db/persistence";
import { generateId } from "../../lib/uuid";
import { Plus, Trash2 } from "lucide-react";

export function PersonPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonId, setNewPersonId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [tab, setTab] = useState<"person" | "role" | "chiptag">("person");
  const [newTagName, setNewTagName] = useState("");

  const persons = getAllPersons();
  const roles = getAllRoles();
  const chipTags = getAllChipTags();
  const refresh = () => setRefreshKey((k) => k + 1);

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    createPerson({ name: newPersonName.trim(), employeeId: newPersonId.trim() || null });
    setNewPersonName(""); setNewPersonId(""); refresh();
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    createRole({ name: newRoleName.trim() }); setNewRoleName(""); refresh();
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const db = getDB();
    const exists = db.chipTags.some((t) => t.name === newTagName.trim());
    if (!exists) {
      db.chipTags.push({ id: generateId(), name: newTagName.trim() });
      saveDB();
    }
    setNewTagName(""); refresh();
  };

  const handleDeleteTag = (id: string) => {
    const db = getDB();
    db.chipTags = db.chipTags.filter((t) => t.id !== id);
    saveDB();
    refresh();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">角色、人员与标签管理</h2>

      <div className="flex gap-1 bg-gray-100 rounded-md p-1 mb-4 w-fit">
        {(["person", "role", "chiptag"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded ${tab === t ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
            {t === "person" ? "人员" : t === "role" ? "角色" : "芯片标签"}
          </button>
        ))}
      </div>

      {tab === "person" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPerson()}
              placeholder="姓名" className="w-32 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
            <input value={newPersonId} onChange={(e) => setNewPersonId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPerson()}
              placeholder="工号" className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
            <button onClick={handleAddPerson} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 添加</button>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-4 py-2 text-gray-500 font-medium">姓名</th><th className="text-left px-4 py-2 text-gray-500 font-medium">工号</th><th className="text-right px-4 py-2 text-gray-500 font-medium">操作</th></tr></thead>
              <tbody>
                {persons.map((p) => (<tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="px-4 py-2 text-gray-700">{p.name}</td><td className="px-4 py-2 text-gray-500">{p.employeeId || "-"}</td><td className="px-4 py-2 text-right"><button onClick={() => { deletePerson(p.id); refresh(); }} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "role" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
              placeholder="角色名称..." className="flex-1 max-w-xs border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
            <button onClick={handleAddRole} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 添加</button>
          </div>
          <div className="space-y-1">
            {roles.map((r) => (<div key={r.id} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md"><span className="text-sm text-gray-700">{r.name}</span><button onClick={() => { deleteRole(r.id); refresh(); }} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div>))}
          </div>
        </div>
      )}

      {tab === "chiptag" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="标签名称 如 Phoenix" className="flex-1 max-w-xs border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400" />
            <button onClick={handleAddTag} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"><Plus size={14} /> 添加</button>
          </div>
          <div className="space-y-1">
            {chipTags.map((t) => (<div key={t.id} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md"><span className="text-sm text-gray-700">{t.name}</span><button onClick={() => handleDeleteTag(t.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></div>))}
          </div>
        </div>
      )}
    </div>
  );
}
