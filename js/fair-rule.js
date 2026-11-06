(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var SMALL = [
    { name: "East", g: 2, r: 3 },
    { name: "South", g: 2, r: 3 },
    { name: "West", g: 2, r: 3 }
  ];

  function roof() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "dist-roof");
    svg.setAttribute("viewBox", "0 0 160 40");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<polygon points="4,38 80,4 156,38" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
    return svg;
  }

  function block() {
    var root = S.el("div", "dist-block");
    var title = S.el("p", "dist-name");
    var bar = S.el("div", "dist-bar");
    var g = S.el("i", "dist-green");
    var r = S.el("i", "dist-red");
    var gNum = S.el("b");
    var rNum = S.el("b");
    var seat = S.el("span", "dist-seat");
    g.appendChild(gNum);
    r.appendChild(rNum);
    bar.appendChild(g);
    bar.appendChild(r);
    root.appendChild(roof());
    root.appendChild(title);
    root.appendChild(bar);
    root.appendChild(seat);
    return { root: root, title: title, g: g, r: r, gNum: gNum, rNum: rNum, seat: seat };
  }

  function meter(label) {
    var root = S.el("div", "dist-meter");
    var name = S.el("span", "dist-meter-name");
    var row = S.el("div", "dist-meter-row");
    var bar = S.el("div", "dist-bar");
    var g = S.el("i", "dist-green");
    var r = S.el("i", "dist-red");
    var gNum = S.el("b");
    var rNum = S.el("b");
    name.textContent = label;
    g.appendChild(gNum);
    r.appendChild(rNum);
    bar.appendChild(g);
    bar.appendChild(r);
    row.appendChild(S.el("i", "dist-post"));
    row.appendChild(bar);
    row.appendChild(S.el("i", "dist-post"));
    root.appendChild(name);
    root.appendChild(row);
    return { root: root, g: g, r: r, gNum: gNum, rNum: rNum };
  }

  function fillBar(node, gVotes, rVotes, doSnap) {
    var total = gVotes + rVotes;
    if (doSnap) {
      node.g.style.setProperty("transition", "none", "important");
      node.r.style.setProperty("transition", "none", "important");
    }
    node.g.style.width = (gVotes / total * 100) + "%";
    node.r.style.width = (rVotes / total * 100) + "%";
    node.gNum.textContent = String(gVotes);
    node.rNum.textContent = String(rVotes);
    if (doSnap) {
      void board.offsetWidth;
      node.g.style.removeProperty("transition");
      node.r.style.removeProperty("transition");
    }
  }

  function seat(node, greenWins) {
    node.seat.textContent = greenWins ? "Green seat" : "Red seat";
    node.seat.classList.toggle("is-g", greenWins);
    node.seat.classList.toggle("is-r", !greenWins);
  }

  var scene = S.el("div", "dist-scene");
  var row = S.el("div", "dist-row");
  var north = block();
  var smalls = [];
  var n;
  row.appendChild(north.root);
  for (n = 0; n < SMALL.length; n += 1) {
    smalls.push(block());
    row.appendChild(smalls[n].root);
  }
  var nation = S.el("div", "dist-nation");
  nation.appendChild(roof());
  var voteMeter = meter("Votes");
  var seatMeter = meter("Seats");
  var nationText = S.el("p", "dist-nation-text");
  nation.appendChild(voteMeter.root);
  nation.appendChild(seatMeter.root);
  nation.appendChild(nationText);
  scene.appendChild(row);
  scene.appendChild(nation);

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var eachBtn = S.button("Show each district", "btn");
  var totalBtn = S.button("Show national total", "btn");
  eachBtn.setAttribute("data-pace", "900");
  totalBtn.setAttribute("data-pace", "900");
  var toggles = S.el("div", "controls");
  toggles.appendChild(eachBtn);
  toggles.appendChild(totalBtn);

  var field = S.el("label", "field");
  var input = document.createElement("input");
  var read = S.el("b");
  input.type = "range";
  input.min = "10";
  input.max = "40";
  input.step = "5";
  input.value = "20";
  input.setAttribute("data-pace", "0");
  field.appendChild(document.createTextNode("Voters in North"));
  field.appendChild(input);
  field.appendChild(read);
  var sliders = S.el("div", "controls");
  sliders.appendChild(field);

  board.appendChild(scene);
  board.appendChild(caption);
  board.appendChild(toggles);
  board.appendChild(sliders);

  var national = false;
  var round = 0;

  function parts() {
    var voters = parseInt(input.value, 10);
    var g = voters * 3 / 5;
    var r = voters * 2 / 5;
    var green = g + 6;
    var red = r + 9;
    return { voters: voters, g: g, r: r, green: green, red: red, votes: green + red };
  }

  function paint(doSnap) {
    var data = parts();
    var i;
    var nodes = [row, nation];
    read.textContent = String(data.voters);
    north.title.textContent = "North · " + data.voters + " voters";
    fillBar(north, data.g, data.r, doSnap);
    seat(north, true);
    for (i = 0; i < smalls.length; i += 1) {
      smalls[i].title.textContent = SMALL[i].name + " · 5 voters";
      fillBar(smalls[i], SMALL[i].g, SMALL[i].r, doSnap);
      seat(smalls[i], false);
    }
    fillBar(voteMeter, data.green, data.red, doSnap);
    fillBar(seatMeter, 1, 3, doSnap);
    nationText.textContent = "Green " + data.green + " votes of " + data.votes + ", and 1 seat of 4. Red " + data.red + " votes of " + data.votes + ", and 3 seats of 4.";
    eachBtn.classList.toggle("is-on", !national);
    totalBtn.classList.toggle("is-on", national);
    if (doSnap) {
      for (i = 0; i < nodes.length; i += 1) nodes[i].style.setProperty("transition", "none", "important");
    }
    row.classList.toggle("is-away", national);
    nation.classList.toggle("is-on", national);
    if (doSnap) {
      void board.offsetWidth;
      for (i = 0; i < nodes.length; i += 1) nodes[i].style.removeProperty("transition");
    }
    return data;
  }

  function textFor(data) {
    if (!national) {
      return "North gives its seat to Green, " + data.g + " votes to " + data.r + ". East, South, and West each give the seat to Red, 3 votes to 2. In every district the seat matches the votes.";
    }
    return "Green has " + data.green + " votes of " + data.votes + " and 1 seat of 4. Red has " + data.red + " votes of " + data.votes + " and 3 seats of 4.";
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

  eachBtn.addEventListener("click", function () {
    national = false;
    show(false);
  });
  totalBtn.addEventListener("click", function () {
    national = true;
    show(false);
  });
  input.addEventListener("input", function () {
    caption.textContent = textFor(paint(false));
  });
  document.getElementById("again").addEventListener("click", function () {
    national = false;
    input.value = "20";
    show(true);
  });
  show(true);
})();
