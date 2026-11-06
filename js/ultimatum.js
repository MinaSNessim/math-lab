(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";

  function figure(color) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect class="tone" x="24" y="120" width="126" height="84" rx="30" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect class="tone" x="52" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect class="tone" x="94" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle class="tone" cx="87" cy="78" r="58" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function coinNode() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("class", "disc mover");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="16" cy="16" r="12.2" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2.2"/>'
      + '<circle cx="16" cy="16" r="6.5" fill="none" stroke="' + INK + '" stroke-width="1.6"/>';
    return svg;
  }

  function who(color, name) {
    var box = S.el("div", "deal-who");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var pay = S.el("span", "deal-pay");
    var say = S.el("span", "deal-say");
    box.appendChild(title);
    box.appendChild(pay);
    box.appendChild(say);
    return { box: box, pay: pay, say: say };
  }

  function stopGlide(node) {
    node._glide = (node._glide || 0) + 1;
    node.style.removeProperty("transform");
    node.style.willChange = "";
  }

  var you = who(GREEN, "You");
  var them = who(RED, "Responder");
  var mid = S.el("div", "deal-mid");
  var midName = S.el("b");
  midName.textContent = "The $10";
  var pot = S.el("div", "coin-stack is-out");
  var youStack = S.el("div", "coin-stack");
  var themStack = S.el("div", "coin-stack");
  mid.appendChild(midName);
  mid.appendChild(pot);
  you.box.appendChild(youStack);
  them.box.appendChild(themStack);
  var deal = S.el("div", "deal");
  deal.appendChild(you.box);
  deal.appendChild(mid);
  deal.appendChild(them.box);

  var coins = [];
  var i;
  for (i = 0; i < 10; i += 1) {
    var coin = coinNode();
    coins.push(coin);
    pot.appendChild(coin);
  }

  var row = S.el("div", "controls");
  for (i = 0; i <= 10; i += 1) {
    var button = S.button("$" + i);
    button.setAttribute("data-offer", String(i));
    button.setAttribute("data-pace", "1400");
    row.appendChild(button);
  }
  var caption = S.el("p", "caption");
  board.appendChild(deal);
  board.appendChild(row);
  board.appendChild(caption);

  var round = 0;
  var OPENING = "The $10 sits between you. Choose how much to offer.";

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, ms);
  }

  function buttonOf(node) {
    while (node && node !== row) {
      if (node.getAttribute && node.getAttribute("data-offer") != null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function shareLine(n) {
    if (n === 2) return "That is 20% of the $10. ";
    if (n === 3) return "That is 30% of the $10. ";
    return "";
  }

  function homeCoins() {
    coins.forEach(function (coin) {
      stopGlide(coin);
      coin.classList.remove("is-gone");
      pot.appendChild(coin);
    });
  }

  function reset() {
    round += 1;
    homeCoins();
    youStack.classList.remove("is-yours");
    themStack.classList.remove("is-theirs");
    pot.classList.add("is-out");
    midName.textContent = "The $10";
    you.pay.textContent = "";
    them.pay.textContent = "";
    you.say.textContent = "";
    you.say.className = "deal-say";
    them.say.textContent = "";
    them.say.className = "deal-say";
    Array.prototype.forEach.call(row.children, function (button) {
      button.classList.remove("is-on");
    });
    caption.textContent = OPENING;
  }

  function offer(n) {
    round += 1;
    var mine = round;
    homeCoins();
    youStack.classList.remove("is-yours");
    themStack.classList.remove("is-theirs");
    pot.classList.remove("is-out");
    them.say.textContent = "";
    them.say.className = "deal-say";
    you.say.textContent = "";
    midName.textContent = "";
    var moves = coins.map(function (coin, index) {
      return { node: coin, dest: index < n ? themStack : youStack };
    });
    S.carry(moves);
    later(mine, 900, function () {
      you.pay.textContent = "You keep $" + (10 - n);
      them.pay.textContent = "Offered $" + n;
      if (10 - n) youStack.classList.add("is-yours");
      if (n) themStack.classList.add("is-theirs");
      caption.textContent = "You offer $" + n + ". You keep $" + (10 - n) + ". They are offered $" + n + ".";
    });
    later(mine, 1400, function () {
      var reject = n <= 2;
      if (reject) {
        coins.forEach(function (coin) { coin.classList.add("is-gone"); });
        youStack.classList.remove("is-yours");
        themStack.classList.remove("is-theirs");
        you.pay.textContent = "You get $0";
        them.pay.textContent = "They get $0";
        them.say.textContent = "Reject";
        them.say.className = "deal-say is-no";
        caption.textContent = "You offer $" + n + ". " + shareLine(n) + "The responder rejects $2 or less. Both of you get nothing.";
        return;
      }
      you.pay.textContent = "You keep $" + (10 - n);
      them.pay.textContent = "They keep $" + n;
      them.say.textContent = "Accept";
      them.say.className = "deal-say is-yes";
      caption.textContent = "You offer $" + n + ". " + shareLine(n) + "The responder accepts $3 or more. You keep $" + (10 - n) + ". They keep $" + n + ".";
    });
  }

  row.addEventListener("click", function (event) {
    var button = buttonOf(event.target);
    if (!button) return;
    Array.prototype.forEach.call(row.children, function (other) {
      other.classList.toggle("is-on", other === button);
    });
    offer(parseInt(button.getAttribute("data-offer"), 10));
  });

  document.getElementById("again").addEventListener("click", reset);
  reset();
})();
