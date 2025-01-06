import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement } from "chart.js";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement
);

const InteractiveAnalyticsPanel = ({ nodes, edges }) => {
  // Helper to calculate execution times
  const executionTimes = nodes.map((node) => ({
    id: node.id,
    label: node.data.label || "Unnamed",
    type: node.data.type || "unknown",
    executionTime: parseFloat(node.data.executionTime) || 0,
  }));

  const totalExecutionTime = executionTimes.reduce((sum, node) => sum + node.executionTime, 0);

  // Chart Data
  const barChartData = {
    labels: executionTimes.map((node) => node.label),
    datasets: [
      {
        label: "Execution Time (ms)",
        data: executionTimes.map((node) => node.executionTime),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const lineChartData = {
    labels: executionTimes.map((node) => node.label),
    datasets: [
      {
        label: "Cumulative Execution Time (ms)",
        data: executionTimes.reduce(
          (cumulative, node, index) => {
            const lastValue = cumulative[index - 1] || 0;
            cumulative.push(lastValue + node.executionTime);
            return cumulative;
          },
          []
        ),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const pieChartData = {
    labels: [...new Set(executionTimes.map((node) => node.type))],
    datasets: [
      {
        label: "Execution Time Distribution by Node Type",
        data: executionTimes.reduce((acc, node) => {
          const typeIndex = acc.labels.indexOf(node.type);
          if (typeIndex >= 0) acc.data[typeIndex] += node.executionTime;
          else {
            acc.labels.push(node.type);
            acc.data.push(node.executionTime);
          }
          return acc;
        }, { labels: [], data: [] }).data,
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#f44336"],
      },
    ],
  };

  return (
    <div className="w-80 bg-white p-4 border-l border-gray-200 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Analytics Panel</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold">Execution Time (Bar Chart)</h3>
          <Bar data={barChartData} />
        </div>
        <div>
          <h3 className="text-md font-semibold">Cumulative Execution Time (Line Chart)</h3>
          <Line data={lineChartData} />
        </div>
        <div>
          <h3 className="text-md font-semibold">Execution Time by Node Type (Pie Chart)</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default InteractiveAnalyticsPanel;
