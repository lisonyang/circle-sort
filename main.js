let canvas = document.getElementById("canvasOne");
let context = canvas.getContext("2d");
let circles = []
  //圆的数量
let count = 6

//生成随机半径的圆
function getCircles() {
  for (let i = 0, len = count; i < len; i++) {
    circles.push({
      radius: 20 + 50 * Math.random()
    })
  }
}
//主进程函数
class Processor {
  constructor({
    data,
    screen
  }) {
    //输入圆半径大小信息
    this.data = data
      //保存最终符合条件的点
    this.retData = []
      //限制区域
    this.screen = screen
      //添加间距
    this.spacing = 10
      //初始点，第一个圆的坐标
    this.initPos = { x: screen.width / 2, y: screen.height / 2 }
      //执行
    this.setPos();
  }
  getData() {
      return this.retData;
    }
    //判断是否在区域内
  checkBeyond(point) {
      let screen = this.screen
      let min = point.radius + this.spacing
      return point.x > min && point.x + min < screen.width && point.y > min && point.y + min < screen.height
    }
    //判断是否不相交
  checkIntersect(point, point2, retDis = false) {
      let [dx, dy] = [point.x - point2.x, point.y - point2.y]
      let d = Math.sqrt(dx * dx + dy * dy)
      if (retDis) {
        return d
      } else {
        return point.radius + point2.radius < d
      }
    }
    //在符合与point不相交条件的圆曲线上随机取一个点
  getRadiusRandomPos(e, point) {
      let [radians, radius, passCount] = [Math.random() * Math.PI * 2, point.radius + e.radius + this.spacing, 0]
      e.x = point.x + radius * Math.cos(radians)
      e.y = point.y + radius * Math.sin(radians)
        //遍历已知的点
      for (let i = 0, len = this.retData.length; i < len; i++) {
        let tpos = this.retData[i]
        if (this.checkBeyond(e) && this.checkIntersect(e, tpos)) {
          passCount++;
        }
      }
      //判断是否和所有已知点不重叠且不超出区域
      if (passCount == this.retData.length) {
        return e;
      } else {
        //递归 需注意return
        return this.getRadiusRandomPos(e, point)
      }
    }
    //求出所有已知圆的大圆的所有交点
  getIntersectionPos(point) {
      let radius = point.radius + this.spacing
      let [arr, arrTemp] = [this.retData, []];
      //对已知圆求出大圆上两两相交的所有交点
      for (let i = 0; i < arr.length; i++) {
        let p1 = arr[i]
        for (let j = i + 1; j < arr.length; j++) {
          let p2 = arr[j];
          let tpos = intersection(p1.x, p1.y, p1.radius + radius, p2.x, p2.y, p2.radius + radius)
          if (tpos) {
            arrTemp.push({ x: tpos[0], y: tpos[2], radius: point.radius })
            arrTemp.push({ x: tpos[1], y: tpos[3], radius: point.radius })
          }
        }
      }
      return this.getFilterPos(arrTemp)
    }
    //过滤交点，retrun 不和任何圆相交的圆心且与p0圆心距离最近的点
  getFilterPos(arr) {
      let [last, ret] = [10000, {}];
      arr.forEach((e) => {
        if (this.checkBeyond(e)) {
          let passCount = 0;
          for (let i = 0, len = this.retData.length; i < len; i++) {
            let tpos = this.retData[i]
            if (this.checkIntersect(e, tpos)) {
              passCount++;
            }
          }
          if (passCount == this.retData.length) {
            let d = this.checkIntersect(this.initPos, e, true)
            if (d <= last) {
              ret = e;
              last = d
            }
          }
        }
      })
      return ret
    }
    //执行设置点
  setPos() {
    this.data.map((e, i) => {
      let pos = {}
        //初始化第一个点
      if (i == 0) {
        pos = Object.assign(e, { x: this.initPos.x, y: this.initPos.y })
      } else if (i == 1) {
        // 随意第二个圆
        pos = this.getRadiusRandomPos(e, this.retData[i - 1])
      } else {
        // 根据交点求第n>2个点
        pos = this.getIntersectionPos(e)
      }
      this.retData.push(pos)
    })
  }
}

init();

function init() {
  getCircles()
  let Circle = new Processor({
    data: circles,
    screen: { width: 500, height: 500 }
  });
  circles = Circle.getData()
  console.log(circles);
  drawScreen();
}

function drawArc(opt = {}) {
  if (opt.stroke || opt.strokeStyle) {
    context.strokeStyle = opt.strokeStyle || 'red';
  } else {
    context.fillStyle = opt.fillStyle || '#000000';
  }
  context.beginPath();
  context.arc(opt.x, opt.y, opt.radius, 0, Math.PI * 2, true);
  context.closePath();
  if (opt.stroke) {
    context.stroke()
  } else {
    context.fill();
  }
  if (typeof opt.index !== 'undefined') {
    let len = String(opt.index).length
    context.font = '20px Arial';
    context.fillStyle = 'red';
    context.fillText(opt.index, opt.x - len * 20 / 4, opt.y + len * 20 / 4);
  }
}

function draw() {
  circles.forEach((e, i) => {
    drawArc({
      x: e.x,
      y: e.y,
      radius: e.radius,
      stroke: true,
      index: i
    })
  })
}

function drawScreen() {
  // requestAnimationFrame(drawScreen)
  // drawBG()
  draw()
    // testIntersection()
}

function drawBG() {
  context.fillStyle = '#888888';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#000000';
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
}

//交点公式测试模块
function testIntersection(point = {}, point2 = {}) {
  drawArc({
    x: point.x,
    y: point.y,
    radius: point.radius,
    index: 1,
    stroke: true,
  })

  drawArc({
    x: point2.x,
    y: point2.y,
    radius: point2.radius,
    index: 0,
    stroke: true,
  })
  let intersectionPos = intersection(point.x, point.y, point.radius, point2.x, point2.y, point2.radius)
  drawArc({
    x: intersectionPos[0],
    y: intersectionPos[2],
    radius: 2,
  })
  drawArc({
    x: intersectionPos[1],
    y: intersectionPos[3],
    radius: 2,
  })
}
//求两圆交点公式
function intersection(x0, y0, r0, x1, y1, r1) {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;
  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  dx = x1 - x0;
  dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  d = Math.sqrt((dy * dy) + (dx * dx));

  /* Check for solvability. */
  if (d > (r0 + r1)) {
    /* no solution. circles do not intersect. */
    return false;
  }
  if (d < Math.abs(r0 - r1)) {
    /* no solution. one circle is contained in the other */
    return false;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.
   */

  /* Determine the distance from point 0 to point 2. */
  a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);

  /* Determine the coordinates of point 2. */
  x2 = x0 + (dx * a / d);
  y2 = y0 + (dy * a / d);

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  h = Math.sqrt((r0 * r0) - (a * a));

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  rx = -dy * (h / d);
  ry = dx * (h / d);

  /* Determine the absolute intersection points. */
  var xi = x2 + rx;
  var xi_prime = x2 - rx;
  var yi = y2 + ry;
  var yi_prime = y2 - ry;
  return [xi, xi_prime, yi, yi_prime];
}
