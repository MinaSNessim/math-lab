(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var MAX = 24;
  var PITCH = 9;

  function makeRand(seed) {
    var x = seed % 233280;
    return function () {
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };
  }

  function stack(kind) {
    var col = S.el("div", "matt-col");
    var name = S.el("b");
    name.textContent = kind === "g" ? "Green" : "Red";
    var box = S.el("div", "matt-stack");
    var coins = [];
    var i;
    for (i = 0; i < MAX; i += 1) {
      var coin = S.el("i", "matt-coin is-" + kind);
      box.appendChild(coin);
      coins.push(coin);
    }
    var count = S.el("span", "matt-count");
    col.appendChild(name);
    col.appendChild(box);
    col.appendChild(count);
    return { col: col, coins: coins, count: count };
  }

  var scene = S.el("div", "matt-scene");
  var greenStack = stack("g");
  var redStack = stack("r");
  scene.appendChild(greenStack.col);
  scene.appendChild(redStack.col);
  var chance = S.el("p", "matt-chance");
  chance.id = "matt-chance";
  var totals = S.el("div", "pic-totals");
  function stat(id, words) {
    var p = S.el("p");
    var b = S.el("b");
    b.id = id;
    var span = S.el("span");
    span.textContent = words;
    p.appendChild(b);
    p.appendChild(span);
    return { p: p, b: b };
  }
  var gapStat = stat("matt-gap", "Gap");
  var greenStat = stat("matt-green", "Green");
  var redStat = stat("matt-red", "Red");
  totals.appendChild(greenStat.p);
  totals.appendChild(redStat.p);
  totals.appendChild(gapStat.p);
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var nextBtn = S.button("Run next round", "btn");
  var manyBtn = S.button("Run many rounds", "btn");
  var resetBtn = S.button("Reset to equal", "btn ghost");
  nextBtn.setAttribute("data-pace", "900");
  manyBtn.setAttribute("data-pace", "900");
  resetBtn.setAttribute("data-pace", "0");
  var controls = S.el("div", "controls");
  controls.appendChild(nextBtn);
  controls.appendChild(manyBtn);
  controls.appendChild(resetBtn);
  board.appendChild(scene);
  board.appendChild(chance);
  board.appendChild(totals);
  board.appendChild(caption);
  board.appendChild(controls);

  var green = 5;
  var red = 4;
  var rnd = makeRand(7);
  var round = 0;

  function lay(stackObj, count, doSnap) {
    var i;
    for (i = 0; i < stackObj.coins.length; i += 1) {
      var coin = stackObj.coins[i];
      if (doSnap) coin.style.setProperty("transition", "none", "important");
      if (i < count) {
        coin.classList.add("is-on");
        coin.style.transform = "translateY(" + (-i * PITCH) + "px)";
      } else {
        coin.classList.remove("is-on");
        coin.style.removeProperty("transform");
      }
    }
    stackObj.count.textContent = String(count);
    if (doSnap) {
      void scene.offsetWidth;
      for (i = 0; i < stackObj.coins.length; i += 1) stackObj.coins[i].style.removeProperty("transition");
    }
  }

  function paint(doSnap) {
    lay(greenStack, green, doSnap);
    lay(redStack, red, doSnap);
    greenStat.b.textContent = String(green);
    redStat.b.textContent = String(red);
    gapStat.b.textContent = String(Math.abs(green - red));
    chance.textContent = "Green's chance of the next coin is " + green + " of " + (green + red) + ".";
  }

  function giveNext() {
    var beforeG = green;
    var beforeR = red;
    var total = green + red;
    if (green >= MAX && red >= MAX) return null;
    if (rnd() < green / total) {
      if (green < MAX) green += 1;
      else red += 1;
    } else if (red < MAX) red += 1;
    else green += 1;
    return { beforeG: beforeG, beforeR: beforeR, total: total, greenWon: green > beforeG };
  }

  function show(doSnap, text) {
    round += 1;
    var mine = round;
    paint(doSnap);
    if (doSnap) caption.textContent = text;
    else window.setTimeout(function () {
      if (mine !== round) return;
      caption.textContent = text;
    }, 900);
  }

  nextBtn.addEventListener("click", function () {
    var step = giveNext();
    if (!step) return;
    var who = step.greenWon ? "Green" : "Red";
    var text = who + " had " + (step.greenWon ? step.beforeG : step.beforeR) + " of " + step.total + " chances and gained the coin. Green has " + green + ". Red has " + red + ". The gap is " + Math.abs(green - red) + ".";
    show(false, text);
  });
  manyBtn.addEventListener("click", function () {
    var beforeG = green;
    var beforeR = red;
    var beforeGap = Math.abs(green - red);
    var n;
    for (n = 0; n < 12; n += 1) {
      if (!giveNext()) break;
    }
    var text = "Green went from " + beforeG + " to " + green + ". Red went from " + beforeR + " to " + red + ". The gap went from " + beforeGap + " to " + Math.abs(green - red) + ".";
    show(false, text);
  });
  resetBtn.addEventListener("click", function () {
    green = 5;
    red = 5;
    rnd = makeRand(7);
    show(true, "Both stacks have 5. The gap is 0. Green's chance of the next coin is 5 of 10.");
  });
  document.getElementById("again").addEventListener("click", function () {
    green = 5;
    red = 4;
    rnd = makeRand(7);
    show(true, "Green has 5. Red has 4. The gap is 1. Green's chance of the next coin is 5 of 9.");
  });
  show(true, "Green has 5. Red has 4. The gap is 1. Green's chance of the next coin is 5 of 9.");
})();
