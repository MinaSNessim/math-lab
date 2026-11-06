(function () {
  var hosp = document.getElementById("bar-hosp");
  var ill = document.getElementById("bar-ill");
  var line = document.getElementById("line");
  var forward = document.getElementById("forward");
  var back = document.getElementById("back");
  var lr = document.getElementById("link-lr");
  var rl = document.getElementById("link-rl");
  var timers = [];
  var round = 0;
  var again = document.getElementById("again");
  var building = '<svg class="ice-icon" viewBox="0 0 40 42" aria-hidden="true"><path d="M6 18 h28 v20 h-28 z" fill="#fe8e83" stroke="#0c1438" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 6 h12 v12 h-12 z" fill="#f5c518" stroke="#0c1438" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 9 h4 M20 7 v4" fill="none" stroke="#0c1438" stroke-width="1.6" stroke-linecap="round"/><rect x="16" y="24" width="8" height="3" fill="#f5c518"/><rect x="18.5" y="21.5" width="3" height="8" fill="#f5c518"/><path d="M17 38 v-8 h6 v8" fill="none" stroke="#0c1438" stroke-width="1.6"/></svg>';
  var person = '<img class="ice-icon" src="images/person.png" alt="">';
  var i;
  for (i = 0; i < 4; i += 1) {
    hosp.insertAdjacentHTML("beforeend", building);
    ill.insertAdjacentHTML("beforeend", person);
  }

  function showCount(stack, count) {
    var icons = stack.querySelectorAll(".ice-icon");
    var step = icons[1].getBoundingClientRect().top - icons[0].getBoundingClientRect().top;
    if (!step) return;
    stack.style.transform = "translateY(" + ((icons.length - count) * step) + "px)";
  }

  function clearTimers() {
    while (timers.length) window.clearTimeout(timers.pop());
  }

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function mark(on) {
    forward.classList.toggle("is-on", on === forward);
    back.classList.toggle("is-on", on === back);
    forward.classList.toggle("ghost", on !== forward);
    back.classList.toggle("ghost", on !== back);
  }

  function play(first, second, link, text, button) {
    var mine = ++round;
    clearTimers();
    lr.classList.remove("is-on");
    rl.classList.remove("is-on");
    line.classList.remove("is-in");
    showCount(hosp, 1);
    showCount(ill, 1);
    mark(button);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (mine !== round) return;
        showCount(first, 3);
        later(function () {
          if (mine !== round) return;
          showCount(second, 3);
          link.classList.add("is-on");
        }, 720);
        later(function () {
          if (mine !== round) return;
          line.textContent = text;
          line.classList.add("is-in");
        }, 1460);
      });
    });
  }

  showCount(hosp, 1);
  showCount(ill, 1);

  forward.addEventListener("click", function () {
    play(hosp, ill, lr, "Hospitals: 3. Illness: 3. A careless reading says the hospitals caused it.", forward);
  });

  back.addEventListener("click", function () {
    play(ill, hosp, rl, "Illness: 3. Hospitals: 3. The hospitals were built after the illness. The arrow runs that way.", back);
  });

  again.addEventListener("click", function () {
    round += 1;
    clearTimers();
    lr.classList.remove("is-on");
    rl.classList.remove("is-on");
    line.textContent = "";
    line.classList.remove("is-in");
    showCount(hosp, 1);
    showCount(ill, 1);
    forward.classList.remove("is-on", "ghost");
    back.classList.remove("is-on", "ghost");
  });
})();
