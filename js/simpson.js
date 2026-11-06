(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function roof() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "simp-roof");
    svg.setAttribute("viewBox", "0 0 240 52");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<polygon points="6,50 120,6 234,50" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>';
    return svg;
  }

  function meter(label, color) {
    var col = S.el("div", "simp-col");
    var pct = S.el("b", "simp-pct");
    var track = S.el("div", "simp-track");
    var fill = S.el("i", "simp-fill");
    fill.style.background = color;
    var name = S.el("span", "simp-label");
    name.textContent = label;
    var count = S.el("span", "simp-count");
    track.appendChild(fill);
    col.appendChild(pct);
    col.appendChild(track);
    col.appendChild(name);
    col.appendChild(count);
    return { col: col, fill: fill, pct: pct, count: count };
  }

  function house(title) {
    var root = S.el("div", "simp-house");
    var name = S.el("p", "simp-name");
    var sub = S.el("p", "simp-sub");
    var meters = S.el("div", "simp-meters");
    var treat = meter("Treatment", GREEN);
    var none = meter("No treatment", RED);
    name.textContent = title;
    root.appendChild(roof());
    meters.appendChild(treat.col);
    meters.appendChild(none.col);
    root.appendChild(meters);
    root.appendChild(name);
    root.appendChild(sub);
    return { root: root, treat: treat, none: none, name: name, sub: sub };
  }

  function hospitalA(n) {
    var treated = n * 4 / 5;
    var untreated = n - treated;
    return { tN: treated, tOk: treated * 3 / 10, cN: untreated, cOk: untreated * 3 / 20 };
  }

  function hospitalB(n) {
    var treated = n / 5;
    var untreated = n - treated;
    return { tN: treated, tOk: treated * 9 / 10, cN: untreated, cOk: untreated * 3 / 5 };
  }

  function whole(n) {
    return Math.round(n);
  }

  function percentOf(ok, n) {
    ok = whole(ok);
    n = whole(n);
    if (!n || (ok * 100) % n !== 0) return "";
    return String((ok * 100) / n);
  }

  function setMeter(node, ok, n, doSnap) {
    var rate = n ? ok / n : 0;
    var pct = percentOf(ok, n);
    if (doSnap) node.fill.style.setProperty("transition", "none", "important");
    node.fill.style.transform = "scaleY(" + rate + ")";
    node.count.textContent = whole(ok) + " of " + whole(n);
    node.pct.textContent = pct ? pct + "%" : whole(ok) + " of " + whole(n);
    if (doSnap) {
      void board.offsetWidth;
      node.fill.style.removeProperty("transition");
    }
  }

  var scene = S.el("div", "simp-scene");
  var houses = S.el("div", "simp-houses");
  var houseA = house("Hospital A");
  var houseB = house("Hospital B");
  var merge = S.el("div", "simp-merge");
  var mergeMeters = S.el("div", "simp-meters");
  var mergeTreat = meter("Treatment", GREEN);
  var mergeNone = meter("No treatment", RED);
  var mergeName = S.el("p", "simp-name");
  var mergeSub = S.el("p", "simp-sub");
  houses.appendChild(houseA.root);
  houses.appendChild(houseB.root);
  merge.appendChild(roof());
  mergeMeters.appendChild(mergeTreat.col);
  mergeMeters.appendChild(mergeNone.col);
  merge.appendChild(mergeMeters);
  merge.appendChild(mergeName);
  merge.appendChild(mergeSub);
  mergeName.textContent = "Both hospitals";
  scene.appendChild(houses);
  scene.appendChild(merge);

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var splitBtn = S.button("Show separate hospitals", "btn");
  var stackBtn = S.button("Show combined", "btn");
  splitBtn.setAttribute("data-pace", "900");
  stackBtn.setAttribute("data-pace", "900");
  var toggles = S.el("div", "controls");
  toggles.appendChild(splitBtn);
  toggles.appendChild(stackBtn);

  function slider(label, value) {
    var field = S.el("label", "field");
    var input = document.createElement("input");
    var read = S.el("b");
    input.type = "range";
    input.min = "100";
    input.max = "300";
    input.step = "100";
    input.value = String(value);
    input.setAttribute("data-pace", "0");
    field.appendChild(document.createTextNode(label));
    field.appendChild(input);
    field.appendChild(read);
    return { field: field, input: input, read: read };
  }

  var sliderA = slider("Patients in Hospital A", 200);
  var sliderB = slider("Patients in Hospital B", 100);
  var sliders = S.el("div", "controls");
  sliders.appendChild(sliderA.field);
  sliders.appendChild(sliderB.field);

  board.appendChild(scene);
  board.appendChild(caption);
  board.appendChild(toggles);
  board.appendChild(sliders);

  var combined = false;
  var round = 0;

  function counts() {
    var a = hospitalA(parseInt(sliderA.input.value, 10));
    var b = hospitalB(parseInt(sliderB.input.value, 10));
    return {
      a: a,
      b: b,
      aN: parseInt(sliderA.input.value, 10),
      bN: parseInt(sliderB.input.value, 10),
      tOk: a.tOk + b.tOk,
      tN: a.tN + b.tN,
      cOk: a.cOk + b.cOk,
      cN: a.cN + b.cN
    };
  }

  function rateSentence(ok, n) {
    var pct = percentOf(ok, n);
    var base = whole(ok) + " of " + whole(n);
    return pct ? pct + " percent, " + base : base;
  }

  function lower(data) {
    return data.tOk * data.cN < data.cOk * data.tN;
  }

  function paint(doSnap) {
    var data = counts();
    var nodes = [houses, merge];
    var i;
    sliderA.read.textContent = String(data.aN);
    sliderB.read.textContent = String(data.bN);
    setMeter(houseA.treat, data.a.tOk, data.a.tN, doSnap);
    setMeter(houseA.none, data.a.cOk, data.a.cN, doSnap);
    setMeter(houseB.treat, data.b.tOk, data.b.tN, doSnap);
    setMeter(houseB.none, data.b.cOk, data.b.cN, doSnap);
    setMeter(mergeTreat, data.tOk, data.tN, doSnap);
    setMeter(mergeNone, data.cOk, data.cN, doSnap);
    houseA.name.textContent = "Hospital A · " + data.aN + " patients";
    houseB.name.textContent = "Hospital B · " + data.bN + " patients";
    houseA.sub.textContent = "Harder cases · " + whole(data.a.tOk + data.a.cOk) + " of " + data.aN + " get well";
    houseB.sub.textContent = "Easier cases · " + whole(data.b.tOk + data.b.cOk) + " of " + data.bN + " get well";
    mergeSub.textContent = whole(data.tOk) + " of " + whole(data.tN) + " treated, and " + whole(data.cOk) + " of " + whole(data.cN) + " untreated";
    splitBtn.classList.toggle("is-on", !combined);
    stackBtn.classList.toggle("is-on", combined);
    if (doSnap) {
      for (i = 0; i < nodes.length; i += 1) nodes[i].style.setProperty("transition", "none", "important");
    }
    houses.classList.toggle("is-away", combined);
    merge.classList.toggle("is-on", combined);
    if (doSnap) {
      void board.offsetWidth;
      for (i = 0; i < nodes.length; i += 1) nodes[i].style.removeProperty("transition");
    }
    return data;
  }

  function textFor(data) {
    if (!combined) {
      return "In Hospital A, treatment is " + rateSentence(data.a.tOk, data.a.tN) + ", and no treatment is " + rateSentence(data.a.cOk, data.a.cN) + ". In Hospital B, treatment is " + rateSentence(data.b.tOk, data.b.tN) + ", and no treatment is " + rateSentence(data.b.cOk, data.b.cN) + ".";
    }
    return "Together, treatment succeeds for " + rateSentence(data.tOk, data.tN) + ". No treatment succeeds for " + rateSentence(data.cOk, data.cN) + ". " + (lower(data) ? "The treatment rate is lower once the hospitals are combined." : "At these sizes the combined treatment rate is not lower.");
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var data = paint(doSnap);
    var text = textFor(data);
    if (doSnap) caption.textContent = text;
    else {
      window.setTimeout(function () {
        if (mine !== round) return;
        caption.textContent = text;
      }, 900);
    }
  }

  splitBtn.addEventListener("click", function () {
    combined = false;
    show(false);
  });
  stackBtn.addEventListener("click", function () {
    combined = true;
    show(false);
  });
  sliderA.input.addEventListener("input", function () {
    caption.textContent = textFor(paint(false));
  });
  sliderB.input.addEventListener("input", function () {
    caption.textContent = textFor(paint(false));
  });
  document.getElementById("again").addEventListener("click", function () {
    combined = false;
    sliderA.input.value = "200";
    sliderB.input.value = "100";
    show(true);
  });
  show(true);
})();
