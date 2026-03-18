export function insertionSort(array) {
  const animations = [];
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    let j = i;

    while (j > 0) {
      animations.push({ type: "comparison", indices: [j - 1, j] });

      if (arr[j] < arr[j - 1]) {
        const temp = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = temp;

        animations.push({
          type: "swap",
          indices: [j - 1, j],
          heights: [arr[j - 1], arr[j]]
        });

        j--;
      } else {
        break;
      }
    }
  }

  // Mark all bars sorted sequentially once sorting is complete
  for (let i = 0; i < n; i++) {
    animations.push({ type: "sorted", index: i });
  }

  return animations;
}
