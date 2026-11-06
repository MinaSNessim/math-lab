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

  function cakeArt() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 220 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path d="M14 38c0-12 40-18 96-18s96 6 96 18v20c0 12-40 18-96 18S14 70 14 58z" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<ellipse cx="110" cy="38" rx="96" ry="16" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<path d="M32 38q8-6 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M184 28l22 8v16l-22 8z" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>'
      + '<circle cx="110" cy="20" r="8" fill="' + RED + '" stroke="' + INK + '" stroke-width="2.4"/>'
      + '<path d="M112 16c10-12 18-8 12 0" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
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
  var them = who(RED, "Chooser");
  var youHold = S.el("div", "cake-land");
  var themHold = S.el("div", "cake-land");
  var people = S.el("div", "cake-people");
  var stage = S.el("div", "cake-stage");
  var cakeBoard = S.el("div", "cake-board");
  var join = S.el("div", "cake-join");
  var whole = cakeArt();
  var leftSvg = cakeArt();
  var rightSvg = cakeArt();
  var slabL = S.el("div", "cake-slab mover");
  var slabR = S.el("div", "cake-slab mover");
  var cutLine = S.el("div", "cut-line");
  cutLine.hidden = true;
  slabL.appendChild(leftSvg);
  slabR.appendChild(rightSvg);
  slabL.hidden = true;
  slabR.hidden = true;
  join.appendChild(whole);
  join.appendChild(slabL);
  join.appendChild(cutLine);
  join.appendChild(slabR);
  people.appendChild(you.box);
  people.appendChild(them.box);
  stage.appendChild(youHold);
  stage.appendChild(themHold);
  stage.appendChild(join);
  cakeBoard.appendChild(people);
  cakeBoard.appendChild(stage);

  var cuts = [[2, 8], [4, 6], [5, 5], [6, 4], [8, 2]];
  var row = S.el("div", "controls");
  cuts.forEach(function (pair) {
    var button = S.button("Cut " + pair[0] + " and " + pair[1]);
    button.setAttribute("data-left", String(pair[0]));
    button.setAttribute("data-right", String(pair[1]));
    button.setAttribute("data-pace", "1200");
    row.appendChild(button);
  });
  var caption = S.el("p", "caption");
  board.appendChild(cakeBoard);
  board.appendChild(row);
  board.appendChild(caption);

  var round = 0;
  var OPENING = "The cake is whole. You cut. They take the bigger piece.";

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, ms);
  }

  function buttonOf(node) {
    while (node && node !== row) {
      if (node.getAttribute && node.getAttribute("data-left") != null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function paintArt(svg, width) {
    svg.style.width = width + "px";
    svg.style.height = Math.round(width * 80 / 220) + "px";
  }

  function cakeWidth() {
    var land = youHold.clientWidth || 160;
    var width = Math.floor(land / 0.82) - 12;
    if (width > 240) width = 240;
    if (width < 140) width = 140;
    return width;
  }

  function layoutWhole() {
    var width = cakeWidth();
    paintArt(whole, width);
    paintArt(leftSvg, width);
    paintArt(rightSvg, width);
    youHold.style.minHeight = Math.round(width * 80 / 220) + "px";
    themHold.style.minHeight = youHold.style.minHeight;
  }

  function reset() {
    round += 1;
    [slabL, slabR].forEach(function (slab) {
      stopGlide(slab);
      slab.hidden = true;
      slab.classList.remove("is-taken");
      slab.classList.remove("is-yours");
      join.appendChild(slab);
    });
    join.insertBefore(cutLine, slabR);
    cutLine.hidden = true;
    cutLine.classList.remove("is-in");
    whole.hidden = false;
    rightSvg.style.removeProperty("transform");
    you.pay.textContent = "";
    them.pay.textContent = "";
    Array.prototype.forEach.call(row.children, function (button) {
      button.classList.remove("is-on");
    });
    layoutWhole();
    caption.textContent = OPENING;
  }

  function cut(left, right) {
    round += 1;
    var mine = round;
    [slabL, slabR].forEach(function (slab) {
      stopGlide(slab);
      slab.classList.remove("is-taken");
      slab.classList.remove("is-yours");
    });
    join.appendChild(slabL);
    join.appendChild(cutLine);
    join.appendChild(slabR);
    var width = cakeWidth();
    var height = Math.round(width * 80 / 220);
    var leftW = Math.round(width * left / 10);
    var rightW = width - leftW;
    paintArt(leftSvg, width);
    paintArt(rightSvg, width);
    slabL.style.width = leftW + "px";
    slabR.style.width = rightW + "px";
    slabL.style.height = height + "px";
    slabR.style.height = height + "px";
    rightSvg.style.transform = "translateX(" + (-leftW) + "px)";
    cutLine.style.height = height + "px";
    whole.hidden = true;
    slabL.hidden = false;
    slabR.hidden = false;
    cutLine.hidden = false;
    cutLine.classList.remove("is-in");
    void cakeBoard.offsetWidth;
    cutLine.classList.add("is-in");
    var tie = left === right;
    var theirNode = left > right ? slabL : slabR;
    var yourNode = theirNode === slabL ? slabR : slabL;
    later(mine, 280, function () {
      S.carry([
        { node: yourNode, dest: youHold },
        { node: theirNode, dest: themHold }
      ]);
    });
    later(mine, 1200, function () {
      yourNode.classList.add("is-yours");
      theirNode.classList.add("is-taken");
      cutLine.hidden = true;
      if (tie) {
        you.pay.textContent = "You keep 5";
        them.pay.textContent = "They take 5";
        caption.textContent = "You cut 5 and 5. The pieces are equal. They take one half. You keep the other.";
        return;
      }
      var big = left > right ? left : right;
      var small = left > right ? right : left;
      you.pay.textContent = "You keep " + small;
      them.pay.textContent = "They take " + big;
      caption.textContent = "You cut " + left + " and " + right + ". They take the " + big + ". You keep the " + small + ".";
    });
  }

  row.addEventListener("click", function (event) {
    var button = buttonOf(event.target);
    if (!button) return;
    Array.prototype.forEach.call(row.children, function (other) {
      other.classList.toggle("is-on", other === button);
    });
    cut(parseInt(button.getAttribute("data-left"), 10), parseInt(button.getAttribute("data-right"), 10));
  });

  document.getElementById("again").addEventListener("click", reset);
  reset();
})();
