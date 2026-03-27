import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { DFSVisualizer } from "../components/DFSVisualizer";
import { GraphInputPanel } from "../components/GraphInputPanel";
import { generateRandomGraph } from "../algorithms/parseGraph";

export default function DFSPage() {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(1200);
  const speedRef = useRef(1200);
  const [graph, setGraph] = useState(() => generateRandomGraph());
  const [startNode, setStartNode] = useState("A");

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    speedRef.current = val;
  }

  function handleLoadGraph(newGraph, newStart) {
    setGraph(newGraph);
    setStartNode(newStart);
  }

  function handleGenerate() {
    const g = generateRandomGraph();
    const start = Object.keys(g.nodes).sort()[0] ?? "A";
    setGraph(g);
    setStartNode(start);
  }

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(to bottom, #0B1F4A, #0f2a66)",
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#d1d5db", boxSizing: "border-box"
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, padding: "8px 20px", margin: 0,
        backgroundColor: "rgba(11,31,74,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/")}
            style={{ padding: "5px 14px", fontSize: "12px", fontWeight: "600", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.4)", backgroundColor: "transparent", color: "#93c5fd", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#60a5fa"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.color = "#93c5fd"; }}
          >← Home</button>
          <h1 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#d1d5db", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>Depth-First Search</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#9ca3af" }}>Speed</label>
          <input type="range" min="500" max="4000" step="100" value={speed} onChange={handleSpeedChange} style={{ accentColor: "#3b82f6", width: "110px" }} />
          <span style={{ fontSize: "11px", color: "#60a5fa", minWidth: "44px" }}>
            {speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "14px 18px", display: "flex", gap: "14px" }}>
        {/* Left panel */}
        <div style={{ width: "220px", flexShrink: 0, overflowY: "auto" }}>
          <GraphInputPanel onLoad={handleLoadGraph} accentColor="#3b82f6" />

          {/* Complexity */}
          <div style={{ marginTop: "12px", backgroundColor: "#ffffff", borderRadius: "12px", padding: "14px", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", fontSize: "13px", color: "#0B1F4A" }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" }}>Complexity</p>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#1d4ed8", display: "block", marginBottom: "6px" }}>DFS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span>⏱ Time: <strong>O(V + E)</strong></span>
              <span>💾 Space: <strong>O(V)</strong></span>
              <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Goes deep before backtracking</span>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <DFSVisualizer speedRef={speedRef} graph={graph} startNode={startNode} onGenerate={handleGenerate} />
        </div>
      </div>
    </div>
  );
}
