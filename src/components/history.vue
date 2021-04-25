<template>
  <el-submenu index="3-1" v-if="historys">
    <template #title>选项4</template>
    <el-menu-item index="3-1-1">选项1</el-menu-item>
  </el-submenu>
  <el-menu-item v-else index="3-2">选项1</el-menu-item>
</template>

<script lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'

import { defineComponent } from "vue";

export default defineComponent({
  // import引入的组件需要注入到对象中才能使用
  props: {

    historys: Boolean
  },

  components: {},
  data() {
    return {}
    // 这里存放数据
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {
console.log('这次',this.historys);

  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {

  },
  beforeCreate() { }, // 生命周期 - 创建之前
  beforeMount() { }, // 生命周期 - 挂载之前
  beforeUpdate() { }, // 生命周期 - 更新之前
  updated() { }, // 生命周期 - 更新之后
  beforeUnmount() { }, // 生命周期 - 销毁之前
  unmounted() { }, // 生命周期 - 销毁完成
  activated() { }, // 如果页面有keep-alive缓存功能，这个函数会触发
  // 方法集合
  methods: {

  }
})
</script>

<style less scoped>
/* //@import url(); 引入公共css类 */
</style>
