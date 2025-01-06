import React, { useState, useCallback, useEffect } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";

const nodeTypes = {
  start: {
    label: "Start Node",
    style: {
      background: "#4CAF50",
      color: "white",
      padding: "10px",
      borderRadius: "10px",
    },
  },
  task: {
    label: "Task Node",
    style: {
      background: "#2196F3",
      color: "white",
      padding: "10px",
      borderRadius: "10px",
    },
  },
  decision: {
    label: "Decision Node",
    style: {
      background: "#FFC107",
      color: "white",
      padding: "10px",
      borderRadius: "10px",
    },
  },
  end: {
    label: "End Node",
    style: {
      background: "#f44336",
      color: "white",
      padding: "10px",
      borderRadius: "10px",
    },
  },
};

const WorkflowCanvas = ({ setSelectedNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSaved, setIsSaved] = useState(true);

  const checkValidation = () => {
    const errors = [];
    const updatedNodes = [...nodes];
    const startNodes = nodes.filter((node) => node.data.type === "start");

    if (startNodes.length > 1) errors.push("Multiple Start nodes detected.");
    if (startNodes.length === 0) errors.push("No Start node detected.");

    nodes.forEach((node) => {
      const hasIncoming = edges.some((edge) => edge.target === node.id);
      const hasOutgoing = edges.some((edge) => edge.source === node.id);

      const isValid =
        (node.data.type === "start" && hasOutgoing) ||
        (node.data.type === "end" && hasIncoming) ||
        (node.data.type !== "start" &&
          node.data.type !== "end" &&
          hasIncoming &&
          hasOutgoing);

      if (!isValid) {
        errors.push(`${node.data.label} is not properly connected.`);
        updatedNodes.forEach((n) => {
          if (n.id === node.id) {
            n.style = { ...n.style, border: "2px solid red" };
          }
        });
      } else {
        updatedNodes.forEach((n) => {
          if (n.id === node.id) {
            n.style = { ...n.style, border: "none" };
          }
        });
      }
    });

    setNodes(updatedNodes);
    setValidationErrors(errors);
  };

  const saveWorkflow = useCallback(() => {
    checkValidation();

    // Save only if no validation errors
    if (validationErrors.length > 0) {
      alert("Cannot save workflow. Resolve validation errors first.");
      return;
    }

    localStorage.setItem("workflow", JSON.stringify({ nodes, edges }));
    setIsSaved(true);
    alert("Workflow saved successfully!");
  }, [nodes, edges, validationErrors]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isSaved) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaved]);

  useEffect(() => {
    const savedWorkflow = localStorage.getItem("workflow");
    if (savedWorkflow) {
      const { nodes: savedNodes, edges: savedEdges } =
        JSON.parse(savedWorkflow);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
    }
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!nodeTypes[type]) return;

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type: "default",
        position,
        data: { label: nodeTypes[type].label, type },
        style: { ...nodeTypes[type].style, padding: 10, borderRadius: "10px" },
      };

      setNodes((nds) => nds.concat(newNode));
      setIsSaved(false);
    },
    [nodes]
  );

  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#0000FF" },
        },
        eds
      )
    );
    setIsSaved(false);
  }, []);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);

  const removeNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setIsSaved(false);
    },
    [setNodes, setEdges]
  );

  return (
    <div className="flex flex-1">
      <aside className="w-64 p-4 bg-gray-100 border-r">
        <h3 className="font-bold mb-4">Node Palette</h3>
        {Object.entries(nodeTypes).map(([key, nodeType]) => (
          <div
            key={key}
            draggable
            className="p-3 mb-3 cursor-move rounded shadow-sm"
            style={nodeType.style}
            onDragStart={(event) =>
              event.dataTransfer.setData("application/reactflow", key)
            }
          >
            <div>{nodeType.label}</div>
          </div>
        ))}
        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
          onClick={saveWorkflow}
        >
          Save Workflow
        </button>
        {validationErrors.length > 0 && (
          <div className="mt-4 p-2 bg-red-100 text-red-700">
            <h4 className="font-bold">Validation Errors:</h4>
            <ul className="list-disc ml-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      <div className="flex-1">
        <ReactFlowProvider>
          <div
            className="w-full h-full"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  deleteButton: (
                    <button
                      onClick={() => removeNode(node.id)}
                      className="text-red-500 bg-transparent border-none text-sm absolute top-0 right-0"
                    >
                      &#x2715;
                    </button>
                  ),
                },
              }))}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
            >
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
