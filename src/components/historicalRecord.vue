//TODO #10 优化UI关闭按钮
<template>
  <div class="table">
    <el-table
      :data="tableData.filter(data => !search || data.car.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%"
      height="260"
      @row-click="processingLocus"
    >
      <el-table-column label="id" prop="id" width="35"></el-table-column>
      <!-- <el-table-column label="车牌号" prop="car"></el-table-column> -->
      <el-table-column label="开始" align="center">
        <template #default="dd">
          <i class="el-icon-time"></i>
          <span>{{ dd.row.timeStart }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" width="300">
        <template #header style="height:12px">
          结束
          <el-input v-model="search" size="mini" placeholder="输入关键字搜索"></el-input>
          <span class="close" @click="$emit('close')" title="关闭窗口"></span>
        </template>
        <template #default="ee">
          <i class="el-icon-time"></i>
          {{ ee.row.timeEnd }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
//
import { defineComponent, onMounted, ref, reactive, getCurrentInstance } from "vue";
import { timeS, history } from "car";
export default defineComponent({
  async setup(props, context) {
    // @ts-ignore
    const {  $http :http } = (getCurrentInstance()!.proxy);
    onMounted(() => (console.log(http)))
    const ta: timeS[] = await (await http.get('timeS')).data.map((data: timeS) => ({ id: data.id + 1, car: data.car, timeStart: new Date(data.timeStart + 86400000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.'), timeEnd: new Date(data.timeEnd + 86400000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.') }))

    console.log(ta);



    const processingLocus = async function(row: timeS,) {
      let hi = (await http.get<history[]>('history')).data
      context.emit("showHistoryCar", hi)
      context.emit("close")
    },
      handleDelete = function(index: string, row: HTMLTableRowElement) {
        console.log(index, row);
      }
    const tableData = reactive<timeS[]>(ta), search = ref('')
    return {
      tableData,
      processingLocus,
      handleDelete,
      search,
    }
  }
})
</script>

<style>
.table {
  width: 57vw;
  max-height: 16vh;
  z-index: 300;
  top: 31vh;
  position: absolute;
  right: 33vw;
}
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
<style>
.el-input.el-input--mini {
  width: 43%;
  left: 7.3vw;
}
.default-scrollbar {
  width: 100%;
  height: 330px;
}
.el-table__body-wrapper.is-scrolling-none::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.el-table__body-wrapper.is-scrolling-none::-webkit-scrollbar-thumb {
  background-color: #ddd;
}
</style>