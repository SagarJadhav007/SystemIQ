import { Handle, Position } from "reactflow";

export default function DbNode({ data }: any) {
  return (
    <div className="px-3 py-2 bg-green-100 border-2 border-green-500 rounded">
      🗄️ DB ({data?.subtype || "SQL"})
      <Handle type="target" position={Position.Left} />
    </div>
  );
}