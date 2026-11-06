(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var GREEN = "#5ec5a7";
  var RED = "#fe8e83";
  var YELLOW = "#f5c518";
  var INK = "#0c1438";
  var SVG = "http://www.w3.org/2000/svg";
  var AXIS = 150;

  function volume(end) {
    return Math.PI * (1 - 1 / end);
  }

  function surface(end) {
    var steps = 400;
    var width = (end - 1) / steps;
    var sum = 0;
    var i;
    var x;
    for (i = 0; i < steps; i += 1) {
      x = 1 + (i + 0.5) * width;
      sum += (1 / x) * Math.sqrt(1 + 1 / (x * x * x * x));
    }
    return 2 * Math.PI * sum * width;
  }

  function num(value) {
    return (Math.round(value * 100) / 100).toFixed(2);
  }

  function samples(end) {
    var pts = [];
    var steps = 48;
    var i;
    var t;
    var x;
    for (i = 0; i <= steps; i += 1) {
      t = i / steps;
      x = 1 + (end - 1) * t;
      pts.push({ x: 78 + t * 540, rad: 96 / x });
    }
    return pts;
  }

  function hornPath(end) {
    var pts = samples(end);
    var d = "M " + pts[0].x + " " + (AXIS - pts[0].rad);
    var i;
    for (i = 1; i < pts.length; i += 1) d += " L " + pts[i].x + " " + (AXIS - pts[i].rad);
    for (i = pts.length - 1; i >= 0; i -= 1) d += " L " + pts[i].x + " " + (AXIS + pts[i].rad);
    return d + " Z";
  }

  function coatPath(end) {
    var pts = samples(end);
    var d = "M " + pts[0].x + " " + (AXIS - pts[0].rad - 8);
    var i;
    for (i = 1; i < pts.length; i += 1) d += " L " + pts[i].x + " " + (AXIS - pts[i].rad - 8);
    return d;
  }

  var scene = S.el("div", "gabe-scene");
  var picture = document.createElementNS(SVG, "svg");
  picture.setAttribute("class", "gabe-picture");
  picture.setAttribute("viewBox", "0 0 680 280");
  picture.setAttribute("role", "img");
  picture.setAttribute("aria-label", "The curve y = 1/x, rotated into a horn.");
  var horn = document.createElementNS(SVG, "g");
  horn.setAttribute("class", "gabe-horn");
  var body = document.createElementNS(SVG, "path");
  body.setAttribute("class", "gabe-body");
  body.setAttribute("fill", GREEN);
  body.setAttribute("stroke", GREEN);
  var rim = document.createElementNS(SVG, "ellipse");
  rim.setAttribute("class", "gabe-rim");
  rim.setAttribute("cx", "78");
  rim.setAttribute("cy", String(AXIS));
  rim.setAttribute("rx", "16");
  rim.setAttribute("ry", "104");
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", YELLOW);
  rim.setAttribute("stroke-width", "8");
  var coat = document.createElementNS(SVG, "path");
  coat.setAttribute("class", "gabe-coat");
  coat.setAttribute("fill", "none");
  coat.setAttribute("stroke", RED);
  coat.setAttribute("stroke-width", "6");
  horn.appendChild(body);
  horn.appendChild(rim);
  horn.appendChild(coat);
  picture.innerHTML = '<text x="96" y="32" fill="' + INK + '" font-family="Nunito, Segoe UI, sans-serif" font-size="18" font-weight="800">y = 1/x</text>'
    + '<line x1="40" y1="' + AXIS + '" x2="650" y2="' + AXIS + '" stroke="' + INK + '" stroke-width="3"/>'
    + '<rect x="10" y="118" width="20" height="64" rx="4" fill="' + RED + '" stroke="' + INK + '" stroke-width="3"/>';
  picture.appendChild(horn);
  scene.appendChild(picture);

  var totals = S.el("div", "gabe-totals");
  function total(label) {
    var p = S.el("p");
    var name = S.el("span");
    var value = S.el("b");
    name.textContent = label;
    p.appendChild(name);
    p.appendChild(value);
    totals.appendChild(p);
    return value;
  }
  var volNode = total("Volume");
  var skinNode = total("Surface");

  var caption = S.el("p", "caption");
  caption.id = "caption";
  var field = S.el("label", "field");
  var input = document.createElement("input");
  var read = S.el("b");
  input.type = "range";
  input.min = "2";
  input.max = "30";
  input.step = "1";
  input.value = "8";
  input.setAttribute("data-pace", "0");
  field.appendChild(document.createTextNode("How far the horn extends"));
  field.appendChild(input);
  field.appendChild(read);

  var rotateBtn = S.button("Rotate the curve", "btn");
  var fillBtn = S.button("Fill with paint", "btn");
  var coatBtn = S.button("Paint the surface", "btn");
  rotateBtn.setAttribute("data-pace", "900");
  fillBtn.setAttribute("data-pace", "900");
  coatBtn.setAttribute("data-pace", "900");
  var controls = S.el("div", "controls");
  controls.appendChild(rotateBtn);
  controls.appendChild(fillBtn);
  controls.appendChild(coatBtn);
  var sliderRow = S.el("div", "controls");
  sliderRow.appendChild(field);

  board.appendChild(scene);
  board.appendChild(totals);
  board.appendChild(caption);
  board.appendChild(sliderRow);
  board.appendChild(controls);

  var end = 8;
  var open = false;
  var filled = false;
  var coated = false;
  var round = 0;
  var pending = "";

  function applyShape(doSnap) {
    var scale = open ? 1 : 0.08;
    body.setAttribute("d", hornPath(end));
    coat.setAttribute("d", coatPath(end));
    body.classList.toggle("is-filled", filled);
    coat.classList.toggle("is-on", coated && open);
    rotateBtn.classList.toggle("is-on", open);
    fillBtn.classList.toggle("is-on", filled);
    coatBtn.classList.toggle("is-on", coated);
    volNode.textContent = num(volume(end));
    skinNode.textContent = num(surface(end));
    read.textContent = String(end);
    if (doSnap) horn.style.setProperty("transition", "none", "important");
    horn.style.transformOrigin = "0px 0px";
    horn.style.transform = "matrix(1, 0, 0, " + scale + ", 0, " + (AXIS * (1 - scale)) + ")";
    if (doSnap) {
      void board.offsetWidth;
      horn.style.removeProperty("transition");
    }
  }

  function sentence() {
    var vol = num(volume(end));
    var skin = num(surface(end));
    if (pending === "fill") {
      return "The paint fills the horn. The volume is " + vol + ". A longer horn stays near 3.14.";
    }
    if (pending === "coat") {
      return "The coat follows the outside. The surface is " + skin + ". Extend the horn and that number keeps rising, while the volume does not.";
    }
    if (pending === "rotate") {
      return "The curve rotates into the horn. Out to " + end + ", the volume is " + vol + ", on the way to 3.14. The surface is " + skin + ".";
    }
    if (!open) {
      return "The curve runs out to " + end + ". Rotated, the volume would be " + vol + " and the surface " + skin + ".";
    }
    return "The horn extends to " + end + ". Volume " + vol + ". Surface " + skin + ".";
  }

  function show(doSnap) {
    round += 1;
    var mine = round;
    var text = sentence();
    applyShape(doSnap);
    if (doSnap) caption.textContent = text;
    else {
      window.setTimeout(function () {
        if (mine !== round) return;
        caption.textContent = text;
      }, 900);
    }
  }

  rotateBtn.addEventListener("click", function () {
    open = true;
    pending = "rotate";
    show(false);
  });
  fillBtn.addEventListener("click", function () {
    open = true;
    filled = true;
    pending = "fill";
    show(false);
  });
  coatBtn.addEventListener("click", function () {
    open = true;
    coated = true;
    pending = "coat";
    show(false);
  });
  input.addEventListener("input", function () {
    end = parseInt(input.value, 10);
    pending = "";
    applyShape(true);
    caption.textContent = sentence();
  });
  document.getElementById("again").addEventListener("click", function () {
    end = 8;
    input.value = "8";
    open = false;
    filled = false;
    coated = false;
    pending = "";
    show(true);
  });
  show(true);
})();
