(function () {
  var sun = document.getElementById("sun");
  var ice = document.getElementById("bar-ice");
  var drown = document.getElementById("bar-drown");
  var line = document.getElementById("line");
  var summer = document.getElementById("summer");
  var claims = document.getElementById("claims");
  var only = document.getElementById("only");
  var lock = document.getElementById("lock");
  var lr = document.getElementById("link-lr");
  var rl = document.getElementById("link-rl");
  var dropL = document.getElementById("drop-l");
  var dropR = document.getElementById("drop-r");
  var causeIce = document.getElementById("cause-ice");
  var causeDrown = document.getElementById("cause-drown");
  var causeHot = document.getElementById("cause-hot");
  var rose = false;
  var sayTimer = 0;
  var again = document.getElementById("again");
  var cone = '<svg class="ice-icon" viewBox="0 0 40 48" aria-hidden="true"><path d="M20 46 L10 22 h20 z" fill="#f5c518" stroke="#0c1438" stroke-width="1.6" stroke-linejoin="round"/><rect x="9" y="16" width="22" height="8" rx="2" fill="#5ec5a7" stroke="#0c1438" stroke-width="1.6"/><circle cx="20" cy="11" r="9" fill="#fe8e83" stroke="#0c1438" stroke-width="1.6"/></svg>';
  var swimmer = '<svg class="ice-icon swim" viewBox="0 0 64 40" aria-hidden="true"><path d="M6 12 q8 -10 16 0" fill="none" stroke="#0c1438" stroke-width="1.8" stroke-linecap="round"/><circle cx="14" cy="16" r="8" fill="#ffffff" stroke="#0c1438" stroke-width="1.6"/><circle cx="11" cy="15" r="1.2" fill="#0c1438"/><circle cx="17" cy="15" r="1.2" fill="#0c1438"/><path d="M11 20 q3 3 6 0" fill="none" stroke="#0c1438" stroke-width="1.2" stroke-linecap="round"/><path d="M22 20 H48" stroke="#5ec5a7" stroke-width="6" stroke-linecap="round"/><path d="M30 18 L46 8" stroke="#5ec5a7" stroke-width="4" stroke-linecap="round"/><path d="M36 22 L54 32" stroke="#5ec5a7" stroke-width="4" stroke-linecap="round"/></svg>';
  var n;
  for (n = 0; n < 6; n += 1) {
    ice.insertAdjacentHTML("beforeend", cone);
    drown.insertAdjacentHTML("beforeend", swimmer);
  }

  function showCount(stack, count) {
    var icons = stack.querySelectorAll(".ice-icon");
    var step = icons[1].getBoundingClientRect().top - icons[0].getBoundingClientRect().top;
    if (!step) return;
    var hide = 6 - count;
    stack.style.transform = "translateY(" + (hide * step) + "px)";
  }

  showCount(ice, 2);
  showCount(drown, 2);

  function say(text) {
    window.clearTimeout(sayTimer);
    line.classList.remove("is-in");
    sayTimer = window.setTimeout(function () {
      line.textContent = text;
      line.classList.add("is-in");
    }, 200);
  }

  function clearArrows() {
    lr.classList.remove("is-on");
    rl.classList.remove("is-on");
    dropL.classList.remove("is-on");
    dropR.classList.remove("is-on");
  }

  function mark(on) {
    var causes = [causeIce, causeDrown, causeHot];
    var i;
    for (i = 0; i < causes.length; i += 1) {
      causes[i].classList.toggle("is-on", causes[i] === on);
      causes[i].classList.toggle("ghost", causes[i] !== on);
    }
    only.classList.toggle("is-on", on === only);
    only.classList.remove("ghost");
  }

  function paired() {
    showCount(ice, 5);
    showCount(drown, 5);
  }

  summer.addEventListener("click", function () {
    if (rose) return;
    rose = true;
    sun.classList.add("is-hot");
    paired();
    say("They rise together. This is correlation.");
    summer.hidden = true;
    claims.hidden = false;
  });

  causeIce.addEventListener("click", function () {
    clearArrows();
    paired();
    lr.classList.add("is-on");
    mark(causeIce);
    only.hidden = false;
    say("Does buying more ice cream cause more drowning? No.");
  });

  causeDrown.addEventListener("click", function () {
    clearArrows();
    paired();
    rl.classList.add("is-on");
    mark(causeDrown);
    only.hidden = false;
    say("Do more drownings cause people to buy more ice cream? No.");
  });

  causeHot.addEventListener("click", function () {
    clearArrows();
    paired();
    dropL.classList.add("is-on");
    dropR.classList.add("is-on");
    mark(causeHot);
    only.hidden = false;
    say("Hot weather makes people buy more ice cream and swim more. This is the real link.");
  });

  only.addEventListener("click", function () {
    clearArrows();
    showCount(ice, 6);
    showCount(drown, 5);
    mark(only);
    say("Changing ice cream sales does not change drowning. Watching them rise was not the same as causation.");
    lock.hidden = false;
  });

  again.addEventListener("click", function () {
    window.clearTimeout(sayTimer);
    rose = false;
    sun.classList.remove("is-hot");
    showCount(ice, 2);
    showCount(drown, 2);
    clearArrows();
    line.textContent = "";
    line.classList.remove("is-in");
    summer.hidden = false;
    claims.hidden = true;
    only.hidden = true;
    lock.hidden = true;
    causeIce.classList.remove("is-on", "ghost");
    causeDrown.classList.remove("is-on", "ghost");
    causeHot.classList.remove("is-on", "ghost");
    only.classList.remove("is-on", "ghost");
  });
})();
