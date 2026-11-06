(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function yOf(v) {
    return 248 - v * 20;
  }

  function arrow(y1, y2) {
    var x1 = 232;
    var x2 = 424;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len;
    var uy = dy / len;
    var bx = x2 - ux * 18;
    var by = y2 - uy * 18;
    var head = Math.round(x2) + "," + Math.round(y2) + " "
      + Math.round(bx - uy * 8) + "," + Math.round(by + ux * 8) + " "
      + Math.round(bx + uy * 8) + "," + Math.round(by - ux * 8);
    return '<line class="lord-arrow" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + YELLOW + '" stroke-width="8"/>'
      + '<polygon class="lord-arrow" points="' + head + '" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
  }

  function dots(cls, x, v, fill) {
    var y = yOf(v);
    return '<circle class="' + cls + '" cx="' + (x - 34) + '" cy="' + y + '" r="12" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="4"/>'
      + '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="12" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="4"/>'
      + '<circle class="' + cls + '" cx="' + (x + 34) + '" cy="' + y + '" r="12" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="4"/>';
  }

  var chart = document.createElementNS(SVG, "svg");
  chart.setAttribute("class", "lord-chart is-final");
  chart.setAttribute("viewBox", "0 0 640 310");
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", "Group A goes from 2 to 5. Group B goes from 6 to 9. Both rise by 3.");
  chart.innerHTML = '<line x1="36" y1="250" x2="48" y2="250" stroke="' + YELLOW + '" stroke-width="7" stroke-linecap="round"/>'
    + '<line x1="36" y1="148" x2="48" y2="148" stroke="' + YELLOW + '" stroke-width="7" stroke-linecap="round"/>'
    + '<line x1="36" y1="48" x2="48" y2="48" stroke="' + YELLOW + '" stroke-width="7" stroke-linecap="round"/>'
    + '<line x1="48" y1="28" x2="48" y2="260" stroke="' + INK + '" stroke-width="3"/>'
    + '<line x1="48" y1="260" x2="610" y2="260" stroke="' + INK + '" stroke-width="3"/>'
    + '<circle cx="78" cy="24" r="8" fill="' + GREEN + '" stroke="' + YELLOW + '" stroke-width="3"/>'
    + '<text x="92" y="29" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="16" font-weight="800">Group A</text>'
    + '<circle cx="200" cy="24" r="8" fill="' + RED + '" stroke="' + YELLOW + '" stroke-width="3"/>'
    + '<text x="214" y="29" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="16" font-weight="800">Group B</text>'
    + '<text x="190" y="292" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="16" font-weight="800">Before</text>'
    + '<text x="470" y="292" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="16" font-weight="800">After</text>'
    + arrow(yOf(2), yOf(5))
    + arrow(yOf(6), yOf(9))
    + dots("lord-start", 190, 2, GREEN)
    + dots("lord-start", 190, 6, RED)
    + dots("lord-end lord-end-a", 470, 5, GREEN)
    + dots("lord-end lord-end-b", 470, 9, RED)
    + '<text x="146" y="' + (yOf(2) + 5) + '" text-anchor="end" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">2</text>'
    + '<text x="146" y="' + (yOf(6) + 5) + '" text-anchor="end" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">6</text>'
    + '<text x="530" y="' + (yOf(5) + 6) + '" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">5</text>'
    + '<text x="530" y="' + (yOf(9) + 6) + '" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">9</text>'
    + '<text class="lord-final-tag" x="470" y="' + (yOf(5) - 26) + '" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="15" font-weight="800">Ends lower</text>'
    + '<text class="lord-final-tag" x="470" y="' + (yOf(9) - 28) + '" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="15" font-weight="800">Ends higher</text>'
    + '<text class="lord-rise" x="328" y="' + (yOf(3.5) - 12) + '" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">+3</text>'
    + '<text class="lord-rise" x="328" y="' + (yOf(7.5) - 12) + '" text-anchor="middle" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">+3</text>';

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var finalBtn = S.button("Compare final scores", "btn");
  var changeBtn = S.button("Compare change scores", "btn");
  finalBtn.setAttribute("data-pace", "900");
  changeBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(finalBtn);
  controls.appendChild(changeBtn);
  board.appendChild(chart);
  board.appendChild(caption);
  board.appendChild(controls);

  var mode = "final";
  var round = 0;

  function paint(doSnap) {
    finalBtn.classList.toggle("is-on", mode === "final");
    changeBtn.classList.toggle("is-on", mode === "change");
    if (doSnap) chart.style.setProperty("transition", "none", "important");
    chart.classList.toggle("is-final", mode === "final");
    chart.classList.toggle("is-change", mode === "change");
    if (doSnap) {
      void board.offsetWidth;
      chart.style.removeProperty("transition");
    }
  }

  function textFor() {
    if (mode === "final") return "Group A ends at 5. Group B ends at 9. Group B looks better if you compare final scores.";
    return "Group A rose from 2 to 5. Group B rose from 6 to 9. Both rose by 3, so the change is the same.";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = textFor();
    paint(doSnap);
    if (doSnap) caption.textContent = text;
    else {
      window.setTimeout(function () {
        if (mine !== round) return;
        caption.textContent = text;
      }, 900);
    }
  }

  finalBtn.addEventListener("click", function () {
    mode = "final";
    show(false);
  });
  changeBtn.addEventListener("click", function () {
    mode = "change";
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "final";
    show(true);
  });
  show(true);
})();
