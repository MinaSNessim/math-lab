(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var REGIONS = [
    { name: "North", income: 3, recycling: 3, fill: RED, people: [[2, 5], [2, 3], [4, 3], [4, 1]] },
    { name: "East", income: 5, recycling: 4, fill: YELLOW, people: [[4, 6], [4, 4], [6, 4], [6, 2]] },
    { name: "South", income: 6, recycling: 5, fill: GREEN, people: [[5, 7], [5, 5], [7, 5], [7, 3]] },
    { name: "West", income: 8, recycling: 6, fill: GREEN, people: [[7, 8], [7, 6], [9, 6], [9, 4]] }
  ];
  var TOPS = [168, 136, 104, 72];
  var LEFTS = ["14%", "38%", "62%", "86%"];
  var BLOCKS = ["3%", "27%", "51%", "75%"];

  function roof(chimney) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "eco-roof");
    svg.setAttribute("viewBox", "0 0 140 42");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<polygon points="4,40 70,8 136,40" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      + (chimney ? '<rect x="98" y="0" width="14" height="20" rx="2" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>' : "");
    return svg;
  }

  var scene = S.el("div", "eco-scene");
  var map = S.el("div", "eco-map");
  var lineSvg = document.createElementNS(SVG, "svg");
  lineSvg.setAttribute("class", "eco-line");
  lineSvg.setAttribute("aria-hidden", "true");
  var line = document.createElementNS(SVG, "polyline");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", INK);
  line.setAttribute("stroke-width", "4");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  lineSvg.appendChild(line);
  map.appendChild(lineSvg);

  var buttons = [];
  var dots = [];
  var i;
  for (i = 0; i < REGIONS.length; i += 1) {
    (function (index) {
      var region = REGIONS[index];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "eco-region";
      button.setAttribute("data-pace", "900");
      button.style.left = BLOCKS[index];
      button.style.background = region.fill;
      button.appendChild(roof(index === 3));
      var title = S.el("b");
      title.textContent = region.name;
      var income = S.el("span");
      income.textContent = "Income " + region.income;
      var recycling = S.el("span");
      recycling.textContent = "Recycling " + region.recycling;
      button.appendChild(title);
      button.appendChild(income);
      button.appendChild(recycling);
      var dot = S.el("i", "eco-dot");
      dot.style.left = LEFTS[index];
      dot.style.top = TOPS[index] + "px";
      dot.style.background = region.fill;
      map.appendChild(dot);
      map.appendChild(button);
      dots.push(dot);
      buttons.push(button);
      button.addEventListener("click", function () {
        selected = index;
        mode = "people";
        show(false);
      });
    })(i);
  }

  var zoom = S.el("div", "eco-zoom");
  var slot = S.el("div", "eco-plot-slot");
  var plot = document.createElementNS(SVG, "svg");
  plot.setAttribute("class", "eco-plot");
  plot.setAttribute("viewBox", "0 0 360 250");
  plot.setAttribute("preserveAspectRatio", "xMidYMid meet");
  var axis = '<line x1="46" y1="28" x2="46" y2="200" stroke="' + INK + '" stroke-width="3"/>'
    + '<line x1="46" y1="200" x2="330" y2="200" stroke="' + INK + '" stroke-width="3"/>'
    + '<text x="188" y="232" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="15" font-weight="800">Income</text>'
    + '<text x="54" y="20" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="14" font-weight="800">Recycling</text>';
  var groups = [];
  for (i = 0; i < REGIONS.length; i += 1) {
    var region = REGIONS[i];
    var people = region.people;
    var lo = people[0][0];
    var hi = people[2][0];
    var minR = people[0][1];
    var maxR = people[0][1];
    var p;
    for (p = 1; p < people.length; p += 1) {
      if (people[p][1] < minR) minR = people[p][1];
      if (people[p][1] > maxR) maxR = people[p][1];
    }
    var xOf = function (income, jitter) {
      return 96 + ((income - lo) / (hi - lo)) * 168 + jitter;
    };
    var yOf = function (recycling) {
      return 168 - ((recycling - minR) / (maxR - minR)) * 96;
    };
    var lowR = (people[0][1] + people[1][1]) / 2;
    var highR = (people[2][1] + people[3][1]) / 2;
    var g = document.createElementNS(SVG, "g");
    g.setAttribute("class", "eco-people");
    var d = '<line x1="' + xOf(lo, 0) + '" y1="' + yOf(lowR) + '" x2="' + xOf(hi, 0) + '" y2="' + yOf(highR) + '" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/>';
    var jitters = [-14, 14, -14, 14];
    var seen = {};
    for (p = 0; p < people.length; p += 1) {
      d += '<circle cx="' + xOf(people[p][0], jitters[p]) + '" cy="' + yOf(people[p][1]) + '" r="11" fill="' + region.fill + '" stroke="' + (region.fill === YELLOW ? INK : YELLOW) + '" stroke-width="3"/>';
      if (!seen[people[p][1]]) {
        seen[people[p][1]] = true;
        d += '<text x="40" y="' + (yOf(people[p][1]) + 5) + '" text-anchor="end" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="13" font-weight="800">' + people[p][1] + '</text>';
      }
    }
    d += '<text x="' + xOf(lo, 0) + '" y="214" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="14" font-weight="800">' + lo + '</text>';
    d += '<text x="' + xOf(hi, 0) + '" y="214" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="14" font-weight="800">' + hi + '</text>';
    g.innerHTML = d;
    groups.push(g);
  }
  plot.innerHTML = axis;
  for (i = 0; i < groups.length; i += 1) plot.appendChild(groups[i]);
  var zoomName = S.el("p", "eco-zoom-name");
  var zoomDetail = S.el("p", "eco-detail");
  slot.appendChild(plot);
  zoom.appendChild(zoomName);
  zoom.appendChild(slot);
  zoom.appendChild(zoomDetail);
  scene.appendChild(map);
  scene.appendChild(zoom);

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var avgBtn = S.button("Show regional averages", "btn");
  var oneBtn = S.button("Show individuals inside one region", "btn");
  avgBtn.setAttribute("data-pace", "900");
  oneBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(avgBtn);
  controls.appendChild(oneBtn);
  var key = S.el("p", "eco-key");
  key.textContent = "Left to right, average income rises. The dot sits higher when average recycling is higher.";
  board.appendChild(scene);
  board.appendChild(key);
  board.appendChild(caption);
  board.appendChild(controls);

  var mode = "map";
  var selected = 0;
  var round = 0;

  function layoutLine() {
    var w = scene.clientWidth || 640;
    var parts = [];
    var n;
    lineSvg.setAttribute("width", String(w));
    lineSvg.setAttribute("height", String(scene.clientHeight || 340));
    for (n = 0; n < 4; n += 1) {
      parts.push((w * (0.14 + n * 0.24)).toFixed(1) + "," + (TOPS[n] + 11));
    }
    line.setAttribute("points", parts.join(" "));
  }

  function peopleSentence(region) {
    var p = region.people;
    return "Income " + p[0][0] + " recycles at " + p[0][1] + " and " + p[1][1] + ". Income " + p[2][0] + " recycles at " + p[2][1] + " and " + p[3][1] + ".";
  }

  function paint(doSnap) {
    var n;
    var region = REGIONS[selected];
    if (doSnap) {
      map.style.setProperty("transition", "none", "important");
      zoom.style.setProperty("transition", "none", "important");
    }
    map.classList.toggle("is-away", mode === "people");
    zoom.classList.toggle("is-on", mode === "people");
    avgBtn.classList.toggle("is-on", mode === "map");
    oneBtn.classList.toggle("is-on", mode === "people");
    for (n = 0; n < buttons.length; n += 1) buttons[n].classList.toggle("is-pick", mode === "people" && n === selected);
    for (n = 0; n < groups.length; n += 1) groups[n].setAttribute("visibility", n === selected ? "visible" : "hidden");
    zoomName.textContent = "Inside " + region.name;
    zoomDetail.textContent = peopleSentence(region);
    key.textContent = mode === "map"
      ? "Left to right, average income rises. The dot sits higher when average recycling is higher."
      : "Each dot is one person in " + region.name + ". The red line falls as income rises.";
    if (doSnap) {
      void scene.offsetWidth;
      map.style.removeProperty("transition");
      zoom.style.removeProperty("transition");
    }
  }

  function textFor() {
    var region = REGIONS[selected];
    if (mode === "map") {
      return "North averages income 3 and recycling 3. East is 5 and 4. South is 6 and 5. West is 8 and 6. The line across regions rises.";
    }
    return "Inside " + region.name + ", " + peopleSentence(region) + " The line inside the region falls.";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = textFor();
    paint(doSnap);
    layoutLine();
    if (doSnap) caption.textContent = text;
    else {
      window.setTimeout(function () {
        if (mine !== round) return;
        caption.textContent = text;
      }, 900);
    }
  }

  avgBtn.addEventListener("click", function () {
    mode = "map";
    show(false);
  });
  oneBtn.addEventListener("click", function () {
    mode = "people";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "map";
    selected = 0;
    show(true);
  });
  window.addEventListener("resize", layoutLine);
  show(true);
})();
