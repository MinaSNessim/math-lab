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

  function stagArt() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 160 120");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path d="M48 38 L28 8 L40 36 L22 22 L44 42" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      + '<path d="M78 36 L98 6 L86 34 L108 18 L84 42" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      + '<ellipse cx="70" cy="78" rx="42" ry="24" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="112" cy="62" r="18" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<ellipse cx="126" cy="66" rx="8" ry="5" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<circle cx="118" cy="56" r="2.4" fill="' + INK + '"/>'
      + '<rect x="40" y="96" width="8" height="18" rx="2" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<rect x="58" y="96" width="8" height="18" rx="2" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<rect x="76" y="96" width="8" height="18" rx="2" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2"/>';
    return svg;
  }

  function hareArt() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 110 90");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<ellipse cx="38" cy="22" rx="10" ry="20" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<ellipse cx="58" cy="18" rx="10" ry="20" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<ellipse cx="62" cy="58" rx="32" ry="20" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="90" cy="48" r="14" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="96" cy="46" r="2.2" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="1.5"/>'
      + '<ellipse cx="28" cy="62" rx="8" ry="6" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2"/>';
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

  function hunter(color, name) {
    var box = S.el("div", "hunt-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var tag = S.el("span", "game-tag");
    box.appendChild(title);
    box.appendChild(tag);
    return { box: box, tag: tag };
  }

  var scene = S.el("div", "hunt-scene");
  var stag = S.el("div", "hunt-stag");
  var stagName = S.el("b");
  stagName.textContent = "Stag";
  stag.appendChild(stagName);
  stag.appendChild(stagArt());
  var hare = S.el("div", "hunt-hare");
  var hareName = S.el("b");
  hareName.textContent = "Hare";
  hare.appendChild(hareName);
  hare.appendChild(hareArt());
  var you = hunter(GREEN, "You");
  var them = hunter(RED, "The other hunter");
  scene.appendChild(stag);
  scene.appendChild(hare);
  scene.appendChild(you.box);
  scene.appendChild(them.box);

  var youS = choiceButton("Stag", "only if both hunt it");
  var youH = choiceButton("Hare", "you can take it alone");
  var themS = choiceButton("They hunt stag", "only if both hunt it");
  var themH = choiceButton("They hunt hare", "alone");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youS);
  youRow.appendChild(youH);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other hunter";
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
      if (pick === "S") return 8;
      if (pick === "H") return Math.max(w - 210, 130);
      return Math.round(w * 0.12);
    }
    if (pick === "S") return 96;
    if (pick === "H") return Math.max(w - 100, 180);
    return Math.max(w - 100, 180);
  }

  function move(el, who, pick, snap) {
    var w = scene.clientWidth || 320;
    var x = xFor(who, pick, w);
    var y = pick ? -Math.round(Math.min(72, (scene.clientHeight || 340) * 0.2)) : 0;
    if (snap) el.style.setProperty("transition", "none", "important");
    el.style.transform = "translate(" + x + "px, " + y + "px)";
    if (snap) {
      void el.offsetWidth;
      el.style.removeProperty("transition");
    }
  }

  function reward(mine, other) {
    if (!mine || !other) return "";
    if (mine === "S" && other === "S") return "Large catch";
    if (mine === "H") return "Small catch";
    return "Nothing";
  }

  function lineFor() {
    if (youPick === "S" && themPick === "S") return "You both hunt the stag. Each of you gets the large catch.";
    if (youPick === "H" && themPick === "H") return "You both hunt a hare. Each of you gets the small catch.";
    if (youPick === "S" && themPick === "H") return "You hunt the stag and they hunt a hare. You get nothing. They get the small catch.";
    if (youPick === "H" && themPick === "S") return "You hunt a hare and they hunt the stag. You get the small catch. They get nothing.";
    if (youPick && !themPick) return (youPick === "S" ? "You hunt the stag." : "You hunt a hare.") + " The other hunter has not chosen yet.";
    if (themPick && !youPick) return (themPick === "S" ? "They hunt the stag." : "They hunt a hare.") + " You have not chosen yet.";
    return "";
  }

  function show(snap) {
    round += 1;
    var mine = round;
    youS.classList.toggle("is-on", youPick === "S");
    youH.classList.toggle("is-on", youPick === "H");
    themS.classList.toggle("is-on", themPick === "S");
    themH.classList.toggle("is-on", themPick === "H");
    move(you.box, "you", youPick, snap);
    move(them.box, "them", themPick, snap);
    you.tag.textContent = reward(youPick, themPick);
    them.tag.textContent = reward(themPick, youPick);
    stag.classList.toggle("is-caught", youPick === "S" && themPick === "S");
    var line = lineFor();
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  youS.addEventListener("click", function () { youPick = "S"; show(false); });
  youH.addEventListener("click", function () { youPick = "H"; show(false); });
  themS.addEventListener("click", function () { themPick = "S"; show(false); });
  themH.addEventListener("click", function () { themPick = "H"; show(false); });
  window.addEventListener("resize", function () { show(true); });

  document.getElementById("again").addEventListener("click", function () {
    youPick = "";
    themPick = "";
    show(true);
  });
  show(true);
})();
