/* One question, then one sentence after a move. The name comes last. */
(function () {
  var article = document.querySelector("article.lesson");
  if (!article || article.querySelector(".notes.read")) return;
  var ask = article.getAttribute("data-ask");
  var title = article.querySelector("h1");
  if (!ask || !title) return;

  var name = title.textContent;
  var stage = article.querySelector(".stage");
  var sources = [];
  var nodes = article.querySelectorAll(".notes > p");
  var i;
  for (i = 0; i < nodes.length; i += 1) {
    if (nodes[i].querySelector("svg, button, input")) continue;
    nodes[i].classList.add("beat-source");
    sources.push(nodes[i]);
  }

  var bar = document.createElement("div");
  bar.className = "beat-bar";
  bar.setAttribute("aria-hidden", "true");
  var fill = document.createElement("i");
  bar.appendChild(fill);

  var card = document.createElement("div");
  card.className = "beat-card";
  card.hidden = true;
  card.setAttribute("aria-live", "polite");
  var line = document.createElement("p");
  var next = document.createElement("button");
  next.type = "button";
  next.className = "btn coral";
  next.textContent = "Continue";
  card.appendChild(line);
  card.appendChild(next);

  article.classList.add("is-beat");
  title.textContent = ask;
  var again = article.querySelector(".play-again");
  if (again) {
    var top = document.createElement("div");
    top.className = "beat-top";
    top.appendChild(bar);
    top.appendChild(again);
    article.insertBefore(top, article.firstChild);
  } else {
    article.insertBefore(bar, article.firstChild);
  }
  if (stage && stage.parentNode === article) stage.parentNode.insertBefore(card, stage.nextSibling);
  else article.appendChild(card);

  var phase = "ask";
  var shown = null;
  var seen = [];
  var timer = 0;
  var pending = null;

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function lockState() {
    var hidden = 0;
    var open = 0;
    var n;
    for (n = 0; n < sources.length; n += 1) {
      if (!sources[n].classList.contains("spoiler")) continue;
      if (sources[n].hidden) hidden += 1;
      else open += 1;
    }
    return { hidden: hidden, open: open };
  }

  function waitingOnLock() {
    var state = lockState();
    return state.hidden > 0 && state.open === 0;
  }

  function openNotes() {
    var spoilers = [];
    var plain = [];
    var n;
    for (n = 0; n < sources.length; n += 1) {
      if (sources[n].hidden) continue;
      if (sources[n].classList.contains("spoiler")) spoilers.push(sources[n]);
      else plain.push(sources[n]);
    }
    if (waitingOnLock()) return plain;
    if (spoilers.length) return spoilers.concat(plain);
    return plain;
  }

  function place() {
    // Lines already read, then the name. Source order would jump the bar when a locked line sits in between.
    var total = sources.length + 1;
    var pos = seen.length;
    if (phase === "name") pos = total;
    if (phase === "ask") pos = 0;
    fill.style.width = (total ? Math.round((100 * pos) / total) : 0) + "%";
  }

  function nextUnseen() {
    var open = openNotes();
    var n;
    for (n = 0; n < open.length; n += 1) {
      if (seen.indexOf(open[n]) < 0) return open[n];
    }
    if (!waitingOnLock()) return "name";
    return null;
  }

  function showNote(item, quiet) {
    phase = "note";
    shown = item;
    if (seen.indexOf(item) < 0) seen.push(item);
    title.textContent = ask;
    line.innerHTML = item.innerHTML;
    card.hidden = false;
    next.hidden = !nextUnseen();
    place();
    if (!quiet) bringCard();
  }

  function showName() {
    phase = "name";
    shown = null;
    title.textContent = ask;
    line.innerHTML = "The name for this is <b>" + escapeHtml(name) + "</b>.";
    card.hidden = false;
    next.hidden = true;
    place();
    bringCard();
  }

  function bringCard() {
    if (!card.scrollIntoView) return;
    try { card.scrollIntoView({ block: "nearest" }); }
    catch (err) { card.scrollIntoView(false); }
  }

  function resetAsk() {
    phase = "ask";
    shown = null;
    seen = [];
    title.textContent = ask;
    card.hidden = true;
    place();
  }

  function replay() {
    window.clearTimeout(timer);
    timer = 0;
    pending = null;
    resetAsk();
    var fresh = openNotes();
    if (fresh.length) showNote(fresh[0], true);
  }

  function afterAction(preferred) {
    var open = openNotes();
    if (preferred && !preferred.hidden && open.indexOf(preferred) !== -1) {
      showNote(preferred);
      return;
    }
    if (phase !== "ask") return;
    if (open.length) showNote(open[0]);
    else if (!waitingOnLock()) showName();
  }

  function schedule(preferred, wait) {
    if (preferred) pending = preferred;
    window.clearTimeout(timer);
    var delay = 900;
    if (typeof wait === "number" && wait >= 0) delay = wait;
    timer = window.setTimeout(function () {
      var want = pending;
      pending = null;
      timer = 0;
      afterAction(want);
    }, delay);
  }

  function paceOf(node) {
    while (node && node !== article) {
      if (node.getAttribute && node.getAttribute("data-pace") != null) {
        var n = parseInt(node.getAttribute("data-pace"), 10);
        if (!isNaN(n) && n >= 0) return n;
      }
      node = node.parentNode;
    }
    return 900;
  }

  function matchButton(node) {
    var label = "";
    while (node && node !== article) {
      if (node.tagName === "BUTTON") {
        label = node.textContent || "";
        break;
      }
      node = node.parentNode;
    }
    if (!label) return null;
    var n;
    for (n = 0; n < sources.length; n += 1) {
      var key = sources[n].getAttribute("data-act");
      if (key && label.indexOf(key) !== -1) return sources[n];
    }
    return null;
  }

  function inNotes(node) {
    while (node && node !== article) {
      if (node.classList && node.classList.contains("notes")) return true;
      node = node.parentNode;
    }
    return false;
  }

  next.addEventListener("click", function () {
    var step = nextUnseen();
    if (!step) return;
    if (step === "name") showName();
    else showNote(step);
  });

  function isReplay(node) {
    while (node && node !== article) {
      if (node.classList && node.classList.contains("play-again")) return true;
      node = node.parentNode;
    }
    return false;
  }

  if (again) {
    again.addEventListener("click", function () {
      replay();
    });
  }

  if (stage) {
    stage.addEventListener("click", function (event) {
      if (event.target === stage) return;
      if (isReplay(event.target)) {
        replay();
        return;
      }
      schedule(matchButton(event.target), paceOf(event.target));
    });
    stage.addEventListener("input", function () { schedule(null); });
    stage.addEventListener("change", function () { schedule(null); });
  }

  article.addEventListener("click", function (event) {
    if (card.contains(event.target)) return;
    if (stage && stage.contains(event.target)) return;
    if (inNotes(event.target)) schedule(matchButton(event.target));
  });
  article.addEventListener("input", function (event) {
    if (stage && stage.contains(event.target)) return;
    if (inNotes(event.target)) schedule(null);
  });

  if (window.MutationObserver && sources.length) {
    var observer = new MutationObserver(function () {
      if (shown && shown.hidden) resetAsk();
      var state = lockState();
      if (state.open > 0 && (phase !== "note" || !shown || !shown.classList.contains("spoiler"))) {
        var open = openNotes();
        var n;
        for (n = 0; n < open.length; n += 1) {
          if (open[n].classList.contains("spoiler")) {
            schedule(open[n]);
            return;
          }
        }
      }
    });
    for (i = 0; i < sources.length; i += 1) {
      observer.observe(sources[i], { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  var opening = openNotes();
  if (opening.length) showNote(opening[0], true);
  else place();
})();
