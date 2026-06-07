import {defineConfig} from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc';
import {comlink} from 'vite-plugin-comlink';
import {spaRouteHtmlPlugin} from './scripts/spa-route-html-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    comlink(),
    react({
      tsDecorators: true
    }),
    basicSsl(),
    spaRouteHtmlPlugin()
  ],
  worker: {
    plugins: () => [comlink()]
  }
});
