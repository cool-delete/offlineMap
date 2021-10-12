import { IControl } from 'car'

export const ctrolMap: IControl = {

  F_baseAlert: "F_baseAlert",
  F_basePos: "F_basePos",
  F_baseTrack: "F_baseTrack",
  F_baseReadAll: "F_baseReadAll",
  F_baseQueryHisty: "F_baseQueryHisty",
  F_baseSetFence: "F_baseSetFence",
  F_baseSetPow: "F_baseSetPow",

}
export const ctrolMap_key  = {
  
  F_baseAlert: { value: "F_baseAlert", label: "报警权限" },
  F_basePos: { value: "F_basePos", label: "视野定位" },
  F_baseTrack: { value: "F_baseTrack", label: "视野追踪" },
  F_baseReadAll: { value: "F_baseReadAll", label: "视野定位所有位置" },
  F_baseQueryHisty: { value: "F_baseQueryHisty", label: "查看历史轨迹" },
  F_baseSetFence: { value: "F_baseSetFence", label: "设置区域" },
  F_baseSetPow: { value: "F_baseSetPow", label: "设置权限" },

}
export default {
  ctrolMap,
  ctrolMap_key

}