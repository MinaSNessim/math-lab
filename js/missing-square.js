(function () {
  var ns = "http://www.w3.org/2000/svg";
  var grid = document.getElementById("grid");
  var fig = document.getElementById("fig");
  var empty = document.getElementById("empty");
  var caption = document.getElementById("caption");
  var edgeA = document.getElementById("edge-a");
  var edgeB = document.getElementById("edge-b");
  var noHole = document.getElementById("no-hole");
  var withHole = document.getElementById("with-hole");
  var big = document.getElementById("big");
  var small = document.getElementById("small");
  var mid = document.getElementById("mid");
  var i;
  var wordTimer = 0;
  var hole = false;

  for (i = 0; i <= 13; i += 1) {
    var v = document.createElementNS(ns, "line");
    v.setAttribute("x1", 20 + i * 26);
    v.setAttribute("x2", 20 + i * 26);
    v.setAttribute("y1", 20);
    v.setAttribute("y2", 150);
    v.setAttribute("stroke", "#e4e8f2");
    v.setAttribute("stroke-width", "1");
    grid.appendChild(v);
  }
  for (i = 0; i <= 5; i += 1) {
    var h = document.createElementNS(ns, "line");
    h.setAttribute("y1", 20 + i * 26);
    h.setAttribute("y2", 20 + i * 26);
    h.setAttribute("x1", 20);
    h.setAttribute("x2", 358);
    h.setAttribute("stroke", "#e4e8f2");
    h.setAttribute("stroke-width", "1");
    grid.appendChild(h);
  }

  function say() {
    empty.textContent = hole ? "1" : "0";
    caption.textContent = hole
      ? "Colored 32. Empty 1. The long edge bends out."
      : "Colored 32. Empty 0. The long edge bends in.";
  }

  function show(next) {
    hole = next;
    fig.classList.toggle("is-hole", hole);
    edgeA.classList.toggle("is-off", hole);
    edgeB.classList.toggle("is-off", !hole);
    noHole.classList.toggle("is-on", !hole);
    withHole.classList.toggle("is-on", hole);
    noHole.classList.toggle("ghost", hole);
    withHole.classList.toggle("ghost", !hole);
    big.style.transform = hole ? "translate(150px, 98px)" : "translate(20px, 150px)";
    small.style.transform = hole ? "translate(20px, 150px)" : "translate(228px, 72px)";
    mid.style.transform = hole ? "translate(150px, 150px)" : "translate(228px, 124px)";
    window.clearTimeout(wordTimer);
    wordTimer = window.setTimeout(say, 900);
  }

  noHole.addEventListener("click", function () { show(false); });
  withHole.addEventListener("click", function () { show(true); });
  document.getElementById("again").addEventListener("click", function () { show(false); });
})();
