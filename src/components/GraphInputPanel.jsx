import { useState } from "react";
import { parseGraph, DEFAULT_INPUT } from "../algorithms/parseGraph";

export function GraphInputPanel({ onLoad, accentColor = "#3b82f6", defaultInput, weighted = false }) {
  const [graphInput, setGraphInput] = useState(defaultInput ?? DEFAULT_INPUT);
  const [startInput, setStartInput] = useState("A");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function handleLoad() {
    setError(""); setSuccessMsg("");
    const start = startInput.trim().toUpperCase();
    if (!/^[A-Z]$/.test(start)) { setError("Start node must be a single uppercase letter (A–Z)."); return; }
    const { graph, error: parseError } = parseGraph(graphInput);
    if (parseError) { setError(parseError); return; }
    if (!graph.nodes[start]) { setError(`Start node "${start}" does not exist in the graph.`); return; }
    onLoad(graph, start);
    setSuccessMsg("Custom graph loaded.");
  }

  const LABEL = { margin: "0 0 5px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280" };

  return (
    <div style={{
      backgroundColor: "#ffffff", borderRadius: "12px", padding: "14px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      display: "flex", flexDirection: "column", gap: "10px"
    }}>
      <p style={{ ...LABEL, margin: "0 0 4px" }}>Graph Input</p>

      <textarea
        value={graphInput}
        onChange={e => { setGraphInput(e.target.value); setError(""); setSuccessMsg(""); }}
        rows={9}
        placeholder={"A B\nA C\nB D"}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "8px 10px", fontSize: "12px", fontFamily: "monospace",
          borderRadius: "8px", border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
          outline: "none", resize: "vertical", color: "#0B1F4A",
          backgroundColor: "#f8fafc", lineHeight: "1.6",
        }}
      />

      <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af", lineHeight: "1.5" }}>
        One edge per line:{" "}
        <code style={{ backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: "3px", color: "#0B1F4A" }}>A B</code>
        {" "}or weighted{" "}
        <code style={{ backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: "3px", color: "#0B1F4A" }}>A B 4</code>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ ...LABEL, margin: 0, whiteSpace: "nowrap" }}>Start Node</label>
        <input
          type="text" maxLength={1} value={startInput}
          onChange={e => { setStartInput(e.target.value.toUpperCase()); setError(""); setSuccessMsg(""); }}
          style={{
            width: "44px", padding: "6px 8px", fontSize: "13px", fontWeight: "700",
            textAlign: "center", borderRadius: "7px",
            border: "1.5px solid #e2e8f0", outline: "none",
            color: "#0B1F4A", backgroundColor: "#f8fafc", fontFamily: "inherit",
          }}
        />
      </div>

      {error && <p style={{ margin: 0, fontSize: "11px", color: "#ef4444", lineHeight: "1.4" }}>{error}</p>}
      {successMsg && <p style={{ margin: 0, fontSize: "11px", color: "#16a34a", lineHeight: "1.4" }}>✓ {successMsg}</p>}

      <button
        onClick={handleLoad}
        style={{ width: "100%", padding: "8px", fontSize: "12px", fontWeight: "700", borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: accentColor, color: "#fff", transition: "background-color 0.2s ease" }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = accentColor; }}
      >Load Graph</button>
    </div>
  );
}
