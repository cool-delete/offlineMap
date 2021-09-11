<!--  -->
<template>
  <div class="FenceSetting">
    <el-radio-group v-model="polygonSetting">
      <el-radio :label="POLYGON">多边形</el-radio>
      <el-radio :label="CIRCLE">圆形</el-radio>
    </el-radio-group>
    <el-autocomplete
      class="inline-input"
      v-model="cityName"
      :fetch-suggestions="querySearch"
      placeholder="请输入内容"
      value-key="name"
      :trigger-on-focus="false"
      @select="handleSelect"
      @focus="polygonSetting = ''"
    ></el-autocomplete>
    <span class="close" @click="$emit('close', overlays)" title="关闭工具"></span>
  </div>
  <div class="guiFormFence" v-if="completeSubmitt">
    <div class="guiFormFence-title">报警区域设置</div>
    <div class="guiFormFence-content">
      <div class="guiFormFence-content-item">
        <el-input v-model="areaName" placeholder="区域名称"></el-input>
      </div>
      <div class="footer">
        <el-button @click="sendSetting(areaName)">保存</el-button>
        <el-button @click="$emit('close', overlays)">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script  lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
declare const BMap: any, BMAP_DRAWING_POLYGON: string, BMAP_DRAWING_CIRCLE: string;
import Fence from "@/module/aFence/Fence";
import ComplexCustomOverlay from "@/module/ComplexCustomOverlay";
import { po } from "car";
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from "vue";
interface Icity {
  name: string; // 城市名称
  code: number; // 城市编码
}
interface Iprovinces extends Icity {
  children?: Icity[]; // 子级城市]
}

const drawPolnly = (coordinates: [number, number][], map: any,style?:{}) => {

  const pos: po[] = [], outPutPolnly: po[] = [];
  coordinates.forEach(item => {
    //滚他妈好吧 就两个属性 非要我构建一下 传个字面量他不好?
    pos.push(new BMap.Point(item[0], item[1]));
    outPutPolnly.push({ lng: item[0], lat: item[1] });
  });

  let prov_area = new BMap.Polygon(pos, style);

  //@ts-ignore

  //@ts-ignore
  // map.panTo(pos[0]);
  prov_area["outPutPolnly"] = outPutPolnly;
  return prov_area;
}
export default defineComponent({
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    map: {
      required: true
    }
  },
  setup(props, context) {
    // 监控data中的数据变化
    let polygonSetting = ref(""), cityName = ref(""), areaName = ref(''), completeSubmitt = ref(false);
    // @ts-ignore
    const { $http: http } = (getCurrentInstance()!.proxy), CIRCLE = BMAP_DRAWING_CIRCLE, POLYGON = BMAP_DRAWING_POLYGON;
    const drawF = new Fence(props.map, { strokeColor: "blue" }, BMAP_DRAWING_POLYGON);
    const querySearch = async (queryString: string, cb: Function) => {

      const citys: Iprovinces[] = (await http.get('/city/code'))["data"]
      console.log(citys);
      const allMacro: Icity[] = [];
      let administrativeProvince: Icity[] = [];
      citys.forEach(city => {
        if (~city.name.indexOf(queryString)) {
          city.children ? (administrativeProvince = city.children) : cb([administrativeProvince = [city]]);
        } else {
          city.children && city.children.forEach(child => {
            if (~child.name.indexOf(queryString)) {
              allMacro.push(child);
            }
          })
        };
      })
      administrativeProvince.length && !cb(administrativeProvince) || cb(allMacro)
    };
    const getCoord = async (item: any) => {
      const { Collect } = (await http.post('/city/cityCode/', { city: item.code }))["data"]
      let coordinates: [[number, number]] = Collect["features"][0]["geometry"]["coordinates"][0][0]
      console.log(coordinates);
      //@ts-ignore
      context.emit('resetArea')
      const temp = drawPolnly(coordinates, props.map)
      //@ts-ignore
      props.map.addOverlay(temp);
      overlays.value = temp
      sendtPolnly = (temp.outPutPolnly);
      currentRegion.type = "city"
      completeSubmitt.value = true
    };

    let overlays = shallowRef({ getMap: () => ({ removeOverlay: (_: any) => _ }) })
    const overlaycomplete = function (e: any) {
      overlays.value.getMap().removeOverlay(overlays);
      overlays.value = (e.overlay);
      completeSubmitt.value = true
      currentRegion.type = e.drawingMode;
      if (e.drawingMode === POLYGON) {
        sendtPolnly.length = 0;
        e.overlay.na.map((item: po) => {
          const pont: po = { lng: item.lng, lat: item.lat };
          sendtPolnly.push(pont);
        })

        return
      }
      //圆形
      // debugger
      circle.piont.lng = e.overlay.point.lng;
      circle.piont.lat = e.overlay.point.lat;
      circle.radius = Math.round(e.overlay.Ca)
    };
    let sendtPolnly: po[] = [], circle: {
      piont: { lng: number, lat: number }
      radius: number
    } = { piont: { lng: 0, lat: 0 }, radius: 0 }, currentRegion: { name: string, type: string } = { name: "", type: "" };
    const sendSetting = async (name: string) => {
      currentRegion.name = name;
      const citySetting = () => sendtPolnly,
        circleSetting = () => circle,
        mapfunc: Record<string, Function> = {
          [POLYGON]: citySetting,
          "city": citySetting,
          [CIRCLE]: circleSetting,
        }

      const fenceData = mapfunc[currentRegion.type](), sendData = { currentRegion, fenceData }

      const state = (await http.post('/city/setting/',
        sendData

      )).data
      console.log('state', state);
      context.emit('forceUpdate')
    }
    watch(
      () => polygonSetting.value,
      (newValue, oldValue) => {
        if (!newValue && !drawF.DrawingManager.close()) return
        const dictionary = {
          [POLYGON]: POLYGON,
          [CIRCLE]: CIRCLE
        }
        console.log(dictionary[newValue], '此时值');
        //TODO: 是否显示对话框
        context.emit('resetArea')
        drawF.DrawingManager.open()
        drawF.DrawingManager.setDrawingMode(dictionary[newValue])
        drawF.DrawingManager.addEventListener('overlaycomplete', overlaycomplete);
      }),
      // 监听属性 类似于data概念
      // computed(),
      onMounted(async () => {


        // const ta = await (await http.get('lib/source/cityCode.json'))
        // console.log(ta);

      })
    onUnmounted(() => {
      drawF.DrawingManager.close()
    })

    return {
      polygonSetting,
      cityName,
      querySearch,
      CIRCLE,
      POLYGON,
      completeSubmitt,
      sendSetting,
      areaName,
      overlays,
      handleSelect: getCoord
    }
  }
})
export { drawPolnly }
</script>

<style   scoped>
.FenceSetting {
  width: 24vw;
  height: 6vh;
  margin: 0.5rem;
  background-color: #ffffff;
  border-radius: 3.33mm;
  position: absolute;
  left: 10vw;
  z-index: 3;
}
.guiFormFence {
  position: absolute;
  right: 5vw;
  top: 2vh;
  border-radius: 10px;
  background: #5cfd60;
  z-index: 3;
  width: 15vw;
  height: auto;
  padding: 7px;
}

.footer {
  padding-top: 11px;
  padding-bottom: 8px;
}
</style>
<style>
.el-input {
  width: 11vw;
  padding-top: 0.5rem;
}
div.BMapLib_Drawing_panel {
  /* 地图工具类 */
  display: none;
}
label.el-radio:last-child {
  margin-right: 8px;
}
</style>