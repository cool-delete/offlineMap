import { build, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import styleImport from 'vite-plugin-style-import'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    styleImport({
      libs: [{
        libraryName: 'element-plus',
        esModule: true,
        ensureStyleFile: true,
        resolveStyle: (name) => {
          name = name.slice(3)
          return `element-plus/lib/theme-chalk/${name}.css`;
        },
        resolveComponent: (name) => {
          return `element-plus/lib/${name}`;
        },
      }]
    })
  ],
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
    assetsDir:'./',
    rollupOptions: {
      inlineDynamicImports: true
    },
    
  },
  // optimizeDeps:{
  //   include:[]
  // }
})
