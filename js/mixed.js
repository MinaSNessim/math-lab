(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";

  function coin(fill, name) {
    var box = S.el("div", "mix-coin");
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="60" cy="60" r="52" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="12"/>'
      + '<circle cx="60" cy="60" r="34" fill="none" stroke="' + INK + '" stroke-width="4"/>'
      + '<text x="60" y="72" text-anchor="middle" font-size="36" font-weight="800" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif">H</text>';
    var title = S.el("b");
    title.textContent = name;
    box.appendChild(svg);
    box.appendChild(title);
    return box;
  }

  function slider(id, label) {
    var input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.id = id;
    input.setAttribute("aria-label", label);
    var num = S.el("b");
    var lab = S.el("label", "field mix-slider");
    lab.setAttribute("for", id);
    lab.appendChild(document.createTextNode(label));
    lab.appendChild(input);
    lab.appendChild(num);
    return { input: input, num: num, lab: lab };
  }

  function row(name) {
    var line = S.el("div", "mix-row");
    var who = S.el("span");
    who.textContent = name;
    var heads = S.el("b");
    var tails = S.el("b");
    line.appendChild(who);
    line.appendChild(heads);
    line.appendChild(tails);
    return { line: line, heads: heads, tails: tails };
  }

  var coins = S.el("div", "mix-coins");
  coins.appendChild(coin(GREEN, "You"));
  var mark = S.el("div", "mix-mark");
  mark.textContent = "Neither wants to change";
  coins.appendChild(mark);
  coins.appendChild(coin(RED, "The other player"));

  var you = slider("you-heads", "Your chance of Heads");
  var them = slider("them-heads", "Their chance of Heads");
  var youRow = row("You");
  var themRow = row("Them");
  var sheet = S.el("div", "mix-sheet");
  var sheetHead = S.el("div", "mix-head");
  sheetHead.textContent = "Score over 100 plays. A win is 1. A loss is −1.";
  var colHead = S.el("div", "mix-cols");
  var blank = S.el("span");
  var hHead = S.el("span");
  hHead.textContent = "Always Heads";
  var tHead = S.el("span");
  tHead.textContent = "Always Tails";
  colHead.appendChild(blank);
  colHead.appendChild(hHead);
  colHead.appendChild(tHead);
  sheet.appendChild(sheetHead);
  sheet.appendChild(colHead);
  sheet.appendChild(youRow.line);
  sheet.appendChild(themRow.line);

  var controls = S.el("div", "controls mix-controls");
  controls.appendChild(you.lab);
  controls.appendChild(them.lab);
  var caption = S.el("p", "caption");
  board.appendChild(coins);
  board.appendChild(sheet);
  board.appendChild(controls);
  board.appendChild(caption);

  function signed(n) {
    if (n > 0) return "+" + n;
    return String(n);
  }

  function paint() {
    var yp = parseInt(you.input.value, 10);
    var tp = parseInt(them.input.value, 10);
    if (isNaN(yp)) yp = 0;
    if (isNaN(tp)) tp = 0;
    you.num.textContent = yp + "%";
    them.num.textContent = tp + "%";
    var youHeads = 2 * tp - 100;
    var youTails = 100 - 2 * tp;
    var themHeads = 100 - 2 * yp;
    var themTails = 2 * yp - 100;
    youRow.heads.textContent = signed(youHeads);
    youRow.tails.textContent = signed(youTails);
    themRow.heads.textContent = signed(themHeads);
    themRow.tails.textContent = signed(themTails);
    youRow.line.classList.toggle("is-equal", youHeads === youTails);
    themRow.line.classList.toggle("is-equal", themHeads === themTails);
    var both = yp === 50 && tp === 50;
    mark.classList.toggle("is-on", both);
    var line = "Your chance of Heads is " + yp + "%. Their chance of Heads is " + tp + "%. ";
    line += "Over 100 plays, always Heads scores " + signed(youHeads) + " for you and always Tails scores " + signed(youTails) + ". ";
    line += "For them, always Heads scores " + signed(themHeads) + " and always Tails scores " + signed(themTails) + ". ";
    if (both) line += "Those pairs match, so neither of you gains by changing the chance.";
    else if (youHeads === youTails) line += "You score the same with either face. They still do better with one face than the other.";
    else if (themHeads === themTails) line += "They score the same with either face. You still do better with one face than the other.";
    else line += "Each of you still does better with one face than the other.";
    caption.textContent = line;
  }

  you.input.addEventListener("input", paint);
  them.input.addEventListener("input", paint);

  document.getElementById("again").addEventListener("click", function () {
    you.input.value = "30";
    them.input.value = "70";
    paint();
  });
  you.input.value = "30";
  them.input.value = "70";
  paint();
})();
