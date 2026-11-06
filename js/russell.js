(function () {
  var special = document.getElementById("special");
  var line = document.getElementById("line");
  var yes = document.getElementById("yes");
  var no = document.getElementById("no");
  var again = document.getElementById("again");
  var flashTimer = 0;

  function say(text) {
    line.textContent = text;
    line.classList.add("is-in");
  }

  function flash() {
    window.clearTimeout(flashTimer);
    special.classList.remove("is-hot");
    special.getBoundingClientRect();
    flashTimer = window.setTimeout(function () {
      special.classList.add("is-hot");
    }, 60);
  }

  function choose(on, text) {
    yes.classList.toggle("is-on", on === yes);
    no.classList.toggle("is-on", on === no);
    yes.classList.toggle("ghost", on !== yes);
    no.classList.toggle("ghost", on !== no);
    say(text);
    flash();
  }

  yes.addEventListener("click", function () {
    choose(yes, "Then this bag is inside itself. Only bags that are not inside themselves were allowed in, so it cannot be in.");
  });

  no.addEventListener("click", function () {
    choose(no, "Then this bag is not inside itself. Every bag like that belongs in, so it has to be in.");
  });

  again.addEventListener("click", function () {
    window.clearTimeout(flashTimer);
    special.classList.remove("is-hot");
    yes.classList.remove("is-on", "ghost");
    no.classList.remove("is-on", "ghost");
    line.textContent = "";
    line.classList.remove("is-in");
  });
})();
