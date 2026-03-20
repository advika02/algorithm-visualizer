import { useNavigate, useParams } from "react-router-dom";
import ArrayVisualizer from "../components/ArrayVisualizer";

export default function SortingPage() {
  const navigate = useNavigate();
  const { algorithm } = useParams(); // bubble | merge | quick | selection | insertion

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Back bar */}
      <div style={{
        flexShrink: 0, padding: "6px 16px",
        backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center"
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
      </div>

      {/* Visualizer fills remaining height */}
      <div style={{ flex: 1 }}>
        <ArrayVisualizer initialAlgorithm={algorithm} />
      </div>
    </div>
  );
}
