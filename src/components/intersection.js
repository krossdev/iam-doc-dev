// 1. https://github.com/MGasztold/RectanglePrison
// 2. http://www.cnblogs.com/worldFulcrum/p/5573927.html
 
var log = console.log
log = function() {}
function computeIntersection(rect, angleDeg, x0, y0, shape) {
  var angle = (180.0 - angleDeg) * Math.PI / 180.0
  // first compute the linear function coefficients:
  var a = Math.cos(angle) / Math.sin(angle)
  var b = y0 - x0 * (Math.cos(angle) / Math.sin(angle))
  log('Line equation: y = ' + a + 'x + ' + b)
 
  var intersectionSide
  var intersection_x
  var intersection_y
  var x, y
 
  var x_left = rect.x
  var x_right = rect.x + rect.width
  var y_top = rect.y
  var y_bottom = rect.y + rect.height
 
  // find intersection in the given direction
  if (angleDeg > 0 && angleDeg < 90) {
    // intersection is in the top right part of the rectangle
    // first compute intersection with right vertical side:
    y = a * x_right + b
    if (y >= y_top) {
      intersectionSide = 'right'
      intersection_x = x_right
      intersection_y = y
    } else {
      // if not right vertical angle then it must be top horizontal side
      x = (y_top - b) / a
      intersectionSide = 'top'
      intersection_x = x
      intersection_y = y_top
    }
  } else if (angleDeg > 90 && angleDeg < 180) {
    // intersection is in the bottom right part of the rectangle
    // first compute intersection with right vertical side:
    y = a * x_right + b
    if (y <= y_bottom) {
      intersectionSide = 'right'
      intersection_x = x_right
      intersection_y = y
    } else {
      // if not right vertical angle then it must be bottom horizontal side
      x = (y_bottom - b) / a
      intersectionSide = 'bottom'
      intersection_x = x
      intersection_y = y_bottom
    }
  } else if (angleDeg > 180 && angleDeg < 270) {
    // intersection is in the bottom left part of the rectangle
    // first compute intersection with left vertical side:
    y = a * x_left + b
    if (y <= y_bottom) {
      intersectionSide = 'left'
      intersection_x = x_left
      intersection_y = y
    } else {
      // if not left vertical angle then it must be bottom horizontal side
      x = (y_bottom - b) / a
      intersectionSide = 'bottom'
      intersection_x = x
      intersection_y = y_bottom
    }
  } else if (angleDeg > 270 && angleDeg <= 360) {
    // intersection is in the top left part of the rectangle
    // first compute intersection with left vertical side:
    y = a * x_left + b
    if (y >= y_top) {
      intersectionSide = 'left'
      intersection_x = x_left
      intersection_y = y
    } else {
      // if not left vertical angle then it must be top horizontal side
      x = (y_top - b) / a
      intersectionSide = 'top'
      intersection_x = x
      intersection_y = y_top
    }
  } else if (angleDeg === 90) {
    intersectionSide = 'right'
    intersection_x = x_right
    intersection_y = y0
  } else if (angleDeg === 270) {
    intersectionSide = 'left'
    intersection_x = x_left
    intersection_y = y0
  } else if (angleDeg === 0) {
    intersectionSide = 'top'
    intersection_x = x0
    intersection_y = y_top
  } else if (angleDeg === 180) {
    intersectionSide = 'bottom'
    intersection_x = x0
    intersection_y = y_bottom
  }
  log('Found intersection with: ' + intersectionSide + ' side')
  log('Intersection point: (' + intersection_x + ',' + intersection_y + ')')
  return { x: Math.round(intersection_x), y: Math.round(intersection_y) }
}
 
// 获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
// px, py RECT 中点
// mx, mx 鼠标点
function getAngle(px, py, mx, my, shape) {
  var x = Math.abs(px - mx)
  var y = Math.abs(py - my)
  var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  var cos = y / z
  var radina = Math.acos(cos) // 用反三角函数求弧度
  var angle = Math.floor(180 / (Math.PI / radina)) // 将弧度转换成角度
  if (shape && shape.hasOwnProperty('poly')) {
    if (px < mx && py > my) { // 鼠标在第一象限
      if (angle < 45) {
        angle = 0
      } else {
        angle = 90
      }
    }
    if (px > mx && py > my) { // 鼠标在第二象限
      if (angle < 45) {
        angle = 0
      } else {
        angle = 270
      }
    }
 
    if (px > mx && py < my) { // 鼠标在第三象限
      if (angle < 45) {
        angle = 180
      } else {
        angle = 270
      }
    }
    if (px < mx && py < my) { // 鼠标在第四象限
      if (angle < 45) {
        angle = 180
      } else {
        angle = 90
      }
    }
 
    if (mx === px && my > py) { // 鼠标在y轴负方向上
      angle = 180
    }
    if (py === my && px > mx) {
      angle = 270
    }
  } else {
    if (mx > px && my > py) { // 鼠标在第四象限
      angle = 180 - angle
    }
    if (mx === px && my > py) { // 鼠标在y轴负方向上
      angle = 180
    }
    if (mx > px && my === py) { // 鼠标在x轴正方向上
      angle = 90
    }
    if (mx < px && my > py) { // 鼠标在第三象限
      angle = 180 + angle
    }
    if (mx < px && my === py) { // 鼠标在x轴负方向
      angle = 270
    }
    if (mx < px && my < py) { // 鼠标在第二象限
      angle = 360 - angle
    }
  }
 
  return angle
}
 
/*
var rect = { x: 100, y: 100, width: 200, height: 200 }
var center = { x: 150, y: 150 }
var pos = { x: 110, y: 160 }
var angle = getAngle(center.x, center.y, pos.x, pos.y)
console.log('angle', angle)
computeIntersection(rect, angle, center.x, center.y)
*/
 
export function rect_line_intersect(rect, pos, shape) {
  var cx = rect.x + rect.width / 2
  var cy = rect.y + rect.height / 2
  var angle = getAngle(cx, cy, pos.x, pos.y, shape)
  return computeIntersection(rect, angle, cx, cy, shape)
}
