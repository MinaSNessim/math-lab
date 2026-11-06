(function () {
  var pays = [1, 4, 0];
  var seen = [true, false, false];
  var coins = 0;
  var pulls = 0;
  var last = -1;
  var nextNew = 1;
  var boxes = [
    document.getElementById("m0"),
    document.getElementById("m1"),
    document.getElementById("m2")
  ];
  var avg = document.getElementById("avg");
  var total = document.getElementById("coins");
  var caption = document.getElementById("caption");
  var again = document.getElementById("again");

  function coinWord(n) {
    return n === 1 ? "1 coin" : n + " coins";
  }

  function average() {
    if (!pulls) return "\u2014";
    return String(Math.round((coins / pulls) * 10) / 10);
  }

  function paint() {
    var i;
    for (i = 0; i < boxes.length; i += 1) {
      var box = boxes[i];
      box.className = "bandit-one";
      if (i === 0) box.classList.add("is-known");
      if (seen[i] && pays[i] === 0) box.classList.add("is-low");
      if (i === last) box.classList.add("is-now");
      box.querySelector("b").textContent = i === 0 ? "Known" : (seen[i] ? "Tried" : "Unknown");
      box.querySelector("span").textContent = seen[i] ? coinWord(pays[i]) : "?";
    }
    avg.textContent = average();
    total.textContent = String(coins);
  }

  function pull(i) {
    last = i;
    seen[i] = true;
    coins += pays[i];
    pulls += 1;
    if (i !== 0) nextNew = i === 1 ? 2 : 1;
    paint();
    var how;
    if (i === 0) how = "That is the known reward.";
    else if (pays[i] > 1) how = "That is higher than the known 1.";
    else how = "That is lower than the known 1.";
    var avgText = average();
    caption.textContent = (i === 0 ? "The known option" : "A new option") + " paid " + coinWord(pays[i]) + ". " + how + " Average is " + avgText + (avgText === "1" ? " coin" : " coins") + " a pull.";
  }

  document.getElementById("exploit").addEventListener("click", function () { pull(0); });
  document.getElementById("explore").addEventListener("click", function () { pull(nextNew); });
  again.addEventListener("click", function () {
    seen = [true, false, false];
    coins = 0;
    pulls = 0;
    last = -1;
    nextNew = 1;
    caption.textContent = "";
    paint();
  });
  paint();
})();
