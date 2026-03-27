import { useState, useRef, useEffect } from "react";
import { bubbleSort } from "../algorithms/bubbleSort";
import { mergeSort } from "../algorithms/mergeSort";
import { quickSort } from "../algorithms/quickSort";
import { selectionSort } from "../algorithms/selectionSort";
import { insertionSort } from "../algorithms/insertionSort";
import { ANIMATION_TYPES } from "../algorithms/animationTypes";

const ALGO_MAP = {
  bubble:    { label: "Bubble Sort",    fn: bubbleSort    },
  merge:     { label: "Merge Sort",     fn: mergeSort     },
  quick:     { label: "Quick Sort",     fn: quickSort     },
  selection: { label: "Selection Sort", fn: selectionSort },
  insertion: { label: "Insertion Sort", fn: insertionSort },
};

const BAR_CLASS_PREFIX = "cmp-bar-";

const CARD = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "12px 14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
};

const LABEL = {
  margin: "0 0 6px",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#6b7280",
};

/**
 * ComparisonPanel
 * Props:
 *   sharedArray  — the base array (copied on start)
 *   speedRef     — ref to current speed ms
 *   panelId      — "left" | "right"
 *   triggerRef   — parent sets this ref; calling triggerRef.current() fires start
 */
export function ComparisonPanel({ sharedArray, speedRef, panelId, triggerRef }) {
  const [array, setArray] = useState([...sharedArray]);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("Select an algorithm below.");

  const animationsRef = useRef([]);
  const indexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef(null);
  const barClass = BAR_CLASS_PREFIX + panelId;

  useEffect(() => {
    if (triggerRef) triggerRef.current = startFromParent;
  });

  useEffect(() => {
    hardReset([...sharedArray]);
  }, [sharedArray]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearBars(color = "#60a5fa") {
    setTimeout(() => {
      const bars = document.getElementsByClassName(barClass);
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = color;
        bars[i].style.transform = "scaleY(1)";
      }
    }, 0);
  }

  function hardReset(arr) {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animationsRef.current = [];
    indexRef.current = 0;
    setArray(arr);
    setComparisons(0);
    setSwaps(0);
    setStatus("idle");
    setStatusMsg(selectedAlgo ? `${ALGO_MAP[selectedAlgo].label} ready.` : "Select an algorithm below.");
    clearBars();
  }

  function selectAlgo(key) {
    if (status === "running") return;
    setSelectedAlgo(key);
    setStatus("idle");
    setStatusMsg(`${ALGO_MAP[key].label} selected.`);
  }

  function startFromParent() {
    if (!selectedAlgo) { setStatusMsg("⚠️ Select an algorithm first."); return; }
    launchAnimation([...sharedArray]);
  }

  function launchAnimation(freshArray) {
    clearTimeout(timeoutRef.current);
    setArray(freshArray);
    setComparisons(0);
    setSwaps(0);
    animationsRef.current = ALGO_MAP[selectedAlgo].fn([...freshArray]);
    indexRef.current = 0;
    isPausedRef.current = false;
    setStatus("running");
    setStatusMsg(`Running ${ALGO_MAP[selectedAlgo].label}...`);
    clearBars();
    setTimeout(() => runStep(), 0);
  }

  function pause() {
    isPausedRef.current = true;
    clearTimeout(timeoutRef.current);
    setStatus("paused");
    setStatusMsg("Paused.");
  }

  function resume() {
    isPausedRef.current = false;
    setStatus("running");
    setStatusMsg(`Resuming ${ALGO_MAP[selectedAlgo]?.label ?? ""}...`);
    runStep();
  }

  function runStep() {
    if (isPausedRef.current) return;
    const idx = indexRef.current;
    const anims = animationsRef.current;
    if (idx >= anims.length) {
      setStatus("done");
      setStatusMsg("✅ Complete!");
      return;
    }
    const bars = document.getElementsByClassName(barClass);
    executeAnim(anims[idx], bars);
    indexRef.current = idx + 1;
    timeoutRef.current = setTimeout(() => runStep(), speedRef.current);
  }

  function executeAnim(anim, bars) {
    const type = anim.type;

    if (type === ANIMATION_TYPES.COMPARE || type === "comparison") {
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "#fbbf24"; bars[i].style.transform = "scaleY(1.05)"; }
      });
      setComparisons(prev => prev + 1);
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "#22c55e")
            { bars[i].style.backgroundColor = "#60a5fa"; bars[i].style.transform = "scaleY(1)"; }
        });
      }, speedRef.current * 0.4);

    } else if (type === ANIMATION_TYPES.SWAP || type === "swap") {
      if (anim.indices.length > 1) {
        setArray(prev => {
          const next = [...prev];
          next[anim.indices[0]] = anim.heights[0];
          next[anim.indices[1]] = anim.heights[1];
          return next;
        });
        setSwaps(prev => prev + 1);
      } else {
        setArray(prev => { const next = [...prev]; next[anim.indices[0]] = anim.heights[0]; return next; });
      }
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "#ef4444"; bars[i].style.transform = "scaleY(1)"; }
      });
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "#22c55e")
            { bars[i].style.backgroundColor = "#60a5fa"; bars[i].style.transform = "scaleY(1)"; }
        });
      }, speedRef.current * 0.9);

    } else if (type === ANIMATION_TYPES.OVERWRITE) {
      setArray(prev => {
        const next = [...prev];
        anim.indices.forEach((idx, i) => { next[idx] = anim.heights[i]; });
        return next;
      });
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "#ef4444"; bars[i].style.transform = "scaleY(1)"; }
      });
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "#22c55e")
            { bars[i].style.backgroundColor = "#60a5fa"; bars[i].style.transform = "scaleY(1)"; }
        });
      }, speedRef.current * 0.75);

    } else if (type === ANIMATION_TYPES.MARK_SORTED || type === "sorted") {
      if (bars[anim.index]) {
        bars[anim.index].style.backgroundColor = "#22c55e";
        bars[anim.index].style.transform = "scaleY(1)";
      }

    } else if (type === ANIMATION_TYPES.HIGHLIGHT_RANGE) {
      for (let i = 0; i < bars.length; i++) {
        if (i >= anim.start && i <= anim.end) {
          if (!["#22c55e","#fbbf24","#ef4444"].includes(bars[i].style.backgroundColor))
            bars[i].style.backgroundColor = "rgba(96,165,250,0.5)";
        } else {
          if (bars[i].style.backgroundColor !== "#22c55e")
            bars[i].style.backgroundColor = "rgba(96,165,250,0.2)";
        }
      }

    } else if (type === ANIMATION_TYPES.HIGHLIGHT_PIVOT) {
      if (bars[anim.index]) bars[anim.index].style.backgroundColor = "#a855f7";
    }
  }

  const algoLabel = selectedAlgo ? ALGO_MAP[selectedAlgo].label : "—";
  const MAX_BAR_HEIGHT = 260;
  const maxValue = Math.max(...array, 1);

  const statusColors = {
    done:    { bg: "#dcfce7", color: "#16a34a" },
    running: { bg: "#dbeafe", color: "#1d4ed8" },
    paused:  { bg: "#fef9c3", color: "#a16207" },
    idle:    { bg: "#f1f5f9", color: "#6b7280"  },
  };
  const sc = statusColors[status] || statusColors.idle;

  return (
    <div style={{
      flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", gap: "10px",
      backgroundColor: "#ffffff", borderRadius: "14px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.25)", padding: "16px", overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontWeight: "700", fontSize: "15px", color: "#0B1F4A" }}>{algoLabel}</span>
        <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "20px", fontWeight: "600", backgroundColor: sc.bg, color: sc.color }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Algorithm selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flexShrink: 0 }}>
        {Object.entries(ALGO_MAP).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => selectAlgo(key)}
            style={{
              padding: "4px 10px", fontSize: "11px", cursor: "pointer", borderRadius: "7px",
              border: selectedAlgo === key ? "2px solid #3b82f6" : "2px solid #e2e8f0",
              backgroundColor: selectedAlgo === key ? "rgba(59,130,246,0.08)" : "#f8fafc",
              color: selectedAlgo === key ? "#1d4ed8" : "#374151",
              fontWeight: "600", transition: "all 0.15s ease"
            }}
            onMouseEnter={e => { if (selectedAlgo !== key) { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#1d4ed8"; } }}
            onMouseLeave={e => { if (selectedAlgo !== key) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#374151"; } }}
          >{label}</button>
        ))}
      </div>

      {/* Pause / Resume / Reset */}
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {status === "running" && (
          <button onClick={pause}
            style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#dc2626"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#ef4444"; }}>
            ⏸ Pause
          </button>
        )}
        {status === "paused" && (
          <button onClick={resume}
            style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#3b82f6"; }}>
            ▶ Resume
          </button>
        )}
        <button onClick={() => hardReset([...sharedArray])}
          style={{ flex: 1, padding: "6px", fontSize: "12px", borderRadius: "8px", border: "none", backgroundColor: "#f59e0b", color: "#fff", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s ease" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#d97706"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}>
          ↺ Reset
        </button>
      </div>

      {/* Stats */}
      <div style={{ ...CARD, display: "flex", gap: "16px", flexShrink: 0 }}>
        <div>
          <p style={LABEL}>Comparisons</p>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#0B1F4A" }}>{comparisons}</span>
        </div>
        <div style={{ width: "1px", backgroundColor: "#e2e8f0" }} />
        <div>
          <p style={LABEL}>Swaps</p>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#0B1F4A" }}>{swaps}</span>
        </div>
      </div>

      {/* Status message */}
      <div style={{ fontSize: "11px", color: "#6b7280", padding: "5px 10px", backgroundColor: "#f8fafc", borderRadius: "7px", border: "1px solid #e2e8f0", flexShrink: 0, minHeight: "24px" }}>
        {statusMsg}
      </div>

      {/* Bars */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "2px", overflow: "hidden", minHeight: 0, padding: "4px 4px 0" }}>
        {array.map((value, idx) => {
          const barHeight = Math.max(4, (value / maxValue) * MAX_BAR_HEIGHT);
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", flex: 1, minWidth: "3px", maxWidth: "50px", height: "100%" }}>
              {array.length <= 30 && (
                <div style={{ fontSize: "8px", color: "#6b7280", fontWeight: "bold", marginBottom: "1px", textAlign: "center", userSelect: "none" }}>{value}</div>
              )}
              <div className={`${barClass} array-bar`} style={{ backgroundColor: "#60a5fa", height: `${barHeight}px`, width: "100%", borderRadius: "3px 3px 0 0", transformOrigin: "bottom" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
