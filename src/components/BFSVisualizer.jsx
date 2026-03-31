import { useState, useRef, useEffect } from "react";
import { bfsAnimations } from "../algorithms/bfs";
import { useGraphTouch } from "../hooks/useGraphTouch";

const NODE_RADIUS = 24;

function nodeColor(state) {
  switch (state) {
    case "visiting": return "#f97316";
    case "queued":   return "#3b82f6";
    case "visited":  return "#22c55e";
    default:         return "#64748b";
  }
}

function edgeKey(a, b) { return [a, b].sort().join("-"); }

const BTN = (bg, hover) => ({
  base: { padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: bg, color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" },
  hoverBg: hover,
});

const CARD = { backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", padding: "12px 14px" };
const LABEL = { margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" };

export function BFSVisualizer({ speedRef, graph, startNode: startNodeProp, onGenerate }) {
  const nodeIds = Object.keys(graph.nodes);
  const { scale, position, touchHandlers } = useGraphTouch();

  const [startNode, setStartNode] = useState(startNodeProp ?? nodeIds[0] ?? "A");
  const [nodeStates, setNodeStates] = useState({});
  const [activeEdges, setActiveEdges] = useState(new Set());
  const [queueDisplay, setQueueDisplay] = useState([]);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [explanation, setExplanation] = useState("Select a start node and press Run BFS.");
  const [status, setStatus] = useState("idle");

  const animsRef = useRef([]);
  const indexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    doReset();
    setStartNode(startNodeProp ?? Object.keys(graph.nodes)[0] ?? "A");
    setExplanation("Graph loaded. Press ▶ Run BFS.");
  }, [graph]); // eslint-disable-line react-hooks/exhaustive-deps

  function doReset() {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animsRef.current = [];
    indexRef.current = 0;
    setNodeStates({});
    setActiveEdges(new Set());
    setQueueDisplay([]);
    setTraversalOrder([]);
    setStatus("idle");
  }

  function reset() { doReset(); setExplanation("Select a start node and press Run BFS."); }

  function run() {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animsRef.current = bfsAnimations(graph, startNode);
    indexRef.current = 0;
    setNodeStates({});
    setActiveEdges(new Set());
    setQueueDisplay([]);
    setTraversalOrder([]);
    setStatus("running");
    setTimeout(() => step(), 0);
  }

  function pause() { isPausedRef.current = true; clearTimeout(timeoutRef.current); setStatus("paused"); }
  function resume() { isPausedRef.current = false; setStatus("running"); step(); }

  function stepOnce() {
    if (status === "running") return;
    const idx = indexRef.current;
    if (idx >= animsRef.current.length) return;
    applyAnimation(animsRef.current[idx]);
    indexRef.current = idx + 1;
    if (idx + 1 >= animsRef.current.length) setStatus("done");
  }

  function step() {
    if (isPausedRef.current) return;
    const idx = indexRef.current;
    const anims = animsRef.current;
    if (idx >= anims.length) { setStatus("done"); return; }
    const anim = anims[idx];
    indexRef.current = idx + 1;
    applyAnimation(anim);
    if (anim.type !== "done") {
      timeoutRef.current = setTimeout(() => step(), speedRef.current);
    } else { setStatus("done"); }
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
      setTraversalOrder(prev => [...prev, anim.node]);
    } else if (anim.type === "neighbors") {
      setActiveEdges(new Set(anim.neighbors.map(n => edgeKey(anim.node, n))));
    } else if (anim.type === "done") {
      setActiveEdges(new Set());
    }
  }

  const statusColors = {
    done:    { bg: "#dcfce7", color: "#16a34a" },
    running: { bg: "#dbeafe", color: "#1d4ed8" },
    paused:  { bg: "#fef9c3", color: "#a16207" },
    idle:    { bg: "rgba(255,255,255,0.1)", color: "#9ca3af" },
  };
  const sc = statusColors[status] || statusColors.idle;

  const W = 520, H = 460;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "12px", overflow: "hidden" }}>

      {/* Graph SVG card */}
      <div className="top-visualizer-section" style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", backgroundColor: "#f8fafc" }}>
          <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" }}>Start</label>
          <select value={startNode} onChange={e => setStartNode(e.target.value)} disabled={status === "running"}
            style={{ padding: "4px 8px", fontSize: "13px", borderRadius: "7px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#0B1F4A", fontWeight: "600", cursor: "pointer" }}>
            {nodeIds.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          {status !== "running"
            ? <button onClick={status === "paused" ? resume : run}
                style={{ ...BTN("#3b82f6", "#2563eb").base }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#3b82f6"; }}>
                {status === "paused" ? "▶ Resume" : "▶ Run BFS"}
              </button>
            : <button onClick={pause}
                style={{ ...BTN("#ef4444", "#dc2626").base }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#ef4444"; }}>
                ⏸ Pause
              </button>
          }

          <button onClick={stepOnce} disabled={status === "running" || status === "done"}
            style={{ ...BTN("#3b82f6", "#2563eb").base, opacity: status === "running" || status === "done" ? 0.4 : 1, cursor: status === "running" || status === "done" ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (status !== "running" && status !== "done") e.currentTarget.style.backgroundColor = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#3b82f6"; }}>
            ⏭ Step
          </button>

          <button onClick={reset}
            style={{ ...BTN("#f59e0b", "#d97706").base }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#d97706"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}>
            ↺ Reset
          </button>

          <button onClick={onGenerate}
            style={{ padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "1.5px solid #3b82f6", backgroundColor: "transparent", color: "#3b82f6", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            ⟳ New Graph
          </button>

          <span style={{ marginLeft: "auto", fontSize: "11px", padding: "2px 10px", borderRadius: "20px", fontWeight: "600", backgroundColor: sc.bg, color: sc.color }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="resp-graph-svg" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div className="graph-touch-container" {...touchHandlers}>
            <div className="graph-touch-inner" style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", maxHeight: "100%" }}>
                {graph.edges.map(([u, v]) => {
                  const nu = graph.nodes[u], nv = graph.nodes[v];
                  if (!nu || !nv) return null;
                  const key = edgeKey(u, v);
                  const active = activeEdges.has(key);
                  return <line key={key} x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y} className="graph-edge" stroke={active ? "#3b82f6" : "#cbd5e1"} strokeWidth={active ? 3 : 2} strokeLinecap="round" />;
                })}
                {nodeIds.map(id => {
                  const { x, y } = graph.nodes[id];
                  const state = nodeStates[id] || "unvisited";
                  return (
                    <g key={id}>
                      <circle cx={x} cy={y} r={NODE_RADIUS} className="graph-node" fill={nodeColor(state)} stroke={state === "visiting" ? "#ea580c" : "#fff"} strokeWidth={state === "visiting" ? 3 : 2} />
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="#fff" style={{ userSelect: "none", pointerEvents: "none" }}>{id}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right info column */}
      <div className="side-panel bottom-content" style={{ width: "190px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "100%" }}>

        <div style={{ ...CARD, transition: "border-color 0.3s ease" }}>
          <p style={LABEL}>Step</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#0B1F4A", lineHeight: "1.65", minHeight: "36px" }}>{explanation}</p>
        </div>

        <div style={{ ...CARD }}>
          <p style={LABEL}>Queue</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", minHeight: "28px" }}>
            {queueDisplay.length === 0
              ? <span style={{ fontSize: "12px", color: "#9ca3af" }}>empty</span>
              : queueDisplay.map((n, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", backgroundColor: "#3b82f6", color: "#fff" }}>{n}</span>
              ))
            }
          </div>
        </div>

        <div style={{ ...CARD, maxHeight: "160px", overflowY: "auto" }}>
          <p style={LABEL}>Traversal Order</p>
          {traversalOrder.length === 0
            ? <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                {traversalOrder.map((n, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <span style={{ padding: "2px 9px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", backgroundColor: i === traversalOrder.length - 1 ? "#22c55e" : "#dcfce7", color: i === traversalOrder.length - 1 ? "#fff" : "#15803d", transition: "background-color 0.2s ease" }}>{n}</span>
                    {i < traversalOrder.length - 1 && <span style={{ fontSize: "10px", color: "#9ca3af" }}>→</span>}
                  </span>
                ))}
              </div>
          }
        </div>

        <div style={{ ...CARD, fontSize: "12px", color: "#0B1F4A" }}>
          <p style={LABEL}>Legend</p>
          {[
            { color: "#64748b", label: "Unvisited" },
            { color: "#3b82f6", label: "In Queue"  },
            { color: "#f97316", label: "Visiting"  },
            { color: "#22c55e", label: "Visited"   },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
