(function () {
  var board = document.getElementById("board");
  var caption = document.getElementById("caption");
  var illInput = document.getElementById("ill");
  var pieCatch = document.getElementById("pie-catch");
  var pieReal = document.getElementById("pie-real");
  var illNow = 10;
  var timer = 0;
  var locked = "";

  function counts(ill) {
    var well = 100 - ill;
    var tp = Math.round(ill * 9 / 10);
    var fp = Math.round(well / 15);
    if (tp > ill) tp = ill;
    if (fp > well) fp = well;
    return { ill: ill, well: well, tp: tp, fp: fp };
  }

  function tenth(part, whole) {
    if (!whole) return 0;
    return Math.round((1000 * part) / whole) / 10;
  }

  function faces(count) {
    var shown = Math.min(count, 8);
    var pics = "";
    var i;
    for (i = 0; i < shown; i += 1) pics += '<img src="images/person.png" alt="">';
    return '<span class="bayes-faces">' + pics + "</span><b>" + count + "</b>";
  }

  function cell(name, count, key) {
    return '<div class="bayes-cell" data-key="' + key + '" aria-label="' + name + ", " + count + '">' +
      faces(count) + "</div>";
  }

  function paint(ill) {
    var data = counts(ill);
    var sum = data.tp + data.fp;
    var catchPct = GymRun.pct(data.tp, data.ill);
    var realPct = GymRun.pct(data.tp, sum);
    var open = locked !== "";
    illNow = ill;
    illInput.value = String(ill);
    document.getElementById("ill-label").textContent = String(ill);
    pieCatch.style.setProperty("--share", String(tenth(data.tp, data.ill)));
    pieReal.style.setProperty("--share", open ? String(tenth(data.tp, sum)) : "0");
    document.getElementById("catch-label").textContent = catchPct;
    document.getElementById("real-label").textContent = open ? realPct : "—";
    document.getElementById("column").textContent = open ? realPct : "—";
    document.getElementById("split").textContent = open ? data.tp + " + " + data.fp + " = " + sum : "—";
    pieCatch.setAttribute("aria-label", "Of the people who are ill, the test catches " + catchPct);
    pieReal.setAttribute("aria-label", open
      ? "Of the people the test calls ill, " + realPct + " are really ill"
      : "Of the people the test calls ill, the share who are really ill is still hidden");
    board.innerHTML = '<div></div><div class="bayes-head">Test says ill</div><div class="bayes-head">Test says well</div>' +
      '<div class="bayes-side">Actually ill</div>' +
      cell("Actually ill, and the test says ill", data.tp, "ill-plus") +
      cell("Actually ill, and the test says well", data.ill - data.tp, "ill-minus") +
      '<div class="bayes-side">Actually well</div>' +
      cell("Actually well, and the test says ill", data.fp, "well-plus") +
      cell("Actually well, and the test says well", data.well - data.fp, "well-minus");
    board.querySelector('[data-key="ill-plus"]').classList.add("is-on");
    board.querySelector('[data-key="well-plus"]').classList.add("is-on");
    document.getElementById("start").textContent = data.ill + " of 100";
    document.getElementById("room-10").classList.toggle("is-on", ill === 10);
    document.getElementById("room-40").classList.toggle("is-on", ill === 40);
    if (!open) {
      caption.textContent = "The test catches " + catchPct + " of the people who are ill. Lock a share for the people it calls ill.";
      return;
    }
    caption.textContent = "You said " + locked + "%. The test calls " + sum + " people ill: " + data.tp +
      " really ill and " + data.fp + " well. " + data.tp + " of " + sum + " is " + realPct + "." +
      (catchPct === realPct ? " The two questions land on the same number." : "");
  }

  function clearGuess() {
    locked = "";
    Array.prototype.forEach.call(document.querySelectorAll("[data-guess]"), function (button) {
      button.classList.remove("is-on");
    });
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = true; });
  }

  function lockGuess(value) {
    locked = value;
    Array.prototype.forEach.call(document.querySelectorAll("[data-guess]"), function (button) {
      button.classList.toggle("is-on", button.getAttribute("data-guess") === value);
    });
    document.querySelectorAll(".spoiler").forEach(function (note) { note.hidden = false; });
  }

  function goTo(target) {
    if (timer) window.clearInterval(timer);
    timer = 0;
    if (GymRun.reduced() || target === illNow) {
      paint(target);
      return;
    }
    var step = target > illNow ? 1 : -1;
    timer = window.setInterval(function () {
      var next = illNow + step;
      paint(next);
      if (next === target) {
        window.clearInterval(timer);
        timer = 0;
      }
    }, 18);
  }

  illInput.addEventListener("input", function () {
    if (timer) window.clearInterval(timer);
    timer = 0;
    clearGuess();
    paint(parseInt(illInput.value, 10));
  });
  document.getElementById("room-10").addEventListener("click", function () { clearGuess(); goTo(10); });
  document.getElementById("room-40").addEventListener("click", function () { clearGuess(); goTo(40); });
  document.getElementById("guess-row").addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== this) {
      if (node.getAttribute && node.getAttribute("data-guess")) {
        lockGuess(node.getAttribute("data-guess"));
        paint(illNow);
        return;
      }
      node = node.parentNode;
    }
  });
  paint(10);
  document.getElementById("again").addEventListener("click", function () {
    if (timer) window.clearInterval(timer);
    timer = 0;
    clearGuess();
    paint(10);
  });
})();
