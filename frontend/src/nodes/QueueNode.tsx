import { Handle, Position } from "reactflow";

export default function QueueNode() {
  return (
    <div className="px-3 py-2 bg-pink-950 border-2 border-pink-500 rounded-lg text-pink-200 text-xs font-medium shadow-lg shadow-pink-900/30">
      📨 Message Queue
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}