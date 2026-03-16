import { useState, useEffect, useRef } from "react";
import { bubbleSort } from "../algorithms/bubbleSort";
import { mergeSort } from "../algorithms/mergeSort";
import { quickSort } from "../algorithms/quickSort";
import { ANIMATION_TYPES } from "../algorithms/animationTypes";

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

  const algorithmInfo = {
    bubble: {
      name: "Bubble Sort",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."
    },
    merge: {
      name: "Merge Sort",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      description: "Divides the array into halves, sorts them, and then merges them back together."
    },
    quick: {
      name: "Quick Sort",
      timeComplexity: "O(n log n) average, O(n²) worst",
      spaceComplexity: "O(log n)",
      description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions."
    }
  };

  useEffect(() => {
    generateArray();
  }, []);

  function generateArray() {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 350) + 20);
    }
    setArray(newArray);
    setCurrentStep("");
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
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    setHighlightedRange({ start: -1, end: -1 });
    const bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.backgroundColor = "turquoise";
      bars[i].style.transform = "scaleY(1)";
    }
  }

  function executeAnimation(animation, bars) {
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

  function handleSpeedChange(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    speedRef.current = val;
  }

  function handleArraySizeChange(e) {
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    setTimeout(() => generateArray(), 0);
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
      {/* Page Title */}
      <h1 style={{
        textAlign: "center",
        padding: "10px 0 6px",
        fontSize: "22px",
        fontWeight: "700",
        letterSpacing: "1px",
        color: "#1e293b",
        margin: 0,
        flexShrink: 0
      }}>
        Sorting Algorithm Visualizer
      </h1>

      {/* Three-column layout */}
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
                { label: "Bubble Sort", fn: startBubbleSort, key: "bubble" },
                { label: "Merge Sort",  fn: startMergeSort,  key: "merge"  },
                { label: "Quick Sort",  fn: startQuickSort,  key: "quick"  },
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
              { color: "#ab47bc",               label: "Pivot"        },
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
            {array.map((value, idx) => (
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
                  height: `${value}px`,
                  width: "100%",
                  transition: "height 0.3s ease, background-color 0.2s ease, transform 0.2s ease",
                  borderRadius: "4px 4px 0 0",
                  transformOrigin: "bottom"
                }} />
              </div>
            ))}
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
          {selectedAlgorithm && (
            <div style={{
              backgroundColor: "#f1f5f9",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "12px 14px",
              fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px", color: "#1e293b",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
            }}>
              <p style={{ margin: "0 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" }}>Complexity</p>
              <span>⏱ Time: <strong>{algorithmInfo[selectedAlgorithm].timeComplexity}</strong></span>
              <span>💾 Space: <strong>{algorithmInfo[selectedAlgorithm].spaceComplexity}</strong></span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


export default ArrayVisualizer;
