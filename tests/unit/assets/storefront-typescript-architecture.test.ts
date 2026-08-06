import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const runtimeRoots = [
  'app/assets/sdk',
  'app/assets/widgets',
];
const runtimeEntries = [
  'app/assets/bundle-modal-component.ts',
  'app/assets/bundle-widget-components.ts',
  'app/assets/bundle-widget-full-page.ts',
  'app/assets/bundle-widget-product-page.ts',
];

function filesBelow(directory: string): string[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

describe('storefront TypeScript architecture', () => {
  it('contains no JavaScript source modules in the storefront runtime graph', () => {
    const javascriptSources = runtimeRoots
      .flatMap(filesBelow)
      .filter((file) => extname(file) === '.js')
      .map((file) => relative(root, join(root, file)));

    expect(javascriptSources).toEqual([]);
    for (const entry of runtimeEntries) {
      expect(() => readFileSync(join(root, entry), 'utf8')).not.toThrow();
    }
  });

  it('does not mutate widget prototypes to install method modules', () => {
    for (const entry of runtimeEntries.slice(2)) {
      const source = readFileSync(join(root, entry), 'utf8');
      expect(source).not.toContain('applyMethodMixins(');
      expect(source).not.toMatch(/Object\.assign\(\s*\w+\.prototype/);
    }
  });
});
