(function () {
  var send = document.getElementById("send");
  var again = document.getElementById("again");
  var caption = document.getElementById("caption");
  var messenger = document.getElementById("messenger");
  var bodyA = document.getElementById("body-a");
  var bodyB = document.getElementById("body-b");
  var trip = 0;
  var timer = 0;
  var gen = 0;
  var maxTrip = 5;

  function labelFor(n) {
    if (n <= 0) return "Send messenger";
    if (n === 1) return "Send confirmation back";
    if (n === 2) return "Confirm the confirmation";
    return "Send the next confirmation";
  }

  function lineFor(n) {
    if (n <= 0) return "";
    if (n === 1) return "Message received.";
    if (n === 2) return "A has the confirmation.";
    if (n % 2 === 1) return "A never knows if B received the last message.";
    return "B never knows if A received the last message.";
  }

  function rest() {
    trip = 0;
    messenger.style.transform = "translate(0px, 0px)";
    bodyA.classList.remove("is-lit");
    bodyB.classList.remove("is-lit");
    send.textContent = labelFor(0);
    send.disabled = false;
    caption.textContent = lineFor(0);
  }

  send.addEventListener("click", function () {
    if (trip >= maxTrip || send.disabled) return;
    var mine = ++gen;
    var goingToB = trip % 2 === 0;
    send.disabled = true;
    messenger.style.transform = goingToB ? "translate(248px, 0px)" : "translate(0px, 0px)";
    timer = window.setTimeout(function () {
      if (mine !== gen) return;
      trip += 1;
      bodyA.classList.toggle("is-lit", !goingToB);
      bodyB.classList.toggle("is-lit", goingToB);
      caption.textContent = lineFor(trip);
      if (trip >= maxTrip) send.disabled = true;
      else {
        send.disabled = false;
        send.textContent = labelFor(trip);
      }
    }, 900);
  });

  again.addEventListener("click", function () {
    gen += 1;
    window.clearTimeout(timer);
    rest();
  });

  rest();
})();
