
<template>
<el-table :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))" style="width: 100%"><el-table-column label="id" prop="id"></el-table-column><el-table-column label="车牌号" prop="car"></el-table-column><el-table-column label="开始" align="right"><template #default="dd"><i class="el-icon-time"></i><span>{{dd.row.timeStart}}</span></template></el-table-column><el-table-column label="结束" prop align="right"><template #header><el-input v-model="search" size="mini" placeholder="输入关键字搜索"></el-input></template><template #default="dd"><i class="el-icon-time"></i>{{dd.row.timeEnd}}</template></el-table-column></el-table></template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
 async setup(){



 },
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      search: ''
    }
  },
  methods: {
    handleEdit(index: string, row: HTMLTableRowElement) {
      console.log(index, row);
    },
    handleDelete(index: string, row: HTMLTableRowElement) {
      console.log(index, row);
    }
  },
})
</script>

<style>
</style>
