(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var folk = S.el("div", "folk");
  var paths = ["Left path", "Middle path", "Right path"].map(function (label) {
    var one = S.person(label);
    one.querySelector("img").src = "images/maze.png";
    folk.appendChild(one);
    return one;
  });
  var walker = S.pic("images/boy.png", "walker mover");
  walker.style.height = "40px";
  var row = S.el("div", "controls");
  paths.forEach(function (_, index) {
    var button = S.button(["Lock the left path", "Lock the middle path", "Lock the right path"][index]);
    button.setAttribute("data-i", String(index));
    row.appendChild(button);
  });
  var reveal = S.button("Show this page's exit", "btn");
  reveal.disabled = true;
  row.appendChild(reveal);
  var nowRow = S.el("div", "controls");
  nowRow.hidden = true;
  ["I would now say the left path", "I would now say the middle path", "I would now say the right path"].forEach(function (label, index) {
    var button = S.button(label);
    button.setAttribute("data-now", String(index));
    nowRow.appendChild(button);
  });
  var lockedLine = S.el("p", "pile-count");
  var nowLine = S.el("p", "pile-count");
  lockedLine.hidden = true;
  nowLine.hidden = true;
  var caption = S.el("p", "caption");
  var locked = null;
  var revealed = false;
  var names = ["left", "middle", "right"];
  board.appendChild(folk);
  board.appendChild(walker);
  board.appendChild(row);
  board.appendChild(nowRow);
  board.appendChild(lockedLine);
  board.appendChild(nowLine);
  board.appendChild(caption);
  caption.textContent = "Three paths are open. Lock a path before the exit is shown.";

  function move(slot, done) {
    var picture = slot.querySelector("img") || slot;
    var b = board.getBoundingClientRect();
    var s = picture.getBoundingClientRect();
    var x = s.left - b.left - board.clientLeft + (s.width - walker.offsetWidth) / 2;
    var y = s.top - b.top - board.clientTop + (s.height - walker.offsetHeight) / 2;
    walker.classList.add("is-set");
    walker.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    window.setTimeout(done, 700);
  }

  var booted = false;
  function boot() {
    if (booted || !walker.naturalWidth) return;
    booted = true;
    walker.style.setProperty("transition", "none", "important");
    move(paths[1], function () {
      walker.style.removeProperty("transition");
    });
  }
  walker.addEventListener("load", boot);
  boot();

  row.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || revealed) return;
    if (button === reveal) {
      if (locked === null) return;
      revealed = true;
      reveal.disabled = true;
      paths[2].querySelector("span").textContent = "This page's exit";
      paths.forEach(function (path, i) {
        path.classList.toggle("is-dim", i !== locked && i !== 2);
      });
      lockedLine.hidden = false;
      lockedLine.textContent = "You locked the " + names[locked] + " path.";
      nowRow.hidden = false;
      S.say(caption, "This page's exit is the right path. You locked the " + names[locked] + " path.", false);
      return;
    }
    if (button.getAttribute("data-i") == null) return;
    var index = Number(button.getAttribute("data-i"));
    locked = index;
    reveal.disabled = false;
    Array.prototype.forEach.call(row.children, function (other) {
      if (other.getAttribute("data-i") != null) other.classList.toggle("is-on", other === button);
    });
    paths.forEach(function (path, i) {
      path.classList.toggle("is-dim", i !== index);
      if (i !== 2) path.querySelector("span").textContent = ["Left path", "Middle path", "Right path"][i];
    });
    move(paths[index], function () {
      S.say(caption, "You locked the " + names[index] + " path. The exit is still covered.", false);
    });
  });

  nowRow.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || !revealed) return;
    var index = Number(button.getAttribute("data-now"));
    Array.prototype.forEach.call(nowRow.children, function (other) {
      other.classList.toggle("is-on", other === button);
    });
    lockedLine.hidden = false;
    nowLine.hidden = false;
    lockedLine.textContent = "You locked the " + names[locked] + " path.";
    nowLine.textContent = "You now say the " + names[index] + " path.";
    caption.textContent = "You locked the " + names[locked] + " path. You now say the " + names[index] + " path.";
  });
  document.getElementById("again").addEventListener("click", function () {
    locked = null;
    revealed = false;
    reveal.disabled = true;
    nowRow.hidden = true;
    lockedLine.hidden = true;
    nowLine.hidden = true;
    lockedLine.textContent = "";
    nowLine.textContent = "";
    Array.prototype.forEach.call(row.children, function (other) { other.classList.remove("is-on"); });
    Array.prototype.forEach.call(nowRow.children, function (other) { other.classList.remove("is-on"); });
    paths.forEach(function (path, i) {
      path.classList.remove("is-dim");
      path.querySelector("span").textContent = ["Left path", "Middle path", "Right path"][i];
    });
    caption.textContent = "Three paths are open. Lock a path before the exit is shown.";
    move(paths[1], function () {});
  });
})();
