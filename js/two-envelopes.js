(function () {
  var scene = document.getElementById("scene");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var mode = "env";
  var locked = false;
  var side = "";
  var runId = 0;

  function capValue() {
    var raw = parseInt(document.getElementById("cap").value, 10) || (mode === "env" ? 16 : 8);
    if (mode === "env") {
      var power = 2;
      while (power * 2 <= raw && power < 256) power *= 2;
      return Math.max(2, power);
    }
    return Math.max(2, Math.min(20, raw));
  }

  function deal() {
    var cap = capValue();
    var steps = Math.round(Math.log(cap) / Math.log(2));
    var small = Math.pow(2, Math.floor(Math.random() * (steps + 1)));
    var yoursFirst = Math.random() < 0.5;
    var yours = yoursFirst ? small : small * 2;
    var other = yoursFirst ? small * 2 : small;
    return { yours: yours, other: other, lure: yours * 1.25 };
  }

  function petersburg() {
    var cap = capValue();
    var flips = [];
    var i;
    for (i = 1; i <= cap; i += 1) {
      var heads = Math.random() < 0.5;
      flips.push(heads ? "H" : "T");
      if (!heads) return { prize: Math.pow(2, i), flips: flips };
    }
    return { prize: Math.pow(2, cap), flips: flips };
  }

  function envHtml(pair) {
    scene.innerHTML = '<div class="env-pair">' +
      '<div class="env is-on"><img src="images/envelope.png" alt=""><b>' + pair.yours + '</b><span class="name">Yours</span></div>' +
      '<div class="env"><img src="images/envelope.png" alt=""><b>' + pair.other + '</b><span class="name">The other</span></div>' +
      "</div>";
    document.getElementById("this-deal").textContent = pair.yours + " · " + pair.other;
    caption.textContent = "You opened " + pair.yours + ". Switching pays " + pair.other + ".";
  }

  function peteHtml(game) {
    var chips = game.flips.map(function (side) {
      return '<span class="flip ' + (side === "H" ? "is-heads" : "is-tails") + '" aria-label="' +
        (side === "H" ? "Heads" : "Tails") + '"></span>';
    }).join("");
    scene.innerHTML = '<div class="flips">' + chips + "</div>";
    document.getElementById("this-deal").textContent = String(game.prize);
    caption.textContent = "This game pays " + game.prize + ". The flip stops on tails.";
  }

  function showOnce() {
    if (mode === "env") envHtml(deal());
    else peteHtml(petersburg());
  }

  function labels() {
    var envMode = mode === "env";
    document.getElementById("guess-env").hidden = !envMode;
    document.getElementById("guess-pete").hidden = envMode;
    document.getElementById("cap-label").textContent = envMode ? "Biggest small amount" : "Most flips";
    document.getElementById("once").textContent = envMode ? "Deal once" : "Flip once";
    document.getElementById("run").textContent = envMode ? "Run many deals" : "Run many games";
    document.getElementById("this-label").textContent = envMode ? "This deal, stay · switch" : "This prize";
    document.getElementById("sim-label").textContent = envMode ? "Average if you stay" : "Average prize";
    document.getElementById("theory-label").textContent = envMode ? "Average if you switch" : "Games that beat your fee";
    document.getElementById("mode-env").classList.toggle("is-on", envMode);
    document.getElementById("mode-pete").classList.toggle("is-on", !envMode);
  }

  function unlock() {
    runId += 1;
    locked = false;
    side = "";
    runBtn.disabled = true;
    ["guess-stay", "guess-switch"].forEach(function (id) {
      document.getElementById(id).classList.remove("is-on");
      document.getElementById(id).disabled = false;
    });
    document.getElementById("lock-fee").disabled = false;
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a side, then deal.";
    document.getElementById("fee-note").textContent = "Lock a fee, then flip.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function setMode(next) {
    mode = next;
    var cap = document.getElementById("cap");
    if (next === "env") {
      cap.min = "2";
      cap.max = "256";
      cap.value = "16";
    } else {
      cap.min = "2";
      cap.max = "20";
      cap.value = "8";
    }
    labels();
    unlock();
    showOnce();
  }

  document.getElementById("mode-env").addEventListener("click", function () { setMode("env"); });
  document.getElementById("mode-pete").addEventListener("click", function () { setMode("pete"); });
  document.getElementById("once").addEventListener("click", showOnce);
  document.getElementById("cap").addEventListener("input", function () {
    unlock();
  });

  function lockSide(next) {
    side = next;
    locked = true;
    ["guess-stay", "guess-switch"].forEach(function (id) {
      var button = document.getElementById(id);
      button.classList.toggle("is-on", id === "guess-" + next);
      button.disabled = true;
    });
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked: " + next + ".";
  }

  document.getElementById("guess-stay").addEventListener("click", function () { lockSide("stay"); });
  document.getElementById("guess-switch").addEventListener("click", function () { lockSide("switch"); });
  document.getElementById("fee").addEventListener("input", function () {
    document.getElementById("fee-label").textContent = document.getElementById("fee").value;
    if (locked) unlock();
  });
  document.getElementById("lock-fee").addEventListener("click", function () {
    locked = true;
    document.getElementById("lock-fee").disabled = true;
    runBtn.disabled = false;
    document.getElementById("fee-note").textContent = "Locked at a fee of " + document.getElementById("fee").value + ".";
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var mine = ++runId;
    runBtn.disabled = true;
    if (mode === "env") {
      var stay = 0;
      var swap = 0;
      var lure = 0;
      var last = null;
      GymRun.chunk(total, 60, function () {
        last = deal();
        stay += last.yours;
        swap += last.other;
        lure += last.lure;
      }, function (done) {
        if (mine !== runId) return;
        document.getElementById("sim").textContent = String(Math.round(stay / done));
      }, function () {
        if (mine !== runId) return;
        runBtn.disabled = false;
        if (last) envHtml(last);
        document.getElementById("theory").textContent = String(Math.round(swap / total));
        document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
        caption.textContent = "You locked " + side + ". Stay averaged " + document.getElementById("sim").textContent +
          ", switch averaged " + document.getElementById("theory").textContent +
          ", and the 5/4 story averaged " + Math.round(lure / total) + ".";
      });
      return;
    }
    var prizeSum = 0;
    var beat = 0;
    var common = 0;
    var fee = Math.max(1, parseInt(document.getElementById("fee").value, 10) || 1);
    var lastGame = null;
    GymRun.chunk(total, 40, function () {
      lastGame = petersburg();
      prizeSum += lastGame.prize;
      if (lastGame.prize > fee) beat += 1;
      if (lastGame.prize === 2) common += 1;
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = String(Math.round(prizeSum / done));
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (lastGame) peteHtml(lastGame);
      document.getElementById("theory").textContent = GymRun.pct(beat, total);
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      caption.textContent = "Your fee was " + fee + ". The average prize was " +
        document.getElementById("sim").textContent + ". The prize was 2 in " + GymRun.pct(common, total) + " of games.";
    });
  });

  setMode("env");
  document.getElementById("again").addEventListener("click", function () { setMode("env"); });
})();
