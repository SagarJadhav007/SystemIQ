import { Handle, Position } from "reactflow";

export default function CacheNode() {
  return (
    <div className="px-3 py-2 bg-yellow-950 border-2 border-yellow-500 rounded-lg text-yellow-200 text-xs font-medium shadow-lg shadow-yellow-900/30">
      ⚡ Cache
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}