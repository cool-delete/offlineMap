<!--  -->
<template>
<div class="nav"><el-radio-group v-model="isCollapse" style="margin-bottom: 20px"><el-radio-button :label="true">收起</el-radio-button><el-radio-button :label="false">展开</el-radio-button></el-radio-group><el-scrollbar class="default-scrollbar" wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view"><el-menu class="el-menu-vertical-demo" default-active="1-4-1" @open="handleOpen" @close="handleClose" :collapse="isCollapse"><el-submenu index="1"><template #title><i class="el-icon-location"></i><span>导航一</span></template><el-menu-item-group><template #title>分组一</template><el-menu-item v-for="car of cars" :key="car.identificationCode" :index="car.identificationCode" @click="setPositions(car.position)">{{ car.identificationCode }}</el-menu-item></el-menu-item-group><!--<el-menu-item-group title="分组2">
<el-menu-item index="1-3">选项3</el-menu-item>
</el-menu-item-group>
<el-submenu index="1-4">
 --></el-submenu><el-menu-item index="2" @click="focusingOnTheMap()"><i class="el-icon-aim"></i><template #title>聚合位置</template></el-menu-item><el-submenu index="3"><template #title><i class="el-icon-document"></i><span>轨迹记录</span></template><el-menu-item-group><template #title>分组一</template><template v-for="car of cars" :key="car.identificationCode"><el-menu-item v-if="car.trackPoints.length" @click="$emit('showHistoryCar', car.identificationCode)">{{ car.identificationCode }}</el-menu-item></template></el-menu-item-group></el-submenu><el-menu-item index="3"><i class="el-icon-setting"></i><template #title>导航四</template></el-menu-item></el-menu></el-scrollbar></div></template>

<script lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
import { defineComponent, PropType } from "vue";
import history from "./history.vue";
import { car,pos } from "car"



export default defineComponent({
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    cars: Array as PropType<car[]>,
    historys: Array as PropType<car[]>
  },
  data() {
    return {
      isCollapse: true,
    };
    // 这里存放数据
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() { },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() { },
  beforeCreate() { }, // 生命周期 - 创建之前
  beforeMount() { }, // 生命周期 - 挂载之前
  beforeUpdate() { }, // 生命周期 - 更新之前
  updated() { }, // 生命周期 - 更新之后
  beforeUnmount() { }, // 生命周期 - 销毁之前
  unmounted() { }, // 生命周期 - 销毁完成
  activated() { }, // 如果页面有keep-alive缓存功能，这个函数会触发
  // 方法集合
  methods: {
    handleOpen(key: string, keyPath: string) {
      console.log(key, keyPath);
    },
    handleClose(key: string, keyPath: string) {
      console.log(key, keyPath);
    },
    setPositions(pos: pos) {
      this.$emit("setPositions", pos);
    },
    focusingOnTheMap() {
      this.$emit("focusAll");
    },
  },
})
</script>

<style >
/* @import url("element-plus/lib/theme-chalk/index.css"); */
.nav {
  position: absolute;
  z-index: 20;
}
.nav .el-scrollbar__wrap {
  overflow-x: hidden !important;
}
el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  position: fixed;
}
.default-scrollbar {
  width: 100%;
  height: 100%;
}
</style>
