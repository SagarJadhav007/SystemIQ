import { useCallback, useEffect } from "react";
import { socket } from "../socket";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Connection
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "./Sidebar";
import ApiNode from "../nodes/ApiNode";
import DbNode from "../nodes/DbNode";
import CacheNode from "../nodes/CacheNode";

const nodeTypes = {
    api: ApiNode,
    db: DbNode,
    cache: CacheNode
};

export default function Diagram() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const type = event.dataTransfer.getData("application/reactflow");

        const bounds = (event.target as HTMLElement).getBoundingClientRect();

        const newNode = {
            id: `${Date.now()}`,
            type,
            position: {
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top
            },
            data: { label: type }
        };

        setNodes((nds) => nds.concat(newNode));
    }, []);

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        const graph = { nodes, edges };

        console.log("Sending graph:", graph); 

        const timeout = setTimeout(() => {
            socket.emit("graph_update", graph);
        }, 500);

        return () => clearTimeout(timeout);
    }, [nodes, edges]);

    return (
        <div className="flex flex-1">
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
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </div>
    );
}