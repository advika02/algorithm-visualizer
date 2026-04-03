import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { DijkstraVisualizer } from "../components/DijkstraVisualizer";
import { GraphInputPanel } from "../components/GraphInputPanel";
import { generateRandomWeightedGraph } from "../algorithms/parseGraph";
import { DEFAULT_WEIGHTED_INPUT } from "../algorithms/dijkstra";

export default function DijkstraPage() {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(50);
  const speedRef = useRef(1200 - (50 / 100) * (1200 - 100));
  const [graph, setGraph] = useState(() => generateRandomWeightedGraph());
  const [startNode, setStartNode] = useState("A");

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    speedRef.current = 1200 - (val / 100) * (1200 - 100);
  }

  function handleLoadGraph(newGraph, newStart) {
    setGraph(newGraph);
    setStartNode(newStart);
  }

  function handleGenerate() {
    const g = generateRandomWeightedGraph();
    const start = Object.keys(g.nodes).sort()[0] ?? "A";
    setGraph(g);
    setStartNode(start);
  }

  return (
    <div className="page-wrapper" style={{
      background: "linear-gradient(to bottom, #0B1F4A, #0f2a66)",
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#d1d5db", boxSizing: "border-box"
    }}>
      {/* Top bar */}
      <div className="resp-nav" style={{
        flexShrink: 0, margin: 0,
        backgroundColor: "rgba(11,31,74,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div className="resp-nav-left">
          <button onClick={() => navigate("/")}
            style={{ padding: "5px 14px", fontSize: "12px", fontWeight: "600", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.4)", backgroundColor: "transparent", color: "#93c5fd", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#60a5fa"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.color = "#93c5fd"; }}
          >← Home</button>
          <h1 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#d1d5db", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>Dijkstra's Algorithm</h1>
        </div>

        <div className="resp-nav-right">
          <div className="slider-group speed-control" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#9ca3af", marginBottom: "3px" }}>Speed</label>
            <input type="range" min="1" max="100" step="1" value={speed} onChange={handleSpeedChange} style={{ accentColor: "#3b82f6", width: "100px" }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="resp-body">
        <div className="resp-left-panel gi-graph-input">
          <GraphInputPanel
            onLoad={handleLoadGraph}
            accentColor="#3b82f6"
            defaultInput={DEFAULT_WEIGHTED_INPUT}
            weighted={true}
          />

          {/* Complexity */}
          <div style={{ marginTop: "12px", backgroundColor: "#ffffff", borderRadius: "12px", padding: "14px", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", fontSize: "13px", color: "#0B1F4A" }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" }}>Complexity</p>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#1d4ed8", display: "block", marginBottom: "6px" }}>Dijkstra</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span>⏱ Time: <strong>O((V+E) log V)</strong></span>
              <span>💾 Space: <strong>O(V)</strong></span>
              <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Greedy — always picks closest unvisited node</span>
            </div>
          </div>
        </div>

        <div className="resp-viz-col">
          <DijkstraVisualizer speedRef={speedRef} graph={graph} startNode={startNode} onGenerate={handleGenerate} />
        </div>
      </div>
    </div>
  );
}
