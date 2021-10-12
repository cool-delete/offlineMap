//TODO #10 优化UI关闭按钮
<template >
  <div class="table">
    <div class="input-group" :class="userChecked && `userInit`">
      <el-select v-model="userNo" placeholder="选择设置的用户" @change="selectUser" class="el-option">
        <el-option
          v-for="item in listUser"
          :key="item.user_no"
          :label="item.user_name"
          :value="{ value: item.user_no, label: item.user_name }"
        ></el-option>
      </el-select>
      <el-select
        v-model="selectComNo"
        placeholder="选择单位"
        @change="selectCom"
        class="el-option comInit"
        v-show="userChecked"
      >
        <el-option
          v-for="item in displayCom"
          :key="item.value"
          :label="item.label"
          :value="{ value: item.value, label: item.label }"
        ></el-option>
      </el-select>
    </div>
    <div class="Comtransfer" v-if="userNo.value && !selectComNo">
      <el-transfer
        v-model="hasComIndex"
        style="text-align: left; display: inline-block"
        :titles="['不可登陆', '可登陆']"
        :button-texts="['移除', '添加']"
        :render-content="renderFunc"
        :format="{
          noChecked: '${total}',
          hasChecked: '已选择: ${checked}/${total}',
        }"
        :data="allCom"
 
         @change="transferChange"
      ></el-transfer>
    </div>
    <div class="Powtransfer" v-if="comCheck">
      <el-transfer
        v-model="hasPowerIndex"
        style="text-align: left; display: inline-block"
        :titles="['可授权', '已有授权']"
        :button-texts="['移除', '添加']"
        :render-content="renderFunc"
        :format="{
          noChecked: '${total}',
          hasChecked: '已选择: ${checked}/${total}',
        }"
        :data="allPow"
         @change="transferChange"
      ></el-transfer>
    </div>
    <el-button class="confirm" type="primary" round>确认</el-button>
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
import { history, po, User, com } from "car";
import { http } from "@/until/request";
import SelectTree from '@/until/SelectTree.vue'
import { ctrolMap_key } from "@/until/cotrol";
import { indexOf } from "lodash";
export default defineComponent({
  components: {
    SelectTree
  },
  async setup(props, context) {
    // @ts-ignore
    interface fire { Fir_NO: string, Fir_Name: string, Com_No: string }
    interface fireP extends fire { points: po[] }
    type keyType = keyof typeof ctrolMap_key;
    const listUser = reactive((await http.post<{ sets: User[] }>("/db/user")).data.sets), fireNo = ref<{ value: "", label: '' }>({ value: "", label: '' }), comCheck = ref(false), timeCross = ref(''), timePicker = ref(null), userChecked = ref(false),
      allPow = reactive((Object.keys(ctrolMap_key)).map(
        i => ({
          key: i,
          label: ctrolMap_key[i as keyType].label
        })
      )),
      allCom = reactive((await http.post<{ sets: com[] }>("/db/com")).data.sets.map(
        i => ({
          key: i.com_no,
          label: i.com_name
        })
      )),
      hasPowerIndex = ref<string[]>([]),
      templateC = (await http.get<{ sets: com[] }>("/db/loginDepart", { params: { userName: 'admin', comNo: 'T' } })),
      hasComIndex = ref<string[]>([]),
      displayCom = reactive(templateC.data.sets.map(i => ({ value: i.com_no, label: i.com_name }))),


      selectComNo = ref(''),



      selectUser = async function ({ value }: { value: string, label: string }) {
        hasComIndex.value.length = 0;
        user_name = value
        selectComNo.value = ''
        userChecked.value = true
        comCheck.value = false
        let { sets } = (await http.get<{ sets: com[] }>("/db/loginDepart", { params: { userName: value } })).data
        sets.forEach(({ com_no }) => {
          const index = allCom.find(({ key: No }) => No === com_no)
          if (index) hasComIndex.value.push(index.key)
        })
      },
      selectCom = async function ({ value, label }: { value: string, label: string }) {
        hasPowerIndex.value.length = 0
        comCheck.value = true
        let { sets } = (await http.post<{ sets: { run_no: string }[] }>("/db/power", { userName: user_name, comNo: value })).data
        sets.forEach(({ run_no }) => {
          const index = allPow.find(({ key: No }) => No === run_no.trim())
          if (index) hasPowerIndex.value.push(index.key)
        })
      },
      transferChange = (va:any,ds:string,key:string[]) => {
        const rows: string[][] = [], 
        powerAdd = async (key: string[]) => {
          key.forEach(i => {
            const template = []
            template.push(i, user_name, selectComNo.value)
            rows.push(template)
          })
          const cul = ["run_no", "user_no", "com_no"], value = { sql: `insert into sys_power (${cul}) values ?`, arg: rows };
          await http.post<{ sets: com[] }>('/db/notSafeSql', value)
        }, 
        userCAdd = async (key: string[]) => {
          key.forEach(i => {
            i=`'${i}'`,user_name=`'${user_name}'`
            const template = []
            template.push(i, user_name)
            rows.push(template)
          })
          const cul = ["com_no", "user_no"], value = { sql: `insert into sys_userc (${cul}) values ${rows.map(i=>`(${i})`)} `, arg: rows };
          await http.post<{ sets: com[] }>('/db/notSafeSql', value)
        },
        removePower = async (key: string[]) => {
          key.forEach(i => {
            const template = []
            template.push(i, user_name, selectComNo.value)
            rows.push(template)
          })
          const value = { sql: `delete from sys_power where  and user_no = '${user_name}' and com_no ='${selectComNo.value}' and run_no in (${rows.map(i=>`'${i}'`)})` };
          await http.post<{ sets: com[] }>('/db/notSafeSql', value)

        },
        removeUserC = async (key: string[]) => {
          key.forEach(i => {
            const template = []
            template.push(  i)
            rows.push(template)
          })
          const cul = ["com_no", "user_no"], value = { sql: `delete from sys_userc where user_no = '${user_name}' and com_no in (${rows.map(it=>`'${it[0]}'`)}) `, arg: rows };
          await http.post<{ sets: com[] }>('/db/notSafeSql', value)
        }
        if (ds === 'right') {
          if (hasPowerIndex.value.length) {
            powerAdd(key)
          } else {
            userCAdd(key)
          }
        } else {
          if (hasPowerIndex.value.length) {
            removePower(key)
          } else {
            removeUserC(key)
          }
        }
        //{ direction: ds, movedKeys: key }: { direction: 'right' | 'left', movedKeys: string[] }
      }
      , renderFunc = (h: Function, { label }: { label: string }) => {
        return h('span', null, label)
      };



    let user_name = '', mainDate: fireP

    return {


      allPow, hasPowerIndex, allCom,
      hasComIndex, displayCom,
      // tableData,

      renderFunc,
      selectCom,
      selectUser,
      transferChange,
      selectComNo,
      // fiterData,
      listUser,
      timeCross,
      timePicker,
      userNo: fireNo,
      comCheck,
      userChecked,
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
.input-group {
  position: absolute;
  top: 24vh;
  left: 15.3vw;
  width: 14vw;
  height: 10vh;
  z-index: 300;
  transform: scale(2);
  transition-duration: 0.3s;
}
.el-option {
  width: 10vw;
}
.userInit {
  top: 3vh;
  left: 15.3vw;
  transform: scale(1);
}
.Powtransfer {
  position: absolute;
  left: 6vw;
  top: 9vh;
}
.Comtransfer {
  position: absolute;
  left: 6vw;
  top: 7vh;
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