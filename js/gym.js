(function () {
  var query = document.getElementById("q");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".shelf .card"));
  var tagButtons = Array.prototype.slice.call(document.querySelectorAll(".tags button"));
  var empty = document.getElementById("empty");
  var tag = "";

  function apply() {
    var words = query.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var hay = card.getAttribute("data-text");
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var okTag = !tag || tags.indexOf(tag) !== -1;
      var okText = !words || hay.indexOf(words) !== -1;
      var visible = okTag && okText;
      card.classList.toggle("is-hidden", !visible);
      if (visible) shown += 1;
    });
    document.querySelectorAll(".shelf").forEach(function (shelf) {
      shelf.classList.toggle("is-hidden", !shelf.querySelector(".card:not(.is-hidden)"));
    });
    empty.hidden = shown !== 0;
    if (source && source.classList.contains("is-hidden")) hidePop();
    var params = new URLSearchParams();
    if (words) params.set("q", words);
    if (tag) params.set("tag", tag);
    var search = params.toString();
    var nextUrl = window.location.pathname + (search ? "?" + search : "") + window.location.hash;
    var here = window.location.pathname + window.location.search + window.location.hash;
    if (nextUrl !== here) {
      try { window.history.replaceState(null, "", nextUrl); } catch (err) {}
    }
  }

  function readLink() {
    var params = new URLSearchParams(window.location.search);
    var words = params.get("q") || "";
    var next = params.get("tag") || "";
    var known = false;
    tagButtons.forEach(function (item) {
      if (item.getAttribute("data-tag") === next) known = true;
    });
    query.value = words;
    tag = known ? next : "";
    tagButtons.forEach(function (item) {
      item.classList.toggle("is-on", item.getAttribute("data-tag") === tag);
    });
    if (tag) setFiltersOpen(true);
    apply();
  }

  tagButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var next = button.getAttribute("data-tag");
      tag = tag === next ? "" : next;
      tagButtons.forEach(function (item) {
        item.classList.toggle("is-on", item.getAttribute("data-tag") === tag);
      });
      apply();
    });
  });

  query.addEventListener("input", apply);

  var filterBtn = document.getElementById("filter-btn");
  var filters = document.getElementById("filters");

  function setFiltersOpen(open) {
    filters.hidden = !open;
    filterBtn.setAttribute("aria-expanded", open ? "true" : "false");
    filterBtn.setAttribute("aria-label", open ? "Hide filters" : "Show filters");
  }

  filterBtn.addEventListener("click", function () {
    setFiltersOpen(filters.hidden);
  });

  var fullBtn = document.getElementById("view-full");
  var smallBtn = document.getElementById("view-compact");
  var pop = document.getElementById("card-pop");
  var source = null;
  var pinned = false;
  var hideTimer = null;

  function compactOn() {
    return document.documentElement.classList.contains("is-compact");
  }

  function placePop(card) {
    var margin = 12;
    var gap = 12;
    var rect = card.getBoundingClientRect();
    var width = pop.offsetWidth;
    var height = pop.offsetHeight;
    var left = rect.right + gap;
    if (left + width > window.innerWidth - margin) left = rect.left - gap - width;
    if (left < margin) left = Math.min(Math.max(margin, rect.left), window.innerWidth - margin - width);
    if (left < margin) left = margin;
    var top = rect.top;
    if (top + height > window.innerHeight - margin) top = window.innerHeight - margin - height;
    if (top < margin) top = margin;
    pop.style.left = Math.round(left) + "px";
    pop.style.top = Math.round(top) + "px";
  }

  function hidePop() {
    clearTimeout(hideTimer);
    pinned = false;
    pop.hidden = true;
    pop.innerHTML = "";
    pop.classList.remove("is-seen");
    if (source) source.classList.remove("is-hot");
    source = null;
  }

  function showPop(card, pin) {
    if (!compactOn() || card.classList.contains("is-hidden")) return;
    clearTimeout(hideTimer);
    if (source !== card) pinned = false;
    if (pin) pinned = true;
    if (source !== card) {
      if (source) source.classList.remove("is-hot");
      source = card;
      pop.innerHTML = card.innerHTML;
    }
    source.classList.add("is-hot");
    pop.classList.toggle("is-seen", card.classList.contains("is-seen"));
    pop.hidden = false;
    placePop(card);
  }

  function scheduleHide() {
    if (pinned) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePop, 160);
  }

  function setView(mode) {
    var small = mode === "small";
    document.documentElement.classList.toggle("is-compact", small);
    fullBtn.setAttribute("aria-pressed", small ? "false" : "true");
    smallBtn.setAttribute("aria-pressed", small ? "true" : "false");
    cards.forEach(function (card) {
      if (small) card.setAttribute("tabindex", "0");
      else card.removeAttribute("tabindex");
    });
    if (!small) hidePop();
    try { localStorage.setItem("gym-cards", small ? "small" : "full"); } catch (err) {}
  }

  fullBtn.addEventListener("click", function () { setView("full"); });
  smallBtn.addEventListener("click", function () { setView("small"); });
  setView(compactOn() ? "small" : "full");

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () { showPop(card, false); });
    card.addEventListener("mouseleave", scheduleHide);
    card.addEventListener("focus", function () { showPop(card, false); });
    card.addEventListener("click", function () {
      if (!compactOn()) return;
      if (source === card && pinned) hidePop();
      else showPop(card, true);
    });
    card.addEventListener("keydown", function (event) {
      if (!compactOn()) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      var link = card.querySelector("a");
      if (!link) return;
      event.preventDefault();
      window.location.href = link.getAttribute("href");
    });
  });

  pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  pop.addEventListener("mouseleave", scheduleHide);

  document.addEventListener("click", function (event) {
    if (pop.hidden) return;
    if (pop.contains(event.target)) return;
    if (source && source.contains(event.target)) return;
    hidePop();
  });

  var howBtn = document.getElementById("nav-how");
  var aboutBtn = document.getElementById("nav-about");
  var howPanel = document.getElementById("panel-how");
  var aboutPanel = document.getElementById("panel-about");

  function setPanel(which) {
    var howOpen = which === "how";
    var aboutOpen = which === "about";
    if (howPanel) howPanel.hidden = !howOpen;
    if (aboutPanel) aboutPanel.hidden = !aboutOpen;
    if (howBtn) howBtn.setAttribute("aria-expanded", howOpen ? "true" : "false");
    if (aboutBtn) aboutBtn.setAttribute("aria-expanded", aboutOpen ? "true" : "false");
  }

  if (howBtn && aboutBtn) {
    howBtn.addEventListener("click", function () {
      setPanel(howBtn.getAttribute("aria-expanded") === "true" ? "" : "how");
    });
    aboutBtn.addEventListener("click", function () {
      setPanel(aboutBtn.getAttribute("aria-expanded") === "true" ? "" : "about");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hidePop();
      setPanel("");
    }
  });

  window.addEventListener("scroll", function () {
    if (!pop.hidden && source) placePop(source);
  }, true);
  window.addEventListener("resize", function () {
    if (!pop.hidden && source) placePop(source);
  });

  readLink();
})();
