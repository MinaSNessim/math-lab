(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var slips = S.el("div", "slips");
  var ballots = [
    ["A", "B", "C"],
    ["B", "C", "A"],
    ["C", "A", "B"]
  ];
  var slipOrders = [];
  var slipPicks = [];
  var friendFigs = [];
  function figure(color) {
    var img = document.createElement("img");
    img.src = "images/person.png";
    img.alt = "";
    img.className = "tone";
    img.style.borderBottom = "8px solid " + color;
    return img;
  }
  function cake(color) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 88 64");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path class="tone" d="M8 28c0-8 14-12 32-12s32 4 32 12v16c0 8-14 12-32 12S8 52 8 44z" fill="' + color + '" stroke="#0c1438" stroke-width="2.3"/>'
      + '<ellipse class="tone" cx="40" cy="28" rx="32" ry="11" fill="' + color + '" stroke="#0c1438" stroke-width="2.3"/>'
      + '<path d="M14 28q4-3.5 8 0t8 0 8 0 8 0 8 0 8 0" fill="none" stroke="#0c1438" stroke-width="1.5" stroke-linecap="round"/>'
      + '<path class="tone" d="M64 22l16 6v14l-16 6z" fill="' + color + '" stroke="#0c1438" stroke-width="2.2" stroke-linejoin="round"/>'
      + '<path d="M70 26q4-2.5 8 0" fill="none" stroke="#0c1438" stroke-width="1.3" stroke-linecap="round"/>';
    return svg;
  }
  [
    ["Friend 1", "A best, then B, then C", "#5ec5a7"],
    ["Friend 2", "B best, then C, then A", "#f5c518"],
    ["Friend 3", "C best, then A, then B", "#fe8e83"]
  ].forEach(function (parts) {
    var card = S.el("div", "slip is-wide");
    var svg = figure(parts[2]);
    friendFigs.push(svg);
    card.appendChild(svg);
    var who = S.el("b");
    who.textContent = parts[0];
    var order = S.el("span");
    order.className = "order";
    order.textContent = parts[1];
    var pick = S.el("span");
    pick.className = "pick";
    card.appendChild(who);
    card.appendChild(order);
    card.appendChild(pick);
    slips.appendChild(card);
    slipOrders.push(order);
    slipPicks.push(pick);
  });

  var places = S.split("Wins this pair", "Loses this pair");
  var outZone = S.zone("The restaurants");
  var bench = outZone.body;
  var tones = { A: "#5ec5a7", B: "#f5c518", C: "#fe8e83" };
  var spots = {};
  ["A", "B", "C"].forEach(function (label) {
    var one = S.person(label);
    var img = one.querySelector("img");
    img.parentNode.replaceChild(cake(tones[label]), img);
    bench.appendChild(one);
    spots[label] = one;
  });

  var row = S.el("div", "controls");
  var pairList = [["A", "B"], ["B", "C"], ["C", "A"]];
  pairList.forEach(function (pair) {
    var button = S.button(pair[0] + " versus " + pair[1]);
    button.setAttribute("data-a", pair[0]);
    button.setAttribute("data-b", pair[1]);
    row.appendChild(button);
  });
  var flip = S.button("Change friend 3's list");
  row.appendChild(flip);
  var caption = S.el("p", "caption");
  var seen = {};
  var flipped = false;
  var bars = S.chart([
    { label: "A", value: 0, text: "0 wins" },
    { label: "B", value: 0, text: "0 wins" },
    { label: "C", value: 0, text: "0 wins" }
  ]);
  board.appendChild(slips);
  board.appendChild(outZone.box);
  board.appendChild(places.wrap);
  board.appendChild(bars.box);
  board.appendChild(row);
  board.appendChild(caption);
  caption.textContent = "Green is A, yellow is B, and red is C. Press a pair. Only those two restaurants move.";

  function beats(a, b) {
    var n = 0;
    ballots.forEach(function (order) {
      if (order.indexOf(a) < order.indexOf(b)) n += 1;
    });
    return n;
  }
  function winner(a, b) {
    return beats(a, b) > beats(b, a) ? a : b;
  }
  function idleOf(a, b) {
    var names = ["A", "B", "C"];
    var i;
    for (i = 0; i < names.length; i += 1) {
      if (names[i] !== a && names[i] !== b) return names[i];
    }
    return "";
  }
  function seenTally() {
    var tally = { A: 0, B: 0, C: 0 };
    pairList.forEach(function (pair) {
      if (!seen[pair[0] + pair[1]]) return;
      tally[winner(pair[0], pair[1])] += 1;
    });
    return tally;
  }
  function paintBars() {
    var tally = seenTally();
    bars.set(["A", "B", "C"].map(function (name) {
      return {
        label: name,
        value: tally[name],
        text: tally[name] + (tally[name] === 1 ? " win" : " wins")
      };
    }));
  }
  function showPicks(a, b) {
    ballots.forEach(function (order, i) {
      var choice = order.indexOf(a) < order.indexOf(b) ? a : b;
      slipPicks[i].textContent = "Prefers " + choice;
    });
  }
  function buttonOf(node) {
    while (node && node !== row) {
      if (node.getAttribute && node.getAttribute("data-a")) return node;
      node = node.parentNode;
    }
    return null;
  }

  row.addEventListener("click", function (event) {
    var button = buttonOf(event.target);
    if (!button) return;
    var a = button.getAttribute("data-a");
    var b = button.getAttribute("data-b");
    var win = winner(a, b);
    var lose = win === a ? b : a;
    var idle = idleOf(a, b);
    seen[a + b] = true;
    button.classList.add("is-on");
    showPicks(a, b);
    S.send(spots[win], places.here);
    S.send(spots[lose], places.away);
    S.send(spots[idle], bench);
    places.hereZone.classList.add("is-here");
    outZone.name.textContent = "Not in this pair";
    paintBars();
    var friends = [];
    ballots.forEach(function (order, index) {
      if (order.indexOf(win) < order.indexOf(lose)) friends.push("Friend " + (index + 1));
    });
    var all = seen.AB && seen.BC && seen.CA;
    var line = idle + " is not in this vote, so " + idle + " does not lose. " + friends.join(" and ") + " prefer " + win + ". " + win + " wins 2 to 1.";
    if (all && !flipped) line += " A beats B, B beats C, and C beats A. No restaurant beats the other two.";
    if (all && flipped) line += " A beats both of the others.";
    S.say(caption, line, true);
  });

  flip.addEventListener("click", function () {
    if (flipped) return;
    flipped = true;
    flip.classList.add("is-on");
    ballots[2] = ["A", "C", "B"];
    slipOrders[2].textContent = "A best, then C, then B";
    var parts = friendFigs[2].querySelectorAll(".tone");
    var n;
    for (n = 0; n < parts.length; n += 1) parts[n].setAttribute("fill", "#5ec5a7");
    var i;
    for (i = 0; i < slipPicks.length; i += 1) slipPicks[i].textContent = "";
    seen = {};
    for (i = 0; i < row.children.length; i += 1) {
      if (row.children[i].getAttribute("data-a")) row.children[i].classList.remove("is-on");
    }
    S.send(spots.A, bench);
    S.send(spots.B, bench);
    S.send(spots.C, bench);
    places.hereZone.classList.remove("is-here");
    outZone.name.textContent = "The restaurants";
    paintBars();
    S.say(caption, "Friend 3 now ranks A, then C, then B. Press the pairs again. Only the two named restaurants move.", true);
  });
  document.getElementById("again").addEventListener("click", function () {
    ballots[2] = ["C", "A", "B"];
    slipOrders[2].textContent = "C best, then A, then B";
    friendFigs[2].style.borderBottom = "8px solid #fe8e83";
    var parts = friendFigs[2].querySelectorAll(".tone");
    var n;
    for (n = 0; n < parts.length; n += 1) parts[n].setAttribute("fill", "#fe8e83");
    flipped = false;
    flip.classList.remove("is-on");
    seen = {};
    var i;
    for (i = 0; i < slipPicks.length; i += 1) slipPicks[i].textContent = "";
    for (i = 0; i < row.children.length; i += 1) {
      if (row.children[i].getAttribute("data-a")) row.children[i].classList.remove("is-on");
    }
    S.send(spots.A, bench);
    S.send(spots.B, bench);
    S.send(spots.C, bench);
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.remove("is-here");
    outZone.name.textContent = "The restaurants";
    paintBars();
    S.say(caption, "Green is A, yellow is B, and red is C. Press a pair. Only those two restaurants move.", false);
  });
})();
