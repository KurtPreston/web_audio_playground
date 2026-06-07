import {copyFileSync, mkdirSync, readFileSync} from 'fs';
import {sync} from 'glob';
import {join} from 'path';
import type {Plugin} from 'vite';

function discoverSpaRoutes(root: string): string[] {
  const files = sync('src/games/**/*.{ts,tsx}', {cwd: root});
  const routes = new Set<string>();

  for (const file of files) {
    const content = readFileSync(join(root, file), 'utf8');
    const match = content.match(/^\s*url:\s*['"](\/[^'"]+)['"]/m);
    if (match) {
      routes.add(match[1]);
    }
  }

  return [...routes].sort();
}

export function spaRouteHtmlPlugin(): Plugin {
  return {
    name: 'spa-route-html',
    apply: 'build',
    closeBundle() {
      const root = process.cwd();
      const outDir = join(root, 'dist');
      const indexHtml = join(outDir, 'index.html');
      const routes = discoverSpaRoutes(root);

      for (const route of routes) {
        const dir = join(outDir, route.slice(1));
        mkdirSync(dir, {recursive: true});
        copyFileSync(indexHtml, join(dir, 'index.html'));
      }

      this.info(`Generated index.html for ${routes.length} SPA routes`);
    }
  };
}
