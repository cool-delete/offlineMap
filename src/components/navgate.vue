<!--  -->
<template>
<div class="nav"><div class="control" v-if="isOutTracking"><el-button class="outTracking" v-if="isOutTracking" @click="outTracking" type="primary" round>退出追踪</el-button><el-switch v-if="isOutTracking" v-model="isVisionShift" active-text="视野移动" inactive-text="视野静止" @click="handleViewRemove"></el-switch></div><el-radio-group v-model="isCollapse" style="margin-bottom: 20px"><el-radio-button :label="true">收起</el-radio-button><el-radio-button :label="false">展开</el-radio-button></el-radio-group><el-scrollbar class="default-scrollbar" wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view"><el-menu class="el-menu-vertical-demo" default-active="1-4-1" @open="handleOpen" @close="handleClose" :collapse="isCollapse"><el-submenu index="1"><template #title><i class="el-icon-location"></i><span>导航一</span></template><el-menu-item-group><template #title>分组一</template><template #default="dd"><el-menu-item v-for="car of cars" :key="car.identificationCode" :index="car.identificationCode" @click.self="setPositions(car.position)">{{ car.identificationCode }}<span class="track" :class="{ tracking: car.position.icar.tracking }" @click.stop.native="tracking(car.position)">跟踪</span></el-menu-item></template></el-menu-item-group><!--<el-menu-item-group title="分组2">
<el-menu-item index="1-3">选项3</el-menu-item>
</el-menu-item-group>
<el-submenu index="1-4">
 --></el-submenu><el-menu-item index="2" @click="focusingOnTheMap()"><i class="el-icon-aim"></i><template #title>聚合位置</template></el-menu-item><el-submenu index="3"><template #title><i class="el-icon-document"></i><span>轨迹记录</span></template><el-menu-item-group><template #title>分组一</template><template v-for="car of cars" :key="car.identificationCode"><el-menu-item v-if="car.trackPoints.length" @click="$emit('showHistoryCar', car.identificationCode)">{{ car.identificationCode }}</el-menu-item></template></el-menu-item-group></el-submenu><el-menu-item index="3"><i class="el-icon-setting"></i><template #title>导航四</template></el-menu-item></el-menu></el-scrollbar></div></template>

<script lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
import { defineComponent, PropType, reactive, ref, watch, } from "vue";
import { car } from "car"


export default defineComponent({
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    cars: {
      type: Array as PropType<car[]>,
      require: true
    },
    historys: {
      type: Array as PropType<car[]>,
      require: true
    }

  },
  setup(props, contxt) {
    const handleOpen = (key: string, keyPath: string) => {
      console.log(key, keyPath);
    },
      handleClose = (key: string, keyPath: string) => {
        console.log(key, keyPath);
      },
      setPositions = (pos: car['position']) => {

        contxt.emit("setPositions", pos);
        if (pos.icar === maker)
          return

        outVc && outVc()
        isVisionShift.value = false
      },
      outTracking = () => {
        outVc()
        outPath()
        isOutTracking.value = !isOutTracking.value
        maker.tracking = false
        maker = null as any
        contxt.emit('outTracking')
      },
      handleViewRemove = () => {
        // click方法里面访问v-modle的对象 已经被更改了 v-modle的优先级要比click高
        isVisionShift.value && tracking() || outVc()
      },
      tracking = (icar: (car['position'] | null) = null) => {
        //TODO #11 设置节流

        if (icar && icar.icar.tracking) return
        if (icar && maker && maker !== icar.icar) {
          outTracking()
        }
        outVc && outVc()
        outPath && outPath()
        isOutTracking.value =
          isVisionShift.value = true


        maker = icar?.icar ?? maker
        maker.tracking = true
        outVc = watch(() => maker.point, n => {
          contxt.emit('tracking', n)
        })
        outPath = watch(() => maker.point, n => {
          contxt.emit('path', n)
        })
        icar && contxt.emit('startTracking', maker.point)
        return true
      },
      focusingOnTheMap = () => {
        contxt.emit("focusAll");
      }
    let maker: car['position']['icar'],
      isOutTracking = ref(false),
      isVisionShift = ref(true)
      , outVc: Function
      , outPath: Function
    return {
      isCollapse: true,
      isVisionShift,
      isOutTracking,
      handleOpen,
      outTracking,
      handleClose,
      handleViewRemove,
      tracking,
      setPositions,
      focusingOnTheMap,
    };
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
.track {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
  line-height: 29px;
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}
.tracking {
  background-color: #b6b6b6;
  border-color: #f56c6c;
  color: #f56c6c;
  pointer-events: auto;
  cursor: not-allowed;
}

.nav .control {
  position: absolute;
  left: 5vw;
  top: 8vh;
  width: 23vh;
  height: 13vh;
  background-color: #ffffff;
  padding: 8px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
}
</style>
