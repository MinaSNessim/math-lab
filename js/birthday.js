(function () {
  var peopleEl = document.getElementById("people");
  var countInput = document.getElementById("people-count");
  var label = document.getElementById("people-label");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var locked = false;
  var runId = 0;

  function size() {
    return Math.max(2, Math.min(80, parseInt(countInput.value, 10) || 23));
  }

  function theory(n) {
    var miss = 1;
    for (var i = 1; i < n; i += 1) miss *= (365 - i) / 365;
    return 1 - miss;
  }

  function room(n) {
    var days = [];
    var seen = {};
    var shared = false;
    for (var i = 0; i < n; i += 1) {
      var day = 1 + Math.floor(Math.random() * 365);
      if (seen[day]) shared = true;
      seen[day] = (seen[day] || 0) + 1;
      days.push(day);
    }
    return { days: days, seen: seen, shared: shared };
  }

  function showTheory() {
    label.textContent = String(size());
  }

  function revealTheory() {
    if (!locked) return;
    document.getElementById("theory").textContent = GymRun.pct(Math.round(theory(size()) * 10000), 10000);
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
  }

  function unlock() {
    runId += 1;
    locked = false;
    lockBtn.disabled = false;
    runBtn.disabled = true;
    document.getElementById("theory").textContent = "—";
    document.getElementById("sim").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a share, then run the rooms.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function draw(result) {
    peopleEl.innerHTML = "";
    result.days.forEach(function (day) {
      var spot = document.createElement("span");
      var shared = result.seen[day] > 1;
      spot.className = "person" + (shared ? " is-share" : "");
      if (shared) spot.dataset.day = String(day);
      spot.title = "Day " + day;
      spot.setAttribute("aria-label", shared ? "Day " + day + ", shared" : "Day " + day);
      peopleEl.appendChild(spot);
    });
    document.getElementById("shared-now").textContent = result.shared ? "Shared day" : "All different";
    caption.textContent = result.shared
      ? "Two people in this room share a day. Shared days are marked."
      : "Nobody in this room shares a day.";
  }

  document.getElementById("fill").addEventListener("click", function () {
    draw(room(size()));
  });

  countInput.addEventListener("input", function () {
    showTheory();
    unlock();
  });

  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });

  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Run the rooms to compare.";
  });

  runBtn.addEventListener("click", function () {
    var n = size();
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("rooms").value, 10) || 1));
    var hits = 0;
    var last = null;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 80, function () {
      if (mine !== runId) return;
      last = room(n);
      if (last.shared) hits += 1;
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = GymRun.pct(hits, done);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) draw(last);
      revealTheory();
      caption.textContent = "Your guess was " + guess.value + "%. The long-run share for " + size() + " people is beside the rooms just run.";
    });
  });

  showTheory();
  draw(room(size()));
  document.getElementById("again").addEventListener("click", function () {
    unlock();
    showTheory();
    draw(room(size()));
  });
})();
