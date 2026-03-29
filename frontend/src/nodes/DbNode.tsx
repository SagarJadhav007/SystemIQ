import { Handle, Position } from "reactflow";

export default function DbNode({ data }: any) {
  return (
    <div className="px-3 py-2 bg-green-950 border-2 border-green-500 rounded-lg text-green-200 text-xs font-medium shadow-lg shadow-green-900/30">
      🗄️ DB {data?.subtype ? `(${data.subtype})` : ""}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}