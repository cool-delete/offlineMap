//TODO #10 优化UI关闭按钮
<template>
  <div class="table">
    <el-select v-model="fireNo" placeholder="选择枪支" @change="select">
      <el-option
        v-for="item in listFire"
        :key="item.Fir_NO"
        :label="item.Fir_Name"
        :value="{ value: item.Fir_NO, label: item.Fir_Name }"
      ></el-option>
    </el-select>
    <el-config-provider :locale="zhCn">
      <el-date-picker
        v-model="timeCross"
        type="datetimerange"
        range-separator="到"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        popper-class="date-style"
        class="rangTime"
        ref="timePicker"
        :disabledDate="disabledDate"
        @change="changeRangTime"
      ></el-date-picker>
      <el-button class="confirm" :disabled ="!hasDate" type="primary" round @click="processingLocus">播放</el-button>
    </el-config-provider>
    <!-- <i class="el-icon-plus"></i> -->
    <!-- <el-table-column label="id" prop="id" width="35"></el-table-column>
       <el-table-column label="车牌号" prop="car"></el-table-column> 
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
       
        </template>
        <template #default="ee">
          <i class="el-icon-time"></i>
          {{ ee.row.timeEnd }}
        </template>
    </el-table-column>-->
    <span class="close thisCl" @click="$emit('close')" title="关闭窗口"></span>
  </div>
</template>

<script lang="ts">
//
import { defineComponent, onMounted, ref, reactive, getCurrentInstance, computed, defineExpose } from "vue";
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import { ElConfigProvider } from 'element-plus'
import { history, po } from "car";
import { http } from "@/until/request";
export default defineComponent({
   components: {
    [ElConfigProvider.name]: ElConfigProvider,
  },
  async setup(props, context) {
    // @ts-ignore
    interface fire { Fir_NO: string, Fir_Name: string, Com_No: string }
    interface fireP extends fire { points: po[] }
    const listFire = reactive((await http.post<{ sets: fire[] }>("/db/queryHasLoc")).data.sets), fireNo = ref<{ value: "", label: '' }>({ value: "", label: '' }), search = ref(''), timeCross = ref(''), timePicker = ref(null),hasDate=ref(false),
      processingLocus = async function () {
        // let hi = (await http.get<history[]>('history')).data
        context.emit("showHistoryCar", mainDate)
        context.emit("close")
      },
      changeRangTime = async function (getTime:[Date,Date]) {
        if(!getTime) {
          hasDate.value=false
          return
        
        }
        const [ start, end] = getTime
        console.log("选择结束", start, end);

        const lushu = (await http.post<{ sets: fireP }>("/db/queryLoc", { fir_no: fireNo.value.value, fir_name: fir_name, start: formatDate(start!), end: formatDate(end!) })).data.sets
        mainDate=lushu
        hasDate.value=true
      },
      formatDate = (current_datetime: Date) => {
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
        return formatted_date;
      },
      select = function ({ label }: { value: string, label: string }) {
        fir_name = label
      },

      disabledDate = (time: Date) => Date.now() < time.getTime();
    // const ta: timeS[] = await (await http.get('timeS')).data.map((data: timeS) => ({ id: data.id + 1, car: data.car, timeStart: new Date(data.timeStart + 86400000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.'), timeEnd: new Date(data.timeEnd + 86400000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.') }))
    // const tableData = reactive<timeS[]>(ta)
    // let fiterData = computed(
    //   () => tableData.filter(data => !search.value || data.car.toLowerCase().includes(search.value.toLowerCase()))
    // );
    let fir_name = '',mainDate:fireP
    defineExpose({
      timePicker
    })
    return {
      // tableData,
      processingLocus,
      disabledDate,
      changeRangTime,
      select,
      // fiterData,
      listFire,
      timeCross,
      timePicker,
      fireNo,
      search,
      hasDate,
      zhCn,
    }
  }
})
</script>

<style scoped>
.table {
  width: 43vw;
  height: 51vh;
  z-index: 300;
  top: 14vh;
  position: absolute;
  left: 9vw;
  background: #0088ff85;
  padding: 15px;
  border-radius: 14px;
}
.confirm {
  position: absolute;
  left: 21vw;
  bottom: 1vh;
}
.thisCl {
  right: -10px;
  top: -12px;
}
</style>
<style>
TODO.el-input__inner.el-range-editor.el-range-editor--small.rangTime {
  width: 9vw;
  height: 11vh;
  display: grid;
  /* margin-right: 1px; */
  justify-items: center;
  align-items: center;
  position: relative;
  left: 35px;
}
.el-input__inner.el-range-editor.el-range-editor--small.rangTime {
  position: relative;
  left: 0vw;
  top: 7vh;
}
.el-picker__popper.el-popper[role="tooltip"] {
  transform: scale(0.6);
  top: 19vh !important;
}
.el-input.el-input--small.el-date-range-picker__editor {
    width: 7.6vw;
}
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