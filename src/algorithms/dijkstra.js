/**
 * Dijkstra's shortest-path algorithm.
 * Expects graph.edges entries of the form [from, to, weight].
 * Edges without a weight are ignored.
 *
 * Returns an animation array with types:
 *   init        — initial distances table
 *   pick        — picking the unvisited node with smallest tentative distance
 *   visit       — marking node as settled
 *   relax       — checking an edge; may update neighbour distance
 *   update      — distance was improved
 *   skip_edge   — neighbour already settled, skip
 *   done        — algorithm complete
 */
export function dijkstraAnimations(graph, startNode) {
  // Build weighted adjacency list (undirected)
  const adj = {};
  for (const edge of graph.edges) {
    const [u, v, w] = edge;
    if (w === undefined) continue; // skip unweighted edges
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push({ node: v, weight: w });
    adj[v].push({ node: u, weight: w });
  }

  const nodes = Object.keys(graph.nodes);
  const animations = [];

  // Check that at least some edges have weights
  const hasWeights = graph.edges.some(e => e[2] !== undefined);
  if (!hasWeights) {
    animations.push({
      type: "error",
      explanation: "No weighted edges found. Dijkstra requires edges with weights (e.g. A B 4).",
    });
    return animations;
  }

  // Initialise distances
  const dist = {};
  const prev = {};
  nodes.forEach(n => { dist[n] = Infinity; prev[n] = null; });
  dist[startNode] = 0;

  animations.push({
    type: "init",
    distances: { ...dist },
    explanation: `Initialise: all distances = ∞, dist[${startNode}] = 0.`,
  });

  const settled = new Set();

  while (settled.size < nodes.length) {
    // Pick unvisited node with smallest distance
    let current = null;
    let minDist = Infinity;
    for (const n of nodes) {
      if (!settled.has(n) && dist[n] < minDist) {
        minDist = dist[n];
        current = n;
      }
    }

    if (current === null) break; // remaining nodes unreachable

    animations.push({
      type: "pick",
      node: current,
      distance: dist[current],
      distances: { ...dist },
      explanation: `Pick node ${current} — smallest tentative distance ${dist[current] === Infinity ? "∞" : dist[current]}.`,
    });

    settled.add(current);

    animations.push({
      type: "visit",
      node: current,
      distances: { ...dist },
      explanation: `Settle node ${current}. Its shortest distance is now finalised: ${dist[current]}.`,
    });

    const neighbours = (adj[current] || []).slice().sort((a, b) => a.node.localeCompare(b.node));

    for (const { node: nb, weight } of neighbours) {
      if (settled.has(nb)) {
        animations.push({
          type: "skip_edge",
          from: current,
          to: nb,
          explanation: `Edge ${current}→${nb}: ${nb} already settled — skip.`,
        });
        continue;
      }

      const newDist = dist[current] + weight;

      animations.push({
        type: "relax",
        from: current,
        to: nb,
        weight,
        currentDist: dist[nb],
        newDist,
        distances: { ...dist },
        explanation: `Edge ${current}→${nb} (w=${weight}): ${dist[current]} + ${weight} = ${newDist} vs current ${dist[nb] === Infinity ? "∞" : dist[nb]}.`,
      });

      if (newDist < dist[nb]) {
        dist[nb] = newDist;
        prev[nb] = current;
        animations.push({
          type: "update",
          node: nb,
          from: current,
          newDist,
          distances: { ...dist },
          explanation: `Update dist[${nb}] = ${newDist} (via ${current}).`,
        });
      }
    }
  }

  // Reconstruct shortest-path tree edges
  const pathEdges = new Set();
  for (const n of nodes) {
    if (prev[n] !== null) pathEdges.add([prev[n], n].sort().join("-"));
  }

  animations.push({
    type: "done",
    distances: { ...dist },
    pathEdges: [...pathEdges],
    explanation: "Dijkstra complete. Shortest distances from start node are finalised.",
  });

  return animations;
}

export const DEFAULT_WEIGHTED_INPUT = `A B 4
A C 2
B C 1
B D 5
C D 8
C E 10
D E 2
D F 6
E F 3`;
