<!-- 地图展示 -->
<template>
  <div style="width: 99vw; height: 95vh">
    <navgate
      :cars="(cars)"
      @focusAll="focusAll()"
      @setPositions="setView($event, 'setMapView')"
      @showHistoryCar="showHistoryCar($event)"
      @tracking="onTrackingView($event, '')"
      @path="onPathView($event, '')"
      @startTracking="startTracking"
      @outTracking="outTracking"
      @goFenceSetting="isFenceSetting = !isFenceSetting"
      ref="navgate"
    ></navgate>
    <controlPlayback
      v-if="isControlPlayback"
      :historylocu="history"
      @move="movePoints"
      @close="outView"
    ></controlPlayback>
    <FenceSetting
      v-if="isFenceSetting"
      @close="rollback"
      :map="map"
      @resetArea="resetArea"
      @forceUpdate="resetArea('u');"
      ref="FenceSetting"
    ></FenceSetting>
    <Suspense v-if="isToDisplayMapLS">
      <template #default>
        <historicalRecord
          @close="isToDisplayMapLS = !isToDisplayMapLS"
          :car="currentTrack.name"
          @showHistoryCar="historyShows($event)"
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
declare const BMap: any, BMAP_NORMAL_MAP: string, BMAP_SATELLITE_MAP: string,
  BMAP_HYBRID_MAP: string, BMAP_DRAWING_POLYGON: string, BMAP_DRAWING_CIRCLE: string
