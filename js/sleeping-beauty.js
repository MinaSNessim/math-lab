(function () {
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var guess = "";
  var score = "week";
  var locked = false;
  var runId = 0;

  function week() {
    var heads = Math.random() < 0.5;
    return { heads: heads, days: heads ? ["Monday"] : ["Monday", "Tuesday"] };
  }

  function clearFlip() {
    document.getElementById("week-heads").classList.remove("is-now", "is-dim");
    document.getElementById("week-tails").classList.remove("is-now", "is-dim");
    document.getElementById("this-week").textContent = "—";
    caption.textContent = "Heads wakes her once, on Monday. Tails wakes her on Monday and on Tuesday.";
  }

  function show(result) {
    var heads = document.getElementById("week-heads");
    var tails = document.getElementById("week-tails");
    heads.classList.toggle("is-now", result.heads);
    heads.classList.toggle("is-dim", !result.heads);
    tails.classList.toggle("is-now", !result.heads);
    tails.classList.toggle("is-dim", result.heads);
    document.getElementById("this-week").textContent = result.heads ? "Heads, one waking" : "Tails, two wakings";
    caption.textContent = result.heads
      ? "Heads. She wakes once, on Monday."
      : "Tails. She wakes on Monday, and again on Tuesday.";
  }

  function markScore() {
    document.getElementById("score-week").classList.toggle("is-on", score === "week");
    document.getElementById("score-wake").classList.toggle("is-on", score === "wake");
    document.getElementById("stat-week").classList.toggle("is-hot", score === "week");
    document.getElementById("stat-wake").classList.toggle("is-hot", score === "wake");
    document.querySelectorAll(".sb-week").forEach(function (el) {
      el.classList.toggle("is-count", score === "week");
    });
    document.querySelectorAll(".wake.is-awake").forEach(function (el) {
      el.classList.toggle("is-count", score === "wake");
    });
  }

  function unlock() {
    runId += 1;
    locked = false;
    guess = "";
    runBtn.disabled = true;
    ["guess-half", "guess-third"].forEach(function (id) {
      document.getElementById(id).classList.remove("is-on");
      document.getElementById(id).disabled = false;
    });
    document.getElementById("weeks").textContent = "—";
    document.getElementById("wakes").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock an answer, then flip the week.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
    clearFlip();
  }

  function lock(kind) {
    guess = kind;
    locked = true;
    document.getElementById("guess-half").classList.toggle("is-on", kind === "half");
    document.getElementById("guess-third").classList.toggle("is-on", kind === "third");
    document.getElementById("guess-half").disabled = true;
    document.getElementById("guess-third").disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked: " + (kind === "half" ? "half" : "one third") + ".";
  }

  document.getElementById("guess-half").addEventListener("click", function () { lock("half"); });
  document.getElementById("guess-third").addEventListener("click", function () { lock("third"); });
  document.getElementById("score-week").addEventListener("click", function () {
    score = "week";
    markScore();
    unlock();
  });
  document.getElementById("score-wake").addEventListener("click", function () {
    score = "wake";
    markScore();
    unlock();
  });
  document.getElementById("once").addEventListener("click", function () { show(week()); });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var heads = 0;
    var wakeTotal = 0;
    var last = null;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 80, function () {
      last = week();
      if (last.heads) heads += 1;
      wakeTotal += last.days.length;
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("weeks").textContent = GymRun.pct(heads, done);
      document.getElementById("wakes").textContent = GymRun.pct(heads, wakeTotal);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) show(last);
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      var focus = score === "week" ? "weeks" : "awakenings";
      caption.textContent = "You locked " + (guess === "half" ? "half" : "one third") +
        ", counting " + focus + ". Heads were " + document.getElementById("weeks").textContent +
        " of weeks and " + document.getElementById("wakes").textContent + " of awakenings.";
    });
  });

  markScore();
  document.getElementById("again").addEventListener("click", function () {
    score = "week";
    markScore();
    unlock();
  });
})();
