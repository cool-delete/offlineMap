<!--  -->
<template>
  <div class="nav">
    <div class="control" v-if="isOutTracking">
      <el-button
        class="outTracking"
        v-if="isOutTracking"
        @click="outTracking"
        type="primary"
        round
      >退出追踪</el-button>
      <el-switch
        v-if="isOutTracking"
        v-model="isVisionShift"
        :active-text="`${isVisionShift ? '视野追踪' : '视野静止'}`"
        @click="handleViewRemove"
      ></el-switch>
    </div>
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
      <el-radio-button :label="true">收起</el-radio-button>
      <el-radio-button :label="false">展开</el-radio-button>
    </el-radio-group>
    <el-scrollbar
      class="default-scrollbar"
      wrap-class="default-scrollbar__wrap"
      view-class="default-scrollbar__view"
    >
      <el-menu
        :default-active="defaultActive"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse"
      >
        <el-submenu index="1-1">
          <template #title>
            <i class="el-icon-location"></i>
            <span>导航一</span>
          </template>
          <el-menu-item-group>
            <template #title>分组一</template>
            <template #default="dd">
              <el-menu-item
                v-for="car of cars"
                :key="car.identificationCode"
                :index="car.identificationCode"
                @click.self="setPositions(car.position)"
                class="navgate-item"
              >
                {{ car.identificationCode }}
                <span
                  class="track"
                  :class="{ tracking: car.position.icar.tracking }"
                  @click.stop.native="tracking(car.position)"
                >跟踪</span>
              </el-menu-item>
            </template>
          </el-menu-item-group>
          <!--<el-menu-item-group title="分组2">
<el-menu-item index="1-3">选项3</el-menu-item>
</el-menu-item-group>
<el-submenu index="1-4">
          -->
        </el-submenu>
        <el-menu-item index="1-2" @click="focusingOnTheMap()">
          <i class="el-icon-aim"></i>
          <template #title>聚合位置</template>
        </el-menu-item>
        <el-menu-item @click="showHis" index="1-3">
          <i class="el-icon-document"></i>
          <template #title>轨迹记录</template>
        </el-menu-item>
        <el-submenu index="1-4">
          <template #title>
            <i class="el-icon-setting"></i>
            <span>设置</span>
          </template>
          <el-menu-item @click="goFenceSetting">电子围栏</el-menu-item>
          <el-menu-item @click="$emit('SettingPow')">权限管理</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
import { defineComponent, PropType, reactive, ref, watch, } from "vue";
import { car, User } from "car"
import { ctrolMap_key } from "@/until/cotrol";
import { useCookie } from 'vue-cookie-next'

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
    const cookis = useCookie()
    const u: User = cookis.getCookie('user')
    const handleOpen = (key: string, keyPath: string) => {
      console.log(key, keyPath);
    },
      handleClose = (key: string, keyPath: string) => {
        console.log(key, keyPath);
      },
      setPositions = (pos: car['position']) => {

        const orNull = u.filterPower[ctrolMap_key.F_basePos.value]
        if (!orNull) {
          contxt.emit("notify", "无权访问定位");
          return
        }

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
        const orNull = u.filterPower[ctrolMap_key.F_baseTrack.value]
        if (!orNull) {
          contxt.emit("notify", "无权跟踪");
          return
        }

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
        const orNull = u.filterPower[ctrolMap_key.F_baseReadAll.value]
        if (!orNull) {
          contxt.emit("notify", "无权访问定位");
          return
        }
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
      defaultActive: "",
      focusingOnTheMap,
      showHis: () => {
        const orNull = u.filterPower[ctrolMap_key.F_baseQueryHisty.value]
        if (!orNull) {
          contxt.emit("notify", "无权访问查看历史轨迹");
          return
        }
        contxt.emit('showHistoryCar')
      },
      goFenceSetting: () => {
        const orNull = u.filterPower[ctrolMap_key.F_baseSetFence.value]
        if (!orNull) {
          contxt.emit("notify", "无权设置区域");
          return
        }
        contxt.emit('goFenceSetting')
      },
      SettingPow: () => {
        const orNull = u.filterPower[ctrolMap_key.F_baseSetPow.value]
        if (!orNull) {
          contxt.emit("notify", "无权设置权限");
          return
        }
        contxt.emit('SettingPow')
      },
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
  cursor: pointer;
}
.tracking {
  background-color: #b6b6b6;
  border-color: #f56c6c;
  color: #f56c6c;
  pointer-events: auto;
  cursor: not-allowed;
}
.navgate-item {
  display: flex;
  flex-wrap: nowrap;
  align-content: stretch;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.nav .control {
  position: absolute;
  left: 5vw;
  top: 8vh;
  width: 16vh;
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
