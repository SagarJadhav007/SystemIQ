import { Handle, Position } from "reactflow";

export default function ApiNode() {
  return (
    <div className="px-3 py-2 bg-indigo-950 border-2 border-indigo-500 rounded-lg text-indigo-200 text-xs font-medium shadow-lg shadow-indigo-900/30">
      🌐 API Gateway
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}