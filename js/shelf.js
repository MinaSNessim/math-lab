(function (root) {
  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function button(label, cls) {
    var node = el("button", cls || "btn ghost");
    node.type = "button";
    node.textContent = label;
    return node;
  }

  function person(label) {
    var node = el("div", "one");
    var img = el("img");
    img.src = "images/person.png";
    img.alt = "";
    var name = el("b");
    name.textContent = label;
    var sub = el("span");
    node.appendChild(img);
    node.appendChild(name);
    node.appendChild(sub);
    return node;
  }

  function say(node, text, wait) {
    say.n = (say.n || 0) + 1;
    var mine = say.n;
    if (!wait) {
      node.textContent = text;
      return;
    }
    root.setTimeout(function () {
      if (mine !== say.n) return;
      node.textContent = text;
    }, 700);
  }

  function glide(node, dx, dy) {
    node.classList.add("mover");
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    if (node._glideTimer) window.clearTimeout(node._glideTimer);
    if (node._glideDone) {
      node.removeEventListener("transitionend", node._glideDone);
      node._glideDone = null;
    }
    node._glide = (node._glide || 0) + 1;
    var token = node._glide;
    var parked = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
    var settled = "translate3d(0px,0px,0)";
    node.style.willChange = "transform";
    node.style.setProperty("transition", "none", "important");
    node.style.transform = parked;
    // One painted frame at the old spot, then the stylesheet trip to the new one.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (node._glide !== token) return;
        node.style.removeProperty("transition");
        node.style.transform = settled;
        function done(event) {
          if (node._glide !== token) return;
          if (event && event.propertyName && event.propertyName !== "transform") return;
          node._glide = token + 0.5;
          node.removeEventListener("transitionend", done);
          node._glideDone = null;
          window.clearTimeout(node._glideTimer);
          var left = node.style.transform.replace(/ /g, "");
          if (left === settled || left === "translate3d(0px,0px,0px)") node.style.removeProperty("transform");
          node.style.willChange = "";
        }
        node._glideDone = done;
        node.addEventListener("transitionend", done);
        node._glideTimer = window.setTimeout(done, 1100);
      });
    });
  }

  function hop(node, parent) {
    var first = node.getBoundingClientRect();
    parent.appendChild(node);
    if (!first.width) return;
    var now = node.getBoundingClientRect();
    glide(node, first.left - now.left, first.top - now.top);
  }

  function carry(moves) {
    var starts = [];
    var n;
    var now;
    for (n = 0; n < moves.length; n += 1) starts.push(moves[n].node.getBoundingClientRect());
    for (n = 0; n < moves.length; n += 1) moves[n].dest.appendChild(moves[n].node);
    for (n = 0; n < moves.length; n += 1) {
      if (!starts[n].width) continue;
      now = moves[n].node.getBoundingClientRect();
      glide(moves[n].node, starts[n].left - now.left, starts[n].top - now.top);
    }
  }

  function coin() {
    var img = el("img", "mover");
    img.src = "images/coin-gold.png";
    img.alt = "";
    return img;
  }

  function pic(src, cls) {
    var img = el("img", cls || "");
    img.src = src;
    img.alt = "";
    return img;
  }

  function stand(node, slot, animate, top) {
    var parent = node.offsetParent || node.parentNode;
    if (!node.offsetWidth || !parent) return;
    var box = parent.getBoundingClientRect();
    var x;
    var y;
    if (!slot) {
      x = Math.max(8, (parent.clientWidth - node.offsetWidth) / 2);
      y = 8;
    } else {
      var spot = slot.getBoundingClientRect();
      x = spot.left - box.left - parent.clientLeft + (spot.width - node.offsetWidth) / 2;
      y = top
        ? spot.top - box.top - parent.clientTop + 8
        : spot.top - box.top - parent.clientTop + (spot.height - node.offsetHeight) / 2;
    }
    var end = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    if (node._goal === end) return;
    node._goal = end;
    if (!animate) node.style.setProperty("transition", "none", "important");
    node.style.transform = end;
    if (!animate) {
      void node.offsetWidth;
      node.style.removeProperty("transition");
    }
  }

  function zone(label) {
    var box = el("div", "zone");
    var name = el("b");
    name.textContent = label;
    var body = el("div", "folk");
    box.appendChild(name);
    box.appendChild(body);
    return { box: box, name: name, body: body };
  }

  function send(node, dest) {
    if (!node || !dest || node.parentNode === dest) return;
    hop(node, dest);
  }

  function split(hereLabel, awayLabel) {
    var wrap = el("div", "zones");
    var hereZone = el("div", "zone");
    var awayZone = el("div", "zone");
    var hereName = el("b");
    var awayName = el("b");
    hereName.textContent = hereLabel;
    awayName.textContent = awayLabel;
    var here = el("div", "folk");
    var away = el("div", "folk");
    hereZone.appendChild(hereName);
    hereZone.appendChild(here);
    awayZone.appendChild(awayName);
    awayZone.appendChild(away);
    wrap.appendChild(hereZone);
    wrap.appendChild(awayZone);
    return { wrap: wrap, here: here, away: away, hereZone: hereZone, awayZone: awayZone };
  }

  function chart(rows) {
    var box = el("div", "result-chart");
    var built = [];
    function paint(next) {
      next = next || [];
      var max = 1;
      var i;
      var same = built.length === next.length;
      for (i = 0; i < next.length; i += 1) {
        if (next[i].value > max) max = next[i].value;
        if (next[i].scale > max) max = next[i].scale;
      }
      if (!same) {
        while (box.firstChild) box.removeChild(box.firstChild);
        built = [];
        for (i = 0; i < next.length; i += 1) {
          var line = el("div", "result-row");
          var name = el("span");
          var track = el("div", "track");
          var fill = el("div", "fill");
          var num = el("b");
          fill.style.width = "0%";
          track.appendChild(fill);
          line.appendChild(name);
          line.appendChild(track);
          line.appendChild(num);
          box.appendChild(line);
          built.push({ name: name, fill: fill, num: num });
        }
      }
      next.forEach(function (row, index) {
        var item = built[index];
        var pct = Math.round((100 * Math.max(0, row.value)) / max);
        item.name.textContent = row.label;
        item.num.textContent = row.text != null ? row.text : String(row.value);
        item.fill.className = "fill" + (row.hot ? " coral" : "");
        item.fill.dataset.goal = pct + "%";
      });
      var generation = (box._bars || 0) + 1;
      box._bars = generation;
      function applyWidth() {
        if (box._bars !== generation) return;
        built.forEach(function (item) { item.fill.style.width = item.fill.dataset.goal; });
      }
      if (same) applyWidth();
      else {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(applyWidth);
        });
      }
    }
    paint(rows || []);
    return { box: box, set: paint };
  }

  root.Shelf = {
    el: el,
    button: button,
    person: person,
    say: say,
    hop: hop,
    carry: carry,
    glide: glide,
    coin: coin,
    pic: pic,
    stand: stand,
    split: split,
    zone: zone,
    send: send,
    chart: chart
  };
})(window);
