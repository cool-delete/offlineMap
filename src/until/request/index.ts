import axios from "axios";
import { App } from "vue";
export const http = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
  // headers:{"X-Requested-With":"XMLHttpRequest"},
  withCredentials: false

})
export default {
  http,
  install(app: App) {
    app.config.globalProperties.$http = http
  }
}