import { build, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import ViteComponents, {

  ElementPlusResolver,

} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
  Components({
    resolvers: [

      ElementPlusResolver(),

    ]
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
    assetsDir: './',
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },

  },
  // optimizeDeps:{
  //   include:[]
  // }
})
