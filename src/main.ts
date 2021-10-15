import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import BMap from '..@lib/map3.0.js?url'
// import BaiduMap from 'vue-offline-baidu-map'
import router from './router/index'; //引入vue-router
import request from '@/until/request';
// import 'element-plus/lib/theme-chalk/base.css'
// import 'element-plus/lib/theme-chalk/index.css'
import { VueCookieNext as VueCookies } from 'vue-cookie-next'
import { ElNotification } from 'element-plus'

//TODO #9 尝试优化ElScrollbar


const app = createApp(App);
 app.use(ElNotification)
app.use(VueCookies);
VueCookies.config({
  expire: "0",
  secure: "",
});
app.config.globalProperties.$ELEMENT = {
  size: 'small', zIndex: 3000
}

app.use(router).use(request) // 挂载到app上
app.mount('#app')
