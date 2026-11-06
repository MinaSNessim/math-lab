(function () {
  var S = window.Shelf;
  var mark = "";
  var token = 0;
  var fixed = ["feared", "feared", "feared", "compromise", "compromise", "favorite"];
  var base = { favorite: 1, compromise: 2, feared: 3 };
  var words = {
    favorite: "your favorite",
    compromise: "the compromise",
    feared: "the one you fear"
  };
  var labels = {
    favorite: "A",
    compromise: "B",
    feared: "C"
  };
  var tones = { favorite: "#5ec5a7", compromise: "#f5c518", feared: "#fe8e83" };
  function block(color) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="14" y="8" width="36" height="64" rx="5" fill="#ffffff" stroke="#0c1438" stroke-width="2.4"/>'
      + '<path class="tone" d="M14 13a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v9H14z" fill="' + color + '"/>'
      + '<path d="M22 36h20M22 46h20M22 56h12" fill="none" stroke="#0c1438" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
    return svg;
  }
  var wrap = S.el("div", "zones is-three");
  var zones = {};
  var zoneNames = {
    favorite: "A · you want this",
    compromise: "B · second choice",
    feared: "C · you fear this"
  };
  ["favorite", "compromise", "feared"].forEach(function (key) {
    zones[key] = S.zone(zoneNames[key]);
    wrap.appendChild(zones[key].box);
  });
  fixed.forEach(function (key) {
    var card = S.el("div", "slip");
    card.appendChild(block(tones[key]));
    var name = S.el("b");
    name.textContent = labels[key];
    card.appendChild(name);
    zones[key].body.appendChild(card);
  });
  var yours = S.el("div", "slip is-yours mover");
  yours.appendChild(block("#ffffff"));
  var yoursName = S.el("b");
  yoursName.textContent = "Your ballot";
  yours.appendChild(yoursName);
  var home = S.el("div", "folk you-home");
  home.appendChild(yours);
  var slips = document.getElementById("slips");
  slips.parentNode.insertBefore(home, slips);
  slips.parentNode.insertBefore(wrap, slips);
  slips.parentNode.removeChild(slips);

  function render(wait) {
    var counts = { favorite: base.favorite, compromise: base.compromise, feared: base.feared };
    if (mark) counts[mark] += 1;
    yoursName.textContent = mark ? labels[mark] : "Your ballot";
    yours.querySelector(".tone").setAttribute("fill", mark ? tones[mark] : "#ffffff");
    Object.keys(zones).forEach(function (key) {
      zones[key].box.classList.toggle("is-here", key === mark);
      zones[key].box.classList.toggle("is-win", key === "compromise" && mark === "compromise");
    });
    if (mark) S.send(yours, zones[mark].body);
    else S.send(yours, home);
    var prefix = mark ? "With your vote: " : "Already counted, before your vote: ";
    document.getElementById("score").textContent = prefix + "A " + counts.favorite + ", B " + counts.compromise + ", C " + counts.feared;
    var line = "You want A to win. You fear C. These stacks are everyone else's votes. Your ballot is still blank.";
    if (mark) {
      line = "You want A. You voted for " + labels[mark] + ". Totals: A " + counts.favorite + ", B " + counts.compromise + ", C " + counts.feared + ".";
      if (mark === "compromise") line += " B catches C, so C no longer wins alone.";
      else if (mark === "favorite") line += " C still wins.";
      else line += " C's lead gets larger.";
    }
    token += 1;
    var mine = token;
    if (!wait) {
      document.getElementById("caption").textContent = line;
      return;
    }
    window.setTimeout(function () {
      if (mine !== token) return;
      document.getElementById("caption").textContent = line;
    }, 1000);
  }

  document.getElementById("marks").addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    mark = button.getAttribute("data-mark");
    Array.prototype.forEach.call(document.querySelectorAll("#marks button"), function (other) {
      other.classList.toggle("is-on", other === button);
    });
    render(true);
  });
  wrap.addEventListener("click", function (event) {
    var zone = event.target.closest(".zone");
    if (!zone) return;
    var key = ["favorite", "compromise", "feared"].filter(function (name) {
      return zones[name].box === zone;
    })[0];
    if (!key || key === mark) return;
    mark = key;
    Array.prototype.forEach.call(document.querySelectorAll("#marks button"), function (other) {
      other.classList.toggle("is-on", other.getAttribute("data-mark") === key);
    });
    render(true);
  });

  document.getElementById("again").addEventListener("click", function () {
    mark = "";
    Array.prototype.forEach.call(document.querySelectorAll("#marks button"), function (other) {
      other.classList.remove("is-on");
    });
    render(false);
  });

  render(false);
})();
