<!--  -->
<template>
  <div class="playMain">
    <div class="time">{{ time }}</div>
    <span class="close" @click="handleClosed"></span>
    <div class="control">
      <div class="back" @click="handel">
        <i class="el-icon-d-arrow-left"></i>
      </div>
      <div class="pause" @click="handel" :class="{ 'choose': choosed === 2 }">
        <i class="el-icon-video-pause"></i>
      </div>
      <div class="play" @click="handel" :class="{ 'choose': choosed === 3 }">
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
import { history as Ihistory } from "car";
import { defineComponent, onMounted, PropType, ref, } from "vue";

export default defineComponent({
  props: {
    historylocu: {
      type: Object as PropType<Ihistory>,
      require: true
    }
  },
  setup({ historylocu }, context) {

    onMounted(() => {
      // state
    })

    const time = ref('2021.04.28 15:54:12'), choosed = ref(0)
    // props.history
    let t: number, i = 0, state: HTMLDivElement;
    const handel = (evne: MouseEvent) => {
      !~i && ++i
      state = <HTMLDivElement>evne.currentTarget
      const type = state.className, o: Record<string, Function> = {
        back: () => { refresh(--i), clearInterval(t); choosed.value = 2 },
        pause: () => { clearInterval(t); choosed.value === 2 || --i; choosed.value = 2 },
        play: () => {
          t = setInterval(() => {
            refresh(i++)
          }, 1000)
            ; choosed.value = 3
        },
        next: () => { refresh(++i), clearInterval(t); choosed.value = 2 },
      }, refresh = (index: number): void => {
        if (historylocu?.points.length === index) return clearInterval(t)
        let that = historylocu?.points![index]
        // time.value = new Date(that!.time! + 8 * 60 * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ').replace(/-/g, '.')
        time.value =that!.time!.replace('T', ' ').replace(/-/g, '.')
        context.emit('move', index)
      }
      o[type]()
    }
      , handleClosed = () => {
        clearInterval(t)
        context.emit('close')
      }

    return {
      time,
      choosed,
      handleClosed,
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
.choose {
  color: #924040;
}
.playMain .close {
  background: #f82121b8;
  color: #000000;
  border-radius: 17px;
  line-height: 23px;
  text-align: center;
  height: 22px;
  width: 22px;
  left: 56vw;
  top: 15px;
  padding: 3px;
  position: absolute;
}
</style>