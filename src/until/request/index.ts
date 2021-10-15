import axios from "axios";
import { App } from "vue";
const dev = import.meta.env.VITE_dev
const PREFIX = 'http://', DEVSERVER = PREFIX + 'localhost:34000', BUILDSERVER = PREFIX + 'localhost:34000'

let baseURL = `${dev && DEVSERVER || BUILDSERVER}`

export const http = axios.create({
  baseURL,
  timeout: 10000,
  // headers:{"X-Requested-With":"XMLHttpRequest"},
  withCredentials: false

})
export default {
  http,
  baseURL,
  install(app: App) {
    app.config.globalProperties.$http = http
  }
}