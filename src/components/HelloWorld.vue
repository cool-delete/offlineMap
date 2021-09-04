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
    <FenceSetting v-if="isFenceSetting" @close="outView" :map="map"></FenceSetting>
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
import FenceSetting from "@/components/FenceSetting.vue";
import controlPlayback from "@/components/controlPlayback.vue";
import { defineAsyncComponent, defineComponent, ref, reactive, onMounted, } from "vue";
import { ElNotification } from 'element-plus';
import { http } from "@/until/request";
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
  setup(props, contxt) {

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
      historyCar: any = {},
      historyPLine: any = {},
      map: {
        setViewport: (_: Array<Object>) => {},
        setCenter: (d: any) => {},
        removeOverlay: (d: any) => {},
        panTo: (d: any) => {},
        getBounds: () => ({}),
        addEventListener: (d: string, e: Function) => {},
        removeEventListener: (d: string, e: Function) => {},
        addOverlay: (_: any) => {},
        centerAndZoom: (_: any, d: number) => {},
        addControl: (_: any) => {},
        enableScrollWheelZoom: (_: any) => {},

      }, // 创建Map实例,
      currentTrack = {
        name: '',
        history: [{
          time: Number,
          lng: Number,
          lat: Number,
        }]
      },
      isToDisplayMapLS = false,
      isFenceSetting = ref(false),
      isControlPlayback = false,
      currentRadius = 100,
      alarmRange = 150


    const testPoint = (p: any): boolean => {
      return planToBounds.containsPoint(p)
    },
      FenceSetting = (): void => {
        new Fence(map, { strokeColor: "blue" }, BMAP_DRAWING_POLYGON)
      },
      setBounds = (): void => {
        planToBounds = map.getBounds()
        let getNorthEast, getSouthWest
        getNorthEast = getSouthWest = planToBounds.getCenter()
        let { lng: swlng, lat: swlat } = planToBounds.getSouthWest() as { lng: number, lat: number }
        let { lng: nelng, lat: nelat } = planToBounds.getNorthEast() as { lng: number, lat: number }
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
        planToBounds = new BMap.Bounds(getSouthWest, getNorthEast)
      },
      outTracking = () => {
        map.removeOverlay(trackingLine)
        trackingPath.length = 0
        map.removeEventListener('moveend', setBounds
        )
      },


      startTracking = (p: any) => {
        map.panTo(p)
        trackingLine = new BMap.Polyline([p], { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5 })
        map.addOverlay(trackingLine)
        setBounds()
        map.addEventListener('moveend', setBounds
        )
      },
      onTrackingView = (pos: any, define: string) => {
        if (!testPoint(pos))
          setBounds(), map.panTo(pos)
      },
      onPathView = (pos: any, define: string) => {
        trackingPath.push(pos)
        trackingLine.setPath(trackingPath)
      },
      outView = () => {
        map.removeOverlay(historyPLine)
        map.removeOverlay(historyCar)
        isControlPlayback = false
        isFenceSetting.value = false
      },
      movePoints = (i: number) => {
        let that = history[i]
        const { lng, lat } = that
        historyP.lng = lng
        historyP.lat = lat
        // console.log(historyP);
        historyCar.setPosition(historyP)
        map.setCenter(historyP);
      },
      historyShows = (history: history[]) => {
        outView()
        history = history
        console.log(history);
        isControlPlayback = true
        const arrP = history.map(h => {
          let p = cloneDeep<history>(historyP)
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
        historyPLine = pl
        historyCar = OneCar
        map.addOverlay(pl)
        map.addOverlay(OneCar)
      },
      showHistoryCar = (car: string) => {
        isToDisplayMapLS = !isToDisplayMapLS
        currentTrack.name = car
      },
      focusAll = () => {
        map.setViewport(cars.map((car) => car.position!.icar!.point));
      },
      setView = (pos: any, define: string) => {
        console.log(pos.car);
        map.panTo(pos.icar.point);
      },
      initMap = () => {
        // 百度地图API功能
        map = (new BMap.Map("allmap"))
        const currentPoint = new BMap.Point(113.336251, 23.107998);
       setTimeout(()=>{
          map.centerAndZoom(currentPoint, 14); // 初始化地图,设置中心点坐标和地图级别
        //添加地图类型控件
        historyP = new BMap.Point(113.336251, 23.107998)
        map.addControl(
          new (BMap as any).MapTypeControl({
            mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP],
          })
        );
        //离线不支持
        // map.setCurrentCity("北京"); // 设置地图显示的城市 此项是必须设置的
        map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放

        let circle = new BMap.Circle(currentPoint, currentRadius, {
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
        move(cars)();
        setTimeout(function () {
          // layer.msg("鼠标滚轮缩放", { offset: "b" });
        }, 1000);
       },0)
      },
      move = (car: car[]) => {
        const that = this
        return function () {
          let t: NodeJS.Timeout,
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
          calcIsPolyIn(car)
        }

      },
      calcIsPolyIn = (car: car[]) => {
        const carsB: any = []
        setInterval(async () => {
          carsB.length = 0
          cars.forEach((c) => {
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

            pointOutAlert(e.data)
          }
        }, 15000);

      },
      pointOutAlert = (car: car[]) => {

        console.log('警报', car);
        const notifonclick = (id: string) => {
          return (e: PointerEvent) => {
            if ((e.target as HTMLElement)!.className == "track") {
              const out = cars.filter(car => car.identificationCode === id)
              // @ts-ignore
              navgate.setup(props, contxt).tracking(out[0].position)
            }
          }
        }

        const outNoif = ElNotification({
          title: '错误',
          // duration: 0,
          // @ts-ignore  
          onclick: notifonclick(car[0].identificationCode),
          dangerouslyUseHTMLString: true,
          message: `<i class="el-notification__icon el-icon-error mynotify"></i><span>发现${car[0].identificationCode}出界 可点击</span>
        <span class='track' >跟踪</span>
    
        `
        })


        // 
      },
      initializesVehicleDisplay = (cars: any[]) => {
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
          map.addOverlay(OneCar);
        });
      }
    let draw = (point: car['position']) =>
      point.icar.setPosition!(new BMap.Point(point.lng, point.lat))

    cars.forEach((car) => {
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
    initMap();
    initializesVehicleDisplay(cars);

    return {
      navgate: ref(null),
      history,
      historyP,
      historyCar,
      planToBounds,
      trackingLine,
      trackingPath,
      historyPLine,
      isToDisplayMapLS,
      isFenceSetting,
      isControlPlayback,
      currentTrack, cars,
      // @ts-ignore
      map,
      currentRadius,
      alarmRange,
      focusAll,
      setView,
      showHistoryCar,
      onTrackingView,


      onPathView,
      startTracking,
      outTracking,
      movePoints,
      outView,
      historyShows,
    }
  }

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
