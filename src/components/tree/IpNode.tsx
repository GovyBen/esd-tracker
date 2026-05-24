import type { TreeNode } from "../../types";
import { Cpu } from "lucide-react";

interface IpNodeProps {
  node: TreeNode;
  expanded: boolean;
}

export function IpNode({ node, expanded }: IpNodeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors">
      <Cpu size={16} className="text-blue-500 shrink-0" />
      <span className="text-sm font-medium">{node.name}</span>
      {node.technology && (
        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{node.technology}</span>
      )}
      {node.chipTags?.map((tag) => (
        <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{tag}</span>
      ))}
      {node.assignees && (
        <span className="text-xs text-gray-400 ml-auto">{node.assignees}</span>
      )}
      <span className="text-xs text-gray-300">{expanded ? "\u25BC" : "\u25B6"}</span>
    </div>
  );
}
