const excludedSourcePrefixes = [
  "graphify-out/",
  "Wolfpack: Product Bundles/",
];

function buildGraphifyUpdateArgs() {
  return ["update", ".", "--force"];
}

function isExcludedSource(sourceFile) {
  const normalized = String(sourceFile || "").replaceAll("\\", "/");
  return excludedSourcePrefixes.some(prefix => normalized.startsWith(prefix));
}

function sanitizeGraphData(inputGraph, detectedSources = null) {
  const graph = structuredClone(inputGraph);
  let normalizedFileTypes = 0;

  for (const node of graph.nodes || []) {
    if (node.file_type === "concept") {
      node.file_type = "document";
      normalizedFileTypes += 1;
    }
  }

  const staleNodeIds = new Set(
    (graph.nodes || [])
      .filter(node => {
        const sourceFile = String(node.source_file || "");
        return isExcludedSource(sourceFile)
          || (detectedSources && sourceFile && !detectedSources.has(sourceFile));
      })
      .map(node => node.id)
      .filter(Boolean),
  );

  graph.nodes = (graph.nodes || []).filter(node => !staleNodeIds.has(node.id));
  const referencesPrunedNode = edge =>
    staleNodeIds.has(edge.source) || staleNodeIds.has(edge.target);

  if (Array.isArray(graph.links)) {
    graph.links = graph.links.filter(edge => !referencesPrunedNode(edge));
  }
  if (Array.isArray(graph.edges)) {
    graph.edges = graph.edges.filter(edge => !referencesPrunedNode(edge));
  }
  if (Array.isArray(graph.hyperedges)) {
    graph.hyperedges = graph.hyperedges.filter(edge =>
      !(Array.isArray(edge.nodes) && edge.nodes.some(nodeId => staleNodeIds.has(nodeId))),
    );
  }

  const seenHyperedgeIds = new Set();
  let duplicateHyperedges = 0;
  graph.hyperedges = (graph.hyperedges || []).filter(edge => {
    if (!edge.id || !seenHyperedgeIds.has(edge.id)) {
      if (edge.id) seenHyperedgeIds.add(edge.id);
      return true;
    }
    duplicateHyperedges += 1;
    return false;
  });

  return {
    graph,
    stats: {
      normalizedFileTypes,
      prunedNodes: staleNodeIds.size,
      duplicateHyperedges,
    },
  };
}

module.exports = {
  buildGraphifyUpdateArgs,
  isExcludedSource,
  sanitizeGraphData,
};
