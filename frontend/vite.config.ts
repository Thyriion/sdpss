import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'plant-analyzer-panel.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: 'dist',
    minify: false,
  },
});
