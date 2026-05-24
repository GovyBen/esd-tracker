import { useState, useRef } from "react";
import { getDB, loadDB, resetDB } from "../../db/persistence";
import { Download, Upload, RefreshCw } from "lucide-react";

export function MergeWizard() {
  const backupCount = JSON.parse(localStorage.getItem('esd-db-backups') || '[]').length;
  const [importData, setImportData] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const db = getDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `esd-tracking-${now}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportResult("导出成功！文件已下载");
    setTimeout(() => setImportResult(null), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportData(ev.target?.result as string);
      setShowConfirm(true);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData) return;
    try {
      const parsed = JSON.parse(importData);
      // Validate it looks like a DB
      if (!parsed.ipBlocks || !parsed.ports) {
        setImportResult("导入失败：文件格式不正确");
        return;
      }
      const currentDB = localStorage.getItem("esd-tracking-hub-db");
      if (currentDB) {
        const backups = JSON.parse(localStorage.getItem("esd-db-backups") || "[]");
        backups.push({ date: new Date().toISOString(), data: currentDB });
        while (backups.length > 3) backups.shift();
        localStorage.setItem("esd-db-backups", JSON.stringify(backups));
      }
      localStorage.setItem("esd-tracking-hub-db", importData);
      setImportResult("导入成功！页面即将刷新...");
      setShowConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setImportResult("导入失败：JSON 解析错误");
    }
    setTimeout(() => setImportResult(null), 3000);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">数据导入与导出</h1>
      <p className="text-sm text-gray-500 mb-2">
        导出当前数据库为 JSON 文件，分享给团队成员。导入他人文件可合并到本地数据库。
      自动保留最近 3 次导入前的备份，可在浏览器 localStorage 中恢复。
      {backupCount > 0 && <span className="text-amber-600">当前备份数: {backupCount}</span>}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        {/* Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <Download size={36} className="mx-auto text-blue-500 mb-2" />
            <h3 className="text-base font-medium text-gray-700">导出数据库</h3>
            <p className="text-xs text-gray-500 mt-1">生成 JSON 文件，可发送给团队成员</p>
          </div>
          <button onClick={handleExport}
            className="w-full py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
            导出 JSON 文件
          </button>
        </div>

        {/* Import */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <Upload size={36} className="mx-auto text-green-500 mb-2" />
            <h3 className="text-base font-medium text-gray-700">导入数据库</h3>
            <p className="text-xs text-gray-500 mt-1">选择团队成员的 JSON 文件覆盖本地数据库</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium">
            选择 JSON 文件导入
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[400px] p-6">
            <h3 className="text-base font-semibold mb-2">确认导入</h3>
            <p className="text-sm text-gray-600 mb-1">此操作将覆盖本地数据库的所有数据。</p>
            <p className="text-xs text-amber-600 mb-4">建议先导出现有数据以作备份。</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowConfirm(false); setImportData(null); }} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">取消</button>
              <button onClick={handleImport} className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">确认导入</button>
            </div>
          </div>
        </div>
      )}

      {/* Result toast */}
      {importResult && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-2 rounded shadow-lg z-50">
          {importResult}
        </div>
      )}
    </div>
  );
}
