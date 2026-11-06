(function () {
  var board = document.getElementById("board");
  var mark = document.getElementById("mark");
  var caption = document.getElementById("caption");
  var spoiler = document.querySelector(".notes .spoiler");
  var rows = Array.prototype.slice.call(document.querySelectorAll("#eqs li"));
  var buttons = Array.prototype.slice.call(board.parentNode.querySelectorAll("button"));
  var wordTimer = 0;

  function say(bad) {
    caption.textContent = bad
      ? "a − b is 0. Crossing it out is dividing by 0."
      : "That line is allowed for the number 1.";
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var index = Number(button.getAttribute("data-row"));
      var bad = index === 4;
      var row = rows[index];
      rows.forEach(function (item, i) {
        item.classList.toggle("is-pick", i === index && !bad);
        item.classList.toggle("is-bad", i === index && bad);
      });
      buttons.forEach(function (item) { item.classList.toggle("is-on", item === button); });
      mark.classList.remove("is-hidden");
      mark.classList.toggle("is-bad", bad);
      mark.style.height = row.offsetHeight + "px";
      mark.style.transform = "translate3d(0," + row.offsetTop + "px,0)";
      if (bad) spoiler.hidden = false;
      window.clearTimeout(wordTimer);
      wordTimer = window.setTimeout(function () { say(bad); }, 900);
    });
  });
  document.getElementById("again").addEventListener("click", function () {
    rows.forEach(function (item) {
      item.classList.remove("is-pick");
      item.classList.remove("is-bad");
    });
    buttons.forEach(function (item) { item.classList.remove("is-on"); });
    mark.classList.add("is-hidden");
    mark.classList.remove("is-bad");
    spoiler.hidden = true;
    window.clearTimeout(wordTimer);
    caption.textContent = "a and b are both 1. Pick the step that is not allowed.";
  });
})();
