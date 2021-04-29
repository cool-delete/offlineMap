<!-- 地图展示 -->
<template>
  <div style="width: 99vw; height: 95vh">
    <navgate
      :cars="(cars)"
      @focusAll="focusAll()"
      @setPositions="setView($event, 'setMapView')"
      @showHistoryCar="showHistoryCar($event)"
    ></navgate>
    <controlPlayback
      v-if="isControlPlayback"
      :historylocu="history"
      @move="movePoints"
      @close="outView"
    ></controlPlayback>
    <Suspense v-if="isToDisplayMapLS">
      <template #default>
        <historicalRecord
          @close="isToDisplayMapLS = !isToDisplayMapLS"
          :car="currentTrack.name"
          @showHistoryCar="trackShows($event)"
        ></historicalRecord>
      </template>
      <template #fallback>
        <div class="loading"></div>
      </template>
    </Suspense>
    <div id="allmap"></div>
  </div>
</template>

<script lang="ts" >
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
declare const BMap: any, BMAP_NORMAL_MAP: string, BMAP_SATELLITE_MAP: string, BMAP_HYBRID_MAP: string
import { car, history } from "car"
import ComplexCustomOverlay from "@m/ComplexCustomOverlay";
// import ComplexCustomOverlay from "../module/ComplexCustomOverlay";
import { debounce, cloneDeep } from "lodash";
import carICon from "@/assets/car.png";
import navgate from "@/components/navgate.vue";
import controlPlayback from "@/components/controlPlayback.vue";
import { defineAsyncComponent, defineComponent } from "vue";
export default defineComponent({
  //import引入的组件需要注入到对象中才能使用
  components: {
    navgate,
    controlPlayback,
    historicalRecord: defineAsyncComponent(
      () => import("@/components/historicalRecord.vue"),
    ),
  },
  data() {
    //这里存放数据
    let cars: car[] = [{
      identificationCode: "粤A66666",
      superiorDepartments: "警务处",
      higherUnit: "广州巡逻",
      state: "巡逻",
      trackPoints: Array(500)
        .fill(0)
        .map((_, i) => {
          return {
            lng: 113.336251 - i * 0.00005,
            lat: 23.107998 - i * 0.00005,
          };
        }),
      position: {
        lng: 113.336251,
        lat: 23.107998,
        icar: { point: {} },
      },
    },
    {
      identificationCode: "粤A1236",
      superiorDepartments: "警务处",
      higherUnit: "广州巡逻",
      state: "待机",
      trackPoints: [],
      position: {
        lng: 113.336251,
        lat: 23.107998,
        icar: { point: {} },
      },
    }
    ],
      history: history[] = [],
      historyP: any = {},
      historyCar: any = {},
      historyPLine: any = {}
    return {
      history,
      historyP,
      historyCar,
      historyPLine,
      isToDisplayMapLS: false,
      isControlPlayback: false,
      currentTrack: {
        name: '',
        history: [{
          time: Number,
          lng: Number,
          lat: Number,
        }]
      }, cars,
      map: {
        setViewport: (_: Array<Object>) => { },
        setCenter: (d: any) => { },
        removeOverlay: (d: any) => { },
        addOverlay: (_: any) => _
      },


      currentRadius: 100,
      alarmRange: 150,
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    outView() {
      this.map.removeOverlay(this.historyPLine)
      this.map.removeOverlay(this.historyCar)
      this.isControlPlayback = !this.isControlPlayback
    },
    movePoints(i: number) {
      let that = this.history[i]
      const { lng, lat } = that
      this.historyP.lng = lng
      this.historyP.lat = lat
      // console.log(this.historyP);
      this.historyCar.setPosition(this.historyP)
      this.map.setCenter(this.historyP);
    },
    trackShows(history: history[]) {
      this.history = history
      console.log(history);
      this.isControlPlayback = !this.isControlPlayback
      const arrP = history.map(h => {
        let p = cloneDeep<history>(this.historyP)
        p.lng = h.lng
        p.lat = h.lat
        return p
      })
      const pl = new BMap.Polyline(arrP, { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5 })
      let OneCar = new BMap.Marker(
        arrP[0],
        {
          icon: new BMap.Icon(carICon, new BMap.Size(52, 26)),
        }
      );
      let lebal = new BMap.Label(history[0].car, {
        offset: new BMap.Size(10, -30),
      });
      OneCar.setLabel(lebal);
      this.historyPLine = pl
      this.historyCar = OneCar
      this.map.addOverlay(pl)
      this.map.addOverlay(OneCar)
    },
    showHistoryCar(car: string) {
      this.isToDisplayMapLS = !this.isToDisplayMapLS
      this.currentTrack.name = car
    },
    focusAll() {
      this.map.setViewport(this.cars.map((car) => car.position!.icar!.point));
    },
    setView(pos: any, define: string) {
      console.log(pos.car);
      this.map.setCenter(pos.icar.point);
    },
    initMap() {
      // 百度地图API功能
      let map = (this.map = new BMap.Map("allmap")); // 创建Map实例
      const currentPoint = new BMap.Point(113.336251, 23.107998);
      map.centerAndZoom(currentPoint, 19); // 初始化地图,设置中心点坐标和地图级别
      //添加地图类型控件
      this.historyP = new BMap.Point(113.336251, 23.107998)
      map.addControl(
        new (BMap as any).MapTypeControl({
          mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP],
        })
      );
      //离线不支持
      // map.setCurrentCity("北京"); // 设置地图显示的城市 此项是必须设置的
      map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放

      let circle = new BMap.Circle(currentPoint, this.currentRadius, {
        strokeColor: "blue",
        strokeWeight: 2,
        strokeOpacity: 0.4,
      }); //创建圆
      //绘制
      let txt = "广州珠江帝景电子围栏 现有",
        mouseoverTxt = txt + " " + 1 + "车辆";

      const electronicFence = new ComplexCustomOverlay(
        currentPoint,
        "电子围栏",
        mouseoverTxt
      );
      map.addOverlay(electronicFence);
      map.addOverlay(circle);
      this.move(this.cars[0], this.cars[0].trackPoints)(1);
      setTimeout(function() {
        // layer.msg("鼠标滚轮缩放", { offset: "b" });
      }, 1000);
    },
    move(car: any, trackPoints: {
      lng: number
      , lat: number
    }[] = []) {
      if (!trackPoints.length) return (_: any) => _;
      return function() {
        let t: NodeJS.Timeout,
          o = 0;
        t = setInterval(() => {
          if (o === trackPoints.length - 1) clearInterval(t);
          const p = trackPoints[o];
          car.position.lng = p.lng;
          car.position.lat = p.lat;
          o++;
        }, 200);
      };
    },
    initializesVehicleDisplay(cars: any[]) {
      // offset = 0;
      cars.forEach((car) => {
        let OneCar = new BMap.Marker(
          new BMap.Point(car.position.lng, car.position.lat),
          {
            icon: new BMap.Icon(carICon, new BMap.Size(52, 26)),
          }
        );
        let lebal = new BMap.Label(car.state, {
          offset: new BMap.Size(10, -30),
        });
        OneCar.setLabel(lebal);
        OneCar.setTitle(car.identificationCode);
        car.position.icar = OneCar;
        this.map.addOverlay(OneCar);
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    let draw = debounce((point) =>
      point.icar.setPosition(new BMap.Point(point.lng, point.lat)), 10,
    );
    this.cars.forEach((car) => {
      let handle = {
        set: function(obj: object, prop: PropertyKey, value: any) {
          let res = Reflect.set(obj, prop, value);
          if (prop === "icar") return res;
          draw(obj);
          return true;
        },
      };
      (car.position as object) = new Proxy(car.position, handle);
    });
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.initMap();
    this.initializesVehicleDisplay(this.cars);
  },
  beforeCreate() { }, //生命周期 - 创建之前
  beforeMount() { }, //生命周期 - 挂载之前
  beforeUpdate() { }, //生命周期 - 更新之前
  updated() { }, //生命周期 - 更新之后
  beforeUnmount() { }, //生命周期 - 销毁之前
  unmounted() { }, //生命周期 - 销毁完成
  activated() { }, //如果页面有keep-alive缓存功能，这个函数会触发
})
</script>
<style  scoped>
/* @import url('../../lib/DrawingManager_min.css'); 引入公共css类 */
#allmap {
  width: 99.4vw;
  height: 98.9vh;
  overflow: hidden;
  margin-top: 1vh;
  font-family: "微软雅黑";
  position: fixed !important;
  top: 0rem;
}
</style>
