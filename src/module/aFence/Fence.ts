declare const BMapLib: any,BMap:any, BMAP_DRAWING_POLYGON:string,BMAP_DRAWING_RECTANGLE:string, MAP_DRAWING_POLYGON:string, BMAP_DRAWING_CIRCLE: string
import type { pos } from 'car'
type styleI = {
  strokeColor?: string,    //边线颜色。
  fillColor?: string,      //填充颜色。当参数为空时，圆形将没有填充效果。
  strokeWeight?: number,       //边线的宽度，以像素为单位。
  strokeOpacity?: number,       //边线透明度，取值范围0 - 1。
  fillOpacity?: number,      //填充的透明度，取值范围0 - 1。
  strokeStyle?: 'solid'|"dashed" //边线的样式，solid或dashed。
}
export default class Fence {
  styleOptions :styleI= {
    strokeColor: "red",
    fillColor: "red",
    strokeWeight: 3,
    strokeOpacity: 0.8,
    fillOpacity: 0.6,
    strokeStyle: "solid"
  } 

  DrawingManager: any;
  //@ts-ignore
  constructor(map: any, o: styleI,fenceType =BMAP_DRAWING_POLYGON) {
    o.fillColor ??= this.styleOptions.fillColor
    o.fillOpacity ??= this.styleOptions.fillOpacity
    o.strokeColor ??= this.styleOptions.strokeColor
    o.strokeOpacity ??= this.styleOptions.strokeOpacity
    o.strokeStyle ??= this.styleOptions.strokeStyle
    o.strokeWeight ??= this.styleOptions.strokeWeight
    const opt = {
      // isOpen: true, //是否开启绘制模式
      enableDrawingTool: true, // 是否显示工具栏
      enableCalculate: true, // 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形) 
      drawingToolOptions: {
          enableTips: true,
          isOpen: false, //是否开启绘制模式
          customContainer: 'selectbox_Drawing',
          hasCustomStyle: true,
          offset: new BMap.Size(5, 5), // 偏离值
          scale: 1.0, // 工具栏缩放比例
          drawingModes: [
              // BMAP_DRAWING_RECTANGLE
              , BMAP_DRAWING_POLYGON
              // , BMAP_DRAWING_CIRCLE
          ]
      },
      enableSorption: true, // 是否开启边界吸附功能
      sorptionDistance: 20, // 边界吸附距离
      enableGpc: true, // 是否开启延边裁剪功能
      enbaleLimit: true,  // 是否开启超限提示
      limitOptions: {
          area: 50000000 // 面积超限值
      },
      circleOptions: this.styleOptions, // 圆的样式
      polylineOptions: this.styleOptions, // 线的样式
      polygonOptions: this.styleOptions, // 多边形的样式
      rectangleOptions: this.styleOptions, // 矩形的样式
      //labelOptions: labelOptions // label的样式
  }
    this.DrawingManager = new BMapLib.DrawingManager(map, opt)
  }


}