<!--  -->
<template>
  <div class="nav">
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
      <el-radio-button :label="true">收起</el-radio-button>
      <el-radio-button :label="false">展开</el-radio-button>
    </el-radio-group>
    <el-menu
      default-active="1-4-1"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
    >
      <el-submenu index="1">
        <template #title>
          <i class="el-icon-location"></i>
          <span>导航一</span>
        </template>
        <el-menu-item-group>
          <template #title>分组一</template>
          <el-menu-item
            v-for="car of cars"
            :key="car.identificationCode"
            :index="car.identificationCode"
            @click="setPositions(car.position)"
            >{{ car.identificationCode }}</el-menu-item
          >
        </el-menu-item-group>
        <!-- <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <template #title>选项4</template>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu> -->
      </el-submenu>
      <el-menu-item index="2" @click="focusingOnTheMap()">
        <i class="el-icon-aim"></i>
        <template #title>聚合位置</template>
      </el-menu-item>
      <el-submenu index="3">
        <template #title>
          <i class="el-icon-document"></i>
          <span>轨迹记录</span>
        </template>
        <el-menu-item-group>
          <template #title>分组一</template>
          <el-menu-item
            v-for="car of cars"
            :key="car.identificationCode"
            :index="car.identificationCode"
            @click="setPositions(car.position)"
            >{{ car.identificationCode }}</el-menu-item
          >
        </el-menu-item-group>
        <!-- <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <template #title>选项4</template>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu> -->
      </el-submenu>

      <el-menu-item index="3">
        <i class="el-icon-setting"></i>
        <template #title>导航四</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
import { PropType } from "vue";
interface pos {
  lng: number;
  lat: number;
  icar: {};
}
interface car {
  identificationCode: "";
  superiorDepartments: "";
  higherUnit: "";
  state: "";
  trackPoints: [
    {
      lng: number;
      lat: number;
    }
  ];
  position: pos;
}
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: { cars: Array as PropType<car[]> },
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
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeUnmount() {}, // 生命周期 - 销毁之前
  unmounted() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
  // 方法集合
  methods: {
    handleOpen(key: string, keyPath: string) {
      console.log(key, keyPath);
    },
    handleClose(key: string, keyPath: string) {
      console.log(key, keyPath);
    },
    setPositions(pos: pos) {
      //@ts-ignore
      this.$emit("setPositions", pos);
    },
    focusingOnTheMap() {
      this.$emit("focusAll");
    },
  },
};
</script>

<style >
/* @import url("element-plus/lib/theme-chalk/index.css"); */
.nav {
  position: fixed;
  z-index: 20;
}
el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
