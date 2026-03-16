import { ANIMATION_TYPES } from "./animationTypes";

export function mergeSort(arr) {
  const animations = [];
  const auxiliaryArray = arr.slice();
  const mainArray = arr.slice();
  mergeSortHelper(mainArray, 0, arr.length - 1, auxiliaryArray, animations);
  
  // Mark all as sorted at the end
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: ANIMATION_TYPES.MARK_SORTED, index: i });
  }
  
  return animations;
}

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
  if (startIdx === endIdx) return;
  
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  
  // Highlight left subarray
  animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_RANGE, start: startIdx, end: middleIdx });
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  
  // Highlight right subarray
  animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_RANGE, start: middleIdx + 1, end: endIdx });
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  
  // Highlight merge range
  animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_RANGE, start: startIdx, end: endIdx });
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;

  while (i <= middleIdx && j <= endIdx) {
    // Comparison animation
    animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [i, j] });
    
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Overwrite animation
      animations.push({ type: ANIMATION_TYPES.OVERWRITE, indices: [k], heights: [auxiliaryArray[i]] });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      // Overwrite animation
      animations.push({ type: ANIMATION_TYPES.OVERWRITE, indices: [k], heights: [auxiliaryArray[j]] });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }

  while (i <= middleIdx) {
    animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [i, i] });
    animations.push({ type: ANIMATION_TYPES.OVERWRITE, indices: [k], heights: [auxiliaryArray[i]] });
    mainArray[k++] = auxiliaryArray[i++];
  }

  while (j <= endIdx) {
    animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [j, j] });
    animations.push({ type: ANIMATION_TYPES.OVERWRITE, indices: [k], heights: [auxiliaryArray[j]] });
    mainArray[k++] = auxiliaryArray[j++];
  }
}
