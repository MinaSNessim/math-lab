(function () {
  var RED = "#fe8e83";
  var boat = document.getElementById("boat");
  var line = document.getElementById("line");
  var replace = document.getElementById("replace");
  var again = document.getElementById("again");
  var planks = boat.querySelectorAll(".plank");
  var n = 0;
  var gen = 0;

  function say(count) {
    var text = "Planks replaced: " + count;
    if (count === planks.length) text += ". Nothing of the original remains.";
    line.textContent = text;
    line.classList.add("is-in");
  }

  function swap(rect, count, mine) {
    rect.classList.add("is-out");
    window.setTimeout(function () {
      if (mine !== gen) return;
      rect.setAttribute("fill", RED);
      rect.classList.add("is-measuring");
      rect.classList.remove("is-out");
      rect.classList.add("is-in");
      rect.getBoundingClientRect();
      rect.classList.remove("is-measuring");
      rect.getBoundingClientRect();
      rect.classList.remove("is-in");
      say(count);
    }, 400);
  }

  replace.addEventListener("click", function () {
    if (n >= planks.length) return;
    n += 1;
    replace.disabled = n === planks.length;
    swap(planks[n - 1], n, gen);
  });

  again.addEventListener("click", function () {
    var i;
    gen += 1;
    n = 0;
    replace.disabled = false;
    line.textContent = "";
    line.classList.remove("is-in");
    for (i = 0; i < planks.length; i += 1) {
      planks[i].setAttribute("fill", planks[i].getAttribute("data-orig"));
      planks[i].classList.remove("is-out", "is-in", "is-measuring");
    }
  });
})();