import { car, history } from "car"
import ComplexCustomOverlay from "@m/ComplexCustomOverlay";
import Fence from "@m/aFence/Fence";
// import ComplexCustomOverlay from "../module/ComplexCustomOverlay";
import { debounce, cloneDeep } from "lodash";
import carICon from "@/assets/car.png";
import WorkerIsPolyIn from '@m/WorkerIsPolyIn?worker'
import request from '@/until/request';
import navgate from "@/components/navgate.vue";
import FenceSetting, { drawPolnly } from "@/components/FenceSetting.vue";
import controlPlayback from "@/components/controlPlayback.vue";
import { defineAsyncComponent, defineComponent, ref } from "vue";
import { http } from "@/until/request";
import { t } from "element-plus/lib/locale";
export default defineComponent({
  //import引入的组件需要注入到对象中才能使用
  components: {
    navgate,
    controlPlayback,
    FenceSetting,
    historicalRecord: defineAsyncComponent(
      () => import("@/components/historicalRecord.vue"),
    ),
  },
  data() {
    //这里存放数据
    let cars: car[] = [{
      identificationCode: "HK01",
      superiorDepartments: "警务处",
      higherUnit: "广州巡逻",
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
        icar: { point: {}, tracking: false },
      },
    },
    {
      identificationCode: "HK02",
      superiorDepartments: "警务处",
      higherUnit: "广州巡逻",
      trackPoints: [],
      position: {
        lng: 113.336251,
        lat: 23.107998,
        icar: { point: {}, tracking: false },
      },
    }
    ],
      history: history[] = [],
      trackingLine: any = {},
      planToBounds: any = {},
      trackingPath: any[] = [],
      historyP: any = {},
      mainLayer: any = {},
      historyCar: any = {},
      historyPLine: any = {},
      needToCompute = true,
      navgate = ref<HTMLElement>(),
      FenceSetting = ref<HTMLElement>()
    return {
      navgate,
      FenceSetting,
      history,
      historyP,
      historyCar,
      planToBounds,
      trackingLine,
      needToCompute,
      trackingPath,
      historyPLine,
      isToDisplayMapLS: false,
      isFenceSetting: false,
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
        panTo: (d: any) => { },
        getBounds: () => ({}),
        addEventListener: (d: string, e: Function) => { },
        removeEventListener: (d: string, e: Function) => { },
        addOverlay: (_: any) => _
      },


      currentRadius: 100,
      mainLayer,
      alarmRange: 150,
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    testPoint(p: any): boolean {
      return this.planToBounds.containsPoint(p)
    },
    FenceSetting(): void {
      new Fence(this.map, { strokeColor: "blue" }, BMAP_DRAWING_POLYGON)
    },
    resetArea(s?: string): void {
      this.mainLayer.getMap().removeOverlay(this.mainLayer)
      this.needToCompute = false
      if (s) {
        //@ts-ignore
        (!this.initMap()) && this.initializesVehicleDisplay(this.cars)
        this.outView()
        this.needToCompute = true
        let e = setInterval(() => { }, 0)
        for (let i = 0; e - i > 0; i++) {
          clearInterval(i)

        }
      }
    },
    rollback(overlays: any): void {
      this.mainLayer.getMap().addOverlay(this.mainLayer)
      this.outView()
      this.map.removeOverlay(overlays)
    },
    setBounds(): void {
      this.planToBounds = this.map.getBounds()
      let getNorthEast, getSouthWest
      getNorthEast = getSouthWest = this.planToBounds.getCenter()
      let { lng: swlng, lat: swlat } = this.planToBounds.getSouthWest() as { lng: number, lat: number }
      let { lng: nelng, lat: nelat } = this.planToBounds.getNorthEast() as { lng: number, lat: number }
      const zoom = 0.03, width = (nelng - swlng) * zoom,
        height = (nelat - swlat) * zoom
      swlng = swlng + width
      swlat = swlat + height
      nelng = nelng - width
      nelat = nelat - height
      getSouthWest.lng = swlng
      getSouthWest.lat = swlat
      getNorthEast.lng = nelng
      getNorthEast.lat = nelat
      this.planToBounds = new BMap.Bounds(getSouthWest, getNorthEast)
    },
    outTracking() {
      this.map.removeOverlay(this.trackingLine)
      this.trackingPath.length = 0
      this.map.removeEventListener('moveend', this.setBounds
      )
    },


    startTracking(p: any) {
      this.map.panTo(p)
      this.trackingLine = new BMap.Polyline([p], { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5 })
      this.map.addOverlay(this.trackingLine)
      this.setBounds()
      this.map.addEventListener('moveend', this.setBounds
      )
    },
    onTrackingView(pos: any, define: string) {
      if (!this.testPoint(pos))
        this.setBounds(), this.map.panTo(pos)
    },
    onPathView(pos: any, define: string) {
      this.trackingPath.push(pos)
      this.trackingLine.setPath(this.trackingPath)
    },
    outView() {
      this.map.removeOverlay(this.historyPLine)
      this.map.removeOverlay(this.historyCar)
      this.isControlPlayback = false
      this.isFenceSetting = false
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
    historyShows(history: history[]) {
      this.outView()
      this.history = history
      console.log(history);
      this.isControlPlayback = true
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
      this.map.panTo(pos.icar.point);
    },
    initMap() {
      // 百度地图API功能
      let map = (this.map = new BMap.Map("allmap")); // 创建Map实例
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


      //绘制
      interface Icity {
        name: string; // 城市名称
        type: string; // 城市编码
        polyin: [{ lat: number, lng: number }]; // 城市边界 

      }
      const styleFence = {
        strokeColor: "blue",
        strokeWeight: 2,
        strokeOpacity: 0.4,
      };
      // const areaType: Record<string, Icity> = {
      //   "polyin": { name: "多边形", type: "polyin" },
      // }
      http.get(`/city/calc`).then((res) => {
        const { data } = res, viewPoint: { lng: number, lat: number } = { lng: 119.666, lat: 25.107998 };
        let circle

        const { name } = data.currentRegion
        if (data.currentRegion.type !== "circle") {
          const { fenceData }: { fenceData: [{ lng: number, lat: number }] } = data
          const Ipoint: (fence: Icity["polyin"][0]) => [number, number] = fence => ([fence.lng, fence.lat])

          const po = fenceData.map(Ipoint)
          //@ts-ignore
          this.mainLayer = drawPolnly(po, map, styleFence)
          viewPoint.lng = this.mainLayer.getBounds().getCenter().lng
          viewPoint.lat = this.mainLayer.getBounds().getCenter().lat
        } else {
          const { fenceData }: { fenceData: { piont: { lng: number, lat: number }, radius: number } } = data
          const { lng, lat } = fenceData.piont, { radius } = fenceData
          viewPoint.lng = lng
          viewPoint.lat = lat
          this.currentRadius = radius
          this.mainLayer = new BMap.Circle(new BMap.Point(viewPoint.lng, viewPoint.lat), this.currentRadius, styleFence); //创建圆

        }
        const currentPoint = new BMap.Point(viewPoint.lng, viewPoint.lat);
        let txt = name,
          mouseoverTxt = txt + " " + 1 + "车辆";
        map.centerAndZoom(currentPoint, 14); // 初始化地图,设置中心点坐标和地图级别
        const electronicFence = new ComplexCustomOverlay(
          currentPoint,
          "电子围栏",
          mouseoverTxt
        );
        map.addOverlay(electronicFence);
        map.addOverlay(this.mainLayer);
        this.move(this.cars)();
        setTimeout(function () {
          // layer.msg("鼠标滚轮缩放", { offset: "b" });
        }, 1000);
      })
    },
    move(car: car[]) {
      const that = this
      return function () {
        let
          o = 0;
        car.forEach((c) => {
          setInterval(async () => {
            const p: car["position"] = (await http.post(`/db/query`, { fir_no: c.identificationCode }, {
              headers: { 'content-type': 'application/json' }
            }))["data"];
            c.position.lng = p.lng;
            c.position.lat = p.lat;
            o++;
          }, 10000);
        })
        that.calcIsPolyIn(car)
      }

    },
    calcIsPolyIn(car: car[]) {
      const carsB: any = []
      setInterval(async () => {
        if (!this.needToCompute) return
        carsB.length = 0
        this.cars.forEach((c) => {
          carsB.push({ id: c.identificationCode, lng: c.position.lng, lat: c.position.lat })
        })
        const worke = new WorkerIsPolyIn()
        carsB.state = -1
        carsB.add = request.baseURL
        worke.postMessage(carsB)


        worke.onmessage = (e: any) => {
          if (e.data.state) {
            worke.postMessage((carsB.state = 3, carsB))
            return
          }

          worke.terminate()
          this.pointOutAlert(e.data)
        }
      }, 15000);

    },
    pointOutAlert(car: car[]) {

      console.log('警报', car);
      const notifonclick = (id: string) => {
        return (e: PointerEvent) => {
          if ((e.target as HTMLElement)!.className == "track") {
            const out = this.cars.filter(car => car.identificationCode === id)
            const outOne = out[0];

            // @ts-ignore
            this.$refs.navgate.tracking(outOne.position)


          }
        }
      }
      let notifyCreat = Promise.resolve()
      car.forEach((c) => {
        // @ts-ignore  
        notifyCreat = notifyCreat.then(this.$nextTick()).then(() =>
          // @ts-ignore  
          this.$notify({
            title: '警报',
            // duration: 0,
            onclick: notifonclick(c.identificationCode),
            dangerouslyUseHTMLString: true,
            message: `<i class="el-notification__icon el-icon-error mynotify"></i><span>发现${c.identificationCode}出界 可点击</span>
        <span class='track' >跟踪</span>
    
        `
          })
        )
      })


      // 
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
        // let lebal = new BMap.Label(car.state, {
        //   offset: new BMap.Size(10, -30),
        // });
        // OneCar.setLabel(lebal);
        OneCar.setTitle(car.identificationCode);
        car.position.icar = OneCar;
        this.map.addOverlay(OneCar);
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    let draw = (point: car['position']) =>
      point.icar.setPosition!(new BMap.Point(point.lng, point.lat))

    this.cars.forEach((car) => {
      let handle = {
        set: function (obj: car['position'], prop: PropertyKey, value: any) {
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
