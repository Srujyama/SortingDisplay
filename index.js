// ---------- State ----------
let array = [];
let isSorting = false;
let shouldStop = false;
let speedMs = 40;
let comparisons = 0;
let writes = 0;

const barsEl = document.getElementById("bars");
const algorithmSelect = document.getElementById("algorithmSelect");
const sizeRange = document.getElementById("sizeRange");
const speedRange = document.getElementById("speedRange");
const playPauseBtn = document.getElementById("playPauseBtn");
const newArrayBtn = document.getElementById("newArrayBtn");
const metricComparisons = document.getElementById("metricComparisons");
const metricSwaps = document.getElementById("metricSwaps");
const metricStatus = document.getElementById("metricStatus");
const algoNameBadge = document.getElementById("algoNameBadge");
const algoMeta = document.getElementById("algoMeta");
const algoDescription = document.getElementById("algoDescription");
const algoPseudocode = document.getElementById("algoPseudocode");

const algoInfo = {
    bubble: {
        name: "Bubble Sort",
        time: "O(n²)",
        space: "O(1)",
        stable: "Stable",
        description:
            "Bubble sort repeatedly scans the array, swapping adjacent elements that are out of order. Large values move to the end with each pass, like bubbles rising in water.",
        pseudocode: `bubbleSort(a):
  n = length(a)
  repeat
    swapped = false
    for i from 0 to n - 2:
      if a[i] > a[i+1]:
        swap a[i], a[i+1]
        swapped = true
  until not swapped`,
    },
    selection: {
        name: "Selection Sort",
        time: "O(n²)",
        space: "O(1)",
        stable: "Unstable",
        description:
            "Selection sort repeatedly selects the smallest remaining element and swaps it into the next position. It minimizes writes but still does O(n²) comparisons.",
        pseudocode: `selectionSort(a):
  n = length(a)
  for i from 0 to n - 2:
    minIndex = i
    for j from i+1 to n - 1:
      if a[j] < a[minIndex]:
        minIndex = j
    swap a[i], a[minIndex]`,
    },
    insertion: {
        name: "Insertion Sort",
        time: "O(n²) (best: O(n))",
        space: "O(1)",
        stable: "Stable",
        description:
            "Insertion sort builds a sorted prefix one element at a time. Each new element is inserted into its correct spot within the already sorted part of the array.",
        pseudocode: `insertionSort(a):
  n = length(a)
  for i from 1 to n - 1:
    key = a[i]
    j = i - 1
    while j >= 0 and a[j] > key:
      a[j+1] = a[j]
      j = j - 1
    a[j+1] = key`,
    },
    merge: {
        name: "Merge Sort",
        time: "O(n log n)",
        space: "O(n)",
        stable: "Stable",
        description:
            "Merge sort uses divide-and-conquer: it recursively splits the array, sorts each half, then merges the sorted halves back together.",
        pseudocode: `mergeSort(a):
  if length(a) ≤ 1:
    return a
  mid = length(a) / 2
  left  = mergeSort(a[0..mid-1])
  right = mergeSort(a[mid..end])
  return merge(left, right)`,
    },
    quick: {
        name: "Quick Sort",
        time: "O(n log n) average",
        space: "O(log n) stack",
        stable: "Unstable",
        description:
            "Quick sort chooses a pivot, partitions the array into elements less than and greater than the pivot, then recursively sorts each side. Very fast in practice.",
        pseudocode: `quickSort(a, lo, hi):
  if lo < hi:
    p = partition(a, lo, hi)
    quickSort(a, lo, p - 1)
    quickSort(a, p + 1, hi)`,
    },
};

function updateAlgoPanel() {
    const key = algorithmSelect.value;
    const info = algoInfo[key];
    algoNameBadge.innerHTML = `
        <span class="algo-badge-dot"></span>
        ${info.name}
      `;
    algoMeta.innerHTML = `
        <span>Time: ${info.time}</span>
        <span>Space: ${info.space}</span>
        <span>${info.stable}</span>
      `;
    algoDescription.textContent = info.description;
    algoPseudocode.textContent = info.pseudocode;
}

// ---------- Utilities ----------
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetMetrics() {
    comparisons = 0;
    writes = 0;
    metricComparisons.textContent = "Comparisons: 0";
    metricSwaps.textContent = "Writes: 0";
}

function updateComparisons(delta = 1) {
    comparisons += delta;
    metricComparisons.textContent = "Comparisons: " + comparisons;
}

function updateWrites(delta = 1) {
    writes += delta;
    metricSwaps.textContent = "Writes: " + writes;
}

function setStatus(text) {
    metricStatus.textContent = "Status: " + text;
}

function generateArray() {
    const size = parseInt(sizeRange.value, 10);
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.random());
    }
    resetMetrics();
    renderArray();
    setStatus("idle");
}

function renderArray(highlight = {}) {
    const { compare = [], swap = [], sorted = [] } = highlight;
    const n = array.length;
    barsEl.innerHTML = "";
    for (let i = 0; i < n; i++) {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        const heightPct = 10 + array[i] * 90;
        bar.style.height = heightPct + "%";

        if (compare.includes(i)) bar.classList.add("compare");
        if (swap.includes(i)) bar.classList.add("swap");
        if (sorted.includes(i)) bar.classList.add("sorted");

        barsEl.appendChild(bar);
    }
}

function onSpeedChange() {
    const v = parseInt(speedRange.value, 10);
    // Map 1–60 slider to ~10–120ms delay
    const maxDelay = 120;
    const minDelay = 10;
    const factor = 1 - v / 60;
    speedMs = minDelay + factor * (maxDelay - minDelay);
}

