(function () {
  var knightBtn = document.getElementById("as-knight");
  var knaveBtn = document.getElementById("as-knave");
  var again = document.getElementById("again");
  var caption = document.getElementById("caption");
  var mark = document.getElementById("mark");
  var labelL = document.getElementById("label-l");
  var labelR = document.getElementById("label-r");
  var pick = "";

  function paint() {
    var solved = pick === "knave";
    labelL.textContent = solved ? "Knave" : "Left";
    labelR.textContent = solved ? "Knight" : "Right";
    if (pick) mark.classList.add("is-on");
    else mark.classList.remove("is-on");
    knightBtn.classList.toggle("is-on", pick === "knight");
    knaveBtn.classList.toggle("is-on", pick === "knave");
    if (pick === "knight") {
      caption.textContent = "If the speaker were a knight, both would be knaves. That cannot be.";
    } else if (pick === "knave") {
      caption.textContent = "The speaker is a knave. The statement is a lie, so the other person is a knight.";
    } else {
      caption.textContent = "";
    }
  }

  knightBtn.addEventListener("click", function () {
    pick = "knight";
    paint();
  });
  knaveBtn.addEventListener("click", function () {
    pick = "knave";
    paint();
  });
  again.addEventListener("click", function () {
    pick = "";
    paint();
  });
  paint();
})();
