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
  { label: "DFS",      path: "/graph/dfs",       desc: "O(V+E) — explores depth first", comingSoon: true },
  { label: "Dijkstra", path: "/graph/dijkstra",  desc: "O((V+E) log V) — shortest path", comingSoon: true },
];

function AlgoCard({ label, desc, path, comingSoon, navigate }) {
  return (
    <div
      onClick={() => navigate(path)}
      style={{
        padding: "16px 18px", borderRadius: "12px", cursor: "pointer",
        border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.18s ease",
        opacity: comingSoon ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.borderColor = "#6366f1";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.15)";
        e.currentTarget.style.backgroundColor = comingSoon ? "#f8fafc" : "#fafafe";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        e.currentTarget.style.backgroundColor = "#ffffff";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{label}</span>
        {comingSoon
          ? <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#f1f5f9", color: "#94a3b8", fontWeight: "700" }}>Soon</span>
          : <span style={{ color: "#6366f1", fontSize: "14px" }}>→</span>
        }
      </div>
      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{desc}</p>
    </div>
  );
}

function Section({ title, items, navigate }) {
  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", fontWeight: "700" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(item => <AlgoCard key={item.path} {...item} navigate={navigate} />)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e9eef5, #d6e4f0)",
      fontFamily: "'Segoe UI', sans-serif", color: "#1e293b",
      padding: "48px 32px", boxSizing: "border-box"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "0.5px" }}>
          Algorithm Visualizer
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
          Select an algorithm to visualize step by step
        </p>
      </div>

      {/* Two-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
        maxWidth: "860px",
        margin: "0 auto"
      }}>
        {/* Left: Sorting */}
        <Section title="Sorting Algorithms" items={SORTING} navigate={navigate} />

        {/* Right: Searching + Graph */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <Section title="Searching" items={SEARCHING} navigate={navigate} />
          <Section title="Graph Algorithms" items={GRAPH} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}
