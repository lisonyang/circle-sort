let canvas = document.getElementById("canvasOne");
let context = canvas.getContext("2d");
let circles = []
let count = 6

function getCircles() {
  for (let i = 0, len = count; i < len; i++) {
    circles.push({
      radius: 20 + 40 * Math.random()
    })
  }
}

class Processor {
  constructor({
    data,
    screen
  }) {
    this.data = data
    this.retData = []
    this.screen = screen
    this.spacing = 10
    this.initPos = { x: screen.width / 2, y: screen.height / 2 }
    this.setPos();
  }
  getData() {
    return this.retData;
  }
  checkBeyond(point) {
    let screen = this.screen
    let min = point.radius + this.spacing
    return point.x > min && point.x + min < screen.width && point.y > min && point.y + min < screen.height
  }
  checkIntersect(point, point2) {
    let [dx, dy] = [point.x - point2.x, point.y - point2.y]
    let d = Math.sqrt(dx * dx + dy * dy)
    return point.radius + point2.radius < d
  }
  getRadiusRandom(e, point) {
    let [radians, radius, passCount] = [Math.random() * Math.PI * 2, point.radius + e.radius + this.spacing, 0]
    e.x = point.x + radius * Math.cos(radians)
    e.y = point.y + radius * Math.sin(radians)

    for (let i = 0, len = this.retData.length; i < len; i++) {
      let tpos = this.retData[i]
      if (this.checkBeyond(e) && this.checkIntersect(e, tpos)) {
        passCount++;
      }
    }
    if (passCount == this.retData.length) {
      return e;
    } else {
      return this.getRadiusRandom(e, point)
    }
  }
  setPos() {
    this.data.map((e, i) => {
      let pos = {}
      if (i == 0) {
        pos = Object.assign(e, { x: this.initPos.x, y: this.initPos.y })
      } else {
        pos = this.getRadiusRandom(e, this.retData[i - 1])
      }
      // console.log(pos);
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
  if (opt.stroke) {
    context.strokeStyle = 'red';
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
      index: i
    })
  })
}

function drawScreen() {
  // requestAnimationFrame(drawScreen)
  drawBG()
  draw()
    // testIntersection()
}

function drawBG() {
  context.fillStyle = '#888888';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#000000';
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
}

function testIntersection() {
  drawArc({
    x: 100,
    y: 100,
    radius: 50,
    index: 1,
    stroke: true,
  })

  drawArc({
    x: 200,
    y: 200,
    radius: 100,
    index: 0,
    stroke: true,
  })
  let intersectionPos = intersection(100, 100, 50, 200, 200, 100)
  drawArc({
    x: intersectionPos[0],
    y: intersectionPos[1],
    radius: 2,
  })
  drawArc({
    x: intersectionPos[2],
    y: intersectionPos[3],
    radius: 2,
  })
}

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
