import { useState, useRef } from "react";
import { DEFAULT_GRAPH, bfsAnimations } from "../algorithms/bfs";

const NODE_RADIUS = 24;

// Node color by state
function nodeColor(state) {
  switch (state) {
    case "visiting":  return "#f97316"; // orange
    case "queued":    return "#3b82f6"; // blue
    case "visited":   return "#22c55e"; // green
    default:          return "#94a3b8"; // grey
  }
}

export function BFSVisualizer({ speed, speedRef }) {
  const graph = DEFAULT_GRAPH;
  const nodeIds = Object.keys(graph.nodes);

  const [startNode, setStartNode] = useState("A");
  const [nodeStates, setNodeStates] = useState({});   // nodeId → state string
  const [activeEdges, setActiveEdges] = useState(new Set());
  const [queueDisplay, setQueueDisplay] = useState([]);
  const [explanation, setExplanation] = useState("Select a start node and press Run BFS.");
  const [status, setStatus] = useState("idle"); // idle | running | paused | done

  const animsRef = useRef([]);
  const indexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef(null);

  function reset() {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animsRef.current = [];
    indexRef.current = 0;
    setNodeStates({});
    setActiveEdges(new Set());
    setQueueDisplay([]);
    setExplanation("Select a start node and press Run BFS.");
    setStatus("idle");
  }

  function run() {
    reset();
    const anims = bfsAnimations(graph, startNode);
    animsRef.current = anims;
    indexRef.current = 0;
    isPausedRef.current = false;
    setStatus("running");
    setTimeout(() => step(), 0);
  }

  function pause() {
    isPausedRef.current = true;
    clearTimeout(timeoutRef.current);
    setStatus("paused");
  }

  function resume() {
    isPausedRef.current = false;
    setStatus("running");
    step();
  }

  function step() {
    if (isPausedRef.current) return;
    const idx = indexRef.current;
    const anims = animsRef.current;

    if (idx >= anims.length) {
      setStatus("done");
      return;
    }

    const anim = anims[idx];
    indexRef.current = idx + 1;
    applyAnimation(anim);

    if (anim.type !== "done") {
      timeoutRef.current = setTimeout(() => step(), speedRef.current);
    } else {
      setStatus("done");
    }
  }

  function applyAnimation(anim) {
    setExplanation(anim.explanation || "");

    if (anim.type === "start") {
      setNodeStates({ [anim.node]: "queued" });
    } else if (anim.type === "enqueue") {
      setNodeStates(prev => ({ ...prev, [anim.node]: "queued" }));
      setQueueDisplay(anim.queue);
    } else if (anim.type === "dequeue") {
      setNodeStates(prev => ({ ...prev, [anim.node]: "visiting" }));
      setQueueDisplay(anim.queue);
    } else if (anim.type === "visit") {
      setNodeStates(prev => ({ ...prev, [anim.node]: "visited" }));
    } else if (anim.type === "neighbors") {
      // highlight edges from current node to its neighbors
      setActiveEdges(new Set(
        anim.neighbors.map(n => edgeKey(anim.node, n))
      ));
    } else if (anim.type === "skip") {
      // briefly highlight the already-visited neighbor
    } else if (anim.type === "done") {
      setActiveEdges(new Set());
    }
  }

  function edgeKey(a, b) {
    return [a, b].sort().join("-");
  }

  // SVG dimensions
  const W = 520, H = 460;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", gap: "10px",
      minHeight: 0, overflow: "hidden"
    }}>
      {/* Controls row */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", flexShrink: 0,
        backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0",
        padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", flexWrap: "wrap"
      }}>
        <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>
          Start Node
        </label>
        <select value={startNode} onChange={e => setStartNode(e.target.value)}
          disabled={status === "running"}
          style={{
            padding: "5px 10px", fontSize: "13px", borderRadius: "7px",
            border: "1.5px solid #e2e8f0", backgroundColor: "#f8fafc",
            color: "#1e293b", fontWeight: "600", cursor: "pointer"
          }}>
          {nodeIds.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        {status !== "running" ? (
          <button onClick={status === "paused" ? resume : run} style={{
            padding: "6px 16px", fontSize: "13px", borderRadius: "7px", border: "none",
            backgroundColor: "#43a047", color: "#fff", fontWeight: "700", cursor: "pointer"
          }}>
            {status === "paused" ? "▶ Resume" : "▶ Run BFS"}
          </button>
        ) : (
          <button onClick={pause} style={{
            padding: "6px 16px", fontSize: "13px", borderRadius: "7px", border: "none",
            backgroundColor: "#e53935", color: "#fff", fontWeight: "700", cursor: "pointer"
          }}>⏸ Pause</button>
        )}

        <button onClick={reset} style={{
          padding: "6px 14px", fontSize: "13px", borderRadius: "7px", border: "none",
          backgroundColor: "#fb8c00", color: "#fff", fontWeight: "700", cursor: "pointer"
        }}>↺ Reset</button>

        {/* Status badge */}
        <span style={{
          marginLeft: "auto", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600",
          backgroundColor: status === "done" ? "#dcfce7" : status === "running" ? "#dbeafe" : status === "paused" ? "#fef9c3" : "#f1f5f9",
          color: status === "done" ? "#16a34a" : status === "running" ? "#1d4ed8" : status === "paused" ? "#a16207" : "#64748b"
        }}>
          {status === "done" ? "Done" : status === "running" ? "Running" : status === "paused" ? "Paused" : "Idle"}
        </span>
      </div>

      {/* Main area: graph + info */}
      <div style={{ flex: 1, display: "flex", gap: "12px", minHeight: 0, overflow: "hidden" }}>

        {/* Graph SVG */}
        <div style={{
          flex: 1, backgroundColor: "#ffffff", borderRadius: "12px",
          border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", minHeight: 0
        }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", maxHeight: "100%" }}>
            {/* Edges */}
            {graph.edges.map(([u, v]) => {
              const nu = graph.nodes[u], nv = graph.nodes[v];
              const key = edgeKey(u, v);
              const active = activeEdges.has(key);
              return (
                <line key={key}
                  x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y}
                  stroke={active ? "#6366f1" : "#cbd5e1"}
                  strokeWidth={active ? 3 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
                />
              );
            })}

            {/* Nodes */}
            {nodeIds.map(id => {
              const { x, y } = graph.nodes[id];
              const state = nodeStates[id] || "unvisited";
              const color = nodeColor(state);
              return (
                <g key={id}>
                  <circle
                    cx={x} cy={y} r={NODE_RADIUS}
                    fill={color}
                    stroke={state === "visiting" ? "#ea580c" : "#fff"}
                    strokeWidth={state === "visiting" ? 3 : 2}
                    style={{ transition: "fill 0.35s ease, stroke 0.35s ease" }}
                  />
                  <text
                    x={x} y={y} textAnchor="middle" dominantBaseline="central"
                    fontSize="15" fontWeight="700" fill="#fff"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >{id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right info column */}
        <div style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>

          {/* Step explanation */}
          <div style={{
            backgroundColor: explanation ? "rgba(99,102,241,0.06)" : "#ffffff",
            borderRadius: "12px", border: "1px solid #e2e8f0",
            padding: "12px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease"
          }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Step Explanation</p>
            <p style={{ margin: "0", fontSize: "12px", color: "#1e293b", lineHeight: "1.6", minHeight: "36px" }}>{explanation}</p>
          </div>

          {/* Queue */}
          <div style={{
            backgroundColor: "#eff6ff", borderRadius: "12px",
            border: "1px solid #bfdbfe", padding: "12px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Queue</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", minHeight: "28px" }}>
              {queueDisplay.length === 0
                ? <span style={{ fontSize: "12px", color: "#94a3b8" }}>empty</span>
                : queueDisplay.map((n, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                    fontWeight: "700", backgroundColor: "#3b82f6", color: "#fff"
                  }}>{n}</span>
                ))
              }
            </div>
          </div>

          {/* Legend */}
          <div style={{
            backgroundColor: "#ffffff", borderRadius: "12px",
            border: "1px solid #e2e8f0", padding: "12px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: "12px", color: "#1e293b"
          }}>
            <p style={{ margin: "0 0 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Legend</p>
            {[
              { color: "#94a3b8", label: "Unvisited"  },
              { color: "#3b82f6", label: "In Queue"   },
              { color: "#f97316", label: "Visiting"   },
              { color: "#22c55e", label: "Visited"    },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          {/* Complexity */}
          <div style={{
            backgroundColor: "#f1f5f9", borderRadius: "12px",
            border: "1px solid #e2e8f0", padding: "12px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: "13px", color: "#1e293b"
          }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Complexity</p>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#3730a3", display: "block", marginBottom: "6px" }}>BFS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span>⏱ Time: <strong>O(V + E)</strong></span>
              <span>💾 Space: <strong>O(V)</strong></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
