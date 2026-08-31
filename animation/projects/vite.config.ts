import { defineConfig } from 'vite';
import ffmpeg from '@motion-canvas/ffmpeg';
import motionCanvas from '@motion-canvas/vite-plugin';
import markdownSnippets from '../vite-plugin-markdown-snippets';

import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@lectures': resolve(__dirname, '../../lectures'),
    },
  },
  plugins: [
    motionCanvas({
      project: [
        './src/parallelism/project.ts',
        './src/dummy/project.ts',
        './src/std_function/project.ts',
      ]
    }),
    ffmpeg(),
    markdownSnippets(),
    {
      name: 'fix-motion-canvas-back-button',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/src/' || req.url === '/src') {
            res.writeHead(301, { Location: '/' });
            res.end();
          } else {
            next();
          }
        });
      }
    }
  ],
});
