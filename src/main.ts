import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import BMap from '..@lib/map3.0.js?url'
// import BaiduMap from 'vue-offline-baidu-map'
import router from './router/index'; //引入vue-router
// import 'element-plus/lib/theme-chalk/base.css'
import 'element-plus/lib/theme-chalk/index.css'
import {
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElSubmenu,
  ElInfiniteScroll,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
} from 'element-plus';
const plugins = [
  ElInfiniteScroll,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
],
  components = [
    ElRadio,
    ElRadioButton,
    ElRadioGroup,
    ElMenu,
    ElMenuItem,
    ElMenuItemGroup,
    ElSubmenu,
  ],
  app = createApp(App);
  plugins.forEach((plugin) => {
  app.use(plugin)
})
app.config.globalProperties.$ELEMENT = {
  size: 'small', zIndex: 3000
}
components.forEach(component => {
  console.log('组件',component.name);
  
  app.component(component.name, component)
})
app.use(router) // 挂载到app上
app.mount('#app')
