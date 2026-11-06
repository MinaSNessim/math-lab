(function () {
  var ns = "http://www.w3.org/2000/svg";
  var line = document.getElementById("line");
  var split = document.getElementById("split");
  var again = document.getElementById("again");
  var pieceA = document.getElementById("piece-a");
  var pieceB = document.getElementById("piece-b");
  var sideA = document.getElementById("side-a");
  var sideB = document.getElementById("side-b");
  var texts = [];
  var timer = 0;
  var gen = 0;

  function chip(parent, x, y, label, next, fill) {
    var g = document.createElementNS(ns, "g");
    var c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", "20");
    c.setAttribute("fill", fill);
    c.setAttribute("stroke", "#0c1438");
    c.setAttribute("stroke-width", "2");
    var t = document.createElementNS(ns, "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("dy", "0.35em");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", label.length > 2 ? "11" : "13");
    t.setAttribute("data-orig", label);
    t.setAttribute("data-next", next);
    t.textContent = label;
    g.appendChild(c);
    g.appendChild(t);
    parent.appendChild(g);
    texts.push(t);
  }

  var ys = [81, 127, 173, 219];
  var aNames = ["A", "AA", "AB", "A..."];
  var aNext = ["S", "A", "B", "..."];
  var bNames = ["B", "BA", "BB", "B..."];
  var bNext = ["S", "A", "B", "..."];
  var i;
  for (i = 0; i < ys.length; i += 1) {
    chip(pieceA, 278, ys[i], aNames[i], aNext[i], "#f5c518");
    chip(pieceB, 362, ys[i], bNames[i], bNext[i], "#fe8e83");
  }

  function labels(useNext) {
    var n;
    for (n = 0; n < texts.length; n += 1) {
      var t = texts[n];
      var word = useNext ? t.getAttribute("data-next") : t.getAttribute("data-orig");
      t.textContent = word;
      t.setAttribute("font-size", word.length > 2 ? "11" : "13");
    }
  }

  function rest() {
    pieceA.style.transform = "none";
    pieceB.style.transform = "none";
    sideA.classList.remove("is-on");
    sideB.classList.remove("is-on");
    labels(false);
  }

  split.addEventListener("click", function () {
    var mine = ++gen;
    window.clearTimeout(timer);
    split.disabled = true;
    sideA.classList.add("is-on");
    sideB.classList.add("is-on");
    pieceA.style.transform = "translate(-168px, 0px) rotate(-16deg)";
    pieceB.style.transform = "translate(168px, 0px) rotate(16deg)";
    timer = window.setTimeout(function () {
      if (mine !== gen) return;
      labels(true);
      line.textContent = "Each A chip lost its first letter, and the list is now S, A, B, and the rest. That is every name, so those points fill one ball. The B chips fill a second ball. No chip was stretched.";
      line.classList.add("is-in");
    }, 850);
  });

  again.addEventListener("click", function () {
    gen += 1;
    window.clearTimeout(timer);
    split.disabled = false;
    rest();
    line.textContent = "";
    line.classList.remove("is-in");
  });
})();
