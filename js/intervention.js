(function () {
  var fig = document.getElementById("fig");
  var cup = document.getElementById("cup");
  var spot = document.getElementById("spot");
  var line = document.getElementById("line");
  var watch = document.getElementById("watch");
  var give = document.getElementById("give");
  var sayTimer = 0;
  var again = document.getElementById("again");
  var ill = fig.querySelectorAll(".ill");

  function say(text, wait) {
    window.clearTimeout(sayTimer);
    line.classList.remove("is-in");
    sayTimer = window.setTimeout(function () {
      line.textContent = text;
      line.classList.add("is-in");
    }, wait);
  }

  function mark(on) {
    watch.classList.toggle("is-on", on === watch);
    give.classList.toggle("is-on", on === give);
    watch.classList.toggle("ghost", on !== watch);
    give.classList.toggle("ghost", on !== give);
  }

  function parkCup(toWell) {
    var dx = 0;
    var dy = 0;
    cup.classList.add("is-measuring");
    cup.style.transform = "translate(0px, 0px)";
    if (toWell) {
      var from = cup.getBoundingClientRect();
      var to = spot.getBoundingClientRect();
      dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    }
    cup.getBoundingClientRect();
    cup.classList.remove("is-measuring");
    cup.getBoundingClientRect();
    cup.style.transform = "translate(" + dx + "px, " + dy + "px)";
  }

  function setWatch(on) {
    var i;
    fig.classList.toggle("is-watch", on);
    for (i = 0; i < ill.length; i += 1) ill[i].classList.toggle("is-watched", on);
  }

  watch.addEventListener("click", function () {
    mark(watch);
    setWatch(true);
    parkCup(false);
    say("The 2 people who already drink are the 2 who are ill. You only watched them.", 200);
  });

  give.addEventListener("click", function () {
    mark(give);
    setWatch(false);
    parkCup(true);
    say("You handed the cup to the person who was well. That is 1 person, and they are still well. The 2 who were already ill are unchanged.", 720);
  });

  again.addEventListener("click", function () {
    window.clearTimeout(sayTimer);
    line.textContent = "";
    line.classList.remove("is-in");
    setWatch(false);
    parkCup(false);
    watch.classList.remove("is-on", "ghost");
    give.classList.remove("is-on", "ghost");
  });
})();
