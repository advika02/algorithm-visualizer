import { useNavigate, useParams } from "react-router-dom";

const NAMES = {
  dfs: "Depth-First Search (DFS)",
  dijkstra: "Dijkstra's Algorithm",
};

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const params = useParams();
  const algo = params.algo || params.algorithm || "";
  const name = NAMES[algo] || algo.toUpperCase();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e9eef5, #d6e4f0)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", gap: "16px",
      padding: "24px", boxSizing: "border-box"
    }}>
      <div style={{
        backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: "48px 56px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
        textAlign: "center", maxWidth: "420px", width: "100%"
      }}>
        <span style={{ fontSize: "48px" }}>🚧</span>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{name}</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
          This visualization is coming soon. Check back later!
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "8px", padding: "10px 24px", fontSize: "13px", fontWeight: "700",
            borderRadius: "8px", border: "none", backgroundColor: "#6366f1",
            color: "#fff", cursor: "pointer", transition: "all 0.18s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >← Back to Home</button>
      </div>
    </div>
  );
}
