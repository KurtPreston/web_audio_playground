import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {describe, it, expect, afterEach} from 'vitest';
import {discoverSpaRoutes, generateRouteHtml} from './spa-route-html-plugin';

const projectRoot = join(__dirname, '..');

describe('spa-route-html-plugin', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, {recursive: true, force: true});
    }
  });

  it('discovers SPA routes from game modules', () => {
    expect(discoverSpaRoutes(projectRoot)).toEqual([
      '/cables',
      '/doppler',
      '/factory',
      '/hadouken',
      '/solo',
      '/tadpole',
      '/wamflap'
    ]);
  });

  it('copies index.html into a directory per route', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'spa-route-html-'));
    const indexHtml = '<!DOCTYPE html><html><body>spa shell</body></html>';
    writeFileSync(join(tempDir, 'index.html'), indexHtml);

    const routes = generateRouteHtml(projectRoot, tempDir);

    expect(routes).toEqual([
      '/cables',
      '/doppler',
      '/factory',
      '/hadouken',
      '/solo',
      '/tadpole',
      '/wamflap'
    ]);

    for (const route of routes) {
      const routeHtmlPath = join(tempDir, route.slice(1), 'index.html');
      expect(readFileSync(routeHtmlPath, 'utf8')).toBe(indexHtml);
    }
  });
});
