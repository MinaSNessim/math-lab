(function () {
  var runaway = document.getElementById("runaway");
  var lever = document.getElementById("lever");
  var five = document.getElementById("five");
  var one = document.getElementById("one");
  var count = document.getElementById("hit-num");
  var leave = document.getElementById("leave");
  var pull = document.getElementById("pull");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var pick = "";
  var gen = 0;

  function clearHits() {
    var nodes = five.querySelectorAll(".folk");
    var i;
    for (i = 0; i < nodes.length; i += 1) nodes[i].classList.remove("is-hit");
    one.classList.remove("is-hit");
  }

  function paint() {
    runaway.classList.remove("to-five", "to-one");
    lever.classList.remove("is-pulled");
    clearHits();
    if (pick === "five") runaway.classList.add("to-five");
    if (pick === "one") {
      runaway.classList.add("to-one");
      lever.classList.add("is-pulled");
    }
    leave.disabled = !!pick;
    pull.disabled = !!pick;
    leave.classList.toggle("is-on", pick === "five");
    pull.classList.toggle("is-on", pick === "one");
    if (!pick) {
      count.textContent = "\u2014";
      caption.textContent = "";
    }
  }

  function go(next, line, hit) {
    if (pick) return;
    pick = next;
    paint();
    var mine = ++gen;
    window.setTimeout(function () {
      if (mine !== gen) return;
      if (hit === "five") {
        var nodes = five.querySelectorAll(".folk");
        var i;
        for (i = 0; i < nodes.length; i += 1) nodes[i].classList.add("is-hit");
        count.textContent = "5";
      } else {
        one.classList.add("is-hit");
        count.textContent = "1";
      }
      caption.textContent = line;
    }, 900);
  }

  leave.addEventListener("click", function () {
    go("five", "The lever stays. The trolley reaches the five.", "five");
  });
  pull.addEventListener("click", function () {
    go("one", "The lever turns the trolley. It reaches the one.", "one");
  });
  again.addEventListener("click", function () {
    gen += 1;
    pick = "";
    paint();
  });
  paint();
})();
