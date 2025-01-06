import React, { useState } from "react";
import WorkflowCanvas from "./components/WorkflowCanvas";
import NodeEditor from "./components/NodeEditor";
import InteractiveAnalyticsPanel from "./components/InteractiveAnalyticsPanel";

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]); // Track nodes for analytics
  const [edges, setEdges] = useState([]); // Track edges for analytics

  const handleNodeChange = (nodeId, newData) => {
    setSelectedNode((prev) => {
      if (prev?.id === nodeId) {
        return { ...prev, data: newData };
      }
      return prev;
    });

    // Update nodes array with the modified node data
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
  };

  return (
    <div className="flex h-screen">
      {/* Workflow Canvas with analytics data handlers */}
      <WorkflowCanvas
        setSelectedNode={setSelectedNode}
        setNodes={setNodes}
        setEdges={setEdges}
      />
      {/* Node Editor for selected node */}
      <div className="flex-row h-screen">
        <NodeEditor selectedNode={selectedNode} onNodeChange={handleNodeChange} />
        {/* Analytics Panel for nodes and edges */}
        <InteractiveAnalyticsPanel nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}

export default App;
