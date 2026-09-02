import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('FPB bundled widget syntax', () => {
  it('parses the generated full-page widget without declaration collisions', () => {
    const bundlePath = path.resolve(
      process.cwd(),
      'extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js',
    );

    expect(() => {
      execFileSync(process.execPath, ['--check', bundlePath], {
        stdio: 'pipe',
      });
    }).not.toThrow();
  });

  it('contains no static ES module imports', () => {
    const bundlePath = path.resolve(
      process.cwd(),
      'extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js',
    );
    const bundle = fs.readFileSync(bundlePath, 'utf8');

    expect(bundle).not.toMatch(/^\s*import(?:\s|['"])/m);
  });
});
