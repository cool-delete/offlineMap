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
    <span class="close" @click="$emit('close')" title="关闭工具"></span>
  </div>
</template>

<script  lang="ts">
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》'
declare const BMap: any, BMAP_DRAWING_POLYGON: string, BMAP_DRAWING_CIRCLE: string;
import Fence from "@/module/aFence/Fence";
import ComplexCustomOverlay from "@/module/ComplexCustomOverlay";
import { po } from "car";
import { on } from "node:events";
import { computed, defineComponent, getCurrentInstance, onMounted, onUnmounted, ref, watch } from "vue";
interface Icity {
  name: string; // 城市名称
  code: number; // 城市编码
}
interface Iprovinces extends Icity {
  children?: Icity[]; // 子级城市]
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
    let polygonSetting = ref(""), cityName = ref("");
    // @ts-ignore
    const { $http: http } = (getCurrentInstance()!.proxy), CIRCLE = BMAP_DRAWING_CIRCLE, POLYGON = BMAP_DRAWING_POLYGON;
    const drawF = new Fence(props.map, { strokeColor: "blue" }, BMAP_DRAWING_POLYGON);
    const querySearch = async (queryString: string, cb: Function) => {

      const citys: Iprovinces[] = (await http.get('\code'))["data"]
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
    const handleSelect = async (item: Icity) => {
      const { Collect } = (await http.get('cityCode/' + item.code))["data"]
      let coordinates: [[number, number]] = Collect["features"][0]["geometry"]["coordinates"][0][0]
      console.log(coordinates);
      const pos: po[] = []
      coordinates.forEach(item => {
        //滚他妈好吧 就两个属性 非要我构建一下 传个字面量他不好?
        pos.push(new BMap.Point(item[0], item[1]))
      })

      let prov_area = new BMap.Polyline(pos, { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5 });

      //@ts-ignore
      props.map.addOverlay(prov_area);
      //@ts-ignore
      props.map.panTo(pos[0])
    };
    watch(
      () => polygonSetting.value,
      (newValue, oldValue) => {
        if (!newValue && !drawF.DrawingManager.close()) return
        const dictionary = {
          [POLYGON]: POLYGON,
          [CIRCLE]: CIRCLE
        }
        console.log(dictionary[newValue],'此时值');

        drawF.DrawingManager.open()
        drawF.DrawingManager.setDrawingMode(dictionary[newValue])
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
      handleSelect
    }
  }
})
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
label.el-radio:last-child{
  margin-right: 8px;
}
</style>