import { useState } from "react";
import { useTreeStore } from "../../stores/treeStore";
import { NewIPDialog } from "./NewIPDialog";
import { Search, Plus, ListPlus } from "lucide-react";

export function TreeToolbar() {
  const { searchQuery, setSearchQuery } = useTreeStore();
  const [showNewIP, setShowNewIP] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2.5 py-1.5 flex-1 max-w-xs">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 IP / 端口..."
            className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowNewIP(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={14} />
          新建 IP
        </button>
      </div>
      {showNewIP && <NewIPDialog onClose={() => setShowNewIP(false)} />}
    </>
  );
}
