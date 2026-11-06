(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var INCOMES = [2, 4, 6, 10, 14, 18, 38, 52];
  var HEIGHTS = [86, 132, 104, 150, 78, 124, 112, 146];

  function xOf(value) { return 56 + (value / 60) * 540; }
  function isGone(value, strength) {
    if (strength >= 1 && (value === 2 || value === 52)) return true;
    if (strength >= 2 && (value === 4 || value === 38)) return true;
    return false;
  }
  function answered(strength) {
    var list = [];
    var i;
    for (i = 0; i < INCOMES.length; i += 1) {
      if (!isGone(INCOMES[i], strength)) list.push(INCOMES[i]);
    }
    return list;
  }
  function average(list) {
    var s = 0;
    var i;
    for (i = 0; i < list.length; i += 1) s += list[i];
    return s / list.length;
  }

  var plot = document.createElementNS(SVG, "svg");
  plot.setAttribute("class", "miss-plot");
  plot.setAttribute("viewBox", "0 0 640 210");
  var base = document.createElementNS(SVG, "line");
  base.setAttribute("x1", "56");
  base.setAttribute("y1", "168");
  base.setAttribute("x2", "596");
  base.setAttribute("y2", "168");
  base.setAttribute("stroke", INK);
  base.setAttribute("stroke-width", "3");
  plot.appendChild(base);
  function post(x) {
    var rect = document.createElementNS(SVG, "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", "156");
    rect.setAttribute("width", "10");
    rect.setAttribute("height", "24");
    rect.setAttribute("rx", "2");
    rect.setAttribute("fill", YELLOW);
    rect.setAttribute("stroke", INK);
    rect.setAttribute("stroke-width", "2");
    return rect;
  }
  plot.appendChild(post(46));
  plot.appendChild(post(596));
  var trueLine = document.createElementNS(SVG, "line");
  trueLine.setAttribute("stroke", GREEN);
  trueLine.setAttribute("stroke-width", "6");
  trueLine.setAttribute("stroke-linecap", "round");
  var seenLine = document.createElementNS(SVG, "line");
  seenLine.setAttribute("stroke", RED);
  seenLine.setAttribute("stroke-width", "4");
  seenLine.setAttribute("stroke-dasharray", "2 7");
  seenLine.setAttribute("stroke-linecap", "round");
  plot.appendChild(trueLine);
  plot.appendChild(seenLine);
  var dots = [];
  var i;
  for (i = 0; i < INCOMES.length; i += 1) {
    var g = document.createElementNS(SVG, "g");
    g.setAttribute("class", "miss-dot");
    var extreme = INCOMES[i] <= 4 || INCOMES[i] >= 38;
    var circle = document.createElementNS(SVG, "circle");
    circle.setAttribute("cx", String(xOf(INCOMES[i])));
    circle.setAttribute("cy", String(HEIGHTS[i]));
    circle.setAttribute("r", "8");
    circle.setAttribute("fill", extreme ? RED : GREEN);
    circle.setAttribute("stroke", YELLOW);
    circle.setAttribute("stroke-width", "3");
    var label = document.createElementNS(SVG, "text");
    label.setAttribute("x", String(xOf(INCOMES[i])));
    label.setAttribute("y", "188");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", INK);
    label.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
    label.setAttribute("font-size", "13");
    label.setAttribute("font-weight", "800");
    label.textContent = String(INCOMES[i]);
    g.appendChild(circle);
    g.appendChild(label);
    plot.appendChild(g);
    dots.push(g);
  }
  function tag(id, fill, y) {
    var text = document.createElementNS(SVG, "text");
    text.setAttribute("id", id);
    text.setAttribute("y", String(y));
    text.setAttribute("fill", fill);
    text.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "800");
    plot.appendChild(text);
    return text;
  }
  var trueTag = tag("miss-true", GREEN, 28);
  var seenTag = tag("miss-seen", RED, 48);
  var countTag = tag("miss-count", INK, 28);

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var slider = document.createElement("input");
  slider.type = "range";
  slider.id = "miss-strength";
  slider.min = "0";
  slider.max = "2";
  slider.step = "1";
  slider.value = "0";
  slider.setAttribute("data-pace", "0");
  var sliderLabel = S.el("label", "field");
  sliderLabel.appendChild(document.createTextNode("Extremes skip"));
  sliderLabel.appendChild(slider);
  var controls = S.el("div", "controls");
  controls.appendChild(sliderLabel);
  board.appendChild(plot);
  board.appendChild(caption);
  board.appendChild(controls);

  var strength = 0;
  var round = 0;

  function paint() {
    var keep = answered(strength);
    var avg = average(keep);
    var truth = average(INCOMES);
    var tx = xOf(truth);
    var sx = xOf(avg);
    var n;
    trueLine.setAttribute("x1", String(tx));
    trueLine.setAttribute("x2", String(tx));
    trueLine.setAttribute("y1", "36");
    trueLine.setAttribute("y2", "168");
    seenLine.setAttribute("x1", String(sx));
    seenLine.setAttribute("x2", String(sx));
    seenLine.setAttribute("y1", "56");
    seenLine.setAttribute("y2", "168");
    trueTag.setAttribute("text-anchor", "start");
    trueTag.setAttribute("x", String(tx + 8));
    trueTag.textContent = "True " + truth;
    if (sx < tx - 20) {
      seenTag.setAttribute("text-anchor", "end");
      seenTag.setAttribute("x", String(sx - 8));
    } else {
      seenTag.setAttribute("text-anchor", "start");
      seenTag.setAttribute("x", String(Math.min(sx + 8, 520)));
    }
    seenTag.textContent = "Answered " + avg;
    countTag.setAttribute("x", "620");
    countTag.setAttribute("text-anchor", "end");
    countTag.textContent = keep.length + " of " + INCOMES.length + " answered";
    for (n = 0; n < INCOMES.length; n += 1) {
      dots[n].setAttribute("class", isGone(INCOMES[n], strength) ? "miss-dot is-gone" : "miss-dot");
    }
  }

  function textFor() {
    var keep = answered(strength);
    var avg = average(keep);
    var truth = average(INCOMES);
    if (strength === 0) {
      return "All " + INCOMES.length + " people answered. The true average and the answered average are both " + truth + ".";
    }
    return "The true average is " + truth + ". " + keep.length + " of " + INCOMES.length + " answered, and those answers average " + avg + ".";
  }

  function show() {
    round += 1;
    paint();
    caption.textContent = textFor();
  }

  slider.addEventListener("input", function () {
    strength = Number(slider.value);
    show();
  });
  document.getElementById("again").addEventListener("click", function () {
    strength = 0;
    slider.value = "0";
    show();
  });
  show();
})();
