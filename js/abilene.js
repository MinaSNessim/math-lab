(function () {
  var S = window.Shelf;
  var spoken = ["", "", ""];
  var token = 0;
  var says = document.querySelectorAll("#trio .said");
  var actors = document.querySelectorAll("#trio .actor");
  var car = document.getElementById("car-spot");
  var pics = [];
  var seats = [];
  Array.prototype.forEach.call(actors, function (actor) {
    var seat = document.createElement("div");
    seat.className = "folk";
    var img = actor.querySelector("img");
    img.classList.add("mover");
    seat.appendChild(img);
    actor.insertBefore(seat, actor.firstChild);
    seats.push(seat);
    pics.push(img);
  });

  function say(text, wait) {
    token += 1;
    var mine = token;
    if (!wait) {
      document.getElementById("caption").textContent = text;
      return;
    }
    window.setTimeout(function () {
      if (mine !== token) return;
      document.getElementById("caption").textContent = text;
    }, 700);
  }

  function render(wait) {
    spoken.forEach(function (word, i) {
      S.send(pics[i], word === "go" ? car : seats[i]);
      says[i].textContent = word === "go" ? "Agreed to go" : word === "stay" ? "Said: rather stay" : "Silent";
      Array.prototype.forEach.call(actors[i].querySelectorAll("button"), function (button) {
        button.classList.toggle("is-on", button.getAttribute("data-say") === word);
      });
    });
    var goes = spoken.filter(function (word) { return word === "go"; }).length;
    var stays = spoken.filter(function (word) { return word === "stay"; }).length;
    var silent = 3 - goes - stays;
    var going = stays === 0 && goes === 3;
    document.getElementById("car-spot").classList.toggle("is-met", going);
    document.getElementById("car-label").textContent = going ? "The drive is on" : "The drive is waiting";
    if (stays > 0) {
      say("Someone said they would rather stay. Each person would rather have stayed, so the drive stays off.", wait);
      return;
    }
    if (going) {
      say("All three agreed to go. Each of them would rather have stayed. The car comes forward because nobody said no.", true);
      return;
    }
    if (goes > 0) {
      say(goes + " agreed to go, and " + silent + " " + (silent === 1 ? "is" : "are") + " still silent. Each person would rather stay.", wait);
      return;
    }
    say("Each of the three would rather stay. Nobody has said so. Silence is being read as a yes.", false);
  }

  document.getElementById("trio").addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    spoken[Number(button.getAttribute("data-i"))] = button.getAttribute("data-say");
    render(false);
  });

  document.getElementById("settle").addEventListener("click", function () {
    if (spoken.some(function (word) { return word === "stay"; })) {
      render(false);
      say("Someone already said they would rather stay. Counting silence as a yes does not start the drive.", false);
      return;
    }
    spoken = ["go", "go", "go"];
    render(true);
  });

  render(false);
  document.getElementById("again").addEventListener("click", function () {
    spoken = ["", "", ""];
    render(false);
  });
})();
