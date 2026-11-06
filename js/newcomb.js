(function () {
  var opaque = document.getElementById("opaque");
  var fill = document.getElementById("opaque-fill");
  var oneBtn = document.getElementById("take-one");
  var bothBtn = document.getElementById("take-both");
  var compare = document.getElementById("compare");
  var rowOne = document.getElementById("row-one");
  var rowBoth = document.getElementById("row-both");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var pick = "";
  var gen = 0;

  function paint() {
    opaque.classList.toggle("is-open", !!pick);
    opaque.classList.toggle("is-empty", pick === "both");
    fill.textContent = pick === "one" ? "$1M" : (pick === "both" ? "Empty" : "");
    compare.hidden = !pick;
    rowOne.classList.toggle("is-yours", pick === "one");
    rowBoth.classList.toggle("is-yours", pick === "both");
    oneBtn.disabled = !!pick;
    bothBtn.disabled = !!pick;
    oneBtn.classList.toggle("is-on", pick === "one");
    bothBtn.classList.toggle("is-on", pick === "both");
    if (!pick) caption.textContent = "";
  }

  function choose(next, line) {
    if (pick) return;
    pick = next;
    paint();
    var mine = ++gen;
    window.setTimeout(function () {
      if (mine !== gen) return;
      caption.textContent = line;
    }, 900);
  }

  oneBtn.addEventListener("click", function () {
    choose("one", "You took only the yellow box. The predictor expected that, so it holds $1 million. Taking both would have left it empty and paid $1,000.");
  });
  bothBtn.addEventListener("click", function () {
    choose("both", "You took both. The predictor expected that, so the yellow box is empty and the clear box pays $1,000. Only the yellow box would have paid $1 million.");
  });
  again.addEventListener("click", function () {
    gen += 1;
    pick = "";
    paint();
  });
  paint();
})();
