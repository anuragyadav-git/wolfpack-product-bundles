import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('storefront ESM build', () => {
  it('builds warning-free classic scripts for every storefront entry', () => {
    const outputDir = mkdtempSync(path.join(tmpdir(), 'wpb-storefront-build-'));
    execFileSync(process.execPath, ['scripts/build-storefront.mjs', 'all'], {
      cwd: process.cwd(),
      env: { ...process.env, WPB_STOREFRONT_OUTDIR: outputDir },
      stdio: 'pipe',
    });

    const outputs = [
      'bundle-widget-full-page-bundled.js',
      'bundle-widget-product-page-bundled.js',
      'wolfpack-bundles-sdk.js',
    ];

    for (const output of outputs) {
      const outputPath = path.join(outputDir, output);
      const source = readFileSync(outputPath, 'utf8');
      expect(source).not.toMatch(/^\s*import(?:\s|['"])/m);
      expect(source).not.toContain('module.exports');
      expect(() => execFileSync(process.execPath, ['--check', outputPath], { stdio: 'pipe' })).not.toThrow();
    }
  });
});
