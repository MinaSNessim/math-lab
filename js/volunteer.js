(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function figure(color) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect class="tone" x="24" y="120" width="126" height="84" rx="30" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect class="tone" x="52" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect class="tone" x="94" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle class="tone" cx="87" cy="78" r="58" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function gateArt() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "gate-art");
    svg.setAttribute("viewBox", "0 0 160 150");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="22" y="16" width="22" height="118" rx="4" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="116" y="16" width="22" height="118" rx="4" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="22" y="14" width="116" height="18" rx="4" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="16" cy="78" r="9" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<polygon class="gate-broken" points="46,56 112,50 116,68 44,76" fill="' + RED + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      + '<polygon class="gate-broken" points="50,92 104,84 118,108 56,118" fill="' + RED + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      + '<rect class="gate-fixed" x="46" y="52" width="68" height="16" rx="3" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect class="gate-fixed" x="46" y="82" width="68" height="16" rx="3" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>';
    return svg;
  }

  function person(color, name, slot) {
    var box = S.el("div", "gate-person p" + slot);
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var mark = S.el("span", "gate-cost");
    mark.hidden = true;
    box.appendChild(title);
    box.appendChild(mark);
    return { box: box, mark: mark };
  }

  var people = [
    person(GREEN, "You", 0),
    person(RED, "Other", 1),
    person(RED, "Other", 2),
    person(RED, "Other", 3)
  ];
  var scene = S.el("div", "gate-scene");
  var gate = gateArt();
  var row = S.el("div", "gate-row");
  scene.appendChild(gate);
  people.forEach(function (one) { row.appendChild(one.box); });
  scene.appendChild(row);

  var presetRow = S.el("div", "controls");
  var presetLabel = S.el("span", "gate-label");
  presetLabel.textContent = "Others who volunteer";
  presetRow.appendChild(presetLabel);
  var presetNames = ["No one else", "1 other", "2 others", "3 others"];
  var presetButtons = [];
  presetNames.forEach(function (label, index) {
    var button = S.button(label, index === 0 ? "btn is-on" : "btn ghost");
    button.setAttribute("data-pace", "900");
    button.setAttribute("data-others", String(index));
    presetRow.appendChild(button);
    presetButtons.push(button);
  });

  var choiceRow = S.el("div", "controls");
  var goBtn = S.button("Volunteer", "btn");
  var waitBtn = S.button("Wait", "btn ghost");
  goBtn.setAttribute("data-pace", "900");
  waitBtn.setAttribute("data-pace", "900");
  choiceRow.appendChild(goBtn);
  choiceRow.appendChild(waitBtn);
  var caption = S.el("p", "caption");

  board.appendChild(scene);
  board.appendChild(presetRow);
  board.appendChild(choiceRow);
  board.appendChild(caption);

  var round = 0;
  var others = 0;
  var choice = "";
  var OPENING = "The gate is broken. One person can fix it.";

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, ms);
  }

  function sentence(youGo, count, fixed) {
    if (!fixed) return "Nobody fixed the gate. It stays broken. Everyone pays the larger cost.";
    if (youGo && count === 0) return "You fixed the gate. You paid the small cost. The others paid nothing.";
    if (!youGo && count === 1) return "One other person fixed the gate. They paid the small cost. You paid nothing.";
    if (!youGo) return count + " other people fixed the gate. They paid the small cost. You paid nothing.";
    if (count === 1) return "You and one other person fixed the gate. Each of you paid the small cost.";
    return "You and " + count + " others fixed the gate. Each of you paid the small cost.";
  }

  function clearMove() {
    people.forEach(function (one) {
      one.box.classList.remove("is-go");
      one.mark.hidden = true;
      one.mark.textContent = "";
      one.mark.className = "gate-cost";
    });
    gate.classList.remove("is-fixed");
  }

  function play() {
    round += 1;
    var mine = round;
    var youGo = choice === "go";
    var going = [youGo];
    var i;
    for (i = 0; i < 3; i += 1) going.push(i < others);
    var fixed = false;
    for (i = 0; i < going.length; i += 1) if (going[i]) fixed = true;
    clearMove();
    void scene.offsetWidth;
    gate.classList.toggle("is-fixed", fixed);
    for (i = 0; i < going.length; i += 1) {
      if (going[i]) people[i].box.classList.add("is-go");
      var pay = fixed ? going[i] : true;
      if (!pay) continue;
      people[i].mark.hidden = false;
      people[i].mark.textContent = fixed ? "Small cost" : "Big cost";
      people[i].mark.className = "gate-cost " + (fixed ? "is-small" : "is-big");
    }
    var line = sentence(youGo, others, fixed);
    later(mine, 900, function () {
      caption.textContent = line;
    });
  }

  function markChoice() {
    goBtn.className = "btn" + (choice === "go" ? " is-on" : " ghost");
    waitBtn.className = "btn" + (choice === "wait" ? " is-on" : " ghost");
  }

  presetButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      others = parseInt(button.getAttribute("data-others"), 10);
      presetButtons.forEach(function (other) {
        var on = other === button;
        other.className = "btn" + (on ? " is-on" : " ghost");
      });
      if (choice) play();
    });
  });

  goBtn.addEventListener("click", function () {
    choice = "go";
    markChoice();
    play();
  });

  waitBtn.addEventListener("click", function () {
    choice = "wait";
    markChoice();
    play();
  });

  function reset() {
    round += 1;
    others = 0;
    choice = "";
    presetButtons.forEach(function (button, index) {
      button.className = "btn" + (index === 0 ? " is-on" : " ghost");
    });
    markChoice();
    clearMove();
    caption.textContent = OPENING;
  }

  document.getElementById("again").addEventListener("click", reset);
  reset();
})();
