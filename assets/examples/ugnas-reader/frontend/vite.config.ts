import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

// Re-create rootfs_common/www/.gitkeep after Vite's emptyOutDir wipes it.
// Without this, every build deletes the placeholder and git shows a spurious
// "deleted: .gitkeep" — the file is referenced by .gitignore to make the
// otherwise-ignored www/ directory survive a clean checkout.
function preserveGitkeep(outDir: string): Plugin {
  return {
    name: 'preserve-www-gitkeep',
    closeBundle() {
      const target = path.join(outDir, '.gitkeep');
      try {
        fs.writeFileSync(target, '');
      } catch (err) {
        this.warn(`failed to recreate .gitkeep at ${target}: ${String(err)}`);
      }
    },
  };
}

// Build output goes straight into the UGOS rootfs_common/www folder so
// `ugcli pack` picks it up without an extra copy step.
//
// We deliberately do NOT use @ugreen-nas/builder-open here. That plugin
// hardcodes an in-tree `dist/` and tries to gzip-tarball it in
// `closeBundle`, which clashes with our direct-to-rootfs output layout.
// AGENTS.md notes the builder is optional; UGOS reads the canonical app
// metadata from project.yaml, not from a build-time JSON. If we ever need
// the builder's window-meta injection we'll switch to a two-step
// `vite build` → copy-to-rootfs flow.
//
// Heads-up on the `vue` dependency in package.json:
// @ugreen-nas/core's ugos-core/index.mjs does `import { h, ref, version,
// watchEffect } from "vue"` for an internal Vue-based i18n module. The
// SDK does NOT list vue as a dependency or peerDependency (likely an
// oversight on their end), so we have to pull vue in ourselves even
// though we render with React. The i18n side-effect code runs at module
// load; later we can shave bundle size by aliasing vue to a stub, since
// we use React's own i18n story.
const wwwOutDir = path.resolve(__dirname, '../rootfs_common/www');

export default defineConfig({
  plugins: [react(), preserveGitkeep(wwwOutDir)],
  build: {
    outDir: wwwOutDir,
    emptyOutDir: true,
    // Filename hashes are mandatory: the UGOS web server sends Cache-Control
    // headers that allow long-lived caching.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    // In `pnpm dev`, proxy /api to the local Go backend so headers work the
    // same way as behind the UGOS gateway (sans Ugreen-User-* injection).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:21010',
        changeOrigin: false,
      },
    },
  },
});
