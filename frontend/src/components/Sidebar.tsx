const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

const Item = ({ label, type }: { label: string; type: string }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, type)}
    className="p-2 mb-2 bg-gray-100 rounded cursor-grab hover:bg-gray-200"
  >
    {label}
  </div>
);

export default function Sidebar() {
  return (
    <div className="w-48 bg-white border-r p-2">
      <h3 className="text-sm font-semibold mb-2">Components</h3>

      <Item label="🌐 API Gateway" type="api" />
      <Item label="🗄️ Database" type="db" />
      <Item label="⚡ Cache" type="cache" />
      <Item label="⚖️ Load Balancer" type="lb" />
      <Item label="📦 CDN" type="cdn" />
    </div>
  );
}