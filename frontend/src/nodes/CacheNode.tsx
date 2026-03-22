import { Handle, Position } from "reactflow";

export default function CacheNode() {
  return (
    <div className="px-3 py-2 bg-yellow-100 border-2 border-yellow-500 rounded">
      ⚡ Cache
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}