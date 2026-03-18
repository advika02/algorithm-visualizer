export function selectionSort(array) {
  const animations = [];
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      animations.push({ type: "comparison", indices: [minIdx, j] });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      animations.push({
        type: "swap",
        indices: [i, minIdx],
        heights: [arr[i], arr[minIdx]]
      });
    }

    animations.push({ type: "sorted", index: i });
  }

  animations.push({ type: "sorted", index: n - 1 });

  return animations;
}
