export function bubbleSort(array) {
  const animations = [];
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {

      // comparison animation
      animations.push({
        type: "comparison",
        indices: [j, j + 1]
      });

      if (arr[j] > arr[j + 1]) {

        // swap values
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        // swap animation
        animations.push({
          type: "swap",
          indices: [j, j + 1],
          heights: [arr[j], arr[j + 1]]
        });
      }
    }

    // mark last element sorted
    animations.push({
      type: "sorted",
      index: n - i - 1
    });
  }

  // first element sorted
  animations.push({
    type: "sorted",
    index: 0
  });

  return animations;
}