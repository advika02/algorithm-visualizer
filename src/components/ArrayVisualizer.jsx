import { useState, useEffect } from "react";
import { bubbleSort } from "../algorithms/bubbleSort";
import { mergeSort } from "../algorithms/mergeSort";
import { quickSort } from "../algorithms/quickSort";

function ArrayVisualizer() {
  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(2500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, iteration: 0 });

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
    for (let i = 0; i < 30; i++) {
      newArray.push(Math.floor(Math.random() * 350) + 20);
    }
    setArray(newArray);
    setCurrentStep("");
    setIsRunning(false);
    setIsPaused(false);
    setAnimations([]);
    setCurrentAnimationIndex(0);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
    clearAllTimeouts();
    
    setTimeout(() => {
      const bars = document.getElementsByClassName("array-bar");
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "turquoise";
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
    const bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.backgroundColor = "turquoise";
    }
  }

  function executeAnimation(animation, bars) {
    if (animation.type === "comparison") {
      animation.indices.forEach(idx => {
        bars[idx].style.backgroundColor = "red";
      });
      setCurrentStep(`Comparing elements at index ${animation.indices[0]} and ${animation.indices[1]}`);
      setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1, iteration: prev.iteration + 1 }));
    } else if (animation.type === "swap") {
      animation.indices.forEach((idx, i) => {
        bars[idx].style.backgroundColor = "yellow";
        bars[idx].style.height = `${animation.heights[i]}px`;
      });
      if (animation.indices.length > 1) {
        setCurrentStep(`Swapping elements at index ${animation.indices[0]} and ${animation.indices[1]}`);
        setStats(prev => ({ ...prev, swaps: prev.swaps + 1, iteration: prev.iteration + 1 }));
      } else {
        setCurrentStep(`Updating element at index ${animation.indices[0]}`);
        setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
      }
    } else if (animation.type === "sorted") {
      bars[animation.index].style.backgroundColor = "green";
      setCurrentStep(`Element at index ${animation.index} is in correct position`);
      setStats(prev => ({ ...prev, iteration: prev.iteration + 1 }));
    }
  }

  function nextStep() {
    if (currentAnimationIndex >= animations.length) {
      setCurrentStep("Sorting complete!");
      setIsRunning(false);
      return;
    }

    const bars = document.getElementsByClassName("array-bar");
    const animation = animations[currentAnimationIndex];
    
    executeAnimation(animation, bars);
    setCurrentAnimationIndex(prev => prev + 1);

    // Reset colors after a brief moment
    setTimeout(() => {
      if (animation.type === "comparison" || animation.type === "swap") {
        animation.indices.forEach(idx => {
          if (bars[idx].style.backgroundColor !== "green") {
            bars[idx].style.backgroundColor = "turquoise";
          }
        });
      }
    }, speed / 2);
  }

  function startPauseAnimation() {
    if (!selectedAlgorithm) {
      setCurrentStep("Please select a sorting algorithm first!");
      return;
    }

    if (isRunning && !isPaused) {
      // Pause
      setIsPaused(true);
      clearAllTimeouts();
    } else if (isPaused) {
      // Resume
      setIsPaused(false);
      continueAnimation();
    } else {
      // Start fresh
      setIsRunning(true);
      setIsPaused(false);
      setCurrentAnimationIndex(0);
      continueAnimation();
    }
  }

  function continueAnimation() {
    if (currentAnimationIndex >= animations.length) {
      setCurrentStep("Sorting complete!");
      setIsRunning(false);
      return;
    }

    const bars = document.getElementsByClassName("array-bar");
    const newTimeoutIds = [];

    for (let i = currentAnimationIndex; i < animations.length; i++) {
      const animation = animations[i];
      const delay = (i - currentAnimationIndex) * speed;

      const timeoutId = setTimeout(() => {
        if (!isPaused) {
          executeAnimation(animation, bars);
          setCurrentAnimationIndex(i + 1);

          // Reset colors
          setTimeout(() => {
            if (animation.type === "comparison" || animation.type === "swap") {
              animation.indices.forEach(idx => {
                if (bars[idx].style.backgroundColor !== "green") {
                  bars[idx].style.backgroundColor = "turquoise";
                }
              });
            }
          }, speed / 2);

          if (i === animations.length - 1) {
            setTimeout(() => {
              setCurrentStep("Sorting complete!");
              setIsRunning(false);
            }, speed);
          }
        }
      }, delay);

      newTimeoutIds.push(timeoutId);
    }

    setTimeoutIds(newTimeoutIds);
  }

  function startBubbleSort() {
    setSelectedAlgorithm("bubble");
    const sortAnimations = bubbleSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
  }

  function startMergeSort() {
    setSelectedAlgorithm("merge");
    const sortAnimations = mergeSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
  }

  function startQuickSort() {
    setSelectedAlgorithm("quick");
    const sortAnimations = quickSort(array);
    setAnimations(sortAnimations);
    setCurrentAnimationIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, iteration: 0 });
  }

  function handleSpeedChange(e) {
    setSpeed(Number(e.target.value));
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "20px"
    }}>
      {/* Control Panel */}
      <div style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <button onClick={generateArray} style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "#fff",
          fontWeight: "bold"
        }}>Generate Array</button>
        
        <button onClick={startBubbleSort} style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "#fff",
          fontWeight: "bold"
        }}>Bubble Sort</button>
        
        <button onClick={startMergeSort} style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "#fff",
          fontWeight: "bold"
        }}>Merge Sort</button>
        
        <button onClick={startQuickSort} style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "#fff",
          fontWeight: "bold"
        }}>Quick Sort</button>

        <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}>
          <label htmlFor="speed-slider" style={{ fontSize: "16px", color: "#fff", marginRight: "10px" }}>
            Speed: {speed <= 1000 ? "Fast" : speed <= 2500 ? "Medium" : "Slow"}
          </label>
          <input
            id="speed-slider"
            type="range"
            min="200"
            max="5000"
            step="100"
            value={speed}
            onChange={handleSpeedChange}
            style={{ width: "200px" }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "20px"
      }}>
        <button onClick={startPauseAnimation} style={{
          padding: "10px 20px",
          fontSize: "15px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #4CAF50",
          backgroundColor: isRunning && !isPaused ? "#f44336" : "#4CAF50",
          color: "#fff",
          fontWeight: "bold"
        }}>
          {isRunning && !isPaused ? "Pause" : isPaused ? "Resume" : "Start"}
        </button>

        <button onClick={nextStep} disabled={isRunning && !isPaused} style={{
          padding: "10px 20px",
          fontSize: "15px",
          cursor: isRunning && !isPaused ? "not-allowed" : "pointer",
          borderRadius: "5px",
          border: "2px solid #2196F3",
          backgroundColor: "#2196F3",
          color: "#fff",
          fontWeight: "bold",
          opacity: isRunning && !isPaused ? 0.5 : 1
        }}>
          Next Step
        </button>

        <button onClick={resetVisualization} style={{
          padding: "10px 20px",
          fontSize: "15px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "2px solid #FF9800",
          backgroundColor: "#FF9800",
          color: "#fff",
          fontWeight: "bold"
        }}>
          Reset
        </button>
      </div>

      {/* Color Legend */}
      <div style={{ 
        textAlign: "center",
        marginBottom: "20px"
      }}>
        <span style={{ marginRight: "20px", color: "#fff" }}>
          <span style={{ 
            display: "inline-block", 
            width: "20px", 
            height: "20px", 
            backgroundColor: "red", 
            marginRight: "5px",
            verticalAlign: "middle"
          }}></span>
          Comparing
        </span>
        <span style={{ marginRight: "20px", color: "#fff" }}>
          <span style={{ 
            display: "inline-block", 
            width: "20px", 
            height: "20px", 
            backgroundColor: "yellow", 
            marginRight: "5px",
            verticalAlign: "middle"
          }}></span>
          Swapping
        </span>
        <span style={{ color: "#fff" }}>
          <span style={{ 
            display: "inline-block", 
            width: "20px", 
            height: "20px", 
            backgroundColor: "green", 
            marginRight: "5px",
            verticalAlign: "middle"
          }}></span>
          Sorted
        </span>
      </div>

      {/* Algorithm Info Panel */}
      {selectedAlgorithm && (
        <div style={{
          maxWidth: "700px",
          margin: "0 auto 15px auto",
          padding: "8px 15px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "25px",
          flexWrap: "wrap",
          fontSize: "14px"
        }}>
          <span style={{ fontWeight: "bold" }}>{algorithmInfo[selectedAlgorithm].name}</span>
          <span>Time: {algorithmInfo[selectedAlgorithm].timeComplexity}</span>
          <span>Space: {algorithmInfo[selectedAlgorithm].spaceComplexity}</span>
        </div>
      )}

      {/* Statistics Panel */}
      {selectedAlgorithm && (
        <div style={{
          maxWidth: "700px",
          margin: "0 auto 15px auto",
          padding: "8px 15px",
          backgroundColor: "rgba(255, 200, 100, 0.1)",
          borderRadius: "4px",
          border: "1px solid rgba(255, 200, 100, 0.3)",
          textAlign: "center",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          fontSize: "14px"
        }}>
          <span><strong>Comparisons:</strong> {stats.comparisons}</span>
          <span><strong>Swaps:</strong> {stats.swaps}</span>
          <span><strong>Iteration:</strong> {stats.iteration}</span>
        </div>
      )}

      {/* Step Explanation Panel */}
      {currentStep && (
        <div style={{
          maxWidth: "700px",
          margin: "0 auto 15px auto",
          padding: "10px 20px",
          backgroundColor: "rgba(100, 200, 255, 0.15)",
          borderRadius: "4px",
          border: "1px solid rgba(100, 200, 255, 0.3)",
          textAlign: "center",
          color: "#fff",
          fontSize: "15px",
          fontWeight: "500",
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {currentStep}
        </div>
      )}

      {/* Visualization Area */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-end", 
        justifyContent: "center",
        height: "70vh",
        width: "95%",
        margin: "0 auto",
        gap: "2px"
      }}>
        {array.map((value, idx) => (
          <div
            className="array-bar"
            key={idx}
            style={{
              backgroundColor: "turquoise",
              height: `${value}px`,
              flex: "1",
              minWidth: "8px",
              maxWidth: "80px",
              transition: "height 0.25s ease, background-color 0.25s ease",
              borderRadius: "3px 3px 0 0"
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default ArrayVisualizer;
