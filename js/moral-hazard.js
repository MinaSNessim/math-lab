(function () {
  var shield = document.getElementById("shield");
  var risk = document.getElementById("risk");
  var insure = document.getElementById("insure");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var covered = false;
  var gen = 0;

  function paint() {
    shield.classList.toggle("is-on", covered);
    risk.classList.toggle("is-high", covered);
    insure.disabled = covered;
    document.getElementById("risk-label").textContent = covered ? "Risk taken: higher" : "Risk taken: low";
    if (!covered) caption.textContent = "";
  }

  insure.addEventListener("click", function () {
    if (covered) return;
    covered = true;
    paint();
    var mine = ++gen;
    window.setTimeout(function () {
      if (mine !== gen) return;
      caption.textContent = "Full insurance is on. The crash no longer costs this driver, so the risk goes up.";
    }, 900);
  });
  again.addEventListener("click", function () {
    gen += 1;
    covered = false;
    paint();
  });
  paint();
})();
