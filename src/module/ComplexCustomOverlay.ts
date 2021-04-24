//@ts-ignore
export default class ComplexCustomOverlay extends BMap.Overlay {
  private _point: any;
  private _text: string;
  private _overText: string;
  //@ts-ignore
  private _map!: BaiduMap;
  private _div!: HTMLDivElement;
  private _span!: HTMLSpanElement;
  private _arrow!: HTMLDivElement;
  //@ts-ignore
  constructor(point: Point, text: string, mouseoverText: string,) {
    super()
    this._point = point;
    this._text = text;
    this._overText = mouseoverText;
  }
  initialize(map: any) {
    this._map = map;
    let div = this._div = document.createElement("div")
    div.style.position = "absolute";
    //@ts-ignore
    div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
    div.style.backgroundColor = "#EE5D5B";
    div.style.border = "1px solid #BC3B3A";
    div.style.color = "white";
    div.style.height = "18px";
    div.style.padding = "2px";
    div.style.lineHeight = "18px";
    div.style.whiteSpace = "nowrap";
    //@ts-ignore
    div.style.MozUserSelect = "none";
    div.style.fontSize = "12px"
    let span = this._span = document.createElement("span");
    div.appendChild(span);
    span.appendChild(document.createTextNode(this._text));
    let that = this, arrow = this._arrow = document.createElement("div");
    arrow.style.background = "url(label.png) no-repeat";
    arrow.style.position = "absolute";
    arrow.style.width = "11px";
    arrow.style.height = "10px";
    arrow.style.top = "22px";
    arrow.style.left = "10px";
    arrow.style.overflow = "hidden";
    div.appendChild(arrow);
    div.onmouseover = function () {
      (this as HTMLDivElement).style.backgroundColor = "#6BADCA";
      (this as HTMLDivElement).style.borderColor = "#0000ff";
      that._span.innerHTML = that._overText;
      arrow.style.backgroundPosition = "0px -20px";
    }

    div.onmouseout = function () {
      (this as HTMLDivElement).style.backgroundColor = "#EE5D5B";
      (this as HTMLDivElement).style.borderColor = "#BC3B3A";
      that._span.innerHTML = that._text;
      arrow.style.backgroundPosition = "0px 0px";
    }
    this._map.getPanes().labelPane.appendChild(div);
  }
  draw() {
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
    this._div.style.top = pixel.y - 30 + "px";
  }
}