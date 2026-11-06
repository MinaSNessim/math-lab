(function () {
  var ranks = [];
  var index = 0;
  var hired = -1;
  var bestSeen = 99;

  function shuffle() {
    ranks = [1, 2, 3, 4, 5];
    var i;
    for (i = ranks.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var hold = ranks[i];
      ranks[i] = ranks[j];
      ranks[j] = hold;
    }
    index = 0;
    hired = -1;
    bestSeen = 99;
  }

  var cards = [];

  function tone(i) {
    if (hired >= 0) {
      if (i === hired) return ranks[i] === 1 ? "#5ec5a7" : "#fe8e83";
      if (i < hired) return "#fe8e83";
      return "#5ec5a7";
    }
    if (i < index) return "#fe8e83";
    if (i === index) return "#f5c518";
    return "#5ec5a7";
  }

  function figure(color) {
    return '<img src="images/person.png" alt="" style="border-bottom:8px solid ' + color + '">';
  }

  function paint() {
    var line = document.getElementById("line");
    if (!cards.length) {
      var i;
      for (i = 0; i < 5; i += 1) {
        var card = document.createElement("div");
        card.className = "cand";
        line.appendChild(card);
        cards.push(card);
      }
    }
    cards.forEach(function (card, i) {
      var rank = ranks[i];
      card.className = "cand";
      if (hired === i) card.classList.add("is-hired");
      else if (hired < 0 && i === index) card.classList.add("is-now");
      var label = "";
      if (hired >= 0 && i === hired) label = rank === 1 ? "Best" : "Rank " + rank;
      else if (hired < 0 && i < index) label = "Passed";
      else if (hired < 0 && i === index) label = "Now";
      else if (hired >= 0 && i < hired) label = "Passed";
      card.innerHTML = figure(tone(i)) + "<b>" + label + "</b>";
    });
    document.getElementById("pass").disabled = hired >= 0 || index >= ranks.length - 1;
    document.getElementById("hire").disabled = hired >= 0;
  }

  function say(extra) {
    var caption = document.getElementById("caption");
    if (hired < 0) {
      var record = ranks[index] < bestSeen;
      caption.textContent = "Person " + (index + 1) + " of 5 is here. " + (record ? "They are the strongest so far." : "Someone earlier was stronger.") + (index === 4 ? " This is the last one." : "");
      return;
    }
    var rank = ranks[hired];
    var bestAt = ranks.indexOf(1);
    caption.textContent = "You hired person " + (hired + 1) + ", " + (rank === 1 ? "the best in the line." : "rank " + rank + " of 5. The best was number " + (bestAt + 1) + ".") + (extra ? " " + extra : "");
  }

  function hireCurrent(reason) {
    if (ranks[index] < bestSeen) bestSeen = ranks[index];
    hired = index;
    paint();
    say(reason);
  }

  document.getElementById("pass").addEventListener("click", function () {
    if (hired >= 0) return;
    if (ranks[index] < bestSeen) bestSeen = ranks[index];
    if (index >= ranks.length - 1) {
      hireCurrent("The line ended, so the last one is hired.");
      return;
    }
    index += 1;
    paint();
    say("");
  });

  document.getElementById("hire").addEventListener("click", function () {
    if (hired >= 0) return;
    hireCurrent("You cannot go back to the ones you passed.");
  });

  document.getElementById("fresh").addEventListener("click", function () {
    shuffle();
    paint();
    say("");
  });

  shuffle();
  paint();
  say("");
  document.getElementById("again").addEventListener("click", function () {
    shuffle();
    paint();
    say("");
  });
})();
