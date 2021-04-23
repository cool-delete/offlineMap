import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import BMap from '..@lib/map3.0.js?url'
// import BaiduMap from 'vue-offline-baidu-map'
import router from './router/index'; //引入vue-router
const app = createApp(App);
app.use(router) // 挂载到app上
app.mount('#app')