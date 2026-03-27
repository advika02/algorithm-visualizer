import { useNavigate } from "react-router-dom";

const SORTING = [
  { label: "Bubble Sort",    path: "/sorting/bubble",    desc: "O(n²) — simple comparison sort" },
  { label: "Merge Sort",     path: "/sorting/merge",     desc: "O(n log n) — divide and conquer" },
  { label: "Quick Sort",     path: "/sorting/quick",     desc: "O(n log n) avg — pivot-based" },
  { label: "Selection Sort", path: "/sorting/selection", desc: "O(n²) — finds minimum each pass" },
  { label: "Insertion Sort", path: "/sorting/insertion", desc: "O(n²) — builds sorted array left to right" },
];

const SEARCHING = [
  { label: "Binary Search", path: "/search/binary", desc: "O(log n) — halves search space each step" },
];

const GRAPH = [
  { label: "BFS",      path: "/graph/bfs",      desc: "O(V+E) — explores level by level" },
  { label: "DFS",      path: "/graph/dfs",       desc: "O(V+E) — explores depth first" },
  { label: "Dijkstra", path: "/graph/dijkstra",  desc: "O((V+E) log V) — shortest path" },
];

function AlgoCard({ label, desc, path, navigate }) {
  return (
    <div
      onClick={() => navigate(path)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "20px 22px",
        cursor: "pointer",
        boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        borderTop: "3px solid transparent",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-top-color 0.25s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";
        e.currentTarget.style.borderTopColor = "#3b82f6";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
        e.currentTarget.style.borderTopColor = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#0B1F4A" }}>{label}</span>
        <span style={{ color: "#3b82f6", fontSize: "16px", lineHeight: 1, fontWeight: "600" }}>→</span>
      </div>
      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", lineHeight: "1.55" }}>{desc}</p>
    </div>
  );
}

function Section({ title, items, navigate }) {
  return (
    <div>
      <p style={{
        margin: "0 0 16px",
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "2.5px",
        color: "#3b82f6",
        fontWeight: "700",
      }}>{title}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {items.map(item => <AlgoCard key={item.path} {...item} navigate={navigate} />)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-scrollable" style={{
      background: "radial-gradient(circle at 50% 30%, rgba(59,130,246,0.07) 0%, transparent 65%), linear-gradient(to bottom, #0B1F4A, #0f2a66)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#d1d5db",
      boxSizing: "border-box",
      padding: "0 32px 64px",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", paddingTop: "72px", marginBottom: "56px" }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          margin: "0 0 12px",
          color: "#d1d5db",
          letterSpacing: "0.3px",
        }}>
          Algorithm Visualizer
        </h1>
        {/* accent underline */}
        <div style={{ width: "48px", height: "3px", backgroundColor: "#3b82f6", borderRadius: "2px", margin: "0 auto 14px" }} />
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
          Select an algorithm to visualize step by step
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
        <Section title="Sorting Algorithms" items={SORTING} navigate={navigate} />
        <Section title="Searching" items={SEARCHING} navigate={navigate} />
        <Section title="Graph Algorithms" items={GRAPH} navigate={navigate} />
      </div>
    </div>
  );
}
