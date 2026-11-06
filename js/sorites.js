(function () {
  var heap = document.getElementById("heap");
  var line = document.getElementById("line");
  var less = document.getElementById("less");
  var again = document.getElementById("again");
  var spots = [
    [46, 168], [86, 168], [126, 168], [166, 168], [206, 168], [246, 168],
    [66, 136], [106, 136], [146, 136], [186, 136], [226, 136],
    [86, 104], [126, 104], [166, 104], [206, 104],
    [106, 72], [146, 72], [186, 72],
    [126, 40], [166, 40],
    [146, 8]
  ];
  var grains = [];
  var left = spots.length;
  var i;
  var ns = "http://www.w3.org/2000/svg";

  for (i = 0; i < spots.length; i += 1) {
    var grain = document.createElementNS(ns, "circle");
    grain.setAttribute("class", "grain");
    grain.setAttribute("cx", spots[i][0]);
    grain.setAttribute("cy", spots[i][1] + 16);
    grain.setAttribute("r", "15");
    grain.setAttribute("fill", "#5ec5a7");
    heap.appendChild(grain);
    grains.push(grain);
  }

  function say() {
    var text = "Grains left: " + left + ".";
    if (left === 10 || left === 6 || left === 3 || left === 1) text = "Is this still a heap?";
    if (left === 0) text = "Nothing is left.";
    line.textContent = text;
    line.classList.add("is-in");
  }

  less.addEventListener("click", function () {
    if (left === 0) return;
    left -= 1;
    grains[left].classList.add("is-gone");
    less.disabled = left === 0;
    say();
  });

  again.addEventListener("click", function () {
    var n;
    left = spots.length;
    less.disabled = false;
    line.textContent = "";
    line.classList.remove("is-in");
    for (n = 0; n < grains.length; n += 1) grains[n].classList.remove("is-gone");
  });
})();
