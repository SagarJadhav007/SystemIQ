const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

const NODES = [
  { label: "🌐 API Gateway", type: "api" },
  { label: "🗄️ Database",    type: "db" },
  { label: "⚡ Cache",        type: "cache" },
  { label: "⚖️ Load Balancer",type: "lb" },
  { label: "📦 CDN",          type: "cdn" },
  { label: "📨 Message Queue",type: "queue" },
];

export default function Sidebar() {
  return (
    <div className="w-44 bg-gray-900 border-r border-gray-800 p-3 flex flex-col gap-1 shrink-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
        Components
      </p>
      {NODES.map(({ label, type }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg cursor-grab text-gray-200 text-xs transition-colors select-none"
        >
          {label}
        </div>
      ))}
    </div>
  );
}