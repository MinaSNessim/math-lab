(function () {
  var tellersEl = document.getElementById("tellers");
  var bothEl = document.getElementById("both");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var locked = false;
  var club = 0.35;
  var guess = "";
  var runId = 0;
  var labels = {
    long: "the longer story fits more people",
    teller: "bank teller fits more people",
    same: "the two stories match"
  };

  function room() {
    var people = [];
    var i;
    for (i = 0; i < 24; i += 1) {
      var teller = Math.random() < 0.55;
      people.push({ teller: teller, club: teller && Math.random() < club });
    }
    return people;
  }

  function counts(people) {
    var tellers = 0;
    var both = 0;
    people.forEach(function (person) {
      if (person.teller) tellers += 1;
      if (person.club) both += 1;
    });
    return { tellers: tellers, both: both };
  }

  function paint(people) {
    tellersEl.innerHTML = "";
    bothEl.innerHTML = "";
    people.forEach(function (person) {
      if (!person.teller) return;
      var spot = document.createElement("span");
      spot.className = "person" + (person.club ? " is-club" : "");
      spot.setAttribute("aria-label", person.club ? "Teller in the club" : "Teller");
      tellersEl.appendChild(spot);
      if (person.club) {
        var again = document.createElement("span");
        again.className = "person is-club";
        again.setAttribute("aria-label", "Teller in the club");
        bothEl.appendChild(again);
      }
    });
    if (!tellersEl.children.length) tellersEl.textContent = "No tellers in this room.";
    if (!bothEl.children.length) bothEl.textContent = "Nobody is both.";
    var c = counts(people);
    document.getElementById("this-room").textContent = c.tellers + " · " + c.both;
    caption.textContent = c.both + " of the " + c.tellers + " tellers are also in the club.";
  }

  function unlock() {
    runId += 1;
    locked = false;
    guess = "";
    runBtn.disabled = true;
    ["guess-long", "guess-teller", "guess-same"].forEach(function (id) {
      document.getElementById(id).classList.remove("is-on");
      document.getElementById(id).disabled = false;
    });
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a guess, then fill the rooms.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function setClub(next) {
    club = next;
    document.getElementById("rule-rare").classList.toggle("is-on", next < 1);
    document.getElementById("rule-all").classList.toggle("is-on", next === 1);
    unlock();
    paint(room());
  }

  function lock(kind) {
    guess = kind;
    locked = true;
    ["guess-long", "guess-teller", "guess-same"].forEach(function (id) {
      var button = document.getElementById(id);
      button.classList.toggle("is-on", id === "guess-" + kind);
      button.disabled = true;
    });
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked: " + labels[kind] + ".";
  }

  document.getElementById("rule-rare").addEventListener("click", function () { setClub(0.35); });
  document.getElementById("rule-all").addEventListener("click", function () { setClub(1); });
  document.getElementById("once").addEventListener("click", function () { paint(room()); });
  document.getElementById("guess-long").addEventListener("click", function () { lock("long"); });
  document.getElementById("guess-teller").addEventListener("click", function () { lock("teller"); });
  document.getElementById("guess-same").addEventListener("click", function () { lock("same"); });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var ahead = 0;
    var last = null;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 40, function () {
      last = room();
      var c = counts(last);
      if (c.both > c.tellers) ahead += 1;
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = GymRun.pct(ahead, done);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) paint(last);
      document.getElementById("theory").textContent = club === 1 ? "They match" : "Never ahead";
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      caption.textContent = "You locked “" + labels[guess] + ".” The longer story was ahead in " +
        document.getElementById("sim").textContent + " of these rooms.";
    });
  });

  setClub(0.35);
  document.getElementById("again").addEventListener("click", function () { setClub(0.35); });
})();
