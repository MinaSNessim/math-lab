(function () {
  var numbersEl = document.getElementById("numbers");
  var barsEl = document.getElementById("bars");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var locked = false;
  var rule = "grow";
  var runId = 0;

  function firstDigit(n) {
    var x = Math.abs(n);
    if (!x) return 0;
    var exp = Math.floor(Math.log10(x));
    var mant = x / Math.pow(10, exp);
    var digit = Math.floor(mant + 1e-8);
    if (digit < 1) return 1;
    if (digit > 9) return 9;
    return digit;
  }

  function oneNumber() {
    if (rule === "count") return 1 + Math.floor(Math.random() * 999);
    var mantissa = Math.pow(10, Math.random());
    var digit = Math.floor(mantissa);
    if (digit > 9) digit = 9;
    if (digit < 1) digit = 1;
    var exp = 2 + Math.floor(Math.random() * 3);
    var scale = Math.pow(10, exp - 1);
    return digit * scale + Math.floor((mantissa - digit) * scale);
  }

  function paintList(list) {
    numbersEl.innerHTML = list.map(function (n) {
      var text = String(n);
      return "<em>" + text.charAt(0) + "</em>" + text.slice(1);
    }).join("<br>");
    var ones = list.filter(function (n) { return firstDigit(n) === 1; }).length;
    document.getElementById("this-list").textContent = ones + " of " + list.length;
  }

  function paintBars(counts, total) {
    barsEl.innerHTML = "";
    var d;
    for (d = 1; d <= 9; d += 1) {
      var share = total ? counts[d] / total : 0;
      var row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = "<span>" + d + "</span><div class=\"track\"><div class=\"fill" +
        (d === 1 ? "" : " coral") + "\" style=\"width:" + Math.min(100, share / 0.32 * 100) +
        "%\"></div></div><b>" + (total ? GymRun.pct(counts[d], total) : "—") + "</b>";
      barsEl.appendChild(row);
    }
  }

  function freshCounts() {
    var counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    return counts;
  }

  function sheet() {
    var list = [];
    var i;
    for (i = 0; i < 8; i += 1) list.push(oneNumber());
    paintList(list);
    caption.textContent = rule === "grow"
      ? "These eight come from many sizes. The coral figure is the first digit."
      : "These eight are a count from 1 through 999. Each first digit gets a similar turn.";
  }

  function theoryText() {
    return rule === "grow" ? GymRun.pct(3010, 10000) : GymRun.pct(111, 999);
  }

  function unlock() {
    runId += 1;
    locked = false;
    lockBtn.disabled = false;
    runBtn.disabled = true;
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    paintBars(freshCounts(), 0);
    document.getElementById("guess-note").textContent = "Lock a share, then read the list.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function setRule(next) {
    rule = next;
    document.getElementById("rule-grow").classList.toggle("is-on", next === "grow");
    document.getElementById("rule-count").classList.toggle("is-on", next === "count");
    unlock();
    sheet();
  }

  document.getElementById("rule-grow").addEventListener("click", function () { setRule("grow"); });
  document.getElementById("rule-count").addEventListener("click", function () { setRule("count"); });
  document.getElementById("once").addEventListener("click", sheet);
  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });
  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Run the list to compare.";
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var counts = freshCounts();
    var list = [];
    var mine = ++runId;
    runBtn.disabled = true;
    GymRun.chunk(total, 200, function () {
      var n = oneNumber();
      counts[firstDigit(n)] += 1;
      if (list.length < 8) list.push(n);
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = GymRun.pct(counts[1], done);
      paintBars(counts, done);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      paintList(list);
      document.getElementById("theory").textContent = theoryText();
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      caption.textContent = "Your guess was " + guess.value + "%. In this rule, 1 leads about " + theoryText() + " of the time.";
    });
  });

  setRule("grow");
  document.getElementById("again").addEventListener("click", function () { setRule("grow"); });
})();
