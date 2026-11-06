(function () {
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var mode = "boy";
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var locked = false;
  var runId = 0;
  var days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function child() {
    return { boy: Math.random() < 0.5, tuesday: Math.random() < 1 / 7 };
  }

  function matches(family) {
    if (mode === "boy") return family[0].boy || family[1].boy;
    return (family[0].boy && family[0].tuesday) || (family[1].boy && family[1].tuesday);
  }

  function answerText() {
    return mode === "boy" ? "1 in 3" : "13 in 27";
  }

  function kidNode(info) {
    var mark = document.createElement("span");
    var tag = document.createElement("i");
    mark.className = "kid " + (info.boy ? "boy" : "girl");
    tag.textContent = days[info.day];
    if (info.boy && info.day === 1) tag.className = "is-tu";
    mark.setAttribute("aria-label", (info.boy ? "Boy" : "Girl") + ", " + days[info.day]);
    mark.appendChild(tag);
    return mark;
  }

  function familyCard(a, b, both) {
    var row = document.createElement("div");
    row.className = "family" + (both ? " is-both" : "");
    row.appendChild(kidNode(a));
    row.appendChild(kidNode(b));
    return row;
  }

  function buildTuesday() {
    var types = [];
    var gender;
    var day;
    var cards = [];
    var i;
    var j;
    var bothBox = document.getElementById("tue-both");
    var restBox = document.getElementById("tue-rest");
    for (gender = 0; gender < 2; gender += 1) {
      for (day = 0; day < 7; day += 1) types.push({ boy: gender === 0, day: day });
    }
    for (i = 0; i < types.length; i += 1) {
      for (j = 0; j < types.length; j += 1) {
        var a = types[i];
        var b = types[j];
        if (!((a.boy && a.day === 1) || (b.boy && b.day === 1))) continue;
        cards.push({ a: a, b: b, both: a.boy && b.boy });
      }
    }
    bothBox.innerHTML = "";
    restBox.innerHTML = "";
    cards.forEach(function (card) {
      (card.both ? bothBox : restBox).appendChild(familyCard(card.a, card.b, card.both));
    });
  }

  function showFour() {
    var board = document.getElementById("tue-board");
    document.getElementById("families").hidden = false;
    document.getElementById("fam-gg").classList.remove("is-out");
    document.getElementById("fam-bb").classList.remove("is-both");
    board.hidden = true;
    board.classList.remove("is-on");
    document.getElementById("days").hidden = mode !== "tuesday";
    caption.textContent = mode === "tuesday"
      ? "Tuesday is marked. Lock a guess, then the families with a Tuesday boy are shown."
      : "Four families, equally likely. Lock a guess, then the ones ruled out leave.";
  }

  function reveal() {
    if (mode === "boy") {
      document.getElementById("fam-gg").classList.add("is-out");
      document.getElementById("fam-bb").classList.add("is-both");
      caption.textContent = "You guessed " + guess.value + "%. Three families remain, and one is two boys. The runs land near one time in three.";
      return;
    }
    var board = document.getElementById("tue-board");
    document.getElementById("families").hidden = true;
    document.getElementById("days").hidden = true;
    board.classList.remove("is-on");
    board.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        board.classList.add("is-on");
      });
    });
    caption.textContent = "You guessed " + guess.value + "%. 27 families have a boy born on Tuesday. 13 of them are two boys. The runs land near 13 times in 27.";
  }

  function unlock() {
    runId += 1;
    locked = false;
    lockBtn.disabled = false;
    runBtn.disabled = true;
    document.getElementById("both").textContent = "—";
    document.getElementById("kept").textContent = "—";
    document.getElementById("target").textContent = "—";
    document.getElementById("guess-note").textContent = "Among the families that match, what share has two boys?";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
    showFour();
  }

  function setMode(next) {
    mode = next;
    document.getElementById("mode-boy").classList.toggle("is-on", mode === "boy");
    document.getElementById("mode-tuesday").classList.toggle("is-on", mode === "tuesday");
    unlock();
  }

  document.getElementById("mode-boy").addEventListener("click", function () { setMode("boy"); });
  document.getElementById("mode-tuesday").addEventListener("click", function () { setMode("tuesday"); });

  function run() {
    var total = Math.max(100, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 2000));
    var kept = 0;
    var both = 0;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 400, function () {
      var family = [child(), child()];
      if (!matches(family)) return;
      kept += 1;
      if (family[0].boy && family[1].boy) both += 1;
    }, function (done, all) {
      if (mine !== runId) return;
      document.getElementById("both").textContent = GymRun.pct(both, kept);
      document.getElementById("kept").textContent = String(kept);
      caption.textContent = "Checked " + done + " of " + all + " families.";
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      document.getElementById("target").textContent = answerText();
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      reveal();
    });
  }

  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });
  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Run the families to compare.";
  });
  runBtn.addEventListener("click", function () { if (locked) run(); });

  buildTuesday();
  setMode("boy");
  document.getElementById("again").addEventListener("click", function () {
    guess.value = "50";
    document.getElementById("guess-label").textContent = "50%";
    setMode("boy");
  });
})();
