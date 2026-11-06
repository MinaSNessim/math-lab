(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var GAPS = [2, 3, 4, 10, 16];
  var STARTS = [0, 2, 5, 9, 19];
  var STOPS = [0, 2, 5, 9, 19, 35];
  var TOTAL = 35;
  var ONES = [28, 14, 30, 7, 22, 12, 1, 25];
  var MANY = [22, 26, 30, 33, 11, 13, 15, 17, 7, 1];

  function gapIndex(minute) {
    var i;
    for (i = 0; i < GAPS.length; i += 1) {
      if (minute < STARTS[i] + GAPS[i]) return i;
    }
    return GAPS.length - 1;
  }

  function figure() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="87" cy="78" r="66" fill="none" stroke="' + YELLOW + '" stroke-width="8"/>'
      + '<rect x="24" y="120" width="126" height="84" rx="30" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="52" y="190" width="28" height="72" rx="12" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="94" y="190" width="28" height="72" rx="12" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle cx="87" cy="78" r="58" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function busIcon() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 44 40");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<polygon points="4,18 22,4 40,18" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>'
      + '<rect x="6" y="16" width="32" height="16" rx="4" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<rect x="26" y="20" width="8" height="6" rx="1" fill="' + RED + '" stroke="' + INK + '" stroke-width="1.5"/>';
    return svg;
  }

  var scene = S.el("div", "bus-scene");
  var road = S.el("div", "bus-road");
  var gaps = S.el("div", "bus-gaps");
  var gapEls = [];
  var i;
  for (i = 0; i < GAPS.length; i += 1) {
    var gap = S.el("div", "bus-gap");
    gap.style.flexGrow = String(GAPS[i]);
    var label = S.el("b");
    label.textContent = String(GAPS[i]);
    gap.appendChild(label);
    gaps.appendChild(gap);
    gapEls.push(gap);
  }
  road.appendChild(gaps);
  var busEls = [];
  for (i = 0; i < STOPS.length; i += 1) {
    var icon = S.el("div", "bus-icon");
    icon.appendChild(busIcon());
    road.appendChild(icon);
    busEls.push(icon);
  }
  road.appendChild(S.el("div", "bus-rail"));
  var marks = [];
  for (i = 0; i < MANY.length; i += 1) {
    var mark = S.el("i", "bus-mark");
    road.appendChild(mark);
    marks.push(mark);
  }
  var person = S.el("div", "bus-person");
  person.appendChild(figure());
  scene.appendChild(road);
  scene.appendChild(person);

  function stat(numId, num, wordsId, words) {
    var p = S.el("p");
    var b = S.el("b");
    b.id = numId;
    b.textContent = num;
    var span = S.el("span");
    span.id = wordsId;
    span.textContent = words;
    p.appendChild(b);
    p.appendChild(span);
    return p;
  }

  var totals = S.el("div", "pic-totals");
  totals.appendChild(stat("bus-true", "7", "bus-true-name", "Timetable average"));
  totals.appendChild(stat("bus-felt", "\u2014", "bus-felt-name", "Gap you landed in"));
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var arriveBtn = S.button("Arrive at a random time", "btn");
  var manyBtn = S.button("Show 10 arrivals", "btn");
  arriveBtn.setAttribute("data-pace", "900");
  manyBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(arriveBtn);
  controls.appendChild(manyBtn);
  board.appendChild(scene);
  board.appendChild(totals);
  board.appendChild(caption);
  board.appendChild(controls);
  var felt = document.getElementById("bus-felt");
  var feltName = document.getElementById("bus-felt-name");

  var step = 0;
  var mode = "idle";
  var round = 0;

  function placeBuses() {
    var w = gaps.clientWidth || 1;
    var left = gaps.offsetLeft;
    var n;
    for (n = 0; n < STOPS.length; n += 1) {
      busEls[n].style.left = (left + (STOPS[n] / TOTAL) * w) + "px";
    }
  }

  function xInRoad(minute) {
    var idx = gapIndex(minute);
    var gap = gapEls[idx];
    var frac = (minute - STARTS[idx]) / GAPS[idx];
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;
    return gap.offsetLeft + frac * gap.offsetWidth;
  }

  function paint(doSnap) {
    var n;
    var hit = {};
    if (doSnap) {
      person.style.setProperty("transition", "none", "important");
      for (n = 0; n < marks.length; n += 1) marks[n].style.setProperty("transition", "none", "important");
    }
    for (n = 0; n < gapEls.length; n += 1) gapEls[n].classList.remove("is-hot");
    for (n = 0; n < marks.length; n += 1) marks[n].classList.remove("is-on");
    person.classList.remove("is-on");
    if (mode === "one") {
      var minute = ONES[(step - 1 + ONES.length) % ONES.length];
      var idx = gapIndex(minute);
      gapEls[idx].classList.add("is-hot");
      person.classList.add("is-on");
      person.style.transform = "translate(" + Math.round(road.offsetLeft + xInRoad(minute) - person.offsetWidth / 2) + "px, 0px)";
      felt.textContent = String(GAPS[idx]);
      feltName.textContent = "Gap you landed in";
    } else if (mode === "many") {
      for (n = 0; n < MANY.length; n += 1) {
        hit[gapIndex(MANY[n])] = true;
        marks[n].style.left = Math.round(xInRoad(MANY[n]) - 7) + "px";
        marks[n].style.bottom = (58 + (n % 3) * 12) + "px";
        marks[n].classList.add("is-on");
      }
      for (n = 0; n < gapEls.length; n += 1) {
        if (hit[n]) gapEls[n].classList.add("is-hot");
      }
      felt.textContent = "11";
      feltName.textContent = "Average of 10 arrivals";
    } else {
      person.style.transform = "translate(16px, 36px)";
      felt.textContent = "\u2014";
      feltName.textContent = "Gap you landed in";
    }
    placeBuses();
    if (doSnap) {
      void scene.offsetWidth;
      person.style.removeProperty("transition");
      for (n = 0; n < marks.length; n += 1) marks[n].style.removeProperty("transition");
    }
  }

  function textFor() {
    if (mode === "one") {
      var minute = ONES[(step - 1 + ONES.length) % ONES.length];
      var len = GAPS[gapIndex(minute)];
      var word = len > 7 ? "longer than" : "shorter than";
      return "You landed in the gap of " + len + ". The timetable average is 7. This gap is " + word + " that average.";
    }
    if (mode === "many") return "Ten arrivals landed in gaps that average 11. The timetable average is 7.";
    return "Gaps of 2, 3, 4, 10, and 16. The timetable average is 7.";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = textFor();
    paint(doSnap);
    if (doSnap) caption.textContent = text;
    else window.setTimeout(function () {
      if (mine !== round) return;
      caption.textContent = text;
    }, 900);
  }

  arriveBtn.addEventListener("click", function () {
    mode = "one";
    step += 1;
    show(false);
  });
  manyBtn.addEventListener("click", function () {
    mode = "many";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "idle";
    step = 0;
    show(true);
  });
  window.addEventListener("resize", function () { paint(true); });
  show(true);
})();
