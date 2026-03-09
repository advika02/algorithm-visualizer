export function bubbleSort(arr) {
  const animations = [];
  const array = arr.slice();

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      // Comparison - color red
      animations.push({ type: "comparison", indices: [j, j + 1] });

      if (array[j] > array[j + 1]) {
        // Swap - color yellow
        animations.push({ type: "swap", indices: [j, j + 1], heights: [array[j + 1], array[j]] });

        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
    // Mark sorted position - color green
    animations.push({ type: "sorted", index: array.length - i - 1 });
  }
  // Mark first element as sorted
  animations.push({ type: "sorted", index: 0 });

  return animations;
}
