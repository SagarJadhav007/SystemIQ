import { Handle, Position } from "reactflow";

export default function LBNode() {
  return (
    <div className="px-3 py-2 bg-orange-950 border-2 border-orange-500 rounded-lg text-orange-200 text-xs font-medium shadow-lg shadow-orange-900/30">
      ⚖️ Load Balancer
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}