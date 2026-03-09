export function mergeSort(arr) {
  const animations = [];
  const auxiliaryArray = arr.slice();
  const mainArray = arr.slice();
  mergeSortHelper(mainArray, 0, arr.length - 1, auxiliaryArray, animations);
  
  // Mark all as sorted at the end
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: "sorted", index: i });
  }
  
  return animations;
}

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
  if (startIdx === endIdx) return;
  
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;

  while (i <= middleIdx && j <= endIdx) {
    // Comparison animation
    animations.push({ type: "comparison", indices: [i, j] });
    
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Overwrite animation
      animations.push({ type: "swap", indices: [k], heights: [auxiliaryArray[i]] });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      // Overwrite animation
      animations.push({ type: "swap", indices: [k], heights: [auxiliaryArray[j]] });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }

  while (i <= middleIdx) {
    animations.push({ type: "comparison", indices: [i, i] });
    animations.push({ type: "swap", indices: [k], heights: [auxiliaryArray[i]] });
    mainArray[k++] = auxiliaryArray[i++];
  }

  while (j <= endIdx) {
    animations.push({ type: "comparison", indices: [j, j] });
    animations.push({ type: "swap", indices: [k], heights: [auxiliaryArray[j]] });
    mainArray[k++] = auxiliaryArray[j++];
  }
}
