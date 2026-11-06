(function () {
  var lines = [
    "",
    "It cannot be Friday, because you would know on Thursday night.",
    "Now it cannot be Thursday either.",
    "Now it cannot be Wednesday either.",
    "Now it cannot be Tuesday either.",
    "Now it cannot be Monday either.",
    "Yet the hanging can still happen."
  ];
  var days = [];
  var step = 0;
  var caption = document.getElementById("caption");
  var think = document.getElementById("think");
  var again = document.getElementById("again");
  var i;
  for (i = 0; i < 5; i += 1) days.push(document.getElementById("day-" + i));

  function paint() {
    var focus = step >= 1 && step <= 5 ? 5 - step : -1;
    var n;
    for (n = 0; n < days.length; n += 1) {
      days[n].classList.remove("is-now", "is-out");
      if (step >= 6 || (focus >= 0 && n > focus)) days[n].classList.add("is-out");
      else if (n === focus) days[n].classList.add("is-now");
    }
    caption.textContent = lines[step];
    think.disabled = step >= 6;
  }

  think.addEventListener("click", function () {
    if (step >= 6) return;
    step += 1;
    paint();
  });

  again.addEventListener("click", function () {
    step = 0;
    paint();
  });

  paint();
})();
