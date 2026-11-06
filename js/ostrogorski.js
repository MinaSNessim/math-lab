(function () {
  var S = window.Shelf;
  var board = document.getElementById("board");
  var topics = ["Build a school", "Raise taxes", "Fix the roads"];
  var spoken = ["the new school", "raising taxes", "fixing the roads"];
  var marks = S.el("div", "folk");
  ["#5ec5a7", "#f5c518", "#fe8e83"].forEach(function (color, index) {
    var chip = S.el("div", "one");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 80");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="14" y="8" width="36" height="64" rx="5" fill="#ffffff" stroke="#0c1438" stroke-width="2.4"/>'
      + '<path d="M14 13a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v9H14z" fill="' + color + '"/>'
      + '<text x="32" y="16" text-anchor="middle" font-size="11" font-family="Nunito, sans-serif" font-weight="800" fill="#0c1438">' + (index + 1) + "</text>"
      + '<path d="M22 36h20M22 46h20M22 56h12" fill="none" stroke="#0c1438" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
    var name = S.el("b");
    name.textContent = topics[index];
    chip.appendChild(svg);
    chip.appendChild(name);
    marks.appendChild(chip);
  });
  var wrap = S.el("div", "zones is-three");
  var issuesZone = S.zone("Who they agree with");
  var yesZone = S.zone("Votes for Party Y");
  var noZone = S.zone("Votes for Party X");
  wrap.appendChild(issuesZone.box);
  wrap.appendChild(yesZone.box);
  wrap.appendChild(noZone.box);
  var votes = [
    ["Yes", "Yes", "No"],
    ["Yes", "No", "Yes"],
    ["No", "Yes", "Yes"],
    ["No", "No", "No"],
    ["No", "No", "No"]
  ];
  var peopleTones = ["#f5c518", "#f5c518", "#f5c518", "#5ec5a7", "#5ec5a7"];
  function figure(color) {
    var img = document.createElement("img");
    img.src = "images/person.png";
    img.alt = "";
    img.className = "tone";
    img.style.borderBottom = "8px solid " + color;
    return img;
  }
  var people = votes.map(function (_, index) {
    var one = S.person("Voter " + (index + 1));
    var img = one.querySelector("img");
    img.parentNode.replaceChild(figure(peopleTones[index]), img);
    issuesZone.body.appendChild(one);
    return one;
  });
  var row = S.el("div", "controls");
  var issues = S.button("Who agrees on each thing");
  var party = S.button("Who they vote for");
  var flip = S.button("Voter 1 switches on the roads");
  [issues, party, flip].forEach(function (button) { button.setAttribute("data-pace", "700"); });
  row.appendChild(issues);
  row.appendChild(party);
  row.appendChild(flip);
  var caption = S.el("p", "caption");
  var flipped = false;
  var mode = "";
  var bars = S.chart([
    { label: "More people agree with Party X", value: 0, text: "not yet", scale: 3 },
    { label: "People voting for Party Y", value: 0, text: "not yet", scale: 5 }
  ]);
  board.appendChild(marks);
  board.appendChild(wrap);
  board.appendChild(bars.box);
  board.appendChild(row);
  board.appendChild(caption);
  caption.textContent = "Yellow people vote for Party Y. Green people vote for Party X. Press who agrees, then who they vote for.";

  function yesOn(issue) {
    var n = 0;
    votes.forEach(function (ballot) { if (ballot[issue] === "Yes") n += 1; });
    return n;
  }
  function supportsY(ballot) {
    return ballot.filter(function (vote) { return vote === "Yes"; }).length >= 2;
  }
  function noIssues() {
    var n = 0;
    var i;
    for (i = 0; i < 3; i += 1) if (yesOn(i) <= 2) n += 1;
    return n;
  }
  function yesParty() {
    var n = 0;
    votes.forEach(function (ballot) { if (supportsY(ballot)) n += 1; });
    return n;
  }
  function yNumbers() {
    var nums = [];
    votes.forEach(function (ballot, index) {
      if (supportsY(ballot)) nums.push(String(index + 1));
    });
    if (nums.length < 2) return nums.join("");
    return nums.slice(0, -1).join(", ") + ", and " + nums[nums.length - 1];
  }
  function paintBars() {
    var issueWins = mode ? noIssues() : 0;
    var election = mode === "party" ? yesParty() : 0;
    bars.set([
      { label: "More people agree with Party X", value: issueWins, text: mode ? issueWins + " of 3" : "not yet", scale: 3 },
      { label: "People voting for Party Y", value: election, text: mode === "party" ? election + " of 5" : "not yet", scale: 5 }
    ]);
  }
  function issueLine() {
    var parts = [];
    var i;
    for (i = 0; i < 3; i += 1) {
      var yes = yesOn(i);
      var no = 5 - yes;
      var winner = yes > no ? "Party Y" : "Party X";
      var other = winner === "Party X" ? "Party Y" : "Party X";
      parts.push("On " + spoken[i] + ", " + Math.max(yes, no) + " people agree with " + winner + " and " + Math.min(yes, no) + " agree with " + other);
    }
    return parts.join(". ") + ".";
  }
  function fillLines(one, labels) {
    var span = one.querySelector("span");
    while (span.firstChild) span.removeChild(span.firstChild);
    labels.forEach(function (label) {
      var line = document.createElement("span");
      line.className = "q";
      line.textContent = label;
      span.appendChild(line);
    });
  }
  function showIssues() {
    people.forEach(function (one, index) {
      var labels = [];
      votes[index].forEach(function (vote, question) {
        labels.push(["School", "Taxes", "Roads"][question] + " " + (vote === "Yes" ? "Y" : "X"));
      });
      fillLines(one, labels);
      S.send(one, issuesZone.body);
    });
    issuesZone.box.classList.add("is-here");
    yesZone.box.classList.remove("is-here");
    noZone.box.classList.remove("is-here");
  }
  function showParties() {
    people.forEach(function (one, index) {
      var yes = supportsY(votes[index]);
      one.querySelector("span").textContent = yes ? "Party Y" : "Party X";
      S.send(one, yes ? yesZone.body : noZone.body);
    });
    issuesZone.box.classList.remove("is-here");
    yesZone.box.classList.add("is-here");
    noZone.box.classList.add("is-here");
  }

  issues.addEventListener("click", function () {
    mode = "issues";
    issues.classList.add("is-on");
    party.classList.remove("is-on");
    showIssues();
    paintBars();
    S.say(caption, issueLine(), true);
  });
  party.addEventListener("click", function () {
    mode = "party";
    party.classList.add("is-on");
    issues.classList.remove("is-on");
    showParties();
    paintBars();
    var extra = flipped
      ? " More people agree with Party Y on the roads. More people still agree with Party X on the school and on taxes."
      : " More people still agree with Party X on the school, on the taxes, and on the roads.";
    S.say(caption, "Voters " + yNumbers() + " vote for Party Y, because they agreed with Party Y more often. Party Y wins the election " + yesParty() + " to " + (5 - yesParty()) + "." + extra, true);
  });
  flip.addEventListener("click", function () {
    if (flipped) return;
    flipped = true;
    flip.classList.add("is-on");
    votes[0][2] = "Yes";
    if (mode === "issues") showIssues();
    if (mode === "party") showParties();
    paintBars();
    var line = "Voter 1 now agrees with Party Y about the roads too. On the roads, 3 people agree with Party Y and 2 agree with Party X. On the school and on taxes, 3 people still agree with Party X.";
    if (mode === "party") line += " Party Y still wins the election " + yesParty() + " to " + (5 - yesParty()) + ".";
    S.say(caption, line, true);
  });
  document.getElementById("again").addEventListener("click", function () {
    votes[0][2] = "No";
    flipped = false;
    mode = "";
    flip.classList.remove("is-on");
    issues.classList.remove("is-on");
    party.classList.remove("is-on");
    people.forEach(function (one, index) {
      one.querySelector("span").textContent = "Voter " + (index + 1);
      S.send(one, issuesZone.body);
    });
    issuesZone.box.classList.remove("is-here");
    yesZone.box.classList.remove("is-here");
    noZone.box.classList.remove("is-here");
    paintBars();
    S.say(caption, "Yellow people vote for Party Y. Green people vote for Party X. Press who agrees, then who they vote for.", false);
  });
})();
