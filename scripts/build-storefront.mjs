#!/usr/bin/env node

import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = process.env.WPB_STOREFRONT_OUTDIR || join(rootDir, 'extensions/bundle-builder/assets');
const widgetVersion = '17.0.3';

const targets = {
  'full-page': {
    entry: join(rootDir, 'app/storefront/full-page.ts'),
    output: 'bundle-widget-full-page-bundled.js',
  },
  'product-page': {
    entry: join(rootDir, 'app/storefront/product-page.ts'),
    output: 'bundle-widget-product-page-bundled.js',
  },
  sdk: {
    entry: join(rootDir, 'app/storefront/sdk.ts'),
    output: 'wolfpack-bundles-sdk.js',
  },
  embed: {
    entry: join(rootDir, 'app/storefront/app-embed.ts'),
    output: 'bundle-app-embed.js',
  },
};

export async function buildStorefront(requestedTarget = 'all') {
  const selectedTargets = requestedTarget === 'all'
    ? Object.entries(targets)
    : [[requestedTarget, targets[requestedTarget]]];

  if (selectedTargets.some(([, target]) => !target)) {
    throw new Error(`Unknown storefront build target: ${requestedTarget}`);
  }

  const outputs = [];
  for (const [name, target] of selectedTargets) {
    const result = await build({
      entryPoints: [target.entry],
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      legalComments: 'none',
      write: false,
      outfile: join(outputDir, target.output),
      banner: { js: `window.__BUNDLE_WIDGET_VERSION__ = '${widgetVersion}';` },
      logLevel: 'silent',
    });

    if (result.warnings.length > 0) {
      throw new Error(result.warnings.map((warning) => warning.text).join('\n'));
    }

    const output = result.outputFiles.find((file) => file.path.endsWith(target.output));
    if (!output) throw new Error(`No output generated for ${name}`);
    outputs.push({ name, path: output.path, contents: output.contents });
  }

  mkdirSync(outputDir, { recursive: true });
  for (const output of outputs) {
    writeFileSync(output.path, output.contents);
    const gzipBytes = gzipSync(output.contents).byteLength;
    console.log(`${output.name}: ${output.contents.byteLength} B (${gzipBytes} B gzip)`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  buildStorefront(process.argv[2] || 'all').catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
