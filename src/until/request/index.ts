import axios from "axios";
import { App } from "vue";
const dev = import.meta.env.VITE_dev
const PREFIX = 'http://', DEVSERVER = PREFIX + 'localhost:4000', BUILDSERVER = PREFIX + 'cool-delete.dynv6.net:34000'

let baseURL = `${dev && DEVSERVER || BUILDSERVER}`

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