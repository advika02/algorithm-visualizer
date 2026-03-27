/**
 * Parses a text-based edge list into a graph structure compatible with
 * BFS / DFS visualizers.
 *
 * Unweighted format (one edge per line):
 *   A B
 *   A C
 *
 * Weighted format (for Dijkstra, future):
 *   A B 4
 *   A C 2
 *
 * Returns { graph, error }
 *   graph → { nodes: { A: {x,y}, … }, edges: [["A","B"], …] }
 *   error → string | null
 */

const NODE_RE = /^[A-Z]$/;

// Arrange up to 26 nodes in a circle inside the SVG viewport (520×460)
function layoutNodes(nodeList) {
  const cx = 260, cy = 230, r = 170;
  const nodes = {};
  nodeList.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / nodeList.length - Math.PI / 2;
    nodes[id] = {
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    };
  });
  return nodes;
}

export function parseGraph(input) {
  const lines = input.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) return { graph: null, error: "Input is empty." };

  const edgeSet = new Set();
  const edges = [];
  const nodeSet = new Set();

  for (const line of lines) {
    const parts = line.split(/\s+/);

    if (parts.length < 2 || parts.length > 3) {
      return { graph: null, error: `Invalid line: "${line}". Expected "A B" or "A B 4".` };
    }

    const [from, to, weightStr] = parts;

    if (!NODE_RE.test(from)) {
      return { graph: null, error: `Invalid node "${from}". Nodes must be single uppercase letters (A–Z).` };
    }
    if (!NODE_RE.test(to)) {
      return { graph: null, error: `Invalid node "${to}". Nodes must be single uppercase letters (A–Z).` };
    }
    if (weightStr !== undefined) {
      const w = Number(weightStr);
      if (isNaN(w) || w <= 0) {
        return { graph: null, error: `Invalid weight "${weightStr}" on line "${line}". Must be a positive number.` };
      }
    }

    nodeSet.add(from);
    nodeSet.add(to);

    // Deduplicate undirected edges
    const key = [from, to].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(weightStr !== undefined ? [from, to, Number(weightStr)] : [from, to]);
    }
  }

  const nodeList = [...nodeSet].sort();
  const nodes = layoutNodes(nodeList);

  return { graph: { nodes, edges }, error: null };
}

export const DEFAULT_INPUT = `A B
A C
B D
B E
C E
C F
D G
E G`;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a random connected unweighted graph with `nodeCount` nodes.
 * Guarantees connectivity by first building a random spanning tree,
 * then optionally adding extra edges.
 */
export function generateRandomGraph(nodeCount = 7) {
  const count = Math.max(3, Math.min(nodeCount, 10));
  const nodeList = LETTERS.slice(0, count).split("");
  const nodes = layoutNodes(nodeList);

  // Build a random spanning tree to guarantee connectivity
  const shuffled = [...nodeList].sort(() => Math.random() - 0.5);
  const edgeSet = new Set();
  const edges = [];

  for (let i = 1; i < shuffled.length; i++) {
    const u = shuffled[Math.floor(Math.random() * i)];
    const v = shuffled[i];
    const key = [u, v].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([u, v]);
    }
  }

  // Add a few random extra edges (up to nodeCount - 2)
  const extraAttempts = count * 2;
  for (let i = 0; i < extraAttempts; i++) {
    const u = nodeList[Math.floor(Math.random() * count)];
    const v = nodeList[Math.floor(Math.random() * count)];
    if (u === v) continue;
    const key = [u, v].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([u, v]);
    }
  }

  return { nodes, edges };
}

/**
 * Generates a random connected weighted graph with `nodeCount` nodes.
 * Weights are integers in [1, 9].
 */
export function generateRandomWeightedGraph(nodeCount = 6) {
  const count = Math.max(3, Math.min(nodeCount, 10));
  const nodeList = LETTERS.slice(0, count).split("");
  const nodes = layoutNodes(nodeList);

  const shuffled = [...nodeList].sort(() => Math.random() - 0.5);
  const edgeSet = new Set();
  const edges = [];

  for (let i = 1; i < shuffled.length; i++) {
    const u = shuffled[Math.floor(Math.random() * i)];
    const v = shuffled[i];
    const key = [u, v].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([u, v, Math.floor(Math.random() * 9) + 1]);
    }
  }

  const extraAttempts = count * 2;
  for (let i = 0; i < extraAttempts; i++) {
    const u = nodeList[Math.floor(Math.random() * count)];
    const v = nodeList[Math.floor(Math.random() * count)];
    if (u === v) continue;
    const key = [u, v].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([u, v, Math.floor(Math.random() * 9) + 1]);
    }
  }

  return { nodes, edges };
}
