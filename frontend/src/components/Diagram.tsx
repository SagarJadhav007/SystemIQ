import { useCallback, useEffect, useRef } from "react";
import { socket } from "../socket";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "./Sidebar";
import ApiNode from "../nodes/ApiNode";
import DbNode from "../nodes/DbNode";
import CacheNode from "../nodes/CacheNode";
import LBNode from "../nodes/LbNode";
import QueueNode from "../nodes/QueueNode";
import CDNNode from "../nodes/CDNNode";

const nodeTypes = {
  api: ApiNode,
  db: DbNode,
  cache: CacheNode,
  lb: LBNode,
  queue: QueueNode,
  cdn: CDNNode,
};

export default function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // ── DROP to add node ─────────────────────────────────────────────────────
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !rfInstance.current) return;

      // Convert screen coords → flow coords properly
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // ── Emit graph on every change — debounced server-side ──────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit("graph_update", { nodes, edges });
    }, 300); // small local delay to batch rapid changes; main debounce is on server
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  return (
    <div className="flex h-full bg-gray-950">
      <Sidebar />

      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={(instance) => { rfInstance.current = instance; }}
          fitView
          className="bg-gray-950"
        >
          <MiniMap
            nodeColor={() => "#4f46e5"}
            maskColor="rgba(0,0,0,0.6)"
            style={{ background: "#111827" }}
          />
          <Controls className="[&>button]:bg-gray-800 [&>button]:text-white [&>button]:border-gray-700" />
          <Background color="#374151" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}