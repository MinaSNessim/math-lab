(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var PW = 96;

  function figure(color) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 174 278");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="24" y="120" width="126" height="84" rx="30" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="52" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<rect x="94" y="190" width="28" height="72" rx="12" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<circle cx="87" cy="78" r="58" fill="' + color + '" stroke="' + INK + '" stroke-width="8"/>'
      + '<path d="M38 72C58 44 86 40 124 62" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>'
      + '<circle cx="64" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<circle cx="110" cy="82" r="6.5" fill="' + INK + '"/>'
      + '<path d="M72 104Q87 118 102 104" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>';
    return svg;
  }

  function person(color, name) {
    var box = S.el("div", "talk-person game-person");
    box.appendChild(figure(color));
    var title = S.el("b");
    title.textContent = name;
    var tag = S.el("span", "game-tag");
    box.appendChild(title);
    box.appendChild(tag);
    return { box: box, tag: tag };
  }

  function pad(fill, word, cls) {
    var wrap = S.el("div", "talk-pad " + cls);
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 200 70");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="8" y="10" width="184" height="50" rx="16" fill="' + fill + '" stroke="' + YELLOW + '" stroke-width="8"/>'
      + '<text x="100" y="43" text-anchor="middle" font-family="Nunito, Segoe UI, sans-serif" font-size="20" font-weight="800" fill="' + INK + '">' + word + '</text>';
    wrap.appendChild(svg);
    return wrap;
  }

  var scene = S.el("div", "talk-scene");
  var you = person(GREEN, "You");
  var them = person(RED, "The other person");
  var bubble = S.el("div", "talk-bubble");
  var bubbleText = S.el("b");
  bubble.appendChild(bubbleText);
  scene.appendChild(pad(GREEN, "Left", "talk-pad-l"));
  scene.appendChild(pad(RED, "Right", "talk-pad-r"));
  scene.appendChild(you.box);
  scene.appendChild(them.box);
  scene.appendChild(bubble);

  var caption = S.el("p", "caption");
  caption.id = "caption";

  function row(label) {
    var line = S.el("div", "controls game-row");
    var who = S.el("span", "who");
    who.textContent = label;
    line.appendChild(who);
    return line;
  }

  function btn(label) {
    var node = S.button(label, "btn");
    node.setAttribute("data-pace", "900");
    return node;
  }

  var alignBtn = btn("Interests aligned");
  var opposeBtn = btn("Interests opposed");
  var sayL = btn("I will choose Left");
  var sayR = btn("I will choose Right");
  var goL = btn("Left");
  var goR = btn("Right");
  var interestRow = row("Interests");
  interestRow.appendChild(alignBtn);
  interestRow.appendChild(opposeBtn);
  var messageRow = row("Your message");
  messageRow.appendChild(sayL);
  messageRow.appendChild(sayR);
  var actionRow = row("Your action");
  actionRow.appendChild(goL);
  actionRow.appendChild(goR);

  board.appendChild(scene);
  board.appendChild(caption);
  board.appendChild(interestRow);
  board.appendChild(messageRow);
  board.appendChild(actionRow);

  var aligned = true;
  var message = "";
  var youSide = "";
  var round = 0;

  function sideWord(side) {
    return side === "L" ? "Left" : "Right";
  }

  function otherSide() {
    if (!message || !youSide) return "";
    if (aligned) return message;
    return message === "L" ? "R" : "L";
  }

  function originYou() {
    return Math.round((scene.clientWidth || 640) * 0.16);
  }

  function originThem() {
    return Math.round((scene.clientWidth || 640) * 0.62);
  }

  function targetX(side, who) {
    var w = scene.clientWidth || 640;
    var padLeft = side === "L" ? w * 0.04 : w * 0.58;
    var center = padLeft + w * 0.38 / 2 - PW / 2;
    var theirs = otherSide();
    if (youSide && theirs && youSide === theirs) {
      return Math.round(center + (who === "you" ? -30 : 30));
    }
    return Math.round(center);
  }

  function release(list) {
    void scene.offsetWidth;
    var i;
    for (i = 0; i < list.length; i += 1) list[i].style.removeProperty("transition");
  }

  function paint(doSnap) {
    var theirs = otherSide();
    var nodes = [you.box, them.box, bubble];
    var i;
    you.box.style.left = originYou() + "px";
    them.box.style.left = originThem() + "px";
    if (doSnap) {
      for (i = 0; i < nodes.length; i += 1) nodes[i].style.setProperty("transition", "none", "important");
    }
    you.box.style.transform = "translate(" + (youSide ? targetX(youSide, "you") - originYou() : 0) + "px," + (youSide ? 102 : 0) + "px)";
    them.box.style.transform = "translate(" + (theirs ? targetX(theirs, "them") - originThem() : 0) + "px," + (theirs ? 102 : 0) + "px)";
    you.tag.textContent = youSide ? sideWord(youSide) : "";
    them.tag.textContent = theirs ? sideWord(theirs) : "";
    alignBtn.classList.toggle("is-on", aligned);
    opposeBtn.classList.toggle("is-on", !aligned);
    sayL.classList.toggle("is-on", message === "L");
    sayR.classList.toggle("is-on", message === "R");
    goL.classList.toggle("is-on", youSide === "L");
    goR.classList.toggle("is-on", youSide === "R");
    bubble.classList.toggle("is-on", !!message);
    bubble.classList.toggle("is-ignored", !!message && !aligned && !!youSide);
    bubbleText.textContent = message ? "I will choose " + sideWord(message) : "";
    if (doSnap) release(nodes);
  }

  function line() {
    var said;
    var mine;
    var theirs;
    if (!message && !youSide) {
      return aligned
        ? "Interests are aligned. You both want the same side."
        : "Interests are opposed. Saying a side does not bind either of you.";
    }
    if (!youSide) return "You say: I will choose " + sideWord(message) + ". Now choose your action.";
    said = sideWord(message);
    mine = sideWord(youSide);
    theirs = sideWord(otherSide());
    if (aligned && youSide === message) {
      return "You said " + said + " and chose " + mine + ". They chose " + theirs + ". The message brought you to the same side.";
    }
    if (aligned) {
      return "You said " + said + ", then chose " + mine + ". They went to " + theirs + ", the side in the message. You do not meet.";
    }
    return "You said " + said + " and chose " + mine + ". They chose " + theirs + ". They did not follow the message.";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = line();
    paint(doSnap);
    if (doSnap) caption.textContent = text;
    else {
      window.setTimeout(function () {
        if (mine !== round) return;
        caption.textContent = text;
      }, 900);
    }
  }

  function moving() {
    return !!(message && youSide);
  }

  alignBtn.addEventListener("click", function () {
    aligned = true;
    alignBtn.setAttribute("data-pace", moving() ? "900" : "0");
    show(!moving());
  });
  opposeBtn.addEventListener("click", function () {
    aligned = false;
    opposeBtn.setAttribute("data-pace", moving() ? "900" : "0");
    show(!moving());
  });
  sayL.addEventListener("click", function () {
    message = "L";
    show(false);
  });
  sayR.addEventListener("click", function () {
    message = "R";
    show(false);
  });
  goL.addEventListener("click", function () {
    if (!message) {
      goL.setAttribute("data-pace", "0");
      caption.textContent = "Send a message before you choose.";
      return;
    }
    goL.setAttribute("data-pace", "900");
    youSide = "L";
    show(false);
  });
  goR.addEventListener("click", function () {
    if (!message) {
      goR.setAttribute("data-pace", "0");
      caption.textContent = "Send a message before you choose.";
      return;
    }
    goR.setAttribute("data-pace", "900");
    youSide = "R";
    show(false);
  });

  document.getElementById("again").addEventListener("click", function () {
    aligned = true;
    message = "";
    youSide = "";
    show(true);
  });

  window.addEventListener("resize", function () { paint(true); });
  show(true);
})();
