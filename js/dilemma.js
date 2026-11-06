(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var PAY = { CC: [1, 1], CD: [5, 0], DC: [0, 5], DD: [3, 3] };

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

  function years(n) {
    if (n === 0) return "Free";
    if (n === 1) return "1 year";
    return n + " years";
  }

  function person(color, name) {
    var box = S.el("div", "pd-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var tag = S.el("span", "game-tag");
    box.appendChild(title);
    box.appendChild(tag);
    return { box: box, tag: tag };
  }

  function frame() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "pd-frame");
    svg.setAttribute("viewBox", "0 0 220 250");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="8" y="8" width="204" height="234" rx="18" fill="#ffffff" stroke="' + YELLOW + '" stroke-width="12"/>'
      + '<rect x="28" y="28" width="164" height="194" rx="10" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    return svg;
  }

  function choiceButton(main, sub) {
    var btn = S.el("button", "btn");
    btn.type = "button";
    btn.setAttribute("data-pace", "900");
    var strong = S.el("b");
    strong.textContent = main;
    var small = S.el("span");
    small.textContent = sub;
    btn.appendChild(strong);
    btn.appendChild(small);
    return btn;
  }

  var you = person(GREEN, "You");
  var them = person(RED, "The other person");
  var youRoom = S.el("div", "pd-room");
  youRoom.appendChild(frame());
  youRoom.appendChild(you.box);
  var themRoom = S.el("div", "pd-room");
  themRoom.appendChild(frame());
  themRoom.appendChild(them.box);
  var rooms = S.el("div", "pd-rooms");
  rooms.appendChild(youRoom);
  rooms.appendChild(themRoom);

  var grid = S.el("div", "pd-grid");
  function head(text) {
    var node = S.el("div", "pd-label");
    node.textContent = text;
    return node;
  }
  grid.appendChild(head("Years"));
  grid.appendChild(head("They stay silent"));
  grid.appendChild(head("They confess"));
  var cells = {};
  function addRow(youKey, rowName) {
    grid.appendChild(head(rowName));
    var themKeys = ["C", "D"];
    var i;
    for (i = 0; i < themKeys.length; i += 1) {
      var key = youKey + themKeys[i];
      var pay = PAY[key];
      var cell = S.el("div", "pd-cell");
      var yours = S.el("span", "pd-chip pd-chip-you");
      yours.textContent = "You " + years(pay[0]);
      var theirs = S.el("span", "pd-chip pd-chip-them");
      theirs.textContent = "Them " + years(pay[1]);
      cell.appendChild(yours);
      cell.appendChild(theirs);
      grid.appendChild(cell);
      cells[key] = cell;
    }
  }
  addRow("C", "You stay silent");
  addRow("D", "You confess");

  var youC = choiceButton("Cooperate", "stay silent");
  var youD = choiceButton("Defect", "confess");
  var themC = choiceButton("They cooperate", "stay silent");
  var themD = choiceButton("They defect", "confess");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youC);
  youRow.appendChild(youD);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other person";
  themRow.appendChild(themWho);
  themRow.appendChild(themC);
  themRow.appendChild(themD);
  var controls = S.el("div", "controls game-split");
  controls.appendChild(youRow);
  controls.appendChild(themRow);
  var caption = S.el("p", "caption");

  board.appendChild(rooms);
  board.appendChild(grid);
  board.appendChild(controls);
  board.appendChild(caption);

  var youChoice = "";
  var themChoice = "";
  var round = 0;

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function lineFor(y, t) {
    if (y === "C" && t === "C") return "You both stay silent. You get 1 year. They get 1 year.";
    if (y === "D" && t === "D") return "You both confess. You get 3 years. They get 3 years.";
    if (y === "D") return "You confess and they stay silent. You go free. They get 5 years.";
    return "You stay silent and they confess. You get 5 years. They go free.";
  }

  function partial() {
    if (youChoice && !themChoice) {
      return (youChoice === "C" ? "You stay silent." : "You confess.") + " Set the other person's choice, before or after yours.";
    }
    if (themChoice && !youChoice) {
      return (themChoice === "C" ? "They stay silent." : "They confess.") + " You have not chosen yet.";
    }
    return "";
  }

  function paint(snap) {
    var key;
    var both = youChoice && themChoice;
    for (key in cells) {
      if (Object.prototype.hasOwnProperty.call(cells, key)) {
        cells[key].classList.toggle("is-pick", both && key === youChoice + themChoice);
      }
    }
    if (snap) {
      you.box.style.setProperty("transition", "none", "important");
      them.box.style.setProperty("transition", "none", "important");
    }
    you.box.classList.remove("is-dim", "is-bright");
    them.box.classList.remove("is-dim", "is-bright");
    if (!both) {
      you.tag.textContent = youChoice === "C" ? "Stays silent" : (youChoice === "D" ? "Confesses" : "");
      them.tag.textContent = themChoice === "C" ? "Stays silent" : (themChoice === "D" ? "Confesses" : "");
    } else {
      var pay = PAY[youChoice + themChoice];
      you.tag.textContent = years(pay[0]);
      them.tag.textContent = years(pay[1]);
      if (youChoice !== themChoice) {
        if (youChoice === "D") {
          you.box.classList.add("is-bright");
          them.box.classList.add("is-dim");
        } else {
          them.box.classList.add("is-bright");
          you.box.classList.add("is-dim");
        }
      }
    }
    if (snap) {
      void board.offsetWidth;
      you.box.style.removeProperty("transition");
      them.box.style.removeProperty("transition");
    }
  }

  function show(snap) {
    round += 1;
    var mine = round;
    youC.classList.toggle("is-on", youChoice === "C");
    youD.classList.toggle("is-on", youChoice === "D");
    themC.classList.toggle("is-on", themChoice === "C");
    themD.classList.toggle("is-on", themChoice === "D");
    paint(snap);
    var line = (youChoice && themChoice) ? lineFor(youChoice, themChoice) : partial();
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  youC.addEventListener("click", function () { youChoice = "C"; show(false); });
  youD.addEventListener("click", function () { youChoice = "D"; show(false); });
  themC.addEventListener("click", function () { themChoice = "C"; show(false); });
  themD.addEventListener("click", function () { themChoice = "D"; show(false); });

  document.getElementById("again").addEventListener("click", function () {
    youChoice = "";
    themChoice = "";
    show(true);
  });
  show(true);
})();
