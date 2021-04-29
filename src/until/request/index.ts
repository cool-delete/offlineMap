import axios from "axios";
import { App } from "vue";
const dev = import.meta.env.VITE_dev
const PREFIX = 'htp://', DEVSERVER = PREFIX + 'localhost', BUILDSERVER = PREFIX + 'e1dfceee.test.utools.club'

let baseURL = `${dev && DEVSERVER || BUILDSERVER}`
    console.log('当前环境是', baseURL);

export const http = axios.create({
  baseURL,
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