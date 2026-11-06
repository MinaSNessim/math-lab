(function () {
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("shore");
  var rulerNum = document.getElementById("ruler-num");
  var measured = document.getElementById("measured");
  var caption = document.getElementById("caption");
  var bar = document.getElementById("ruler-bar");
  var shorter = document.getElementById("shorter");
  var longer = document.getElementById("longer");
  var again = document.getElementById("again");
  var ENDX = 72;
  var stickOf = [16, 10, 7, 3, 2, 1];
  var SCALE = 13;
  var PADX = 28;
  var PADY = 18;
  var PADB = 20;
  var which = 0;
  var coast = [
    [0, 0],
    [1.6, 2.4],
    [3.2, 0.8],
    [4.2, 5.2],
    [5.4, 1.6],
    [7.2, 2.4],
    [8.4, 6.4],
    [9.6, 9.6],
    [11.2, 5.4],
    [12.2, 7.6],
    [13.4, 2.2],
    [16.2, 3.2],
    [17.6, 6.2],
    [18.6, 10.2],
    [20.2, 4.6],
    [21.2, 1.1],
    [22.6, 4.8],
    [23.8, 9.4],
    [25.6, 5.2],
    [27.4, 3.4],
    [31.2, 2.2],
    [35.4, 1.2],
    [38.6, 1.8],
    [40.4, 4.2],
    [41.6, 7.4],
    [43.2, 3.6],
    [44.4, 8.2],
    [45.8, 4.4],
    [47.2, 9.2],
    [48.6, 5.6],
    [50.2, 3.2],
    [51.4, 4.8],
    [52.4, 2.2],
    [53.4, 5.2],
    [54.4, 2],
    [55.6, 4.4],
    [57.2, 1.8],
    [60.4, 2.4],
    [63.6, 1],
    [66.8, 1.6],
    [69.4, 0.5],
    [72, 0]
  ];

  function el(name) { return document.createElementNS(ns, name); }

  function hypot(x, y) { return Math.sqrt(x * x + y * y); }

  function firstHit(seg, u, stick) {
    var ax0 = coast[seg][0];
    var ay0 = coast[seg][1];
    var bx0 = coast[seg + 1][0];
    var by0 = coast[seg + 1][1];
    var cx = ax0 + u * (bx0 - ax0);
    var cy = ay0 + u * (by0 - ay0);
    var r2 = stick * stick;
    var j;
    for (j = seg; j < coast.length - 1; j += 1) {
      var ax = coast[j][0];
      var ay = coast[j][1];
      var bx = coast[j + 1][0];
      var by = coast[j + 1][1];
      var dx = bx - ax;
      var dy = by - ay;
      var vx = ax - cx;
      var vy = ay - cy;
      var A = dx * dx + dy * dy;
      var B = 2 * (vx * dx + vy * dy);
      var C = vx * vx + vy * vy - r2;
      var disc = B * B - 4 * A * C;
      if (disc < 0 || A < 1e-12) continue;
      var root = Math.sqrt(disc);
      var t0 = (-B - root) / (2 * A);
      var t1 = (-B + root) / (2 * A);
      var lo = j === seg ? u + 1e-6 : 0;
      var pair = [t0, t1];
      var k;
      for (k = 0; k < 2; k += 1) {
        var t = pair[k];
        if (lo < t && t <= 1 + 1e-9) {
          var tt = t > 1 ? 1 : t;
          return [j, tt, [ax + tt * dx, ay + tt * dy]];
        }
      }
    }
    return null;
  }

  function measure(stick) {
    var pts = [coast[0]];
    var seg = 0;
    var u = 0;
    var n;
    for (n = 0; n < 4000; n += 1) {
      var hit = firstHit(seg, u, stick);
      if (!hit) {
        var end = coast[coast.length - 1];
        var last = pts[pts.length - 1];
        if (hypot(last[0] - end[0], last[1] - end[1]) > 1e-6) pts.push(end);
        break;
      }
      seg = hit[0];
      u = hit[1];
      var pt = hit[2];
      last = pts[pts.length - 1];
      if (hypot(pt[0] - last[0], pt[1] - last[1]) < 1e-4) break;
      pts.push(pt);
      if (seg >= coast.length - 2 && u >= 1 - 1e-8) break;
      if (u >= 1 - 1e-9) {
        seg += 1;
        u = 0;
        if (seg >= coast.length - 1) break;
      }
    }
    return pts;
  }

  function lengthOf(pts) {
    var sum = 0;
    var i;
    for (i = 1; i < pts.length; i += 1) {
      sum += hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    return Math.round(sum * 10) / 10;
  }

  var maxY = 0;
  var i;
  for (i = 0; i < coast.length; i += 1) {
    if (coast[i][1] > maxY) maxY = coast[i][1];
  }

  function X(x) { return PADX + x * SCALE; }
  function Y(y) { return PADY + (maxY - y) * SCALE; }

  var vbW = Math.ceil(X(ENDX) + PADX);
  var vbH = Math.ceil(Y(0) + PADB);
  svg.setAttribute("viewBox", "0 0 " + vbW + " " + vbH);
  svg.setAttribute("width", String(vbW));
  svg.setAttribute("height", String(vbH));

  function line(x1, y1, x2, y2, color, width) {
    var node = el("line");
    node.setAttribute("x1", x1);
    node.setAttribute("y1", y1);
    node.setAttribute("x2", x2);
    node.setAttribute("y2", y2);
    node.setAttribute("stroke", color);
    node.setAttribute("stroke-width", String(width));
    node.setAttribute("stroke-linecap", "round");
    return node;
  }

  svg.appendChild(line(X(0), Y(0), X(ENDX), Y(0), "#f5c518", 8));

  function pointsOf(pts) {
    var text = "";
    var n;
    for (n = 0; n < pts.length; n += 1) {
      if (n) text += " ";
      text += X(pts[n][0]) + "," + Y(pts[n][1]);
    }
    return text;
  }

  function poly(pts, color, width) {
    var pl = el("polyline");
    pl.setAttribute("points", pointsOf(pts));
    pl.setAttribute("fill", "none");
    pl.setAttribute("stroke", color);
    pl.setAttribute("stroke-width", String(width));
    pl.setAttribute("stroke-linejoin", "round");
    pl.setAttribute("stroke-linecap", "round");
    return pl;
  }

  svg.appendChild(poly(coast, "#5ec5a7", 9));
  var stickG = el("g");
  svg.appendChild(stickG);

  function post(x) {
    var c = el("circle");
    c.setAttribute("cx", X(x));
    c.setAttribute("cy", Y(0));
    c.setAttribute("r", "8");
    c.setAttribute("fill", "#f5c518");
    c.setAttribute("stroke", "#0c1438");
    c.setAttribute("stroke-width", "2");
    svg.appendChild(c);
  }
  post(0);
  post(ENDX);

  function drawRed(level) {
    while (stickG.firstChild) stickG.removeChild(stickG.firstChild);
    stickG.appendChild(poly(measure(stickOf[level]), "#fe8e83", 3.5));
    return lengthOf(measure(stickOf[level]));
  }

  function words(len) {
    var text = "End to end is 72. This ruler measures " + len.toFixed(1) + ".";
    if (which === 0) text += " The long sticks cut across the bends.";
    else if (which === stickOf.length - 1) text += " The short stick stays near the green line. A real coast would still have a smaller bend, so it has no final length.";
    else text += " It follows bends the longer stick cut across.";
    rulerNum.textContent = String(stickOf[which]);
    measured.textContent = len.toFixed(1);
    caption.textContent = text;
    shorter.disabled = which === stickOf.length - 1;
    longer.disabled = which === 0;
    bar.style.transform = "scaleX(" + (stickOf[which] / stickOf[0]) + ")";
  }

  function show(level) {
    which = level;
    words(drawRed(which));
  }

  show(0);
  shorter.addEventListener("click", function () {
    if (which < stickOf.length - 1) show(which + 1);
  });
  longer.addEventListener("click", function () {
    if (which > 0) show(which - 1);
  });
  again.addEventListener("click", function () { show(0); });
})();
