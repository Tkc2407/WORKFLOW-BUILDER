import React from "react";

const nodeTypeFields = {
  start: [
    { name: "executionTime", label: "Execution Time (ms)", type: "number" },
  ],
  task: [
    { name: "executionTime", label: "Execution Time (ms)", type: "number" },
  ],
  decision: [
    { name: "executionTime", label: "Execution Time (ms)", type: "number" },
  ],
  end: [
    { name: "executionTime", label: "Execution Time (ms)", type: "number" },
  ],
};

const NodeEditor = ({ selectedNode, onNodeChange }) => {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-gray-50 p-4 border-l border-gray-200">
        <p className="text-gray-500 text-center">
          Select a node to edit its properties
        </p>
      </div>
    );
  }

  const nodeType = selectedNode.data.type;
  const fields = nodeTypeFields[nodeType] || [];

  const handleChange = (name, value) => {
    const updatedNodeData = {
      ...selectedNode.data,
      [name]: value,
    };

    // Update the node in the diagram
    onNodeChange(selectedNode.id, updatedNodeData);

    // Update the node in local storage
    const storedNodes = JSON.parse(localStorage.getItem("nodes")) || [];
    const updatedNodes = storedNodes.map((node) =>
      node.id === selectedNode.id ? { ...node, data: updatedNodeData } : node
    );

    localStorage.setItem("nodes", JSON.stringify(updatedNodes));
  };

  return (
    <div className="w-80 bg-gray-50 p-4 border-l border-gray-200 overflow-y-auto">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-4">
          Edit {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node
        </h2>

        <div className="space-y-4">
          {/* Edit Node Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={selectedNode.data.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Execution Time Field */}
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={selectedNode.data[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          {/* Node Type (Read-Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              type="text"
              value={nodeType}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
