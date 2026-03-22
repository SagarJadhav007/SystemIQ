import { Handle, Position } from "reactflow";

export default function ApiNode() {
  return (
    <div className="px-3 py-2 bg-blue-100 border-2 border-blue-500 rounded">
      🌐 API
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}