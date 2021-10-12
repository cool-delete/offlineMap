
//TODO #1 可以尝试转tsx格式
//TODO #3 引入百度api,js
//TODO #5  显示地图
//TODO #6 制成路书
<template>
  <div class="login">
    <div class="login-box" v-if="!logined">
      <span>欢迎登录</span>
      <el-input v-model="userName" :placeholder="userH" @blur="inputToComplete"></el-input>
      <el-input v-model="password" placeholder="密码"></el-input>
      <select-tree
        v-model="c_n_select"
        :data="comList"
        :value="c_n_select"
        class="query-select"
        @change="c_n_change"
      >
        <template #suffix>
          <i class="el-icon-position el-input__icon down" @click="login"></i>
        </template>
      </select-tree>
    </div>
    <HelloWorld v-else msg="Hello Vue 3.0 + Vite"></HelloWorld>
  </div>
</template>

<script lang="ts">
import SelectTree from './until/SelectTree.vue'
import HelloWorld from './components/HelloWorld.vue'
import { computed, onMounted, reactive, ref, } from "vue";
import { http } from "@/until/request";
import { IControl,User } from "car";
import { ctrolMap } from "@/until/cotrol";
import { useCookie } from 'vue-cookie-next'
// import { t } from 'element-plus/lib/locale';
export default {
  name: 'App',
  components: {
    HelloWorld, SelectTree
  },
  setup() {
    const cookie = useCookie()
    const login = async () => {
      function chartAtPre(LcStr: string) {
        return String.fromCharCode(LcStr.charCodeAt(0) - 1)
      }
      function chartAtRe(LcStr: string) {
        return String.fromCharCode(LcStr.charCodeAt(0) + 1)
      }
      function pasr(Str: string) {
        // let LcStr;//='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

        let StrLen,
          LcStrValue, LtStrValue,
          LcStr = Str.trim().toUpperCase();
        StrLen = LcStr.length;
        LcStrValue = '';
        LtStrValue = '';
        for (let I = 0; I < StrLen; I++) {
          LcStrValue = LcStrValue + LcStr[I];
          if (I % 2 == 0) { LcStrValue = LcStrValue + chartAtRe(LcStr[I]) } else { LcStrValue = LcStrValue + chartAtPre(LcStr[I]) };
        }
        for (let I = LcStrValue.length - 1; !(I < 0); I--) {
          LtStrValue = LtStrValue + LcStrValue[I];
        }
        return LtStrValue;
      }
    
      const user = (await http.post<{ sets: User[] }>("/db/login", { userName: userName.value, password: pasr(password.value), comNo: comNo })).data.sets[0];

      if (!user) {
        userName.value = "";
        password.value = "";
        userH.value = "用户名或密码错误!"
        return
      };
      user.filterPower = {}
      user.power.forEach(item => {
        const orNull = ctrolMap[item.run_no.trim()]
        if (!orNull) return
        user.filterPower[orNull] = orNull
      })
      cookie.setCookie("user", user);

      logined.value = true;


    }, inputToComplete = async () => {
      await http.get<{ sets: { com_name: string, com_no: string, com_parent: string }[] }>("/db/loginDepart", { params: { userName: userName.value } }).then(({ data: { sets } }) => {
        sets = toTree(sets);
        comList.value = sets;
      })
    }, c_n_change = (val: any) => {
      comNo = val
    }, toTree = (list: { com_name: string, com_no: string, com_parent: string, children?: [] }[]) => {
      const tree: { com_name: string, com_no: string, com_parent: string }[] = [], map: { [key: string]: { com_name: string, com_no: string, com_parent: string } } = {};
      let node: { com_name: string, com_no: string, com_parent: string, children?: { com_name: string, com_no: string, com_parent: string, children?: [] }[] }
      list.forEach((item) => {
        map[item.com_no] = item;
        item.children = [];
      })
      list.forEach((item) => {
        if (item.com_parent && (node = map[item.com_parent]))
          node.children!.push(item);
        else
          tree.push(item);
      })
      return tree;
    }, logined = ref(!!cookie.getCookie("user")), userName = ref(""), password = ref(""), com_name = ref(""), c_n_select = ref(""), comList = ref<{ com_name: string, com_no: string }[]>([]), userH = ref("请输入用户名");


    onMounted(() => {
      if (logined.value) return
      const span = document.querySelector('.el-input__icon.down');
      span!.parentElement!.parentElement!.style.transitionDelay = '0s'
      span!.parentElement!.parentElement!.classList.add('down')
      span!.parentElement!.classList.add('clors')
    })
    let comNo = ''
    return {
      logined,
      login,
      com_name,
      comList,
      c_n_select,
      c_n_change,
      inputToComplete,
      password,
      userH,
      userName,
    }
  }
}
</script>
<style lang="css">
.login {
  height: 98vh;
  width: 99vw;
  position: relative;
}

.select-tree {
  height: auto;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  padding: 0;
}
span.el-input__suffix.down {
  top: 111px;
  position: fixed;
}
.clors {
  background-color: #01d0ff;
  border-radius: 54px;
  color: #ffffff;
  content: " ";
}
.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 13vw;
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
.mynotify {
  position: absolute;
  left: 4vw;
  top: 2vh;
  cursor: pointer;
}
</style>
