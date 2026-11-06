(function () {
  var next = document.getElementById("next");
  var again = document.getElementById("again");
  var caption = document.getElementById("caption");
  var num = document.getElementById("night-num");
  var people = document.querySelectorAll(".isle-one");
  var night = 0;
  var timer = 0;
  var gen = 0;
  var yellow = 3;

  function mark(gone) {
    var i;
    for (i = 0; i < people.length; i += 1) {
      var leave = gone && people[i].getAttribute("data-leave") === "1";
      if (leave) people[i].classList.add("is-gone");
      else people[i].classList.remove("is-gone");
    }
  }

  function rest() {
    night = 0;
    num.textContent = "\u2014";
    mark(false);
    caption.textContent = "";
    next.disabled = false;
  }

  next.addEventListener("click", function () {
    if (night >= yellow || next.disabled) return;
    night += 1;
    num.textContent = String(night);
    if (night < yellow) {
      caption.textContent = night === 1 ? "Night 1. Nothing happens." : "Night 2. Still nothing.";
      return;
    }
    next.disabled = true;
    mark(true);
    caption.textContent = "Night 3.";
    var mine = ++gen;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      if (mine !== gen) return;
      caption.textContent = "Night 3. The three with yellow eyes leave.";
    }, 900);
  });

  again.addEventListener("click", function () {
    gen += 1;
    window.clearTimeout(timer);
    rest();
  });

  rest();
})();
