export const DEFAULT_GRAPH = {
  nodes: {
    A: { x: 300, y: 60  },
    B: { x: 160, y: 160 },
    C: { x: 440, y: 160 },
    D: { x: 80,  y: 290 },
    E: { x: 260, y: 290 },
    F: { x: 420, y: 290 },
    G: { x: 160, y: 400 },
  },
  edges: [
    ["A", "B"], ["A", "C"],
    ["B", "D"], ["B", "E"],
    ["C", "E"], ["C", "F"],
    ["D", "G"], ["E", "G"],
  ],
};

// Build adjacency list from edge list
function buildAdj(edges) {
  const adj = {};
  edges.forEach(([u, v]) => {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push(v);
    adj[v].push(u);
  });
  return adj;
}

export function bfsAnimations(graph, startNode) {
  const adj = buildAdj(graph.edges);
  const animations = [];
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  animations.push({
    type: "start",
    node: startNode,
    explanation: `Starting BFS from node ${startNode}.`,
  });

  animations.push({
    type: "enqueue",
    node: startNode,
    queue: [startNode],
    explanation: `Enqueue starting node ${startNode}.`,
  });

  while (queue.length > 0) {
    const current = queue.shift();

    animations.push({
      type: "dequeue",
      node: current,
      queue: [...queue],
      explanation: `Dequeue node ${current} — now visiting.`,
    });

    animations.push({
      type: "visit",
      node: current,
      explanation: `Visiting node ${current}.`,
    });

    const neighbors = (adj[current] || []).slice().sort();
    animations.push({
      type: "neighbors",
      node: current,
      neighbors,
      explanation: `Checking neighbors of ${current}: [${neighbors.join(", ")}].`,
    });

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        animations.push({
          type: "enqueue",
          node: neighbor,
          queue: [...queue],
          explanation: `${neighbor} is unvisited — add to queue.`,
        });
      } else {
        animations.push({
          type: "skip",
          node: neighbor,
          explanation: `${neighbor} already visited — skip.`,
        });
      }
    }
  }

  animations.push({
    type: "done",
    explanation: "BFS complete. All reachable nodes have been visited.",
  });

  return animations;
}
