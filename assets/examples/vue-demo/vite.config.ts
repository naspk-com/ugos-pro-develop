import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';

const ugosBuilder = new UgosViteBuilder({
  windowConfig: { width: 1200, height: 800 },
  getIgnoreFolder: (c: unknown) => c,
  base: '/globalsearch',
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ...ugosBuilder.pluginEntry()],
});
