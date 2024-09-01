import { defineConfig } from 'vite';
import ffmpeg from '@motion-canvas/ffmpeg';
import motionCanvas from '@motion-canvas/vite-plugin';

export default defineConfig({
  plugins: [motionCanvas(), ffmpeg()],

});
