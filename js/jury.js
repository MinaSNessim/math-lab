(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var places = S.split("The jury", "Answering");
  var tones = ["#5ec5a7", "#f5c518", "#fe8e83"];
  function figure(color) {
    var img = document.createElement("img");
    img.src = "images/person.png";
    img.alt = "";
    img.className = "tone";
    img.style.borderBottom = "8px solid " + color;
    return img;
  }
  var jurors = [0, 1, 2].map(function (index) {
    var one = S.person("Juror " + (index + 1));
    var img = one.querySelector("img");
    img.parentNode.replaceChild(figure(tones[index]), img);
    places.here.appendChild(one);
    return one;
  });
  var good = [[1, 1, 0], [0, 1, 1], [1, 0, 1]];
  var weak = [[0, 0, 1], [1, 0, 0], [0, 1, 0]];
  var row = S.el("div", "controls");
  var one = S.button("Juror 1's three cases");
  var majority = S.button("The majority on three cases");
  var worse = S.button("Each is wrong more often");
  [one, majority, worse].forEach(function (button) { button.setAttribute("data-pace", "700"); });
  row.appendChild(one);
  row.appendChild(majority);
  row.appendChild(worse);
  var caption = S.el("p", "caption");
  var bars = S.chart([
    { label: "This run, better than a coin", value: 0, text: "Not asked yet", scale: 3 },
    { label: "This run, worse than a coin", value: 0, text: "Not asked yet", scale: 3 }
  ]);
  board.appendChild(places.wrap);
  board.appendChild(bars.box);
  board.appendChild(row);
  board.appendChild(caption);
  caption.textContent = "Nothing is answered yet. Juror 1's button shows that person's right or wrong on case 1, case 2, and case 3.";

  function show(table) {
    jurors.forEach(function (juror, index) {
      var span = juror.querySelector("span");
      var score = 0;
      while (span.firstChild) span.removeChild(span.firstChild);
      table[index].forEach(function (bit, caseIndex) {
        var title = document.createElement("span");
        title.className = "line";
        title.textContent = "Case " + (caseIndex + 1);
        span.appendChild(title);
        var line = document.createElement("span");
        line.className = "line";
        line.textContent = bit ? "Right" : "Wrong";
        span.appendChild(line);
        score += bit;
      });
      var total = document.createElement("span");
      total.className = "line";
      total.textContent = score + " of 3";
      span.appendChild(total);
    });
  }

  function speak(mode) {
    jurors.forEach(function (juror, index) {
      var up = mode === "all" || (mode === "one" && index === 0);
      S.send(juror, up ? places.away : places.here);
    });
    places.awayZone.classList.toggle("is-here", mode === "one" || mode === "all");
  }

  one.addEventListener("click", function () {
    one.classList.add("is-on");
    majority.classList.remove("is-on");
    worse.classList.remove("is-on");
    show(good);
    speak("one");
    bars.set([
      { label: "This run, better than a coin", value: 2, text: "Juror 1: 2 of 3", scale: 3 },
      { label: "This run, worse than a coin", value: 0, text: "Not this run", scale: 3 }
    ]);
    S.say(caption, "Juror 1 on the three cases: case 1 right, case 2 right, case 3 wrong. That is 2 of 3. The other two have not answered.", true);
  });
  majority.addEventListener("click", function () {
    majority.classList.add("is-on");
    one.classList.remove("is-on");
    worse.classList.remove("is-on");
    show(good);
    speak("all");
    bars.set([
      { label: "This run, better than a coin", value: 3, text: "Majority right on 3", scale: 3 },
      { label: "This run, worse than a coin", value: 0, text: "Not this run", scale: 3 }
    ]);
    S.say(caption, "Case 1: jurors 1 and 3 are right, so the majority is right. Case 2: jurors 1 and 2 are right. Case 3: jurors 2 and 3 are right. Each juror is right on 2 of 3. The majority is right on all 3.", true);
  });
  worse.addEventListener("click", function () {
    worse.classList.add("is-on");
    one.classList.remove("is-on");
    majority.classList.remove("is-on");
    show(weak);
    speak("none");
    bars.set([
      { label: "This run, better than a coin", value: 0, text: "Not this run", scale: 3 },
      { label: "This run, worse than a coin", value: 3, text: "Majority wrong on 3", scale: 3, hot: true }
    ]);
    S.say(caption, "On this run each juror is right on only 1 of the 3 cases. On every case, 2 of the 3 are wrong, so the majority is wrong on all 3.", true);
  });
  document.getElementById("again").addEventListener("click", function () {
    one.classList.remove("is-on");
    majority.classList.remove("is-on");
    worse.classList.remove("is-on");
    jurors.forEach(function (juror, index) {
      juror.querySelector("span").textContent = "Juror " + (index + 1);
      S.send(juror, places.here);
    });
    places.hereZone.classList.remove("is-here");
    places.awayZone.classList.remove("is-here");
    bars.set([
      { label: "This run, better than a coin", value: 0, text: "Not asked yet", scale: 3 },
      { label: "This run, worse than a coin", value: 0, text: "Not asked yet", scale: 3 }
    ]);
    S.say(caption, "Nothing is answered yet. Juror 1's button shows that person's right or wrong on case 1, case 2, and case 3.", false);
  });
})();
