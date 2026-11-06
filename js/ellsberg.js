(function () {
  var known = document.getElementById("urn-known");
  var unknown = document.getElementById("urn-unknown");
  var ask = document.getElementById("ask");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var redPick = "";
  var blackPick = "";

  function paint() {
    var phase = redPick ? "black" : "red";
    if (blackPick) phase = "done";
    known.classList.toggle("is-on", redPick === "known" || blackPick === "known");
    unknown.classList.toggle("is-on", redPick === "unknown" || blackPick === "unknown");
    known.classList.toggle("is-switch", blackPick && redPick === blackPick && redPick === "known");
    unknown.classList.toggle("is-switch", blackPick && redPick === blackPick && redPick === "unknown");
    ask.textContent = redPick
      ? "You win if you draw a black ball. Which urn do you choose?"
      : "You win if you draw a red ball. Which urn do you choose?";
    known.disabled = phase === "done";
    unknown.disabled = phase === "done";
    caption.classList.remove("is-hot");
    if (!redPick) caption.textContent = "";
    else if (!blackPick) caption.textContent = redPick === "known" ? "For red, you chose the known urn." : "For red, you chose the unknown urn.";
    else if (redPick === blackPick && redPick === "known") {
      caption.classList.add("is-hot");
      caption.textContent = "You chose the known urn both times.";
    } else if (redPick === blackPick) {
      caption.classList.add("is-hot");
      caption.textContent = "You chose the unknown urn both times.";
    } else caption.textContent = "You chose one color from each urn.";
  }

  function choose(key) {
    if (!redPick) redPick = key;
    else if (!blackPick) blackPick = key;
    paint();
  }

  known.addEventListener("click", function () { choose("known"); });
  unknown.addEventListener("click", function () { choose("unknown"); });
  again.addEventListener("click", function () { redPick = ""; blackPick = ""; paint(); });
  paint();
})();
