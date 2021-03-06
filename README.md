---
title: circle
date: 2017-02-18 11:31:48
tags:
  - 算法运用
  - 随机位置
  - 平面几何
---

遗忘了一年的冲动，重拾。  

### 一个圆形随机位置排序的小DEMO

## 起因

项目需要制作一个在APP上的小游戏。  
游戏内容大概是，给出一条问题，和几个呈气泡形状的答案，戳破错误的气泡得分。

于是就有了这个需求：  __气泡根据内容自适应大小，在手机上随机位置显示，不得重叠和超出可视区域。__

![](http://7rylc6.com1.z0.glb.clouddn.com/o_1b97ku7ea1mkkb6q15s91hcn1ik59.png)  
*不符合需求事例(有重叠和超出)*

## 过程

所以我们把问题转化成代码思维：随机大小的圆，在给定面积的矩形区域内，随机分布且不相交。
再思考，就是求出满足条件的点，作为圆心。

思路一：  
随机每个圆的位置，把该位置与已有的圆进行重叠判断和可视区域边界判断，倘若重叠或超出边界，
再重新随机位置，直到找到一个不重叠且不超出边界的点为止。

思路二：  
根据__圆心距原理:当两圆心距大于两圆半径和即为相离(满足不重叠需求)__，我们可以先找出一个初始点P0画第一个圆，
再以P0为圆心，R为半径(R=r0+r1)画一个圆（统称大圆），从大圆曲线上随机取一点，作为第二个圆的圆心P1。同理可得所有圆心。
![](http://7rylc6.com1.z0.glb.clouddn.com/o_1b97vtv8g4ne1q5dl5lpnvo09e.png)

思路三：  
由于我们必须尽可能的利用有限区域，所以我们这时候需要__两圆相交定理:两圆相交必有一个或两个交点__，
我们利用思路二先画出两个圆，现在找第三个圆,分别已P0,P1作圆心，R0(r0+r3),R1(r1+r3)为半径画出两个大圆，求出其交点，该交点（1个或2个）就是我们第三个圆的圆心。之后的圆心同理，只要找出所有已知圆心的大圆的交点，并取和P0距离最短的交点，即是圆心Pn。
![](http://7rylc6.com1.z0.glb.clouddn.com/o_1b97vtt5i8u11b4qvgnhlatkm9.png)
---
__所需公式:__  

圆心距计算（两点之间距离公式）：![](http://7rylc6.com1.z0.glb.clouddn.com/o_1b97sf18mj5s1la0q1v83ljme9.jpg)

```js
 function checkIntersect(p0, p1) {
  let [dx, dy] = [p0.x - p1.x, p0.y - p1.y]
  return Math.sqrt(dx * dx + dy * dy)
}
```
圆的参数方程 x=a+r cosθ y=b+r sinθ（θ∈ [0,2π) ） (a,b) 为圆心坐标,r 为圆半径,θ 为参数,(x,y) 为经过点的坐标

```js
//思路二，随机大圆上的一个点作为第二个圆心
// e：第n个圆对象(未知位置)，point为第n-1个圆对象(已知位置)
function getRadiusRandomPos(e, point) {
  let [radians, radius] = [Math.random() * Math.PI * 2, point.radius + e.radius]
  e.x = point.x + radius * Math.cos(radians)
  e.y = point.y + radius * Math.sin(radians)
  return e;
}
```
__求两圆交点公式([详情参考](http://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci)):__
_需特别注意返回值写法（坑了我一小时）_
```js
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

```

实现思路[详细代码](https://github.com/lisonyang/circle-sort)
