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

  function door(panel) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 120 160");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="6" y="6" width="108" height="148" rx="10" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="4"/>'
      + '<rect x="20" y="20" width="80" height="120" rx="6" fill="' + panel + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="84" cy="86" r="7" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2"/>';
    return svg;
  }

  function choiceButton(main) {
    var btn = S.button(main, "btn");
    btn.setAttribute("data-pace", "900");
    return btn;
  }

  function person(color, name) {
    var box = S.el("div", "meet-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var tag = S.el("span", "game-tag");
    box.appendChild(title);
    box.appendChild(tag);
    return { box: box, tag: tag };
  }

  var scene = S.el("div", "meet-scene");
  var leftDoor = S.el("div", "meet-door meet-left");
  leftDoor.appendChild(door(GREEN));
  var leftName = S.el("b");
  leftName.textContent = "Left";
  leftDoor.appendChild(leftName);
  var rightDoor = S.el("div", "meet-door meet-right");
  rightDoor.appendChild(door(RED));
  var rightName = S.el("b");
  rightName.textContent = "Right";
  rightDoor.appendChild(rightName);
  var you = person(GREEN, "You");
  var them = person(RED, "The other person");
  scene.appendChild(leftDoor);
  scene.appendChild(rightDoor);
  scene.appendChild(you.box);
  scene.appendChild(them.box);

  var youL = choiceButton("Left");
  var youR = choiceButton("Right");
  var themL = choiceButton("They pick Left");
  var themR = choiceButton("They pick Right");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youL);
  youRow.appendChild(youR);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other person";
  themRow.appendChild(themWho);
  themRow.appendChild(themL);
  themRow.appendChild(themR);
  var controls = S.el("div", "controls game-split");
  controls.appendChild(youRow);
  controls.appendChild(themRow);
  var caption = S.el("p", "caption");
  board.appendChild(scene);
  board.appendChild(controls);
  board.appendChild(caption);

  var youPick = "";
  var themPick = "";
  var round = 0;

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function xFor(who, pick, w) {
    if (who === "you") {
      if (pick === "L") return 8;
      if (pick === "R") return Math.max(w - 200, 140);
      return Math.round(w * 0.28);
    }
    if (pick === "L") return 96;
    if (pick === "R") return Math.max(w - 100, 190);
    return Math.round(w * 0.52);
  }

  function move(el, who, pick, snap) {
    var w = scene.clientWidth || 320;
    var x = xFor(who, pick, w);
    var y = pick ? -Math.round(Math.min(136, (scene.clientHeight || 320) * 0.42)) : 0;
    if (snap) el.style.setProperty("transition", "none", "important");
    el.style.transform = "translate(" + x + "px, " + y + "px)";
    if (snap) {
      void el.offsetWidth;
      el.style.removeProperty("transition");
    }
  }

  function lineFor() {
    if (youPick && themPick && youPick === themPick) {
      return "You both pick " + (youPick === "L" ? "Left" : "Right") + ". You both win.";
    }
    if (youPick && themPick) return "You pick " + (youPick === "L" ? "Left" : "Right") + " and they pick " + (themPick === "L" ? "Left" : "Right") + ". You both get nothing.";
    if (youPick) return "You pick " + (youPick === "L" ? "Left" : "Right") + ". The other person has not chosen yet.";
    if (themPick) return "They pick " + (themPick === "L" ? "Left" : "Right") + ". You have not chosen yet.";
    return "";
  }

  function show(snap) {
    round += 1;
    var mine = round;
    youL.classList.toggle("is-on", youPick === "L");
    youR.classList.toggle("is-on", youPick === "R");
    themL.classList.toggle("is-on", themPick === "L");
    themR.classList.toggle("is-on", themPick === "R");
    move(you.box, "you", youPick, snap);
    move(them.box, "them", themPick, snap);
    var matched = youPick && themPick && youPick === themPick;
    var missed = youPick && themPick && youPick !== themPick;
    you.tag.textContent = matched ? "Win" : (missed ? "Nothing" : "");
    them.tag.textContent = matched ? "Win" : (missed ? "Nothing" : "");
    leftDoor.classList.toggle("is-lit", matched && youPick === "L");
    rightDoor.classList.toggle("is-lit", matched && youPick === "R");
    var line = lineFor();
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  youL.addEventListener("click", function () { youPick = "L"; show(false); });
  youR.addEventListener("click", function () { youPick = "R"; show(false); });
  themL.addEventListener("click", function () { themPick = "L"; show(false); });
  themR.addEventListener("click", function () { themPick = "R"; show(false); });
  window.addEventListener("resize", function () { show(true); });

  document.getElementById("again").addEventListener("click", function () {
    youPick = "";
    themPick = "";
    show(true);
  });
  show(true);
})();
