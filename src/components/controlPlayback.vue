<!--  -->
<template>
  <div class="playMain">
    <div class="time">{{ time }}</div>
    <div class="control">
      <div class="back" @click="handel">
        <i class="el-icon-d-arrow-left"></i>
      </div>
      <div class="pause" @click="handel">
        <i class="el-icon-video-pause"></i>
      </div>
      <div class="play" @click="handel">
        <i class="el-icon-video-play"></i>
      </div>
      <div class="next" @click="handel">
        <i class="el-icon-d-arrow-right"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
//
import { defineComponent, onMounted, ref, reactive } from "vue";
import { http } from "@/until/request";
import { timeS, history as Ihistory } from "car";
import { cloneDeep } from "lodash";
export default defineComponent({
  props: {
    history: {
      type: {} as () => Ihistory[],
      require: false
    }
  },
  setup({ history }, context) {
    const time = ref('2021.04.28 15:54:12')
    // props.history
    const handel = (evne: MouseEvent) => {
      let t: NodeJS.Timeout, i = 0;
      const type = (<HTMLDivElement>evne.currentTarget).className, o: Record<string, Function> = {
        back: () => { context.emit('move', --i), clearInterval(t) },
        pause: () => { clearInterval(t) },
        play: () => {
          (() => {
            t = setInterval(() => {
              if (history?.length === i) return clearInterval(t)
              let that = history![i++]
              time.value = new Date(that.timeStart + 8 * 60 * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ').replace(/-/g, '.')
              context.emit('move', i)
            }, 200)
          })()
        },
        next: () => { context.emit('move', ++i), clearInterval(t) },
      }
      o[type]()
    }

    return {
      time,
      handel
    }
  }
})
</script>

<style>
.playMain {
  z-index: 300;
  position: absolute;
}
.time {
  position: absolute;
  left: 42vw;
  width: max-content;
  top: 1rem;
  background-color: #0a0a0a;
  border-radius: 21px;
  color: #c3a9bb;
  line-height: 1.9rem;
  padding-left: 30px;
  padding-right: 30px;
}
.control {
  position: absolute;
  top: 85vh;
  left: 9vw;
  font-size: 53px;
  display: inline-flex;
  align-content: space-between;
  justify-content: space-around;
  align-items: stretch;
}
</style>