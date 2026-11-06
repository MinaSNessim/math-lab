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

  function person(color, name) {
    var box = S.el("div", "rep-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var score = S.el("span", "game-tag");
    score.textContent = "0";
    box.appendChild(title);
    box.appendChild(score);
    return { box: box, score: score };
  }

  var you = person(GREEN, "You");
  var them = person(RED, "Partner");
  var people = S.el("div", "rep-people");
  people.appendChild(you.box);
  people.appendChild(them.box);

  var rail = S.el("div", "rep-rail");
  var marks = [];
  var n;
  for (n = 0; n < 10; n += 1) {
    var mark = S.el("div", "rep-mark");
    var mine = S.el("span", "rep-half rep-you");
    var theirs = S.el("span", "rep-half rep-them");
    mark.appendChild(mine);
    mark.appendChild(theirs);
    rail.appendChild(mark);
    marks.push({ box: mark, you: mine, them: theirs });
  }
  var key = S.el("p", "rep-key");
  key.textContent = "Each chip is one round. Your half is on the left. Green is cooperate. Red is defect.";

  var coop = S.button("Cooperate", "btn");
  coop.setAttribute("data-pace", "900");
  var defect = S.button("Defect", "btn");
  defect.setAttribute("data-pace", "900");
  var ten = S.button("Play 10 rounds", "btn");
  ten.setAttribute("data-pace", "900");
  var select = document.createElement("select");
  select.id = "partner-plan";
  var options = [
    ["coop", "Always cooperates"],
    ["defect", "Always defects"],
    ["tat", "Copies your last move (starts by cooperating)"],
    ["forgive", "Forgives one slip (defects only after two defects in a row)"]
  ];
  var i;
  for (i = 0; i < options.length; i += 1) {
    var opt = document.createElement("option");
    opt.value = options[i][0];
    opt.textContent = options[i][1];
    select.appendChild(opt);
  }
  select.value = "tat";
  var partnerLab = S.el("label", "field");
  partnerLab.setAttribute("for", "partner-plan");
  partnerLab.appendChild(document.createTextNode("Partner"));
  partnerLab.appendChild(select);
  var controls = S.el("div", "controls game-split");
  var row = S.el("div", "game-row");
  row.appendChild(coop);
  row.appendChild(defect);
  row.appendChild(ten);
  controls.appendChild(row);
  controls.appendChild(partnerLab);
  var caption = S.el("p", "caption");

  board.appendChild(people);
  board.appendChild(rail);
  board.appendChild(key);
  board.appendChild(controls);
  board.appendChild(caption);

  var history = [];
  var myMove = "";
  var round = 0;
  var NAMES = {
    coop: "always cooperates",
    defect: "always defects",
    tat: "copies your last move and starts by cooperating",
    forgive: "forgives one slip, and defects only after two defects in a row"
  };

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function points(y, t) {
    if (y === "C" && t === "C") return [3, 3];
    if (y === "D" && t === "D") return [1, 1];
    if (y === "D") return [5, 0];
    return [0, 5];
  }

  function partnerMove() {
    var plan = select.value;
    if (plan === "coop") return "C";
    if (plan === "defect") return "D";
    if (plan === "tat") {
      if (!history.length) return "C";
      return history[history.length - 1].you;
    }
    if (history.length < 2) return "C";
    var last = history[history.length - 1].you;
    var before = history[history.length - 2].you;
    if (last === "D" && before === "D") return "D";
    return "C";
  }

  function totals() {
    var y = 0;
    var t = 0;
    var k;
    for (k = 0; k < history.length; k += 1) {
      y += history[k].yp;
      t += history[k].tp;
    }
    return [y, t];
  }

  function word(move) { return move === "C" ? "cooperate" : "defect"; }

  function paintMarks(snap) {
    var k;
    for (k = 0; k < marks.length; k += 1) {
      var mark = marks[k];
      mark.you.className = "rep-half rep-you";
      mark.them.className = "rep-half rep-them";
      if (snap) mark.box.style.setProperty("transition", "none", "important");
      if (k < history.length) {
        mark.you.classList.add(history[k].you === "C" ? "is-c" : "is-d");
        mark.them.classList.add(history[k].them === "C" ? "is-c" : "is-d");
        mark.box.style.transitionDelay = snap ? "0ms" : (k * 45) + "ms";
        mark.box.classList.add("is-played");
      } else {
        mark.box.style.transitionDelay = "0ms";
        mark.box.classList.remove("is-played");
      }
    }
    if (snap) {
      void board.offsetWidth;
      for (k = 0; k < marks.length; k += 1) marks[k].box.style.removeProperty("transition");
    }
  }

  function applyScores(tot) {
    you.score.textContent = String(tot[0]);
    them.score.textContent = String(tot[1]);
  }

  function commit(snap, line) {
    round += 1;
    var mine = round;
    coop.classList.toggle("is-on", myMove === "C");
    defect.classList.toggle("is-on", myMove === "D");
    paintMarks(snap);
    var tot = totals();
    if (snap) {
      applyScores(tot);
      caption.textContent = line;
      return;
    }
    later(mine, function () {
      applyScores(tot);
      caption.textContent = line;
    });
  }

  function oneLine() {
    var last = history[history.length - 1];
    var tot = totals();
    return "Round " + history.length + ". You " + word(last.you) + " and they " + word(last.them) + ". This round you get " + last.yp + " and they get " + last.tp + ". You have " + tot[0] + ". They have " + tot[1] + ".";
  }

  function tenLine() {
    var tot = totals();
    return "Ten rounds. You " + word(myMove) + " each time. Your partner " + NAMES[select.value] + ". You have " + tot[0] + ". They have " + tot[1] + ".";
  }

  function playOne(move) {
    myMove = move;
    if (history.length >= 10) {
      coop.classList.toggle("is-on", myMove === "C");
      defect.classList.toggle("is-on", myMove === "D");
      caption.textContent = "Ten rounds are already on the line. Play again, or press Play 10 rounds for a fresh set.";
      return;
    }
    var themMove = partnerMove();
    var pts = points(move, themMove);
    history.push({ you: move, them: themMove, yp: pts[0], tp: pts[1] });
    commit(false, oneLine());
  }

  function clearPlayed() {
    var k;
    for (k = 0; k < marks.length; k += 1) {
      marks[k].box.style.setProperty("transition", "none", "important");
      marks[k].box.classList.remove("is-played");
      marks[k].you.className = "rep-half rep-you";
      marks[k].them.className = "rep-half rep-them";
    }
    void board.offsetWidth;
    for (k = 0; k < marks.length; k += 1) marks[k].box.style.removeProperty("transition");
  }

  function playTen() {
    if (!myMove) {
      caption.textContent = "Pick Cooperate or Defect. Those 10 rounds use that choice each time.";
      return;
    }
    clearPlayed();
    history = [];
    var k;
    for (k = 0; k < 10; k += 1) {
      var themMove = partnerMove();
      var pts = points(myMove, themMove);
      history.push({ you: myMove, them: themMove, yp: pts[0], tp: pts[1] });
    }
    commit(false, tenLine());
  }

  coop.addEventListener("click", function () { playOne("C"); });
  defect.addEventListener("click", function () { playOne("D"); });
  ten.addEventListener("click", playTen);
  select.addEventListener("change", function () {
    history = [];
    commit(true, "Partner now " + NAMES[select.value] + ". The score starts again.");
  });

  document.getElementById("again").addEventListener("click", function () {
    history = [];
    myMove = "";
    select.value = "tat";
    commit(true, "");
  });
  commit(true, "");
})();
