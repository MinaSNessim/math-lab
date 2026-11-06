(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var VW = 400;
  var VH = 260;
  var START = [58, 132];
  var NORTH = [168, 42];
  var SOUTH = [232, 218];
  var WORK = [342, 132];
  var FLAT = 5;
  var CUT_TIME = 1;

  function carArt() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 64 36");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="6" y="16" width="52" height="13" rx="4" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2.4"/>'
      + '<rect x="16" y="5" width="28" height="13" rx="4" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2.4"/>'
      + '<rect x="20" y="8" width="10" height="7" rx="1.5" fill="#ffffff" stroke="' + INK + '" stroke-width="1.5"/>'
      + '<circle cx="16" cy="29" r="5" fill="#ffffff" stroke="' + INK + '" stroke-width="2.2"/>'
      + '<circle cx="48" cy="29" r="5" fill="#ffffff" stroke="' + INK + '" stroke-width="2.2"/>'
      + '<circle cx="8" cy="20" r="3.2" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.5"/>';
    return svg;
  }

  function pathMeta(pts) {
    var seg = [];
    var total = 0;
    var i;
    for (i = 1; i < pts.length; i += 1) {
      var dx = pts[i][0] - pts[i - 1][0];
      var dy = pts[i][1] - pts[i - 1][1];
      var len = Math.sqrt(dx * dx + dy * dy);
      seg.push(len);
      total += len;
    }
    return { pts: pts, seg: seg, total: total };
  }

  function at(meta, t) {
    var dist = t * meta.total;
    var i;
    for (i = 0; i < meta.seg.length; i += 1) {
      var len = meta.seg[i];
      if (dist <= len || i === meta.seg.length - 1) {
        var u = len ? dist / len : 0;
        if (u < 0) u = 0;
        if (u > 1) u = 1;
        var a = meta.pts[i];
        var b = meta.pts[i + 1];
        return {
          x: a[0] + (b[0] - a[0]) * u,
          y: a[1] + (b[1] - a[1]) * u,
          ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI
        };
      }
      dist -= len;
    }
    return { x: meta.pts[0][0], y: meta.pts[0][1], ang: 0 };
  }

  var upper = pathMeta([START, NORTH, WORK]);
  var lower = pathMeta([START, SOUTH, WORK]);
  var via = pathMeta([START, NORTH, SOUTH, WORK]);

  function line(x1, y1, x2, y2, opacity) {
    var shown = opacity == null ? "1" : String(opacity);
    return '<line class="net-road" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="8" stroke-opacity="' + shown + '" />';
  }

  function dot(p) {
    return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="#ffffff" stroke="' + INK + '" stroke-width="3"/>';
  }

  function label(text, x, y, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="15" font-weight="800">' + text + '</text>';
  }

  var scene = S.el("div", "net-scene");
  var svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "net-svg");
  svg.setAttribute("viewBox", "0 0 " + VW + " " + VH);
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = line(START[0], START[1], NORTH[0], NORTH[1])
    + line(NORTH[0], NORTH[1], WORK[0], WORK[1])
    + line(START[0], START[1], SOUTH[0], SOUTH[1])
    + line(SOUTH[0], SOUTH[1], WORK[0], WORK[1])
    + line(NORTH[0], NORTH[1], SOUTH[0], SOUTH[1], 0)
    + dot(START) + dot(NORTH) + dot(SOUTH) + dot(WORK)
    + label("Home", START[0] - 12, START[1] + 6, "end")
    + label("North", NORTH[0], NORTH[1] - 16, "middle")
    + label("South", SOUTH[0], SOUTH[1] + 28, "middle")
    + label("Work", WORK[0] + 12, WORK[1] + 6, "start");
  scene.appendChild(svg);
  var roads = svg.querySelectorAll(".net-road");
  var roadSn = roads[0];
  var roadNw = roads[1];
  var roadSs = roads[2];
  var roadSw = roads[3];
  var roadCut = roads[4];

  function lab(cls) {
    var node = S.el("span", "net-lab " + cls);
    scene.appendChild(node);
    return node;
  }

  var labSn = lab("sn");
  var labNw = lab("nw");
  var labSs = lab("ss");
  var labSw = lab("sw");
  var labCut = lab("cut");

  var cars = [];
  var c;
  for (c = 0; c < 10; c += 1) {
    var car = S.el("div", "net-car");
    car.appendChild(carArt());
    car.style.visibility = "hidden";
    car._on = false;
    scene.appendChild(car);
    cars.push(car);
  }

  var trip = S.el("p", "net-trip");
  var controls = S.el("div", "controls");
  var cutBtn = S.button("Add shortcut", "btn");
  cutBtn.id = "shortcut";
  cutBtn.setAttribute("data-pace", "900");
  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = "4";
  slider.max = "10";
  slider.value = "4";
  slider.id = "car-count";
  slider.setAttribute("aria-label", "Number of cars");
  var sliderNum = S.el("b");
  sliderNum.textContent = "4";
  var sliderLabel = S.el("label", "field");
  sliderLabel.appendChild(document.createTextNode("Cars"));
  sliderLabel.appendChild(slider);
  sliderLabel.appendChild(sliderNum);
  controls.appendChild(cutBtn);
  controls.appendChild(sliderLabel);
  var caption = S.el("p", "caption");

  board.appendChild(scene);
  board.appendChild(trip);
  board.appendChild(controls);
  board.appendChild(caption);

  var token = 0;
  var carsN = 4;
  var shortcut = false;

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== token) return;
      fn();
    }, ms);
  }

  function splitOf(num) {
    var up = Math.ceil(num / 2);
    var down = num - up;
    return { up: up, down: down, upTime: up + FLAT, downTime: down + FLAT };
  }

  function loadPaint(count, shown) {
    if (!shown || count <= 0) return { color: INK, width: 8, opacity: 0.28 };
    if (count <= 3) return { color: GREEN, width: 10, opacity: 1 };
    if (count <= 6) return { color: YELLOW, width: 13, opacity: 1 };
    return { color: RED, width: 16, opacity: 1 };
  }

  function paintRoad(node, count, shown) {
    if (!shown) {
      node.style.strokeOpacity = "0";
      return;
    }
    var paint = loadPaint(count, true);
    node.style.stroke = paint.color;
    node.style.strokeWidth = paint.width + "px";
    node.style.strokeOpacity = String(paint.opacity);
  }

  function placeLab(node, x, y, text, shown) {
    node.style.left = (100 * x / VW) + "%";
    node.style.top = (100 * y / VH) + "%";
    node.textContent = text;
    node.hidden = !shown;
  }

  function view() {
    var split = splitOf(carsN);
    var after = carsN + CUT_TIME + carsN;
    var snCars = shortcut ? carsN : split.up;
    var swCars = shortcut ? carsN : split.down;
    var snTime = shortcut ? carsN : split.up;
    var swTime = shortcut ? carsN : split.down;
    var say;
    if (!shortcut) {
      if (split.upTime === split.downTime) {
        say = carsN + " cars split between the two roads. Each trip is " + split.upTime + " minutes.";
      } else {
        say = carsN + " cars split. " + split.up + " take the upper road (" + split.upTime + " min). " + split.down + " take the lower road (" + split.downTime + " min).";
      }
    } else if (split.upTime === split.downTime) {
      say = "The shortcut is open. All " + carsN + " cars take it. Each trip is " + after + " minutes, longer than the " + split.upTime + " minutes before.";
    } else {
      say = "The shortcut is open. All " + carsN + " cars take it. Each trip is " + after + " minutes. Before the shortcut, the trips were " + split.upTime + " and " + split.downTime + " minutes.";
    }
    var tripText = shortcut
      ? "Each trip: " + after + " min. Before the shortcut: " + (split.upTime === split.downTime ? split.upTime + " min" : split.upTime + " and " + split.downTime + " min") + "."
      : (split.upTime === split.downTime
        ? "Each trip: " + split.upTime + " min"
        : "Upper trip: " + split.upTime + " min. Lower trip: " + split.downTime + " min.");
    return {
      snCars: snCars,
      nwCars: shortcut ? 0 : split.up,
      ssCars: shortcut ? 0 : split.down,
      swCars: swCars,
      cutCars: shortcut ? carsN : 0,
      snTime: snTime,
      swTime: swTime,
      say: say,
      tripText: tripText,
      up: split.up,
      down: split.down
    };
  }

  function spots(now) {
    var list = [];
    var upIndex = 0;
    var downIndex = 0;
    var allIndex = 0;
    var i;
    for (i = 0; i < 10; i += 1) {
      if (i >= carsN) {
        list.push(null);
        continue;
      }
      if (shortcut) {
        list.push(at(via, (allIndex + 1) / (carsN + 1)));
        allIndex += 1;
      } else if (upIndex < now.up) {
        list.push(at(upper, (upIndex + 1) / (now.up + 1)));
        upIndex += 1;
      } else {
        list.push(at(lower, (downIndex + 1) / (now.down + 1)));
        downIndex += 1;
      }
    }
    return list;
  }

  function park(list, animate) {
    var w = scene.clientWidth || VW;
    var h = scene.clientHeight || VH;
    var i;
    for (i = 0; i < cars.length; i += 1) {
      var car = cars[i];
      var pt = list[i];
      if (!pt) {
        car._on = false;
        car.style.visibility = "hidden";
        continue;
      }
      var x = (pt.x / VW) * w;
      var y = (pt.y / VH) * h;
      var goal = "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px) rotate(" + pt.ang.toFixed(1) + "deg)";
      var was = car._on;
      car._on = true;
      car.style.visibility = "visible";
      if (!animate || !was) {
        car.style.setProperty("transition", "none", "important");
        car.style.transform = goal;
        void car.offsetWidth;
        car.style.removeProperty("transition");
      } else {
        car.style.transform = goal;
      }
    }
  }

  function paint(now, animate) {
    paintRoad(roadSn, now.snCars, true);
    paintRoad(roadNw, now.nwCars, true);
    paintRoad(roadSs, now.ssCars, true);
    paintRoad(roadSw, now.swCars, true);
    paintRoad(roadCut, now.cutCars, shortcut);
    placeLab(labSn, 98, 62, now.snTime + " min", true);
    placeLab(labNw, 268, 62, FLAT + " min", true);
    placeLab(labSs, 128, 196, FLAT + " min", true);
    placeLab(labSw, 300, 196, now.swTime + " min", true);
    placeLab(labCut, 214, 128, CUT_TIME + " min", shortcut);
    trip.textContent = now.tripText;
    park(spots(now), animate);
  }

  function syncButton() {
    cutBtn.textContent = shortcut ? "Remove shortcut" : "Add shortcut";
    cutBtn.className = "btn" + (shortcut ? " is-on" : "");
  }

  cutBtn.addEventListener("click", function () {
    token += 1;
    var mine = token;
    shortcut = !shortcut;
    syncButton();
    var now = view();
    paint(now, true);
    var line = now.say;
    later(mine, 900, function () {
      caption.textContent = line;
    });
  });

  slider.addEventListener("input", function () {
    token += 1;
    carsN = parseInt(slider.value, 10);
    if (isNaN(carsN)) carsN = 4;
    sliderNum.textContent = String(carsN);
    var now = view();
    paint(now, true);
    caption.textContent = now.say;
  });

  function reset() {
    token += 1;
    carsN = 4;
    shortcut = false;
    slider.value = "4";
    sliderNum.textContent = "4";
    syncButton();
    var now = view();
    paint(now, false);
    caption.textContent = now.say;
  }

  window.addEventListener("resize", function () {
    paint(view(), false);
  });

  function ready() {
    if (scene.clientWidth < 20) {
      window.requestAnimationFrame(ready);
      return;
    }
    reset();
  }

  ready();

  document.getElementById("again").addEventListener("click", reset);
})();
