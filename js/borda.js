(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var places = S.split("The ballots", "Ahead");
  var orders = [
    ["A", "B", "C"],
    ["A", "B", "C"],
    ["A", "B", "C"],
    ["B", "C", "A"],
    ["B", "C", "A"],
    ["C", "B", "A"],
    ["C", "B", "A"]
  ];
  var tones = { A: "#5ec5a7", B: "#f5c518", C: "#fe8e83" };
  function block(letter) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="14" y="8" width="36" height="64" rx="5" fill="#ffffff" stroke="#0c1438" stroke-width="2.4"/>'
      + '<path class="tone" d="M14 13a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v9H14z" fill="' + tones[letter] + '"/>'
      + '<path d="M22 36h20M22 46h20M22 56h12" fill="none" stroke="#0c1438" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
    return svg;
  }
  function paintBallot(card, order, hideC) {
    var shown = hideC ? order.filter(function (letter) { return letter !== "C"; }) : order.slice();
    var top = shown[0];
    card.setAttribute("data-rank", top);
    card.querySelector("b").textContent = top;
    card.querySelector(".tone").setAttribute("fill", tones[top]);
    var span = card.querySelector("span");
    while (span.firstChild) span.removeChild(span.firstChild);
    shown.forEach(function (letter, index) {
      var line = document.createElement("span");
      line.className = "line";
      line.textContent = (index + 1) + ". " + letter;
      span.appendChild(line);
    });
  }
  var cards = orders.map(function (order) {
    var card = S.el("div", "slip mover");
    card.appendChild(block(order[0]));
    card.appendChild(S.el("b"));
    card.appendChild(S.el("span"));
    places.here.appendChild(card);
    paintBallot(card, order, false);
    return card;
  });
  var score = S.el("p", "pile-count");
  var row = S.el("div", "controls");
  var first = S.button("Add only the top name");
  var whole = S.button("Add 2, then 1, then 0");
  var drop = S.button("Cross C off");
  var give = S.button("Move one B ballot to A");
  [first, whole, drop, give].forEach(function (button) { button.setAttribute("data-pace", "700"); });
  row.appendChild(first);
  row.appendChild(whole);
  row.appendChild(drop);
  row.appendChild(give);
  var caption = S.el("p", "caption");
  var firstLabel = S.el("p", "side-label");
  firstLabel.textContent = "Tops only: 1 point for line 1";
  var firstBars = S.chart([
    { label: "A", value: 0, text: "not yet" },
    { label: "B", value: 0, text: "not yet" },
    { label: "C", value: 0, text: "not yet" }
  ]);
  var pointLabel = S.el("p", "side-label");
  pointLabel.textContent = "Whole list: 2, then 1, then 0";
  var pointBars = S.chart([
    { label: "A", value: 0, text: "not yet" },
    { label: "B", value: 0, text: "not yet" },
    { label: "C", value: 0, text: "not yet" }
  ]);
  board.appendChild(places.wrap);
  board.appendChild(firstLabel);
  board.appendChild(firstBars.box);
  board.appendChild(pointLabel);
  board.appendChild(pointBars.box);
  board.appendChild(score);
  board.appendChild(row);
  board.appendChild(caption);

  function counts(kind) {
    var tally = { A: 0, B: 0, C: 0 };
    orders.forEach(function (order) {
      if (kind === "first") tally[order[0]] += 1;
      if (kind === "points") {
        tally[order[0]] += 2;
        tally[order[1]] += 1;
      }
      if (kind === "drop") {
        var i = 0;
        while (order[i] === "C") i += 1;
        tally[order[i]] += 1;
      }
    });
    return tally;
  }
  function tint(box) {
    var colors = ["#5ec5a7", "#f5c518", "#fe8e83"];
    var fills = box.querySelectorAll(".fill");
    var i;
    for (i = 0; i < fills.length; i += 1) fills[i].style.background = colors[i];
  }
  function paintCharts(tied) {
    var placesTally = counts("first");
    var pointsTally = counts("points");
    firstBars.set(["A", "B", "C"].map(function (name) {
      return { label: name, value: placesTally[name], text: String(placesTally[name]) };
    }));
    pointBars.set(["A", "B", "C"].map(function (name) {
      return { label: name, value: pointsTally[name], text: String(pointsTally[name]), hot: !tied && name === "B" && pointsTally.B > pointsTally.A };
    }));
    tint(firstBars.box);
    tint(pointBars.box);
  }

  var given = false;
  function mark(which) {
    [first, whole, drop, give].forEach(function (button) { button.classList.remove("is-on"); });
    which.classList.add("is-on");
  }

  function park(ahead) {
    cards.forEach(function (card) {
      var rank = card.getAttribute("data-rank");
      S.send(card, ahead.indexOf(rank) !== -1 ? places.away : places.here);
    });
    places.awayZone.classList.add("is-here");
  }

  function placesOf(name) {
    var firsts = 0;
    var seconds = 0;
    orders.forEach(function (order) {
      if (order[0] === name) firsts += 1;
      if (order[1] === name) seconds += 1;
    });
    return { firsts: firsts, seconds: seconds, points: firsts * 2 + seconds };
  }
  function showRanks() {
    cards.forEach(function (card, index) {
      paintBallot(card, orders[index], false);
    });
  }

  function rows(tally) {
    return ["A", "B", "C"].map(function (name) {
      return { label: name, value: tally[name], text: String(tally[name]) };
    });
  }
  first.addEventListener("click", function () {
    mark(first);
    showRanks();
    var tally = counts("first");
    park(["A"]);
    firstBars.set(rows(tally));
    tint(firstBars.box);
    score.textContent = "Top name only: A " + tally.A + ", B " + tally.B + ", C " + tally.C;
    S.say(caption, "Only line 1 counts, and it is worth 1. A is on top " + tally.A + " times. B is on top " + tally.B + " times. C is on top " + tally.C + " times. " + (tally.A > tally.B && tally.A > tally.C ? "A is ahead." : "No single name is ahead."), true);
  });
  whole.addEventListener("click", function () {
    mark(whole);
    showRanks();
    var tally = counts("points");
    var ahead = tally.B > tally.A ? "B" : tally.A > tally.B ? "A" : "";
    park(ahead ? [ahead] : ["A", "B"]);
    pointBars.set(rows(tally));
    tint(pointBars.box);
    score.textContent = "Whole list: A " + tally.A + ", B " + tally.B + ", C " + tally.C;
    var parts = ["A", "B", "C"].map(function (name) {
      var row = placesOf(name);
      return name + " has " + row.firsts + " tops and " + row.seconds + " middles, so " + row.points;
    });
    S.say(caption, "Line 1 is 2 points. Line 2 is 1 point. Line 3 is 0. " + parts.join(". ") + ". " + (ahead ? ahead + " wins this count." : "A and B tie."), true);
  });
  drop.addEventListener("click", function () {
    mark(drop);
    cards.forEach(function (card, index) {
      paintBallot(card, orders[index], true);
    });
    var tally = counts("drop");
    var dropLead = tally.A === tally.B ? "" : tally.A > tally.B ? "A" : "B";
    park(dropLead ? [dropLead] : ["A", "B"]);
    firstBars.set(rows(tally));
    tint(firstBars.box);
    score.textContent = "Top name with C crossed off: A " + tally.A + ", B " + tally.B;
    S.say(caption, "C is crossed off, so line 1 is the next name. A is on top " + tally.A + " times. B is on top " + tally.B + " times. " + (dropLead ? dropLead + " is ahead." : "A and B tie."), true);
  });
  give.addEventListener("click", function () {
    if (given) return;
    var index = -1;
    var i;
    for (i = 0; i < orders.length; i += 1) {
      if (orders[i][0] === "B" && orders[i][1] === "C") index = i;
    }
    if (index === -1) return;
    orders[index] = ["A", "B", "C"];
    given = true;
    mark(give);
    showRanks();
    paintCharts(true);
    var placesTally = counts("first");
    var pointsTally = counts("points");
    park(["A"]);
    score.textContent = "Tops A " + placesTally.A + ", B " + placesTally.B + ", C " + placesTally.C + ". Whole list A " + pointsTally.A + ", B " + pointsTally.B + ", C " + pointsTally.C;
    var moved = ["A", "B", "C"].map(function (name) {
      var row = placesOf(name);
      return name + " " + row.points + " (" + row.firsts + " tops, " + row.seconds + " middles)";
    });
    S.say(caption, "One ballot that said B, then C, then A now says A, then B, then C. Tops only: A " + placesTally.A + ", B " + placesTally.B + ", C " + placesTally.C + ". A is still ahead on tops. Whole list: " + moved.join(", ") + ". A and B tie.", true);
  });
  tint(firstBars.box);
  tint(pointBars.box);
  score.textContent = "Not added yet. Each ballot already shows its order.";
  caption.textContent = "Line 1 is the top name. Three ballots are 1. A, 2. B, 3. C. Two are 1. B, 2. C, 3. A. Two are 1. C, 2. B, 3. A. Press a count to add them.";
  document.getElementById("again").addEventListener("click", function () {
    var fresh = [
      ["A", "B", "C"],
      ["A", "B", "C"],
      ["A", "B", "C"],
      ["B", "C", "A"],
      ["B", "C", "A"],
      ["C", "B", "A"],
      ["C", "B", "A"]
    ];
    var i;
    for (i = 0; i < orders.length; i += 1) orders[i] = fresh[i].slice();
    given = false;
    [first, whole, drop, give].forEach(function (button) { button.classList.remove("is-on"); });
    showRanks();
    cards.forEach(function (card) { S.send(card, places.here); });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.remove("is-here");
    firstBars.set(["A", "B", "C"].map(function (label) {
      return { label: label, value: 0, text: "not yet" };
    }));
    pointBars.set(["A", "B", "C"].map(function (label) {
      return { label: label, value: 0, text: "not yet" };
    }));
    tint(firstBars.box);
    tint(pointBars.box);
    score.textContent = "Not added yet. Each ballot already shows its order.";
    S.say(caption, "Line 1 is the top name. Three ballots are 1. A, 2. B, 3. C. Two are 1. B, 2. C, 3. A. Two are 1. C, 2. B, 3. A. Press a count to add them.", false);
  });
})();
