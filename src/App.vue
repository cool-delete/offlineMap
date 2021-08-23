
//TODO #1 可以尝试转tsx格式
//TODO #3 引入百度api,js
//TODO #5  显示地图
//TODO #6 制成路书
<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <HelloWorld msg="Hello Vue 3.0 + Vite" />
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>
<style lang="css">
  .close {
  background: #f82121ad;
  color: #000000;
  border-radius: 12px;
  line-height: 21px;
  text-align: center;
  height: 22px;
  width: 22px;
  right: 0px;
  top: 0px;
  position: absolute;
}
.close::before {
  content: "\2716";
}
</style>
