(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var marks = S.el("div", "folk");
  var chips = [];
  var i;
  for (i = 0; i < 3; i += 1) {
    var chip = S.el("div", "one");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="14" y="8" width="36" height="64" rx="5" fill="#ffffff" stroke="#0c1438" stroke-width="2.4"/>'
      + '<path class="tone" d="M14 13a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v9H14z" fill="#5ec5a7"/>'
      + '<text x="32" y="16" text-anchor="middle" font-size="11" font-family="Nunito, sans-serif" font-weight="800" fill="#0c1438">' + (i + 1) + "</text>"
      + '<path d="M22 36h20M22 46h20M22 56h12" fill="none" stroke="#0c1438" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
    var chipName = S.el("b");
    chipName.textContent = ["The park", "The road", "The clinic"][i];
    chip.appendChild(svg);
    chip.appendChild(chipName);
    marks.appendChild(chip);
    chips.push(chip);
  }
  var places = S.split("The voters", "Voted no");
  var losses = [0, 0, 0, 0, 0];
  var people = [];
  var tones = ["#fe8e83", "#fe8e83", "#fe8e83", "#f5c518", "#f5c518"];
  function figure(color) {
    var img = document.createElement("img");
    img.src = "images/person.png";
    img.alt = "";
    img.className = "tone";
    img.style.borderBottom = "8px solid " + color;
    return img;
  }
  for (i = 0; i < 5; i += 1) {
    var one = S.person("Voter " + (i + 1));
    var img = one.querySelector("img");
    img.parentNode.replaceChild(figure(tones[i]), img);
    people.push(one);
    places.here.appendChild(one);
  }
  var issues = [[0, 1], [0, 2], [1, 2]];
  var seen = [false, false, false];
  var row = S.el("div", "controls");
  for (i = 0; i < 3; i += 1) {
    var button = S.button(["The park", "The road", "The clinic"][i]);
    button.setAttribute("data-i", String(i));
    button.setAttribute("data-pace", "700");
    row.appendChild(button);
  }
  var shift = S.button("Voter 4 votes no on the park");
  shift.setAttribute("data-pace", "700");
  row.appendChild(shift);
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var bars = S.chart([
    { label: "Plans that passed", value: 0, text: "0 of 3", scale: 3 }
  ]);
  board.appendChild(marks);
  board.appendChild(places.wrap);
  board.appendChild(bars.box);
  board.appendChild(row);
  board.appendChild(caption);

  function openedCount() {
    return seen.filter(function (flag) { return flag; }).length;
  }
  function passedCount() {
    var n = 0;
    issues.forEach(function (losers, index) {
      if (seen[index] && losers.length < 3) n += 1;
    });
    return n;
  }
  function paintChips() {
    chips.forEach(function (chip, index) {
      var fails = issues[index].length >= 3;
      chip.querySelector(".tone").setAttribute("fill", fails ? "#fe8e83" : "#5ec5a7");
      var name = chip.querySelector("b");
      if (fails) name.textContent = "Did not pass";
      else if (seen[index]) name.textContent = "Passed";
      else name.textContent = ["The park", "The road", "The clinic"][index];
    });
  }
  function paintBars() {
    var passed = passedCount();
    var opened = openedCount();
    bars.set([
      { label: "Plans that passed", value: passed, text: passed + " of 3", scale: 3, hot: opened > 0 && passed < opened }
    ]);
  }
  function recount() {
    var voter;
    for (voter = 0; voter < 5; voter += 1) losses[voter] = 0;
    var issue;
    for (issue = 0; issue < 3; issue += 1) {
      if (!seen[issue]) continue;
      issues[issue].forEach(function (who) { losses[who] += 1; });
    }
  }
  function paint(wait) {
    var opened = openedCount();
    people.forEach(function (node, index) {
      node.querySelector("span").textContent = opened ? (losses[index] ? "Lost " + losses[index] : "No loss") : "";
    });
    var passed = passedCount();
    var plans = ["The park", "The road", "The clinic"];
    var line = "The three pages are the park, the road, and the clinic. Red voters are the larger group. Yellow voters are the smaller group. Open a plan.";
    if (opened && opened < 3) {
      line = seen.last === 0 && issues[0].length > 2
        ? "The park has 3 no votes, so it does not pass. " + (3 - opened) + " plans are still closed."
        : plans[seen.last] + " passed, 3 yes to 2 no. " + (3 - opened) + " plans are still closed.";
    }
    if (opened === 3 && issues[0].length < 3) line = "Voters 1, 2, and 3 each lost 2 of the 3 plans. Voters 4 and 5 lost none. The park, the road, and the clinic each passed, 3 yes to 2 no.";
    if (opened === 3 && issues[0].length > 2) line = "The park has 3 no votes, so it does not pass. " + passed + " plans passed. Voters 1, 2, and 3 still lost 2.";
    S.say(caption, line, wait);
  }
  function buttonOf(node) {
    while (node && node !== row) {
      if (node.getAttribute && node.getAttribute("data-i") != null) return node;
      node = node.parentNode;
    }
    return null;
  }

  row.addEventListener("click", function (event) {
    var button = buttonOf(event.target);
    if (!button) return;
    var index = Number(button.getAttribute("data-i"));
    if (seen[index]) return;
    seen[index] = true;
    seen.last = index;
    button.classList.add("is-on");
    recount();
    people.forEach(function (node, voter) {
      var lost = issues[index].indexOf(voter) !== -1;
      S.send(node, lost ? places.away : places.here);
    });
    paintChips();
    paintBars();
    places.awayZone.classList.add("is-here");
    paint(true);
  });

  shift.addEventListener("click", function () {
    if (issues[0].indexOf(3) !== -1) return;
    issues[0].push(3);
    shift.classList.add("is-on");
    recount();
    paintChips();
    paintBars();
    people.forEach(function (node, index) {
      node.querySelector("span").textContent = openedCount() ? (losses[index] ? "Lost " + losses[index] : "No loss") : "";
    });
    if (seen[0]) {
      people.forEach(function (node, voter) {
        S.send(node, issues[0].indexOf(voter) !== -1 ? places.away : places.here);
      });
      places.awayZone.classList.add("is-here");
    }
    var line = "Voter 4 now votes no on the park. The park has 3 no votes, so it does not pass.";
    if (openedCount()) line += " Plans that passed: " + passedCount() + " of 3.";
    if (openedCount() === 3) line += " Voters 1, 2, and 3 still lost 2.";
    S.say(caption, line, true);
  });

  paint(false);
  document.getElementById("again").addEventListener("click", function () {
    issues[0] = [0, 1];
    seen = [false, false, false];
    var buttons = row.querySelectorAll("button");
    var b;
    for (b = 0; b < buttons.length; b += 1) buttons[b].classList.remove("is-on");
    people.forEach(function (node) { S.send(node, places.here); });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.remove("is-here");
    recount();
    paintChips();
    paintBars();
    paint(false);
  });
})();
