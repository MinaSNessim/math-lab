(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function hole(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="1.5"/>';
  }

  function plane(kind) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 200 180");
    svg.setAttribute("class", "plane-art");
    svg.setAttribute("aria-hidden", "true");
    var marks = kind === "home"
      ? hole(26, 88) + hole(174, 88) + hole(34, 102) + hole(166, 102) + hole(100, 112) + hole(100, 130) + hole(100, 78)
      : hole(58, 93) + hole(142, 93) + hole(100, 48) + hole(100, 64);
    var hint = kind === "home"
      ? '<rect class="plane-hint plane-hint-home" x="14" y="78" width="28" height="28" fill="none" stroke="' + YELLOW + '" stroke-width="3" rx="4"/>'
        + '<rect class="plane-hint plane-hint-home" x="158" y="78" width="28" height="28" fill="none" stroke="' + YELLOW + '" stroke-width="3" rx="4"/>'
      : '<rect class="plane-hint plane-hint-lost" x="44" y="36" width="112" height="70" fill="none" stroke="' + YELLOW + '" stroke-width="3" rx="8"/>';
    svg.innerHTML = '<polygon points="8,78 192,78 176,108 24,108" fill="' + GREEN + '" stroke="' + YELLOW + '" stroke-width="4" stroke-linejoin="round"/>'
      + '<polygon points="58,132 142,132 156,158 44,158" fill="' + GREEN + '" stroke="' + YELLOW + '" stroke-width="4" stroke-linejoin="round"/>'
      + '<rect x="78" y="28" width="44" height="116" rx="18" fill="' + GREEN + '" stroke="' + YELLOW + '" stroke-width="4"/>'
      + '<circle cx="58" cy="93" r="11" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<circle cx="142" cy="93" r="11" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<circle cx="100" cy="48" r="9" fill="' + RED + '" stroke="' + INK + '" stroke-width="2"/>'
      + marks
      + hint;
    return svg;
  }

  var scene = S.el("div", "plane-scene");
  var home = S.el("div", "plane-card plane-home");
  home.appendChild(plane("home"));
  var homeName = S.el("b");
  homeName.textContent = "Came home";
  home.appendChild(homeName);
  var lost = S.el("div", "plane-card plane-lost");
  lost.appendChild(plane("lost"));
  var lostName = S.el("b");
  lostName.textContent = "Did not come home";
  lost.appendChild(lostName);
  scene.appendChild(home);
  scene.appendChild(lost);
  var advice = S.el("p", "plane-advice");
  advice.id = "plane-advice";
  var caption = S.el("p", "caption");
  caption.id = "caption";
  var homeBtn = S.button("Only surviving planes", "btn");
  var allBtn = S.button("All planes", "btn");
  homeBtn.setAttribute("data-pace", "900");
  allBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(homeBtn);
  controls.appendChild(allBtn);
  board.appendChild(scene);
  board.appendChild(advice);
  board.appendChild(caption);
  board.appendChild(controls);

  var mode = "home";
  var round = 0;

  function paint(doSnap) {
    if (doSnap) {
      home.style.setProperty("transition", "none", "important");
      lost.style.setProperty("transition", "none", "important");
    }
    scene.classList.toggle("is-all", mode === "all");
    homeBtn.classList.toggle("is-on", mode === "home");
    allBtn.classList.toggle("is-on", mode === "all");
    advice.textContent = mode === "all"
      ? "Armor the engines and the cockpit."
      : "The holes you can see are on the wings and the body.";
    if (doSnap) {
      void scene.offsetWidth;
      home.style.removeProperty("transition");
      lost.style.removeProperty("transition");
    }
  }

  function textFor() {
    if (mode === "all") {
      return "The planes that did not come home were hit on the engines and the cockpit. Armor those places.";
    }
    return "This plane came home. The yellow marks are holes on the wings and the body.";
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

  homeBtn.addEventListener("click", function () {
    mode = "home";
    show(false);
  });
  allBtn.addEventListener("click", function () {
    mode = "all";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "home";
    show(true);
  });
  show(true);
})();
