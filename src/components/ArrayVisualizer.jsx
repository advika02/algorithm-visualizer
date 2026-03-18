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

function ArrayVisualizer() {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(1200); // Animation delay in milliseconds
  const speedRef = useRef(1200);
  const isPausedRef = useRef(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, iteration: 0 });
  const [highlightedRange, setHighlightedRange] = useState({ start: -1, end: -1 });
  const [stepExplanation, setStepExplanation] = useState("");
  const [comparisonMode, setComparisonMode] = useState(false);

  function getExplanation(animation, arr) {
    if (animation.explanation) return animation.explanation;
    const type = animation.type;
    if (type === ANIMATION_TYPES.COMPARE || type === "comparison") {
      const [i, j] = animation.indices;
      const a = arr[i], b = arr[j];
      if (i === j) {
        // binary search compare step
        return `Comparing middle element ${a} with the target ${animation.target ?? "?"}.`;
      }
      return `Comparing ${a} (index ${i}) with ${b} (index ${j}).`;
    }
    if (type === ANIMATION_TYPES.SWAP || type === "swap") {
      if (animation.indices.length > 1) {
        const [i, j] = animation.indices;
        return `${animation.heights[1]} > ${animation.heights[0]}, so swap elements at index ${i} and ${j}.`;
      }
      return `Placing value ${animation.heights[0]} at index ${animation.indices[0]}.`;
    }
    if (type === ANIMATION_TYPES.OVERWRITE) {
      return `Writing value ${animation.heights[0]} into index ${animation.indices[0]} during merge.`;
    }
    if (type === ANIMATION_TYPES.MARK_SORTED || type === "sorted") {
      return `Element ${arr[animation.index]} at index ${animation.index} is now in its final sorted position.`;
    }
    if (type === ANIMATION_TYPES.HIGHLIGHT_RANGE) {
      return `Narrowing search range to indices ${animation.start} – ${animation.end}.`;
    }
    if (type === ANIMATION_TYPES.HIGHLIGHT_PIVOT) {
      return `Selecting ${arr[animation.index]} at index ${animation.index} as the pivot. Elements smaller go left, larger go right.`;
    }
    if (type === ANIMATION_TYPES.HIGHLIGHT_MID) {
      return `Middle element is ${arr[animation.index]} at index ${animation.index}. Comparing with target ${animation.target}.`;
    }
    if (type === ANIMATION_TYPES.MARK_FOUND) {
      return `Target ${animation.target} found at index ${animation.index}.`;
    }
    if (type === ANIMATION_TYPES.MARK_NOT_FOUND) {
      return `Search range is empty. ${animation.target} does not exist in the array.`;
    }
    return "";
  }

  useEffect(() => {
    generateArray();
  }, []);

  function generateArray(size) {
    const count = size ?? arraySize;
    const newArray = [];
    for (let i = 0; i < count; i++) {
      newArray.push(Math.floor(Math.random() * 350) + 20);
    }
    setArray(newArray);
    setCurrentStep("");
    setStepExplanation("");
    setIsRunning(false);
    setIsPaused(false);
    setAnimations([]);
    setCurrentAnimationIndex(0);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    clearAllTimeouts();

    setTimeout(() => {
      const bars = document.getElementsByClassName("array-bar");
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "turquoise";
        bars[i].style.transform = "scaleY(1)";
      }
    }, 0);
  }

  function clearAllTimeouts() {
    timeoutIds.forEach(id => clearTimeout(id));
    setTimeoutIds([]);
  }

  function resetVisualization() {
    clearAllTimeouts();
    setIsRunning(false);
    setIsPaused(false);
    setCurrentAnimationIndex(0);
    setCurrentStep("");
    setStepExplanation("");
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    const bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.backgroundColor = "turquoise";
      bars[i].style.transform = "scaleY(1)";
    }
  }

  function executeAnimation(animation, bars) {
    setStepExplanation(getExplanation(animation, array));
    if (animation.type === ANIMATION_TYPES.COMPARE || animation.type === "comparison") {
      animation.indices.forEach(idx => {
        bars[idx].style.backgroundColor = "red";
        bars[idx].style.transform = "scaleY(1.05)";
      });
      setCurrentStep(`🔍 Comparing elements at index ${animation.indices[0]} (${array[animation.indices[0]]}) and ${animation.indices[1]} (${array[animation.indices[1]]})`);
      setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1, iteration: prev.iteration + 1 }));

      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const isInRange = highlightedRange.start !== -1 &&
                            idx >= highlightedRange.start &&
                            idx <= highlightedRange.end;
            bars[idx].style.backgroundColor = isInRange ? "rgba(135, 206, 250, 0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speed * 0.4);
    } else if (animation.type === ANIMATION_TYPES.SWAP || animation.type === "swap") {
      if (animation.indices.length > 1) {
        setArray(prevArray => {
          const newArray = [...prevArray];
          newArray[animation.indices[0]] = animation.heights[0];
          newArray[animation.indices[1]] = animation.heights[1];
          return newArray;
        });
        setCurrentStep(`🔄 Swapping elements at index ${animation.indices[0]} (${animation.heights[1]}) and ${animation.indices[1]} (${animation.heights[0]})`);
        setStats(prev => ({ ...prev, swaps: prev.swaps + 1, iteration: prev.iteration + 1 }));
      } else {
        setArray(prevArray => {
          const newArray = [...prevArray];
          newArray[animation.indices[0]] = animation.heights[0];
          return newArray;
        });
        setCurrentStep(`✏️ Updating element at index ${animation.indices[0]} to value ${animation.heights[0]}`);
        setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
      }

      animation.indices.forEach((idx) => {
        bars[idx].style.backgroundColor = "yellow";
        bars[idx].style.transform = "scaleY(1)";
      });

      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const isInRange = highlightedRange.start !== -1 &&
                            idx >= highlightedRange.start &&
                            idx <= highlightedRange.end;
            bars[idx].style.backgroundColor = isInRange ? "rgba(135, 206, 250, 0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speed * 0.9);
    } else if (animation.type === ANIMATION_TYPES.MARK_SORTED || animation.type === "sorted") {
      bars[animation.index].style.backgroundColor = "green";
      bars[animation.index].style.transform = "scaleY(1)";
      setCurrentStep(`✅ Element at index ${animation.index} (${array[animation.index]}) is now in its correct sorted position`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    } else if (animation.type === ANIMATION_TYPES.OVERWRITE) {
      setArray(prevArray => {
        const newArray = [...prevArray];
        animation.indices.forEach((idx, i) => {
          newArray[idx] = animation.heights[i];
        });
        return newArray;
      });

      animation.indices.forEach((idx) => {
        bars[idx].style.backgroundColor = "yellow";
        bars[idx].style.transform = "scaleY(1)";
      });
      setCurrentStep(`✏️ Overwriting element at index ${animation.indices[0]} with value ${animation.heights[0]}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));

      setTimeout(() => {
        animation.indices.forEach(idx => {
          if (bars[idx] && bars[idx].style.backgroundColor !== "green" && bars[idx].style.backgroundColor !== "purple") {
            const isInRange = highlightedRange.start !== -1 &&
                            idx >= highlightedRange.start &&
                            idx <= highlightedRange.end;
            bars[idx].style.backgroundColor = isInRange ? "rgba(135, 206, 250, 0.6)" : "turquoise";
            bars[idx].style.transform = "scaleY(1)";
          }
        });
      }, speed * 0.75);
    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_RANGE) {
      setHighlightedRange({ start: animation.start, end: animation.end });
      for (let i = 0; i < bars.length; i++) {
        if (i >= animation.start && i <= animation.end) {
          if (bars[i].style.backgroundColor !== "green" &&
              bars[i].style.backgroundColor !== "red" &&
              bars[i].style.backgroundColor !== "yellow") {
            bars[i].style.backgroundColor = "rgba(135, 206, 250, 0.6)";
          }
        } else {
          if (bars[i].style.backgroundColor !== "green") {
            bars[i].style.backgroundColor = "rgba(64, 224, 208, 0.3)";
          }
        }
      }
      setCurrentStep(`📍 Processing subarray from index ${animation.start} to ${animation.end}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_PIVOT) {
      bars[animation.index].style.backgroundColor = "purple";
      setCurrentStep(`🎯 Pivot element selected at index ${animation.index} (${array[animation.index]})`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    } else if (animation.type === ANIMATION_TYPES.HIGHLIGHT_MID) {
      bars[animation.index].style.backgroundColor = "purple";
      bars[animation.index].style.transform = "scaleY(1.05)";
      setCurrentStep(`🔎 Mid index ${animation.index} — value ${array[animation.index]} vs target ${animation.target}`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    } else if (animation.type === ANIMATION_TYPES.MARK_FOUND) {
      bars[animation.index].style.backgroundColor = "green";
      bars[animation.index].style.transform = "scaleY(1)";
      setCurrentStep(`✅ Found ${animation.target} at index ${animation.index}!`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    } else if (animation.type === ANIMATION_TYPES.MARK_NOT_FOUND) {
      setCurrentStep(`❌ ${animation.target} was not found in the array.`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    }
  }

  function nextStep() {
    if (currentAnimationIndex >= animations.length) {
      setCurrentStep("🎉 Sorting complete! The array is now sorted.");
      setIsRunning(false);
      return;
    }

    const bars = document.getElementsByClassName("array-bar");
    const animation = animations[currentAnimationIndex];

    executeAnimation(animation, bars);
    setCurrentAnimationIndex(prev => prev + 1);
  }

  function startPauseAnimation() {
    if (!selectedAlgorithm) {
      setCurrentStep("⚠️ Please select a sorting algorithm first!");
      return;
    }

    if (isRunning && !isPaused) {
      isPausedRef.current = true;
      setIsPaused(true);
      clearAllTimeouts();
    } else if (isPaused) {
      isPausedRef.current = false;
      setIsPaused(false);
      continueAnimation();
    } else {
      isPausedRef.current = false;
      setIsRunning(true);
      setIsPaused(false);
      setCurrentAnimationIndex(0);
      setTimeout(() => continueAnimation(), 0);
    }
  }

  function continueAnimation() {
    if (isPausedRef.current) return;

    let index = currentAnimationIndex;

    function runStep() {
      if (isPausedRef.current) return;

      if (index >= animations.length) {
        setCurrentStep("🎉 Sorting complete! The array is now sorted.");
        setIsRunning(false);
        setIsPaused(false);
        isPausedRef.current = false;
        return;
      }

      const bars = document.getElementsByClassName("array-bar");
      const animation = animations[index];

      executeAnimation(animation, bars);

      index += 1;
      setCurrentAnimationIndex(index);

      const timeoutId = setTimeout(() => runStep(), speedRef.current);
      setTimeoutIds([timeoutId]);
    }

    runStep();
  }

  function startBubbleSort() {
    setSelectedAlgorithm("bubble");
    const sortAnimations = bubbleSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Bubble Sort loaded. Click 'Start' to begin sorting!");
  }

  function startMergeSort() {
    setSelectedAlgorithm("merge");
    const sortAnimations = mergeSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Merge Sort loaded. Click 'Start' to begin sorting!");
  }

  function startQuickSort() {
    setSelectedAlgorithm("quick");
    const sortAnimations = quickSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Quick Sort loaded. Click 'Start' to begin sorting!");
  }

  function startSelectionSort() {
    setSelectedAlgorithm("selection");
    const sortAnimations = selectionSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Selection Sort loaded. Click 'Start' to begin sorting!");
  }

  function startInsertionSort() {
    setSelectedAlgorithm("insertion");
    const sortAnimations = insertionSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setCurrentStep("📋 Insertion Sort loaded. Click 'Start' to begin sorting!");
  }

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    speedRef.current = val;
  }

  function handleArraySizeChange(e) {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    generateArray(newSize);
  }

  const [customInput, setCustomInput] = useState("");
  const [customInputError, setCustomInputError] = useState("");
  const [binarySearchTarget, setBinarySearchTarget] = useState("");
  const [binarySearchError, setBinarySearchError] = useState("");

  function applyCustomArray() {
    const parts = customInput.split(",").map(s => s.trim()).filter(s => s !== "");
    const nums = parts.map(Number);

    if (nums.length === 0 || nums.some(isNaN) || nums.some(n => n <= 0)) {
      setCustomInputError("Enter positive numbers separated by commas.");
      return;
    }
    if (nums.length < 5 || nums.length > 80) {
      setCustomInputError("Array size must be between 5 and 80.");
      return;
    }

    setCustomInputError("");
    const clamped = nums.map(n => Math.round(n));
    setArray(clamped);
    setArraySize(clamped.length);
    setCurrentStep("");
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setAnimations([]);
    setCurrentAnimationIndex(0);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    clearAllTimeouts();
    setTimeout(() => {
      const bars = document.getElementsByClassName("array-bar");
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "turquoise";
        bars[i].style.transform = "scaleY(1)";
      }
    }, 0);
  }

  function runBinarySearch() {
    setBinarySearchError("");
    const target = Number(binarySearchTarget);
    if (binarySearchTarget.trim() === "" || isNaN(target)) {
      setBinarySearchError("Enter a valid number to search.");
      return;
    }

    const isSorted = array.every((v, i) => i === 0 || array[i - 1] <= v);
    const searchArray = isSorted ? array : [...array].sort((a, b) => a - b);

    if (!isSorted) {
      setArray(searchArray);
      setTimeout(() => {
        const bars = document.getElementsByClassName("array-bar");
        for (let i = 0; i < bars.length; i++) {
          bars[i].style.backgroundColor = "turquoise";
          bars[i].style.transform = "scaleY(1)";
        }
      }, 0);
    }

    clearAllTimeouts();
    const searchAnimations = binarySearch(searchArray, target);
    setAnimations(searchAnimations);
    setCurrentAnimationIndex(0);
    setSelectedAlgorithm("binary");
    setIsRunning(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    setCurrentStep(`🔎 Starting Binary Search for ${target}...`);
    setTimeout(() => continueAnimation(), 0);
  }

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      background: "linear-gradient(135deg, #e9eef5, #d6e4f0)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#1e293b",
      boxSizing: "border-box"
    }}>
      {/* Page Title + Mode Toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "10px 16px 6px", flexShrink: 0, gap: "16px"
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "1px", color: "#1e293b", margin: 0 }}>
          Sorting Algorithm Visualizer
        </h1>
        <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", flexShrink: 0 }}>
          {[{ label: "Normal Mode", val: false }, { label: "⚖ Compare Mode", val: true }].map(({ label, val }) => (
            <button key={String(val)} onClick={() => setComparisonMode(val)} style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
              border: "none", transition: "all 0.2s ease",
              backgroundColor: comparisonMode === val ? "#6366f1" : "#f8fafc",
              color: comparisonMode === val ? "#fff" : "#64748b"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── COMPARISON MODE ── */}
      {comparisonMode && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", padding: "0 16px 12px", overflow: "hidden", minHeight: 0 }}>
          {/* Shared controls row */}
          <div style={{
            display: "flex", gap: "16px", alignItems: "center", flexShrink: 0,
            backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0",
            padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", whiteSpace: "nowrap" }}>
                Speed
              </label>
              <input type="range" min="500" max="4000" step="100" value={speed} onChange={handleSpeedChange}
                style={{ flex: 1, accentColor: "#6366f1" }} />
              <span style={{ fontSize: "11px", color: "#6366f1", whiteSpace: "nowrap" }}>
                {speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", whiteSpace: "nowrap" }}>
                Custom Array
              </label>
              <input type="text" placeholder="e.g. 5,1,9,3,7" value={customInput}
                onChange={e => { setCustomInput(e.target.value); setCustomInputError(""); }}
                style={{
                  flex: 1, padding: "5px 8px", fontSize: "12px", borderRadius: "6px",
                  border: customInputError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                  outline: "none", color: "#1e293b", backgroundColor: "#f8fafc", fontFamily: "inherit"
                }}
              />
              <button onClick={applyCustomArray} style={{
                padding: "5px 12px", fontSize: "12px", borderRadius: "6px", border: "none",
                backgroundColor: "#6366f1", color: "#fff", fontWeight: "700", cursor: "pointer"
              }}>Apply</button>
              <button onClick={generateArray} style={{
                padding: "5px 10px", fontSize: "12px", borderRadius: "6px",
                border: "1.5px solid #e2e8f0", backgroundColor: "transparent",
                color: "#1e293b", fontWeight: "700", cursor: "pointer"
              }}>⟳ New</button>
            </div>
            {customInputError && <span style={{ fontSize: "11px", color: "#ef4444" }}>{customInputError}</span>}
          </div>

          {/* Two panels side by side */}
          <div style={{ flex: 1, display: "flex", gap: "12px", minHeight: 0, overflow: "hidden" }}>
            <ComparisonPanel sharedArray={array} speed={speed} speedRef={speedRef} panelId="left" />
            <ComparisonPanel sharedArray={array} speed={speed} speedRef={speedRef} panelId="right" />
          </div>
        </div>
      )}

      {/* ── NORMAL MODE: Three-column layout ── */}
      {!comparisonMode && (
      <div style={{
        display: "flex",
        flex: 1,
        gap: "14px",
        padding: "0 16px 12px",
        overflow: "hidden",
        minHeight: 0
      }}>

        {/* ── LEFT: Controls ── */}
        <div style={{
          width: "220px",
          flexShrink: 0,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "16px 14px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          overflowY: "auto"
        }}>
          {/* Algorithm Selection */}
          <div>
            <p style={{ margin: "0 0 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Algorithm</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { label: "Bubble Sort",    fn: startBubbleSort,    key: "bubble"    },
                { label: "Merge Sort",     fn: startMergeSort,     key: "merge"     },
                { label: "Quick Sort",     fn: startQuickSort,     key: "quick"     },
                { label: "Selection Sort", fn: startSelectionSort, key: "selection" },
                { label: "Insertion Sort", fn: startInsertionSort, key: "insertion" },
              ].map(({ label, fn, key }) => (
                <button key={key} onClick={fn} style={{
                  padding: "8px 12px", fontSize: "13px", cursor: "pointer",
                  borderRadius: "8px",
                  border: selectedAlgorithm === key ? "2px solid #6366f1" : "2px solid #e2e8f0",
                  backgroundColor: selectedAlgorithm === key ? "rgba(99,102,241,0.1)" : "#f8fafc",
                  color: "#1e293b", fontWeight: "600", transition: "all 0.2s ease", textAlign: "left"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Speed Slider */}
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>
              Speed — <span style={{ color: "#6366f1" }}>{speed <= 1500 ? "Fast" : speed <= 2800 ? "Medium" : "Slow"}</span>
            </p>
            <input id="speed-slider" type="range" min="500" max="4000" step="100"
              value={speed} onChange={handleSpeedChange}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
          </div>

          {/* Array Size Slider */}
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>
              Array Size — <span style={{ color: "#6366f1" }}>{arraySize}</span>
            </p>
            <input id="array-size-slider" type="range" min="5" max="80" step="1"
              value={arraySize} onChange={handleArraySizeChange}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
          </div>

          {/* Playback Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p style={{ margin: "0 0 2px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Controls</p>
            <button onClick={startPauseAnimation} style={{
              padding: "9px", fontSize: "13px", cursor: "pointer", borderRadius: "8px", border: "none",
              backgroundColor: isRunning && !isPaused ? "#e53935" : "#43a047",
              color: "#fff", fontWeight: "700", transition: "all 0.2s ease"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {isRunning && !isPaused ? "⏸ Pause" : isPaused ? "▶ Resume" : "▶ Start"}
            </button>
            <button onClick={nextStep} disabled={isRunning && !isPaused} style={{
              padding: "9px", fontSize: "13px",
              cursor: isRunning && !isPaused ? "not-allowed" : "pointer",
              borderRadius: "8px", border: "none", backgroundColor: "#1e88e5",
              color: "#fff", fontWeight: "700",
              opacity: isRunning && !isPaused ? 0.45 : 1, transition: "all 0.2s ease"
            }}
              onMouseEnter={e => { if (!(isRunning && !isPaused)) e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >⏭ Next Step</button>
            <button onClick={resetVisualization} style={{
              padding: "9px", fontSize: "13px", cursor: "pointer", borderRadius: "8px",
              border: "none", backgroundColor: "#fb8c00", color: "#fff", fontWeight: "700", transition: "all 0.2s ease"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >↺ Reset</button>
            <button onClick={generateArray} style={{
              padding: "9px", fontSize: "13px", cursor: "pointer", borderRadius: "8px",
              border: "2px solid #e2e8f0", backgroundColor: "transparent",
              color: "#1e293b", fontWeight: "700", transition: "all 0.2s ease"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >⟳ New Array</button>
          </div>

        </div>

        {/* ── CENTER: Visualization ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, overflow: "hidden" }}>

          {/* Legend */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "14px", fontSize: "12px", color: "#475569",
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            flexShrink: 0
          }}>
            {[
              { color: "#ef5350",               label: "Comparing"    },
              { color: "#ffee58",               label: "Swapping"     },
              { color: "#66bb6a",               label: "Sorted"       },
              { color: "rgba(135,206,250,0.9)", label: "Active Range" },
              { color: "#ab47bc",               label: "Pivot / Mid"  },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.1)" }}></span>
                {label}
              </span>
            ))}
          </div>

          {/* Visualization Area */}
          <div style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: "12px 12px 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "2px",
            overflow: "hidden",
            minHeight: 0
          }}>
            {(() => {
              const MAX_BAR_HEIGHT = 350;
              const maxValue = Math.max(...array, 1);
              return array.map((value, idx) => {
                const barHeight = Math.max(4, (value / maxValue) * MAX_BAR_HEIGHT);
                return (
                  <div key={idx} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "flex-end", flex: "1", minWidth: "4px", maxWidth: "60px", height: "100%"
                  }}>
                    {array.length <= 50 && (
                      <div style={{
                        fontSize: array.length <= 20 ? "10px" : array.length <= 35 ? "8px" : "7px",
                        color: "#475569", fontWeight: "bold", marginBottom: "2px",
                        textAlign: "center", userSelect: "none"
                      }}>
                        {value}
                      </div>
                    )}
                    <div className="array-bar" style={{
                      backgroundColor: "turquoise",
                      height: `${barHeight}px`,
                      width: "100%",
                      transition: "height 0.3s ease, background-color 0.2s ease, transform 0.2s ease",
                      borderRadius: "4px 4px 0 0",
                      transformOrigin: "bottom"
                    }} />
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* ── RIGHT: Info Panel ── */}
        <div style={{
          width: "210px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto"
        }}>

          {/* Current Step */}
          <div style={{
            padding: "12px 14px",
            backgroundColor: currentStep ? "rgba(99,102,241,0.08)" : "#ffffff",
            borderRadius: "12px",
            border: currentStep ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e2e8f0",
            fontSize: "13px", fontWeight: "600",
            color: "#1e293b",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            lineHeight: "1.5"
          }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Current Step</p>
            {currentStep || "Select an algorithm and press ▶ Start to begin"}
          </div>

          {/* Statistics */}
          <div style={{
            backgroundColor: "#fffbeb",
            borderRadius: "12px",
            border: "1px solid #fde68a",
            padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: "6px",
            fontSize: "13px", color: "#1e293b",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Statistics</p>
            <span>🔍 Comparisons: <strong>{stats.comparisons}</strong></span>
            <span>🔄 Swaps: <strong>{stats.swaps}</strong></span>
            <span>🔢 Iterations: <strong>{stats.iteration}</strong></span>
          </div>

          {/* Complexity */}
          {selectedAlgorithm && (() => {
            const c = algorithmComplexities[selectedAlgorithm];
            return (
              <div style={{
                backgroundColor: "#f1f5f9",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "12px 14px",
                fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px", color: "#1e293b",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Complexity</p>
                <span style={{ fontWeight: "700", fontSize: "14px", color: "#3730a3" }}>{c.name}</span>
                <span>🟢 Best: <strong>{c.best}</strong></span>
                <span>🟡 Average: <strong>{c.average}</strong></span>
                <span>🔴 Worst: <strong>{c.worst}</strong></span>
                <span>💾 Space: <strong>{c.space}</strong></span>
                {c.stable !== null && (
                  <span>⚖️ Stable: <strong style={{ color: c.stable ? "#16a34a" : "#dc2626" }}>{c.stable ? "Yes" : "No"}</strong></span>
                )}
              </div>
            );
          })()}

          {/* Custom Array Input */}
          {/* Step Explanation */}
          <div style={{
            backgroundColor: stepExplanation ? "rgba(99,102,241,0.06)" : "#ffffff",
            borderRadius: "12px",
            border: stepExplanation ? "1px solid rgba(99,102,241,0.25)" : "1px solid #e2e8f0",
            padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: "5px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease"
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Step Explanation</p>
            <p style={{ margin: "0", fontSize: "12px", color: "#1e293b", lineHeight: "1.6", minHeight: "36px" }}>
              {stepExplanation || "Explanations will appear here as the algorithm runs."}
            </p>
          </div>

          {/* Custom Array + Binary Search */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
          }}>
            {/* Custom Array */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <p style={{ margin: "0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Custom Array</p>
              <input
                type="text"
                placeholder="e.g. 5,1,9,3,7"
                value={customInput}
                onChange={e => { setCustomInput(e.target.value); setCustomInputError(""); }}
                style={{
                  width: "100%", padding: "7px 10px", fontSize: "12px",
                  borderRadius: "8px", border: customInputError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                  outline: "none", boxSizing: "border-box", color: "#1e293b",
                  backgroundColor: "#f8fafc", fontFamily: "inherit"
                }}
              />
              {customInputError && (
                <p style={{ margin: "0", fontSize: "11px", color: "#ef4444" }}>{customInputError}</p>
              )}
              <button onClick={applyCustomArray} style={{
                width: "100%", padding: "7px", fontSize: "12px",
                cursor: "pointer", borderRadius: "8px", border: "none",
                backgroundColor: "#6366f1", color: "#fff", fontWeight: "700", transition: "all 0.2s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >Apply</button>
              <p style={{ margin: "0", fontSize: "10px", color: "#94a3b8", lineHeight: "1.4" }}>
                Use numbers ≥ 5 for best results.
              </p>
            </div>

            <hr style={{ margin: "0", border: "none", borderTop: "1px solid #e2e8f0" }} />

            {/* Target Value / Binary Search */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <p style={{ margin: "0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Target Value for binary search</p>
              <input
                type="number"
                placeholder="e.g. 18"
                value={binarySearchTarget}
                onChange={e => { setBinarySearchTarget(e.target.value); setBinarySearchError(""); }}
                style={{
                  width: "100%", padding: "7px 10px", fontSize: "12px",
                  borderRadius: "8px", border: binarySearchError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                  outline: "none", boxSizing: "border-box", color: "#1e293b",
                  backgroundColor: "#f8fafc", fontFamily: "inherit"
                }}
              />
              {binarySearchError && (
                <p style={{ margin: "0", fontSize: "11px", color: "#ef4444" }}>{binarySearchError}</p>
              )}
              <button onClick={runBinarySearch} style={{
                width: "100%", padding: "7px", fontSize: "12px",
                cursor: "pointer", borderRadius: "8px", border: "none",
                backgroundColor: "#0ea5e9", color: "#fff", fontWeight: "700", transition: "all 0.2s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >🔎 Search</button>
              <p style={{ margin: "0", fontSize: "10px", color: "#94a3b8", lineHeight: "1.4" }}>
                Array is sorted automatically before searching.
              </p>
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}


export default ArrayVisualizer;
