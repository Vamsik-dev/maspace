import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

// Builds the prototype as one self-contained HTML file (hash routing) so it can be
// shared as a link without a server. `npm run build:share` → share-dist/index.html
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r('./'),
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: [
      { find: 'next/link', replacement: r('./src/share/link.tsx') },
      { find: 'next/navigation', replacement: r('./src/share/navigation.ts') },
      { find: 'next/dynamic', replacement: r('./src/share/dynamic.tsx') },
      { find: /^@\//, replacement: r('./src/') + '/' },
    ],
  },
  define: { 'process.env.NEXT_PUBLIC_SHARE': JSON.stringify('1') },
  build: { outDir: r('./share-dist'), emptyOutDir: true, rollupOptions: { input: r('./share/index.html') }, chunkSizeWarningLimit: 10000, assetsInlineLimit: 100000000 },
});
