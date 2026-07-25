import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getInterviewState } from "../services/interviewState.service";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    type Connection,
    type ReactFlowInstance,
} from "reactflow";

import "reactflow/dist/style.css";

import Sidebar from "./ComponentSidebar";

import ApiNode from "../nodes/ApiNode";
import DbNode from "../nodes/DbNode";
import CacheNode from "../nodes/CacheNode";
import LBNode from "../nodes/LbNode";
import QueueNode from "../nodes/QueueNode";
import CDNNode from "../nodes/CDNNode";

import { saveGraph } from "../services/graph.service";
import DiagramHeader from "./diagram/DiagramHeader";

const nodeTypes = {

    api: ApiNode,

    db: DbNode,

    cache: CacheNode,

    lb: LBNode,

    queue: QueueNode,

    cdn: CDNNode

};

export default function Diagram() {

    const { interviewId } = useParams();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);

    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const rfInstance = useRef<ReactFlowInstance | null>(null);

    const restored = useRef(false);

    const onConnect = useCallback(

        (params: Connection) =>

            setEdges((eds) => addEdge(params, eds)),

        []

    );

    const onDrop = useCallback(

        (event: React.DragEvent) => {

            event.preventDefault();

            const type =

                event.dataTransfer.getData(

                    "application/reactflow"

                );

            if (!type || !rfInstance.current)

                return;

            const position =

                rfInstance.current.screenToFlowPosition({

                    x: event.clientX,

                    y: event.clientY

                });

            setNodes((nds) => [

                ...nds,

                {

                    id: `${type}_${Date.now()}`,

                    type,

                    position,

                    data: {

                        label: type

                    }

                }

            ]);

        },

        []

    );

    const onDragOver = (

        event: React.DragEvent

    ) => {

        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

    };

    // =====================================================
    // Restore Graph
    // =====================================================

    useEffect(() => {

        if (!interviewId)

            return;

        async function loadGraph() {

            try {

                const state = await getInterviewState(interviewId!);

                if (state.graph) {

                    setNodes(

                        state.graph.nodes ?? []

                    );

                    setEdges(

                        state.graph.edges ?? []

                    );

                }

            }

            catch (err) {

                console.error(err);

            }

        }

        loadGraph();

    }, [

        interviewId,

        setNodes,

        setEdges

    ]);

    // =====================================================
    // Autosave Graph
    // =====================================================

    useEffect(() => {

        if (!interviewId)

            return;

        // Skip the first save after restoring
        if (!restored.current) {

            restored.current = true;

            return;

        }

        const timeout = setTimeout(async () => {

            try {

                await saveGraph(

                    interviewId,

                    {

                        nodes,

                        edges

                    }

                );

            }

            catch (err) {

                console.error(err);

            }

        }, 500);

        return () => clearTimeout(timeout);

    }, [

        nodes,

        edges,

        interviewId

    ]);

    return (

    <div className="flex h-full flex-col bg-[#09090B]">

        <DiagramHeader

            nodes={nodes.length}

        />

        <div className="flex flex-1 overflow-hidden">

            <Sidebar />

            <div className="flex-1">

                <ReactFlow

                    nodes={nodes}

                    edges={edges}

                    nodeTypes={nodeTypes}

                    onNodesChange={onNodesChange}

                    onEdgesChange={onEdgesChange}

                    onConnect={onConnect}

                    onDrop={onDrop}

                    onDragOver={onDragOver}

                    onInit={(rf) =>

                        rfInstance.current = rf

                    }

                    fitView

                >

                    <Controls />

                    <Background

                        gap={24}

                        size={1.4}

                        color="#24262b"

                    />

                </ReactFlow>

            </div>

        </div>

    </div>

);

}