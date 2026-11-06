(function () {
  var boxesEl = document.getElementById("boxes");
  var drawEl = document.getElementById("draw");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var locked = false;
  var rule = "faces";
  var runId = 0;
  var names = { GG: "Gold, gold", GS: "Gold, silver", SS: "Silver, silver" };

  function coin(kind) {
    return kind === "G" ? "images/coin-gold.png" : "images/coin-silver.png";
  }

  function paintBoxes(open) {
    boxesEl.innerHTML = "";
    ["GG", "GS", "SS"].forEach(function (id) {
      var tray = document.createElement("div");
      tray.className = "tray" + (open && open.box === id ? " is-on" : "");
      var faces = id.split("");
      tray.innerHTML = '<img src="images/box.png" alt="">' +
        '<span class="coins"><img src="' + coin(faces[0]) + '" alt=""><img src="' + coin(faces[1]) + '" alt=""></span>' +
        '<span class="name">' + names[id] + "</span>";
      boxesEl.appendChild(tray);
    });
  }

  function sample() {
    if (rule === "boxes") {
      var box = Math.random() < 0.5 ? "GG" : "GS";
      return { box: box, shown: "G", other: box === "GG" ? "G" : "S" };
    }
    var ids = ["GG", "GS", "SS"];
    var box = ids[Math.floor(Math.random() * 3)];
    var faces = box.split("");
    var i = Math.floor(Math.random() * 2);
    return { box: box, shown: faces[i], other: faces[1 - i] };
  }

  function goldDraw() {
    var draw = sample();
    var guard = 0;
    while (rule === "faces" && draw.shown !== "G" && guard < 40) {
      draw = sample();
      guard += 1;
    }
    return draw;
  }

  function show(draw) {
    paintBoxes(draw);
    var otherName = draw.other === "G" ? "Gold" : "Silver";
    drawEl.innerHTML = '<img src="' + coin(draw.shown) + '" alt="">' +
      "<b>Showing " + (draw.shown === "G" ? "gold" : "silver") + ". Other coin: " + otherName.toLowerCase() + ".</b>";
    document.getElementById("this-draw").textContent = otherName;
    caption.textContent = draw.other === "G"
      ? "The other coin is gold. This box is " + names[draw.box].toLowerCase() + "."
      : "The other coin is silver. This box is " + names[draw.box].toLowerCase() + ".";
  }

  function theoryText() {
    return rule === "faces" ? GymRun.pct(2, 3) : GymRun.pct(1, 2);
  }

  function unlock() {
    runId += 1;
    locked = false;
    lockBtn.disabled = false;
    runBtn.disabled = true;
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a share, then draw.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function setRule(next) {
    rule = next;
    document.getElementById("rule-faces").classList.toggle("is-on", next === "faces");
    document.getElementById("rule-boxes").classList.toggle("is-on", next === "boxes");
    unlock();
    show(goldDraw());
  }

  document.getElementById("rule-faces").addEventListener("click", function () { setRule("faces"); });
  document.getElementById("rule-boxes").addEventListener("click", function () { setRule("boxes"); });
  document.getElementById("once").addEventListener("click", function () { show(goldDraw()); });

  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });

  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Run the draws to compare.";
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var hits = 0;
    var scored = 0;
    var last = null;
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 80, function () {
      var draw = sample();
      if (rule === "faces" && draw.shown !== "G") return;
      scored += 1;
      last = draw;
      if (draw.other === "G") hits += 1;
    }, function () {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = GymRun.pct(hits, scored);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) show(last);
      document.getElementById("theory").textContent = theoryText();
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      caption.textContent = "Your guess was " + guess.value + "%. This rule lands near " + theoryText() + ".";
    });
  });

  setRule("faces");
  document.getElementById("again").addEventListener("click", function () { setRule("faces"); });
})();
