// https://mathworld.wolfram.com/Circle-LineIntersection.html
// https://github.com/rafaelfernandezgis/intersectionCircleLine
// 计算圆和任意线的交点
function getIntersectionCircleLine(x1, y1, x2, y2, Cx, Cy, Cr) {
  // compute the euclidean distance between A and B
  var LAB = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

  // compute the direction vector D from A to B
  var Dx = (x2 - x1) / LAB;
  var Dy = (y2 - y1) / LAB;

  // compute the value t of the closest point to the circle center (Cx, Cy)
  var t = Dx * (Cx - x1) + Dy * (Cy - y1);

  // This is the projection of C on the line from A to B.

  // compute the coordinates of the point E on line and closest to C
  var Ex = (t * Dx) + x1;
  var Ey = (t * Dy) + y1;

  // compute the euclidean distance from E to C
  var LEC = Math.sqrt(Math.pow((Ex - Cx), 2) + Math.pow((Ey - Cy), 2));

  // test if the line intersects the circle
  if (LEC < Cr) {
    // compute distance from t to circle intersection point
    var dt = Math.sqrt(Math.pow(Cr, 2) - Math.pow(LEC, 2));

    // compute first intersection point
    var Fx = (t - dt) * Dx + x1;
    var Fy = (t - dt) * Dy + y1;

    // compute second intersection point
    var Gx = (t + dt) * Dx + x1;
    var Gy = (t + dt) * Dy + y1;
  }
  else if (LEC == Cr) { // else test if the line is tangent to circle
    // tangent point to circle is E
    alert("line is tangent to circle. Tanget point is: X= " + Ex + ", Y=" + Ey);
  }
  else {
    // line doesn't touch circle
    alert("line doesn't touch circle");
  }
}


// 圆和圆外一点连线，在圆上的交点
export function pointCircleIntersection(Cx, Cy, Cr, x1, y1) {
  // compute the euclidean distance between A and B
  var LAB = Math.sqrt(Math.pow((Cx - x1), 2) + Math.pow((Cy - y1), 2));
  if (LAB <= Cr) {
    return [x1, y1]
  }

  // compute the direction vector D from A to B
  var Dx = (x1 - Cx) / LAB;
  var Dy = (y1 - Cy) / LAB;

  // compute the value t of the closest point to the circle center (Cx, Cy)
  var x = Cx + Dx * Cr
  var y = Cy + Dy * Cr

  return [~~x, ~~y]
}
