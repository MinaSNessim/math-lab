(function () {
  var circle = document.getElementById("circle");
  var caption = document.getElementById("caption");
  var runBtn = document.getElementById("run");
  var guess = document.getElementById("guess");
  var lockBtn = document.getElementById("lock");
  var locked = false;
  var rule = "ends";
  var runId = 0;
  var theory = { ends: [1, 3], radial: [1, 2], mid: [1, 4] };
  var names = {
    ends: "two random ends",
    radial: "a spot on a radius",
    mid: "a random midpoint"
  };

  function minor(a, b) {
    var d = Math.abs(a - b) % (Math.PI * 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  }

  function point(angle) {
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  function fromDistance(angle, dist) {
    var half = Math.sqrt(Math.max(0, 1 - dist * dist));
    var px = Math.cos(angle) * dist;
    var py = Math.sin(angle) * dist;
    var tx = -Math.sin(angle);
    var ty = Math.cos(angle);
    return {
      x1: px - tx * half,
      y1: py - ty * half,
      x2: px + tx * half,
      y2: py + ty * half,
      long: dist < 0.5
    };
  }

  function n3(n) { return n.toFixed(3); }

  function triangleMark() {
    var angles = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6];
    return '<polygon points="' + angles.map(function (a) {
      return n3(Math.cos(a)) + "," + n3(Math.sin(a));
    }).join(" ") + '" fill="none" stroke="#f5c518" stroke-width="0.05" stroke-linejoin="round"/>';
  }

  function chordLine(x1, y1, x2, y2, color) {
    return '<line x1="' + n3(x1) + '" y1="' + n3(y1) + '" x2="' + n3(x2) + '" y2="' + n3(y2) +
      '" stroke="' + color + '" stroke-width="0.07" stroke-linecap="round"/>';
  }

  function pickDot(x, y) {
    return '<circle cx="' + n3(x) + '" cy="' + n3(y) + '" r="0.055" fill="#0c1438" stroke="#f5c518" stroke-width="0.028"/>';
  }

  function lengthKey() {
    return '<line x1="-1.15" y1="1.58" x2="-0.5" y2="1.58" stroke="#f5c518" stroke-width="0.07" stroke-linecap="round"/>' +
      '<text x="-0.82" y="1.42" text-anchor="middle" font-size="0.14" font-weight="800" fill="#0c1438" font-family="Nunito, sans-serif">side</text>' +
      '<line x1="-0.28" y1="1.58" x2="0.55" y2="1.58" stroke="#5ec5a7" stroke-width="0.07" stroke-linecap="round"/>' +
      '<text x="0.14" y="1.42" text-anchor="middle" font-size="0.14" font-weight="800" fill="#0c1438" font-family="Nunito, sans-serif">long</text>' +
      '<line x1="0.75" y1="1.58" x2="1.12" y2="1.58" stroke="#fe8e83" stroke-width="0.07" stroke-linecap="round"/>' +
      '<text x="0.93" y="1.42" text-anchor="middle" font-size="0.14" font-weight="800" fill="#0c1438" font-family="Nunito, sans-serif">short</text>';
  }

  function frame(body, label) {
    return '<svg viewBox="-1.35 -1.35 2.7 3.15" role="img" aria-label="' + label + '">' +
      '<circle cx="0" cy="0" r="1" fill="#ffffff" stroke="#0c1438" stroke-width="0.045"/>' +
      triangleMark() + body + lengthKey() + "</svg>";
  }

  function marksFor(line) {
    if (line.kind === "radial") {
      return '<line x1="0" y1="0" x2="' + n3(line.rx) + '" y2="' + n3(line.ry) +
        '" stroke="#0c1438" stroke-width="0.02"/>' + pickDot(line.px, line.py);
    }
    if (line.kind === "mid") return pickDot(line.px, line.py);
    return pickDot(line.x1, line.y1) + pickDot(line.x2, line.y2);
  }

  function chord() {
    if (rule === "ends") {
      var a = Math.random() * Math.PI * 2;
      var b = Math.random() * Math.PI * 2;
      var p = point(a);
      var q = point(b);
      return { x1: p.x, y1: p.y, x2: q.x, y2: q.y, long: minor(a, b) > (Math.PI * 2 / 3), kind: "ends" };
    }
    if (rule === "radial") {
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.random();
      var radial = fromDistance(angle, dist);
      radial.kind = "radial";
      radial.px = Math.cos(angle) * dist;
      radial.py = Math.sin(angle) * dist;
      radial.rx = Math.cos(angle);
      radial.ry = Math.sin(angle);
      return radial;
    }
    var x;
    var y;
    var reach;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      reach = Math.sqrt(x * x + y * y);
    } while (reach > 1);
    var mid = fromDistance(Math.atan2(y, x), reach);
    mid.kind = "mid";
    mid.px = x;
    mid.py = y;
    return mid;
  }

  function draw(line) {
    var color = line.long ? "#5ec5a7" : "#fe8e83";
    circle.innerHTML = frame(
      chordLine(line.x1, line.y1, line.x2, line.y2, color) + marksFor(line),
      line.long ? "Long chord" : "Short chord"
    );
    document.getElementById("this-chord").textContent = line.long ? "Long" : "Short";
    caption.textContent = line.long
      ? "This chord is longer than the triangle's side."
      : "This chord is shorter than the triangle's side.";
  }

  function paintGuide() {
    var longLine = chordLine(-1, 0, 1, 0, "#5ec5a7");
    var shortA = 1.05;
    var shortB = 2.09;
    var shortLine = chordLine(Math.cos(shortA), Math.sin(shortA), Math.cos(shortB), Math.sin(shortB), "#fe8e83");
    circle.innerHTML = frame(longLine + shortLine, "Yellow triangle. Green chord longer than a side. Red chord shorter.");
    document.getElementById("this-chord").textContent = "—";
    caption.textContent = "A long chord, drawn in green, is longer than a side of the yellow triangle. A short chord is red.";
  }

  function unlock() {
    runId += 1;
    locked = false;
    lockBtn.disabled = false;
    runBtn.disabled = true;
    document.getElementById("sim").textContent = "—";
    document.getElementById("theory").textContent = "—";
    document.getElementById("guess-note").textContent = "Lock a share, then draw a chord.";
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function markRule(next) {
    rule = next;
    ["ends", "radial", "mid"].forEach(function (id) {
      document.getElementById("rule-" + id).classList.toggle("is-on", id === next);
    });
  }

  function setRule(next) {
    markRule(next);
    unlock();
    draw(chord());
  }

  document.getElementById("rule-ends").addEventListener("click", function () { setRule("ends"); });
  document.getElementById("rule-radial").addEventListener("click", function () { setRule("radial"); });
  document.getElementById("rule-mid").addEventListener("click", function () { setRule("mid"); });
  document.getElementById("once").addEventListener("click", function () { draw(chord()); });
  guess.addEventListener("input", function () {
    document.getElementById("guess-label").textContent = guess.value + "%";
    if (locked) unlock();
  });
  lockBtn.addEventListener("click", function () {
    locked = true;
    lockBtn.disabled = true;
    runBtn.disabled = false;
    document.getElementById("guess-note").textContent = "Locked at " + guess.value + "%. Run the chords to compare.";
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(document.getElementById("count").value, 10) || 1));
    var hits = 0;
    var last = null;
    var mine = ++runId;
    var pair = theory[rule];
    runBtn.disabled = true;
    GymRun.chunk(total, 100, function () {
      last = chord();
      if (last.long) hits += 1;
    }, function (done) {
      if (mine !== runId) return;
      document.getElementById("sim").textContent = GymRun.pct(hits, done);
    }, function () {
      if (mine !== runId) return;
      runBtn.disabled = false;
      if (last) draw(last);
      document.getElementById("theory").textContent = GymRun.pct(pair[0], pair[1]);
      document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
      caption.textContent = "Your guess was " + guess.value + "%. " + names[rule] +
        " is long about " + GymRun.pct(pair[0], pair[1]) + " of the time.";
    });
  });

  markRule("ends");
  paintGuide();
  document.getElementById("again").addEventListener("click", function () {
    markRule("ends");
    unlock();
    paintGuide();
  });
})();
