(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var TRIALS = [
    { you: 1, first: 3 },
    { you: 0, first: 2 },
    { you: 3, first: 3 },
    { you: 2, first: 0 },
    { you: 0, first: 1 },
    { you: 2, first: 3 }
  ];

  function figure(color) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="87" cy="78" r="66" fill="none" stroke="' + YELLOW + '" stroke-width="8"/>'
      + '<rect x="24" y="120" width="126" height="84" rx="30" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="52" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="94" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle cx="87" cy="78" r="58" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function makeRand(seed) {
    var x = seed % 233280;
    return function () {
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };
  }

  function run100() {
    var rnd = makeRand(9);
    var other = 0;
    var t;
    var you;
    var first;
    var k;
    var times;
    for (t = 0; t < 100; t += 1) {
      you = Math.floor(rnd() * 4);
      times = [rnd(), rnd(), rnd(), rnd()];
      first = 0;
      for (k = 1; k < 4; k += 1) {
        if (times[k] < times[first]) first = k;
      }
      if (first !== you) other += 1;
    }
    return other;
  }

  var scene = S.el("div", "lane-scene");
  var lanes = [];
  var queues = [];
  var flags = [];
  var lane;
  var p;
  for (lane = 0; lane < 4; lane += 1) {
    var col = S.el("div", "check-col");
    col.appendChild(S.el("div", "lane-post"));
    var flag = S.el("b", "lane-flag");
    flag.textContent = "First";
    col.appendChild(flag);
    flags.push(flag);
    var name = S.el("span", "lane-name");
    name.textContent = "Line " + (lane + 1);
    col.appendChild(name);
    var queue = S.el("div", "lane-queue");
    var people = [];
    for (p = 0; p < 4; p += 1) {
      var person = S.el("div", "lane-person");
      person.appendChild(figure(RED));
      queue.appendChild(person);
      people.push(person);
    }
    col.appendChild(queue);
    scene.appendChild(col);
    lanes.push(col);
    queues.push(people);
  }
  var you = S.el("div", "lane-you");
  you.appendChild(figure(GREEN));
  var youName = S.el("b");
  youName.textContent = "You";
  you.appendChild(youName);
  scene.appendChild(you);

  var totals = S.el("div", "pic-totals");
  var resultP = S.el("p");
  var result = S.el("b");
  result.id = "lane-result";
  result.textContent = "\u2014";
  var resultName = S.el("span");
  resultName.id = "lane-result-name";
  resultName.textContent = "Another line finished first";
  resultP.appendChild(result);
  resultP.appendChild(resultName);
  totals.appendChild(resultP);
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var onceBtn = S.button("Join a random line and run", "btn");
  var manyBtn = S.button("Run 100 times", "btn");
  onceBtn.setAttribute("data-pace", "900");
  manyBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(onceBtn);
  controls.appendChild(manyBtn);
  board.appendChild(scene);
  board.appendChild(totals);
  board.appendChild(caption);
  board.appendChild(controls);

  var step = 0;
  var mode = "idle";
  var round = 0;
  var hundred = run100();

  function park(doSnap) {
    var x = Math.max(0, (scene.clientWidth - you.offsetWidth) / 2);
    if (doSnap) you.style.setProperty("transition", "none", "important");
    you.style.transform = "translate(" + Math.round(x) + "px, 0px)";
    if (doSnap) {
      void you.offsetWidth;
      you.style.removeProperty("transition");
    }
  }

  function placeYou(index, doSnap) {
    var sceneBox = scene.getBoundingClientRect();
    var col = lanes[index];
    var queue = col.querySelector(".lane-queue");
    var colBox = col.getBoundingClientRect();
    var queueBox = queue.getBoundingClientRect();
    var x = colBox.left - sceneBox.left + (colBox.width - you.offsetWidth) / 2;
    var y = (queueBox.bottom - sceneBox.top) + 2 + you.offsetHeight - sceneBox.height;
    if (doSnap) you.style.setProperty("transition", "none", "important");
    you.style.transform = "translate(" + Math.round(x) + "px, " + Math.round(y) + "px)";
    if (doSnap) {
      void you.offsetWidth;
      you.style.removeProperty("transition");
    }
  }

  function clearMotion(doSnap) {
    var r;
    var c;
    if (doSnap) {
      you.style.setProperty("transition", "none", "important");
      for (r = 0; r < queues.length; r += 1) {
        for (c = 0; c < queues[r].length; c += 1) queues[r][c].style.setProperty("transition", "none", "important");
      }
    }
    for (r = 0; r < queues.length; r += 1) {
      lanes[r].classList.remove("is-first");
      for (c = 0; c < queues[r].length; c += 1) queues[r][c].classList.remove("is-gone");
    }
    if (doSnap) {
      void scene.offsetWidth;
      you.style.removeProperty("transition");
      for (r = 0; r < queues.length; r += 1) {
        for (c = 0; c < queues[r].length; c += 1) queues[r][c].style.removeProperty("transition");
      }
    }
  }

  function paint(doSnap) {
    clearMotion(doSnap);
    if (mode === "once") {
      var trial = TRIALS[(step - 1 + TRIALS.length) % TRIALS.length];
      var r;
      placeYou(trial.you, doSnap);
      lanes[trial.first].classList.add("is-first");
      for (r = 0; r < 4; r += 1) queues[trial.first][r].classList.add("is-gone");
      if (trial.first !== 0) queues[0][0].classList.add("is-gone");
      if (trial.first !== 1) queues[1][0].classList.add("is-gone");
      if (trial.first !== 2) queues[2][0].classList.add("is-gone");
      if (trial.first !== 3) queues[3][0].classList.add("is-gone");
      result.textContent = trial.first === trial.you ? "Your line" : ("Line " + (trial.first + 1));
      resultName.textContent = "Finished first";
    } else if (mode === "many") {
      park(doSnap);
      result.textContent = hundred + " of 100";
      resultName.textContent = "Another line finished first";
    } else {
      park(doSnap);
      result.textContent = "\u2014";
      resultName.textContent = "Another line finished first";
    }
  }

  function textFor() {
    if (mode === "once") {
      var trial = TRIALS[(step - 1 + TRIALS.length) % TRIALS.length];
      if (trial.first === trial.you) {
        return "You joined line " + (trial.you + 1) + " and your line finished first.";
      }
      return "You joined line " + (trial.you + 1) + ". Line " + (trial.first + 1) + " finished first.";
    }
    if (mode === "many") {
      return "Another line finished first in " + hundred + " of 100 runs.";
    }
    return "Four lines, with the same kind of customers in each.";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = textFor();
    paint(doSnap);
    if (doSnap) caption.textContent = text;
    else window.setTimeout(function () {
      if (mine !== round) return;
      caption.textContent = text;
    }, 900);
  }

  onceBtn.addEventListener("click", function () {
    mode = "once";
    step += 1;
    show(false);
  });
  manyBtn.addEventListener("click", function () {
    mode = "many";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "idle";
    step = 0;
    show(true);
  });
  window.addEventListener("resize", function () { paint(true); });
  show(true);
})();
