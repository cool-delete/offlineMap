import { build, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pluginRewriteAll from 'vite-plugin-rewrite-all';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),],
  resolve: {
    alias: {
      '@lib': resolve(__dirname, 'lib'),
      '@m': resolve(__dirname, 'src/module'),
      '@': resolve(__dirname, 'src'),
      '@a': resolve(__dirname, 'src/assets'),
    }
  },
  assetsInclude: resolve(__dirname, 'lib'),
  base: "./",
  // publicDir: "./lib",
  build: {
    assetsDir:'./lib',
    rollupOptions: {
      inlineDynamicImports: true
    },
    
  },
  // optimizeDeps:{
  //   include:[]
  // }
})
