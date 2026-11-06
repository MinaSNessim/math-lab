(function () {
  var machinesEl = document.getElementById("machines");
  var stepsEl = document.getElementById("steps");
  var capitalEl = document.getElementById("capital");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var plan = "A";
  var guess = "";
  var locked = false;
  var runId = 0;
  var eps = 0.005;
  var expectText = { A: "", B: "", mix: "" };

  function signedHundredth(v) {
    var n = Math.round(v * 100) / 100;
    var body = Math.abs(n).toFixed(2);
    if (n > 0) return "+" + body;
    if (n < 0) return "-" + body;
    return "0.00";
  }

  function yOf(v) {
    return 20 + ((1.3 - v) / 2.9) * 156;
  }

  function xOf(i) {
    return 36 + (i / 80) * 500;
  }

  function expectedPath(kind) {
    var prob = [1, 0, 0];
    var expect = 0;
    var points = [0];
    var step;
    var r;
    for (step = 0; step < 80; step += 1) {
      var next = [0, 0, 0];
      var drift = 0;
      for (r = 0; r < 3; r += 1) {
        var pA = 0.495;
        var pB = r === 0 ? 0.095 : 0.745;
        var p = kind === "A" ? pA : (kind === "B" ? pB : (pA + pB) / 2);
        drift += prob[r] * (2 * p - 1);
        next[(r + 1) % 3] += prob[r] * p;
        next[(r + 2) % 3] += prob[r] * (1 - p);
      }
      expect += drift;
      prob = next;
      points.push(expect);
    }
    return points;
  }

  function paintTrend() {
    var series = {
      A: expectedPath("A"),
      B: expectedPath("B"),
      mix: expectedPath("mix")
    };
    var zeroY = yOf(0);
    var zero = document.getElementById("trend-zero");
    expectText.A = signedHundredth(series.A[80]);
    expectText.B = signedHundredth(series.B[80]);
    expectText.mix = signedHundredth(series.mix[80]);
    ["A", "B", "mix"].forEach(function (kind) {
      var id = kind === "mix" ? "line-mix" : "line-" + kind.toLowerCase();
      document.getElementById(id).setAttribute("points", series[kind].map(function (v, i) {
        return xOf(i).toFixed(1) + "," + yOf(v).toFixed(1);
      }).join(" "));
    });
    zero.setAttribute("x1", "36");
    zero.setAttribute("y1", zeroY.toFixed(1));
    zero.setAttribute("x2", "536");
    zero.setAttribute("y2", zeroY.toFixed(1));
    document.getElementById("lab-zero").setAttribute("x", "24");
    document.getElementById("lab-zero").setAttribute("y", (zeroY + 4).toFixed(1));
    function put(id, text, v, dy) {
      var el = document.getElementById(id);
      el.textContent = text;
      el.setAttribute("x", (xOf(80) - 4).toFixed(1));
      el.setAttribute("y", (yOf(v) + dy).toFixed(1));
      el.setAttribute("text-anchor", "end");
    }
    put("lab-a", "A " + expectText.A, series.A[80], -8);
    put("lab-b", "B " + expectText.B, series.B[80], 16);
    put("lab-mix", "Switch " + expectText.mix, series.mix[80], -8);
  }

  function mod3(n) {
    return ((n % 3) + 3) % 3;
  }

  function winP(game, capital) {
    if (game === "A") return 0.5 - eps;
    return mod3(capital) === 0 ? 0.1 - eps : 0.75 - eps;
  }

  function gameAt(i) {
    if (plan === "A") return "A";
    if (plan === "B") return "B";
    return Math.random() < 0.5 ? "A" : "B";
  }

  function walk(steps) {
    var capital = 0;
    var plays = [];
    var i;
    for (i = 0; i < steps; i += 1) {
      var game = gameAt(i);
      var win = Math.random() < winP(game, capital);
      capital += win ? 1 : -1;
      plays.push({ game: game, win: win, capital: capital });
    }
    return { capital: capital, plays: plays };
  }

  function paintMachines(lastGame) {
    machinesEl.innerHTML = "";
    [
      ["A", "Machine A"],
      ["B", "Machine B"],
      ["mix", "Switch"]
    ].forEach(function (item) {
      var on = (plan === "mix" && item[0] === "mix") || (plan !== "mix" && item[0] === plan);
      var tray = document.createElement("div");
      tray.className = "tray" + (on ? " is-on" : "");
      tray.innerHTML = '<img src="images/machine.png" alt=""><span class="name">' + item[1] +
        (lastGame && item[0] === lastGame ? " · just played" : "") + "</span>";
      machinesEl.appendChild(tray);
    });
  }

  function show(result) {
    var shown = result.plays.slice(-24);
    stepsEl.innerHTML = "";
    shown.forEach(function (play) {
      var chip = document.createElement("span");
      chip.className = "step " + (play.win ? "win" : "lose");
      chip.textContent = play.game;
      chip.setAttribute("aria-label", play.game + (play.win ? " won" : " lost"));
      stepsEl.appendChild(chip);
    });
    var end = shown.length ? shown[shown.length - 1].capital : 0;
    capitalEl.textContent = (end > 0 ? "+" : "") + end;
    capitalEl.classList.toggle("is-mod", mod3(end) === 0);
    document.getElementById("this-walk").textContent = (end > 0 ? "+" : "") + end;
    paintMachines(shown.length ? shown[shown.length - 1].game : "");
    caption.textContent = mod3(end) === 0
      ? "The coin count is a multiple of 3, so machine B’s next play would use the worse coin."
      : "The coin count is not a multiple of 3, so machine B’s next play would use the better coin.";
  }

  function unlock() {
    runId += 1;
    locked = false;
    guess = "";
    runBtn.disabled = true;
    ["guess-up", "guess-down"].forEach(function (id) {
      document.getElementById(id).classList.remove("is-on");
      document.getElementById(id).disabled = false;
    });
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a direction, then run the walks.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
    document.getElementById("trend").classList.remove("is-on");
  }

  function setPlan(next) {
    plan = next;
    document.getElementById("plan-a").classList.toggle("is-on", next === "A");
    document.getElementById("plan-b").classList.toggle("is-on", next === "B");
    document.getElementById("plan-mix").classList.toggle("is-on", next === "mix");
    unlock();
    show(walk(24));
  }

  function lock(kind) {
    guess = kind;
    locked = true;
    document.getElementById("guess-up").classList.toggle("is-on", kind === "up");
    document.getElementById("guess-down").classList.toggle("is-on", kind === "down");
    document.getElementById("guess-up").disabled = true;
    document.getElementById("guess-down").disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked: ends " + kind + ".";
  }

  document.getElementById("plan-a").addEventListener("click", function () { setPlan("A"); });
  document.getElementById("plan-b").addEventListener("click", function () { setPlan("B"); });
  document.getElementById("plan-mix").addEventListener("click", function () { setPlan("mix"); });
  document.getElementById("guess-up").addEventListener("click", function () { lock("up"); });
  document.getElementById("guess-down").addEventListener("click", function () { lock("down"); });
  document.getElementById("once").addEventListener("click", function () {
    document.getElementById("trend").classList.remove("is-on");
    show(walk(24));
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var sum = 0;
    var up = 0;
    var last = null;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 25, function () {
      last = walk(80);
      sum += last.capital;
      if (last.capital > 0) up += 1;
    }, function (done) {
      if (mine !== runId) return;
      var mean = Math.round((sum / done) * 10) / 10;
      document.getElementById("sim").textContent = (mean > 0 ? "+" : "") + mean;
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) show(last);
      document.getElementById("theory").textContent = GymRun.pct(up, total);
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      document.getElementById("trend").classList.add("is-on");
      caption.textContent = "You locked ends " + guess + ". This run averaged " +
        document.getElementById("sim").textContent +
        ". The row is the last 24 plays. The lines are the expected coins after 80 plays: A " +
        expectText.A + ", B " + expectText.B + ", switching " + expectText.mix +
        ". Switching can dip before it finishes up.";
    });
  });

  paintTrend();
  setPlan("A");
  document.getElementById("again").addEventListener("click", function () {
    paintTrend();
    setPlan("A");
  });
})();
