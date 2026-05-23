import {defineConfig} from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc';
import {comlink} from 'vite-plugin-comlink';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    comlink(),
    react({
      tsDecorators: true
    }),
    basicSsl()
  ],
  worker: {
    plugins: () => [comlink()]
  }
});
