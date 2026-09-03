/**
 * Spec: test-spec/graphify-setup.spec.md
 */

const {
  buildGraphifyUpdateArgs,
  isExcludedSource,
  sanitizeGraphData,
} = require("../../../scripts/rebuild-graphify-core.cjs");

describe("Graphify rebuild", () => {
  it("uses the supported public update command with force pruning", () => {
    expect(buildGraphifyUpdateArgs()).toEqual(["update", ".", "--force"]);
  });

  it("excludes generated Graphify output and the generated wiki", () => {
    expect(isExcludedSource("graphify-out/GRAPH_REPORT.md")).toBe(true);
    expect(isExcludedSource("Wolfpack: Product Bundles/_COMMUNITY_Community 289.md")).toBe(true);
    expect(isExcludedSource("app/services/bundle.server.ts")).toBe(false);
  });

  it("normalizes invalid types and prunes excluded or stale nodes and edges", () => {
    const graph = {
      nodes: [
        { id: "live", source_file: "app/live.ts", file_type: "concept" },
        { id: "wiki", source_file: "Wolfpack: Product Bundles/live.md", file_type: "document" },
        { id: "stale", source_file: "app/deleted.ts", file_type: "code" },
      ],
      links: [
        { source: "live", target: "wiki" },
        { source: "live", target: "stale" },
      ],
      hyperedges: [
        { id: "flow", nodes: ["live"] },
        { id: "flow", nodes: ["live"] },
        { id: "stale-flow", nodes: ["stale"] },
      ],
    };

    const result = sanitizeGraphData(graph, new Set(["app/live.ts"]));

    expect(result.graph.nodes).toEqual([
      { id: "live", source_file: "app/live.ts", file_type: "document" },
    ]);
    expect(result.graph.links).toEqual([]);
    expect(result.graph.hyperedges).toEqual([{ id: "flow", nodes: ["live"] }]);
    expect(result.stats).toEqual({
      normalizedFileTypes: 1,
      prunedNodes: 2,
      duplicateHyperedges: 1,
    });
  });
});
