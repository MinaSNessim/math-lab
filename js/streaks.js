(function () {
  var row = document.getElementById("flips");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var flips = [];

  function streak() {
    var n = 0;
    for (var i = flips.length - 1; i >= 0; i -= 1) {
      if (flips[i] !== "H") break;
      n += 1;
    }
    return n;
  }

  var guess = "";
  var runId = 0;

  function paintRow(target, list) {
    target.innerHTML = "";
    list.slice(-32).forEach(function (side) {
      var chip = document.createElement("span");
      chip.className = "flip " + (side === "H" ? "is-heads" : "is-tails");
      chip.setAttribute("aria-label", side === "H" ? "Heads" : "Tails");
      target.appendChild(chip);
    });
  }

  function paint() {
    paintRow(row, flips);
    document.getElementById("live").textContent = String(streak());
  }

  function unlock() {
    runId += 1;
    guess = "";
    runBtn.disabled = true;
    ["guess-more", "guess-half", "guess-less"].forEach(function (id) {
      document.getElementById(id).classList.remove("is-on");
    });
    document.getElementById("trial").hidden = true;
    document.getElementById("trial-label").hidden = true;
    document.getElementById("next-heads").textContent = "—";
    document.getElementById("next-tails").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a guess, then run the next flip.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function flipOnce() {
    flips.push(Math.random() < 0.5 ? "H" : "T");
    paint();
    caption.textContent = "Current heads streak: " + streak() + ".";
  }

  document.getElementById("flip").addEventListener("click", flipOnce);
  document.getElementById("clear").addEventListener("click", function () {
    flips = [];
    paint();
    caption.textContent = "The row is clear.";
  });

  runBtn.addEventListener("click", function () {
    var need = Math.max(2, Math.min(12, parseInt(document.getElementById("streak").value, 10) || 5));
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var heads = 0;
    var tails = 0;
    var lastSide = "H";
    var mine = ++runId;
    runBtn.disabled = true;
    function showTrial() {
      var demo = [];
      for (var i = 0; i < need; i += 1) demo.push("H");
      demo.push(lastSide);
      var trial = document.getElementById("trial");
      trial.hidden = false;
      document.getElementById("trial-label").hidden = false;
      paintRow(trial, demo);
    }
    GymRun.chunk(total, 40, function () {
      if (mine !== runId) return;
      var run = 0;
      while (run < need) {
        if (Math.random() < 0.5) run += 1;
        else run = 0;
      }
      if (Math.random() < 0.5) {
        heads += 1;
        lastSide = "H";
      } else {
        tails += 1;
        lastSide = "T";
      }
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("next-heads").textContent = GymRun.pct(heads, done);
      document.getElementById("next-tails").textContent = GymRun.pct(tails, done);
      caption.textContent = "After " + need + " heads, checked " + done + " next flips.";
      showTrial();
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      showTrial();
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      var names = { more: "heads more often", half: "about half", less: "tails more often" };
      caption.textContent = "You guessed " + names[guess] + ". After " + need + " heads, the next flip is still about half. Your own row is unchanged.";
    });
  });

  function lockGuess(side) {
    guess = side;
    ["more", "half", "less"].forEach(function (name) {
      document.getElementById("guess-" + name).classList.toggle("is-on", name === side);
    });
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked. Run the next flip to compare. Your row stays put.";
  }

  document.getElementById("guess-more").addEventListener("click", function () { lockGuess("more"); });
  document.getElementById("guess-half").addEventListener("click", function () { lockGuess("half"); });
  document.getElementById("guess-less").addEventListener("click", function () { lockGuess("less"); });
  document.getElementById("streak").addEventListener("input", unlock);

  for (var i = 0; i < 8; i += 1) flips.push(Math.random() < 0.5 ? "H" : "T");
  paint();
  caption.textContent = "Current heads streak: " + streak() + ". Flip again, or test the flips that follow a long streak.";
  document.getElementById("again").addEventListener("click", function () {
    unlock();
    flips = [];
    var n;
    for (n = 0; n < 8; n += 1) flips.push(Math.random() < 0.5 ? "H" : "T");
    paint();
    caption.textContent = "Current heads streak: " + streak() + ". Flip again, or test the flips that follow a long streak.";
  });
})();
