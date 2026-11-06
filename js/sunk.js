(function () {
  var oldJob = document.getElementById("old-job");
  var fresh = document.getElementById("fresh");
  var go = document.getElementById("go-on");
  var stop = document.getElementById("stop");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var pick = "";

  function paint() {
    oldJob.classList.toggle("is-on", pick === "go");
    fresh.classList.toggle("is-on", pick === "stop");
    go.disabled = !!pick;
    stop.disabled = !!pick;
    go.classList.toggle("is-on", pick === "go");
    stop.classList.toggle("is-on", pick === "stop");
    if (pick === "go") caption.textContent = "Finishing spends another $40. The $60 does not come back.";
    else if (pick === "stop") caption.textContent = "The new option costs $30 for the same result. The $60 is already gone.";
    else caption.textContent = "";
  }

  go.addEventListener("click", function () { if (!pick) { pick = "go"; paint(); } });
  stop.addEventListener("click", function () { if (!pick) { pick = "stop"; paint(); } });
  again.addEventListener("click", function () { pick = ""; paint(); });
  paint();
})();
