import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],

          // Aptos wallet dependencies (keep together)
          'aptos-wallet': [
            '@aptos-labs/wallet-adapter-react',
            '@aptos-labs/ts-sdk',
          ],

          // EVM wallet dependencies (lazy loaded)
          'evm-wallet-core': [
            'wagmi',
            'viem',
          ],

          // Reown AppKit (lazy loaded - largest chunk)
          'evm-wallet-reown': [
            '@reown/appkit',
            '@reown/appkit-adapter-wagmi',
            '@reown/appkit/react',
          ],

          // UI components
          'ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-collapsible',
          ],

          // Utilities
          'utils': [
            'framer-motion',
            'lucide-react',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps for production
  },
  server: {
    open: true,
  },
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
