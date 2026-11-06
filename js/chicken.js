(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function carArt(body, glass) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 90 120");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="16" y="4" width="58" height="16" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="28" cy="30" r="8" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="62" cy="30" r="8" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="12" y="40" width="66" height="52" rx="12" fill="' + body + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="22" y="50" width="46" height="24" rx="6" fill="' + glass + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="8" y="86" width="14" height="26" rx="4" fill="' + INK + '"/>'
      + '<rect x="68" y="86" width="14" height="26" rx="4" fill="' + INK + '"/>';
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

  var scene = S.el("div", "chk-scene");
  var road = document.createElementNS(SVG, "svg");
  road.setAttribute("class", "chk-road");
  road.setAttribute("viewBox", "0 0 200 280");
  road.setAttribute("preserveAspectRatio", "none");
  road.setAttribute("aria-hidden", "true");
  road.innerHTML = '<rect x="40" y="0" width="120" height="280" fill="#e7eef8" stroke="' + INK + '" stroke-width="4"/>'
    + '<rect x="92" y="16" width="16" height="28" rx="3" fill="' + YELLOW + '"/>'
    + '<rect x="92" y="68" width="16" height="28" rx="3" fill="' + YELLOW + '"/>'
    + '<rect x="92" y="120" width="16" height="28" rx="3" fill="' + YELLOW + '"/>'
    + '<rect x="92" y="172" width="16" height="28" rx="3" fill="' + YELLOW + '"/>'
    + '<rect x="92" y="224" width="16" height="28" rx="3" fill="' + YELLOW + '"/>';
  var flash = S.el("div", "chk-flash");
  var youCar = S.el("div", "chk-car chk-you");
  youCar.appendChild(carArt(GREEN, RED));
  var themCar = S.el("div", "chk-car chk-them");
  themCar.appendChild(carArt(RED, GREEN));
  var youTag = S.el("span", "game-tag");
  var themTag = S.el("span", "game-tag");
  youTag.textContent = "You";
  themTag.textContent = "The other driver";
  var youWrap = S.el("div", "chk-driver chk-you-tag");
  var themWrap = S.el("div", "chk-driver chk-them-tag");
  youWrap.appendChild(youTag);
  themWrap.appendChild(themTag);
  scene.appendChild(road);
  scene.appendChild(flash);
  scene.appendChild(youCar);
  scene.appendChild(themCar);
  scene.appendChild(youWrap);
  scene.appendChild(themWrap);

  var youS = choiceButton("Swerve", "turn off the road");
  var youH = choiceButton("Straight", "keep going");
  var themS = choiceButton("They swerve", "turn off the road");
  var themH = choiceButton("They go straight", "keep going");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youS);
  youRow.appendChild(youH);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other driver";
  themRow.appendChild(themWho);
  themRow.appendChild(themS);
  themRow.appendChild(themH);
  var controls = S.el("div", "controls game-split");
  controls.appendChild(youRow);
  controls.appendChild(themRow);
  var caption = S.el("p", "caption");

  board.appendChild(scene);
  board.appendChild(controls);
  board.appendChild(caption);

  var youMove = "";
  var themMove = "";
  var round = 0;

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function shift(el, move, who, snap) {
    var w = scene.clientWidth || 320;
    var off = Math.round(Math.min(w * 0.3, 150));
    var rise = Math.round((scene.clientHeight || 280) * 0.12);
    var x = 0;
    var y = 0;
    var rot = 0;
    if (move === "S") {
      x = who === "you" ? -off : off;
      y = who === "you" ? -16 : 16;
      rot = who === "you" ? -28 : 28;
    } else if (move === "H") {
      y = who === "you" ? -rise : rise;
    }
    if (snap) el.style.setProperty("transition", "none", "important");
    el.style.transform = "translate(" + x + "px, " + y + "px) rotate(" + rot + "deg)";
    if (snap) {
      void el.offsetWidth;
      el.style.removeProperty("transition");
    }
  }

  function outcome() {
    if (youMove === "S" && themMove === "S") return "You both swerve. Each of you loses a little pride.";
    if (youMove === "H" && themMove === "S") return "You drive straight and they swerve. You win. They lose pride.";
    if (youMove === "S" && themMove === "H") return "You swerve and they drive straight. They win. You lose pride.";
    if (youMove === "H" && themMove === "H") return "You both drive straight. You crash.";
    if (youMove && !themMove) return (youMove === "S" ? "You swerve." : "You drive straight.") + " Set the other driver's choice, before or after yours.";
    if (themMove && !youMove) return (themMove === "S" ? "They swerve." : "They drive straight.") + " You have not chosen yet.";
    return "";
  }

  function tagFor(mine, other) {
    if (!mine || !other) return mine === "S" ? "Swerve" : (mine === "H" ? "Straight" : "");
    if (mine === "H" && other === "H") return "Crash";
    if (mine === "H") return "Wins";
    if (other === "H") return "Loses pride";
    return "Loses a little pride";
  }

  function show(snap) {
    round += 1;
    var mine = round;
    youS.classList.toggle("is-on", youMove === "S");
    youH.classList.toggle("is-on", youMove === "H");
    themS.classList.toggle("is-on", themMove === "S");
    themH.classList.toggle("is-on", themMove === "H");
    shift(youCar, youMove, "you", snap);
    shift(themCar, themMove, "them", snap);
    flash.classList.toggle("is-on", youMove === "H" && themMove === "H");
    youTag.textContent = tagFor(youMove, themMove) || "You";
    themTag.textContent = tagFor(themMove, youMove) || "The other driver";
    var line = outcome();
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  youS.addEventListener("click", function () { youMove = "S"; show(false); });
  youH.addEventListener("click", function () { youMove = "H"; show(false); });
  themS.addEventListener("click", function () { themMove = "S"; show(false); });
  themH.addEventListener("click", function () { themMove = "H"; show(false); });
  window.addEventListener("resize", function () { show(true); });

  document.getElementById("again").addEventListener("click", function () {
    youMove = "";
    themMove = "";
    show(true);
  });
  show(true);
})();
