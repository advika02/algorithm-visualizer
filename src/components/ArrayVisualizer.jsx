import { useState, useEffect, useRef } from "react";
import { bubbleSort } from "../algorithms/bubbleSort";
import { mergeSort } from "../algorithms/mergeSort";
import { quickSort } from "../algorithms/quickSort";
import { selectionSort } from "../algorithms/selectionSort";
import { insertionSort } from "../algorithms/insertionSort";
import { binarySearch } from "../algorithms/binarySearch";
import { ANIMATION_TYPES } from "../algorithms/animationTypes";
import { algorithmComplexities } from "../algorithms/algorithmComplexities";
import { ComparisonPanel } from "./ComparisonPanel";

// Pure helpers — no state dependency
function makeArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 350) + 20);
}
function makeSortedArray(size) {
  return makeArray(size).sort((a, b) => a - b);
}

function ArrayVisualizer({ initialAlgorithm }) {
  const [array, setArray] = useState(() => makeArray(5));
  const [arraySize, setArraySize] = useState(5);
  const [speed, setSpeed] = useState(1200);
  const speedRef = useRef(1200);
  const isPausedRef = useRef(false);
  // selectedAlgorithm is initialised from the route so Start works immediately
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(initialAlgorithm ?? null);
  const [animations, setAnimations] = useState([]);
  const animationsRef = useRef([]);          // always-current ref for the loop
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [stepExplanation, setStepExplanation] = useState("");
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, iteration: 0 });
  const [highlightedRange, setHighlightedRange] = useState({ start: -1, end: -1 });
  const highlightedRangeRef = useRef({ start: -1, end: -1 });
  const [viewMode, setViewMode] = useState("normal");
  const [customInput, setCustomInput] = useState("");
  const [customInputError, setCustomInputError] = useState("");
  const [binarySearchTarget, setBinarySearchTarget] = useState("");
  const [binarySearchError, setBinarySearchError] = useState("");
  const timeoutRef = useRef(null);

  const isBinary = initialAlgorithm === "binary";
  const isSortingAlgo = !isBinary;

  // On mount: generate appropriate array and pre-load animations
  useEffect(() => {
    if (initialAlgorithm === "binary") {
      const arr = makeSortedArray(5);
      setArray(arr);
    } else if (initialAlgorithm) {
      const arr = makeArray(5);
      setArray(arr);
      loadAnimationsForAlgo(initialAlgorithm, arr);
    }
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────────

  function getExplanation(animation, arr) {
    if (animation.explanation) return animation.explanation;
    const type = animation.type;
    if (type === ANIMATION_TYPES.COMPARE || type === "comparison") {
      const [i, j] = animation.indices;
      const a = arr[i], b = arr[j];
      if (i === j) return `Comparing middle element ${a} with the target ${animation.target ?? "?"}.`;
      return `Comparing ${a} (index ${i}) with ${b} (index ${j}).`;
    }
    if (type === ANIMATION_TYPES.SWAP || type === "swap") {
      if (animation.indices.length > 1) {
        const [i, j] = animation.indices;
        return `${animation.heights[1]} > ${animation.heights[0]}, so swap elements at index ${i} and ${j}.`;
      }
      return `Placing value ${animation.heights[0]} at index ${animation.indices[0]}.`;
    }
    if (type === ANIMATION_TYPES.OVERWRITE)
      return `Writing value ${animation.heights[0]} into index ${animation.indices[0]} during merge.`;
    if (type === ANIMATION_TYPES.MARK_SORTED || type === "sorted")
      return `Element ${arr[animation.index]} at index ${animation.index} is now in its final sorted position.`;
    if (type === ANIMATION_TYPES.HIGHLIGHT_RANGE)
      return `Narrowing search range to indices ${animation.start} – ${animation.end}.`;
    if (type === ANIMATION_TYPES.HIGHLIGHT_PIVOT)
      return `Selecting ${arr[animation.index]} at index ${animation.index} as the pivot.`;
    if (type === ANIMATION_TYPES.HIGHLIGHT_MID)
      return `Middle element is ${arr[animation.index]} at index ${animation.index}. Comparing with target ${animation.target}.`;
    if (type === ANIMATION_TYPES.MARK_FOUND)
      return `Target ${animation.target} found at index ${animation.index}.`;
    if (type === ANIMATION_TYPES.MARK_NOT_FOUND)
      return `Search range is empty. ${animation.target} does not exist in the array.`;
    return "";
  }

  function clearLoop() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function resetBars() {
    const bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.backgroundColor = "turquoise";
      bars[i].style.transform = "scaleY(1)";
    }
  }

  // Generate a fresh array of `size` elements and reload animations for current algo
  function generateArray(size) {
    const sz = size ?? arraySize;
    const arr = isBinary ? makeSortedArray(sz) : makeArray(sz);
    clearLoop();
    setArray(arr);
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentStep("");
    setStepExplanation("");
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    highlightedRangeRef.current = { start: -1, end: -1 };
    setTimeout(resetBars, 0);

    // Reload animations so Start works immediately after New Array
    if (selectedAlgorithm && selectedAlgorithm !== "binary") {
      loadAnimationsForAlgo(selectedAlgorithm, arr);
    } else {
      setAnimations([]);
      animationsRef.current = [];
      setCurrentAnimationIndex(0);
      currentIndexRef.current = 0;
    }
  }

  function resetVisualization() {
    clearLoop();
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentAnimationIndex(0);
    currentIndexRef.current = 0;
    setCurrentStep("");
    setStepExplanation("");
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    highlightedRangeRef.current = { start: -1, end: -1 };
    resetBars();
  }

  // Build and store animations for a sorting algorithm against a given array
  function loadAnimationsForAlgo(key, arr) {
    const generators = {
      bubble: bubbleSort, merge: mergeSort, quick: quickSort,
      selection: selectionSort, insertion: insertionSort,
    };
    const gen = generators[key];
    if (!gen) return;
    const anims = gen(arr);
    setAnimations(anims);
    animationsRef.current = anims;
    setCurrentAnimationIndex(0);
    currentIndexRef.current = 0;
    setSelectedAlgorithm(key);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Algorithm loaded. Press ▶ Start to begin!");
  }

  // ── animation execution ──────────────────────────────────────────────────

  function executeAnimation(animation, arr, bars) {
    const explanation = getExplanation(animation, arr);
    setStepExplanation(explanation);
    const hr = highlightedRangeRef.current;

    if (animation.type === ANIMATION_TYPES.COMPARE || animation.type === "comparison") {
      animation.indices.forEach(idx => {
        if (bars[idx]) { bars[idx].style.backgroundColor = "red"; bars[idx].style.transform = "scaleY(1.05)"; }
      });
      setCurrentStep(`🔍 Comparing index ${animation.indices[0]} and ${animation.indices[1]}`);
      setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1, iteration: prev.iteration + 1 }));
      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const inRange = hr.start !== -1 && idx >= hr.start && idx <= hr.end;
            bars[idx].style.backgroundColor = inRange ? "rgba(135,206,250,0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speedRef.current * 0.4);

    } else if (animation.type === ANIMATION_TYPES.SWAP || animation.type === "swap") {
      if (animation.indices.length > 1) {
        setArray(prev => { const a = [...prev]; a[animation.indices[0]] = animation.heights[0]; a[animation.indices[1]] = animation.heights[1]; return a; });
        setCurrentStep(`🔄 Swapping index ${animation.indices[0]} ↔ ${animation.indices[1]}`);
        setStats(prev => ({ ...prev, swaps: prev.swaps + 1, iteration: prev.iteration + 1 }));
      } else {
        setArray(prev => { const a = [...prev]; a[animation.indices[0]] = animation.heights[0]; return a; });
        setCurrentStep(`✏️ Placing ${animation.heights[0]} at index ${animation.indices[0]}`);
        setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
      }
      animation.indices.forEach(idx => { if (bars[idx]) { bars[idx].style.backgroundColor = "yellow"; bars[idx].style.transform = "scaleY(1)"; } });
      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const inRange = hr.start !== -1 && idx >= hr.start && idx <= hr.end;
            bars[idx].style.backgroundColor = inRange ? "rgba(135,206,250,0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speedRef.current * 0.9);

    } else if (animation.type === ANIMATION_TYPES.MARK_SORTED || animation.type === "sorted") {
      if (bars[animation.index]) { bars[animation.index].style.backgroundColor = "green"; bars[animation.index].style.transform = "scaleY(1)"; }
      setCurrentStep(`✅ Index ${animation.index} is in its sorted position`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

    } else if (animation.type === ANIMATION_TYPES.OVERWRITE) {
      setArray(prev => { const a = [...prev]; animation.indices.forEach((idx, i) => { a[idx] = animation.heights[i]; }); return a; });
      animation.indices.forEach(idx => { if (bars[idx]) { bars[idx].style.backgroundColor = "yellow"; bars[idx].style.transform = "scaleY(1)"; } });
      setCurrentStep(`✏️ Overwriting index ${animation.indices[0]} with ${animation.heights[0]}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const inRange = hr.start !== -1 && idx >= hr.start && idx <= hr.end;
            bars[idx].style.backgroundColor = inRange ? "rgba(135,206,250,0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speedRef.current * 0.75);

    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_RANGE) {
      const newRange = { start: animation.start, end: animation.end };
      setHighlightedRange(newRange);
      highlightedRangeRef.current = newRange;
      for (let i = 0; i < bars.length; i++) {
        if (!bars[i]) continue;
        if (i >= animation.start && i <= animation.end) {
          if (!["green","red","yellow"].includes(bars[i].style.backgroundColor))
            bars[i].style.backgroundColor = "rgba(135,206,250,0.6)";
        } else {
          if (bars[i].style.backgroundColor !== "green") bars[i].style.backgroundColor = "rgba(64,224,208,0.3)";
        }
      }
      setCurrentStep(`📍 Subarray from index ${animation.start} to ${animation.end}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_PIVOT) {
      if (bars[animation.index]) bars[animation.index].style.backgroundColor = "purple";
      setCurrentStep(`🎯 Pivot at index ${animation.index}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_MID) {
      if (bars[animation.index]) { bars[animation.index].style.backgroundColor = "purple"; bars[animation.index].style.transform = "scaleY(1.05)"; }
      setCurrentStep(`🔎 Mid index ${animation.index} — value ${arr[animation.index]} vs target ${animation.target}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

    } else if (animation.type === ANIMATION_TYPES.MARK_FOUND) {
      if (bars[animation.index]) { bars[animation.index].style.backgroundColor = "green"; bars[animation.index].style.transform = "scaleY(1)"; }
      setCurrentStep(`✅ Found ${animation.target} at index ${animation.index}!`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

    } else if (animation.type === ANIMATION_TYPES.MARK_NOT_FOUND) {
      setCurrentStep(`❌ ${animation.target} was not found in the array.`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    }
  }

  // ── animation loop ───────────────────────────────────────────────────────

  function runLoop(arr) {
    function step() {
      if (isPausedRef.current) return;
      const idx = currentIndexRef.current;
      const anims = animationsRef.current;
      if (idx >= anims.length) {
        setCurrentStep("🎉 Complete!");
        setIsRunning(false); setIsPaused(false); isPausedRef.current = false;
        return;
      }
      const bars = document.getElementsByClassName("array-bar");
      executeAnimation(anims[idx], arr, bars);
      currentIndexRef.current = idx + 1;
      setCurrentAnimationIndex(idx + 1);
      timeoutRef.current = setTimeout(step, speedRef.current);
    }
    step();
  }

  function startPauseAnimation() {
    if (!selectedAlgorithm) { setCurrentStep("⚠️ No algorithm loaded."); return; }
    if (isRunning && !isPaused) {
      isPausedRef.current = true; setIsPaused(true); clearLoop();
    } else if (isPaused) {
      isPausedRef.current = false; setIsPaused(false); runLoop(array);
    } else {
      // Fresh start
      isPausedRef.current = false;
      currentIndexRef.current = 0;
      setCurrentAnimationIndex(0);
      setStats({ comparisons: 0, swaps: 0, iteration: 0 });
      setHighlightedRange({ start: -1, end: -1 });
      highlightedRangeRef.current = { start: -1, end: -1 };
      setIsRunning(true); setIsPaused(false);
      setTimeout(() => runLoop(array), 0);
    }
  }

  function nextStep() {
    const idx = currentIndexRef.current;
    const anims = animationsRef.current;
    if (idx >= anims.length) { setCurrentStep("🎉 Complete!"); setIsRunning(false); return; }
    const bars = document.getElementsByClassName("array-bar");
    executeAnimation(anims[idx], array, bars);
    currentIndexRef.current = idx + 1;
    setCurrentAnimationIndex(idx + 1);
  }

  // ── controls ─────────────────────────────────────────────────────────────

  function handleSpeedChange(e) { const v = Number(e.target.value); setSpeed(v); speedRef.current = v; }
  function handleArraySizeChange(e) { const s = Number(e.target.value); setArraySize(s); generateArray(s); }

  function applyCustomArray() {
    const parts = customInput.split(",").map(v => v.trim());
    const valid = parts.filter(v => v !== "").map(v => parseInt(v, 10)).filter(v => !isNaN(v) && v > 0);
    const removedCount = parts.filter(v => v !== "").length - valid.length;
    if (valid.length === 0) { setCustomInputError("Please enter at least one valid number."); return; }
    if (valid.length < 2) { setCustomInputError("Enter at least 2 values."); return; }
    setCustomInputError(removedCount > 0 ? "Invalid values were removed from the input." : "");
    const finalArr = isBinary ? [...valid].sort((a, b) => a - b) : valid;
    clearLoop();
    setArray(finalArr); setArraySize(finalArr.length);
    setIsRunning(false); setIsPaused(false); isPausedRef.current = false;
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 }); highlightedRangeRef.current = { start: -1, end: -1 };
    setCurrentStep(""); setStepExplanation("");
    setTimeout(resetBars, 0);
    if (selectedAlgorithm && selectedAlgorithm !== "binary") {
      loadAnimationsForAlgo(selectedAlgorithm, finalArr);
    } else {
      setAnimations([]); animationsRef.current = [];
      setCurrentAnimationIndex(0); currentIndexRef.current = 0;
    }
  }

  function runBinarySearch() {
    setBinarySearchError("");
    const target = Number(binarySearchTarget);
    if (binarySearchTarget.trim() === "" || isNaN(target)) { setBinarySearchError("Enter a valid number to search."); return; }
    clearLoop();
    const sorted = [...array].sort((a, b) => a - b);
    setArray(sorted);
    const anims = binarySearch(sorted, target);
    animationsRef.current = anims;
    setAnimations(anims);
    currentIndexRef.current = 0;
    setCurrentAnimationIndex(0);
    setSelectedAlgorithm("binary");
    setIsRunning(true); setIsPaused(false); isPausedRef.current = false;
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 }); highlightedRangeRef.current = { start: -1, end: -1 };
    setCurrentStep(`🔎 Starting Binary Search for ${target}...`);
    setTimeout(resetBars, 0);
    setTimeout(() => runLoop(sorted), 50);
  }

  // ── render ───────────────────────────────────────────────────────────────

  const CARD = {
    backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0",
    padding: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };
  const LABEL = { margin: "0 0 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" };

  return (
    <div style={{
      minHeight: "100%", background: "linear-gradient(135deg, #e9eef5, #d6e4f0)",
      fontFamily: "'Segoe UI', sans-serif", color: "#1e293b",
      boxSizing: "border-box", padding: "12px 16px 20px",
      display: "flex", flexDirection: "column", gap: "10px"
    }}>

      {/* Mode toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
          {[{ label: "Normal Mode", val: "normal" }, { label: "⚖ Compare Mode", val: "compare" }].map(({ label, val }) => (
            <button key={val} onClick={() => setViewMode(val)} style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none",
              backgroundColor: viewMode === val ? "#6366f1" : "#f8fafc",
              color: viewMode === val ? "#fff" : "#64748b"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── COMPARISON MODE ── */}
      {viewMode === "compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ ...CARD, display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "160px" }}>
              <label style={{ ...LABEL, margin: 0, whiteSpace: "nowrap" }}>Speed</label>
              <input type="range" min="500" max="4000" step="100" value={speed} onChange={handleSpeedChange} style={{ flex: 1, accentColor: "#6366f1" }} />
              <span style={{ fontSize: "11px", color: "#6366f1", whiteSpace: "nowrap" }}>{speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 2, minWidth: "220px" }}>
              <label style={{ ...LABEL, margin: 0, whiteSpace: "nowrap" }}>Custom Array</label>
              <input type="text" placeholder="e.g. 5,1,9,3,7" value={customInput}
                onChange={e => { setCustomInput(e.target.value); setCustomInputError(""); }}
                style={{ flex: 1, padding: "5px 8px", fontSize: "12px", borderRadius: "6px", border: "1.5px solid #e2e8f0", outline: "none", color: "#1e293b", backgroundColor: "#f8fafc", fontFamily: "inherit" }}
              />
              <button onClick={applyCustomArray} style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "6px", border: "none", backgroundColor: "#6366f1", color: "#fff", fontWeight: "700", cursor: "pointer" }}>Apply</button>
              <button onClick={() => generateArray(arraySize)} style={{ padding: "5px 10px", fontSize: "12px", borderRadius: "6px", border: "1.5px solid #e2e8f0", backgroundColor: "transparent", color: "#1e293b", fontWeight: "700", cursor: "pointer" }}>⟳ New</button>
            </div>
            {customInputError && <span style={{ fontSize: "11px", color: customInputError.startsWith("Invalid") ? "#d97706" : "#ef4444" }}>{customInputError}</span>}
          </div>
          <div style={{ display: "flex", gap: "12px", minHeight: "500px" }}>
            <ComparisonPanel sharedArray={array} speed={speed} speedRef={speedRef} panelId="left" />
            <ComparisonPanel sharedArray={array} speed={speed} speedRef={speedRef} panelId="right" />
          </div>
        </div>
      )}

      {/* ── NORMAL MODE ── */}
      {viewMode === "normal" && (
        <>
          {/* Controls bar */}
          <div style={{ ...CARD, display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button onClick={startPauseAnimation} style={{
                padding: "7px 16px", fontSize: "12px", cursor: "pointer", borderRadius: "7px", border: "none",
                backgroundColor: isRunning && !isPaused ? "#e53935" : "#43a047", color: "#fff", fontWeight: "700"
              }}>{isRunning && !isPaused ? "⏸ Pause" : isPaused ? "▶ Resume" : "▶ Start"}</button>
              <button onClick={nextStep} disabled={isRunning && !isPaused} style={{
                padding: "7px 14px", fontSize: "12px", cursor: isRunning && !isPaused ? "not-allowed" : "pointer",
                borderRadius: "7px", border: "none", backgroundColor: "#1e88e5", color: "#fff", fontWeight: "700",
                opacity: isRunning && !isPaused ? 0.45 : 1
              }}>⏭ Step</button>
              <button onClick={resetVisualization} style={{ padding: "7px 14px", fontSize: "12px", cursor: "pointer", borderRadius: "7px", border: "none", backgroundColor: "#fb8c00", color: "#fff", fontWeight: "700" }}>↺ Reset</button>
              <button onClick={() => generateArray(arraySize)} style={{ padding: "7px 14px", fontSize: "12px", cursor: "pointer", borderRadius: "7px", border: "1.5px solid #e2e8f0", backgroundColor: "transparent", color: "#1e293b", fontWeight: "700" }}>⟳ New Array</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "140px" }}>
              <label style={{ ...LABEL, margin: 0, whiteSpace: "nowrap" }}>Speed</label>
              <input type="range" min="500" max="4000" step="100" value={speed} onChange={handleSpeedChange} style={{ flex: 1, accentColor: "#6366f1" }} />
              <span style={{ fontSize: "11px", color: "#6366f1", whiteSpace: "nowrap" }}>{speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}</span>
            </div>
            {isSortingAlgo && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "120px" }}>
                <label style={{ ...LABEL, margin: 0, whiteSpace: "nowrap" }}>Size — <span style={{ color: "#6366f1" }}>{arraySize}</span></label>
                <input type="range" min="5" max="40" step="1" value={arraySize} onChange={handleArraySizeChange} style={{ flex: 1, accentColor: "#6366f1" }} />
              </div>
            )}
          </div>

          {/* Three-column layout */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

            {/* LEFT: Static content — Custom Array + Complexity */}
            <div style={{ width: "210px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Custom Array */}
              <div style={CARD}>
                <p style={LABEL}>Custom Array</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <input type="text" placeholder="e.g. 5,1,9,3,7" value={customInput}
                    onChange={e => { setCustomInput(e.target.value); setCustomInputError(""); }}
                    style={{ width: "100%", padding: "7px 10px", fontSize: "12px", borderRadius: "8px",
                      border: customInputError && !customInputError.startsWith("Invalid") ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                      outline: "none", boxSizing: "border-box", color: "#1e293b", backgroundColor: "#f8fafc", fontFamily: "inherit" }}
                  />
                  {customInputError && <p style={{ margin: 0, fontSize: "11px", color: customInputError.startsWith("Invalid") ? "#d97706" : "#ef4444" }}>{customInputError}</p>}
                  <button onClick={applyCustomArray} style={{ width: "100%", padding: "7px", fontSize: "12px", cursor: "pointer", borderRadius: "8px", border: "none", backgroundColor: "#6366f1", color: "#fff", fontWeight: "700" }}>Apply</button>
                </div>
              </div>

              {/* Binary Search target */}
              {isBinary && (
                <div style={CARD}>
                  <p style={LABEL}>Target Value</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input type="number" placeholder="e.g. 18" value={binarySearchTarget}
                      onChange={e => { setBinarySearchTarget(e.target.value); setBinarySearchError(""); }}
                      style={{ width: "100%", padding: "7px 10px", fontSize: "12px", borderRadius: "8px",
                        border: binarySearchError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                        outline: "none", boxSizing: "border-box", color: "#1e293b", backgroundColor: "#f8fafc", fontFamily: "inherit" }}
                    />
                    {binarySearchError && <p style={{ margin: 0, fontSize: "11px", color: "#ef4444" }}>{binarySearchError}</p>}
                    <button onClick={runBinarySearch} style={{ width: "100%", padding: "7px", fontSize: "12px", cursor: "pointer", borderRadius: "8px", border: "none", backgroundColor: "#0ea5e9", color: "#fff", fontWeight: "700" }}>🔎 Search</button>
                    <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8", lineHeight: "1.4" }}>Array is auto-sorted before searching.</p>
                  </div>
                </div>
              )}

              {/* Complexity — static, doesn't change during animation */}
              {selectedAlgorithm && (() => {
                const c = algorithmComplexities[selectedAlgorithm];
                if (!c) return null;
                return (
                  <div style={{ ...CARD, backgroundColor: "#f1f5f9" }}>
                    <p style={LABEL}>Complexity</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#1e293b" }}>
                      <span style={{ fontWeight: "700", fontSize: "14px", color: "#3730a3" }}>{c.name}</span>
                      <span>🟢 Best: <strong>{c.best}</strong></span>
                      <span>🟡 Average: <strong>{c.average}</strong></span>
                      <span>🔴 Worst: <strong>{c.worst}</strong></span>
                      <span>💾 Space: <strong>{c.space}</strong></span>
                      {c.stable !== null && (
                        <span>⚖️ Stable: <strong style={{ color: c.stable ? "#16a34a" : "#dc2626" }}>{c.stable ? "Yes" : "No"}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* CENTER: Legend + Bars */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
              {/* Legend */}
              <div style={{ ...CARD, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px", fontSize: "12px", color: "#475569" }}>
                {[
                  { color: "#ef5350", label: "Comparing" }, { color: "#ffee58", label: "Swapping" },
                  { color: "#66bb6a", label: "Sorted" }, { color: "rgba(135,206,250,0.9)", label: "Active Range" },
                  { color: "#ab47bc", label: "Pivot / Mid" },
                ].map(({ color, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.1)" }} />
                    {label}
                  </span>
                ))}
              </div>
              {/* Bars */}
              <div style={{ ...CARD, padding: "12px 12px 0", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "2px", height: "380px", overflow: "hidden" }}>
                {(() => {
                  const MAX_H = 350;
                  const maxVal = Math.max(...array, 1);
                  return array.map((value, idx) => {
                    const h = Math.max(4, (value / maxVal) * MAX_H);
                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", flex: 1, minWidth: "4px", maxWidth: "60px", height: "100%" }}>
                        {array.length <= 50 && (
                          <div style={{ fontSize: array.length <= 20 ? "10px" : array.length <= 35 ? "8px" : "7px", color: "#475569", fontWeight: "bold", marginBottom: "2px", textAlign: "center", userSelect: "none" }}>{value}</div>
                        )}
                        <div className="array-bar" style={{ backgroundColor: "turquoise", height: `${h}px`, width: "100%", transition: "height 0.3s ease, background-color 0.2s ease, transform 0.2s ease", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }} />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* RIGHT: Dynamic content — Current Step + Step Explanation + Statistics */}
            <div style={{ width: "210px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Current Step + Explanation (unified) */}
              <div style={{ ...CARD, backgroundColor: currentStep ? "rgba(99,102,241,0.08)" : "#ffffff", border: currentStep ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
                <p style={LABEL}>Current Step</p>
                <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#1e293b", lineHeight: "1.5" }}>
                  {currentStep || "Press ▶ Start to begin"}
                </p>
                {stepExplanation && (
                  <>
                    <p style={{ margin: "0 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Explanation</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>{stepExplanation}</p>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div style={{ ...CARD, backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                <p style={LABEL}>Statistics</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#1e293b" }}>
                  <span>🔍 Comparisons: <strong>{stats.comparisons}</strong></span>
                  <span>🔄 Swaps: <strong>{stats.swaps}</strong></span>
                  <span>🔢 Iterations: <strong>{stats.iteration}</strong></span>
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default ArrayVisualizer;
