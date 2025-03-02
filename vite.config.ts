import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allowedHosts = [
    'localhost',
    '.railway.app'
  ];

  // Add custom hosts from env if exists (comma-separated list)
  if (env.VITE_ALLOWED_HOST) {
    const customHosts = env.VITE_ALLOWED_HOST.split(',').map(host => host.trim());
    allowedHosts.push(...customHosts);
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
      host: true,
      allowedHosts
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increase chunk size limit to 1000kb
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown-vendor': ['react-markdown', 'react-syntax-highlighter', 'rehype-raw', 'rehype-katex', 'remark-gfm', 'remark-math'],
            'utils-vendor': ['axios', 'crypto-js']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});
