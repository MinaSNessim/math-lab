(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function coinArt(fill) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="60" cy="60" r="52" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="12"/>'
      + '<circle cx="60" cy="60" r="34" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    var text = document.createElementNS(SVG, "text");
    text.setAttribute("x", "60");
    text.setAttribute("y", "74");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "42");
    text.setAttribute("font-weight", "800");
    text.setAttribute("fill", INK);
    text.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
    svg.appendChild(text);
    return { svg: svg, text: text };
  }

  function side(fill, name) {
    var box = S.el("div", "penny-side");
    var spin = S.el("div", "penny-coin");
    var art = coinArt(fill);
    spin.appendChild(art.svg);
    var title = S.el("b");
    title.textContent = name;
    var score = S.el("span", "game-tag");
    score.textContent = "0 wins";
    box.appendChild(spin);
    box.appendChild(title);
    box.appendChild(score);
    return { box: box, spin: spin, text: art.text, score: score };
  }

  var you = side(GREEN, "You");
  var them = side(RED, "The other player");
  var row = S.el("div", "penny-row");
  row.appendChild(you.box);
  row.appendChild(them.box);

  function faceButton(label) {
    var btn = S.button(label, "btn");
    btn.setAttribute("data-pace", "900");
    return btn;
  }

  var youH = faceButton("Heads");
  var youT = faceButton("Tails");
  var themH = faceButton("Heads");
  var themT = faceButton("Tails");
  var youRow = S.el("div", "game-row");
  var youWho = S.el("span", "who");
  youWho.textContent = "You";
  youRow.appendChild(youWho);
  youRow.appendChild(youH);
  youRow.appendChild(youT);
  var themRow = S.el("div", "game-row");
  var themWho = S.el("span", "who");
  themWho.textContent = "The other player";
  themRow.appendChild(themWho);
  themRow.appendChild(themH);
  themRow.appendChild(themT);
  var controls = S.el("div", "controls game-split");
  controls.appendChild(youRow);
  controls.appendChild(themRow);
  var caption = S.el("p", "caption");
  board.appendChild(row);
  board.appendChild(controls);
  board.appendChild(caption);

  var youFace = "";
  var themFace = "";
  var youWins = 0;
  var themWins = 0;
  var round = 0;

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function letter(face) {
    if (face === "H") return "H";
    if (face === "T") return "T";
    return "";
  }

  function spin(el, win, lose) {
    var scale = win ? 1.08 : (lose ? 0.92 : 1);
    el.style.setProperty("transition", "none", "important");
    el.style.transform = "rotateY(0deg) scale(1)";
    el.style.opacity = "1";
    void el.offsetWidth;
    el.style.removeProperty("transition");
    if (!youFace || !themFace) return;
    el.style.opacity = lose ? "0.55" : "1";
    el.style.transform = "rotateY(360deg) scale(" + scale + ")";
  }

  function winsText(n) {
    return n === 1 ? "1 win" : n + " wins";
  }

  function lineFor(match) {
    var yours = youFace === "H" ? "Heads" : "Tails";
    var theirs = themFace === "H" ? "Heads" : "Tails";
    if (!youFace || !themFace) {
      if (youFace) return "You show " + yours + ". The other player has not shown a coin yet.";
      if (themFace) return "They show " + theirs + ". You have not shown a coin yet.";
      return "";
    }
    if (match) return "You show " + yours + " and they show " + theirs + ". The coins match. You win. You " + youWins + ", them " + themWins + ".";
    return "You show " + yours + " and they show " + theirs + ". The coins differ. They win. You " + youWins + ", them " + themWins + ".";
  }

  function show(snap, played) {
    round += 1;
    var mine = round;
    var match = youFace && themFace && youFace === themFace;
    var differ = youFace && themFace && youFace !== themFace;
    youH.classList.toggle("is-on", youFace === "H");
    youT.classList.toggle("is-on", youFace === "T");
    themH.classList.toggle("is-on", themFace === "H");
    themT.classList.toggle("is-on", themFace === "T");
    you.text.textContent = letter(youFace);
    them.text.textContent = letter(themFace);
    you.box.classList.toggle("is-win", !!match);
    them.box.classList.toggle("is-win", !!differ);
    spin(you.spin, !!match, !!differ);
    spin(them.spin, !!differ, !!match);
    var line = lineFor(!!match);
    if (snap) {
      you.score.textContent = winsText(youWins);
      them.score.textContent = winsText(themWins);
      caption.textContent = line;
      return;
    }
    later(mine, function () {
      you.score.textContent = winsText(youWins);
      them.score.textContent = winsText(themWins);
      caption.textContent = line;
    });
  }

  function play(face, who) {
    if (who === "you") youFace = face;
    else themFace = face;
    if (youFace && themFace) {
      if (youFace === themFace) youWins += 1;
      else themWins += 1;
      show(false, true);
      return;
    }
    show(false, false);
  }

  youH.addEventListener("click", function () { play("H", "you"); });
  youT.addEventListener("click", function () { play("T", "you"); });
  themH.addEventListener("click", function () { play("H", "them"); });
  themT.addEventListener("click", function () { play("T", "them"); });

  document.getElementById("again").addEventListener("click", function () {
    youFace = "";
    themFace = "";
    youWins = 0;
    themWins = 0;
    show(true, false);
  });
  show(true, false);
})();
