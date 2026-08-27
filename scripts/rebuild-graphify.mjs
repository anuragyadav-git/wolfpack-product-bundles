import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildGraphifyUpdateArgs,
  isExcludedSource,
  sanitizeGraphData,
} = require('./rebuild-graphify-core.cjs');

const graphPath = 'graphify-out/graph.json';
const validFileTypes = new Set(['code', 'document', 'image', 'paper', 'rationale']);

function sanitizeGraph(detectedSources = null) {
  if (!existsSync(graphPath)) return 0;

  const inputGraph = JSON.parse(readFileSync(graphPath, 'utf8'));
  const { graph, stats } = sanitizeGraphData(inputGraph, detectedSources);
  const changed = Object.values(stats).reduce((sum, value) => sum + value, 0);

  if (stats.prunedNodes > 0) {
    console.log(`[graphify] Pruned ${stats.prunedNodes} stale/generated node(s).`);
  }
  if (stats.duplicateHyperedges > 0) {
    console.log(`[graphify] Removed ${stats.duplicateHyperedges} duplicate hyperedge(s).`);
  }
  if (changed > 0) {
    writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);
  }

  return changed;
}

function validateGraphFileTypes() {
  if (!existsSync(graphPath)) {
    throw new Error(`Missing ${graphPath}`);
  }

  const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
  const invalid = (graph.nodes || []).filter(node =>
    node.file_type && !validFileTypes.has(node.file_type)
  );
  const excluded = (graph.nodes || []).filter(node => isExcludedSource(node.source_file));
  const hyperedgeIds = new Set();
  const duplicateHyperedges = (graph.hyperedges || []).filter(edge => {
    if (!edge.id || !hyperedgeIds.has(edge.id)) {
      if (edge.id) hyperedgeIds.add(edge.id);
      return false;
    }
    return true;
  });

  if (invalid.length > 0) {
    const sample = invalid.slice(0, 5).map(node =>
      `${node.id || '(missing id)'}:${node.file_type}`
    ).join(', ');
    throw new Error(`graphify graph contains ${invalid.length} invalid file_type value(s): ${sample}`);
  }
  if (excluded.length > 0) {
    throw new Error(`graphify graph contains ${excluded.length} excluded generated-source node(s)`);
  }
  if (duplicateHyperedges.length > 0) {
    throw new Error(`graphify graph contains ${duplicateHyperedges.length} duplicate hyperedge ID(s)`);
  }
}

sanitizeGraph();

const result = spawnSync('graphify', buildGraphifyUpdateArgs(), {
  cwd: process.cwd(),
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to start public graphify update: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    'Graphify rebuild failed through the public CLI. Install or upgrade the graphifyy uv tool and retry.',
  );
  process.exit(result.status ?? 1);
}

sanitizeGraph();
validateGraphFileTypes();
