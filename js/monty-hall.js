(function () {
  var carHtml = '<img class="prize-img car" src="images/car.png" alt="Car">';
  var goatHtml = '<img class="prize-img goat" src="images/goat.png" alt="Goat">';
  var doorsEl = document.getElementById("doors");
  var gridEl = document.getElementById("grid");
  var caption = document.getElementById("caption");
  var stayBtn = document.getElementById("stay");
  var switchBtn = document.getElementById("switch");
  var againBtn = document.getElementById("next-round");
  var runBtn = document.getElementById("run");
  var countInput = document.getElementById("count");
  var hostUsual = document.getElementById("host-usual");
  var hostRandom = document.getElementById("host-random");
  var host = "usual";
  var doorCount = 3;
  var phase = "pick";
  var car = 0;
  var pick = -1;
  var open = -1;
  var other = -1;
  var you = blankScore();
  var buttons = [];
  var cells = [];

  function blankScore() {
    return { games: 0, stayWin: 0, stay: 0, switchWin: 0, switched: 0 };
  }

  function scoreKey() {
    return "gym-monty-score-" + doorCount;
  }

  function loadYou() {
    you = blankScore();
    try {
      var saved = JSON.parse(localStorage.getItem(scoreKey()) || "null");
      if (!saved || typeof saved.games !== "number") return;
      you.games = saved.games || 0;
      you.stay = saved.stay || 0;
      you.stayWin = saved.stayWin || 0;
      you.switched = saved.switched || 0;
      you.switchWin = saved.switchWin || 0;
    } catch (err) {
      you = blankScore();
    }
  }

  function saveYou() {
    try { localStorage.setItem(scoreKey(), JSON.stringify(you)); } catch (err) {}
  }

  function paintDock() {
    var dock = document.getElementById("choice-dock");
    var show = doorCount === 100 && phase !== "pick" && pick >= 0 && other >= 0;
    dock.hidden = !show;
    document.body.classList.toggle("has-dock", show);
    if (!show) return;
    document.getElementById("dock-stay-label").textContent = "Your door " + (pick + 1);
    document.getElementById("dock-switch-label").textContent = "The other door " + (other + 1);
    var stayPic = document.getElementById("dock-stay-pic");
    var switchPic = document.getElementById("dock-switch-pic");
    stayPic.className = "mini-door is-yours";
    switchPic.className = "mini-door is-other";
    if (phase === "done") {
      stayPic.classList.add(pick === car ? "is-car" : "is-goat");
      switchPic.classList.add(other === car ? "is-car" : "is-goat");
    }
    document.getElementById("dock-stay").disabled = phase !== "offer";
    document.getElementById("dock-switch").disabled = phase !== "offer";
  }

  function paintScore() {
    document.getElementById("you-games").textContent = String(you.games);
    document.getElementById("you-stay").textContent = GymRun.pct(you.stayWin, you.stay);
    document.getElementById("you-switch").textContent = GymRun.pct(you.switchWin, you.switched);
    stayBtn.disabled = phase !== "offer";
    switchBtn.disabled = phase !== "offer";
    againBtn.hidden = phase === "pick";
    doorsEl.hidden = doorCount !== 3;
    gridEl.hidden = doorCount === 3;
    hostUsual.hidden = doorCount !== 3;
    hostRandom.hidden = doorCount !== 3;
    paintDock();
  }

  function paintThree() {
    buttons.forEach(function (button, index) {
      button.className = "door";
      if (index === pick && phase !== "pick") button.classList.add("is-picked");
      var revealed = phase === "done" || index === open;
      if (revealed && (phase === "done" || open !== -1)) button.classList.add("is-open");
      if (button.classList.contains("is-open")) {
        var prize = index === car ? carHtml : goatHtml;
        var label = index === car ? "Car" : "Goat";
        button.innerHTML = prize + '<span class="prize">' + label + "</span>";
      } else {
        button.innerHTML = '<img class="slab" src="images/door.png" alt=""><span class="face">' + (index + 1) + "</span>";
      }
      button.disabled = phase !== "pick";
    });
  }

  function paintHundred() {
    cells.forEach(function (cell, index) {
      cell.className = "cell";
      cell.disabled = phase !== "pick";
      if (phase === "pick") return;
      if (index === pick) cell.classList.add("is-pick");
      if (index === other) cell.classList.add("is-other");
      if (phase === "done") {
        cell.classList.add(index === car ? "is-car" : "is-open");
        return;
      }
      if (index !== pick && index !== other) cell.classList.add("is-open");
    });
  }

  function paint() {
    if (doorCount === 3) paintThree();
    else paintHundred();
    paintScore();
  }

  function showSample(game) {
    car = game.car;
    pick = game.pick;
    open = game.open === undefined ? -1 : game.open;
    other = game.rest;
    phase = "done";
    paint();
  }

  function remainingGoat(chosen, autoCar, total) {
    var goat;
    do { goat = Math.floor(Math.random() * total); } while (goat === autoCar);
    return chosen === autoCar ? goat : autoCar;
  }

  function deal() {
    car = Math.floor(Math.random() * doorCount);
    pick = -1;
    open = -1;
    other = -1;
    phase = "pick";
    caption.textContent = doorCount === 100
      ? "Pick one of the hundred doors. One hides the car."
      : "Pick a door.";
    paint();
  }

  function hostOpen() {
    var others = [0, 1, 2].filter(function (door) { return door !== pick; });
    if (host === "usual") {
      var goats = others.filter(function (door) { return door !== car; });
      open = goats[Math.floor(Math.random() * goats.length)];
      phase = "offer";
      caption.textContent = "Monty opened door " + (open + 1) + ", a goat. Stay or switch?";
      paint();
      return;
    }
    open = others[Math.floor(Math.random() * others.length)];
    if (open === car) {
      phase = "done";
      caption.textContent = "The random host revealed the car. This game is not scored.";
      paint();
      return;
    }
    phase = "offer";
    caption.textContent = "The random host opened a goat on door " + (open + 1) + ". Stay or switch?";
    paint();
  }

  function finish(switched) {
    var won = doorCount === 100
      ? (switched ? other === car : pick === car)
      : (switched ? pick !== car : pick === car);
    you.games += 1;
    if (switched) {
      you.switched += 1;
      if (won) you.switchWin += 1;
    } else {
      you.stay += 1;
      if (won) you.stayWin += 1;
    }
    phase = "done";
    caption.textContent = won ? "You won the car." : "You got a goat.";
    saveYou();
    paint();
  }

  function oneAuto() {
    var autoPick = Math.floor(Math.random() * doorCount);
    var autoCar = Math.floor(Math.random() * doorCount);
    if (doorCount === 100) {
      return { car: autoCar, pick: autoPick, rest: remainingGoat(autoPick, autoCar, 100) };
    }
    var others = [0, 1, 2].filter(function (door) { return door !== autoPick; });
    var opened;
    if (host === "usual") {
      var goats = others.filter(function (door) { return door !== autoCar; });
      opened = goats[Math.floor(Math.random() * goats.length)];
    } else {
      opened = others[Math.floor(Math.random() * others.length)];
      if (opened === autoCar) return null;
    }
    var rest = others.filter(function (door) { return door !== opened; })[0];
    return { car: autoCar, pick: autoPick, open: opened, rest: rest };
  }

  for (var i = 0; i < 3; i += 1) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "door";
    button.setAttribute("aria-label", "Door " + (i + 1));
    button.addEventListener("click", (function (index) {
      return function () {
        if (phase !== "pick" || doorCount !== 3) return;
        pick = index;
        phase = "wait";
        caption.textContent = "You picked door " + (index + 1) + ".";
        paint();
        window.setTimeout(hostOpen, GymRun.reduced() ? 0 : 350);
      };
    })(i));
    doorsEl.appendChild(button);
    buttons.push(button);
  }

  for (var n = 0; n < 100; n += 1) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.setAttribute("aria-label", "Door " + (n + 1));
    cell.addEventListener("click", (function (index) {
      return function () {
        if (phase !== "pick" || doorCount !== 100) return;
        pick = index;
        other = remainingGoat(pick, car, 100);
        phase = "offer";
        caption.textContent = "You picked door " + (pick + 1) + ". The host left door " + (other + 1) + " closed. Stay or switch?";
        paint();
      };
    })(n));
    gridEl.appendChild(cell);
    cells.push(cell);
  }

  stayBtn.addEventListener("click", function () { if (phase === "offer") finish(false); });
  switchBtn.addEventListener("click", function () { if (phase === "offer") finish(true); });
  document.getElementById("dock-stay").addEventListener("click", function () { if (phase === "offer") finish(false); });
  document.getElementById("dock-switch").addEventListener("click", function () { if (phase === "offer") finish(true); });
  againBtn.addEventListener("click", deal);

  function setCount(next) {
    doorCount = next;
    host = "usual";
    hostUsual.classList.add("is-on");
    hostRandom.classList.remove("is-on");
    document.getElementById("count-3").classList.toggle("is-on", next === 3);
    document.getElementById("count-3").classList.toggle("ghost", next !== 3);
    document.getElementById("count-100").classList.toggle("is-on", next === 100);
    document.getElementById("count-100").classList.toggle("ghost", next !== 100);
    loadYou();
    document.getElementById("batch-games").textContent = "0";
    document.getElementById("batch-stay").textContent = "0%";
    document.getElementById("batch-switch").textContent = "0%";
    deal();
  }

  document.getElementById("count-3").addEventListener("click", function () { setCount(3); });
  document.getElementById("count-100").addEventListener("click", function () { setCount(100); });
  hostUsual.addEventListener("click", function () {
    if (doorCount !== 3) return;
    host = "usual";
    hostUsual.classList.add("is-on");
    hostRandom.classList.remove("is-on");
    deal();
  });
  hostRandom.addEventListener("click", function () {
    if (doorCount !== 3) return;
    host = "random";
    hostRandom.classList.add("is-on");
    hostUsual.classList.remove("is-on");
    deal();
  });
  document.getElementById("reset").addEventListener("click", function () {
    you = blankScore();
    try { localStorage.removeItem(scoreKey()); } catch (err) {}
    deal();
  });

  runBtn.addEventListener("click", function () {
    var total = Math.max(1, Math.min(20000, parseInt(countInput.value, 10) || 1));
    var scored = 0;
    var stayWin = 0;
    var switchWin = 0;
    var sample = null;
    runBtn.disabled = true;
    GymRun.chunk(total, doorCount === 100 ? 400 : 250, function () {
      var game = oneAuto();
      if (!game) return;
      scored += 1;
      if (game.pick === game.car) stayWin += 1;
      if (game.rest === game.car) switchWin += 1;
      sample = game;
    }, function (done, all) {
      document.getElementById("batch-games").textContent = String(scored);
      document.getElementById("batch-stay").textContent = GymRun.pct(stayWin, scored);
      document.getElementById("batch-switch").textContent = GymRun.pct(switchWin, scored);
      caption.textContent = "Ran " + done + " of " + all + " games with " + doorCount + " doors.";
      if (sample) showSample(sample);
    }, function () {
      runBtn.disabled = false;
      if (sample) showSample(sample);
    });
  });

  if (location.hash === "#hundred") setCount(100);
  else {
    loadYou();
    deal();
  }
  document.getElementById("again").addEventListener("click", function () {
    if (location.hash === "#hundred") setCount(100);
    else setCount(3);
  });
})();
