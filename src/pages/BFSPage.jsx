import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { BFSVisualizer } from "../components/BFSVisualizer";

export default function BFSPage() {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(1200);
  const speedRef = useRef(1200);

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    speedRef.current = val;
  }

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(135deg, #e9eef5, #d6e4f0)",
      fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", boxSizing: "border-box"
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, padding: "8px 16px",
        backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: "16px"
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "5px 14px", fontSize: "12px", fontWeight: "700",
            borderRadius: "7px", border: "1.5px solid #e2e8f0",
            backgroundColor: "transparent", color: "#64748b",
            cursor: "pointer", transition: "all 0.18s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
        >← Home</button>

        <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
          Breadth-First Search
        </h1>

        {/* Speed control */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Speed</label>
          <input type="range" min="500" max="4000" step="100" value={speed}
            onChange={handleSpeedChange} style={{ accentColor: "#6366f1", width: "120px" }} />
          <span style={{ fontSize: "11px", color: "#6366f1", minWidth: "44px" }}>
            {speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}
          </span>
        </div>
      </div>

      {/* BFS visualizer */}
      <div style={{ flex: 1, overflow: "hidden", padding: "12px 16px", display: "flex", flexDirection: "column" }}>
        <BFSVisualizer speed={speed} speedRef={speedRef} />
      </div>
    </div>
  );
}
