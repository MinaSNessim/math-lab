(function () {
  var word = document.getElementById("word");
  var loop = document.getElementById("loop");
  var line = document.getElementById("line");
  var truth = document.getElementById("truth");
  var lie = document.getElementById("lie");
  var again = document.getElementById("again");

  function say(text, on) {
    word.classList.add("is-hot");
    loop.classList.add("is-on");
    line.textContent = text;
    line.classList.add("is-in");
    truth.classList.toggle("is-on", on === truth);
    lie.classList.toggle("is-on", on === lie);
    truth.classList.toggle("ghost", on !== truth);
    lie.classList.toggle("ghost", on !== lie);
  }

  truth.addEventListener("click", function () {
    say("Call it true. Then it really is false, because that is what it says. It cannot be both.", truth);
  });

  lie.addEventListener("click", function () {
    say("Call it false. Then its claim is wrong. It claims to be false, so it is not false, and it is true.", lie);
  });

  again.addEventListener("click", function () {
    word.classList.remove("is-hot");
    loop.classList.remove("is-on");
    line.textContent = "";
    line.classList.remove("is-in");
    truth.classList.remove("is-on", "ghost");
    lie.classList.remove("is-on", "ghost");
  });
})();
