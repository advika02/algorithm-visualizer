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

// Isolated animation runner — no shared state with ArrayVisualizer
export function ComparisonPanel({ sharedArray, speed, speedRef, panelId }) {
  const [array, setArray] = useState([...sharedArray]);
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [status, setStatus] = useState("idle"); // idle | running | paused | done
  const [statusMsg, setStatusMsg] = useState("Select an algorithm and press Start.");

  const animationsRef = useRef([]);
  const indexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef(null);
  const barClass = BAR_CLASS_PREFIX + panelId;

  // Sync array when parent changes it (new shared array)
  useEffect(() => {
    reset([...sharedArray]);
  }, [sharedArray]);

  function reset(arr) {
    clearTimeout(timeoutRef.current);
    isPausedRef.current = false;
    animationsRef.current = [];
    indexRef.current = 0;
    setArray(arr ?? [...sharedArray]);
    setStats({ comparisons: 0, swaps: 0 });
    setStatus("idle");
    setStatusMsg("Select an algorithm and press Start.");
    setTimeout(() => {
      const bars = document.getElementsByClassName(barClass);
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "turquoise";
        bars[i].style.transform = "scaleY(1)";
      }
    }, 0);
  }

  function selectAlgo(key) {
    if (status === "running") return;
    setSelectedAlgo(key);
    animationsRef.current = [];
    indexRef.current = 0;
    setStats({ comparisons: 0, swaps: 0 });
    setStatus("idle");
    setStatusMsg(`${ALGO_MAP[key].label} selected. Press Start.`);
  }

  function start() {
    if (!selectedAlgo) { setStatusMsg("⚠️ Select an algorithm first."); return; }
    if (status === "running") return;

    // Build fresh animations from the current shared array
    const freshArray = [...sharedArray];
    setArray(freshArray);
    animationsRef.current = ALGO_MAP[selectedAlgo].fn(freshArray);
    indexRef.current = 0;
    setStats({ comparisons: 0, swaps: 0 });
    isPausedRef.current = false;
    setStatus("running");
    setStatusMsg(`Running ${ALGO_MAP[selectedAlgo].label}...`);

    setTimeout(() => {
      const bars = document.getElementsByClassName(barClass);
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "turquoise";
        bars[i].style.transform = "scaleY(1)";
      }
      runStep(freshArray);
    }, 0);
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
    runStep(null);
  }

  // arr param used only on first call to avoid stale closure
  function runStep(arr) {
    if (isPausedRef.current) return;
    const idx = indexRef.current;
    const anims = animationsRef.current;

    if (idx >= anims.length) {
      setStatus("done");
      setStatusMsg("✅ Sorting complete!");
      return;
    }

    const bars = document.getElementsByClassName(barClass);
    const anim = anims[idx];
    executeAnim(anim, bars, arr);
    indexRef.current = idx + 1;

    timeoutRef.current = setTimeout(() => runStep(null), speedRef.current);
  }

  function executeAnim(anim, bars, currentArr) {
    const type = anim.type;

    if (type === ANIMATION_TYPES.COMPARE || type === "comparison") {
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "red"; bars[i].style.transform = "scaleY(1.05)"; }
      });
      setStats(p => ({ ...p, comparisons: p.comparisons + 1 }));
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "green") {
            bars[i].style.backgroundColor = "turquoise"; bars[i].style.transform = "scaleY(1)";
          }
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
        setStats(p => ({ ...p, swaps: p.swaps + 1 }));
      } else {
        setArray(prev => {
          const next = [...prev]; next[anim.indices[0]] = anim.heights[0]; return next;
        });
      }
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "yellow"; bars[i].style.transform = "scaleY(1)"; }
      });
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "green") {
            bars[i].style.backgroundColor = "turquoise"; bars[i].style.transform = "scaleY(1)";
          }
        });
      }, speedRef.current * 0.9);

    } else if (type === ANIMATION_TYPES.OVERWRITE) {
      setArray(prev => {
        const next = [...prev];
        anim.indices.forEach((idx, i) => { next[idx] = anim.heights[i]; });
        return next;
      });
      anim.indices.forEach(i => {
        if (bars[i]) { bars[i].style.backgroundColor = "yellow"; bars[i].style.transform = "scaleY(1)"; }
      });
      setTimeout(() => {
        anim.indices.forEach(i => {
          if (bars[i] && bars[i].style.backgroundColor !== "green") {
            bars[i].style.backgroundColor = "turquoise"; bars[i].style.transform = "scaleY(1)";
          }
        });
      }, speedRef.current * 0.75);

    } else if (type === ANIMATION_TYPES.MARK_SORTED || type === "sorted") {
      if (bars[anim.index]) {
        bars[anim.index].style.backgroundColor = "green";
        bars[anim.index].style.transform = "scaleY(1)";
      }

    } else if (type === ANIMATION_TYPES.HIGHLIGHT_RANGE) {
      for (let i = 0; i < bars.length; i++) {
        if (i >= anim.start && i <= anim.end) {
          if (bars[i].style.backgroundColor !== "green" && bars[i].style.backgroundColor !== "red" && bars[i].style.backgroundColor !== "yellow")
            bars[i].style.backgroundColor = "rgba(135,206,250,0.6)";
        } else {
          if (bars[i].style.backgroundColor !== "green")
            bars[i].style.backgroundColor = "rgba(64,224,208,0.3)";
        }
      }

    } else if (type === ANIMATION_TYPES.HIGHLIGHT_PIVOT) {
      if (bars[anim.index]) bars[anim.index].style.backgroundColor = "purple";
    }
  }

  const algoLabel = selectedAlgo ? ALGO_MAP[selectedAlgo].label : "—";
  const MAX_BAR_HEIGHT = 280;
  const maxValue = Math.max(...array, 1);

  return (
    <div style={{
      flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px",
      backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)", padding: "12px", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontWeight: "700", fontSize: "14px", color: "#3730a3" }}>{algoLabel}</span>
        <span style={{
          fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600",
          backgroundColor: status === "done" ? "#dcfce7" : status === "running" ? "#dbeafe" : status === "paused" ? "#fef9c3" : "#f1f5f9",
          color: status === "done" ? "#16a34a" : status === "running" ? "#1d4ed8" : status === "paused" ? "#a16207" : "#64748b"
        }}>
          {status === "done" ? "Done" : status === "running" ? "Running" : status === "paused" ? "Paused" : "Idle"}
        </span>
      </div>

      {/* Algorithm selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", flexShrink: 0 }}>
        {Object.entries(ALGO_MAP).map(([key, { label }]) => (
          <button key={key} onClick={() => selectAlgo(key)} style={{
            padding: "4px 8px", fontSize: "11px", cursor: "pointer", borderRadius: "6px",
            border: selectedAlgo === key ? "2px solid #6366f1" : "2px solid #e2e8f0",
            backgroundColor: selectedAlgo === key ? "rgba(99,102,241,0.1)" : "#f8fafc",
            color: "#1e293b", fontWeight: "600", transition: "all 0.15s ease"
          }}>{label}</button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {status !== "running" ? (
          <button onClick={status === "paused" ? resume : start} style={{
            flex: 1, padding: "7px", fontSize: "12px", borderRadius: "7px", border: "none",
            backgroundColor: "#43a047", color: "#fff", fontWeight: "700", cursor: "pointer"
          }}>
            {status === "paused" ? "▶ Resume" : "▶ Start"}
          </button>
        ) : (
          <button onClick={pause} style={{
            flex: 1, padding: "7px", fontSize: "12px", borderRadius: "7px", border: "none",
            backgroundColor: "#e53935", color: "#fff", fontWeight: "700", cursor: "pointer"
          }}>⏸ Pause</button>
        )}
        <button onClick={() => reset()} style={{
          flex: 1, padding: "7px", fontSize: "12px", borderRadius: "7px", border: "none",
          backgroundColor: "#fb8c00", color: "#fff", fontWeight: "700", cursor: "pointer"
        }}>↺ Reset</button>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: "8px", fontSize: "12px", color: "#1e293b",
        backgroundColor: "#fffbeb", borderRadius: "8px", padding: "7px 10px",
        border: "1px solid #fde68a", flexShrink: 0
      }}>
        <span>🔍 <strong>{stats.comparisons}</strong> comparisons</span>
        <span>🔄 <strong>{stats.swaps}</strong> swaps</span>
      </div>

      {/* Status message */}
      <div style={{
        fontSize: "11px", color: "#475569", padding: "5px 8px",
        backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0",
        flexShrink: 0, minHeight: "24px"
      }}>
        {statusMsg}
      </div>

      {/* Bars */}
      <div style={{
        flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center",
        gap: "2px", overflow: "hidden", minHeight: 0, padding: "4px 4px 0"
      }}>
        {array.map((value, idx) => {
          const barHeight = Math.max(4, (value / maxValue) * MAX_BAR_HEIGHT);
          return (
            <div key={idx} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-end", flex: "1", minWidth: "3px", maxWidth: "50px", height: "100%"
            }}>
              {array.length <= 30 && (
                <div style={{
                  fontSize: "8px", color: "#475569", fontWeight: "bold",
                  marginBottom: "1px", textAlign: "center", userSelect: "none"
                }}>{value}</div>
              )}
              <div className={barClass} style={{
                backgroundColor: "turquoise",
                height: `${barHeight}px`,
                width: "100%",
                transition: "height 0.3s ease, background-color 0.2s ease, transform 0.2s ease",
                borderRadius: "3px 3px 0 0",
                transformOrigin: "bottom"
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
