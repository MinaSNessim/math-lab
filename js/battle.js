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

  function opera() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 150 130");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="8" y="28" width="16" height="94" rx="3" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="126" y="28" width="16" height="94" rx="3" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="8" y="14" width="134" height="20" rx="4" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<path d="M28 40 L75 78 L122 40 L122 112 L28 112 Z" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="62" y="78" width="26" height="34" rx="4" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>';
    return svg;
  }

  function pitch() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 150 130");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="10" y="36" width="130" height="78" rx="8" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="28" y="18" width="12" height="70" rx="3" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="110" y="18" width="12" height="70" rx="3" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="28" y="18" width="94" height="12" rx="3" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="75" cy="78" r="14" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>';
    return svg;
  }

  function choiceButton(main) {
    var btn = S.button(main, "btn");
    btn.setAttribute("data-pace", "900");
    return btn;
  }

  function person(color, name, likes) {
    var box = S.el("div", "eve-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var pref = S.el("span", "eve-pref");
    pref.textContent = likes;
    var tag = S.el("span", "game-tag");
    box.appendChild(title);
    box.appendChild(pref);
    box.appendChild(tag);
    return { box: box, tag: tag };
  }

  var scene = S.el("div", "eve-scene");
  var operaBox = S.el("div", "eve-venue eve-opera");
  operaBox.appendChild(opera());
  var operaName = S.el("b");
  operaName.textContent = "Opera";
  operaBox.appendChild(operaName);
  var pitchBox = S.el("div", "eve-venue eve-pitch");
  pitchBox.appendChild(pitch());
  var pitchName = S.el("b");
  pitchName.textContent = "Football";
  pitchBox.appendChild(pitchName);
  var you = person(GREEN, "You", "Prefers football");
  var them = person(RED, "The other person", "Prefers opera");
  scene.appendChild(operaBox);
  scene.appendChild(pitchBox);
  scene.appendChild(you.box);
  scene.appendChild(them.box);

  var youO = choiceButton("Opera");
  var youF = choiceButton("Football");
  var themO = choiceButton("They go to the opera");
  var themF = choiceButton("They go to the match");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youO);
  youRow.appendChild(youF);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other person";
  themRow.appendChild(themWho);
  themRow.appendChild(themO);
  themRow.appendChild(themF);
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
  var PLACE = { O: "the opera", F: "the football match" };

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function pay() {
    if (youPick === "F" && themPick === "F") return [2, 1];
    if (youPick === "O" && themPick === "O") return [1, 2];
    if (youPick && themPick) return [0, 0];
    return null;
  }

  function xFor(who, pick, w) {
    if (who === "you") {
      if (pick === "O") return 8;
      if (pick === "F") return Math.max(w - 200, 140);
      return Math.round(w * 0.28);
    }
    if (pick === "O") return 96;
    if (pick === "F") return Math.max(w - 100, 190);
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

  function lineFor(score) {
    if (!youPick && !themPick) return "";
    if (!score) {
      if (youPick) return "You go to " + PLACE[youPick] + ". The other person has not chosen yet.";
      return "They go to " + PLACE[themPick] + ". You have not chosen yet.";
    }
    if (youPick === themPick) {
      return "You both go to " + PLACE[youPick] + ". You get " + score[0] + ". They get " + score[1] + ".";
    }
    return "You go to " + PLACE[youPick] + " and they go to " + PLACE[themPick] + ". You are apart. You get 0. They get 0.";
  }

  function show(snap) {
    round += 1;
    var mine = round;
    youO.classList.toggle("is-on", youPick === "O");
    youF.classList.toggle("is-on", youPick === "F");
    themO.classList.toggle("is-on", themPick === "O");
    themF.classList.toggle("is-on", themPick === "F");
    move(you.box, "you", youPick, snap);
    move(them.box, "them", themPick, snap);
    var score = pay();
    you.tag.textContent = score ? "You " + score[0] : "";
    them.tag.textContent = score ? "Them " + score[1] : "";
    var together = score && youPick === themPick;
    operaBox.classList.toggle("is-lit", together && youPick === "O");
    pitchBox.classList.toggle("is-lit", together && youPick === "F");
    var line = lineFor(score);
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  youO.addEventListener("click", function () { youPick = "O"; show(false); });
  youF.addEventListener("click", function () { youPick = "F"; show(false); });
  themO.addEventListener("click", function () { themPick = "O"; show(false); });
  themF.addEventListener("click", function () { themPick = "F"; show(false); });
  window.addEventListener("resize", function () { show(true); });

  document.getElementById("again").addEventListener("click", function () {
    youPick = "";
    themPick = "";
    show(true);
  });
  show(true);
})();
