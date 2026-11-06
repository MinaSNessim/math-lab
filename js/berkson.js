(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var DOTS = [];
  var xs = [2, 4, 6, 8];
  var ys = [2, 4, 6, 8];
  var a;
  var b;
  for (a = 0; a < xs.length; a += 1) {
    for (b = 0; b < ys.length; b += 1) DOTS.push([xs[a], ys[b]]);
  }

  function px(math) { return 48 + math * 26; }
  function py(sports) { return 236 - sports * 18; }

  var plot = document.createElementNS(SVG, "svg");
  plot.setAttribute("class", "adm-plot");
  plot.setAttribute("viewBox", "0 0 360 280");
  var region = document.createElementNS(SVG, "path");
  region.setAttribute("class", "adm-region");
  region.setAttribute("fill", YELLOW);
  region.setAttribute("stroke", "none");
  plot.appendChild(region);
  var trend = document.createElementNS(SVG, "line");
  trend.setAttribute("class", "adm-trend");
  trend.setAttribute("stroke", RED);
  trend.setAttribute("stroke-width", "4");
  trend.setAttribute("stroke-linecap", "round");
  plot.appendChild(trend);
  plot.appendChild(axisLine(48, 236, 320, 236));
  plot.appendChild(axisLine(48, 40, 48, 236));
  var dots = [];
  var i;
  for (i = 0; i < DOTS.length; i += 1) {
    var dot = document.createElementNS(SVG, "circle");
    dot.setAttribute("class", "adm-dot");
    dot.setAttribute("cx", String(px(DOTS[i][0])));
    dot.setAttribute("cy", String(py(DOTS[i][1])));
    dot.setAttribute("r", "8");
    dot.setAttribute("fill", DOTS[i][0] >= 5 ? GREEN : RED);
    dot.setAttribute("stroke", YELLOW);
    dot.setAttribute("stroke-width", "3");
    plot.appendChild(dot);
    dots.push(dot);
  }
  function axisLine(x1, y1, x2, y2) {
    var line = document.createElementNS(SVG, "line");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    line.setAttribute("stroke", INK);
    line.setAttribute("stroke-width", "3");
    return line;
  }
  var mathLabel = document.createElementNS(SVG, "text");
  mathLabel.setAttribute("x", "184");
  mathLabel.setAttribute("y", "268");
  mathLabel.setAttribute("text-anchor", "middle");
  mathLabel.setAttribute("fill", INK);
  mathLabel.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
  mathLabel.setAttribute("font-size", "15");
  mathLabel.setAttribute("font-weight", "800");
  mathLabel.textContent = "Math";
  var sportsLabel = document.createElementNS(SVG, "text");
  sportsLabel.setAttribute("x", "16");
  sportsLabel.setAttribute("y", "24");
  sportsLabel.setAttribute("fill", INK);
  sportsLabel.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
  sportsLabel.setAttribute("font-size", "15");
  sportsLabel.setAttribute("font-weight", "800");
  sportsLabel.textContent = "Sports";
  plot.appendChild(mathLabel);
  plot.appendChild(sportsLabel);
  var count = document.createElementNS(SVG, "text");
  count.setAttribute("id", "adm-count");
  count.setAttribute("x", "330");
  count.setAttribute("y", "28");
  count.setAttribute("text-anchor", "end");
  count.setAttribute("fill", INK);
  count.setAttribute("font-family", "Nunito, Segoe UI, sans-serif");
  count.setAttribute("font-size", "15");
  count.setAttribute("font-weight", "800");
  plot.appendChild(count);

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var wholeBtn = S.button("Whole population", "btn");
  var admitBtn = S.button("Admitted students only", "btn");
  wholeBtn.setAttribute("data-pace", "900");
  admitBtn.setAttribute("data-pace", "900");
  var slider = document.createElement("input");
  slider.type = "range";
  slider.id = "adm-cut";
  slider.min = "3";
  slider.max = "7";
  slider.step = "2";
  slider.value = "5";
  slider.setAttribute("data-pace", "0");
  var sliderLabel = S.el("label", "field");
  sliderLabel.appendChild(document.createTextNode("Gets in at "));
  var sliderWord = S.el("b");
  sliderWord.id = "adm-rule";
  sliderWord.textContent = "5";
  sliderLabel.appendChild(sliderWord);
  sliderLabel.appendChild(slider);
  var controls = S.el("div", "controls");
  controls.appendChild(wholeBtn);
  controls.appendChild(admitBtn);
  controls.appendChild(sliderLabel);
  board.appendChild(plot);
  board.appendChild(caption);
  board.appendChild(controls);

  var mode = "whole";
  var cut = 5;
  var round = 0;

  function admitted(dot) {
    return dot[0] >= cut || dot[1] >= cut;
  }

  function kept() {
    var list = [];
    var n;
    for (n = 0; n < DOTS.length; n += 1) {
      if (admitted(DOTS[n])) list.push(DOTS[n]);
    }
    return list;
  }

  function paint() {
    var list = kept();
    var n;
    var sx = 0;
    var sy = 0;
    region.setAttribute("opacity", mode === "admit" ? "0.28" : "0");
    var path = "M " + px(0) + " " + py(10)
      + " H " + px(10)
      + " V " + py(0)
      + " H " + px(cut)
      + " V " + py(cut)
      + " H " + px(0)
      + " Z";
    region.setAttribute("d", path);
    for (n = 0; n < DOTS.length; n += 1) {
      dots[n].classList.toggle("is-out", mode === "admit" && !admitted(DOTS[n]));
    }
    for (n = 0; n < list.length; n += 1) {
      sx += list[n][0];
      sy += list[n][1];
    }
    var mx = sx / list.length;
    var my = sy / list.length;
    var num = 0;
    var den = 0;
    for (n = 0; n < list.length; n += 1) {
      num += (list[n][0] - mx) * (list[n][1] - my);
      den += (list[n][0] - mx) * (list[n][0] - mx);
    }
    var slope = den === 0 ? 0 : num / den;
    var intercept = my - slope * mx;
    var x1 = 2;
    var x2 = 8;
    trend.setAttribute("x1", String(px(x1)));
    trend.setAttribute("y1", String(py(intercept + slope * x1)));
    trend.setAttribute("x2", String(px(x2)));
    trend.setAttribute("y2", String(py(intercept + slope * x2)));
    trend.setAttribute("opacity", mode === "admit" ? "1" : "0");
    plot.appendChild(trend);
    count.textContent = mode === "admit"
      ? (list.length + " of " + DOTS.length + " admitted")
      : (DOTS.length + " students");
    sliderWord.textContent = String(cut);
    wholeBtn.classList.toggle("is-on", mode === "whole");
    admitBtn.classList.toggle("is-on", mode === "admit");
  }

  function textFor() {
    var list = kept();
    if (mode === "whole") {
      return "All " + DOTS.length + " students are on the square. Math and sports do not rise together. The school would admit anyone with math at least " + cut + " or sports at least " + cut + ".";
    }
    return "The school keeps anyone with math at least " + cut + " or sports at least " + cut + ". " + list.length + " of " + DOTS.length + " remain. The line through them falls.";
  }

  function show(wait) {
    round += 1;
    var mine = round;
    var text = textFor();
    paint();
    if (!wait) caption.textContent = text;
    else window.setTimeout(function () {
      if (mine !== round) return;
      caption.textContent = text;
    }, 900);
  }

  wholeBtn.addEventListener("click", function () {
    mode = "whole";
    show(true);
  });
  admitBtn.addEventListener("click", function () {
    mode = "admit";
    show(true);
  });
  slider.addEventListener("input", function () {
    cut = Number(slider.value);
    show(false);
  });
  document.getElementById("again").addEventListener("click", function () {
    mode = "whole";
    cut = 5;
    slider.value = "5";
    show(false);
  });
  show(false);
})();
