import { ANIMATION_TYPES } from "./animationTypes";

export function binarySearch(sortedArray, target) {
  const animations = [];
  let low = 0;
  let high = sortedArray.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Step 1: highlight active search range (blue)
    animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_RANGE, start: low, end: high });

    // Step 2: highlight mid element (purple)
    animations.push({ type: ANIMATION_TYPES.HIGHLIGHT_MID, index: mid, target });

    // Step 3: compare mid with target (red flash)
    animations.push({ type: ANIMATION_TYPES.COMPARE, indices: [mid, mid], target });

    if (sortedArray[mid] === target) {
      // Step 4: found — green
      animations.push({ type: ANIMATION_TYPES.MARK_FOUND, index: mid, target });
      return animations;
    } else if (sortedArray[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Not found
  animations.push({ type: ANIMATION_TYPES.MARK_NOT_FOUND, target });
  return animations;
}
