import { useState, useRef, useEffect } from "react";
import { dijkstraAnimations } from "../algorithms/dijkstra";
import { useGraphTouch } from "../hooks/useGraphTouch";

const NODE_RADIUS = 24;

function nodeColor(state) {
  switch (state) {
    case "picked":  return "#f59e0b";
    case "settled": return "#22c55e";
    default:        return "#64748b";
  }
}

function edgeKey(a, b) { return [a, b].sort().join("-"); }

const CARD = { backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", padding: "12px 14px" };
const LABEL = { margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" };

export function DijkstraVisualizer({ speedRef, graph, startNode: startNodeProp, onGenerate }) {
  const nodeIds = Object.keys(graph.nodes);
  const { scale, position, touchHandlers } = useGraphTouch();

  const [startNode, setStartNode] = useState(startNodeProp ?? nodeIds[0] ?? "A");
  const [nodeStates, setNodeStates] = useState({});
  const [activeEdge, setActiveEdge] = useState(null);
  const [pathEdges, setPathEdges] = useState(new Set());
  const [distances, setDistances] = useState({});
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [explanation, setExplanation] = useState("Load a weighted graph and press Run Dijkstra.");
  const [status, setStatus] = useState("idle");
  const [graphError, setGraphError] = useState("");

  const animsRef = useRef([]);
  const indexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    doReset();
    setStartNode(startNodeProp ?? Object.keys(graph.nodes)[0] ?? "A");
    setExplanation("Graph loaded. Press ▶ Run Dijkstra.");
    setGraphError("");
  }, [graph]); // eslint-disable-line react-hooks/exhaustive-deps

  function doReset() {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animsRef.current = [];
    indexRef.current = 0;
    setNodeStates({});
    setActiveEdge(null);
    setPathEdges(new Set());
    setDistances({});
    setTraversalOrder([]);
    setStatus("idle");
    setGraphError("");
  }

  function reset() { doReset(); setExplanation("Select a start node and press Run Dijkstra."); }

  function run() {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    const anims = dijkstraAnimations(graph, startNode);
    if (anims[0]?.type === "error") { setGraphError(anims[0].explanation); return; }
    animsRef.current = anims;
    indexRef.current = 0;
    setNodeStates({});
    setActiveEdge(null);
    setPathEdges(new Set());
    setDistances({});
    setGraphError("");
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
    if (anim.type !== "done") { timeoutRef.current = setTimeout(() => step(), speedRef.current); }
    else { setStatus("done"); }
  }

  function applyAnimation(anim) {
    setExplanation(anim.explanation || "");
    if (anim.distances) setDistances({ ...anim.distances });
    if (anim.type === "init") { setNodeStates({}); setActiveEdge(null); setPathEdges(new Set()); }
    else if (anim.type === "pick") { setNodeStates(prev => ({ ...prev, [anim.node]: "picked" })); setActiveEdge(null); }
    else if (anim.type === "visit") { setNodeStates(prev => ({ ...prev, [anim.node]: "settled" })); setTraversalOrder(prev => [...prev, anim.node]); }
    else if (anim.type === "relax") { setActiveEdge(edgeKey(anim.from, anim.to)); }
    else if (anim.type === "skip_edge") { setActiveEdge(edgeKey(anim.from, anim.to)); }
    else if (anim.type === "done") { setActiveEdge(null); setPathEdges(new Set(anim.pathEdges)); }
  }

  const hasWeights = graph.edges.some(e => e[2] !== undefined);
  const W = 520, H = 460;

  const statusColors = {
    done:    { bg: "#dcfce7", color: "#16a34a" },
    running: { bg: "#dbeafe", color: "#1d4ed8" },
    paused:  { bg: "#fef9c3", color: "#a16207" },
    idle:    { bg: "rgba(255,255,255,0.1)", color: "#9ca3af" },
  };
  const sc = statusColors[status] || statusColors.idle;

  return (
    <div className="graph-viz-root" style={{ flex: 1, display: "flex", gap: "12px", minHeight: 0, overflow: "hidden" }}>

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
                style={{ padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#3b82f6"; }}>
                {status === "paused" ? "▶ Resume" : "▶ Run Dijkstra"}
              </button>
            : <button onClick={pause}
                style={{ padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#ef4444"; }}>
                ⏸ Pause
              </button>
          }

          <button onClick={stepOnce} disabled={status === "running" || status === "done"}
            style={{ padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "600", cursor: status === "running" || status === "done" ? "not-allowed" : "pointer", opacity: status === "running" || status === "done" ? 0.4 : 1, transition: "background-color 0.2s ease" }}
            onMouseEnter={e => { if (status !== "running" && status !== "done") e.currentTarget.style.backgroundColor = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#3b82f6"; }}>
            ⏭ Step
          </button>

          <button onClick={reset}
            style={{ padding: "5px 13px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#f59e0b", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
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

        {(graphError || !hasWeights) && (
          <div style={{ padding: "8px 14px", backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca", fontSize: "12px", color: "#dc2626" }}>
            {graphError || "⚠️ No weighted edges detected. Add weights like \"A B 4\" and reload."}
          </div>
        )}

        <div className="resp-graph-svg" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div className="graph-touch-container" {...touchHandlers}>
            <div className="graph-touch-inner" style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", maxHeight: "100%" }}>
                {graph.edges.map(([u, v, w]) => {
                  const nu = graph.nodes[u], nv = graph.nodes[v];
                  if (!nu || !nv) return null;
                  const key = edgeKey(u, v);
                  const isActive = activeEdge === key;
                  const isPath = pathEdges.has(key);
                  const stroke = isPath ? "#f59e0b" : isActive ? "#3b82f6" : "#cbd5e1";
                  const strokeW = isActive || isPath ? 3 : 2;
                  const mx = (nu.x + nv.x) / 2, my = (nu.y + nv.y) / 2;
                  return (
                    <g key={key}>
                      <line x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y} className="graph-edge" stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" />
                      {w !== undefined && (
                        <>
                          <circle cx={mx} cy={my} r={11} fill="#ffffff" stroke={stroke} strokeWidth="1.5" style={{ transition: "stroke 0.25s ease" }} />
                          <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#0B1F4A" style={{ userSelect: "none", pointerEvents: "none" }}>{w}</text>
                        </>
                      )}
                    </g>
                  );
                })}
                {nodeIds.map(id => {
                  const { x, y } = graph.nodes[id];
                  const state = nodeStates[id] || "unvisited";
                  const d = distances[id];
                  const distLabel = d === undefined ? "" : d === Infinity ? "∞" : String(d);
                  return (
                    <g key={id}>
                      <circle cx={x} cy={y} r={NODE_RADIUS} className="graph-node" fill={nodeColor(state)} stroke={state === "picked" ? "#d97706" : "#fff"} strokeWidth={state === "picked" ? 3 : 2} />
                      <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700" fill="#fff" style={{ userSelect: "none", pointerEvents: "none" }}>{id}</text>
                      {distLabel !== "" && (
                        <text x={x} y={y + 11} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.85)" style={{ userSelect: "none", pointerEvents: "none" }}>{distLabel}</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right info column */}
      <div className="side-panel bottom-content" style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "100%" }}>

        <div className="gi-step" style={CARD}>
          <p style={LABEL}>Step</p>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#0B1F4A", lineHeight: "1.65", minHeight: "36px" }}>{explanation}</p>
        </div>

        <div className="gi-queue" style={CARD}>
          <p style={LABEL}>Distances</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {nodeIds.length === 0
              ? <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>
              : nodeIds.map(id => {
                  const d = distances[id];
                  const label = d === undefined ? "—" : d === Infinity ? "∞" : d;
                  const settled = nodeStates[id] === "settled";
                  return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", padding: "2px 0" }}>
                      <span style={{ fontWeight: "700", color: settled ? "#16a34a" : "#0B1F4A" }}>{id}</span>
                      <span style={{ fontWeight: "600", color: settled ? "#16a34a" : d === Infinity || d === undefined ? "#9ca3af" : "#f59e0b" }}>{label}</span>
                    </div>
                  );
                })
            }
          </div>
        </div>

        <div className="gi-traversal" style={{ ...CARD, maxHeight: "160px", overflowY: "auto" }}>
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

        <div className="gi-legend" style={{ ...CARD, fontSize: "12px", color: "#0B1F4A" }}>
          <p style={LABEL}>Legend</p>
          {[
            { color: "#64748b", label: "Unvisited"     },
            { color: "#f59e0b", label: "Processing"    },
            { color: "#22c55e", label: "Settled"       },
            { color: "#3b82f6", label: "Relaxing edge" },
            { color: "#f59e0b", label: "Shortest path", bar: true },
          ].map(({ color, label, bar }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <span style={{ width: "12px", height: bar ? "3px" : "12px", borderRadius: bar ? "2px" : "50%", backgroundColor: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
