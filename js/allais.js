(function () {
  var sure = document.getElementById("pick-sure");
  var gamble = document.getElementById("pick-gamble");
  var modest = document.getElementById("pick-modest");
  var big = document.getElementById("pick-big");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");
  var notes = document.querySelectorAll(".notes .spoiler");
  var first = "";
  var second = "";

  function mark(node, on, hot) {
    node.classList.toggle("is-on", on);
    node.classList.toggle("is-switch", hot);
  }

  function letter() {
    if (first === "sure") return "A";
    if (first === "gamble") return "B";
    if (second === "modest") return "C";
    return "D";
  }

  function pairName() {
    return (first === "sure" ? "A" : "B") + " and " + (second === "modest" ? "C" : "D");
  }

  function showNotes(open) {
    var i;
    for (i = 0; i < notes.length; i += 1) notes[i].hidden = !open;
  }

  function paint() {
    var both = !!first && !!second;
    var cross = both && ((first === "sure" && second === "big") || (first === "gamble" && second === "modest"));
    mark(sure, first === "sure", cross && first === "sure");
    mark(gamble, first === "gamble", cross && first === "gamble");
    mark(modest, second === "modest", cross && second === "modest");
    mark(big, second === "big", cross && second === "big");
    sure.disabled = !!first;
    gamble.disabled = !!first;
    modest.disabled = !!second;
    big.disabled = !!second;
    showNotes(both);
    caption.classList.remove("is-hot");
    var good = "The good choice by the money is B and D.";
    if (!both) {
      caption.textContent = (first || second) ? "You chose " + letter() + ". Pick one from the other pair." : "";
    } else if (first === "gamble" && second === "big") {
      caption.textContent = "You chose B and D. " + good;
    } else if (first === "sure" && second === "modest") {
      caption.textContent = "You chose A and C. That is the safer pick both times. " + good;
    } else if (cross) {
      caption.textContent = "You chose " + pairName() + ". Those two picks do not follow one rule. " + good;
      caption.classList.add("is-hot");
    }
  }

  sure.addEventListener("click", function () { first = "sure"; paint(); });
  gamble.addEventListener("click", function () { first = "gamble"; paint(); });
  modest.addEventListener("click", function () { second = "modest"; paint(); });
  big.addEventListener("click", function () { second = "big"; paint(); });
  again.addEventListener("click", function () { first = ""; second = ""; paint(); });
  paint();
})();
