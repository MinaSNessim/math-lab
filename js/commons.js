(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var START = 6;
  var BASELINE = 24;

  function figure(color) {
    var svg = document.createElementNS(SVG, "svg");
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

  function cowArt(body) {
    var nose = body === RED ? GREEN : RED;
    var ear = body === YELLOW ? GREEN : YELLOW;
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 86 64");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path d="M56 18 L61 3 L68 18 Z" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>'
      + '<path d="M68 18 L76 2 L83 18 Z" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>'
      + '<ellipse cx="36" cy="40" rx="26" ry="15" fill="' + body + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<circle cx="64" cy="32" r="14" fill="' + body + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<ellipse cx="78" cy="30" rx="7" ry="4.5" fill="' + ear + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<circle cx="69" cy="30" r="2.1" fill="' + INK + '"/>'
      + '<circle cx="72" cy="37" r="2.8" fill="' + nose + '" stroke="' + INK + '" stroke-width="1.6"/>'
      + '<rect x="18" y="48" width="7" height="13" rx="2" fill="' + body + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<rect x="30" y="48" width="7" height="13" rx="2" fill="' + body + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<rect x="42" y="48" width="7" height="13" rx="2" fill="' + body + '" stroke="' + INK + '" stroke-width="2"/>'
      + '<path d="M12 36c-8 2-10 10-4 12" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
    return svg;
  }

  function who(color, name) {
    var box = S.el("div", "pasture-who");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var milk = S.el("span", "pasture-milk");
    box.appendChild(title);
    box.appendChild(milk);
    return { box: box, milk: milk };
  }

  function fieldArt() {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "pasture-svg");
    svg.setAttribute("viewBox", "0 0 640 280");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="24" y="78" width="592" height="180" rx="26" fill="' + GREEN + '" stroke="' + INK + '" stroke-width="4"/>'
      + '<rect class="pasture-shade" x="24" y="78" width="592" height="180" rx="26" fill="' + INK + '"/>'
      + '<ellipse class="pasture-bare" cx="170" cy="160" rx="58" ry="30"/>'
      + '<ellipse class="pasture-bare" cx="320" cy="190" rx="74" ry="34"/>'
      + '<ellipse class="pasture-bare" cx="470" cy="155" rx="52" ry="28"/>'
      + '<ellipse class="pasture-bare" cx="240" cy="220" rx="46" ry="22"/>'
      + '<ellipse class="pasture-bare" cx="400" cy="130" rx="40" ry="18"/>'
      + '<ellipse class="pasture-bare" cx="130" cy="210" rx="34" ry="16"/>'
      + '<rect x="78" y="28" width="18" height="86" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="196" y="28" width="18" height="86" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="314" y="28" width="18" height="86" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="432" y="28" width="18" height="86" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="548" y="28" width="18" height="86" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="78" y="42" width="488" height="16" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>'
      + '<rect x="78" y="74" width="488" height="14" rx="5" fill="' + YELLOW + '" stroke="' + INK + '" stroke-width="3"/>';
    return svg;
  }

  var you = who(GREEN, "You");
  var neighbors = [who(RED, "Neighbor"), who(RED, "Neighbor"), who(RED, "Neighbor")];
  var people = S.el("div", "pasture-people");
  people.appendChild(you.box);
  neighbors.forEach(function (person) { people.appendChild(person.box); });

  var pasture = S.el("div", "pasture");
  var field = fieldArt();
  pasture.appendChild(field);
  var shade = field.querySelector(".pasture-shade");
  var patches = field.querySelectorAll(".pasture-bare");
  var cows = [];
  var kinds = [];
  var i;
  for (i = 0; i < 44; i += 1) {
    var body = YELLOW;
    if (i === 0) body = GREEN;
    else if (i < 4) body = RED;
    var node = S.el("div", "pasture-cow");
    node.appendChild(cowArt(body));
    var col = i % 9;
    var row = Math.floor(i / 9);
    node.style.left = (16 + col * 8.2) + "%";
    node.style.top = (58 + row * 6.4) + "%";
    pasture.appendChild(node);
    cows.push(node);
    kinds.push(i < 4 ? "base" : (i < 14 ? "you" : "them"));
  }

  var mpcNode = S.el("b");
  var condNode = S.el("b", "pasture-flag");
  var totalNode = S.el("b");
  var baseNode = S.el("b");
  baseNode.textContent = String(BASELINE);

  function stat(label, value) {
    var box = S.el("div", "pasture-stat");
    var name = S.el("span");
    name.textContent = label;
    box.appendChild(name);
    box.appendChild(value);
    return box;
  }

  var stats = S.el("div", "pasture-stats");
  stats.appendChild(stat("Milk per cow", mpcNode));
  stats.appendChild(stat("Field", condNode));
  stats.appendChild(stat("Total milk", totalNode));
  stats.appendChild(stat("If nobody added extra", baseNode));

  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "10";
  slider.value = "0";
  slider.id = "extra-cows";
  slider.setAttribute("aria-label", "Extra cows you add");
  var sliderNum = S.el("b");
  sliderNum.id = "extra-num";
  sliderNum.textContent = "0";
  var sliderLabel = S.el("label", "field");
  sliderLabel.setAttribute("for", "extra-cows");
  sliderLabel.appendChild(document.createTextNode("Extra cows you add"));
  sliderLabel.appendChild(slider);
  sliderLabel.appendChild(sliderNum);

  var groupBtn = S.button("Everyone else also adds cows", "btn");
  groupBtn.id = "everyone";
  groupBtn.setAttribute("data-pace", "900");

  var controls = S.el("div", "controls pasture-controls");
  controls.appendChild(sliderLabel);
  controls.appendChild(groupBtn);
  var caption = S.el("p", "caption");

  board.appendChild(people);
  board.appendChild(pasture);
  board.appendChild(stats);
  board.appendChild(controls);
  board.appendChild(caption);

  var round = 0;
  var extra = 0;
  var grouped = false;

  function later(mine, ms, fn) {
    window.setTimeout(function () {
      if (mine !== round) return;
      fn();
    }, ms);
  }

  function condition(mpc) {
    if (mpc >= 5) return "Good";
    if (mpc >= 2) return "Thin";
    return "Bare";
  }

  function measure(num, group) {
    var added = group ? num * 4 : num;
    var mpc = START - added;
    if (mpc < 0) mpc = 0;
    var yourCows = 1 + num;
    var theirCows = group ? 1 + num : 1;
    var totalCows = yourCows + theirCows * 3;
    return {
      mpc: mpc,
      yourMilk: yourCows * mpc,
      theirMilk: theirCows * mpc,
      totalMilk: totalCows * mpc,
      cond: condition(mpc),
      added: added
    };
  }

  function cowWord(num) {
    return num === 1 ? "cow" : "cows";
  }

  function soloLine(num, now) {
    if (num === 0) {
      return "You and three neighbors each have one cow. Your milk is " + now.yourMilk + ". Milk per cow is " + now.mpc + ". The field is good.";
    }
    return "You added " + num + " extra " + cowWord(num) + ". Your milk is " + now.yourMilk + ". Milk per cow is " + now.mpc + ". Each neighbor's milk is " + now.theirMilk + ". The field is " + now.cond.toLowerCase() + ".";
  }

  function groupLine(num, now) {
    if (num === 0) return "Nobody added an extra cow. Total milk stays 24. The field stays good.";
    return "Everyone added " + num + " extra " + cowWord(num) + ". Your milk is " + now.yourMilk + ". Each neighbor's milk is " + now.theirMilk + ". Total milk is " + now.totalMilk + ". If nobody had added extra, total milk would be 24.";
  }

  function paintDamage(added, snap) {
    var n;
    if (snap) {
      shade.style.transition = "none";
      for (n = 0; n < patches.length; n += 1) patches[n].style.transition = "none";
    }
    var dim = added / 14;
    if (dim > 0.38) dim = 0.38;
    shade.style.opacity = String(dim);
    for (n = 0; n < patches.length; n += 1) {
      var opacity = 0;
      if (added > n) {
        opacity = (added - n) / 3;
        if (opacity > 0.92) opacity = 0.92;
      }
      patches[n].style.opacity = String(opacity);
    }
    if (snap) {
      void pasture.offsetWidth;
      shade.style.transition = "";
      for (n = 0; n < patches.length; n += 1) patches[n].style.transition = "";
    }
  }

  function paintCows(num, group, snap) {
    var yours = num;
    var theirs = group ? num * 3 : 0;
    var n;
    for (n = 0; n < cows.length; n += 1) {
      var on = false;
      if (kinds[n] === "base") on = true;
      else if (kinds[n] === "you") on = (n - 4) < yours;
      else on = (n - 14) < theirs;
      if (snap) cows[n].style.setProperty("transition", "none", "important");
      cows[n].classList.toggle("is-in", on);
    }
    if (snap) {
      void pasture.offsetWidth;
      for (n = 0; n < cows.length; n += 1) cows[n].style.removeProperty("transition");
    }
  }

  function paintNumbers(now) {
    you.milk.textContent = "Milk " + now.yourMilk;
    neighbors.forEach(function (person) {
      person.milk.textContent = "Milk " + now.theirMilk;
    });
    mpcNode.textContent = String(now.mpc);
    totalNode.textContent = String(now.totalMilk);
    condNode.textContent = now.cond;
    condNode.className = "pasture-flag is-" + now.cond.toLowerCase();
  }

  function render(snap, talk) {
    var now = measure(extra, grouped);
    paintCows(extra, grouped, snap);
    paintDamage(now.added, snap);
    paintNumbers(now);
    if (talk) caption.textContent = grouped ? groupLine(extra, now) : soloLine(extra, now);
    return now;
  }

  slider.addEventListener("input", function () {
    round += 1;
    extra = parseInt(slider.value, 10);
    if (isNaN(extra)) extra = 0;
    sliderNum.textContent = String(extra);
    grouped = false;
    groupBtn.classList.remove("is-on");
    render(false, true);
  });

  groupBtn.addEventListener("click", function () {
    round += 1;
    var mine = round;
    var num = extra;
    grouped = true;
    groupBtn.classList.add("is-on");
    var now = render(false, false);
    var line = groupLine(num, now);
    later(mine, 900, function () {
      caption.textContent = line;
    });
  });

  function reset() {
    round += 1;
    extra = 0;
    grouped = false;
    slider.value = "0";
    sliderNum.textContent = "0";
    groupBtn.classList.remove("is-on");
    render(true, true);
  }

  document.getElementById("again").addEventListener("click", reset);
  reset();
})();
