import { Handle, Position } from "reactflow";

export default function CDNNode() {
  return (
    <div className="px-3 py-2 bg-cyan-950 border-2 border-cyan-500 rounded-lg text-cyan-200 text-xs font-medium shadow-lg shadow-cyan-900/30">
      📦 CDN
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}