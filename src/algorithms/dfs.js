export { DEFAULT_GRAPH } from "./bfs";

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

export function dfsAnimations(graph, startNode) {
  const adj = buildAdj(graph.edges);
  const animations = [];
  const visited = new Set();

  animations.push({
    type: "start",
    node: startNode,
    explanation: `Starting DFS from node ${startNode}.`,
  });

  function dfsRecurse(node, depth) {
    visited.add(node);

    animations.push({
      type: "push",
      node,
      depth,
      explanation: `Push ${node} onto the call stack (depth ${depth}).`,
    });

    animations.push({
      type: "visit",
      node,
      explanation: `Visiting node ${node}.`,
    });

    const neighbors = (adj[node] || []).slice().sort();

    animations.push({
      type: "neighbors",
      node,
      neighbors,
      explanation: `Checking neighbors of ${node}: [${neighbors.join(", ")}].`,
    });

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        animations.push({
          type: "explore",
          from: node,
          to: neighbor,
          explanation: `${neighbor} is unvisited — explore deeper.`,
        });
        dfsRecurse(neighbor, depth + 1);
      } else {
        animations.push({
          type: "skip",
          node: neighbor,
          explanation: `${neighbor} already visited — backtrack.`,
        });
      }
    }

    animations.push({
      type: "pop",
      node,
      depth,
      explanation: `Backtrack from ${node} (depth ${depth}).`,
    });
  }

  dfsRecurse(startNode, 0);

  animations.push({
    type: "done",
    explanation: "DFS complete. All reachable nodes have been visited.",
  });

  return animations;
}
