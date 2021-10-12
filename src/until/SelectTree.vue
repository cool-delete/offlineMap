<template>
  <div class="select-tree">
    <el-input
      v-model="selectParam"
      class="select-param-input"
      placeholder="请选择机构"
      @click.native="handleInput"
      @input="filterInput"
      @mouseenter.native="paramInputHover"
      @mouseleave.native="paramInputOut"
    >
      <template #prefix>
        <i class="el-input__icon" :class="icon" @click="iconClick(icon)" />
      </template>
      <template #suffix>
        <slot name="suffix" />
      </template>
    </el-input>
    <div v-if="treeShowFlag" style="position:absolute" class="zind">
      <div class="triangle">
        <span />
      </div>
      <div class="drop-down-div">
        <el-tree
          ref="tree"
          empty-text="请输入用户名"
          :data="data"
          :props="Prop"
          :filter-node-method="filterNode"
          highlight-current
          default-expand-all
          class="drop-down-tree"
          @node-click="nodeClick"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
//@ts-ignore
import { ClickOutside as vClickOutside } from 'vue-click-outside'
import { computed, onMounted, reactive, ref, unref, watch } from "vue";
const emit = defineEmits<{
  (event: 'change', contend: string): void

}>()
const props = defineProps({
  data: {
    default: () => [],
    type: [Array, Object]
  },
  // value监听的是父组件的v-model
  value: {
    default: '',
    type: String
  },
  Prop: {
    default: () => ({
      children: 'children',
      label: 'com_name'
    }),
  },
  // 是否显示
}), treeShowFlag = ref(false), defaultProps = {
  children: 'children',
  label: 'com_name'
}, selectParam = ref(props.value), icon = ref("el-icon-arrow-down"), tree = ref(), choose = ref(false);
watch(treeShowFlag, (val: boolean) => {
  icon.value = val ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
})

const handleClickOutside = () => {
  treeShowFlag.value = false
},
  // 点击输入框展开/收起下拉框
  handleInput = () => {
    treeShowFlag.value = !treeShowFlag.value
    choose.value = treeShowFlag.value
  },
  // 输入文字进行模糊查询
  filterInput = (val: string) => {
    // treeShowFlag.value = true
    if (!choose.value) return
    tree.value.filter(val)
  },
  // 鼠标悬浮，如果由内容的话就显示清除图标
  paramInputHover = () => {
    if (selectParam.value !== '') {
      icon.value = 'el-icon-circle-close'
    }
  },
  // 鼠标由悬浮离开，如果图标显示的是清除的话，就换成原来的图标
  paramInputOut = () => {
    if (icon.value === 'el-icon-circle-close') {
      icon.value = treeShowFlag.value ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
    }
  },
  // 点击清除图标时清除输入框的内容
  iconClick = (icon: string) => {
    if (icon === 'el-icon-circle-close') {
      handleInput()// 由于此事件会同时触发handleInput(),所以将treeShowFlag设为false，防止出现下拉列表
      selectParam.value = ''
      filterInput(selectParam.value) // 内容清除后显示所有数据
      emit('change', "")
    }
  },
  // 节点过滤（模糊查询）
  filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.com_name.indexOf(value) !== -1
  },
  // 树形节点点击事件
  nodeClick = ({ com_name, com_no }: any) => {
    selectParam.value = com_name
    handleInput()
    choose.value = true
    emit('change', com_no)
  }
defineExpose({
  tree
})
</script>

<style lang="css" scoped>
.select-tree {
  width: 100%;
  display: inline-block;
  transition: 0.5s;
}
.select-tree .select-param-input {
  width: 100%;
  cursor: pointer;
}
.zind {
  z-index: 3333;
}
.drop-down-div {
  border-radius: 3px;
  max-height: 200px;
  min-width: 200px;
  padding: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 2px 8px 1px rgba(0, 0, 0, 0.2);
}
.drop-down-div .drop-down-tree {
  overflow: auto;
}
.triangle {
  width: 0;
  height: 0;
  border-width: 0 8px 7px;
  border-style: solid;
  border-color: transparent transparent rgb(220, 223, 230);
  margin-left: 60px;
  margin-top: 3px;
  position: relative;
}
.triangle span {
  display: block;
  width: 0;
  height: 0;
  border-width: 0 7px 6px;
  border-style: solid;
  border-color: transparent transparent rgb(255, 255, 255);
  position: absolute;
  top: 1px;
  left: -7px;
}
</style>