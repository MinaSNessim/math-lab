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

  function stopGlide(node) {
    node._glide = (node._glide || 0) + 1;
    node.style.removeProperty("transform");
    node.style.willChange = "";
  }

  function who(color, name) {
    var box = S.el("div", "deal-who");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var pay = S.el("span", "deal-pay");
    box.appendChild(title);
    box.appendChild(pay);
    return { box: box, pay: pay };
  }

  var you = who(GREEN, "You");
  var them = who(RED, "Player 2");
  var youStack = S.el("div", "coin-stack is-out");
  var themStack = S.el("div", "coin-stack is-wide");
  you.box.appendChild(youStack);
  them.box.appendChild(themStack);
  var mid = S.el("div", "deal-mid");
  var midPay = S.el("b", "deal-pay");
  var tri = S.el("div", "tri-piles");
  var stackA = S.el("div", "coin-stack");
  var stackB = S.el("div", "coin-stack");
  var stackC = S.el("div", "coin-stack");
  tri.appendChild(stackA);
  tri.appendChild(stackB);
  tri.appendChild(stackC);
  mid.appendChild(midPay);
  mid.appendChild(tri);
  var deal = S.el("div", "deal");
  deal.appendChild(you.box);
  deal.appendChild(mid);
  deal.appendChild(them.box);

  var coins = [];
  var copies = [];
  var i;
  for (i = 0; i < 10; i += 1) {
    var coin = coinNode();
    coins.push(coin);
    youStack.appendChild(coin);
  }

  var sends = S.el("div", "controls");
  for (i = 0; i <= 10; i += 1) {
    var sendButton = S.button("Send $" + i);
    sendButton.setAttribute("data-send", String(i));
    sendButton.setAttribute("data-pace", "2200");
    sends.appendChild(sendButton);
  }
  var returns = S.el("div", "controls");
  returns.hidden = true;
  var noneBtn = S.button("They return nothing");
  var sameBtn = S.button("They return the same amount");
  var halfBtn = S.button("They split the new pile");
  noneBtn.setAttribute("data-back", "none");
  sameBtn.setAttribute("data-back", "same");
  halfBtn.setAttribute("data-back", "half");
  [noneBtn, sameBtn, halfBtn].forEach(function (button) {
    button.setAttribute("data-pace", "900");
    returns.appendChild(button);
  });
  var caption = S.el("p", "caption");
  board.appendChild(deal);
  board.appendChild(sends);
  board.appendChild(returns);
  board.appendChild(caption);

  var round = 0;
  var sent = 0;
  var OPENING = "You hold $10. Send any amount. What you send is tripled, then Player 2 can return some.";

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, ms);
  }

  function controlOf(node, root, key) {
    while (node && node !== root) {
      if (node.getAttribute && node.getAttribute(key) != null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function clearCopies() {
    copies.forEach(function (coin) {
      stopGlide(coin);
      if (coin.parentNode) coin.parentNode.removeChild(coin);
    });
    copies = [];
  }

  function spawn(stack, count) {
    var n;
    for (n = 0; n < count; n += 1) {
      var coin = coinNode();
      copies.push(coin);
      stack.appendChild(coin);
    }
  }

  function pileNodes() {
    return []
      .concat(Array.prototype.slice.call(stackA.children))
      .concat(Array.prototype.slice.call(stackB.children))
      .concat(Array.prototype.slice.call(stackC.children));
  }

  function reset() {
    round += 1;
    sent = 0;
    clearCopies();
    coins.forEach(function (coin) {
      stopGlide(coin);
      coin.classList.remove("is-gone");
      youStack.appendChild(coin);
    });
    youStack.classList.add("is-out");
    themStack.classList.remove("is-out");
    you.pay.textContent = "$10";
    them.pay.textContent = "$0";
    midPay.textContent = "";
    returns.hidden = true;
    Array.prototype.forEach.call(sends.children, function (button) {
      button.classList.remove("is-on");
    });
    Array.prototype.forEach.call(returns.children, function (button) {
      button.classList.remove("is-on");
    });
    caption.textContent = OPENING;
  }

  function showReturns(amount) {
    var pile = amount * 3;
    var half = Math.floor(pile / 2);
    noneBtn.textContent = "They return nothing";
    sameBtn.textContent = "They return the same $" + amount;
    if (pile % 2 === 0) halfBtn.textContent = "They split the $" + pile + " in half";
    else halfBtn.textContent = "They return $" + half + " of the $" + pile;
    returns.hidden = false;
  }

  function send(amount) {
    round += 1;
    var mine = round;
    sent = amount;
    clearCopies();
    coins.forEach(function (coin) {
      stopGlide(coin);
      youStack.appendChild(coin);
    });
    returns.hidden = true;
    Array.prototype.forEach.call(returns.children, function (button) {
      button.classList.remove("is-on");
    });
    them.pay.textContent = "$0";
    youStack.classList.add("is-out");
    themStack.classList.remove("is-out");
    stackA.classList.remove("is-out");
    stackB.classList.remove("is-out");
    stackC.classList.remove("is-out");
    if (!amount) {
      you.pay.textContent = "$10";
      midPay.textContent = "Nothing sent";
      later(mine, 900, function () {
        caption.textContent = "You send $0. Nothing is tripled. You keep $10. Player 2 has nothing to return.";
      });
      return;
    }
    you.pay.textContent = "$10";
    midPay.textContent = "";
    stackA.classList.add("is-out");
    S.carry(coins.slice(0, amount).map(function (node) {
      return { node: node, dest: stackA };
    }));
    later(mine, 900, function () {
      youStack.classList.toggle("is-out", amount < 10);
      stackB.classList.add("is-out");
      stackC.classList.add("is-out");
      you.pay.textContent = "$" + (10 - amount);
      midPay.textContent = "Sent $" + amount;
      caption.textContent = "You send $" + amount + ". Those coins are in the middle. You still hold $" + (10 - amount) + ".";
      spawn(stackB, amount);
      spawn(stackC, amount);
      midPay.textContent = "Now $" + (amount * 3);
      later(mine, 400, function () {
        caption.textContent = "The $" + amount + " is tripled to $" + (amount * 3) + ".";
        S.carry(pileNodes().map(function (node) {
          return { node: node, dest: themStack };
        }));
        later(mine, 900, function () {
          you.pay.textContent = "$" + (10 - amount);
          them.pay.textContent = "$" + (amount * 3);
          midPay.textContent = "";
          youStack.classList.toggle("is-out", amount < 10);
          themStack.classList.add("is-out");
          stackA.classList.remove("is-out");
          stackB.classList.remove("is-out");
          stackC.classList.remove("is-out");
          showReturns(amount);
          caption.textContent = "You send $" + amount + ". It is tripled to $" + (amount * 3) + ", in front of Player 2. You still hold $" + (10 - amount) + ".";
        });
      });
    });
  }

  function give(kind) {
    if (!sent) return;
    round += 1;
    var mine = round;
    var pile = sent * 3;
    var back = 0;
    if (kind === "same") back = sent;
    if (kind === "half") back = Math.floor(pile / 2);
    coins.slice(0, sent).forEach(function (coin) {
      stopGlide(coin);
      themStack.appendChild(coin);
    });
    copies.forEach(function (coin) {
      stopGlide(coin);
      themStack.appendChild(coin);
    });
    var held = Array.prototype.slice.call(themStack.querySelectorAll(".disc"));
    if (back) {
      S.carry(held.slice(0, back).map(function (node) {
        return { node: node, dest: youStack };
      }));
    }
    later(mine, 900, function () {
      var youEnd = (10 - sent) + back;
      var themEnd = pile - back;
      you.pay.textContent = "$" + youEnd;
      them.pay.textContent = "$" + themEnd;
      youStack.classList.toggle("is-out", youEnd > 0);
      themStack.classList.toggle("is-out", themEnd > 0);
      if (kind === "none") {
        caption.textContent = "They return nothing. You end with $" + youEnd + ". They end with $" + themEnd + ".";
        return;
      }
      if (kind === "same") {
        caption.textContent = "They return the same $" + sent + ". You end with $" + youEnd + ". They end with $" + themEnd + ".";
        return;
      }
      if (pile % 2 === 0) {
        caption.textContent = "They split the $" + pile + " in half and return $" + back + ". You end with $" + youEnd + ". They end with $" + themEnd + ".";
        return;
      }
      caption.textContent = "They split the $" + pile + ". The coins cannot split in half, so they return $" + back + " and keep $" + (pile - back) + ". You end with $" + youEnd + ". They end with $" + themEnd + ".";
    });
  }

  sends.addEventListener("click", function (event) {
    var button = controlOf(event.target, sends, "data-send");
    if (!button) return;
    var amount = parseInt(button.getAttribute("data-send"), 10);
    button.setAttribute("data-pace", amount ? "2200" : "900");
    Array.prototype.forEach.call(sends.children, function (other) {
      other.classList.toggle("is-on", other === button);
    });
    send(amount);
  });

  returns.addEventListener("click", function (event) {
    var button = controlOf(event.target, returns, "data-back");
    if (!button) return;
    Array.prototype.forEach.call(returns.children, function (other) {
      other.classList.toggle("is-on", other === button);
    });
    give(button.getAttribute("data-back"));
  });

  document.getElementById("again").addEventListener("click", reset);
  reset();
})();
