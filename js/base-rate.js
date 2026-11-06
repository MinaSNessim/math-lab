(function () {
  var crowd = document.getElementById("crowd");
  var prevInput = document.getElementById("prev");
  var accInput = document.getElementById("acc");
  var caption = document.getElementById("caption");
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var drawBtn = document.getElementById("draw");
  var locked = false;

  function prev() { return (parseInt(prevInput.value, 10) || 1) / 1000; }
  function acc() { return (parseInt(accInput.value, 10) || 95) / 100; }

  function longRun() {
    var p = prev();
    var a = acc();
    var tp = p * a;
    var fp = (1 - p) * (1 - a);
    return tp / (tp + fp);
  }

  function labels() {
    var p = prev();
    document.getElementById("prev-label").textContent = (p * 100).toFixed(1).replace(/\.0$/, "") + "%";
    document.getElementById("acc-label").textContent = Math.round(acc() * 100) + "%";
  }

  function unlock() {
    locked = false;
    lockBtn.disabled = false;
    drawBtn.disabled = true;
    crowd.innerHTML = "";
    document.getElementById("compare").hidden = true;
    document.getElementById("positive-row").innerHTML = "";
    document.getElementById("ppv-now").textContent = "—";
    document.getElementById("ppv-long").textContent = "—";
    document.getElementById("counts").textContent = "—";
    document.getElementById("guess-note").textContent = "What share of positive tests are real?";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function draw() {
    var p = prev();
    var a = acc();
    var tp = 0;
    var fp = 0;
    var fn = 0;
    var alarms = [];
    crowd.innerHTML = "";
    for (var i = 0; i < 1000; i += 1) {
      var sick = Math.random() < p;
      var positive = sick ? Math.random() < a : Math.random() >= a;
      var dot = document.createElement("i");
      dot.className = "dotp";
      if (sick && positive) { dot.classList.add("tp"); dot.title = "Sick and positive"; alarms.push("tp"); tp += 1; }
      else if (!sick && positive) { dot.classList.add("fp"); dot.title = "Well and positive"; alarms.push("fp"); fp += 1; }
      else if (sick && !positive) { dot.classList.add("fn"); dot.title = "Sick and negative"; fn += 1; }
      else dot.title = "Well and negative";
      crowd.appendChild(dot);
    }
    var row = document.getElementById("positive-row");
    row.innerHTML = "";
    alarms.sort().reverse().forEach(function (kind) {
      var mark = document.createElement("i");
      mark.className = "dotp " + kind;
      mark.title = kind === "tp" ? "Sick and positive" : "Well and positive";
      row.appendChild(mark);
    });
    document.getElementById("compare").hidden = alarms.length === 0;
    document.getElementById("ppv-now").textContent = GymRun.pct(tp, tp + fp);
    document.getElementById("ppv-long").textContent = GymRun.pct(Math.round(longRun() * 10000), 10000);
    document.getElementById("counts").textContent = tp + " / " + (tp + fp);
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
    caption.textContent = "You guessed " + guess.value + "%. This crowd has " + (tp + fn) + " sick people. " + fp + " well people still test positive. The row above is only the positive tests.";
    labels();
  }

  prevInput.addEventListener("input", function () { labels(); unlock(); });
  accInput.addEventListener("input", function () { labels(); unlock(); });
  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });
  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    drawBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Draw the crowd to compare.";
  });
  drawBtn.addEventListener("click", function () { if (locked) draw(); });
  labels();
  document.getElementById("again").addEventListener("click", function () {
    unlock();
    labels();
    caption.textContent = "Lock a guess, then draw the crowd. Green rings are real alarms. Coral rings are false alarms.";
  });
})();