// ---------- Algorithms with visualization ----------
async function bubbleSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        if (shouldStop) return;
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            if (shouldStop) return;
            updateComparisons();
            renderArray({ compare: [j, j + 1] });
            await sleep(speedMs);
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                updateWrites(2);
                renderArray({ swap: [j, j + 1] });
                await sleep(speedMs);
                swapped = true;
            }
        }
        renderArray({
            sorted: Array.from({ length: n }, (_, idx) =>
                idx >= n - 1 - i ? idx : -1
            ).filter((i) => i >= 0),
        });
        if (!swapped) break;
    }
}

async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        if (shouldStop) return;
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (shouldStop) return;
            updateComparisons();
            renderArray({ compare: [minIndex, j] });
            await sleep(speedMs);
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            updateWrites(2);
        }
        renderArray({ swap: [i, minIndex] });
        await sleep(speedMs);
    }
    renderArray({ sorted: array.map((_, i) => i) });
}

async function insertionSort() {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        if (shouldStop) return;
        let key = array[i];
        let j = i - 1;
        while (j >= 0) {
            updateComparisons();
            renderArray({ compare: [j, j + 1] });
            await sleep(speedMs);
            if (array[j] > key) {
                array[j + 1] = array[j];
                updateWrites();
                j--;
                renderArray({ swap: [j + 1] });
                await sleep(speedMs);
            } else {
                break;
            }
            if (shouldStop) return;
        }
        array[j + 1] = key;
        updateWrites();
        renderArray({ swap: [j + 1] });
        await sleep(speedMs);
    }
    renderArray({ sorted: array.map((_, i) => i) });
}

async function mergeSortWrapper() {
    await mergeSort(0, array.length - 1);
    renderArray({ sorted: array.map((_, i) => i) });
}

async function mergeSort(l, r) {
    if (l >= r || shouldStop) return;
    const m = Math.floor((l + r) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}

async function merge(l, m, r) {
    const left = array.slice(l, m + 1);
    const right = array.slice(m + 1, r + 1);
    let i = 0,
        j = 0,
        k = l;
    while (i < left.length && j < right.length) {
        if (shouldStop) return;
        updateComparisons();
        const idxs = [k];
        renderArray({ compare: idxs });
        await sleep(speedMs);
        if (left[i] <= right[j]) {
            array[k] = left[i++];
        } else {
            array[k] = right[j++];
        }
        updateWrites();
        renderArray({ swap: [k] });
        await sleep(speedMs);
        k++;
    }
    while (i < left.length) {
        if (shouldStop) return;
        array[k] = left[i++];
        updateWrites();
        renderArray({ swap: [k] });
        await sleep(speedMs);
        k++;
    }
    while (j < right.length) {
        if (shouldStop) return;
        array[k] = right[j++];
        updateWrites();
        renderArray({ swap: [k] });
        await sleep(speedMs);
        k++;
    }
}

async function quickSortWrapper() {
    await quickSort(0, array.length - 1);
    renderArray({ sorted: array.map((_, i) => i) });
}

async function quickSort(lo, hi) {
    if (shouldStop || lo >= hi) return;
    const p = await partition(lo, hi);
    await quickSort(lo, p - 1);
    await quickSort(p + 1, hi);
}

async function partition(lo, hi) {
    const pivot = array[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
        if (shouldStop) return lo;
        updateComparisons();
        renderArray({ compare: [j, hi] });
        await sleep(speedMs);
        if (array[j] < pivot) {
            [array[i], array[j]] = [array[j], array[i]];
            updateWrites(2);
            renderArray({ swap: [i, j] });
            await sleep(speedMs);
            i++;
        }
    }
    [array[i], array[hi]] = [array[hi], array[i]];
    updateWrites(2);
    renderArray({ swap: [i, hi] });
    await sleep(speedMs);
    return i;
}

async function runAlgorithm() {
    const algo = algorithmSelect.value;
    resetMetrics();
    setStatus("sorting");
    isSorting = true;
    shouldStop = false;
    playPauseBtn.textContent = "⏸ Pause";
    newArrayBtn.disabled = true;
    algorithmSelect.disabled = true;
    sizeRange.disabled = true;

    switch (algo) {
        case "bubble":
            await bubbleSort();
            break;
        case "selection":
            await selectionSort();
            break;
        case "insertion":
            await insertionSort();
            break;
        case "merge":
            await mergeSortWrapper();
            break;
        case "quick":
            await quickSortWrapper();
            break;
    }

    if (!shouldStop) {
        setStatus("done");
    } else {
        setStatus("paused");
    }

    isSorting = false;
    playPauseBtn.textContent = "▶ Start";
    newArrayBtn.disabled = false;
    algorithmSelect.disabled = false;
    sizeRange.disabled = false;
}

// ---------- Event handlers ----------
playPauseBtn.addEventListener("click", async () => {
    if (!isSorting) {
        shouldStop = false;
        runAlgorithm();
    } else {
        shouldStop = true;
        isSorting = false;
        playPauseBtn.textContent = "▶ Resume";
        setStatus("paused");
        newArrayBtn.disabled = false;
        algorithmSelect.disabled = false;
        sizeRange.disabled = false;
    }
});

newArrayBtn.addEventListener("click", () => {
    if (isSorting) return;
    generateArray();
});

algorithmSelect.addEventListener("change", () => {
    if (isSorting) return;
    updateAlgoPanel();
});

sizeRange.addEventListener("input", () => {
    if (isSorting) return;
    generateArray();
});

speedRange.addEventListener("input", () => {
    onSpeedChange();
});

// ---------- Init ----------
onSpeedChange();
updateAlgoPanel();
generateArray();
