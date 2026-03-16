import { ANIMATION_TYPES } from "./animationTypes";

export function quickSort(arr) {
  const animations = [];
  const array = arr.slice();
  quickSortHelper(array, 0, array.length - 1, animations);
  
  // Mark all as sorted at the end
  for (let i = 0; i < array.length; i++) {
    animations.push({ type: ANIMATION_TYPES.MARK_SORTED, index: i });
  }
  
  return animations;
}

function quickSortHelper(array, low, high, animations) {
  if (low < high) {
    // Highlight the current partition range
    animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_RANGE, start: low, end: high });
    
    const pivotIdx = partition(array, low, high, animations);
    quickSortHelper(array, low, pivotIdx - 1, animations);
    quickSortHelper(array, pivotIdx + 1, high, animations);
  }
}

function partition(array, low, high, animations) {
  const pivot = array[high];
  
  // Highlight the pivot element
  animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_PIVOT, index: high });
  
  let i = low - 1;

  for (let j = low; j < high; j++) {
    // Comparison animation
    animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [j, high] });
    
    if (array[j] < pivot) {
      i++;
      // Swap animation
      animations.push({ type: ANIMATION_TYPES.SWAP, indices: [i, j], heights: [array[j], array[i]] });
      
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  // Final pivot swap
  animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [i + 1, high] });
  animations.push({ type: ANIMATION_TYPES.SWAP, indices: [i + 1, high], heights: [array[high], array[i + 1]] });
  
  const temp = array[i + 1];
  array[i + 1] = array[high];
  array[high] = temp;

  return i + 1;
}
