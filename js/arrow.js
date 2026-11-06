(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var places = S.split("Each person's order", "The group's order");
  var cards = [];
  var tones = ["#5ec5a7", "#f5c518", "#fe8e83"];
  ["A above B above C", "B above C above A", "C above A above B"].forEach(function (label, index) {
    var card = S.el("div", "slip mover is-wide");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="14" y="8" width="36" height="64" rx="5" fill="#ffffff" stroke="#0c1438" stroke-width="2.4"/>'
      + '<path d="M14 13a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v9H14z" fill="' + tones[index] + '"/>'
      + '<path d="M22 36h20M22 46h20M22 56h12" fill="none" stroke="#0c1438" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
    card.appendChild(svg);
    var name = S.el("b");
    name.textContent = label;
    card.appendChild(name);
    places.here.appendChild(card);
    cards.push(card);
  });
  var row = S.el("div", "controls");
  var pairs = S.button("Every pair has a winner");
  var straight = S.button("The order does not loop");
  var free = S.button("No one person always decides");
  row.appendChild(pairs);
  row.appendChild(straight);
  row.appendChild(free);
  var caption = S.el("p", "caption");
  board.appendChild(places.wrap);
  board.appendChild(row);
  board.appendChild(caption);
  caption.textContent = "Green, yellow, and red are three rankings. Three promises. Two can be on. The third stays off.";

  function lights(pairOn, straightOn, freeOn) {
    pairs.classList.toggle("is-on", pairOn);
    straight.classList.toggle("is-on", straightOn);
    free.classList.toggle("is-on", freeOn);
  }
  function showLoop() {
    cards.forEach(function (card) { S.send(card, places.away); });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.add("is-here");
  }
  function showPerson() {
    cards.forEach(function (card, index) {
      S.send(card, index === 0 ? places.away : places.here);
    });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.add("is-here");
  }

  pairs.addEventListener("click", function () {
    lights(true, false, true);
    showLoop();
    S.say(caption, "A beats B. B beats C. C beats A. Every pair has a winner, and the order loops. Two promises are on. The order does not loop is off.", true);
  });
  straight.addEventListener("click", function () {
    lights(true, true, false);
    showPerson();
    S.say(caption, "Person 1's order is the group's: A above B above C. The order does not loop. One person always decides, so that promise is off. Two promises are on.", true);
  });
  free.addEventListener("click", function () {
    lights(true, false, true);
    showLoop();
    S.say(caption, "No one person always decides, so the loop is back. A beats B, B beats C, and C beats A. Two promises are on. The order does not loop is off.", true);
  });
  document.getElementById("again").addEventListener("click", function () {
    lights(false, false, false);
    cards.forEach(function (card) { S.send(card, places.here); });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.remove("is-here");
    S.say(caption, "Green, yellow, and red are three rankings. Three promises. Two can be on. The third stays off.", false);
  });
})();
