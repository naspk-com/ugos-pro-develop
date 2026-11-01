import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';

const ugosBuilder = new UgosViteBuilder({
  windowConfig: {
    hideTitle: true,
    hideIcon: true,
    background: '#f5f5f5',
    frame: false,
  },
  getIgnoreFolder: (c: unknown) => c,
  base: '/globalsearch',
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...ugosBuilder.pluginEntry()],
});
