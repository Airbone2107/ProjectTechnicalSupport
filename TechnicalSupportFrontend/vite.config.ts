import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'components': path.resolve(__dirname, 'src/components'),
      'contexts': path.resolve(__dirname, 'src/contexts'),
      'features': path.resolve(__dirname, 'src/features'),
      'lib': path.resolve(__dirname, 'src/lib'),
      'types': path.resolve(__dirname, 'src/types'),
      'stores': path.resolve(__dirname, 'src/stores'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});