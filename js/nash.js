(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var PAY = {
    LL: [2, 2],
    LR: [0, 0],
    RL: [0, 0],
    RR: [1, 1]
  };
  var NAMES = { L: "Left", R: "Right" };

  function other(side) { return side === "L" ? "R" : "L"; }

  function look(key) {
    var you = key.charAt(0);
    var them = key.charAt(1);
    var here = PAY[key];
    var youAlt = PAY[other(you) + them][0];
    var themAlt = PAY[you + other(them)][1];
    return {
      youSwitch: youAlt > here[0],
      themSwitch: themAlt > here[1],
      youAlt: youAlt,
      themAlt: themAlt,
      youNext: other(you),
      themNext: other(them),
      here: here
    };
  }

  var grid = S.el("div", "reply-grid");
  function head(text) {
    var node = S.el("div", "reply-label");
    node.textContent = text;
    return node;
  }
  grid.appendChild(head("Higher is better"));
  grid.appendChild(head("They pick Left"));
  grid.appendChild(head("They pick Right"));

  var buttons = {};
  var picked = "";
  var round = 0;

  function addRow(youSide) {
    grid.appendChild(head("You pick " + NAMES[youSide]));
    var sides = ["L", "R"];
    var i;
    for (i = 0; i < sides.length; i += 1) {
      var key = youSide + sides[i];
      var pay = PAY[key];
      var btn = S.el("button", "reply-cell");
      btn.type = "button";
      btn.setAttribute("data-pace", "900");
      btn.setAttribute("data-key", key);
      var yours = S.el("span", "reply-chip reply-you");
      yours.textContent = "You " + pay[0];
      var theirs = S.el("span", "reply-chip reply-them");
      theirs.textContent = "Them " + pay[1];
      var youArrow = S.el("span", "reply-arrow");
      youArrow.textContent = "You would switch";
      var themArrow = S.el("span", "reply-arrow");
      themArrow.textContent = "They would switch";
      var nash = S.el("span", "reply-nash");
      nash.textContent = "Nash";
      btn.appendChild(yours);
      btn.appendChild(theirs);
      btn.appendChild(youArrow);
      btn.appendChild(themArrow);
      btn.appendChild(nash);
      grid.appendChild(btn);
      buttons[key] = { btn: btn, youArrow: youArrow, themArrow: themArrow, nash: nash };
    }
  }
  addRow("L");
  addRow("R");

  var rail = S.el("div", "reply-rail");
  var caption = S.el("p", "caption");
  board.appendChild(rail);
  board.appendChild(grid);
  board.appendChild(caption);

  function later(mine, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, 900);
  }

  function sentence(key) {
    var info = look(key);
    var you = NAMES[key.charAt(0)];
    var them = NAMES[key.charAt(1)];
    var base = "You pick " + you + ". They pick " + them + ". You have " + info.here[0] + ". They have " + info.here[1] + ". ";
    if (!info.youSwitch && !info.themSwitch) {
      return base + "Neither of you gains by switching alone. This pair is a Nash equilibrium.";
    }
    var bits = [];
    if (info.youSwitch) bits.push("You would get " + info.youAlt + " by switching to " + NAMES[info.youNext]);
    else bits.push("You would not gain by switching");
    if (info.themSwitch) bits.push("they would get " + info.themAlt + " by switching to " + NAMES[info.themNext]);
    else bits.push("they would not gain by switching");
    return base + bits.join(", and ") + ".";
  }

  function show(snap) {
    round += 1;
    var mine = round;
    var key;
    for (key in buttons) {
      if (!Object.prototype.hasOwnProperty.call(buttons, key)) continue;
      var row = buttons[key];
      var on = key === picked;
      row.btn.classList.toggle("is-pick", on);
      var info = look(key);
      row.youArrow.classList.toggle("is-on", on && info.youSwitch);
      row.themArrow.classList.toggle("is-on", on && info.themSwitch);
      row.nash.classList.toggle("is-on", on && !info.youSwitch && !info.themSwitch);
    }
    var line = picked ? sentence(picked) : "";
    if (snap) caption.textContent = line;
    else later(mine, function () { caption.textContent = line; });
  }

  var keyName;
  for (keyName in buttons) {
    if (Object.prototype.hasOwnProperty.call(buttons, keyName)) {
      (function (key) {
        buttons[key].btn.addEventListener("click", function () {
          picked = key;
          show(false);
        });
      })(keyName);
    }
  }

  document.getElementById("again").addEventListener("click", function () {
    picked = "";
    show(true);
  });
  show(true);
})();
