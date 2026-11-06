/* Opened lessons stay in localStorage. The home cards are the full list. */
(function () {
  var SEEN = "gym-seen";
  var CATALOG = "gym-catalog";
  var FALLBACK = [
  "monty-hall.html",
  "birthday.html",
  "base-rate.html",
  "boy-girl.html",
  "streaks.html",
  "bertrand-box.html",
  "conjunction.html",
  "two-envelopes.html",
  "sleeping-beauty.html",
  "bertrand.html",
  "parrondo.html",
  "benford.html",
  "bayes.html",
  "hindsight.html",
  "missing-square.html",
  "one-equals-two.html",
  "inspection.html",
  "friendship.html",
  "berkson.html",
  "survivorship.html",
  "missing.html",
  "line.html",
  "matthew.html",
  "simpson.html",
  "lord.html",
  "ecological.html",
  "fair-rule.html",
  "horn.html",
  "dilemma.html",
  "chicken.html",
  "stag.html",
  "nash.html",
  "mixed.html",
  "coordination.html",
  "battle.html",
  "pennies.html",
  "iterated.html",
  "cheap-talk.html",
  "commons.html",
  "volunteer.html",
  "braess.html",
  "abilene.html",
  "ultimatum.html",
  "trust.html",
  "cake.html",
  "condorcet.html",
  "arrow.html",
  "borda.html",
  "strategic.html",
  "ostrogorski.html",
  "anscombe.html",
  "jury.html",
  "allais.html",
  "ellsberg.html",
  "sunk.html",
  "moral-hazard.html",
  "pascal.html",
  "newcomb.html",
  "trolley.html",
  "explore.html",
  "secretary.html",
  "hanging.html",
  "generals.html",
  "islanders.html",
  "knights.html",
  "theseus.html",
  "sorites.html",
  "liar.html",
  "russell.html",
  "coast.html",
  "banach.html",
  "reverse.html",
  "intervention.html",
  "ice-cream.html"
  ];

  function fileOf(href) {
    if (!href) return "";
    var clean = String(href).split("#")[0].split("?")[0];
    var name = clean.split("/").pop() || "";
    try { name = decodeURIComponent(name); } catch (err) {}
    return name.toLowerCase();
  }

  function pageFile() {
    var name = fileOf(window.location.pathname || "");
    if (!name || name.indexOf(".") === -1) return "index.html";
    return name;
  }

  function readList(key) {
    try {
      var raw = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(raw)) return [];
      var out = [];
      var i;
      for (i = 0; i < raw.length; i += 1) {
        var name = fileOf(raw[i]);
        if (name && out.indexOf(name) === -1) out.push(name);
      }
      return out;
    } catch (err) {
      return [];
    }
  }

  function writeList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (err) {}
  }

  function cards() {
    return Array.prototype.slice.call(document.querySelectorAll(".shelf .card"));
  }

  function fromCards() {
    var names = [];
    cards().forEach(function (card) {
      var link = card.querySelector("a.go");
      var name = link ? fileOf(link.getAttribute("href")) : "";
      if (name && names.indexOf(name) === -1) names.push(name);
    });
    return names;
  }

  function catalog() {
    var live = fromCards();
    if (live.length) {
      writeList(CATALOG, live);
      return live;
    }
    var saved = readList(CATALOG);
    if (saved.length) return saved;
    return FALLBACK.slice();
  }

  function seenNow() {
    var list = readList(SEEN);
    if (!document.querySelector("article.lesson")) return list;
    var here = pageFile();
    if (!here || here === "index.html") return list;
    if (list.indexOf(here) === -1) {
      list.push(here);
      writeList(SEEN, list);
    }
    return list;
  }

  function paint() {
    show(seenNow());
  }

  function show(seen) {
    var names = catalog();
    var viewed = 0;
    var i;
    for (i = 0; i < names.length; i += 1) {
      if (seen.indexOf(names[i]) !== -1) viewed += 1;
    }
    var left = names.length - viewed;
    var node = document.getElementById("progress");
    if (!node) {
      var header = document.querySelector("header.top");
      if (!header || !header.parentNode) return;
      node = document.createElement("div");
      node.id = "progress";
      node.className = "progress";
      var text = document.createElement("p");
      text.className = "progress-text";
      var bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.setAttribute("aria-hidden", "true");
      bar.appendChild(document.createElement("i"));
      node.appendChild(text);
      node.appendChild(bar);
      header.parentNode.insertBefore(node, header.nextSibling);
    }
    var done = names.length > 0 && left === 0;
    var label = node.querySelector(".progress-text");
    var fill = node.querySelector(".progress-bar i");
    var bits = node.querySelector(".progress-bits");
    node.classList.toggle("is-done", done);
    if (done && !bits) {
      bits = document.createElement("span");
      bits.className = "progress-bits";
      bits.setAttribute("aria-hidden", "true");
      bits.appendChild(document.createElement("i"));
      bits.appendChild(document.createElement("i"));
      bits.appendChild(document.createElement("i"));
      node.insertBefore(bits, node.firstChild);
    } else if (!done && bits) {
      bits.parentNode.removeChild(bits);
    }
    if (label) {
      label.textContent = done
        ? "Congratulations. You played all " + names.length + "."
        : viewed + " viewed \u00b7 " + left + " remaining";
    }
    if (fill) fill.style.width = names.length ? Math.round((100 * viewed) / names.length) + "%" : "0%";
    cards().forEach(function (card) {
      var link = card.querySelector("a.go");
      var name = link ? fileOf(link.getAttribute("href")) : "";
      var on = !!name && seen.indexOf(name) !== -1;
      card.classList.toggle("is-seen", on);
      if (on) card.setAttribute("title", "Done");
      else card.removeAttribute("title");
    });
    var pop = document.getElementById("card-pop");
    if (pop) pop.classList.remove("is-seen");
    if (!node.querySelector(".progress-reset")) {
      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "progress-reset";
      reset.textContent = "Reset";
      reset.setAttribute("aria-label", "Reset progress");
      reset.addEventListener("click", function () {
        writeList(SEEN, []);
        show([]);
      });
      node.appendChild(reset);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
