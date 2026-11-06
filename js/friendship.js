(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var NETS = [
    {
      nodes: [
        { x: 18, y: 48, name: "You" },
        { x: 48, y: 30, name: "Ada" },
        { x: 18, y: 78, name: "Bo" },
        { x: 72, y: 16, name: "Cy" },
        { x: 88, y: 36, name: "Di" },
        { x: 88, y: 58, name: "Ed" },
        { x: 72, y: 78, name: "Fay" }
      ],
      edges: [[0, 1], [0, 2], [1, 3], [1, 4], [1, 5], [1, 6]]
    },
    {
      nodes: [
        { x: 16, y: 50, name: "You" },
        { x: 44, y: 50, name: "Ada" },
        { x: 30, y: 22, name: "Bo" },
        { x: 64, y: 22, name: "Cy" },
        { x: 82, y: 50, name: "Di" },
        { x: 64, y: 80, name: "Ed" }
      ],
      edges: [[0, 1], [0, 2], [1, 2], [1, 3], [1, 4], [1, 5], [2, 3]]
    }
  ];

  function figure() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="87" cy="78" r="68" fill="none" stroke="' + YELLOW + '" stroke-width="8"/>'
      + '<rect x="24" y="120" width="126" height="84" rx="30" fill="currentColor" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="52" y="190" width="28" height="72" rx="12" fill="currentColor" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="94" y="190" width="28" height="72" rx="12" fill="currentColor" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle cx="87" cy="78" r="58" fill="currentColor" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function degrees(edges, n) {
    var d = [];
    var i;
    for (i = 0; i < n; i += 1) d.push(0);
    for (i = 0; i < edges.length; i += 1) {
      d[edges[i][0]] += 1;
      d[edges[i][1]] += 1;
    }
    return d;
  }

  function neighbors(edges, who) {
    var out = [];
    var i;
    for (i = 0; i < edges.length; i += 1) {
      if (edges[i][0] === who) out.push(edges[i][1]);
      else if (edges[i][1] === who) out.push(edges[i][0]);
    }
    return out;
  }

  function meanText(list) {
    var s = 0;
    var i;
    for (i = 0; i < list.length; i += 1) s += list[i];
    var tenths = Math.round((s / list.length) * 10);
    if (tenths % 10 === 0) return String(tenths / 10);
    return (tenths / 10).toFixed(1);
  }

  function verb(name, count) {
    if (name === "You") return "You have " + count + " friends";
    return name + " has " + count + " friends";
  }

  var scene = S.el("div", "friend-scene");
  var lines = document.createElementNS(SVG, "svg");
  lines.setAttribute("class", "net-lines");
  var lineEls = [];
  var e;
  for (e = 0; e < 7; e += 1) {
    var line = document.createElementNS(SVG, "line");
    line.setAttribute("visibility", "hidden");
    lines.appendChild(line);
    lineEls.push(line);
  }
  scene.appendChild(lines);
  var sets = [];
  var n;
  for (n = 0; n < NETS.length; n += 1) {
    var set = S.el("div", "net-set");
    var deg = degrees(NETS[n].edges, NETS[n].nodes.length);
    var nodes = [];
    var k;
    for (k = 0; k < NETS[n].nodes.length; k += 1) {
      var spec = NETS[n].nodes[k];
      var node = S.el("div", "net-person");
      node.style.left = spec.x + "%";
      node.style.top = spec.y + "%";
      node.appendChild(figure());
      var title = S.el("b");
      title.textContent = spec.name;
      var badge = S.el("span", "net-deg");
      badge.textContent = String(deg[k]);
      node.appendChild(title);
      node.appendChild(badge);
      set.appendChild(node);
      nodes.push(node);
    }
    set.nodes = nodes;
    scene.appendChild(set);
    sets.push(set);
  }

  var totals = S.el("div", "pic-totals");
  function stat(id, words) {
    var p = S.el("p");
    var b = S.el("b");
    b.id = id;
    b.textContent = "\u2014";
    var span = S.el("span");
    span.textContent = words;
    p.appendChild(b);
    p.appendChild(span);
    return p;
  }
  totals.appendChild(stat("net-you", "Friends"));
  totals.appendChild(stat("net-avg", "Friends' average"));
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var meBtn = S.button("Highlight me", "btn");
  var friendsBtn = S.button("Show friends", "btn");
  var degBtn = S.button("Show friends' degrees", "btn");
  var newBtn = S.button("New network", "btn");
  meBtn.setAttribute("data-pace", "900");
  friendsBtn.setAttribute("data-pace", "900");
  degBtn.setAttribute("data-pace", "900");
  newBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(meBtn);
  controls.appendChild(friendsBtn);
  controls.appendChild(degBtn);
  controls.appendChild(newBtn);
  board.appendChild(scene);
  board.appendChild(totals);
  board.appendChild(caption);
  board.appendChild(controls);
  var youNum = document.getElementById("net-you");
  var avgNum = document.getElementById("net-avg");

  var netIndex = 0;
  var focus = 0;
  var mode = "me";
  var round = 0;

  function layoutLines() {
    var box = scene.getBoundingClientRect();
    var net = NETS[netIndex];
    var nodes = sets[netIndex].nodes;
    var edges = net.edges;
    var neighList = neighbors(edges, focus);
    var neigh = {};
    var i;
    for (i = 0; i < neighList.length; i += 1) neigh[neighList[i]] = true;
    lines.setAttribute("width", String(scene.clientWidth));
    lines.setAttribute("height", String(scene.clientHeight));
    for (i = 0; i < lineEls.length; i += 1) {
      if (i >= edges.length) {
        lineEls[i].setAttribute("visibility", "hidden");
        continue;
      }
      var a = nodes[edges[i][0]].querySelector("svg").getBoundingClientRect();
      var b = nodes[edges[i][1]].querySelector("svg").getBoundingClientRect();
      var touches = edges[i][0] === focus || edges[i][1] === focus;
      var far = !touches && (neigh[edges[i][0]] || neigh[edges[i][1]]);
      var cls = "";
      if (touches && mode !== "me") cls = "is-near";
      else if (far && mode === "degrees") cls = "is-far";
      lineEls[i].setAttribute("visibility", "visible");
      lineEls[i].setAttribute("class", cls);
      lineEls[i].setAttribute("x1", String(Math.round(a.left + a.width / 2 - box.left)));
      lineEls[i].setAttribute("y1", String(Math.round(a.top + a.height / 2 - box.top)));
      lineEls[i].setAttribute("x2", String(Math.round(b.left + b.width / 2 - box.left)));
      lineEls[i].setAttribute("y2", String(Math.round(b.top + b.height / 2 - box.top)));
    }
  }

  function paint(doSnap) {
    var net = NETS[netIndex];
    var deg = degrees(net.edges, net.nodes.length);
    var hot = -1;
    var best = -1;
    var i;
    for (i = 0; i < sets.length; i += 1) sets[i].classList.toggle("is-on", i === netIndex);
    scene.classList.toggle("is-degrees", mode === "degrees");
    for (i = 0; i < net.nodes.length; i += 1) {
      if (i !== focus && deg[i] > best) {
        best = deg[i];
        hot = i;
      }
    }
    var nodes = sets[netIndex].nodes;
    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.toggle("is-you", i === focus);
      nodes[i].classList.toggle("is-hot", i === hot);
    }
    if (mode === "degrees") {
      var nb = neighbors(net.edges, focus);
      var friendDegs = [];
      for (i = 0; i < nb.length; i += 1) friendDegs.push(deg[nb[i]]);
      youNum.textContent = String(deg[focus]);
      avgNum.textContent = meanText(friendDegs);
    } else {
      youNum.textContent = "\u2014";
      avgNum.textContent = "\u2014";
    }
    layoutLines();
    if (doSnap) void scene.offsetWidth;
  }

  function textFor() {
    var net = NETS[netIndex];
    var deg = degrees(net.edges, net.nodes.length);
    var name = net.nodes[focus].name;
    var nb = neighbors(net.edges, focus);
    var i;
    if (mode === "me") return verb(name, deg[focus]) + ".";
    if (mode === "friends") {
      var names = [];
      for (i = 0; i < nb.length; i += 1) names.push(net.nodes[nb[i]].name);
      return verb(name, deg[focus]) + ": " + names.join(" and ") + ".";
    }
    var parts = [];
    var friendDegs = [];
    for (i = 0; i < nb.length; i += 1) {
      friendDegs.push(deg[nb[i]]);
      parts.push(net.nodes[nb[i]].name + " " + deg[nb[i]]);
    }
    var avg = meanText(friendDegs);
    var tail = Number(avg) > deg[focus]
      ? " The friends' average is higher."
      : " This person has more friends than their friends do.";
    return verb(name, deg[focus]) + ". Their friend counts are " + parts.join(", ") + ", which averages " + avg + "." + tail;
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

  meBtn.addEventListener("click", function () {
    focus = (focus + 1) % NETS[netIndex].nodes.length;
    show(false);
  });
  friendsBtn.addEventListener("click", function () {
    mode = "friends";
    show(false);
  });
  degBtn.addEventListener("click", function () {
    mode = "degrees";
    show(false);
  });
  newBtn.addEventListener("click", function () {
    netIndex = netIndex === 0 ? 1 : 0;
    focus = 0;
    mode = "me";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    netIndex = 0;
    focus = 0;
    mode = "me";
    show(true);
  });
  window.addEventListener("resize", function () { layoutLines(); });
  show(true);
})();
